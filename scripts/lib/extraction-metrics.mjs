// Offline evaluation only. Exact ordinal matching is fixed before scoring;
// no nearest-label pairing, value normalization, raw-text output or game logic.
export const EXTRACTION_METRICS_VERSION = 'declared-alignment-exact-fields-2';
const fields = ['label', 'value', 'unit'];
const splits = ['development', 'heldOut'];
function panels(value, truth) {
  if (!Array.isArray(value)) throw new TypeError('Panel array required.');
  const ids = new Set();
  for (const panel of value) {
    if (!panel || typeof panel.id !== 'string' || !panel.id || ids.has(panel.id) || !Array.isArray(panel.rows)) throw new TypeError('Unique panel identities and row arrays required.');
    ids.add(panel.id);
    for (const row of panel.rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) throw new TypeError('Field row required.');
      for (const field of fields) {
        const text = row[field];
        if (text !== null && typeof text !== 'string') throw new TypeError('Explicit string or null fields required.');
        if (truth && text === '') throw new TypeError('Unreadable truth must be null, not an empty string.');
      }
    }
  }
  return value;
}
const empty = () => ({ fixtures: 0, expectedPanels: 0, missingPanels: 0, extraPanels: 0, expectedRows: 0, omittedRows: 0, extraRows: 0,
  explicitAlignmentPanels:0,ordinalAlignmentPanels:0,duplicateRows:0,completeClaims:0,falseCompleteClaims:0,unverifiableCompleteClaims:0,
  independenceDeclared:0,independenceUnverified:0,retryAttempts:0,retryProposals:0,retryFailures:0,retentionChecks:0,retentionFailures:0,
  latency:{runs:0,totalMs:0,minMs:null,maxMs:null,coldRuns:0,warmRuns:0},
  fields: Object.fromEntries(fields.map(field => [field, { exact: 0, denominator: 0, missing: 0, wrong: 0, unreadableTruth: 0, proposalForUnreadable: 0 }])) });

// Alignment is a private evaluator declaration frozen before scoring, not a
// scorer search for the most convenient matching label/value. Pairs preserve
// row order; unmatched observed rows include explicitly annotated duplicates.
function alignmentFor(fixture,truth,observed) {
  if(fixture.rowAlignment===undefined) return null;
  if(!Array.isArray(fixture.rowAlignment) || fixture.rowAlignment.length!==truth.length) throw new TypeError('Complete declared row alignment required.');
  const result=new Map();
  for(const entry of fixture.rowAlignment) {
    const expected=truth.find(panel=>panel.id===entry?.panelId),actual=observed.find(panel=>panel.id===entry?.panelId);
    if(!expected || result.has(entry.panelId) || !Array.isArray(entry.pairs)) throw new TypeError('Unique expected panel alignment required.');
    const map=new Map(),used=new Set();let lastTruth=-1,lastObserved=-1;
    for(const pair of entry.pairs) {
      if(!Array.isArray(pair)||pair.length!==2||!pair.every(Number.isInteger)||pair[0]<=lastTruth||pair[1]<=lastObserved||pair[0]>=expected.rows.length||pair[1]>=(actual?.rows.length??0)) throw new TypeError('Ordered one-to-one bounded row pairs required.');
      map.set(pair[0],pair[1]);used.add(pair[1]);[lastTruth,lastObserved]=pair;
    }
    const duplicates=entry.duplicateObserved??[];
    if(!Array.isArray(duplicates)||new Set(duplicates).size!==duplicates.length||duplicates.some(index=>!Number.isInteger(index)||index<0||index>=(actual?.rows.length??0)||used.has(index))) throw new TypeError('Unmatched duplicate row ordinals required.');
    result.set(entry.panelId,{map,duplicates:duplicates.length});
  }
  return result;
}

