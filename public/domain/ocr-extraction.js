// Pure spatial proposals. No number is confirmed and no game meaning is inferred.
export const OCR_EXTRACTION_VERSION = 'spatial-proposals-2';
const clone = value => structuredClone(value);
function box(value) {
  if (!value || !['x0', 'y0', 'x1', 'y1'].every(key => Number.isFinite(value[key])) || value.x0 < 0 || value.y0 < 0 || value.x1 < value.x0 || value.y1 < value.y0) throw new TypeError('Finite ordered nonnegative OCR box required.');
  return clone(value);
}
function lanes(columns) {
  if (columns === null) return [];
  const entries = Object.entries(columns);
  if (!entries.length || entries.some(([key, range]) => !['label', 'value', 'delta'].includes(key) || !Array.isArray(range) || range.length !== 2 || !range.every(Number.isFinite) || range[0] < 0 || range[1] > 1 || range[0] >= range[1])) throw new TypeError('Explicit normalized column intervals required.');
  const sorted = entries.toSorted((a, b) => a[1][0] - b[1][0]);
  if (sorted.some((entry, index) => index && entry[1][0] < sorted[index - 1][1][1])) throw new RangeError('Column intervals overlap.');
  return entries;
}
export function extractSpatialObservation({ rawText, blocks, crop, scale = 1, columns = null }) {
  if (typeof rawText !== 'string' || !crop || !['x', 'y', 'width', 'height'].every(key => Number.isFinite(crop[key])) || crop.x < 0 || crop.y < 0 || crop.width <= 0 || crop.height <= 0 || !Number.isFinite(scale) || scale <= 0 || scale > 8) throw new TypeError('Raw text, source crop and bounded scale required.');
  if (![crop.x + crop.width, crop.y + crop.height, crop.width * scale, crop.height * scale].every(Number.isFinite)) throw new RangeError('Crop extents or scaled dimensions overflow.');
  if (blocks !== null && !Array.isArray(blocks)) throw new TypeError('Explicit engine blocks or null required.');
  const intervals = lanes(columns);
  const rows = [], unassignedWords = [];
  for (const [bi, block] of (blocks ?? []).entries()) for (const [pi, paragraph] of (block.paragraphs ?? []).entries()) for (const [li, line] of (paragraph.lines ?? []).entries()) {
    const ordinal = rows.length, id = `b${bi}:p${pi}:l${li}`;
    const words = (line.words ?? []).map((word, wi) => {
      if (typeof word.text !== 'string') throw new TypeError('Raw word text required.');
      const bbox = box(word.bbox);
      if (bbox.x1 > crop.width * scale || bbox.y1 > crop.height * scale) throw new RangeError('OCR word outside supplied crop.');
      const matches = intervals.filter(([, [left, right]]) => bbox.x0 >= left * crop.width * scale && bbox.x1 <= right * crop.width * scale);
      const lane = matches.length === 1 ? matches[0][0] : null;
      return { id: `${id}:w${wi}`, ordinal: wi, rawText: word.text, confidence: Number.isFinite(word.confidence) ? word.confidence : null, bbox, sourceBox: { x0: crop.x + bbox.x0 / scale, y0: crop.y + bbox.y0 / scale, x1: crop.x + bbox.x1 / scale, y1: crop.y + bbox.y1 / scale }, lane };
    });
    const fields = Object.fromEntries(['label', 'value', 'delta'].map(lane => [lane, words.filter(word => word.lane === lane).map(word => word.rawText).join(' ') || null]));
    const issues = [];
    if (!intervals.length) issues.push('columnsNotReviewed');
    if (words.some(word => word.lane === null)) issues.push('unassignedOrBoundaryWord');
    if (!fields.value) issues.push('missingValue');
    // Separators can be decimal/grouping errors. Keep text; never select a locale by guessing.
    if (fields.value && /[.,]/.test(fields.value)) issues.push('punctuationNeedsReview');
    if (fields.value && !/^[+-]?\d+(?:\.\d+)?\s*%?$/.test(fields.value)) issues.push('unparsedValue');
    const unit = fields.value?.trim().endsWith('%') ? '%' : null;
    const row = { id, ordinal, rawText: typeof line.text === 'string' ? line.text : words.map(word => word.rawText).join(' '), bbox: line.bbox ? box(line.bbox) : null, ...fields, unit, words, issues, state: 'needsReview', confirmedValue: null, statId: null };
    rows.push(row);
    unassignedWords.push(...words.filter(word => word.lane === null).map(word => ({ ...clone(word), rowId: id })));
  }
  return { version: OCR_EXTRACTION_VERSION, rawText, rawLines: rawText.split(/\r\n|\n|\r/), rows, unassignedWords, provenance: { crop: clone(crop), scale, columns: clone(columns), coordinateSystem: 'ocr-crop-pixels; sourceBox in original-image-pixels' } };
}

// Independent column OCR is associated only by unique vertical overlap. Every
// original column observation remains available even if association fails.
export function assembleColumnObservations(observations) {
  if (!Array.isArray(observations) || observations.some(entry => !['label', 'value', 'delta'].includes(entry.lane) || !entry.extraction?.rows)) throw new TypeError('Explicit lane observations required.');
  if (new Set(observations.map(entry => entry.lane)).size !== observations.length) throw new TypeError('Duplicate lane observations.');
  const originals = clone(observations);
  const byLane = Object.fromEntries(observations.map(entry => [entry.lane, entry.extraction.rows.map(row => ({ row, bounds: row.words.length ? { y0: Math.min(...row.words.map(word => word.sourceBox.y0)), y1: Math.max(...row.words.map(word => word.sourceBox.y1)) } : null }))]));
  const anchors = byLane.label ?? [];
  const used = new Set();
  const overlap = (a, b) => a && b && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > .5 * Math.min(a.y1 - a.y0, b.y1 - b.y0);
  const rows = anchors.map(({ row, bounds }, ordinal) => {
    const result = { id: `label:${row.id}`, ordinal, label: row.rawText.trim() || null, value: null, delta: null, unit: null, observationIds: { label: row.id }, issues: [], state: 'needsReview', confirmedValue: null, statId: null };
    for (const lane of ['value', 'delta']) {
      const matches = (byLane[lane] ?? []).filter(entry => overlap(bounds, entry.bounds));
      if (matches.length === 1 && anchors.filter(anchor => overlap(anchor.bounds, matches[0].bounds)).length === 1) {
        result[lane] = matches[0].row.rawText.trim() || null;
        result.observationIds[lane] = matches[0].row.id; used.add(`${lane}:${matches[0].row.id}`);
      } else if (matches.length) result.issues.push(`${lane}AssociationAmbiguous`);
    }
    if (!result.value) result.issues.push('missingValue');
    if (result.value && /[.,]/.test(result.value)) result.issues.push('punctuationNeedsReview');
    if (result.value && !/^[+-]?\d+(?:\.\d+)?\s*%?$/.test(result.value)) result.issues.push('unparsedValue');
    result.unit = result.value?.endsWith('%') ? '%' : null;
    return result;
  });
  const unassignedObservations = observations.flatMap(({ lane, extraction }) => lane === 'label' ? [] : extraction.rows.filter(row => !used.has(`${lane}:${row.id}`)).map(row => ({ lane, row: clone(row) })));
  return { version: OCR_EXTRACTION_VERSION, rows, unassignedObservations, observations: originals, state: 'needsReview' };
}
