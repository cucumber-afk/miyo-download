import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Downloads from './pages/Downloads';
import Characters from './pages/Characters';
import Support from './pages/Support';
import { useGlobalConfig } from './hooks/useGlobalConfig';
import Home from './pages/Home';
import Admin, { AdminLogin } from './pages/Admin';
import './index.css';

function getPathname() {
  if (window.location.pathname === '/characters') return '/characters';
  if (window.location.pathname === '/downloads') return '/downloads';
  if (window.location.pathname === '/support') return '/support';
  if (window.location.pathname === '/admin/login') return '/admin/login';
  if (window.location.pathname === '/admin') return '/admin';
  return '/';
}

function App() {
  const [pathname, setPathname] = useState(getPathname);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const { config: globalConfig } = useGlobalConfig();
  const [authChecked, setAuthChecked] = useState(false);

  const navigate = (path, replace = false) => {
    const nextPath = path === '/characters' ? '/characters' : path === '/downloads' ? '/downloads' : path === '/support' ? '/support' : path === '/admin/login' ? '/admin/login' : path === '/admin' ? '/admin' : '/';
    if (nextPath !== window.location.pathname) window.history[replace ? 'replaceState' : 'pushState']({}, '', nextPath);
    setPathname(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const seo = globalConfig.seo?.content || {};
    if (seo.title) document.title = seo.title;
    const description = document.querySelector('meta[name="description"]');
    if (description && seo.description) description.setAttribute('content', seo.description);
    let keywords = document.querySelector('meta[name="keywords"]');
    if (seo.keywords) {
      if (!keywords) { keywords = document.createElement('meta'); keywords.setAttribute('name', 'keywords'); document.head.appendChild(keywords); }
      keywords.setAttribute('content', seo.keywords);
    } else {
      keywords?.remove();
    }
    const setMeta = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!content) {
        meta?.remove();
        return;
      }
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute('property', property); document.head.appendChild(meta); }
      meta.setAttribute('content', content);
    };
    setMeta('og:title', seo.title);
    setMeta('og:description', seo.description);
    setMeta('og:image', seo.ogImageKey ? `/api/media?key=${encodeURIComponent(seo.ogImageKey)}` : '');
    let favicon = document.querySelector('link[rel="icon"]');
    if (seo.faviconKey) {
      if (!favicon) { favicon = document.createElement('link'); favicon.setAttribute('rel', 'icon'); document.head.appendChild(favicon); }
      favicon.setAttribute('href', `/api/media?key=${encodeURIComponent(seo.faviconKey)}`);
    } else {
      favicon?.remove();
    }
  }, [globalConfig.seo?.content]);

  useEffect(() => {
    const handlePopState = () => setPathname(getPathname());
    window.addEventListener('popstate', handlePopState);
    if (pathname === '/admin') {
      setAuthChecked(false);
      fetch('/api/admin/session', { credentials: 'same-origin' })
        .then((response) => response.json())
        .then((data) => {
          const authenticated = Boolean(data.authenticated);
          setAdminAuthenticated(authenticated);
          setAuthChecked(true);
          if (!authenticated) navigate('/admin/login', true);
        })
        .catch(() => { setAdminAuthenticated(false); setAuthChecked(true); navigate('/admin/login', true); });
    } else setAuthChecked(true);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [pathname]);

  const authenticated = () => { setAdminAuthenticated(true); navigate('/admin', true); };
  const loggedOut = () => { setAdminAuthenticated(false); navigate('/admin/login', true); };
  let page;
  if (pathname === '/characters') page = <Characters onNavigate={navigate} />;
  else if (pathname === '/downloads') page = <Downloads />;
  else if (pathname === '/support') page = <Support standalone />;
  else if (pathname === '/admin/login') page = <AdminLogin onAuthenticated={authenticated} />;
  else if (pathname === '/admin') page = !authChecked ? <main className="admin-shell"><section className="admin-loading"><p className="section-kicker">MiYo Studio</p><h1>Loading workspace.</h1></section></main> : adminAuthenticated ? <Admin onLoggedOut={loggedOut} onViewSite={() => navigate('/')} /> : null;
  else page = <Home onNavigate={navigate} />;
  const isAdminRoute = pathname === '/admin' || pathname === '/admin/login';
  return <>{!isAdminRoute && <Navbar pathname={pathname} onNavigate={navigate} globalConfig={globalConfig} />}{page}{!isAdminRoute && <Footer globalConfig={globalConfig} />}</>;
}

export default App;
