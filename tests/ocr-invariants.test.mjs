// Invented raw-text/session fixtures only. No player images or OCR accuracy claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createOcrSession, replaceOcrImage, beginOcrRun, acceptOcrRun, cancelOcrRun, correctOcrLine } from '../public/domain/ocr-session.js';

const selected = () => replaceOcrImage(createOcrSession(), 'opaque-evaluation-image');
function ingest(session, panels, metadata = null) {
  const run = beginOcrRun(session, { engineVersion: 'synthetic-1', preprocessing: 'none' });
  const result = acceptOcrRun(run.session, run.token, { panels, metadata });
  assert.equal(result.accepted, true);
  return result.session;
}

test('QA OCR raw text preserves Unicode, repeated/blank/unequal lines and never supplies numerical certainty', () => {
  const session = ingest(selected(), [
    { id: 'current', rawText: 'Attack O\r\n未知 ?\rAttack O\n\n' },
    { id: 'candidate', rawText: 'Attack 0' },
  ]);
  assert.equal(session.panels[0].rawText, 'Attack O\r\n未知 ?\rAttack O\n\n');
  assert.deepEqual(session.panels[0].lines.map(l => l.rawText), ['Attack O', '未知 ?', 'Attack O', '', '']);
  assert.equal(session.panels[1].lines.length, 1);
  const lines = session.panels.flatMap(p => p.lines);
  assert.equal(new Set(lines.map(l => l.id)).size, 6);
  for (const line of lines) {
    assert.equal(line.statId, null); assert.equal(line.value, null); assert.equal(line.state, 'needsReview');
    assert.equal(line.provenance.kind, 'ocr'); assert.equal(line.provenance.imageRevision, session.imageRevision);
  }
});

test('QA OCR same-ID replacement, removal and completed or canceled runs reject stale output without mutation', () => {
  const run = beginOcrRun(selected());
  const output = { panels: [{ id: 'current', rawText: 'raw' }] };
  for (const session of [replaceOcrImage(run.session, 'opaque-evaluation-image'), replaceOcrImage(run.session, null), cancelOcrRun(run.session)]) {
    const before = structuredClone(session);
    const stale = acceptOcrRun(session, run.token, output);
    assert.equal(stale.accepted, false); assert.deepEqual(stale.session, before); assert.deepEqual(session, before);
  }
  const accepted = acceptOcrRun(run.session, run.token, output).session;
  assert.equal(acceptOcrRun(accepted, run.token, output).accepted, false);
  const next = beginOcrRun(accepted);
  assert.notEqual(next.token.run, run.token.run);
  assert.equal(acceptOcrRun(next.session, run.token, output).accepted, false);
});

test('QA OCR latest-run-wins even when older request finishes after the new request', () => {
  const first = beginOcrRun(selected());
  const second = beginOcrRun(first.session);
  const accepted = acceptOcrRun(second.session, second.token, { panels: [{ id: 'current', rawText: 'new output' }] }).session;
  const old = acceptOcrRun(accepted, first.token, { panels: [{ id: 'current', rawText: 'stale output' }] });
  assert.equal(old.accepted, false); assert.equal(old.session.panels[0].rawText, 'new output');
});

test('QA OCR active-run corrections and repeated processing retain original and corrected text', () => {
  const initial = ingest(selected(), [{ id: 'current', rawText: 'Attack O' }]);
  const id = initial.panels[0].lines[0].id;
  const run = beginOcrRun(initial);
  const corrected = correctOcrLine(run.session, id, 'Attack 0');
  const accepted = acceptOcrRun(corrected, run.token, { panels: [{ id: 'current', rawText: 'Attack O' }] }).session;
  assert.equal(accepted.panels[0].lines[0].rawText, 'Attack O');
  assert.equal(accepted.panels[0].lines[0].effectiveText, 'Attack 0');
  assert.equal(accepted.panels[0].lines[0].value, null);
  assert.equal(accepted.panels[0].lines[0].state, 'userCorrected');
  assert.equal(initial.panels[0].lines[0].effectiveText, 'Attack O');
  assert.equal(initial.panels[0].lines[0].correction, null);
});

