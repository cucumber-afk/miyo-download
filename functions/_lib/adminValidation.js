import { CHARACTER_COLORS, isStaticMediaPath, validateAnimationInput } from './validation.js';

function stringOrNull(value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || null;
}

function sizeOrNull(value) {
  return value === '' || value === undefined || value === null ? null : Number(value);
}

export function normalizeAnimationPayload(input, current = {}) {
  const payload = {
    title: input.title ?? current.title ?? '',
    category: input.category ?? current.category ?? '',
    description: input.description ?? current.description ?? '',
    tags: input.tags ?? current.tags ?? [],
    featured: input.featured ?? Boolean(current.featured),
    characterColor: input.characterColor ?? current.characterColor ?? 'gray',
    contentScale: input.contentScale ?? current.contentScale ?? 1,
    gifPath: input.gifPath ?? current.gif_url ?? '',
    mp4Path: input.mp4Path ?? current.mp4_url ?? '',
    gifFileName: input.gifFileName ?? current.gif_file_name ?? '',
    mp4FileName: input.mp4FileName ?? current.mp4_file_name ?? '',
    gifFileSize: input.gifFileSize ?? current.gif_file_size ?? '',
    mp4FileSize: input.mp4FileSize ?? current.mp4_file_size ?? '',
  };
  return { payload, validation: validateAnimationInput(payload) };
}

export function staticMediaParams(payload) {
  return [
    stringOrNull(payload.gifPath),
    stringOrNull(payload.gifFileName),
    sizeOrNull(payload.gifFileSize),
    stringOrNull(payload.mp4Path),
    stringOrNull(payload.mp4FileName),
    sizeOrNull(payload.mp4FileSize),
  ];
}

export function canPublish(row) {
  return Boolean(
    row
      && row.title
      && row.category
      && CHARACTER_COLORS.includes(row.character_color)
      && Number.isFinite(Number(row.content_scale))
      && Number(row.content_scale) >= 0.5
      && Number(row.content_scale) <= 2
      && (isStaticMediaPath(row.gif_url, 'gif') || isStaticMediaPath(row.mp4_url, 'mp4')),
  );
}
