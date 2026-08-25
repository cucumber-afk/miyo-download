import { adminContext } from '../_lib.js';
import { createMediaStore, getUploadedAt } from '../../../_lib/media-store.js';
import { collectReferencedSiteMediaKeysFromRows, collectReferencedSiteMediaKeysFromGlobalConfigRows } from '../../../_lib/siteMediaRefCollector.js';
import { error, json, methodNotAllowed } from '../../../_lib/response.js';

const ORPHAN_AGE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export async function onRequestPost({ request, env }) {
  const auth = await adminContext(request, env);
  if (auth.response) return auth.response;
  if (!env.DB) return error('D1 binding is not configured.', 503);
  if (!env.MEDIA_KV) return error('Media storage is not configured.', 503);

  const store = createMediaStore(env.MEDIA_KV);

  const sitePrefix = 'site/';
  const animationPrefix = 'animations/';

  let allKeys;
  try {
    allKeys = await store.listKeys(sitePrefix);
  } catch (e) {
    return error('Could not list KV keys.', 500);
  }

  const referencedKeys = new Set();
  const pageRows = (await env.DB.prepare('SELECT * FROM site_page_sections').all()).results || [];
  const globalRows = (await env.DB.prepare('SELECT * FROM site_global_config').all()).results || [];

  for (const key of collectReferencedSiteMediaKeysFromRows(pageRows)) referencedKeys.add(key);
  for (const key of collectReferencedSiteMediaKeysFromGlobalConfigRows(globalRows)) referencedKeys.add(key);

  const now = Date.now();
  let scanned = 0;
  let eligible = 0;
  let deleted = 0;
  let failed = 0;
  const errors = [];

  for (const key of allKeys) {
    if (!key.startsWith(sitePrefix) || key.startsWith(animationPrefix)) continue;
    scanned++;

    if (referencedKeys.has(key)) continue;

    const obj = await store.head(key);
    const uploadedAt = getUploadedAt(obj && obj.metadata);

    if (uploadedAt === null) continue;

    const age = now - uploadedAt;
    if (age < ORPHAN_AGE_THRESHOLD_MS) continue;

    eligible++;
    try {
      await store.delete(key);
      deleted++;
    } catch (e) {
      failed++;
      errors.push({ key, reason: String(e && e.message ? e.message : e) });
    }
  }

  return json({ scanned, referenced: referencedKeys.size, eligible, deleted, failed, errors: errors.slice(0, 10) });
}

export function onRequest(context) {
  return context.request.method === 'POST' ? onRequestPost(context) : methodNotAllowed(['POST']);
}
