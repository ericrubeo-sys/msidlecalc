// Advisory whole-image geometry only. No warning is not a coverage certificate.
export const CROP_COVERAGE_VERSION = 'crop-coverage-1';
const numeric = /^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?%?$/;
const overlapsRow = (a, b) => Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) >= .65 * Math.max(a.y1 - a.y0, b.y1 - b.y0);
const bounds = box => ({ x: box.x0, y: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0 });
const finiteBox = box => box && ['x0', 'y0', 'x1', 'y1'].every(key => Number.isFinite(box[key])) && box.x0 >= 0 && box.y0 >= 0 && box.x1 > box.x0 && box.y1 > box.y0;

export function assessCropCoverage({ blocks, width, height, scale = 1, region } = {}) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || !Number.isFinite(scale) || scale <= 0 || !region || !['x', 'y', 'width', 'height'].every(key => Number.isFinite(region[key])) || region.x < 0 || region.y < 0 || region.width <= 0 || region.height <= 0 || region.x + region.width > width || region.y + region.height > height || !Array.isArray(blocks)) return [];
  const words = [];
  for (const block of blocks) for (const paragraph of Array.isArray(block?.paragraphs) ? block.paragraphs : []) for (const line of Array.isArray(paragraph?.lines) ? paragraph.lines : []) for (const word of Array.isArray(line?.words) ? line.words : []) {
    if (typeof word?.text !== 'string' || !finiteBox(word.bbox) || word.bbox.x1 > width * scale || word.bbox.y1 > height * scale) continue;
    const box = Object.fromEntries(Object.entries(word.bbox).filter(([key]) => ['x0', 'y0', 'x1', 'y1'].includes(key)).map(([key, value]) => [key, value / scale]));
    if (box.y0 < region.y || box.y1 > region.y + region.height) continue;
    words.push({ text: word.text.trim(), box });
    if (words.length > 1000) return [];
  }
  const left = region.x, right = region.x + region.width;
  const labels = words.filter(word => /\p{L}/u.test(word.text) && !/\p{N}/u.test(word.text));
  const values = words.filter(word => numeric.test(word.text));
  const warnings = [];
  for (const side of ['left', 'right']) {
    const candidates = [];
    for (const value of values) {
      const insideValue = value.box.x0 >= left && value.box.x1 <= right;
      if (side === 'left' ? !insideValue : !(value.box.x1 > right && value.box.x0 <= right + region.width * .35)) continue;
      // A base number already inside can have an intentionally excluded game
      // delta to its right. That is not evidence of a clipped base value.
      if (side === 'right' && values.some(other => other !== value && overlapsRow(other.box, value.box) && other.box.x0 >= left && other.box.x1 <= right)) continue;
      const nearby = labels.filter(label => overlapsRow(label.box, value.box) && label.box.x1 <= value.box.x0 && value.box.x0 - label.box.x1 <= region.width * .65 &&
        (side === 'left' ? label.box.x0 >= left - region.width * .45 : label.box.x0 >= left && label.box.x1 <= right));
      // Nearest observed label fragment, without borrowing from another panel.
      const label = nearby.sort((a, b) => b.box.x1 - a.box.x1)[0];
      if (label && (side !== 'left' || label.box.x0 < left)) candidates.push({ label, value });
    }
    // Two independent rows must support a repeated local text/value column.
    // A heading or a distant inventory label alone cannot trigger a warning.
    const supported = candidates.filter(row => candidates.some(other => other !== row && !overlapsRow(row.value.box, other.value.box) && Math.abs(row.label.box.x0 - other.label.box.x0) <= region.width * .15 && Math.abs(row.value.box.x1 - other.value.box.x1) <= region.width * .2));
    const rows = [];
    for (const row of supported) if (!rows.some(prior => overlapsRow(prior.value.box, row.value.box))) rows.push(row);
    if (rows.length < 2) continue;
    warnings.push({ version: CROP_COVERAGE_VERSION, code: side === 'left' ? 'possibleClippedLabels' : 'possibleClippedValues', side,
      coordinateSystem: 'originalImagePixels', region: structuredClone(region), rows: rows.map(({ label, value }) => ({ labelBounds: bounds(label.box), valueBounds: bounds(value.box), outsideBounds: [bounds(side === 'left' ? label.box : value.box)] })) });
  }
  return warnings;
}
