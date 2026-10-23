// Independent synthetic pixels/boxes only. No private images or recognition
// truth from development/held-out fixtures is used by these invariants.
import test from 'node:test';
import assert from 'node:assert/strict';
import { preprocessOcrRaster, unpadOcrBlocks, OCR_RASTER_VERSION } from '../public/domain/ocr-raster.js';
import { extractSpatialObservation } from '../public/domain/ocr-extraction.js';

const raster = (width, height, pixels) => ({ width, height, data: Uint8ClampedArray.from(pixels.flatMap(pixel => typeof pixel === 'number' ? [pixel, pixel, pixel, 255] : pixel)) });
const pixel = (image, x, y) => [...image.data.slice((y * image.width + x) * 4, (y * image.width + x) * 4 + 4)];

test('QA original mode copies opaque colors without creating a text/value decision; nearest scaling and border are independent', () => {
  const input = raster(1, 1, [[12, 34, 56, 255]]); const original = input.data.slice();
  const copy = preprocessOcrRaster(input);
  assert.deepEqual(copy.data, original); assert.notEqual(copy.data, input.data);
  const enlarged = preprocessOcrRaster(input, { scale: 2, padding: 1, paddingValue: 17 });
  assert.equal(enlarged.width, 4); assert.equal(enlarged.height, 4);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) assert.deepEqual(pixel(enlarged, x, y), x >= 1 && x <= 2 && y >= 1 && y <= 2 ? [12,34,56,255] : [17,17,17,255]);
  assert.deepEqual(input.data, original); assert.equal(enlarged.provenance.version, OCR_RASTER_VERSION);
  assert.equal(Object.hasOwn(enlarged, 'value'), false);
});

test('QA two-dimensional bilinear interpolation uses replicated edges and one channel rounding, not binary guessing', () => {
  const input = raster(2, 2, [0, 255, 255, 0]);
  const result = preprocessOcrRaster(input, { scale: 2, interpolation: 'bilinear' });
  assert.deepEqual(pixel(result, 0, 0), [0,0,0,255]);
  assert.deepEqual(pixel(result, 3, 0), [255,255,255,255]);
  // Source position(.25,.25): .75*(.75*0+.25*255)
  // +.25*(.75*255+.25*0)=95.625, one final rounding gives96.
  assert.deepEqual(pixel(result, 1, 1), [96,96,96,255]);
  assert.deepEqual(pixel(result, 2, 1), [159,159,159,255]);
});

test('QA luminance inversion retains graded evidence, alpha policy is explicit and repeated calls are deterministic', () => {
  const input = raster(3, 1, [0, 100, [77, 88, 99, 0]]); const original = input.data.slice();
  const options = { mode: 'luma-invert', scale: 1 };
  const first = preprocessOcrRaster(input, options), second = preprocessOcrRaster(input, options);
  assert.deepEqual(first, second); assert.deepEqual(input.data, original);
  assert.deepEqual(pixel(first, 0, 0), [255,255,255,255]);
  assert.deepEqual(pixel(first, 1, 0), [155,155,155,255]);
  assert.deepEqual(pixel(first, 2, 0), [0,0,0,255]);
  assert.equal(first.provenance.alphaComposite, 'white-integer-rounded');
  assert.equal(first.provenance.threshold, null);
});

test('QA padding then scale reversal maps boxes to original crop while retaining every raw observation unconfirmed', () => {
  const bbox = { x0: 5, y0: 2, x1: 8, y1: 5 };
  const blocks = [{ bbox: { ...bbox }, paragraphs: [{ lines: [{ text: 'Unknown ?', bbox: { ...bbox }, words: [{ text: 'Unknown', bbox: { ...bbox }, confidence: 100 }] }] }] }];
  const original = structuredClone(blocks);
  const unpadded = unpadOcrBlocks(blocks, { padding: 2 });
  const output = extractSpatialObservation({ rawText: 'Unknown ?\n', blocks: unpadded, crop: { x: 100, y: 200, width: 2, height: 2 }, scale: 3 });
  assert.deepEqual(output.rows[0].words[0].sourceBox, { x0: 101, y0: 200, x1: 102, y1: 201 });
  assert.deepEqual(unpadded[0].paragraphs[0].lines[0].words[0].rasterBbox, bbox);
  assert.equal(output.rawText, 'Unknown ?\n'); assert.equal(output.rows[0].confirmedValue, null); assert.equal(output.rows[0].statId, null);
  assert.deepEqual(blocks, original);
  unpadded[0].paragraphs[0].lines[0].words[0].rasterBbox.x0 = 999;
  assert.deepEqual(blocks, original);
});

test('QA geometry failures retain input rather than clamp padding, and malformed raster budgets reject before allocation', () => {
  const blocks = [{ text: 'raw retained', bbox: { x0: 1, y0: 2, x1: 9, y1: 10 } }];
  const original = structuredClone(blocks);
  assert.throws(() => unpadOcrBlocks(blocks, { padding: 2 })); assert.deepEqual(blocks, original);
  assert.equal(unpadOcrBlocks(null, { padding: 2 }), null);
  for (const options of [{ mode: 'guess-digits' }, { scale: 0 }, { scale: 7 }, { padding: 65 }, { interpolation: 'dictionary' }, { paddingValue: 256 }]) assert.throws(() => preprocessOcrRaster(raster(1, 1, [0]), options));
  assert.throws(() => preprocessOcrRaster({ width: 7000001, height: 1, data: new Uint8ClampedArray(0) }));
  assert.throws(() => preprocessOcrRaster({ width: 1, height: 1, data: new Uint8Array(4) }));
});
