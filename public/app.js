import { STAT_FIELDS, fieldForRecord, validateStatValue, recommendationContexts } from './domain/stat-fields.js';
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
import { RECOMMENDATION_ASSUMPTIONS } from './domain/equipment-recommendation.js';
import { recommendMinimumInput, recommendAllActivities } from './domain/minimum-input.js';

const $ = (selector) => document.querySelector(selector);
let nextId = 0;
let revision = 0;
let imageUrl = null;
let imageRevision = 0;
const records = { current: [], candidate: [] };
const confirmedItems = {current:false,candidate:false};
let sourceCanvas = null, stagedReading = null, previousEntries = null;
let readingController = null, readingRun = 0, readingBusy = false;
let readOnDecode = false;
let editorImageRevision = null, editorEdited = false;
let markedRegions = [null, null], cropEditor = null;
let requiredQuestions=[];
const bucketTotals={};

function comparisonPayload(assumptions) {
  return {current:records.current,candidate:records.candidate,imageRevision,inputRevision:revision,
    confirmations:{...confirmedItems},assumptions,bucketTotals};
}
function enteredAssumptions() {
  return {...Object.fromEntries(Object.keys(RECOMMENDATION_ASSUMPTIONS).map(name=>[name,$(`#scope-${name}`).checked])),completeVisibleStats:confirmedItems.current && confirmedItems.candidate};
}
function refreshRecommendationInputs() {
  const complete=confirmedItems.current && confirmedItems.candidate;
  $('#essential-inputs').hidden=!complete;
  if(!complete) { requiredQuestions=[]; $('#recommend').disabled=true; return; }
  const supplied=Object.fromEntries(Object.keys(RECOMMENDATION_ASSUMPTIONS).map(name=>[name,true]));
  const payload=comparisonPayload(supplied);
  const probes=recommendAllActivities(payload).slice(0,2).flatMap(result=>result.branches);
  const canEvaluate=probes.some(result=>result.status!=='unavailable' && !result.unsupportedMechanics.length);
  const hasAttack=Object.values(records).some(lines=>lines.some(record=>fieldForRecord(record)?.label==='Attack'));
  requiredQuestions=canEvaluate?['onEquipSameSlot','onlyListedEffects','ordinaryLandedHits',...(hasAttack?['attackMainOptions']:[]),...(probes.some(result=>result.needsNonnegativeBackground)?['nonnegativeBackground']:[]),...(probes.some(result=>result.needsSubOptionsSameStage)?['subOptionsSameStage']:[])]:[];
  $('#scope-questions').hidden=!canEvaluate;
  $('#attack-source-question').hidden=!requiredQuestions.includes('attackMainOptions');
  $('#background-question').hidden=!requiredQuestions.includes('nonnegativeBackground');
  $('#sub-options-question').hidden=!requiredQuestions.includes('subOptionsSameStage');
  $('#eligibility-note').textContent=canEvaluate?'No character numbers are required for this comparison. Basic and skill hits are checked automatically.':`No reliable preference yet: ${probes[0].unsupportedMechanics[0]?.detail ?? probes[0].missingInputs[0]?.detail ?? 'These item effects need a verified model.'}`;
  const fields=new Map();
  for(const contextId of ['ordinary-normal','ordinary-boss']) for(const attackType of ['basic','skill']) {
    const scenario=recommendMinimumInput({...payload,bucketTotals:{},contextId,attackType,sourceContract:'effective-bonus-sources'});
    if(scenario.unsupportedMechanics.some(entry=>!['overlappingPreferenceBounds'].includes(entry.code))) continue;
    for(const field of scenario.precisionOpportunities??[]) fields.set(field.id,field);
  }
  renderPrecisionFields([...fields.values()]);
  const missing=requiredQuestions.filter(name=>!$(`#scope-${name}`).checked);
  $('#recommend').disabled=missing.length>0;
  $('#comparison-form>.result-limit').textContent=missing.length?'Review the comparison conditions to continue.':canEvaluate?'Ready for a conditional ordinary-hit recommendation.':'See supported scope and remaining blockers.';
}

