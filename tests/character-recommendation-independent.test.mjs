// Independently authored synthetic acceptance cases, not live-game measurements.
import test from 'node:test';
import assert from 'node:assert/strict';
import { planCharacterInputs, recommendCharacterActivities } from '../public/domain/character-recommendation.js';

const assumptions={onEquipSameSlot:true,completeVisibleStats:true,onlyListedEffects:true,ordinaryLandedHits:true,attackMainOptions:true,nonnegativeBackground:true,subOptionsSameStage:true,simpleModel:true};
const line=(id,rawLabel,rawValue,sourceRole)=>({id,rawLabel,rawValue:String(rawValue),unit:String(rawValue).endsWith('%')?'displayPercent':'statPoint',...(sourceRole?{sourceRole}:{})});
const atk=(id,value,role='main')=>line(id,'Attack',value,role);
const neutralAmplification={mainAmplification:'0%',subAmplification:'0%'};
const fixture=(current,candidate,extra={})=>({current,candidate,confirmations:{current:true,candidate:true},assumptions:{...assumptions},player:{...neutralAmplification},...extra});
const results=(a,b,extra)=>recommendCharacterActivities(fixture(a,b,extra));
const allAbstain=rows=>{assert.ok(Array.isArray(rows));for(const row of rows)assert.equal(row.recommendation,null);};
const ordinary=rows=>rows.find(row=>/normal|hunt|mobbing/i.test(`${row.contextId} ${row.label}`));
const boss=rows=>rows.find(row=>/ordinary-boss|chapter.*(?:challenge|boss)/i.test(`${row.contextId} ${row.label}`));
const choose=rows=>rows.filter(row=>row.recommendation);
const player=extra=>({...neutralAmplification,attack:'50000',criticalRate:'50%',criticalDamage:'200%',criticalResistance:'0%',bossDamage:'0%',normalDamage:'7.5%',...extra});
const shoulders=()=>[
  [atk('cm',9306),atk('cs',3490,'sub'),line('cc','Critical Rate','7.3%'),line('cn','Normal Monster Damage','7.5%')],
  [atk('nm',10251),line('nb','Boss Monster Damage','7.5%'),line('nn','Normal Monster Damage','7.5%')],
];

test('character independent: supplied shoulder structure uses both Attack sources and all changed offense',()=>{
  const [a,b]=shoulders();const rows=results(a,b,{player:player()});
  assert.equal(ordinary(rows)?.recommendation,'current');
  assert.equal(boss(rows)?.recommendation,'current');
  assert.ok(rows.every(row=>row.confidence==='Low'));
});

test('character independent: reverse shoulder orientation reverses a proved preference with replacement-consistent totals',()=>{
  const [a,b]=shoulders();
  // At explicit neutral amplification and unit source response, replacing A with B gives Attack47455,
  // Critical Rate42.7%, Boss7.5%; this is a synthetic internally consistent state.
  const rows=results(b,a,{player:player({attack:'47455',criticalRate:'42.7%',bossDamage:'7.5%'})});
  assert.equal(ordinary(rows)?.recommendation,'candidate');
});

test('character independent: wide source response can reverse shoulder boss preference and must abstain',()=>{
  const [a,b]=shoulders();const rows=results(a,b,{player:player({attack:'1000000'})});
  assert.equal(ordinary(rows)?.recommendation,'current');
  assert.equal(boss(rows)?.recommendation,null);
  // Direct independent endpoint arithmetic: source response1 vs maximal
  // response1000000/12796 gives opposite boss-mean preferences.
  const crit=(1+.427)/(1+.5),bucket=1.075;
  assert.ok((1-2545/1000000)*crit*bucket>1);
  assert.ok(10251/12796*crit*bucket<1);
});

test('character independent: main/sub identities are explicit and row permutations cannot change result',()=>{
  const [a,b]=shoulders();const payload=fixture(a,b,{player:player()});
  assert.deepEqual(recommendCharacterActivities(payload),recommendCharacterActivities({...payload,current:[...a].reverse(),candidate:[...b].reverse()}));
  allAbstain(results(a.map(row=>({...row,sourceRole:undefined})),b,{player:player()}));
  allAbstain(results([atk('m1',10),atk('m2',20)],[atk('n',40)],{player:player()}));
});

