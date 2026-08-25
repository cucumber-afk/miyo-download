export const PAGE_KEYS = ['home', 'downloads', 'characters', 'support'];

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

export const HOME_HOW_STEP_COUNT = 4;

export const DOWNLOADS_PAGE_SIZE_OPTIONS = [8, 12, 24, 48];

export const DEFAULT_PAGE_CONFIG = {
  home: {
    hero: {
      enabled: true,
      sortOrder: 0,
      content: {
        eyebrow: 'MiYo Digital Expression Characters',
        title: 'Bring MiYo',
        titleHighlight: 'to life.',
        description: 'Your MiYo is more than one expression. Download new expressions, animations, and content to help your digital companion keep growing.',
        primaryButtonText: 'Browse animations',
        primaryButtonLink: '/downloads',
        stats: [
          { label: 'Regular updates', value: 'Content that keeps expanding' },
          { label: 'Many expressions', value: 'For every mood' },
          { label: 'Animated previews', value: 'Bring your character to life' },
        ],
      },
      design: {
        layoutStyle: 'split',
        contentAlignment: 'left',
        sectionHeight: 'medium',
        titleSize: 'large',
        textWidth: 'normal',
        topPadding: 'normal',
        bottomPadding: 'normal',
        contentGap: 'normal',
        backgroundColor: '',
        backgroundImageKey: '',
        characterScale: 1,
        characterWidth: 'normal',
      },
      layout: {
        enabled: true,
        sortOrder: 0,
        visibilityBreakpoints: { desktop: true, tablet: true, mobile: true },
      },
      media: {
        backgroundImageKey: '',
        characterShowcaseImageKey: '',
        heroAnimationSlots: [
          { slotId: 'gray', enabled: true, mediaKey: '', type: 'gif', left: '10.9%', top: '53.0%', width: '8.4%', contentScale: 1 },
          { slotId: 'black', enabled: true, mediaKey: '', type: 'gif', left: '26.4%', top: '53.0%', width: '8.4%', contentScale: 1 },
          { slotId: 'blue', enabled: true, mediaKey: '', type: 'gif', left: '42.0%', top: '53.0%', width: '8.4%', contentScale: 1 },
          { slotId: 'green', enabled: true, mediaKey: '', type: 'gif', left: '57.7%', top: '53.0%', width: '8.4%', contentScale: 1 },
          { slotId: 'yellow', enabled: true, mediaKey: '', type: 'gif', left: '73.3%', top: '53.0%', width: '8.4%', contentScale: 1 },
          { slotId: 'pink', enabled: true, mediaKey: '', type: 'gif', left: '89.1%', top: '53.7%', width: '8.4%', contentScale: 1 },
        ],
      },
      seo: {},
    },
    featuredAnimations: {
      enabled: true,
      sortOrder: 1,
      content: {
        mode: 'automatic',
        limit: HOME_FEATURED_LIMIT_DEFAULT,
        sectionTitle: 'Featured',
        sectionTitleHighlight: 'animations.',
        sectionSubtitle: 'Preview official MiYo animations on the figure before you download them.',
        sectionKicker: 'Official animation library',
        emptyTitle: 'Coming Soon',
        emptyDescription: 'New official animations will appear here once they are ready to download.',
      },
      design: {
        gridColumns: 4,
        cardAspectRatio: 'auto',
        cardGap: 'normal',
        showCategory: true,
        showTitle: true,
      },
      layout: {
        enabled: true,
        sortOrder: 1,
        visibilityBreakpoints: { desktop: true, tablet: true, mobile: true },
      },
      media: {},
      seo: {},
    },
    characters: {
      enabled: true,
      sortOrder: 2,
      content: {
        sectionTitle: 'A whole world',
        sectionTitleHighlight: 'of MiYo.',
        sectionKicker: 'MiYo character ecosystem',
        sectionSubtitle: 'New moods, themes and special collections keep your MiYo feeling fresh.',
      },
      design: {
        gridColumns: 2,
        layoutStyle: 'grid',
      },
      layout: {
        enabled: true,
        sortOrder: 2,
        visibilityBreakpoints: { desktop: true, tablet: true, mobile: true },
      },
      media: {
        sectionImageKey: '',
        characterList: [
          { slotId: 'everyday', title: 'Everyday Expressions', shortTitle: 'Everyday', description: 'For everyday moods and reactions.', tone: 'yellow', imageKey: '', enabled: true },
          { slotId: 'mood', title: 'Mood Collection', shortTitle: 'Mood', description: 'Happy, sleepy, excited, silly and more.', tone: 'coral', imageKey: '', enabled: true },
          { slotId: 'seasonal', title: 'Seasonal Packs', shortTitle: 'Seasonal', description: 'Fresh content for holidays and special moments.', tone: 'blue', imageKey: '', enabled: true },
          { slotId: 'special', title: 'Special Editions', shortTitle: 'Special', description: 'Unique collections and limited releases.', tone: 'pink', imageKey: '', enabled: true },
        ],
      },
      seo: {},
    },
    howItWorks: {
      enabled: true,
      sortOrder: 3,
      content: {
        sectionTitle: 'Make it',
        sectionTitleHighlight: 'yours.',
        sectionKicker: 'From library to badge',
        sectionSubtitle: 'Bring new character content from the library to your MiYo digital badge.',
        steps: [
          { number: '01', title: 'Choose', description: 'Pick an animation or expression.' },
          { number: '02', title: 'Download', description: 'Save the content to your device.' },
          { number: '03', title: 'Transfer', description: 'Move it to your MiYo badge.' },
          { number: '04', title: 'Enjoy', description: 'Give your MiYo a new mood.' },
        ],
      },
      design: {
        gridColumns: 4,
        showNumbers: true,
        stepStyle: 'card',
      },
      layout: {
        enabled: true,
        sortOrder: 3,
        visibilityBreakpoints: { desktop: true, tablet: true, mobile: true },
      },
      media: {},
      seo: {},
    },
    downloadCta: {
      enabled: true,
      sortOrder: 4,
      content: {
        sectionTitle: 'Content made',
        sectionTitleHighlight: 'to move.',
        sectionKicker: 'Your MiYo download center',
        sectionSubtitle: 'Discover new animations, expressions, wallpapers and updates for your MiYo digital badge.',
        buttonText: 'Browse downloads',
        buttonLink: '/downloads',
      },
      design: {
        buttonStyle: 'dark',
        showBackgroundImage: false,
      },
      layout: {
        enabled: true,
        sortOrder: 4,
        visibilityBreakpoints: { desktop: true, tablet: true, mobile: true },
      },
      media: {
        backgroundImageKey: '',
      },
      seo: {},
    },
    expression: {
      enabled: true,
      sortOrder: 5,
      content: {
        sectionKicker: 'Growing expression library',
        title: 'Expressions for',
        titleHighlight: 'every mood.',
        description: 'Discover an ever-growing collection of animations and expressions made for your MiYo.',
        tags: ['Happy', 'Sleepy', 'Love', 'Funny', 'Cool', 'Surprised', 'Seasonal', 'More'],
        note: 'New content added regularly.',
      },
      design: { layoutStyle: 'split', contentAlignment: 'left', spacing: 'normal', backgroundColor: '' },
      layout: { enabled: true, sortOrder: 5, visibilityBreakpoints: { desktop: true, tablet: true, mobile: true } },
      media: { imageKey: '', imageAlt: 'MiYo surrounded by expression ideas' },
      seo: {},
    },
    lifestyle: {
      enabled: true,
      sortOrder: 6,
      content: {
        sectionKicker: 'Made for everyday life',
        title: 'Your MiYo,',
        titleHighlight: 'always with you.',
        description: 'A tiny digital companion for every moment.',
        scenes: ['On Your Bag', 'On Your Desk', 'At Home', 'On the Go'],
      },
      design: { layoutStyle: 'split', contentAlignment: 'left', spacing: 'normal', backgroundColor: '' },
      layout: { enabled: true, sortOrder: 6, visibilityBreakpoints: { desktop: true, tablet: true, mobile: true } },
      media: { imageKey: '', imageAlt: 'MiYo digital badge in everyday life' },
      seo: {},
    },
    newContent: {
      enabled: true,
      sortOrder: 7,
      content: {
        sectionKicker: 'Always growing',
        title: "There's always",
        titleHighlight: 'something new.',
        description: 'The MiYo library keeps growing with new expressions, seasonal drops and special collections.',
        items: ['New Expressions', 'Seasonal Drops', 'Special Packs', 'More Coming Soon'],
      },
      design: { layoutStyle: 'split', contentAlignment: 'left', spacing: 'normal', backgroundColor: '' },
      layout: { enabled: true, sortOrder: 7, visibilityBreakpoints: { desktop: true, tablet: true, mobile: true } },
      media: {},
      seo: {},
    },
    support: {
      enabled: true,
      sortOrder: 8,
      content: {
        sectionKicker: 'Support',
        title: 'Keep your MiYo',
        titleHighlight: 'in motion.',
        description: 'Setup guidance and answers for your digital companion.',
        cardTitle: 'Start here',
        cardDescription: 'Explore the basics of your MiYo content library.',
        cardButtonText: 'Start here',
        cardButtonLink: 'mailto:hello@miyostudio.com',
        faqLabel: 'Support topics',
        faqs: [
          { question: 'Getting Started', answer: 'A simple place to begin exploring the MiYo content library.' },
          { question: 'How to Transfer Content', answer: 'Download official content, then use your MiYo transfer workflow to move it to the badge.' },
          { question: 'FAQ', answer: 'Find answers about content, updates, and the growing library here.' },
        ],
        contactLabel: 'Need more help?',
        contactTitle: 'Contact MiYo Studio',
        contactEmail: 'hello@miyostudio.com',
      },
      design: { layoutStyle: 'grid', contentAlignment: 'left', spacing: 'normal', backgroundColor: '' },
      layout: { enabled: true, sortOrder: 8, visibilityBreakpoints: { desktop: true, tablet: true, mobile: true } },
      media: { videoKey: '', posterImageKey: '' },
      seo: {},
    },
  },
  support: {
    hero: {
      enabled: true, sortOrder: 0,
      content: { sectionKicker: 'Support', title: 'Keep your MiYo', titleHighlight: 'in motion.', description: 'Setup guidance and answers for your digital companion.' },
      design: { contentAlignment: 'left', spacing: 'normal', backgroundColor: '' }, layout: { enabled: true, sortOrder: 0, visibilityBreakpoints: { desktop: true, tablet: true, mobile: true } }, media: {}, seo: {},
    },
    featuredVideo: {
      enabled: true, sortOrder: 1,
      content: { title: 'Start here', description: 'Explore the basics of your MiYo content library.', buttonText: 'Start here', buttonLink: 'mailto:hello@miyostudio.com' },
      design: { layoutStyle: 'split', mediaWidth: 'normal', spacing: 'normal', backgroundColor: '' }, layout: { enabled: true, sortOrder: 1, visibilityBreakpoints: { desktop: true, tablet: true, mobile: true } }, media: { videoKey: '', videoUrl: '', posterImageKey: '' }, seo: {},
    },
    faq: {
      enabled: true, sortOrder: 2,
      content: { sectionLabel: 'Support topics', faqs: [{ id: 'getting-started', question: 'Getting Started', answer: 'A simple place to begin exploring the MiYo content library.', enabled: true, sortOrder: 0 }, { id: 'transfer-content', question: 'How to Transfer Content', answer: 'Download official content, then use your MiYo transfer workflow to move it to the badge.', enabled: true, sortOrder: 1 }, { id: 'faq', question: 'FAQ', answer: 'Find answers about content, updates, and the growing library here.', enabled: true, sortOrder: 2 }] },
      design: { layoutStyle: 'grid', spacing: 'normal', backgroundColor: '' }, layout: { enabled: true, sortOrder: 2, visibilityBreakpoints: { desktop: true, tablet: true, mobile: true } }, media: {}, seo: {},
    },
    contactCta: {
      enabled: true, sortOrder: 3,
      content: { sectionKicker: 'Need more help?', title: 'Contact MiYo Studio', description: 'Reach out and we will help you keep your MiYo in motion.', buttonText: 'Email support', buttonLink: 'mailto:hello@miyostudio.com', email: 'hello@miyostudio.com' },
      design: { backgroundColor: '', textAlignment: 'left', spacing: 'normal', buttonStyle: 'dark' }, layout: { enabled: true, sortOrder: 3, visibilityBreakpoints: { desktop: true, tablet: true, mobile: true } }, media: {}, seo: {},
    },
  },
  characters: {
    header: {
      enabled: true,
      sortOrder: 0,
      content: { sectionKicker: 'Characters', title: 'Explore the', titleHighlight: 'MiYo world.', description: 'New collections will appear here as the MiYo character library grows.' },
      design: { contentAlignment: 'left', spacing: 'normal', backgroundColor: '' },
      layout: { enabled: true, sortOrder: 0, visibilityBreakpoints: { desktop: true, tablet: true, mobile: true } },
      media: {},
      seo: {},
    },
    collectionGrid: {
      enabled: true,
      sortOrder: 1,
      content: { collections: [
        { slotId: 'everyday', title: 'Everyday Expressions', shortTitle: 'Everyday', description: 'For everyday moods and reactions.', tone: 'yellow', enabled: true, sortOrder: 0, imageKey: '' },
        { slotId: 'mood', title: 'Mood Collection', shortTitle: 'Mood', description: 'Happy, sleepy, excited, silly and more.', tone: 'coral', enabled: true, sortOrder: 1, imageKey: '' },
        { slotId: 'seasonal', title: 'Seasonal Packs', shortTitle: 'Seasonal', description: 'Fresh content for holidays and special moments.', tone: 'blue', enabled: true, sortOrder: 2, imageKey: '' },
        { slotId: 'special', title: 'Special Editions', shortTitle: 'Special', description: 'Unique collections and limited releases.', tone: 'pink', enabled: true, sortOrder: 3, imageKey: '' },
      ] },
      design: { desktopColumns: 2, tabletColumns: 2, mobileColumns: 1, gridColumns: 2, cardGap: 'normal', cardStyle: 'default', imageScale: 'normal' },
      layout: { enabled: true, sortOrder: 1, visibilityBreakpoints: { desktop: true, tablet: true, mobile: true } },
      media: {},
      seo: {},
    },
  },
  downloads: {
    header: {
      enabled: true,
      sortOrder: 0,
      content: {
        kicker: 'MiYo Downloads',
        title: 'MiYo Animation',
        titleHighlight: 'Library.',
        subtitle: 'Browse and download MiYo animations in GIF or MP4 format.',
      },
      design: {
        contentWidth: 'normal',
        alignment: 'left',
        spacing: 'normal',
      },
      layout: {
        enabled: true,
        sortOrder: 0,
        visibilityBreakpoints: { desktop: true, tablet: true, mobile: true },
      },
      media: {},
      seo: {},
    },
    infoBanner: {
      enabled: true,
      sortOrder: 1,
      content: {
        text: 'MiYo supports both GIF and MP4. GIF has no audio; use MP4 for animations with sound.',
      },
      design: {},
      layout: {
        enabled: true,
        sortOrder: 1,
        visibilityBreakpoints: { desktop: true, tablet: true, mobile: true },
      },
      media: {},
      seo: {},
    },
    search: {
      enabled: true,
      sortOrder: 2,
      content: {
        placeholder: 'Search animations',
      },
      design: {},
      layout: {
        enabled: true,
        sortOrder: 2,
        visibilityBreakpoints: { desktop: true, tablet: true, mobile: true },
      },
      media: {},
      seo: {},
    },
    categoryFilter: {
      enabled: true,
      sortOrder: 3,
      content: {
        visibleCategories: DOWNLOADS_CATEGORY_OPTIONS,
      },
      design: {},
      layout: {
        enabled: true,
        sortOrder: 3,
        visibilityBreakpoints: { desktop: true, tablet: true, mobile: true },
      },
      media: {},
      seo: {},
    },
    sort: {
      enabled: true,
      sortOrder: 4,
      content: {
        defaultSort: 'newest',
      },
      design: {},
      layout: {
        enabled: true,
        sortOrder: 4,
        visibilityBreakpoints: { desktop: true, tablet: true, mobile: true },
      },
      media: {},
      seo: {},
    },
    cardDisplay: {
      enabled: true,
      sortOrder: 5,
      content: {
        showCategory: true,
        showPublishedDate: true,
        initialDisplayLimit: 8,
      },
      design: {
        desktopColumns: 4,
        tabletColumns: 2,
        mobileColumns: 1,
        gridColumnsDesktop: 4,
        gridColumnsTablet: 2,
        gridColumnsMobile: 1,
        cardGap: 'normal',
        previewSize: 'normal',
      },
      layout: {
        enabled: true,
        sortOrder: 5,
        visibilityBreakpoints: { desktop: true, tablet: true, mobile: true },
      },
      media: {},
      seo: {},
    },
  },
};

export function getDefaultPageConfig(pageKey) {
  const page = DEFAULT_PAGE_CONFIG[pageKey];
  if (!page) return null;
  return {
    pageKey,
    sections: Object.entries(page).map(([sectionKey, section]) => ({
      sectionKey,
      enabled: section.enabled,
      sortOrder: section.sortOrder,
      content: section.content,
    })),
  };
}

export function getSectionConfig(pageKey, sectionKey) {
  const section = DEFAULT_PAGE_CONFIG[pageKey]?.[sectionKey];
  if (!section) return null;
  return {
    pageKey,
    sectionKey,
    enabled: section.enabled,
    sortOrder: section.sortOrder,
    content: section.content,
  };
}
