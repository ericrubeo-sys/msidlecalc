// Synthetic raster and metadata tests, not a measured screenshot accuracy rate.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readStarForce } from '../public/domain/star-force-reader.js';
import { inferAttackRoles, applyStarForceReading, resetStarForceForImage } from '../public/domain/automatic-equipment-metadata.js';

function raster(width=340,height=180){
  const data=new Uint8ClampedArray(width*height*4);
  for(let offset=0;offset<data.length;offset+=4)data.set([28,30,32,255],offset);
  return {width,height,data};
}
const rect=(img,x,y,w,h,color)=>{for(let Y=y;Y<y+h;Y++)for(let X=x;X<x+w;X++)if(X>=0&&X<img.width&&Y>=0&&Y<img.height)img.data.set(color,(Y*img.width+X)*4);};
function star(img,cx,cy,r=3,color=[246,216,56,255]){
  const vertices=Array.from({length:10},(_,i)=>{const angle=-Math.PI/2+i*Math.PI/5,radius=i%2?r*.43:r;return [cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius];});
  for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){
    let inside=false;
    for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){
      const [xi,yi]=vertices[i],[xj,yj]=vertices[j];
      if((yi>y+.5)!==(yj>y+.5)&&(x+.5<(xj-xi)*(y+.5-yi)/(yj-yi)+xi))inside=!inside;
    }
    if(inside)rect(img,x,y,1,1,color);
  }
}
const panel=(x=10)=>({region:{x,y:75,width:140,height:85},headerRegion:{x,y:8,width:140,height:45}});
function header(img,x,count,options={}){
  const {gray=true,scale=1}=options;
  for(let i=0;i<30;i++){
    const col=i%15,row=Math.floor(i/15),cx=x+(6+col*8+Math.floor(col/5)*8)*scale,cy=(18+row*13)*scale;
    if(i<count)star(img,cx,cy,3*scale);
    else if(gray)star(img,cx,cy,3*scale,[110,111,113,255]);
  }
}
const scene=(left=12,right=12)=>{const img=raster();header(img,10,left);header(img,180,right);return {img,panels:[panel(10),panel(180)]};};

test('automatic metadata independent: two matching twelve-filled headers adopt12, ignoring gray empty stars',()=>{
  const {img,panels}=scene();const before=img.data.slice();const result=readStarForce(img,panels);
  assert.equal(result.status,'read');assert.equal(result.value,12);
  assert.deepEqual(result.panels.map(row=>row.count),[12,12]);
  assert.deepEqual(img.data,before);assert.deepEqual(panels,[panel(10),panel(180)]);
});

test('automatic metadata independent: scaled star silhouettes preserve the detected level',()=>{
  const img=raster(680,360);header(img,20,12,{scale:2});header(img,360,12,{scale:2});
  const panels=[20,360].map(x=>({region:{x,y:150,width:280,height:170},headerRegion:{x,y:16,width:280,height:90}}));
  const result=readStarForce(img,panels);assert.equal(result.status,'read');assert.equal(result.value,12);
});

test('automatic metadata independent: credible header disagreement does not select a convenient level',()=>{
  const {img,panels}=scene(12,15);const result=readStarForce(img,panels);
  assert.equal(result.status,'conflict');assert.equal(result.value,null);
});

test('automatic metadata independent: gray-only and missing headers are unknown rather than zero',()=>{
  for(const [left,right] of [[0,0],[12,0]]){
    const {img,panels}=scene(left,right);const result=readStarForce(img,panels);
    assert.equal(result.status,'unknown');assert.equal(result.value,null);
  }
});

test('automatic metadata independent: lower yellow CP-like blobs do not become stars in the bounded header',()=>{
  const img=raster(),panels=[panel(10),panel(180)];
  for(const x of [10,180])for(let i=0;i<12;i++)rect(img,x+5+i*9,105,5,7,[246,216,56,255]);
  const result=readStarForce(img,panels);assert.equal(result.value,null);assert.equal(result.status,'unknown');
});