test('QA OCR reordered or inserted lines cannot silently confirm an old correction for a new observation', () => {
  let session = ingest(selected(), [{ id: 'current', rawText: 'Attack O\nUnknown proc ?' }]);
  const oldId = session.panels[0].lines[0].id;
  session = correctOcrLine(session, oldId, 'Attack 0');
  session = ingest(session, [{ id: 'current', rawText: 'Unknown proc ?\nAttack O' }]);
  assert.equal(session.panels[0].lines[0].id, oldId);
  assert.equal(session.panels[0].lines[0].state, 'changedObservation');
  assert.equal(session.panels[0].lines[0].rawText, 'Unknown proc ?');
  assert.equal(session.panels[0].lines[0].correction.text, 'Attack 0');
  assert.equal(session.panels[0].lines[0].value, null);
  assert.equal(session.panels[0].lines[1].correction, null);
  assert.equal(session.panels[0].lines[1].state, 'needsReview');
});

test('QA OCR missing lines and panels retain correction provenance without label-based reassignment', () => {
  let session = ingest(selected(), [{ id: 'current', rawText: 'Attack O\nAttack O' }, { id: 'candidate', rawText: 'Attack O' }]);
  const id = session.panels[0].lines[1].id;
  session = correctOcrLine(session, id, 'Attack 123');
  session = ingest(session, [{ id: 'candidate', rawText: 'Attack O' }]);
  assert.equal(session.corrections[id].text, 'Attack 123');
  assert.equal(session.panels[0].lines[0].correction, null);
  session = ingest(session, [{ id: 'current', rawText: 'Attack O' }]);
  assert.equal(session.panels[0].lines[0].correction, null);
});

test('QA OCR clearing correction restores latest observation and does not convert unreadable to zero', () => {
  let session = ingest(selected(), [{ id: 'current', rawText: 'Accuracy ?' }]);
  const id = session.panels[0].lines[0].id;
  session = correctOcrLine(session, id, 'Accuracy 0');
  session = ingest(session, [{ id: 'current', rawText: 'Accuracy unreadable' }]);
  session = correctOcrLine(session, id, null);
  assert.equal(session.panels[0].lines[0].effectiveText, 'Accuracy unreadable');
  assert.equal(session.panels[0].lines[0].state, 'needsReview');
  assert.equal(session.panels[0].lines[0].value, null);
  assert.equal(session.corrections[id], undefined);
});

test('QA OCR settings/output metadata are detached and session transitions preserve serializable revisions', () => {
  const settings = { engine: { version: 'synthetic-1' }, crop: { x: 1, y: 2 } };
  const initial = selected(); const snapshot = structuredClone(initial);
  const run = beginOcrRun(initial, settings);
  settings.engine.version = 'mutated';
  assert.equal(run.session.activeRun.settings.engine.version, 'synthetic-1');
  const metadata = { engine: { version: 'synthetic-1' }, crop: { x: 1, y: 2 } };
  const output = { panels: [{ id: 'current', rawText: 'raw', confidence: 99 }], metadata };
  const session = acceptOcrRun(run.session, run.token, output).session;
  metadata.crop.x = 999;
  assert.equal(session.metadata.crop.x, 1); assert.equal(session.panels[0].rawText, 'raw');
  assert.deepEqual(initial, snapshot);
  assert.deepEqual(JSON.parse(JSON.stringify(session)), session);
  assert.ok(session.revision > initial.revision); assert.equal(session.activeRun, null);
  assert.equal(session.panels[0].lines[0].state, 'needsReview');
});

test('QA OCR image removal resets observations/corrections/metadata and malformed inputs fail explicitly', () => {
  let session = ingest(selected(), [{ id: 'current', rawText: 'raw' }], { privateSyntheticData: true });
  session = correctOcrLine(session, session.panels[0].lines[0].id, 'corrected');
  const reset = replaceOcrImage(session, null);
  assert.deepEqual(reset.panels, []); assert.deepEqual(reset.corrections, {}); assert.equal(reset.metadata, null); assert.equal(reset.activeRun, null);
  assert.throws(() => beginOcrRun(reset));
  assert.throws(() => correctOcrLine(session, 'not-present', 'new'));
  assert.throws(() => correctOcrLine(session, session.panels[0].lines[0].id, 0));
  const run = beginOcrRun(selected());
  for (const panels of [null, [{ id: 'bad:id', rawText: 'raw' }], [{ id: 'current', rawText: null }], [{ id: 'current', rawText: '' }, { id: 'current', rawText: '' }]]) {
    assert.throws(() => acceptOcrRun(run.session, run.token, { panels }));
  }
});

