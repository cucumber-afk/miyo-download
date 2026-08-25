import { adminContext } from '../../../_lib.js';
import { createMediaStore, createMediaKey, contentTypeFor, isMediaFormat, mediaLimits, previewUrlFor, downloadUrlFor, safeFileName, validateMediaBytes } from '../../../../../_lib/media-store.js';
import { error, json, methodNotAllowed } from '../../../../../_lib/response.js';

export async function onRequestPost({ params, request, env }) {
  const context = await adminContext(request, env);
  if (context.response) return context.response;
  if (!env.MEDIA_KV) return error('Media storage is not configured.', 503);
  const format = params.format;
  if (!isMediaFormat(format)) return error('Unsupported media format.', 400);
  const row = await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first();
  if (!row) return error('Animation not found.', 404);
  const encodedName = request.headers.get('X-File-Name') || '';
  let fileName = encodedName;
  try { fileName = decodeURIComponent(encodedName); } catch { /* Preserve legacy ASCII header values. */ }
  const contentType = request.headers.get('Content-Type') || '';
  const bytes = await request.arrayBuffer();
  const validation = validateMediaBytes(format, fileName, contentType, bytes);
  if (validation) return error(validation.message, validation.status);
  const mediaKey = createMediaKey(params.id, format);
  const now = new Date().toISOString();
  const oldKey = row[`${format}_object_key`];
  const store = createMediaStore(env.MEDIA_KV);
  const metadata = { originalFileName: safeFileName(fileName, format), mimeType: contentTypeFor(format), fileSize: bytes.byteLength, animationId: params.id, format, uploadedAt: now };
  try {
    await store.put({ key: mediaKey, body: bytes, contentType, metadata });
    const column = format === 'gif' ? 'gif' : 'mp4';
    await env.DB.prepare(`UPDATE animations SET ${column}_object_key = ?, ${column}_url = ?, ${column}_file_name = ?, ${column}_file_size = ?, updated_at = ? WHERE id = ?`).bind(mediaKey, previewUrlFor(mediaKey), metadata.originalFileName, bytes.byteLength, now, params.id).run();
    if (oldKey) {
      try { await store.delete(oldKey); } catch (cleanupError) { console.error('replaced media cleanup failed', { animationId: params.id, key: oldKey, cleanupError }); }
    }
  } catch (caughtError) {
    console.error('media upload failed', caughtError);
    try { await store.delete(mediaKey); } catch (cleanupError) { console.error('uploaded media cleanup failed', cleanupError); }
    return error('Media upload could not be completed.', 500);
  }
  return json({ format, mediaKey, fileName: metadata.originalFileName, fileSize: bytes.byteLength, mimeType: contentType, previewUrl: previewUrlFor(mediaKey), downloadUrl: downloadUrlFor(mediaKey, metadata.originalFileName) }, { status: 201 });
}

export async function onRequestDelete({ params, request, env }) {
  const context = await adminContext(request, env);
  if (context.response) return context.response;
  if (!env.MEDIA_KV) return error('Media storage is not configured.', 503);
  const format = params.format;
  if (!isMediaFormat(format)) return error('Unsupported media format.', 400);
  const row = await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first();
  if (!row) return error('Animation not found.', 404);
  const keyColumn = `${format}_object_key`;
  const key = row[keyColumn];
  if (key) {
    try { await createMediaStore(env.MEDIA_KV).delete(key); } catch (caughtError) { console.error('media remove failed', caughtError); return error('Media file could not be removed.', 500); }
  }
  const column = format === 'gif' ? 'gif' : 'mp4';
  await env.DB.prepare(`UPDATE animations SET ${column}_object_key = NULL, ${column}_url = NULL, ${column}_file_name = NULL, ${column}_file_size = NULL, updated_at = ? WHERE id = ?`).bind(new Date().toISOString(), params.id).run();
  return json({ removed: true, format });
}

export function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  if (context.request.method === 'DELETE') return onRequestDelete(context);
  return methodNotAllowed(['POST', 'DELETE']);
}
