// Loopback-only developer evaluation; never included in public app deployment.
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const assets = new Map([
  ['/vendor/tesseract.min.js', 'node_modules/tesseract.js/dist/tesseract.min.js'],
  ['/vendor/worker.min.js', 'node_modules/tesseract.js/dist/worker.min.js'],
  ['/vendor/lang/eng.traineddata.gz', 'node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz'],
  ['/domain/ocr-session.js', 'public/domain/ocr-session.js'],
  ['/domain/ocr-extraction.js', 'public/domain/ocr-extraction.js'],
  ['/domain/ocr-preprocessing.js', 'public/domain/ocr-preprocessing.js'],
]);
for (const name of await readdir(path.join(root, 'node_modules/tesseract.js-core'))) {
  if (/^tesseract-core(?:-(?:relaxedsimd|simd))?(?:-lstm)?\.wasm(?:\.js)?$/.test(name)) assets.set(`/vendor/core/${name}`, `node_modules/tesseract.js-core/${name}`);
}
for (const [packageName, expected] of [['tesseract.js', '7.0.0'], ['tesseract.js-core', '7.0.0'], ['@tesseract.js-data/eng', '1.0.0']]) {
  const pkg = JSON.parse(await readFile(path.join(root, 'node_modules', packageName, 'package.json'), 'utf8'));
  if (pkg.version !== expected) throw new Error('Pinned evaluation package version mismatch.');
}
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private local OCR evaluation</title><style>body{font:16px system-ui;max-width:1000px;margin:24px auto;padding:12px}button,input,select{font:inherit;margin:8px}img,canvas{max-width:100%;height:auto}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#eee;padding:12px}label{display:block}.line{display:grid;grid-template-columns:1fr 1fr;gap:8px}.line input{min-width:0}small{color:#555}</style><h1>Private local OCR evaluation</h1><p>Evaluation only. No item parsing, recommendations or production adoption. Select a permitted image; pixels remain in this browser. Nothing is uploaded or saved.</p><input id="file" aria-label="Select permitted image" type="file" accept="image/png,image/jpeg,image/webp"><label>Evaluation layout<select id="layout"><option value="full">Full image</option><option value="approved">Approved example: two explicit panel crops (not universal detection)</option></select></label><button id="run" disabled>Run OCR</button><button id="repeat" disabled>Repeat same image/settings</button><button id="cancel">Cancel run</button><button id="reset">Remove image/reset</button><p id="status" role="status">Select a permitted image.</p><canvas id="preview" aria-label="Selected image preview"></canvas><pre id="metadata"></pre><div id="output"></div><script src="/vendor/tesseract.min.js"></script><script type="module" src="/harness.js"></script></html>`;

const auditedHtml = html.replace('<p id="status"', '<button id="gate-block">Block vendor resource loads</button><button id="gate-open">Allow vendor resource loads</button><button id="audit-refresh">Refresh privacy audit</button><details open><summary>Local verification audit</summary><p>Counts only; no player text captured. Main-page instrumentation does not inspect worker globals. Resource gate denies same-origin vendor files; it does not disconnect the browser network.</p><pre id="audit">Audit initializing…</pre></details><p id="status"')
  .replace('</select></label>', '<option value="reviewed">User-reviewed regions and columns</option></select></label><label>Reviewed normalized regions JSON (x/y/width/height and optional labelEnd/valueEnd cuts, each0–1)<textarea id="regions" rows="4" cols="72" aria-label="Reviewed regions JSON">[{"id":"current","box":[0.235,0.074,0.237,0.754]},{"id":"candidate","box":[0.47,0.074,0.232,0.754]}]</textarea></label><p>Regions and column cuts require your visual review. No automatic panel or item identity is inferred. Column OCR is separate; every proposal remains unconfirmed.</p>')
  .replace('<button id="run"', '<label><input type="checkbox" id="neutral-mask">Optional neutral-text mask for label/value column proposals (evaluation only)</label><p>Assumes base text is bright and neutral while comparison text is colored. Colored base text can disappear; neutral comparison text can remain. Original image and whole-panel OCR are retained. No value is confirmed.</p><button id="run"')
  .replace('<script src="/vendor/tesseract.min.js">', '<script src="/audit.js"></script><script src="/vendor/tesseract.min.js">');

