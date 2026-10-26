// Independently invented image geometry. This verifies conservative software
// behavior, not Tesseract accuracy or any held-out screenshot performance.
import test from 'node:test';
import assert from 'node:assert/strict';
import { assessStatRowCoverage } from '../public/domain/ocr-row-coverage.js';
import { proposeRecoveredRow, applyPanelRowRecovery } from '../public/domain/ocr-row-recovery.js';
import { createComparisonReader } from '../public/ocr-reader.js';
import { inferAttackRoles } from '../public/domain/automatic-equipment-metadata.js';

const word=(text,x,y,evidence)=>({text,bbox:{x0:x,y0:y,x1:x+35,y1:y+10},...(evidence?{fieldEvidence:{status:evidence}}:{})});
const line=(label,value,y=10,baseEvidence='neutralOnly',labelEvidence)=>({text:`${label} ${value}`,words:[word(label,15,y,labelEvidence),word(value,220,y,baseEvidence)]});
const panel=lines=>({id:'current',rawText:lines.map(l=>l.text).join('\n'),structuredLines:lines,lines:lines.map(l=>({rawText:l.text}))});
const target={id:'row',kind:'missingRow',sourceOrdinal:null,insertBeforeOrdinal:1,label:null};
const raster=ys=>{const width=300,height=160,data=new Uint8ClampedArray(width*height*4);for(const y0 of ys)for(let y=y0;y<y0+10;y++)for(const [start,end] of [[15,50],[220,245]])for(let x=start;x<end;x++){const i=(y*width+x)*4;data.set([240,240,240,255],i);}return {width,height,data};};
const draft=(ordinal,rawLabel,rawValue,extra={})=>({id:`draft-${ordinal}`,ordinal,rawLabel,rawValue,unit:'statPoint',confirmed:false,correction:null,provenance:{kind:'ocr',imageRevision:3,ordinal},...extra});

test('independent coverage: a bracketed omission yields retry but never a completeness certificate',()=>{
  const source=panel([line('Attack','45',10),line('Evasion','10',90)]),before=structuredClone(source);
  const result=assessStatRowCoverage({raster:raster([10,50,90]),panel:source});
  assert.equal(result.status,'possibleMissingRows');assert.equal(result.complete,false);
  assert.equal(result.unmatchedBands.length,1);assert.equal(result.retryRegions.length,1);
  assert.equal(result.retryRegions[0].sourceOrdinal,null);assert.equal(result.retryRegions[0].insertBeforeOrdinal,1);
  assert.ok(result.issues.includes('edgeRowsUncertified'));assert.deepEqual(source,before);
});

test('independent coverage: covered rows and ink beyond first/last anchors cannot imply complete list',()=>{
  const source=panel([line('Attack','45',30),line('Evasion','10',90)]);
  const result=assessStatRowCoverage({raster:raster([0,30,90,140]),panel:source});
  assert.equal(result.status,'observedRowsCovered');assert.equal(result.complete,false);
  assert.equal(result.observedBands.length,2);assert.equal(result.retryRegions.length,0);
});

test('independent coverage: retry budget is two and scaled crop coordinates remain bounded',()=>{
  const source=panel([line('Attack','45',10),line('Evasion','10',140)]);
  const result=assessStatRowCoverage({raster:raster([10,40,70,100,140]),panel:source,scale:2});
  assert.equal(result.unmatchedBands.length,3);assert.equal(result.retryRegions.length,2);
  assert.ok(result.issues.includes('additionalUncertainRowsNotRetried'));
  for(const retry of result.retryRegions){assert.ok(retry.region.y>=0);assert.ok(retry.region.y+retry.region.height<=80);assert.equal(retry.region.width,150);}
});

test('independent coverage: invalid raster or a single anchor abstains instead of assuming six stats',()=>{
  for(const source of [panel([line('Attack','45',10)]),panel([])]){
    const result=assessStatRowCoverage({raster:raster([10,50]),panel:source});
    assert.equal(result.status,'unknown');assert.equal(result.complete,false);assert.deepEqual(result.retryRegions,[]);
  }
  const result=assessStatRowCoverage({raster:{width:300,height:160,data:new Uint8Array(4)},panel:panel([line('Attack','45',10),line('Evasion','10',90)])});
  assert.equal(result.status,'unknown');assert.ok(result.issues.includes('rasterUnavailable'));
});

