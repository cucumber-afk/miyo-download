import { DEFAULT_PAGE_CONFIG_BACKEND } from './pageConfigDefaults.js';
import { DEFAULT_GLOBAL_CONFIG } from './globalConfigDefaults.js';
import { rowToSection } from './siteConfig.js';

function isSiteMediaKeyPattern(key) {
  if (typeof key !== 'string' || !key) return false;
  return key.startsWith('site/');
}

function extractKeysFromObject(obj, keys = new Set()) {
  if (!obj || typeof obj !== 'object') return keys;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractKeysFromObject(item, keys);
    }
  } else {
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && isSiteMediaKeyPattern(value)) {
        keys.add(value);
      } else {
        extractKeysFromObject(value, keys);
      }
    }
  }
  return keys;
}

export function collectReferencedSiteMediaKeysFromRows(rows = []) {
  const keys = new Set();
  for (const row of rows) {
    const section = rowToSection(row);
    if (section.media) extractKeysFromObject(section.media, keys);
    if (section.design) extractKeysFromObject(section.design, keys);
  }
  return keys;
}

export function collectReferencedSiteMediaKeysFromGlobalConfigRows(rows = []) {
  const keys = new Set();
  for (const row of rows) {
    const content = typeof row.content_json === 'string' ? JSON.parse(row.content_json || '{}') : (row.content || {});
    const design = typeof row.design_json === 'string' ? JSON.parse(row.design_json || '{}') : (row.design || {});
    const media = typeof row.media_json === 'string' ? JSON.parse(row.media_json || '{}') : (row.media || {});
    for (const cfg of [content, design, media]) {
      extractKeysFromObject(cfg, keys);
    }
  }
  return keys;
}

export function countSiteMediaReferences(key, fromPageRows = [], fromGlobalRows = []) {
  let count = 0;
  const allKeys = new Set([key]);
  const pageKeys = collectReferencedSiteMediaKeysFromRows(fromPageRows);
  const globalKeys = collectReferencedSiteMediaKeysFromGlobalConfigRows(fromGlobalRows);
  for (const k of allKeys) {
    if (pageKeys.has(k)) count++;
    if (globalKeys.has(k)) count++;
  }
  return count;
}

export { extractKeysFromObject };
