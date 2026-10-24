// Independent synthetic arithmetic cases. These are not live-game observations.
import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendMinimumInput, planMinimumInputs, recommendAllActivities } from '../public/domain/minimum-input.js';

const assumptions={onEquipSameSlot:true,completeVisibleStats:true,onlyListedEffects:true,ordinaryLandedHits:true,attackMainOptions:true,nonnegativeBackground:true};
const line=(id,rawLabel,rawValue,unit=String(rawValue).endsWith('%')?'displayPercent':'statPoint')=>({id,rawLabel,rawValue:String(rawValue),unit});
const atk=(id,value)=>line(id,'Attack',value);
const fd=(id,value)=>line(id,'Final Damage',`${value}%`);
const damage=(id,value)=>line(id,'Damage',`${value}%`);
// Tight numeric fixtures explicitly supply effective percentage-source values.
// The public upload route must never acquire this contract from a checkbox.
const fixture=(current,candidate,extra={})=>({current,candidate,sourceContract:'effective-bonus-sources',contextId:'ordinary-normal',attackType:'basic',confirmations:{current:true,candidate:true},assumptions:{...assumptions},...extra});
const run=(current,candidate,extra)=>recommendMinimumInput(fixture(current,candidate,extra));
const abstains=result=>{assert.equal(result.recommendation,null);assert.notEqual(result.status,'recommended');};

test('minimum independent: fixed FD gain can defeat every possible additive-bucket loss without player totals',()=>{
  const a=[atk('a',100),fd('f',20),damage('d',20)];
  const b=[atk('b',100),fd('g',40),damage('e',10)];
  const result=run(a,b);
  assert.equal(result.status,'recommended'); assert.equal(result.recommendation,'candidate');
  assert.equal(run(b,a).recommendation,'current');
  assert.equal(result.empiricalValidation,'not-performed');
  assert.deepEqual(result.ratioBounds,{lower:'77/72',upper:'7/6'}); assert.ok(result.numericMethod);
  assert.equal(result.characterInputs.length,0);
});

test('minimum independent: unknown background may reverse a mixed comparison and is never assumed zero',()=>{
  const a=[atk('a',100),fd('f',20),damage('d',20)];
  const b=[atk('b',100),fd('g',30),damage('e',10)];
  abstains(run(a,b));
  const low={damage:{lower:'20%',upper:'20%'}};
  const high={damage:{lower:'100%',upper:'100%'}};
  const lowResult=run(a,b,{bucketTotals:low});
  assert.equal(lowResult.recommendation,'current');
  assert.deepEqual(lowResult.ratioBounds,{lower:'143/144',upper:'143/144'});
  assert.equal(run(a,b,{bucketTotals:high}).recommendation,'candidate');
  abstains(run(a,b,{bucketTotals:{damage:{lower:'20%',upper:'100%'}}}));
});

test('minimum independent: a reachable tie at an uncertainty endpoint prevents strict preference',()=>{
  const a=[atk('a',100),fd('f',20),damage('d',20)];
  const b=[atk('b',100),fd('g',44),damage('e',0)];
  abstains(run(a,b));
  abstains(run(a,b,{bucketTotals:{damage:{lower:'20%',upper:'20%'}}}));
  assert.equal(run(a,b,{bucketTotals:{damage:{lower:'21%',upper:'21%'}}}).recommendation,'candidate');
});

test('minimum independent: changed additive families keep separate common backgrounds',()=>{
  const a=[damage('d',20),line('m','Damage Amplification','10%')];
  const b=[damage('e',10),line('n','Damage Amplification','20%')];
  abstains(run(a,b));
  assert.equal(run(a,b,{bucketTotals:{damage:{lower:'100%',upper:'100%'},'damage amplification':{lower:'10%',upper:'10%'}}}).recommendation,'candidate');
  assert.equal(run(a,b,{bucketTotals:{damage:{lower:'20%',upper:'20%'},'damage amplification':{lower:'100%',upper:'100%'}}}).recommendation,'current');
});

test('minimum independent: source-only FD replacement uses independent multiplication and no aggregate FD input',()=>{
  const a=[fd('f',20),damage('d',20)]; const b=[fd('g',40),damage('e',10)];
  const plain=run(a,b);
  const unused=run(a,b,{bucketTotals:{'final damage':{lower:'900%',upper:'900%'}}});
  assert.equal(plain.recommendation,'candidate'); assert.equal(unused.recommendation,plain.recommendation);
  assert.equal(run([fd('f',20),fd('f2',30)],[fd('g',60)]).recommendation,null);
});

