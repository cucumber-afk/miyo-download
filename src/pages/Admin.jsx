import { useEffect, useState } from 'react';
import { createAnimation, deleteAnimation, getAdminAnimations, getAdminSession, logoutAdmin, publishAnimation, unpublishAnimation, updateAnimation } from '../api/animations';
import { animationCategories } from '../data/animationLibraryConstants';
import { miyoCharacterColors } from '../data/miyoCharacters';
import MiYoScreenPreview from '../components/MiYoScreenPreview';
import { formatUtcTimestamp } from '../utils/formatTimestamp';

const blank = {
  title: '', category: 'Expressions', description: '', tags: [], featured: false,
  characterColor: 'gray', contentScale: 1, gifPath: '', mp4Path: '',
  gifFileName: '', mp4FileName: '', gifFileSize: '', mp4FileSize: '',
};

function TimestampRecord({ item }) {
  if (!item?.createdAt) return null;
  return <section className="admin-timestamp-record" aria-label="Creation Record"><p className="section-kicker">Creation Record</p><dl><div><dt>Created</dt><dd>{formatUtcTimestamp(item.createdAt)}</dd></div><div><dt>First Published</dt><dd>{formatUtcTimestamp(item.publishedAt)}</dd></div><div><dt>Last Updated</dt><dd>{formatUtcTimestamp(item.updatedAt)}</dd></div></dl></section>;
}

