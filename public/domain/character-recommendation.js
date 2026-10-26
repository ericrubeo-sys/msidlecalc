import { fieldForRecord, validateStatValue, RECOMMENDATION_CONTEXTS } from './stat-fields.js';
import { recommendAllActivities as minimumActivities } from './minimum-input.js';
import { unsupportedEffectDependency } from './recommendation-eligibility.js';

export const CHARACTER_MODEL_VERSION='character-offense-estimate-2026-10-25-v3';
export const STAR_FORCE_AMPLIFICATION=Object.freeze(Object.fromEntries([[200,25],[225,25],[250,25],[300,50],[350,60],[400,70],[450,80],[500,90],[600,100],[700,110],[900,130],[1050,145],[1200,160],[1350,180],[1500,200],[1750,225],[2000,250],[2250,275],[2500,300]].map((pair,i)=>[i+12,Object.freeze(pair)])));
export const PLAYER_FIELDS=Object.freeze([
  {id:'attack',label:'Current character Attack',unit:'points'},
  {id:'criticalRate',label:'Current Critical Rate',unit:'%'},
  {id:'criticalDamage',label:'Current Critical Damage (full multiplier)',unit:'%'},
  {id:'damage',label:'Current Damage',unit:'%'},
  {id:'damageAmplification',label:'Current Damage Amplification',unit:'%'},
  {id:'bossDamage',label:'Current Boss Monster Damage',unit:'%'},
  {id:'normalDamage',label:'Current Normal Monster Damage',unit:'%'},
  {id:'basicDamage',label:'Current Basic Attack Damage',unit:'%'},
  {id:'skillDamage',label:'Current Skill Damage',unit:'%'},
  {id:'starForce',label:'Slot Star Force level (12–30 table)',unit:'stars'},
  {id:'mainAmplification',label:'Slot Main Option Amplification',unit:'%'},
  {id:'subAmplification',label:'Slot Sub Option Amplification',unit:'%'},
  {id:'criticalResistance',label:'Opponent Critical Resistance (blank = unknown)',unit:'%'},
  {id:'attackError',label:'Character Attack uncertainty',unit:'points'},
  {id:'percentError',label:'Character percentage uncertainty',unit:'percentage points'},
]);
const buckets={damage:'damage','damage amplification':'damageAmplification','boss monster damage':'bossDamage','normal monster damage':'normalDamage','basic attack damage':'basicDamage','skill damage':'skillDamage'};
const supported=new Set(['attack','critical rate','critical damage','final damage',...Object.keys(buckets)]);
const outside=new Set(['max hp','max mp','defense','evasion','accuracy','critical resistance']);
const names=['onEquipSameSlot','completeVisibleStats','onlyListedEffects','ordinaryLandedHits','nonnegativeBackground','simpleModel'];
const key=s=>String(s??'').trim().toLowerCase().replace(/\s+/g,' ').replace(/[.,]+$/,'');
const issue=(code,detail)=>({code,detail});
const gcd=(a,b)=>b?gcd(b,a%b):a;
function q(n,d=1n) {const g=gcd(n<0n?-n:n,d);return {n:n/g,d:d/g};}
const Q0=q(0n),Q1=q(1n),Q100=q(100n);
function exact(raw) {const [whole,part='']=String(raw??'0').trim().replaceAll(',','').replace(/%$/,'').split('.');return q(BigInt((whole||'0')+part),10n**BigInt(part.length));}
const qa=(a,b)=>q(a.n*b.d+b.n*a.d,a.d*b.d);
const qs=(a,b)=>q(a.n*b.d-b.n*a.d,a.d*b.d);
const qm=(a,b)=>q(a.n*b.n,a.d*b.d);
const qd=(a,b)=>q(a.n*b.d,a.d*b.n);
const qc=(a,b)=>a.n*b.d<b.n*a.d?-1:a.n*b.d>b.n*a.d?1:0;
const qmax=(a,b)=>qc(a,b)>0?a:b;
const number=a=>Number(a.n)/Number(a.d);
const value=(raw,percent=true)=>{
  const text=String(raw??'').trim();
  if(!text || !/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?%?$/.test(text) || (!percent && text.includes('%'))) return null;
  const n=Number(text.replaceAll(',','').replace(/%$/,''));
  if(!Number.isFinite(n) || n<0 || (text.replace(/%$/,'').split('.')[1]?.length??0)>18) return null;
  return qc(exact(text),q(BigInt(Number.MAX_SAFE_INTEGER)))<=0?n:null;
};
export function characterValueIssue(field,raw) {
  if(!String(raw??'').trim()) return 'Enter a value.';
  const numeric=value(raw,!['points','stars'].includes(field.unit));
  if(numeric===null) return 'Use a nonnegative number, valid comma grouping and at most 18 decimal places, within the supported numeric range.';
  if(['attack','criticalDamage'].includes(field.id) && numeric<=0) return 'Enter a value greater than zero.';
  if(field.id==='starForce' && (!Number.isInteger(numeric) || !STAR_FORCE_AMPLIFICATION[numeric])) return 'Supported Star Force is 12–30. For other levels, enter both amplification percentages in Advanced.';
  return null;
}
const scalar=(record)=>Number(String(record.rawValue).replaceAll(',','').replace(/%$/,''));
function inspect(input) {
  const issues=[],maps={current:new Map(),candidate:new Map()};
  for(const side of ['current','candidate']) {
    if(!Array.isArray(input?.[side]) || !input[side].length) {issues.push(issue('missingItem',`Enter ${side} item.`));continue;}
    const ids=new Set();
    for(const record of input[side]) {
      if(!record || !record.id || ids.has(record.id)) {issues.push(issue('lineIdentity','Every line needs a unique identity.'));continue;}ids.add(record.id);
      const field=fieldForRecord(record),fields={...record,...record.correction};
      if(record.otherReading && !field) continue;
      if(!field || key(fields.rawLabel)!==key(field.label) || !validateStatValue(field,fields.rawValue).valid || (fields.unit && fields.unit!=='unknown' && fields.unit!==field.unit)) {issues.push(issue('invalidItemValue','Correct every stat type, value and unit.'));continue;}
      if(record.sourceBounds && (String(record.sourceBounds.lower)!==String(fields.rawValue) || String(record.sourceBounds.upper)!==String(fields.rawValue))) {issues.push(issue('uncertainItemSource','Nonpoint item-source uncertainty is not supported by this estimate; the bounded proof remains separate.'));continue;}
      let label=key(field.label);
      if(label==='attack') {
        if(field.unit!=='statPoint' || !['main','sub'].includes(record.sourceRole)) {issues.push(issue('attackRole','Identify each Attack line as upper Main or lower Sub; Attack % is unsupported.'));continue;}
        label+=`:${record.sourceRole}`;
      }
      const rows=maps[side].get(label)??[];rows.push({rawValue:fields.rawValue,unit:field.unit,n:scalar(fields),q:exact(fields.rawValue),label:field.label});maps[side].set(label,rows);
    }
  }
  const changed=[];
  for(const label of new Set([...maps.current.keys(),...maps.candidate.keys()])) {
    const a=maps.current.get(label)??[],b=maps.candidate.get(label)??[];
    const family=label.split(':')[0];
    if(outside.has(family)) continue;
    if(a.length>1 || b.length>1) {issues.push(issue('repeatedSource',`${a[0]?.label??b[0]?.label}: repeated sources need distinct supported identities.`));continue;}
    if(a.length && b.length && qc(a[0].q,b[0].q)===0 && a[0].unit===b[0].unit) continue;
    if(!supported.has(family)) {issues.push(unsupportedEffectDependency(a[0]?.label??b[0]?.label));continue;}
    if(family!=='attack' && [...a,...b].some(row=>row.unit!=='displayPercent')) {issues.push(issue('unitMismatch','Offensive bonuses must use percentage units.'));continue;}
    changed.push(label);
  }
  const get=(side,label)=>maps[side].get(label)?.[0]?.n??0;
  const getQ=(side,label)=>maps[side].get(label)?.[0]?.q??Q0;
  return {issues,maps,changed,get,getQ};
}
const assumptionsText=[
  'Experimental offensive landed-hit estimate, not survival, DPS, clear probability or PvP winning chance.',
  'Gear flat Attack shares a positive response of at least one; other Attack contributions are nonnegative. Both pre-amplified and already-amplified display scenarios are tested.',
  'Simple critical model: chance = clamp((Critical Rate − resistance)/100, 0, 1); Critical Damage is the full multiplier. This normalization is a model assumption, not a verified universal game law.',
  'Unchanged damage spread/status is independent of critical events; no changed set, skill, artifact-threshold, proc, cadence or resource effect.',
  'Chapter uses ordinary damage; named raid/Party Quest estimates assume a pure square-root transform, Training a pure cube root. Critical outcomes are transformed before averaging. Complete named profiles remain unvalidated.',
  'Entered values are model inputs, not certified hidden game precision. Optional uncertainty margins are user-supplied; no game-rounding margin is invented.',
];
const contextSpecs=[
  {contextId:'ordinary-normal',label:'Normal monsters · damage estimate',targets:['normal'],r:1},
  {contextId:'ordinary-boss',label:'Boss monsters · damage estimate',targets:['boss'],r:1},
  ...RECOMMENDATION_CONTEXTS.map((label,index)=>({contextId:`activity-${index}`,label,targets:index===0?['normal']:index===2||index===3?['boss']:['normal','boss'],r:index===2||index===3||index===5?.5:index===4?1/3:1,unsupported:index>=6})),
];
function quickProof(input,analysis) {
  if(analysis.issues.length || analysis.changed.some(label=>label.startsWith('critical')) || [...analysis.maps.current.keys(),...analysis.maps.candidate.keys()].includes('attack:sub')) return null;
  const assumptions={...input.assumptions,attackMainOptions:true,subOptionsSameStage:input.assumptions?.simpleModel===true};
  const results=minimumActivities({...input,assumptions});
  return results.slice(0,2).every(result=>result.recommendation)?results.slice(0,2):null;
}
export function planCharacterInputs(input={}) {
  input??={};const a=inspect(input),fields=[];
  if(a.issues.length) return {fields,unsupported:a.issues};
  if(quickProof({...input,assumptions:Object.fromEntries([...names,'subOptionsSameStage'].map(name=>[name,true]))},a)) return {fields,unsupported:[]};
  const ids=new Set();
  if(a.changed.some(label=>label.startsWith('attack:'))) ids.add('attack');
  if(a.changed.some(label=>label.startsWith('critical'))) {ids.add('criticalRate');ids.add('criticalDamage');}
  for(const label of a.changed) if(buckets[label]) ids.add(buckets[label]);
  if(a.changed.length) {
    const manualAmplification=['mainAmplification','subAmplification'].some(id=>String(input.player?.[id]??'').trim());
    if(manualAmplification) {
      if(value(input.player?.mainAmplification)===null || value(input.player?.subAmplification)===null) {ids.add('mainAmplification');ids.add('subAmplification');}
    }
    else ids.add('starForce');
  }
  for(const id of ids) fields.push({...PLAYER_FIELDS.find(field=>field.id===id),reason:id==='attack'?'Bounds the predicted change without requiring the new item equipped.':id==='starForce'?'Separates Main and Sub source scaling; Advanced accepts known amplification percentages.':'Consumed only because this effect changes between the items.'});
  return {fields,unsupported:[]};
}
function stages(player,issues) {
  const main=value(player.mainAmplification),sub=value(player.subAmplification);
  let pair;
  if(['mainAmplification','subAmplification'].some(id=>String(player[id]??'').trim())) {
    if(main===null || sub===null) {issues.push(issue('missingAmplification','Enter both Main and Sub amplification percentages.'));return [];}
    pair=[main,sub];
  } else {
    const level=value(player.starForce,false);
    if(!Number.isInteger(level) || !STAR_FORCE_AMPLIFICATION[level]) {issues.push(issue('missingStarForce','Enter a supported 12–30 Star Force level, or both displayed amplification percentages in Advanced. No lower-level curve is guessed.'));return [];}
    pair=STAR_FORCE_AMPLIFICATION[level];
  }
  const raw={mainQ:qa(Q1,qd(exact(main!==null?player.mainAmplification:pair[0]),Q100)),subQ:qa(Q1,qd(exact(sub!==null?player.subAmplification:pair[1]),Q100))};
  return qc(raw.mainQ,Q1)===0 && qc(raw.subQ,Q1)===0?[raw]:[{mainQ:Q1,subQ:Q1},raw];
}
const clamp=x=>Math.max(0,Math.min(1,x));
function critBounds(R,C,dR,dC,r,resistance,percentError) {
  const Rn=qa(R,dR),Cn=qa(C,dC);
  if(qc(Rn,Q0)<0 || qc(Cn,Q0)<=0) return null;
  const known=String(resistance??'').trim()?exact(resistance):null;
  const low=known??Q0,high=known??qmax(qa(R,percentError),qa(Rn,percentError));
  const probability=(rate,res)=>{const p=qd(qs(rate,res),Q100);return qc(p,Q0)<0?Q0:qc(p,Q1)>0?Q1:p;};
  // Convert complementary probabilities separately; 1-Number(p) can erase a
  // genuine tiny noncritical branch near100% even when every input is valid.
  const factor=(p,c)=>number(qs(Q1,p))+number(p)*(number(qd(c,Q100))**r);
  if(qc(percentError,Q0)>0) {
    const oldC=[qs(C,percentError),qa(C,percentError)],newC=[qs(Cn,percentError),qa(Cn,percentError)];
    if(qc(oldC[0],Q0)<=0 || qc(newC[0],Q0)<=0) return null;
    const old=[],next=[];
    for(const res of [low,high]) for(const error of [q(-percentError.n,percentError.d),percentError]) {
      for(const c of oldC) old.push(factor(probability(qmax(Q0,qa(R,error)),res),c));
      for(const c of newC) next.push(factor(probability(qmax(Q0,qa(Rn,error)),res),c));
    }
    return [Math.min(...next)/Math.max(...old),Math.max(...next)/Math.min(...old)];
  }
  const points=[low,high,...[R,Rn,qs(R,Q100),qs(Rn,Q100)].filter(point=>qc(point,low)>0 && qc(point,high)<0)];
  const ratios=points.map(res=>factor(probability(Rn,res),Cn)/factor(probability(R,res),C));
  return [Math.min(...ratios),Math.max(...ratios)];
}
export function recommendCharacterActivities(input={}) {
  input??={};const a=inspect(input),player=input.player??{},plan=planCharacterInputs(input),issues=[...a.issues];
  for(const side of ['current','candidate']) if(input.confirmations?.[side]!==true) issues.push(issue('confirmation','Confirm both item panels first.'));
  for(const name of names) if(input.assumptions?.[name]!==true) issues.push(issue('modelCondition',`Review model condition: ${name}.`));
  const proof=quickProof(input,a);
  for(const field of plan.fields.filter(field=>field.id!=='starForce')) if(characterValueIssue(field,player[field.id])) issues.push(issue('missingPlayerValue',`Enter ${field.label} (${field.unit}).`));
  const attackError=value(player.attackError,false)??0,percentError=value(player.percentError)??0;
  if(!proof && ((a.changed.some(label=>label.startsWith('attack:')) && String(player.attackError??'').trim() && value(player.attackError,false)===null) || (a.changed.some(label=>!label.startsWith('attack:')) && String(player.percentError??'').trim() && value(player.percentError)===null))) issues.push(issue('invalidUncertainty','Uncertainty margins must be nonnegative finite numbers.'));
  if(!proof && a.changed.some(label=>label.startsWith('critical')) && String(player.criticalResistance??'').trim() && value(player.criticalResistance)===null) issues.push(issue('invalidResistance','Opponent resistance must be a nonnegative percentage or blank for unknown.'));
  const scales=!proof && a.changed.length?stages(player,issues):[{mainQ:Q1,subQ:Q1}];
  const n=(id)=>exact(player[id]);
  const attackErrorQ=value(player.attackError,false)===null?Q0:exact(player.attackError),percentErrorQ=value(player.percentError)===null?Q0:exact(player.percentError);
  const resultBase={confidence:'Low',scope:'Experimental expected offensive damage per landed hit; not full battle outcome or DPS.',assumptions:[...assumptionsText],modelVersion:CHARACTER_MODEL_VERSION,empiricalValidation:'not-performed'};
  return contextSpecs.map(context=>{
    const result={...resultBase,contextId:context.contextId,label:context.label,recommendation:null,status:'unavailable',issues:[...issues],ratioBounds:null};
    if(context.unsupported) {result.issues.push(issue('pvpNotImplemented','PvP defender normalization and survival rules are incomplete; no equipment preference is claimed.'));return result;}
    if(issues.length) return result;
    if(proof) {
      const choices=context.targets.map(target=>proof[target==='normal'?0:1].recommendation);
      if(choices.every(choice=>choice===choices[0])) {result.recommendation=choices[0];result.status='estimated';result.method='source-domain-proof';}
      else {result.status='noReliablePreference';result.issues.push(issue('targetConflict','Applicable target branches disagree.'));}
      return result;
    }
    const bounds=[],rejected=[];
    for(const scale of scales) for(const target of context.targets) for(const attackType of ['basic','skill']) {
      let lo=1,hi=1,valid=true;
      const fail=detail=>{valid=false;rejected.push(detail);};
      if(a.changed.some(label=>label.startsWith('attack:'))) {
        const old=qa(qm(a.getQ('current','attack:main'),scale.mainQ),qm(a.getQ('current','attack:sub'),scale.subQ));
        const next=qa(qm(a.getQ('candidate','attack:main'),scale.mainQ),qm(a.getQ('candidate','attack:sub'),scale.subQ));
        const A=n('attack'),L=qs(A,attackErrorQ),H=qa(A,attackErrorQ);
        if(qc(L,Q0)<=0 || qc(old,H)>0 || qc(old,Q0)<=0) fail('Current Attack cannot contain the reconstructed old source under this display scenario.');
        else {
          const d=qs(next,old),lowA=qmax(L,old),values=[number(qd(qa(lowA,d),lowA)),number(qd(qa(H,d),H)),number(qd(next,old))];
          lo*=Math.max(0,Math.min(...values))**context.r;hi*=Math.max(...values)**context.r;
        }
      }
      for(const label of a.changed) {
        if(!buckets[label]) continue;
        if(label==='boss monster damage' && target!=='boss' || label==='normal monster damage' && target!=='normal' || label==='basic attack damage' && attackType!=='basic' || label==='skill damage' && attackType!=='skill') continue;
        const old=qm(a.getQ('current',label),scale.subQ),next=qm(a.getQ('candidate',label),scale.subQ),T=n(buckets[label]),L=qs(T,percentErrorQ),H=qa(T,percentErrorQ);
        if(qc(old,H)>0) {fail(`${label}: current total cannot contain the old item bonus in this display scenario.`);continue;}
        const ratios=[qmax(L,old),H].map(total=>number(qd(qa(qa(Q100,qs(total,old)),next),qa(Q100,total))));
        if(ratios.some(r=>!(r>0))) fail(`${label}: invalid reconstructed factor.`);
        else {lo*=Math.min(...ratios)**context.r;hi*=Math.max(...ratios)**context.r;}
      }
      if(a.changed.includes('final damage')) {
        const ratio=number(qd(qa(Q100,qm(a.getQ('candidate','final damage'),scale.subQ)),qa(Q100,qm(a.getQ('current','final damage'),scale.subQ))));
        lo*=ratio**context.r;hi*=ratio**context.r;
      }
      if(a.changed.some(label=>label.startsWith('critical'))) {
        const R=n('criticalRate'),C=n('criticalDamage'),oldR=qm(a.getQ('current','critical rate'),scale.subQ),oldC=qm(a.getQ('current','critical damage'),scale.subQ);
        if(qc(oldR,qa(R,percentErrorQ))>0 || qc(oldC,qa(C,percentErrorQ))>=0 || qc(C,Q0)<=0) fail('Current critical totals cannot contain the old item contributions in this display scenario.');
        else {
          const critical=critBounds(R,C,qm(qs(a.getQ('candidate','critical rate'),a.getQ('current','critical rate')),scale.subQ),qm(qs(a.getQ('candidate','critical damage'),a.getQ('current','critical damage')),scale.subQ),context.r,player.criticalResistance,percentErrorQ);
          if(!critical) fail('The candidate critical totals are outside the admitted simple model.');
          else {lo*=critical[0];hi*=critical[1];}
        }
      }
      if(valid && Number.isFinite(lo) && Number.isFinite(hi) && lo>0 && hi>0) bounds.push([lo,hi]);
    }
    if(!bounds.length) {result.issues.push(issue('inconsistentInputs',rejected[0]??'No finite positive model state.'));return result;}
    const lower=Math.min(...bounds.map(pair=>pair[0])),upper=Math.max(...bounds.map(pair=>pair[1]));
    result.ratioBounds={lower,upper};result.status='noReliablePreference';
    // A technical guard against floating sign noise, not a game-rounding rule.
    if(lower>1+1e-10) {result.recommendation='candidate';result.status='estimated';}
    else if(upper<1-1e-10) {result.recommendation='current';result.status='estimated';}
    else result.issues.push(issue('preferenceOverlap','Permitted source stages, critical resistance, attack types or uncertainty include a tie or a reversed choice.'));
    if(rejected.length) result.issues.push(issue('rejectedDisplayScenario','Some coherent display scenarios were inconsistent with the entered totals and nonnegative-source model.'));
    return result;
  });
}