test('minimum independent: a baseline cannot unlock unimplemented critical, attribute or source laws',()=>{
  for(const [label,value] of [['Critical Rate','7.3%'],['Critical Damage','10%'],['Main Stat','2'],['3rd Job Skill Lv.','1']]){
    const result=run([atk('a',100)],[atk('b',1000000),line('u',label,value)],{bucketTotals:{damage:{lower:'100%',upper:'100%'}}});
    abstains(result); assert.ok(result.unsupportedMechanics.length);
  }
  abstains(run([atk('a',100),atk('aa',10)],[atk('b',110)],{bucketTotals:{damage:{lower:'100%',upper:'100%'}}}));
});

test('minimum independent: invalid current-bucket enclosures cannot masquerade as precise player information',()=>{
  const a=[fd('f',20),damage('d',20)];const b=[fd('g',40),damage('e',10)];
  for(const bound of [
    {lower:'19%',upper:'19%'},{lower:'30%',upper:'20%'},{lower:'NaN',upper:'100%'},
    {lower:'-1%',upper:'20%'},{lower:'1e100%',upper:'1e100%'},{lower:'20%'},
    {lower:'9007199254740992%',upper:'9007199254740992%'},null,
  ]) abstains(run(a,b,{bucketTotals:{damage:bound}}));
});

test('minimum independent: nonnegative-background premise gates bounded mixed proofs but adds no coordinatewise question',()=>{
  abstains(run([fd('f',20),damage('d',20)],[fd('g',40),damage('e',10)],{assumptions:{...assumptions,nonnegativeBackground:false}}));
  assert.equal(run([atk('a',100)],[atk('b',110)],{assumptions:{...assumptions,nonnegativeBackground:false}}).recommendation,'candidate');
});

test('minimum independent: malformed inputs, missing fields and stale noise flags never produce partial winners',()=>{
  for(const value of [null,undefined,{}, {current:null,candidate:null}]) abstains(recommendMinimumInput(value));
  abstains(run([damage('d',20)],[fd('f',1000),damage('e','')]));
  abstains(run([atk('a',100)],[atk('b',110),{...line('u','Critical Rate','1%'),otherReading:true}]));
  abstains(run([atk('a',100)],[atk('b',110)],{assumptions:{...assumptions,attackMainOptions:false}}));
  abstains(run([damage('d',10)],[damage('e',20)],{confirmations:{current:true,candidate:false}}));
});

test('minimum independent: nonnegative zero Attack boundary does not yield division-by-zero preference',()=>{
  const result=run([atk('a',0),fd('f',20)],[atk('b',100),fd('g',10)]);
  abstains(result);
  abstains(run([atk('a',100),fd('f',20)],[atk('b',0),fd('g',30)]));
});

test('minimum independent: rounding source enclosures cannot be replaced by displayed central values',()=>{
  const a=[{...damage('d',20),sourceBounds:{lower:'19%',upper:'21%'}},fd('f',20)];
  const b=[{...damage('e',10),sourceBounds:{lower:'9%',upper:'11%'}},fd('g',30)];
  abstains(run(a,b));
});

test('minimum independent: input mutation and line order cannot alter a complete admitted result',()=>{
  const a=[atk('a',100),fd('f',20),damage('d',20)];const b=[atk('b',100),fd('g',40),damage('e',10)];
  const value=fixture(a,b);const before=structuredClone(value);const result=recommendMinimumInput(value);
  assert.deepEqual(value,before);
  assert.equal(run([...a].reverse(),[...b].reverse()).recommendation,result.recommendation);
});

test('minimum independent: exact universal-product sign survives sub-IEEE percentage differences',()=>{
  const a=[fd('f','0'),damage('d','0.000000000000000001')];
  const b=[fd('g','0.000000000000000002'),damage('e','0')];
  assert.equal(run(a,b).recommendation,'candidate');
  assert.equal(run(b,a).recommendation,'current');
});

