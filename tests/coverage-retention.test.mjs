// Integration-owner checks, distinct from independently authored QA cases.
import test from 'node:test';
import assert from 'node:assert/strict';
import { adoptReviewRecords, parseReviewRecords } from '../public/domain/inline-review.js';
const settings={imageRevision:3,previousImageRevision:3,edited:true};
const draft=(id,ordinal)=>({id,ordinal,rawLabel:'Attack',rawValue:'10',unit:'statPoint',confirmed:true,correction:{rawValue:'12',confirmed:true},provenance:{kind:'ocr',imageRevision:3,panelId:'left'}});
const gap=(id='gap')=>({id,ordinal:.75,rawLabel:'Critical Rate',rawValue:'7%',unit:'displayPercent',coverageRecovery:true,coveragePlaceholder:false,provenance:{kind:'ocr',imageRevision:3,panelId:'left',rowRecovery:{target:{region:{x:0,y:20,width:300,height:15}}}}});
const items=current=>({current,candidate:[]});
test('new gap evidence reaches retained edits as an empty required row, never a numeric overwrite',()=>{
  const existing=items([draft('edited',0),draft('later',1)]),incoming=items([draft('new',0),gap(),draft('later-new',1)]);
  const before=structuredClone({existing,incoming});
  const result=adoptReviewRecords(existing,incoming,settings);
  assert.equal(result.preserved,true);
  assert.deepEqual(result.items.current.map(r=>r.id),['edited','gap','later']);
  assert.equal(result.items.current[0].correction.rawValue,'12');
  const missing=result.items.current[1];
  assert.equal(missing.rawLabel,'');assert.equal(missing.rawValue,'');assert.equal(missing.correction,null);
  assert.equal(missing.coveragePlaceholder,true);assert.equal(missing.otherReading,false);
  const parsed=parseReviewRecords([missing],{imageRevision:3,confirmed:true})[0];
  assert.equal(parsed.effectiveValue,null);assert.notEqual(parsed.state,'confirmed');
  assert.ok(result.items.current.every(r=>!r.confirmed));
  assert.deepEqual({existing,incoming},before);
});
test('same gap reread is deduplicated and never erases its manual correction',()=>{
  const first=adoptReviewRecords(items([draft('edited',0)]),items([gap()]),settings);
  first.items.current[1].correction={rawLabel:'Critical Rate',rawValue:'8%',unit:'displayPercent',confirmed:true};
  const second=adoptReviewRecords(first.items,items([gap('different-run')]),settings);
  assert.equal(second.items.current.length,2);
  assert.equal(second.items.current[1].correction.rawValue,'8%');
  assert.equal(second.items.current[1].correction.confirmed,false);
});
test('fresh-image proposals replace the old image instead of retaining its corrections or gaps',()=>{
  const incoming=items([gap('fresh')]);
  const result=adoptReviewRecords(items([draft('old',0),gap()]),incoming,{...settings,imageRevision:4});
  assert.equal(result.preserved,false);assert.equal(result.items.current.length,1);
  assert.equal(result.items.current[0].id,'fresh');assert.equal(result.items.current[0].rawValue,'7%');
});
