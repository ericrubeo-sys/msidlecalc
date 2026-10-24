import { compareItemLines } from './domain/item-lines.js';
import { SUPPORT_DESTINATION } from './config.js';
import { compareSupportedFactors } from './domain/damage-model.js';
import { replaceFinalDamageSources } from './domain/reaggregation.js';
import { getClaim } from './domain/mechanics-data.js';
import { readComparison } from './ocr-reader.js';
import { openCropEditor } from './crop-editor.js';
import { assignComparisonLayout } from './domain/comparison-layout.js';
import { proposePanelRows } from './domain/ocr-item-rows.js';
import { groupReviewRows } from './domain/ocr-review-groups.js';
import { parseReviewRecords, adoptReviewRecords } from './domain/inline-review.js';
import { RELEASE_ID } from './release.js';
import { importScreenshotProposals, editScreenshotRecord } from './domain/screenshot-review.js';

const $ = (selector) => document.querySelector(selector);
let nextId = 0;
let revision = 0;
let imageUrl = null;
let imageRevision = 0;
const records = { current: [], candidate: [] };
let sourceCanvas = null, stagedReading = null, previousEntries = null;
let readingController = null, readingRun = 0, readingBusy = false;
let readOnDecode = false;
let editorImageRevision = null, editorEdited = false;
let markedRegions = [null, null], cropEditor = null;
const units = [['unknown', 'Unknown'], ['statPoint', 'Points'], ['displayPercent', '%'], ['level', 'Levels'], ['factor', 'Multiplier'], ['internalRate', 'Internal rate']];
const issueMessages = { invalidDecimal: 'Use a number such as 1234, 1,234 or 12.5%.', unitMismatch: 'Use % for a percentage value.', unsupportedMagnitude: 'Value exceeds the supported numerical range.', unsupportedPrecision: 'Use at most 18 decimal places.', integerRequired: 'Skill levels must be whole numbers.' };
const effectiveRawValue = line => line.correction?.rawValue ?? line.rawValue ?? '';

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function markStale({ keepCompleteness = false } = {}) {
  revision++;
  if (!keepCompleteness) $('#visible-lines-complete').checked = false;
  if (!$('#results').hidden) $('#stale-result').hidden = false;
  if (!$('#model-results').hidden) $('#model-stale').hidden = false;
  $('#advanced').hidden = !Object.values(records).every(lines=>lines.some(record=>String(record.correction?.rawLabel ?? record.rawLabel).trim().toLowerCase() === 'final damage'));
}
function addLine(side, initial = null, target = null) {
  const record = initial ?? { id: `${side}-${nextId++}`, rawLabel: '', rawValue: '', unit: 'unknown', provenance: { kind: 'manual' }, confirmed: false };
  records[side].push(record);
  const row = element('div', undefined, 'line inline-line'); row.dataset.lineId = record.id;
  const sideName = side === 'current' ? 'Currently equipped' : 'Potential new equip';
  const ordinal = records[side].length;
  const error = element('p', '', 'field-error'); error.id = `${record.id}-error`; error.hidden = true;
  for (const [field, labelText] of [['rawLabel', 'Stat'], ['rawValue', 'Value']]) {
    const label = element('label', labelText, field === 'rawLabel' ? 'label-field' : 'value-field');
    const input = element(field === 'rawLabel' ? 'textarea' : 'input'); input.id = `${record.id}-${field}`; label.htmlFor = input.id;
    if (field === 'rawLabel') input.rows = 2; else input.type = 'text';
    input.autocomplete = 'off'; input.maxLength = field === 'rawLabel' ? 200 : 100;
    input.setAttribute('aria-label', `${sideName}, line ${ordinal}, ${labelText.toLowerCase()}`);
    input.setAttribute('aria-describedby', error.id);
    if (field === 'rawValue') { input.inputMode = 'decimal'; input.placeholder = 'Required'; }
    input.dataset.field = field; input.value = record.correction?.[field] ?? record[field] ?? '';
    const highlight = () => {
      const missing = !input.value.trim(); input.classList.toggle('needs-value', missing);
      if (missing) input.setAttribute('aria-invalid','true'); else input.removeAttribute('aria-invalid');
    };
    highlight();
    input.addEventListener('input', () => {
      if (record.provenance?.kind === 'ocr') Object.assign(record, editScreenshotRecord(record, field, input.value));
      else record[field] = input.value;
      {
        const value = record.correction?.rawValue ?? record.rawValue;
        const unit = value.trim().endsWith('%') ? 'displayPercent' : 'unknown';
        if (record.provenance?.kind === 'ocr') Object.assign(record, editScreenshotRecord(record, 'unit', unit)); else record.unit = unit;
      }
      editorEdited = true; highlight(); error.hidden = true; markStale();
    });
    label.append(input); row.append(label);
  }
  const remove = element('button', '×', 'remove'); remove.type = 'button';
  remove.setAttribute('aria-label', `Remove ${sideName.toLowerCase()} line ${ordinal}`);
  remove.addEventListener('click', () => {
    records[side].splice(records[side].indexOf(record), 1); row.remove(); editorEdited = true; markStale(); $(`#${side}-add`).focus();
  });
  row.append(remove,error); (target ?? $(`#${side}-lines`)).append(row); markStale(); return row;
}
for (const side of ['current', 'candidate']) {
  const card = element('section', undefined, 'item-card');
  card.append(element('h2', side === 'current' ? 'Currently equipped · left' : 'Potential new equip · right'));
  const crop = element('img', undefined, 'review-crop'); crop.id = `${side}-crop`; crop.hidden = true; card.append(crop);
  const name = element('label', 'Item name (optional)'); name.htmlFor = `${side}-name`;
  const input = element('input', undefined, 'item-name'); input.id = `${side}-name`; input.maxLength = 100; input.autocomplete = 'off'; input.addEventListener('input', markStale);
  const lines = element('div'); lines.id = `${side}-lines`;
  const add = element('button', 'Add line'); add.type = 'button'; add.id = `${side}-add`;
  add.addEventListener('click', () => { editorEdited = true; addLine(side).querySelector('textarea').focus(); });
  name.hidden = true; input.hidden = true; card.append(name, input, lines, add); $('#item-fields').append(card); addLine(side);
}

