import test from 'node:test';
import assert from 'node:assert/strict';
import { assessCropCoverage } from '../public/domain/crop-coverage.js';
import { createComparisonReader } from '../public/ocr-reader.js';
const word = (text, x0, y0, x1, y1) => ({ text, bbox: { x0, y0, x1, y1 } });
const blocks = words => [{ paragraphs: [{ lines: [{ words }] }] }];
const region = { x: 100, y: 20, width: 200, height: 150 };
const rows = [word('Unfamiliar', 80, 40, 150, 50), word('12', 240, 40, 260, 50), word('魔法效果', 80, 80, 150, 90), word('3.5%', 235, 80, 260, 90)];
const assess = (words, extra = {}) => assessCropCoverage({ blocks: blocks(words), width: 500, height: 200, region, ...extra });

test('two observed label/value rows warn when left label pixels are excluded; values/text are never supplied', () => {
  const input = structuredClone(rows), result = assess(input);
  assert.equal(result.length, 1);
  assert.equal(result[0].code, 'possibleClippedLabels');
  assert.equal(result[0].rows.length, 2);
  assert.deepEqual(result[0].rows[0].labelBounds, { x: 80, y: 40, width: 70, height: 10 });
  assert.equal(result[0].coordinateSystem, 'originalImagePixels');
  assert.ok(!JSON.stringify(result).includes('Unfamiliar'));
  assert.deepEqual(input, rows);
});

test('fully included same rows, headings alone and a single stat row do not produce warnings', () => {
  assert.deepEqual(assess(rows, { region: { x: 60, y: 20, width: 250, height: 150 } }), []);
  assert.deepEqual(assess([word('On-Equip', 80, 30, 150, 40), word('Effect', 155, 30, 200, 40)]), []);
  assert.deepEqual(assess(rows.slice(0, 2)), []);
});

test('distant adjacent inventory text and separate vertical rows do not create a clipping diagnosis', () => {
  const inventory = rows.map(item => /\p{L}/u.test(item.text) ? { ...item, bbox: { ...item.bbox, x0: 5, x1: 40 } } : item);
  assert.deepEqual(assess(inventory), []);
  assert.deepEqual(assess([rows[0], rows[3]]), []);
  const horizontal = [word('Nearby', 80, 40, 95, 50), word('5', 350, 40, 360, 50), word('Nearby', 80, 80, 95, 90), word('8', 350, 80, 360, 90)];
  assert.deepEqual(assess(horizontal), []);
});

test('two aligned numeric observations beyond right crop edge warn only when local labels remain inside', () => {
  const rightRows = [word('Effect', 110, 40, 170, 50), word('12', 290, 40, 315, 50), word('未知效果', 110, 80, 170, 90), word('3.5%', 290, 80, 315, 90)];
  const result = assess(rightRows);
  assert.equal(result.length, 1);
  assert.equal(result[0].code, 'possibleClippedValues');
  assert.equal(result[0].side, 'right');
});

test('scaled whole image boxes are mapped to source pixels without adjusting the reviewed crop', () => {
  const scaled = rows.map(item => ({ ...item, bbox: Object.fromEntries(Object.entries(item.bbox).map(([key, value]) => [key, value * 3])) }));
  assert.deepEqual(assess(scaled, { scale: 3 }), assess(rows));
});

test('excluded deltas and an adjacent label behind a complete inside label do not warn', () => {
  const withDeltas = [word('Effect', 110, 40, 170, 50), word('12', 240, 40, 260, 50), word('+3', 305, 40, 325, 50), word('Unknown', 110, 80, 170, 90), word('3.5%', 240, 80, 260, 90), word('-1%', 305, 80, 325, 90)];
  assert.deepEqual(assess(withDeltas), []);
  const nearbyLabels = [...rows, word('Inside', 160, 40, 200, 50), word('Inside', 160, 80, 200, 90)];
  assert.deepEqual(assess(nearbyLabels), []);
});

test('invalid source geometry, out-of-image boxes, duplicates and oversized evidence abstain', () => {
  for (const extra of [{ width: Infinity }, { height: 0 }, { scale: NaN }, { scale: 0 }, { region: { ...region, x: -1 } }, { region: { ...region, width: 900 } }, { blocks: null }]) assert.deepEqual(assess(rows, extra), []);
  assert.deepEqual(assess(rows.map(item => ({ ...item, bbox: { ...item.bbox, x1: Infinity } }))), []);
  assert.deepEqual(assess([...rows.slice(0, 2), ...structuredClone(rows.slice(0, 2))]), []);
  assert.deepEqual(assess(Array.from({ length: 1001 }, (_, i) => word('X', 80, 40, 150, 50))), []);
});

test('reader attaches advisory initial-whole-image provenance without changing selected regions or numeric confirmation', async () => {
  const scaled = rows.map(item => ({ ...item, bbox: Object.fromEntries(Object.entries(item.bbox).map(([key, value]) => [key, value * 3])) }));
  const outputs = [{ text: 'whole', blocks: blocks(scaled) }, { text: 'Draft 12', blocks: null }];
  const worker = { setParameters: async () => {}, recognize: async () => ({ data: outputs.shift() }), terminate: async () => {} };
  const reader = createComparisonReader({ loadTesseract: async () => ({ createWorker: async () => worker }), createCanvas: () => ({ width: 0, height: 0, getContext: () => ({ drawImage() {} }) }) });
  const result = await reader({ width: 500, height: 200 }, { inputRevision: 4, regions: [{ id: 'reviewed', region }] });
  const panel = result.proposedPanels[0];
  assert.equal(panel.coverageIssues[0].code, 'possibleClippedLabels');
  assert.equal(panel.coverageProvenance.observation, 'initialWholeImage');
  assert.equal(panel.coverageProvenance.advisoryOnly, true);
  assert.deepEqual(panel.region, region);
  assert.ok(panel.requiresReview && panel.lines.every(line => !line.confirmed && line.value === null));
});
