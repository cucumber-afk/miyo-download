import { DEFAULT_GLOBAL_CONFIG } from '../data/defaultGlobalConfig';

export async function getPublicGlobalConfig() {
  const response = await fetch('/api/global-config', { credentials: 'same-origin', headers: { accept: 'application/json' } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed with ${response.status}`);
  return data;
}

export async function getAdminGlobalConfig() {
  const response = await fetch('/api/admin/global-config', { credentials: 'same-origin', headers: { accept: 'application/json' } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed with ${response.status}`);
  return data;
}

export async function patchAdminGlobalConfig(config) {
  const response = await fetch('/api/admin/global-config', { method: 'PATCH', credentials: 'same-origin', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify({ config }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed with ${response.status}`);
  return data;
}

function normalizeGlobalContent(key, content) {
  if (key === 'footer') {
    return {
      ...content,
      copyrightText: content.copyrightText || content.copyright || '',
      social: content.social || content.socialLinks || [],
    };
  }
  if (key === 'navigation') {
    return {
      ...content,
      menu: Array.isArray(content.menu) ? content.menu.map((item, index) => ({ ...item, enabled: item.enabled !== false, sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index })).sort((a, b) => a.sortOrder - b.sortOrder) : [],
    };
  }
  return content;
}

export function mergeGlobalConfig(config) {
  const merged = structuredClone(DEFAULT_GLOBAL_CONFIG);
  for (const key of Object.keys(merged)) {
    const incoming = config?.[key] || {};
    merged[key] = {
      content: { ...merged[key].content, ...normalizeGlobalContent(key, incoming.content || {}) },
      design: { ...merged[key].design, ...(incoming.design || {}) },
      media: { ...merged[key].media, ...(incoming.media || {}) },
    };
  }
  return merged;
}
