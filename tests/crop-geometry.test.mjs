import test from 'node:test';
import assert from 'node:assert/strict';
import { adjustCrop } from '../public/domain/crop-geometry.js';
const size = {width:1280,height:590}, crop = {x:320,y:260,width:280,height:180};
test('crop adjustments use original pixels, preserve input and keep opposite edge fixed',()=>{
  const moved=adjustCrop(crop,{...size,target:'move',direction:'right'});
  assert.equal(moved.x,346); assert.deepEqual(crop,{x:320,y:260,width:280,height:180});
  const left=adjustCrop(crop,{...size,target:'left',direction:'right'});
  assert.equal(left.x+left.width,crop.x+crop.width); assert.equal(left.width,254);
  const top=adjustCrop(crop,{...size,target:'top',direction:'down'});
  assert.equal(top.y+top.height,crop.y+crop.height);
  assert.equal(adjustCrop(crop,{...size,fine:true,direction:'right'}).x,321);
  assert.deepEqual(adjustCrop(crop,{...size,target:'top',direction:'right'}),crop);
});
test('repeated touch controls cannot leave image or invert/collapse crop',()=>{
  for(const target of ['move','left','right','top','bottom']) for(const direction of ['left','right','up','down']) {
    let r={...crop}; for(let i=0;i<200;i++) r=adjustCrop(r,{...size,target,direction});
    assert.ok(r.x>=0 && r.y>=0 && r.width>=8 && r.height>=8 && r.x+r.width<=size.width && r.y+r.height<=size.height);
  }
  assert.throws(()=>adjustCrop({...crop,x:-1},{...size,direction:'left'}),TypeError);
});