$('#comparison-form').addEventListener('submit', (event) => {
  event.preventDefault(); $('#form-error').hidden = true;
  const items = {};
  let firstInvalid = null;
  for (const side of ['current', 'candidate']) {
    items[side] = parseReviewRecords(records[side], { imageRevision, confirmed: $('#visible-lines-complete').checked });
    for (const line of items[side]) {
      if (records[side].find(record=>record.id===line.id)?.otherReading && !String(effectiveRawValue(line)).trim()) continue;
      const error = $(`#${line.id}-error`);
      const input = $(`#${line.id}-rawValue`);
      error.hidden = true; input.removeAttribute('aria-invalid');
      if (line.state === 'invalid' || (!line.effectiveLabel.trim() && String(effectiveRawValue(line)).trim()) || (line.effectiveLabel.trim() && !String(effectiveRawValue(line)).trim()) || (records[side].length === 1 && !line.effectiveLabel.trim())) {
        error.textContent = line.state === 'invalid' ? (issueMessages[line.issues[0]] || 'Correct this value or leave it blank if unknown.') : (!line.effectiveLabel.trim() ? 'Add the stat name.' : 'Enter this item’s value. Blank is unknown, not zero.');
        const invalidField = !line.effectiveLabel.trim() ? $(`#${line.id}-rawLabel`) : input;
        error.hidden = false; invalidField.setAttribute('aria-invalid', 'true'); firstInvalid ??= invalidField;
      }
    }
  }
  if (firstInvalid) { if (firstInvalid.closest('#other-readings')) $('#reading-details').open = true; $('#form-error').textContent = 'Correct the highlighted entries. Your other entries are kept.'; $('#form-error').hidden = false; firstInvalid.focus(); return; }
  if (!$('#visible-lines-complete').checked) { $('#form-error').textContent = 'Check both items, then confirm the checkbox below them.'; $('#form-error').hidden = false; $('#visible-lines-complete').focus(); return; }
  const nonempty = (lines) => lines.some((line) => line.effectiveLabel.trim());
  if (!nonempty(items.current) || !nonempty(items.candidate)) { $('#form-error').textContent = 'Enter at least one stat label for each item. Values may remain unknown.'; $('#form-error').hidden = false; return; }
  // Blank unused rows remain in the editor but need no result row.
  const complete = $('#visible-lines-complete').checked;
  const meaningful = lines => lines.filter(l => l.effectiveLabel.trim() || String(effectiveRawValue(l)).trim());
  const result = compareItemLines(meaningful(items.current), meaningful(items.candidate), {currentComplete:complete,candidateComplete:complete});
  const body = $('#result-rows'); body.replaceChildren();
  for (const row of result.rows) {
    const entry = element('article', undefined, 'result-row');
    const label = row.current?.effectiveLabel ?? row.candidate?.effectiveLabel;
    entry.append(element('strong', label));
    const show = (line) => !line ? 'No matched line' : line.effectiveValue ? `${line.effectiveValue.decimal}${line.unit === 'displayPercent' ? '%' : ` (${units.find(u => u[0] === line.unit)?.[1] || line.unit})`}` : 'Unknown';
    const before = row.presenceChange === 'added' ? 'Absent from reviewed list' : show(row.current);
    const after = row.presenceChange === 'removed' ? 'Absent from reviewed list' : show(row.candidate);
    entry.append(element('p', `Currently equipped: ${before} · Potential new equip: ${after}`));
    if (row.presenceChange) entry.append(element('p', row.presenceChange === 'removed' ? 'This visible item line is lost on replacement.' : 'This visible item line is added on replacement.'));
    entry.append(element('p', row.differenceDecimal === null ? 'Change: unknown' : `Raw change: ${row.difference > 0 ? '+' : ''}${row.differenceDecimal}${row.unit === 'displayPercent' ? ' percentage points' : ''}`));
    if (row.unit === 'unknown') entry.append(element('p', 'Unit and effect meaning are unconfirmed. This is only a raw numerical difference.'));
    if (row.status === 'unmatched') entry.append(element('p','Unmatched: unknown until both visible lists are complete and their values are checked.'));
    body.append(entry);
  }
  $('#results').dataset.inputRevision = String(revision);
  $('#stale-result').hidden = true; $('#results').hidden = false; $('#results').focus();
});
$('#visible-lines-complete').addEventListener('change', () => markStale({keepCompleteness:true}));

