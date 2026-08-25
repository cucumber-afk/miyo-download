import { createMediaStore, isValidMediaKey } from '../_lib/media-store.js';
import { error, methodNotAllowed } from '../_lib/response.js';

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get('key');
  if (!isValidMediaKey(key)) return error('A valid media key is required.', 400);
  if (!env.MEDIA_KV) return error('Media storage is not configured.', 503);
  const object = await createMediaStore(env.MEDIA_KV).get(key);
  if (!object?.value) return error('Media file not found.', 404);
  const metadata = object.metadata || {};
  const headers = new Headers({
    'Content-Type': metadata.mimeType || 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });
  if (metadata.fileSize) headers.set('Content-Length', String(metadata.fileSize));
  return new Response(object.value, { headers });
}

export function onRequest(context) {
  return context.request.method === 'GET' ? onRequestGet(context) : methodNotAllowed(['GET']);
}
