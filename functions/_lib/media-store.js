const MEDIA_PREFIX = 'animations/';
const MEDIA_TYPES = { gif: 'image/gif', mp4: 'video/mp4' };

export const mediaLimits = { gif: 8 * 1024 * 1024, mp4: 20 * 1024 * 1024 };

export function isMediaFormat(value) {
  return value === 'gif' || value === 'mp4';
}

export function contentTypeFor(format) {
  return MEDIA_TYPES[format];
}

export function isMediaKey(value) {
  return typeof value === 'string'
    && value.startsWith(MEDIA_PREFIX)
    && /^animations\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(gif|mp4)$/i.test(value);
}

export function previewUrlFor(key) {
  return `/api/media?${new URLSearchParams({ key })}`;
}

export function downloadUrlFor(key, fileName) {
  return `/api/download?${new URLSearchParams({ key, filename: fileName })}`;
}

export function safeFileName(value, format) {
  const normalized = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[._-]+|[._-]+$/g, '')
    .slice(0, 180);
  if (!normalized || !normalized.toLowerCase().endsWith(`.${format}`)) return null;
  return normalized;
}

export function createMediaKey(animationId, format) {
  return `animations/${animationId}/${crypto.randomUUID()}.${format}`;
}

export function validateMediaBytes(format, fileName, contentType, bytes) {
  if (!isMediaFormat(format)) return { status: 400, message: 'Unsupported media format.' };
  if (!safeFileName(fileName, format)) return { status: 400, message: `File name must end in .${format}.` };
  if (contentType !== contentTypeFor(format)) return { status: 415, message: `Content-Type must be ${contentTypeFor(format)}.` };
  if (bytes.byteLength < 1) return { status: 400, message: 'Media file is empty.' };
  if (bytes.byteLength > mediaLimits[format]) return { status: 413, message: `${format.toUpperCase()} files may not exceed ${mediaLimits[format]} bytes.` };
  const view = new Uint8Array(bytes);
  const isGif = view.length >= 6 && ['GIF87a', 'GIF89a'].includes(new TextDecoder().decode(view.slice(0, 6)));
  const isMp4 = view.length >= 12 && new TextDecoder().decode(view.slice(4, 8)) === 'ftyp';
  if ((format === 'gif' && !isGif) || (format === 'mp4' && !isMp4)) return { status: 415, message: `File content is not a valid ${format.toUpperCase()} media stream.` };
  return null;
}

export function createMediaStore(namespace) {
  if (!namespace) throw new Error('MEDIA_KV binding is not configured.');
  return {
    put({ key, body, contentType, metadata }) {
      return namespace.put(key, body, { metadata: { ...metadata, mimeType: contentType } });
    },
    get(key) {
      return namespace.getWithMetadata(key, 'stream');
    },
    delete(key) {
      return namespace.delete(key);
    },
    head(key) {
      return namespace.getWithMetadata(key, 'stream');
    },
  };
}