$('#independent-final').addEventListener('change', markStale);
$('#calculate').addEventListener('click', () => {
  const body = $('#model-effect'); body.replaceChildren();
  const trace = $('#model-trace'); trace.replaceChildren();
  const contexts = $('#context-results'); contexts.replaceChildren();
  const current = parseReviewRecords(records.current, {imageRevision, confirmed: $('#visible-lines-complete').checked});
  const candidate = parseReviewRecords(records.candidate, {imageRevision, confirmed: $('#visible-lines-complete').checked});
  const fd = lines => lines.filter(line => line.statId === 'finalDamage');
  const a = fd(current), b = fd(candidate);
  const valid = lines => lines.length > 0 && lines.every(line => line.state === 'confirmed' && line.unit === 'displayPercent' && line.value >= 0);
  let result = null;
  if (!$('#independent-final').checked) body.append(element('p', 'No numerical effect calculated. Confirm the independent-source semantics before calculating.'));
  else if (!valid(a) || !valid(b)) body.append(element('p', 'No numerical effect calculated. Both items need confirmed Final Damage source lines with % units. Missing or unreadable values remain unknown.'));
  else {
    try {
      const source = line => ({ id: line.id, value: Number(line.effectiveValue.decimal) / 100 });
      const replacement = replaceFinalDamageSources({ sources: a.map(source), oldSourceIds: a.map(line => line.id), candidateSources: b.map(source) });
      const other = [...current, ...candidate].filter(line => line.statId !== 'finalDamage' && line.effectiveLabel.trim()).map(line => line.id);
      result = compareSupportedFactors({ inputRevision: revision, factors: [{id:'finalDamage',current:replacement.before,candidate:replacement.after}],unsupportedEffects:other });
      if (result.status !== 'partial' || !result.combinedFactor) throw new RangeError('Unsupported arithmetic');
      const pct = result.combinedFactor.percentChange;
      body.append(element('h3', 'Isolated Final Damage source effect'));
      body.append(element('p', `${pct > 0 ? '+' : ''}${new Intl.NumberFormat(undefined,{maximumSignificantDigits:6}).format(pct)}% ordinary pre-content factor change. Confidence: Low.`));
      body.append(element('p', 'This holds every other factor equal and assumes independent sources at the same stage. It is not an equipment recommendation, sustained DPS, or a result for any named battle.'));
      body.append(element('p', 'The unchanged Final Damage sources cancel algebraically, so their total and Critical Rate are not required for this isolated factor. That cancellation does not establish the effects of your other item lines.'));
      trace.append(element('p', `Model: ${result.modelVersion}. Source reaggregation: ${replacement.versions.model}. Dataset: ${replacement.versions.data}. Input revision: ${result.inputRevision}.`));
      for (const id of result.combinedFactor.claimIds) {
        const claim = getClaim(id); const p = element('p'); const link = element('a', `${id} · ${claim.source.section}`); link.href = claim.source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; p.append(link); trace.append(p,element('p',claim.exactSupportedClaim));
      }
      trace.append(element('p', 'Source publication is official; implementation has synthetic fixtures only. No controlled live-game validation. Values are treated as entered; display rounding and hidden effects may limit predictions.'));
      trace.append(element('p', `Other item lines retained but not evaluated: ${other.length}.`));
    } catch (error) {
      if (!(error instanceof TypeError || error instanceof RangeError)) throw error;
      body.append(element('p', 'No numerical effect calculated. Values are outside the supported numerical range or source contract. Your entries are kept.'));
    }
  }
  for (const [title,reason] of [
    ['Chapter Breakthrough','A complete verified profile and encounter dependencies are not yet established.'],
    ['Zakum / Horntail Boss Raids','The official guide describes a square-root-based adjustment; its prose does not establish a complete executable encounter profile.'],
    ['Guild content','Guild Raid and Guild Training have distinct rules. Root-based descriptions and incomplete target/skill data do not support a general Guild recommendation.'],
    ['Arena','PvP adjustment, opponent defenses, exceptions and skill interactions require a dedicated supported profile.'],
  ]) {
    const card = element('article',undefined,'context-result'); card.append(element('h3',title),element('p','Recommendation unavailable. Confidence: Low.'),element('p',reason)); contexts.append(card);
  }
  $('#model-results').hidden = false; $('#model-results').dataset.inputRevision = String(revision);
  $('#model-stale').hidden = true; $('#model-results').focus();
});

