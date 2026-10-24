import { adjustCrop, cropsOverlap } from './domain/crop-geometry.js';
import { assignComparisonLayout } from './domain/comparison-layout.js';
import { createPressRepeat, seedAdjacentCrop } from './crop-controls.js';

export function openCropEditor({ image, regions, onApply, onClose = () => {} }) {
  const width = image.width, height = image.height;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 40 || height < 40) throw new TypeError('Photo is too small to adjust.');
  const provided = [];
  const initial = [0,1].map(i => {
    const crop = regions[i];
    const valid = crop && ['x','y','width','height'].every(key => Number.isInteger(crop[key])) && crop.x >= 0 && crop.y >= 0 && crop.width >= 8 && crop.height >= 8 && crop.x + crop.width <= width && crop.y + crop.height <= height;
    provided[i] = Boolean(valid);
    return valid ? structuredClone(crop) : { x: Math.floor(width * (i ? .52 : .24)), y: Math.floor(height * .4), width: Math.floor(width * .23), height: Math.floor(height * .4) };
  });
  let crops = structuredClone(initial), active = 0, view = null, finished = false, secondVisited = false;
  const repeaters = [], listeners = new AbortController();
  const stopRepeating = () => repeaters.forEach(repeater => repeater.stop());
  const previousFocus = document.activeElement;
  const dialog = document.createElement('dialog'); dialog.className = 'crop-editor'; dialog.setAttribute('aria-labelledby','crop-title');
  dialog.innerHTML = `<div class="crop-heading"><h2 id="crop-title">Adjust area 1 of 2</h2><button type="button" data-crop="cancel">Cancel</button></div>
    <div class="crop-scroll"><p class="crop-help">Include all stat labels and numbers. Tap an arrow, or hold to keep moving.</p>
    <p id="crop-seed" hidden>Starting box only — check both edges include the full stat lines.</p>
    <canvas class="crop-overview" width="800" height="160" aria-label="Full photo with active area outlined"></canvas>
    <canvas class="crop-detail" width="800" height="500" aria-label="Enlarged active area with its boundary outlined"></canvas></div>
    <div class="crop-options"><label>Adjust<select id="crop-target"><option value="move">Move box</option><option value="left">Left edge</option><option value="right">Right edge</option><option value="top">Top edge</option><option value="bottom">Bottom edge</option></select></label><label class="crop-fine"><input type="checkbox" id="crop-fine">Fine adjustment</label></div>
    <div class="crop-arrows" role="group" aria-label="Move selected box or edge"><button type="button" data-direction="up" aria-label="Move up">↑</button><button type="button" data-direction="left" aria-label="Move left">←</button><button type="button" data-direction="down" aria-label="Move down">↓</button><button type="button" data-direction="right" aria-label="Move right">→</button></div>
    <p class="visually-hidden" id="crop-state" role="status"></p><p id="crop-overlap" hidden>Choose a separate area for the second item.</p>
    <div class="crop-actions"><button type="button" data-crop="reset">Reset area</button><button type="button" data-crop="back" hidden>Back</button><button type="button" class="primary" data-crop="next">Next area</button></div>`;
  document.body.append(dialog);
  const find = selector => dialog.querySelector(selector), overview = find('.crop-overview'), detail = find('.crop-detail');
  function close() {
    if (finished) return; finished = true;
    stopRepeating(); listeners.abort();
    dialog.close(); dialog.remove(); overview.width = detail.width = 0; overview.height = detail.height = 0;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); onClose();
  }
  function draw(canvas, frame, crop) {
    const context = canvas.getContext('2d'), ratio = Math.min(canvas.width / frame.width, canvas.height / frame.height);
    const ox = (canvas.width - frame.width * ratio) / 2, oy = (canvas.height - frame.height * ratio) / 2;
    context.fillStyle = '#111923'; context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(image, frame.x, frame.y, frame.width, frame.height, ox, oy, frame.width * ratio, frame.height * ratio);
    const x = ox + (crop.x-frame.x)*ratio, y = oy + (crop.y-frame.y)*ratio, w = crop.width*ratio, h = crop.height*ratio;
    if (canvas === detail) {
      context.fillStyle = '#00000070';
      context.fillRect(0,0,canvas.width,y); context.fillRect(0,y+h,canvas.width,canvas.height-y-h);
      context.fillRect(0,y,x,h); context.fillRect(x+w,y,canvas.width-x-w,h);
    }
    context.strokeStyle = '#5bd1d3'; context.lineWidth = 5;
    context.strokeRect(x,y,w,h);
    const target = find('#crop-target').value;
    if (canvas === detail && target !== 'move') {
      const ends = { left:[x,y,x,y+h], right:[x+w,y,x+w,y+h], top:[x,y,x+w,y], bottom:[x,y+h,x+w,y+h] }[target];
      context.strokeStyle = '#ffffff'; context.lineWidth = 7; context.setLineDash([12,8]);
      context.beginPath(); context.moveTo(ends[0],ends[1]); context.lineTo(ends[2],ends[3]); context.stroke(); context.setLineDash([]);
    }
    if (canvas === overview) { context.fillStyle='#0b1722';context.fillRect(x,Math.max(0,y-28),95,28);context.fillStyle='#fff';context.font='bold 22px Verdana';context.fillText(`Area ${active+1}`,x+3,Math.max(24,y-6)); }
  }
  function render() {
    const crop = crops[active];
    // Keep the view fixed through nudges; refit only when an edge leaves it.
    if (!view || crop.x < view.x || crop.y < view.y || crop.x + crop.width > view.x + view.width || crop.y + crop.height > view.y + view.height) {
      const px = Math.max(width * .025, crop.width * .25), py = Math.max(height * .025, crop.height * .25);
      const x = Math.max(0, crop.x - px), y = Math.max(0, crop.y - py);
      view = { x, y, width: Math.min(width, crop.x + crop.width + px) - x, height: Math.min(height, crop.y + crop.height + py) - y };
    }
    draw(overview,{x:0,y:0,width,height},crop); draw(detail,view,crop);
    find('#crop-title').textContent = active === 0 ? 'Equipped item · left' : 'Potential new equip · right';
    find('#crop-seed').hidden = active !== 1 || provided[1];
    find('[data-crop="back"]').hidden = active === 0;
    find('[data-crop="next"]').textContent = active === 0 ? 'Next area' : 'Read these areas';
    const layout = assignComparisonLayout(crops.map((region,index)=>({id:`area-${index}`,region})));
    const duplicate = active === 1 && (cropsOverlap(crops[0],crops[1]) || layout.status !== 'assigned' || layout.assignment.current !== 'area-0');
    find('[data-crop="next"]').disabled = duplicate;
    find('#crop-overlap').hidden = !duplicate;
    find('#crop-overlap').textContent = 'Keep the equipped area on the left and the potential new equip on the right, without overlapping.';
    const target = find('#crop-target').value;
    for (const button of dialog.querySelectorAll('[data-direction]')) {
      const horizontal = ['left','right'].includes(button.dataset.direction);
      button.setAttribute('aria-label', `${target === 'move' ? 'Move box' : 'Move ' + target + ' edge'} ${button.dataset.direction}`);
      button.disabled = target !== 'move' && horizontal !== ['left','right'].includes(target);
    }
    find('#crop-state').textContent = `Area ${active + 1}, ${target === 'move' ? 'move box' : target + ' edge'}. Position ${crop.x}, ${crop.y}; width ${crop.width}, height ${crop.height}.`;
  }
  function nudge(direction) { if (finished) return; crops[active] = adjustCrop(crops[active], { width,height,target:find('#crop-target').value,direction,fine:find('#crop-fine').checked }); render(); }
  for (const button of dialog.querySelectorAll('[data-direction]')) {
    const repeater = createPressRepeat(() => { if (!button.disabled) nudge(button.dataset.direction); });
    repeaters.push(repeater);
    button.addEventListener('pointerdown', event => { if (button.disabled || event.isPrimary === false || event.button > 0) return; stopRepeating(); repeater.start(); });
    for (const type of ['pointerup','pointercancel','pointerleave','lostpointercapture']) button.addEventListener(type, stopRepeating);
    button.addEventListener('click', event => repeater.click(event));
  }
  const changeTarget = () => { stopRepeating(); render(); };
  find('#crop-target').addEventListener('change',changeTarget);
  find('#crop-fine').addEventListener('change',stopRepeating);
  for (const type of ['pointerup','pointercancel','blur']) globalThis.window?.addEventListener(type,stopRepeating,{signal:listeners.signal});
  document.addEventListener?.('visibilitychange',stopRepeating,{signal:listeners.signal});
  dialog.addEventListener('close',stopRepeating);
  find('[data-crop="cancel"]').addEventListener('click',close);
  find('[data-crop="reset"]').addEventListener('click',() => { stopRepeating(); crops[active] = structuredClone(initial[active]); view = null; render(); });
  find('[data-crop="back"]').addEventListener('click',() => { stopRepeating(); active = 0; view = null; render(); });
  find('[data-crop="next"]').addEventListener('click',() => { stopRepeating(); if (active === 0) { if (!provided[1] && !secondVisited) { crops[1] = seedAdjacentCrop(crops[0],{width,height}); initial[1] = structuredClone(crops[1]); } secondVisited = true; active = 1; view = null; render(); find('#crop-target').focus(); } else { const result = structuredClone(crops); close(); onApply(result); } });
  dialog.addEventListener('cancel',event => { event.preventDefault(); close(); });
  dialog.addEventListener('keydown',event => { if (event.target.matches('select,input')) return; const direction = {ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[event.key]; if (direction) { event.preventDefault(); nudge(direction); } });
  render(); dialog.showModal(); find('#crop-target').focus();
  return { close };
}
