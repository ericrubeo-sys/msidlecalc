import test from 'node:test';
import assert from 'node:assert/strict';
import { adjustCrop } from '../public/domain/crop-geometry.js';
import { openCropEditor } from '../public/crop-editor.js';
import { createComparisonReader } from '../public/ocr-reader.js';

// This narrow DOM double verifies event/state behavior, not browser layout,
// touch ergonomics, native dialog semantics, or canvas visual appearance.
function editorFixture(regions = [{x:20,y:20,width:80,height:80},{x:150,y:20,width:80,height:80}]) {
  const prior = globalThis.document;
  const nodes = new Map(), applied = [], draws = [];
  let closes = 0, focused = null, dialog;
  const make = (key = '') => ({
    key, value: key === '#crop-target' ? 'move' : '', checked:false, hidden:false, disabled:false,
    dataset: key.startsWith('direction:') ? {direction:key.slice(10)} : {},
    width:800,height:500,isConnected:true,listeners:new Map(), attributes:{},
    addEventListener(type, fn) { this.listeners.set(type, fn); },
    fire(type = 'click', extra = {}) { if(type==='click' && this.disabled)return; const event = {target:this,preventDefault(){},...extra}; this.listeners.get(type)?.(event); },
    setAttribute(name,value) {this.attributes[name]=value;},
    focus() {focused=this;}, matches(selector) {return selector==='select,input' && ['#crop-target','#crop-fine'].includes(key);},
    getContext() {return {fillRect(){},strokeRect(){},fillText(){},setLineDash(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},drawImage(...args){draws.push(args);}};},
    querySelector(selector) {if(!nodes.has(selector)) nodes.set(selector,make(selector));return nodes.get(selector);},
    querySelectorAll(selector) {return selector === '[data-direction]' ? ['up','left','down','right'].map(d=>{const key='direction:'+d;if(!nodes.has(key))nodes.set(key,make(key));return nodes.get(key);}) : [];},
    showModal(){this.open=true;},close(){this.open=false;},remove(){this.isConnected=false;}
  });
  const launcher=make('launcher');
  globalThis.document={activeElement:launcher,body:{append(){}},createElement(){dialog=make('dialog');return dialog;}};
  let controller;
  try {controller=openCropEditor({image:{width:300,height:200},regions,onApply:r=>applied.push(r),onClose:()=>closes++});}
  catch(error) {globalThis.document=prior;throw error;}
  return {nodes,applied,draws,dialog,controller,launcher,get closes(){return closes;},get focused(){return focused;},
    node:selector=>dialog.querySelector(selector),direction:d=>nodes.get('direction:'+d),
    cleanup(){controller.close();globalThis.document=prior;}};
}

test('fine adjustment permits one-original-pixel corrections at large image sizes',()=>{
  const region={x:100,y:100,width:300,height:200};
  for(const [direction,key,sign] of [['left','x',-1],['right','x',1],['up','y',-1],['down','y',1]]) {
    const next=adjustCrop(region,{width:4000,height:1700,direction,fine:true});
    assert.equal(next[key],region[key]+sign);
  }
});

test('all tap actions preserve bounded integer geometry and opposite edges',()=>{
  for(const [width,height] of [[8,8],[37,19],[1280,590],[4000,1700]]) {
    for(const target of ['move','left','right','top','bottom']) {
      let crop={x:0,y:0,width:Math.max(8,Math.floor(width/2)),height:Math.max(8,Math.floor(height/2))};
      for(let i=0;i<600;i++) {
        const before={...crop}, direction=['right','down','left','up'][Math.floor(i/37)%4];
        crop=adjustCrop(crop,{width,height,target,direction,fine:i%2===0});
        assert.ok(Object.values(crop).every(Number.isInteger));
        assert.ok(crop.x>=0 && crop.y>=0 && crop.width>=8 && crop.height>=8 && crop.x+crop.width<=width && crop.y+crop.height<=height);
        if(target==='move') {assert.equal(crop.width,before.width);assert.equal(crop.height,before.height);}
        if(target==='left') assert.equal(crop.x+crop.width,before.x+before.width);
        if(target==='top') assert.equal(crop.y+crop.height,before.y+before.height);
        if(target==='right') assert.equal(crop.x,before.x);
        if(target==='bottom') assert.equal(crop.y,before.y);
      }
    }
  }
});

