import test from 'node:test';
import assert from 'node:assert/strict';
import { createOcrSession, replaceOcrImage, beginOcrRun, acceptOcrRun, cancelOcrRun, correctOcrLine } from '../public/domain/ocr-session.js';
const image = () => replaceOcrImage(createOcrSession(), 'opaque-1');
function finish(state, rawText) {
  const run = beginOcrRun(state, { scale: 3 });
  return acceptOcrRun(run.session, run.token, { panels: [{ id: 'current', rawText, confidence: 90 }] }).session;
}
test('OCR preserves unknown duplicate/blank lines, exact raw text and order; never invents quantities', () => {
  const state = finish(image(), 'Attack O\r\nMystery ?\nAttack O\n');
  assert.deepEqual(state.panels[0].lines.map(line => line.rawText), ['Attack O', 'Mystery ?', 'Attack O', '']);
  assert.ok(state.panels[0].lines.every(line => line.value === null && line.statId === null && line.state === 'needsReview'));
  assert.equal(new Set(state.panels[0].lines.map(line => line.id)).size, 4);
});
test('replacement, cancellation, a newer run and completed tokens reject stale OCR', () => {
  const old = beginOcrRun(image());
  const output = { panels: [{ id: 'current', rawText: 'synthetic' }] };
  assert.equal(acceptOcrRun(replaceOcrImage(old.session, 'opaque-2'), old.token, output).accepted, false);
  assert.equal(acceptOcrRun(cancelOcrRun(old.session), old.token, output).accepted, false);
  const newer = beginOcrRun(old.session);
  assert.equal(acceptOcrRun(newer.session, old.token, output).accepted, false);
  const completed = acceptOcrRun(newer.session, newer.token, output);
  assert.equal(completed.accepted, true);
  assert.equal(acceptOcrRun(completed.session, newer.token, output).accepted, false);
});
test('corrections survive repeats and active-run edits; changed observations explicitly require review', () => {
  let state = finish(image(), 'Attack O\nAttack2');
  const id = state.panels[0].lines[0].id;
  const run = beginOcrRun(state);
  state = correctOcrLine(run.session, id, 'Attack 0');
  state = acceptOcrRun(state, run.token, { panels: [{ id: 'current', rawText: 'Attack O\nAttack2' }] }).session;
  assert.equal(state.panels[0].lines[0].effectiveText, 'Attack 0');
  assert.equal(state.panels[0].lines[0].state, 'userCorrected');
  state = finish(state, 'Other effect100\nAttack2');
  assert.equal(state.panels[0].lines[0].effectiveText, 'Attack 0');
  assert.equal(state.panels[0].lines[0].rawText, 'Other effect100');
  assert.equal(state.panels[0].lines[0].state, 'changedObservation');
  state = correctOcrLine(state, id, null);
  assert.equal(state.panels[0].lines[0].effectiveText, 'Other effect100');
});
test('disappeared corrections are retained without reassignment; image replacement clears private state', () => {
  let state = finish(image(), 'first\nsecond');
  const id = state.panels[0].lines[1].id;
  state = correctOcrLine(state, id, 'corrected');
  state = finish(state, 'first');
  assert.equal(state.corrections[id].text, 'corrected');
  assert.equal(state.panels[0].lines.length, 1);
  const cleared = replaceOcrImage(state, null);
  assert.deepEqual(cleared.panels, []);
  assert.deepEqual(cleared.corrections, {});
  assert.equal(cleared.metadata, null);
});
test('invalid panel identity/text, absent corrections and empty image fail explicitly; input remains immutable', () => {
  assert.throws(() => beginOcrRun(createOcrSession()));
  const run = beginOcrRun(image());
  for (const panels of [[{ id: 'current', rawText: 1 }], [{ id: 'x', rawText: '' }, { id: 'x', rawText: '' }]]) assert.throws(() => acceptOcrRun(run.session, run.token, { panels }));
  const before = finish(image(), 'raw');
  const after = correctOcrLine(before, before.panels[0].lines[0].id, 'new');
  assert.equal(before.panels[0].lines[0].effectiveText, 'raw');
  assert.equal(after.panels[0].lines[0].effectiveText, 'new');
  assert.throws(() => correctOcrLine(before, 'absent', 'new'));
});
test('accepted output retains authoritative run settings and optional crop/box provenance without mutation', () => {
  const settings = { scale: 3, cropMode: 'synthetic' };
  const run = beginOcrRun(image(), settings);
  settings.scale = 10;
  const crop = { x: 1, y: 2, width: 3, height: 4 };
  const state = acceptOcrRun(run.session, run.token, { panels: [{ id: 'current', rawText: 'unknown', crop, boxes: [{ x: 1 }] }], metadata: { runSettings: { scale: 99 } } }).session;
  crop.x = 9;
  assert.equal(state.metadata.runSettings.scale, 3);
  assert.equal(state.panels[0].observationMetadata.crop.x, 1);
  assert.equal(state.panels[0].observationMetadata.boxes[0].x, 1);
});
