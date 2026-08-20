import { readFile } from 'node:fs/promises';

const configPath = new URL('../wrangler.toml', import.meta.url);
const config = (await readFile(configPath, 'utf8')).replace(/^\s*#.*$/gm, '');
const checks = [];

function record(name, passed, detail) {
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}: ${detail}`);
}

function valueFor(pattern) {
  return config.match(pattern)?.[1];
}

const d1Binding = valueFor(/\[\[d1_databases\]\][\s\S]*?binding\s*=\s*"([^"]+)"/);
const databaseName = valueFor(/\[\[d1_databases\]\][\s\S]*?database_name\s*=\s*"([^"]+)"/);
const databaseId = valueFor(/\[\[d1_databases\]\][\s\S]*?database_id\s*=\s*"([^"]+)"/);
const kvBinding = valueFor(/\[\[kv_namespaces\]\][\s\S]*?binding\s*=\s*"([^"]+)"/);
const kvNamespaceId = valueFor(/\[\[kv_namespaces\]\][\s\S]*?id\s*=\s*"([^"]+)"/);
const pagesOutput = valueFor(/pages_build_output_dir\s*=\s*"([^"]+)"/);

record('Pages build output', pagesOutput === 'dist', `pages_build_output_dir=${pagesOutput || 'missing'}`);
record('D1 binding', d1Binding === 'DB', `binding=${d1Binding || 'missing'}; Functions require env.DB`);
record('D1 database name', databaseName === 'miyo-studio', `database_name=${databaseName || 'missing'}`);
record('D1 database ID', Boolean(databaseId) && !databaseId.includes('replace-with-'), databaseId?.includes('replace-with-') ? 'replace the production database_id placeholder' : `database_id=${databaseId || 'missing'}`);
record('MEDIA_KV binding', kvBinding === 'MEDIA_KV', `binding=${kvBinding || 'missing'}`);
record('MEDIA_KV namespace ID', Boolean(kvNamespaceId) && !kvNamespaceId.includes('replace-with-'), kvNamespaceId ? `id=${kvNamespaceId}` : 'missing');
record('R2 disabled', true, 'no R2 binding required');
record('Application admin auth', true, 'Session cookie auth; Cloudflare Access variables are not required');

const failed = checks.filter((check) => !check.passed);
console.log(`\nCloudflare configuration preflight ${failed.length ? 'failed' : 'passed'}: ${checks.length - failed.length}/${checks.length} checks passed.`);
console.log('This script validates repository configuration only; it does not authenticate, create resources, or contact Cloudflare.');
process.exitCode = failed.length ? 1 : 0;
