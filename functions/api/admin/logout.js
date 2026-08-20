import { logoutAdmin } from '../../_lib/adminAuth.js';
import { error, methodNotAllowed } from '../../_lib/response.js';

export async function onRequestPost({ request, env }) {
  if (!env.DB) return error('D1 binding is not configured.', 503);
  return logoutAdmin(request, env);
}

export function onRequest(context) { return context.request.method === 'POST' ? onRequestPost(context) : methodNotAllowed(['POST']); }