test('independent recovery: label evidence cannot substitute for numeric base boundary evidence',()=>{
  const result=proposeRecoveredRow(panel([line('Attack','45',10,null,'neutralOnly')]),target);
  assert.equal(result.status,'unresolved');assert.equal(result.proposal,null);
});

test('independent recovery: unknown second row makes narrow retry ambiguous',()=>{
  for(const second of [line('Mystery','17',40),line('Mystery','?',40)]){
    const result=proposeRecoveredRow(panel([line('Attack','45'),second]),target);
    assert.equal(result.status,'unresolved');assert.equal(result.proposal,null);
  }
});

test('independent recovery: evidence-backed base is unconfirmed and never substitutes comparison delta',()=>{
  const original=panel([line('Attack','45')]);const before=structuredClone(original);
  const accepted=proposeRecoveredRow(original,{...target,label:'Attack'});
  assert.equal(accepted.status,'proposed');assert.equal(accepted.proposal.rawValue,'45');assert.deepEqual(original,before);
  const conflict=proposeRecoveredRow(original,{...target,label:'Evasion'});assert.equal(conflict.status,'conflict');
  const source=panel([{text:'Attack 45 7',words:[word('Attack',15,10),word('45',220,10,'neutralOnly'),word('7',265,10,'comparisonOnly')]}]);
  const recovered=proposeRecoveredRow(source,target);assert.equal(recovered.proposal.rawValue,'45');assert.equal(recovered.proposal.comparisonText,'7');
});

test('independent recovery: valid, corrected, confirmed and manual records survive retry adoption',()=>{
  const records=[draft(0,'Attack','45'),draft(1,'Evasion','',{correction:{rawValue:'12'}}),draft(2,'Evasion','',{confirmed:true}),draft(3,'Evasion','',{provenance:{kind:'manual'}})];
  const attempts=records.map(record=>({target:{...target,sourceOrdinal:record.ordinal},status:'proposed',proposal:{rawLabel:'Attack',rawValue:'999',unit:'statPoint'}}));
  const before=structuredClone(records),result=applyPanelRowRecovery(records,{id:'current',rowRecovery:{imageRevision:3,attempts}});
  assert.deepEqual(result,before);assert.deepEqual(records,before);
});

test('independent recovery: failed missing-row retry becomes required blank rather than zero or discarded evidence',()=>{
  const records=[draft(0,'Attack','45'),draft(1,'Evasion','10')];
  const result=applyPanelRowRecovery(records,{id:'current',rowRecovery:{imageRevision:3,attempts:[{target,status:'unresolved',proposal:null,observation:{rawText:'?'}}]}},{idPrefix:'independent'});
  assert.equal(result.length,3);const blank=result[1];assert.equal(blank.rawValue,'');assert.equal(blank.confirmed,false);assert.equal(blank.otherReading,false);assert.equal(blank.coveragePlaceholder,true);
  assert.equal(blank.provenance.rowRecovery.retryObservation.rawText,'?');assert.deepEqual(records,[draft(0,'Attack','45'),draft(1,'Evasion','10')]);
});

test('independent recovery: lower recovered Attack is positioned in original coordinates before role inference',()=>{
  const original=draft(0,'Attack','45',{provenance:{kind:'ocr',imageRevision:3,observation:{words:[word('45',220,30)]}}});
  const proposal=proposeRecoveredRow(panel([line('Attack','9',3)]),target).proposal;
  const p={id:'current',rowRecovery:{imageRevision:3,scale:2,attempts:[{target:{...target,insertBeforeOrdinal:null,region:{x:0,y:50,width:150,height:10}},status:'proposed',proposal,observation:{scale:3}}]}};
  const adopted=applyPanelRowRecovery([original],p,{idPrefix:'independent'}),roles=inferAttackRoles(adopted);
  assert.equal(adopted[1].provenance.observation.words[0].bbox.y0,102);
  assert.equal(adopted[1].provenance.rowRecovery.retryProposal.observation.words[0].bbox.y0,3);
  assert.deepEqual(roles.map(r=>r.sourceRole),['main','sub']);
  delete p.rowRecovery.scale;
  assert.deepEqual(inferAttackRoles(applyPanelRowRecovery([original],p,{idPrefix:'independent'})).map(r=>r.sourceRole),['main','sub']);
});

