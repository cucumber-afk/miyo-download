import { loginAdmin } from '../../_lib/adminAuth.js';
import { parseJsonRequest } from './_lib.js';
import { error, methodNotAllowed } from '../../_lib/response.js';

export async function onRequestPost({ request, env }) {
  if (!env.DB) return error('D1 binding is not configured.', 503);
  try {
    const input = await parseJsonRequest(request);
    if (!input || typeof input !== 'object' || Array.isArray(input)) return error('Invalid JSON body.', 400);
    return await loginAdmin(request, env, input);
  } catch (exception) {
    console.error('Admin login failed:', exception);
    return error('Internal server error.', 500);
  }
}

export function onRequest(context) { return context.request.method === 'POST' ? onRequestPost(context) : methodNotAllowed(['POST']); }
