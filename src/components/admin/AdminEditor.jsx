import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import MiYoScreenPreview from '../MiYoScreenPreview';
import { animationCategories } from '../../data/animationLibraryConstants';
import { miyoCharacterColors } from '../../data/miyoCharacters';
import { formatUtcTimestamp } from '../../utils/formatTimestamp';

const limits = { gif: 8 * 1024 * 1024, mp4: 20 * 1024 * 1024 };

function displayBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaUploader({ animationId, format, item, onUpload, onRemove, busy }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('');
  const uploaded = Boolean(item[`${format}ObjectKey`]);
  const label = format.toUpperCase();
  const audioNote = format === 'gif' ? 'No audio' : 'Audio supported';

  const upload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(`.${format}`)) {
      setStatus(`Choose a .${format} file.`);
      return;
    }
    if (file.size > limits[format]) {
      setStatus(`${label} must be ${displayBytes(limits[format])} or smaller.`);
      return;
    }
    setStatus('Uploading...');
    try {
      await onUpload(format, file);
      setStatus('Uploaded');
    } catch (error) {
      console.error('Media upload failed:', error);
      setStatus('Upload failed. Please try again.');
    }
  };

  const remove = async () => {
    setStatus('Removing...');
    try {
      await onRemove(format);
      setStatus('Removed');
    } catch (error) {
      setStatus(error.message || 'Remove failed. Retry the removal.');
    }
  };

  return <section className={`admin-media-card${dragging ? ' is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); if (animationId && !busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); if (animationId && !busy) upload(event.dataTransfer.files[0]); }}>
    <div className="admin-media-card-heading"><div><p className="section-kicker">{label}</p><p>{audioNote} · Max {displayBytes(limits[format])}</p></div><ImagePlus size={18} strokeWidth={1.6} /></div>
    {uploaded ? <div className="admin-media-file"><strong>{item[`${format}FileName`]}</strong><span>{displayBytes(item[`${format}FileSize`])} · Uploaded</span><div className="admin-inline-actions"><button type="button" disabled={busy} onClick={() => inputRef.current?.click()}><Upload size={14} />Replace</button><button className="admin-action-danger" type="button" disabled={busy} onClick={remove}><Trash2 size={14} />Remove</button></div></div> : <button className="admin-dropzone" type="button" disabled={busy || !animationId} onClick={() => inputRef.current?.click()}>{animationId ? <>Drop a {label} here or choose a file</> : 'Create draft to add media'}</button>}
    <input ref={inputRef} className="sr-only" type="file" accept={format === 'gif' ? '.gif,image/gif' : '.mp4,video/mp4'} disabled={busy || !animationId} onChange={(event) => { upload(event.target.files[0]); event.target.value = ''; }} />
    <p className="admin-upload-status" aria-live="polite">{status}</p>
  </section>;
}

function History({ item }) {
  if (!item?.createdAt) return null;
  return <section className="admin-detail-section"><p className="section-kicker">Record history</p><dl className="admin-history"><div><dt>Created</dt><dd>{formatUtcTimestamp(item.createdAt)}</dd></div><div><dt>First published</dt><dd>{formatUtcTimestamp(item.publishedAt)}</dd></div><div><dt>Last updated</dt><dd>{formatUtcTimestamp(item.updatedAt)}</dd></div></dl></section>;
}

export default function AdminEditor({ item, animationId, busy, status, onFieldChange, onSave, onUpload, onRemove, onPublish, onUnpublish, onDelete }) {
  const isPublished = item.status === 'published';
  const preview = item.gifPath ? { type: 'gif', src: item.gifPath } : item.mp4Path ? { type: 'mp4', src: item.mp4Path } : null;

  return <form className="admin-editor" onSubmit={onSave}>
    <header className="admin-editor-title"><div><p className="section-kicker">{animationId ? 'Edit animation' : 'New animation'}</p><h1>{animationId ? item.title || 'Untitled animation' : 'New animation'}</h1></div>{animationId && <span className={`admin-status-badge admin-status-badge--${item.status}`}>{item.status}</span>}</header>
    <section className="admin-detail-section"><p className="section-kicker">Basic information</p><label>Title<input required maxLength="120" value={item.title} onChange={(event) => onFieldChange('title', event.target.value)} /></label><label>Category<select value={item.category} onChange={(event) => onFieldChange('category', event.target.value)}>{animationCategories.filter((category) => category !== 'All').map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label>Description<textarea value={item.description} onChange={(event) => onFieldChange('description', event.target.value)} /></label><label>Tags<span className="admin-field-note">Separate tags with commas</span><input value={(item.tags || []).join(', ')} onChange={(event) => onFieldChange('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} /></label></section>
    <section className="admin-detail-section"><p className="section-kicker">Display settings</p><div className="admin-field-grid"><label>Character<select value={item.characterColor} onChange={(event) => onFieldChange('characterColor', event.target.value)}>{miyoCharacterColors.map((color) => <option key={color} value={color}>{color}</option>)}</select></label><label>Scale<input type="number" min="0.5" max="2" step="0.05" value={item.contentScale} onChange={(event) => onFieldChange('contentScale', event.target.value)} /></label></div><label className="admin-checkbox"><input type="checkbox" checked={Boolean(item.featured)} onChange={(event) => onFieldChange('featured', event.target.checked)} /> Featured on Home</label></section>
    {animationId && <section className="admin-detail-section"><p className="section-kicker">Media</p><div className="admin-media-grid"><MediaUploader animationId={animationId} format="gif" item={item} busy={busy} onUpload={onUpload} onRemove={onRemove} /><MediaUploader animationId={animationId} format="mp4" item={item} busy={busy} onUpload={onUpload} onRemove={onRemove} /></div></section>}
    <section className="admin-mobile-preview admin-detail-section"><p className="section-kicker">Preview</p>{preview ? <MiYoScreenPreview item={{ ...item, preview }} size="admin" /> : <p className="admin-empty-preview">Upload GIF or MP4 to preview.</p>}</section>
    <History item={item} />
    <footer className="admin-editor-actions"><button className="button button--dark" disabled={busy} type="submit">{busy ? 'Working...' : animationId ? 'Save Changes' : 'Create Draft & Continue'}</button>{animationId && <div className="admin-lifecycle-actions">{isPublished ? <button className="button admin-button-secondary" type="button" disabled={busy} onClick={onUnpublish}>Unpublish</button> : <button className="button admin-button-secondary" type="button" disabled={busy || !preview} onClick={onPublish}>Publish</button>}<button className="button admin-button-danger" type="button" disabled={busy} onClick={onDelete}>Delete animation</button></div>}<p className="admin-workspace-status" aria-live="polite">{status}</p></footer>
  </form>;
}
