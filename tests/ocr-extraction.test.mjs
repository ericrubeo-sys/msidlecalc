import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSpatialObservation, assembleColumnObservations } from '../public/domain/ocr-extraction.js';
// Invented geometry/text only; these are not player fixtures or OCR benchmarks.
const word = (text, x0, x1, y0 = 0, y1 = 8) => ({ text, confidence: 99, bbox: { x0, y0, x1, y1 } });
const blocks = rows => [{ paragraphs: [{ lines: rows.map(words => ({ text: words.map(entry => entry.text).join(' '), words })) }] }];
const extract = (rows, options = {}) => extractSpatialObservation({ rawText: 'raw\n\n', blocks: blocks(rows), crop: { x: 10, y: 20, width: 100, height: 100 }, columns: { label: [0, .5], value: [.5, .8], delta: [.8, 1] }, ...options });
test('neighboring signed delta never joins a value; raw blank and duplicate occurrences remain', () => {
  const words = [word('Mystery', 0, 40), word('24%', 55, 75), word('+7%', 83, 99)];
  const result = extract([words, words]);
  assert.deepEqual(result.rawLines, ['raw', '', '']);
  assert.equal(result.rows[0].value, '24%');
  assert.equal(result.rows[0].delta, '+7%');
  assert.equal(result.rows[0].unit, '%');
  assert.notEqual(result.rows[0].id, result.rows[1].id);
  assert.ok(result.rows.every(row => row.confirmedValue === null && row.statId === null));
});
test('merged boundary word stays unknown rather than split into invented digits', () => {
  const result = extract([[word('Mystery', 0, 40), word('247', 60, 99)]]);
  assert.equal(result.rows[0].value, null);
  assert.equal(result.unassignedWords[0].rawText, '247');
  assert.ok(result.rows[0].issues.includes('unassignedOrBoundaryWord'));
});
test('punctuation, lookalikes and missing values require review without substitution', () => {
  const result = extract([[word('5.432', 55, 75)], [word('O', 55, 75)], []]);
  assert.ok(result.rows[0].issues.includes('punctuationNeedsReview'));
  assert.equal(result.rows[1].value, 'O');
  assert.ok(result.rows[1].issues.includes('unparsedValue'));
  assert.equal(result.rows[2].value, null);
});
test('source boxes reverse upscaling/cropping; input detached; no blocks means raw survives', () => {
  const source = [[word('Unknown', 0, 40)]];
  const result = extract(source, { scale: 2 });
  assert.deepEqual(result.rows[0].words[0].sourceBox, { x0: 10, y0: 20, x1: 30, y1: 24 });
  source[0][0].bbox.x0 = 99;
  assert.equal(result.rows[0].words[0].bbox.x0, 0);
  assert.deepEqual(extractSpatialObservation({ rawText: '\n', blocks: null, crop: { x: 0, y: 0, width: 1, height: 1 } }).rawLines, ['', '']);
});
test('malformed coordinates, overlapping columns and out of crop words fail explicitly', () => {
  assert.throws(() => extract([[word('bad', 0, 101)]]));
  assert.throws(() => extract([], { columns: { label: [0, .6], value: [.5, 1] } }));
  assert.throws(() => extract([], { scale: Infinity }));
  assert.throws(() => extract([[word('bad', NaN, 1)]]));
  assert.throws(() => extract([], { crop: { x: Number.MAX_VALUE, y: 0, width: Number.MAX_VALUE, height: 100 } }));
});
test('column label proposals trim terminal whitespace while original observations remain exact', () => {
  const original = extract([[word('Mystery', 0, 30)]], { columns: { label: [0, 1] } });
  original.rows[0].rawText = ' Mystery\n';
  const result = assembleColumnObservations([{ lane: 'label', extraction: original }]);
  assert.equal(result.rows[0].label, 'Mystery');
  assert.equal(result.observations[0].extraction.rows[0].rawText, ' Mystery\n');
});
test('independent columns associate unique overlap and retain unmatched unequal lines', () => {
  const lane = (name, rows) => ({ lane: name, extraction: extract(rows, { columns: { [name]: [0, 1] } }) });
  const result = assembleColumnObservations([
    lane('label', [[word('Unknown', 0, 30, 0, 8)], [word('Unknown', 0, 30, 20, 28)]]),
    lane('value', [[word('24', 0, 20, 0, 8)], [word('6', 0, 20, 40, 48)]]),
    lane('delta', [[word('+7', 0, 20, 0, 8)]]),
  ]);
  assert.equal(result.rows[0].value, '24');
  assert.equal(result.rows[0].delta, '+7');
  assert.equal(result.rows[1].value, null);
  assert.equal(result.unassignedObservations.length, 1);
  assert.equal(result.observations.length, 3);
});
test('ambiguous vertical associations are retained and not assigned by label', () => {
  const lane = (name, rows) => ({ lane: name, extraction: extract(rows, { columns: { [name]: [0, 1] } }) });
  const result = assembleColumnObservations([lane('label', [[word('A', 0, 20, 0, 8)], [word('A', 0, 20, 2, 10)]]), lane('value', [[word('24', 0, 20, 1, 9)]])]);
  assert.ok(result.rows.every(row => row.value === null && row.issues.includes('valueAssociationAmbiguous')));
  assert.equal(result.unassignedObservations.length, 1);
});
