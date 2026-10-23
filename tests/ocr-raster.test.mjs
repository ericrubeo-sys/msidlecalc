import test from 'node:test';
import assert from 'node:assert/strict';
import { preprocessOcrRaster, unpadOcrBlocks } from '../public/domain/ocr-raster.js';
const rgba = (width, height, pixels) => ({ width, height, data: Uint8ClampedArray.from(pixels.flatMap(value => Array.isArray(value) ? value : [value, value, value, 255])) });
test('nearest transform repeats original opaque pixels, padding is explicit and original remains unchanged', () => {
  const input = rgba(2, 1, [0, 255]), before = [...input.data];
  const result = preprocessOcrRaster(input, { scale: 2, padding: 1 });
  assert.deepEqual([result.width, result.height], [6, 4]);
  assert.deepEqual([...input.data], before);
  assert.deepEqual([...result.data.slice(0, 4)], [255, 255, 255, 255]);
  assert.deepEqual([1, 2, 3, 4].map(x => result.data[(6 + x) * 4]), [0, 0, 255, 255]);
  assert.deepEqual(result.provenance.coordinateTransform, { scale: 2, padding: 1 });
});
test('bilinear pixel-centre interpolation retains antialias instead of thresholding', () => {
  const result = preprocessOcrRaster(rgba(2, 1, [0, 255]), { scale: 2, interpolation: 'bilinear' });
  assert.deepEqual([0, 1, 2, 3].map(x => result.data[x * 4]), [0, 64, 191, 255]);
  assert.equal(result.data[3], 255);
});
test('luminance inversion keeps intermediate shades; alpha composites against white', () => {
  const result = preprocessOcrRaster(rgba(2, 1, [[255, 0, 0, 255], [0, 0, 0, 0]]), { mode: 'luma-invert' });
  assert.deepEqual([...result.data], [178, 178, 178, 255, 0, 0, 0, 255]);
  assert.equal(result.provenance.threshold, null);
});
test('Otsu uses declared earliest tied threshold and does not mutate input', () => {
  const input = rgba(4, 1, [10, 10, 200, 200]);
  const result = preprocessOcrRaster(input, { mode: 'otsu-invert' });
  assert.equal(result.provenance.threshold, 10);
  assert.deepEqual([0, 1, 2, 3].map(x => result.data[x * 4]), [255, 255, 0, 0]);
  assert.equal(input.data[0], 10);
});
test('flat raster and singleton bilinear remain finite and reproducible', () => {
  const input = rgba(1, 1, [90]);
  const first = preprocessOcrRaster(input, { mode: 'luma-invert', scale: 6, interpolation: 'bilinear' });
  const second = preprocessOcrRaster(input, { mode: 'luma-invert', scale: 6, interpolation: 'bilinear' });
  assert.deepEqual(first, second);
  assert.equal(first.data[0], 165);
});
test('malformed inputs, unsupported transforms and excessive output fail before processing', () => {
  assert.throws(() => preprocessOcrRaster({ width: 1, height: 1, data: new Uint8Array(4) }));
  assert.throws(() => preprocessOcrRaster(rgba(1, 1, [0]), { scale: 1.5 }));
  assert.throws(() => preprocessOcrRaster(rgba(1, 1, [0]), { mode: 'guess-digits' }));
  assert.throws(() => preprocessOcrRaster(rgba(1, 1, [0]), { padding: -1 }));
  assert.throws(() => preprocessOcrRaster({ width: 1000, height: 1000, data: new Uint8ClampedArray(4000000) }, { scale: 6 }));
});
test('unpadding detaches full block hierarchy and preserves original raster boxes', () => {
  const box = { x0: 9, y0: 10, x1: 21, y1: 22 };
  const blocks = [{ bbox: box, paragraphs: [{ lines: [{ words: [{ text: 'Synthetic', bbox: box }] }] }] }];
  const result = unpadOcrBlocks(blocks, { padding: 8 });
  assert.deepEqual(result[0].bbox, { x0: 1, y0: 2, x1: 13, y1: 14 });
  assert.deepEqual(result[0].paragraphs[0].lines[0].words[0].rasterBbox, box);
  result[0].rasterBbox.x0 = 100;
  assert.equal(box.x0, 9);
  assert.equal(unpadOcrBlocks(null, { padding: 0 }), null);
});
test('padding-intersecting, reversed and nonfinite boxes fail instead of silent clamping', () => {
  for (const bbox of [{ x0: 7, y0: 8, x1: 10, y1: 10 }, { x0: 9, y0: 8, x1: 8, y1: 10 }, { x0: 8, y0: NaN, x1: 10, y1: 10 }]) assert.throws(() => unpadOcrBlocks([{ bbox }], { padding: 8 }));
});
