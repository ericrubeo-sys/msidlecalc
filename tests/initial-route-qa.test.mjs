import test from 'node:test';
import assert from 'node:assert/strict';
import { createComparisonReader } from '../public/ocr-reader.js';
import { assignComparisonLayout } from '../public/domain/comparison-layout.js';

// Injected OCR observations and a solid neutral raster exercise orchestration,
// not actual character recognition or physical-phone interaction.
const image = { width:1280, height:590 };
const box = (x0,y0,x1,y1)=>({x0,y0,x1,y1});
function local({ heading=true, labels=['Attack','Max HP','Evasion'], extra='' }={}) {
  const words = [];
  if (heading) words.push({text:'On-Equip Effect',bbox:box(20,20,190,40)});
  labels.forEach((label,i)=>{
    const y=80+i*60, text=String(10+i);
    words.push({text:label,bbox:box(20,y,200,y+20)});
    words.push({text,bbox:box(500,y,520,y+20),symbols:[...text].map((text,j)=>({text,bbox:box(500+j*10,y,509+j*10,y+20)}))});
  });
  if(extra) words.push({text:extra,bbox:box(20,350,200,370)});
  const text=words.map(word=>word.text).join(' ');
  return {text,blocks:[{paragraphs:[{lines:words.map(word=>({text:word.text,bbox:word.bbox,words:[word]}))}]}]};
}
const none = text=>({text,blocks:null,confidence:99});
function fixture(outputs) {
  const calls=[],canvases=[];
  let count=0,terminated=0;
  const worker={
    setParameters:async options=>calls.push({parameters:options}),
    recognize:async canvas=>{const index=count++;calls.push({recognize:index,width:canvas.width,height:canvas.height});const value=outputs[index]; if(typeof value==='function')return value();return {data:value??none('unexpected extra OCR')};},
    terminate:async()=>{terminated++;}
  };
  const reader=createComparisonReader({loadTesseract:async()=>({createWorker:async()=>worker}),createCanvas:()=>{
    const canvas={width:0,height:0,getContext:()=>({drawImage(){},getImageData:()=>({width:canvas.width,height:canvas.height,data:new Uint8ClampedArray(canvas.width*canvas.height*4).fill(255)})})};
    canvases.push(canvas);return canvas;
  }});
  return {reader,calls,canvases,get count(){return count;},get terminated(){return terminated;}};
}
const assertReleased=f=>{assert.ok(f.terminated>=1);assert.ok(f.canvases.every(canvas=>canvas.width===0&&canvas.height===0));};

test('initial upload recovers two locally evidenced areas without user regions or duplicate crop OCR',async()=>{
  const f=fixture([none('original whole'),none('alternate whole'),local({extra:'Mystery effect'}),local({labels:['Main Stat','Critical Rate','Damage']})]);
  const result=await f.reader(image,{inputRevision:7});
  assert.equal(assignComparisonLayout(result.proposedPanels).status,'assigned');
  assert.equal(result.route,'itemReview');
  assert.equal(result.recoveryAttempt.status,'accepted');
  assert.equal(f.count,4,'two whole-image attempts and exactly one OCR per seed');
  assert.equal(result.raw.text,'original whole');
  assert.equal(result.detectionObservations[1].raw.text,'alternate whole');
  assert.ok(result.proposedPanels[0].rawText.includes('Mystery effect'),'unrecognized effect preserved');
  assert.ok(result.proposedPanels.flatMap(panel=>panel.lines).every(line=>line.confirmed===false&&line.value===null&&line.provenance.inputRevision===7));
  assert.ok(result.proposedPanels.flatMap(panel=>panel.lines).every(line=>line.provenance.areaSource==='local-layout-hypothesis'&&line.provenance.segmentationIdentity.includes('local-panel-recovery-1')));
  assert.ok(result.proposedPanels.every(panel=>panel.requiresReview&&panel.role===null));
  assertReleased(f);
});

test('coordinates, high confidence, one item, or insufficient distinct stats cannot bypass fallback',async()=>{
  for(const pair of [[none('random'),none('random')],[local(),none('no second item')],[local(),local({labels:['Attack','Attack','Attack']})],[local(),local({heading:false})]]) {
    const f=fixture([none('initial evidence'),none('alternative evidence'),...pair]);
    const result=await f.reader(image);
    assert.equal(assignComparisonLayout(result.proposedPanels).status,'needsAreas');
    assert.equal(result.proposedPanels.length,0);
    assert.equal(result.route,'needsAreas');
    assert.equal(result.recoveryAttempt.status,'rejected');
    assert.equal(result.raw.text,'initial evidence');
    assert.equal(f.count,4);assertReleased(f);
  }
});

