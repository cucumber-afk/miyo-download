import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ pathname, onNavigate }) {
  const [open, setOpen] = useState(false);
  const links = [{ label: 'Home', path: '/' }, { label: 'Downloads', path: '/downloads' }, { label: 'Admin', path: '/admin' }];
  const navigate = (path) => {
    onNavigate(path);
    setOpen(false);
  };
  return <header className="site-header">
    <button className="brand brand-button" onClick={() => navigate('/')}><span className="brand-mark">m</span><span>MiYo <em>Studio</em></span></button>
    <nav className={open ? 'nav-links nav-links--open' : 'nav-links'}>{links.map((link) => <button key={link.path} className={pathname === link.path ? 'nav-link nav-link--active' : 'nav-link'} onClick={() => navigate(link.path)}>{link.label}</button>)}</nav>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X size={19} /> : <Menu size={19} />}</button>
  </header>;
}
