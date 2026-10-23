import test from 'node:test';
import assert from 'node:assert/strict';
import { proposePanelRows, proposeRawLineFields } from '../public/domain/ocr-item-rows.js';
import { importScreenshotProposals } from '../public/domain/screenshot-review.js';
import { createItemLine } from '../public/domain/item-lines.js';

// Invented words/boxes only: these verify association rules, not OCR accuracy.
const word = (text, x, y, width = 35, height = 10) => ({ text, bbox: { x0: x, y0: y, x1: x + width, y1: y + height } });
const line = (...words) => ({ text: words.map(word => word.text).join(' '), words });
const panel = (structuredLines, id = 'panel') => {
  const rawText = structuredLines.map(line => line.text).join('\n');
  return { id, rawText, structuredLines, lines: rawText.split('\n').map((rawText, i) => ({ id: `raw-${i}`, rawText, provenance: { synthetic: true } })) };
};
test('spatial words reconstruct split label/value/delta without promoting the delta', () => {
  const source = panel([line(word('Evasion', 0, 20, 60)), line(word('54', 200, 21)), line(word('3', 245, 20))]);
  const before = structuredClone(source), result = proposePanelRows(source);
  assert.equal(result.method, 'spatialRows'); assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].proposedFields.rawLabel, 'Evasion');
  assert.equal(result.rows[0].proposedFields.rawValue, '54'); assert.equal(result.rows[0].proposedFields.comparisonText, '3');
  assert.equal(result.rows[0].provenance.originalStructuredLines.length, 3);
  assert.deepEqual(result.rows[0].provenance.originalRawLines, source.lines);
  assert.deepEqual(source, before);
});
test('base and comparison strings remain literal, with separators and units', () => {
  for (const [text, base, delta] of [['Unlisted effect 1,230 -45', '1,230', '-45'], ['Unknown effect 8.7% +1.2%', '8.7%', '+1.2%'], ['Attack 43 43', '43', '43']]) {
    const proposed = proposeRawLineFields(text);
    assert.equal(proposed.rawValue, base); assert.equal(proposed.comparisonText, delta);
  }
  for (const text of ['54 3', 'Attack 43+7', 'Attack O', 'Attack 1e3', 'Attack 43 7 2', 'Skill 2 Level 43']) assert.equal(proposeRawLineFields(text).rawValue, '');
});
test('numeric-only observations on a different row never attach to nearby label or become a numeric stat', () => {
  const result = proposePanelRows(panel([line(word('Evasion', 0, 20, 60), word('54', 200, 20)), line(word('3', 245, 35))]));
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0].proposedFields.rawValue, '54');
  assert.equal(result.rows[0].proposedFields.comparisonText, null);
  assert.equal(result.rows[1].proposedFields.rawLabel, '3'); assert.equal(result.rows[1].proposedFields.rawValue, '');
});
test('repeated and unknown labels remain independent rows and unequal item lists stay unequal', () => {
  const a = panel([line(word('Attack', 0, 10), word('45', 200, 10)), line(word('Attack', 0, 30), word('9', 200, 30)), line(word('Mystery', 0, 50), word('?', 200, 50))], 'a');
  const b = panel([line(word('Attack', 0, 10), word('43', 200, 10), word('-2', 245, 10))], 'b');
  const imported = importScreenshotProposals({ proposedPanels: [a, b], assignment: { current: 'a', candidate: 'b' }, assignmentConfirmed: true, imageRevision: 1, runId: 1 });
  assert.equal(imported.current.length, 3); assert.equal(imported.candidate.length, 1);
  assert.deepEqual(imported.current.slice(0, 2).map(row => row.rawLabel), ['Attack', 'Attack']);
  assert.equal(imported.current[2].rawValue, ''); assert.equal(imported.candidate[0].rawValue, '43');
  assert.equal(imported.candidate[0].comparisonText, '-2');
  for (const row of [...imported.current, ...imported.candidate]) {
    assert.equal(row.confirmed, false); assert.equal(row.reviewedImageRevision, null);
    assert.equal(createItemLine(row).effectiveValue, null);
  }
});
test('a tall bridging box cannot merge two numeric rows into a proposed value', () => {
  const result = proposePanelRows(panel([line(word('Attack', 0, 10, 35, 20)), line(word('45', 200, 10, 35, 14)), line(word('9', 200, 16, 35, 14))]));
  assert.ok(result.rows.every(row => row.proposedFields.rawValue === ''));
});
test('overlapping horizontal boxes are ambiguous and all words remain evidence', () => {
  const result = proposePanelRows(panel([line(word('Attack', 0, 10, 100), word('45', 90, 10))]));
  assert.equal(result.rows[0].proposedFields.rawValue, '');
  assert.ok(result.rows[0].proposedFields.issues.includes('ambiguousRowGeometry'));
  assert.equal(result.rows[0].provenance.words.length, 2);
});
test('missing geometry and unmatched raw transcript fall back to every original line including blanks', () => {
  const source = panel([line(word('Attack', 0, 10), word('45', 200, 10))]);
  source.rawText += '\nUnreadable effect ?\n';
  source.lines.push({ rawText: 'Unreadable effect ?' }, { rawText: '' });
  const result = proposePanelRows(source);
  assert.equal(result.method, 'rawLines'); assert.ok(result.issues.includes('rawWordCoverageMismatch'));
  assert.deepEqual(result.rows.map(row => row.rawText), source.lines.map(row => row.rawText));
  source.structuredLines[0].words[0].bbox.x0 = NaN;
  assert.equal(proposePanelRows(source).method, 'rawLines');
});
test('Unicode unknown labels survive without a stat dictionary and standalone missing label stays unknown', () => {
  assert.equal(proposeRawLineFields('未知 effect 8%').rawValue, '8%');
  const result = proposePanelRows(panel([line(word('未確認', 0, 10), word('8%', 200, 10)), line(word('+2%', 245, 35))]));
  assert.equal(result.rows[0].proposedFields.rawLabel, '未確認');
  assert.equal(result.rows[1].proposedFields.rawValue, '');
});
test('only the exact normalized On-Equip Effect heading becomes preserved non-stat evidence', () => {
  const source = panel([line(word('On-Equip', 0, 0, 75), word('Effect', 90, 0, 55)), line(word('Attack', 0, 20), word('45', 200, 20)), line(word('On-Eguip', 0, 40, 75), word('Effect', 90, 40, 55))], 'a');
  const result = proposePanelRows(source);
  assert.equal(result.evidenceRows.length, 1); assert.equal(result.evidenceRows[0].rawText, 'On-Equip Effect');
  assert.equal(result.rows.length, 2); assert.equal(result.rows[1].proposedFields.rawLabel, 'On-Eguip Effect');
  assert.deepEqual(result.evidenceRows[0].provenance.originalRawLines, source.lines);
  for (const row of result.rows) assert.deepEqual(row.provenance.originalRawLines, source.lines);
  const fallback = proposePanelRows({ ...source, structuredLines: null });
  assert.equal(fallback.evidenceRows.length, 1); assert.equal(fallback.rows.length, 2);
  const imported = importScreenshotProposals({ proposedPanels: [source, { ...source, id: 'b' }], assignment: { current: 'a', candidate: 'b' }, assignmentConfirmed: true, imageRevision: 1, runId: 1 });
  assert.equal(imported.current[0].provenance.evidenceRows[0].rawText, 'On-Equip Effect');
  assert.equal(imported.current[0].confirmed, false);
});
