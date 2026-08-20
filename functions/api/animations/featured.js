import { toAnimation } from '../../_lib/db.js';
import { error, json, methodNotAllowed } from '../../_lib/response.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ animations: [], source: 'unconfigured' });
  const result = await env.DB.prepare("SELECT * FROM animations WHERE status = 'published' AND featured = 1 ORDER BY published_at DESC, updated_at DESC LIMIT 4").all();
  return json({ animations: result.results.map(toAnimation) });
}

export function onRequest(context) {
  return context.request.method === 'GET' ? onRequestGet(context) : methodNotAllowed(['GET']);
}