function browserAudit() {
  const counters = { storageSet: 0, storageRemove: 0, storageClear: 0, indexedDbOpen: 0, indexedDbDelete: 0, consoleLog: 0, consoleWarn: 0, consoleError: 0, consoleInfo: 0, consoleDebug: 0, cspViolations: 0, pageErrors: 0, unhandledRejections: 0 };
  for (const [method, key] of [['setItem', 'storageSet'], ['removeItem', 'storageRemove'], ['clear', 'storageClear']]) {
    const original = Storage.prototype[method];
    Storage.prototype[method] = function (...args) { counters[key]++; return original.apply(this, args); };
  }
  for (const [method, key] of [['open', 'indexedDbOpen'], ['deleteDatabase', 'indexedDbDelete']]) {
    const original = IDBFactory.prototype[method];
    IDBFactory.prototype[method] = function (...args) { counters[key]++; return original.apply(this, args); };
  }
  for (const method of ['log', 'warn', 'error', 'info', 'debug']) {
    const key = 'console' + method[0].toUpperCase() + method.slice(1);
    // Suppress argument bodies, including dependency errors; retain counts only.
    console[method] = () => { counters[key]++; };
  }
  window.addEventListener('securitypolicyviolation', () => { counters.cspViolations++; });
  window.addEventListener('error', () => { counters.pageErrors++; });
  window.addEventListener('unhandledrejection', () => { counters.unhandledRejections++; });
  window.ocrEvaluationAudit = {
    snapshot: async () => ({ counters: { ...counters }, localStorageEntries: localStorage.length, sessionStorageEntries: sessionStorage.length,
      indexedDbDatabaseCount: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).length : 'unavailable',
      cacheStorageCacheCount: typeof caches !== 'undefined' ? (await caches.keys()).length : 'unavailable' }),
  };
}