export function AdminLogin({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setStatus('Signing in...'); try { await fetch('/api/admin/login', { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Invalid email or password'); return data; }); onAuthenticated(); } catch (error) { setStatus(error.message); } finally { setBusy(false); } };
  return <main className="page-wrap page-section admin-page"><section className="admin-login-panel"><div className="section-heading"><div><p className="section-kicker">MiYo Studio Admin</p><h1>Sign<br /><span>in.</span></h1></div><p>Administrator access for animation metadata.</p></div><form className="admin-form" onSubmit={submit}><label>Email<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="button button--dark" disabled={busy} type="submit">{busy ? 'Working...' : 'Log in'}</button><p className="admin-status">{status}</p></form></section></main>;
}

export default function Admin({ onLoggedOut }) {
  const [identity, setIdentity] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState('Loading admin session...');
  const [busy, setBusy] = useState(false);

  const refresh = async () => { const data = await getAdminAnimations(); setItems(data.animations || []); };
  useEffect(() => { Promise.all([getAdminSession(), getAdminAnimations()]).then(([session, data]) => { setIdentity({ email: session.email }); setItems(data.animations || []); setStatus(''); }).catch((error) => setStatus(error.message)); }, []);
  const edit = (item) => { setEditing(item.id); setForm({ ...blank, ...item, gifPath: item.downloads?.gif?.src || '', mp4Path: item.downloads?.mp4?.src || '', gifFileName: item.downloads?.gif?.fileName || '', mp4FileName: item.downloads?.mp4?.fileName || '', gifFileSize: item.gifFileSize ?? '', mp4FileSize: item.mp4FileSize ?? '' }); };
  const save = async (event) => { event.preventDefault(); setBusy(true); setStatus('Saving...'); try { const data = editing ? await updateAnimation(editing, form) : await createAnimation(form); setForm({ ...blank, ...(data.animation || {}) }); setEditing(data.animation.id); await refresh(); setStatus('Saved.'); } catch (error) { setStatus(error.message); } finally { setBusy(false); } };
  const action = async (callback) => { setBusy(true); try { await callback(); await refresh(); } catch (error) { setStatus(error.message); } finally { setBusy(false); } };
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const logout = async () => { await logoutAdmin(); onLoggedOut(); };

  if (status && !identity) return <main className="page-wrap page-section admin-page"><section className="library-empty-state"><div><p className="section-kicker">Admin access</p><h1>Protected workspace.</h1><p>{status}</p></div></section></main>;
  return <main className="page-wrap page-section admin-page"><div className="section-heading"><div><p className="section-kicker">MiYo Studio Admin</p><h1>Animation<br /><span>workspace.</span></h1></div><p>{identity?.email || 'Authenticated'}<br /><button className="text-link" type="button" onClick={logout}>Log out</button></p></div>
    <div className="admin-layout"><form className="admin-form" onSubmit={save}><div className="admin-form-heading"><p className="section-kicker">{editing ? 'Edit animation' : 'New animation'}</p><button className="text-link" type="button" onClick={() => { setEditing(null); setForm(blank); }}>New</button></div><label>Title<input required value={form.title} onChange={(event) => setField('title', event.target.value)} /></label><label>Category<select value={form.category} onChange={(event) => setField('category', event.target.value)}>{animationCategories.filter((category) => category !== 'All').map((category) => <option key={category}>{category}</option>)}</select></label><label>Description<textarea value={form.description} onChange={(event) => setField('description', event.target.value)} /></label><label>Tags<input value={(form.tags || []).join(', ')} onChange={(event) => setField('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} /></label><div className="admin-form-row"><label>Character<select value={form.characterColor} onChange={(event) => setField('characterColor', event.target.value)}>{miyoCharacterColors.map((color) => <option key={color}>{color}</option>)}</select></label><label>Scale<input type="number" min="0.5" max="2" step="0.05" value={form.contentScale} onChange={(event) => setField('contentScale', event.target.value)} /></label></div><label className="admin-checkbox"><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => setField('featured', event.target.checked)} /> Featured on Home</label><div className="admin-form-row"><label>GIF Path<input placeholder="/assets/animations/library/happy.gif" value={form.gifPath} onChange={(event) => setField('gifPath', event.target.value)} /></label><label>MP4 Path<input placeholder="/assets/animations/library/happy.mp4" value={form.mp4Path} onChange={(event) => setField('mp4Path', event.target.value)} /></label></div><div className="admin-form-row"><label>GIF File Name<input value={form.gifFileName} onChange={(event) => setField('gifFileName', event.target.value)} /></label><label>MP4 File Name<input value={form.mp4FileName} onChange={(event) => setField('mp4FileName', event.target.value)} /></label></div><div className="admin-form-row"><label>GIF File Size<input type="number" min="0" value={form.gifFileSize} onChange={(event) => setField('gifFileSize', event.target.value)} /></label><label>MP4 File Size<input type="number" min="0" value={form.mp4FileSize} onChange={(event) => setField('mp4FileSize', event.target.value)} /></label></div><TimestampRecord item={form} /><button className="button button--dark" disabled={busy} type="submit">{busy ? 'Working...' : 'Save Draft'}</button>{(form.gifPath || form.mp4Path) && <div className="admin-preview"><p className="section-kicker">Preview</p><MiYoScreenPreview item={{ ...form, preview: form.gifPath ? { type: 'gif', src: form.gifPath } : { type: 'mp4', src: form.mp4Path } }} /></div>}<p className="admin-status">{status}</p></form>
    <section className="admin-list"><div className="admin-form-heading"><p className="section-kicker">Library entries</p><span>{items.length} total</span></div>{items.length === 0 && <p className="admin-muted">No animations yet.</p>}{items.map((item) => <article className="admin-row" key={item.id}><div><strong>{item.title}</strong><p>{item.category} · {item.status} · {(item.downloads?.gif ? 'GIF ' : '')}{item.downloads?.mp4 ? 'MP4' : ''}</p></div><div className="admin-row-actions"><button type="button" onClick={() => edit(item)}>Edit</button>{item.status === 'published' ? <button type="button" onClick={() => action(() => unpublishAnimation(item.id))}>Unpublish</button> : <button type="button" onClick={() => action(() => publishAnimation(item.id))}>Publish</button>}<button type="button" onClick={() => window.confirm(`Delete ${item.title}?`) && action(() => deleteAnimation(item.id))}>Delete</button></div></article>)}</section></div>
  </main>;
}
