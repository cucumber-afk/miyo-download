import { execFileSync } from 'node:child_process';
import { webcrypto } from 'node:crypto';

const PBKDF2_ITERATIONS = 100000;
const args = process.argv.slice(2);

if (args.includes('--help')) {
  console.log('Usage: MIYO_ADMIN_PASSWORD=<password> npm run admin:create -- --email admin@example.com');
  process.exit(0);
}

const emailIndex = args.indexOf('--email');
const email = (emailIndex >= 0 ? args[emailIndex + 1] : args.find((argument) => argument.startsWith('--email='))?.slice(8))?.trim().toLowerCase();
const password = process.env.MIYO_ADMIN_PASSWORD;

function bytesToBase64(bytes) { return Buffer.from(bytes).toString('base64'); }
async function hashPassword(value, salt) {
  const key = await webcrypto.subtle.importKey('raw', Buffer.from(value), 'PBKDF2', false, ['deriveBits']);
  const bits = await webcrypto.subtle.deriveBits({ name: 'PBKDF2', salt: Buffer.from(salt, 'base64'), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256);
  return bytesToBase64(Buffer.from(bits));
}

if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Usage: npm run admin:create -- --email admin@example.com');
if (!password) throw new Error('Set MIYO_ADMIN_PASSWORD before running this command. The password is never printed or written to disk.');
const salt = bytesToBase64(webcrypto.getRandomValues(new Uint8Array(16)));
const hash = await hashPassword(password, salt);
const id = webcrypto.randomUUID();
const now = new Date().toISOString();
const escapedEmail = email.replaceAll("'", "''");
const sql = `INSERT INTO admins (id, email, password_hash, password_salt, password_iterations, created_at, updated_at) VALUES ('${id}', '${escapedEmail}', '${hash}', '${salt}', ${PBKDF2_ITERATIONS}, '${now}', '${now}') ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash, password_salt=excluded.password_salt, password_iterations=excluded.password_iterations, updated_at=excluded.updated_at;`;
const wranglerArguments = ['exec', '--', 'wrangler', 'd1', 'execute', 'miyo-studio', '--remote', '--command', sql];
try {
  execFileSync(process.execPath, [process.env.npm_execpath, ...wranglerArguments], { stdio: 'inherit' });
} catch {
  throw new Error('Failed to execute Wrangler for the remote admin update.');
}
console.log(`Admin account updated for ${email}.`);
console.log('Clear MIYO_ADMIN_PASSWORD from the environment now.');
