import { DEFAULT_GLOBAL_CONFIG } from '../data/defaultGlobalConfig';

export default function Footer({ globalConfig }) {
  const footer = globalConfig?.footer || DEFAULT_GLOBAL_CONFIG.footer;
  const logo = footer.content.logoText || 'MiYo Studio';
  const content = footer.content || {};
  const social = content.social || content.socialLinks || [];
  return <footer className="site-footer page-wrap">
    <div className="site-footer-brand">{footer.media?.logoImageKey ? <img className="site-logo-image" src={`/api/media?key=${encodeURIComponent(footer.media.logoImageKey)}`} alt="" /> : <span className="brand-mark">m</span>}<span>{logo}</span></div>
    <p>{content.description}</p>
    {content.links?.length > 0 && <nav className="site-footer-links" aria-label="Footer links">{content.links.map((group) => <div key={group.title}><strong>{group.title}</strong>{group.items.map((item) => <a key={`${group.title}-${item.label}`} href={item.url}>{item.label}</a>)}</div>)}</nav>}
    {social.length > 0 && <nav className="site-footer-social" aria-label="Social links">{social.filter((item) => item.enabled !== false).map((item) => <a key={item.platform || item.label} href={item.url}>{item.platform || item.label}</a>)}</nav>}
    <span>{content.copyrightText || content.copyright}</span>
  </footer>;
}
