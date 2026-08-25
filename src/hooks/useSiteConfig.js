import { useEffect, useState } from 'react';
import { DEFAULT_PAGE_CONFIG, PAGE_KEYS } from '../data/defaultPageConfig';

export function useDefaultPageConfig(pageKey) {
  return DEFAULT_PAGE_CONFIG[pageKey] || null;
}

export function usePublicSiteConfig(pageKey) {
  const defaults = DEFAULT_PAGE_CONFIG[pageKey] || {};
  const [sections, setSections] = useState(
    Object.fromEntries(
      Object.entries(defaults).map(([k, v]) => [
        k,
        {
          sectionKey: k,
          enabled: v.enabled,
          sortOrder: v.sortOrder,
          content: v.content,
          design: v.design || {},
          layout: v.layout || {},
          media: v.media || {},
          seo: v.seo || {},
        },
      ])
    )
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!PAGE_KEYS.includes(pageKey)) return undefined;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/site-config?page=${encodeURIComponent(pageKey)}`, { credentials: 'same-origin', headers: { accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (cancelled || !data?.page?.sections) return;
        const next = {};
        const pageSections = data.page.sections;
        const entries = Array.isArray(pageSections) ? pageSections : Object.values(pageSections);
        for (const section of entries) {
          const defaultSection = defaults[section.sectionKey] || {};
          const content = section.sectionKey === 'collectionGrid' && pageKey === 'characters'
            ? { ...(defaultSection.content || {}), ...(section.content || {}), collections: (defaultSection.content?.collections || []).map((item) => ({ ...item, ...(section.content?.collections || []).find((override) => override.slotId === item.slotId) })) }
            : { ...(defaultSection.content || {}), ...(section.content || {}) };
          next[section.sectionKey] = {
            sectionKey: section.sectionKey,
            enabled: section.enabled,
            sortOrder: section.sortOrder,
            content,
            design: { ...(defaultSection.design || {}), ...(section.design || {}) },
            layout: { ...(defaultSection.layout || {}), ...(section.layout || {}) },
            media: { ...(defaultSection.media || {}), ...(section.media || {}) },
            seo: { ...(defaultSection.seo || {}), ...(section.seo || {}) },
          };
        }
        setSections(next);
      })
      .catch(() => { /* keep defaults */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageKey]);

  return { sections, loading };
}