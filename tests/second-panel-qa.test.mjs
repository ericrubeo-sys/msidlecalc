import test from 'node:test';
import assert from 'node:assert/strict';
import { annotateFieldEvidence } from '../public/domain/ocr-field-evidence.js';
import { proposePanelRows } from '../public/domain/ocr-item-rows.js';
import { createComparisonReader } from '../public/ocr-reader.js';

// Invented solid glyph rasters. These test field evidence, not OCR recognition.
const colors = { neutral: [240,240,240,255], red: [240,40,40,255], green: [190,220,35,255], dark: [30,30,30,255], transparent: [240,240,240,0] };
function sample(text, tones) {
  const width=200,height=30,data=new Uint8ClampedArray(width*height*4);
  const symbols=[...text].map((char,i)=>({text:char,bbox:{x0:70+i*5,y0:10,x1:74+i*5,y1:20}}));
  for(let i=0;i<symbols.length;i++)for(let y=10;y<20;y++)for(let x=70+i*5;x<74+i*5;x++)data.set(colors[tones[i]??'neutral'],(y*width+x)*4);
  const word={text,bbox:{x0:70,y0:10,x1:70+text.length*5,y1:20},symbols};
  const label={text:'Unknown',bbox:{x0:0,y0:10,x1:50,y1:20}};
  const blocks=[{paragraphs:[{lines:[{text:`Unknown ${text}`,words:[label,word]}]}]}];
  return {blocks,raster:{width,height,data}};
}
function get(s){return annotateFieldEvidence(s.blocks,s.raster)[0].paragraphs[0].lines[0].words[1].fieldEvidence;}
function parsed(s){const blocks=annotateFieldEvidence(s.blocks,s.raster),structuredLines=blocks[0].paragraphs[0].lines; const rawText=structuredLines.map(l=>l.words.map(w=>w.text).join(' ')).join('\n');return proposePanelRows({id:'new',structuredLines,rawText,lines:rawText.split('\n').map(rawText=>({rawText}))});}

