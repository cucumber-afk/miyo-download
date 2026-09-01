import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

export function getConfig(env = process.env) {
  const isProduction = env.NODE_ENV === 'production';
  return {
    nodeEnv: env.NODE_ENV || 'development',
    host: env.HOST || '127.0.0.1',
    port: Number(env.PORT || 3000),
    dbPath: env.MIYO_DB_PATH || path.join(projectRoot, '.local', 'miyo.sqlite'),
    mediaRoot: env.MIYO_MEDIA_ROOT || path.join(projectRoot, '.local', 'media'),
    publicOrigin: env.MIYO_PUBLIC_ORIGIN || `http://127.0.0.1:${env.PORT || 3000}`,
    secureCookies: isProduction,
  };
}
