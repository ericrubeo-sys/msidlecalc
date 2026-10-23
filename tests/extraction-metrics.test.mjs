import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreExtractionFixtures } from '../scripts/lib/extraction-metrics.mjs';
const row = (label, value, unit) => ({ label, value, unit });
const fixture = (truth, observed, split = 'development') => ({ id: 'invented-only', split, permission: { localEvaluation: true }, truth, observed });
const panel = (id, rows) => ({ id, rows });

test('ordinal scorer penalizes missing panels/rows and separates held-out evidence', () => {
  const a = fixture([panel('current', [row('Attack', '12', 'points'), row('Odd effect', null, null)]), panel('candidate', [row('Attack', '15', 'points')])], [panel('current', [row('Attack', '12', 'points')])], 'heldOut');
  const result = scoreExtractionFixtures([a]);
  const counts = result.splits.heldOut;
  assert.equal(result.splits.development.fixtures, 0);
  assert.equal(counts.expectedRows, 3); assert.equal(counts.omittedRows, 2); assert.equal(counts.missingPanels, 1);
  assert.deepEqual(counts.fields.label, {exact:1,denominator:3,missing:2,wrong:0,unreadableTruth:0,proposalForUnreadable:0});
  assert.equal(counts.fields.value.denominator, 2); assert.equal(counts.fields.value.exact, 1);
});

test('scorer does not rematch duplicate or reordered lines or normalize ambiguous numbers', () => {
  const a = fixture([panel('current', [row('Attack', '1234', 'points'), row('Attack', '9', 'points')])], [panel('current', [row('Attack', '9', 'points'), row('Attack', '1.234', 'points')])]);
  const counts = scoreExtractionFixtures([a]).splits.development;
  assert.equal(counts.fields.label.exact, 2); assert.equal(counts.fields.value.exact, 0); assert.equal(counts.fields.value.wrong, 2);
});

test('extra panels and lines count even when truth has unknown fields', () => {
  const a = fixture([panel('current', [row('Mystery', null, null)])], [panel('current', [row('Mystery', '0', 'points'), row('Extra', '5', '%')]), panel('unexpected', [row('Other', '3', '%')])]);
  const counts = scoreExtractionFixtures([a]).splits.development;
  assert.equal(counts.extraPanels, 1); assert.equal(counts.extraRows, 2);
  assert.equal(counts.fields.value.denominator, 0); assert.equal(counts.fields.value.proposalForUnreadable, 1);
});

test('scorer output never contains fixture identities, field content, metadata or paths', () => {
  const canary = 'PRIVATE_CANARY_42';
  const a = fixture([panel(canary, [row(canary, canary, canary)])], [panel(canary, [row(canary, canary, canary)])]);
  a.id = canary; a.metadata = { path: canary }; a.observed[0].rawText = canary;
  const output = JSON.stringify(scoreExtractionFixtures([a]));
  assert.equal(output.includes(canary), false);
  assert.equal(JSON.parse(output).splits.development.fields.label.exact, 1);
});

test('scorer rejects missing declarations, duplicate identities and malformed truth without leaking content', () => {
  const a = fixture([panel('current', [row('A', '1', '%')])], []);
  for (const invalid of [{...a,split:'unknown'},{...a,permission:null},{...a,truth:[panel('current',[row('A',undefined,'%')])]},{...a,truth:[panel('current',[row('A','','%')])]},{...a,truth:[panel('same',[]),panel('same',[])]}]) assert.throws(()=>scoreExtractionFixtures([invalid]));
  assert.throws(()=>scoreExtractionFixtures([a,a])); assert.throws(()=>scoreExtractionFixtures([]));
});
