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
for (const [name, selector] of [['light', ':root'], ['dark', '[data-theme=dark]']]) {
  const start = css.indexOf(`${selector}{--ink`);
  assert.ok(start >= 0, `Missing ${name} semantic token block`);
  const block = css.slice(css.indexOf('{', start) + 1).split('}')[0];
  const tokens = Object.fromEntries([...block.matchAll(/--([\w-]+):([^;}]*)/g)].map((match) => [match[1], match[2].trim()]));
  const pairs = [];
  for (const surface of ['surface', 'panel']) {
    for (const foreground of ['ink', 'muted', 'link']) pairs.push([foreground, surface, 4.5]);
    pairs.push(['focus', surface, 3]);
  }
  pairs.push(['border', 'surface', 3]);
  let lowest = Infinity;
  for (const [foreground, background, threshold] of pairs) {
    const value = ratio(tokens[foreground], tokens[background]);
    lowest = Math.min(lowest, value);
    assert.ok(value >= threshold, `${name}: ${foreground}/${background} = ${value.toFixed(2)}; expected ${threshold}`);
  }
  console.log(`${name}: ${pairs.length} token pairs passed; lowest ratio ${lowest.toFixed(2)}:1`);
}
// Actual gradient endpoints from the approved composition; endpoint checks are
// bounded color checks, not a rendered accessibility certification.
for (const [label,foreground,background] of [
 ['light header','#173750','#8fb9d2'],['light disclaimer','#3c505f','#d6d2c4'],
 ['light footer link','#075d93','#d6d2c4'],['light action','#1b2a11','#759f37'],
 ['dark header','#f0f5f7','#245b7e'],['dark disclaimer','#c3d0d9','#132332'],
 ['dark footer link','#f1a14a','#132332'],['dark action','#281607','#c66b1b'],
 ['support placeholder','#302a12','#ffdd00'],
]) { const value=ratio(foreground,background); assert.ok(value>=4.5,`${label}: ${value.toFixed(2)}`); console.log(`${label}: ${value.toFixed(2)}:1`); }
