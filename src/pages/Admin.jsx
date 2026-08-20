import { useEffect, useRef, useState } from 'react';
import { createAnimation, deleteAnimation, getAdminAnimations, getAdminSession, logoutAdmin, publishAnimation, removeMedia, unpublishAnimation, updateAnimation, uploadMedia } from '../api/animations';
import { animationCategories } from '../data/animationLibraryConstants';
import { miyoCharacterColors } from '../data/miyoCharacters';
import MiYoScreenPreview from '../components/MiYoScreenPreview';
import { formatUtcTimestamp } from '../utils/formatTimestamp';

const limits = { gif: 8 * 1024 * 1024, mp4: 20 * 1024 * 1024 };
const blank = { title: '', category: 'Expressions', description: '', tags: [], featured: false, characterColor: 'gray', contentScale: 1, gifPath: '', mp4Path: '', gifFileName: '', mp4FileName: '', gifFileSize: '', mp4FileSize: '', gifObjectKey: '', mp4ObjectKey: '' };

function displayBytes(value) {
  if (!Number.isFinite(Number(value))) return '';
  return Number(value) < 1024 * 1024 ? `${Math.max(1, Math.round(Number(value) / 1024))} KB` : `${(Number(value) / (1024 * 1024)).toFixed(1)} MB`;
}

function TimestampRecord({ item }) {
  if (!item?.createdAt) return null;
  return <section className="admin-timestamp-record" aria-label="Creation Record"><p className="section-kicker">Creation Record</p><dl><div><dt>Created</dt><dd>{formatUtcTimestamp(item.createdAt)}</dd></div><div><dt>First Published</dt><dd>{formatUtcTimestamp(item.publishedAt)}</dd></div><div><dt>Last Updated</dt><dd>{formatUtcTimestamp(item.updatedAt)}</dd></div></dl></section>;
}

