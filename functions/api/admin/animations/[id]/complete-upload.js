import { adminContext, parseJsonRequest } from '../../_lib.js';
import { error, methodNotAllowed } from '../../../../_lib/response.js';

export async function onRequestPost({ request, env }) {
  const context = await adminContext(request, env);
  if (context.response) return context.response;
  const input = await parseJsonRequest(request);
  if (!['gif', 'mp4'].includes(input?.format)) return error('Unsupported media format.', 422);
  return error('Binary uploads are disabled in static media mode. Enter a Pages asset path instead.', 410);
}

export function onRequest(context) { return context.request.method === 'POST' ? onRequestPost(context) : methodNotAllowed(['POST']); }
