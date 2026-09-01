import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { Readable } from 'node:stream';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { VpsDatabase, migrateDatabase } from './db/sqlite.js';
import { createFilesystemMediaStore } from './media/filesystem.js';
import { getConfig } from './config.js';
import { isValidMediaKey } from '../functions/_lib/media-store.js';
import { error } from '../functions/_lib/response.js';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const routeModules = [
  ['GET', /^\/api\/animations\/?$/, './functions/api/animations/index.js'],
  ['GET', /^\/api\/animations\/featured\/?$/, './functions/api/animations/featured.js'],
  ['GET', /^\/api\/site-config\/?$/, './functions/api/site-config.js'],
  ['GET', /^\/api\/global-config\/?$/, './functions/api/global-config.js'],
  ['GET', /^\/api\/media\/?$/, './functions/api/media.js'],
  ['GET', /^\/api\/download\/?$/, './functions/api/download.js'],
  ['POST', /^\/api\/admin\/login\/?$/, './functions/api/admin/login.js'],
  ['POST', /^\/api\/admin\/logout\/?$/, './functions/api/admin/logout.js'],
  ['GET', /^\/api\/admin\/session\/?$/, './functions/api/admin/session.js'],
  ['GET|POST', /^\/api\/admin\/animations\/?$/, './functions/api/admin/animations/index.js'],
  ['GET|PATCH|DELETE', /^\/api\/admin\/animations\/([^/]+)\/?$/, './functions/api/admin/animations/[id].js'],
  ['POST', /^\/api\/admin\/animations\/([^/]+)\/publish\/?$/, './functions/api/admin/animations/[id]/publish.js'],
  ['POST', /^\/api\/admin\/animations\/([^/]+)\/unpublish\/?$/, './functions/api/admin/animations/[id]/unpublish.js'],
  ['POST', /^\/api\/admin\/animations\/([^/]+)\/upload-url\/?$/, './functions/api/admin/animations/[id]/upload-url.js'],
  ['POST', /^\/api\/admin\/animations\/([^/]+)\/complete-upload\/?$/, './functions/api/admin/animations/[id]/complete-upload.js'],
  ['POST|DELETE', /^\/api\/admin\/animations\/([^/]+)\/media\/(gif|mp4)\/?$/, './functions/api/admin/animations/[id]/media/[format].js'],
  ['GET|PATCH', /^\/api\/admin\/site-config\/([^/]+)\/?$/, './functions/api/admin/site-config/[page].js'],
  ['GET|PATCH', /^\/api\/admin\/global-config\/?$/, './functions/api/admin/global-config.js'],
  ['POST|DELETE', /^\/api\/admin\/site-media\/?$/, './functions/api/admin/site-media.js'],
  ['POST', /^\/api\/admin\/site-media\/cleanup\/?$/, './functions/api/admin/site-media/cleanup.js'],
];

function matchRoute(method, pathname) {
  return routeModules.find(([methods, pattern]) => methods.split('|').includes(method) && pattern.test(pathname));
}

async function readRequestBody(request) {
  if (['GET', 'HEAD'].includes(request.method)) return undefined;
  return request.arrayBuffer();
}

function mediaHeaders(metadata, stat, contentType) {
  const etag = metadata.etag || `"${createHash('sha256').update(`${stat.size}:${stat.mtimeMs}`).digest('hex')}"`;
  return { 'Content-Type': metadata.mimeType || contentType, 'Content-Length': String(stat.size), ETag: etag, 'X-Content-Type-Options': 'nosniff' };
}

async function serveMedia(request, env, download = false) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!isValidMediaKey(key)) return error('A valid media key is required.', 400);
  const object = await env.MEDIA_KV.get(key);
  if (!object) return new Response(JSON.stringify({ error: 'Media file not found.' }), { status: 404, headers: { 'content-type': 'application/json' } });
  const extension = path.extname(key).slice(1).toLowerCase();
  const headers = new Headers(mediaHeaders(object.metadata || {}, object.stat, extension === 'gif' ? 'image/gif' : extension === 'mp4' ? 'video/mp4' : 'application/octet-stream'));
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  if (download) {
    const filename = (url.searchParams.get('filename') || `miyo-animation.${extension}`).replace(/[\u0000-\u001f\\/]+/g, '-').replace(/[^\w. -]/g, '-');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  }
  const range = request.headers.get('range');
  let start = 0; let end = object.stat.size - 1; let status = 200;
  if (range && extension === 'mp4') {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${object.stat.size}` } });
    if (match[1]) start = Number(match[1]);
    if (match[2]) end = Number(match[2]);
    else if (!match[1]) start = Math.max(0, object.stat.size - Number(match[2]));
    else end = object.stat.size - 1;
    if (start > end || start < 0 || end >= object.stat.size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${object.stat.size}` } });
    status = 206; headers.set('Accept-Ranges', 'bytes'); headers.set('Content-Range', `bytes ${start}-${end}/${object.stat.size}`); headers.set('Content-Length', String(end - start + 1));
  }
  if (extension === 'mp4') headers.set('Accept-Ranges', 'bytes');
  const stream = Readable.toWeb(createReadStream(object.file, { start, end }));
  return new Response(stream, { status, headers });
}

export async function createApp(options = {}) {
  const config = { ...getConfig(), ...options };
  const db = options.db || new VpsDatabase(config.dbPath);
  migrateDatabase(db, path.join(root, 'migrations'));
  const media = options.media || createFilesystemMediaStore(config.mediaRoot);
  const env = { DB: db, MEDIA_KV: media, MIYO_PUBLIC_ORIGIN: config.publicOrigin, NODE_ENV: config.nodeEnv, SECURE_COOKIES: config.secureCookies };
  return async (request) => {
    const pathname = new URL(request.url).pathname;
    if (pathname === '/api/media' && request.method === 'GET') return serveMedia(request, env);
    if (pathname === '/api/download' && request.method === 'GET' && new URL(request.url).searchParams.has('key')) return serveMedia(request, env, true);
    const match = matchRoute(request.method, pathname);
    if (!match) return new Response(JSON.stringify({ error: 'Not found.' }), { status: 404, headers: { 'content-type': 'application/json' } });
    const [, , modulePath] = match;
    const module = await import(pathToFileURL(path.join(root, modulePath)).href);
    const captures = pathname.match(match[1]);
    const params = captures ? (modulePath.includes('[format]') ? { id: captures[1], format: captures[2] } : modulePath.includes('[page]') ? { page: captures[1] } : modulePath.includes('[id]') ? { id: captures[1] } : {}) : {};
    return module.onRequest({ request, env, params });
  };
}

export { migrateDatabase, VpsDatabase };
