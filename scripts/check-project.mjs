// Buildless release integrity: syntax + local asset/module closure. No network,
// screenshot reading, fixture export or source-document publication.
import {readFile,readdir,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../public/',import.meta.url));
let files=[];
async function walk(folder){for(const entry of await readdir(folder,{withFileTypes:true})){const target=path.join(folder,entry.name);if(entry.isDirectory())await walk(target);else files.push(target)}}
await walk(root);
for(const file of files){
 const relative=path.relative(root,file);
 if(/(?:^|[\\/])(?:\.review|\.private-fixtures|node_modules|docs|research)(?:[\\/]|$)/.test(relative))throw Error(`Private/non-app directory in public: ${relative}`);
 if(!/\.(?:html|css|js)$/.test(file))continue;
 const content=await readFile(file,'utf8');
 if(file.endsWith('.js')){const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(check.status!==0)throw Error(check.stderr)}
 const references=file.endsWith('.html')?[...content.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]):file.endsWith('.js')?[...content.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)].map(m=>m[1]):[];
 for(const ref of references){
  if(/^(?:https?:|data:|blob:|#)/.test(ref))continue;
  if(!ref.startsWith('/')&&!ref.startsWith('.'))continue;
  const target=ref.startsWith('/')?path.resolve(root,`.${ref.split(/[?#]/)[0]}`):path.resolve(path.dirname(file),ref);
  const rel=path.relative(root,target);if(rel.startsWith('..')||path.isAbsolute(rel))throw Error(`Outside public import: ${relative}`);
  if(!(await stat(target)).isFile())throw Error(`Missing reference ${ref} in ${relative}`);
 }
}
console.log(`Public integrity: ${files.length} files; JavaScript syntax and local references passed.`);
