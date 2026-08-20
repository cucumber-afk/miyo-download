function slugifyTitle(title = '') {
  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'animation';
}

export function getDownloadFileName(file, title, format) {
  const extension = format === 'gif' ? 'gif' : 'mp4';
  const existingName = typeof file?.fileName === 'string' ? file.fileName.trim() : '';
  if (existingName) return existingName;
  return `miyo-${slugifyTitle(title)}.${extension}`;
}

export function getDownloadUrl(src, fileName) {
  const params = new URLSearchParams({ url: src, filename: fileName });
  return `/api/download?${params.toString()}`;
}

export async function downloadMedia({ src, fileName }) {
  window.location.assign(getDownloadUrl(src, fileName));
}
