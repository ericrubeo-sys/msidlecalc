import { fieldForRecord } from './stat-fields.js';

// User's comparison convention: the first/upper flat Attack is Main; the
// second/lower flat Attack is extra. Keep an optional explicit correction.
export function inferAttackRoles(records=[]) {
  const copy=structuredClone(records);
  const attacks=copy.map((record,index)=>({record,index,field:fieldForRecord(record)})).filter(entry=>entry.field?.label==='Attack' && entry.field.kind==='integer');
  const y=record=>{
    const words=record.provenance?.observation?.words;
    const values=Array.isArray(words)?words.map(word=>word.bbox?.y0).filter(Number.isFinite):[];
    return values.length?Math.min(...values):null;
  };
  const geometric=attacks.length>0 && attacks.every(({record})=>y(record)!==null);
  attacks.sort((a,b)=>geometric?y(a.record)-y(b.record):Number(a.record.ordinal??a.record.provenance?.ordinal??a.index)-Number(b.record.ordinal??b.record.provenance?.ordinal??b.index));
  attacks.forEach(({record},index)=>{
    if(['main','sub'].includes(record.sourceRole) && record.sourceRoleOrigin!=='automatic') {record.sourceRoleOrigin='manual';return;}
    record.sourceRole=index===0?'main':index===1?'sub':null;
    record.sourceRoleOrigin='automatic';
    record.sourceRoleIssue=index>1?'More than two Attack lines need an explicit position correction.':null;
  });
  return copy;
}

export function resetStarForceForImage(previous,imageRevision) {
  if(previous?.origin==='manual') return {...previous,imageRevision};
  return {value:'',origin:'unknown',imageRevision};
}
export function applyStarForceReading(previous,reading,imageRevision) {
  if(previous?.origin==='manual') return {...previous,imageRevision};
  if(reading?.status==='read' && Number.isInteger(reading.value) && reading.value>=1 && reading.value<=30 && Array.isArray(reading.panels) && reading.panels.length===2 && reading.panels.every(panel=>panel.count===reading.value)) return {value:String(reading.value),origin:'automatic',imageRevision};
  return {value:'',origin:'unknown',imageRevision};
}
