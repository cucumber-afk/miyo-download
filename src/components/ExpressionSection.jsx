import { assets } from '../data/content';
import { OfficialImage } from './OfficialImage';

export default function ExpressionSection({ content = {}, design = {}, media = {} }) {
  const tags = Array.isArray(content.tags) ? content.tags : [];
  const imageSrc = media.imageKey ? `/api/media?key=${encodeURIComponent(media.imageKey)}` : assets.expressionLibrary;
  const sectionStyle = design.backgroundColor ? { '--cms-background-color': design.backgroundColor } : undefined;
  return <section className="v2-split-section page-wrap expression-section" data-layout-style={design.layoutStyle || 'split'} data-content-alignment={design.contentAlignment || 'left'} data-spacing={design.spacing || 'normal'} style={sectionStyle}><div className="v2-copy"><p className="section-kicker">{content.sectionKicker}</p><h2>{content.title}<br /><i>{content.titleHighlight}</i></h2><p>{content.description}</p><div className="tag-list">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div><small>{content.note}</small></div><div className="v2-image-frame v2-image-frame--expression"><OfficialImage src={imageSrc} alt={media.imageAlt || 'MiYo surrounded by expression ideas'} /></div></section>;
}
