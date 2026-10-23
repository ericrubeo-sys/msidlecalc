// Independent synthetic spatial/metric fixtures only. No player values/images.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { extractSpatialObservation, assembleColumnObservations } from '../public/domain/ocr-extraction.js';
import { createOcrSession, replaceOcrImage, beginOcrRun, acceptOcrRun, correctOcrLine } from '../public/domain/ocr-session.js';
import { scoreExtractionFixtures } from '../scripts/lib/extraction-metrics.mjs';
import { maskNeutralText, NEUTRAL_TEXT_MASK_VERSION } from '../public/domain/ocr-preprocessing.js';

const word = (text, x0, x1, y0 = 10, y1 = 20) => ({ text, confidence: 100, bbox: { x0, x1, y0, y1 } });
const line = (text, words) => ({ text, words });
const crop = { x: 0, y: 0, width: 200, height: 100 };
const columns = { label: [0, .5], value: [.5, .75], delta: [.75, 1] };
const extract = (lines, extra = {}) => extractSpatialObservation({ rawText: lines.map(l => l.text).join('\n'), blocks: [{ paragraphs: [{ lines }] }], crop, scale: 1, columns, ...extra });
const column = (lines, extra = {}) => extract(lines, { columns: null, ...extra });

test('QA extraction preserves raw/blank/repeated occurrences and never turns high confidence into confirmation', () => {
  const rawText = 'Unknown 43\r\n\r\nUnknown 43\n';
  const output = extract([line('Unknown 43', [word('Unknown', 0, 70), word('43', 110, 130)]), line('Unknown 43', [word('Unknown', 0, 70, 30, 40), word('43', 110, 130, 30, 40)])], { rawText });
  assert.equal(output.rawText, rawText); assert.deepEqual(output.rawLines, ['Unknown 43', '', 'Unknown 43', '']);
  assert.equal(output.rows.length, 2); assert.notEqual(output.rows[0].id, output.rows[1].id);
  for (const row of output.rows) { assert.equal(row.label, 'Unknown'); assert.equal(row.value, '43'); assert.equal(row.state, 'needsReview'); assert.equal(row.confirmedValue, null); assert.equal(row.statId, null); }
});

test('QA spatial lanes separate base and signed delta without adding, splitting or canonicalizing their text', () => {
  const output = extract([line('Odd effect 0043% +7%', [word('Odd effect', 0, 80), word('0043%', 105, 145), word('+7%', 155, 190)])]);
  assert.equal(output.rows[0].value, '0043%'); assert.equal(output.rows[0].delta, '+7%'); assert.equal(output.rows[0].unit, '%');
  assert.equal(output.rows[0].confirmedValue, null);
});

test('QA merged token crossing a reviewed lane boundary stays unassigned instead of splitting guessed digits', () => {
  const output = extract([line('Odd effect 4343', [word('Odd effect', 0, 80), word('4343', 140, 180)])]);
  assert.equal(output.rows[0].value, null); assert.equal(output.rows[0].delta, null);
  assert.ok(output.rows[0].issues.includes('unassignedOrBoundaryWord')); assert.ok(output.rows[0].issues.includes('missingValue'));
  assert.equal(output.unassignedWords[0].rawText, '4343'); assert.equal(output.rows[0].words[1].rawText, '4343');
});

test('QA absent columns/blocks preserve evidence without inventing values, and punctuation stays ambiguous', () => {
  const absent = extractSpatialObservation({ rawText: 'raw\n\n', blocks: null, crop, scale: 1 });
  assert.deepEqual(absent.rows, []); assert.deepEqual(absent.rawLines, ['raw', '', '']);
  const unreviewed = extract([line('Label 43', [word('Label', 0, 70), word('43', 110, 130)])], { columns: null });
  assert.equal(unreviewed.rows[0].value, null); assert.equal(unreviewed.unassignedWords.length, 2);
  assert.ok(unreviewed.rows[0].issues.includes('columnsNotReviewed'));
  for (const raw of ['4.321', '4,321', '43+7', '?', 'O']) {
    const row = extract([line(`Label ${raw}`, [word('Label', 0, 70), word(raw, 105, 145)])]).rows[0];
    assert.equal(row.value, raw); assert.equal(row.confirmedValue, null);
    assert.ok(row.issues.includes(/[.,]/.test(raw) ? 'punctuationNeedsReview' : 'unparsedValue'));
  }
});

