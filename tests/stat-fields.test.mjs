import test from 'node:test';
import assert from 'node:assert/strict';
import {STAT_FIELDS,fieldForRecord,validateStatValue,recommendationContexts} from '../public/domain/stat-fields.js';
const field=(label,kind)=>STAT_FIELDS.find(entry=>entry.label===label && entry.kind===kind);
test('whole-number fields reject fractional OCR and delta tokens instead of repairing them',()=>{
  const attack=field('Attack','integer');
  for(const value of ['7.974','13 13','54 3','-945','9,30','8%','NaN','1e3']) assert.equal(validateStatValue(attack,value).valid,false,value);
  assert.equal(validateStatValue(attack,'0').valid,true);
  assert.equal(validateStatValue(attack,'9,306').value,'9,306');
  assert.equal(validateStatValue(attack,'').valid,false);
});
test('percentage fields carry their syntax without adding a game cap',()=>{
  const rate=field('Critical Rate','percent');
  assert.equal(validateStatValue(rate,'7.3').value,'7.3%');
  assert.equal(validateStatValue(rate,'7.3%').value,'7.3%');
  assert.equal(validateStatValue(rate,'200%').valid,true);
  for(const value of ['7,3%','7.3% 7.3%','%','3%%']) assert.equal(validateStatValue(rate,value).valid,false);
});
test('explicit stat type wins over a leftover percent suffix and preserves source records',()=>{
  const original={rawLabel:'Max MP',rawValue:'16.6%',unit:'displayPercent'};
  assert.equal(fieldForRecord(original).kind,'percent');
  const corrected={...original,statFieldId:field('Max MP','integer').id};
  assert.equal(fieldForRecord(corrected).kind,'integer');
  assert.equal(validateStatValue(fieldForRecord(corrected),corrected.rawValue).valid,false);
  assert.equal(original.rawValue,'16.6%');
  assert.equal(fieldForRecord({rawLabel:'unlisted future effect',rawValue:'12'}),null);
});
test('skill levels require whole numbers and seconds accept a finite decimal',()=>{
  assert.equal(validateStatValue(field('3rd Job Skill Lv.','integer'),'13.5').valid,false);
  assert.equal(validateStatValue(field('Skill Cooldown Decrease','seconds'),'1.5').valid,true);
  assert.equal(validateStatValue(field('Attack','integer'),'9007199254740992').valid,false);
});
test('context presentation never invents a recommendation from item arithmetic',()=>{
  const result=recommendationContexts();
  assert.ok(result.some(entry=>entry.context==='Colosseum'));
  assert.ok(result.every(entry=>entry.recommendation===null && entry.confidence==='Low'));
  result[0].recommendation='current';
  assert.equal(recommendationContexts()[0].recommendation,null);
});
