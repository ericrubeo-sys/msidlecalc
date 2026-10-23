// Independent invented item lines, not game measurements or private OCR text.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseItemLines, compareItemLines } from '../public/domain/item-lines.js';
import { proposeLineFields } from '../public/domain/screenshot-review.js';
import { assignComparisonLayout } from '../public/domain/comparison-layout.js';
import { proposePanelRows } from '../public/domain/ocr-item-rows.js';

const lines = entries => parseItemLines(entries.map(([rawLabel, rawValue, unit = 'statPoint', confirmed = true, sourceFamily = 'unknown'], index) => ({ id: `line-${index}`, rawLabel, rawValue, unit, confirmed, sourceFamily })));
const compare = (current, candidate, flags) => compareItemLines(lines(current), lines(candidate), flags);

test('QA candidate base and displayed change remain separate, and a display delta is never added to the base', () => {
  for (const [text, base, delta] of [['Attack 2,345 -123', '2,345', '-123'], ['Critical Rate 4.2% 4.2%', '4.2%', '4.2%'], ['Evasion 69 8', '69', '8']]) {
    const fields = proposeLineFields(text);
    assert.equal(fields.rawValue, base); assert.equal(fields.comparisonText, delta);
  }
  const result = compare([['Attack', '50']], [['Attack', '37']]);
  assert.equal(result.rows[0].differenceDecimal, '-13');
  assert.equal(result.damage.winner, null); assert.equal(result.damage.percentChange, null);
});

test('QA unmatched occurrences stay unknown by default; completeness applies to the opposite list only', () => {
  const current = [['Attack', '50']], candidate = [['Critical Rate', '4.2%', 'displayPercent']];
  for (const flags of [undefined, { currentComplete: false, candidateComplete: false }]) {
    assert.deepEqual(compare(current, candidate, flags).rows.map(row => row.differenceDecimal), [null, null]);
  }
  assert.deepEqual(compare(current, candidate, { currentComplete: true }).rows.map(row => row.differenceDecimal), [null, '4.2']);
  assert.deepEqual(compare(current, candidate, { candidateComplete: true }).rows.map(row => row.differenceDecimal), ['-50', null]);
  assert.deepEqual(compare(current, candidate, { currentComplete: true, candidateComplete: true }).rows.map(row => row.differenceDecimal), ['-50', '4.2']);
});

test('QA repeated occurrences remain separate and only reviewed excess occurrences can be lost', () => {
  const current = [['Attack', '50'], ['Attack', '7']], candidate = [['Attack', '37']];
  assert.deepEqual(compare(current, candidate).rows.map(row => row.differenceDecimal), ['-13', null]);
  const result = compare(current, candidate, { candidateComplete: true });
  assert.equal(result.rows.length, 2);
  assert.deepEqual(result.rows.map(row => row.differenceDecimal), ['-13', '-7']);
  assert.equal(result.rows[0].current.ordinal, 0); assert.equal(result.rows[1].current.ordinal, 1);
});

test('QA confirmed absence cannot provide a missing, malformed, or unconfirmed present value', () => {
  for (const value of ['', '?', 'O', '1,234']) {
    assert.equal(compare([['Attack', value]], [], { candidateComplete: true }).rows[0].differenceDecimal, null);
  }
  assert.equal(compare([['Attack', '7', 'statPoint', false]], [], { candidateComplete: true }).rows[0].differenceDecimal, null);
  assert.equal(compare([], [['Attack', '7', 'statPoint', false]], { currentComplete: true }).rows[0].differenceDecimal, null);
  const presentUnknown = compare([['Attack', '7']], [['Attack', '', 'statPoint']], { currentComplete: true, candidateComplete: true });
  assert.equal(presentUnknown.rows.length, 1); assert.equal(presentUnknown.rows[0].differenceDecimal, null);
  assert.equal(compare([['', '7']], [], { candidateComplete: true }).rows[0].differenceDecimal, null);
});

test('QA any unreadable or unconfirmed opposite occurrence blocks absence arithmetic despite a completeness flag', () => {
  for (const other of [['Critical Rate', '', 'displayPercent'], ['Critical Rate', '4%', 'displayPercent', false], ['', '7']]) {
    const result = compare([['Attack', '7']], [other], { currentComplete: true, candidateComplete: true });
    assert.equal(result.rows[0].differenceDecimal, null);
  }
});

test('QA same-label unit or source mismatch does not become a certain gain and loss', () => {
  for (const candidate of [[['Attack', '4%', 'displayPercent']], [['Attack', '4', 'statPoint', true, 'equipmentBase']]]) {
    const result = compare([['Attack', '7']], candidate, { currentComplete: true, candidateComplete: true });
    assert.equal(result.rows.length, 2);
    assert.ok(result.rows.every(row => row.differenceDecimal === null));
  }
});

