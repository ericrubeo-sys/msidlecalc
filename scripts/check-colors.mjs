import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const css = await readFile(new URL('../public/styles.css', import.meta.url), 'utf8');
function luminance(hex) {
  if (hex.length === 4) hex = '#' + [...hex.slice(1)].map((value) => value + value).join('');
  const rgb = hex.replace('#', '').match(/../g).map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
function ratio(a, b) {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
}
for (const [name, selector] of [['light', ':root'], ['dark', ':root[data-theme=dark]']]) {
  const block = css.slice(css.indexOf(selector) + selector.length).split('{')[1].split('}')[0];
  const tokens = Object.fromEntries([...block.matchAll(/--([\w-]+):([^;}]*)/g)].map((match) => [match[1], match[2].trim()]));
  const pairs = [];
  for (const surface of ['canvas', 'surface', 'surface-2', 'blue-pale']) {
    for (const foreground of ['ink', 'muted', 'blue']) pairs.push([foreground, surface, 4.5]);
    pairs.push(['focus', surface, 3]);
  }
  // Focus outlines are offset 4px from controls, adjacent to these surrounding
  // surfaces rather than to the primary button fill.
  pairs.push(['accent-ink', 'accent', 4.5], ['warm-ink', 'warm', 4.5], ['nav-ink', 'nav', 4.5], ['error', 'surface', 4.5], ['green', 'canvas', 4.5], ['control-border', 'surface', 3]);
  let lowest = Infinity;
  for (const [foreground, background, threshold] of pairs) {
    const value = ratio(tokens[foreground], tokens[background]);
    lowest = Math.min(lowest, value);
    assert.ok(value >= threshold, `${name}: ${foreground}/${background} = ${value.toFixed(2)}; expected ${threshold}`);
  }
  console.log(`${name}: ${pairs.length} token pairs passed; lowest ratio ${lowest.toFixed(2)}:1`);
}
