// A hold is optional: a short pointer press still uses the native click path.
// Timers are injected so cancellation is verified without wall-clock sleeps.
export function createPressRepeat(step, { schedule = setTimeout, cancel = clearTimeout, delay = 400, interval = 100 } = {}) {
  let timer = null, generation = 0, held = false, repeated = false, suppressClick = false;
  function stop() {
    held = false; generation++;
    if (timer !== null) cancel(timer);
    timer = null;
    suppressClick ||= repeated;
  }
  function start() {
    stop(); repeated = false; suppressClick = false; held = true;
    const token = generation;
    const tick = () => {
      if (!held || token !== generation) return;
      timer = null;
      repeated = true; step();
      if (held && token === generation) timer = schedule(tick, interval);
    };
    timer = schedule(tick, delay);
  }
  function click({ detail = 1 } = {}) {
    if (detail === 0) { step(); return; } // Keyboard/assistive activation.
    if (suppressClick || repeated) { suppressClick = false; repeated = false; return; }
    step();
  }
  return { start, stop, click };
}

// This is only a starting box for review, never a detected or confirmed area.
export function seedAdjacentCrop(first, { width, height }) {
  if (![width,height].every(n=>Number.isInteger(n) && n>=8) || !first || !['x','y','width','height'].every(k=>Number.isInteger(first[k])) || first.x<0 || first.y<0 || first.width<8 || first.height<8 || first.x+first.width>width || first.y+first.height>height) throw new TypeError('Bounded first area required.');
  const x = Math.min(width - 8, first.x + first.width);
  return { x, y:first.y, width:Math.min(first.width,width-x), height:first.height };
}
