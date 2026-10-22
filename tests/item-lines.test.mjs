// Invented parser/line fixtures. These do not validate MapleStory mechanics.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDecimal, createItemLine, parseItemLines, compareItemLines } from '../public/domain/item-lines.js';

const lines = (entries, idPrefix = 'test') => parseItemLines(entries.map(([rawLabel, rawValue, extras = {}]) => ({ rawLabel, rawValue, ...extras })), { idPrefix });

test('strict decimal grammar rejects coercion, partial parses, overflow, and ambiguous notation', () => {
  for (const raw of ['1e3', '0x10', '1,000', '12K', '2oops', 'Infinity', 'NaN', 'O', '１', '1.', '++1', true, {}, [], Infinity, '9007199254740992', '0.0000000000000000001']) {
    assert.equal(parseDecimal(raw).state, 'invalid', String(raw));
  }
  assert.equal(parseDecimal('9007199254740991').decimal, '9007199254740991');
  assert.equal(parseDecimal('9007199254740991.1').state, 'invalid');
  assert.equal(parseDecimal(' +001.2500 ').decimal, '1.25');
  assert.equal(parseDecimal('-.25').decimal, '-0.25');
  assert.equal(parseDecimal('-0.000').decimal, '0');
});

test('blank differs from zero; unconfirmed parsed values are not effective', () => {
  const result = lines([['Attack', ''], ['Attack', '0'], ['Attack', '42', { confirmed: false }]]);
  assert.equal(result[0].effectiveValue, null);
  assert.deepEqual(result[1].effectiveValue, { decimal: '0', unit: 'statPoint' });
  assert.equal(result[2].effectiveValue, null);
  assert.equal(result[2].observation.candidateValue.decimal, '42');
  assert.equal(result[2].state, 'needsReview');
});

test('percent, flat and skill units remain distinct; negatives are retained raw', () => {
  assert.equal(parseDecimal('12%', { unit: 'statPoint' }).state, 'invalid');
  assert.equal(parseDecimal('12%', { unit: 'displayPercent' }).decimal, '12');
  assert.equal(parseDecimal('1.5', { unit: 'level' }).state, 'invalid');
  assert.equal(parseDecimal('-2', { allowNegative: false }).state, 'invalid');
  const result = lines([['Attack', '-2'], ['Attack', '3%'], ['1st Job Skill Lv.', '2']]);
  assert.equal(result[0].value, -2);
  assert.equal(result[1].unit, 'displayPercent');
  assert.equal(result[1].valueKind, 'unknown');
  assert.equal(result[2].unit, 'level');
});

test('duplicates remain separate and unequal sets never imply zero or aggregation', () => {
  const a = lines([['Attack', '10'], ['Attack', '20'], ['Max HP', '30']]);
  const b = lines([['Attack', '15'], ['Max MP', '40'], ['Attack', '22'], ['Attack', '99']], 'other');
  const result = compareItemLines(a, b);
  assert.deepEqual(result.rows.map((row) => row.difference), [5, 2, null, null, null]);
  assert.deepEqual(result.rows.map((row) => row.status), ['rawComparable', 'rawComparable', 'unmatched', 'unmatched', 'unmatched']);
  assert.equal(result.comparableCount, 2);
  assert.equal(a.length, 3);
  assert.equal(b.length, 4);
});

test('incompatible units and source stages cannot match', () => {
  const a = lines([['Attack', '10', { sourceFamily: 'equipmentBase' }], ['Critical Rate', '1%']]);
  const b = lines([['Attack', '20', { sourceFamily: 'potential' }], ['Critical Rate', '2', { unit: 'internalRate' }]]);
  assert.equal(compareItemLines(a, b).comparableCount, 0);
});

test('arbitrary and unreadable lines retain text, order, provenance and unknown identity', () => {
  const provenance = { kind: 'manual', panel: 'current', position: { x: 2, y: 3 } };
  const input = { id: 'odd', ordinal: 7, rawLabel: 'Mystery proc', rawValue: '?', rawText: 'Mystery proc ???', provenance };
  const result = createItemLine(input);
  provenance.position.x = 900;
  assert.equal(result.statId, null);
  assert.equal(result.ordinal, 7);
  assert.equal(result.rawText, input.rawText);
  assert.equal(result.provenance.position.x, 2);
  assert.equal(result.effectiveValue, null);
  const comparison = compareItemLines(lines([['Mystery proc', '1']]), lines([['Mystery proc', '3']]));
  assert.equal(comparison.rows[0].difference, 2);
  assert.equal(comparison.damage.winner, null);
});

test('corrections override without erasing the original and explicit clearing stays unknown', () => {
  const input = { id: 'line', rawLabel: 'Attock', rawValue: 'O', rawText: 'Attock O', provenance: { kind: 'ocr', runId: 'synthetic' }, confirmed: false };
  const corrected = createItemLine({ ...input, correction: { rawLabel: 'Attack', rawValue: '0', revision: 2 } });
  assert.equal(corrected.statId, 'attack');
  assert.equal(corrected.value, 0);
  assert.equal(corrected.rawLabel, 'Attock');
  assert.equal(corrected.observation.rawValue, 'O');
  assert.equal(corrected.observation.state, 'invalid');
  assert.equal(createItemLine({ ...input, correction: { rawValue: null } }).value, null);
  assert.equal(createItemLine(input).effectiveValue, null);
  const correctedPercent = createItemLine({ id: 'pct', rawLabel: 'Attack', rawValue: '2%', correction: { rawValue: '3' } });
  assert.equal(correctedPercent.unit, 'displayPercent');
});

test('exact decimal subtraction, equal/swapped rows and abstention are independent of raw gains', () => {
  const a = lines([['Attack', '0.1'], ['Critical Rate', '4%'], ['Accuracy', '']]);
  const b = lines([['Attack', '0.3'], ['Critical Rate', '4%'], ['Accuracy', '10']]);
  const forward = compareItemLines(a, b);
  const reverse = compareItemLines(b, a);
  assert.equal(forward.rows[0].differenceDecimal, '0.2');
  assert.equal(reverse.rows[0].differenceDecimal, '-0.2');
  assert.equal(forward.rows[1].difference, 0);
  assert.equal(forward.rows[2].difference, null);
  assert.deepEqual(forward.damage, { status: 'unavailable', confidence: 'Low', winner: null, percentChange: null });
});

test('stable supplied ids survive reordering; duplicate identity is rejected', () => {
  const a = parseItemLines([{ id: 'b', rawLabel: 'Attack', rawValue: '1' }, { id: 'a', rawLabel: 'Accuracy', rawValue: '2' }]);
  assert.deepEqual(a.map(({ id, ordinal }) => [id, ordinal]), [['b', 0], ['a', 1]]);
  assert.throws(() => parseItemLines([{ id: 'same' }, { id: 'same' }]));
});
