import { assets, collectionCategories } from '../data/content';
import { OfficialImage } from './OfficialImage';

export default function CharacterEcosystem() {
  return <section className="ecosystem-section"><div className="page-wrap"><div className="section-heading"><div><p className="section-kicker">MiYo character ecosystem</p><h2>A whole world<br /><i>of MiYo.</i></h2></div><p>New moods, themes and special collections keep your MiYo feeling fresh.</p></div><div className="ecosystem-layout"><div className="ecosystem-image"><OfficialImage src={assets.characterEcosystem} alt="MiYo character ecosystem" /></div><div className="ecosystem-list">{collectionCategories.map((item, index) => <div key={item.title} className={`ecosystem-item ecosystem-item--${item.tone}`}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></div>)}</div></div></div></section>;
}
