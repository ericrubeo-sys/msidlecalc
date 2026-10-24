import { recommendEquipment } from './equipment-recommendation.js';
import { fieldForRecord, validateStatValue, RECOMMENDATION_CONTEXTS } from './stat-fields.js';
import { parseDecimal } from './item-lines.js';

export const MINIMUM_INPUT_VERSION='source-domain-bounds-2026-10-24-v1';
const key=value=>String(value).trim().toLowerCase().replace(/\s+/g,' ').replace(/[.,]+$/,'');
const bonuses=new Set(['damage','damage amplification','boss monster damage','normal monster damage','basic attack damage','skill damage']);
const gcd=(a,b)=>b?gcd(b,a%b):a;
function fraction(n,d=1n) { if(d<=0n || n<0n) throw new RangeError('Nonnegative ratio required.'); const g=gcd(n,d); return {n:n/g,d:d/g}; }
const one=fraction(1n),hundred=fraction(100n);
const mul=(a,b)=>fraction(a.n*b.n,a.d*b.d);
const add=(a,b)=>fraction(a.n*b.d+b.n*a.d,a.d*b.d);
const sub=(a,b)=>fraction(a.n*b.d-b.n*a.d,a.d*b.d);
const divide=(a,b)=>fraction(a.n*b.d,a.d*b.n);
const cmp=(a,b)=>a.n*b.d<b.n*a.d?-1:a.n*b.d>b.n*a.d?1:0;
const minimum=(a,b)=>cmp(a,b)<0?a:b,maximum=(a,b)=>cmp(a,b)>0?a:b;
const printed=a=>a===null?null:`${a.n}/${a.d}`;
const signed=(n,d=1n)=>{const sign=n<0n?-1n:1n,g=gcd(n*sign,d);return {n:n/g,d:d/g};};
const plusSigned=(a,b)=>signed(a.n*b.d+b.n*a.d,a.d*b.d);
function decimal(text) {
  const value=parseDecimal(String(text).replaceAll(',',''),{unit:'displayPercent'});
  if(value.state!=='parsed') throw new RangeError('Unsupported decimal.');
  const [whole,part='']=value.decimal.split('.');
  return fraction(BigInt(whole+part),10n**BigInt(part.length));
}
function sources(records) {
  const entries=new Map();
  for(const record of records??[]) {
    const definition=fieldForRecord(record),fields={...record,...record.correction};
    if(!definition) continue;
    const value=validateStatValue(definition,fields.rawValue);
    if(!value.valid) continue;
    const low=record.sourceBounds?.lower??value.value,high=record.sourceBounds?.upper??value.value;
    entries.set(key(definition.label),{label:definition.label,low:decimal(low),high:decimal(high)});
  }
  return entries;
}
function applicable(label,contextId,attackType) {
  return !(label==='boss monster damage' && contextId==='ordinary-normal' || label==='normal monster damage' && contextId==='ordinary-boss' || label==='skill damage' && attackType==='basic' || label==='basic attack damage' && attackType==='skill');
}
function changed(a,b) { return cmp(a.low,b.low)!==0 || cmp(a.high,b.high)!==0 || cmp(a.low,a.high)!==0; }
const neutral={low:fraction(0n),high:fraction(0n)};

// Sparse multivariate polynomials. h>0 is the common sub-option multiplier;
// every other variable is an independent nonnegative unchanged contribution.
// Coefficient signs provide a sufficient proof, never a numerical sample fit.
function productPolynomial(poly,terms) {
  const output=new Map();
  for(const [powers,coefficient] of poly) for(const [variable,value] of terms) {
    const indices=powers?powers.split(','):[];
    if(variable) indices.push(variable);
    const name=indices.sort().join(',');
    const next=signed(coefficient.n*value.n,coefficient.d*value.d);
    output.set(name,plusSigned(output.get(name)??signed(0n),next));
  }
  return output;
}
function polynomialPreference(current,candidate,input) {
  const build=(newSide)=>{
    let polynomial=new Map([['',one]]),index=0;
    for(const label of new Set([...current.keys(),...candidate.keys()])) {
      const old=current.get(label)??neutral,next=candidate.get(label)??neutral;
      if(!['attack','final damage',...bonuses].includes(label) || !applicable(label,input.contextId??'ordinary-normal',input.attackType) || !changed(old,next)) continue;
      const value=newSide?next.low:old.high;
      const terms=label==='attack'?[['t',one],['',value]]:label==='final damage'?[['',hundred],['h',value]]:[['',hundred],[`u${index++}`,one],['h',value]];
      polynomial=productPolynomial(polynomial,terms);
    }
    return polynomial;
  };
  const a=build(false),b=build(true),difference=new Map();
  for(const term of new Set([...a.keys(),...b.keys()])) difference.set(term,plusSigned(b.get(term)??signed(0n),signed(-(a.get(term)?.n??0n),a.get(term)?.d??1n)));
  const nonnegative=[...difference.values()].every(c=>c.n>=0n);
  const strict=[...difference].some(([term,c])=>c.n>0n && (!term || term.split(',').every(v=>v==='h')));
  return nonnegative && strict;
}

