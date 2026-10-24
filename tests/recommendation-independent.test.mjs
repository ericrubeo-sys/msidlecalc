// Independent acceptance fixtures: synthetic source values, not game measurements.
import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendEquipment } from '../public/domain/equipment-recommendation.js';

const assumptions = { onEquipSameSlot:true, completeVisibleStats:true, onlyListedEffects:true, ordinaryLandedHits:true, attackMainOptions:true };
const line = (id, rawLabel, rawValue, unit=String(rawValue).endsWith('%')?'displayPercent':'statPoint') => ({id,rawLabel,rawValue:String(rawValue),unit});
const attack = (id,value) => line(id,'Attack',value);
const input = (current=[attack('old',100)],candidate=[attack('new',110)],extras={}) => ({current,candidate,imageRevision:0,inputRevision:7,contextId:'ordinary-normal',confirmations:{current:true,candidate:true},assumptions:{...assumptions},...extras});
const recommend = (...args) => recommendEquipment(input(...args));
const blocked = result => { assert.equal(result.recommendation,null); assert.notEqual(result.status,'recommended'); };

test('independent: whole admitted ordinary choice preserves swap and neutral identities',()=>{
  const before=[attack('a',100),line('b','Damage','10%')];
  const after=[attack('c',110),line('d','Damage','12%')];
  const forward=recommend(before,after);
  assert.equal(forward.status,'recommended'); assert.equal(forward.recommendation,'candidate');
  assert.equal(recommend(after,before).recommendation,'current');
  const neutral=recommend(before,before.map((row,index)=>({...row,id:`copy-${index}`})));
  assert.equal(neutral.status,'noReliablePreference'); assert.equal(neutral.recommendation,null);
  assert.equal(forward.confidence,'Low'); assert.equal(forward.empiricalValidation,'not-performed');
  assert.equal(forward.inputRevision,7); assert.ok(forward.objective); assert.ok(forward.versions);
});

test('independent: no confirmation or scope assumption is optional',()=>{
  for(const side of ['current','candidate']) blocked(recommend(undefined,undefined,{confirmations:{current:true,candidate:true,[side]:false}}));
  for(const name of ['onEquipSameSlot','completeVisibleStats','onlyListedEffects','ordinaryLandedHits','attackMainOptions']) {
    blocked(recommend(undefined,undefined,{assumptions:{...assumptions,[name]:false}}));
  }
});

test('independent: unknown or unmodeled offense defeats arbitrarily favorable Attack',()=>{
  for(const [label,value,unit] of [
    ['Unlisted future offensive effect','1%','displayPercent'],['Critical Rate','1%','displayPercent'],
    ['Critical Damage','1%','displayPercent'],['Main Stat','1','statPoint'],['3rd Job Skill Lv.','1','level'],
    ['Defense Penetration','1%','displayPercent'],['Attack Speed','1%','displayPercent'],
    ['Skill Cooldown Decrease','1%','displayPercent'],['Status Effect Damage','1%','displayPercent'],
    ['Min Damage Multiplier','1%','displayPercent'],
  ]) blocked(recommend([attack('a',1)],[attack('b',9000000),line('x',label,value,unit)]));
  blocked(recommend([attack('a',1),line('u','Unknown unchanged effect',3)],[attack('b',2),line('v','Unknown unchanged effect',3)]));
});

test('independent: Attack source admission never sums repeated rows or guesses percentage stages',()=>{
  blocked(recommend([attack('a',100),attack('aa',5)],[attack('b',110),attack('bb',6)]));
  blocked(recommend([line('a','Attack','10%')],[line('b','Attack','20%')]));
  blocked(recommend([attack('a',100)],[]));
  blocked(recommend([],[attack('b',110)]));
});

test('independent: mixed tradeoffs abstain without a baseline or arbitrary weights',()=>{
  const result=recommend([attack('a',100),line('x','Damage','20%')],[attack('b',110),line('y','Damage','10%')]);
  blocked(result); assert.ok(result.unsupportedMechanics.some(issue=>issue.code==='tradeoffRequiresBaseline'));
  blocked(recommend([line('a','Basic Attack Damage','10%'),line('b','Skill Damage','20%')],[line('c','Basic Attack Damage','20%'),line('d','Skill Damage','10%')]));
});

test('independent: applicable monster buckets stay separate rather than netting each other',()=>{
  const current=[attack('a',100),line('b','Boss Monster Damage','20%'),line('c','Normal Monster Damage','10%')];
  const candidate=[attack('d',100),line('e','Boss Monster Damage','10%'),line('f','Normal Monster Damage','20%')];
  assert.equal(recommend(current,candidate).recommendation,'candidate');
  assert.equal(recommend(current,candidate,{contextId:'ordinary-boss'}).recommendation,'current');
});

test('independent: ordinary objective can exclude defense/resources but never treat them as offense',()=>{
  const current=[attack('a',100),line('h','Max HP',9000),line('m','Max MP','15%'),line('e','Evasion',80)];
  const candidate=[attack('b',110),line('hh','Max HP',1000),line('mm','Max MP','1%'),line('ee','Evasion',1)];
  const result=recommend(current,candidate);
  assert.equal(result.recommendation,'candidate'); assert.ok(result.outsideScope.length);
  blocked(recommend(current,candidate,{assumptions:{...assumptions,ordinaryLandedHits:false}}));
});

