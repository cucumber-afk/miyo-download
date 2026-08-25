import { adminContext, parseJsonRequest } from './_lib.js';
import { defaultGlobalConfig, mergeGlobalConfig, rowToGlobalConfig, sanitizeGlobalConfig } from '../../_lib/globalConfig.js';
import { GLOBAL_CONFIG_KEYS } from '../../_lib/globalConfigDefaults.js';
import { error, json, methodNotAllowed } from '../../_lib/response.js';
import { createMediaStore } from '../../_lib/media-store.js';
import { collectReferencedSiteMediaKeysFromRows, collectReferencedSiteMediaKeysFromGlobalConfigRows } from '../../_lib/siteMediaRefCollector.js';

async function load(env) {
  if (!env.DB) return defaultGlobalConfig();
  const rows = await env.DB.prepare('SELECT * FROM site_global_config').all();
  return mergeGlobalConfig((rows.results || []).map(rowToGlobalConfig));
}

export async function onRequestGet({ request, env }) {
  const auth = await adminContext(request, env);
  if (auth.response) return auth.response;
  return json({ ...await load(env), source: env.DB ? 'mixed' : 'defaults' });
}

export async function onRequestPatch({ request, env }) {
  const auth = await adminContext(request, env);
  if (auth.response) return auth.response;
  const payload = await parseJsonRequest(request);
  if (!payload || typeof payload !== 'object') return error('Invalid request body.', 400);
  if (!env.DB) return error('D1 binding is not configured.', 503);
  const current = await load(env);
  const incoming = payload.config && typeof payload.config === 'object' ? payload.config : payload;
  const statements = [];
  const savedAt = new Date().toISOString();
  for (const key of Object.keys(incoming)) {
    if (!GLOBAL_CONFIG_KEYS.includes(key)) return error(`Unknown global config key '${key}'.`, 400);
  }
  for (const key of GLOBAL_CONFIG_KEYS) {
    if (incoming[key] === undefined) continue;
    const sanitized = sanitizeGlobalConfig(key, incoming[key]);
    if (!sanitized) return error(`Unknown global config key '${key}'.`, 400);
    const previous = current[key] || {};
    const merged = {
      content: { ...(previous.content || {}), ...sanitized.content },
      design: { ...(previous.design || {}), ...sanitized.design },
      media: { ...(previous.media || {}), ...sanitized.media },
    };
    statements.push(env.DB.prepare(`INSERT INTO site_global_config (id, config_key, content_json, design_json, media_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(config_key) DO UPDATE SET content_json = excluded.content_json, design_json = excluded.design_json, media_json = excluded.media_json, updated_at = excluded.updated_at`).bind(crypto.randomUUID(), key, JSON.stringify(merged.content), JSON.stringify(merged.design), JSON.stringify(merged.media), savedAt, savedAt));
  }
  if (!statements.length) return error('Body must include at least one global config key.', 400);
  await env.DB.batch(statements);

  // Reference-aware orphan cleanup for site media keys
  if (env.MEDIA_KV) {
    try {
      const store = createMediaStore(env.MEDIA_KV);
      const extractKeys = (obj, acc) => {
        if (!obj || typeof obj !== 'object') return;
        for (const v of Object.values(obj)) {
          if (typeof v === 'string' && v.startsWith('site/')) acc.add(v);
          else if (Array.isArray(v)) v.forEach((i) => extractKeys(i, acc));
          else if (v && typeof v === 'object') extractKeys(v, acc);
        }
      };
      const oldKeys = new Set();
      for (const key of GLOBAL_CONFIG_KEYS) {
        if (current[key]) extractKeys(current[key], oldKeys);
      }
      const newKeys = new Set();
      for (const key of Object.keys(incoming)) {
        if (incoming[key]) extractKeys(incoming[key], newKeys);
      }
      const removedKeys = [...oldKeys].filter((k) => !newKeys.has(k));
      if (removedKeys.length > 0) {
        const pageRows = (await env.DB.prepare('SELECT * FROM site_page_sections').all()).results || [];
        const globalRows = (await env.DB.prepare('SELECT * FROM site_global_config').all()).results || [];
        const referencedKeys = new Set();
        for (const k of collectReferencedSiteMediaKeysFromRows(pageRows)) referencedKeys.add(k);
        for (const k of collectReferencedSiteMediaKeysFromGlobalConfigRows(globalRows)) referencedKeys.add(k);
        for (const key of removedKeys) {
          if (!referencedKeys.has(key)) {
            try { await store.delete(key); } catch (_) {}
          }
        }
      }
    } catch (_) {}
  }

  const result = await load(env);
  return json({ ...result, actor: auth.identity.email });
}

export function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  if (context.request.method === 'PATCH') return onRequestPatch(context);
  return methodNotAllowed(['GET', 'PATCH']);
}
