import { getDefaultPageConfigBackend, rowToSection } from '../_lib/siteConfig.js';
import { json, methodNotAllowed } from '../_lib/response.js';
import { PAGE_KEYS, isPageKey } from '../_lib/pageConfigConstants.js';

async function loadPage(env, pageKey) {
  const sections = {};
  const defaultPage = getDefaultPageConfigBackend(pageKey);
  if (defaultPage?.sections?.length) {
    for (const section of defaultPage.sections) sections[section.sectionKey] = { ...section };
  }
  if (!env.DB) return { pageKey, sections };
  const rows = await env.DB.prepare('SELECT * FROM site_page_sections WHERE page_key = ?').bind(pageKey).all();
  for (const row of rows.results || []) {
    const parsed = rowToSection(row);
    const defaultSection = sections[parsed.sectionKey] || {};
    const content = parsed.sectionKey === 'collectionGrid' && pageKey === 'characters'
      ? { ...(defaultSection.content || {}), ...(parsed.content || {}), collections: (defaultSection.content?.collections || []).map((item) => ({ ...item, ...(parsed.content?.collections || []).find((override) => override.slotId === item.slotId) })) }
      : { ...(defaultSection.content || {}), ...(parsed.content || {}) };
    sections[parsed.sectionKey] = {
      sectionKey: parsed.sectionKey,
      enabled: parsed.enabled,
      sortOrder: parsed.sortOrder,
      content,
      design: { ...(defaultSection.design || {}), ...parsed.design },
      layout: { ...(defaultSection.layout || {}), ...parsed.layout },
      media: { ...(defaultSection.media || {}), ...parsed.media },
      seo: { ...(defaultSection.seo || {}), ...parsed.seo },
    };
  }
  return { pageKey, sections };
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const requested = url.searchParams.get('page');
  const cacheHeader = { 'cache-control': 'no-store' };
  if (!requested) {
    const pages = {};
    for (const key of PAGE_KEYS) pages[key] = await loadPage(env, key);
    return json({ pages, source: env.DB ? 'mixed' : 'defaults' }, { headers: cacheHeader });
  }
  if (!isPageKey(requested)) return json({ error: `Unknown page '${requested}'.` }, { status: 400, headers: cacheHeader });
  const page = await loadPage(env, requested);
  return json({ page, source: env.DB ? 'mixed' : 'defaults' }, { headers: cacheHeader });
}

export function onRequest(context) {
  return context.request.method === 'GET' ? onRequestGet(context) : methodNotAllowed(['GET']);
}