import { parseItemLines, compareItemLines } from './domain/item-lines.js';
import { SUPPORT_DESTINATION } from './config.js';
import { compareSupportedFactors } from './domain/damage-model.js';
import { replaceFinalDamageSources } from './domain/reaggregation.js';
import { getClaim } from './domain/mechanics-data.js';

const $ = (selector) => document.querySelector(selector);
let nextId = 0;
let revision = 0;
let imageUrl = null;
let imageRevision = 0;
const records = { current: [], candidate: [] };
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
}
function addLine(side) {
  const record = { id: `${side}-${nextId++}`, rawLabel: '', rawValue: '', unit: 'unknown', provenance: { kind: 'manual' }, confirmed: true };
  records[side].push(record);
  const row = element('div', undefined, 'line');
  row.dataset.lineId = record.id;
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
    input.addEventListener('input', () => { record[field] = input.value; markStale(); });
    input.addEventListener('change', () => { record[field] = input.value; });
    label.append(input); row.append(label);
  }
  const remove = element('button', 'Remove line', 'remove');
  remove.type = 'button'; remove.setAttribute('aria-label', `Remove ${side === 'current' ? 'currently equipped' : 'candidate'} line`);
  remove.addEventListener('click', () => {
    records[side].splice(records[side].indexOf(record), 1); row.remove(); markStale();
    $(`#${side}-add`).focus();
  });
  const error = element('p', '', 'field-error'); error.id = `${record.id}-error`; error.hidden = true;
  row.querySelector('[data-field="rawValue"]').setAttribute('aria-describedby', error.id);
  row.append(remove, error); $(`#${side}-lines`).append(row); markStale();
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
    items[side] = parseItemLines(records[side]);
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
  const current = parseItemLines(records.current);
  const candidate = parseItemLines(records.candidate);
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

function removeImage() {
  imageRevision++;
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = null;
  const preview = $('#screenshot-preview'); preview.onload = null; preview.onerror = null; preview.removeAttribute('src');
  $('#image-reference').hidden = true; $('#screenshot').value = ''; $('#screenshot-status').textContent = '';
}
$('#remove-image').addEventListener('click', removeImage);
$('#screenshot').addEventListener('change', () => {
  const file = $('#screenshot').files[0];
  if (!file) return;
  removeImage();
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    $('#screenshot-status').textContent = 'Choose a PNG, JPEG or WebP up to 10 MB. Manual entries have been kept.'; return;
  }
  const run = imageRevision;
  imageUrl = URL.createObjectURL(file);
  const preview = $('#screenshot-preview');
  preview.onload = () => {
    if (run !== imageRevision) return;
    $('#image-reference').hidden = false;
    $('#screenshot-status').textContent = 'Local reference selected. Automatic reading is not available yet. Enter or correct every line below; existing entries have been kept.';
    $('#manual').open = true;
  };
  preview.onerror = () => {
    if (run !== imageRevision) return;
    removeImage(); $('#screenshot-status').textContent = 'Image could not be opened. Try another image or use manual entry; existing entries have been kept.';
  };
  preview.src = imageUrl;
});
window.addEventListener('pagehide', (event) => { if (!event.persisted) removeImage(); });

const panels = {
  methodology: ['Methodology', [
    'This preview compares manually entered item lines and can explain a conditional independent Final Damage source effect. It does not read screenshots automatically or recommend equipment yet. Matching labels and units permits raw numerical subtraction only; repeated lines are never summed.',
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
