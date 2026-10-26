import { detectComparisonPanels, PANEL_DETECTION_VERSION } from './domain/panel-detection.js';
import { assessCropCoverage, CROP_COVERAGE_VERSION } from './domain/crop-coverage.js';
import { annotateFieldEvidence, OCR_FIELD_EVIDENCE_VERSION } from './domain/ocr-field-evidence.js';
import { assignComparisonLayout } from './domain/comparison-layout.js';
import { createLocalPanelHypotheses, assessLocalPanelRecovery, LOCAL_PANEL_RECOVERY_VERSION } from './domain/local-panel-recovery.js';
import { assessStatRowCoverage, OCR_ROW_COVERAGE_VERSION } from './domain/ocr-row-coverage.js';
import { proposeRecoveredRow, OCR_ROW_RECOVERY_VERSION } from './domain/ocr-row-recovery.js';
export const OCR_READER_VERSION = 'browser-reader-6';
let libraryPromise = null;
function loadLocalLibrary() {
  if (!libraryPromise) libraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = '/vendor/tesseract.min.js'; script.async = true;
    script.onload = () => globalThis.Tesseract?.createWorker ? resolve(globalThis.Tesseract) : reject(new Error('Local OCR unavailable.'));
    script.onerror = () => reject(new Error('Local OCR unavailable.'));
    document.head.append(script);
  }).catch(error => { libraryPromise = null; throw error; });
  return libraryPromise;
}
const abortError = () => new DOMException('OCR run canceled or superseded.', 'AbortError');
function validateRegions(regions, width, height) {
  if (!Array.isArray(regions) || regions.length > 4 || new Set(regions.map(region => region.id)).size !== regions.length) throw new TypeError('Up to four unique reviewed regions required.');
  for (const { id, region } of regions) if (typeof id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(id) || !region || !['x', 'y', 'width', 'height'].every(key => Number.isFinite(region[key]) && Number.isInteger(region[key])) || region.x < 0 || region.y < 0 || region.width <= 0 || region.height <= 0 || region.x + region.width > width || region.y + region.height > height) throw new TypeError('Reviewed region outside image.');
  return structuredClone(regions);
}
export function createComparisonReader({ loadTesseract = loadLocalLibrary, createCanvas = () => document.createElement('canvas') } = {}) {
  return async function readComparison(image, { inputRevision = 0, signal = null, isCurrent = () => true, onProgress = () => {}, regions = null } = {}) {
    const width = image?.width, height = image?.height;
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width * height > 7000000 || !Number.isSafeInteger(inputRevision) || inputRevision < 0) throw new TypeError('Bounded decoded image and revision required.');
    const reviewed = regions === null ? null : validateRegions(regions, width, height);
    let worker = null, canceled = false, rowRetryBudget = 4;
    const canvases = [];
    const check = () => { if (canceled || signal?.aborted || !isCurrent()) throw abortError(); };
    let rejectCanceled;
    const cancellation = new Promise((_, reject) => { rejectCanceled = reject; });
    // Attach a handler even before a race, avoiding an early abort rejection.
    cancellation.catch(() => {});
    const cancel = () => { canceled = true; rejectCanceled(abortError()); if (worker) void worker.terminate().catch(() => {}); };
    signal?.addEventListener('abort', cancel, { once: true });
    const pending = promise => Promise.race([promise, cancellation]);
    function canvasFor(region, scale) {
      const canvas = createCanvas(); canvases.push(canvas); canvas.width = region.width * scale; canvas.height = region.height * scale;
      const context = canvas.getContext('2d'); if (!context) throw new Error('Local canvas unavailable.');
      context.imageSmoothingEnabled = false;
      context.drawImage(image, region.x, region.y, region.width, region.height, 0, 0, canvas.width, canvas.height);
      return canvas;
    }
    async function recognizeRegion(region, scale, inspectFields = false) {
      const canvas = canvasFor(region, scale);
      try {
        const result = await pending(worker.recognize(canvas, {}, { text: true, blocks: true }));
        if (inspectFields) {
          const context = canvas.getContext('2d');
          result.rowRaster=context?.getImageData ? context.getImageData(0,0,canvas.width,canvas.height) : null;
          result.fieldBlocks = result.rowRaster ? annotateFieldEvidence(result.data.blocks ?? null,result.rowRaster) : null;
        }
        return result;
      }
      finally { canvas.width = 0; canvas.height = 0; }
    }
    try {
      check(); onProgress({ stage: 'loading' });
      const library = await pending(loadTesseract()); check();
      // Absolute same-origin paths override every upstream CDN default.
      const origin = globalThis.location?.origin ?? 'http://localhost';
      const creating = library.createWorker('eng', 1, { workerPath: origin + '/vendor/worker.min.js', corePath: origin + '/vendor/core', langPath: origin + '/vendor/lang', cacheMethod: 'none', workerBlobURL: false, gzip: true, logger: () => {}, errorHandler: () => {} });
      // A worker completing after cancellation still gets disposed.
      creating.then(created => { if (canceled || signal?.aborted || !isCurrent()) void created.terminate().catch(() => {}); }, () => {});
      worker = await pending(creating); check();
      const scale = Math.max(1, Math.min(3, Math.floor(Math.sqrt(28000000 / (width * height)))));
      await pending(worker.setParameters({ tessedit_pageseg_mode: '11', user_defined_dpi: '300', preserve_interword_spaces: '1' })); check();
      onProgress({ stage: 'findingPanels' });
      const whole = await recognizeRegion({ x: 0, y: 0, width, height }, scale); check();
      const raw = { text: typeof whole.data.text === 'string' ? whole.data.text : '', blocks: structuredClone(whole.data.blocks ?? null), scale, dimensions: [width, height], psm: 11 };
      let detection = detectComparisonPanels({ blocks: raw.blocks, width, height, scale });
      let detectionPsm = 11;
      const detectionObservations = [{ psm: 11, raw: structuredClone(raw), panelCount: detection.panels.length, issues:structuredClone(detection.issues) }];
      if (reviewed === null && assignComparisonLayout(detection.panels).status !== 'assigned') {
        // One bounded alternative segmentation of the same untouched image.
        // Select a complete two-panel attempt, never combine conflicting boxes
        // or select values by apparent plausibility/engine confidence.
        await pending(worker.setParameters({ tessedit_pageseg_mode: '3' })); check();
        const alternative = await recognizeRegion({ x: 0, y: 0, width, height }, scale); check();
        const alternateRaw = { text: typeof alternative.data.text === 'string' ? alternative.data.text : '', blocks: structuredClone(alternative.data.blocks ?? null), scale, dimensions: [width, height], psm: 3 };
        const alternateDetection = detectComparisonPanels({ blocks: alternateRaw.blocks, width, height, scale });
        detectionObservations.push({ psm: 3, raw: alternateRaw, panelCount: alternateDetection.panels.length, issues:structuredClone(alternateDetection.issues) });
        if (assignComparisonLayout(alternateDetection.panels).status === 'assigned') { detection = alternateDetection; detectionPsm = 3; }
      }
      const proposals = reviewed ?? detection.panels;
      await pending(worker.setParameters({ tessedit_pageseg_mode: '6' })); check();
      async function readPanels(proposals, source) {
      const proposedPanels = [];
      for (const proposal of proposals) {
        check(); onProgress({ stage: 'readingPanel', panelId: proposal.id });
        const region = proposal.region;
        const result = await recognizeRegion(region, scale, true); check();
        const text = typeof result.data.text === 'string' ? result.data.text : '';
        const blocks = structuredClone(result.data.blocks ?? null);
        const structuredLines = (result.fieldBlocks ?? blocks ?? []).flatMap(block => (block.paragraphs ?? []).flatMap(paragraph => paragraph.lines ?? []));
        const lines = text.split(/\r\n|\r|\n/).map((rawText, ordinal) => ({ id: `${proposal.id}:line-${ordinal}`, ordinal, rawText, label: null, value: null, unit: null, statId: null, confirmed: false,
          provenance: { kind: 'ocr', inputRevision, panelId: proposal.id, region: structuredClone(region), scale, areaSource: source, segmentationIdentity: JSON.stringify({ region, scale, psm: 6, detectionPsm: source === 'whole-image-headings' ? detectionPsm : null, detectionVersion: PANEL_DETECTION_VERSION, localRecoveryVersion: source === 'local-layout-hypothesis' ? LOCAL_PANEL_RECOVERY_VERSION : null, fieldEvidenceVersion: OCR_FIELD_EVIDENCE_VERSION, version: OCR_READER_VERSION }) } }));
        const coverageIssues = assessCropCoverage({ blocks: raw.blocks, width, height, scale, region });
        const panel={ ...structuredClone(proposal), role: null, requiresReview: true, fieldEvidenceVersion: OCR_FIELD_EVIDENCE_VERSION, coverageIssues, coverageProvenance: { version: CROP_COVERAGE_VERSION, observation: 'initialWholeImage', psm: raw.psm, scale, region: structuredClone(region), advisoryOnly: true }, rawText: text, blocks, structuredLines, lines, confidence: Number.isFinite(result.data.confidence) ? result.data.confidence : null };
        panel.rowCoverage=assessStatRowCoverage({raster:result.rowRaster,panel,scale});
        delete result.rowRaster;
        panel.rowRecovery={version:OCR_ROW_RECOVERY_VERSION,imageRevision:inputRevision,scale,attempts:[],limit:{perPanel:2,perRun:4}};
        for(const target of panel.rowCoverage.retryRegions) {
          check();
          if(rowRetryBudget<=0) {panel.rowRecovery.attempts.push({target,status:'unresolved',proposal:null,issues:['rowRetryBudgetExhausted']});continue;}
          rowRetryBudget--;
          onProgress({stage:'readingUncertainRow',panelId:proposal.id});
          try {
          await pending(worker.setParameters({tessedit_pageseg_mode:'7'}));check();
          const retryRegion={x:region.x+target.region.x,y:region.y+target.region.y,width:Math.min(target.region.width,region.width-target.region.x),height:Math.min(target.region.height,region.height-target.region.y)};
          const retryScale=3;
          const retry=await recognizeRegion(retryRegion,retryScale,true);check();
          const retryText=typeof retry.data.text==='string'?retry.data.text:'';
          const retryBlocks=structuredClone(retry.data.blocks??null);
          const retryLines=(retry.fieldBlocks??retryBlocks??[]).flatMap(block=>(block.paragraphs??[]).flatMap(paragraph=>paragraph.lines??[]));
          const retryPanel={id:`${proposal.id}-${target.id}`,rawText:retryText,fieldEvidenceVersion:OCR_FIELD_EVIDENCE_VERSION,structuredLines:retryLines,lines:retryText.split(/\r\n|\r|\n/).map(rawText=>({rawText}))};
          const recovered=proposeRecoveredRow(retryPanel,target);
          delete retry.rowRaster;
          panel.rowRecovery.attempts.push({target,...recovered,observation:{rawText:retryText,blocks:retryBlocks,structuredLines:retryLines,region:retryRegion,scale:retryScale,psm:7,fieldEvidenceVersion:OCR_FIELD_EVIDENCE_VERSION}});
          } catch(error) {
            check();
            panel.rowRecovery.attempts.push({target,status:'unresolved',proposal:null,issues:['rowRetryFailed']});
          }
          await pending(worker.setParameters({tessedit_pageseg_mode:'6'}));check();
        }
        proposedPanels.push(panel);
      }
      return proposedPanels;
      }
      let detectionSource = reviewed ? 'reviewed-regions' : 'whole-image-headings';
      let proposedPanels = await readPanels(proposals, detectionSource);
      let recoveryAttempt = null;
      if (reviewed === null && assignComparisonLayout(proposedPanels).status !== 'assigned' && detectionObservations.every(attempt=>attempt.panelCount <= 2 && !attempt.issues.includes('tooManyHeadingAnchors'))) {
        const hypotheses = createLocalPanelHypotheses({width,height});
        if (hypotheses.length) {
          check(); onProgress({stage:'checkingLocalAreas'});
          const localPanels = await readPanels(hypotheses,'local-layout-hypothesis'); check();
          const evidence = assessLocalPanelRecovery({panels:localPanels,width,height,scale});
          recoveryAttempt = {status:evidence.eligible ? 'accepted' : 'rejected',evidence,proposedPanels:localPanels};
          if (evidence.eligible) { proposedPanels = localPanels; detectionSource = 'local-layout-hypothesis'; }
        }
      }
      check();
      return { version: OCR_READER_VERSION, inputRevision, raw, detectionObservations, proposedPanels, recoveryAttempt, route:assignComparisonLayout(proposedPanels).status === 'assigned' ? 'itemReview' : 'needsAreas', issues: recoveryAttempt?.status === 'accepted' ? ['localAreasAndValuesRequireReview'] : reviewed ? ['reviewedRegionsStillRequireRoleAndLineConfirmation'] : detection.issues,
        settings: { tesseract: '7.0.0', core: '7.0.0', languagePackage: '1.0.0', languageVariant: '4.0.0_best_int', language: 'eng', scale, smoothing: false, detectionSource, detectionPsm: detectionSource === 'whole-image-headings' ? detectionPsm : null, detectionVersion: PANEL_DETECTION_VERSION, localRecoveryVersion: LOCAL_PANEL_RECOVERY_VERSION,rowCoverageVersion:OCR_ROW_COVERAGE_VERSION,rowRecoveryVersion:OCR_ROW_RECOVERY_VERSION, cacheMethod: 'none', workerBlobURL: false, resourceOrigin: origin } };
    } catch (error) {
      if (error?.name === 'AbortError' || canceled || signal?.aborted || !isCurrent()) throw abortError();
      // Dependency errors can contain player data; expose only a fixed code.
      throw new Error('Local OCR could not complete. Manual entry remains available.', { cause: 'LOCAL_OCR_FAILED' });
    } finally {
      signal?.removeEventListener('abort', cancel);
      if (worker) { try { await worker.terminate(); } catch {} }
      for (const canvas of canvases) { canvas.width = 0; canvas.height = 0; }
    }
  };
}
export const readComparison = createComparisonReader();
