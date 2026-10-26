// Independently authored whole-comparison checks. Invented character values are
// software fixtures, never inferred player totals or live-game validation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { planCharacterInputs, recommendCharacterActivities } from '../public/domain/character-recommendation.js';
import { inferAttackRoles } from '../public/domain/automatic-equipment-metadata.js';
import { unsupportedEffectDependency, unsupportedEffectSummary } from '../public/domain/recommendation-eligibility.js';

const assumptions=Object.fromEntries(['onEquipSameSlot','completeVisibleStats','onlyListedEffects','ordinaryLandedHits','nonnegativeBackground','simpleModel'].map(name=>[name,true]));
const row=(id,rawLabel,rawValue,sourceRole)=>({id,rawLabel,rawValue:String(rawValue),unit:/Skill Lv\./.test(rawLabel)?'level':String(rawValue).endsWith('%')?'displayPercent':'statPoint',...(sourceRole?{sourceRole}:{})});
const attack=(id,value,role='main')=>row(id,'Attack',value,role);
const neutral={mainAmplification:'0%',subAmplification:'0%'};
const input=(current,candidate,player={})=>({current,candidate,confirmations:{current:true,candidate:true},assumptions:{...assumptions},player:{...neutral,...player}});
const abstain=results=>{assert.equal(results.length,10);assert.ok(results.every(result=>result.recommendation===null));};
const ordinary=results=>results.find(result=>result.contextId==='ordinary-normal');
const ring=()=>({
  current:[attack('ca','6,624'),row('ch','Max HP','32,562'),row('cm','Main Stat',486),row('cs2','2nd Job Skill Lv.',16),row('cc','Critical Rate','9.6%'),row('cs3','3rd Job Skill Lv.',17)],
  candidate:[attack('na','6,042'),row('nh','Max HP','30,327'),row('nm','Main Stat',444),row('nn','Normal Monster Damage','9.5%'),row('ns3','3rd Job Skill Lv.',16),row('nx','Max Damage Multiplier','14.5%')],
});

test('ring independent: the complete original ring is not unlocked by confirmations or a full character questionnaire',()=>{
  const pair=ring(),payload=input(pair.current,pair.candidate,{attack:'50000',criticalRate:'100%',criticalDamage:'160%',normalDamage:'30%',bossDamage:'0%',mainStat:'10000',job:'Bishop',level:'100',maxDamage:'200%',criticalResistance:'0%'});
  const before=structuredClone(payload),plan=planCharacterInputs(payload),results=recommendCharacterActivities(payload);
  assert.deepEqual(plan.fields,[]);
  for(const label of ['Main Stat','2nd Job Skill Lv.','3rd Job Skill Lv.','Max Damage Multiplier']) assert.ok(plan.unsupported.some(issue=>issue.detail.startsWith(label+':')),label);
  for(const issue of plan.unsupported.filter(issue=>issue.code==='unsupportedEffect')) {
    assert.equal(issue.canPlayerDataResolve,false);assert.ok(issue.dependencies.length>0);
    assert.ok(['unimplementedMechanic','unresolvedMechanic'].includes(issue.category));
  }
  abstain(results);assert.deepEqual(payload,before);
  assert.ok(results.every(result=>result.empiricalValidation==='not-performed' && result.confidence==='Low'));
});