test('automatic metadata independent: transparent gold and empty regions cannot supply credible header evidence',()=>{
  const img=raster(),panels=[panel(10),panel(180)];header(img,10,12);header(img,180,12);
  for(let i=3;i<img.data.length;i+=4)img.data[i]=0;
  const result=readStarForce(img,panels);assert.equal(result.value,null);assert.equal(result.status,'unknown');
});

test('automatic metadata independent: second-row prefixes count filled stars beyond15 without counting gray remainder',()=>{
  for(const count of [16,17,20,25,30]){
    const {img,panels}=scene(count,count);const result=readStarForce(img,panels);
    assert.equal(result.status,'read',`Level${count}`);assert.equal(result.value,count);
  }
});

test('automatic metadata independent: a truncated header cannot turn a two-row17-star item into15',()=>{
  const {img,panels}=scene(17,17);
  for(const entry of panels)entry.headerRegion.height=16; // bottom24, secondrowcenter31 omitted
  const result=readStarForce(img,panels);
  assert.equal(result.value,null);assert.equal(result.status,'unknown');
});

test('automatic metadata independent: a non-prefix second row cannot silently become a smaller enhancement level',()=>{
  const {img,panels}=scene(12,12);
  for(const x of [10,180])star(img,x+6,31,3);
  const result=readStarForce(img,panels);
  assert.equal(result.value,null);assert.equal(result.status,'unknown');
});

test('automatic metadata independent: duplicate panel geometry cannot count the same header as independent agreement',()=>{
  const {img}=scene(12,0);const result=readStarForce(img,[panel(10),panel(10)]);
  assert.equal(result.value,null);assert.equal(result.status,'unknown');
});

test('automatic metadata independent: grouped yellow rectangular text blocks inside a header are not filled stars',()=>{
  const img=raster(),panels=[panel(10),panel(180)];
  for(const x of [10,180])for(let i=0;i<12;i++)rect(img,x+3+i*8+Math.floor(i/5)*8,15,5,6,[246,216,56,255]);
  const result=readStarForce(img,panels);
  assert.equal(result.value,null);assert.equal(result.status,'unknown');
});

const stat=(id,label,value,extra={})=>({id,rawLabel:label,rawValue:String(value),unit:String(value).endsWith('%')?'displayPercent':'statPoint',...extra});
const role=(records)=>inferAttackRoles(records).filter(row=>row.rawLabel==='Attack').map(row=>row.sourceRole??null);

test('automatic metadata independent: first flat Attack is Main and lower repeated Attack is Sub without mandatory user input',()=>{
  const rows=[stat('a','Attack',9306),stat('h','Max HP',46131),stat('c','Critical Rate','7.3%'),stat('b','Attack',3490)];
  const before=structuredClone(rows),inferred=inferAttackRoles(rows);
  assert.deepEqual(role(rows),['main','sub']);assert.deepEqual(rows,before);
  assert.equal(inferred[0].sourceRoleOrigin,'automatic');assert.equal(inferred[3].sourceRoleOrigin,'automatic');
});

test('automatic metadata independent: recognized spatial row positions precede shuffled array order',()=>{
  const y=y0=>({provenance:{observation:{words:[{bbox:{x0:10,y0,x1:20,y1:y0+10}}]}}});
  const rows=[stat('lower','Attack',3490,y(120)),stat('upper','Attack',9306,y(20))];
  const inferred=inferAttackRoles(rows);
  assert.equal(inferred.find(row=>row.id==='upper').sourceRole,'main');
  assert.equal(inferred.find(row=>row.id==='lower').sourceRole,'sub');
});

test('automatic metadata independent: retained OCR row ordinal precedes shuffled array order when geometry is unavailable',()=>{
  const rows=[stat('lower','Attack',3490,{ordinal:8}),stat('upper','Attack',9306,{provenance:{ordinal:1}})];
  const inferred=inferAttackRoles(rows);
  assert.equal(inferred.find(row=>row.id==='upper').sourceRole,'main');
  assert.equal(inferred.find(row=>row.id==='lower').sourceRole,'sub');
});

