// Independent invented screenshot text/boxes only. No private fixture data,
// recognition-accuracy estimate or game-validation claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import { proposeLineFields, importScreenshotProposals, editScreenshotRecord, confirmScreenshotRecord, recordsForImage } from '../public/domain/screenshot-review.js';
import { parseItemLines, createItemLine, compareItemLines } from '../public/domain/item-lines.js';
import { detectComparisonPanels } from '../public/domain/panel-detection.js';
import { createComparisonReader } from '../public/ocr-reader.js';

const proposal = (id, texts) => ({ id, region: { x: 2, y: 3, width: 100, height: 80 }, lines: texts.map((rawText, i) => ({ id: `source-${i}`, rawText, provenance: { confidence: 100, bbox: { x0: 0, y0: i * 10, x1: 20, y1: i * 10 + 8 } } })) });
const panelA = proposal('a', ['Final Damage 43%', 'Unknown proc ?', 'Final Damage 43%', '']);
const panelB = proposal('b', ['Final Damage 57%']);
const importInput = (extra = {}) => ({ proposedPanels: structuredClone([panelA, panelB]), assignment: { current: 'b', candidate: 'a' }, assignmentConfirmed: true, imageRevision: 1, runId: 1, ...extra });

test('QA screenshot import requires explicit distinct panel assignment and never infers equipped role from order', () => {
  for (const extra of [{ assignmentConfirmed: false }, { assignment: { current: 'a', candidate: 'a' } }, { assignment: { current: 'a', candidate: 'missing' } }, { proposedPanels: [panelA, panelA] }, { imageRevision: 0 }, { runId: 0 }]) assert.throws(() => importScreenshotProposals(importInput(extra)));
  const imported = importScreenshotProposals(importInput());
  assert.equal(imported.current[0].rawText, 'Final Damage 57%');
  assert.equal(imported.current[0].provenance.panelId, 'b');
  assert.equal(imported.candidate.length, 4);
});

test('QA imported raw evidence, unequal/repeated/blank lines and unknowns survive without numeric confirmation', () => {
  const input = importInput(); const before = structuredClone(input);
  const imported = importScreenshotProposals(input);
  const lines = parseItemLines(imported.candidate);
  assert.deepEqual(lines.map(line => line.rawText), before.proposedPanels[0].lines.map(line => line.rawText));
  assert.equal(new Set(lines.map(line => line.id)).size, 4);
  assert.equal(lines[1].statId, null); assert.equal(lines[3].value, null);
  assert.ok(lines.every(line => line.effectiveValue === null));
  assert.deepEqual(input, before);
  input.proposedPanels[0].lines[0].provenance.bbox.x0 = 999;
  assert.equal(imported.candidate[0].provenance.observation.bbox.x0, 0);
});

test('QA line proposals retain separators and comparison text; merged tokens and lookalikes are not repaired', () => {
  const separated = proposeLineFields('  Unknown stat 1,234% +7%  ');
  assert.equal(separated.rawValue, '1,234%'); assert.equal(separated.comparisonText, '+7%'); assert.ok(separated.issues.includes('separatorNeedsReview'));
  for (const text of ['Unknown stat 43+7', 'Attack O', 'Attack 1e3', 'Attack ?']) {
    const result = proposeLineFields(text);
    assert.equal(result.rawValue, ''); assert.equal(result.rawLabel, text); assert.equal(result.unit, 'unknown');
  }
});

test('QA correction overlays retain originals, commit without confirmation, and typed validation rejects confirmed malformed text', () => {
  const original = importScreenshotProposals(importInput()).current[0];
  let edited = editScreenshotRecord(original, 'rawValue', '1,234%');
  assert.equal(edited.confirmed, false); assert.equal(createItemLine(edited).effectiveValue, null);
  edited = confirmScreenshotRecord(edited, { confirmed: true, imageRevision: 1 });
  const parsed = createItemLine(edited);
  assert.equal(parsed.effectiveValue, null); assert.equal(parsed.state, 'invalid');
  assert.equal(parsed.observation.rawValue, '57%'); assert.equal(parsed.rawText, 'Final Damage 57%');
  const fixed = editScreenshotRecord(edited, 'rawValue', '12%');
  assert.equal(fixed.correction.confirmed, false); assert.equal(fixed.reviewedImageRevision, null);
  assert.equal(createItemLine(fixed).effectiveValue, null); assert.equal(original.correction, null);
});