test('character independent: missing character values block mixed shoulder comparison rather than choosing from partial factors',()=>{
  const [a,b]=shoulders();allAbstain(results(a,b));
  const plan=planCharacterInputs(fixture(a,b));
  assert.ok(plan.fields.some(field=>/criticalRate/i.test(field.id)));
  assert.ok(plan.fields.some(field=>/criticalDamage/i.test(field.id)));
  assert.ok(!plan.fields.some(field=>/job|level|hp|defense|evasion/i.test(field.id)));
});

test('character independent: complete equal effects need no critical/job/level numeric questionnaire',()=>{
  const a=[atk('a',100),line('c','Critical Rate','7.3%')];
  const b=[atk('b',100),line('d','Critical Rate','7.3%')];
  const plan=planCharacterInputs(fixture(a,b));
  assert.ok(!plan.fields.some(field=>/critical|job|level/i.test(field.id)));
  allAbstain(results(a,b));
});

test('character independent: full Critical Damage multiplier is not mistaken for bonus multiplier',()=>{
  const a=[atk('a',100),line('c','Critical Rate','10%')];
  const b=[atk('b',100),line('d','Critical Rate','20%')];
  const rows=results(a,b,{player:player({criticalRate:'20%',criticalDamage:'100%'})});
  assert.equal(ordinary(rows)?.recommendation,null); // all hits have multiplier1
  assert.equal(ordinary(results(a,b,{player:player({criticalRate:'20%',criticalDamage:'200%'})}))?.recommendation,'candidate');
});

test('character independent: chance saturation cannot fabricate a benefit above100% under the explicit simple event model',()=>{
  const a=[atk('a',100),line('c','Critical Rate','10%')];
  const b=[atk('b',100),line('d','Critical Rate','20%')];
  assert.equal(ordinary(results(a,b,{player:player({criticalRate:'110%',criticalDamage:'200%'})}))?.recommendation,null);
});

test('character independent: unknown resistance includes interior clipping breakpoints that can reverse the winner',()=>{
  const a=[atk('a',100),line('r','Critical Rate','60%')];
  const b=[atk('b',130),line('c','Critical Damage','200%')];
  const unknown=results(a,b,{player:player({attack:'100',criticalRate:'80%',criticalDamage:'200%',criticalResistance:undefined})});
  assert.equal(ordinary(unknown)?.recommendation,null);
  // Independent branches: zero resistance favors B;20% resistance favors A;
  //80% resistance favors B again, so endpoint sampling alone is incorrect.
  assert.ok(1.3*(1+.2*3)/(1+.8)>1);
  assert.ok(1.3/(1+.6)<1);
  assert.equal(ordinary(results(a,b,{player:player({attack:'100',criticalRate:'80%',criticalDamage:'200%',criticalResistance:'0%'})}))?.recommendation,'candidate');
  assert.equal(ordinary(results(a,b,{player:player({attack:'100',criticalRate:'80%',criticalDamage:'200%',criticalResistance:'20%'})}))?.recommendation,'current');
});

test('character independent: nonlinear activity adjustment evaluates critical branches before averaging',()=>{
  const a=[atk('a',1),line('r','Critical Rate','2%')];
  const b=[atk('b',2)];
  const rows=results(a,b,{player:player({attack:'1',criticalRate:'2%',criticalDamage:'10000%',criticalResistance:'0%'})});
  assert.equal(ordinary(rows)?.recommendation,'current');
  const raid=rows.find(row=>/boss raid/i.test(row.label));
  assert.equal(raid?.recommendation,'candidate');
  assert.ok(.98+.02*100>2);
  assert.ok(.98+.02*Math.sqrt(100)<Math.sqrt(2));
});

