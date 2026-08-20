import { authenticateAdmin } from '../../_lib/adminAuth.js';
import { json } from '../../_lib/response.js';

export async function onRequestGet({ request, env }) {
  const auth = await authenticateAdmin(request, env);
  if (auth.identity) return json({ authenticated: true, email: auth.identity.email });
  return json({ authenticated: false });
}

export function onRequest(context) { return context.request.method === 'GET' ? onRequestGet(context) : new Response('Method not allowed.', { status: 405 }); }