const headings=xs=>({text:'whole heading observations',blocks:[{paragraphs:[{lines:xs.map(x=>({text:'On-Equip Effect',bbox:box(x,60,x+100,80)}))}]}]});

test('rejected local pair preserves original partial proposal and its OCR rather than combining attempts',async()=>{
  const f=fixture([headings([300]),none('alternate'),none('original partial crop'),local(),none('unreadable second')]);
  const result=await f.reader(image);
  assert.equal(result.route,'needsAreas');
  assert.equal(result.recoveryAttempt.status,'rejected');
  assert.equal(result.proposedPanels.length,1);
  assert.equal(result.proposedPanels[0].rawText,'original partial crop');
  assert.equal(result.settings.detectionPsm,11);
  assert.equal(f.count,5);assertReleased(f);
});

test('ambiguous whole-image multi-item evidence is not overridden by a seeded pair',async()=>{
  const f=fixture([headings([100,500,900]),none('alternate'),none('first'),none('second'),none('third')]);
  const result=await f.reader(image);
  assert.equal(result.route,'needsAreas');
  assert.equal(result.proposedPanels.length,3);
  assert.equal(f.count,5,'two whole attempts and three original proposals, no seed OCR');
  assertReleased(f);
});

test('too-many-heading guard is not mistaken for no heading evidence during recovery',async()=>{
  const f=fixture([headings([100,300,500,700,900]),none('alternate'),local(),local()]);
  const result=await f.reader(image);
  assert.equal(result.route,'needsAreas');
  assert.equal(result.proposedPanels.length,0);
  assert.equal(f.count,2,'oversubscribed anchors must not authorize seed OCR');
  assertReleased(f);
});

test('independent whole-image clipping evidence vetoes an otherwise qualifying local pair',async()=>{
  const words=[];
  for(const y of [260,280]) {
    for(const [text,x0,x1] of [['Evasion',580,650],['100',800,820]]) words.push({text,bbox:box(x0*3,y*3,x1*3,(y+10)*3)});
  }
  const whole={text:'observed clipping',blocks:[{paragraphs:[{lines:words.map(word=>({text:word.text,bbox:word.bbox,words:[word]}))}]}]};
  const f=fixture([whole,none('alternate'),local(),local()]);
  const result=await f.reader(image);
  assert.equal(result.route,'needsAreas');assert.equal(result.recoveryAttempt.status,'rejected');
  assert.ok(result.recoveryAttempt.proposedPanels.some(panel=>panel.coverageIssues.some(issue=>issue.code==='possibleClippedLabels')));
  assert.equal(f.count,4);assertReleased(f);
});

test('reviewed crops bypass alternative detection and local recovery entirely',async()=>{
  const regions=[{id:'reviewed-left',region:{x:300,y:230,width:294,height:236}},{id:'reviewed-right',region:{x:594,y:230,width:294,height:236}}];
  const f=fixture([none('whole'),local(),local()]);
  const result=await f.reader(image,{regions});
  assert.deepEqual(result.proposedPanels.map(panel=>panel.region),regions.map(panel=>panel.region));
  assert.equal(f.count,3);
  assert.deepEqual(f.calls.filter(call=>call.parameters).map(call=>call.parameters.tessedit_pageseg_mode),['11','6']);
  assertReleased(f);
});

test('portrait, tiny and extreme-aspect images do not receive speculative local crops',async()=>{
  for(const dimensions of [{width:590,height:1280},{width:300,height:140},{width:1280,height:280}]) {
    const f=fixture([none('whole'),none('alternate')]);
    const result=await f.reader(dimensions);
    assert.equal(result.proposedPanels.length,0);assert.equal(f.count,2);assertReleased(f);
  }
});

test('abort during extra local OCR rejects promptly and disposes late results',async()=>{
  const controller=new AbortController();let finish,entered;
  const inLocal=new Promise(resolve=>{entered=resolve;});
  const f=fixture([none('whole'),none('alternate'),()=>{entered();return new Promise(resolve=>{finish=resolve;});},local()]);
  const pending=f.reader(image,{signal:controller.signal});
  await inLocal;controller.abort();
  await assert.rejects(pending,{name:'AbortError'});
  finish({data:local()});await Promise.resolve();
  assert.equal(f.count,3,'no second local pass starts after abort');assertReleased(f);
});

test('image revision becoming stale after first seed prevents adoption and second local OCR',async()=>{
  let current=true;
  const f=fixture([none('whole'),none('alternate'),()=>{current=false;return {data:local()};},local()]);
  await assert.rejects(f.reader(image,{isCurrent:()=>current}),{name:'AbortError'});
  assert.equal(f.count,3);assertReleased(f);
});
