// Add entries only after the files exist under public/assets/animations/library/.
// characterColor selects the MiYo shell; contentScale adjusts only the media inside its screen.
export const animationLibrary = [];

export const animationCategories = [
  'All',
  'Expressions',
  'Animations',
  'Seasonal',
  'Special',
  'Updates',
];

export const animationSortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name' },
];

// Entry shape:
// { id, title, category, preview: { type, src }, downloads: {
//   gif?: { src, fileName, fileSize }, mp4?: { src, fileName, fileSize }
// }, description, tags, featured, publishedAt, characterColor, contentScale }
