import { fieldForRecord, validateStatValue } from './stat-fields.js';
import { parseDecimal } from './item-lines.js';
import { MECHANICS_DATA_VERSION } from './mechanics-data.js';

export const RECOMMENDATION_VERSION='ordinary-dominance-2026-10-24-v1';
const key=text=>String(text??'').trim().toLowerCase().replace(/\s+/g,' ').replace(/[.,]+$/,'');
const safeOutside=new Set(['max hp','max mp','defense','evasion','accuracy','critical resistance']);
const supported=new Set(['damage','damage amplification','final damage','boss monster damage','normal monster damage','basic attack damage','skill damage']);
const assumptionNames={
  onEquipSameSlot:'Same equipment slot, same preset, and item On-Equip Effects rather than character totals.',
  completeVisibleStats:'Every visible stat line has been checked; remaining OCR fragments are background.',
  onlyListedEffects:'The replacement changes only the listed effects; no extra set, passive or triggered bonus changes.',
  ordinaryLandedHits:'Compare the same damage-dealing successful ordinary Attack-based hits, with unchanged buffs and attack behavior. Excludes DPS, survival, resources and misses.',
  attackMainOptions:'Both single Attack values are the main/base option in the upper stat section, not extra options.',
};
// Decimal comparison uses integer arithmetic. No conversion of item differences
// into final character totals, approximate weights or hidden damage scores.
function compare(a,b) {
  const scale=Math.max(a.split('.')[1]?.length??0,b.split('.')[1]?.length??0);
  const integer=text=>BigInt(text.replace('.',''))*10n**BigInt(scale-(text.split('.')[1]?.length??0));
  const x=integer(a),y=integer(b); return x<y?-1:x>y?1:0;
}
const same=(a,b)=>a.length===b.length && a.every((entry,index)=>entry.unit===b[index].unit && compare(entry.low,b[index].low)===0 && compare(entry.high,b[index].high)===0);
const issue=(code,detail)=>({code,detail});

