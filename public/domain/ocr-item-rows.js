// Pure, conservative draft assembly. Coordinates suggest rows, never truth.
export const OCR_ITEM_ROWS_VERSION = 'item-base-rows-1';
const copy = value => structuredClone(value);
const numericSource = '[+-]?(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?%?';
const numeric = new RegExp(`^${numericSource}$`);
const simpleLine = new RegExp(`^(.+?)\\s+(${numericSource})(?:\\s+(${numericSource}))?$`);
const unknown = text => ({ rawLabel: text, rawValue: '', unit: 'unknown', comparisonText: null, issues: ['unparsedObservation'] });
function fields(label, value, comparisonText = null) {
  return { rawLabel: label, rawValue: value, unit: value.endsWith('%') ? 'displayPercent' : 'unknown', comparisonText,
    issues: ['unconfirmedProposal', ...(value.includes(',') ? ['separatorNeedsReview'] : [])] };
}
export function proposeRawLineFields(rawText) {
  if (typeof rawText !== 'string') throw new TypeError('Raw observation text required.');
  const text = rawText.trim(), match = text.match(simpleLine);
  // A detached pair of numbers is not a label/value row. A label containing a
  // standalone number is ambiguous without explicit field boundaries.
  if (!match || !/\p{L}/u.test(match[1]) || match[1].split(/\s+/).some(part => numeric.test(part))) return unknown(text);
  return fields(match[1], match[2], match[3] ?? null);
}
const validBox = box => box && ['x0', 'y0', 'x1', 'y1'].every(key => Number.isFinite(box[key])) && box.x0 >= 0 && box.y0 >= 0 && box.x1 > box.x0 && box.y1 > box.y0;
const sameRow = (a, b) => Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) >= .65 * Math.max(a.y1 - a.y0, b.y1 - b.y0);
const tokens = text => text.trim().split(/\s+/).filter(Boolean).sort();
const isHeading = text => text.toLowerCase().replace(/[\s-]+/g, '') === 'onequipeffect';
function separateEvidence(rows) {
  return { rows: rows.filter(row => !isHeading(row.rawText)).map((row, ordinal) => ({ ...row, ordinal })),
    evidenceRows: rows.filter(row => isHeading(row.rawText)).map(row => ({ ...row, evidenceKind: 'exactOnEquipHeading' })) };
}
function fallback(panel, reason) {
  const rows = panel.lines.map((line, ordinal) => ({ ...copy(line), ordinal, proposedFields: proposeRawLineFields(line.rawText),
    provenance: { ...copy(line.provenance ?? {}), panelRawText: typeof panel.rawText === 'string' ? panel.rawText : panel.lines.map(line => line.rawText).join('\n'), originalRawLines: copy(panel.lines) } }));
  return { version: OCR_ITEM_ROWS_VERSION, method: 'rawLines', issues: [reason], ...separateEvidence(rows) };
}
export function proposePanelRows(panel) {
  if (!panel || !Array.isArray(panel.lines) || panel.lines.some(line => typeof line?.rawText !== 'string')) throw new TypeError('Lossless panel line observations required.');
  if (!Array.isArray(panel.structuredLines) || !panel.structuredLines.length) return fallback(panel, 'wordGeometryUnavailable');
  const words = [];
  for (const [lineIndex, line] of panel.structuredLines.entries()) {
    if (!Array.isArray(line.words) || (!line.words.length && line.text?.trim())) return fallback(panel, 'wordGeometryIncomplete');
    for (const [wordIndex, word] of line.words.entries()) {
      if (typeof word.text !== 'string' || !word.text.trim() || !validBox(word.bbox)) return fallback(panel, 'wordGeometryIncomplete');
      words.push({ id: `l${lineIndex}:w${wordIndex}`, lineIndex, wordIndex, text: word.text, bbox: copy(word.bbox), observation: copy(word) });
    }
  }
  if (!words.length || words.length > 1000) return fallback(panel, 'wordGeometryUnavailable');
  // Geometry must not silently discard characters present in the raw transcript.
  const transcript = typeof panel.rawText === 'string' ? panel.rawText : panel.lines.map(line => line.rawText).join('\n');
  if (JSON.stringify(tokens(transcript)) !== JSON.stringify(tokens(words.map(word => word.text).join(' ')))) return fallback(panel, 'rawWordCoverageMismatch');
  const remaining = new Set(words.map((_, index) => index)), components = [];
  while (remaining.size) {
    const first = remaining.values().next().value, component = [first]; remaining.delete(first);
    for (let cursor = 0; cursor < component.length; cursor++) for (const index of remaining) {
      if (sameRow(words[component[cursor]].bbox, words[index].bbox)) { component.push(index); remaining.delete(index); }
    }
    components.push(component.map(index => words[index]));
  }
  components.sort((a, b) => Math.min(...a.map(word => word.bbox.y0)) - Math.min(...b.map(word => word.bbox.y0)) || Math.min(...a.map(word => word.bbox.x0)) - Math.min(...b.map(word => word.bbox.x0)));
  const rows = components.map((component, ordinal) => {
    const sorted = component.toSorted((a, b) => a.bbox.x0 - b.bbox.x0 || a.lineIndex - b.lineIndex || a.wordIndex - b.wordIndex);
    const rawText = sorted.map(word => word.text).join(' ');
    // A tall bridging word or overlapping horizontal boxes makes association
    // ambiguous. Retain every observation but propose no numeric field.
    const coherent = sorted.every((word, index) => sorted.every(other => sameRow(word.bbox, other.bbox)) && (!index || sorted[index - 1].bbox.x1 <= word.bbox.x0));
    const proposedFields = coherent ? proposeRawLineFields(rawText) : { ...unknown(rawText), issues: ['ambiguousRowGeometry'] };
    const sourceLineIndices = [...new Set(component.map(word => word.lineIndex))].sort((a, b) => a - b);
    return { id: `${panel.id ?? 'panel'}:row-${ordinal}`, ordinal, rawText, proposedFields,
      provenance: { rowVersion: OCR_ITEM_ROWS_VERSION, method: 'mutualVerticalOverlap', sourceLineIndices,
        originalStructuredLines: sourceLineIndices.map(index => copy(panel.structuredLines[index])), words: copy(sorted),
        panelRawText: transcript, originalRawLines: copy(panel.lines), coordinateSystem: 'unchanged OCR crop pixels' } };
  });
  // Blank observations are also retained; they cannot establish a zero value.
  for (const line of panel.lines.filter(line => !line.rawText.trim())) rows.push({ ...copy(line), ordinal: rows.length, proposedFields: proposeRawLineFields(line.rawText),
    provenance: { ...copy(line.provenance ?? {}), panelRawText: transcript, originalRawLines: copy(panel.lines) } });
  return { version: OCR_ITEM_ROWS_VERSION, method: 'spatialRows', issues: ['unconfirmedGeometry'], ...separateEvidence(rows) };
}