test('QA OCR authoritative accepted-run settings and supplied observation geometry survive without caller mutation', () => {
  const settings = { engine: { version: 'synthetic-version' }, cropAlgorithm: 'explicit-normalized-1' };
  const run = beginOcrRun(selected(), settings);
  const panel = { id: 'current', rawText: 'raw', crop: { x: 1, y: 2, width: 30, height: 40 }, boxes: [{ x: 2, text: 'raw' }], provenance: { adapter: 'synthetic' } };
  const output = { panels: [panel], metadata: { runSettings: { engine: 'wrong-output-version' } } };
  const session = acceptOcrRun(run.session, run.token, output).session;
  panel.crop.x = 999; panel.boxes[0].text = 'changed'; settings.engine.version = 'changed';
  assert.deepEqual(session.metadata.runSettings, { engine: { version: 'synthetic-version' }, cropAlgorithm: 'explicit-normalized-1' });
  assert.equal(session.panels[0].observationMetadata.crop.x, 1);
  assert.equal(session.panels[0].observationMetadata.boxes[0].text, 'raw');
  assert.equal(session.panels[0].observationMetadata.provenance.adapter, 'synthetic');
});

test('QA OCR audit bootstrap exposes counts without console arguments, storage keys, database or cache names', async () => {
  const source = await readFile(new URL('../scripts/serve-ocr-evaluation.mjs', import.meta.url), 'utf8');
  const start = source.indexOf('function browserAudit()');
  const end = source.indexOf('async function browserHarness()', start);
  assert.ok(start >= 0 && end > start);
  // Execute the actual audit bootstrap in an isolated fake environment, never a
  // browser. Private-looking tokens are invented canaries for leakage checks.
  class Storage {
    constructor() { this.values = new Map(); }
    setItem(key, value) { this.values.set(key, value); }
    removeItem(key) { this.values.delete(key); }
    clear() { this.values.clear(); }
    get length() { return this.values.size; }
  }
  class IDBFactory {
    open() { return {}; }
    deleteDatabase() { return {}; }
    async databases() { return [{ name: 'synthetic-private-database' }]; }
  }
  const forwarded = [];
  const events = {};
  const sandbox = {
    Storage, IDBFactory, localStorage: new Storage(), sessionStorage: new Storage(), indexedDB: new IDBFactory(),
    caches: { keys: async () => ['synthetic-private-cache'] },
    console: Object.fromEntries(['log', 'warn', 'error', 'info', 'debug'].map(method => [method, (...args) => forwarded.push(args)])),
    window: { addEventListener: (name, callback) => { events[name] = callback; } },
  };
  vm.runInNewContext(`${source.slice(start, end)} browserAudit();`, sandbox);
  sandbox.localStorage.setItem('synthetic-private-key', 'synthetic-private-value');
  sandbox.indexedDB.open('synthetic-private-database');
  sandbox.console.log('synthetic-private-console-body');
  sandbox.console.error({ rawText: 'synthetic-private-error-body' });
  events.error({ message: 'synthetic-private-window-error' });
  const snapshot = await sandbox.window.ocrEvaluationAudit.snapshot();
  assert.equal(snapshot.counters.storageSet, 1); assert.equal(snapshot.counters.indexedDbOpen, 1);
  assert.equal(snapshot.counters.consoleLog, 1); assert.equal(snapshot.counters.consoleError, 1); assert.equal(snapshot.counters.pageErrors, 1);
  assert.equal(snapshot.indexedDbDatabaseCount, 1); assert.equal(snapshot.cacheStorageCacheCount, 1);
  assert.equal(forwarded.length, 0);
  assert.equal(JSON.stringify(snapshot).includes('synthetic-private'), false);
});