test('minimum independent: planner asks only consumed changed applicable totals after uncertainty prevents a winner',()=>{
  const a=[atk('a',100),fd('f',20),damage('d',20),line('m','Normal Monster Damage','5%')];
  const b=[atk('b',100),fd('g',30),damage('e',10),line('n','Normal Monster Damage','5%')];
  const planned=planMinimumInputs(fixture(a,b));
  assert.ok(planned.questions.length>0);
  assert.ok(planned.questions.every(question=>question.unit==='displayPercent'));
  assert.equal(planned.questions.some(question=>/job|level|attack|critical|normal monster/i.test(question.label)),false);
  assert.equal(planMinimumInputs(fixture(a,b,{bucketTotals:{damage:{lower:'20%',upper:'20%'}}})).questions.length,0);
  assert.equal(planMinimumInputs(fixture(a,[atk('b',100),fd('g',40),damage('e',10),line('n','Normal Monster Damage','5%')])).questions.length,0);
  assert.equal(planMinimumInputs(fixture([atk('a',100)],[atk('b',110),line('x','Critical Rate','1%')])).questions.length,0);
});

test('minimum independent: automatic activities consume no intended-activity or attack-type selector',()=>{
  const a=[atk('a',100),line('ba','Basic Attack Damage','10%'),line('sa','Skill Damage','20%')];
  const b=[atk('b',100),line('bb','Basic Attack Damage','20%'),line('sb','Skill Damage','10%')];
  const payload=fixture(a,b);delete payload.attackType;delete payload.contextId;
  const results=recommendAllActivities(payload);
  assert.ok(Array.isArray(results));assert.equal(results.length,10);
  for(const result of results) abstains(result);
  for(const id of ['ordinary-normal','ordinary-boss']){
    const ordinary=results.find(result=>result.contextId===id);
    assert.equal(ordinary.status,'noReliablePreference');
    assert.equal(ordinary.branches.length,2);
    assert.deepEqual(new Set(ordinary.branches.map(branch=>branch.recommendation)),new Set(['current','candidate']));
  }
  const directional=recommendAllActivities(fixture([atk('a',100)],[atk('b',110)]));
  assert.equal(directional.filter(result=>result.recommendation==='candidate').length,2);
  for(const result of directional.filter(result=>!result.contextId.startsWith('ordinary-'))) abstains(result);
});

test('minimum independent: automatic normal/boss results preserve separate target applicability',()=>{
  const a=[atk('a',100),line('ba','Boss Monster Damage','20%'),line('na','Normal Monster Damage','10%')];
  const b=[atk('b',100),line('bb','Boss Monster Damage','10%'),line('nb','Normal Monster Damage','20%')];
  const results=recommendAllActivities(fixture(a,b));
  assert.equal(results.find(result=>result.contextId==='ordinary-normal').recommendation,'candidate');
  assert.equal(results.find(result=>result.contextId==='ordinary-boss').recommendation,'current');
});

test('minimum independent: every universal choice survives independently sampled admissible backgrounds and source dilution',()=>{
  let seed=20261024,choices=0;
  const next=max=>{seed=(1664525*seed+1013904223)>>>0;return seed%max;};
  for(let index=0;index<120;index++){
    const c=1+next(100),n=1+next(100),cf=next(80),nf=next(80),cd=next(80),nd=next(80);
    const a=[atk('a',c),fd('f',cf),damage('d',cd)];
    const b=[atk('b',n),fd('g',nf),damage('e',nd)];
    const result=run(a,b);
    if(!result.recommendation) continue;
    choices++;
    assert.equal(run(b,a).recommendation,result.recommendation==='candidate'?'current':'candidate');
    for(const attackBackground of [0,10,1000,100000]) for(const damageBackground of [0,10,1000,100000]){
      const ratio=(attackBackground+n)/(attackBackground+c)*(100+nf)/(100+cf)*(100+damageBackground+nd)/(100+damageBackground+cd);
      assert.ok(result.recommendation==='candidate'?ratio>1:ratio<1,`Fixture ${index} contradicted its universal choice`);
    }
  }
  assert.ok(choices>10,'Sample must exercise genuine choices as well as abstentions.');
});

const shared=(current,candidate,extra={})=>run(current,candidate,{sourceContract:undefined,assumptions:{...assumptions,subOptionsSameStage:true},...extra});

test('minimum independent: shared Sub amplification proves a complete mixed choice without an invented amplification',()=>{
  const a=[atk('a',100),fd('f',20),damage('d',20)];const b=[atk('b',100),fd('g',40),damage('e',10)];
  const result=shared(a,b);
  assert.equal(result.recommendation,'candidate'); assert.equal(shared(b,a).recommendation,'current');
  assert.equal(result.characterInputs.length,0); assert.equal(result.ratioBounds,null);
  // Independent direct products, including amplification far below/above1.
  for(const h of [0.000001,0.01,1,100,1000000]) for(const u of [0,1,100]){
    const ratio=(1+0.4*h)/(1+0.2*h)*(1+u+0.1*h)/(1+u+0.2*h);
    assert.ok(ratio>1);
  }
});

