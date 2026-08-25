export default function HowItWorks({ content = {}, design = {}, layout = {} }) {
  const { sectionTitle = '', sectionTitleHighlight = '', sectionKicker = '', sectionSubtitle = '', steps = [] } = content;
  const gridColumns = Number.isInteger(design.gridColumns) ? design.gridColumns : 4;
  const sectionStyle = { '--cms-grid-columns': gridColumns };
  return <section className="how-it-works" style={sectionStyle} data-step-style={design.stepStyle || 'card'} data-show-numbers={design.showNumbers !== false} data-visibility-desktop={layout.visibilityBreakpoints?.desktop !== false} data-visibility-tablet={layout.visibilityBreakpoints?.tablet !== false} data-visibility-mobile={layout.visibilityBreakpoints?.mobile !== false}><div className="page-wrap">
    <div className="section-heading">
      <div>{sectionKicker && <p className="section-kicker">{sectionKicker}</p>}<h2>{sectionTitle}<br />{sectionTitleHighlight && <i>{sectionTitleHighlight}</i>}</h2></div>
      {sectionSubtitle && <p>{sectionSubtitle}</p>}
    </div>
    <div className="step-grid">{steps.map((step, index) => <div className="step-card" key={index}><span className="step-number">{String(index + 1).padStart(2, '0')}</span><h3>{step.title || `Step ${index + 1}`}</h3><p>{step.description || ''}</p></div>)}</div>
  </div></section>;
}