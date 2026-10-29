// Local raster evidence only. Missing/gray stars never imply zero enhancement.
export const STAR_FORCE_READER_VERSION = 'yellow-star-grid-1';
const median = values => { const sorted=[...values].sort((a,b)=>a-b); return sorted[Math.floor(sorted.length/2)]; };
const finiteBox = box => box && ['x','y','width','height'].every(key=>Number.isFinite(box[key])) && box.width>0 && box.height>0;
const yellow = (data,offset) => data[offset+3]>=128 && data[offset]>=145 && data[offset+1]>=125 && data[offset+2]<150 && data[offset]-data[offset+2]>=45 && data[offset+1]-data[offset+2]>=30;
function boundedBox(box,width,height) {
  const x=Math.max(0,Math.floor(box.x)),y=Math.max(0,Math.floor(box.y)),right=Math.min(width,Math.ceil(box.x+box.width)),bottom=Math.min(height,Math.ceil(box.y+box.height));
  return {x,y,width:Math.max(0,right-x),height:Math.max(0,bottom-y)};
}
function readPanel(raster,panel) {
  const {width,height,data}=raster;
  const source=panel?.headerRegion ?? panel?.region;
  if(!finiteBox(source)) return {count:null,region:null,confidence:'Low',reason:'missingPanelGeometry'};
  const region=boundedBox(panel.headerRegion ?? {x:source.x-source.width*.06,y:source.y-source.width*1.08,width:source.width*1.1,height:source.width*1.24},width,height);
  if(region.width<35||region.height<5) return {count:null,region,confidence:'Low',reason:'headerTooSmall'};
  const mask=new Uint8Array(region.width*region.height),rows=new Uint32Array(region.height);
  for(let y=0;y<region.height;y++) for(let x=0;x<region.width;x++) if(yellow(data,((y+region.y)*width+x+region.x)*4)) {mask[y*region.width+x]=1;rows[y]++;}
  const bands=[];let start=-1;
  const minimumRowPixels=Math.max(3,Math.floor(source.width*.022));
  for(let y=0;y<=region.height;y++) {
    if(y<region.height&&rows[y]>=minimumRowPixels) {if(start<0)start=y;}
    else if(start>=0) {if(y-start>=3)bands.push({top:start,bottom:y});start=-1;}
  }
  const candidates=[];
  for(const band of bands) {
    const h=band.bottom-band.top;
    if(h<source.width*.018||h>source.width*.1)continue;
    const columns=new Uint16Array(region.width);
    for(let y=band.top;y<band.bottom;y++)for(let x=0;x<region.width;x++)columns[x]+=mask[y*region.width+x];
    const threshold=Math.max(2,Math.ceil(h*.27)),runs=[];let left=-1;
    for(let x=0;x<=region.width;x++) {
      if(x<region.width&&columns[x]>=threshold) {if(left<0)left=x;}
      else if(left>=0) {if(x-left>=2)runs.push({left,right:x,center:(left+x-1)/2,width:x-left});left=-1;}
    }
    // At least two groups provide the distinctive five-star group spacing.
    // Short or damaged sequences remain editable unknowns, never a guessed 0.
    if(runs.length<6||runs.length>15)continue;
    const sizes=runs.map(run=>run.width),size=median(sizes);
    if(sizes.some(value=>value<size*.5||value>size*1.65))continue;
    let shaped=0;
    for(const run of runs) {
      const widths=[];
      for(let y=band.top;y<band.bottom;y++) {let pixels=0;for(let x=run.left;x<run.right;x++)pixels+=mask[y*region.width+x];widths.push(pixels);}
      const maximum=Math.max(...widths),edge=Math.min(widths[0],widths.at(-1));
      // Five-point silhouettes narrow at their tip/feet; solid gold glyph
      // blocks with equally spaced boxes are not sufficient star evidence.
      if(maximum>=2&&edge<maximum*.75&&Math.min(...widths)<maximum*.75)shaped++;
    }
    if(shaped<Math.ceil(runs.length*.8))continue;
    const steps=runs.slice(1).map((run,i)=>run.center-runs[i].center);
    const regular=steps.filter((_,i)=>(i+1)%5!==0),pitch=median(regular);
    const groupSteps=steps.filter((_,i)=>(i+1)%5===0),extra=median(groupSteps)-pitch;
    if(!Number.isFinite(pitch)||pitch<3||pitch>source.width*.085||h/pitch<.4||h/pitch>1.5||extra<pitch*.15||extra>pitch*1.5)continue;
    if(regular.some(step=>Math.abs(step-pitch)>pitch*.23)||groupSteps.some(step=>Math.abs(step-pitch-extra)>pitch*.25))continue;
    const first=runs[0].center,span=pitch*14+extra*2;
    if(span<source.width*.45||span>source.width*1.08||first>region.width*.35||first+span>region.width+pitch*.4)continue;
    if(runs.some((run,i)=>Math.abs(run.center-(first+i*pitch+Math.floor(i/5)*extra))>pitch*.3))continue;
    candidates.push({count:runs.length,centerY:region.y+(band.top+band.bottom-1)/2,firstX:region.x+first,pitch,groupGap:extra,starHeight:h,region:{x:region.x+runs[0].left,y:region.y+band.top,width:runs.at(-1).right-runs[0].left,height:h}});
  }
  candidates.sort((a,b)=>a.centerY-b.centerY);
  if(!candidates.length)return {count:null,region,confidence:'Low',reason:'noCredibleYellowStarGrid'};
  // The earliest aligned grid belongs to the tooltip header, before gold CP.
  const first=candidates[0];
  if(first.count===15&&first.centerY+first.pitch*2+first.starHeight/2>region.y+region.height)return {count:null,region,confidence:'Low',reason:'secondStarRowClipped'};
  let second=candidates.find(row=>row!==first&&row.centerY-first.centerY>=first.pitch*.8&&row.centerY-first.centerY<=first.pitch*2.2&&Math.abs(row.firstX-first.firstX)<=first.pitch*.3&&Math.abs(row.pitch-first.pitch)<=first.pitch*.2);
  // A second row may contain fewer than six filled stars. Once the first row
  // establishes its geometry, count that short prefix against the same grid.
  const fineBands=[];let fineStart=-1;
  const fineTop=Math.max(0,Math.ceil(first.centerY+first.pitch*.8-region.y)),fineBottom=Math.min(region.height,Math.floor(first.centerY+first.pitch*2.2+first.starHeight/2-region.y));
  for(let y=fineTop;y<=fineBottom;y++) {
    let pixels=0;
    if(y<fineBottom)for(let x=Math.max(0,Math.floor(first.firstX-region.x-first.pitch/2));x<Math.min(region.width,Math.ceil(first.firstX-region.x+first.pitch*14+first.groupGap*2+first.pitch/2));x++)pixels+=mask[y*region.width+x];
    if(pixels>0) {if(fineStart<0)fineStart=y;}
    else if(fineStart>=0) {fineBands.push({top:fineStart,bottom:y});fineStart=-1;}
  }
  if(!second)for(const band of fineBands) {
    const centerY=region.y+(band.top+band.bottom-1)/2,h=band.bottom-band.top;
    if(centerY-first.centerY<first.pitch*.8||centerY-first.centerY>first.pitch*2.2||h<first.starHeight*.5||h>first.starHeight*1.5)continue;
    const slots=[];
    for(let i=0;i<15;i++) {
      const cx=first.firstX+i*first.pitch+Math.floor(i/5)*first.groupGap-region.x;
      let pixels=0;
      for(let y=band.top;y<band.bottom;y++)for(let x=Math.max(0,Math.ceil(cx-first.pitch*.42));x<=Math.min(region.width-1,Math.floor(cx+first.pitch*.42));x++)pixels+=mask[y*region.width+x];
      slots.push(pixels>=Math.max(4,h*first.pitch*.18));
    }
    const count=slots.indexOf(false)<0?15:slots.indexOf(false);
    if(!count||slots.slice(count).some(Boolean))continue;
    second={count,centerY,firstX:first.firstX,pitch:first.pitch,groupGap:first.groupGap,starHeight:h,region:{x:first.firstX-first.pitch/2,y:region.y+band.top,width:count*first.pitch+Math.floor((count-1)/5)*first.groupGap,height:h}};
    break;
  }
  if(second&&first.count!==15)return {count:null,region,confidence:'Low',reason:'nonPrefixFilledStarRows',rows:[first,second]};
  const count=first.count+(second?.count??0);
  if(count>30)return {count:null,region,confidence:'Low',reason:'tooManyFilledStars'};
  return {count,region:first.region,searchRegion:region,confidence:'Medium',reason:'regularYellowStarGrid',rows:second?[first,second]:[first]};
}
export function readStarForce(raster,panels) {
  const result={version:STAR_FORCE_READER_VERSION,status:'unknown',value:null,panels:[],issues:[]};
  const {width,height,data}=raster??{};
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0||width*height>14000000||!(data instanceof Uint8Array||data instanceof Uint8ClampedArray)||data.length!==width*height*4)return {...result,issues:['invalidRaster']};
  if(!Array.isArray(panels)||panels.length!==2)return {...result,issues:['twoPanelsRequired']};
  result.panels=panels.map(panel=>readPanel(raster,panel));
  if(result.panels.some(panel=>panel.count===null))return {...result,issues:['bothHeadersMustBeReadable']};
  const [left,right]=result.panels.map(panel=>panel.rows[0]);
  if(Math.abs(left.firstX-right.firstX)<Math.min(left.pitch,right.pitch)*10||Math.abs(left.centerY-right.centerY)>Math.max(left.pitch,right.pitch)*1.5)return {...result,issues:['distinctAlignedHeadersRequired']};
  if(result.panels[0].count!==result.panels[1].count)return {...result,status:'conflict',issues:['headerStarCountsDisagree']};
  return {...result,status:'read',value:result.panels[0].count};
}
