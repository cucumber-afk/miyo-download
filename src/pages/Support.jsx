import { ArrowRight, ChevronDown, Heart, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { usePublicSiteConfig } from '../hooks/useSiteConfig';
import FeaturedVideoSection from '../components/FeaturedVideoSection';

function LegacySupport({ content = {}, design = {} }) {
  const [open, setOpen] = useState(0);
  const faqs = Array.isArray(content.faqs) ? content.faqs : [];
  const sectionStyle = design.backgroundColor ? { '--cms-background-color': design.backgroundColor } : undefined;
  const cardLink = content.cardButtonLink || 'mailto:hello@miyostudio.com';
  const contactLink = content.contactEmail ? `mailto:${content.contactEmail}` : 'mailto:hello@miyostudio.com';
  return <main className="support-section page-wrap" data-layout-style={design.layoutStyle || 'grid'} data-content-alignment={design.contentAlignment || 'left'} data-spacing={design.spacing || 'normal'} style={sectionStyle}><div className="section-heading"><div><p className="section-kicker">{content.sectionKicker}</p><h2>{content.title}<br /><i>{content.titleHighlight}</i></h2></div><p>{content.description}</p></div><div className="support-grid"><a className="support-card support-card--dark" href={cardLink}><span className="support-icon"><Play size={15} fill="currentColor" /></span><div><h3>{content.cardTitle}</h3><p>{content.cardDescription}</p></div><ArrowRight size={20} /></a><div className="faq-panel"><p className="card-mood">{content.faqLabel}</p>{faqs.map((faq, index) => <div className="faq-item" key={faq.question}><button type="button" onClick={() => setOpen(open === index ? -1 : index)}><span>{faq.question}</span><ChevronDown className={open === index ? 'chevron chevron--open' : 'chevron'} size={18} /></button>{open === index && <p>{faq.answer}</p>}</div>)}</div><a className="contact-row" href={contactLink}><div><p className="card-mood">{content.contactLabel}</p><h3>{content.contactTitle}</h3></div><Heart size={22} /></a></div></main>;
}

function CmsSection({ section, children }) {
  const visibility = section.layout?.visibilityBreakpoints || {};
  return <div className="cms-section" data-visibility-desktop={visibility.desktop !== false} data-visibility-tablet={visibility.tablet !== false} data-visibility-mobile={visibility.mobile !== false}>{children}</div>;
}

function Hero({ section }) {
  const { content = {}, design = {} } = section;
  return <main className="page-wrap page-section support-page support-hero" data-content-alignment={design.contentAlignment || 'left'} data-spacing={design.spacing || 'normal'} style={design.backgroundColor ? { '--cms-background-color': design.backgroundColor } : undefined}><div className="section-heading"><div><p className="section-kicker">{content.sectionKicker}</p><h1>{content.title}<br /><i>{content.titleHighlight}</i></h1></div><p>{content.description}</p></div></main>;
}

function Faq({ section }) {
  const [open, setOpen] = useState(-1);
  const { content = {}, design = {} } = section;
  const faqs = useMemo(() => (Array.isArray(content.faqs) ? content.faqs : []).filter((faq) => faq.enabled !== false).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)), [content.faqs]);
  return <section className="page-wrap support-faq-section" data-layout-style={design.layoutStyle || 'grid'} data-spacing={design.spacing || 'normal'} style={design.backgroundColor ? { '--cms-background-color': design.backgroundColor } : undefined}><div className="section-heading"><p className="section-kicker">{content.sectionLabel}</p><h2>Frequently asked<br /><i>questions.</i></h2></div><div className="faq-panel">{faqs.map((faq, index) => <div className="faq-item" key={faq.id}><button type="button" onClick={() => setOpen(open === index ? -1 : index)}><span>{faq.question}</span><ChevronDown className={open === index ? 'chevron chevron--open' : 'chevron'} size={18} /></button>{open === index && <p>{faq.answer}</p>}</div>)}</div></section>;
}

function ContactCta({ section }) {
  const { content = {}, design = {} } = section;
  const style = { ...(design.backgroundColor ? { '--cms-background-color': design.backgroundColor } : {}) };
  return <section className="page-wrap support-contact-section" data-content-alignment={design.textAlignment || 'left'} data-spacing={design.spacing || 'normal'} style={style}><div><p className="section-kicker">{content.sectionKicker}</p><h2>{content.title}</h2><p>{content.description}</p></div><a className={design.buttonStyle === 'outline' ? 'button button--outline' : 'button button--dark'} href={content.buttonLink || (content.email ? `mailto:${content.email}` : 'mailto:hello@miyostudio.com')}>{content.buttonText || 'Email support'}</a></section>;
}

export default function Support({ standalone = false, content = {}, design = {}, media = {} }) {
  if (!standalone) return <LegacySupport content={content} design={design} media={media} />;
  const { sections } = usePublicSiteConfig('support');
  const enabledSections = Object.values(sections || {}).filter((section) => section.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
  return <>{enabledSections.map((section) => <CmsSection key={section.sectionKey} section={section}>{section.sectionKey === 'hero' && <Hero section={section} />}{section.sectionKey === 'featuredVideo' && <FeaturedVideoSection section={section} />}{section.sectionKey === 'faq' && <Faq section={section} />}{section.sectionKey === 'contactCta' && <ContactCta section={section} />}</CmsSection>)}</>;
}
