import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { openCropEditor } from '../public/crop-editor.js';
import { assessCropCoverage } from '../public/domain/crop-coverage.js';

// State/event double only: this cannot certify Safari gestures or touch usability.
function fixture(regions=[]) {
  const saved={document:globalThis.document,window:globalThis.window,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
  const timers=new Map(),nodes=new Map(),applied=[];let next=0;
  const make=(key='')=>({key,value:key==='#crop-target'?'move':'',checked:false,disabled:false,isConnected:true,
    dataset:key.startsWith('direction:')?{direction:key.slice(10)}:{},listeners:new Map(),width:800,height:500,
    addEventListener(type,fn,options){const list=this.listeners.get(type)||[];list.push(fn);this.listeners.set(type,list);options?.signal?.addEventListener('abort',()=>this.listeners.set(type,(this.listeners.get(type)||[]).filter(x=>x!==fn)),{once:true});},
    fire(type='click',extra={}){if(type==='click'&&this.disabled)return;for(const fn of this.listeners.get(type)||[])fn({target:this,preventDefault(){},...extra});},
    setAttribute(){},focus(){},matches(s){return s==='select,input'&&['#crop-target','#crop-fine'].includes(key);},
    getContext:()=>({fillRect(){},strokeRect(){},fillText(){},setLineDash(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},drawImage(){}}),
    querySelector(selector){if(!nodes.has(selector))nodes.set(selector,make(selector));return nodes.get(selector);},
    querySelectorAll:()=>['up','left','down','right'].map(d=>{const k='direction:'+d;if(!nodes.has(k))nodes.set(k,make(k));return nodes.get(k);}),
    showModal(){},close(){this.fire('close');},remove(){this.isConnected=false;}});
  const dialog=make('dialog'),doc=make('document'),win=make('window');
  Object.assign(doc,{activeElement:make('launcher'),body:{append(){}},createElement:()=>dialog});
  globalThis.document=doc;globalThis.window=win;
  globalThis.setTimeout=(fn,ms)=>{timers.set(++next,{fn,ms});return next;};globalThis.clearTimeout=id=>timers.delete(id);
  const controller=openCropEditor({image:{width:1000,height:600},regions,onApply:r=>applied.push(r)});
  return {dialog,doc,win,timers,applied,node:s=>dialog.querySelector(s),arrow:d=>nodes.get('direction:'+d),
    tick(){const [id,t]=timers.entries().next().value;timers.delete(id);t.fn();return t.ms;},
    finish(){dialog.querySelector('[data-crop="next"]').fire();dialog.querySelector('[data-crop="next"]').fire();},
    cleanup(){controller.close();Object.assign(globalThis,saved);}};
}
const initial=[{x:200,y:150,width:200,height:200},{x:500,y:150,width:200,height:200}];

test('editor tap, held press and keyboard activation each use the intended movement path',()=>{
  const f=fixture(initial);
  try {
    const right=f.arrow('right');right.fire('pointerdown');right.fire('pointerup');right.fire('click',{detail:1});
    right.fire('pointerdown');assert.equal(f.tick(),400);assert.equal(f.tick(),100);right.fire('pointerup');right.fire('click',{detail:1});
    right.fire('click',{detail:0});f.finish();
    assert.equal(f.applied[0][0].x,280,'four coarse movements, no held-release fifth movement');
    assert.equal(f.timers.size,0);
  }finally{f.cleanup();}
});

test('each editor interruption cancels held movement and invalidates a queued tick',()=>{
  const interruptions=[f=>f.arrow('right').fire('pointercancel'),f=>f.arrow('right').fire('pointerleave'),f=>f.arrow('right').fire('lostpointercapture'),f=>f.win.fire('pointerup'),f=>f.win.fire('blur'),f=>f.doc.fire('visibilitychange'),f=>f.node('#crop-fine').fire('change'),f=>f.node('#crop-target').fire('change'),f=>f.node('[data-crop="reset"]').fire()];
  for(const interrupt of interruptions){const f=fixture(initial);try{
    f.arrow('right').fire('pointerdown');const late=f.timers.values().next().value.fn;interrupt(f);late();
    assert.equal(f.timers.size,0);f.finish();assert.equal(f.applied[0][0].x,200);
  }finally{f.cleanup();}}
});

test('closing the dialog cancels repeats and removes global interruption listeners',()=>{
  const f=fixture(initial);try{
    f.arrow('right').fire('pointerdown');f.tick();const late=f.timers.values().next().value.fn;
    f.node('[data-crop="cancel"]').fire();late();assert.equal(f.timers.size,0);assert.equal(f.applied.length,0);
    for(const surface of [f.doc,f.win])assert.ok([...surface.listeners.values()].every(list=>list.length===0));
  }finally{f.cleanup();}
});

test('missing second area starts beside the reviewed first, preserving subsequent Back/Next edits',()=>{
  const f=fixture([initial[0]]);try{
    f.node('#crop-fine').checked=true;f.arrow('right').fire('click',{detail:0});f.node('[data-crop="next"]').fire();
    f.arrow('down').fire('click',{detail:0});f.node('[data-crop="back"]').fire();f.arrow('right').fire('click',{detail:0});
    f.node('[data-crop="next"]').fire();f.node('[data-crop="next"]').fire();
    assert.deepEqual(f.applied[0],[{x:202,y:150,width:200,height:200},{x:401,y:151,width:200,height:200}]);
  }finally{f.cleanup();}
});

test('valid supplied second area survives reviewed-first nudges and navigation',()=>{
  const f=fixture(initial);try{f.arrow('right').fire('click',{detail:0});f.finish();assert.deepEqual(f.applied[0][1],initial[1]);}finally{f.cleanup();}
});

test('a second-area seed at the image edge remains uncommittable when it overlaps the equipped area',()=>{
  const f=fixture([{x:800,y:150,width:200,height:200}]);try{
    f.node('[data-crop="next"]').fire();assert.equal(f.node('[data-crop="next"]').disabled,true);f.node('[data-crop="next"]').fire();assert.equal(f.applied.length,0);
  }finally{f.cleanup();}
});

test('coverage advisory ignores an outside delta and never copies neighboring stat labels',()=>{
  const word=(text,x,y,w)=>({text,bbox:{x0:x,y0:y,x1:x+w,y1:y+10}});
  const words=[40,80].flatMap(y=>[word('Unrelated',70,y,30),word('Inside',120,y,50),word('12',240,y,20),word('-3',310,y,20)]);
  const blocks=[{paragraphs:[{lines:[{words}]}]}];
  assert.deepEqual(assessCropCoverage({blocks,width:500,height:200,region:{x:110,y:20,width:190,height:150}}),[]);
});

test('double-tap gesture policy is scoped to crop buttons without disabling viewport zoom',async()=>{
  const styles=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
  const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
  const viewport=html.match(/<meta\s+name="viewport"\s+content="([^"]+)"/)[1];
  assert.match(styles,/\.crop-editor button\s*\{[^}]*touch-action\s*:\s*manipulation\s*;/);
  assert.doesNotMatch(viewport,/user-scalable\s*=\s*(?:no|0)|maximum-scale\s*=/i);
  assert.doesNotMatch(styles,/touch-action\s*:\s*none\s*[;}]/i);
});
