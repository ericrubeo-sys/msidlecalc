// Reuse the user's existing msIdleCalc mockup, not the rejected deployment page.
// Source imagery stays in ignored, loopback-only .review/. No production changes.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Pass the recovered msidlecalc-phone-sizes.html path.');
const source = await readFile(sourcePath, 'utf8');
const css = source.match(/<style>([\s\S]*?)<\/style>/)?.[1];
const screenshot = source.match(/<img class="source" src="([^"]+)"/)?.[1];
const start = source.indexOf('<section class="site light"');
if (!css || !screenshot || start < 0) throw new Error('Expected recovered mockup structure was not found.');
// Intake only. Do not retain mockup modals with placeholder DPS or fake sending.
const end = source.indexOf('</footer>', start) + '</footer>'.length;
let intake = source.slice(start, end) + '</section>';
intake = intake.replace(/style="--screen-width:[^"]+"/, '');
intake = intake.replace(/aria-label="320 pixel compact viewport, BasilMarket light"/, 'aria-label="Equipment comparison intake visual checkpoint"');
intake = intake.replace('<button class="theme" aria-label="Change theme">☼</button>', '<label class="appearance">Appearance<select id="appearance"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>');
intake = intake.replace('<button class="upload">Upload screenshot</button>', '<button class="upload" type="button" disabled>Upload screenshot</button>');
intake = intake.replace(/<button class="coffee"[^>]*>[\s\S]*?<\/button>/, '<span class="support"><button class="coffee" type="button" disabled aria-describedby="support-status"><span>Support the project</span><small id="support-status">Coming soon</small></button></span>');
intake = intake.replace(/<img class="sample-image"/, `<img src="${screenshot}" class="sample-image"`);
intake = intake.replace('href="methodology-draft.html"', 'href="#review-note"');
intake = intake.replace(/href="#"/g, 'href="#review-note"');