test('ring independent: mechanics blockers are structured dependencies rather than requests for unused player numbers',()=>{
  for(const [label,mechanicId] of [['Main Stat','attributeConversion'],['2nd Job Skill Lv.','jobSkillEffects'],['3rd Job Skill Lv.','jobSkillEffects'],['Max Damage Multiplier','damageRange']]) {
    const issue=unsupportedEffectDependency(label);
    assert.equal(issue.mechanicId,mechanicId);assert.equal(issue.code,'unsupportedEffect');assert.equal(issue.canPlayerDataResolve,false);
    assert.ok(issue.evidence.every(entry=>entry.url==='https://maplestoryidle.nexon.com/en/guide'));
    assert.ok(issue.dependencies.length>=2);
  }
  const summary=unsupportedEffectSummary(['2nd Job Skill Lv.','3rd Job Skill Lv.','Max Damage Multiplier'].map(unsupportedEffectDependency));
  assert.equal((summary.match(/job skill levels/g)??[]).length,1);
  assert.match(summary,/More character stats won't unlock this comparison/);
});

test('ring independent: each unresolved family independently blocks a favorable Attack row',()=>{
  for(const [label,a,b] of [['Main Stat','486','444'],['2nd Job Skill Lv.','16','15'],['3rd Job Skill Lv.','17','16'],['Max Damage Multiplier','14.5%','20%'],['Min Damage Multiplier','5%','10%']]) {
    const payload=input([attack('a',100),row('x',label,a)],[attack('b',10000),row('y',label,b)],{attack:'50000',criticalRate:'100%',criticalDamage:'200%',criticalResistance:'0%'});
    abstain(recommendCharacterActivities(payload));assert.deepEqual(planCharacterInputs(payload).fields,[],label);
  }
});

test('ring independent: gained or lost unsupported skill/range effects do not become known zero-weight effects',()=>{
  for(const unsupported of [row('s','2nd Job Skill Lv.',16),row('r','Max Damage Multiplier','14.5%')]) {
    abstain(recommendCharacterActivities(input([attack('a',100),unsupported],[attack('b',1000)])));
    abstain(recommendCharacterActivities(input([attack('a',100)],[attack('b',1000),unsupported])));
  }
});

test('ring independent: equal unchanged unsupported lines cancel only when their complete value/unit identities agree',()=>{
  const shared=[row('m','Main Stat',486),row('s','3rd Job Skill Lv.',17),row('r','Max Damage Multiplier','14.5%')];
  const payload=input([attack('a',100),...shared],[attack('b',101),...shared.map(entry=>({...entry,id:'new-'+entry.id}))]);
  assert.equal(ordinary(recommendCharacterActivities(payload)).recommendation,'candidate');
  const changed=structuredClone(payload);changed.candidate.at(-1).rawValue='14.6%';
  abstain(recommendCharacterActivities(changed));
});

test('ring independent: missing, merged or wrong-unit ring lines cannot silently disappear through otherReading',()=>{
  for(const patch of [{rawValue:''},{rawValue:'16-1'},{rawValue:'16%',unit:'displayPercent'}]) {
    const pair=ring();Object.assign(pair.candidate.find(entry=>entry.id==='ns3'),patch,{otherReading:true});
    abstain(recommendCharacterActivities(input(pair.current,pair.candidate)));
    assert.ok(planCharacterInputs(input(pair.current,pair.candidate)).unsupported.length);
  }
});

test('ring independent: source-role inference retains both Attack contributions without mutating their raw observations',()=>{
  const original=[row('c1','Attack','1,000'),row('hp','Max HP','10,000'),row('c2','Attack','200')];
  const before=structuredClone(original),inferred=inferAttackRoles(original);
  assert.equal(inferred[0].sourceRole,'main');assert.equal(inferred[2].sourceRole,'sub');assert.deepEqual(original,before);
  const payload=input(inferred,[attack('n',1300),row('b','Boss Monster Damage','5%')],{attack:'1600',bossDamage:'0%'});
  assert.ok(!planCharacterInputs(payload).unsupported.some(issue=>issue.code==='attackRole'));
});

test('ring independent: whole Main/Sub Attack versus Crit and Boss tradeoff agrees with independently bounded products',()=>{
  const current=[attack('a',1000),attack('b',200,'sub'),row('r','Critical Rate','20%')];
  const candidate=[attack('n',1300),row('nb','Boss Monster Damage','5%')];
  const results=recommendCharacterActivities(input(current,candidate,{attack:'1600',criticalRate:'50%',criticalDamage:'200%',criticalResistance:'0%',bossDamage:'0%'}));
  // In this explicit neutral-amplification fixture, source response g is in
  // [1,4/3], Attack ratio in [1.0625,13/12], crit ratio1.3/1.5.
  const maxBossRatio=(13/12)*(1.3/1.5)*1.05;
  assert.ok(maxBossRatio<1);
  assert.equal(ordinary(results).recommendation,'current');
  assert.equal(results.find(result=>result.contextId==='ordinary-boss').recommendation,'current');
  assert.ok(results.filter(result=>['activity-6','activity-7'].includes(result.contextId)).every(result=>result.recommendation===null));
  const reversed=recommendCharacterActivities(input(candidate,current,{attack:'1700',criticalRate:'30%',criticalDamage:'200%',criticalResistance:'0%',bossDamage:'5%'}));
  assert.equal(ordinary(reversed).recommendation,'candidate');
});

test('ring independent: nonlinear activity transforms critical outcomes before averaging',()=>{
  const payload=input([attack('a',1),row('c','Critical Rate','2%')],[attack('b',2)],{attack:'1',criticalRate:'2%',criticalDamage:'10000%',criticalResistance:'0%'});
  const results=recommendCharacterActivities(payload);
  assert.ok(.98+.02*100>2);assert.ok(.98+.02*10<Math.sqrt(2));
  assert.equal(ordinary(results).recommendation,'current');
  assert.equal(results.find(result=>result.contextId==='activity-2').recommendation,'candidate');
});

test('ring independent: blank resistance retains a possible tie instead of inheriting an entered-zero winner',()=>{
  const current=[row('a','Critical Rate','10%')],candidate=[row('b','Critical Rate','20%')];
  const known=input(current,candidate,{criticalRate:'50%',criticalDamage:'200%',criticalResistance:'0%'});
  assert.equal(ordinary(recommendCharacterActivities(known)).recommendation,'candidate');
  const unknown=structuredClone(known);unknown.player.criticalResistance='';
  abstain(recommendCharacterActivities(unknown));
});

test('ring independent: duplicate same-stage sources and exact-limit violations cannot create a winner',()=>{
  const repeated=input([attack('a',100),attack('b',200)],[attack('n',1000)],{attack:'50000'});
  abstain(recommendCharacterActivities(repeated));
  const invalid=input([row('c','Critical Rate','10%')],[row('n','Critical Rate','20%')],{criticalRate:'50%',criticalDamage:'9007199254740991.000000000000000001%',criticalResistance:'0%'});
  abstain(recommendCharacterActivities(invalid));
});