test('character independent: unsupported changed effect cannot be hidden behind an arbitrarily large Attack gain',()=>{
  for(const [label,value] of [['Main Stat','1'],['3rd Job Skill Lv.','1'],['Attack Speed','1%'],['Mystery future offense','1%']]){
    allAbstain(results([atk('a',100)],[atk('b',1000000),line('x',label,value)],{player:player({attack:'5000000'})}));
  }
});

test('character independent: malformed player values never silently default into a numerical winner',()=>{
  const [a,b]=shoulders();
  for(const criticalRate of ['',null,'-1%','NaN','Infinity','1e3%','9007199254740992%'])
    allAbstain(results(a,b,{player:player({criticalRate})}));
});

test('character independent: null containers and missing confirmations fail closed without throwing',()=>{
  for(const input of [null,undefined,{},fixture(null,null),fixture([atk('a',100)],[atk('b',110)],{confirmations:null}),fixture([atk('a',100)],[atk('b',110)],{assumptions:null})])
    allAbstain(recommendCharacterActivities(input));
});

test('character independent: simple-model admission is not silently assumed',()=>{
  const [a,b]=shoulders();allAbstain(results(a,b,{player:player(),assumptions:{...assumptions,simpleModel:false}}));
});

test('character independent: no input mutation and PvP has no invented target-independent winner',()=>{
  const [a,b]=shoulders();const input=fixture(a,b,{player:player()});const before=structuredClone(input);
  const rows=recommendCharacterActivities(input);assert.deepEqual(input,before);
  const pvp=rows.filter(row=>/arena|colosseum|pvp/i.test(row.label));assert.ok(pvp.length);
  allAbstain(pvp);assert.ok(choose(rows).length);
});

test('character independent: uncertainty that admits a tied shoulder state cannot produce a winner',()=>{
  const [a,b]=shoulders();const rows=results(a,b,{player:player({attackError:'49999',percentError:'50%'})});
  assert.equal(ordinary(rows)?.recommendation,null);
  assert.equal(boss(rows)?.recommendation,null);
  for(const field of ['attackError','percentError'])
    allAbstain(results(a,b,{player:player({[field]:'-1'})}));
});

test('character independent: Attack uncertainty clips inconsistent low totals without discarding valid boundary states',()=>{
  const a=[atk('a',100),line('f','Final Damage','10%')];
  const b=[atk('b',110)];
  // A in[90,110], but A>=oldsource100 is required. At A100 the two
  // factors exactly cancel; discarding this boundary can invent a winner.
  assert.equal(ordinary(results(a,b,{player:player({attack:'100',attackError:'10'})}))?.recommendation,null);
});

test('character independent: out-of-range amplification, Star Force and fractional item points abstain',()=>{
  const [a,b]=shoulders();
  for(const replacement of [
    {mainAmplification:'-1%'},{subAmplification:'NaN'},
    {mainAmplification:'',subAmplification:'',starForce:'11'},
    {mainAmplification:'',subAmplification:'',starForce:'31'},
    {mainAmplification:'',subAmplification:'',starForce:'12.5'},
    {mainAmplification:'9007199254740992%'},
  ]) allAbstain(results(a,b,{player:player(replacement)}));
  allAbstain(results([atk('a','100.5')],[atk('b',110)],{player:player()}));
});

