const MEDIA_PREFIX = 'animations/';
const SITE_MEDIA_PREFIX = 'site/';
const MEDIA_TYPES = { gif: 'image/gif', mp4: 'video/mp4', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };

export const mediaLimits = { gif: 8 * 1024 * 1024, mp4: 20 * 1024 * 1024, png: 8 * 1024 * 1024, jpg: 8 * 1024 * 1024, jpeg: 8 * 1024 * 1024, webp: 8 * 1024 * 1024 };

export function isMediaFormat(value) {
  return value === 'gif' || value === 'mp4';
}

export function isSiteMediaFormat(value) {
  return ['gif', 'mp4', 'png', 'jpg', 'jpeg', 'webp'].includes(value);
}

export function contentTypeFor(format) {
  return MEDIA_TYPES[format];
}

export function isMediaKey(value) {
  return typeof value === 'string'
    && value.startsWith(MEDIA_PREFIX)
    && /^animations\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(gif|mp4)$/i.test(value);
}

export function isSiteMediaKey(value) {
  return typeof value === 'string'
    && value.startsWith(SITE_MEDIA_PREFIX)
    && /^site\/(?:home\/(?:hero|featured-video|global\/(?:navigation|footer|seo))|characters\/(?:everyday|mood|seasonal|special)|support\/(?:video|poster))\/[0-9a-f-]{36}\.(gif|mp4|png|jpe?g|webp)$/i.test(value);
}

export function isValidMediaKey(value) {
  return isMediaKey(value) || isSiteMediaKey(value);
}

export function previewUrlFor(key) {
  return `/api/media?${new URLSearchParams({ key })}`;
}

export function downloadUrlFor(key, fileName) {
  return `/api/download?${new URLSearchParams({ key, filename: fileName })}`;
}

export function safeFileName(value, format) {
  const normalized = String(value || '')
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[\\/]+/g, '-')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 180);
  if (!normalized || !normalized.toLowerCase().endsWith(`.${format}`)) return null;
  return normalized;
}

export function createMediaKey(animationId, format) {
  return `animations/${animationId}/${crypto.randomUUID()}.${format}`;
}

export function createSiteMediaKey(section, format) {
  const globalSection = ['hero', 'global/navigation', 'global/footer', 'global/seo'].includes(section) ? `home/${section}` : null;
  const characterSection = ['everyday', 'mood', 'seasonal', 'special'].includes(section) ? `characters/${section}` : null;
  const supportSection = ['support/video', 'support/poster'].includes(section) ? section : null;
  const featuredVideoSection = ['home/featured-video/video', 'home/featured-video/poster'].includes(section) ? 'home/featured-video' : null;
  const safeSection = globalSection || characterSection || supportSection || featuredVideoSection || 'home/hero';
  return `site/${safeSection}/${crypto.randomUUID()}.${format}`;
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

export function validateSiteMediaBytes(format, fileName, contentType, bytes) {
  if (!isSiteMediaFormat(format)) return { status: 400, message: 'Unsupported site media format.' };
  if (!safeFileName(fileName, format)) return { status: 400, message: `File name must end in .${format}.` };
  const expectedType = contentTypeFor(format);
  if (contentType !== expectedType) return { status: 415, message: `Content-Type must be ${expectedType}.` };
  if (bytes.byteLength < 1) return { status: 400, message: 'Media file is empty.' };
  const limit = mediaLimits[format] || 8 * 1024 * 1024;
  if (bytes.byteLength > limit) return { status: 413, message: `${format.toUpperCase()} files may not exceed ${limit} bytes.` };
  const view = new Uint8Array(bytes);
  const isGif = view.length >= 6 && ['GIF87a', 'GIF89a'].includes(new TextDecoder().decode(view.slice(0, 6)));
  const isMp4 = view.length >= 12 && new TextDecoder().decode(view.slice(4, 8)) === 'ftyp';
  const isPng = view.length >= 8 && view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4E && view[3] === 0x47;
  const isJpeg = view.length >= 2 && view[0] === 0xFF && view[1] === 0xD8;
  const isWebp = view.length >= 12 && new TextDecoder().decode(view.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(view.slice(8, 12)) === 'WEBP';
  if (format === 'gif' && !isGif) return { status: 415, message: 'File content is not a valid GIF.' };
  if (format === 'mp4' && !isMp4) return { status: 415, message: 'File content is not a valid MP4.' };
  if (format === 'png' && !isPng) return { status: 415, message: 'File content is not a valid PNG.' };
  if ((format === 'jpg' || format === 'jpeg') && !isJpeg) return { status: 415, message: 'File content is not a valid JPEG.' };
  if (format === 'webp' && !isWebp) return { status: 415, message: 'File content is not a valid WebP.' };
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
    async listKeys(prefix) {
      const list = await namespace.list({ prefix });
      return (list.keys || []).map((k) => k.name);
    },
  };
}

export function buildSiteMediaMetadata({ uploadedAt = new Date().toISOString(), originalFileName, mimeType }) {
  return { uploadedAt, originalFileName, mimeType };
}

export function getUploadedAt(metadata) {
  if (!metadata) return null;
  const ts = metadata.uploadedAt;
  if (!ts) return null;
  const d = Date.parse(ts);
  return Number.isFinite(d) ? d : null;
}
