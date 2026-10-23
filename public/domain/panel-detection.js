// Heading-based geometric proposals, never equipped/candidate attribution.
export const PANEL_DETECTION_VERSION = 'heading-regions-3';
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
  const candidates = [];
  const add = (text, bbox, source) => {
    if (headingDistance(text) > 1) return;
    candidates.push({ text, match: headingDistance(text) === 0 ? 'exact' : 'approximate', source, box: Object.fromEntries(['x0', 'y0', 'x1', 'y1'].map(key => [key, bbox[key] / scale])) });
  };
  for (const line of lines.filter(valid)) {
    add(line.text, line.bbox, 'line');
    // Sparse OCR can merge both headings into one line. Recover only complete
    // adjacent word sequences with their own boxes, never split a broad line
    // box into guessed halves or rewrite the underlying observations.
    const words = (line.words ?? []).filter(valid).sort((a, b) => a.bbox.x0 - b.bbox.x0);
    for (let start = 0; start < words.length; start++) for (let count = 1; count <= 3 && start + count <= words.length; count++) {
      const group = words.slice(start, start + count);
      if (group.some((word, index) => index && (word.bbox.x0 - group[index - 1].bbox.x1 > Math.max(word.bbox.y1 - word.bbox.y0, group[index - 1].bbox.y1 - group[index - 1].bbox.y0) * 2 || Math.min(word.bbox.y1, group[index - 1].bbox.y1) <= Math.max(word.bbox.y0, group[index - 1].bbox.y0)))) continue;
      add(group.map(word => word.text).join(' '), { x0: Math.min(...group.map(word => word.bbox.x0)), y0: Math.min(...group.map(word => word.bbox.y0)), x1: Math.max(...group.map(word => word.bbox.x1)), y1: Math.max(...group.map(word => word.bbox.y1)) }, 'words');
    }
  }
  const anchors = [];
  for (const candidate of candidates.sort((a, b) => (a.match === 'exact' ? 0 : 1) - (b.match === 'exact' ? 0 : 1) || a.box.x0 - b.box.x0 || a.box.y0 - b.box.y0)) {
    const area = box => (box.x1 - box.x0) * (box.y1 - box.y0);
    const duplicate = anchors.some(anchor => {
      const overlap = Math.max(0, Math.min(anchor.box.x1, candidate.box.x1) - Math.max(anchor.box.x0, candidate.box.x0)) * Math.max(0, Math.min(anchor.box.y1, candidate.box.y1) - Math.max(anchor.box.y0, candidate.box.y0));
      return overlap / Math.min(area(anchor.box), area(candidate.box)) >= .7;
    });
    if (!duplicate) anchors.push(candidate);
  }
  anchors.sort((a, b) => a.box.x0 - b.box.x0 || a.box.y0 - b.box.y0);
  if (anchors.length > 4) return { version: PANEL_DETECTION_VERSION, panels: [], issues: ['tooManyHeadingAnchors'] };
  const panels = anchors.map((anchor, ordinal) => {
    // The recognized heading is left-aligned within the panel. Its text centre
    // is not the panel centre and would clip the numeric column to its right.
    const peers = anchors.filter(other => other !== anchor && Math.abs(other.box.y0 - anchor.box.y0) <= Math.max(anchor.box.y1 - anchor.box.y0, other.box.y1 - other.box.y0) * 2);
    const distances = peers.map(other => Math.abs(other.box.x0 - anchor.box.x0)).filter(distance => distance > (anchor.box.x1 - anchor.box.x0) / 2);
    const span = distances.length ? Math.min(...distances) : Math.max((anchor.box.x1 - anchor.box.x0) * 2.5, width * .2);
    const x = Math.max(0, Math.floor(anchor.box.x0 - 2)), right = Math.min(width, Math.ceil(anchor.box.x0 + span - 2));
    const y = Math.min(height - 1, Math.ceil(anchor.box.y1 + 1));
    // Action buttons can also share a sparse OCR line. Their individual word
    // boxes provide an observed lower boundary; missing boundaries remain
    // explicitly uncertain rather than guessing the final visible stat row.
    const observations = lines.flatMap(line => [line, ...(line.words ?? [])]);
    const terminators = observations.filter(line => valid(line) && /^(?:on[ -]?hold effect|potential|equip|dismantle|enhance)$/i.test(line.text.trim()) && line.bbox.y0 / scale > y && line.bbox.x0 / scale >= x && line.bbox.x0 / scale < right).map(line => line.bbox.y0 / scale);
    const bottom = terminators.length ? Math.min(...terminators) : height;
    return { id: `panel-${ordinal + 1}`, role: null, region: { x, y, width: Math.max(1, right - x), height: Math.max(1, Math.floor(bottom - y)) }, heading: structuredClone(anchor), requiresReview: true, issues: ['heuristicBounds', 'itemRoleUnassigned', 'visibleCompletenessUnconfirmed'] };
  });
  return { version: PANEL_DETECTION_VERSION, panels, issues: panels.length ? ['reviewPanelBoundsAndRoles'] : ['headingNotRecognized'] };
}
