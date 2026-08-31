import { DOWNLOADS_CATEGORY_OPTIONS, DOWNLOADS_SORT_OPTIONS, HOME_FEATURED_LIMIT_OPTIONS, HOME_HOW_STEP_COUNT, PAGE_KEYS } from './pageConfigConstants.js';
import { isSiteMediaKey } from './media-store.js';
import { DEFAULT_PAGE_CONFIG_BACKEND } from './pageConfigDefaults.js';
import { parseYouTubeVideoId } from '../../shared/video-url.js';

const MAX_TEXT_LENGTH = 200;
const MAX_LONG_TEXT_LENGTH = 600;
const MAX_LINK_LENGTH = 500;
const MAX_ANIMATION_IDS = 24;
const ALLOWED_SORT_VALUES = new Set(DOWNLOADS_SORT_OPTIONS.map((option) => option.value));
const ALLOWED_CATEGORIES = new Set(DOWNLOADS_CATEGORY_OPTIONS);

export const PAGE_LABEL = {
  home: 'Home',
  downloads: 'Downloads',
  characters: 'Characters',
  support: 'Support',
};

export function isPageKey(value) {
  return typeof value === 'string' && PAGE_KEYS.includes(value);
}

export function getSectionKeys(pageKey) {
  if (!isPageKey(pageKey)) return [];
  return Object.keys(DEFAULT_PAGE_CONFIG_BACKEND[pageKey] ?? {});
}

function truncate(value, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string') return value;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function sanitizeString(value, { maxLength = MAX_TEXT_LENGTH, allowEmpty = true } = {}) {
  if (value === undefined || value === null) return allowEmpty ? '' : '';
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return allowEmpty ? '' : null;
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isDirectMp4Url(value) {
  if (!isHttpUrl(value)) return false;
  try {
    const url = new URL(value);
    return url.pathname.toLowerCase().endsWith('.mp4');
  } catch {
    return false;
  }
}

function isSafePath(value) {
  if (typeof value !== 'string') return false;
  if (!value.length) return false;
  if (value.startsWith('//')) return false;
  if (/[\u0000-\u001F]/.test(value)) return false;
  if (/javascript:/i.test(value) || /data:/i.test(value) || /vbscript:/i.test(value)) return false;
  if (value.startsWith('/')) return true;
  return isHttpUrl(value);
}

function sanitizeLink(value) {
  const cleaned = sanitizeString(value, { maxLength: MAX_LINK_LENGTH });
  if (cleaned === '') return '';
  return isSafePath(cleaned) ? cleaned : null;
}

function sanitizeLinkField(value) {
  if (value === '' || value === undefined || value === null) return '';
  return sanitizeLink(value);
}

function sanitizeStatEntry(value) {
  if (!value || typeof value !== 'object') return null;
  const label = sanitizeString(value.label, { maxLength: 80 });
  const text = sanitizeString(value.value, { maxLength: 200 });
  if (!label && !text) return null;
  return { label, value: text };
}

function sanitizeStats(value) {
  if (!Array.isArray(value)) return null;
  const items = value.map(sanitizeStatEntry).filter(Boolean).slice(0, 6);
  return items;
}

function sanitizeHowStep(value) {
  if (!value || typeof value !== 'object') return null;
  const title = sanitizeString(value.title, { maxLength: 60 });
  const description = sanitizeString(value.description, { maxLength: 200 });
  if (!title && !description) return null;
  return { title, description };
}

function sanitizeHowSteps(value) {
  if (!Array.isArray(value)) return null;
  const items = value.map(sanitizeHowStep).filter(Boolean).slice(0, HOME_HOW_STEP_COUNT);
  while (items.length < HOME_HOW_STEP_COUNT) {
    items.push({ title: '', description: '' });
  }
  return items;
}

function sanitizeFeaturedContent(content) {
  if (!content || typeof content !== 'object') return null;
  const sectionTitle = sanitizeString(content.sectionTitle, { maxLength: 80 });
  const sectionTitleHighlight = sanitizeString(content.sectionTitleHighlight, { maxLength: 80 });
  const sectionSubtitle = sanitizeString(content.sectionSubtitle, { maxLength: MAX_LONG_TEXT_LENGTH });
  const sectionKicker = sanitizeString(content.sectionKicker, { maxLength: 80 });
  const emptyTitle = sanitizeString(content.emptyTitle, { maxLength: 80 });
  const emptyDescription = sanitizeString(content.emptyDescription, { maxLength: MAX_LONG_TEXT_LENGTH });
  const mode = content.mode === 'manual' ? 'manual' : 'automatic';
  let limit = Number(content.limit);
  if (!Number.isFinite(limit) || limit <= 0) limit = 6;
  limit = HOME_FEATURED_LIMIT_OPTIONS.includes(limit) ? limit : HOME_FEATURED_LIMIT_OPTIONS.reduce((closest, candidate) => Math.abs(candidate - limit) < Math.abs(closest - limit) ? candidate : closest, HOME_FEATURED_LIMIT_OPTIONS[0]);
  let animationIds = [];
  if (Array.isArray(content.animationIds)) {
    animationIds = [...new Set(content.animationIds.filter((id) => typeof id === 'string' && id.trim().length > 0))].slice(0, MAX_ANIMATION_IDS);
  }
  return {
    mode,
    limit,
    sectionTitle,
    sectionTitleHighlight,
    sectionSubtitle,
    sectionKicker,
    emptyTitle,
    emptyDescription,
    animationIds,
  };
}

function sanitizeHeroContent(content) {
  if (!content || typeof content !== 'object') return null;
  const eyebrow = sanitizeString(content.eyebrow, { maxLength: 80 });
  const title = sanitizeString(content.title, { maxLength: 80 }) ?? '';
  const titleHighlight = sanitizeString(content.titleHighlight, { maxLength: 80 });
  const description = sanitizeString(content.description, { maxLength: MAX_LONG_TEXT_LENGTH });
  const primaryButtonText = sanitizeString(content.primaryButtonText, { maxLength: 40 });
  const primaryButtonLink = sanitizeLinkField(content.primaryButtonLink);
  if (primaryButtonLink === null) return null;
  const stats = sanitizeStats(content.stats);
  return { eyebrow, title, titleHighlight, description, primaryButtonText, primaryButtonLink, stats };
}

function sanitizeSimpleSection(content, { maxTitle = 80, maxSubtitle = MAX_LONG_TEXT_LENGTH, maxKicker = 80 } = {}) {
  if (!content || typeof content !== 'object') return null;
  const sectionTitle = sanitizeString(content.sectionTitle, { maxLength: maxTitle });
  const sectionTitleHighlight = sanitizeString(content.sectionTitleHighlight, { maxLength: maxTitle });
  const sectionKicker = sanitizeString(content.sectionKicker, { maxLength: maxKicker });
  const sectionSubtitle = sanitizeString(content.sectionSubtitle, { maxLength: maxSubtitle });
  return { sectionTitle, sectionTitleHighlight, sectionKicker, sectionSubtitle };
}

function sanitizeHowItWorksContent(content) {
  const base = sanitizeSimpleSection(content) || {};
  const steps = sanitizeHowSteps(content?.steps);
  return { ...base, steps };
}

function sanitizeStringList(value, maxItems = 12, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => sanitizeString(item, { maxLength })).filter((item) => item !== null && item !== '').slice(0, maxItems);
}

