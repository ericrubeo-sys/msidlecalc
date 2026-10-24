import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalPanelHypotheses, assessLocalPanelRecovery } from '../public/domain/local-panel-recovery.js';
import { proposePanelRows } from '../public/domain/ocr-item-rows.js';

// Invented local word observations only. These verify routing constraints,
// not raster OCR accuracy, true stat completeness, or damage calculations.
const geometry = { width: 1280, height: 590 };
const word = (text, x, y, width = 60) => ({ text, bbox: { x0: x, y0: y, x1: x + width, y1: y + 10 } });
const line = (...words) => ({ text: words.map(word => word.text).join(' '), words });
function panel(proposal, labels = ['Attack', 'Max HP', 'Evasion']) {
  const structuredLines = [line(word('On-Equip', 10, 10, 60), word('Effect', 75, 10, 40)), ...labels.map((label, index) => line(word(label, 10, 35 + 22 * index, 110), word(String(100 + index), 220, 35 + 22 * index, 30)))];
  const rawText = structuredLines.map(line => line.text).join('\n');
  return { ...proposal, rawText, structuredLines, coverageIssues: [], lines: rawText.split('\n').map(rawText => ({ rawText, confirmed: false })) };
}
const input = () => ({ ...geometry, panels: createLocalPanelHypotheses(geometry).map(proposal => panel(proposal)) });

test('hypotheses are bounded adjacent starting areas and are never accepted evidence', () => {
  const hypotheses = createLocalPanelHypotheses(geometry);
  assert.deepEqual(hypotheses.map(panel => panel.region), [{ x: 307, y: 236, width: 294, height: 236 }, { x: 601, y: 236, width: 294, height: 236 }]);
  assert.ok(hypotheses.every(panel => panel.role === null && panel.requiresReview));
  assert.equal(assessLocalPanelRecovery({ ...geometry, panels: hypotheses }).eligible, false);
  for (const dimensions of [{ width: 600, height: 280 }, { width: 1280, height: 1280 }, { width: 2560, height: 590 }, { width: Infinity, height: 590 }, { width: 1280.1, height: 590 }]) assert.deepEqual(createLocalPanelHypotheses(dimensions), []);
});

test('two independent local headings and distinct spatial rows permit item review only', () => {
  const source = input(), before = structuredClone(source);
  const result = assessLocalPanelRecovery(source);
  assert.equal(result.eligible, true);
  assert.ok(result.panelEvidence.every(panel => panel.routingOnly && !panel.valuesConfirmed && !panel.visibleCompletenessConfirmed));
  assert.deepEqual(source, before);
  assert.ok(source.panels.every(panel => panel.lines.every(line => !line.confirmed)));
});

test('blank, random, one-panel and heading-only evidence cannot accept the fixed boxes', () => {
  const source = input();
  assert.equal(assessLocalPanelRecovery({ ...source, panels: source.panels.slice(0, 1) }).eligible, false);
  for (const text of ['', 'random words 123', 'On-Equip Effect']) {
    source.panels[1] = panel(source.panels[1], []);
    source.panels[1].rawText = text;
    source.panels[1].lines = [{ rawText: text }];
    source.panels[1].structuredLines = [line(word(text, 10, 10))];
    assert.equal(assessLocalPanelRecovery(source).eligible, false);
  }
});

test('repeated labels alone do not supply three distinct localization anchors', () => {
  const source = input();
  source.panels[1] = panel(source.panels[1], ['Attack', 'Attack', 'Attack', 'Attack']);
  assert.equal(assessLocalPanelRecovery(source).eligible, false);
});

test('exact heading, heading position and intact word geometry are required', () => {
  for (const mutate of [
    panel => { panel.structuredLines[0].words[0].text = 'On-Eguip'; },
    panel => { panel.structuredLines[0].words.forEach(word => { word.bbox.y0 += 100; word.bbox.y1 += 100; }); },
    panel => { panel.structuredLines[1].words[0].bbox.x0 = NaN; },
    panel => { panel.structuredLines[1].words = []; },
    panel => { panel.structuredLines[1].words[1].bbox.x1 = 9999; },
    panel => { panel.rawText += '\nMissing observation'; },
  ]) {
    const source = input(); mutate(source.panels[1]);
    assert.equal(assessLocalPanelRecovery(source).eligible, false);
  }
});

test('contradictory, overlapping, unbounded or warning-bearing crops abstain', () => {
  for (const mutate of [
    panels => { panels[1].region.x = panels[0].region.x; },
    panels => { panels[1].region.y += 100; },
    panels => { panels[1].region.width = 2000; },
    panels => { panels[1].id = panels[0].id; },
    panels => { panels[1].coverageIssues = [{ code: 'possibleClippedLabels' }]; },
    panels => { delete panels[1].coverageIssues; },
  ]) {
    const source = input(); mutate(source.panels);
    assert.equal(assessLocalPanelRecovery(source).eligible, false);
  }
});

test('unknown offensive effects, repeated stats and unequal sets survive eligibility unchanged', () => {
  const source = input();
  source.panels[1] = panel(source.panels[1], ['Attack', 'Max HP', 'Evasion', 'Unknown Offensive Trigger', 'Attack']);
  const before = structuredClone(source);
  assert.equal(assessLocalPanelRecovery(source).eligible, true);
  assert.deepEqual(source, before);
  const rows = proposePanelRows(source.panels[1]).rows;
  assert.equal(rows.length, 5);
  assert.equal(rows[3].proposedFields.rawLabel, 'Unknown Offensive Trigger');
  assert.equal(rows[3].proposedFields.rawValue, '103');
  assert.equal(rows[4].proposedFields.rawLabel, 'Attack');
});

test('literal invalid numerical bases or missing right-column geometry do not qualify', () => {
  for (const value of ['O', '1e3', '1,23', '-50', 'Infinity', '9999999999999999999999']) {
    const source = input();
    const lineToChange = source.panels[1].structuredLines[1];
    lineToChange.words[1].text = value;
    lineToChange.text = lineToChange.words.map(word => word.text).join(' ');
    source.panels[1].rawText = source.panels[1].structuredLines.map(line => line.text).join('\n');
    source.panels[1].lines = source.panels[1].rawText.split('\n').map(rawText => ({ rawText }));
    assert.equal(assessLocalPanelRecovery(source).eligible, false);
  }
  const source = input();
  source.panels[1].structuredLines[1].words[1].bbox = { x0: 125, x1: 145, y0: 35, y1: 45 };
  assert.equal(assessLocalPanelRecovery(source).eligible, false);
});

test('the same evidence in scaled OCR crop coordinates follows the explicit scale', () => {
  const source = input();
  for (const panel of source.panels) for (const line of panel.structuredLines) for (const word of line.words) for (const key of ['x0', 'y0', 'x1', 'y1']) word.bbox[key] *= 3;
  assert.equal(assessLocalPanelRecovery({ ...source, scale: 3 }).eligible, true);
  assert.equal(assessLocalPanelRecovery({ ...source, scale: 1 }).eligible, false);
});
