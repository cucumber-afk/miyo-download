import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getPublicAnimations } from '../api/animations';
import { mapAnimations } from '../data/animationMapper';
import MiYoAnimationCard from '../components/MiYoAnimationCard';
import MiYoCalibrationGallery from '../components/MiYoCalibrationGallery';
import MiYoCalibrationPanel from '../components/MiYoCalibrationPanel';
import { DOWNLOADS_SORT_OPTIONS } from '../data/defaultPageConfig';
import { SHOW_MIYO_CARD_CALIBRATION } from '../data/miyoCharacters';
import { usePublicSiteConfig } from '../hooks/useSiteConfig';

const FALLBACK_PAGE_SIZE = 8;

function sortItems(items, mode) {
  const copy = [...items];
  if (mode === 'name') copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  else if (mode === 'nameDesc') copy.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
  else if (mode === 'oldest') copy.sort((a, b) => new Date(a.publishedAt ?? 0) - new Date(b.publishedAt ?? 0));
  else copy.sort((a, b) => new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0));
  return copy;
}

export default function Downloads() {
  const { sections } = usePublicSiteConfig('downloads');
  const headerSection = sections.header?.content ?? {};
  const bannerEnabled = sections.infoBanner?.enabled !== false;
  const bannerText = sections.infoBanner?.content?.text ?? '';
  const searchEnabled = sections.search?.enabled !== false;
  const searchPlaceholder = sections.search?.content?.placeholder ?? 'Search animations';
  const filterEnabled = sections.categoryFilter?.enabled !== false;
  const visibleCategories = sections.categoryFilter?.content?.visibleCategories ?? [];
  const sortEnabled = sections.sort?.enabled !== false;
  const defaultSort = sections.sort?.content?.defaultSort ?? 'newest';
  const showCategory = sections.cardDisplay?.content?.showCategory !== false;
  const showPublishedDate = sections.cardDisplay?.content?.showPublishedDate !== false;
  const cardDisplayDesign = sections.cardDisplay?.design ?? {};
  const cardLayout = sections.cardDisplay?.layout ?? {};
  const initialLimit = sections.cardDisplay?.content?.initialDisplayLimit ?? FALLBACK_PAGE_SIZE;
  const cardGridStyle = { '--cms-grid-columns-desktop': cardDisplayDesign.desktopColumns || cardDisplayDesign.gridColumnsDesktop || 4, '--cms-grid-columns-tablet': cardDisplayDesign.tabletColumns || cardDisplayDesign.gridColumnsTablet || 2, '--cms-grid-columns-mobile': cardDisplayDesign.mobileColumns || cardDisplayDesign.gridColumnsMobile || 1, '--cms-card-gap': cardDisplayDesign.cardGap === 'compact' ? '10px' : cardDisplayDesign.cardGap === 'spacious' ? '24px' : '16px' };
  const sectionVisibility = (section) => section?.layout?.visibilityBreakpoints || {};
  const visibilityProps = (section) => { const value = sectionVisibility(section); return { className: 'cms-section', 'data-visibility-desktop': value.desktop !== false, 'data-visibility-tablet': value.tablet !== false, 'data-visibility-mobile': value.mobile !== false }; };

  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(defaultSort);
  const [visibleCount, setVisibleCount] = useState(initialLimit);
  const [screenSlots, setScreenSlots] = useState({});
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  useEffect(() => { getPublicAnimations().then((data) => setLibrary(mapAnimations(data.animations))).catch((error) => setLoadError(error.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => { setSort(defaultSort); setVisibleCount(initialLimit); }, [defaultSort, initialLimit]);

  const results = useMemo(() => {
    const sorted = sortItems(library, sort);
    return sorted
      .filter((item) => activeCategory === 'All' || item.category === activeCategory)
      .filter((item) => `${item.title} ${item.category} ${item.description ?? ''} ${(item.tags ?? []).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  }, [activeCategory, query, sort, library]);
  const visibleItems = results.slice(0, visibleCount);

  const chooseCategory = (category) => {
    setActiveCategory(category);
    setVisibleCount(initialLimit);
  };
  const clearFilters = () => {
    setQuery('');
    setActiveCategory('All');
    setVisibleCount(initialLimit);
  };

  if (loading) return <main className="page-wrap page-section downloads-page"><section className="library-empty-state"><div><p className="section-kicker">Library status</p><h2>Loading animations</h2><p>Connecting to the published MiYo library.</p></div></section></main>;
  if (loadError) return <main className="page-wrap page-section downloads-page"><section className="library-empty-state"><div><p className="section-kicker">Library status</p><h2>Library unavailable</h2><p>{loadError}</p></div><button className="text-link" type="button" onClick={() => window.location.reload()}>Retry</button></section></main>;

  const headingTitle = headerSection.title || 'MiYo Animation';
  const headingHighlight = headerSection.titleHighlight || 'Library.';

  return <main className="page-wrap page-section downloads-page">
    <div {...visibilityProps(sections.header)}><div className="section-heading"><div><p className="section-kicker">{headerSection.kicker || 'MiYo Downloads'}</p><h1>{headingTitle}<br /><span>{headingHighlight}</span></h1></div><p>{headerSection.subtitle || 'Browse and download MiYo animations in GIF or MP4 format.'}</p></div></div>
    {bannerEnabled && bannerText && <div {...visibilityProps(sections.infoBanner)}><p className="downloads-format-note">{bannerText}</p></div>}
    {(searchEnabled || sortEnabled) && <div className="library-controls" {...visibilityProps(sections.search)}>
      {searchEnabled && <label className="library-search"><Search size={16} /><span className="sr-only">Search animations</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(initialLimit); }} placeholder={searchPlaceholder} /></label>}
      {sortEnabled && <label className="library-sort" {...visibilityProps(sections.sort)}><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}>{DOWNLOADS_SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}
    </div>}
    {filterEnabled && visibleCategories.length > 0 && <div className="download-filter-row" aria-label="Animation categories" {...visibilityProps(sections.categoryFilter)}><button key="All" className={activeCategory === 'All' ? 'filter-button filter-button--active' : 'filter-button'} type="button" onClick={() => chooseCategory('All')}>All</button>{visibleCategories.map((category) => <button key={category} className={activeCategory === category ? 'filter-button filter-button--active' : 'filter-button'} type="button" onClick={() => chooseCategory(category)}>{category}</button>)}</div>}
    {visibleItems.length > 0 ? <><div className="miyo-animation-grid" style={cardGridStyle} data-visibility-desktop={cardLayout.visibilityBreakpoints?.desktop !== false} data-visibility-tablet={cardLayout.visibilityBreakpoints?.tablet !== false} data-visibility-mobile={cardLayout.visibilityBreakpoints?.mobile !== false}>{visibleItems.map((item) => <MiYoAnimationCard item={item} key={item.id} screenOverride={screenSlots[item.characterColor]} showCategory={showCategory} showPublishedDate={showPublishedDate} />)}</div>{results.length > visibleCount && <button className="load-more-button" type="button" onClick={() => setVisibleCount((count) => count + initialLimit)}>Load More</button>}</> : <section className="library-empty-state"><div><p className="section-kicker">Library status</p><h2>{library.length === 0 ? 'Coming Soon' : 'No matching animations'}</h2><p>{library.length === 0 ? 'New MiYo animations are coming soon.' : 'Try a different search or category.'}</p></div>{(query || activeCategory !== 'All') && <button className="text-link" type="button" onClick={clearFilters}>Clear filters</button>}</section>}
    {SHOW_MIYO_CARD_CALIBRATION && <><MiYoCalibrationPanel onSlotsChange={setScreenSlots} /><MiYoCalibrationGallery slots={screenSlots} /></>}
  </main>;
}