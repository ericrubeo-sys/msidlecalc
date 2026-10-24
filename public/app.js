import { parseItemLines, compareItemLines } from './domain/item-lines.js';
import { SUPPORT_DESTINATION } from './config.js';
import { compareSupportedFactors } from './domain/damage-model.js';
import { replaceFinalDamageSources } from './domain/reaggregation.js';
import { getClaim } from './domain/mechanics-data.js';
import { readComparison } from './ocr-reader.js';
import { openCropEditor } from './crop-editor.js';
import { assignComparisonLayout } from './domain/comparison-layout.js';
import { proposePanelRows } from './domain/ocr-item-rows.js';
import { groupReviewRows } from './domain/ocr-review-groups.js';
import { RELEASE_ID } from './release.js';
import { importScreenshotProposals, editScreenshotRecord, confirmScreenshotRecord, recordsForImage } from './domain/screenshot-review.js';

const $ = (selector) => document.querySelector(selector);
let nextId = 0;
let revision = 0;
let imageUrl = null;
let imageRevision = 0;
const records = { current: [], candidate: [] };
let sourceCanvas = null, stagedReading = null, previousEntries = null;
let readingController = null, readingRun = 0, readingBusy = false;
let readOnDecode = false;
let markedRegions = [null, null], cropEditor = null;
const units = [['unknown', 'Unknown'], ['statPoint', 'Points'], ['displayPercent', '%'], ['level', 'Levels'], ['factor', 'Multiplier'], ['internalRate', 'Internal rate']];
const issueMessages = { invalidDecimal: 'Use a decimal number, without commas or suffixes. Leave unreadable values blank.', unitMismatch: 'Choose % for a percentage value.', unsupportedMagnitude: 'Value exceeds the supported numerical range.', unsupportedPrecision: 'Use at most 18 decimal places.', integerRequired: 'Skill levels must be whole numbers.' };
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
  refreshAssignment();
}
function updateReviewCount() {
  const all = [...records.current, ...records.candidate].filter(record => record.provenance?.kind === 'ocr' && (record.rawText.trim() || String(record.correction?.rawLabel ?? record.rawLabel).trim() || String(record.correction?.rawValue ?? record.rawValue).trim()));
  const pending = all.filter(record => !record.confirmed || record.reviewedImageRevision !== imageRevision).length;
  $('#review-count').textContent = all.length ? `${pending} of ${all.length} screenshot lines need review. Unknown values stay unknown.` : '';
}
function lineReviewStatus(record) {
  if (record.provenance?.imageRevision !== imageRevision && record.reviewedImageRevision !== imageRevision) return 'From previous screenshot · needs review';
  return record.confirmed && record.reviewedImageRevision === imageRevision ? 'Checked by you' : 'Needs review';
}
function addLine(side, initial = null) {
  const record = initial ?? { id: `${side}-${nextId++}`, rawLabel: '', rawValue: '', unit: 'unknown', provenance: { kind: 'manual' }, confirmed: true };
  records[side].push(record);
  const row = element('div', undefined, 'line');
  row.dataset.lineId = record.id;
  const fromImage = record.provenance?.kind === 'ocr';
  let check = null, status = null;
  const changed = (field, value) => {
    if (fromImage) {
      Object.assign(record, editScreenshotRecord(record, field, value));
      if (check) check.checked = false;
      if (status) status.textContent = lineReviewStatus(record);
    } else record[field] = value;
    markStale(); updateReviewCount();
  };
  for (const [field, labelText, className] of [['rawLabel', 'Stat label', 'label-field'], ['rawValue', 'Value (blank = unknown)', ''], ['unit', 'Unit', '']]) {
    const label = element('label', labelText, className);
    const input = element(field === 'unit' ? 'select' : 'input');
    input.id = `${record.id}-${field}`;
    label.htmlFor = input.id;
    input.dataset.field = field;
    if (field === 'unit') for (const [value, text] of units) {
      const option = element('option', text); option.value = value; input.append(option);
    }
    else { input.type = 'text'; input.autocomplete = 'off'; input.maxLength = field === 'rawLabel' ? 200 : 100; if (field === 'rawValue') input.inputMode = 'decimal'; }
    input.value = record.correction?.[field] ?? record[field];
    input.addEventListener('input', () => changed(field, input.value));
    input.addEventListener('change', () => {
      if ((record.correction?.[field] ?? record[field]) !== input.value) changed(field, input.value);
    });
    label.append(input); row.append(label);
  }
  const remove = element('button', 'Remove line', 'remove');
  remove.type = 'button'; remove.setAttribute('aria-label', `Remove ${side === 'current' ? 'currently equipped' : 'potential new equip'} line`);
  remove.addEventListener('click', () => {
    records[side].splice(records[side].indexOf(record), 1); row.remove(); markStale(); updateReviewCount();
    $(`#${side}-add`).focus();
  });
  const error = element('p', '', 'field-error'); error.id = `${record.id}-error`; error.hidden = true;
  row.querySelector('[data-field="rawValue"]').setAttribute('aria-describedby', error.id);
  if (fromImage) {
    status = element('p', lineReviewStatus(record), 'review-line-status');
    status.dataset.reviewStatus = record.id;
    const label = element('label', undefined, 'confirmation line-confirmation');
    check = element('input'); check.type = 'checkbox'; check.dataset.reviewLine = record.id;
    check.checked = record.confirmed && record.reviewedImageRevision === imageRevision;
    check.addEventListener('change', () => {
      const proposed = confirmScreenshotRecord(record, { confirmed: check.checked, imageRevision });
      const parsed = parseItemLines([proposed])[0];
      if (check.checked && (parsed.state === 'invalid' || (!parsed.effectiveLabel.trim() && String(proposed.correction?.rawValue ?? proposed.rawValue).trim()))) {
        check.checked = false; error.textContent = 'Correct the label, value or unit before checking this line. Leave an unreadable value blank.'; error.hidden = false; return;
      }
      Object.assign(record, proposed); error.hidden = true; status.textContent = lineReviewStatus(record); markStale(); updateReviewCount();
    });
    label.append(check, document.createTextNode('I checked this line against the screenshot'));
    const evidence = element('details', undefined, 'line-source'); evidence.append(element('summary', 'Read from image'), element('pre', record.rawText));
    if (record.comparisonText != null) evidence.append(element('p', `Game’s displayed change: ${record.comparisonText}. Not an item value.`));
    row.append(status, label, evidence);
  }
  row.append(remove, error); $(`#${side}-lines`).append(row); markStale(); updateReviewCount();
  return row;
}
for (const side of ['current', 'candidate']) {
  const card = element('section', undefined, 'item-card');
  card.append(element('h2', side === 'current' ? 'Currently equipped' : 'Potential new equip'));
  const name = element('label', 'Item name (optional)'); name.htmlFor = `${side}-name`;
  const input = element('input', undefined, 'item-name'); input.id = `${side}-name`; input.maxLength = 100; input.autocomplete = 'off'; input.addEventListener('input', markStale);
  const lines = element('div'); lines.id = `${side}-lines`;
  const add = element('button', 'Add line'); add.type = 'button'; add.id = `${side}-add`;
  add.addEventListener('click', () => { addLine(side).querySelector('input').focus(); });
  card.append(name, input, lines, add); $('#item-fields').append(card); addLine(side);
}

