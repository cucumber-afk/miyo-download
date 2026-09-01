import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { getConfig } from './config.js';

const config = getConfig();
const app = await createApp(config);
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = path.join(root, 'dist');

function staticPath(pathname) {
  const requested = pathname === '/' ? 'index.html' : pathname.slice(1);
  const resolved = path.resolve(distRoot, requested);
  return resolved.startsWith(`${distRoot}${path.sep}`) || resolved === distRoot ? resolved : null;
}

function contentType(file) {
  const types = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon' };
  return types[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

async function serveStatic(pathname, res) {
  const file = staticPath(pathname);
  if (file) {
    try {
      const stat = await fs.stat(file);
      if (stat.isFile()) {
        res.writeHead(200, { 'content-type': contentType(file), 'content-length': stat.size, 'cache-control': path.basename(file) === 'index.html' ? 'no-cache' : 'public, max-age=31536000, immutable' });
        res.end(await fs.readFile(file));
        return true;
      }
    } catch { /* Use the SPA fallback below. */ }
  }
  try {
    const index = path.join(distRoot, 'index.html');
    const stat = await fs.stat(index);
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'content-length': stat.size, 'cache-control': 'no-cache' });
    res.end(await fs.readFile(index));
    return true;
  } catch {
    res.writeHead(503, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Frontend build is missing. Run npm run build.' }));
    return true;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || `${config.host}:${config.port}`}`);
    if (!url.pathname.startsWith('/api/')) {
      await serveStatic(url.pathname, res);
      return;
    }
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });
    const response = await app(new Request(url, { method: req.method, headers, body, duplex: body ? 'half' : undefined }));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) for await (const chunk of response.body) res.write(chunk);
    res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Internal server error.' }));
  }
});

server.listen(config.port, config.host, () => console.log(`MiYo VPS listening on http://${config.host}:${config.port}`));
