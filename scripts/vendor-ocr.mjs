// Reproducible fixed-asset copy. No dependency scripts, downloads or player data.
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const packages = [['tesseract.js', '7.0.0'], ['tesseract.js-core', '7.0.0'], ['@tesseract.js-data/eng', '1.0.0']];
for (const [name, version] of packages) {
  const metadata = JSON.parse(await readFile(path.join(root, 'node_modules', name, 'package.json'), 'utf8'));
  if (metadata.version !== version) throw new Error('Pinned OCR package version mismatch.');
}
const entries = [
  ['tesseract.min.js', 'node_modules/tesseract.js/dist/tesseract.min.js'],
  ['worker.min.js', 'node_modules/tesseract.js/dist/worker.min.js'],
  ['tesseract.min.js.LICENSE.txt', 'node_modules/tesseract.js/dist/tesseract.min.js.LICENSE.txt'],
  ['worker.min.js.LICENSE.txt', 'node_modules/tesseract.js/dist/worker.min.js.LICENSE.txt'],
  ['lang/eng.traineddata.gz', 'node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz'],
  ['licenses/eng-package.json', 'node_modules/@tesseract.js-data/eng/package.json'],
  ['licenses/eng-README.md', 'node_modules/@tesseract.js-data/eng/README.md'],
  ['licenses/eng-traineddata-Apache-2.0.txt', 'node_modules/tesseract.js-core/LICENSE'],
];
for (const name of (await readdir(path.join(root, 'node_modules/tesseract.js-core'))).sort()) if (/^tesseract-core(?:-(?:relaxedsimd|simd))?(?:-lstm)?\.wasm(?:\.js)?$/.test(name)) entries.push([`core/${name}`, `node_modules/tesseract.js-core/${name}`]);
for (const [name] of packages) {
  const names = await readdir(path.join(root, 'node_modules', name));
  const license = names.find(entry => /^licen[cs]e(?:\.txt|\.md)?$/i.test(entry));
  if (!license && name === '@tesseract.js-data/eng') continue;
  if (!license) throw new Error('OCR dependency license missing.');
  entries.push([`licenses/${name.replace(/[^a-z0-9.-]/gi, '-')}.txt`, `node_modules/${name}/${license}`]);
}
// Read everything successfully before creating any generated destination.
const files = await Promise.all(entries.map(async ([target, source]) => ({ target, content: await readFile(path.join(root, source)) })));
files.push({ target: 'licenses/NOTICE.txt', content: Buffer.from('Unmodified pinned Tesseract.js7.0.0 and tesseract.js-core7.0.0 resources; bundled license texts and minified dependency notices are included. English traineddata: @tesseract.js-data/eng1.0.0, variant4.0.0_best_int. That npm package declares MIT in package.json and does not ship a LICENSE file; its metadata and README are preserved. Upstream language repository LICENSE is Apache2.0: https://github.com/naptha/tessdata/blob/gh-pages/LICENSE . The standard Apache2.0 text is included from the pinned core distribution. No project-wide license is selected by these third-party notices.\n') });
const destination = path.join(root, 'public/vendor');
const manifest = { version: 'ocr-vendor-1', packages: Object.fromEntries(packages), assets: [] };
const allowed = new Set([...files.map(file => file.target), 'manifest.json']);
async function inspectDirectory(directory) {
  let found;
  try { found = await readdir(directory, { withFileTypes: true }); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  for (const entry of found) {
    const target = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Unexpected symbolic link in OCR vendor output.');
    if (entry.isDirectory()) await inspectDirectory(target);
    else if (!allowed.has(path.relative(destination, target).split(path.sep).join('/'))) throw new Error('Unexpected file in OCR vendor output.');
  }
}
await inspectDirectory(destination);
const verifyOnly = process.argv.includes('--verify');
for (const { target, content } of files) {
  const output = path.resolve(destination, target), relative = path.relative(destination, output);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Invalid vendor destination.');
  if (verifyOnly) { if (!(await readFile(output)).equals(content)) throw new Error('OCR vendor content integrity mismatch.'); }
  else { await mkdir(path.dirname(output), { recursive: true }); await writeFile(output, content); }
  manifest.assets.push({ path: target, bytes: content.length, sha256: createHash('sha256').update(content).digest('hex') });
}
const manifestText = JSON.stringify(manifest, null, 2) + '\n';
if (verifyOnly) { if (await readFile(path.join(destination, 'manifest.json'), 'utf8') !== manifestText) throw new Error('OCR vendor manifest mismatch.'); }
else await writeFile(path.join(destination, 'manifest.json'), manifestText);
console.log(`Pinned OCR resources ${verifyOnly ? 'verified' : 'prepared'}: ${files.length} fixed files.`);
