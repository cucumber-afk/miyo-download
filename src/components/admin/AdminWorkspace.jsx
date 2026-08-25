import { useEffect, useMemo, useState } from 'react';
import { Eye, LogOut } from 'lucide-react';
import { createAnimation, deleteAnimation, getAdminAnimations, getAdminSession, logoutAdmin, publishAnimation, removeMedia, unpublishAnimation, updateAnimation, uploadMedia } from '../../api/animations';
import AdminEditor from './AdminEditor';
import AdminLibrary from './AdminLibrary';
import AdminModal from './AdminModal';
import AdminPagesManager from './AdminPagesManager';
import AdminGlobalManager from './AdminGlobalManager';
import AdminPreviewSidebar from './AdminPreviewSidebar';

export const blankAnimation = { title: '', category: 'Expressions', description: '', tags: [], featured: false, characterColor: 'gray', contentScale: 1, gifPath: '', mp4Path: '', gifFileName: '', mp4FileName: '', gifFileSize: '', mp4FileSize: '', gifObjectKey: '', mp4ObjectKey: '', status: 'draft' };

function toForm(item) {
  return { ...blankAnimation, ...item, gifPath: item.gifPath || item.downloads?.gif?.src || '', mp4Path: item.mp4Path || item.downloads?.mp4?.src || '', gifFileName: item.gifFileName || item.downloads?.gif?.fileName || '', mp4FileName: item.mp4FileName || item.downloads?.mp4?.fileName || '', gifFileSize: item.gifFileSize ?? '', mp4FileSize: item.mp4FileSize ?? '', gifObjectKey: item.gifObjectKey || item.downloads?.gif?.mediaKey || '', mp4ObjectKey: item.mp4ObjectKey || item.downloads?.mp4?.mediaKey || '' };
}

function snapshot(item) {
  const { createdAt, publishedAt, updatedAt, ...editable } = item;
  return JSON.stringify(editable);
}