function renderPrecisionFields(fields) {
  const container=$('#precision-fields');
  const signature=fields.map(field=>field.id).join('|');
  $('#precision-inputs').hidden=!fields.length;
  if(container.dataset.fields===signature) return;
  container.dataset.fields=signature;container.replaceChildren();
  for(const field of fields) {
    const group=element('fieldset');group.append(element('legend',`Current ${field.label} (%)`));
    for(const [bound,title] of [['lower','Minimum'],['upper','Maximum']]) {
      const label=element('label',`${title} (%)`),input=element('input');
      input.type='text';input.inputMode='decimal';input.value=bucketTotals[field.id]?.[bound]??'';
      input.setAttribute('aria-label',`Current ${field.label}, ${title.toLowerCase()}, percent`);
      input.addEventListener('input',()=>{
        bucketTotals[field.id]??={lower:'',upper:''};bucketTotals[field.id][bound]=input.value;
        revision++;$('#results').hidden=true;
      });
      label.append(input);group.append(label);
    }
    container.append(group);
  }
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function refreshItemConfirmation(side) {
  const body=$(`#${side}-body`), button=$(`#${side}-confirm`);
  if (!body || !button) return;
  body.hidden=confirmedItems[side];
  button.textContent=confirmedItems[side] ? 'Edit item' : side==='current'?'Confirm current equip':'Confirm new equip';
  button.setAttribute('aria-expanded',String(!confirmedItems[side]));
  button.setAttribute('aria-label',`${confirmedItems[side]?'Edit':'Confirm'} ${side==='current'?'current equip':'new equip'}`);
  $(`#${side}-confirmed`).hidden=!confirmedItems[side];
  $('#visible-lines-complete').checked=confirmedItems.current && confirmedItems.candidate;
  $('#recommend').disabled=!$('#visible-lines-complete').checked;
  $('#comparison-form>.result-limit').textContent=$('#visible-lines-complete').checked?'Items confirmed. Unsupported contexts will be marked unavailable.':'Confirm both items to continue.';
  $('#draft-description').hidden=$('#visible-lines-complete').checked;
  refreshRecommendationInputs();
}
function markStale({side=null}={}) {
  revision++;
  $('#scope-attackMainOptions').checked=false; $('#scope-completeVisibleStats').checked=false;
  for (const key of side?[side]:['current','candidate']) { confirmedItems[key]=false; refreshItemConfirmation(key); }
  $('#visible-lines-complete').checked=confirmedItems.current && confirmedItems.candidate;
  refreshRecommendationInputs();
  $('#results').hidden=true;
  $('#advanced').hidden=true;
  if (!$('#model-results').hidden) $('#model-stale').hidden=false;
}
function validateItem(side) {
  let first=null;
  const visible=records[side].filter(record=>!record.otherReading);
  if (!visible.length) { addLine(side); }
  for (const record of records[side]) {
    if(record.otherReading && !fieldForRecord(record)) continue;
    if(record.otherReading) {
      record.otherReading=false;
      const input=$(`#${record.id}-rawLabel`);
      $(`#${side}-lines`).append(input.closest('.line'));
      const error=$(`#${record.id}-error`); error.hidden=false; error.textContent='Review this recognized stat before confirming.';
      first??=input;
    }
    const field=fieldForRecord(record), value=record.correction?.rawValue ?? record.rawValue;
    const validation=validateStatValue(field,value);
    const error=$(`#${record.id}-error`), input=$(`#${record.id}-${field?'rawValue':'rawLabel'}`);
    if(first?.id!==`${record.id}-rawLabel`) error.hidden=validation.valid;
    if(!validation.valid) { error.textContent=validation.message; input.setAttribute('aria-invalid','true'); input.classList.add('needs-value'); first??=input; }
  }
  if(first) { first.focus(); return false; }
  return true;
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
    const input = element(field === 'rawLabel' ? 'select' : 'input'); input.id = `${record.id}-${field}`; label.htmlFor = input.id;
    if (field === 'rawLabel') {
      const blank=element('option',(record.correction?.rawLabel ?? record.rawLabel) ? `Choose stat: ${record.correction?.rawLabel ?? record.rawLabel}` : 'Choose stat'); blank.value=''; input.append(blank);
      for(const definition of STAT_FIELDS) { const option=element('option',definition.title); option.value=definition.id; input.append(option); }
    } else input.type = 'text';
    input.autocomplete = 'off'; input.maxLength = field === 'rawLabel' ? 200 : 100;
    input.setAttribute('aria-label', `${sideName}, line ${ordinal}, ${labelText.toLowerCase()}`);
    input.setAttribute('aria-describedby', error.id);
    if (field === 'rawValue') { input.inputMode = fieldForRecord(record)?.kind==='integer'?'numeric':'decimal'; input.placeholder = 'Required'; }
    input.dataset.field = field; input.value = field === 'rawLabel' ? fieldForRecord(record)?.id ?? '' : record.correction?.[field] ?? record[field] ?? '';
    if(field==='rawValue') input.placeholder=fieldForRecord(record)?.kind==='percent'?'0.0%':'Required';
    const highlight = () => {
      const missing = !input.value.trim(); input.classList.toggle('needs-value', missing);
      if (missing) input.setAttribute('aria-invalid','true'); else input.removeAttribute('aria-invalid');
    };
    highlight();
    const change = () => {
      const selected=field==='rawLabel'?STAT_FIELDS.find(entry=>entry.id===input.value):fieldForRecord(record);
      const value=field==='rawLabel'?selected?.label ?? '':input.value;
      if (record.provenance?.kind==='ocr') Object.assign(record,editScreenshotRecord(record,field,value)); else record[field]=value;
      const unit=selected?.unit ?? 'unknown';
      if(record.provenance?.kind==='ocr') Object.assign(record,editScreenshotRecord(record,'unit',unit)); else record.unit=unit;
      if(field==='rawLabel') { record.statFieldId=selected?.id ?? null; const number=row.querySelector('[data-field=rawValue]'); if(number) { number.placeholder=selected?.kind==='percent'?'0.0%':'Required'; number.inputMode=selected?.kind==='integer'?'numeric':'decimal'; } }
      if(field==='rawLabel' && selected && record.otherReading) { record.otherReading=false; $(`#${side}-lines`).append(row); }
      editorEdited=true; highlight(); error.hidden=true; markStale({side});
    };
    input.addEventListener(field==='rawLabel'?'change':'input',change);
    if(field==='rawValue') input.addEventListener('blur',()=>{
      const validation=validateStatValue(fieldForRecord(record),input.value);
      if(validation.valid && validation.value!==input.value) { input.value=validation.value; change(); }
      else if(!validation.valid && input.value.trim()) { error.textContent=validation.message; error.hidden=false; input.setAttribute('aria-invalid','true'); }
    });
    label.append(input); row.append(label);
  }
  const remove = element('button', '×', 'remove'); remove.type = 'button';
  remove.setAttribute('aria-label', `Remove ${sideName.toLowerCase()} line ${ordinal}`);
  remove.addEventListener('click', () => {
    records[side].splice(records[side].indexOf(record), 1); row.remove(); editorEdited = true; markStale({side}); $(`#${side}-add`).focus();
  });
  row.append(remove,error); (target ?? $(`#${side}-lines`)).append(row); markStale({side}); return row;
}
for (const side of ['current', 'candidate']) {
  const card = element('section', undefined, 'item-card'); card.id=`${side}-card`;
  const body=element('div'); body.id=`${side}-body`;
  card.append(element('h2', side === 'current' ? 'Currently equipped · left' : 'Potential new equip · right'));
  const crop = element('img', undefined, 'review-crop'); crop.id = `${side}-crop`; crop.hidden = true; body.append(crop);
  const name = element('label', 'Item name (optional)'); name.htmlFor = `${side}-name`;
  const input = element('input', undefined, 'item-name'); input.id = `${side}-name`; input.maxLength = 100; input.autocomplete = 'off'; input.addEventListener('input', markStale);
  const lines = element('div'); lines.id = `${side}-lines`;
  const add = element('button', 'Add line'); add.type = 'button'; add.id = `${side}-add`;
  add.addEventListener('click', () => { editorEdited = true; addLine(side).querySelector('select').focus(); });
  name.hidden = true; input.hidden = true; body.append(name, input, lines, add);
  const status=element('p','Confirmed','item-confirmed'); status.id=`${side}-confirmed`; status.hidden=true;
  const confirm=element('button',side==='current'?'Confirm current equip':'Confirm new equip','confirm-item'); confirm.type='button'; confirm.id=`${side}-confirm`; confirm.setAttribute('aria-controls',body.id); confirm.setAttribute('aria-expanded','true');
  confirm.addEventListener('click',()=>{
    if(confirmedItems[side]) markStale({side});
    else if(validateItem(side)) { confirmedItems[side]=true; refreshItemConfirmation(side); const next=['current','candidate'].find(key=>!confirmedItems[key]); if(next) { const heading=$(`#${next}-card h2`); heading.tabIndex=-1; heading.focus(); } else { $('#essential-title').tabIndex=-1; $('#essential-title').focus(); } }
  });
  card.append(body,status,confirm); $('#item-fields').append(card); addLine(side);
}

