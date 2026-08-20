export const CHARACTER_COLORS = ['gray', 'black', 'blue', 'green', 'yellow', 'pink'];
export const CATEGORIES = ['Expressions', 'Animations', 'Seasonal', 'Special', 'Updates'];
export const MAX_GIF_BYTES = 10 * 1024 * 1024;
export const MAX_MP4_BYTES = 100 * 1024 * 1024;
export const STATIC_MEDIA_PREFIX = '/assets/animations/library/';

export function parseTags(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 20);
}

export function slugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'animation';
}

export function isStaticMediaPath(value, format) {
  return typeof value === 'string'
    && value.startsWith(STATIC_MEDIA_PREFIX)
    && value.endsWith(`.${format}`)
    && !value.includes('..');
}

export function validateAnimationInput(input, { partial = false } = {}) {
  const errors = {};
  if (!partial || input.title !== undefined) {
    if (typeof input.title !== 'string' || input.title.trim().length < 1 || input.title.length > 120) errors.title = 'Title is required and must be at most 120 characters.';
  }
  if (!partial || input.category !== undefined) {
    if (typeof input.category !== 'string' || !CATEGORIES.includes(input.category)) errors.category = 'Choose a valid category.';
  }
  if (input.description !== undefined && typeof input.description !== 'string') errors.description = 'Description must be text.';
  if (input.tags !== undefined && !Array.isArray(input.tags)) errors.tags = 'Tags must be an array.';
  if (input.featured !== undefined && typeof input.featured !== 'boolean') errors.featured = 'Featured must be boolean.';
  if (input.characterColor !== undefined && !CHARACTER_COLORS.includes(input.characterColor)) errors.characterColor = 'Choose a valid character color.';
  if (input.contentScale !== undefined && (!Number.isFinite(Number(input.contentScale)) || Number(input.contentScale) < 0.5 || Number(input.contentScale) > 2)) errors.contentScale = 'Content scale must be between 0.5 and 2.';
  if (input.gifPath !== undefined && input.gifPath !== '' && !isStaticMediaPath(input.gifPath, 'gif')) errors.gifPath = `GIF path must be a relative ${STATIC_MEDIA_PREFIX}*.gif path.`;
  if (input.mp4Path !== undefined && input.mp4Path !== '' && !isStaticMediaPath(input.mp4Path, 'mp4')) errors.mp4Path = `MP4 path must be a relative ${STATIC_MEDIA_PREFIX}*.mp4 path.`;
  for (const field of ['gifFileSize', 'mp4FileSize']) {
    if (input[field] !== undefined && input[field] !== '' && (!Number.isFinite(Number(input[field])) || Number(input[field]) < 0)) errors[field] = 'File size must be a non-negative number of bytes.';
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true };
}

export function validateMedia(format, fileSize, contentType) {
  const limit = format === 'gif' ? MAX_GIF_BYTES : MAX_MP4_BYTES;
  const expectedType = format === 'gif' ? 'image/gif' : 'video/mp4';
  if (!['gif', 'mp4'].includes(format)) return 'Format must be gif or mp4.';
  if (!Number.isInteger(fileSize) || fileSize < 1 || fileSize > limit) return `File must be between 1 byte and ${limit} bytes.`;
  if (contentType !== expectedType) return `Content-Type must be ${expectedType}.`;
  return null;
}
