import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname } from 'node:path';
import { safePath, canonicalRoot } from './files.js';
import { StudioError } from './contract.js';

export async function startPreview(directory: string, port = 0) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new StudioError('INVALID_ARGUMENT', 'Port must be an integer between 0 and 65535');
  const root = await canonicalRoot(directory);
  if (!(await stat(root)).isDirectory()) throw new StudioError('INVALID_ARGUMENT', 'Preview requires a directory');
  const types: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
    '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wasm': 'application/wasm' };
  const server = createServer(async (request, response) => {
    try {
      const address = server.address();
      const port = address && typeof address !== 'string' ? address.port : 0;
      if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(request.headers.host ?? '')) {
        response.writeHead(403).end(); return;
      }
      if (!['GET', 'HEAD'].includes(request.method ?? '')) { response.writeHead(405).end(); return; }
      let path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname).slice(1);
      if (!path || path.endsWith('/')) path += 'index.html';
      if (path.split('/').some(part => part.startsWith('.'))) { response.writeHead(403).end(); return; }
      const target = await safePath(root, path);
      if (!(await stat(target)).isFile()) { response.writeHead(404).end(); return; }
      const content = await readFile(target);
      response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream',
        'Content-Length': content.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      const status = error instanceof StudioError ? 403 : (error as NodeJS.ErrnoException).code === 'ENOENT' ? 404 : 400;
      response.writeHead(status).end();
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => { server.off('error', reject); resolve(); });
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Preview failed to bind a TCP port');
  return { server, url: `http://127.0.0.1:${address.port}/` };
}
