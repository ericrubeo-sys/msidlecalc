import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const configuration = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const commonHeaders = Object.fromEntries(configuration.headers[0].headers.map(({ key, value }) => [key, value]));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.gz': 'application/gzip', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.txt': 'text/plain' };
createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { request.resume(); response.writeHead(405, commonHeaders); response.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const headers = Object.fromEntries(configuration.headers.filter(rule => new RegExp(`^${rule.source}$`).test(pathname)).flatMap(rule => rule.headers).map(({key,value})=>[key,value]));
    const target = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relative = path.relative(root, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Outside public directory');
    const content = await readFile(target);
    response.writeHead(200, { ...headers, 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control': headers['Cache-Control'] || 'public, max-age=0, must-revalidate' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404, { ...commonHeaders, 'Content-Type': 'text/plain' });
    response.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
