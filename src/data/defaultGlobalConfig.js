export const DEFAULT_GLOBAL_CONFIG = {
  navigation: {
    content: {
      logoText: 'MiYo Studio',
      menu: [{ label: 'Home', path: '/', enabled: true, sortOrder: 0 }, { label: 'Downloads', path: '/downloads', enabled: true, sortOrder: 1 }, { label: 'Admin', path: '/admin', enabled: true, sortOrder: 2 }],
      button: { text: 'Browse downloads', link: '/downloads', enabled: false },
    },
    design: {},
    media: { logoImageKey: '' },
  },
  footer: {
    content: { logoText: 'MiYo Studio', description: 'Official digital badge content platform', links: [], copyrightText: '© 2026 MiYo Studio', social: [] },
    design: {},
    media: { logoImageKey: '' },
  },
  seo: {
    content: { title: 'MiYo Studio | Digital Character Badges', description: 'MiYo Studio digital character badges and animation downloads.', keywords: '', ogImageKey: '', faviconKey: '' },
    design: {},
    media: {},
  },
};