test('QA unknown labels stay raw, exact decimal absence arithmetic is reversible, and no equipment verdict appears', () => {
  const current = [['Unmapped proc', '0.000000000000000003', 'factor']];
  const forward = compare(current, [], { currentComplete: true, candidateComplete: true });
  const reverse = compare([], current, { currentComplete: true, candidateComplete: true });
  assert.equal(forward.rows[0].differenceDecimal, '-0.000000000000000003');
  assert.equal(reverse.rows[0].differenceDecimal, '0.000000000000000003');
  assert.equal(forward.rows[0].current.statId, null);
  assert.equal(forward.damage.status, 'unavailable'); assert.equal(forward.damage.winner, null);
  assert.equal(forward.damage.percentChange, null);
});

const panel = (id, x, y = 12, width = 90, height = 130) => ({ id, region: { x, y, width, height }, lines: [{ rawText: 'Invented evidence', confirmed: false }] });
test('QA supported layout assigns equipped left and candidate right independent of proposal order without confirming any line', () => {
  const input = [panel('right', 140), panel('left', 20)]; const before = structuredClone(input);
  const result = assignComparisonLayout(input);
  assert.equal(result.status, 'assigned');
  assert.deepEqual(result.assignment, { current: 'left', candidate: 'right' });
  assert.deepEqual(result.panels.map(entry => entry.id), ['left', 'right']);
  assert.ok(result.panels.every(entry => entry.lines[0].confirmed === false));
  result.panels[0].region.x = 777; assert.deepEqual(input, before);
});

test('QA layout rejects missing, duplicate, overlapping, vertically stacked, and invalid geometry instead of inventing roles', () => {
  for (const input of [[], [panel('a', 10)], [panel('a', 10), panel('a', 140)], [panel('a', 10), panel('b', 12)], [panel('a', 10), panel('b', 10, 160)], [panel('a', -1), panel('b', 140)], [panel('a', 10), panel('b', Infinity)], [panel('a', 10), panel('b', 140, 12, 0)], [panel('a', 10), panel('b', 140), panel('c', 250)]]) {
    const result = assignComparisonLayout(input);
    assert.equal(result.status, 'needsAreas'); assert.equal(result.assignment, null);
  }
});

test('QA completeness flags are explicit booleans rather than truthy text', () => {
  for (const flags of [{ currentComplete: 'yes' }, { candidateComplete: 1 }, { currentComplete: null }]) assert.throws(() => compare([], [], flags));
});

const word = (text, x, y, width = 30, height = 10) => ({ text, bbox: { x0: x, y0: y, x1: x + width, y1: y + height } });
const spatial = rows => ({ id: 'invented-panel', rawText: rows.map(row => row.map(entry => entry.text).join(' ')).join('\n'), lines: rows.map(row => ({ rawText: row.map(entry => entry.text).join(' ') })), structuredLines: rows.map(row => ({ text: row.map(entry => entry.text).join(' '), words: row })) });
test('QA spatial assembly associates split OCR lines by geometry, preserves base/delta and never confirms them', () => {
  const source = spatial([[word('Attack', 2, 20)], [word('234', 90, 20), word('-17', 130, 20)], [word('Attack', 2, 45), word('9', 90, 45), word('9', 130, 45)]]);
  const before = structuredClone(source), result = proposePanelRows(source);
  assert.equal(result.method, 'spatialRows'); assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0].proposedFields.rawLabel, 'Attack'); assert.equal(result.rows[0].proposedFields.rawValue, '234'); assert.equal(result.rows[0].proposedFields.comparisonText, '-17');
  assert.equal(result.rows[1].proposedFields.rawValue, '9'); assert.equal(result.rows[1].proposedFields.comparisonText, '9');
  assert.deepEqual(source, before);
  assert.deepEqual(result.rows[0].provenance.originalRawLines, source.lines);
});

test('QA ambiguous numeric text and overlapping row geometry remain unknown rather than shifted into a base field', () => {
  for (const text of ['Attack 12 3 4', '234 -17', 'Attack 234-17', 'Attack O', 'Attack 2.3%+1%']) {
    const fields = proposeLineFields(text); assert.equal(fields.rawValue, '', text); assert.equal(fields.comparisonText, null, text);
  }
  const overlap = proposePanelRows(spatial([[word('Attack', 2, 20, 100), word('234', 90, 20)]]));
  assert.equal(overlap.rows[0].proposedFields.rawValue, '');
  assert.ok(overlap.rows[0].proposedFields.issues.includes('ambiguousRowGeometry'));
});

test('QA incomplete geometry never drops transcript text and falls back to original line observations', () => {
  const source = spatial([[word('Attack', 2, 20), word('234', 90, 20)]]);
  source.rawText += '\nUnknown observation ?'; source.lines.push({ rawText: 'Unknown observation ?' });
  const output = proposePanelRows(source);
  assert.equal(output.method, 'rawLines'); assert.ok(output.issues.includes('rawWordCoverageMismatch'));
  assert.deepEqual(output.rows.map(row => row.rawText), source.lines.map(row => row.rawText));
  assert.equal(output.rows[1].proposedFields.rawValue, '');
});