test('QA confirmed blank remains unknown and only explicit reviewed zero can become a zero quantity', () => {
  const source = importScreenshotProposals(importInput()).current[0];
  const unknown = confirmScreenshotRecord(editScreenshotRecord(source, 'rawValue', ''), { confirmed: true, imageRevision: 1 });
  assert.equal(createItemLine(unknown).effectiveValue, null); assert.equal(createItemLine(unknown).state, 'missing');
  const explicitZero = confirmScreenshotRecord(editScreenshotRecord(source, 'rawValue', '0%'), { confirmed: true, imageRevision: 1 });
  assert.deepEqual(createItemLine(explicitZero).effectiveValue, { decimal: '0', unit: 'displayPercent' });
});

test('QA new image invalidates both OCR confirmation flags while preserving correction text and unrelated manual entries', () => {
  const source = importScreenshotProposals(importInput()).current[0];
  const confirmed = confirmScreenshotRecord(editScreenshotRecord(source, 'rawValue', '12%'), { confirmed: true, imageRevision: 1 });
  assert.equal(createItemLine(confirmed).value, 12);
  const manual = { id: 'manual', rawLabel: 'Attack', rawValue: '43', unit: 'statPoint', confirmed: true, provenance: { kind: 'manual' } };
  const next = recordsForImage([confirmed, manual], 2);
  assert.equal(next[0].confirmed, false); assert.equal(next[0].correction.confirmed, false); assert.equal(next[0].correction.rawValue, '12%');
  assert.equal(createItemLine(next[0]).effectiveValue, null); assert.equal(createItemLine(next[1]).value, 43);
  assert.equal(confirmed.confirmed, true); assert.equal(confirmed.correction.confirmed, true);
});

test('QA reimport uses new observation IDs without mutating edited records or reassociating by repeated label', () => {
  const old = importScreenshotProposals(importInput());
  old.current[0] = editScreenshotRecord(old.current[0], 'rawValue', '12%');
  const next = importScreenshotProposals(importInput({ runId: 2 }));
  assert.notEqual(next.current[0].id, old.current[0].id); assert.equal(next.current[0].correction, null); assert.equal(next.current[0].confirmed, false);
  assert.equal(old.current[0].correction.rawValue, '12%');
});

test('QA confirming every valid OCR line still cannot create an equipment recommendation', () => {
  const items = importScreenshotProposals(importInput({ proposedPanels: [proposal('a', ['Final Damage 43%']), proposal('b', ['Final Damage 57%'])] }));
  for (const side of ['current', 'candidate']) items[side] = items[side].map(record => confirmScreenshotRecord(record, { confirmed: true, imageRevision: 1 }));
  const result = compareItemLines(parseItemLines(items.current), parseItemLines(items.candidate));
  assert.equal(result.damage.winner, null); assert.equal(result.damage.percentChange, null); assert.equal(result.damage.status, 'unavailable');
});

const heading = (x, text = 'On Equip Effect') => ({ text, bbox: { x0: x, y0: 20, x1: x + 60, y1: 30 } });
const blocks = lines => [{ paragraphs: [{ lines }] }];

test('QA heading detection proposes bounds only; roles and completeness stay explicitly unconfirmed', () => {
  const output = detectComparisonPanels({ blocks: blocks([heading(50), heading(220)]), width: 400, height: 200 });
  assert.equal(output.panels.length, 2);
  for (const panel of output.panels) {
    assert.equal(panel.role, null); assert.equal(panel.requiresReview, true); assert.ok(panel.issues.includes('visibleCompletenessUnconfirmed'));
    assert.ok(panel.region.x >= 0 && panel.region.y >= 0 && panel.region.x + panel.region.width <= 400 && panel.region.y + panel.region.height <= 200);
  }
});

test('QA missing/ambiguous heading geometry never duplicates one recognized item or fabricates a second panel', () => {
  assert.equal(detectComparisonPanels({ blocks: null, width: 400, height: 200 }).panels.length, 0);
  assert.equal(detectComparisonPanels({ blocks: blocks([heading(50)]), width: 400, height: 200 }).panels.length, 1);
  const tooMany = detectComparisonPanels({ blocks: blocks([10,80,150,220,290].map(x => heading(x))), width: 400, height: 200 });
  assert.equal(tooMany.panels.length, 0); assert.ok(tooMany.issues.includes('tooManyHeadingAnchors'));
  assert.throws(() => detectComparisonPanels({ blocks: null, width: NaN, height: 200 }));
});

