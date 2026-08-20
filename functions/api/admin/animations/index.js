import { adminContext, adminResult, parseJsonRequest } from '../_lib.js';
import { animationParams, toAnimation } from '../../../_lib/db.js';
import { slugify, parseTags, validateAnimationInput } from '../../../_lib/validation.js';
import { error, methodNotAllowed } from '../../../_lib/response.js';

export async function onRequestGet({ request, env }) {
  const context = await adminContext(request, env);
  if (context.response) return context.response;
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const query = url.searchParams.get('q');
  const clauses = ['1 = 1'];
  const bindings = [];
  if (status === 'draft' || status === 'published') { clauses.push('status = ?'); bindings.push(status); }
  if (query) { clauses.push('(title LIKE ? OR slug LIKE ? OR description LIKE ?)'); const term = `%${query}%`; bindings.push(term, term, term); }
  const rows = await env.DB.prepare(`SELECT * FROM animations WHERE ${clauses.join(' AND ')} ORDER BY updated_at DESC LIMIT 100`).bind(...bindings).all();
  return adminResult({ animations: rows.results.map(toAnimation) }, context.identity);
}

export async function onRequestPost({ request, env }) {
  const context = await adminContext(request, env);
  if (context.response) return context.response;
  const input = await parseJsonRequest(request);
  const validation = validateAnimationInput(input || {});
  if (!validation.ok) return error('Invalid animation metadata.', 422, validation.errors);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const slug = `${slugify(input.title)}-${id.slice(0, 8)}`;
  const values = { ...input, slug, tags: parseTags(input.tags), characterColor: input.characterColor || 'gray', contentScale: Number(input.contentScale || 1) };
  try {
    await env.DB.prepare('INSERT INTO animations (id, slug, title, category, description, tags_json, featured, character_color, content_scale, gif_url, gif_file_name, gif_file_size, mp4_url, mp4_file_name, mp4_file_size, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, ...animationParams(values), values.gifPath || null, values.gifFileName || null, values.gifFileSize === '' ? null : Number(values.gifFileSize || 0) || null, values.mp4Path || null, values.mp4FileName || null, values.mp4FileSize === '' ? null : Number(values.mp4FileSize || 0) || null, 'draft', now, now).run();
    const row = await env.DB.prepare('SELECT * FROM animations WHERE id = ?').bind(id).first();
    return adminResult({ animation: toAnimation(row) }, context.identity);
  } catch (caughtError) {
    console.error('admin animation create failed', caughtError);
    return error('Failed to create animation.', 500);
  }
}

export function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  if (context.request.method === 'POST') return onRequestPost(context);
  return methodNotAllowed(['GET', 'POST']);
}
