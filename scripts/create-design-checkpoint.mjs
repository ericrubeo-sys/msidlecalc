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
intake = intake.replace('<button class="upload">Upload screenshot</button>', '<button class="upload" type="button" disabled>Upload screenshot</button><button class="manual" type="button" disabled>Enter items manually</button>');
intake = intake.replace(/<button class="coffee"[^>]*>[\s\S]*?<\/button>/, '<button class="coffee" type="button" disabled>Buy me a coffee — coming soon</button>');
intake = intake.replace(/<img class="sample-image"/, `<img src="${screenshot}" class="sample-image"`);
intake = intake.replace('href="methodology-draft.html"', 'href="#review-note"');
intake = intake.replace(/href="#"/g, 'href="#review-note"');

const additionalCss = `
  html,body{margin:0;min-height:100%;background:#e6e7e7}
  body{font-family:Verdana,Arial,sans-serif}
  #msidlecalc-phone-size-preview{padding:0;min-height:100svh}
  #msidlecalc-phone-size-preview .site{width:100%;max-width:1120px;height:auto;min-height:100svh;margin:auto;overflow:visible}
  #msidlecalc-phone-size-preview .masthead{flex-wrap:wrap;min-height:88px}
  #msidlecalc-phone-size-preview .appearance{display:flex;align-items:center;gap:6px;font:14px system-ui,sans-serif}
  #msidlecalc-phone-size-preview .appearance select{min-height:44px;max-width:100%;padding:6px;background:#edf3f5;color:#173750;border:1px solid #587287}
  #msidlecalc-phone-size-preview .dark .appearance select{background:#15293a;color:#f1f4f7;border-color:#7392a8}
  #msidlecalc-phone-size-preview .workarea{min-height:300px;padding:24px 16px;gap:14px}
  #msidlecalc-phone-size-preview .guide-frame{max-width:760px;flex:none}
  #msidlecalc-phone-size-preview .legend{font-size:14px}
  #msidlecalc-phone-size-preview .upload{min-height:50px;opacity:1;cursor:default}
  #msidlecalc-phone-size-preview .manual{min-height:44px;border:0;background:none;color:#075d93;text-decoration:underline;font:14px Verdana,sans-serif}
  #msidlecalc-phone-size-preview .dark .manual{color:#f1a14a}
  #msidlecalc-phone-size-preview .legal{max-width:650px;font-size:14px;line-height:1.5;margin-bottom:8px}
  #msidlecalc-phone-size-preview .footlinks{font-size:14px;gap:10px}
  #msidlecalc-phone-size-preview .footlinks a{display:inline-flex;min-height:44px;align-items:center}
  #msidlecalc-phone-size-preview .coffee{min-height:44px;font-size:14px;white-space:normal;opacity:1}
  #msidlecalc-phone-size-preview .footer{padding:16px}
  #review-note{max-width:1088px;margin:0 auto;padding:16px;font:14px/1.6 system-ui,sans-serif;color:#263643;background:#f7f7f4}
  a:focus-visible,select:focus-visible{outline:3px solid #e1882f;outline-offset:3px}
  @media(max-width:430px){#msidlecalc-phone-size-preview .brand{font-size:18px}#msidlecalc-phone-size-preview .mastcopy{flex-basis:100%}#msidlecalc-phone-size-preview .appearance{margin-left:auto}#msidlecalc-phone-size-preview .workarea{min-height:240px}#msidlecalc-phone-size-preview .brand-mark{width:38px;height:38px}}
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
const document = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>msIdleCalc — design checkpoint for approval</title><style>${css}\n${additionalCss}</style></head><body><div id="msidlecalc-phone-size-preview">${intake}</div><aside id="review-note"><strong>Local design checkpoint — not the live site.</strong> Reuses the recovered screenshot-first mockup. Proposed changes shown for approval: readable essential text and 44px controls, labeled theme selection, a manual-entry alternative, responsive desktop extension, and your disabled coffee button. Upload/manual actions are deliberately inactive in this composition review. No OCR, data submission, or damage calculation runs here. The source screenshot is retained only in this ignored local review folder. Contact/report delivery is not configured.</aside><script>${script}</script></body></html>`;

const folder = new URL('../.review/', import.meta.url);
await mkdir(folder, { recursive: true });
await writeFile(new URL('prototype.html', folder), document);
const frame = (width, theme) => `<section><h2>${width}px · ${theme}</h2><div class="frame-wrap"><iframe title="${width}px ${theme} intake composition" src="prototype.html?theme=${theme}" width="${width}" height="880"></iframe></div></section>`;
await writeFile(new URL('index.html', folder), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>msIdleCalc visual checkpoint</title><style>body{margin:0;padding:24px;background:#e8e9eb;color:#172839;font:16px/1.5 system-ui,sans-serif}h1{font-size:24px}h2{font-size:16px}.pair{display:flex;gap:20px;flex-wrap:wrap}.frame-wrap{overflow:auto;max-width:100%;border:1px solid #8b9aaa}section{max-width:100%;margin-bottom:24px}iframe{display:block;border:0;background:white}.desktop{display:block}p{max-width:1000px}a{color:#17577c}</style><h1>msIdleCalc · visual checkpoint</h1><p>This is the recovered screenshot-first design with explicitly listed accessibility and desktop proposals, for your approval. It is not a production update or a working calculator. <a href="prototype.html">Open the responsive composition</a>.</p><div class="pair">${frame(320,'light')}${frame(320,'dark')}</div><div class="pair">${frame(375,'light')}${frame(375,'dark')}</div><div class="desktop">${frame(1024,'light')}${frame(1024,'dark')}</div></html>`);
console.log(`Created local-only review in ${fileURLToPath(folder)}`);