test('independent: missing, malformed, nonfinite and duplicate IDs cannot produce a winner',()=>{
  for(const value of ['', '9,30','13 13','NaN','Infinity','-1','1.5','1e100','9007199254740992']) blocked(recommend([attack('a',100)],[attack('b',value)]));
  blocked(recommend([attack('same',100),line('same','Damage','1%')],[attack('b',110)]));
  blocked(recommend([],[]));
});

test('independent: exact decimal ordering does not disappear into floating-point rounding',()=>{
  const current=[line('a','Damage','1.000000000000000001%')];
  const candidate=[line('b','Damage','1.000000000000000002%')];
  assert.equal(recommend(current,candidate).recommendation,'candidate');
  assert.equal(recommend(candidate,current).recommendation,'current');
});

test('independent: adding/removing single supported sources requires complete visible lists',()=>{
  const old=[attack('a',100)]; const added=[attack('b',100),line('f','Final Damage','1%')];
  assert.equal(recommend(old,added).recommendation,'candidate');
  assert.equal(recommend(added,old).recommendation,'current');
  blocked(recommend(old,added,{assumptions:{...assumptions,completeVisibleStats:false}}));
  blocked(recommend([line('a','Final Damage','1%'),line('b','Final Damage','2%')],[line('c','Final Damage','4%')]));
});

test('independent: input ordering and processing do not mutate data or scope',()=>{
  const before=[attack('a',100),line('d','Damage','1%')]; const after=[attack('b',110),line('e','Damage','2%')];
  const payload=input(before,after); const saved=structuredClone(payload);
  const result=recommendEquipment(payload);
  assert.deepEqual(payload,saved);
  assert.equal(recommend([...before].reverse(),[...after].reverse()).recommendation,result.recommendation);
  for(const contextId of ['arena','chapter-hunt','zakum','guild-raid','not-real']) blocked(recommend(before,after,{contextId}));
});

test('independent: uncertainty intervals must establish strict ordering across every possible source',()=>{
  const bound=(id,value,lower,upper)=>({...line(id,'Damage',`${value}%`),sourceBounds:{lower:`${lower}%`,upper:`${upper}%`}});
  const old=[bound('a',10,9,11)]; const better=[bound('b',14,13,15)];
  assert.equal(recommend(old,better).recommendation,'candidate');
  assert.equal(recommend(better,old).recommendation,'current');
  for(const next of [bound('n',11,10,12),bound('n',12,11,13),bound('n',10,9,11)]) {
    const result=recommend(old,[next]); blocked(result);
    assert.ok(result.unsupportedMechanics.some(issue=>issue.code==='overlappingSourceBounds'));
  }
  // Equal exact points are neutral, whereas unknown values in identical bounds
  // are not guaranteed to be the same actual source contribution.
  assert.equal(recommend([bound('x',10,10,10)],[bound('y',10,10,10)]).status,'noReliablePreference');
  for(const next of [bound('n',10,11,9),bound('n',10,11,12),bound('n',10,'NaN',12)]) blocked(recommend(old,[next]));
});

test('independent: stale background classification never hides a recognized offensive stat',()=>{
  blocked(recommend([attack('a',100)],[attack('b',110),{...line('c','Critical Rate','1%'),otherReading:true}]));
  blocked(recommend([attack('a',100)],[attack('b',110),{...attack('c',10),otherReading:true}]));
});

test('independent: malformed input containers abstain rather than throwing',()=>{
  for(const value of [null,undefined]) blocked(recommendEquipment(value));
  for(const field of ['confirmations','assumptions']) blocked(recommend(undefined,undefined,{[field]:null}));
});

test('independent: unchanged Attack cannot bypass observable source identity',()=>{
  const current=[attack('a',100),line('d','Damage','1%')];
  const candidate=[attack('b',100),line('e','Damage','2%')];
  blocked(recommend(current,candidate,{assumptions:{...assumptions,attackMainOptions:false}}));
  assert.equal(recommend(current,candidate).recommendation,'candidate');
  blocked(recommend([line('a','Attack','10%'),line('d','Damage','1%')],[line('b','Attack','10%'),line('e','Damage','2%')]));
});

test('independent: changed attack-type bonuses require and consume actual attack applicability',()=>{
  const current=[attack('a',100),line('s','Skill Damage','10%')];
  const candidate=[attack('b',100),line('t','Skill Damage','20%')];
  const unspecified=recommend(current,candidate);
  blocked(unspecified); assert.equal(unspecified.needsAttackType,true);
  assert.ok(unspecified.missingInputs.some(issue=>issue.code==='attackType'));
  const basic=recommend(current,candidate,{attackType:'basic'});
  assert.equal(basic.status,'noReliablePreference'); assert.equal(basic.recommendation,null);
  assert.ok(basic.outsideScope.length);
  assert.equal(recommend(current,candidate,{attackType:'skill'}).recommendation,'candidate');
  const unchanged=recommend(current,[attack('c',110),line('u','Skill Damage','10%')]);
  assert.equal(unchanged.recommendation,'candidate'); assert.equal(unchanged.needsAttackType,false);
});