async function browserHarness() {
  const api = await import('/domain/ocr-session.js');
  const extraction = await import('/domain/ocr-extraction.js');
  const preprocessing = await import('/domain/ocr-preprocessing.js');
  const element = id => document.getElementById(id);
  let session = api.createOcrSession();
  let bitmap = null, worker = null, imageCounter = 0, previous = null, busy = false;
  const versions = { tesseract: '7.0.0', core: '7.0.0', eng: '1.0.0', languageVariant: '4.0.0_best_int' };
  const settings = { language: 'eng', oem: 1, scale: 3, smoothing: false, psm: 6, dpi: 300, cacheMethod: 'none', workerBlobURL: false };
  const crops = { current: [.235, .074, .237, .754], candidate: [.47, .074, .232, .754] };
  const status = text => { element('status').textContent = text; };
  async function refreshAudit() {
    try {
      const server = await (await fetch('/audit', { cache: 'no-store' })).json();
      const page = await window.ocrEvaluationAudit.snapshot();
      element('audit').textContent = JSON.stringify({ page, server, workerAlive: Boolean(worker), workerScope: 'Worker globals not instrumented; cacheMethod:none and server/CSP checks are separate evidence.' }, null, 2);
    } catch { element('audit').textContent = 'Audit unavailable; no privacy conclusion established.'; }
  }
  for (const [id, action] of [['gate-block', 'block'], ['gate-open', 'open']]) {
    element(id).addEventListener('click', async () => {
      await fetch('/resource-gate/' + action, { method: 'POST', cache: 'no-store' }); await refreshAudit();
    });
  }
  element('audit-refresh').addEventListener('click', refreshAudit);
  function controls() {
    element('run').disabled = !bitmap || busy;
    element('repeat').disabled = !bitmap || busy || !previous;
    element('layout').disabled = busy;
    element('regions').disabled = busy;
    element('neutral-mask').disabled = busy;
  }
  function render() {
    element('output').replaceChildren();
    for (const panel of session.panels) {
      const heading = document.createElement('h2'); heading.textContent = panel.id;
      const note = document.createElement('p'); note.textContent = 'Engine confidence metadata: ' + panel.confidence + ' (not a probability). All text requires review.';
      const raw = document.createElement('pre'); raw.textContent = panel.rawText;
      element('output').append(heading, note, raw);
      if (panel.observationMetadata?.provenance?.extraction) {
        const proposals = document.createElement('pre');
        proposals.setAttribute('aria-label', 'Spatial proposals ' + panel.id);
        proposals.textContent = JSON.stringify(panel.observationMetadata.provenance.extraction, null, 2);
        element('output').append(proposals);
      }
      for (const line of panel.lines) {
        const row = document.createElement('label'); row.className = 'line';
        const label = document.createElement('span'); label.textContent = (line.ordinal + 1) + ': ' + line.rawText + ' [' + line.state + ']';
        const input = document.createElement('input'); input.value = line.effectiveText; input.setAttribute('aria-label', 'Correction ' + panel.id + ' line ' + (line.ordinal + 1));
        // Commit every keystroke before blur/run/cancel; do not remount the input
        // while typing, which would lose its caret/focus and pending composition.
        input.addEventListener('input', () => {
          session = api.correctOcrLine(session, line.id, input.value);
          label.textContent = (line.ordinal + 1) + ': ' + line.rawText + ' [userCorrected]';
        });
        input.addEventListener('change', () => {
          // Some assistive/browser editing paths dispatch change without input.
          session = api.correctOcrLine(session, line.id, input.value);
          label.textContent = (line.ordinal + 1) + ': ' + line.rawText + ' [userCorrected]';
        });
        row.append(label, input); element('output').append(row);
      }
    }
  }
  async function stop() {
    session = api.cancelOcrRun(session); busy = false;
    const old = worker; worker = null;
    if (old) { try { await old.terminate(); } catch {} }
    controls();
  }
  async function reset() {
    const selection = ++imageCounter;
    await stop();
    if (selection !== imageCounter) return;
    session = api.replaceOcrImage(session, null);
    if (bitmap) bitmap.close(); bitmap = null; previous = null;
    element('file').value = ''; element('preview').width = 0; element('preview').height = 0;
    element('metadata').textContent = ''; render(); controls(); status('Image and text removed from active session.');
  }
  element('file').addEventListener('change', async () => {
    const selection = ++imageCounter;
    const file = element('file').files[0];
    await stop();
    if (selection !== imageCounter) return;
    if (bitmap) bitmap.close(); bitmap = null; previous = null;
    session = api.replaceOcrImage(session, 'image-' + selection);
    const imageRevision = session.imageRevision;
    render(); element('metadata').textContent = ''; element('preview').width = 0; controls();
    if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) { status('Select a PNG/JPEG/WebP up to12MiB.'); return; }
    try {
      const decoded = await createImageBitmap(file);
      if (selection !== imageCounter || imageRevision !== session.imageRevision) { decoded.close(); return; }
      if (decoded.width * decoded.height > 7000000) { decoded.close(); status('Image exceeds evaluation pixel limit.'); return; }
      bitmap = decoded;
      const canvas = element('preview'); canvas.width = bitmap.width; canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0); status('Ready; no OCR has run.'); controls();
    } catch { if (selection === imageCounter && imageRevision === session.imageRevision) status('Image decode failed.'); }
  });
  async function run(repeat) {
    if (!bitmap || busy) return;
    const layout = repeat ? previous.layout : element('layout').value;
    element('layout').value = layout;
    let reviewedRegions = null;
    try {
      reviewedRegions = repeat ? previous.settings.reviewedRegions : layout === 'reviewed' ? JSON.parse(element('regions').value) : null;
      if (reviewedRegions !== null && (!Array.isArray(reviewedRegions) || !reviewedRegions.length || reviewedRegions.length > 6 || new Set(reviewedRegions.map(region => region.id)).size !== reviewedRegions.length || reviewedRegions.some(region => !/^[a-z][a-z0-9-]*$/.test(region.id) || !Array.isArray(region.box) || region.box.length !== 4 || !region.box.every(Number.isFinite) || region.box.some(value => value < 0 || value > 1) || region.box[2] <= 0 || region.box[3] <= 0 || region.box[0] + region.box[2] > 1 || region.box[1] + region.box[3] > 1 || ((region.labelEnd !== undefined || region.valueEnd !== undefined) && !(Number.isFinite(region.labelEnd) && Number.isFinite(region.valueEnd) && region.labelEnd > 0 && region.labelEnd < region.valueEnd && region.valueEnd < 1))))) throw new Error();
    } catch { status('Invalid reviewed regions. Supply unique IDs, in-bounds normalized boxes and optional ordered column cuts.'); return; }
    const neutralMask = repeat ? previous.settings.neutralMask : element('neutral-mask').checked;
    element('neutral-mask').checked = neutralMask;
    const runSettings = { ...settings, layout, crops: layout === 'approved' ? crops : null, reviewedRegions, extractionVersion: extraction.OCR_EXTRACTION_VERSION,
      neutralMask, maskVersion: preprocessing.NEUTRAL_TEXT_MASK_VERSION, maskSettings: preprocessing.NEUTRAL_TEXT_MASK_SETTINGS, outputs: ['text', 'blocks'] };
    const start = api.beginOcrRun(session, runSettings); session = start.session;
    const token = start.token; const started = performance.now(); busy = true; controls(); status('Loading local worker resources…');
    let localWorker = worker, completed = false;
    const canvases = [];
    try {
      if (!localWorker) localWorker = await Tesseract.createWorker('eng', 1, {
        workerPath: location.origin + '/vendor/worker.min.js', corePath: location.origin + '/vendor/core', langPath: location.origin + '/vendor/lang',
        cacheMethod: 'none', workerBlobURL: false, gzip: true, logger: () => {}, errorHandler: () => {},
      });
      if (!api.isOcrRunCurrent(session, token)) return;
      worker = localWorker;
      await localWorker.setParameters({ tessedit_pageseg_mode: '6', user_defined_dpi: '300', preserve_interword_spaces: '1' });
      const panels = [];
      const regions = layout === 'reviewed' ? reviewedRegions : layout === 'approved' ? Object.entries(crops).map(([id, box]) => ({ id, box })) : [{ id: 'full', box: [0, 0, 1, 1] }];
      for (const region of regions) {
        const { id, box } = region;
        if (!api.isOcrRunCurrent(session, token)) return;
        const [x, y, width, height] = box;
        const sx = Math.round(bitmap.width * x), sy = Math.round(bitmap.height * y);
        const sw = Math.min(bitmap.width - sx, Math.round(bitmap.width * width)), sh = Math.min(bitmap.height - sy, Math.round(bitmap.height * height));
        const canvas = document.createElement('canvas'); canvases.push(canvas);
        canvas.width = sw * 3; canvas.height = sh * 3;
        const context = canvas.getContext('2d'); context.imageSmoothingEnabled = false;
        context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        status('Recognizing ' + id + ' locally…');
        const result = await localWorker.recognize(canvas, {}, { text: true, blocks: true });
        if (!api.isOcrRunCurrent(session, token)) return;
        const crop = { x: sx, y: sy, width: sw, height: sh };
        const spatial = extraction.extractSpatialObservation({ rawText: result.data.text, blocks: result.data.blocks, crop, scale: 3 });
        let columnProposals = null;
        if (region.labelEnd !== undefined) {
          const observations = [];
          for (const [lane, left, right] of [['label', 0, region.labelEnd], ['value', region.labelEnd, region.valueEnd], ['delta', region.valueEnd, 1]]) {
            if (!api.isOcrRunCurrent(session, token)) return;
            const columnX = Math.round(sw * left), columnWidth = Math.round(sw * right) - columnX;
            if (columnWidth < 1) throw new Error('Column too narrow.');
            const columnCanvas = document.createElement('canvas'); canvases.push(columnCanvas);
            columnCanvas.width = columnWidth * 3; columnCanvas.height = sh * 3;
            const columnContext = columnCanvas.getContext('2d'); columnContext.imageSmoothingEnabled = false;
            columnContext.drawImage(bitmap, sx + columnX, sy, columnWidth, sh, 0, 0, columnCanvas.width, columnCanvas.height);
            const masked = neutralMask && lane !== 'delta';
            if (masked) {
              const pixels = columnContext.getImageData(0, 0, columnCanvas.width, columnCanvas.height);
              const filtered = preprocessing.maskNeutralText(pixels);
              pixels.data.set(filtered.data); columnContext.putImageData(pixels, 0, 0);
            }
            status('Recognizing reviewed ' + id + ' ' + lane + ' column locally…');
            const columnResult = await localWorker.recognize(columnCanvas, {}, { text: true, blocks: true });
            if (!api.isOcrRunCurrent(session, token)) return;
            observations.push({ lane, preprocessing: masked ? { version: preprocessing.NEUTRAL_TEXT_MASK_VERSION, settings: preprocessing.NEUTRAL_TEXT_MASK_SETTINGS, assumption: 'bright-neutral-base-text; colored-comparison-text; unconfirmed' } : { version: 'integer-upscale-nearest-v1' }, extraction: extraction.extractSpatialObservation({ rawText: columnResult.data.text, blocks: columnResult.data.blocks, crop: { x: sx + columnX, y: sy, width: columnWidth, height: sh }, scale: 3, columns: { [lane]: [0, 1] } }) });
          }
          columnProposals = extraction.assembleColumnObservations(observations);
        }
        const segmentationIdentity = JSON.stringify({ crop, scale: 3, labelEnd: region.labelEnd ?? null, valueEnd: region.valueEnd ?? null, neutralMask, extractionVersion: extraction.OCR_EXTRACTION_VERSION, maskVersion: neutralMask ? preprocessing.NEUTRAL_TEXT_MASK_VERSION : null });
        panels.push({ id, rawText: result.data.text, confidence: result.data.confidence, segmentationIdentity,
          crop, boxes: spatial.rows, provenance: { preprocessing: 'integer-upscale-nearest-v1', scale: 3,
            segmentationIdentity,
            extraction: columnProposals ?? spatial } });
      }
      const text = panels.map(panel => [panel.id, panel.rawText]);
      const proposals = panels.map(panel => [panel.id, panel.provenance.extraction]);
      const sameSettings = previous && JSON.stringify(previous.settings) === JSON.stringify(runSettings);
      const equal = sameSettings ? JSON.stringify(previous.text) === JSON.stringify(text) : null;
      const repeatedProposalsEqual = sameSettings ? JSON.stringify(previous.proposals) === JSON.stringify(proposals) : null;
      const metadata = { versions, settings: runSettings, durationMs: Math.round(performance.now() - started), repeatedTextEqual: equal, repeatedProposalsEqual, imageDimensions: [bitmap.width, bitmap.height], resourceOrigin: location.origin };
      const accepted = api.acceptOcrRun(session, token, { panels, metadata }); session = accepted.session;
      if (accepted.accepted) { completed = true; previous = { layout, settings: runSettings, text, proposals }; element('metadata').textContent = JSON.stringify(metadata, null, 2); render(); status('OCR finished; raw text only. Every line needs review.'); }
    } catch { if (api.isOcrRunCurrent(session, token)) { session = api.cancelOcrRun(session); status('Local OCR failed; no results fabricated.'); } }
    finally {
      if (localWorker && !completed) { try { await localWorker.terminate(); } catch {} }
      canvases.forEach(canvas => { canvas.width = 0; canvas.height = 0; });
      if (worker === localWorker && !completed) worker = null;
      if (session.nextRun === token.run && session.imageRevision === token.imageRevision) busy = false;
      controls();
      await refreshAudit();
    }
  }
  element('run').addEventListener('click', () => run(false)); element('repeat').addEventListener('click', () => run(true));
  element('cancel').addEventListener('click', async () => { await stop(); status('Run canceled; previous observations/corrections retained.'); });
  element('reset').addEventListener('click', reset);
  window.addEventListener('pagehide', event => {
    void stop();
    if (!event.persisted && bitmap) bitmap.close();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { controls(); status(bitmap ? 'Image and corrections retained after navigation; canceled runs can be repeated.' : 'Select a permitted image.'); }
  });
  controls();
  await refreshAudit();
}

