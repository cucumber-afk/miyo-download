import { mergeGlobalConfig, rowToGlobalConfig } from '../_lib/globalConfig.js';
import { json, methodNotAllowed } from '../_lib/response.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ ...mergeGlobalConfig(), source: 'defaults' }, { headers: { 'cache-control': 'no-store' } });
  const rows = await env.DB.prepare('SELECT * FROM site_global_config').all();
  return json({ ...mergeGlobalConfig((rows.results || []).map(rowToGlobalConfig)), source: 'mixed' }, { headers: { 'cache-control': 'no-store' } });
}

export function onRequest(context) {
  return context.request.method === 'GET' ? onRequestGet(context) : methodNotAllowed(['GET']);
}
