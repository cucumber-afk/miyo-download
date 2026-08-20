import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Downloads from './pages/Downloads';
import Home from './pages/Home';
import Admin, { AdminLogin } from './pages/Admin';
import './index.css';

function getPathname() {
  if (window.location.pathname === '/downloads') return '/downloads';
  if (window.location.pathname === '/admin/login') return '/admin/login';
  if (window.location.pathname === '/admin') return '/admin';
  return '/';
}

function App() {
  const [pathname, setPathname] = useState(getPathname);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const navigate = (path, replace = false) => {
    const nextPath = path === '/downloads' ? '/downloads' : path === '/admin/login' ? '/admin/login' : path === '/admin' ? '/admin' : '/';
    if (nextPath !== window.location.pathname) window.history[replace ? 'replaceState' : 'pushState']({}, '', nextPath);
    setPathname(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  if (pathname === '/downloads') page = <Downloads />;
  else if (pathname === '/admin/login') page = <AdminLogin onAuthenticated={authenticated} />;
  else if (pathname === '/admin') page = !authChecked ? <main className="page-wrap page-section admin-page"><section className="library-empty-state"><div><p className="section-kicker">MiYo Studio Admin</p><h1>Loading.</h1></div></section></main> : adminAuthenticated ? <Admin onLoggedOut={loggedOut} /> : null;
  else page = <Home onNavigate={navigate} />;
  return <>{pathname !== '/admin/login' && <Navbar pathname={pathname} onNavigate={navigate} />}{page}<footer className="site-footer page-wrap"><button className="brand brand-button" onClick={() => navigate('/')}><span className="brand-mark">m</span><span>MiYo <em>Studio</em></span></button><p>Official digital badge content platform</p><span>© 2026 MiYo Studio</span></footer></>;
}

export default App;
