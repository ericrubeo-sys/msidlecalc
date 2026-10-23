// Pure optional developer preprocessing. Never replaces the retained original.
export const OCR_RASTER_VERSION = 'ocr-raster-1';
const MODES = ['original', 'luma-invert', 'otsu-invert'];
function otsuThreshold(histogram, count) {
  let sum = 0;
  for (let value = 0; value < 256; value++) sum += value * histogram[value];
  let backgroundCount = 0, backgroundSum = 0, maximum = -1, threshold = 0;
  for (let value = 0; value < 256; value++) {
    backgroundCount += histogram[value]; backgroundSum += value * histogram[value];
    if (!backgroundCount) continue;
    const foregroundCount = count - backgroundCount;
    if (!foregroundCount) break;
    const difference = backgroundSum / backgroundCount - (sum - backgroundSum) / foregroundCount;
    const variance = backgroundCount * foregroundCount * difference * difference;
    // Earliest tied threshold is explicit and reproducible.
    if (variance > maximum) { maximum = variance; threshold = value; }
  }
  return threshold;
}
export function preprocessOcrRaster(raster, options = {}) {
  const { width, height, data } = raster ?? {};
  const { mode = 'original', scale = 1, padding = 0, interpolation = 'nearest', paddingValue = 255 } = options;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width * height > 7000000 || !(data instanceof Uint8ClampedArray) || data.length !== width * height * 4) throw new TypeError('Bounded RGBA raster required.');
  if (!MODES.includes(mode) || !Number.isInteger(scale) || scale < 1 || scale > 6 || !Number.isInteger(padding) || padding < 0 || padding > 64 || !['nearest', 'bilinear'].includes(interpolation) || !Number.isInteger(paddingValue) || paddingValue < 0 || paddingValue > 255) throw new TypeError('Explicit supported raster options required.');
  const outputWidth = width * scale + 2 * padding, outputHeight = height * scale + 2 * padding;
  if (outputWidth * outputHeight > 28000000) throw new RangeError('Transformed raster exceeds pixel budget.');
  const source = new Uint8ClampedArray(data.length), histogram = new Uint32Array(256);
  for (let pixel = 0; pixel < width * height; pixel++) {
    const offset = pixel * 4, alpha = data[offset + 3];
    // Alpha composites against white before optional luminance conversion.
    for (let channel = 0; channel < 3; channel++) source[offset + channel] = Math.round((data[offset + channel] * alpha + 255 * (255 - alpha)) / 255);
    const luma = (77 * source[offset] + 150 * source[offset + 1] + 29 * source[offset + 2] + 128) >> 8;
    histogram[luma]++;
    if (mode !== 'original') source.fill(luma, offset, offset + 3);
    source[offset + 3] = 255;
  }
  const threshold = mode === 'otsu-invert' ? otsuThreshold(histogram, width * height) : null;
  if (mode !== 'original') for (let offset = 0; offset < source.length; offset += 4) {
    const intensity = mode === 'otsu-invert' ? source[offset] > threshold ? 0 : 255 : 255 - source[offset];
    source.fill(intensity, offset, offset + 3);
  }
  const output = new Uint8ClampedArray(outputWidth * outputHeight * 4);
  for (let offset = 0; offset < output.length; offset += 4) { output.fill(paddingValue, offset, offset + 3); output[offset + 3] = 255; }
  const clamp = (value, max) => Math.max(0, Math.min(max, value));
  for (let y = 0; y < height * scale; y++) for (let x = 0; x < width * scale; x++) {
    const target = ((y + padding) * outputWidth + x + padding) * 4;
    if (interpolation === 'nearest') {
      const sourceOffset = (Math.floor(y / scale) * width + Math.floor(x / scale)) * 4;
      output.set(source.subarray(sourceOffset, sourceOffset + 4), target);
    } else {
      // Pixel-centre mapping, edge replication, one final rounding per channel.
      const sx = clamp((x + .5) / scale - .5, width - 1), sy = clamp((y + .5) / scale - .5, height - 1);
      const x0 = Math.floor(sx), y0 = Math.floor(sy), x1 = Math.min(x0 + 1, width - 1), y1 = Math.min(y0 + 1, height - 1), dx = sx - x0, dy = sy - y0;
      for (let channel = 0; channel < 3; channel++) {
        const top = source[(y0 * width + x0) * 4 + channel] * (1 - dx) + source[(y0 * width + x1) * 4 + channel] * dx;
        const bottom = source[(y1 * width + x0) * 4 + channel] * (1 - dx) + source[(y1 * width + x1) * 4 + channel] * dx;
        output[target + channel] = Math.round(top * (1 - dy) + bottom * dy);
      }
    }
  }
  return { width: outputWidth, height: outputHeight, data: output,
    provenance: { version: OCR_RASTER_VERSION, mode, scale, padding, interpolation, paddingValue, threshold, alphaComposite: 'white-integer-rounded', luminance: 'integer-77-150-29-over-256', sourceDimensions: [width, height], coordinateTransform: { scale, padding }, originalRetainedByCaller: true } };
}

export function unpadOcrBlocks(blocks, { padding } = {}) {
  if (blocks !== null && !Array.isArray(blocks)) throw new TypeError('Engine blocks or null required.');
  if (!Number.isInteger(padding) || padding < 0 || padding > 64) throw new TypeError('Explicit bounded padding required.');
  function copy(value) {
    if (Array.isArray(value)) return value.map(copy);
    if (value === null || typeof value !== 'object') return value;
    const result = Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, copy(entry)]));
    if (Object.hasOwn(value, 'bbox')) {
      const box = value.bbox;
      if (!box || !['x0', 'y0', 'x1', 'y1'].every(key => Number.isFinite(box[key])) || box.x0 < padding || box.y0 < padding || box.x1 < box.x0 || box.y1 < box.y0) throw new RangeError('OCR box intersects padding or has invalid geometry; retain original output for review.');
      result.rasterBbox = structuredClone(box);
      result.bbox = { x0: box.x0 - padding, y0: box.y0 - padding, x1: box.x1 - padding, y1: box.y1 - padding };
    }
    return result;
  }
  return copy(blocks);
}