function MediaUploader({ animationId, format, item, onUploaded, onRemoved, busy }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('');
  const fileName = item[`${format}FileName`];
  const fileSize = item[`${format}FileSize`];
  const uploaded = Boolean(item[`${format}ObjectKey`]);
  const label = format.toUpperCase();
  const validate = (file) => {
    if (!file) return 'Choose a file.';
    if (!file.name.toLowerCase().endsWith(`.${format}`)) return `Choose a .${format} file.`;
    if (file.size > limits[format]) return `${label} must be ${displayBytes(limits[format])} or smaller.`;
    return '';
  };
  const upload = async (file) => {
    const validation = validate(file);
    if (validation) { setStatus(validation); return; }
    setStatus('Uploading...');
    try { await onUploaded(format, file); setStatus('Uploaded'); } catch (error) { setStatus(error.message || 'Upload failed.'); }
  };
  const remove = async () => {
    setStatus('Removing...');
    try { await onRemoved(format); setStatus(''); } catch (error) { setStatus(error.message || 'Remove failed.'); }
  };
  return <section className={`admin-media-uploader${dragging ? ' is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); if (!busy && animationId) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); if (!busy && animationId) upload(event.dataTransfer.files[0]); }}><div><p className="section-kicker">{label}</p><p className="admin-media-hint">{label} files up to {displayBytes(limits[format])}.</p></div>{uploaded ? <div className="admin-media-details"><strong>{fileName}</strong><span>{displayBytes(fileSize)} · Uploaded</span><div><button type="button" disabled={busy} onClick={() => inputRef.current?.click()}>Replace</button><button type="button" disabled={busy} onClick={remove}>Remove</button></div></div> : <button className="admin-media-select" type="button" disabled={busy || !animationId} onClick={() => inputRef.current?.click()}>{animationId ? `Choose ${label}` : 'Save Draft to Upload'}</button>}<input ref={inputRef} className="sr-only" type="file" accept={format === 'gif' ? '.gif,image/gif' : '.mp4,video/mp4'} disabled={busy || !animationId} onChange={(event) => { upload(event.target.files[0]); event.target.value = ''; }} /><p className="admin-media-status" aria-live="polite">{status}</p></section>;
}

export function AdminLogin({ onAuthenticated }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [status, setStatus] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setStatus('Signing in...'); try { await fetch('/api/admin/login', { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Invalid email or password'); return data; }); onAuthenticated(); } catch (error) { setStatus(error.message); } finally { setBusy(false); } };
  return <main className="page-wrap page-section admin-page"><section className="admin-login-panel"><div className="section-heading"><div><p className="section-kicker">MiYo Studio Admin</p><h1>Sign<br /><span>in.</span></h1></div><p>Administrator access for animation metadata.</p></div><form className="admin-form" onSubmit={submit}><label>Email<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="button button--dark" disabled={busy} type="submit">{busy ? 'Working...' : 'Log in'}</button><p className="admin-status">{status}</p></form></section></main>;
}

export default function Admin({ onLoggedOut }) {
  const [identity, setIdentity] = useState(null); const [items, setItems] = useState([]); const [form, setForm] = useState(blank); const [editing, setEditing] = useState(null); const [status, setStatus] = useState('Loading admin session...'); const [busy, setBusy] = useState(false);
  const refresh = async () => { const data = await getAdminAnimations(); setItems(data.animations || []); };
  useEffect(() => { Promise.all([getAdminSession(), getAdminAnimations()]).then(([session, data]) => { setIdentity({ email: session.email }); setItems(data.animations || []); setStatus(''); }).catch((error) => setStatus(error.message)); }, []);
  const edit = (item) => { setEditing(item.id); setForm({ ...blank, ...item, gifPath: item.downloads?.gif?.src || '', mp4Path: item.downloads?.mp4?.src || '', gifFileName: item.downloads?.gif?.fileName || '', mp4FileName: item.downloads?.mp4?.fileName || '', gifFileSize: item.gifFileSize ?? '', mp4FileSize: item.mp4FileSize ?? '', gifObjectKey: item.gifObjectKey || item.downloads?.gif?.mediaKey || '', mp4ObjectKey: item.mp4ObjectKey || item.downloads?.mp4?.mediaKey || '' }); };
  const save = async (event) => { event.preventDefault(); setBusy(true); setStatus('Saving...'); try { const data = editing ? await updateAnimation(editing, form) : await createAnimation(form); setForm((current) => ({ ...current, ...data.animation })); setEditing(data.animation.id); await refresh(); setStatus('Saved. You can now upload media.'); } catch (error) { setStatus(error.message); } finally { setBusy(false); } };
  const upload = async (format, file) => { if (!editing) throw new Error('Save Draft before uploading.'); setBusy(true); try { const media = await uploadMedia(editing, format, file); const next = { ...form, [`${format}Path`]: media.previewUrl, [`${format}FileName`]: media.fileName, [`${format}FileSize`]: media.fileSize, [`${format}ObjectKey`]: media.mediaKey }; setForm(next); await refresh(); } finally { setBusy(false); } };
  const remove = async (format) => { if (!editing) return; setBusy(true); try { await removeMedia(editing, format); setForm((current) => ({ ...current, [`${format}Path`]: '', [`${format}FileName`]: '', [`${format}FileSize`]: '', [`${format}ObjectKey`]: '' })); await refresh(); } finally { setBusy(false); } };
  const action = async (callback) => { setBusy(true); try { await callback(); await refresh(); } catch (error) { setStatus(error.message); } finally { setBusy(false); } };
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value })); const logout = async () => { await logoutAdmin(); onLoggedOut(); };
  if (status && !identity) return <main className="page-wrap page-section admin-page"><section className="library-empty-state"><div><p className="section-kicker">Admin access</p><h1>Protected workspace.</h1><p>{status}</p></div></section></main>;
  return <main className="page-wrap page-section admin-page"><div className="section-heading"><div><p className="section-kicker">MiYo Studio Admin</p><h1>Animation<br /><span>workspace.</span></h1></div><p>{identity?.email || 'Authenticated'}<br /><button className="text-link" type="button" onClick={logout}>Log out</button></p></div><div className="admin-layout"><form className="admin-form" onSubmit={save}><div className="admin-form-heading"><p className="section-kicker">{editing ? 'Edit animation' : 'New animation'}</p><button className="text-link" type="button" onClick={() => { setEditing(null); setForm(blank); setStatus(''); }}>New</button></div><label>Title<input required value={form.title} onChange={(event) => setField('title', event.target.value)} /></label><label>Category<select value={form.category} onChange={(event) => setField('category', event.target.value)}>{animationCategories.filter((category) => category !== 'All').map((category) => <option key={category}>{category}</option>)}</select></label><label>Description<textarea value={form.description} onChange={(event) => setField('description', event.target.value)} /></label><label>Tags<input value={(form.tags || []).join(', ')} onChange={(event) => setField('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} /></label><div className="admin-form-row"><label>Character<select value={form.characterColor} onChange={(event) => setField('characterColor', event.target.value)}>{miyoCharacterColors.map((color) => <option key={color}>{color}</option>)}</select></label><label>Scale<input type="number" min="0.5" max="2" step="0.05" value={form.contentScale} onChange={(event) => setField('contentScale', event.target.value)} /></label></div><label className="admin-checkbox"><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => setField('featured', event.target.checked)} /> Featured on Home</label><MediaUploader animationId={editing} format="gif" item={form} busy={busy} onUploaded={upload} onRemoved={remove} /><MediaUploader animationId={editing} format="mp4" item={form} busy={busy} onUploaded={upload} onRemoved={remove} /><TimestampRecord item={form} /><button className="button button--dark" disabled={busy} type="submit">{busy ? 'Working...' : editing ? 'Save Draft' : 'Create Draft'}</button>{(form.gifPath || form.mp4Path) && <div className="admin-preview"><p className="section-kicker">Preview</p><MiYoScreenPreview item={{ ...form, preview: form.gifPath ? { type: 'gif', src: form.gifPath } : { type: 'mp4', src: form.mp4Path } }} /></div>}<p className="admin-status">{status}</p></form><section className="admin-list"><div className="admin-form-heading"><p className="section-kicker">Library entries</p><span>{items.length} total</span></div>{items.length === 0 && <p className="admin-muted">No animations yet.</p>}{items.map((item) => <article className="admin-row" key={item.id}><div><strong>{item.title}</strong><p>{item.category} · {item.status} · {(item.downloads?.gif ? 'GIF ' : '')}{item.downloads?.mp4 ? 'MP4' : ''}</p></div><div className="admin-row-actions"><button type="button" onClick={() => edit(item)}>Edit</button>{item.status === 'published' ? <button type="button" onClick={() => action(() => unpublishAnimation(item.id))}>Unpublish</button> : <button type="button" onClick={() => action(() => publishAnimation(item.id))}>Publish</button>}<button type="button" onClick={() => window.confirm(`Delete ${item.title}?`) && action(() => deleteAnimation(item.id))}>Delete</button></div></article>)}</section></div></main>;
}
