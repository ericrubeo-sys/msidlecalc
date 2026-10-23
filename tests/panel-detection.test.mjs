import test from 'node:test';
import assert from 'node:assert/strict';
import { detectComparisonPanels } from '../public/domain/panel-detection.js';
const line = (text, x0, y0, x1, y1) => ({ text, bbox: { x0, y0, x1, y1 } });
const blocks = lines => [{ paragraphs: [{ lines }] }];
test('heading proposals map source geometry while roles always remain unassigned', () => {
  const input = blocks([line('On-Equip Effect', 100, 30, 180, 40), line('On-Equip Effect', 250, 30, 330, 40)]);
  const result = detectComparisonPanels({ blocks: input, width: 400, height: 200 });
  assert.equal(result.panels.length, 2);
  assert.ok(result.panels.every(panel => panel.role === null && panel.requiresReview));
  assert.ok(result.panels[0].region.x < result.panels[1].region.x);
  result.panels[0].heading.box.x0 = 0;
  assert.equal(input[0].paragraphs[0].lines[0].bbox.x0, 100);
});
test('missing/unreadable heading does not fabricate two fixed panels', () => {
  const result = detectComparisonPanels({ blocks: blocks([line('Unrecognized', 20, 20, 100, 30)]), width: 400, height: 200 });
  assert.equal(result.panels.length, 0);
  assert.deepEqual(result.issues, ['headingNotRecognized']);
});
test('left-aligned headings retain right-side numeric region instead of centring on heading text', () => {
  const result = detectComparisonPanels({ blocks: blocks([line('On-Equip Effect', 100, 20, 150, 30), line('On-Equip Effect', 250, 20, 300, 30)]), width: 450, height: 200 });
  assert.equal(result.panels[0].region.x, 98);
  assert.equal(result.panels[0].region.x + result.panels[0].region.width, 248);
  assert.equal(result.panels[1].region.x, 248);
  assert.equal(result.panels[1].region.x + result.panels[1].region.width, 398);
  assert.ok(result.panels.every(panel => panel.requiresReview && panel.role === null));
});
test('one heading stays one proposal, scale reverses, malformed geometry is rejected or ignored', () => {
  const result = detectComparisonPanels({ blocks: blocks([line('On Equip Effect', 40, 40, 160, 60)]), width: 200, height: 100, scale: 2 });
  assert.equal(result.panels.length, 1);
  assert.equal(result.panels[0].heading.box.x0, 20);
  assert.throws(() => detectComparisonPanels({ blocks: [], width: Infinity, height: 10 }));
  assert.equal(detectComparisonPanels({ blocks: blocks([line('On-Equip Effect', NaN, 0, 20, 10)]), width: 100, height: 100 }).panels.length, 0);
});
test('merged sparse line recovers two word-backed headings without dividing the line box', () => {
  const words = [line('On-Equip', 90, 30, 138, 40), line('Effect', 143, 30, 175, 40), line('On-Equip', 245, 30, 293, 40), line('Effect', 298, 30, 330, 40)];
  const merged = { ...line('On-Equip Effect On-Equip Effect', 90, 30, 330, 40), words };
  const result = detectComparisonPanels({ blocks: blocks([merged]), width: 450, height: 200 });
  assert.equal(result.panels.length, 2);
  assert.deepEqual(result.panels.map(panel => panel.heading.box.x0), [90, 245]);
  assert.ok(result.panels.every(panel => panel.heading.source === 'words' && panel.role === null));
  assert.equal(merged.text, 'On-Equip Effect On-Equip Effect');
});
test('line and word observations of the same heading deduplicate geometrically', () => {
  const heading = { ...line('On-Equip Effect', 40, 20, 120, 30), words: [line('On-Equip', 40, 20, 85, 30), line('Effect', 90, 20, 120, 30)] };
  assert.equal(detectComparisonPanels({ blocks: blocks([heading, structuredClone(heading)]), width: 400, height: 200 }).panels.length, 1);
});
test('incomplete, far-apart and vertically unrelated word fragments do not create headings', () => {
  const input = [
    { ...line('On-Equip Effect extra', 0, 0, 300, 50), words: [line('On-Equip', 0, 0, 40, 10), line('Effect', 120, 0, 150, 10)] },
    { ...line('On-Equip Effect extra', 0, 60, 100, 100), words: [line('On-Equip', 0, 60, 40, 70), line('Effect', 45, 80, 80, 90)] },
    line('Effect', 30, 110, 80, 120),
  ];
  assert.equal(detectComparisonPanels({ blocks: blocks(input), width: 400, height: 200 }).panels.length, 0);
});
test('merged action row contributes observed word boundary without assuming missing final stats', () => {
  const input = [line('On-Equip Effect', 100, 20, 180, 30), line('On-Equip Effect', 250, 20, 330, 30), { ...line('Dismantle Equip', 260, 160, 390, 175), words: [line('Dismantle', 260, 160, 315, 175), line('Equip', 345, 160, 390, 175)] }];
  const result = detectComparisonPanels({ blocks: blocks(input), width: 450, height: 220 });
  assert.equal(result.panels[1].region.y + result.panels[1].region.height, 160);
  assert.equal(result.panels[0].region.y + result.panels[0].region.height, 220);
});
test('vertically separate headings cannot determine each other horizontal panel width', () => {
  const input = [line('On-Equip Effect', 50, 20, 100, 30), line('On-Equip Effect', 70, 100, 120, 110)];
  const result = detectComparisonPanels({ blocks: blocks(input), width: 500, height: 220 });
  assert.ok(result.panels.every(panel => panel.region.width === 125));
});
