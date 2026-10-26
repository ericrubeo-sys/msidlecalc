import test from 'node:test';
import assert from 'node:assert/strict';
import { assessStatRowCoverage } from '../public/domain/ocr-row-coverage.js';
import { proposeRecoveredRow, applyPanelRowRecovery } from '../public/domain/ocr-row-recovery.js';
import { createComparisonReader } from '../public/ocr-reader.js';

const word=(text,x,y,w=22,h=8)=>({text,bbox:{x0:x,y0:y,x1:x+w,y1:y+h}});
const row=(label,value,y)=>({text:`${label} ${value}`,words:[word(label,5,y,45),word(value,73,y,18)]});
const panel=rows=>({id:'test',rawText:rows.map(row=>row.text).join('\n'),lines:rows.map(row=>({rawText:row.text})),structuredLines:rows});
const raster=(ys,{width=100,height=100,color=[235,235,235,255]}={})=>{
  const data=new Uint8ClampedArray(width*height*4);
  for(const y of ys) for(let yy=y;yy<y+8;yy++)for(const [left,right] of [[5,50],[73,91]])for(let x=left;x<right;x++)for(let c=0;c<4;c++)data[(yy*width+x)*4+c]=color[c];
  return {width,height,data};
};
const covered=()=>({raster:raster([10,35,60]),panel:panel([row('Attack','100',10),row('Critical Rate','5%',35),row('Max HP','200',60)])});
const validRetry=(label='Critical Rate',value='5%')=>{
  const input=panel([row(label,value,4)]);
  input.structuredLines[0].words[1].fieldEvidence={status:'neutralOnly'};
  return input;
};

test('coverage detects an independent omitted middle row without assuming an item row count',()=>{
  const input=covered();input.panel=panel([row('Attack','100',10),row('Max HP','200',60)]);
  const before=structuredClone(input.panel),result=assessStatRowCoverage(input);
  assert.equal(result.status,'possibleMissingRows');assert.equal(result.complete,false);
  assert.equal(result.observedBands.length,3);assert.equal(result.unmatchedBands.length,1);
  assert.equal(result.retryRegions[0].kind,'missingRow');assert.equal(result.retryRegions[0].sourceOrdinal,null);
  assert.ok(result.retryRegions[0].region.y<=35);assert.ok(result.retryRegions[0].region.y+result.retryRegions[0].region.height>=43);
  assert.deepEqual(input.panel,before);
});

test('coverage retries a recognizable unreadable row as well as completely omitted bands',()=>{
  const input=covered();input.panel.structuredLines[1].text='Critical Rate ?';input.panel.structuredLines[1].words[1].text='?';
  input.panel.rawText=input.panel.structuredLines.map(row=>row.text).join('\n');input.panel.lines=input.panel.structuredLines.map(row=>({rawText:row.text}));
  const result=assessStatRowCoverage(input);
  assert.equal(result.retryRegions.length,1);assert.equal(result.retryRegions[0].sourceOrdinal,1);
  assert.equal(result.retryRegions[0].label,'Critical Rate');assert.equal(result.retryRegions[0].kind,'unreadableRow');
});

test('observed row coverage is never semantic completeness and does not manufacture edge rows',()=>{
  for(const ys of [[10,60],[10,35,60],[10,25,40,55,70]]) {
    const input={raster:raster(ys),panel:panel(ys.map((y,index)=>row(index?'Max HP':'Attack',String(index+10),y)))};
    const result=assessStatRowCoverage(input);assert.equal(result.status,'observedRowsCovered');assert.equal(result.complete,false);
    assert.equal(result.retryRegions.length,0);assert.ok(result.issues.includes('edgeRowsUncertified'));
  }
  const input=covered();input.raster=raster([0,10,35,60,85]);
  assert.equal(assessStatRowCoverage(input).retryRegions.length,0);
});

test('coverage refuses anchorless, blank, colored-only and malformed raster evidence',()=>{
  const valid=covered();
  for(const input of [
    {raster:valid.raster,panel:panel([row('Mystery','10',10),row('Unknown','20',60)])},
    {...valid,raster:raster([])},
    {...valid,raster:raster([10,35,60],{color:[245,50,50,255]})},
    {...valid,raster:{width:100,height:100,data:new Uint8Array(3)}},
    {...valid,raster:undefined},
    {...valid,panel:{id:'x',lines:[{rawText:'Attack 100'}]}}
  ]) {const result=assessStatRowCoverage(input);assert.equal(result.status,'unknown');assert.equal(result.complete,false);assert.equal(result.retryRegions.length,0);}
});

