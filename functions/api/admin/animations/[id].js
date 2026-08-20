import { adminContext, adminResult, parseJsonRequest } from '../_lib.js';
import { toAnimation } from '../../../_lib/db.js';
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
  const normalized = { ...input, tags: input?.tags ? parseTags(input.tags) : JSON.parse(row.tags_json || '[]'), characterColor: input?.characterColor ?? row.character_color, contentScale: input?.contentScale ?? row.content_scale, gifPath: input?.gifPath ?? row.gif_url ?? '', mp4Path: input?.mp4Path ?? row.mp4_url ?? '', gifFileName: input?.gifFileName ?? row.gif_file_name ?? '', mp4FileName: input?.mp4FileName ?? row.mp4_file_name ?? '', gifFileSize: input?.gifFileSize ?? row.gif_file_size ?? '', mp4FileSize: input?.mp4FileSize ?? row.mp4_file_size ?? '' };
  const validation = validateAnimationInput(normalized, { partial: false });
  if (!validation.ok) return error('Invalid animation metadata.', 422, validation.errors);
  const now = new Date().toISOString();
  await env.DB.prepare('UPDATE animations SET title = ?, category = ?, description = ?, tags_json = ?, featured = ?, character_color = ?, content_scale = ?, gif_url = ?, gif_file_name = ?, gif_file_size = ?, mp4_url = ?, mp4_file_name = ?, mp4_file_size = ?, updated_at = ? WHERE id = ?').bind(normalized.title.trim(), normalized.category, normalized.description?.trim() || '', JSON.stringify(normalized.tags), normalized.featured ? 1 : 0, normalized.characterColor, Number(normalized.contentScale), normalized.gifPath || null, normalized.gifFileName || null, normalized.gifFileSize === '' ? null : Number(normalized.gifFileSize || 0) || null, normalized.mp4Path || null, normalized.mp4FileName || null, normalized.mp4FileSize === '' ? null : Number(normalized.mp4FileSize || 0) || null, now, params.id).run();
  const updated = await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first();
  return adminResult({ animation: toAnimation(updated) }, context.identity);
}

export async function onRequestDelete({ params, request, env }) {
  const context = await adminContext(request, env);
  if (context.response) return context.response;
  const row = await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(params.id).first();
  if (!row) return error('Animation not found.', 404);
  await env.DB.prepare('DELETE FROM animations WHERE id = ?').bind(params.id).run();
  return adminResult({ deleted: params.id }, context.identity);
}

export function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  if (context.request.method === 'PATCH') return onRequestPatch(context);
  if (context.request.method === 'DELETE') return onRequestDelete(context);
  return methodNotAllowed(['GET', 'PATCH', 'DELETE']);
}