export function recommendEquipment(input={}) {
  let {current,candidate,imageRevision=0,inputRevision=0,contextId='ordinary-normal',attackType=null,confirmations={},assumptions={}}=input??{};
  confirmations??={}; assumptions??={};
  const result={status:'unavailable',recommendation:null,confidence:'Low',contextId,inputRevision,
    objective:'Damage of the same successful ordinary Attack-based hits, before content adjustments. Not sustained DPS, survival or a complete named battle.',
    missingInputs:[],unsupportedMechanics:[],cancelled:[],outsideScope:[],directions:[],needsAttackType:false,
    versions:{model:RECOMMENDATION_VERSION,data:MECHANICS_DATA_VERSION,sourceReview:'equipment-guide-2026-10-24'},
    empiricalValidation:'not-performed',
    uncertainty:'Conditional on the entered item-source values and reviewed scenario. Display rounding, hidden effects and live-game agreement are not established.',
    inference:'Single main-option Attack ordering is a bounded inference from published stat order and same-slot amplification, supported by observable main-option review; it is not a universally validated replacement law.',
    source:'https://maplestoryidle.nexon.com/en/guide',claimIds:['MSI-G15-UNITS','MSI-G15-DAMAGE-ORDER']};
  const block=(code,detail)=>result.unsupportedMechanics.push(issue(code,detail));
  const missing=(code,detail)=>result.missingInputs.push(issue(code,detail));
  if(!['ordinary-normal','ordinary-boss'].includes(contextId)) {
    block('namedContextNotImplemented','A complete profile for this battle context is not implemented. Ordinary dominance is not a substitute for its rules.'); return result;
  }
  for(const side of ['current','candidate']) if(confirmations[side]!==true) missing(`${side}Confirmation`,'Review and confirm this item.');
  for(const name of ['onEquipSameSlot','completeVisibleStats','onlyListedEffects','ordinaryLandedHits']) if(assumptions[name]!==true) missing(name,assumptionNames[name]);
  const grouped={current:new Map(),candidate:new Map()};
  for(const [side,records] of Object.entries({current,candidate})) {
    if(!Array.isArray(records) || !records.length) { missing(`${side}Item`,'A nonempty complete item list is required.'); continue; }
    const ids=new Set();
    for(const record of records) {
      if(!record || typeof record.id!=='string' || !record.id || ids.has(record.id)) { block('invalidLineIdentity','Item line identities must be unique.'); continue; }
      ids.add(record.id);
      // Only an explicit crop/list completeness review can classify discarded
      // OCR observations as background; these never become calculation factors.
      const fields={...record,...record.correction};
      const definition=fieldForRecord(record);
      if(record.otherReading && !definition) continue;
      if(!definition || key(fields.rawLabel)!==key(definition.label)) { block('unknownEffect',`Unrecognized stat: ${fields.rawLabel || '(blank)'}.`); continue; }
      if(fields.unit && fields.unit!=='unknown' && fields.unit!==definition.unit) { block('unitMismatch',`${definition.label} has incompatible units.`); continue; }
      const validation=validateStatValue(definition,fields.rawValue);
      if(!validation.valid) { missing('invalidOrMissingValue',`${definition.label}: ${validation.message}`); continue; }
      const decimal=value=>parseDecimal(value.replaceAll(',',''),{unit:definition.unit}).decimal;
      let low=decimal(validation.value),high=low;
      if(record.sourceBounds) {
        const a=validateStatValue(definition,record.sourceBounds.lower),b=validateStatValue(definition,record.sourceBounds.upper);
        if(!a.valid || !b.valid) { block('invalidSourceBounds','Source uncertainty bounds must have valid values and units.'); continue; }
        low=decimal(a.value); high=decimal(b.value);
        const shown=decimal(validation.value);
        if(compare(low,high)>0 || compare(shown,low)<0 || compare(shown,high)>0) { block('invalidSourceBounds','Bounds must enclose the displayed value in increasing order.'); continue; }
      }
      const label=key(definition.label), entries=grouped[side].get(label)??[];
      entries.push({label:definition.label,unit:definition.unit,low,high,id:record.id}); grouped[side].set(label,entries);
    }
    if(!grouped[side].size) missing(`${side}ItemStats`,'At least one readable item stat is required.');
  }
  for(const label of new Set([...grouped.current.keys(),...grouped.candidate.keys()])) {
    const a=grouped.current.get(label)??[],b=grouped.candidate.get(label)??[];
    const title=a[0]?.label??b[0]?.label;
    if(label==='attack') result.claimIds.push('MSI-G15-ATTRIBUTE-ORDER');
    if(label==='final damage') result.claimIds.push('MSI-G15-FINAL-DAMAGE');
    if(safeOutside.has(label)) { result.outsideScope.push(issue('outsideOrdinaryHitObjective',`${title}: no weight for survival, resources or hit probability in this landed-hit objective.`)); continue; }
    if(a.length>1 || b.length>1) { block('repeatedSourceIdentity',`${title}: repeated main/sub sources need verified identities and stages; they are not summed or paired by order.`); continue; }
    if(label==='attack') {
      if(a.length!==1 || b.length!==1 || a[0].unit!=='statPoint' || b[0].unit!=='statPoint') { block('attackSourceStage','Attack requires exactly one flat main-option source on each item; extra Attack, Attack % and missing source sides are unsupported.'); continue; }
      if(assumptions.attackMainOptions!==true) missing('attackMainOptions',assumptionNames.attackMainOptions);
    }
    if(same(a,b) && a.length && compare(a[0].low,a[0].high)===0) { result.cancelled.push(issue('sameReviewedEffect',`${title}: same single entered effect under the reviewed same-slot scenario.`)); continue; }
    if(label!=='attack' && !supported.has(label)) {
      const code=label.startsWith('critical')?'criticalEventLaw':['main stat','main stat per level','str','dex','int','luk','stat prop. damage'].includes(label)?'attributeConversion':/skill.*lv|skill levels/.test(label)?'skillLevelModel':'unsupportedChangedEffect';
      block(code,`${title}: changed effect needs its verified replacement and applicability model.`); continue;
    } else if(label!=='attack' && [...a,...b].some(entry=>entry.unit!=='displayPercent')) { block('unitMismatch',`${title} requires displayed percentage bonuses.`); continue; }
    if((label==='boss monster damage' && contextId==='ordinary-normal') || (label==='normal monster damage' && contextId==='ordinary-boss')) {
      result.outsideScope.push(issue('inapplicableMonsterBucket',`${title}: not applicable to this monster class.`)); continue;
    }
    if(label==='basic attack damage' || label==='skill damage') {
      result.needsAttackType=true;
      if(!['basic','skill'].includes(attackType)) missing('attackType','Choose Basic Attacks or Skills; the changed bonus is not universal.');
      else if((label==='basic attack damage' && attackType==='skill') || (label==='skill damage' && attackType==='basic')) {
        result.outsideScope.push(issue('inapplicableAttackBucket',`${title}: not applicable to the selected attack type.`)); continue;
      }
    }
    const old=a[0]??{low:'0',high:'0'},next=b[0]??{low:'0',high:'0'};
    let direction;
    if(compare(next.low,old.high)>0) direction=1;
    else if(compare(next.high,old.low)<0) direction=-1;
    else if(compare(old.low,old.high)===0 && compare(next.low,next.high)===0 && compare(old.low,next.low)===0) direction=0;
    else { block('overlappingSourceBounds',`${title}: possible source values overlap; strict preference is not established.`); continue; }
    result.directions.push({label:title,direction,unit:a[0]?.unit??b[0]?.unit});
  }
  const signs=new Set(result.directions.map(entry=>entry.direction).filter(Boolean));
  if(signs.size>1) block('tradeoffRequiresBaseline','The ordinary damage factors trade off. Verified affected-stage baselines and replacement rules are required; raw differences cannot decide this comparison.');
  if(result.missingInputs.length || result.unsupportedMechanics.length) return result;
  if(result.needsAttackType && ['basic','skill'].includes(attackType)) result.objective+=` Selected attacks: ${attackType==='basic'?'Basic Attacks':'Skills'}.`;
  result.status=signs.size?'recommended':'noReliablePreference';
  result.recommendation=signs.has(1)?'candidate':signs.has(-1)?'current':null;
  return result;
}

export const RECOMMENDATION_ASSUMPTIONS=Object.freeze({...assumptionNames});