export function scoreExtractionFixtures(fixtures) {
  if (!Array.isArray(fixtures) || !fixtures.length) throw new TypeError('Nonempty fixture array required.');
  const output = { version: EXTRACTION_METRICS_VERSION, matching: 'panel-id-and-declared-ordered-alignment-or-ordinal', comparison: 'literal-strings-no-normalization',
    scope: 'field-proposals-only-not-confirmation-or-game-validation', splits: Object.fromEntries(splits.map(split => [split, empty()])) };
  const identities = new Set();
  for (const fixture of fixtures) {
    if (!fixture || typeof fixture.id !== 'string' || !fixture.id || identities.has(fixture.id) || !splits.includes(fixture.split) || fixture.permission?.localEvaluation !== true) throw new TypeError('Unique fixture identity, declared split and evaluation permission required.');
    identities.add(fixture.id);
    const truth = panels(fixture.truth, true), observed = panels(fixture.observed, false);
    const alignment=alignmentFor(fixture,truth,observed);
    const result = output.splits[fixture.split]; result.fixtures++;
    if(fixture.independence?.frozenBeforeTuning===true && fixture.independence?.previouslyUsed===false && fixture.independence?.derivedFromDevelopment===false) result.independenceDeclared++;
    else result.independenceUnverified++;
    if(fixture.run!==undefined) {
      const run=fixture.run;
      if(!run || !Number.isFinite(run.latencyMs)||run.latencyMs<0||!['cold','warm','unknown'].includes(run.mode)) throw new TypeError('Finite declared run timing required.');
      for(const [key,target] of [['retryAttempts','retryAttempts'],['retryProposals','retryProposals'],['retryFailures','retryFailures']]) {
        if(!Number.isSafeInteger(run[key]??0)||(run[key]??0)<0||!Number.isSafeInteger(result[target]+(run[key]??0))) throw new TypeError('Nonnegative safe retry counts required.');
        result[target]+=run[key]??0;
      }
      const latency=result.latency;if(!Number.isFinite(latency.totalMs+run.latencyMs)) throw new TypeError('Finite aggregate timing required.');
      latency.runs++;latency.totalMs+=run.latencyMs;
      latency.minMs=latency.minMs===null?run.latencyMs:Math.min(latency.minMs,run.latencyMs);latency.maxMs=latency.maxMs===null?run.latencyMs:Math.max(latency.maxMs,run.latencyMs);
      if(run.mode==='cold') latency.coldRuns++;if(run.mode==='warm') latency.warmRuns++;
      if(run.retentionChecked===true) {result.retentionChecks++;if(run.correctionsPreserved!==true) result.retentionFailures++;}
    }
    result.expectedPanels += truth.length;
    const predicted = new Map(observed.map(panel => [panel.id, panel]));
    const expectedIds = new Set(truth.map(panel => panel.id));
    result.extraPanels += observed.filter(panel => !expectedIds.has(panel.id)).length;
    result.extraRows += observed.filter(panel => !expectedIds.has(panel.id)).reduce((sum, panel) => sum + panel.rows.length, 0);
    for(const extra of observed.filter(panel=>!expectedIds.has(panel.id))) if(extra.complete===true) {result.completeClaims++;result.falseCompleteClaims++;}
    for (const panel of truth) {
      const match = predicted.get(panel.id);
      if (!match) result.missingPanels++;
      const actual = match?.rows ?? [];
      const declared=alignment?.get(panel.id);
      result.expectedRows += panel.rows.length;
      if(declared) {result.explicitAlignmentPanels++;result.duplicateRows+=declared.duplicates;}
      else result.ordinalAlignmentPanels++;
      const matched=declared?declared.map.size:Math.min(panel.rows.length,actual.length);
      result.omittedRows += panel.rows.length-matched;
      result.extraRows += actual.length-matched;
      let incomplete=matched!==panel.rows.length || actual.length!==matched,unverifiable=false;
      for (let ordinal = 0; ordinal < panel.rows.length; ordinal++) {
        for (const field of fields) {
          const expected = panel.rows[ordinal][field];
          const observedOrdinal=declared?declared.map.get(ordinal):ordinal;
          const proposal = actual[observedOrdinal]?.[field] ?? null;
          const count = result.fields[field];
          if (expected === null) {
            unverifiable=true;
            count.unreadableTruth++;
            if (proposal !== null && proposal !== '') count.proposalForUnreadable++;
          } else {
            count.denominator++;
            if (proposal === expected) count.exact++;
            else if (proposal === null || proposal === '') {count.missing++;incomplete=true;}
            else {count.wrong++;incomplete=true;}
          }
        }
      }
      if(match?.complete===true) {result.completeClaims++;if(incomplete) result.falseCompleteClaims++;else if(unverifiable) result.unverifiableCompleteClaims++;}
    }
  }
  return output;
}
