// Dependencies of changed effects, not numerical formulas or player defaults.
// Existing ordered replacement helpers do not supply the missing conversions.
export const ELIGIBILITY_VERSION='changed-effect-dependencies-2026-10-25-v1';
const guide='https://maplestoryidle.nexon.com/en/guide';
export function unsupportedEffectDependency(label) {
  const key=String(label??'').trim().toLowerCase().replace(/\s+/g,' ').replace(/[.,]+$/,'');
  let mechanicId='unsupportedEffect',category='unimplementedMechanic',description='Changed conversion, skill, timing or other mechanic is not modeled.',dependencies=[];
  if(key==='main stat' || ['str','dex','int','luk','main stat per level'].includes(key)) {
    mechanicId='attributeConversion';category='unresolvedMechanic';
    description='The attribute-to-Attack and Stat Prop. Damage conversions and affected source stages are not established for replacement.';
    dependencies=['Verified job-specific numeric conversion, including both affected offensive factors.','Source amplification and ordering without counting a contribution twice inside current character totals.'];
  } else if(/^[1-4](?:st|nd|rd|th) job skill lv$/.test(key) || key==='all skill levels') {
    mechanicId='jobSkillEffects';
    description='The affected current job-skill/passive level curves and eligible attacks are not implemented as a complete model.';
    dependencies=['Current job-specific skill and passive level effects, with balance-version provenance.','Replacement of effects already contained in totals, and any changed skill selection, cadence or threshold consequence.'];
  } else if(['min damage multiplier','max damage multiplier'].includes(key)) {
    mechanicId='damageRange';category='unresolvedMechanic';
    description='The ordinary hit-range probability law and its relation to critical outcomes are unresolved; a uniform distribution cannot be assumed.';
    dependencies=['Verified range units, source replacement and ordinary hit probability law.','Joint range/critical outcomes, transformed before averaging in nonlinear activity models.'];
  }
  return {code:'unsupportedEffect',mechanicId,category,label:String(label),canPlayerDataResolve:false,
    detail:`${label}: ${description}`,dependencies,evidence:[{url:guide,section:mechanicId==='jobSkillEffects'?'Stat Dictionary; Content Guide → Character':mechanicId==='damageRange'?'Stat Dictionary; Battle System §1.3 and §4.2':'Stat Dictionary; Battle System §1.1 and §1.3'}],version:ELIGIBILITY_VERSION};
}

export function unsupportedEffectSummary(issues=[]) {
  const effects=issues.filter(entry=>entry.code==='unsupportedEffect');
  if(!effects.length) return '';
  const labels=[...new Set(effects.map(entry=>entry.mechanicId==='jobSkillEffects'?'job skill levels':entry.label??entry.detail.split(':')[0]))];
  return `This pair changes ${labels.join(', ')}. These effects aren't supported yet. More character stats won't unlock this comparison.`;
}