const additionalCss = `
  html,body{margin:0;min-height:100%;background:#e6e7e7}
  body{font-family:Verdana,Arial,sans-serif}
  #msidlecalc-phone-size-preview{padding:0;min-height:100svh}
  #msidlecalc-phone-size-preview .site{width:100%;max-width:1120px;height:auto;min-height:100svh;margin:auto;overflow:visible}
  #msidlecalc-phone-size-preview .masthead{flex-wrap:nowrap;min-height:78px}
  #msidlecalc-phone-size-preview .mastcopy{flex:1;min-width:0}
  #msidlecalc-phone-size-preview .brand-title{overflow-wrap:normal}
  #msidlecalc-phone-size-preview .appearance{display:flex;flex:none;flex-direction:column;align-items:flex-start;gap:3px;font:9px Verdana,sans-serif}
  #msidlecalc-phone-size-preview .appearance select{min-height:36px;width:64px;padding:4px;font:11px Verdana,sans-serif;background:#edf3f5;color:#173750;border:1px solid #587287}
  #msidlecalc-phone-size-preview .dark .appearance select{background:#15293a;color:#f1f4f7;border-color:#7392a8}
  #msidlecalc-phone-size-preview .workarea{min-height:0;padding:16px 15px;gap:10px}
  #msidlecalc-phone-size-preview .guide-frame{max-width:960px;flex:none}
  #msidlecalc-phone-size-preview .upload{max-width:960px;min-height:50px;opacity:1;cursor:default}
  #msidlecalc-phone-size-preview .legal{max-width:580px;font-size:10px;line-height:1.35;margin-bottom:6px}
  #msidlecalc-phone-size-preview .footlinks{font-size:9.5px;gap:6px}
  #msidlecalc-phone-size-preview .footlinks a{display:inline-flex;min-height:20px;align-items:center}
  #msidlecalc-phone-size-preview .support{display:inline-flex;align-items:center;gap:6px}
  #msidlecalc-phone-size-preview .support small{display:block;font:8px/1.1 Verdana,sans-serif;color:inherit}
  #msidlecalc-phone-size-preview .coffee{min-height:32px;padding:4px 8px;font:600 10px Verdana,sans-serif;white-space:nowrap;opacity:1;background:#ffdd00;color:#302a12;border:1px solid #b89d40;box-shadow:none}
  #msidlecalc-phone-size-preview .dark .coffee{background:#ffdd00;color:#302a12;border-color:#b89d40;box-shadow:none}
  #msidlecalc-phone-size-preview .footer{padding:9px 12px 10px}
  #msidlecalc-phone-size-preview img.brand-mark{width:32px;height:32px;padding:2px}
  #review-note{max-width:1088px;margin:0 auto;padding:16px;font:14px/1.6 system-ui,sans-serif;color:#263643;background:#f7f7f4}
  a:focus-visible,select:focus-visible{outline:3px solid #e1882f;outline-offset:3px}
  @media(max-width:430px){#msidlecalc-phone-size-preview .masthead{padding:10px;gap:8px}#msidlecalc-phone-size-preview .brand{font-size:17px;gap:7px}#msidlecalc-phone-size-preview .brand-mark{width:30px;height:30px;padding:1px}#msidlecalc-phone-size-preview .workarea{padding:12px;gap:8px}#msidlecalc-phone-size-preview .footer{padding:8px 9px}#msidlecalc-phone-size-preview .legal{font-size:10px}}
  @media(max-width:340px){#msidlecalc-phone-size-preview .brand{font-size:15px}#msidlecalc-phone-size-preview .brand-mark{width:28px;height:28px}#msidlecalc-phone-size-preview .appearance select{width:69px;font-size:11px}#msidlecalc-phone-size-preview .legal{font-size:9px}#msidlecalc-phone-size-preview .footlinks{font-size:10px}}
`;
const script = `
  const preference = document.querySelector('#appearance');
  const site = document.querySelector('.site');
  const media = matchMedia('(prefers-color-scheme: dark)');
  const initial = new URLSearchParams(location.search).get('theme');
  if (['light','dark'].includes(initial)) preference.value = initial;
  function apply(){site.classList.toggle('dark',preference.value==='dark'||preference.value==='system'&&media.matches);site.classList.toggle('light',!site.classList.contains('dark'));}
  preference.addEventListener('change',apply);media.addEventListener('change',apply);apply();
`;
const document = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>msIdleCalc — design checkpoint for approval</title><style>${css}\n${additionalCss}</style></head><body><div id="msidlecalc-phone-size-preview">${intake}</div><aside id="review-note"><strong>Local design checkpoint — not the live site.</strong> Restored compact footer/header and screenshot-first composition. The yellow support control is a disabled placeholder for the future provider embed, not an active payment integration. Upload is inactive in this intake composition review; manual input and corrected-stat stages remain part of the planned application. No OCR, data submission, or damage calculation runs here. The source screenshot is retained only in this ignored local review folder. Contact/report delivery is not configured.</aside><script>${script}</script></body></html>`;

const folder = new URL('../.review/', import.meta.url);
await mkdir(folder, { recursive: true });
await writeFile(new URL('prototype.html', folder), document);
const sizes = [[320,568],[360,800],[375,812],[390,844],[430,932],[844,390],[768,1024],[1440,900]];
const frame = (width, height, theme) => `<section><h2>${width} × ${height} · ${theme}</h2><div class="frame-wrap"><iframe title="${width} by ${height} ${theme} composition" src="prototype.html?theme=${theme}" width="${width}" height="${height}"></iframe></div></section>`;
await writeFile(new URL('index.html', folder), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>msIdleCalc visual checkpoint</title><style>body{margin:0;padding:16px;background:#e8e9eb;color:#172839;font:16px/1.5 system-ui,sans-serif}h1{font-size:24px}h2{font-size:16px}.pair{display:flex;gap:20px;flex-wrap:wrap}.frame-wrap{overflow:auto;max-width:100%;border:1px solid #8b9aaa}section{max-width:100%;margin-bottom:24px}iframe{display:block;border:0;background:white}p{max-width:1000px}a{color:#17577c}</style><h1>msIdleCalc · responsive review</h1><p>Frames use their labeled CSS viewport sizes without scaling. Narrow review windows scroll large frames rather than shrink them. <a href="prototype.html">Open the composition directly at your browser’s full available size</a>. This is a local design review, not the live application.</p>${sizes.map(([width,height])=>`<div class="pair">${frame(width,height,'light')}${frame(width,height,'dark')}</div>`).join('')}</html>`);
console.log(`Created local-only review in ${fileURLToPath(folder)}`);
