import { error, methodNotAllowed } from '../_lib/response.js';

const MEDIA_PREFIX = '/assets/animations/library/';
const MEDIA_PATH = /^\/assets\/animations\/library\/[A-Za-z0-9][A-Za-z0-9._-]*\.(gif|mp4)$/i;
const MEDIA_TYPES = { gif: 'image/gif', mp4: 'video/mp4' };

function validateMediaPath(value) {
  if (!value || !MEDIA_PATH.test(value) || !value.startsWith(MEDIA_PREFIX)) return null;
  return value;
}

function sanitizeFileName(value, extension) {
  const name = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[._-]+|[._-]+$/g, '');
  if (!name) return null;
  const withoutExtension = name.replace(/\.(gif|mp4)$/i, '');
  return `${withoutExtension}.${extension}`;
}

function attachmentHeader(fileName) {
  const encoded = encodeURIComponent(fileName).replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${fileName}"; filename*=UTF-8''${encoded}`;
}

export async function onRequestGet({ request, env }) {
  const requestUrl = new URL(request.url);
  const mediaPath = validateMediaPath(requestUrl.searchParams.get('url'));
  const requestedFileName = requestUrl.searchParams.get('filename');
  if (!mediaPath || !requestedFileName) return error('A valid media URL and filename are required.', 400);

  const extension = mediaPath.split('.').pop().toLowerCase();
  const fileName = sanitizeFileName(requestedFileName, extension);
  if (!fileName) return error('A valid filename is required.', 400);

  const assetUrl = new URL(mediaPath, 'https://assets.local');
  const expectedContentType = MEDIA_TYPES[extension];
  const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, { method: 'GET' }));
  if (!assetResponse.ok || assetResponse.headers.get('Content-Type')?.split(';', 1)[0] !== expectedContentType) {
    return error('Media file not found.', 404);
  }

  const headers = new Headers({
    'Content-Type': expectedContentType,
    'Content-Disposition': attachmentHeader(fileName),
    'X-Content-Type-Options': 'nosniff',
  });
  for (const header of ['Cache-Control', 'Content-Length', 'ETag']) {
    const value = assetResponse.headers.get(header);
    if (value) headers.set(header, value);
  }

  return new Response(assetResponse.body, { status: 200, headers });
}

export function onRequest(context) {
  return context.request.method === 'GET' ? onRequestGet(context) : methodNotAllowed(['GET']);
}
