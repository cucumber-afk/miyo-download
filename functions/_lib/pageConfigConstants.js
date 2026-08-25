export const MAX_TEXT_LENGTH = 200;
export const MAX_LONG_TEXT_LENGTH = 600;
export const MAX_LINK_LENGTH = 500;
export const MAX_ANIMATION_IDS = 24;
export const HOME_HOW_STEP_COUNT = 4;

export const PAGE_KEYS = ['home', 'downloads', 'characters', 'support'];

export function isPageKey(value) {
  return typeof value === 'string' && PAGE_KEYS.includes(value);
}

export const HOME_SECTION_ORDER = ['hero', 'featuredAnimations', 'characters', 'howItWorks', 'downloadCta', 'expression', 'lifestyle', 'newContent', 'support'];

export const HOME_SECTION_LABELS = {
  hero: 'Hero',
  featuredAnimations: 'Featured Animations',
  characters: 'Characters',
  howItWorks: 'How It Works',
  downloadCta: 'Download CTA',
  expression: 'Expression',
  lifestyle: 'Lifestyle',
  newContent: 'New Content',
  support: 'Support',
};

export const DOWNLOADS_SECTION_KEYS = ['header', 'infoBanner', 'search', 'categoryFilter', 'sort', 'cardDisplay'];

export const DOWNLOADS_SECTION_LABELS = {
  header: 'Page Header',
  infoBanner: 'Info Banner',
  search: 'Search',
  categoryFilter: 'Category Filter',
  sort: 'Sort',
  cardDisplay: 'Card Display',
};

export const FEATURED_MODES = [
  { value: 'automatic', label: 'Automatic (featured = true)' },
  { value: 'manual', label: 'Manual Selection' },
];

export const DOWNLOADS_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'A–Z' },
  { value: 'nameDesc', label: 'Z–A' },
];

export const DOWNLOADS_CATEGORY_OPTIONS = ['Expressions', 'Animations', 'Seasonal', 'Special', 'Updates'];

export const HOME_FEATURED_LIMIT_OPTIONS = [4, 6, 8, 12];
export const HOME_FEATURED_LIMIT_DEFAULT = 6;

export const DOWNLOADS_PAGE_SIZE_OPTIONS = [8, 12, 24, 48];