function sharedSourceResult(result,current,candidate,input) {
  const forward=polynomialPreference(current,candidate,input);
  // Swap only source values; evaluate the lower-new/upper-old corner again.
  const reverse=polynomialPreference(candidate,current,input);
  result.numericMethod='shared-sub-option-polynomial';
  result.sourceReferences=[{title:'Official Equipment Details and Star Force update, September 3',url:'https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3537355'}];
  result.sourceInference='Same-slot reviewed sub options share one positive amplification. Main Attack has its own independent response. This is a source-backed inference; display rounding remains unverified.';
  if(!forward && !reverse) {
    result.status='noReliablePreference';result.recommendation=null;
    result.unsupportedMechanics=[{code:'percentageSourceStage',detail:'Unknown sub-option amplification and remaining totals do not establish a winner. Current totals alone cannot identify the source mapping; advanced values are sensitivity scenarios.'}];
    return result;
  }
  result.needsNonnegativeBackground=true; result.needsSubOptionsSameStage=true;
  if(input.assumptions?.nonnegativeBackground!==true) result.missingInputs.push({code:'nonnegativeBackground',detail:'No stat-reducing effects in the compared Attack/damage bonuses; unchanged contributions must be nonnegative.'});
  if(input.assumptions?.subOptionsSameStage!==true) result.missingInputs.push({code:'subOptionsSameStage',detail:'The percentage bonuses are item sub-options in the lower section on both panels, at the same slot stage.'});
  if(result.missingInputs.length) {result.status='unavailable';result.recommendation=null;return result;}
  result.unsupportedMechanics=[];result.status='recommended';result.recommendation=forward?'candidate':'current';
  result.proof='Every coefficient of the conservative damage-product difference has the same sign, with a strictly signed term depending only on the positive shared amplification. No character total or guessed amplification value was used.';
  return result;
}

