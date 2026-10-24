import { parseItemLines, STAT_REGISTRY } from './item-lines.js';
import { confirmScreenshotRecord } from './screenshot-review.js';

// Display formatting adapter, not OCR repair. Malformed grouping stays invalid.
export function normalizeReviewRecord(record) {
  const result = structuredClone(record);
  const fields = { ...record, ...record.correction };
  const raw = String(fields.rawValue ?? '').trim();
  const grouped = /^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?%?$/.test(raw);
  const label = String(fields.rawLabel ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  const definition = STAT_REGISTRY.find(entry => entry.label.toLowerCase() === label);
  const unit = raw.endsWith('%') ? 'displayPercent' : fields.unit && fields.unit !== 'unknown' ? fields.unit : /job skill lv\.?$/i.test(label) ? 'level' : definition?.unit ?? 'unknown';
  // Keep original image observations untouched; normalization is a transient
  // overlay at the parser boundary, retaining the explicit review state.
  result.correction = { ...result.correction, rawValue: grouped ? raw.replaceAll(',', '') : raw, unit,
    confirmed: record.correction?.confirmed ?? record.confirmed === true };
  return result;
}

export function parseReviewRecords(records, { imageRevision, confirmed = false } = {}) {
  return parseItemLines(records.map(record => {
    let next = structuredClone(record);
    if (next.provenance?.kind === 'ocr') next = confirmScreenshotRecord(next, { confirmed, imageRevision });
    else { next.confirmed = confirmed; if (next.correction) next.correction.confirmed = confirmed; }
    return normalizeReviewRecord(next);
  }));
}

export function adoptReviewRecords(existing, incoming, { imageRevision, previousImageRevision, edited = false }) {
  const preserved = edited && imageRevision === previousImageRevision;
  const items = structuredClone(preserved ? existing : incoming);
  for (const lines of Object.values(items)) for (const record of lines) {
    record.confirmed = false;
    record.reviewedImageRevision = null;
    if (record.correction) record.correction.confirmed = false;
  }
  return { items, preserved };
}