test('QA one-character heading proposal remains approximate and never repairs raw stat text or assigns item roles', () => {
  const lines = [heading(50, 'On-Equip Effect'), heading(220, 'On Equlp Effect')];
  const original = structuredClone(lines);
  const output = detectComparisonPanels({ blocks: blocks(lines), width: 400, height: 200 });
  assert.equal(output.panels.length, 2);
  assert.deepEqual(output.panels.map(panel => panel.heading.match), ['exact', 'approximate']);
  assert.deepEqual(output.panels.map(panel => panel.heading.text), original.map(line => line.text));
  assert.ok(output.panels.every(panel => panel.role === null && panel.requiresReview));
  assert.deepEqual(lines, original);
  assert.equal(detectComparisonPanels({ blocks: blocks([heading(50, 'Unrelated property heading')]), width: 400, height: 200 }).panels.length, 0);
  const stat = proposeLineFields('Attack O');
  assert.equal(stat.rawLabel, 'Attack O'); assert.equal(stat.rawValue, '');
  assert.ok(stat.issues.includes('unparsedObservation'));
});

const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const tick = () => new Promise(resolve => setImmediate(resolve));
function readerFixture({ createWorker, recognize } = {}) {
  const canvases = [], calls = { created: 0, terminated: 0, recognized: 0, workerOptions: null };
  const worker = { setParameters: async () => {}, recognize: async (...args) => { calls.recognized++; return recognize ? recognize(...args) : { data: { text: 'whole raw\n', blocks: null } }; }, terminate: async () => { calls.terminated++; } };
  const reader = createComparisonReader({ loadTesseract: async () => ({ createWorker: (...args) => { calls.created++; calls.workerOptions = args[2]; return createWorker ? createWorker(worker) : Promise.resolve(worker); } }), createCanvas: () => { const canvas = { width: 0, height: 0, getContext: () => ({ drawImage() {} }) }; canvases.push(canvas); return canvas; } });
  return { reader, calls, worker, canvases };
}

test('QA pending recognition cancellation rejects without output and disposes worker/canvases', async () => {
  const pending = deferred(), f = readerFixture({ recognize: () => pending.promise });
  const controller = new AbortController();
  const result = f.reader({ width: 20, height: 20 }, { signal: controller.signal });
  await tick(); assert.equal(f.calls.recognized, 1);
  controller.abort(); await assert.rejects(result, { name: 'AbortError' });
  assert.ok(f.calls.terminated >= 1); assert.ok(f.canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
  pending.resolve({ data: { text: 'late raw', blocks: null } }); await tick();
  assert.equal(f.calls.recognized, 1);
});

test('QA worker finishing creation after cancellation is disposed and never reads screenshot pixels', async () => {
  const creating = deferred(), f = readerFixture({ createWorker: () => creating.promise });
  const controller = new AbortController();
  const result = f.reader({ width: 20, height: 20 }, { signal: controller.signal });
  await tick(); assert.equal(f.calls.created, 1);
  controller.abort(); await assert.rejects(result, { name: 'AbortError' });
  assert.equal(f.calls.recognized, 0); assert.equal(f.canvases.length, 0);
  creating.resolve(f.worker); await tick();
  assert.ok(f.calls.terminated >= 1); assert.equal(f.calls.recognized, 0);
});

test('QA stale image revision after an awaited OCR operation cannot return proposals', async () => {
  const pending = deferred(), f = readerFixture({ recognize: () => pending.promise });
  let active = true;
  const result = f.reader({ width: 20, height: 20 }, { inputRevision: 1, isCurrent: () => active });
  await tick(); active = false;
  pending.resolve({ data: { text: 'superseded raw', blocks: null } });
  await assert.rejects(result, { name: 'AbortError' });
  assert.ok(f.calls.terminated >= 1); assert.ok(f.canvases.every(canvas => canvas.width === 0));
});

test('QA reader errors redact dependency contents and fixed local resources carry no player-derived path', async () => {
  const f = readerFixture({ recognize: async () => { throw new Error('SYNTHETIC_PRIVATE_CONTENT'); } });
  await assert.rejects(f.reader({ width: 20, height: 20 }), error => error.cause === 'LOCAL_OCR_FAILED' && !error.message.includes('SYNTHETIC_PRIVATE_CONTENT'));
  assert.ok(f.calls.terminated >= 1);
  for (const key of ['workerPath', 'corePath', 'langPath']) {
    const url = new URL(f.calls.workerOptions[key]); assert.ok(url.pathname.startsWith('/vendor/')); assert.equal(url.search, '');
    assert.equal(url.href.includes('SYNTHETIC_PRIVATE_CONTENT'), false);
  }
  assert.equal(f.calls.workerOptions.cacheMethod, 'none'); assert.equal(f.calls.workerOptions.workerBlobURL, false);
});