test('QA crop/upscale coordinates map to original image and caller data stays detached', () => {
  const input = [line('raw', [word('raw', 60, 120, 30, 60)])];
  const inputCrop = { x: 100, y: 200, width: 200, height: 100 };
  const output = extract(input, { crop: inputCrop, scale: 3, columns: null });
  assert.deepEqual(output.rows[0].words[0].sourceBox, { x0: 120, y0: 210, x1: 140, y1: 220 });
  input[0].words[0].bbox.x0 = 999; inputCrop.x = 999;
  assert.equal(output.rows[0].words[0].bbox.x0, 60); assert.equal(output.provenance.crop.x, 100);
  assert.deepEqual(JSON.parse(JSON.stringify(output)), output);
});

test('QA invalid boxes, overlapping lanes and outside-crop coordinates fail explicitly', () => {
  for (const bbox of [{ x0: -1, x1: 5, y0: 0, y1: 10 }, { x0: 10, x1: 5, y0: 0, y1: 10 }, { x0: 0, x1: Infinity, y0: 0, y1: 10 }, { x0: 0, x1: 201, y0: 0, y1: 10 }]) {
    assert.throws(() => extract([line('raw', [{ text: 'raw', bbox }])]));
  }
  assert.throws(() => extract([], { columns: { label: [0, .7], value: [.6, 1] } }));
  assert.throws(() => extract([], { scale: 0 }));
  assert.throws(() => extract([line('raw', [word('raw', Number.MAX_VALUE / 2, Number.MAX_VALUE, 0, 10)])], { crop: { x: Number.MAX_VALUE, y: 0, width: Number.MAX_VALUE, height: 100 }, columns: null }));
});

test('QA column assembly uses source-space overlap while retaining engine order and unmatched evidence', () => {
  const labels = column([line('Repeated', [word('Repeated', 0, 60)]), line('Repeated', [word('Repeated', 0, 60, 40, 50)])]);
  const values = column([line('97', [word('97', 0, 20, 40, 50)]), line('43', [word('43', 0, 20)]), line('unmatched', [word('unmatched', 0, 40, 75, 85)])]);
  const output = assembleColumnObservations([{ lane: 'label', extraction: labels }, { lane: 'value', extraction: values }]);
  assert.deepEqual(output.rows.map(r => r.value), ['43', '97']);
  assert.equal(output.unassignedObservations.length, 1); assert.equal(output.unassignedObservations[0].row.rawText, 'unmatched');
  assert.equal(output.observations[1].extraction.rows[0].rawText, '97');
  assert.ok(output.rows.every(r => r.state === 'needsReview' && r.confirmedValue === null && r.statId === null));
});

test('QA ambiguous many-to-one and exactly-half overlap never silently associates a numeric value', () => {
  const labels = column([line('A', [word('A', 0, 20)]), line('B', [word('B', 0, 20, 25, 35)])]);
  const spanning = column([line('43', [word('43', 0, 20, 8, 32)])]);
  const output = assembleColumnObservations([{ lane: 'label', extraction: labels }, { lane: 'value', extraction: spanning }]);
  assert.ok(output.rows.every(r => r.value === null && r.issues.includes('valueAssociationAmbiguous'))); assert.equal(output.unassignedObservations.length, 1);
  const half = assembleColumnObservations([{ lane: 'label', extraction: column([line('A', [word('A', 0, 20)])]) }, { lane: 'value', extraction: column([line('43', [word('43', 0, 20, 15, 25)])]) }]);
  assert.equal(half.rows[0].value, null); assert.equal(half.unassignedObservations.length, 1);
});

test('QA missing label/value lanes never imply zero or discard standalone numeric observations', () => {
  const valueOnly = assembleColumnObservations([{ lane: 'value', extraction: column([line('0', [word('0', 0, 20)])]) }]);
  assert.deepEqual(valueOnly.rows, []); assert.equal(valueOnly.unassignedObservations[0].row.rawText, '0');
  const labelOnly = assembleColumnObservations([{ lane: 'label', extraction: column([line('Unknown', [word('Unknown', 0, 60)])]) }]);
  assert.equal(labelOnly.rows[0].value, null); assert.ok(labelOnly.rows[0].issues.includes('missingValue'));
});

test('QA identical text under changed segmentation invalidates old correction until reaffirmed', () => {
  const finish = (session, identity) => {
    const run = beginOcrRun(session);
    return acceptOcrRun(run.session, run.token, { panels: [{ id: 'current', rawText: 'Repeated O', segmentationIdentity: identity }] }).session;
  };
  let session = finish(replaceOcrImage(createOcrSession(), 'opaque'), 'crop-a');
  const id = session.panels[0].lines[0].id;
  session = correctOcrLine(session, id, 'Repeated 0');
  session = finish(session, 'crop-b');
  assert.equal(session.panels[0].lines[0].state, 'changedObservation'); assert.equal(session.panels[0].lines[0].effectiveText, 'Repeated 0');
  assert.equal(session.panels[0].lines[0].value, null); assert.equal(session.corrections[id].segmentationIdentity, 'crop-a');
  session = correctOcrLine(session, id, 'Repeated 0');
  session = finish(session, 'crop-b');
  assert.equal(session.panels[0].lines[0].state, 'userCorrected'); assert.equal(session.corrections[id].segmentationIdentity, 'crop-b');
});

