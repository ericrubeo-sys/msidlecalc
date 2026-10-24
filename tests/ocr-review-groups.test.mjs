import test from 'node:test';
import assert from 'node:assert/strict';
import { groupReviewRows } from '../public/domain/ocr-review-groups.js';
import { proposePanelRows } from '../public/domain/ocr-item-rows.js';
import { importScreenshotProposals } from '../public/domain/screenshot-review.js';
const panel={id:'left',rawText:'Unknown effect 17\nInterface fragment\nAttack 31\n7\nAttack 8\n',lines:['Unknown effect 17','Interface fragment','Attack 31','7','Attack 8',''].map(rawText=>({rawText}))};
test('preview separates unresolved observations without a known-stat dictionary or mutation',()=>{
  const rows=proposePanelRows(panel).rows,before=structuredClone(rows),grouped=groupReviewRows(rows);
  assert.deepEqual(grouped.stats.map(r=>r.proposedFields.rawLabel),['Unknown effect','Attack','Attack']);
  assert.deepEqual(grouped.unresolved.map(r=>r.rawText),['Interface fragment','7']);
  assert.deepEqual(rows,before);
  assert.equal(grouped.stats.length+grouped.unresolved.length,rows.filter(r=>r.rawText.trim()).length);
});
test('every unresolved observation survives the actual correction import, with no confirmation',()=>{
  const before=structuredClone(panel);groupReviewRows(proposePanelRows(panel).rows);
  const imported=importScreenshotProposals({proposedPanels:[panel,{...structuredClone(panel),id:'right'}],assignment:{current:'left',candidate:'right'},assignmentConfirmed:true,imageRevision:1,runId:1});
  assert.deepEqual(imported.current.map(r=>r.rawText),panel.lines.map(r=>r.rawText));
  assert.ok(imported.current.every(r=>!r.confirmed));assert.deepEqual(panel,before);
});
test('zero is a proposal while missing values and numeric fragments stay unresolved',()=>{
  const p={...panel,rawText:'Mystery 0\nUnreadable ?\n42',lines:['Mystery 0','Unreadable ?','42'].map(rawText=>({rawText}))};
  const result=groupReviewRows(proposePanelRows(p).rows);assert.equal(result.stats[0].proposedFields.rawValue,'0');assert.equal(result.unresolved.length,2);
});
test('all-unreadable and blank input do not manufacture stat rows',()=>{
  const rows=proposePanelRows({...panel,rawText:'Unclear\n\n',lines:['Unclear','',''].map(rawText=>({rawText}))}).rows;
  assert.equal(groupReviewRows(rows).stats.length,0);assert.equal(groupReviewRows(rows).unresolved.length,1);
  assert.throws(()=>groupReviewRows(null),TypeError);
});

test('recognized stat with missing value remains prominent and never becomes zero',()=>{
  const rows=proposePanelRows({...panel,rawText:'Critical Rate',lines:[{rawText:'Critical Rate'}]}).rows;
  const result=groupReviewRows(rows);assert.equal(result.stats.length,1);assert.equal(result.stats[0].proposedFields.rawValue,'');assert.equal(result.unresolved.length,0);
});
