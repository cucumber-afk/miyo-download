import { adminContext as authenticateContext } from '../../_lib/adminAuth.js';
import { error, json } from '../../_lib/response.js';

export async function adminContext(request, env) {
  const auth = await authenticateContext(request, env);
  if (auth.response) return { response: auth.response };
  if (!env.DB) return { response: error('D1 binding is not configured.', 503) };
  return { identity: auth.identity };
}

export function parseJsonRequest(request) {
  return request.json().catch(() => null);
}

export function adminResult(data, identity) {
  return json({ ...data, actor: identity.email });
}
