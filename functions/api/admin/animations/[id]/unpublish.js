import { adminContext, adminResult } from '../../_lib.js';
import { toAnimation } from '../../../../_lib/db.js';
import { error, methodNotAllowed } from '../../../../_lib/response.js';

export async function onRequestPost({ params, request, env }) {
  const context = await adminContext(request, env);
  if (context.response) return context.response;
  const row = await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first();
  if (!row) return error('Animation not found.', 404);
  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE animations SET status = 'draft', updated_at = ? WHERE id = ?").bind(now, params.id).run();
  return adminResult({ animation: toAnimation(await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first()) }, context.identity);
}

export function onRequest(context) { return context.request.method === 'POST' ? onRequestPost(context) : methodNotAllowed(['POST']); }
