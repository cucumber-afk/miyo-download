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

export function getDownloadUrl(file, fileName) {
  const params = file?.mediaKey ? new URLSearchParams({ key: file.mediaKey, filename: fileName }) : new URLSearchParams({ url: file?.src || '', filename: fileName });
  return `/api/download?${params.toString()}`;
}

export async function downloadMedia({ src, mediaKey, fileName }) {
  window.location.assign(getDownloadUrl({ src, mediaKey }, fileName));
}
