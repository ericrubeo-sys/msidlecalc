import test from 'node:test';
import assert from 'node:assert/strict';
import { createComparisonReader } from '../public/ocr-reader.js';
function fixture(outputs) {
  const calls = [], canvases = [];
  const worker = { setParameters: async parameters => calls.push(parameters), recognize: async () => ({ data: outputs.shift() }), terminate: async () => calls.push('terminated') };
  const reader = createComparisonReader({ loadTesseract: async () => ({ createWorker: async (...args) => { calls.push(args); return worker; } }), createCanvas: () => { const canvas = { width: 0, height: 0, getContext: () => ({ drawImage() {} }) }; canvases.push(canvas); return canvas; } });
  return { reader, calls, canvases, worker };
}
test('reviewed region OCR retains duplicates/blanks/unknown strings with no numeric confirmation', async () => {
  const f = fixture([{ text: 'whole', blocks: null }, { text: 'Mystery O\nMystery O\n', blocks: null, confidence: 99 }]);
  const result = await f.reader({ width: 100, height: 100 }, { inputRevision: 2, regions: [{ id: 'first', region: { x: 0, y: 0, width: 50, height: 50 } }] });
  assert.equal(result.raw.text, 'whole');
  assert.deepEqual(result.proposedPanels[0].lines.map(line => line.rawText), ['Mystery O', 'Mystery O', '']);
  assert.ok(result.proposedPanels[0].lines.every(line => line.value === null && !line.confirmed));
  assert.equal(result.proposedPanels[0].role, null);
  assert.ok(f.canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
  const options = f.calls[0][2];
  assert.equal(options.cacheMethod, 'none'); assert.equal(options.workerBlobURL, false);
  assert.ok(options.workerPath.endsWith('/vendor/worker.min.js'));
  assert.ok(f.calls.includes('terminated'));
});
test('missing anchors preserves full raw output without fake regions', async () => {
  const f = fixture([{ text: 'unknown\n', blocks: null }]);
  const result = await f.reader({ width: 100, height: 100 });
  assert.deepEqual(result.proposedPanels, []); assert.equal(result.raw.text, 'unknown\n');
});
test('stale and already canceled runs do not create worker or overwrite output', async () => {
  const f = fixture([]), controller = new AbortController(); controller.abort();
  await assert.rejects(f.reader({ width: 10, height: 10 }, { signal: controller.signal }), { name: 'AbortError' });
  await assert.rejects(f.reader({ width: 10, height: 10 }, { isCurrent: () => false }), { name: 'AbortError' });
  assert.equal(f.calls.length, 0);
});
test('resource errors are redacted and malformed regions reject before worker creation', async () => {
  const reader = createComparisonReader({ loadTesseract: async () => { throw new Error('PRIVATE CANARY'); } });
  await assert.rejects(reader({ width: 10, height: 10 }), error => !error.message.includes('CANARY') && error.cause === 'LOCAL_OCR_FAILED');
  const f = fixture([]);
  await assert.rejects(f.reader({ width: 10, height: 10 }, { regions: [{ id: 'first', region: { x: 0, y: 0, width: 20, height: 10 } }] }), TypeError);
  assert.equal(f.calls.length, 0);
});
