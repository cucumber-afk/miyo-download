import { adminContext, parseJsonRequest } from '../_lib.js';
import { getDefaultPageConfigBackend, getSectionKeys, rowToSection, validateSection } from '../../../_lib/siteConfig.js';
import { isPageKey } from '../../../_lib/pageConfigConstants.js';
import { error, json, methodNotAllowed } from '../../../_lib/response.js';
import { createMediaStore } from '../../../_lib/media-store.js';
import { collectReferencedSiteMediaKeysFromRows, collectReferencedSiteMediaKeysFromGlobalConfigRows } from '../../../_lib/siteMediaRefCollector.js';

function mergeWithDefaults(pageKey, rows) {
  const defaultPage = getDefaultPageConfigBackend(pageKey);
  const sections = new Map((defaultPage?.sections || []).map((section) => [section.sectionKey, { ...section }]));
  for (const row of rows || []) {
    const parsed = rowToSection(row);
    const defaultSection = sections.get(parsed.sectionKey) || {};
    const savedContent = parsed.content && typeof parsed.content === 'object' && !Array.isArray(parsed.content) ? parsed.content : {};
    const defaultContent = defaultSection.content && typeof defaultSection.content === 'object' && !Array.isArray(defaultSection.content) ? defaultSection.content : {};
    const content = parsed.sectionKey === 'collectionGrid' && pageKey === 'characters'
      ? { ...defaultContent, ...savedContent, collections: (defaultContent.collections || []).map((item) => ({ ...item, ...(Array.isArray(savedContent.collections) ? savedContent.collections : []).find((override) => override?.slotId === item.slotId) })) }
      : { ...defaultContent, ...savedContent };
    sections.set(parsed.sectionKey, {
      sectionKey: parsed.sectionKey,
      enabled: parsed.enabled,
      sortOrder: parsed.sortOrder,
      content,
      design: { ...(defaultSection.design || {}), ...(parsed.design && typeof parsed.design === 'object' && !Array.isArray(parsed.design) ? parsed.design : {}) },
      layout: { ...(defaultSection.layout || {}), ...(parsed.layout && typeof parsed.layout === 'object' && !Array.isArray(parsed.layout) ? parsed.layout : {}) },
      media: { ...(defaultSection.media || {}), ...(parsed.media && typeof parsed.media === 'object' && !Array.isArray(parsed.media) ? parsed.media : {}) },
      seo: { ...(defaultSection.seo || {}), ...(parsed.seo && typeof parsed.seo === 'object' && !Array.isArray(parsed.seo) ? parsed.seo : {}) },
    });
  }
  return { pageKey, sections: Array.from(sections.values()) };
}

export async function onRequestGet({ request, env, params }) {
  const auth = await adminContext(request, env);
  if (auth.response) return auth.response;
  const pageKey = params?.page;
  if (!isPageKey(pageKey)) return error(`Unknown page '${pageKey}'.`, 400);
  if (!env.DB) return json({ page: getDefaultPageConfigBackend(pageKey), source: 'defaults' });
  const rows = await env.DB.prepare('SELECT * FROM site_page_sections WHERE page_key = ? ORDER BY sort_order ASC').bind(pageKey).all();
  return json({ page: mergeWithDefaults(pageKey, rows.results || []), source: 'mixed' });
}