$('.intake').append($('#results'));
for(const name of Object.keys(RECOMMENDATION_ASSUMPTIONS)) $(`#scope-${name}`).addEventListener('change',()=>{
  revision++; $('#results').hidden=true; refreshRecommendationInputs();
});
$('#comparison-form').addEventListener('submit', async event => {
  event.preventDefault();
  if(!confirmedItems.current || !confirmedItems.candidate) return;
  const firstMissing=requiredQuestions.find(name=>!$(`#scope-${name}`).checked);
  if(firstMissing) { $(`#scope-${firstMissing}`).focus(); return; }
  const inputRevision=revision;
  $('.intake').dataset.screen='calculating'; $('#calculation-screen').hidden=false;
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(inputRevision!==revision) { $('#calculation-screen').hidden=true; setReadingBusy(false); return; }
  const body=$('#result-rows'); body.replaceChildren();
  const payload=comparisonPayload(enteredAssumptions());
  const activities=recommendAllActivities(payload),results=activities.slice(0,2);
  for(const result of activities) {
    const row=element('article',undefined,'recommendation-row');
    const choice=result.recommendation==='current'?'Current equip (left)':result.recommendation==='candidate'?'New equip (right)':'No reliable preference';
    row.append(element('h3',result.label),element('strong',choice),element('span',`Confidence: ${result.confidence}`)); body.append(row);
  }
  const explanation=$('#recommendation-explanation'); explanation.replaceChildren();
  explanation.append(element('p',results[0].objective),element('p',results[0].uncertainty));
  if(Object.values(records).some(lines=>lines.some(record=>fieldForRecord(record)?.label==='Attack'))) explanation.append(element('p',results[0].inference));
  for(const result of results) {
    explanation.append(element('h3',result.contextId==='ordinary-normal'?'Normal monsters':'Boss monsters'));
    explanation.append(element('p',result.attackAgreement));
    for(const branch of result.branches) if(branch.proof) explanation.append(element('p',branch.proof),element('p',branch.sourceInference));
    for(const [title,issues] of [['Missing information',result.missingInputs],['Unresolved mechanics',result.unsupportedMechanics],['Common effects',result.cancelled],['Outside this objective',result.outsideScope]]) {
      if(!issues.length) continue;
      explanation.append(element('h4',title)); const list=element('ul'); for(const entry of issues) list.append(element('li',entry.detail)); explanation.append(list);
    }
  }
  if(Object.values(bucketTotals).some(bounds=>String(bounds.lower).trim() || String(bounds.upper).trim())) {
    explanation.append(element('h3','Advanced sensitivity scenario'),element('p','Hypothetical effective bonus-source values and your current-total ranges, assuming same-slot ordinary hits, complete sources, nonnegative contributions and no other changed effects. Source display mapping and rounding are not verified. These scenario choices do not change the recommendations above.'));
    for(const scenario of recommendAllActivities({...payload,assumptions:Object.fromEntries(Object.keys(RECOMMENDATION_ASSUMPTIONS).map(name=>[name,true])),sourceContract:'effective-bonus-sources'}).slice(0,2)) {
      const choice=scenario.recommendation==='current'?'Current equip':scenario.recommendation==='candidate'?'New equip':'No reliable preference';
      explanation.append(element('p',`${scenario.label}: ${choice} under the stated scenario only.`));
      for(const entry of scenario.missingInputs) explanation.append(element('p',entry.detail));
    }
  }
  explanation.append(element('h3','Conditions used'));
  for(const [name,value] of Object.entries(enteredAssumptions())) if(value) explanation.append(element('p',RECOMMENDATION_ASSUMPTIONS[name]));
  explanation.append(element('p',`Not implemented: ${recommendationContexts().map(entry=>entry.context).join('; ')}. The ordinary result is before their adjustments and exceptions.`));
  for(const reference of results.flatMap(result=>result.branches).find(result=>result.sourceReferences)?.sourceReferences??[]) {
    const link=element('a',reference.title);link.href=reference.url;link.target='_blank';link.rel='noopener noreferrer';explanation.append(link);
  }
  const source=element('a','Official mechanics guide'); source.href=results[0].source; source.target='_blank'; source.rel='noopener noreferrer'; explanation.append(source,element('p',`Model: ${results[0].versions.minimumInputs}. Data: ${results[0].versions.data}. Input revision: ${revision}. No controlled live-game validation.`));
  $('#recommendation-details').open=false;
  $('#calculation-screen').hidden=true; $('.intake').dataset.screen='results';
  $('#results').hidden=false; $('#stale-result').hidden=true; $('#results').focus();
});
$('#review-again').addEventListener('click',()=>{ $('.intake').dataset.screen=sourceCanvas?'review':'choose'; $('#results').hidden=true; $('#recommend').focus(); });

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
  $('#draft-description').textContent = adopted.preserved ? 'Your corrections are kept. Check the new read areas.' : detected ? 'Check the photo and correct any values below.' : 'Some details couldn’t be read. Fill the highlighted fields, or adjust the photo areas.';
  $('#screenshot-drafts').append($('#comparison-form'),$('#advanced'));
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
  for(const name of Object.keys(RECOMMENDATION_ASSUMPTIONS)) $(`#scope-${name}`).checked=false;
  imageRevision++; cancelReading(); cropEditor?.close(); markedRegions = [null, null]; stagedReading = null;
  if (imageUrl) URL.revokeObjectURL(imageUrl); imageUrl = null;
  if (sourceCanvas) { sourceCanvas.width = 0; sourceCanvas.height = 0; sourceCanvas = null; }
  const preview = $('#screenshot-preview'); preview.onload = null; preview.onerror = null; preview.removeAttribute('src');
  $('#whole-reading').textContent = ''; $('#screenshot-drafts').hidden = true;
  $('#manual').append($('#comparison-form'),$('#advanced')); $('#manual').hidden = false;
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
    'This feature preview can recommend an item for ordinary successful-hit damage when every admitted changed factor favors that item. It requires explicit same-slot, complete-item and ordinary-attack conditions. It does not use raw differences as damage weights. Mixed tradeoffs, unknown mechanics and named battle profiles abstain. Confidence is Low; no controlled live-game validation has been performed.',
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
