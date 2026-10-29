// Private loopback harness extending the existing OCR evaluation server.
// No upload, persistence or player-data logging. Output is browser DOM only.
export const comparisonEvaluationHtml=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Private comparison-reader evaluation</title><style>body{font:16px system-ui;max-width:1000px;margin:24px auto;padding:12px}button,input{font:inherit;margin:8px}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#eee;padding:12px}canvas{max-width:100%;max-height:200px}label{display:block}</style><h1>Private comparison-reader evaluation</h1><p>Original image stays in this browser. Before and after proposals come from the same read; no row count is a completeness certificate.</p><label>Permitted source image<input id="comparison-file" type="file" accept="image/png,image/jpeg,image/webp"></label><button id="comparison-run" disabled>Run comparison reader</button><button id="comparison-cancel">Cancel</button><p id="comparison-status" role="status">Select a permitted original image.</p><canvas id="comparison-canvas"></canvas><pre id="comparison-output"></pre><script type="module" src="/comparison-harness.js"></script></html>`;

export function comparisonEvaluationBrowser() {
  const $=id=>document.getElementById(id);
  let generation=0,canvas=null,controller=null,busy=false,runs=0;
  const controls=()=>{$('comparison-run').disabled=!canvas||busy;};
  const cancel=()=>{generation++;controller?.abort();controller=null;busy=false;controls();};
  $('comparison-cancel').addEventListener('click',()=>{cancel();$('comparison-status').textContent='Canceled; previous completed observations are retained.';});
  $('comparison-file').addEventListener('change',async()=>{
    cancel();const selected=generation,file=$('comparison-file').files[0];canvas=null;runs=0;controls();$('comparison-output').textContent='';
    if(!file || !['image/png','image/jpeg','image/webp'].includes(file.type) || file.size>10*1024*1024) {$('comparison-status').textContent='Choose a PNG, JPEG or WebP up to10MB.';return;}
    try {
      const image=await createImageBitmap(file);
      if(selected!==generation) {image.close();return;}
      if(image.width*image.height>7000000) {image.close();throw Error();}
      canvas=$('comparison-canvas');canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d').drawImage(image,0,0);image.close();
      $('comparison-status').textContent='Ready. No image has been sent to a server.';controls();
    } catch {$('comparison-status').textContent='Image could not be decoded within the pixel limit.';}
  });
  $('comparison-run').addEventListener('click',async()=>{
    if(!canvas||busy)return;
    const selected=++generation;controller=new AbortController();busy=true;controls();const started=performance.now();
    $('comparison-status').textContent='Reading locally…';
    try {
      const [{readComparison},{assignComparisonLayout},{importScreenshotProposals},{proposePanelRows},{groupReviewRows},{fieldForRecord},{applyPanelRowRecovery}]=await Promise.all([
        import('/ocr-reader.js'),import('/domain/comparison-layout.js'),import('/domain/screenshot-review.js'),import('/domain/ocr-item-rows.js'),import('/domain/ocr-review-groups.js'),import('/domain/stat-fields.js'),import('/domain/ocr-row-recovery.js')]);
      if(selected!==generation)return;
      const reading=await readComparison(canvas,{inputRevision:selected,signal:controller.signal,isCurrent:()=>selected===generation});
      if(selected!==generation)return;
      const layout=assignComparisonLayout(reading.proposedPanels);
      const panels=layout.status==='assigned'?layout.panels:[];
      let imported={current:[],candidate:[]};
      if(panels.length===2) imported=importScreenshotProposals({proposedPanels:panels,assignment:{current:panels[0].id,candidate:panels[1].id},assignmentConfirmed:true,imageRevision:selected,runId:selected});
      const before=[],after=[];let attempts=0;
      const rows=records=>records.filter(record=>!record.otherReading).map(record=>{
        const field=fieldForRecord(record),effective={...record,...record.correction};
        return {id:record.id,label:field?.label??effective.rawLabel??null,value:effective.rawValue||null,unit:field?.unit??null};
      });
      for(const [index,side] of ['current','candidate'].entries()) {
        const panel=panels[index];if(!panel)continue;
        const groups=groupReviewRows(proposePanelRows(panel).rows),unresolved=new Set(groups.unresolved.map(row=>row.rawText));
        for(const record of imported[side]) record.otherReading=!record.rawText.trim()||unresolved.has(record.rawText);
        before.push({id:side,complete:false,rows:rows(imported[side])});
        const recovered=applyPanelRowRecovery(imported[side],panel,{idPrefix:`evaluation-${selected}-${side}`});
        after.push({id:side,complete:false,rows:rows(recovered)});
        attempts+=panel.rowRecovery?.attempts?.length??0;
      }
      const output={version:reading.version,mode:runs++?'warm':'cold',latencyMs:performance.now()-started,settings:reading.settings,
        before,after,retryAttempts:attempts,panels:panels.map(panel=>({id:panel.id,region:panel.region,rowCoverage:panel.rowCoverage??null,rowRecovery:panel.rowRecovery??null})),complete:false};
      $('comparison-output').textContent=JSON.stringify(output);$('comparison-status').textContent='Finished. Proposals remain unconfirmed; output is private browser data.';
    } catch(error) {if(selected===generation)$('comparison-status').textContent=error?.name==='AbortError'?'Canceled.':'Local comparison evaluation failed; no values fabricated.';}
    finally {if(selected===generation){busy=false;controller=null;controls();}}
  });
  window.addEventListener('pagehide',cancel);
}
