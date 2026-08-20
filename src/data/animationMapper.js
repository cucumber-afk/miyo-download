export function mapAnimation(row) {
  return {
    ...row,
    preview: row.preview || (row.downloads?.gif?.src ? { type: 'gif', src: row.downloads.gif.src } : row.downloads?.mp4?.src ? { type: 'mp4', src: row.downloads.mp4.src } : null),
    downloads: row.downloads || {},
    tags: Array.isArray(row.tags) ? row.tags : [],
    contentScale: Number(row.contentScale || 1),
  };
}

export function mapAnimations(rows = []) { return rows.map(mapAnimation); }