function sanitizeSupportLink(value) {
  const cleaned = sanitizeString(value, { maxLength: MAX_LINK_LENGTH });
  if (cleaned === '') return '';
  if (isSafePath(cleaned) || /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(cleaned)) return cleaned;
  return null;
}

function sanitizeExpressionContent(content) {
  if (!content || typeof content !== 'object') return null;
  return {
    sectionKicker: sanitizeString(content.sectionKicker, { maxLength: 80 }),
    title: sanitizeString(content.title, { maxLength: 80 }),
    titleHighlight: sanitizeString(content.titleHighlight, { maxLength: 80 }),
    description: sanitizeString(content.description, { maxLength: MAX_LONG_TEXT_LENGTH }),
    tags: sanitizeStringList(content.tags, 12, 40),
    note: sanitizeString(content.note, { maxLength: 120 }),
  };
}

function sanitizeLifestyleContent(content) {
  if (!content || typeof content !== 'object') return null;
  return {
    sectionKicker: sanitizeString(content.sectionKicker, { maxLength: 80 }),
    title: sanitizeString(content.title, { maxLength: 80 }),
    titleHighlight: sanitizeString(content.titleHighlight, { maxLength: 80 }),
    description: sanitizeString(content.description, { maxLength: MAX_LONG_TEXT_LENGTH }),
    scenes: sanitizeStringList(content.scenes, 8, 80),
  };
}

function sanitizeNewContentContent(content) {
  if (!content || typeof content !== 'object') return null;
  return {
    sectionKicker: sanitizeString(content.sectionKicker, { maxLength: 80 }),
    title: sanitizeString(content.title, { maxLength: 80 }),
    titleHighlight: sanitizeString(content.titleHighlight, { maxLength: 80 }),
    description: sanitizeString(content.description, { maxLength: MAX_LONG_TEXT_LENGTH }),
    items: sanitizeStringList(content.items, 12, 100),
  };
}

function sanitizeSupportPageLink(value) {
  const cleaned = sanitizeString(value, { maxLength: MAX_LINK_LENGTH });
  if (cleaned === '') return '';
  if (isSafePath(cleaned) || /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(cleaned)) return cleaned;
  return null;
}

function sanitizeSupportPageHero(content) {
  if (!content || typeof content !== 'object') return null;
  return { sectionKicker: sanitizeString(content.sectionKicker, { maxLength: 80 }), title: sanitizeString(content.title, { maxLength: 80 }), titleHighlight: sanitizeString(content.titleHighlight, { maxLength: 80 }), description: sanitizeString(content.description, { maxLength: MAX_LONG_TEXT_LENGTH }) };
}

function sanitizeFeaturedVideoContent(content) {
  if (!content || typeof content !== 'object') return null;
  const buttonLink = sanitizeSupportPageLink(content.buttonLink);
  if (buttonLink === null) return null;
  return { sectionKicker: sanitizeString(content.sectionKicker, { maxLength: 80 }), title: sanitizeString(content.title, { maxLength: 80 }), titleHighlight: sanitizeString(content.titleHighlight, { maxLength: 80 }), description: sanitizeString(content.description, { maxLength: MAX_LONG_TEXT_LENGTH }), buttonText: sanitizeString(content.buttonText, { maxLength: 80 }), buttonLink };
}