test('row retry is a strictly unconfirmed typed proposal, preserving comparison evidence',()=>{
  const target={label:'Critical Rate',sourceOrdinal:1},source=validRetry();
  const before=structuredClone(source),result=proposeRecoveredRow(source,target);
  assert.equal(result.status,'proposed');assert.equal(result.proposal.rawValue,'5%');
  assert.equal(result.proposal.unit,'displayPercent');assert.deepEqual(source,before);
  assert.equal(proposeRecoveredRow(validRetry('Max HP','30'),target).status,'conflict');
  const raw=validRetry();delete raw.structuredLines[0].words[1].fieldEvidence;
  assert.equal(proposeRecoveredRow(raw,target).status,'unresolved');
  const merged=validRetry('Critical Rate','5%5%');
  assert.equal(proposeRecoveredRow(merged,target).status,'unresolved');
});

test('row adoption preserves manual corrections and valid values, leaves failed rows empty and never confirms',()=>{
  const target={id:'row-0',kind:'unreadableRow',sourceOrdinal:1,label:'Critical Rate'};
  const proposal=proposeRecoveredRow(validRetry(),target).proposal;
  const p={id:'test',rowRecovery:{imageRevision:2,attempts:[{target,status:'proposed',proposal,observation:{rawText:'Critical Rate 5%'}}]}};
  const records=[{id:'a',ordinal:1,rawText:'Critical Rate ?',rawLabel:'Critical Rate',rawValue:'',unit:'unknown',otherReading:true,confirmed:false,provenance:{kind:'ocr',imageRevision:2}}];
  const before=structuredClone(records),adopted=applyPanelRowRecovery(records,p,{idPrefix:'test'});
  assert.equal(adopted[0].rawValue,'5%');assert.equal(adopted[0].rawText,'Critical Rate ?');assert.equal(adopted[0].confirmed,false);assert.equal(adopted[0].otherReading,false);
  assert.equal(adopted[0].provenance.rowRecovery.originalFields.rawValue,'');assert.deepEqual(records,before);
  for(const override of [{rawValue:'7%'},{correction:{rawValue:'8%'}},{confirmed:true},{provenance:{kind:'manual'}},{provenance:undefined}]) {
    const input=[{...records[0],...override}];assert.deepEqual(applyPanelRowRecovery(input,p,{idPrefix:'test'}),input);
  }
  p.rowRecovery.attempts[0].status='unresolved';assert.equal(applyPanelRowRecovery(records,p,{idPrefix:'test'})[0].rawValue,'');
});

test('an unresolved missed row becomes one empty visible draft at its geometric insertion point',()=>{
  const records=[{id:'a',ordinal:0,rawLabel:'Attack',rawValue:'10'},{id:'b',ordinal:1,rawLabel:'Max HP',rawValue:'30'}];
  const p={id:'x',rowRecovery:{imageRevision:2,attempts:[{target:{sourceOrdinal:null,insertBeforeOrdinal:1},status:'unresolved'}]}};
  const result=applyPanelRowRecovery(records,p,{idPrefix:'draft'});
  assert.equal(result.length,3);assert.equal(result[1].id,'draft-row-recovery-0');
  assert.equal(result[1].rawLabel,'');assert.equal(result[1].rawValue,'');assert.equal(result[1].otherReading,false);assert.equal(result[1].confirmed,false);
  assert.equal(result[1].coveragePlaceholder,true);
  assert.throws(()=>applyPanelRowRecovery(records,p,{idPrefix:'bad:id'}),TypeError);
});

test('reader without pixel API keeps legacy proposals and does not trigger speculative row retries',async()=>{
  const calls=[];const worker={setParameters:async value=>calls.push(value),recognize:async()=>({data:{text:'',blocks:null}}),terminate:async()=>{}};
  const reader=createComparisonReader({loadTesseract:async()=>({createWorker:async()=>worker}),createCanvas:()=>({width:0,height:0,getContext:()=>({drawImage(){}})})});
  const result=await reader({width:100,height:100},{regions:[{id:'left',region:{x:0,y:0,width:100,height:100}}]});
  assert.equal(result.proposedPanels[0].rowCoverage.complete,false);
  assert.equal(result.proposedPanels[0].rowRecovery.attempts.length,0);
  assert.ok(!calls.some(value=>value.tessedit_pageseg_mode==='7'));
});
