import { detectComparisonPanels, PANEL_DETECTION_VERSION } from './domain/panel-detection.js';
export const OCR_READER_VERSION = 'browser-reader-1';
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
    let worker = null, canceled = false;
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
      const whole = await pending(worker.recognize(canvasFor({ x: 0, y: 0, width, height }, scale), {}, { text: true, blocks: true })); check();
      const raw = { text: typeof whole.data.text === 'string' ? whole.data.text : '', blocks: structuredClone(whole.data.blocks ?? null), scale, dimensions: [width, height], psm: 11 };
      const detection = detectComparisonPanels({ blocks: raw.blocks, width, height, scale });
      const proposals = reviewed ?? detection.panels;
      const proposedPanels = [];
      await pending(worker.setParameters({ tessedit_pageseg_mode: '6' })); check();
      for (const proposal of proposals) {
        check(); onProgress({ stage: 'readingPanel', panelId: proposal.id });
        const region = proposal.region;
        const result = await pending(worker.recognize(canvasFor(region, scale), {}, { text: true, blocks: true })); check();
        const text = typeof result.data.text === 'string' ? result.data.text : '';
        const blocks = structuredClone(result.data.blocks ?? null);
        const structuredLines = (blocks ?? []).flatMap(block => (block.paragraphs ?? []).flatMap(paragraph => paragraph.lines ?? []));
        const lines = text.split(/\r\n|\r|\n/).map((rawText, ordinal) => ({ id: `${proposal.id}:line-${ordinal}`, ordinal, rawText, label: null, value: null, unit: null, statId: null, confirmed: false,
          provenance: { kind: 'ocr', inputRevision, panelId: proposal.id, region: structuredClone(region), scale, segmentationIdentity: JSON.stringify({ region, scale, psm: 6, version: OCR_READER_VERSION }) } }));
        proposedPanels.push({ ...structuredClone(proposal), role: null, requiresReview: true, rawText: text, blocks, structuredLines, lines, confidence: Number.isFinite(result.data.confidence) ? result.data.confidence : null });
      }
      check();
      return { version: OCR_READER_VERSION, inputRevision, raw, proposedPanels, issues: reviewed ? ['reviewedRegionsStillRequireRoleAndLineConfirmation'] : detection.issues,
        settings: { tesseract: '7.0.0', core: '7.0.0', languagePackage: '1.0.0', languageVariant: '4.0.0_best_int', language: 'eng', scale, smoothing: false, detectionVersion: PANEL_DETECTION_VERSION, cacheMethod: 'none', workerBlobURL: false, resourceOrigin: origin } };
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
