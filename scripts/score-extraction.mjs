// Usage: node scripts/score-extraction.mjs .private-fixtures/evaluation.json
// Input contains {fixtures:[{id,split,permission,truth,observed}]}.
// Output contains fixed count keys only, never file names/identities/player text.
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreExtractionFixtures } from './lib/extraction-metrics.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
try {
  if (process.argv.length !== 3) throw new Error();
  const target = path.resolve(root, process.argv[2]);
  const relative = path.relative(path.join(root, '.private-fixtures'), target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || path.extname(target) !== '.json') throw new Error();
  const privateRoot = await realpath(path.join(root, '.private-fixtures'));
  const resolved = await realpath(target);
  const resolvedRelative = path.relative(privateRoot, resolved);
  if (!resolvedRelative || resolvedRelative.startsWith('..') || path.isAbsolute(resolvedRelative)) throw new Error();
  const info = await stat(resolved);
  if (!info.isFile() || info.size > 8 * 1024 * 1024) throw new Error();
  const bytes = await readFile(resolved);
  const input = JSON.parse(bytes.toString('utf8'));
  console.log(JSON.stringify(scoreExtractionFixtures(input.fixtures), null, 2));
} catch {
  console.error('Evaluation failed: use a valid permitted private fixture manifest. No input content was logged.');
  process.exitCode = 1;
}
