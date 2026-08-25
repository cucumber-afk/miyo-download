import { ArrowRight } from 'lucide-react';
import HeroCharacterShowcase from './HeroCharacterShowcase';

export default function HeroSection({ onNavigate, content = {}, design = {}, media = {}, previewMode = false }) {
  const { eyebrow = '', title = '', titleHighlight = '', description = '', primaryButtonText = 'Browse animations', primaryButtonLink = '/downloads', primaryButtonAction, stats = [] } = content;
  const {
    layoutStyle = 'split',
    contentAlignment = 'left',
    sectionHeight = 'medium',
    titleSize = 'large',
    textWidth = 'normal',
    topPadding = 'normal',
    bottomPadding = 'normal',
    contentGap = 'normal',
    backgroundColor = '',
  } = design;

  const action = previewMode
    ? (event) => { event.preventDefault(); }
    : (primaryButtonAction ?? (() => onNavigate?.(primaryButtonLink || '/downloads')));

  const style = {
    '--hero-background': backgroundColor || 'transparent',
  };

  return <section
    className={previewMode ? 'v2-hero page-wrap v2-hero--preview' : 'v2-hero page-wrap'}
    data-layout={layoutStyle}
    data-align={contentAlignment}
    data-height={sectionHeight}
    data-title-size={titleSize}
    data-text-width={textWidth}
    data-padding-top={topPadding}
    data-padding-bottom={bottomPadding}
    data-content-gap={contentGap}
    style={style}
  >
    <div className="hero-copy">
      {eyebrow && <p className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</p>}
      <div className="hero-intro">
        <h1>{title || 'MiYo'}{titleHighlight && <><br /><span>{titleHighlight}</span></>}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="hero-actions">
        <button className="button button--dark" onClick={action}>{primaryButtonText || 'Browse animations'} <ArrowRight size={15} /></button>
      </div>
      {stats?.length ? <div className="hero-stats">{stats.map((stat) => <span key={stat.label}><strong>{stat.label}</strong>{stat.value}</span>)}</div> : null}
    </div>
    <HeroCharacterShowcase media={media} design={design} />
  </section>;
}