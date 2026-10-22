import { STAT_DEFINITIONS, compareItems, parseStat } from './domain/comparison.js';

const $ = (selector) => document.querySelector(selector);
const form = $('#comparison-form');
const format = new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 });
let sample = false;
let imageUrl = null;

// Field markup comes only from this fixed registry, never user input.
$('#item-fields').innerHTML = ['current', 'candidate'].map((side, index) => `
  <section class="item-card" aria-labelledby="${side}-heading">
    <div class="item-heading"><span class="item-number" aria-hidden="true">${index ? 'B' : 'A'}</span><div><h3 id="${side}-heading">${index ? 'Candidate item' : 'Currently equipped'}</h3><p>${index ? 'The item you’re considering' : 'The item you’re wearing now'}</p></div></div>
    <div class="item-body"><label for="${side}-name">Item name <span class="quiet">Optional</span></label><input class="item-name" id="${side}-name" name="${side}-name" maxlength="100" placeholder="e.g. Eye accessory" autocomplete="off">
    <p class="stat-group-label">Equipment stat lines</p>
    ${STAT_DEFINITIONS.map((stat) => `<div class="stat-row"><label for="${side}-${stat.id}">${stat.label}${stat.unit ? ' (%)' : ''}</label><div class="number-input"><input id="${side}-${stat.id}" name="${side}-${stat.id}" type="number" inputmode="decimal" min="0" max="9007199254740991" step="${stat.step}" aria-describedby="${side}-${stat.id}-error">${stat.unit ? '<span aria-hidden="true">%</span>' : ''}</div><p class="field-error" id="${side}-${stat.id}-error" hidden></p></div>`).join('')}
    </div>
  </section>`).join('');

function clearErrors() {
  form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
  form.querySelectorAll('.field-error').forEach((message) => { message.hidden = true; });
  $('#form-error').hidden = true;
}

function readItem(side) {
  const stats = {};
  for (const stat of STAT_DEFINITIONS) {
    const input = $(`#${side}-${stat.id}`);
    try {
      if (input.validity.badInput) throw new Error('Enter a valid number.');
      stats[stat.id] = parseStat(input.value, stat);
    } catch (error) {
      input.setAttribute('aria-invalid', 'true');
      const message = $(`#${side}-${stat.id}-error`);
      message.textContent = error.message;
      message.hidden = false;
    }
  }
  return { name: $(`#${side}-name`).value.trim(), stats };
}

function displayValue(value, unit) {
  return value === null ? 'Unknown' : `${format.format(value)}${unit}`;
}

function renderResult(result, current, candidate) {
  const body = $('#result-rows');
  body.replaceChildren();
  for (const row of result.rows) {
    const tr = document.createElement('tr');
    const label = document.createElement('th');
    label.scope = 'row';
    label.textContent = row.label;
    tr.append(label);
    for (const value of [row.before, row.after]) {
      const cell = document.createElement('td');
      cell.textContent = displayValue(value, row.unit);
      tr.append(cell);
    }
    const delta = document.createElement('td');
    if (row.difference === null) delta.textContent = 'Unknown';
    else {
      const rounded = Number(row.difference.toFixed(4));
      delta.textContent = `${rounded > 0 ? '+' : ''}${format.format(rounded)}${row.unit ? ' pp' : ''}`;
      const meaning = document.createElement('small');
      meaning.textContent = row.difference === 0 ? 'No change' : rounded === 0 ? 'Below display precision' : row.difference > 0 ? 'Higher' : 'Lower';
      delta.append(meaning);
    }
    tr.append(delta);
    body.append(tr);
  }
  const activity = result.context.activity === 'boss' ? 'Boss' : 'Chapter Breakthrough';
  $('#result-context').textContent = `${activity} · ${result.comparableCount} of ${STAT_DEFINITIONS.length} stat lines comparable · Raw differences only`;
  $('#result-caption').textContent = `${current.name || 'Equipped item'} → ${candidate.name || 'Candidate item'}. Change means candidate minus equipped. “pp” means percentage points.`;
  $('#sample-result').hidden = !sample;
  $('#result-empty').hidden = true;
  $('#result-content').hidden = false;
  $('#stale-result').hidden = true;
  $('#results').setAttribute('aria-labelledby', 'result-heading-title');
  $('#result-content h2').id = 'result-heading-title';
  $('#results').focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();
  const current = readItem('current');
  const candidate = readItem('candidate');
  const invalid = form.querySelector('[aria-invalid]');
  if (invalid) {
    $('#form-error').textContent = 'Please correct the highlighted stat values. Your other entries have been kept.';
    $('#form-error').hidden = false;
    invalid.focus();
    return;
  }
  const result = compareItems(current, candidate, { activity: $('#activity').value });
  if (result.comparableCount === 0) {
    $('#form-error').textContent = 'Enter at least one matching stat for both items, such as Attack. Blank means unknown.';
    $('#form-error').hidden = false;
    $('#current-attack').focus();
    return;
  }
  renderResult(result, current, candidate);
});

function markStale() {
  if (!$('#result-content').hidden) $('#stale-result').hidden = false;
}
form.addEventListener('input', markStale);
form.addEventListener('change', markStale);
form.addEventListener('reset', () => {
  clearErrors();
  sample = false;
  $('#demo-note').hidden = true;
  $('#result-empty').hidden = false;
  $('#result-content').hidden = true;
  $('#results').setAttribute('aria-labelledby', 'results-title');
  removeImage();
});
$('#demo').addEventListener('click', () => {
  const values = [[120, 40, 4, 0, 10, 0], [135, 35, 0, 8, 10, 1]];
  ['current', 'candidate'].forEach((side, index) => {
    $(`#${side}-name`).value = `Practice item ${index ? 'B' : 'A'}`;
    STAT_DEFINITIONS.forEach((stat, position) => {
      $(`#${side}-${stat.id}`).value = values[index][position];
    });
  });
  clearErrors();
  sample = true;
  $('#demo-note').hidden = false;
  markStale();
  $('#current-name').focus();
});

function removeImage() {
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = null;
  $('#screenshot-preview').removeAttribute('src');
  $('#image-reference').hidden = true;
  $('#screenshot').value = '';
  $('#screenshot-status').textContent = '';
  $('#screenshot-status').classList.remove('image-error');
}
$('#remove-image').addEventListener('click', removeImage);
$('#screenshot').addEventListener('change', () => {
  const file = $('#screenshot').files[0];
  removeImage();
  if (!file) return;
  const status = $('#screenshot-status');
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    status.textContent = 'Choose a PNG, JPEG, or WebP image no larger than 10 MB.';
    status.classList.add('image-error');
    return;
  }
  imageUrl = URL.createObjectURL(file);
  const preview = $('#screenshot-preview');
  preview.onload = () => {
    $('#image-reference').hidden = false;
    status.textContent = `${file.name} · Reference only. Enter the stats manually below.`;
  };
  preview.onerror = () => {
    removeImage();
    status.textContent = 'This image could not be opened. Try another image or enter the stats manually.';
    status.classList.add('image-error');
  };
  preview.src = imageUrl;
});
window.addEventListener('pagehide', () => { if (imageUrl) URL.revokeObjectURL(imageUrl); });