test('QA scoring keeps failed fixtures in denominator and emits only counts without rematching or private tokens', () => {
  const row = (label, value, unit) => ({ label, value, unit });
  const fixture = { id: 'PRIVATE_SYNTHETIC_ID', split: 'heldOut', permission: { localEvaluation: true }, truth: [{ id: 'PRIVATE_SYNTHETIC_PANEL', rows: [row('A', '43', '%'), row('B', null, null)] }], observed: [] };
  const output = scoreExtractionFixtures([fixture]); const result = output.splits.heldOut;
  assert.equal(result.expectedRows, 2); assert.equal(result.omittedRows, 2); assert.equal(result.fields.label.denominator, 2); assert.equal(result.fields.value.denominator, 1);
  assert.equal(result.fields.value.missing, 1); assert.equal(result.fields.value.unreadableTruth, 1); assert.equal(output.splits.development.fixtures, 0);
  assert.equal(JSON.stringify(output).includes('PRIVATE_SYNTHETIC'), false);
  fixture.observed = [{ id: 'PRIVATE_SYNTHETIC_PANEL', rows: [row('B', '0', '%'), row('A', '43', '%')] }];
  const mixed = scoreExtractionFixtures([fixture]).splits.heldOut;
  assert.equal(mixed.fields.label.exact, 0); assert.equal(mixed.fields.value.wrong, 1); assert.equal(mixed.fields.value.proposalForUnreadable, 1);
});

test('QA metric CLI rejects an outside-private path without echoing file identity or input', () => {
  const cli = fileURLToPath(new URL('../scripts/score-extraction.mjs', import.meta.url));
  const output = spawnSync(process.execPath, [cli, 'docs/PRIVATE_SYNTHETIC_REJECTED.json'], { encoding: 'utf8' });
  assert.equal(output.status, 1); assert.equal(output.stdout, '');
  assert.equal(output.stderr.includes('PRIVATE_SYNTHETIC'), false);
  assert.match(output.stderr, /No input content was logged/);
});

test('QA optional mask has explicit inclusive thresholds and cannot infer whether colored text is base or delta', () => {
  const pixels = new Uint8ClampedArray([
    150, 150, 150, 128, // exact mean/alpha thresholds: retain
    174, 150, 126, 255, // exact mean150/chroma48: retain
    149, 149, 149, 255, // below brightness: remove
    175, 150, 126, 255, // chroma49: remove
    255, 255, 255, 127, // below alpha threshold: remove
    255, 0, 0, 255, // colored base OR delta: both remove identically
    255, 255, 255, 255, // neutral base OR delta: both retained identically
  ]);
  const result = maskNeutralText({ data: pixels, width: 7, height: 1 });
  assert.equal(result.retainedPixels, 3);
  assert.deepEqual([...result.data], [105,105,105,255,105,105,105,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,255]);
  assert.equal(result.version, NEUTRAL_TEXT_MASK_VERSION);
});

test('QA optional mask is deterministic for same original input, nonmutating and explicit about settings', () => {
  const pixels = new Uint8ClampedArray([200, 200, 200, 255, 20, 30, 40, 255]);
  const original = pixels.slice();
  const a = maskNeutralText({ data: pixels, width: 2, height: 1 });
  const b = maskNeutralText({ data: pixels, width: 2, height: 1 });
  assert.deepEqual(a, b); assert.deepEqual(pixels, original); assert.notEqual(a.data, pixels);
  assert.deepEqual(a.settings, { minMean: 150, maxChroma: 48, minAlpha: 128 });
  a.settings.minMean = 1;
  assert.equal(maskNeutralText({ data: pixels, width: 2, height: 1 }).settings.minMean, 150);
});

test('QA optional mask rejects malformed pixel buffers and oversized/fractional dimensions', () => {
  for (const input of [
    { data: new Uint8Array(4), width: 1, height: 1 },
    { data: new Uint8ClampedArray(3), width: 1, height: 1 },
    { data: new Uint8ClampedArray(4), width: 0, height: 1 },
    { data: new Uint8ClampedArray(4), width: 1.5, height: 1 },
    { data: new Uint8ClampedArray(0), width: 64000001, height: 1 },
  ]) assert.throws(() => maskNeutralText(input));
});