function AdminAnimationWorkspace({ identity, onLoggedOut, onViewSite }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blankAnimation);
  const [savedForm, setSavedForm] = useState(blankAnimation);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Loading workspace...');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [mobileView, setMobileView] = useState('editor');
  const [pending, setPending] = useState(null);

  const dirty = useMemo(() => snapshot(form) !== snapshot(savedForm), [form, savedForm]);
  const refresh = async () => {
    const data = await getAdminAnimations();
    setItems(data.animations || []);
    return data.animations || [];
  };

  useEffect(() => {
    refresh().then(() => setStatus('')).catch((error) => setStatus(error.message || 'Could not load the workspace.'));
  }, []);

  useEffect(() => {
    const warnBeforeUnload = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [dirty]);

  const applyItem = (item) => {
    const next = toForm(item);
    setEditingId(item.id || null);
    setForm(next);
    setSavedForm(next);
    setStatus('');
  };
  const requestTransition = (next) => {
    if (dirty) setPending({ type: 'discard', next });
    else next();
  };
  const select = (item) => requestTransition(() => { applyItem(item); setMobileView('editor'); });
  const newAnimation = () => requestTransition(() => { applyItem(blankAnimation); setMobileView('editor'); });
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus(editingId ? 'Saving changes...' : 'Creating draft...');
    try {
      const result = editingId ? await updateAnimation(editingId, form) : await createAnimation(form);
      const next = toForm(result.animation);
      setEditingId(result.animation.id);
      setForm(next);
      setSavedForm(next);
      setItems(await refresh());
      setStatus(editingId ? 'Changes saved.' : 'Draft created. You can add media now.');
    } catch (error) {
      setStatus(error.message || 'The animation could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const mediaUpload = async (format, file) => {
    if (!editingId) throw new Error('Create the draft before uploading media.');
    setBusy(true);
    try {
      const media = await uploadMedia(editingId, format, file);
      const next = { ...form, [`${format}Path`]: media.previewUrl, [`${format}FileName`]: media.fileName, [`${format}FileSize`]: media.fileSize, [`${format}ObjectKey`]: media.mediaKey, updatedAt: new Date().toISOString() };
      setForm(next);
      setSavedForm(next);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const mediaRemove = async (format) => {
    if (!editingId) return;
    setBusy(true);
    try {
      await removeMedia(editingId, format);
      const next = { ...form, [`${format}Path`]: '', [`${format}FileName`]: '', [`${format}FileSize`]: '', [`${format}ObjectKey`]: '', updatedAt: new Date().toISOString() };
      setForm(next);
      setSavedForm(next);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const lifecycle = async (operation, successMessage) => {
    if (!editingId) return;
    setBusy(true);
    try {
      const result = await operation(editingId);
      const next = toForm(result.animation);
      setForm(next);
      setSavedForm(next);
      await refresh();
      setStatus(successMessage);
    } catch (error) {
      setStatus(error.message || 'This action could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  const removeAnimation = async () => {
    if (!editingId) return;
    setBusy(true);
    try {
      await deleteAnimation(editingId);
      await refresh();
      applyItem(blankAnimation);
      setStatus('Animation deleted.');
    } catch (error) {
      setStatus(error.message || 'The animation could not be deleted.');
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const logout = async () => {
    try { await logoutAdmin(); } finally { onLoggedOut(); }
  };

  return <>
      <header className="admin-topbar"><button className="brand brand-button" type="button" onClick={onViewSite}><span className="brand-mark">m</span><span>MiYo <em>Studio</em></span></button><div className="admin-topbar-actions"><span>{identity?.email}</span><button className="text-link" type="button" onClick={onViewSite}><Eye size={15} />View site</button><button className="text-link" type="button" onClick={logout}><LogOut size={15} />Logout</button></div></header>
      <nav className="admin-mobile-tabs" aria-label="Admin workspace sections"><button className={mobileView === 'library' ? 'is-active' : ''} type="button" onClick={() => setMobileView('library')}>Library</button><button className={mobileView === 'editor' ? 'is-active' : ''} type="button" onClick={() => setMobileView('editor')}>Editor</button></nav>
      <div className={`admin-workspace admin-workspace--${mobileView}`}><AdminLibrary items={items} selectedId={editingId} search={search} statusFilter={statusFilter} categoryFilter={categoryFilter} onSearchChange={setSearch} onStatusChange={setStatusFilter} onCategoryChange={setCategoryFilter} onSelect={select} onNew={newAnimation} /><AdminEditor item={form} animationId={editingId} busy={busy} status={status} onFieldChange={setField} onSave={save} onUpload={mediaUpload} onRemove={mediaRemove} onPublish={() => lifecycle(publishAnimation, 'Animation published.')} onUnpublish={() => lifecycle(unpublishAnimation, 'Animation unpublished.')} onDelete={() => setPending({ type: 'delete' })} /><AdminPreviewSidebar item={form} /></div>
      {pending?.type === 'discard' && <AdminModal title="Discard unsaved changes?" confirmLabel="Discard changes" onCancel={() => setPending(null)} onConfirm={() => { const next = pending.next; setPending(null); next(); }}><p>Your unsaved metadata changes will be lost.</p></AdminModal>}
      {pending?.type === 'delete' && <AdminModal title="Delete this animation?" confirmLabel="Delete animation" tone="danger" onCancel={() => setPending(null)} onConfirm={removeAnimation}><p>This permanently removes the animation record and its uploaded media. This action cannot be undone.</p></AdminModal>}
    </>;
}

export default function AdminWorkspace({ onLoggedOut, onViewSite }) {
  const [identity, setIdentity] = useState(null);
  const [section, setSection] = useState('animations');

  useEffect(() => {
    getAdminSession().then(setIdentity).catch(() => setIdentity(null));
  }, []);

  if (!identity) return <main className="admin-shell"><section className="admin-loading"><p className="section-kicker">MiYo Studio</p><h1>Loading workspace.</h1></section></main>;

  return <main className="admin-shell">
    <header className="admin-topbar admin-topbar--sectioned">
      <div className="admin-topbar-actions">
        <button className="brand brand-button" type="button" onClick={onViewSite}><span className="brand-mark">m</span><span>MiYo <em>Studio</em></span></button>
        <nav className="admin-section-tabs" aria-label="Admin sections"><button type="button" className={section === 'animations' ? 'is-active' : ''} onClick={() => setSection('animations')}>Animations</button><button type="button" className={section === 'pages' ? 'is-active' : ''} onClick={() => setSection('pages')}>Pages</button><button type="button" className={section === 'global' ? 'is-active' : ''} onClick={() => setSection('global')}>Global</button></nav>
      </div>
    </header>
    {section === 'animations' && <AdminAnimationWorkspace identity={identity} onLoggedOut={onLoggedOut} onViewSite={onViewSite} />}
    {section === 'pages' && <AdminPagesManager identity={identity} onViewSite={(path) => onViewSite(path || '/')} onLogout={onLoggedOut} />}
    {section === 'global' && <AdminGlobalManager identity={identity} onViewSite={() => onViewSite('/')} onLogout={onLoggedOut} />}
  </main>;
}