function setReadingBusy(busy) {
  readingBusy = busy;
  $('.intake').dataset.screen = busy ? 'reading' : sourceCanvas ? 'review' : 'choose';
  $('#reading-screen').hidden = !busy;
  $('#read-image').disabled = busy || !sourceCanvas;
  $('#adjust-areas').disabled = busy || !sourceCanvas;
  $('label.upload').textContent = sourceCanvas ? 'Choose another photo' : 'Choose screenshot';
}
function cancelReading(announce = false) {
  const wasReading = readingBusy;
  readOnDecode = false;
  readingRun++; readingController?.abort(); readingController = null; setReadingBusy(false);
  if (wasReading) restoreStagedAreas();
  if (announce) $('#screenshot-status').textContent = 'Reading canceled. Your edits are kept.';
}
function refreshReviewState() { markStale(); }
function drawImageReference(temporary = null) {
  const canvas = $('#screenshot-canvas');
  if (!sourceCanvas) { canvas.width = 0; canvas.height = 0; return; }
  canvas.width = sourceCanvas.width; canvas.height = sourceCanvas.height;
  const context = canvas.getContext('2d'); context.drawImage(sourceCanvas, 0, 0);
  const areas = markedRegions.map((region, index) => ({ region: temporary?.index === index ? temporary.region : region, label: `Area ${index + 1}` }));
  for (const { region, label } of areas) {
    if (!region) continue;
    const size = Math.max(12, canvas.width / 60);
    context.strokeStyle = '#5bd1d3'; context.lineWidth = Math.max(1, canvas.width / 320);
    context.strokeRect(region.x, region.y, region.width, region.height);
    context.font = `bold ${size}px Verdana`; context.fillStyle = '#0b1722';
    context.fillRect(region.x, Math.max(0, region.y - size * 1.4), size * 5, size * 1.4);
    context.fillStyle = '#ffffff'; context.fillText(label, region.x + 2, Math.max(size, region.y - size * .25));
  }
}
function restoreStagedAreas() {
  if (!sourceCanvas || !stagedReading || stagedReading.imageRevision !== imageRevision) return;
  drawImageReference();
}
function showReading(reading) {
  stagedReading = reading;
  let layout = assignComparisonLayout(reading.proposedPanels);
  const detected = layout.status === 'assigned';
  if (!detected) layout = assignComparisonLayout(reading.recoveryAttempt?.proposedPanels);
  let panels = layout.status === 'assigned' ? layout.panels : [null,null];
  // A single located panel is a tentative draft, not a successful pair. Keep
  // its values available for review rather than throwing its extraction away.
  if (!panels.some(Boolean) && reading.proposedPanels?.length === 1) {
    const panel = reading.proposedPanels[0];
    if (panel.region && Array.isArray(panel.lines)) {
      const side = panel.region.x + panel.region.width / 2 < sourceCanvas.width * .47 ? 0 : 1;
      panels[side] = panel;
    }
  }
  let incoming = {current:[],candidate:[]};
  if (panels.some(Boolean)) {
    const importPanels = panels.map((panel,index)=>panel ?? {id:`empty-${index}`,lines:[],region:null});
    incoming = importScreenshotProposals({ proposedPanels:importPanels, assignment:{current:importPanels[0].id,candidate:importPanels[1].id}, assignmentConfirmed:true, imageRevision, runId:reading.runId });
  }
  // Separators stay in original evidence. Non-stat observations remain editable
  // in one quiet details panel; they are never silently interpreted as effects.
  for (const side of ['current','candidate']) {
    incoming[side] = incoming[side].filter(record => record.rawText.trim() || record.rawLabel.trim() || record.rawValue.trim());
    const panel = panels[side === 'current' ? 0 : 1];
    if (panel) {
      const groups = groupReviewRows(proposePanelRows(panel).rows);
      const unresolved = new Set(groups.unresolved.map(row=>row.rawText));
      for (const record of incoming[side]) record.otherReading = unresolved.has(record.rawText);
    }
    if (!incoming[side].some(record=>!record.otherReading)) incoming[side].unshift({id:`blank-${imageRevision}-${reading.runId}-${side}`,rawLabel:'',rawValue:'',unit:'unknown',confirmed:false,provenance:{kind:'manual'}});
  }
  const adopted = adoptReviewRecords(records,incoming,{imageRevision,previousImageRevision:editorImageRevision,edited:editorEdited});
  if (!adopted.preserved) {
    previousEntries = {items:structuredClone(records),names:{current:$('#current-name').value,candidate:$('#candidate-name').value},imageRevision:editorImageRevision};
    replaceEditor(adopted.items); editorEdited = false;
  } else replaceEditor(adopted.items);
  editorImageRevision = imageRevision;
  markedRegions = panels.map(panel=>panel?.region ?? null); drawImageReference();
  for (const [index,side] of ['current','candidate'].entries()) {
    const image = $(`#${side}-crop`), panel = panels[index]; image.hidden = !panel;
    if (panel) {
      const crop = document.createElement('canvas'); crop.width=panel.region.width; crop.height=panel.region.height;
      crop.getContext('2d').drawImage(sourceCanvas,panel.region.x,panel.region.y,panel.region.width,panel.region.height,0,0,crop.width,crop.height);
      image.src=crop.toDataURL('image/png'); image.alt=side === 'current' ? 'Currently equipped item read area' : 'Potential new equip read area'; crop.width=0; crop.height=0;
    }
  }
  $('#whole-reading').textContent = [reading.raw?.text ?? '',...panels.map(panel=>panel?.rawText ?? '')].join('\n\n');
  $('#reading-details').hidden = false;
  $('#draft-description').textContent = adopted.preserved ? 'Your corrections are kept. Check the new read areas.' : detected ? 'Check the photo and correct any values below.' : 'Some details couldn’t be read. Fill the highlighted fields, or adjust the photo areas.';
  $('#screenshot-drafts').append($('#comparison-form'),$('#advanced'),$('#results'));
  $('#manual').hidden = true; $('#screenshot-drafts').hidden = false;
  $('#restore-entries').hidden = !previousEntries || !Object.values(previousEntries.items).some(lines=>lines.some(record=>record.rawLabel.trim() || record.correction));
  markStale();
}
async function startReading(regions = null) {
  if (!sourceCanvas) return;
  cancelReading();
  const runId = ++readingRun, selectedRevision = imageRevision, original = sourceCanvas;
  const controller = new AbortController(); readingController = controller;
  setReadingBusy(true);
  $('#screenshot-status').textContent = '';
  try {
    const reading = await readComparison(original, { inputRevision: selectedRevision, signal: controller.signal, regions,
      isCurrent: () => runId === readingRun && selectedRevision === imageRevision,
      onProgress: () => {} });
    if (runId !== readingRun || selectedRevision !== imageRevision) return;
    showReading({ ...reading, imageRevision: selectedRevision, runId });
    $('#screenshot-status').textContent = '';
  } catch (error) {
    if (runId === readingRun && selectedRevision === imageRevision && error?.name !== 'AbortError') { showReading({proposedPanels:[],raw:{text:''},imageRevision:selectedRevision,runId}); $('#screenshot-status').textContent = ''; }
  } finally {
    if (runId === readingRun) { readingController = null; setReadingBusy(false); restoreStagedAreas(); }
  }
}
function replaceEditor(items, names) {
  $('#other-readings').replaceChildren();
  for (const side of ['current', 'candidate']) {
    $(`#${side}-lines`).replaceChildren(); records[side] = [];
    for (const record of items[side]) {
      let target = null;
      if (record.otherReading) {
        target = $(`#${side}-other`);
        if (!target) { target=element('section'); target.id=`${side}-other`; target.append(element('h3',side === 'current' ? 'Other readings · left' : 'Other readings · right')); $('#other-readings').append(target); }
      }
      addLine(side,structuredClone(record),target);
    }
    $(`#${side}-name`).value = names?.[side] ?? '';
  }
  $('#manual').open = true; markStale();
}
$('#restore-entries').addEventListener('click', () => {
  if (!previousEntries) return;
  replaceEditor(previousEntries.items, previousEntries.names); $('#visible-lines-complete').checked = previousEntries.imageRevision === imageRevision && previousEntries.complete; previousEntries = null; $('#restore-entries').hidden = true;
  editorEdited = true; editorImageRevision = imageRevision;
  $('#screenshot-status').textContent = 'Previous entries restored. Screenshot-derived lines still require review for the current image.';
});
$('#read-image').addEventListener('click', () => startReading());
$('#cancel-reading').addEventListener('click', () => cancelReading(true));
$('#adjust-areas').addEventListener('click', () => {
  if (!sourceCanvas || readingBusy) return;
  if (sourceCanvas.width < 40 || sourceCanvas.height < 40) { $('#screenshot-status').textContent = 'This photo is too small to adjust. Choose a larger photo or enter details below.'; return; }
  cropEditor?.close();
  cropEditor = openCropEditor({ image: sourceCanvas, regions: markedRegions,
    onClose: () => { cropEditor = null; },
    onApply: regions => {
      markedRegions = regions; drawImageReference();
      void startReading(regions.map((region, index) => ({ id: `reviewed-${index + 1}`, region })));
    } });
});
function removeImage() {
  imageRevision++; cancelReading(); cropEditor?.close(); markedRegions = [null, null]; stagedReading = null;
  if (imageUrl) URL.revokeObjectURL(imageUrl); imageUrl = null;
  if (sourceCanvas) { sourceCanvas.width = 0; sourceCanvas.height = 0; sourceCanvas = null; }
  const preview = $('#screenshot-preview'); preview.onload = null; preview.onerror = null; preview.removeAttribute('src');
  $('#whole-reading').textContent = ''; $('#screenshot-drafts').hidden = true;
  $('#manual').append($('#comparison-form'),$('#advanced'),$('#results')); $('#manual').hidden = false;
  for (const side of ['current','candidate']) $(`#${side}-crop`).hidden = true;
  $('#image-reference').hidden = true; $('#screenshot').value = ''; $('#screenshot-status').textContent = '';
  $('.intake').dataset.selected = 'false'; $('.guide-frame').hidden = false; $('.legend').hidden = false;
  drawImageReference(); refreshReviewState(); markStale(); setReadingBusy(false);
}
$('#remove-image').addEventListener('click', () => { removeImage(); $('#screenshot-status').textContent = 'Screenshot removed. Entries and corrections are kept; screenshot lines need renewed review.'; });
$('#screenshot').addEventListener('change', () => {
  const file = $('#screenshot').files[0]; if (!file) return;
  removeImage();
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { $('#screenshot-status').textContent = 'Choose a PNG, JPEG or WebP up to 10 MB. Your entries have been kept.'; return; }
  $('.intake').dataset.selected = 'true'; setReadingBusy(true); readOnDecode = true;
  const selectedRevision = imageRevision; imageUrl = URL.createObjectURL(file);
  const preview = $('#screenshot-preview');
  preview.onload = () => {
    if (selectedRevision !== imageRevision) return;
    const shouldRead = readOnDecode;
    if (preview.naturalWidth * preview.naturalHeight > 7000000) { removeImage(); $('#screenshot-status').textContent = 'This image exceeds the current 7-million-pixel limit. Your entries are kept.'; return; }
    sourceCanvas = document.createElement('canvas'); sourceCanvas.width = preview.naturalWidth; sourceCanvas.height = preview.naturalHeight;
    sourceCanvas.getContext('2d').drawImage(preview, 0, 0);
    $('#image-reference').hidden = false; $('.guide-frame').hidden = true; $('.legend').hidden = true;
    drawImageReference(); setReadingBusy(false);
    if (shouldRead) void startReading();
  };
  preview.onerror = () => { if (selectedRevision !== imageRevision) return; removeImage(); $('#screenshot-status').textContent = 'Image could not be opened. Try another image or use item entry; existing entries have been kept.'; };
  preview.src = imageUrl;
});
window.addEventListener('pagehide', event => { if (event.persisted) cancelReading(); else removeImage(); });
window.addEventListener('pageshow', event => { if (event.persisted) setReadingBusy(false); });

