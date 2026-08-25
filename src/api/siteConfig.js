import { DEFAULT_PAGE_CONFIG, PAGE_KEYS } from '../data/defaultPageConfig';

async function requestJson(path) {
  try {
    const response = await fetch(path, { credentials: 'same-origin', headers: { accept: 'application/json' } });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || `Request failed with ${response.status}`);
    return data;
  } catch (error) {
    return { error };
  }
}

export function getPublicSiteConfig(pageKey) {
  if (!PAGE_KEYS.includes(pageKey)) return Promise.resolve({ error: new Error(`Unknown page '${pageKey}'.`) });
  return requestJson(`/api/site-config?page=${encodeURIComponent(pageKey)}`);
}

export function getAdminSiteConfig(pageKey) {
  if (!PAGE_KEYS.includes(pageKey)) return Promise.resolve({ error: new Error(`Unknown page '${pageKey}'.`) });
  return requestJson(`/api/admin/site-config/${encodeURIComponent(pageKey)}`);
}

export function patchAdminSiteConfig(pageKey, sections) {
  if (!PAGE_KEYS.includes(pageKey)) return Promise.resolve({ error: new Error(`Unknown page '${pageKey}'.`) });
  return fetch(`/api/admin/site-config/${encodeURIComponent(pageKey)}`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sections }),
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `Request failed with ${response.status}`);
    return data;
  });
}

export function mergeSectionsWithDefaults(pageKey, sectionsFromServer) {
  const defaults = DEFAULT_PAGE_CONFIG[pageKey] || {};
  const merged = {};
  for (const key of Object.keys(defaults)) {
    merged[key] = {
      sectionKey: key,
      enabled: defaults[key].enabled,
      sortOrder: defaults[key].sortOrder,
      content: defaults[key].content,
    };
  }
  for (const section of sectionsFromServer || []) {
    merged[section.sectionKey] = {
      sectionKey: section.sectionKey,
      enabled: section.enabled,
      sortOrder: section.sortOrder,
      content: section.content,
    };
  }
  return merged;
}

export function getDefaultSections(pageKey) {
  const defaults = DEFAULT_PAGE_CONFIG[pageKey] || {};
  return Object.entries(defaults).map(([key, value]) => ({
    sectionKey: key,
    enabled: value.enabled,
    sortOrder: value.sortOrder,
    content: value.content,
  }));
}