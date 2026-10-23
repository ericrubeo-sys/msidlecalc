import test from 'node:test';
import assert from 'node:assert/strict';
import { maskNeutralText, NEUTRAL_TEXT_MASK_SETTINGS } from '../public/domain/ocr-preprocessing.js';
test('optional mask preserves neutral bright marks and suppresses saturated/dark/transparent pixels without mutating source', () => {
  const data = new Uint8ClampedArray([230,230,230,255, 230,230,20,255, 230,50,50,255, 100,100,100,255, 255,255,255,0]);
  const before = data.slice();
  const result = maskNeutralText({data,width:5,height:1});
  assert.deepEqual([...result.data], [25,25,25,255, 255,255,255,255, 255,255,255,255, 255,255,255,255, 255,255,255,255]);
  assert.equal(result.retainedPixels, 1); assert.deepEqual(data,before);
  assert.deepEqual(maskNeutralText({data,width:5,height:1}).data,result.data);
});
test('mask thresholds are explicit inclusive technical settings, not rules about game labels or item identity', () => {
  const data = new Uint8ClampedArray([174,150,126,128, 175,150,125,255]);
  const result = maskNeutralText({data,width:2,height:1});
  assert.equal(result.retainedPixels,1); assert.deepEqual([...result.data.slice(0,4)],[105,105,105,255]);
  result.settings.minMean=0; assert.equal(NEUTRAL_TEXT_MASK_SETTINGS.minMean,150);
  for (const bad of [{data,width:0,height:1},{data,width:2,height:2},{data:[],width:2,height:1},{data,width:Infinity,height:1}]) assert.throws(()=>maskNeutralText(bad));
});
