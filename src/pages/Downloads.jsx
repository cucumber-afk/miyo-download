import { Download, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getPublicAnimations } from '../api/animations';
import { mapAnimations } from '../data/animationMapper';
import MiYoAnimationCard from '../components/MiYoAnimationCard';
import MiYoCalibrationGallery from '../components/MiYoCalibrationGallery';
import MiYoCalibrationPanel from '../components/MiYoCalibrationPanel';
import MiYoScreenPreview from '../components/MiYoScreenPreview';
import { getDownloadFileName, getDownloadUrl } from '../utils/downloadMedia';
import { formatUtcDate, getUtcTimestampTitle } from '../utils/formatTimestamp';
import { animationCategories, animationSortOptions } from '../data/animationLibraryConstants';
import { SHOW_MIYO_CARD_CALIBRATION } from '../data/miyoCharacters';

const PAGE_SIZE = 8;

function AnimationDownload({ format, file, title }) {
  const isGif = format === 'gif';
  const label = isGif ? 'GIF' : 'MP4';
  const detail = [isGif ? 'No Audio' : 'Audio Supported', file.fileSize].filter(Boolean).join(' · ');
  const fileName = getDownloadFileName(file, title, format);

  return <div className="animation-download-option"><div><strong>{label}</strong><p>{detail}</p></div><a className="button button--dark button--small" href={getDownloadUrl(file.src, fileName)} download={fileName}><Download size={14} />Download {label}</a></div>;
}

function CreationRecord({ item }) {
  const showUpdated = item.updatedAt && item.updatedAt !== item.createdAt;

  return <section className="animation-creation-record" aria-label="Creation Record"><h3>Creation Record</h3><p>MiYo Studio records creation and first-publication timestamps for each animation.</p><dl><div><dt>Created</dt><dd title={getUtcTimestampTitle(item.createdAt)}>{formatUtcDate(item.createdAt)}</dd></div><div><dt>First Published</dt><dd title={getUtcTimestampTitle(item.publishedAt)}>{item.publishedAt ? formatUtcDate(item.publishedAt) : 'Not published yet'}</dd></div>{showUpdated && <div><dt>Last Updated</dt><dd title={getUtcTimestampTitle(item.updatedAt)}>{formatUtcDate(item.updatedAt)}</dd></div>}</dl></section>;
}

function AnimationModal({ item, onClose, slots }) {
  if (!item) return null;

  return <div className="animation-modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="animation-modal" aria-modal="true" aria-labelledby="animation-modal-title" role="dialog" onMouseDown={(event) => event.stopPropagation()}>
      <button className="modal-close-button" type="button" onClick={onClose} aria-label="Close preview"><X size={18} /></button>
      <div className="animation-modal-preview"><MiYoScreenPreview item={item} size="modal" screenOverride={slots[item.characterColor]} /></div>
      <div className="animation-modal-details"><p className="card-mood">{item.category}</p><h2 id="animation-modal-title">{item.title}</h2>{item.description && <p>{item.description}</p>}{item.tags?.length > 0 && <div className="animation-tag-list">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}<CreationRecord item={item} />{(item.downloads?.gif?.src || item.downloads?.mp4?.src) && <section className="animation-download-list" aria-label="Available Downloads"><h3>Available Downloads</h3><p className="animation-download-note">GIF files do not contain audio. Choose MP4 when you want an animation with sound.</p>{item.downloads.gif?.src && <AnimationDownload format="gif" file={item.downloads.gif} title={item.title} />}{item.downloads.mp4?.src && <AnimationDownload format="mp4" file={item.downloads.mp4} title={item.title} />}</section>}</div>
    </section>
  </div>;
}

export default function Downloads() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedItem, setSelectedItem] = useState(null);
  const [screenSlots, setScreenSlots] = useState({});
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  useEffect(() => { getPublicAnimations().then((data) => setLibrary(mapAnimations(data.animations))).catch((error) => setLoadError(error.message)).finally(() => setLoading(false)); }, []);

  const results = useMemo(() => library
    .filter((item) => activeCategory === 'All' || item.category === activeCategory)
    .filter((item) => `${item.title} ${item.category} ${item.description ?? ''} ${(item.tags ?? []).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((first, second) => sort === 'name' ? first.title.localeCompare(second.title) : new Date(second.publishedAt ?? 0) - new Date(first.publishedAt ?? 0)), [activeCategory, query, sort, library]);
  const visibleItems = results.slice(0, visibleCount);

  const chooseCategory = (category) => {
    setActiveCategory(category);
    setVisibleCount(PAGE_SIZE);
  };
  const clearFilters = () => {
    setQuery('');
    setActiveCategory('All');
    setVisibleCount(PAGE_SIZE);
  };

  if (loading) return <main className="page-wrap page-section downloads-page"><section className="library-empty-state"><div><p className="section-kicker">Library status</p><h2>Loading animations</h2><p>Connecting to the published MiYo library.</p></div></section></main>;
  if (loadError) return <main className="page-wrap page-section downloads-page"><section className="library-empty-state"><div><p className="section-kicker">Library status</p><h2>Library unavailable</h2><p>{loadError}</p></div><button className="text-link" type="button" onClick={() => window.location.reload()}>Retry</button></section></main>;
  return <main className="page-wrap page-section downloads-page">
    <div className="section-heading"><div><p className="section-kicker">MiYo Downloads</p><h1>MiYo Animation<br /><span>Library.</span></h1></div><p>Preview every animation on MiYo before you download it.</p></div>
    <p className="downloads-format-note">MiYo supports both GIF and MP4. GIF has no audio; use MP4 for animations with sound.</p>
    <div className="library-controls">
      <label className="library-search"><Search size={16} /><span className="sr-only">Search animations</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder="Search animations" /></label>
      <label className="library-sort"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}>{animationSortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    </div>
    <div className="download-filter-row" aria-label="Animation categories">{animationCategories.map((category) => <button key={category} className={activeCategory === category ? 'filter-button filter-button--active' : 'filter-button'} type="button" onClick={() => chooseCategory(category)}>{category}</button>)}</div>
    {visibleItems.length > 0 ? <><div className="miyo-animation-grid">{visibleItems.map((item) => <MiYoAnimationCard item={item} key={item.id} onPreview={setSelectedItem} screenOverride={screenSlots[item.characterColor]} />)}</div>{results.length > visibleCount && <button className="load-more-button" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Load More</button>}</> : <section className="library-empty-state"><div><p className="section-kicker">Library status</p><h2>{library.length === 0 ? 'Coming Soon' : 'No matching animations'}</h2><p>{library.length === 0 ? 'New MiYo animations are coming soon.' : 'Try a different search or category.'}</p></div>{(query || activeCategory !== 'All') && <button className="text-link" type="button" onClick={clearFilters}>Clear filters</button>}</section>}
    {SHOW_MIYO_CARD_CALIBRATION && <><MiYoCalibrationPanel onSlotsChange={setScreenSlots} /><MiYoCalibrationGallery slots={screenSlots} /></>}
    <AnimationModal item={selectedItem} onClose={() => setSelectedItem(null)} slots={screenSlots} />
  </main>;
}
