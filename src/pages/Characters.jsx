import { ArrowRight } from 'lucide-react';
import { collectionCategories } from '../data/content';

export default function Characters({ onNavigate }) {
  return <main className="page-wrap page-section characters-page"><div className="section-heading"><div><p className="section-kicker">Characters</p><h1>Explore the<br /><span>MiYo world.</span></h1></div><p>New collections will appear here as the MiYo character library grows.</p></div><div className="page-collection-grid">{collectionCategories.map((collection, index) => <article className={`page-collection page-collection--${collection.tone}`} key={collection.title}><span>0{index + 1}</span><div><h2>{collection.title}</h2><p>{collection.description}</p></div><button className="icon-button" onClick={() => onNavigate('Downloads')} aria-label={`View ${collection.title}`}><ArrowRight size={17} /></button></article>)}</div></main>;
}
