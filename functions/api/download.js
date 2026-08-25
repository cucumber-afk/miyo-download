import { createMediaStore, isMediaKey } from '../_lib/media-store.js';
import { error, methodNotAllowed } from '../_lib/response.js';

function sanitizeFileName(value, extension) {
  const name = String(value || '').normalize('NFC').replace(/[\u0000-\u001F\u007F]/g, '').replace(/[\\/]+/g, '-').replace(/^\.+/, '').trim();
  if (!name) return `miyo-animation.${extension}`;
  const withoutExtension = name.replace(/\.(gif|mp4)$/i, '');
  return `${withoutExtension || 'miyo-animation'}.${extension}`;
}

function asciiFallback(fileName) {
  const extension = /\.(gif|mp4)$/i.exec(fileName)?.[0].toLowerCase() || '';
  const baseName = extension ? fileName.slice(0, -extension.length) : fileName;
  const fallback = baseName.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^[._-]+|[._-]+$/g, '');
  return `${fallback || 'miyo-animation'}${extension}`;
}

function attachmentHeader(fileName) {
  const encoded = encodeURIComponent(fileName).replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${asciiFallback(fileName)}"; filename*=UTF-8''${encoded}`;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (isMediaKey(key)) {
    if (!env.MEDIA_KV) return error('Media storage is not configured.', 503);
    const object = await createMediaStore(env.MEDIA_KV).get(key);
    if (!object?.value) return error('Media file not found.', 404);
    const extension = key.split('.').pop().toLowerCase();
    const fileName = sanitizeFileName(url.searchParams.get('filename'), extension);
    const metadata = object.metadata || {};
    const headers = new Headers({ 'Content-Type': metadata.mimeType || (extension === 'gif' ? 'image/gif' : 'video/mp4'), 'Content-Disposition': attachmentHeader(fileName), 'X-Content-Type-Options': 'nosniff' });
    if (metadata.fileSize) headers.set('Content-Length', String(metadata.fileSize));
    return new Response(object.value, { status: 200, headers });
  }
  return legacyDownload(request, env);
}

async function legacyDownload(request, env) {
  const requestUrl = new URL(request.url);
  const mediaPath = requestUrl.searchParams.get('url');
  const requestedFileName = requestUrl.searchParams.get('filename');
  const match = /^\/assets\/animations\/library\/[A-Za-z0-9][A-Za-z0-9._-]*\.(gif|mp4)$/i.exec(mediaPath || '');
  if (!match || !requestedFileName) return error('A valid media key and filename are required.', 400);
  const extension = match[1].toLowerCase();
  const assetResponse = await env.ASSETS.fetch(new Request(new URL(mediaPath, 'https://assets.local')));
  if (!assetResponse.ok) return error('Media file not found.', 404);
  const fileName = sanitizeFileName(requestedFileName, extension);
  const headers = new Headers({ 'Content-Type': extension === 'gif' ? 'image/gif' : 'video/mp4', 'Content-Disposition': attachmentHeader(fileName), 'X-Content-Type-Options': 'nosniff' });
  for (const header of ['Cache-Control', 'Content-Length', 'ETag']) { const value = assetResponse.headers.get(header); if (value) headers.set(header, value); }
  return new Response(assetResponse.body, { status: 200, headers });
}

export function onRequest(context) {
  return context.request.method === 'GET' ? onRequestGet(context) : methodNotAllowed(['GET']);
}
