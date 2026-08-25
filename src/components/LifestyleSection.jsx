import { assets } from '../data/content';
import { OfficialImage } from './OfficialImage';

export default function LifestyleSection({ content = {}, design = {}, media = {} }) {
  const scenes = Array.isArray(content.scenes) ? content.scenes : [];
  const imageSrc = media.imageKey ? `/api/media?key=${encodeURIComponent(media.imageKey)}` : assets.lifestyle;
  const sectionStyle = design.backgroundColor ? { '--cms-background-color': design.backgroundColor } : undefined;
  return <section className="lifestyle-section page-wrap" data-layout-style={design.layoutStyle || 'split'} data-content-alignment={design.contentAlignment || 'left'} data-spacing={design.spacing || 'normal'} style={sectionStyle}><div className="lifestyle-image"><OfficialImage src={imageSrc} alt={media.imageAlt || 'MiYo digital badge in everyday life'} /></div><div className="lifestyle-copy"><p className="section-kicker">{content.sectionKicker}</p><h2>{content.title}<br /><i>{content.titleHighlight}</i></h2><p>{content.description}</p><div className="life-list">{scenes.map((scene) => <span key={scene}>{scene}</span>)}</div></div></section>;
}