const mime = { '.js': 'text/javascript; charset=utf-8', '.wasm': 'application/wasm', '.gz': 'application/gzip' };
const assetMetadata = {};
for (const [url, relative] of assets) {
  const content = await readFile(path.join(root, relative));
  assetMetadata[url] = { bytes: content.length, sha256: createHash('sha256').update(content).digest('hex'), served: 0, blocked: 0 };
}
const serverAudit = { methods: { GET: 0, HEAD: 0, POST: 0, OTHER: 0 }, rejections: { hostOrMethod: 0, query: 0, unknown: 0, control: 0, read: 0 }, vendorGateBlocked: false, gateChanges: 0 };
createServer(async (request, response) => {
  // No request logging, upload endpoint, persistence or externally bound socket.
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; connect-src 'self'; img-src 'self' blob: data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" };
  serverAudit.methods[Object.hasOwn(serverAudit.methods, request.method) ? request.method : 'OTHER']++;
  if (!['127.0.0.1:4176', 'localhost:4176'].includes(request.headers.host) || !['GET', 'HEAD', 'POST'].includes(request.method)) { serverAudit.rejections.hostOrMethod++; response.writeHead(403, headers); response.end(); return; }
  try {
    const url = new URL(request.url, 'http://127.0.0.1:4176');
    if (url.search) { serverAudit.rejections.query++; response.writeHead(404, headers); response.end(); return; }
    const pathname = url.pathname;
    let content, type;
    if (request.method === 'POST') {
      if (!['/resource-gate/block', '/resource-gate/open'].includes(pathname) || request.headers.origin !== 'http://' + request.headers.host || request.headers['transfer-encoding'] || Number(request.headers['content-length'] || 0) !== 0) {
        serverAudit.rejections.control++; request.resume(); response.writeHead(403, headers); response.end(); return;
      }
      serverAudit.vendorGateBlocked = pathname === '/resource-gate/block'; serverAudit.gateChanges++;
      response.writeHead(204, headers); response.end(); return;
    }
    if (pathname === '/') { content = auditedHtml; type = 'text/html; charset=utf-8'; }
    else if (pathname === '/audit') { content = JSON.stringify({ ...serverAudit, fixedAssets: assetMetadata }); type = 'application/json'; }
    else if (pathname === '/audit.js') { content = `(${browserAudit.toString()})();`; type = 'text/javascript; charset=utf-8'; }
    else if (pathname === '/harness.js') { content = `(${browserHarness.toString()})();`; type = 'text/javascript; charset=utf-8'; }
    else if (assets.has(pathname)) {
      if (serverAudit.vendorGateBlocked && pathname.startsWith('/vendor/')) { assetMetadata[pathname].blocked++; response.writeHead(503, headers); response.end(); return; }
      content = await readFile(path.join(root, assets.get(pathname)));
      assetMetadata[pathname].bytes = content.length;
      assetMetadata[pathname].sha256 = createHash('sha256').update(content).digest('hex');
      assetMetadata[pathname].served++; type = mime[path.extname(pathname)] || 'application/octet-stream';
    }
    else { serverAudit.rejections.unknown++; response.writeHead(404, headers); response.end(); return; }
    response.writeHead(200, { ...headers, 'Content-Type': type }); response.end(request.method === 'HEAD' ? undefined : content);
  } catch { serverAudit.rejections.read++; response.writeHead(404, headers); response.end(); }
}).listen(4176, '127.0.0.1', () => console.log('Local OCR evaluation: http://127.0.0.1:4176'));
