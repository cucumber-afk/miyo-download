function parseTags(value) {
  try {
    const tags = JSON.parse(value || '[]');
    return Array.isArray(tags) ? tags : [];
  } catch {
    return [];
  }
}

export function toAnimation(row) {
  const downloads = {};
  if (row.gif_url) downloads.gif = { src: row.gif_url, fileName: row.gif_file_name, fileSize: formatBytes(row.gif_file_size), mediaKey: row.gif_object_key || null };
  if (row.mp4_url) downloads.mp4 = { src: row.mp4_url, fileName: row.mp4_file_name, fileSize: formatBytes(row.mp4_file_size), mediaKey: row.mp4_object_key || null };
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    preview: row.gif_url ? { type: 'gif', src: row.gif_url } : row.mp4_url ? { type: 'mp4', src: row.mp4_url } : null,
    downloads,
    gifPath: row.gif_url || '',
    mp4Path: row.mp4_url || '',
    gifObjectKey: row.gif_object_key || '',
    mp4ObjectKey: row.mp4_object_key || '',
    gifFileName: row.gif_file_name || '',
    mp4FileName: row.mp4_file_name || '',
    description: row.description,
    tags: parseTags(row.tags_json),
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    characterColor: row.character_color,
    contentScale: row.content_scale,
    gifFileSize: row.gif_file_size,
    mp4FileSize: row.mp4_file_size,
    status: row.status,
  };
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function animationParams(input) {
  return [input.slug, input.title.trim(), input.category, input.description?.trim() || '', JSON.stringify(input.tags || []), input.featured ? 1 : 0, input.characterColor || 'gray', Number(input.contentScale || 1)];
}
