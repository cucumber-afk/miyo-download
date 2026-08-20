const baseUrl = process.env.CF_LOCAL_URL || 'http://127.0.0.1:8788';
const results = [];

async function request(path, options = {}) {
  try {
    const response = await fetch(`${baseUrl}${path}`, { headers: { accept: 'application/json', ...(options.headers || {}) }, ...options });
    return { status: response.status, body: await response.text() };
  } catch (error) {
    return { status: 0, body: error.message };
  }
}

function record(name, passed, detail) {
  results.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}: ${detail}`);
}

function isJson(body) {
  try { JSON.parse(body); return true; } catch { return false; }
}

const publicList = await request('/api/animations');
record('GET /api/animations', publicList.status === 200 && isJson(publicList.body), `HTTP ${publicList.status}`);

const featured = await request('/api/animations/featured');
record('GET /api/animations/featured', featured.status === 200 && isJson(featured.body), `HTTP ${featured.status}`);

const session = await request('/api/admin/session');
const sessionBody = JSON.parse(session.body || '{}');
record('Anonymous admin session', session.status === 200 && sessionBody.authenticated === false, `HTTP ${session.status}`);

const protectedOperations = [
  ['list animations', '/api/admin/animations', { method: 'GET' }],
  ['create animation', '/api/admin/animations', { method: 'POST', body: '{}' }],
  ['update animation', '/api/admin/animations/local-mock-id', { method: 'PATCH', body: '{}' }],
  ['publish', '/api/admin/animations/local-mock-id/publish', { method: 'POST' }],
  ['unpublish', '/api/admin/animations/local-mock-id/unpublish', { method: 'POST' }],
  ['delete', '/api/admin/animations/local-mock-id', { method: 'DELETE' }],
];

for (const [operation, path, options] of protectedOperations) {
  const result = await request(path, options);
  record(`Anonymous admin ${operation}`, result.status === 401, `HTTP ${result.status}`);
}

const failed = results.filter((result) => !result.passed);
console.log(`\nLocal session-auth checks ${failed.length ? 'failed' : 'passed'}: ${results.length - failed.length}/${results.length}.`);
console.log('No administrator account or animation records were created.');
process.exitCode = failed.length ? 1 : 0;
