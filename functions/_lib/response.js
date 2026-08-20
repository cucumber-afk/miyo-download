export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) },
  });
}

export function error(message, status = 400, details) {
  return json({ error: message, ...(details ? { details } : {}) }, { status });
}

export function methodNotAllowed(methods) {
  return error(`Method not allowed. Use ${methods.join(', ')}.`, 405, { allow: methods });
}
