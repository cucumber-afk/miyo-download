import { DEFAULT_GLOBAL_CONFIG, GLOBAL_CONFIG_KEYS } from './globalConfigDefaults.js';

const MAX_TEXT = 200;
const MAX_LONG_TEXT = 600;
const MAX_URL = 500;

function text(value, max = MAX_TEXT) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function safeUrl(value, { allowMailto = false } = {}) {
  const cleaned = text(value, MAX_URL);
  if (!cleaned) return '';
  if (cleaned.startsWith('/') && !cleaned.startsWith('//') && !/[\u0000-\u001F]/.test(cleaned)) return cleaned;
  if (allowMailto && /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(cleaned)) return cleaned;
  try {
    const parsed = new URL(cleaned);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function mediaKey(value) {
  const cleaned = text(value, 200).replace(/[\u0000-\u001F]/g, '');
  return /^site\/home\/(?:hero|global\/(?:navigation|footer|seo))\/[0-9a-f-]{36}\.(?:gif|mp4|png|jpe?g|webp)$/i.test(cleaned) ? cleaned : '';
}

function sanitizeMenu(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (!item || typeof item !== 'object') return null;
    const path = safeUrl(item.path);
    const label = text(item.label, 80);
    return path && label ? { label, path, enabled: item.enabled !== false, sortOrder: Number.isFinite(Number(item.sortOrder)) ? Math.max(-999, Math.min(999, Number(item.sortOrder))) : index } : null;
  }).filter(Boolean).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 12);
}

function sanitizeNavigation(config) {
  const content = config?.content && typeof config.content === 'object' ? config.content : {};
  const button = content.button && typeof content.button === 'object' ? content.button : {};
  const link = safeUrl(button.link);
  return {
    content: {
      logoText: text(content.logoText, 80),
      menu: sanitizeMenu(content.menu),
      button: { text: text(button.text, 80), link: link || '', enabled: Boolean(button.enabled) },
    },
    design: {},
    media: { logoImageKey: mediaKey(config?.media?.logoImageKey) },
  };
}

function sanitizeFooterLinks(value) {
  if (!Array.isArray(value)) return [];
  return value.map((group) => {
    if (!group || typeof group !== 'object') return null;
    const items = Array.isArray(group.items) ? group.items.map((item) => {
      const url = safeUrl(item?.url, { allowMailto: true });
      return url && text(item?.label, 80) ? { label: text(item.label, 80), url } : null;
    }).filter(Boolean).slice(0, 12) : [];
    return text(group.title, 80) && items.length ? { title: text(group.title, 80), items } : null;
  }).filter(Boolean).slice(0, 8);
}

function sanitizeSocialLinks(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const url = safeUrl(item?.url, { allowMailto: true });
    const platform = text(item?.platform || item?.label, 50);
    return url && platform ? { platform, url, enabled: item.enabled !== false } : null;
  }).filter(Boolean).slice(0, 12);
}

function sanitizeFooter(config) {
  const content = config?.content && typeof config.content === 'object' ? config.content : {};
  return {
    content: {
      logoText: text(content.logoText, 80),
      description: text(content.description, MAX_LONG_TEXT),
      links: sanitizeFooterLinks(content.links),
      copyrightText: text(content.copyrightText || content.copyright, 120),
      social: sanitizeSocialLinks(content.social || content.socialLinks),
    },
    design: {},
    media: { logoImageKey: mediaKey(config?.media?.logoImageKey) },
  };
}

function sanitizeSeo(config) {
  const content = config?.content && typeof config.content === 'object' ? config.content : {};
  return {
    content: {
      title: text(content.title, 120),
      description: text(content.description, MAX_LONG_TEXT),
      keywords: text(content.keywords, 300),
      ogImageKey: mediaKey(content.ogImageKey),
      faviconKey: mediaKey(content.faviconKey),
    },
    design: {},
    media: {},
  };
}

export function sanitizeGlobalConfig(configKey, config) {
  if (configKey === 'navigation') return sanitizeNavigation(config);
  if (configKey === 'footer') return sanitizeFooter(config);
  if (configKey === 'seo') return sanitizeSeo(config);
  return null;
}

function parseJson(value) {
  try { return JSON.parse(value || '{}'); } catch { return {}; }
}

export function rowToGlobalConfig(row) {
  return {
    configKey: row.config_key,
    content: parseJson(row.content_json),
    design: parseJson(row.design_json),
    media: parseJson(row.media_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mergeGlobalConfig(rows = []) {
  const result = {};
  for (const key of GLOBAL_CONFIG_KEYS) result[key] = structuredClone(DEFAULT_GLOBAL_CONFIG[key]);
  for (const row of rows) {
    const key = row.configKey;
    if (!GLOBAL_CONFIG_KEYS.includes(key)) continue;
    const sanitized = sanitizeGlobalConfig(key, row);
    const defaults = result[key];
    result[key] = {
      content: { ...defaults.content, ...sanitized.content },
      design: { ...defaults.design, ...sanitized.design },
      media: { ...defaults.media, ...sanitized.media },
    };
  }
  return result;
}

export function defaultGlobalConfig() {
  return structuredClone(DEFAULT_GLOBAL_CONFIG);
}
