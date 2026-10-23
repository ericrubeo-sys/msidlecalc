// Pure OCR proposals -> shared manual editor boundary. No number is confirmed
// by recognition, parsing, source confidence, or an import action.
export const SCREENSHOT_REVIEW_VERSION = 'screenshot-review-1';
const copy = value => structuredClone(value);
const token = '[+-]?(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?%?';
const simpleLine = new RegExp(`^(.+?)\\s+(${token})(?:\\s+(${token}))?$`);
export function proposeLineFields(rawText) {
  if (typeof rawText !== 'string') throw new TypeError('Raw observation text required.');
  const text = rawText.trim();
  const match = text.match(simpleLine);
  if (!match) return { rawLabel: text, rawValue: '', unit: 'unknown', comparisonText: null, issues: ['unparsedObservation'] };
  return { rawLabel: match[1], rawValue: match[2], unit: match[2].endsWith('%') ? 'displayPercent' : 'unknown', comparisonText: match[3] ?? null, issues: ['unconfirmedProposal', ...(match[2].includes(',') ? ['separatorNeedsReview'] : [])] };
}
export function importScreenshotProposals({ proposedPanels, assignment, assignmentConfirmed, imageRevision, runId }) {
  if (!Array.isArray(proposedPanels) || !Number.isSafeInteger(imageRevision) || imageRevision < 1 || !Number.isSafeInteger(runId) || runId < 1 || assignmentConfirmed !== true) throw new TypeError('Explicit reviewed assignment and active revision required.');
  if (!assignment || typeof assignment.current !== 'string' || typeof assignment.candidate !== 'string' || assignment.current === assignment.candidate) throw new TypeError('Two distinct reviewed item panels required.');
  const ids = new Set();
  for (const panel of proposedPanels) {
    if (!panel || typeof panel.id !== 'string' || ids.has(panel.id) || !Array.isArray(panel.lines)) throw new TypeError('Unique panel proposals and line arrays required.');
    ids.add(panel.id);
  }
  const items = {};
  for (const side of ['current', 'candidate']) {
    const panel = proposedPanels.find(entry => entry.id === assignment[side]);
    if (!panel) throw new TypeError('Assigned proposal panel is missing.');
    items[side] = panel.lines.map((line, ordinal) => {
      if (!line || typeof line.rawText !== 'string') throw new TypeError('Lossless line observations required.');
      const fields = proposeLineFields(line.rawText);
      return { id: `ocr-${imageRevision}-${runId}-${side}-${ordinal}`, ordinal, rawText: line.rawText,
        rawLabel: fields.rawLabel, rawValue: fields.rawValue, unit: fields.unit, confirmed: false, correction: null,
        comparisonText: fields.comparisonText, extractionIssues: fields.issues,
        provenance: { kind: 'ocr', imageRevision, runId, panelId: panel.id, lineId: line.id ?? null, ordinal, region: copy(panel.region ?? null), observation: copy(line.provenance ?? {}), reviewVersion: SCREENSHOT_REVIEW_VERSION },
        reviewedImageRevision: null };
    });
  }
  return items;
}
export function editScreenshotRecord(record, field, value) {
  if (!record || record.provenance?.kind !== 'ocr' || !['rawLabel','rawValue','unit'].includes(field) || typeof value !== 'string') throw new TypeError('Explicit OCR field edit required.');
  return { ...copy(record), confirmed: false, reviewedImageRevision: null,
    correction: { ...copy(record.correction ?? {}), [field]: value, confirmed: false } };
}
export function confirmScreenshotRecord(record, { confirmed, imageRevision }) {
  if (!record || record.provenance?.kind !== 'ocr' || typeof confirmed !== 'boolean' || !Number.isSafeInteger(imageRevision) || imageRevision < 1) throw new TypeError('Explicit OCR review required.');
  return { ...copy(record), confirmed, reviewedImageRevision: confirmed ? imageRevision : null,
    correction: record.correction ? { ...copy(record.correction), confirmed } : null };
}
export function recordsForImage(records, imageRevision) {
  if (!Array.isArray(records)) throw new TypeError('Records required.');
  return records.map(record => {
    if (record.provenance?.kind !== 'ocr' || record.reviewedImageRevision === imageRevision) return copy(record);
    return { ...copy(record), confirmed: false, correction: record.correction ? { ...copy(record.correction), confirmed: false } : null };
  });
}