// Exercise the actual asynchronous reader at its new retry boundary, rather
// than testing only an AbortController that was already aborted before work.
function pendingRetryFixture({rejectRetry=false}={}) {
  let resolveEntered,finishRetry,terminated=0,calls=0;
  const entered=new Promise(resolve=>{resolveEntered=resolve;});
  const retry=new Promise(resolve=>{finishRetry=resolve;});
  const rows=[line('Attack','45',30),line('Evasion','10',180)];
  for(const row of rows) {
    const base=row.words[1];base.symbols=[...base.text].map((text,index)=>({text,bbox:{x0:220+index*10,y0:base.bbox.y0,x1:230+index*10,y1:base.bbox.y1}}));
  }
  const data={text:rows.map(r=>r.text).join('\n'),blocks:[{paragraphs:[{lines:rows}]}]};
  const worker={setParameters:async()=>{},terminate:async()=>{terminated++;},recognize:async()=>{
    calls++;if(calls===1)return {data:{text:'',blocks:null}};
    if(calls===2)return {data};
    resolveEntered();if(rejectRetry)throw new Error('PRIVATE RETRY ERROR');
    return retry;
  }};
  const canvases=[];
  const reader=createComparisonReader({loadTesseract:async()=>({createWorker:async()=>worker}),createCanvas:()=>{
    const canvas={width:0,height:0,getContext:()=>({drawImage(){},getImageData(){
      const image={width:canvas.width,height:canvas.height,data:new Uint8ClampedArray(canvas.width*canvas.height*4)};
      for(const y0 of [30,100,180])for(let y=y0;y<y0+10&&y<image.height;y++)for(const [left,right] of [[15,50],[220,255]])for(let x=left;x<right&&x<image.width;x++)image.data.set([240,240,240,255],(y*image.width+x)*4);
      return image;
    }})};canvases.push(canvas);return canvas;
  }});
  return {reader,entered,finishRetry,canvases,get terminated(){return terminated;},get calls(){return calls;}};
}
const reviewed={inputRevision:3,regions:[{id:'left',region:{x:0,y:0,width:100,height:100}}]};

test('independent reader: cancellation during a pending row retry rejects and disposes its worker/raster',{timeout:5000},async()=>{
  const f=pendingRetryFixture(),controller=new AbortController();
  const running=f.reader({width:100,height:100},{...reviewed,signal:controller.signal});
  await f.entered;controller.abort();
  await assert.rejects(running,{name:'AbortError'});
  assert.ok(f.terminated>=1);assert.ok(f.canvases.every(c=>c.width===0&&c.height===0));
  f.finishRetry({data:{text:'Attack 999',blocks:null}});
});

test('independent reader: superseding a generation while a row retry completes cannot return stale values',{timeout:5000},async()=>{
  const f=pendingRetryFixture();let current=true;
  const running=f.reader({width:100,height:100},{...reviewed,isCurrent:()=>current});
  await f.entered;current=false;f.finishRetry({data:{text:'Attack 999',blocks:null}});
  await assert.rejects(running,{name:'AbortError'});
  assert.ok(f.terminated>=1);assert.ok(f.canvases.every(c=>c.width===0&&c.height===0));
});

test('independent reader: retry failure retains the original transcript and an unresolved review request',{timeout:5000},async()=>{
  const f=pendingRetryFixture({rejectRetry:true});
  const result=await f.reader({width:100,height:100},reviewed);
  assert.equal(f.calls,3);assert.equal(result.proposedPanels[0].rawText,'Attack 45\nEvasion 10');
  const attempt=result.proposedPanels[0].rowRecovery.attempts[0];
  assert.equal(attempt.status,'unresolved');assert.deepEqual(attempt.issues,['rowRetryFailed']);
  assert.ok(!JSON.stringify(result).includes('PRIVATE'));assert.equal(result.proposedPanels[0].rowCoverage.complete,false);
});
