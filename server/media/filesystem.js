import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isValidMediaKey } from '../../functions/_lib/media-store.js';

function safePath(root, key) {
  if (!isValidMediaKey(key) || key.includes('\\') || key.includes('..') || path.isAbsolute(key)) throw new Error('Invalid media key.');
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, ...key.split('/'));
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error('Invalid media key.');
  return resolved;
}

function metadataPath(file) { return `${file}.json`; }

export class FilesystemMediaStore {
  constructor(root) { this.root = path.resolve(root); }

  async put({ key, body, contentType, metadata = {} }) {
    const destination = safePath(this.root, key);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    const temporary = `${destination}.${process.pid}.${Date.now()}.tmp`;
    const handle = await fs.open(temporary, 'w', 0o640);
    try {
      await handle.writeFile(Buffer.from(body));
      await handle.sync();
    } finally { await handle.close(); }
    await fs.rename(temporary, destination);
    const stat = await fs.stat(destination);
    const record = { ...metadata, mimeType: contentType, fileSize: stat.size, etag: `"${createHash('sha256').update(`${stat.size}:${stat.mtimeMs}`).digest('hex')}"` };
    await fs.writeFile(metadataPath(destination), JSON.stringify(record), { mode: 0o640 });
  }

  async get(key) {
    const file = safePath(this.root, key);
    try {
      const [stat, metadata] = await Promise.all([fs.stat(file), fs.readFile(metadataPath(file), 'utf8').catch(() => '{}')]);
      return { file, stat, metadata: JSON.parse(metadata || '{}') };
    } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }

  async head(key) { return this.get(key); }

  async delete(key) {
    const file = safePath(this.root, key);
    await Promise.all([fs.rm(file, { force: true }), fs.rm(metadataPath(file), { force: true })]);
  }

  async listKeys(prefix = '') {
    const output = [];
    const walk = async (directory, relative) => {
      for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
        if (entry.name.endsWith('.json') || entry.name.endsWith('.tmp')) continue;
        const nextRelative = relative ? `${relative}/${entry.name}` : entry.name;
        const next = path.join(directory, entry.name);
        if (entry.isDirectory()) await walk(next, nextRelative);
        else if (nextRelative.startsWith(prefix)) output.push(nextRelative.replaceAll(path.sep, '/'));
      }
    };
    await walk(this.root, '');
    return output;
  }
}

export function createFilesystemMediaStore(root) {
  const store = new FilesystemMediaStore(root);
  return {
    put: async (keyOrInput, body, options = {}) => {
      if (typeof keyOrInput === 'string') {
        return store.put({ key: keyOrInput, body, contentType: options.metadata?.mimeType || 'application/octet-stream', metadata: options.metadata || {} });
      }
      return store.put(keyOrInput);
    },
    get: async (key) => {
      const result = await store.get(key);
      if (!result) return null;
      return { value: result.file, metadata: result.metadata, stat: result.stat, file: result.file };
    },
    getWithMetadata: async (key) => {
      const result = await store.get(key);
      if (!result) return { value: null, metadata: null };
      return { value: result.file, metadata: result.metadata, stat: result.stat, file: result.file };
    },
    delete: (key) => store.delete(key),
    head: (key) => store.head(key),
    list: async ({ prefix = '' } = {}) => ({ keys: (await store.listKeys(prefix)).map((name) => ({ name })) }),
    listKeys: (prefix) => store.listKeys(prefix),
  };
}

export { safePath };
