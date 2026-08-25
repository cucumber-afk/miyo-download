import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { usePublicSiteConfig } from '../hooks/useSiteConfig';

const FALLBACK_COLLECTIONS = [
  { slotId: 'everyday', title: 'Everyday Expressions', shortTitle: 'Everyday', description: 'For everyday moods and reactions.', tone: 'yellow', enabled: true, sortOrder: 0, imageKey: '' },
  { slotId: 'mood', title: 'Mood Collection', shortTitle: 'Mood', description: 'Happy, sleepy, excited, silly and more.', tone: 'coral', enabled: true, sortOrder: 1, imageKey: '' },
  { slotId: 'seasonal', title: 'Seasonal Packs', shortTitle: 'Seasonal', description: 'Fresh content for holidays and special moments.', tone: 'blue', enabled: true, sortOrder: 2, imageKey: '' },
  { slotId: 'special', title: 'Special Editions', shortTitle: 'Special', description: 'Unique collections and limited releases.', tone: 'pink', enabled: true, sortOrder: 3, imageKey: '' },
];

function visibilityProps(section) {
  const breakpoints = section?.layout?.visibilityBreakpoints || {};
  return { className: 'cms-section', 'data-visibility-desktop': breakpoints.desktop !== false, 'data-visibility-tablet': breakpoints.tablet !== false, 'data-visibility-mobile': breakpoints.mobile !== false };
}

export default function Characters({ onNavigate }) {
  const { sections } = usePublicSiteConfig('characters');
  const header = sections.header || {};
  const headerContent = header.content || {};
  const grid = sections.collectionGrid || {};
  const gridContent = grid.content || {};
  const design = grid.design || {};
  const collections = useMemo(() => (Array.isArray(gridContent.collections) && gridContent.collections.length ? gridContent.collections : FALLBACK_COLLECTIONS)
    .filter((item) => item.enabled !== false)
    .map((item, index) => ({ ...item, sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index }))
    .sort((a, b) => a.sortOrder - b.sortOrder), [gridContent.collections]);
  const gridStyle = {
    '--cms-grid-columns-desktop': design.desktopColumns || 2,
    '--cms-grid-columns-tablet': design.tabletColumns || 2,
    '--cms-grid-columns-mobile': design.mobileColumns || 1,
    '--cms-card-gap': design.cardGap === 'compact' ? '10px' : design.cardGap === 'spacious' ? '24px' : '14px',
  };
  const headerStyle = header.design?.backgroundColor ? { backgroundColor: header.design.backgroundColor } : undefined;
  if (header.enabled === false && grid.enabled === false) return null;
  return <main className="page-wrap page-section characters-page">
    {header.enabled !== false && <section {...visibilityProps(header)} style={headerStyle}><div className="section-heading"><div><p className="section-kicker">{headerContent.sectionKicker || 'Characters'}</p><h1>{headerContent.title || 'Explore the'}<br /><span>{headerContent.titleHighlight || 'MiYo world.'}</span></h1></div><p>{headerContent.description || 'New collections will appear here as the MiYo character library grows.'}</p></div></section>}
    {grid.enabled !== false && <section {...visibilityProps(grid)}><div className="page-collection-grid characters-collection-grid" style={gridStyle} data-card-style={design.cardStyle || 'default'} data-image-scale={design.imageScale || 'normal'}>{collections.map((collection, index) => <article className={`page-collection page-collection--${collection.tone}`} key={collection.slotId}><span>0{index + 1}</span>{collection.imageKey && <img className="characters-collection-image" src={`/api/media?key=${encodeURIComponent(collection.imageKey)}`} alt="" /> }<div><small>{collection.shortTitle}</small><h2>{collection.title}</h2><p>{collection.description}</p></div><button className="icon-button" onClick={() => onNavigate('/downloads')} aria-label={`View ${collection.title}`}><ArrowRight size={17} /></button></article>)}</div></section>}
  </main>;
}