function sanitizeSupportFaq(content) {
  if (!content || typeof content !== 'object') return null;
  const raw = Array.isArray(content.faqs) ? content.faqs : [];
  if (raw.length > 20) return null;
  const faqs = raw.map((faq, index) => {
    if (!faq || typeof faq !== 'object') return null;
    const question = sanitizeString(faq.question, { maxLength: 160, allowEmpty: false });
    const answer = sanitizeString(faq.answer, { maxLength: MAX_LONG_TEXT_LENGTH, allowEmpty: false });
    if (!question || !answer) return null;
    const sortOrder = Number(faq.sortOrder);
    return { id: typeof faq.id === 'string' && /^[a-z0-9_-]{1,80}$/i.test(faq.id) ? faq.id : `faq-${index + 1}`, question, answer, enabled: faq.enabled !== false, sortOrder: Number.isSafeInteger(sortOrder) ? Math.max(-999, Math.min(999, sortOrder)) : index };
  });
  if (faqs.some((faq) => !faq)) return null;
  return { sectionLabel: sanitizeString(content.sectionLabel, { maxLength: 80 }), faqs };
}

function sanitizeSupportContact(content) {
  if (!content || typeof content !== 'object') return null;
  const buttonLink = sanitizeSupportPageLink(content.buttonLink);
  const email = sanitizeString(content.email, { maxLength: 160 });
  if (buttonLink === null || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return null;
  return { sectionKicker: sanitizeString(content.sectionKicker, { maxLength: 80 }), title: sanitizeString(content.title, { maxLength: 120 }), description: sanitizeString(content.description, { maxLength: MAX_LONG_TEXT_LENGTH }), buttonText: sanitizeString(content.buttonText, { maxLength: 80 }), buttonLink, email };
}

function sanitizeSupportContent(content) {
  if (!content || typeof content !== 'object') return null;
  const cardButtonLink = sanitizeSupportLink(content.cardButtonLink);
  const contactEmail = sanitizeString(content.contactEmail, { maxLength: 160 });
  if (cardButtonLink === null) return null;
  return {
    sectionKicker: sanitizeString(content.sectionKicker, { maxLength: 80 }),
    title: sanitizeString(content.title, { maxLength: 80 }),
    titleHighlight: sanitizeString(content.titleHighlight, { maxLength: 80 }),
    description: sanitizeString(content.description, { maxLength: MAX_LONG_TEXT_LENGTH }),
    cardTitle: sanitizeString(content.cardTitle, { maxLength: 80 }),
    cardDescription: sanitizeString(content.cardDescription, { maxLength: MAX_LONG_TEXT_LENGTH }),
    cardButtonText: sanitizeString(content.cardButtonText, { maxLength: 80 }),
    cardButtonLink,
    faqLabel: sanitizeString(content.faqLabel, { maxLength: 80 }),
    faqs: Array.isArray(content.faqs) ? content.faqs.map((faq) => ({ question: sanitizeString(faq?.question, { maxLength: 120 }), answer: sanitizeString(faq?.answer, { maxLength: MAX_LONG_TEXT_LENGTH }) })).filter((faq) => faq.question || faq.answer).slice(0, 12) : [],
    contactLabel: sanitizeString(content.contactLabel, { maxLength: 80 }),
    contactTitle: sanitizeString(content.contactTitle, { maxLength: 120 }),
    contactEmail,
  };
}

function sanitizeMediaKey(value) {
  const key = sanitizeString(value, { maxLength: 200 });
  if (!key) return '';
  return isSiteMediaKey(key) ? key : null;
}

function sanitizeSectionImageMedia(media, fallbackAlt) {
  if (!media || typeof media !== 'object') return null;
  const imageKey = sanitizeMediaKey(media.imageKey);
  if (imageKey === null) return null;
  return { imageKey, imageAlt: sanitizeString(media.imageAlt, { maxLength: 160 }) || fallbackAlt };
}

function sanitizeFeaturedVideoMedia(media, pageKey = 'support') {
  if (!media || typeof media !== 'object') return null;
  const videoKey = sanitizeString(media.videoKey, { maxLength: 200 });
  const posterImageKey = sanitizeString(media.posterImageKey, { maxLength: 200 });
  const rawVideoUrl = sanitizeString(media.videoUrl, { maxLength: MAX_LINK_LENGTH });
  const videoUrl = rawVideoUrl === '' || parseYouTubeVideoId(rawVideoUrl) || isDirectMp4Url(rawVideoUrl) ? rawVideoUrl : null;
  if (videoUrl === null) return null;
  const videoPattern = pageKey === 'home'
    ? /^site\/home\/featured-video\/[0-9a-f-]{36}\.mp4$/i
    : /^site\/support\/video\/[0-9a-f-]{36}\.mp4$/i;
  const posterPattern = pageKey === 'home'
    ? /^site\/home\/featured-video\/[0-9a-f-]{36}\.(png|jpe?g|webp)$/i
    : /^site\/support\/poster\/[0-9a-f-]{36}\.(png|jpe?g|webp)$/i;
  if (videoKey && !videoPattern.test(videoKey)) return null;
  if (posterImageKey && !posterPattern.test(posterImageKey)) return null;
  return { videoKey, videoUrl, posterImageKey };
}

function sanitizeDownloadsHeader(content) {
  if (!content || typeof content !== 'object') return null;
  const kicker = sanitizeString(content.kicker, { maxLength: 80 });
  const title = sanitizeString(content.title, { maxLength: 80 }) ?? '';
  const titleHighlight = sanitizeString(content.titleHighlight, { maxLength: 80 });
  const subtitle = sanitizeString(content.subtitle, { maxLength: MAX_LONG_TEXT_LENGTH });
  return { kicker, title, titleHighlight, subtitle };
}

function sanitizeInfoBanner(content) {
  if (!content || typeof content !== 'object') return null;
  const text = sanitizeString(content.text, { maxLength: MAX_LONG_TEXT_LENGTH }) ?? '';
  return { text };
}

function sanitizeSearchContent(content) {
  if (!content || typeof content !== 'object') return null;
  const placeholder = sanitizeString(content.placeholder, { maxLength: 80 }) ?? '';
  return { placeholder };
}

function sanitizeCategoryFilter(content) {
  if (!content || typeof content !== 'object') return null;
  const raw = Array.isArray(content.visibleCategories) ? content.visibleCategories : [];
  const visibleCategories = [...new Set(raw.filter((category) => typeof category === 'string' && ALLOWED_CATEGORIES.has(category)))];
  return { visibleCategories };
}

function sanitizeSortContent(content) {
  if (!content || typeof content !== 'object') return null;
  const defaultSort = ALLOWED_SORT_VALUES.has(content.defaultSort) ? content.defaultSort : 'newest';
  return { defaultSort };
}

function sanitizeCardDisplayContent(content) {
  if (!content || typeof content !== 'object') return null;
  const showCategory = Boolean(content.showCategory);
  const showPublishedDate = Boolean(content.showPublishedDate);
  let initialDisplayLimit = Number(content.initialDisplayLimit);
  if (![8, 12, 24, 48].includes(initialDisplayLimit)) initialDisplayLimit = 8;
  return { showCategory, showPublishedDate, initialDisplayLimit };
}

const SANITIZERS = {
  home: {
    hero: sanitizeHeroContent,
    featuredAnimations: sanitizeFeaturedContent,
    characters: sanitizeSimpleSection,
    howItWorks: sanitizeHowItWorksContent,
    downloadCta: sanitizeDownloadCtaContent,
    expression: sanitizeExpressionContent,
    lifestyle: sanitizeLifestyleContent,
    newContent: sanitizeNewContentContent,
    support: sanitizeSupportContent,
    featuredVideo: sanitizeFeaturedVideoContent,
  },
  characters: {
    header: sanitizeCharactersHeaderContent,
    collectionGrid: sanitizeCharactersGridContent,
  },
  support: {
    hero: sanitizeSupportPageHero,
    featuredVideo: sanitizeFeaturedVideoContent,
    faq: sanitizeSupportFaq,
    contactCta: sanitizeSupportContact,
  },
  downloads: {
    header: sanitizeDownloadsHeader,
    infoBanner: sanitizeInfoBanner,
    search: sanitizeSearchContent,
    categoryFilter: sanitizeCategoryFilter,
    sort: sanitizeSortContent,
    cardDisplay: sanitizeCardDisplayContent,
  },
};

const ALLOWED_LAYOUT_STYLES = new Set(['split', 'center']);
const ALLOWED_CONTENT_ALIGNMENTS = new Set(['left', 'center']);
const ALLOWED_SECTION_HEIGHTS = new Set(['small', 'medium', 'large']);
const ALLOWED_TITLE_SIZES = new Set(['small', 'medium', 'large']);
const ALLOWED_TEXT_WIDTHS = new Set(['narrow', 'normal', 'wide']);
const ALLOWED_PADDINGS = new Set(['compact', 'normal', 'spacious']);
const ALLOWED_CHARACTER_WIDTHS = new Set(['small', 'normal', 'large']);
const ALLOWED_GRID_COLUMNS = new Set([1, 2, 3, 4]);
const ALLOWED_CARD_ASPECT_RATIOS = new Set(['auto', '1/1', '4/3', '16/9']);
const ALLOWED_BUTTON_STYLES = new Set(['dark', 'light', 'outline']);
const ALLOWED_STEP_STYLES = new Set(['card', 'minimal']);
const ALLOWED_TONES = new Set(['yellow', 'coral', 'blue', 'pink', 'dark']);
const ALLOWED_SLOT_IDS = new Set(['gray', 'black', 'blue', 'green', 'yellow', 'pink']);
const ALLOWED_CHARACTER_SLOT_IDS = new Set(['everyday', 'mood', 'seasonal', 'special']);
const ALLOWED_MEDIA_TYPES = new Set(['gif', 'mp4', 'image']);

function sanitizeHexColor(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return '';
  return trimmed;
}

function sanitizePercentage(value, min = 0, max = 100) {
  if (typeof value !== 'string') return `${min}%`;
  const match = value.match(/^(\d+(?:\.\d+)?)\%?$/);
  if (!match) return `${min}%`;
  const num = Number.parseFloat(match[1]);
  if (!Number.isFinite(num)) return `${min}%`;
  const clamped = Math.max(min, Math.min(max, num));
  return `${clamped}%`;
}

function sanitizeScale(value, min = 0.5, max = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 1;
  return Math.max(min, Math.min(max, num));
}

function sanitizeHeroDesign(design) {
  if (!design || typeof design !== 'object') return null;
  return {
    layoutStyle: ALLOWED_LAYOUT_STYLES.has(design.layoutStyle) ? design.layoutStyle : 'split',
    contentAlignment: ALLOWED_CONTENT_ALIGNMENTS.has(design.contentAlignment) ? design.contentAlignment : 'left',
    sectionHeight: ALLOWED_SECTION_HEIGHTS.has(design.sectionHeight) ? design.sectionHeight : 'medium',
    titleSize: ALLOWED_TITLE_SIZES.has(design.titleSize) ? design.titleSize : 'large',
    textWidth: ALLOWED_TEXT_WIDTHS.has(design.textWidth) ? design.textWidth : 'normal',
    topPadding: ALLOWED_PADDINGS.has(design.topPadding) ? design.topPadding : 'normal',
    bottomPadding: ALLOWED_PADDINGS.has(design.bottomPadding) ? design.bottomPadding : 'normal',
    contentGap: ALLOWED_PADDINGS.has(design.contentGap) ? design.contentGap : 'normal',
    backgroundColor: sanitizeHexColor(design.backgroundColor),
    backgroundImageKey: sanitizeString(design.backgroundImageKey, { maxLength: 200 }),
    characterScale: sanitizeScale(design.characterScale),
    characterWidth: ALLOWED_CHARACTER_WIDTHS.has(design.characterWidth) ? design.characterWidth : 'normal',
  };
}

function sanitizeGridDesign(design) {
  if (!design || typeof design !== 'object') return null;
  const gridColumns = ALLOWED_GRID_COLUMNS.has(design.gridColumns) ? design.gridColumns : 4;
  const cardGap = ALLOWED_PADDINGS.has(design.cardGap) ? design.cardGap : 'normal';
  const cardAspectRatio = ALLOWED_CARD_ASPECT_RATIOS.has(design.cardAspectRatio) ? design.cardAspectRatio : 'auto';
  return { gridColumns, cardGap, cardAspectRatio, showCategory: Boolean(design.showCategory), showTitle: Boolean(design.showTitle) };
}

function sanitizeCharactersHeaderContent(content) {
  if (!content || typeof content !== 'object') return null;
  return {
    sectionKicker: sanitizeString(content.sectionKicker, { maxLength: 80 }),
    title: sanitizeString(content.title, { maxLength: 80 }),
    titleHighlight: sanitizeString(content.titleHighlight, { maxLength: 80 }),
    description: sanitizeString(content.description, { maxLength: MAX_LONG_TEXT_LENGTH }),
  };
}

function sanitizeCharactersGridContent(content) {
  if (!content || typeof content !== 'object') return null;
  const allowed = new Map([
    ['everyday', { title: 'Everyday Expressions', shortTitle: 'Everyday', description: 'For everyday moods and reactions.', tone: 'yellow', imageKey: '' }],
    ['mood', { title: 'Mood Collection', shortTitle: 'Mood', description: 'Happy, sleepy, excited, silly and more.', tone: 'coral', imageKey: '' }],
    ['seasonal', { title: 'Seasonal Packs', shortTitle: 'Seasonal', description: 'Fresh content for holidays and special moments.', tone: 'blue', imageKey: '' }],
    ['special', { title: 'Special Editions', shortTitle: 'Special', description: 'Unique collections and limited releases.', tone: 'pink', imageKey: '' }],
  ]);
  const raw = Array.isArray(content.collections) ? content.collections : [];
  const bySlot = new Map();
  for (const item of raw) {
    if (!item || !allowed.has(item.slotId) || bySlot.has(item.slotId)) continue;
    const fallback = allowed.get(item.slotId);
    bySlot.set(item.slotId, {
      slotId: item.slotId,
      title: sanitizeString(item.title, { maxLength: 80 }) || fallback.title,
      shortTitle: sanitizeString(item.shortTitle, { maxLength: 40 }) || fallback.shortTitle,
      description: sanitizeString(item.description, { maxLength: 200 }) || fallback.description,
      tone: ALLOWED_TONES.has(item.tone) ? item.tone : fallback.tone,
      imageKey: !item.imageKey || isSiteMediaKey(item.imageKey) ? (item.imageKey || '') : '',
      enabled: item.enabled !== false,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Math.max(-999, Math.min(999, Math.round(Number(item.sortOrder)))) : [...allowed.keys()].indexOf(item.slotId),
    });
  }
  return { collections: [...allowed.keys()].map((slotId, index) => bySlot.get(slotId) || { slotId, ...allowed.get(slotId), enabled: true, sortOrder: index }) };
}

function sanitizeCharactersDesign(design) {
  if (!design || typeof design !== 'object') return null;
  return {
    desktopColumns: [2, 3, 4].includes(Number(design.desktopColumns)) ? Number(design.desktopColumns) : 2,
    tabletColumns: [2, 3, 4].includes(Number(design.tabletColumns)) ? Number(design.tabletColumns) : 2,
    mobileColumns: [1, 2].includes(Number(design.mobileColumns)) ? Number(design.mobileColumns) : 1,
    gridColumns: [2, 3, 4].includes(Number(design.gridColumns)) ? Number(design.gridColumns) : 2,
    cardGap: ALLOWED_PADDINGS.has(design.cardGap) ? design.cardGap : 'normal',
    cardStyle: design.cardStyle === 'minimal' ? 'minimal' : 'default',
    imageScale: ['small', 'normal', 'large'].includes(design.imageScale) ? design.imageScale : 'normal',
  };
}

function sanitizeHowItWorksDesign(design) {
  if (!design || typeof design !== 'object') return null;
  return {
    gridColumns: ALLOWED_GRID_COLUMNS.has(design.gridColumns) ? design.gridColumns : 4,
    showNumbers: Boolean(design.showNumbers),
    stepStyle: ALLOWED_STEP_STYLES.has(design.stepStyle) ? design.stepStyle : 'card',
  };
}

function sanitizeDownloadCtaContent(content) {
  if (!content || typeof content !== 'object') return null;
  const buttonLink = sanitizeLinkField(content.buttonLink);
  if (buttonLink === null) return null;
  return {
    sectionTitle: sanitizeString(content.sectionTitle, { maxLength: 80 }),
    sectionTitleHighlight: sanitizeString(content.sectionTitleHighlight, { maxLength: 80 }),
    sectionKicker: sanitizeString(content.sectionKicker, { maxLength: 80 }),
    sectionSubtitle: sanitizeString(content.sectionSubtitle, { maxLength: MAX_LONG_TEXT_LENGTH }),
    buttonText: sanitizeString(content.buttonText, { maxLength: 80 }),
    buttonLink,
  };
}

function sanitizeDownloadCtaDesign(design) {
  if (!design || typeof design !== 'object') return null;
  return {
    buttonStyle: ALLOWED_BUTTON_STYLES.has(design.buttonStyle) ? design.buttonStyle : 'dark',
    showBackgroundImage: Boolean(design.showBackgroundImage),
  };
}

function sanitizeFeaturedVideoDesign(design) {
  if (!design || typeof design !== 'object') return null;
  return {
    layoutStyle: design.layoutStyle === 'stack' ? 'stack' : 'split',
    mediaWidth: ['narrow', 'normal', 'wide'].includes(design.mediaWidth) ? design.mediaWidth : 'normal',
    spacing: ALLOWED_PADDINGS.has(design.spacing) ? design.spacing : 'normal',
    backgroundColor: sanitizeHexColor(design.backgroundColor),
  };
}

function sanitizeHomeFlexibleDesign(design, layoutStyle = 'split') {
  if (!design || typeof design !== 'object') return null;
  return {
    layoutStyle: design.layoutStyle === 'center' || design.layoutStyle === 'grid' ? design.layoutStyle : layoutStyle,
    contentAlignment: ALLOWED_CONTENT_ALIGNMENTS.has(design.contentAlignment) ? design.contentAlignment : 'left',
    spacing: ALLOWED_PADDINGS.has(design.spacing) ? design.spacing : 'normal',
    backgroundColor: sanitizeHexColor(design.backgroundColor),
  };
}

function sanitizeDownloadsHeaderDesign(design) {
  if (!design || typeof design !== 'object') return null;
  return {
    contentWidth: ALLOWED_TEXT_WIDTHS.has(design.contentWidth) ? design.contentWidth : 'normal',
    alignment: ALLOWED_CONTENT_ALIGNMENTS.has(design.alignment) ? design.alignment : 'left',
    spacing: ALLOWED_PADDINGS.has(design.spacing) ? design.spacing : 'normal',
  };
}

function sanitizeCardDisplayDesign(design) {
  if (!design || typeof design !== 'object') return null;
  return {
    desktopColumns: ALLOWED_GRID_COLUMNS.has(design.desktopColumns) ? design.desktopColumns : 4,
    tabletColumns: ALLOWED_GRID_COLUMNS.has(design.tabletColumns) ? design.tabletColumns : 2,
    mobileColumns: ALLOWED_GRID_COLUMNS.has(design.mobileColumns) ? design.mobileColumns : 1,
    gridColumnsDesktop: ALLOWED_GRID_COLUMNS.has(design.gridColumnsDesktop) ? design.gridColumnsDesktop : 4,
    gridColumnsTablet: ALLOWED_GRID_COLUMNS.has(design.gridColumnsTablet) ? design.gridColumnsTablet : 2,
    gridColumnsMobile: ALLOWED_GRID_COLUMNS.has(design.gridColumnsMobile) ? design.gridColumnsMobile : 1,
    cardGap: ALLOWED_PADDINGS.has(design.cardGap) ? design.cardGap : 'normal',
    previewSize: ALLOWED_TITLE_SIZES.has(design.previewSize) ? design.previewSize : 'normal',
  };
}

function sanitizeHeroAnimationSlot(slot) {
  if (!slot || typeof slot !== 'object') return null;
  const slotId = typeof slot.slotId === 'string' && ALLOWED_SLOT_IDS.has(slot.slotId) ? slot.slotId : null;
  if (!slotId) return null;
  const mediaKey = sanitizeMediaKey(slot.mediaKey);
  if (mediaKey === null) return null;
  return {
    slotId,
    enabled: Boolean(slot.enabled),
    mediaKey,
    type: ALLOWED_MEDIA_TYPES.has(slot.type) ? slot.type : 'gif',
    left: sanitizePercentage(slot.left, 0, 100),
    top: sanitizePercentage(slot.top, 0, 100),
    width: sanitizePercentage(slot.width, 1, 50),
    contentScale: sanitizeScale(slot.contentScale),
  };
}

function sanitizeHeroMedia(media) {
  if (!media || typeof media !== 'object') return null;
  const backgroundImageKey = sanitizeMediaKey(media.backgroundImageKey);
  const characterShowcaseImageKey = sanitizeMediaKey(media.characterShowcaseImageKey);
  if (backgroundImageKey === null || characterShowcaseImageKey === null) return null;
  const rawSlots = Array.isArray(media.heroAnimationSlots) ? media.heroAnimationSlots : [];
  const slots = rawSlots.map(sanitizeHeroAnimationSlot);
  if (slots.some((slot) => !slot)) return null;
  return { backgroundImageKey, characterShowcaseImageKey, heroAnimationSlots: slots };
}

function sanitizeCharacterSlot(slot) {
  if (!slot || typeof slot !== 'object') return null;
  const slotId = typeof slot.slotId === 'string' && ALLOWED_CHARACTER_SLOT_IDS.has(slot.slotId) ? slot.slotId : null;
  if (!slotId) return null;
  return {
    slotId,
    title: sanitizeString(slot.title, { maxLength: 80 }),
    shortTitle: sanitizeString(slot.shortTitle, { maxLength: 40 }),
    description: sanitizeString(slot.description, { maxLength: 200 }),
    tone: ALLOWED_TONES.has(slot.tone) ? slot.tone : 'yellow',
    imageKey: sanitizeString(slot.imageKey, { maxLength: 200 }),
    enabled: Boolean(slot.enabled),
  };
}

function sanitizeCharactersMedia(media) {
  if (!media || typeof media !== 'object') return null;
  const sectionImageKey = sanitizeString(media.sectionImageKey, { maxLength: 200 });
  const characterList = Array.isArray(media.characterList) ? media.characterList.map(sanitizeCharacterSlot).filter(Boolean) : [];
  return { sectionImageKey, characterList };
}

function sanitizeDownloadCtaMedia(media) {
  if (!media || typeof media !== 'object') return null;
  return { backgroundImageKey: sanitizeString(media.backgroundImageKey, { maxLength: 200 }) };
}

function sanitizeLayout(layout) {
  if (!layout || typeof layout !== 'object') return {};
  const breakpoints = layout.visibilityBreakpoints || {};
  return {
    enabled: layout.enabled === undefined ? true : Boolean(layout.enabled),
    sortOrder: typeof layout.sortOrder === 'number' ? Math.max(-999, Math.min(999, Math.round(layout.sortOrder))) : 0,
    visibilityBreakpoints: {
      desktop: breakpoints.desktop === undefined ? true : Boolean(breakpoints.desktop),
      tablet: breakpoints.tablet === undefined ? true : Boolean(breakpoints.tablet),
      mobile: breakpoints.mobile === undefined ? true : Boolean(breakpoints.mobile),
    },
  };
}

function sanitizeSeo(seo) {
  if (!seo || typeof seo !== 'object') return {};
  return {
    pageTitle: sanitizeString(seo.pageTitle, { maxLength: 80 }),
    pageDescription: sanitizeString(seo.pageDescription, { maxLength: 200 }),
    ogImageKey: sanitizeString(seo.ogImageKey, { maxLength: 200 }),
    noIndex: Boolean(seo.noIndex),
  };
}

const DESIGN_SANITIZERS = {
  home: {
    hero: sanitizeHeroDesign,
    featuredAnimations: sanitizeGridDesign,
    characters: sanitizeCharactersDesign,
    howItWorks: sanitizeHowItWorksDesign,
    downloadCta: sanitizeDownloadCtaDesign,
    expression: (design) => sanitizeHomeFlexibleDesign(design, 'split'),
    lifestyle: (design) => sanitizeHomeFlexibleDesign(design, 'split'),
    newContent: (design) => sanitizeHomeFlexibleDesign(design, 'split'),
    support: (design) => sanitizeHomeFlexibleDesign(design, 'grid'),
    featuredVideo: (design) => sanitizeFeaturedVideoDesign(design),
  },
  characters: {
    header: (design) => sanitizeHomeFlexibleDesign(design, 'split'),
    collectionGrid: sanitizeCharactersDesign,
  },
  support: {
    hero: (design) => sanitizeHomeFlexibleDesign(design, 'split'),
    featuredVideo: (design) => ({ layoutStyle: design?.layoutStyle === 'stack' ? 'stack' : 'split', mediaWidth: ['narrow', 'normal', 'wide'].includes(design?.mediaWidth) ? design.mediaWidth : 'normal', spacing: ALLOWED_PADDINGS.has(design?.spacing) ? design.spacing : 'normal', backgroundColor: sanitizeHexColor(design?.backgroundColor) }),
    faq: (design) => ({ layoutStyle: design?.layoutStyle === 'list' ? 'list' : 'grid', spacing: ALLOWED_PADDINGS.has(design?.spacing) ? design.spacing : 'normal', backgroundColor: sanitizeHexColor(design?.backgroundColor) }),
    contactCta: (design) => ({ backgroundColor: sanitizeHexColor(design?.backgroundColor), textAlignment: ALLOWED_CONTENT_ALIGNMENTS.has(design?.textAlignment) ? design.textAlignment : 'left', spacing: ALLOWED_PADDINGS.has(design?.spacing) ? design.spacing : 'normal', buttonStyle: ALLOWED_BUTTON_STYLES.has(design?.buttonStyle) ? design.buttonStyle : 'dark' }),
  },
  downloads: {
    header: sanitizeDownloadsHeaderDesign,
    infoBanner: () => ({}),
    search: () => ({}),
    categoryFilter: () => ({}),
    sort: () => ({}),
    cardDisplay: sanitizeCardDisplayDesign,
  },
};

const MEDIA_SANITIZERS = {
  home: {
    hero: sanitizeHeroMedia,
    featuredAnimations: () => ({}),
    characters: sanitizeCharactersMedia,
    howItWorks: () => ({}),
    downloadCta: sanitizeDownloadCtaMedia,
    expression: (media) => sanitizeSectionImageMedia(media, 'MiYo surrounded by expression ideas'),
    lifestyle: (media) => sanitizeSectionImageMedia(media, 'MiYo digital badge in everyday life'),
    newContent: () => ({}),
    featuredVideo: (media) => sanitizeFeaturedVideoMedia(media, 'home'),
  },
  characters: {
    header: () => ({}),
    collectionGrid: () => ({}),
  },
  support: {
    hero: () => ({}),
    featuredVideo: sanitizeFeaturedVideoMedia,
    faq: () => ({}),
    contactCta: () => ({}),
  },
  downloads: {
    header: () => ({}),
    infoBanner: () => ({}),
    search: () => ({}),
    categoryFilter: () => ({}),
    sort: () => ({}),
    cardDisplay: () => ({}),
  },
};

export function sanitizeSectionContent(pageKey, sectionKey, content) {
  const sanitizer = SANITIZERS[pageKey]?.[sectionKey];
  if (!sanitizer) return null;
  return sanitizer(content);
}

export function sanitizeSectionDesign(pageKey, sectionKey, design) {
  const sanitizer = DESIGN_SANITIZERS[pageKey]?.[sectionKey];
  if (!sanitizer) return {};
  return sanitizer(design);
}

export function sanitizeSectionMedia(pageKey, sectionKey, media) {
  const sanitizer = MEDIA_SANITIZERS[pageKey]?.[sectionKey];
  if (!sanitizer) return {};
  return sanitizer(media);
}

export function validateContent(pageKey, sectionKey, content) {
  if (!isPageKey(pageKey)) return { ok: false, error: `Unknown page_key '${pageKey}'.` };
  const sectionKeys = getSectionKeys(pageKey);
  if (!sectionKeys.includes(sectionKey)) return { ok: false, error: `Unknown section_key '${sectionKey}' for page '${pageKey}'.` };
  const sanitized = sanitizeSectionContent(pageKey, sectionKey, content);
  if (!sanitized) return { ok: false, error: 'Invalid section content.' };
  return { ok: true, content: sanitized };
}

export function validateSection(pageKey, sectionKey, section) {
  if (!isPageKey(pageKey)) return { ok: false, error: `Unknown page_key '${pageKey}'.` };
  const sectionKeys = getSectionKeys(pageKey);
  if (!sectionKeys.includes(sectionKey)) return { ok: false, error: `Unknown section_key '${sectionKey}' for page '${pageKey}'.` };
  
  const contentValidation = validateContent(pageKey, sectionKey, section.content ?? {});
  if (!contentValidation.ok) return contentValidation;
  
  const design = sanitizeSectionDesign(pageKey, sectionKey, section.design ?? {});
  const layout = sanitizeLayout(section.layout ?? {});
  const media = sanitizeSectionMedia(pageKey, sectionKey, section.media ?? {});
  const seo = sanitizeSeo(section.seo ?? {});
  if (design === null || media === null) return { ok: false, error: 'Invalid section design or media.' };

  return {
    ok: true,
    section: {
      content: contentValidation.content,
      design,
      layout,
      media,
      seo,
    },
  };
}

export function rowToSection(row) {
  let parsed = {};
  try { parsed = JSON.parse(row.content_json || '{}'); } catch { parsed = {}; }
  let design = {};
  try { design = JSON.parse(row.design_json || '{}'); } catch { design = {}; }
  let layout = {};
  try { layout = JSON.parse(row.layout_json || '{}'); } catch { layout = {}; }
  let media = {};
  try { media = JSON.parse(row.media_json || '{}'); } catch { media = {}; }
  let seo = {};
  try { seo = JSON.parse(row.seo_json || '{}'); } catch { seo = {}; }
  return {
    sectionKey: row.section_key,
    enabled: Boolean(row.enabled),
    sortOrder: Number(row.sort_order) || 0,
    content: parsed,
    design,
    layout,
    media,
    seo,
  };
}

export function getDefaultPageConfigBackend(pageKey) {
  const page = DEFAULT_PAGE_CONFIG_BACKEND[pageKey];
  if (!page) return null;
  return {
    pageKey,
    sections: Object.entries(page).map(([sectionKey, section]) => ({
      sectionKey,
      enabled: section.enabled,
      sortOrder: section.sortOrder,
      content: section.content,
      design: section.design || {},
      layout: section.layout || {},
      media: section.media || {},
      seo: section.seo || {},
    })),
  };
}