test('two-step cancel never mutates supplied regions or calls apply, and returns focus once',()=>{
  const original=[{x:20,y:20,width:80,height:80},{x:150,y:20,width:80,height:80}], snapshot=structuredClone(original);
  const f=editorFixture(original);
  try {
    f.direction('right').fire();f.node('[data-crop="next"]').fire();f.direction('down').fire();
    f.dialog.fire('cancel');
    assert.deepEqual(original,snapshot);assert.deepEqual(f.applied,[]);assert.equal(f.closes,1);assert.equal(f.focused,f.launcher);
    f.controller.close();assert.equal(f.closes,1);
  } finally {f.cleanup();}
});

test('back preserves first draft, reset affects only active area, final apply is explicit',()=>{
  const f=editorFixture();
  try {
    f.direction('right').fire();f.node('[data-crop="next"]').fire();f.direction('down').fire();
    f.node('[data-crop="back"]').fire();f.node('[data-crop="reset"]').fire();
    assert.equal(f.applied.length,0);
    f.node('[data-crop="next"]').fire();f.node('[data-crop="next"]').fire();
    assert.equal(f.applied.length,1);assert.deepEqual(f.applied[0][0],{x:20,y:20,width:80,height:80});
    assert.deepEqual(f.applied[0][1],{x:150,y:24,width:80,height:80});
  } finally {f.cleanup();}
});

test('edge controls disable irrelevant axes and keyboard does not hijack native select',()=>{
  const f=editorFixture();
  try {
    const target=f.node('#crop-target');target.value='top';target.fire('change');
    assert.equal(f.direction('left').disabled,true);assert.equal(f.direction('up').disabled,false);
    f.dialog.fire('keydown',{target,key:'ArrowDown'});
    f.node('[data-crop="next"]').fire();f.node('[data-crop="next"]').fire();
    assert.equal(f.applied[0][0].y,20);
  } finally {f.cleanup();}
});

test('identical areas cannot be committed as two item areas',()=>{
  const f=editorFixture([{x:20,y:20,width:80,height:80},{x:20,y:20,width:80,height:80}]);
  try {f.node('[data-crop="next"]').fire();f.node('[data-crop="next"]').fire();assert.equal(f.applied.length,0);}
  finally {f.cleanup();}
});

test('small nudges keep the enlarged image frame stable rather than refitting every tap',()=>{
  const f=editorFixture();
  try {
    const frame=f.draws.at(-1).slice(1,5);
    f.direction('right').fire();
    assert.deepEqual(f.draws.at(-1).slice(1,5),frame);
    f.direction('down').fire();
    assert.deepEqual(f.draws.at(-1).slice(1,5),frame);
  } finally {f.cleanup();}
});

test('too-small images reject before constructing an invalid editor',()=>{
  assert.throws(()=>openCropEditor({image:{width:8,height:8},regions:[],onApply(){}}),TypeError);
});

test('narrow detector proposals become usable bounded drafts before any tap',()=>{
  const supplied=[{x:299,y:199,width:1,height:1},null], snapshot=structuredClone(supplied);
  const f=editorFixture(supplied);
  try {
    assert.doesNotThrow(()=>f.direction('left').fire());
    f.node('[data-crop="next"]').fire();f.node('[data-crop="next"]').fire();
    assert.equal(f.applied.length,1);
    assert.ok(f.applied[0][0].width>=8 && f.applied[0][0].height>=8);
    assert.deepEqual(supplied,snapshot);
  } finally {f.cleanup();}
});

test('cancellation while alternative detection is pending returns no stale proposals',async()=>{
  const controller=new AbortController();
  let count=0, terminations=0, resolveAlternative;
  const canvases=[];
  const worker={setParameters:async()=>{},terminate:async()=>{terminations++;},recognize:async()=>{
    if(++count===1)return {data:{text:'first raw',blocks:null}};
    return new Promise(resolve=>{resolveAlternative=resolve;});
  }};
  const reader=createComparisonReader({loadTesseract:async()=>({createWorker:async()=>worker}),createCanvas:()=>{
    const canvas={width:0,height:0,getContext:()=>({drawImage(){}})};canvases.push(canvas);return canvas;
  }});
  const task=reader({width:300,height:200},{signal:controller.signal,onProgress:()=>{}});
  for(let i=0;!resolveAlternative && i<100;i++)await Promise.resolve();
  assert.ok(resolveAlternative,'alternative recognition reached');controller.abort();
  await assert.rejects(task,{name:'AbortError'});
  resolveAlternative({data:{text:'late raw',blocks:null}});
  assert.equal(count,2);assert.ok(terminations>=1);assert.ok(canvases.every(c=>c.width===0 && c.height===0));
});
