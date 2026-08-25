import { useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { getAdminGlobalConfig, mergeGlobalConfig, patchAdminGlobalConfig } from '../../api/globalConfig';
import { uploadSiteMedia, runSiteMediaCleanup, deleteSiteMedia } from '../../api/siteMedia';
import { addPendingUpload, cleanupPendingUploads, clearPendingUploads } from './AdminPagesManager';

const TABS = ['navigation', 'footer', 'seo', 'maintenance'];
const LABELS = { navigation: 'Navigation', footer: 'Footer', seo: 'SEO', maintenance: 'Maintenance' };
const clone = (value) => structuredClone(value);

function Field({ label, children, note }) { return <label className="admin-field"><span className="admin-field-label">{label}</span>{children}{note && <span className="admin-field-hint">{note}</span>}</label>; }
function TextList({ items, fields, onChange, addLabel, withEnabled = false }) {
  return <div className="admin-form-list">{items.map((item, index) => <div className="admin-global-list-row" key={index}>{fields.map((field) => <Field key={field.key} label={field.label}><input maxLength={field.maxLength} value={item[field.key] || ''} onChange={(event) => onChange(items.map((value, itemIndex) => itemIndex === index ? { ...value, [field.key]: event.target.value } : value))} /></Field>)}{withEnabled && <label className="admin-checkbox"><input type="checkbox" checked={item.enabled !== false} onChange={(event) => onChange(items.map((value, itemIndex) => itemIndex === index ? { ...value, enabled: event.target.checked } : value))} />Enabled</label>}<button type="button" className="admin-button-ghost is-danger" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}<button type="button" className="admin-button-ghost" onClick={() => onChange([...items, { ...Object.fromEntries(fields.map((field) => [field.key, ''])), ...(withEnabled ? { enabled: true } : {}) }])}>+ {addLabel}</button></div>;
}
function ContentEditor({ tab, value, onChange }) {
  const set = (field, next) => onChange({ ...value, [field]: next });
  if (tab === 'navigation') return <div className="admin-editor-form"><Field label="Logo Text"><input maxLength="80" value={value.logoText || ''} onChange={(event) => set('logoText', event.target.value)} /></Field><p className="section-kicker">Menu</p><TextList items={value.menu || []} fields={[{ key: 'label', label: 'Label', maxLength: 80 }, { key: 'path', label: 'Path', maxLength: 500 }]} withEnabled onChange={(menu) => set('menu', menu)} addLabel="Add menu item" /><p className="section-kicker">Header Button</p><div className="admin-field-row"><Field label="Text"><input value={value.button?.text || ''} onChange={(event) => set('button', { ...value.button, text: event.target.value })} /></Field><Field label="Link"><input value={value.button?.link || ''} onChange={(event) => set('button', { ...value.button, link: event.target.value })} /></Field></div><label className="admin-checkbox"><input type="checkbox" checked={Boolean(value.button?.enabled)} onChange={(event) => set('button', { ...value.button, enabled: event.target.checked })} />Enabled</label></div>;
  if (tab === 'seo') return <div className="admin-editor-form"><Field label="Title"><input value={value.title || ''} onChange={(event) => set('title', event.target.value)} /></Field><Field label="Description"><textarea rows={4} value={value.description || ''} onChange={(event) => set('description', event.target.value)} /></Field><Field label="Keywords"><input value={value.keywords || ''} onChange={(event) => set('keywords', event.target.value)} /></Field><Field label="OG Image Key"><input value={value.ogImageKey || ''} onChange={(event) => set('ogImageKey', event.target.value)} /></Field><Field label="Favicon Key"><input value={value.faviconKey || ''} onChange={(event) => set('faviconKey', event.target.value)} /></Field></div>;
  return <div className="admin-editor-form"><Field label="Logo Text"><input maxLength="80" value={value.logoText || ''} onChange={(event) => set('logoText', event.target.value)} /></Field><Field label="Description"><textarea maxLength="600" rows={3} value={value.description || ''} onChange={(event) => set('description', event.target.value)} /></Field><p className="section-kicker">Link Groups</p>{(value.links || []).map((group, index) => <section className="admin-global-group" key={index}><div className="admin-field-row"><Field label="Group Title"><input value={group.title || ''} onChange={(event) => set('links', value.links.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} /></Field><button type="button" className="admin-button-ghost is-danger" onClick={() => set('links', value.links.filter((_, itemIndex) => itemIndex !== index))}>Remove group</button></div><TextList items={group.items || []} fields={[{ key: 'label', label: 'Label' }, { key: 'url', label: 'URL' }]} onChange={(items) => set('links', value.links.map((item, itemIndex) => itemIndex === index ? { ...item, items } : item))} addLabel="Add link" /></section>)}<button type="button" className="admin-button-ghost" onClick={() => set('links', [...(value.links || []), { title: '', items: [] }])}>+ Add link group</button><Field label="Copyright"><input maxLength="120" value={value.copyrightText || value.copyright || ''} onChange={(event) => set('copyrightText', event.target.value)} /></Field><p className="section-kicker">Social Links</p><TextList items={value.social || value.socialLinks || []} fields={[{ key: 'platform', label: 'Platform', maxLength: 50 }, { key: 'url', label: 'URL', maxLength: 500 }]} withEnabled onChange={(social) => set('social', social)} addLabel="Add social link" /></div>;
}
function MediaEditor({ tab, content, media, onContentChange, onMediaChange, setStatus }) {
  const [busy, setBusy] = useState(false);
  const upload = async (file, field) => {
    if (!file) return;
    setBusy(true);
    try {
      const result = await uploadSiteMedia(file, tab === 'seo' ? 'seo' : tab);
      addPendingUpload(result.mediaKey);
      if (tab === 'seo') onContentChange({ ...content, [field]: result.mediaKey });
      else onMediaChange({ ...media, logoImageKey: result.mediaKey });
      setStatus('Media uploaded. Save changes to publish it.');
    } catch (error) {
      setStatus(error.message || 'Media upload failed.');
    } finally {
      setBusy(false);
    }
  };
  if (tab === 'seo') return <div className="admin-editor-form"><Field label="OG Image Key"><input maxLength="200" value={content.ogImageKey || ''} onChange={(event) => onContentChange({ ...content, ogImageKey: event.target.value })} /></Field><input className="sr-only" id="global-og-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={(event) => { upload(event.target.files[0], 'ogImageKey'); event.target.value = ''; }} /><label className="admin-button-ghost" htmlFor="global-og-upload">Upload OG image</label><Field label="Favicon Key"><input maxLength="200" value={content.faviconKey || ''} onChange={(event) => onContentChange({ ...content, faviconKey: event.target.value })} /></Field><input className="sr-only" id="global-favicon-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={(event) => { upload(event.target.files[0], 'faviconKey'); event.target.value = ''; }} /><label className="admin-button-ghost" htmlFor="global-favicon-upload">Upload favicon</label></div>;
  return <div className="admin-editor-form"><Field label="Logo Image Key"><input maxLength="200" value={media.logoImageKey || ''} onChange={(event) => onMediaChange({ ...media, logoImageKey: event.target.value })} /></Field><input className="sr-only" id={`global-${tab}-logo-upload`} type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={(event) => { upload(event.target.files[0], 'logoImageKey'); event.target.value = ''; }} /><label className="admin-button-ghost" htmlFor={`global-${tab}-logo-upload`}>Upload logo</label></div>;
}
function DesignEditor() { return <p className="admin-empty-hint">No global design overrides are active. The existing visual defaults remain unchanged.</p>; }

function MaintenancePanel() {
  const [phase, setPhase] = useState('idle');
  const [result, setResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState('');

  const scan = async () => {
    setPhase('scanning');
    setStatus('Scanning KV for orphaned site media...');
    try {
      const data = await runSiteMediaCleanup();
      setResult(data);
      setPhase('results');
      setStatus('');
    } catch (err) {
      setStatus(err.message || 'Scan failed.');
      setPhase('idle');
    }
  };

  const requestDelete = () => setConfirming(true);

  const executeDelete = async () => {
    setPhase('deleting');
    setConfirming(false);
    setStatus('Removing orphaned media...');
    try {
      const data = await runSiteMediaCleanup();
      setResult(data);
      setPhase('done');
      setStatus('');
    } catch (err) {
      setStatus(err.message || 'Delete failed.');
      setPhase('idle');
    }
  };

  const reset = () => { setPhase('idle'); setResult(null); setConfirming(false); setStatus(''); cleanupPendingUploads(); };

  if (phase === 'idle' || phase === 'scanning') {
    return (
      <div className="admin-editor-form">
        <p className="section-kicker">Media Maintenance</p>
        <p className="admin-field-hint">Removes site media objects older than 24 hours that are no longer referenced by any page section or global configuration.</p>
        <div className="admin-media-maintenance">
          <div className="admin-maintenance-notice">
            <p>Before running cleanup, ensure all pending uploads have been saved or discarded. Cleanup cannot recover deleted objects.</p>
          </div>
          <button type="button" className="button button--dark" onClick={scan} disabled={phase === 'scanning'}>
            {phase === 'scanning' ? 'Scanning...' : 'Scan for orphaned media'}
          </button>
          {status && <p className="admin-status">{status}</p>}
        </div>
      </div>
    );
  }

  if (phase === 'results' || phase === 'done') {
    const { scanned, referenced, eligible, deleted, failed } = result || {};
    return (
      <div className="admin-editor-form">
        <p className="section-kicker">{phase === 'results' ? 'Cleanup Results' : 'Cleanup Complete'}</p>
        <dl className="admin-history">
          <div><dt>Total site/* objects scanned</dt><dd>{scanned}</dd></div>
          <div><dt>Currently referenced</dt><dd>{referenced}</dd></div>
          <div><dt>Eligible (&gt;24h, unreferenced)</dt><dd>{eligible}</dd></div>
          <div><dt>Successfully deleted</dt><dd>{deleted}</dd></div>
          {failed > 0 && <div><dt>Failed to delete</dt><dd>{failed}</dd></div>}
        </dl>
        {phase === 'results' && eligible > 0 && !confirming && (
          <button type="button" className="button button--dark" onClick={requestDelete}>
            Delete {eligible} orphaned object{eligible !== 1 ? 's' : ''}
          </button>
        )}
        {phase === 'results' && confirming && (
          <div className="admin-confirm-delete">
            <p>Confirm permanent deletion of {eligible} object{eligible !== 1 ? 's' : ''}?</p>
            <div className="admin-inline-actions">
              <button type="button" className="button admin-button-danger" onClick={executeDelete}>Yes, delete</button>
              <button type="button" className="button admin-button-secondary" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          </div>
        )}
        <button type="button" className="admin-button-ghost" onClick={reset}>
          {phase === 'done' ? 'Run again' : 'Scan again'}
        </button>
      </div>
    );
  }

  return null;
}

export default function AdminGlobalManager({ identity, onViewSite, onLogout }) {
  const [tab, setTab] = useState('navigation');
  const [config, setConfig] = useState(null);
  const [saved, setSaved] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [status, setStatus] = useState('Loading global settings...');
  const [busy, setBusy] = useState(false);
  const dirty = useMemo(() => JSON.stringify(config) !== JSON.stringify(saved), [config, saved]);
  useEffect(() => { getAdminGlobalConfig().then((data) => { const next = mergeGlobalConfig(data); setConfig(next); setSaved(clone(next)); setStatus(''); }).catch((error) => setStatus(error.message || 'Could not load global settings.')); }, []);
  useEffect(() => { setActiveTab('content'); }, [tab]);
  useEffect(() => {
    const cleanup = () => { cleanupPendingUploads(); };
    window.addEventListener('beforeunload', cleanup);
    return () => window.removeEventListener('beforeunload', cleanup);
  }, []);
  const current = config?.[tab];
  const update = (patch) => setConfig((value) => ({ ...value, [tab]: { ...value[tab], ...patch } }));
  const save = async () => { setBusy(true); setStatus('Saving changes...'); try { const data = await patchAdminGlobalConfig({ [tab]: current }); const next = mergeGlobalConfig(data); setConfig(next); setSaved(clone(next)); clearPendingUploads(); window.dispatchEvent(new Event('global-config:refresh')); setStatus('Changes saved.'); } catch (error) { setStatus(error.message || 'Could not save global settings.'); } finally { setBusy(false); } };

  const isMaintenance = tab === 'maintenance';
  const configReady = !isMaintenance && (config && current);

  if (isMaintenance) {
    return (
      <main className="admin-global-shell">
        <header className="admin-pages-sticky">
          <div className="admin-pages-sticky-inner">
            <div className="admin-pages-sticky-text">
              <p className="section-kicker">GLOBAL CMS</p>
              <h1>Edit {LABELS[tab]}</h1>
            </div>
            <div className="admin-pages-actions">
              <button type="button" className="admin-button-ghost" onClick={onViewSite}><Eye size={14} />View Site</button>
            </div>
          </div>
        </header>
        <div className="admin-global-layout">
          <aside className="admin-pages-nav">
            <p className="section-kicker">Global</p>
            <ul>{TABS.map((key) => <li key={key}><button type="button" className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>{LABELS[key]}</button></li>)}</ul>
          </aside>
          <section className="admin-global-editor">
            <MaintenancePanel />
          </section>
        </div>
      </main>
    );
  }

  if (!configReady) return <section className="admin-pages-loading"><p className="section-kicker">Global CMS</p><h1>Loading global settings</h1><p>{status}</p></section>;

  return (
    <main className="admin-global-shell">
      <header className="admin-pages-sticky">
        <div className="admin-pages-sticky-inner">
          <div className="admin-pages-sticky-text">
            <p className="section-kicker">GLOBAL CMS</p>
            <h1>Edit {LABELS[tab]}</h1>
          </div>
          <div className="admin-pages-actions">
            <button type="button" className="admin-button-ghost" onClick={onViewSite}><Eye size={14} />View Site</button>
            <button type="button" className="admin-button-ghost" onClick={() => setConfig(clone(saved))} disabled={!dirty || busy}>Reset</button>
            <button type="button" className="button button--dark" onClick={save} disabled={!dirty || busy}>{busy ? 'Saving...' : dirty ? 'Save Changes' : 'Saved'}</button>
          </div>
        </div>
        <p className={`admin-pages-status${dirty ? ' admin-pages-status--dirty' : ''}`}>{status || (dirty ? 'Unsaved changes' : 'Saved')}</p>
      </header>
      <div className="admin-global-layout">
        <aside className="admin-pages-nav">
          <p className="section-kicker">Global</p>
          <ul>{TABS.map((key) => <li key={key}><button type="button" className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>{LABELS[key]}</button></li>)}</ul>
        </aside>
        <section className="admin-global-editor">
          <div className="admin-tabs">
            <button type="button" className={activeTab === 'content' ? 'admin-tab is-active' : 'admin-tab'} onClick={() => setActiveTab('content')}>Content</button>
            <button type="button" className={activeTab === 'media' ? 'admin-tab is-active' : 'admin-tab'} onClick={() => setActiveTab('media')}>Media</button>
            <button type="button" className={activeTab === 'design' ? 'admin-tab is-active' : 'admin-tab'} onClick={() => setActiveTab('design')}>Design</button>
          </div>
          {activeTab === 'content' && <ContentEditor tab={tab} value={current.content} onChange={(content) => update({ content })} />}
          {activeTab === 'media' && <MediaEditor tab={tab} content={current.content} media={current.media} onContentChange={(content) => update({ content })} onMediaChange={(media) => update({ media })} setStatus={setStatus} />}
          {activeTab === 'design' && <DesignEditor />}
        </section>
      </div>
      <footer className="admin-pages-bottom-bar">
        <p className={`admin-pages-status${dirty ? ' admin-pages-status--dirty' : ''}`}>{dirty ? 'Unsaved changes' : 'Saved'}</p>
        <button type="button" className="button button--dark" onClick={save} disabled={!dirty || busy}>{busy ? 'Saving...' : dirty ? 'Save Changes' : 'Saved'}</button>
      </footer>
    </main>
  );
}
