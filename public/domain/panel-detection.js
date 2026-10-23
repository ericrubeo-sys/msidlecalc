// Heading-based geometric proposals, never equipped/candidate attribution.
export const PANEL_DETECTION_VERSION = 'heading-regions-2';
// One OCR character error may propose a heading region; it never changes raw
// stat text or confirms either the region bounds or the item's equipped role.
function headingDistance(text) {
  const observed = text.toLowerCase().replace(/[^a-z]/g, ''), target = 'onequipeffect';
  if (Math.abs(observed.length - target.length) > 1) return 2;
  let row = Array.from({ length: target.length + 1 }, (_, i) => i);
  for (let i = 0; i < observed.length; i++) {
    const next = [i + 1];
    for (let j = 0; j < target.length; j++) next.push(Math.min(next[j] + 1, row[j + 1] + 1, row[j] + (observed[i] === target[j] ? 0 : 1)));
    row = next;
  }
  return row[target.length];
}
export function detectComparisonPanels({ blocks, width, height, scale = 1 }) {
  if (!Array.isArray(blocks) && blocks !== null) throw new TypeError('Explicit OCR blocks required.');
  if (![width, height, scale].every(Number.isFinite) || width <= 0 || height <= 0 || scale <= 0) throw new TypeError('Finite image geometry required.');
  const lines = (blocks ?? []).flatMap(block => (block.paragraphs ?? []).flatMap(paragraph => paragraph.lines ?? []));
  const valid = line => typeof line.text === 'string' && line.bbox && ['x0', 'y0', 'x1', 'y1'].every(key => Number.isFinite(line.bbox[key])) && line.bbox.x0 >= 0 && line.bbox.y0 >= 0 && line.bbox.x1 > line.bbox.x0 && line.bbox.y1 > line.bbox.y0 && line.bbox.x1 <= width * scale && line.bbox.y1 <= height * scale;
  const headingLines = lines.filter(line => valid(line) && headingDistance(line.text) <= 1);
  const anchors = headingLines.map(line => ({ text: line.text, match: headingDistance(line.text) === 0 ? 'exact' : 'approximate', box: Object.fromEntries(Object.entries(line.bbox).map(([key, value]) => [key, value / scale])) })).sort((a, b) => a.box.x0 - b.box.x0 || a.box.y0 - b.box.y0);
  if (anchors.length > 4) return { version: PANEL_DETECTION_VERSION, panels: [], issues: ['tooManyHeadingAnchors'] };
  const panels = anchors.map((anchor, ordinal) => {
    // The recognized heading is left-aligned within the panel. Its text centre
    // is not the panel centre and would clip the numeric column to its right.
    const distances = anchors.filter(other => other !== anchor).map(other => Math.abs(other.box.x0 - anchor.box.x0)).filter(distance => distance > (anchor.box.x1 - anchor.box.x0) / 2);
    const span = distances.length ? Math.min(...distances) : Math.max((anchor.box.x1 - anchor.box.x0) * 2.5, width * .2);
    const x = Math.max(0, Math.floor(anchor.box.x0 - 2)), right = Math.min(width, Math.ceil(anchor.box.x0 + span - 2));
    const y = Math.min(height - 1, Math.ceil(anchor.box.y1 + 1));
    const terminators = lines.filter(line => valid(line) && /^(?:on[ -]?hold effect|potential|equip|enhance)$/i.test(line.text.trim()) && line.bbox.y0 / scale > y && line.bbox.x0 / scale >= x && line.bbox.x0 / scale < right).map(line => line.bbox.y0 / scale);
    const bottom = terminators.length ? Math.min(...terminators) : height;
    return { id: `panel-${ordinal + 1}`, role: null, region: { x, y, width: Math.max(1, right - x), height: Math.max(1, Math.floor(bottom - y)) }, heading: structuredClone(anchor), requiresReview: true, issues: ['heuristicBounds', 'itemRoleUnassigned', 'visibleCompletenessUnconfirmed'] };
  });
  return { version: PANEL_DETECTION_VERSION, panels, issues: panels.length ? ['reviewPanelBoundsAndRoles'] : ['headingNotRecognized'] };
}