test('independent glyph boundary uses observed colors, never repeated-string arithmetic',()=>{
  for(const [text,tones,base,delta] of [['4242',['neutral','neutral','green','green'],'42','42'],['88',['neutral','green'],'8','8'],['417-9',[...Array(3).fill('neutral'),...Array(2).fill('red')],'417','-9']]){
    const s=sample(text,tones),before=structuredClone(s),e=get(s),row=parsed(s).rows[0];
    assert.equal(e.status,'separated');assert.equal(e.baseText,base);assert.equal(e.comparisonText,delta);assert.equal(e.confirmed,false);
    assert.equal(row.proposedFields.rawValue,base);assert.equal(row.proposedFields.comparisonText,delta);assert.ok(row.proposedFields.issues.includes('colorBoundaryNeedsReview'));
    assert.equal(row.rawText,`Unknown ${text}`);assert.deepEqual(s,before);
  }
});
test('all-neutral repeated digits remain literal, and a colored-only base is never a numeric proposal',()=>{
  for(const text of ['4242','88','0','1,234','3.7%']){const s=sample(text,[]);assert.equal(get(s).status,'neutralOnly');assert.equal(parsed(s).rows[0].proposedFields.rawValue,text);}
  const s=sample('88',['green','green']);assert.equal(get(s).status,'coloredOnly');assert.equal(parsed(s).rows[0].proposedFields.rawValue,'');
});
test('mixed, absent or transparent glyph evidence cannot establish a boundary',()=>{
  for(const tones of [['neutral','dark'],['neutral','transparent'],['red','neutral'],['neutral','red','neutral']]){
    const s=sample('7'.repeat(tones.length),tones);assert.equal(get(s).status,'unresolved');assert.equal(parsed(s).rows[0].proposedFields.rawValue,'');
  }
});
test('missing symbols and incomplete symbol text do not certify merged digits',()=>{
  for(const mode of ['missing','short','changed','outOfBounds']){const s=sample('4242',['neutral','neutral','green','green']),w=s.blocks[0].paragraphs[0].lines[0].words[1];
    if(mode==='missing')delete w.symbols;if(mode==='short')w.symbols.pop();if(mode==='changed')w.symbols[0].text='9';if(mode==='outOfBounds')w.symbols[0].bbox.x0=-1;
    assert.equal(get(s).status,'unresolved');assert.equal(parsed(s).rows[0].proposedFields.rawValue,'');
  }
});
test('the split boundary must be spatially ordered and disjoint',()=>{
  const s=sample('88',['neutral','green']);s.blocks[0].paragraphs[0].lines[0].words[1].symbols[1].bbox.x0=72;
  assert.equal(get(s).status,'unresolved');assert.equal(parsed(s).rows[0].proposedFields.rawValue,'');
});
test('an uncertain gap colon stays verbatim outside the base and cannot repair an uncertain digit',()=>{
  const s=sample('42:42',['neutral','neutral','dark','green','green']);const e=get(s),row=parsed(s).rows[0];
  assert.equal(e.status,'separated');assert.equal(e.baseText,'42');assert.equal(e.comparisonText,':42');assert.equal(row.proposedFields.rawValue,'42');assert.equal(row.proposedFields.comparisonText,':42');
  const bad=sample('42:42',['neutral','dark','dark','green','green']);assert.equal(get(bad).status,'unresolved');assert.equal(parsed(bad).rows[0].proposedFields.rawValue,'');
});
test('percent/grouping symbols remain exact and malformed comparisons stay outside the base',()=>{
  const good=sample('1,234-9',[...Array(5).fill('neutral'),...Array(2).fill('red')]);assert.equal(get(good).baseText,'1,234');assert.equal(parsed(good).rows[0].proposedFields.rawValue,'1,234');
  const percentage=sample('3.7%2.1%',[...Array(4).fill('neutral'),...Array(4).fill('green')]);assert.equal(parsed(percentage).rows[0].proposedFields.rawValue,'3.7%');
  for(const suffix of ['--9',':9','+','9.','9%%']){const s=sample('47'+suffix,[...Array(2).fill('neutral'),...Array(suffix.length).fill('red')]),row=parsed(s).rows[0];assert.equal(row.proposedFields.rawValue,'47');assert.equal(row.proposedFields.comparisonText,suffix);assert.ok(row.proposedFields.issues.includes('colorBoundaryNeedsReview'));}
});
test('border observations remain full evidence while unknown and repeated labels stay ordered',()=>{
  const word=(text,x,y,w=35,h=10)=>({text,bbox:{x0:x,y0:y,x1:x+w,y1:y+h}});
  const words=[word('|',55,0,1,60),word('Unknown',0,10,50),word('41',80,10),word('Unknown',0,35,50),word('8',80,35),word('?',0,55),word('9',80,55)];
  const rawText=words.map(w=>w.text).join(' '),panel={id:'new',rawText,lines:[{rawText}],structuredLines:[{text:rawText,words}]};
  const before=structuredClone(panel),result=proposePanelRows(panel);
  assert.deepEqual(result.rows.slice(0,2).map(r=>r.proposedFields.rawLabel),['Unknown','Unknown']);assert.deepEqual(result.rows.slice(0,2).map(r=>r.proposedFields.rawValue),['41','8']);
  assert.ok(result.rows.some(r=>r.rawText.includes('?')));assert.equal(result.evidenceRows.length,1);assert.equal(result.evidenceRows[0].rawText,'|');assert.equal(result.evidenceRows[0].provenance.panelRawText,rawText);assert.deepEqual(panel,before);
});
test('numeric-only fragments never gain labels from another item or nearby row',()=>{
  const s=sample('88',['neutral','green']);s.blocks[0].paragraphs[0].lines[0].words.shift();const result=parsed(s);
  assert.equal(result.rows[0].proposedFields.rawValue,'');assert.equal(result.rows[0].rawText,'88');
});
test('raster bounds and byte coverage reject invalid inputs instead of clipping silently',()=>{
  const s=sample('88',[]);for(const raster of [{...s.raster,width:0},{...s.raster,data:new Uint8ClampedArray(4)},{...s.raster,width:1.5}])assert.throws(()=>annotateFieldEvidence(s.blocks,raster),TypeError);
});
test('lossless fallback cannot bypass unresolved field evidence and restore a merged base',()=>{
  const s=sample('4242',[]);delete s.blocks[0].paragraphs[0].lines[0].words[1].symbols;
  const blocks=annotateFieldEvidence(s.blocks,s.raster),structuredLines=blocks[0].paragraphs[0].lines;
  const rawText='Unknown 4242\nnot in word observations';
  const result=proposePanelRows({id:'new',structuredLines,rawText,lines:rawText.split('\n').map(rawText=>({rawText}))});
  assert.equal(result.method,'rawLines');assert.equal(result.rows[0].proposedFields.rawValue,'');assert.equal(result.rows[0].rawText,'Unknown 4242');
});
test('reader field marker alone blocks raw-line fallback values when geometry is absent',()=>{
  const rawText='Unknown 4242';const result=proposePanelRows({id:'new',fieldEvidenceVersion:'glyph-color-fields-1',structuredLines:null,rawText,lines:[{rawText}]});
  assert.equal(result.method,'rawLines');assert.equal(result.rows[0].rawText,rawText);assert.equal(result.rows[0].proposedFields.rawValue,'');
});
test('reader without pixel API retains raw draft and cleans up without numeric confirmation',async()=>{
  const outputs=[{text:'whole',blocks:null},{text:'Unknown 4242',blocks:null}],canvases=[];let terminated=false;
  const worker={setParameters:async()=>{},recognize:async()=>({data:outputs.shift()}),terminate:async()=>{terminated=true;}};
  const reader=createComparisonReader({loadTesseract:async()=>({createWorker:async()=>worker}),createCanvas:()=>{const canvas={width:0,height:0,getContext:()=>({drawImage(){}})};canvases.push(canvas);return canvas;}});
  const result=await reader({width:100,height:100},{regions:[{id:'right',region:{x:50,y:0,width:50,height:100}}]});
  assert.equal(result.proposedPanels[0].rawText,'Unknown 4242');assert.ok(result.proposedPanels[0].lines.every(l=>!l.confirmed&&l.value===null));assert.ok(terminated);assert.ok(canvases.every(c=>c.width===0&&c.height===0));
});