// Conservative enclosures over every permitted unknown background; no typical
// character totals, floating-point logs, source-stage inversion or stat weights.
export function recommendMinimumInput(input={}) {
  input??={};
  const result=recommendEquipment(input);
  result.versions={...result.versions,minimumInputs:MINIMUM_INPUT_VERSION};
  result.characterInputs=[]; result.ratioBounds=null; result.numericMethod='universal-source-bounds';
  const recoverable=new Set(['tradeoffRequiresBaseline','overlappingSourceBounds']);
  if(result.unsupportedMechanics.some(entry=>!recoverable.has(entry.code)) || result.missingInputs.length) return result;
  const current=sources(input.current),candidate=sources(input.candidate);
  if(input.sourceContract!=='effective-bonus-sources') {
    if(result.status==='recommended') return result;
    if(!result.unsupportedMechanics.length && !result.directions.some(entry=>entry.direction)) return result;
    return sharedSourceResult(result,current,candidate,input);
  }
  let lower=one,upper=one,unknownBackground=false;
  const opportunities=[];
  for(const label of new Set([...current.keys(),...candidate.keys()])) {
    const old=current.get(label)??neutral,next=candidate.get(label)??neutral;
    if(!['attack','final damage',...bonuses].includes(label) || !applicable(label,result.contextId,input.attackType) || !changed(old,next)) continue;
    let lo,hi;
    if(label==='final damage') {
      lo=divide(add(hundred,next.low),add(hundred,old.high));
      hi=divide(add(hundred,next.high),add(hundred,old.low));
    } else if(label==='attack') {
      unknownBackground=true;
      lo=old.high.n===0n?one:minimum(one,divide(next.low,old.high));
      hi=old.low.n===0n?(next.high.n===0n?one:null):maximum(one,divide(next.high,old.low));
    } else {
      const total=input.bucketTotals?.[label];
      if(input.bucketTotals && Object.hasOwn(input.bucketTotals,label) && (!total || typeof total!=='object' || Array.isArray(total))) {
        result.missingInputs.push({code:'invalidBucketTotal',detail:`${old.label??next.label}: current-total bounds must be an object with lower and upper values.`}); continue;
      }
      if(total && (String(total.lower??'').trim() || String(total.upper??'').trim())) {
        const definition=fieldForRecord({rawLabel:old.label??next.label,rawValue:'0%',unit:'displayPercent'});
        const low=validateStatValue(definition,total.lower),high=validateStatValue(definition,total.upper);
        if(!low.valid || !high.valid) {
          result.missingInputs.push({code:'invalidBucketTotal',detail:`${old.label??next.label}: enter both current-total bounds as nonnegative percentages.`}); continue;
        }
        const L=decimal(low.value),H=decimal(high.value);
        if(cmp(L,H)>0 || cmp(L,old.high)<0) {
          result.missingInputs.push({code:'invalidBucketTotal',detail:`${old.label??next.label}: the total bounds must be ordered and include at least the old item contribution.`}); continue;
        }
        const ratios=[];
        for(const T of [L,H]) for(const c of [old.low,old.high]) for(const n of [next.low,next.high]) ratios.push(divide(add(add(hundred,sub(T,c)),n),add(hundred,T)));
        lo=ratios.reduce(minimum); hi=ratios.reduce(maximum);
        result.characterInputs.push(label); result.numericMethod='explicit-total-enclosures';
      } else {
        unknownBackground=true;
        lo=minimum(one,divide(add(hundred,next.low),add(hundred,old.high)));
        hi=maximum(one,divide(add(hundred,next.high),add(hundred,old.low)));
        opportunities.push({id:label,label:old.label??next.label,unit:'displayPercent',reason:'Current equipped total bounds can narrow this tradeoff; no assumed display-rounding margin.'});
      }
    }
    lower=mul(lower,lo); upper=upper===null || hi===null?null:mul(upper,hi);
  }
  result.ratioBounds={lower:printed(lower),upper:printed(upper)};
  result.precisionOpportunities=opportunities;
  // Existing coordinatewise dominance needs only positive effective factors.
  // Mixed-factor source-domain bounds additionally assume nonnegative common
  // contributions. A scenario condition is not empirical proof of that law.
  const needsBackground=result.unsupportedMechanics.length>0 && unknownBackground;
  result.needsNonnegativeBackground=needsBackground;
  if(needsBackground && input.assumptions?.nonnegativeBackground!==true) result.missingInputs.push({code:'nonnegativeBackground',detail:'This bounded tradeoff assumes unchanged Attack/bonus contributions are nonnegative; active reductions are outside this scenario.'});
  result.uncertainty+=' Universal bounds assume nonnegative unchanged contributions. Advanced total ranges are user-supplied scenario enclosures, not a verified game display-rounding law.';
  if(result.missingInputs.length) { result.status='unavailable';result.recommendation=null;return result; }
  result.unsupportedMechanics=result.unsupportedMechanics.filter(entry=>!recoverable.has(entry.code));
  const direction=cmp(lower,one)>0?1:upper!==null && cmp(upper,one)<0?-1:0;
  // Preserve exact dominance where a closed interval merely approaches equality.
  if(result.status==='recommended' && result.recommendation) return result;
  result.status=direction?'recommended':'noReliablePreference';
  result.recommendation=direction===1?'candidate':direction===-1?'current':null;
  if(!direction && (cmp(lower,one)!==0 || upper===null || cmp(upper,one)!==0)) result.unsupportedMechanics.push({code:'overlappingPreferenceBounds',detail:'The permitted unknown totals include a tie or opposite preference. No winner is established; only affected bonus totals can narrow supported tradeoffs.'});
  return result;
}

export function planMinimumInputs(input={}) {
  const result=recommendMinimumInput(input);
  const blocked=result.unsupportedMechanics.filter(entry=>entry.code!=='overlappingPreferenceBounds');
  const fields=result.precisionOpportunities??[];
  return {questions:result.recommendation || blocked.length?[]:fields.slice(0,1),advancedFields:fields,blocked};
}

export function recommendAllActivities(input={}) {
  const unique=entries=>[...new Map(entries.map(entry=>[`${entry.code}:${entry.detail}`,entry])).values()];
  const results=['ordinary-normal','ordinary-boss'].map(contextId=>{
    const branches=['basic','skill'].map(attackType=>recommendMinimumInput({...input,contextId,attackType}));
    const [a,b]=branches;
    const choice=a.recommendation && a.recommendation===b.recommendation?a.recommendation:null;
    return {...a,contextId,label:contextId==='ordinary-normal'?'Normal monsters · ordinary hits':'Boss monsters · ordinary hits',branches,
      status:choice?'recommended':branches.some(entry=>entry.status==='unavailable')?'unavailable':'noReliablePreference',recommendation:choice,
      missingInputs:unique(branches.flatMap(entry=>entry.missingInputs)),unsupportedMechanics:unique(branches.flatMap(entry=>entry.unsupportedMechanics)),
      attackAgreement:choice?'Both basic and skill hits favor this item.':'Both basic and skill hits must establish the same preference; attack mixture is not guessed.'};
  });
  return [...results,...RECOMMENDATION_CONTEXTS.map((label,index)=>({contextId:`activity-${index}`,label,status:'unavailable',recommendation:null,confidence:'Low',missingInputs:[],unsupportedMechanics:[{code:'namedContextNotImplemented',detail:'Complete activity rules, exceptions and throughput are not implemented.'}]}))];
}