$('#comparison-form').addEventListener('submit', (event) => {
  event.preventDefault(); $('#form-error').hidden = true;
  const items = {};
  let firstInvalid = null;
  for (const side of ['current', 'candidate']) {
    items[side] = parseItemLines(recordsForImage(records[side], imageRevision));
    for (const line of items[side]) {
      const error = $(`#${line.id}-error`);
      const input = $(`#${line.id}-rawValue`);
      error.hidden = true; input.removeAttribute('aria-invalid');
      if (line.state === 'invalid' || (!line.effectiveLabel.trim() && String(effectiveRawValue(line)).trim())) {
        error.textContent = line.state === 'invalid' ? (issueMessages[line.issues[0]] || 'Correct this value or leave it blank if unknown.') : 'Add a stat label so this value can be identified.';
        error.hidden = false; input.setAttribute('aria-invalid', 'true'); firstInvalid ??= input;
      }
    }
  }
  if (firstInvalid) { $('#form-error').textContent = 'Correct the highlighted entries. Your other entries are kept.'; $('#form-error').hidden = false; firstInvalid.focus(); return; }
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
  const current = parseItemLines(recordsForImage(records.current, imageRevision));
  const candidate = parseItemLines(recordsForImage(records.candidate, imageRevision));
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

function refreshAssignment() {
  const layout = assignComparisonLayout(stagedReading?.proposedPanels);
  $('#apply-drafts').disabled = readingBusy || !stagedReading || stagedReading.imageRevision !== imageRevision || layout.status !== 'assigned';
  const populated = Object.values(records).some(lines => lines.some(record => String(record.correction?.rawLabel ?? record.rawLabel).trim() || String(record.correction?.rawValue ?? record.rawValue).trim()));
  $('#apply-drafts').textContent = populated ? 'Replace entered lines with these drafts' : 'Use these item drafts';
}
function setReadingBusy(busy) {
  readingBusy = busy;
  $('.intake').dataset.screen = busy ? 'reading' : sourceCanvas ? 'review' : 'choose';
  $('#reading-screen').hidden = !busy;
  $('#read-image').disabled = busy || !sourceCanvas;
  $('#adjust-areas').disabled = busy || !sourceCanvas;
  $('label.upload').textContent = sourceCanvas ? 'Choose another photo' : 'Choose screenshot';
  refreshAssignment();
}
function cancelReading(announce = false) {
  const wasReading = readingBusy;
  readOnDecode = false;
  readingRun++; readingController?.abort(); readingController = null; setReadingBusy(false);
  if (wasReading) restoreStagedAreas();
  if (announce) $('#screenshot-status').textContent = 'Reading canceled. Your edits are kept.';
}
function refreshReviewState() {
  for (const side of ['current', 'candidate']) for (const record of records[side]) {
    if (record.provenance?.kind !== 'ocr') continue;
    const status = document.querySelector(`[data-review-status="${record.id}"]`);
    const check = document.querySelector(`[data-review-line="${record.id}"]`);
    if (status) status.textContent = lineReviewStatus(record);
    if (check) check.checked = record.confirmed && record.reviewedImageRevision === imageRevision;
  }
  updateReviewCount();
}
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
  const layout = assignComparisonLayout(stagedReading.proposedPanels);
  markedRegions = layout.status === 'assigned' ? layout.panels.map(panel => panel.region) : [null,null];
  drawImageReference();
}
function showReading(reading) {
  stagedReading = reading;
  const panels = reading.proposedPanels;
  const layout = assignComparisonLayout(panels);
  markedRegions = layout.status === 'assigned' ? layout.panels.map(panel => panel.region) : [null,null];
  drawImageReference();
  $('#panel-previews').replaceChildren();
  $('#whole-reading').textContent = reading.raw.text;
  $('#draft-description').textContent = 'Left: currently equipped. Right: potential new equip. Check the item values next.';
  panels.forEach((panel, index) => {
    const card = element('article', undefined, 'item-card panel-preview');
    const role = layout.status === 'assigned' ? (panel.id === layout.assignment.current ? 'Currently equipped · left' : 'Potential new equip · right') : `Area ${index + 1}`;
    card.append(element('h3', role));
    const crop = document.createElement('canvas'); crop.width = panel.region.width; crop.height = panel.region.height;
    crop.getContext('2d').drawImage(sourceCanvas, panel.region.x, panel.region.y, panel.region.width, panel.region.height, 0, 0, crop.width, crop.height);
    const image = element('img'); image.alt = `${role}; proposed read area`; image.src = crop.toDataURL('image/png'); card.append(image);
    crop.width = 0; crop.height = 0;
    if (panel.coverageIssues?.length) {
      const labels = panel.coverageIssues.some(issue=>issue.code === 'possibleClippedLabels');
      card.append(element('p',labels ? 'Some stat names may be outside this area. Adjust it to include each name and number.' : 'Some values may be outside this area. Check the right edge before using these drafts.','coverage-warning'));
    }
    const summary = element('div',undefined,'base-value-preview');
    const groups = groupReviewRows(proposePanelRows(panel).rows);
    function previewRow(row) {
      const fields = row.proposedFields;
      const entry = element('p'); entry.append(element('span',fields.rawLabel || 'Unreadable line'),element('strong',fields.rawValue || 'Needs review')); return entry;
    }
    groups.stats.forEach(row=>summary.append(previewRow(row)));
    if (!groups.stats.length) summary.append(element('p','No stat values could be read. Check the other readings or enter item details.'));
    card.append(summary);
    if (groups.unresolved.length) {
      const other = element('details',undefined,'other-readings');
      other.open = groups.stats.length === 0;
      other.append(element('summary',`${groups.unresolved.length} other ${groups.unresolved.length === 1 ? 'reading' : 'readings'} to check`),element('p','May include unreadable stats or background text. All readings remain in Item details and corrections.','other-reading-help'));
      const list = element('div',undefined,'base-value-preview'); groups.unresolved.forEach(row=>list.append(previewRow(row))); other.append(list); card.append(other);
    }
    const details = element('details'); details.append(element('summary', 'Raw OCR text (includes game deltas)'), element('pre', panel.rawText)); card.append(details);
    $('#panel-previews').append(card);
  });
  $('#screenshot-drafts').hidden = layout.status !== 'assigned';
  refreshAssignment();
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
    $('#screenshot-status').textContent = assignComparisonLayout(reading.proposedPanels).status === 'assigned' ? '' : 'Couldn’t find both item areas. Adjust the read areas or enter details below.';
  } catch (error) {
    if (runId === readingRun && selectedRevision === imageRevision && error?.name !== 'AbortError') $('#screenshot-status').textContent = 'Couldn’t finish reading. Your edits are kept. Try adjusting the read areas.';
  } finally {
    if (runId === readingRun) { readingController = null; setReadingBusy(false); restoreStagedAreas(); }
  }
}
function replaceEditor(items, names) {
  for (const side of ['current', 'candidate']) {
    $(`#${side}-lines`).replaceChildren(); records[side] = [];
    for (const record of items[side]) addLine(side, structuredClone(record));
    $(`#${side}-name`).value = names?.[side] ?? '';
  }
  $('#manual').open = true; markStale(); updateReviewCount(); refreshAssignment();
}
$('#apply-drafts').addEventListener('click', () => {
  if ($('#apply-drafts').disabled || !stagedReading || stagedReading.imageRevision !== imageRevision) return;
  const layout = assignComparisonLayout(stagedReading.proposedPanels);
  if (layout.status !== 'assigned') return;
  const items = importScreenshotProposals({ proposedPanels: stagedReading.proposedPanels, assignment: layout.assignment, assignmentConfirmed: true, imageRevision, runId: stagedReading.runId });
  previousEntries = { items: structuredClone(records), names: { current: $('#current-name').value, candidate: $('#candidate-name').value }, complete:$('#visible-lines-complete').checked, imageRevision };
  replaceEditor(items); $('#restore-entries').hidden = false;
  $('#screenshot-status').textContent = 'Check each extracted line against your photo.';
  $('#current-lines input')?.focus();
});
$('#restore-entries').addEventListener('click', () => {
  if (!previousEntries) return;
  replaceEditor(previousEntries.items, previousEntries.names); $('#visible-lines-complete').checked = previousEntries.imageRevision === imageRevision && previousEntries.complete; previousEntries = null; $('#restore-entries').hidden = true;
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
  $('#panel-previews').replaceChildren(); $('#whole-reading').textContent = ''; $('#screenshot-drafts').hidden = true;
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