const panels = {
  methodology: ['Methodology', [
    'This preview reads screenshots locally into unconfirmed drafts and can explain a conditional independent Final Damage source effect after your review. Recognition is experimental and can be wrong. It does not recommend equipment yet. Matching labels and units permits raw numerical subtraction only; repeated lines are never summed.',
    'A damage model needs supported replacement and stacking rules, baseline character information and separate battle profiles. Combat Power is not DPS. Unsupported effects and missing values will not be scored with invented weights.',
    'Selected screenshots and item entries stay in this page session. Only the appearance preference is saved locally. The header loads a fixed leaf image from MapleStory.io; screenshots are not sent there. Hosting providers receive normal page requests.',
    'BasilMarket and Hidden Street are visual inspiration for the light and dark skins. This project is not affiliated with either site.',
    `App build: ${RELEASE_ID}. Include this when reporting an issue.`
  ]],
  'report-bug': ['Report a Bug', ['Bug delivery is not configured yet. This page cannot send a report. Please do not enter private information here.']],
  'contact-us': ['Contact Us', ['Contact delivery is not configured yet. There is no working contact form or sending service in this release.']]
};
for (const link of document.querySelectorAll('[data-panel]')) link.addEventListener('click', event => {
  event.preventDefault(); const [title, paragraphs] = panels[link.dataset.panel];
  $('#information-title').textContent = title; $('#information-body').replaceChildren(...paragraphs.map(p => element('p', p)));
  $('#information').showModal();
});
// A destination alone will not silently enable payments or impersonate an embed.
if (SUPPORT_DESTINATION !== null) $('.coffee').title = 'Support destination awaits provider integration and review.';
