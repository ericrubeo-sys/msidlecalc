// Build identity includes only public application sources, never player data.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../public/',import.meta.url));
const hash = createHash('sha256');
async function walk(folder) {
  for (const entry of (await readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
    const target = path.join(folder,entry.name), relative = path.relative(root,target).replaceAll('\\','/');
    if (relative === 'vendor' || relative === 'release.js') continue;
    if (entry.isSymbolicLink()) throw new Error('Release sources cannot be symlinks.');
    if (entry.isDirectory()) await walk(target);
    else {
      const bytes = await readFile(target);
      const content = /\.(?:html|css|js)$/.test(relative) ? bytes.toString('utf8').replaceAll('\r\n','\n') : bytes;
      hash.update(relative + '\0'); hash.update(content); hash.update('\0');
    }
  }
}
await walk(root);
for (const name of ['package-lock.json','vercel.json','scripts/write-release.mjs']) {
  hash.update(name + '\0'); hash.update((await readFile(new URL('../'+name,import.meta.url),'utf8')).replaceAll('\r\n','\n')); hash.update('\0');
}
const id = hash.digest('hex').slice(0,12);
const content = `// Generated from public sources; no runtime or player data.\nexport const RELEASE_ID = '${id}';\n`;
if (process.argv.includes('--verify')) {
  if (await readFile(path.join(root,'release.js'),'utf8') !== content) throw new Error('Release metadata is stale. Run npm run build.');
  console.log(`Application build verified: ${id}`);
} else {
  await writeFile(path.join(root,'release.js'),content);
  console.log(`Application build: ${id}`);
}
