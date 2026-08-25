import { Clock3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import MiYoScreenPreview from './MiYoScreenPreview';
import { getFeaturedAnimations, getPublicAnimations } from '../api/animations';
import { mapAnimations } from '../data/animationMapper';

function applyManualOrder(items, orderedIds, limit) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = [];
  for (const id of orderedIds || []) {
    const item = byId.get(id);
    if (item) ordered.push(item);
  }
  return ordered.slice(0, limit);
}

export default function AnimationLibrarySection({ content = {}, design = {}, layout = {} }) {
  const { mode = 'automatic', limit = 6, sectionTitle = '', sectionTitleHighlight = '', sectionSubtitle = '', sectionKicker = '', emptyTitle = 'Coming Soon', emptyDescription = '', animationIds = [] } = content;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const gridColumns = Number.isInteger(design.gridColumns) ? design.gridColumns : 4;
  const cardGap = design.cardGap || 'normal';
  const cardAspectRatio = design.cardAspectRatio || 'auto';
  const sectionStyle = { '--cms-grid-columns': gridColumns, '--cms-card-gap': cardGap === 'compact' ? '10px' : cardGap === 'spacious' ? '24px' : '16px' };

  useEffect(() => {
    let cancelled = false;
    const request = mode === 'manual' ? getPublicAnimations({ limit: 100 }) : getFeaturedAnimations();
    request.then((data) => {
      if (cancelled) return;
      const next = mapAnimations(data.animations || []);
      setItems(mode === 'manual' ? applyManualOrder(next, animationIds, limit) : next.slice(0, limit));
    }).catch(() => { if (!cancelled) setItems([]); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [mode, limit, JSON.stringify(animationIds)]);

  const heading = useMemo(() => (
    <div className="section-heading">
      <div>{sectionKicker && <p className="section-kicker">{sectionKicker}</p>}<h2>{sectionTitle}<br />{sectionTitleHighlight && <i>{sectionTitleHighlight}</i>}</h2></div>
      {sectionSubtitle && <p>{sectionSubtitle}</p>}
    </div>
  ), [sectionKicker, sectionTitle, sectionTitleHighlight, sectionSubtitle]);

  return <section className="library-feature-section" style={sectionStyle} data-card-aspect-ratio={cardAspectRatio} data-visibility-desktop={layout.visibilityBreakpoints?.desktop !== false} data-visibility-tablet={layout.visibilityBreakpoints?.tablet !== false} data-visibility-mobile={layout.visibilityBreakpoints?.mobile !== false}><div className="page-wrap">
    {heading}
    {items.length > 0 ? <div className="miyo-animation-grid miyo-animation-grid--featured">{items.map((item) => <article className="miyo-animation-card" key={item.id}><div className="miyo-animation-card-figure"><MiYoScreenPreview item={item} size="card" /></div><div className="miyo-animation-card-body"><div className="miyo-animation-card-meta"><h2>{item.title}</h2><p className="card-mood">{item.category}</p></div></div></article>)}</div> : loading ? <div className="library-coming-soon"><Clock3 size={20} /><div><p className="card-mood">{sectionKicker || 'Featured releases'}</p><h3>Loading...</h3><p>Fetching featured animations.</p></div></div> : <div className="library-coming-soon"><Clock3 size={20} /><div><p className="card-mood">Featured releases</p><h3>{emptyTitle}</h3><p>{emptyDescription}</p></div></div>}
  </div></section>;
}