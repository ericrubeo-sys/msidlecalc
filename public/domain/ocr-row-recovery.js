import { proposePanelRows } from './ocr-item-rows.js';
import { fieldForRecord, validateStatValue } from './stat-fields.js';

export const OCR_ROW_RECOVERY_VERSION='bounded-row-retry-1';
const clone=value=>structuredClone(value);
const key=value=>String(value??'').trim().toLowerCase().replace(/\s+/g,' ').replace(/[.,]+$/,'');

export function proposeRecoveredRow(panel,target) {
  const result={status:'unresolved',proposal:null,issues:[]};
  let assembly;try {assembly=proposePanelRows(panel);} catch {return {...result,issues:['retryGeometryUnavailable']};}
  if(assembly.rows.filter(row=>/[\p{L}\d?]/u.test(row.rawText)).length!==1)return {...result,issues:['retryNeedsOneObservedRow']};
  const proposals=assembly.rows.map(row=>{
    const fields=row.proposedFields,label=fields.statLabelProposal??fields.rawLabel;
    const field=fieldForRecord({rawLabel:label,rawValue:fields.rawValue,unit:fields.unit});
    const validation=validateStatValue(field,fields.rawValue);
    return {row,field,validation,label};
  }).filter(entry=>entry.field&&entry.validation.valid);
  if(proposals.length!==1)return {...result,issues:['retryNeedsOneTypedRow']};
  const {row,field,validation,label}=proposals[0];
  if(target.label && key(label)!==key(target.label))return {...result,status:'conflict',issues:['retryLabelDisagrees']};
  // A valid raw string alone cannot bypass numeric glyph-boundary evidence.
  const base=row.provenance.words.find(word=>word.text===row.proposedFields.rawValue || word.observation?.fieldEvidence?.baseText===row.proposedFields.rawValue);
  const baseEvidence=base?.observation?.fieldEvidence;
  if(assembly.method!=='spatialRows' || !baseEvidence || !['neutralOnly','separated'].includes(baseEvidence.status))return {...result,issues:['retryBaseEvidenceMissing']};
  return {status:'proposed',issues:['unconfirmedRetryProposal'],proposal:{rawLabel:field.label,rawValue:validation.value,unit:field.unit,
    rawText:row.rawText,comparisonText:row.proposedFields.comparisonText,observation:clone(row.provenance)}};
}

// Apply only to freshly imported drafts, before the existing user-edit retention
// boundary. The old observation is retained and no recovered row is confirmed.
export function applyPanelRowRecovery(records,panel,{idPrefix='recovery'}={}) {
  const result=clone(records??[]),attempts=panel?.rowRecovery?.attempts??[];
  if(!/^[a-zA-Z0-9-]+$/.test(idPrefix))throw new TypeError('Safe row recovery identity required.');
  for(const [index,attempt] of attempts.entries()) {
    const target=attempt.target;if(!target)continue;
    const original=target.sourceOrdinal===null?null:result.find(record=>record.ordinal===target.sourceOrdinal || record.provenance?.ordinal===target.sourceOrdinal);
    if(original && (original.provenance?.kind!=='ocr' || original.correction || original.confirmed===true))continue;
    if(original && validateStatValue(fieldForRecord(original),original.rawValue).valid)continue;
    const proposal=attempt.status==='proposed'?attempt.proposal:null;
    if(original) {
      original.provenance.rowRecovery={version:OCR_ROW_RECOVERY_VERSION,target:clone(target),status:attempt.status,originalFields:{rawLabel:original.rawLabel,rawValue:original.rawValue,unit:original.unit},retryObservation:clone(attempt.observation??null)};
      original.otherReading=false;original.confirmed=false;
      if(proposal) {Object.assign(original,{rawLabel:proposal.rawLabel,rawValue:proposal.rawValue,unit:proposal.unit,comparisonText:proposal.comparisonText});original.provenance.rowRecovery.proposal=clone(proposal);}
      continue;
    }
    const id=`${idPrefix}-row-recovery-${index}`;
    let observation={words:[],possibleMissingRow:clone(target)};
    if(proposal) {
      observation=clone(proposal.observation);
      const panelScale=panel.rowRecovery.scale,retryScale=attempt.observation?.scale;
      if(Number.isFinite(panelScale) && Number.isFinite(retryScale) && retryScale>0 && Number.isFinite(target.region?.y)) {
        const ratio=panelScale/retryScale,offsetX=(target.region.x??0)*panelScale,offsetY=target.region.y*panelScale;
        observation.words=observation.words.map(word=>({...word,bbox:{x0:word.bbox.x0*ratio+offsetX,y0:word.bbox.y0*ratio+offsetY,x1:word.bbox.x1*ratio+offsetX,y1:word.bbox.y1*ratio+offsetY}}));
        observation.coordinateSystem='original panel OCR pixels; original retry geometry retained separately';
      } else {observation={words:[],coordinateSystem:'retry geometry not mapped; retained row order required'};}
    }
    const provenance={kind:'ocr',imageRevision:panel.rowRecovery.imageRevision,runId:panel.rowRecovery.runId??null,panelId:panel.id,
      observation,rowRecovery:{version:OCR_ROW_RECOVERY_VERSION,target:clone(target),status:attempt.status,retryObservation:clone(attempt.observation??null),retryProposal:proposal?clone(proposal):null}};
    const insertion=target.insertBeforeOrdinal===null? -1:result.findIndex(record=>record.ordinal===target.insertBeforeOrdinal);
    const ordinal=insertion<0?result.length+index:target.insertBeforeOrdinal-.25;
    const record={id,ordinal,rawText:proposal?.rawText??'',rawLabel:proposal?.rawLabel??'',rawValue:proposal?.rawValue??'',unit:proposal?.unit??'unknown',confirmed:false,correction:null,otherReading:false,coverageRecovery:true,coveragePlaceholder:!proposal,provenance,reviewedImageRevision:null};
    if(insertion<0)result.push(record);else result.splice(insertion,0,record);
  }
  return result;
}
