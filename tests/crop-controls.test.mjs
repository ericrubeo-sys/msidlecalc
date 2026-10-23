import test from 'node:test';
import assert from 'node:assert/strict';
import { createPressRepeat, seedAdjacentCrop } from '../public/crop-controls.js';

function clockFixture() {
  const timers = new Map(); let next = 0, steps = 0;
  const repeat = createPressRepeat(()=>steps++,{schedule:(fn,ms)=>{timers.set(++next,{fn,ms});return next;},cancel:id=>timers.delete(id)});
  return {repeat,timers,get steps(){return steps;},tick(){const [id,{fn,ms}]=timers.entries().next().value;timers.delete(id);fn();return ms;}};
}

test('a tap makes one native click adjustment without waiting or duplicating',()=>{
  const f=clockFixture();f.repeat.start();assert.equal(f.steps,0);f.repeat.stop();f.repeat.click({detail:1});
  assert.equal(f.steps,1);assert.equal(f.timers.size,0);
});

test('a hold repeats after a delay and suppresses the trailing compatibility click',()=>{
  const f=clockFixture();f.repeat.start();assert.equal(f.tick(),400);assert.equal(f.steps,1);
  assert.equal(f.tick(),100);assert.equal(f.steps,2);f.repeat.stop();f.repeat.click({detail:1});
  assert.equal(f.steps,2);assert.equal(f.timers.size,0);
  f.repeat.start();f.repeat.stop();f.repeat.click({detail:1});assert.equal(f.steps,3);
});

test('cancel invalidates even an already queued callback; no runaway or second timer',()=>{
  const f=clockFixture();f.repeat.start();const stale=f.timers.values().next().value.fn;
  f.repeat.stop();stale();assert.equal(f.steps,0);assert.equal(f.timers.size,0);
  f.repeat.start();f.tick();const late=f.timers.values().next().value.fn;
  f.repeat.stop();late();assert.equal(f.steps,1);assert.equal(f.timers.size,0);
  f.repeat.stop();assert.equal(f.timers.size,0);
});

test('keyboard and assistive clicks remain independent after a canceled hold',()=>{
  const f=clockFixture();f.repeat.start();f.tick();f.repeat.stop();f.repeat.click({detail:0});
  assert.equal(f.steps,2);f.repeat.click({detail:1});assert.equal(f.steps,2);
});

test('starting a replacement hold invalidates old callbacks',()=>{
  const f=clockFixture();f.repeat.start();const stale=f.timers.values().next().value.fn;
  f.repeat.start();stale();assert.equal(f.steps,0);assert.equal(f.timers.size,1);
  f.tick();assert.equal(f.steps,1);assert.equal(f.timers.size,1);f.repeat.stop();assert.equal(f.timers.size,0);
});

test('unconfirmed second seed covers adjacent invented label and value columns',()=>{
  const first={x:300,y:250,width:290,height:200}, snapshot=structuredClone(first);
  const second=seedAdjacentCrop(first,{width:1280,height:590});
  assert.deepEqual(second,{x:590,y:250,width:290,height:200});
  // Invented right item label starts at 610; its value ends at 875.
  assert.ok(second.x<=610 && second.x+second.width>=875);
  assert.deepEqual(first,snapshot);
});

test('second seed remains original-pixel bounded at every image edge',()=>{
  for(const [width,height] of [[40,40],[300,200],[1280,590]]) {
    for(const first of [{x:0,y:0,width,height},{x:width-8,y:height-8,width:8,height:8}]) {
      const next=seedAdjacentCrop(first,{width,height});
      assert.ok(Object.values(next).every(Number.isInteger));
      assert.ok(next.x>=0 && next.y>=0 && next.width>=8 && next.height>=8 && next.x+next.width<=width && next.y+next.height<=height);
    }
  }
  assert.throws(()=>seedAdjacentCrop({x:1,y:0,width:40,height:40},{width:40,height:40}),TypeError);
});
