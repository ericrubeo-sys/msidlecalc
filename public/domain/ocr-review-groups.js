// Presentation only: no deletion, dictionary-based exclusion, confirmation or
// change to the complete ordered observations imported by the manual editor.
import { STAT_FIELDS } from './stat-fields.js';
const knownLabels = new Set(STAT_FIELDS.map(entry=>entry.label.toLowerCase().replace(/[.,]+$/,'')));
export function groupReviewRows(rows) {
  if (!Array.isArray(rows)) throw new TypeError('Assembled OCR rows required.');
  const stats = [], unresolved = [];
  for (const row of rows) {
    if (typeof row?.rawText !== 'string' || !row.proposedFields) throw new TypeError('Assembled OCR row fields required.');
    if (!row.rawText.trim()) continue; // blank separators remain in the source
    const fields = row.proposedFields;
    const label = (fields.statLabelProposal ?? fields.rawLabel)?.trim();
    // Recognized but incomplete stats remain prominent. Unknown effects with
    // values also remain prominent; the registry is never an exclusion list.
    (label && (fields.requiresStatReview || fields.rawValue?.trim() || knownLabels.has(label.toLowerCase().replace(/\s+/g,' ').replace(/[.,]+$/,''))) ? stats : unresolved).push(row);
  }
  return {stats,unresolved};
}
