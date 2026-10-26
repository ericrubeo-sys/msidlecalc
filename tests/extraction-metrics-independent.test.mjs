// Independent evaluator-contract fixtures; no private source image or OCR text.
import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreExtractionFixtures } from '../scripts/lib/extraction-metrics.mjs';

const row=(label,value,unit='points')=>({label,value,unit});
const panel=(id,rows,extra={})=>({id,rows,...extra});
const fixture=(extra={})=>({id:'invented',split:'development',permission:{localEvaluation:true},
  truth:[panel('current',[row('Attack','100'),row('Critical Rate','7.3','%'),row('Attack','20')])],
  observed:[panel('current',[row('Attack','100'),row('Critical Rate','7.3','%'),row('Attack','20')])],...extra});
const score=entry=>scoreExtractionFixtures([entry]).splits[entry.split];

test('metrics independent: a balanced omission and extra row cannot hide behind equal line counts',()=>{
  const entry=fixture({observed:[panel('current',[row('Attack','100'),row('HP bar','999'),row('Attack','20')],{complete:true})],
    rowAlignment:[{panelId:'current',pairs:[[0,0],[2,2]]}]});
  const before=structuredClone(entry),result=score(entry);
  assert.equal(result.expectedRows,3);assert.equal(result.omittedRows,1);assert.equal(result.extraRows,1);
  assert.equal(result.fields.value.exact,2);assert.equal(result.fields.value.missing,1);
  assert.equal(result.completeClaims,1);assert.equal(result.falseCompleteClaims,1);assert.deepEqual(entry,before);
});

test('metrics independent: legitimate repeated Attack rows are not automatically counted as duplicates',()=>{
  const entry=fixture({rowAlignment:[{panelId:'current',pairs:[[0,0],[1,1],[2,2]],duplicateObserved:[]}]});
  const exact=score(entry);assert.equal(exact.duplicateRows,0);assert.equal(exact.fields.label.exact,3);
  entry.observed[0].rows.splice(2,0,row('Critical Rate','7.3','%'));
  entry.rowAlignment[0]={panelId:'current',pairs:[[0,0],[1,1],[2,3]],duplicateObserved:[2]};
  const duplicate=score(entry);assert.equal(duplicate.duplicateRows,1);assert.equal(duplicate.extraRows,1);
  assert.equal(duplicate.omittedRows,0);assert.equal(duplicate.fields.value.exact,3);
});

test('metrics independent: alignment rejects reassociation, duplicate consumption and invalid ordinals',()=>{
  const invalid=[[[1,0],[0,1]],[[0,1],[1,0]],[[0,0],[1,0]],[[0,0],[0,1]],[[-1,0]],[[0,-1]],[[3,0]],[[0,3]],[[.1,0]],[[0,0,1]]];
  for(const pairs of invalid) assert.throws(()=>score(fixture({rowAlignment:[{panelId:'current',pairs}]})),TypeError,JSON.stringify(pairs));
  for(const duplicateObserved of [[0],[1,1],[-1],[3],[.5]]) assert.throws(()=>score(fixture({rowAlignment:[{panelId:'current',pairs:[[0,0]],duplicateObserved}]})),TypeError);
  assert.throws(()=>score(fixture({rowAlignment:[]})),TypeError);
  assert.throws(()=>score(fixture({rowAlignment:[{panelId:'other',pairs:[]}]})),TypeError);
});

test('metrics independent: missing/unreadable truth differs from exactness and false-complete evidence',()=>{
  const entry=fixture({truth:[panel('current',[row('Mystery',null,null)])],observed:[panel('current',[row('Mystery','17','%')],{complete:true})]});
  const result=score(entry);
  assert.equal(result.fields.value.denominator,0);assert.equal(result.fields.value.proposalForUnreadable,1);
  assert.equal(result.completeClaims,1);assert.equal(result.falseCompleteClaims,0);assert.equal(result.unverifiableCompleteClaims,1);
  entry.observed[0].rows=[];
  const omitted=score(entry);assert.equal(omitted.omittedRows,1);assert.equal(omitted.falseCompleteClaims,1);
});

test('metrics independent: heldOut label alone is not evidence of independent untouched data',()=>{
  const a=fixture({split:'heldOut'}),unverified=score(a);
  assert.equal(unverified.fixtures,1);assert.equal(unverified.independenceDeclared,0);assert.equal(unverified.independenceUnverified,1);
  for(const independence of [{frozenBeforeTuning:true,previouslyUsed:true,derivedFromDevelopment:false},{frozenBeforeTuning:true,previouslyUsed:false,derivedFromDevelopment:true},{frozenBeforeTuning:false,previouslyUsed:false,derivedFromDevelopment:false}]) assert.equal(score({...a,independence}).independenceDeclared,0);
  assert.equal(score({...a,independence:{frozenBeforeTuning:true,previouslyUsed:false,derivedFromDevelopment:false}}).independenceDeclared,1);
});

test('metrics independent: retry timing and correction retention aggregate without private identities',()=>{
  const secret='PRIVATE_PLAYER_ROW_726';
  const entry=fixture({id:secret,metadata:{path:secret},truth:[panel(secret,[row(secret,secret,secret)])],observed:[panel(secret,[row(secret,secret,secret)],{rawText:secret})],
    rowAlignment:[{panelId:secret,pairs:[[0,0]]}],run:{latencyMs:12.5,mode:'warm',retryAttempts:2,retryProposals:1,retryFailures:1,retentionChecked:true,correctionsPreserved:false}});
  const output=scoreExtractionFixtures([entry]),result=output.splits.development;
  assert.equal(JSON.stringify(output).includes(secret),false);assert.equal(result.latency.totalMs,12.5);assert.equal(result.latency.warmRuns,1);
  assert.equal(result.retryAttempts,2);assert.equal(result.retryProposals,1);assert.equal(result.retryFailures,1);
  assert.equal(result.retentionChecks,1);assert.equal(result.retentionFailures,1);
});

test('metrics independent: unexpected panels cannot hide their false completeness claims',()=>{
  const entry=fixture();entry.observed[0].complete=true;
  entry.observed.push(panel('phantom',[row('UI fragment','9')],{complete:true}));
  const result=score(entry);
  assert.equal(result.extraPanels,1);assert.equal(result.extraRows,1);
  assert.equal(result.completeClaims,2);assert.equal(result.falseCompleteClaims,1);
});

test('metrics independent: finite timing and count declarations cannot overflow aggregate evidence',()=>{
  const a=fixture({run:{latencyMs:Number.MAX_VALUE,mode:'cold'}}),b={...structuredClone(a),id:'another'};
  assert.throws(()=>scoreExtractionFixtures([a,b]),TypeError);
  for(const retryAttempts of [Number.MAX_SAFE_INTEGER+1,Infinity,NaN,-1,.5]) assert.throws(()=>score(fixture({run:{latencyMs:1,mode:'warm',retryAttempts}})),TypeError);
  const large=fixture({run:{latencyMs:1,mode:'unknown',retryAttempts:Number.MAX_SAFE_INTEGER}});
  assert.throws(()=>scoreExtractionFixtures([large,{...structuredClone(large),id:'another'}]),TypeError);
});
