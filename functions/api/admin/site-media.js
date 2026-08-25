import { createMediaStore, createSiteMediaKey, isSiteMediaFormat, validateSiteMediaBytes, buildSiteMediaMetadata } from '../../_lib/media-store.js';
import { isSiteMediaKey } from '../../_lib/media-store.js';
import { adminContext } from './_lib.js';
import { error, json, methodNotAllowed } from '../../_lib/response.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const admin = await adminContext(request, env);
  if (admin.response) return admin.response;

  if (!env.MEDIA_KV) return error('Media storage is not configured.', 503);

  let body;
  try {
    body = await request.formData();
  } catch {
    return error('Invalid form data.', 400);
  }

  const file = body.get('file');
  if (!file || typeof file === 'string') return error('File is required.', 400);
  const requestedSection = body.get('section');
  const section = ['everyday', 'mood', 'seasonal', 'special', 'support/video', 'support/poster'].includes(requestedSection)
    ? requestedSection
    : requestedSection === 'navigation' || requestedSection === 'footer' || requestedSection === 'seo' ? `global/${requestedSection}` : 'hero';

  const fileName = file.name || '';
  const contentType = file.type || 'application/octet-stream';
  let bytes;
  try {
    bytes = await file.arrayBuffer();
  } catch {
    return error('Could not read file.', 400);
  }

  const lastDot = fileName.lastIndexOf('.');
  const format = lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';

  if (!isSiteMediaFormat(format)) {
    return error(`Unsupported file type: .${format}. Supported: png, jpg, jpeg, webp, gif, mp4.`, 400);
  }
  if (['everyday', 'mood', 'seasonal', 'special', 'support/poster'].includes(requestedSection) && format === 'mp4') {
    return error('This image namespace does not support MP4 uploads.', 400);
  }
  if (requestedSection === 'support/video' && format !== 'mp4') return error('Support video uploads must be MP4.', 400);
  if (requestedSection === 'support/poster' && !['png', 'jpg', 'jpeg', 'webp'].includes(format)) return error('Support posters must be PNG, JPG, JPEG, or WEBP.', 400);

  const validation = validateSiteMediaBytes(format, fileName, contentType, bytes);
  if (validation) return error(validation.message, validation.status);

  const mediaKey = createSiteMediaKey(section, format);
  const store = createMediaStore(env.MEDIA_KV);
  const metadata = buildSiteMediaMetadata({ originalFileName: fileName, mimeType: contentType });
  await store.put({ key: mediaKey, body: bytes, contentType, metadata });

  return json({ mediaKey, format });
}

async function onRequestDelete(context) {
  const { request, env } = context;
  const admin = await adminContext(request, env);
  if (admin.response) return admin.response;
  if (!env.MEDIA_KV) return error('Media storage is not configured.', 503);

  let payload;
  try { payload = await request.json(); } catch { return error('Invalid JSON.', 400); }
  const key = typeof payload?.key === 'string' ? payload.key : null;

  if (!key) return error('Missing key.', 400);
  // Only allow deletion of site/* keys (NOT animations/*)
  if (!isSiteMediaKey(key)) return error('Only site/* media keys may be deleted via this endpoint.', 403);

  try {
    await env.MEDIA_KV.delete(key);
  } catch (e) {
    return error('Could not delete media.', 500);
  }
  return json({ deleted: key });
}

export function onRequest(context) {
  const { request } = context;
  if (request.method === 'POST') return onRequestPost(context);
  if (request.method === 'DELETE') return onRequestDelete(context);
  return methodNotAllowed(['POST', 'DELETE']);
}
