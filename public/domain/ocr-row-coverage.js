import { proposePanelRows } from './ocr-item-rows.js';
import { fieldForRecord, validateStatValue } from './stat-fields.js';

export const OCR_ROW_COVERAGE_VERSION='neutral-stat-bands-1';
const median=values=>{const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.floor(sorted.length/2)];};
const boxValid=box=>box && ['x0','y0','x1','y1'].every(key=>Number.isFinite(box[key])) && box.x1>box.x0 && box.y1>box.y0;
const boxFor=row=>{
  const words=row.provenance?.words?.filter(word=>boxValid(word.bbox))??[];
  return words.length?{x0:Math.min(...words.map(word=>word.bbox.x0)),y0:Math.min(...words.map(word=>word.bbox.y0)),x1:Math.max(...words.map(word=>word.bbox.x1)),y1:Math.max(...words.map(word=>word.bbox.y1))}:null;
};
const labelFor=fields=>fields.statLabelProposal??fields.rawLabel;
const typed=fields=>fieldForRecord({rawLabel:labelFor(fields),rawValue:fields.rawValue,unit:fields.unit});

// Advisory coverage of independent neutral text bands, not semantic completeness.
// Only bands bracketed by trustworthy stat rows may trigger recovery: oversized
// crops often contain HP bars, buttons and other text below the item itself.
export function assessStatRowCoverage({raster,panel,scale=1}={}) {
  const result={version:OCR_ROW_COVERAGE_VERSION,status:'unknown',complete:false,
    observedBands:[],unmatchedBands:[],retryRegions:[],issues:['semanticCompletenessUncertified','edgeRowsUncertified']};
  const {width,height,data}=raster??{};
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0||width*height>28000000 ||
    !(data instanceof Uint8ClampedArray||data instanceof Uint8Array)||data.length!==width*height*4 ||
    !Number.isInteger(scale)||scale<1||scale>3) return {...result,issues:[...result.issues,'rasterUnavailable']};
  let assembled;
  try {assembled=proposePanelRows(panel);} catch {return {...result,issues:[...result.issues,'rowGeometryUnavailable']};}
  if(assembled.method!=='spatialRows')return {...result,issues:[...result.issues,'rowGeometryUnavailable']};
  const rows=assembled.rows.map(row=>({row,box:boxFor(row),field:typed(row.proposedFields)})).filter(entry=>entry.box);
  const anchors=rows.filter(entry=>entry.field && validateStatValue(entry.field,entry.row.proposedFields.rawValue).valid);
  if(anchors.length<2)return {...result,issues:[...result.issues,'insufficientStatAnchors']};
  const glyphHeights=anchors.flatMap(({row})=>row.provenance.words.filter(word=>/\p{L}|\d/u.test(word.text)).map(word=>word.bbox.y1-word.bbox.y0));
  const glyphHeight=median(glyphHeights);
  if(!Number.isFinite(glyphHeight)||glyphHeight<3||glyphHeight>height*.25)return {...result,issues:[...result.issues,'uncertainTextScale']};
  const top=Math.max(0,Math.floor(Math.min(...anchors.map(entry=>entry.box.y0))-glyphHeight*.2));
  const bottom=Math.min(height,Math.ceil(Math.max(...anchors.map(entry=>entry.box.y1))+glyphHeight*.2));
  const labelLeft=Math.max(1,Math.floor(width*.04)),labelRight=Math.floor(width*.62),valueLeft=Math.floor(width*.64),valueRight=Math.ceil(width*.97);
  const labelMinimum=Math.max(3,Math.ceil(width*.006)),valueMinimum=Math.max(2,Math.ceil(width*.003));
  const active=[];
  for(let y=top;y<bottom;y++) {
    let labels=0,values=0;
    for(let x=labelLeft;x<valueRight;x++) {
      const offset=(y*width+x)*4,r=data[offset],g=data[offset+1],b=data[offset+2];
      if(data[offset+3]<128 || Math.min(r,g,b)<170 || Math.max(r,g,b)-Math.min(r,g,b)>42) continue;
      if(x<labelRight)labels++;
      else if(x>=valueLeft)values++;
    }
    if(labels>=labelMinimum && values>=valueMinimum)active.push(y);
  }
  const bands=[];let band=null;
  for(const y of active) {
    if(!band || y-band.last>Math.max(2,scale*2)) {if(band)bands.push(band);band={top:y,bottom:y+1,last:y,activeRows:1};}
    else {band.bottom=y+1;band.last=y;band.activeRows++;}
  }
  if(band)bands.push(band);
  const textBands=bands.filter(band=>band.bottom-band.top>=glyphHeight*.4 && band.bottom-band.top<=glyphHeight*1.7 && band.activeRows>=Math.max(3,glyphHeight*.25));
  if(!textBands.length)return {...result,issues:[...result.issues,'noIndependentTextBands']};
  const center=box=>(box.y0+box.y1)/2;
  const covers=(entry,band)=>center(entry.box)>=(band.top??band.y0)-glyphHeight*.55 && center(entry.box)<=(band.bottom??band.y1)+glyphHeight*.55;
  const ocrPair=entry=>entry.row.provenance.words.some(word=>/\p{L}/u.test(word.text)&&word.bbox.x0<labelRight) &&
    entry.row.provenance.words.some(word=>/\d/.test(word.text)&&word.bbox.x0>=width*.6);
  result.observedBands=textBands.map((band,index)=>({id:`band-${index}`,y0:band.top,y1:band.bottom,
    hasLabelAndValueInk:true,coveredByOcr:rows.some(entry=>covers(entry,band)&&ocrPair(entry))}));
  result.unmatchedBands=result.observedBands.filter(band=>!band.coveredByOcr);
  const candidates=[];
  // A recognizable but unreadable row can already have both OCR columns.
  // Retry it without pretending its existing lexical proposal is a value.
  for(const entry of rows) {
    const fields=entry.row.proposedFields;
    const readable=entry.field && validateStatValue(entry.field,fields.rawValue).valid;
    const band=result.observedBands.find(band=>covers(entry,band));
    if(!readable && band && (entry.field || fields.requiresStatReview || fields.rawValue)) candidates.push({band,entry,kind:'unreadableRow'});
  }
  for(const band of result.unmatchedBands)if(!candidates.some(candidate=>candidate.band.id===band.id))candidates.push({band,entry:null,kind:'missingRow'});
  result.retryRegions=candidates.slice(0,2).map(({band,entry,kind},index)=>{
    const y0=Math.max(0,Math.floor(Math.min(band.y0,entry?.box.y0??band.y0)-glyphHeight*.35));
    const y1=Math.min(height,Math.ceil(Math.max(band.y1,entry?.box.y1??band.y1)+glyphHeight*.35));
    const nextRow=rows.filter(row=>center(row.box)>(band.y0+band.y1)/2).sort((a,b)=>center(a.box)-center(b.box))[0];
    return {id:`row-${index}`,kind,bandId:band.id,sourceOrdinal:entry?.row.ordinal??null,insertBeforeOrdinal:nextRow?.row.ordinal??null,
      label:entry?.field?.label??null,box:{x0:0,y0,x1:width,y1},region:{x:0,y:Math.floor(y0/scale),width:Math.ceil(width/scale),height:Math.ceil(y1/scale)-Math.floor(y0/scale)}};
  });
  result.status=result.retryRegions.length?'possibleMissingRows':'observedRowsCovered';
  result.anchorCount=anchors.length;result.glyphHeight=glyphHeight;result.inspectedWindow={y0:top,y1:bottom};
  if(candidates.length>2)result.issues.push('additionalUncertainRowsNotRetried');
  return result;
}
