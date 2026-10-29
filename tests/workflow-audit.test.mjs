import test from 'node:test';
import assert from 'node:assert/strict';
import { proposeRawLineFields, proposePanelRows } from '../public/domain/ocr-item-rows.js';
import { groupReviewRows } from '../public/domain/ocr-review-groups.js';
import { importScreenshotProposals } from '../public/domain/screenshot-review.js';
import { STAT_FIELDS, fieldForRecord } from '../public/domain/stat-fields.js';
import { characterValueIssue, PLAYER_FIELDS, planCharacterInputs, recommendCharacterActivities } from '../public/domain/character-recommendation.js';

const panel=(text,id='a')=>({id,rawText:text,lines:text.split('\n').map(rawText=>({rawText}))});
const assumptions=Object.fromEntries(['onEquipSameSlot','completeVisibleStats','onlyListedEffects','ordinaryLandedHits','nonnegativeBackground','simpleModel'].map(name=>[name,true]));
const record=(id,rawLabel,rawValue,extra={})=>({id,rawLabel,rawValue,...extra});
const payload=extra=>({current:[record('a','Critical Rate','10%')],candidate:[record('b','Critical Rate','20%')],
  assumptions,confirmations:{current:true,candidate:true},player:{criticalRate:'50',criticalDamage:'200',criticalResistance:'0',starForce:'12'},...extra});
const allAbstain=results=>assert.ok(results.every(result=>result.recommendation===null));

test('workflow: merged skill value/delta is a visible missing value, never a dropped effect or invented16',()=>{
  const source=panel('Attack 100\n3rd Job Skill Lv. 16-1\n1');
  const before=structuredClone(source),rows=proposePanelRows(source).rows,groups=groupReviewRows(rows);
  assert.deepEqual(groups.stats.map(row=>[row.proposedFields.statLabelProposal ?? row.proposedFields.rawLabel,row.proposedFields.rawValue]),[['Attack','100'],['3rd Job Skill Lv.','']]);
  assert.deepEqual(groups.unresolved.map(row=>row.rawText),['1']);
  const imported=importScreenshotProposals({proposedPanels:[source,{...source,id:'b'}],assignment:{current:'a',candidate:'b'},assignmentConfirmed:true,imageRevision:1,runId:1});
  assert.equal(imported.candidate[1].rawText,'3rd Job Skill Lv. 16-1');
  assert.equal(imported.candidate[1].rawValue,'');assert.equal(fieldForRecord(imported.candidate[1]).label,'3rd Job Skill Lv.');
  assert.deepEqual(source,before);
  allAbstain(recommendCharacterActivities(payload({candidate:[...payload().candidate,{...imported.candidate[1],otherReading:true}]})));
});

test('workflow: every supported stat label with unreadable value remains prominent without guessing a number',()=>{
  for(const label of new Set(STAT_FIELDS.map(field=>field.label))) {
    const result=groupReviewRows(proposePanelRows(panel(`${label} ?`)).rows);
    assert.equal(result.stats.length,1,label);assert.equal(result.stats[0].proposedFields.statLabelProposal,label);
    assert.equal(result.stats[0].proposedFields.rawLabel,`${label} ?`);
    assert.equal(result.stats[0].proposedFields.rawValue,'',label);
  }
});

test('workflow: exact prefix recovery cannot rename a different unknown effect or promote isolated noise',()=>{
  for(const text of ['Attackers ?','Critical Damage Bonus ?','Main Stat Mystery ?','Ee SO,','1','Equipment']) assert.equal(proposeRawLineFields(text).rawLabel,text);
  assert.equal(proposeRawLineFields('Attack 1e3').rawValue,'');
  assert.equal(proposeRawLineFields('Critical Damage Bonus 17%').rawLabel,'Critical Damage Bonus');
});

test('workflow: a stat-like unknown suffix is visible for correction without being renamed as a known effect',()=>{
  for(const text of ['Critical Rate X','Critical Damage Bonus ?','3rd Job Skill Lv. n/a']) {
    const source=panel(text),groups=groupReviewRows(proposePanelRows(source).rows);
    assert.equal(groups.stats.length,1,text);assert.equal(groups.stats[0].proposedFields.rawLabel,text);
    assert.equal(groups.stats[0].proposedFields.statLabelProposal,undefined);
    const imported=importScreenshotProposals({proposedPanels:[source,{...source,id:'b'}],assignment:{current:'a',candidate:'b'},assignmentConfirmed:true,imageRevision:1,runId:1});
    allAbstain(recommendCharacterActivities(payload({candidate:imported.candidate})));
  }
});

test('workflow: malformed or half-entered Advanced amplification cannot silently fall back to readable stars',()=>{
  for(const overrides of [{mainAmplification:'25%%',subAmplification:'10%%'},{mainAmplification:'25%',subAmplification:''},{mainAmplification:'',subAmplification:'0%'},{mainAmplification:'9007199254740991.1%',subAmplification:'0%'}]) {
    const input=payload({player:{...payload().player,...overrides}}),plan=planCharacterInputs(input);
    assert.ok(plan.fields.some(field=>field.id==='mainAmplification'));
    assert.ok(plan.fields.some(field=>field.id==='subAmplification'));
    assert.ok(!plan.fields.some(field=>field.id==='starForce'));
    allAbstain(recommendCharacterActivities(input));
  }
});

test('workflow: completed Advanced amplification removes the star question; clearing both restores it',()=>{
  const input=payload({player:{...payload().player,starForce:'',mainAmplification:'0%',subAmplification:'0%'}});
  const plan=planCharacterInputs(input);
  assert.deepEqual(plan.fields.map(field=>field.id),['criticalRate','criticalDamage']);
  assert.ok(recommendCharacterActivities(input).some(result=>result.recommendation==='candidate'));
  assert.ok(planCharacterInputs(payload()).fields.some(field=>field.id==='starForce'));
});

test('workflow: field validation and engine agree on exact numeric boundaries instead of floating-point rounding',()=>{
  const field=PLAYER_FIELDS.find(field=>field.id==='criticalDamage');
  for(const raw of ['9007199254740991.1','9007199254740991.000000000000000001','200.0000000000000000001','2e2','200%%','0']) {
    assert.ok(characterValueIssue(field,raw),raw);
    allAbstain(recommendCharacterActivities(payload({player:{...payload().player,criticalDamage:raw}})));
  }
  for(const raw of ['200','200%','9,007,199,254,740,991','200.000000000000000001']) assert.equal(characterValueIssue(field,raw),null,raw);
});

test('workflow: unknown opponent resistance is preserved and cannot become a zero-resistance assumption',()=>{
  const input=payload({player:{...payload().player,criticalResistance:''}});
  allAbstain(recommendCharacterActivities(input));
  const known=recommendCharacterActivities(payload());
  assert.ok(known.some(result=>result.recommendation==='candidate'));
});