test('character independent: sampled complete products respect every reported ordinary winner across coherent stages and responses',()=>{
  let seed=242026,winners=0;
  const random=max=>{seed=(1664525*seed+1013904223)>>>0;return seed%max;};
  for(let index=0;index<60;index++){
    const cm=50+random(150),cs=random(50),nm=50+random(150),ns=random(50);
    const cr=random(10),nr=random(10),cc=random(30),nc=random(30),cb=random(30),nb=random(30),cd=random(30),nd=random(30);
    const a=[atk('cm',cm),atk('cs',cs,'sub'),line('cr','Critical Rate',`${cr}%`),line('cc','Critical Damage',`${cc}%`),line('cb','Boss Monster Damage',`${cb}%`),line('cd','Damage',`${cd}%`)];
    const b=[atk('nm',nm),atk('ns',ns,'sub'),line('nr','Critical Rate',`${nr}%`),line('nc','Critical Damage',`${nc}%`),line('nb','Boss Monster Damage',`${nb}%`),line('nd','Damage',`${nd}%`)];
    const p={attack:'10000',starForce:'12',criticalRate:'50%',criticalDamage:'200%',damage:'50%',bossDamage:'50%'};
    const rows=results(a,b,{player:p});
    for(const row of rows.filter(row=>['ordinary-normal','ordinary-boss'].includes(row.contextId) && row.recommendation)){
      winners++;
      for(const [M,S] of [[1,1],[3,1.25]]){
        const Q=cm*M+cs*S,Qnew=nm*M+ns*S;
        const Rnew=50+(nr-cr)*S,Cnew=200+(nc-cc)*S;
        for(const g of [1,(1+10000/Q)/2,10000/Q])for(const resistance of [0,20,40,50,Math.max(50,Rnew)]){
          const prob=(R)=>Math.max(0,Math.min(1,(R-resistance)/100));
          const crit=(1+prob(Rnew)*(Cnew/100-1))/(1+prob(50));
          const ratio=(10000+g*(Qnew-Q))/10000*(150+(nd-cd)*S)/150*crit*(row.contextId==='ordinary-boss'?(150+(nb-cb)*S)/150:1);
          assert.ok(row.recommendation==='candidate'?ratio>1:ratio<1,`Sample${index},${row.contextId},M${M},S${S},g${g},res${resistance} contradicted ${row.recommendation}`);
        }
      }
    }
  }
  assert.ok(winners>5,'Random fixture must exercise actual winners, not only abstentions.');
});

test('character independent: sub-integer critical cancellation near numeric limit cannot reverse the exact decimal preference',()=>{
  for(const [oldRate,totalRate] of [
    ['9007199254740990%','9007199254740990.9%'],
    ['9007199254740990.1%','9007199254740991%'],
  ]){
    const a=[atk('a',1000),line('c','Critical Rate',oldRate)];
    const b=[atk('b',1982)];
    const rows=results(a,b,{player:player({attack:'1000',criticalRate:totalRate,criticalDamage:'200%'})});
    // Exact decimal residual rate=.9%; old crit is certain. Exact new/old
    // expectation=1982*1009/(1000*2000)=.999919<1. Rejecting unsupported
    // precision is acceptable; rounding residual to1% and choosing New is not.
    assert.notEqual(ordinary(rows)?.recommendation,'candidate');
    assert.notEqual(boss(rows)?.recommendation,'candidate');
  }
  // Even exactly representable integer inputs can lose a fractional part at
  // the amplified-source intermediate. Raw12★ Sub scaling1.25 gives an
  // exact residual rate.75%, but an unguarded Number product gives1%.
  const a=[atk('a',1000),line('c','Critical Rate','7205759403792789%')];
  const b=[atk('b',1982)];
  const rows=results(a,b,{player:{attack:'3000',criticalRate:'9007199254740987%',criticalDamage:'200%',criticalResistance:'0%',starForce:'12'}});
  assert.notEqual(ordinary(rows)?.recommendation,'candidate');
});

test('character independent: tiny noncritical complement near100% is preserved when the admitted critical multiplier is tiny',()=>{
  const a=[atk('a',100),line('c','Critical Rate','0.000000000000000001%')];
  const b=[atk('b',80)];
  const rows=results(a,b,{player:player({attack:'100',criticalRate:'99.999999999999999999%',criticalDamage:'0.000000000000000001%'})});
  // In this synthetic allowed model, critical damage is below ordinary damage.
  // Old noncrit probability=1e-20; new=2e-20. Full critical factor=1e-20.
  // Expected branch factor grows approximately2e-20→3e-20, outweighing20%
  // Attack loss. Converting p to1 and computing1-p would erase the winner.
  assert.equal(ordinary(rows)?.recommendation,'candidate');
  assert.equal(rows.find(row=>/boss raid/i.test(row.label))?.recommendation,'current');
});
