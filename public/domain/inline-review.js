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
  if(preserved) for(const side of ['current','candidate']) {
    const key=record=>record.provenance?.rowRecovery?.target?.region?JSON.stringify([record.provenance.imageRevision,record.provenance.panelId,record.provenance.rowRecovery.target.region]):null;
    const known=new Set(items[side].filter(record=>record.coverageRecovery).map(key).filter(Boolean));
    for(const record of incoming[side]) {
      if(!record.coverageRecovery || !key(record) || known.has(key(record))) continue;
      // New pixel evidence cannot replace retained user edits. An unmatched
      // recovered row becomes one empty review request instead of an adopted
      // numeric source, including when the retry proposed a plausible number.
      const placeholder=structuredClone(record);
      placeholder.rawLabel='';placeholder.rawValue='';placeholder.unit='unknown';placeholder.correction=null;
      placeholder.coveragePlaceholder=true;placeholder.otherReading=false;
      const next=items[side].findIndex(entry=>Number(entry.ordinal)>Number(placeholder.ordinal));
      if(next<0)items[side].push(placeholder);else items[side].splice(next,0,placeholder);
      known.add(key(record));
    }
  }
  for (const lines of Object.values(items)) for (const record of lines) {
    record.confirmed = false;
    record.reviewedImageRevision = null;
    if (record.correction) record.correction.confirmed = false;
  }
  return { items, preserved };
}
