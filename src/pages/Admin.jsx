import { useState } from 'react';
import AdminWorkspace from '../components/admin/AdminWorkspace';

export function AdminLogin({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus('Signing in...');
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Invalid email or password.');
      onAuthenticated();
    } catch (error) {
      setStatus(error.message || 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  return <main className="page-wrap page-section admin-page"><section className="admin-login-panel"><div className="section-heading"><div><p className="section-kicker">MiYo Studio Admin</p><h1>Sign<br /><span>in.</span></h1></div><p>Administrator access for animation metadata.</p></div><form className="admin-form" onSubmit={submit}><label>Email<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="button button--dark" disabled={busy} type="submit">{busy ? 'Working...' : 'Log in'}</button><p className="admin-status">{status}</p></form></section></main>;
}

export default function Admin({ onLoggedOut, onViewSite }) {
  return <AdminWorkspace onLoggedOut={onLoggedOut} onViewSite={onViewSite} />;
}
