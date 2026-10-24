import { parseDecimal } from './item-lines.js';
const points = ['Attack','Defense','Max HP','Max MP','Main Stat'];
const percentages = ['Damage','Damage Amplification','Final Damage','Basic Attack Damage','Skill Damage','Stat Prop. Damage','Boss Monster Damage','Normal Monster Damage','Status Effect Damage','Damage Taken Decrease','Increased Damage Taken','Defense Penetration','Critical Rate','Critical Damage','Critical Resistance','Min Damage Multiplier','Max Damage Multiplier','Attack Speed','Skill Cooldown Decrease','Buff Duration','Companion Summon Duration'];
const integers = ['Accuracy','Evasion','Debuff Tolerance','Debuff Tolerance Ignore','Basic Attack Target','1st Job Skill Lv.','2nd Job Skill Lv.','3rd Job Skill Lv.','4th Job Skill Lv.','All Skill Levels','Main Stat per Level','STR','DEX','INT','LUK'];
// Entry syntax only, not evidence of stacking, applicability or a game cap.
export const STAT_FIELDS = Object.freeze([
  ...points.flatMap(label=>[{label,kind:'integer',unit:'statPoint'},{label,kind:'percent',unit:'displayPercent'}]),
  ...percentages.map(label=>({label,kind:'percent',unit:'displayPercent'})),
  ...integers.map(label=>({label,kind:'integer',unit:/Skill/.test(label)?'level':'statPoint'})),
  {label:'Skill Cooldown Decrease',kind:'seconds',unit:'unknown'},
].map((field,index)=>Object.freeze({...field,id:`stat-${index}`,title:`${field.label}${points.includes(field.label) ? field.kind==='percent'?' (%)':' (points)':field.kind==='seconds'?' (seconds)':''}`})));
const key = value=>String(value).trim().toLowerCase().replace(/\s+/g,' ').replace(/[.,]+$/,'');
export function fieldForRecord(record) {
  if(record.statFieldId) return STAT_FIELDS.find(field=>field.id===record.statFieldId) ?? null;
  const fields={...record,...record.correction};
  const matches=STAT_FIELDS.filter(field=>key(field.label)===key(fields.rawLabel));
  const percent=String(fields.rawValue??'').trim().endsWith('%') || fields.unit==='displayPercent';
  return matches.find(field=>field.kind===(percent?'percent':'integer')) ?? (matches.length===1?matches[0]:null);
}
export function validateStatValue(field, value) {
  const text=String(value??'').trim();
  if (!field) return {valid:false,message:'Choose a stat.'};
  if (!text) return {valid:false,message:'Enter a value.'};
  if (field.kind!=='percent' && text.includes('%')) return {valid:false,message:'Use a whole number without %.'};
  const numeric=field.kind==='percent'?text.replace(/%$/,'').trim():text;
  const grammar=field.kind==='integer'?/^(?:\d+|\d{1,3}(?:,\d{3})+)$/:/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;
  if(!grammar.test(numeric)) return {valid:false,message:field.kind==='integer'?'Use a nonnegative whole number.':field.kind==='percent'?'Use a percentage, such as 7.5%.':'Use seconds, such as 1.5.'};
  const result=parseDecimal(numeric.replaceAll(',',''),{unit:field.unit});
  if(result.state!=='parsed') return {valid:false,message:'Value is outside the supported numeric range.'};
  return {valid:true,value:`${numeric}${field.kind==='percent'?'%':''}`,unit:field.unit};
}

// Official named scopes; none has a complete enabled equipment model yet.
export const RECOMMENDATION_CONTEXTS = Object.freeze(['Chapter Hunt / mobbing','Chapter Challenge / Boss','Boss Raid · Zakum / Horntail','Guild Raid · Zakum / Horntail','Guild Training Ground','Party Quest','Arena / World Arena','Colosseum']);
export function recommendationContexts() {
  return RECOMMENDATION_CONTEXTS.map(context=>({context,recommendation:null,status:'Not enough verified information',confidence:'Low'}));
}
