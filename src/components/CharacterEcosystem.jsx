import { assets, collectionCategories } from '../data/content';
import { OfficialImage } from './OfficialImage';

export default function CharacterEcosystem({ content = {}, design = {}, media = {} }) {
  const { sectionTitle = '', sectionTitleHighlight = '', sectionKicker = '', sectionSubtitle = '' } = content;
  const imageSrc = media.sectionImageKey ? `/api/media?key=${encodeURIComponent(media.sectionImageKey)}` : assets.characterEcosystem;
  const sectionStyle = design.backgroundColor ? { '--cms-background-color': design.backgroundColor } : undefined;
  return <section className="ecosystem-section" data-layout-style={design.layoutStyle || 'grid'} data-content-alignment={design.contentAlignment || 'left'} data-spacing={design.spacing || 'normal'} style={sectionStyle}><div className="page-wrap"><div className="section-heading"><div>{sectionKicker && <p className="section-kicker">{sectionKicker}</p>}<h2>{sectionTitle}<br />{sectionTitleHighlight && <i>{sectionTitleHighlight}</i>}</h2></div>{sectionSubtitle && <p>{sectionSubtitle}</p>}</div><div className="ecosystem-layout"><div className="ecosystem-image"><OfficialImage src={imageSrc} alt={media.imageAlt || 'MiYo character ecosystem'} /></div><div className="ecosystem-list">{collectionCategories.map((item, index) => <div key={item.title} className={`ecosystem-item ecosystem-item--${item.tone}`}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></div>)}</div></div></div></section>;
}