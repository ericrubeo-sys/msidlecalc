import { assignComparisonLayout } from './comparison-layout.js';
import { proposePanelRows } from './ocr-item-rows.js';
import { parseDecimal, STAT_REGISTRY } from './item-lines.js';

// A bounded second OCR opportunity after whole-image heading attempts fail.
// Coordinates alone never establish a panel or confirm any extracted quantity.
export const LOCAL_PANEL_RECOVERY_VERSION = 'local-panel-recovery-1';
const exactLabel = text => text.trim().replace(/\s+/g, ' ').toLowerCase();
// Display-label anchors, not a mechanics registry or a whitelist of retained
// effects. These labels are already observed in the project's reviewed images.
const anchors = new Set([...STAT_REGISTRY.map(stat => stat.label), 'Evasion', 'Defense', 'Damage', 'Boss Monster Damage', 'Normal Monster Damage', 'All Skill Levels', '2nd Job Skill Lv.', '3rd Job Skill Lv.', '4th Job Skill Lv.', 'Defense Penetration'].map(exactLabel));
const literal = /^[+]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?%?$/;
const boundedImage = (width, height) => Number.isInteger(width) && Number.isInteger(height) && width >= 640 && height >= 280 && width * height <= 7000000 && width / height >= 1.8 && width / height <= 2.5;
const boxValid = (box, width, height) => box && ['x0', 'y0', 'x1', 'y1'].every(key => Number.isFinite(box[key])) && box.x0 >= 0 && box.y0 >= 0 && box.x1 > box.x0 && box.y1 > box.y0 && box.x1 <= width && box.y1 <= height;

export function createLocalPanelHypotheses({ width, height } = {}) {
  if (!boundedImage(width, height)) return [];
  const region = { x: Math.floor(.24 * width), y: Math.floor(.4 * height), width: Math.floor(.23 * width), height: Math.floor(.4 * height) };
  return [region, { ...region, x: region.x + region.width }].map((region, index) => ({ id: `local-${index + 1}`, region, role: null, requiresReview: true, issues: ['unverifiedLocalLayoutHypothesis', 'visibleCompletenessUnconfirmed'] }));
}

export function assessLocalPanelRecovery({ panels, width, height, scale = 1 } = {}) {
  const result = { version: LOCAL_PANEL_RECOVERY_VERSION, eligible: false, issues: [], panelEvidence: [] };
  const fail = issue => ({ ...result, issues: [issue] });
  if (!boundedImage(width, height) || !Number.isFinite(scale) || scale <= 0 || scale > 3) return fail('unsupportedRecoveryGeometry');
  const layout = assignComparisonLayout(panels);
  if (layout.status !== 'assigned') return fail('twoDistinctLocalAreasRequired');
  const [left, right] = layout.panels.map(panel => panel.region);
  // Independent crops must not overlap or differ markedly in vertical span.
  if (left.x + left.width > right.x || Math.abs(left.y - right.y) > .1 * Math.min(left.height, right.height) || Math.max(left.height, right.height) > 1.25 * Math.min(left.height, right.height)) return fail('contradictoryLocalAreas');
  for (const panel of layout.panels) {
    const { region } = panel;
    if (!['x', 'y', 'width', 'height'].every(key => Number.isInteger(region[key])) || region.x + region.width > width || region.y + region.height > height) return fail('unboundedLocalArea');
    if (!Array.isArray(panel.coverageIssues) || panel.coverageIssues.length) return fail('localCoverageUnresolved');
    if (typeof panel.rawText !== 'string' || panel.rawText.length > 100000 || !Array.isArray(panel.lines) || panel.lines.length > 1000 || !Array.isArray(panel.structuredLines) || panel.structuredLines.length > 1000) return fail('localWordEvidenceUnavailable');
    let wordCount = 0;
    for (const line of panel.structuredLines) {
      if (!Array.isArray(line?.words) || line.words.length > 1000 || (wordCount += line.words.length) > 1000 || line.words.some(word => typeof word?.text !== 'string' || word.text.length > 1000)) return fail('localWordEvidenceUnavailable');
    }
    let assembled;
    try { assembled = proposePanelRows(panel); } catch { return fail('localWordEvidenceUnavailable'); }
    if (assembled.method !== 'spatialRows') return fail('localWordEvidenceUnavailable');
    const cropWidth = region.width * scale, cropHeight = region.height * scale;
    const words = [...assembled.rows, ...assembled.evidenceRows].flatMap(row => row.provenance?.words ?? []);
    if (!words.length || words.length > 1000 || words.some(word => !boxValid(word.bbox, cropWidth, cropHeight))) return fail('unboundedLocalWordEvidence');
    const headings = assembled.evidenceRows.filter(row => row.evidenceKind === 'exactOnEquipHeading');
    if (headings.length !== 1) return fail('exactLocalHeadingRequired');
    const headingWords = headings[0].provenance.words;
    const headingBottom = Math.max(...headingWords.map(word => word.bbox.y1));
    const headingLeft = Math.min(...headingWords.map(word => word.bbox.x0));
    if (headingBottom > .25 * cropHeight || headingLeft > .35 * cropWidth) return fail('localHeadingPositionUnsupported');
    const qualifying = [];
    for (const row of assembled.rows) {
      const fields = row.proposedFields;
      if (!anchors.has(exactLabel(fields.rawLabel)) || !literal.test(fields.rawValue)) continue;
      const percent = fields.rawValue.endsWith('%');
      const parsed = parseDecimal(fields.rawValue.replaceAll(',', ''), { unit: percent ? 'displayPercent' : 'statPoint', allowNegative: false });
      if (parsed.state !== 'parsed') continue;
      const rowWords = row.provenance?.words;
      if (!rowWords?.length || rowWords.some(word => word.bbox.y0 < headingBottom)) continue;
      const base = rowWords.find(word => word.text === fields.rawValue || word.observation?.fieldEvidence?.baseText === fields.rawValue);
      if (!base || base.bbox.x0 < .5 * cropWidth || rowWords[0].bbox.x0 > .35 * cropWidth) continue;
      qualifying.push({ label: exactLabel(fields.rawLabel), y: base.bbox.y0 });
    }
    if (new Set(qualifying.map(row => row.label)).size < 3 || new Set(qualifying.map(row => row.y)).size < 3) return fail('insufficientDistinctLocalStatRows');
    result.panelEvidence.push({ panelId: panel.id, distinctKnownLabels: new Set(qualifying.map(row => row.label)).size, routingOnly: true, valuesConfirmed: false, visibleCompletenessConfirmed: false });
  }
  return { ...result, eligible: true, issues: ['localHypothesisRequiresItemReview'] };
}
