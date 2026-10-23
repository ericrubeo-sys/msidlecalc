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
