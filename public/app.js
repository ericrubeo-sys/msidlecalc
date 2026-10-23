import { parseItemLines, compareItemLines } from './domain/item-lines.js';
import { SUPPORT_DESTINATION } from './config.js';
import { compareSupportedFactors } from './domain/damage-model.js';
import { replaceFinalDamageSources } from './domain/reaggregation.js';
import { getClaim } from './domain/mechanics-data.js';
import { readComparison } from './ocr-reader.js';
import { importScreenshotProposals, editScreenshotRecord, confirmScreenshotRecord, recordsForImage } from './domain/screenshot-review.js';

const $ = (selector) => document.querySelector(selector);
let nextId = 0;
let revision = 0;
let imageUrl = null;
let imageRevision = 0;
const records = { current: [], candidate: [] };
let sourceCanvas = null, stagedReading = null, previousEntries = null;
let readingController = null, readingRun = 0, readingBusy = false;
let markedRegions = [null, null], markingRegion = null, markingOriginal = null, dragStart = null;
const units = [['unknown', 'Unknown'], ['statPoint', 'Points'], ['displayPercent', '%'], ['level', 'Levels'], ['factor', 'Multiplier'], ['internalRate', 'Internal rate']];
const issueMessages = { invalidDecimal: 'Use a decimal number, without commas or suffixes. Leave unreadable values blank.', unitMismatch: 'Choose % for a percentage value.', unsupportedMagnitude: 'Value exceeds the supported numerical range.', unsupportedPrecision: 'Use at most 18 decimal places.', integerRequired: 'Skill levels must be whole numbers.' };

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function markStale() {
  revision++;
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
  remove.type = 'button'; remove.setAttribute('aria-label', `Remove ${side === 'current' ? 'currently equipped' : 'candidate'} line`);
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
    if (record.comparisonText !== null) evidence.append(element('p', `Separate comparison text: ${record.comparisonText ?? 'Unknown'}. It has not been added to the item value.`));
    row.append(status, label, evidence);
  }
  row.append(remove, error); $(`#${side}-lines`).append(row); markStale(); updateReviewCount();
  return row;
}
for (const side of ['current', 'candidate']) {
  const card = element('section', undefined, 'item-card');
  card.append(element('h2', side === 'current' ? 'Currently equipped' : 'Candidate'));
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
      if (line.state === 'invalid' || (!line.effectiveLabel.trim() && line.rawValue.trim())) {
        error.textContent = line.state === 'invalid' ? (issueMessages[line.issues[0]] || 'Correct this value or leave it blank if unknown.') : 'Add a stat label so this value can be identified.';
        error.hidden = false; input.setAttribute('aria-invalid', 'true'); firstInvalid ??= input;
      }
    }
  }
  if (firstInvalid) { $('#form-error').textContent = 'Correct the highlighted entries. Your other entries are kept.'; $('#form-error').hidden = false; firstInvalid.focus(); return; }
  const nonempty = (lines) => lines.some((line) => line.effectiveLabel.trim());
  if (!nonempty(items.current) || !nonempty(items.candidate)) { $('#form-error').textContent = 'Enter at least one stat label for each item. Values may remain unknown.'; $('#form-error').hidden = false; return; }
  // Blank unused rows remain in the editor but need no result row.
  const result = compareItemLines(items.current.filter(l => l.effectiveLabel.trim()), items.candidate.filter(l => l.effectiveLabel.trim()));
  const body = $('#result-rows'); body.replaceChildren();
  for (const row of result.rows) {
    const entry = element('article', undefined, 'result-row');
    const label = row.current?.effectiveLabel ?? row.candidate?.effectiveLabel;
    entry.append(element('strong', label));
    const show = (line) => !line ? 'No matched line' : line.effectiveValue ? `${line.effectiveValue.decimal}${line.unit === 'displayPercent' ? '%' : ` (${units.find(u => u[0] === line.unit)?.[1] || line.unit})`}` : 'Unknown';
    entry.append(element('p', `Currently equipped: ${show(row.current)} · Candidate: ${show(row.candidate)}`));
    entry.append(element('p', row.differenceDecimal === null ? 'Change: unknown' : `Raw change: ${row.difference > 0 ? '+' : ''}${row.differenceDecimal}${row.unit === 'displayPercent' ? ' percentage points' : ''}`));
    if (row.unit === 'unknown') entry.append(element('p', 'Unit and effect meaning are unconfirmed. This is only a raw numerical difference.'));
    body.append(entry);
  }
  $('#results').dataset.inputRevision = String(revision);
  $('#stale-result').hidden = true; $('#results').hidden = false; $('#results').focus();
});

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
  const a = $('#current-panel').value, b = $('#candidate-panel').value;
  $('#apply-drafts').disabled = readingBusy || !stagedReading || stagedReading.imageRevision !== imageRevision || !a || !b || a === b || !$('#panel-assignment-confirmed').checked;
  const populated = Object.values(records).some(lines => lines.some(record => String(record.correction?.rawLabel ?? record.rawLabel).trim() || String(record.correction?.rawValue ?? record.rawValue).trim()));
  $('#apply-drafts').textContent = populated ? 'Replace entered lines with these drafts' : 'Use these item drafts';
}
function setReadingBusy(busy) {
  readingBusy = busy;
  $('#read-image').disabled = busy || !sourceCanvas;
  $('#cancel-reading').hidden = !busy;
  $('#read-regions').disabled = busy || !sourceCanvas || markingRegion !== null || markedRegions.some(region => !region);
  for (const id of ['mark-first', 'mark-second', 'clear-regions']) $(`#${id}`).disabled = busy || !sourceCanvas;
  refreshAssignment();
}
function cancelReading(announce = false) {
  readingRun++; readingController?.abort(); readingController = null; setReadingBusy(false);
  if (announce) $('#screenshot-status').textContent = 'Reading canceled. Your entered lines and corrections have been kept.';
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
function showReading(reading) {
  stagedReading = reading;
  const panels = reading.proposedPanels;
  markedRegions = [panels[0]?.region ?? null, panels[1]?.region ?? null];
  drawImageReference();
  $('#panel-previews').replaceChildren();
  $('#whole-reading').textContent = reading.raw.text;
  $('#draft-description').textContent = panels.length < 2 ? `${panels.length ? 'Only one item area was found.' : 'Both item areas could not be identified.'} Mark the two areas visually or continue with item details below. No second item has been invented.` : 'These areas and readings are proposals. Check their bounds against the full screenshot, choose which item is equipped, then review each imported line. Extra interface text may need removing.';
  for (const selector of ['#current-panel', '#candidate-panel']) {
    const select = $(selector); select.replaceChildren(); const option = element('option', 'Choose a panel'); option.value = ''; select.append(option);
  }
  panels.forEach((panel, index) => {
    const card = element('article', undefined, 'item-card panel-preview');
    card.append(element('h3', `Panel ${index + 1}`));
    const crop = document.createElement('canvas'); crop.width = panel.region.width; crop.height = panel.region.height;
    crop.getContext('2d').drawImage(sourceCanvas, panel.region.x, panel.region.y, panel.region.width, panel.region.height, 0, 0, crop.width, crop.height);
    const image = element('img'); image.alt = `Proposed area for panel ${index + 1}; item role not confirmed`; image.src = crop.toDataURL('image/png'); card.append(image);
    crop.width = 0; crop.height = 0;
    const details = element('details'); details.append(element('summary', 'Draft reading'), element('pre', panel.rawText)); card.append(details);
    $('#panel-previews').append(card);
    for (const selector of ['#current-panel', '#candidate-panel']) { const option = element('option', `Panel ${index + 1}`); option.value = panel.id; $(selector).append(option); }
  });
  $('#panel-assignment-confirmed').checked = false;
  $('#screenshot-drafts').hidden = false;
  refreshAssignment();
}
async function startReading(regions = null) {
  if (!sourceCanvas) return;
  cancelReading();
  const runId = ++readingRun, selectedRevision = imageRevision, original = sourceCanvas;
  const controller = new AbortController(); readingController = controller;
  setReadingBusy(true);
  $('#screenshot-status').textContent = 'Reading screenshot on this device… Your entered lines will stay in place.';
  try {
    const reading = await readComparison(original, { inputRevision: selectedRevision, signal: controller.signal, regions,
      isCurrent: () => runId === readingRun && selectedRevision === imageRevision,
      onProgress: ({ stage }) => {
        if (runId !== readingRun || selectedRevision !== imageRevision) return;
        $('#screenshot-status').textContent = ({ loading: 'Loading local screenshot reader…', findingPanels: 'Looking for item panels on this device…', readingPanel: 'Reading proposed item areas on this device…' })[stage] ?? 'Reading screenshot on this device…';
      } });
    if (runId !== readingRun || selectedRevision !== imageRevision) return;
    showReading({ ...reading, imageRevision: selectedRevision, runId });
    $('#screenshot-status').textContent = reading.proposedPanels.length >= 2 ? 'Draft reading ready below. Check the item areas and review every line; existing entries have not been replaced.' : 'Reading finished, but both item areas were not identified. Mark their areas or use the item editor.';
  } catch (error) {
    if (runId === readingRun && selectedRevision === imageRevision && error?.name !== 'AbortError') $('#screenshot-status').textContent = 'Local screenshot reading could not finish. Your image and entries are kept. Try again, mark the item areas, or use the item editor.';
  } finally {
    if (runId === readingRun) { readingController = null; setReadingBusy(false); }
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
  const items = importScreenshotProposals({ proposedPanels: stagedReading.proposedPanels, assignment: { current: $('#current-panel').value, candidate: $('#candidate-panel').value }, assignmentConfirmed: $('#panel-assignment-confirmed').checked, imageRevision, runId: stagedReading.runId });
  previousEntries = { items: structuredClone(records), names: { current: $('#current-name').value, candidate: $('#candidate-name').value } };
  replaceEditor(items); $('#restore-entries').hidden = false;
  $('#screenshot-status').textContent = 'Draft lines applied. Check labels, values and units, then confirm each line. Numbers containing separators need correction before confirmation.';
  $('#current-lines input')?.focus();
});
$('#restore-entries').addEventListener('click', () => {
  if (!previousEntries) return;
  replaceEditor(previousEntries.items, previousEntries.names); previousEntries = null; $('#restore-entries').hidden = true;
  $('#screenshot-status').textContent = 'Previous entries restored. Screenshot-derived lines still require review for the current image.';
});
for (const id of ['current-panel', 'candidate-panel']) $(`#${id}`).addEventListener('change', () => { $('#panel-assignment-confirmed').checked = false; refreshAssignment(); });
$('#panel-assignment-confirmed').addEventListener('change', refreshAssignment);
$('#read-image').addEventListener('click', () => startReading());
$('#cancel-reading').addEventListener('click', () => cancelReading(true));
$('#read-regions').addEventListener('click', () => startReading(markedRegions.map((region, index) => ({ id: `reviewed-${index + 1}`, region: structuredClone(region) }))));
function finishMarking(cancel = false) {
  if (cancel === true && markingRegion !== null) markedRegions[markingRegion] = markingOriginal;
  markingRegion = null; markingOriginal = null; dragStart = null; $('#screenshot-canvas').style.touchAction = 'auto'; drawImageReference(); setReadingBusy(readingBusy);
}
for (const [id, index] of [['mark-first', 0], ['mark-second', 1]]) $(`#${id}`).addEventListener('click', () => {
  if (!sourceCanvas || readingBusy) return;
  if (markingRegion !== null) finishMarking(true);
  markingRegion = index; markingOriginal = structuredClone(markedRegions[index]);
  if (!markedRegions[index]) markedRegions[index] = { x: Math.floor(sourceCanvas.width * (index ? .55 : .2)), y: Math.floor(sourceCanvas.height * .25), width: Math.floor(sourceCanvas.width * .2), height: Math.floor(sourceCanvas.height * .5) };
  $('#screenshot-canvas').style.touchAction = 'none'; $('#screenshot-canvas').focus(); drawImageReference(); setReadingBusy(false);
  $('#screenshot-status').textContent = `Marking area ${index + 1}. Drag its rectangle, or use arrows to move and Shift + arrows to resize. Enter finishes.`;
});
$('#clear-regions').addEventListener('click', () => { markedRegions = [null, null]; finishMarking(); $('#screenshot-status').textContent = 'Area markings cleared. Your entered lines are unchanged.'; });
const referenceCanvas = $('#screenshot-canvas');
function imagePoint(event) {
  const bounds = referenceCanvas.getBoundingClientRect();
  return { x: Math.max(0, Math.min(sourceCanvas.width, (event.clientX - bounds.left) * sourceCanvas.width / bounds.width)), y: Math.max(0, Math.min(sourceCanvas.height, (event.clientY - bounds.top) * sourceCanvas.height / bounds.height)) };
}
function draggedRegion(point) {
  return { x: Math.floor(Math.min(dragStart.x, point.x)), y: Math.floor(Math.min(dragStart.y, point.y)), width: Math.ceil(Math.abs(point.x - dragStart.x)), height: Math.ceil(Math.abs(point.y - dragStart.y)) };
}
referenceCanvas.addEventListener('pointerdown', event => {
  if (markingRegion === null || !sourceCanvas || readingBusy) return;
  event.preventDefault(); dragStart = imagePoint(event); referenceCanvas.setPointerCapture(event.pointerId);
});
referenceCanvas.addEventListener('pointermove', event => {
  if (dragStart && markingRegion !== null) drawImageReference({ index: markingRegion, region: draggedRegion(imagePoint(event)) });
});
referenceCanvas.addEventListener('pointerup', event => {
  if (!dragStart || markingRegion === null) return;
  const region = draggedRegion(imagePoint(event));
  region.width = Math.min(region.width, sourceCanvas.width - region.x); region.height = Math.min(region.height, sourceCanvas.height - region.y);
  if (region.width >= 8 && region.height >= 8) { markedRegions[markingRegion] = region; $('#screenshot-status').textContent = 'Area marked. Check both areas, then choose Read marked areas.'; }
  else $('#screenshot-status').textContent = 'That area is too small. Mark the full item stat area.';
  if (referenceCanvas.hasPointerCapture(event.pointerId)) referenceCanvas.releasePointerCapture(event.pointerId);
  finishMarking(region.width < 8 || region.height < 8);
});
referenceCanvas.addEventListener('pointercancel', () => finishMarking(true));
referenceCanvas.addEventListener('keydown', event => {
  if (markingRegion === null || !sourceCanvas) return;
  if (event.key === 'Enter' || event.key === 'Escape') { event.preventDefault(); finishMarking(event.key === 'Escape'); return; }
  if (!event.key.startsWith('Arrow')) return;
  event.preventDefault(); const region = markedRegions[markingRegion];
  const step = event.altKey ? 1 : Math.max(1, Math.round(sourceCanvas.width / 100));
  const dx = event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0;
  const dy = event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0;
  if (event.shiftKey) { region.width = Math.max(8, Math.min(sourceCanvas.width - region.x, region.width + dx)); region.height = Math.max(8, Math.min(sourceCanvas.height - region.y, region.height + dy)); }
  else { region.x = Math.max(0, Math.min(sourceCanvas.width - region.width, region.x + dx)); region.y = Math.max(0, Math.min(sourceCanvas.height - region.height, region.y + dy)); }
  drawImageReference();
});
function removeImage() {
  imageRevision++; cancelReading(); markingRegion = null; markingOriginal = null; dragStart = null; markedRegions = [null, null]; stagedReading = null; referenceCanvas.style.touchAction = 'auto';
  if (imageUrl) URL.revokeObjectURL(imageUrl); imageUrl = null;
  if (sourceCanvas) { sourceCanvas.width = 0; sourceCanvas.height = 0; sourceCanvas = null; }
  const preview = $('#screenshot-preview'); preview.onload = null; preview.onerror = null; preview.removeAttribute('src');
  $('#panel-previews').replaceChildren(); $('#whole-reading').textContent = ''; $('#screenshot-drafts').hidden = true;
  $('#image-reference').hidden = true; $('#screenshot').value = ''; $('#screenshot-status').textContent = '';
  $('.guide-frame').hidden = false; $('.legend').hidden = false; $('#show-example').hidden = true;
  drawImageReference(); refreshReviewState(); markStale(); setReadingBusy(false);
}
$('#remove-image').addEventListener('click', () => { removeImage(); $('#screenshot-status').textContent = 'Screenshot removed. Entries and corrections are kept; screenshot lines need renewed review.'; });
$('#show-example').addEventListener('click', () => { const hidden = !$('.guide-frame').hidden; $('.guide-frame').hidden = hidden; $('.legend').hidden = hidden; $('#show-example').textContent = hidden ? 'Show example comparison' : 'Hide example comparison'; });
$('#screenshot').addEventListener('change', () => {
  const file = $('#screenshot').files[0]; if (!file) return;
  removeImage();
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { $('#screenshot-status').textContent = 'Choose a PNG, JPEG or WebP up to 10 MB. Your entries have been kept.'; return; }
  const selectedRevision = imageRevision; imageUrl = URL.createObjectURL(file);
  const preview = $('#screenshot-preview');
  preview.onload = () => {
    if (selectedRevision !== imageRevision) return;
    if (preview.naturalWidth * preview.naturalHeight > 7000000) { removeImage(); $('#screenshot-status').textContent = 'This image exceeds the current 7-million-pixel limit. Your entries are kept.'; return; }
    sourceCanvas = document.createElement('canvas'); sourceCanvas.width = preview.naturalWidth; sourceCanvas.height = preview.naturalHeight;
    sourceCanvas.getContext('2d').drawImage(preview, 0, 0);
    $('#image-reference').hidden = false; $('.guide-frame').hidden = true; $('.legend').hidden = true;
    $('#show-example').hidden = false; $('#show-example').textContent = 'Show example comparison';
    drawImageReference(); setReadingBusy(false); void startReading();
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
    'BasilMarket and Hidden Street are visual inspiration for the light and dark skins. This project is not affiliated with either site.'
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
