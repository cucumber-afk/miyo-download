import { Sparkles } from 'lucide-react';

export default function NewContentSection({ content = {}, design = {} }) {
  const items = Array.isArray(content.items) ? content.items : [];
  const sectionStyle = design.backgroundColor ? { '--cms-background-color': design.backgroundColor } : undefined;
  return <section className="new-content-section page-wrap" data-layout-style={design.layoutStyle || 'split'} data-content-alignment={design.contentAlignment || 'left'} data-spacing={design.spacing || 'normal'} style={sectionStyle}><div className="new-content-copy"><p className="section-kicker">{content.sectionKicker}</p><h2>{content.title}<br /><i>{content.titleHighlight}</i></h2><p>{content.description}</p></div><div className="new-content-list">{items.map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong>{index === items.length - 1 ? <Sparkles size={16} /> : null}</div>)}</div></section>;
}
