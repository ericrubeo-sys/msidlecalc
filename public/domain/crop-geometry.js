// All crop state uses original image pixels, independent of screen size/theme.
export function cropsOverlap(a, b) {
  const intersection = Math.max(0, Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)) * Math.max(0, Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
  return intersection / Math.min(a.width*a.height,b.width*b.height) > .8;
}
export function adjustCrop(region, { width, height, target = 'move', direction, fine = false }) {
  if (![width, height].every(n => Number.isInteger(n) && n >= 8) || !region || !['x','y','width','height'].every(k => Number.isInteger(region[k])) || region.x < 0 || region.y < 0 || region.width < 8 || region.height < 8 || region.x + region.width > width || region.y + region.height > height) throw new TypeError('Bounded original-pixel crop required.');
  if (!['move','left','right','top','bottom'].includes(target) || !['left','right','up','down'].includes(direction)) throw new TypeError('Explicit crop control required.');
  const horizontal = direction === 'left' || direction === 'right';
  if (target !== 'move' && (horizontal !== ['left','right'].includes(target))) return { ...region };
  const step = fine ? 1 : Math.max(1, Math.round((horizontal ? width : height) * .02));
  const delta = step * (['left','up'].includes(direction) ? -1 : 1);
  const crop = { ...region }, clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  if (target === 'move') {
    const key = horizontal ? 'x' : 'y', size = horizontal ? 'width' : 'height';
    crop[key] = clamp(crop[key] + delta, 0, (horizontal ? width : height) - crop[size]);
  } else if (target === 'left') { const right = crop.x + crop.width; crop.x = clamp(crop.x + delta, 0, right - 8); crop.width = right - crop.x; }
  else if (target === 'right') crop.width = clamp(crop.width + delta, 8, width - crop.x);
  else if (target === 'top') { const bottom = crop.y + crop.height; crop.y = clamp(crop.y + delta, 0, bottom - 8); crop.height = bottom - crop.y; }
  else crop.height = clamp(crop.height + delta, 8, height - crop.y);
  return crop;
}
