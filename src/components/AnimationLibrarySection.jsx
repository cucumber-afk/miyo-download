import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import MiYoScreenPreview from './MiYoScreenPreview';
import { getFeaturedAnimations } from '../api/animations';
import { mapAnimations } from '../data/animationMapper';

export default function AnimationLibrarySection() {
  const [featuredItems, setFeaturedItems] = useState([]);
  useEffect(() => { getFeaturedAnimations().then((data) => setFeaturedItems(mapAnimations(data.animations))).catch(() => setFeaturedItems([])); }, []);

  return <section className="library-feature-section"><div className="page-wrap">
    <div className="section-heading">
      <div><p className="section-kicker">Official animation library</p><h2>Featured<br /><i>animations.</i></h2></div>
      <p>Preview official MiYo animations on the figure before you download them.</p>
    </div>
    {featuredItems.length > 0 ? <div className="miyo-animation-grid miyo-animation-grid--featured">{featuredItems.map((item) => <article className="miyo-animation-card" key={item.id}><div className="miyo-animation-card-figure"><MiYoScreenPreview item={item} /></div><div className="miyo-animation-card-body"><div className="miyo-animation-card-meta"><h2>{item.title}</h2><p className="card-mood">{item.category}</p></div></div></article>)}</div> : <div className="library-coming-soon"><Clock3 size={20} /><div><p className="card-mood">Featured releases</p><h3>Coming Soon</h3><p>New official animations will appear here once they are ready to download.</p></div></div>}
  </div></section>;
}