test('automatic metadata independent: manual Advanced overrides survive inference and automatic values can be replanned',()=>{
  const manual=[stat('a','Attack',9306,{sourceRole:'sub',sourceRoleOrigin:'manual'}),stat('b','Attack',3490,{sourceRole:'main'})];
  assert.deepEqual(role(manual),['sub','main']);
  const automatic=[stat('a','Attack',9306,{sourceRole:'sub',sourceRoleOrigin:'automatic'}),stat('b','Attack',3490,{sourceRole:'main',sourceRoleOrigin:'automatic'})];
  assert.deepEqual(role(automatic),['main','sub']);
});

test('automatic metadata independent: Attack percentages and unrelated text do not consume flat-source positions',()=>{
  const rows=[stat('p','Attack','5%'),stat('h','Max HP',500),stat('a','Attack',9306),stat('b','Attack',3490),stat('c','Attack',100)];
  const inferred=inferAttackRoles(rows);
  assert.equal(inferred.find(row=>row.id==='p').sourceRole??null,null);
  assert.equal(inferred.find(row=>row.id==='a').sourceRole,'main');
  assert.equal(inferred.find(row=>row.id==='b').sourceRole,'sub');
  assert.equal(inferred.find(row=>row.id==='c').sourceRole??null,null);
  assert.ok(inferred.find(row=>row.id==='c').sourceRoleIssue);
});

const detected=(value=12)=>({status:'read',value,panels:[{count:value,confidence:'high'},{count:value,confidence:'high'}]});
const unknownState={value:'',origin:'unknown',imageRevision:1};

test('automatic metadata independent: matching read populates automatic state and manual value or blank overrides it',()=>{
  const adopted=applyStarForceReading(unknownState,detected(),1);
  assert.equal(adopted.value,'12');assert.equal(adopted.origin,'automatic');assert.equal(adopted.imageRevision,1);
  for(const value of ['15','']){
    const manual={value,origin:'manual',imageRevision:1};
    assert.equal(applyStarForceReading(manual,detected(),1).value,value);
    assert.equal(applyStarForceReading(manual,detected(),1).origin,'manual');
  }
  assert.deepEqual(unknownState,{value:'',origin:'unknown',imageRevision:1});
});

test('automatic metadata independent: image reset clears only automatic star values and retains entered manual stats',()=>{
  const auto=resetStarForceForImage({value:'12',origin:'automatic',imageRevision:1},2);
  assert.equal(auto.value,'');assert.equal(auto.origin,'unknown');assert.equal(auto.imageRevision,2);
  const manual=resetStarForceForImage({value:'15',origin:'manual',imageRevision:1},2);
  assert.equal(manual.value,'15');assert.equal(manual.origin,'manual');
});

test('automatic metadata independent: conflict, missing and zero readings never become an automatic level',()=>{
  for(const reading of [null,{status:'unknown',value:null,panels:[]},{status:'conflict',value:null,panels:[{count:12},{count:15}]},detected(0)]){
    const result=applyStarForceReading(unknownState,reading,1);
    assert.equal(result.value,'');assert.notEqual(result.origin,'automatic');
  }
});

test('automatic metadata independent: fresh conflict invalidates prior automatic evidence but cannot erase a manual override',()=>{
  const conflict={status:'conflict',value:null,panels:[{count:12},{count:15}]};
  const previous={value:'12',origin:'automatic',imageRevision:1};
  assert.equal(applyStarForceReading(previous,conflict,1).value,'');
  assert.equal(applyStarForceReading({...previous,origin:'manual'},conflict,1).value,'12');
  for(const malformed of [
    {status:'read',value:12,panels:[{count:12}]},
    {status:'read',value:12,panels:[{count:12},{count:15}]},
    {status:'read',value:12,panels:[{count:12},{count:null}]},
  ])assert.equal(applyStarForceReading(unknownState,malformed,1).value,'');
});

test('automatic metadata independent: malformed or oversized rasters return unknown without manufacturing evidence',()=>{
  for(const img of [null,{},raster(1,1),{width:100000,height:100000,data:new Uint8ClampedArray(4)}]){
    const result=readStarForce(img,[panel(10),panel(180)]);
    assert.equal(result.value,null);assert.equal(result.status,'unknown');
  }
});
