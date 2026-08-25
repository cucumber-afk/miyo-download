import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const fallbackLinks = [{ label: 'Home', path: '/' }, { label: 'Downloads', path: '/downloads' }, { label: 'Characters', path: '/characters' }, { label: 'Admin', path: '/admin' }];

export default function Navbar({ pathname, onNavigate, globalConfig }) {
  const [open, setOpen] = useState(false);
  const navigation = globalConfig?.navigation?.content || {};
  const links = (Array.isArray(navigation.menu) && navigation.menu.length ? navigation.menu : fallbackLinks)
    .filter((link) => link.enabled !== false)
    .map((link, index) => ({ ...link, sortOrder: Number.isFinite(Number(link.sortOrder)) ? Number(link.sortOrder) : index }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const logoText = navigation.logoText || 'MiYo Studio';
  const navigate = (path) => {
    if (/^https?:\/\//i.test(path)) window.location.assign(path);
    else onNavigate(path);
    setOpen(false);
  };
  return <header className="site-header">
    <button className="brand brand-button" onClick={() => navigate('/')}>
      {navigation.media?.logoImageKey ? <img className="site-logo-image" src={`/api/media?key=${encodeURIComponent(navigation.media.logoImageKey)}`} alt="" /> : <span className="brand-mark">m</span>}
      <span>{logoText}</span>
    </button>
    <nav className={open ? 'nav-links nav-links--open' : 'nav-links'}>{links.map((link) => <button key={link.path} className={pathname === link.path ? 'nav-link nav-link--active' : 'nav-link'} onClick={() => navigate(link.path)}>{link.label}</button>)}{navigation.button?.enabled && navigation.button.text && <button className="header-download" onClick={() => navigate(navigation.button.link)}>{navigation.button.text}</button>}</nav>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X size={19} /> : <Menu size={19} />}</button>
  </header>;
}
