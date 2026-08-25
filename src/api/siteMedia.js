const ADMIN_API = '/api/admin';

export async function uploadSiteMedia(file, section = 'hero') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('section', section);
  const response = await fetch(`${ADMIN_API}/site-media`, {
    method: 'POST',
    credentials: 'same-origin',
    body: formData,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Upload failed: ${response.status}`);
  }
  return response.json();
}

export async function runSiteMediaCleanup() {
  const response = await fetch(`${ADMIN_API}/site-media/cleanup`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { accept: 'application/json' },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Cleanup failed: ${response.status}`);
  }
  return response.json();
}

export async function deleteSiteMedia(key) {
  const response = await fetch(`${ADMIN_API}/site-media`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ key }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Delete failed: ${response.status}`);
  }
  return response.json();
}