export async function onRequestPatch({ request, env, params }) {
  const auth = await adminContext(request, env);
  if (auth.response) return auth.response;
  const pageKey = params?.page;
  if (!isPageKey(pageKey)) return error(`Unknown page '${pageKey}'.`, 400);
  const payload = await parseJsonRequest(request);
  if (!payload || typeof payload !== 'object') return error('Invalid request body.', 400);
  const updates = Array.isArray(payload.sections) ? payload.sections : null;
  if (!updates) return error('Body must include a sections array.', 400);
  if (!env.DB) return error('D1 binding is not configured.', 503);

  const allowedSections = new Set(getSectionKeys(pageKey));
  const now = new Date().toISOString();
  const incoming = new Map();
  for (const entry of updates) {
    if (!entry || typeof entry !== 'object') return error('Each section entry must be an object.', 400);
    const sectionKey = typeof entry.sectionKey === 'string' ? entry.sectionKey : '';
    if (!allowedSections.has(sectionKey)) return error(`Unknown section_key '${sectionKey}' for page '${pageKey}'.`, 400);
    const enabled = entry.enabled === undefined ? true : Boolean(entry.enabled);
    const sortOrderRaw = Number(entry.sortOrder);
    const sortOrder = Number.isFinite(sortOrderRaw) ? Math.max(-999, Math.min(999, Math.round(sortOrderRaw))) : 0;
    const validation = validateSection(pageKey, sectionKey, entry);
    if (!validation.ok) return error(validation.error, 400, { sectionKey });
    incoming.set(sectionKey, { enabled, sortOrder, ...validation.section });
  }

  const existing = await env.DB.prepare('SELECT * FROM site_page_sections WHERE page_key = ?').bind(pageKey).all();
  const existingMap = new Map();
  for (const row of existing.results || []) existingMap.set(row.section_key, row);
  const saved = [];
  const statements = [];
  for (const [sectionKey, value] of incoming.entries()) {
    const previous = existingMap.get(sectionKey);
    const contentJson = JSON.stringify(value.content);
    const designJson = JSON.stringify(value.design);
    const layoutJson = JSON.stringify(value.layout);
    const mediaJson = JSON.stringify(value.media);
    const seoJson = JSON.stringify(value.seo);
    if (previous) {
      statements.push(env.DB.prepare('UPDATE site_page_sections SET enabled = ?, sort_order = ?, content_json = ?, design_json = ?, layout_json = ?, media_json = ?, seo_json = ?, updated_at = ? WHERE id = ?').bind(value.enabled ? 1 : 0, value.sortOrder, contentJson, designJson, layoutJson, mediaJson, seoJson, now, previous.id));
      saved.push({ sectionKey, enabled: value.enabled, sortOrder: value.sortOrder, content: value.content, design: value.design, layout: value.layout, media: value.media, seo: value.seo, createdAt: previous.created_at, updatedAt: now });
    } else {
      const id = crypto.randomUUID();
      statements.push(env.DB.prepare('INSERT INTO site_page_sections (id, page_key, section_key, enabled, sort_order, content_json, design_json, layout_json, media_json, seo_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, pageKey, sectionKey, value.enabled ? 1 : 0, value.sortOrder, contentJson, designJson, layoutJson, mediaJson, seoJson, now, now));
      saved.push({ sectionKey, enabled: value.enabled, sortOrder: value.sortOrder, content: value.content, design: value.design, layout: value.layout, media: value.media, seo: value.seo, createdAt: now, updatedAt: now });
    }
  }
  if (statements.length) await env.DB.batch(statements);

  // Reference-aware orphan cleanup for site media keys
  if (env.MEDIA_KV) {
    try {
      const store = createMediaStore(env.MEDIA_KV);
      const oldKeys = new Set();
      for (const row of existing.results || []) {
        const section = rowToSection(row);
        const sectionIncoming = incoming.get(row.section_key);
        if (section.media) {
          const extractFrom = (obj, acc) => {
            if (!obj || typeof obj !== 'object') return;
            for (const v of Object.values(obj)) {
              if (typeof v === 'string' && v.startsWith('site/')) acc.add(v);
              else if (Array.isArray(v)) v.forEach((i) => extractFrom(i, acc));
              else if (v && typeof v === 'object') extractFrom(v, acc);
            }
          };
          extractFrom(section.media, oldKeys);
        }
      }
      const newKeys = new Set();
      for (const [, value] of incoming.entries()) {
        const extractFrom = (obj, acc) => {
          if (!obj || typeof obj !== 'object') return;
          for (const v of Object.values(obj)) {
            if (typeof v === 'string' && v.startsWith('site/')) acc.add(v);
            else if (Array.isArray(v)) v.forEach((i) => extractFrom(i, acc));
            else if (v && typeof v === 'object') extractFrom(v, acc);
          }
        };
        if (value.media) extractFrom(value.media, newKeys);
      }
      const removedKeys = [...oldKeys].filter((k) => !newKeys.has(k));
      if (removedKeys.length > 0) {
        const pageRows = (await env.DB.prepare('SELECT * FROM site_page_sections').all()).results || [];
        const globalRows = (await env.DB.prepare('SELECT * FROM site_global_config').all()).results || [];
        const referencedKeys = new Set();
        for (const k of collectReferencedSiteMediaKeysFromRows(pageRows)) referencedKeys.add(k);
        for (const k of collectReferencedSiteMediaKeysFromGlobalConfigRows(globalRows)) referencedKeys.add(k);
        for (const key of removedKeys) {
          if (!referencedKeys.has(key)) {
            try { await store.delete(key); } catch (_) {}
          }
        }
      }
    } catch (_) {}
  }

  return json({ page: { pageKey, sections: saved }, actor: auth.identity.email });
}

export function onRequest(context) {
  switch (context.request.method) {
    case 'GET': return onRequestGet(context);
    case 'PATCH': return onRequestPatch(context);
    default: return methodNotAllowed(['GET', 'PATCH']);
  }
}