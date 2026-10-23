// Loopback-only verification server. Instrumentation is never in public output.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../public/',import.meta.url));
const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
const headers=Object.fromEntries(config.headers.find(rule=>rule.source==='/(.*)').headers.map(({key,value})=>[key,value]));
const requests={get:0,head:0,other:0};
const instrumentation=String.raw`
const audit={fetch:0,xhr:0,beacon:0,websocket:0,storageWrites:[],indexedDB:0,console:0};
for(const name of ['fetch']){const original=window[name];window[name]=function(...args){audit[name]++;return original.apply(this,args)}}
const open=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(...args){audit.xhr++;return open.apply(this,args)};
const beacon=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=function(...args){audit.beacon++;return beacon(...args)};
const socket=window.WebSocket;window.WebSocket=class extends socket{constructor(...args){audit.websocket++;super(...args)}};
const set=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){audit.storageWrites.push({key,containsSentinel:String(value).includes('QA_PRIVATE_SENTINEL')});return set.call(this,key,value)};
const db=indexedDB.open.bind(indexedDB);indexedDB.open=function(...args){audit.indexedDB++;return db(...args)};
for(const name of ['log','warn','error','info','debug']){const original=console[name];console[name]=function(...args){audit.console++;return original.apply(this,args)}}
document.addEventListener('DOMContentLoaded',()=>{const aside=document.createElement('aside');aside.style='padding:12px;background:white;color:black';const button=document.createElement('button');button.textContent='Inspect privacy verification';const pre=document.createElement('pre');pre.style='white-space:pre-wrap';button.onclick=()=>{const resources=performance.getEntriesByType('resource').map(e=>({url:e.name,kind:e.initiatorType}));pre.textContent=JSON.stringify({...audit,localStorageKeys:Object.keys(localStorage),sessionStorageKeys:Object.keys(sessionStorage),resourceRequests:resources,sentinelInResourceURL:resources.some(r=>r.url.includes('QA_PRIVATE_SENTINEL'))},null,2)};aside.append(button,pre);document.body.append(aside)});
`;
createServer(async(req,res)=>{
 try{
  const method=req.method==='GET'?'get':req.method==='HEAD'?'head':'other';requests[method]++;
  if(method==='other'){res.writeHead(405,headers);res.end();return;}
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/__request-counts'){res.writeHead(200,{...headers,'Content-Type':'application/json'});res.end(JSON.stringify(requests));return;}
  if(url.pathname==='/__privacy.js'){res.writeHead(200,{...headers,'Content-Type':'text/javascript'});res.end(instrumentation);return;}
  const target=path.resolve(root,`.${url.pathname==='/'?'/index.html':url.pathname}`);
  const rel=path.relative(root,target);if(rel.startsWith('..')||path.isAbsolute(rel))throw Error();
  let data=await readFile(target);const ext=path.extname(target);
  if(ext==='.html')data=Buffer.from(data.toString().replace('<head>','<head><script src="/__privacy.js"></script>'));
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.wasm':'application/wasm','.json':'application/json','.gz':'application/gzip','.png':'image/png','.webp':'image/webp'};
  res.writeHead(200,{...headers,'Content-Type':mime[ext]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT)||4175,'127.0.0.1',()=>console.log('Loopback privacy verification ready'));
