import { buildPublicQuery } from '../../_lib/publicQuery.js';
import { toAnimation } from '../../_lib/db.js';
import { error, json, methodNotAllowed } from '../../_lib/response.js';

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ animations: [], source: 'unconfigured' });
  const query = buildPublicQuery(new URL(request.url));
  const result = await env.DB.prepare(`SELECT * FROM animations WHERE ${query.where} ORDER BY ${query.order} LIMIT ?`).bind(...query.bindings, query.limit).all();
  return json({ animations: result.results.map(toAnimation), count: result.results.length });
}

export function onRequest(context) {
  return context.request.method === 'GET' ? onRequestGet(context) : methodNotAllowed(['GET']);
}
