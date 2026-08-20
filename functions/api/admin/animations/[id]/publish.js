import { adminContext, adminResult } from '../../_lib.js';
import { canPublish } from '../../../../_lib/adminValidation.js';
import { toAnimation } from '../../../../_lib/db.js';
import { error, methodNotAllowed } from '../../../../_lib/response.js';

export async function onRequestPost({ params, request, env }) {
  const context = await adminContext(request, env);
  if (context.response) return context.response;
  const row = await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first();
  if (!row) return error('Animation not found.', 404);
  if (!canPublish(row)) return error('Animation needs a title, category, character color, and at least one uploaded media format before publishing.', 422);
  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE animations SET status = 'published', published_at = COALESCE(published_at, ?), updated_at = ? WHERE id = ?").bind(now, now, params.id).run();
  return adminResult({ animation: toAnimation(await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first()) }, context.identity);
}

export function onRequest(context) { return context.request.method === 'POST' ? onRequestPost(context) : methodNotAllowed(['POST']); }
