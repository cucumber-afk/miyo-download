import { adminContext, adminResult, parseJsonRequest } from '../_lib.js';
import { toAnimation } from '../../../_lib/db.js';
import { createMediaStore } from '../../../_lib/media-store.js';
import { parseTags, validateAnimationInput } from '../../../_lib/validation.js';
import { error, methodNotAllowed } from '../../../_lib/response.js';

export async function onRequestGet({ params, request, env }) {
  const context = await adminContext(request, env);
  if (context.response) return context.response;
  const row = await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first();
  return row ? adminResult({ animation: toAnimation(row) }, context.identity) : error('Animation not found.', 404);
}

export async function onRequestPatch({ params, request, env }) {
  const context = await adminContext(request, env);
  if (context.response) return context.response;
  const row = await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first();
  if (!row) return error('Animation not found.', 404);
  const input = await parseJsonRequest(request);
  const normalized = { ...input, tags: input?.tags ? parseTags(input.tags) : JSON.parse(row.tags_json || '[]'), characterColor: input?.characterColor ?? row.character_color, contentScale: input?.contentScale ?? row.content_scale };
  delete normalized.gifPath;
  delete normalized.mp4Path;
  delete normalized.gifFileName;
  delete normalized.mp4FileName;
  delete normalized.gifFileSize;
  delete normalized.mp4FileSize;
  const validation = validateAnimationInput(normalized, { partial: false });
  if (!validation.ok) return error('Invalid animation metadata.', 422, validation.errors);
  const now = new Date().toISOString();
  await env.DB.prepare('UPDATE animations SET title = ?, category = ?, description = ?, tags_json = ?, featured = ?, character_color = ?, content_scale = ?, updated_at = ? WHERE id = ?').bind(normalized.title.trim(), normalized.category, normalized.description?.trim() || '', JSON.stringify(normalized.tags), normalized.featured ? 1 : 0, normalized.characterColor, Number(normalized.contentScale), now, params.id).run();
  const updated = await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first();
  return adminResult({ animation: toAnimation(updated) }, context.identity);
}

export async function onRequestDelete({ params, request, env }) {
  const context = await adminContext(request, env);
  if (context.response) return context.response;
  const row = await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first();
  if (!row) return error('Animation not found.', 404);
  await env.DB.prepare('DELETE FROM animations WHERE id = ?').bind(params.id).run();
  if (env.MEDIA_KV) {
    const store = createMediaStore(env.MEDIA_KV);
    for (const key of [row.gif_object_key, row.mp4_object_key].filter(Boolean)) {
      try { await store.delete(key); } catch (caughtError) { console.error('animation media cleanup failed', { animationId: params.id, key, caughtError }); }
    }
  }
  return adminResult({ deleted: params.id }, context.identity);
}

export function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  if (context.request.method === 'PATCH') return onRequestPatch(context);
  if (context.request.method === 'DELETE') return onRequestDelete(context);
  return methodNotAllowed(['GET', 'PATCH', 'DELETE']);
}
