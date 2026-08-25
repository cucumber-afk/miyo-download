async function requestJson(path, options) {
  const response = await fetch(path, { credentials: 'same-origin', headers: { accept: 'application/json', ...(options?.body && !(options.body instanceof Blob) ? { 'content-type': 'application/json' } : {}), ...(options?.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed with ${response.status}`);
  return data;
}

export const getPublicAnimations = (params = {}) => {
  const search = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== '' && value !== 'all'));
  return requestJson(`/api/animations${search.toString() ? `?${search}` : ''}`);
};
export const getFeaturedAnimations = () => requestJson('/api/animations/featured');
export const getAdminMe = () => requestJson('/api/admin/me');
export const getAdminSession = () => requestJson('/api/admin/session');
export const logoutAdmin = () => requestJson('/api/admin/logout', { method: 'POST' });
export const getAdminAnimations = () => requestJson('/api/admin/animations');
export const createAnimation = (input) => requestJson('/api/admin/animations', { method: 'POST', body: JSON.stringify(input) });
export const updateAnimation = (id, input) => requestJson(`/api/admin/animations/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const deleteAnimation = (id) => requestJson(`/api/admin/animations/${id}`, { method: 'DELETE' });
export const publishAnimation = (id) => requestJson(`/api/admin/animations/${id}/publish`, { method: 'POST' });
export const unpublishAnimation = (id) => requestJson(`/api/admin/animations/${id}/unpublish`, { method: 'POST' });

export function uploadMedia(id, format, file) {
  return requestJson(`/api/admin/animations/${id}/media/${format}`, { method: 'POST', headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) }, body: file });
}

export function removeMedia(id, format) {
  return requestJson(`/api/admin/animations/${id}/media/${format}`, { method: 'DELETE' });
}