test('minimum independent: coefficient positivity requiring an unknown positive background is not strict proof',()=>{
  const a=[fd('f',20),damage('d',40)];const b=[fd('g',40),damage('e',20)];
  // Difference=.2*h*u; u=0 remains a permitted tie for every positive h.
  abstains(shared(a,b)); abstains(shared(b,a));
});

test('minimum independent: same Sub-stage identification and nonnegative common-source domains are consumed',()=>{
  const a=[fd('f',20),damage('d',20)];const b=[fd('g',40),damage('e',10)];
  abstains(shared(a,b,{assumptions:{...assumptions,subOptionsSameStage:false}}));
  abstains(shared(a,b,{assumptions:{...assumptions,subOptionsSameStage:true,nonnegativeBackground:false}}));
  assert.equal(shared([atk('a',100)],[atk('b',110)],{assumptions:{...assumptions,subOptionsSameStage:false,nonnegativeBackground:false}}).recommendation,'candidate');
});

test('minimum independent: precise current totals alone cannot cure an unknown percentage-source stage',()=>{
  const a=[fd('f',20),damage('d',20)];const b=[fd('g',40),damage('e',10)];
  const extra={sourceContract:undefined,assumptions:{...assumptions,subOptionsSameStage:false},bucketTotals:{damage:{lower:'100%',upper:'100%'}}};
  abstains(run(a,b,extra));
  // Independent FD/Damage amplification can reverse the same raw panel values.
  assert.ok((1+.4*.01)/(1+.2*.01)*(1+.1*100)/(1+.2*100)<1);
});

test('minimum independent: Main Attack and Sub percentages cannot share a fabricated amplification variable',()=>{
  abstains(shared([atk('a',100),fd('f',1)],[atk('b',1),fd('g',100)]));
  abstains(shared([atk('a',1),fd('f',100)],[atk('b',100),fd('g',1)]));
});

test('minimum independent: unresolved shared-source tradeoff is a mechanics blocker rather than mandatory player totals',()=>{
  const a=[fd('f',20),damage('d',20)];const b=[fd('g',30),damage('e',10)];
  const payload=fixture(a,b,{sourceContract:undefined,assumptions:{...assumptions,subOptionsSameStage:true}});
  abstains(recommendMinimumInput(payload));
  assert.equal(planMinimumInputs(payload).questions.length,0);
  assert.equal(recommendMinimumInput(payload).characterInputs.length,0);
});

test('minimum independent: shared-polynomial choices survive varied common amplification and independent Main Attack background',()=>{
  let seed=240610,choices=0;
  const next=max=>{seed=(1664525*seed+1013904223)>>>0;return seed%max;};
  for(let index=0;index<120;index++){
    const c=1+next(100),n=1+next(100),cf=next(80),nf=next(80),cd=next(80),nd=next(80);
    const a=[atk('a',c),fd('f',cf),damage('d',cd)];const b=[atk('b',n),fd('g',nf),damage('e',nd)];
    const result=shared(a,b);
    if(!result.recommendation) continue;
    choices++;
    assert.equal(shared(b,a).recommendation,result.recommendation==='candidate'?'current':'candidate');
    for(const h of [0.0001,1,10000]) for(const t of [0,10000]) for(const u of [0,10000]){
      const ratio=(t+n)/(t+c)*(100+h*nf)/(100+h*cf)*(100+u+h*nd)/(100+u+h*cd);
      assert.ok(result.recommendation==='candidate'?ratio>1:ratio<1,`Shared fixture ${index} contradicted its universal choice`);
    }
  }
  assert.ok(choices>10);
});

test('minimum independent: public-contract shared proof automatically evaluates both hit classes and keeps named activities unavailable',()=>{
  const payload=fixture([fd('f',20),damage('d',20)],[fd('g',40),damage('e',10)],{sourceContract:undefined,assumptions:{...assumptions,subOptionsSameStage:true}});
  delete payload.attackType;delete payload.contextId;
  const results=recommendAllActivities(payload);
  assert.equal(results.filter(result=>result.recommendation==='candidate').length,2);
  for(const result of results.filter(result=>result.contextId.startsWith('ordinary-'))){
    assert.equal(result.branches.length,2);assert.equal(result.ratioBounds,null);
  }
  for(const result of results.filter(result=>!result.contextId.startsWith('ordinary-'))) abstains(result);
});
