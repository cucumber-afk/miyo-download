import { ArrowDown, ArrowLeft, ArrowUp, ChevronDown, Eye } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAdminSiteConfig, patchAdminSiteConfig } from '../../api/siteConfig';
import { uploadSiteMedia, deleteSiteMedia } from '../../api/siteMedia';
import { DEFAULT_PAGE_CONFIG, DOWNLOADS_CATEGORY_OPTIONS, DOWNLOADS_SECTION_LABELS, DOWNLOADS_SORT_OPTIONS, HOME_FEATURED_LIMIT_OPTIONS, HOME_FEATURED_LIMIT_DEFAULT, HOME_SECTION_LABELS, PAGE_KEYS } from '../../data/defaultPageConfig';
import { clamp, DEFAULT_ANIMATION_SLOTS, getDefaultSlot, SLOT_IDS } from '../../data/heroAnimationSlots';
import AdminModal from './AdminModal';

// Module-level pending site media tracker (shared across component tree)
const _pendingUploads = { current: [] };
export function getPendingUploads() { return _pendingUploads.current; }
export function addPendingUpload(key) { _pendingUploads.current = [..._pendingUploads.current.filter((p) => p.key !== key), { key, uploadedAt: Date.now() }]; }
export function clearPendingUploads() { _pendingUploads.current = []; }
export async function cleanupPendingUploads() {
  const keys = _pendingUploads.current.map((p) => p.key);
  _pendingUploads.current = [];
  await Promise.allSettled(keys.map((key) => deleteSiteMedia(key).catch(() => {})));
}
import HeroSection from '../HeroSection';
import Support from '../../pages/Support';

function HeroDesignEditor({ design, onChange }) {
  const set = (field, value) => onChange({ ...design, [field]: value });
  const bgColor = design.backgroundColor || '';
  const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(bgColor);

  return <div className="admin-editor-form">
    <div className="admin-field-stack">
      <p className="section-kicker">Layout</p>
      <div className="admin-field-row">
        <Field label="Layout Style">
          <select value={design.layoutStyle || 'split'} onChange={(event) => set('layoutStyle', event.target.value)}>
            <option value="split">Split</option>
            <option value="center">Center</option>
          </select>
        </Field>
        <Field label="Content Alignment">
          <select value={design.contentAlignment || 'left'} onChange={(event) => set('contentAlignment', event.target.value)}>
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </Field>
      </div>
      <Field label="Section Height">
        <select value={design.sectionHeight || 'medium'} onChange={(event) => set('sectionHeight', event.target.value)}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </Field>
    </div>
    <div className="admin-field-stack">
      <p className="section-kicker">Typography</p>
      <div className="admin-field-row">
        <Field label="Title Size">
          <select value={design.titleSize || 'large'} onChange={(event) => set('titleSize', event.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </Field>
        <Field label="Text Width">
          <select value={design.textWidth || 'normal'} onChange={(event) => set('textWidth', event.target.value)}>
            <option value="narrow">Narrow</option>
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
          </select>
        </Field>
      </div>
    </div>
    <div className="admin-field-stack">
      <p className="section-kicker">Spacing</p>
      <div className="admin-field-row">
        <Field label="Top Padding">
          <select value={design.topPadding || 'normal'} onChange={(event) => set('topPadding', event.target.value)}>
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="spacious">Spacious</option>
          </select>
        </Field>
        <Field label="Bottom Padding">
          <select value={design.bottomPadding || 'normal'} onChange={(event) => set('bottomPadding', event.target.value)}>
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="spacious">Spacious</option>
          </select>
        </Field>
      </div>
      <Field label="Content Gap">
        <select value={design.contentGap || 'normal'} onChange={(event) => set('contentGap', event.target.value)}>
          <option value="compact">Compact</option>
          <option value="normal">Normal</option>
          <option value="spacious">Spacious</option>
        </select>
      </Field>
    </div>
    <div className="admin-field-stack">
      <p className="section-kicker">Background</p>
      <Field label="Background Color" note="Enter a valid hex color (#RRGGBB) or leave empty.">
        <div className="admin-color-field">
          <input
            type="text"
            value={bgColor}
            onChange={(event) => set('backgroundColor', event.target.value)}
            placeholder="#FFFFFF"
            style={{ flex: 1 }}
          />
          <input
            type="color"
            value={isValidHex ? bgColor : '#FFFFFF'}
            onChange={(event) => set('backgroundColor', event.target.value)}
            disabled={!isValidHex && bgColor !== ''}
            style={{ width: '60px', height: '38px', cursor: 'pointer' }}
          />
          {bgColor && <button type="button" className="admin-button-ghost" onClick={() => set('backgroundColor', '')} style={{ padding: '0 12px' }}>Reset</button>}
        </div>
      </Field>
    </div>
  </div>;
}

function snapshotSection(section) {
  return JSON.stringify({ enabled: section.enabled, sortOrder: section.sortOrder, content: section.content, design: section.design || {}, layout: section.layout || {}, media: section.media || {}, seo: section.seo || {} });
}

function snapshotSections(sections) {
  return JSON.stringify([...sections].sort((a, b) => a.sectionKey.localeCompare(b.sectionKey)).map(snapshotSection));
}

function defaultSectionsFor(pageKey) {
  return Object.entries(DEFAULT_PAGE_CONFIG[pageKey] || {}).map(([sectionKey, value]) => ({
    sectionKey,
    enabled: value.enabled,
    sortOrder: value.sortOrder,
    content: value.content || {},
    design: value.design || {},
    layout: value.layout || {},
    media: value.media || {},
    seo: value.seo || {},
  }));
}

function sectionEntries(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function mergeSectionWithDefault(defaultSection, section) {
  const defaultContent = defaultSection?.content || {};
  const savedContent = section?.content && typeof section.content === 'object' && !Array.isArray(section.content) ? section.content : {};
  const content = { ...defaultContent, ...savedContent };
  if (section?.sectionKey === 'faq' && Array.isArray(defaultContent.faqs)) {
    const savedFaqs = Array.isArray(savedContent.faqs) ? savedContent.faqs : [];
    content.faqs = defaultContent.faqs.map((faq, index) => ({ ...faq, ...(savedFaqs[index] || {}) }));
  }
  return {
    sectionKey: section?.sectionKey || defaultSection?.sectionKey,
    enabled: section?.enabled ?? defaultSection?.enabled ?? true,
    sortOrder: section?.sortOrder ?? defaultSection?.sortOrder ?? 0,
    content,
    design: { ...(defaultSection?.design || {}), ...(section?.design || {}) },
    layout: { ...(defaultSection?.layout || {}), ...(section?.layout || {}) },
    media: { ...(defaultSection?.media || {}), ...(section?.media || {}) },
    seo: { ...(defaultSection?.seo || {}), ...(section?.seo || {}) },
  };
}

function mergePageSections(pageKey, value) {
  const defaults = defaultSectionsFor(pageKey);
  const byKey = new Map(defaults.map((section) => [section.sectionKey, section]));
  for (const section of sectionEntries(value)) {
    if (!section?.sectionKey) continue;
    byKey.set(section.sectionKey, mergeSectionWithDefault(byKey.get(section.sectionKey) || {}, section));
  }
  return Array.from(byKey.values());
}

function moveSection(sections, key, direction) {
  const ordered = [...sections].sort((a, b) => a.sortOrder - b.sortOrder || a.sectionKey.localeCompare(b.sectionKey));
  const index = ordered.findIndex((section) => section.sectionKey === key);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= ordered.length) return sections;
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  return ordered.map((section, sortOrder) => ({ ...section, sortOrder }));
}

function Field({ label, note, children }) {
  return <label className="admin-field">
    <span className="admin-field-label">{label}</span>
    {children}
    {note && <span className="admin-field-hint">{note}</span>}
  </label>;
}

function EnabledToggle({ enabled, onChange }) {
  return <label className="admin-toggle" onClick={(event) => event.stopPropagation()}>
    <input type="checkbox" checked={enabled} onChange={(event) => onChange(event.target.checked)} />
    <span className="admin-toggle-track" aria-hidden="true"><span className="admin-toggle-thumb" /></span>
    <span className="admin-toggle-text" aria-live="polite">{enabled ? 'Enabled' : 'Disabled'}</span>
  </label>;
}

function StatRow({ index, value, onChange, onRemove }) {
  return <section className="admin-stat-row-card">
    <header className="admin-stat-row-card-head">
      <p className="section-kicker">Stat {index + 1}</p>
      <button type="button" className="admin-button-ghost is-danger" onClick={onRemove}>Remove</button>
    </header>
    <div className="admin-stat-row-card-body">
      <Field label="Label"><input value={value.label || ''} onChange={(event) => onChange({ ...value, label: event.target.value })} /></Field>
      <Field label="Description"><input value={value.value || ''} onChange={(event) => onChange({ ...value, value: event.target.value })} /></Field>
    </div>
  </section>;
}

function HeroContentEditor({ content, onChange }) {
  const set = (field, value) => onChange({ ...content, [field]: value });
  const stats = Array.isArray(content.stats) ? content.stats : [];
  const updateStat = (index, next) => onChange({ ...content, stats: stats.map((stat, statIndex) => statIndex === index ? next : stat) });
  const removeStat = (index) => onChange({ ...content, stats: stats.filter((_, statIndex) => statIndex !== index) });
  const addStat = () => onChange({ ...content, stats: [...stats, { label: '', value: '' }] });

  return <div className="admin-editor-form">
    <Field label="Eyebrow"><input value={content.eyebrow || ''} onChange={(event) => set('eyebrow', event.target.value)} /></Field>
    <div className="admin-field-row">
      <Field label="Title"><input value={content.title || ''} onChange={(event) => set('title', event.target.value)} /></Field>
      <Field label="Title Highlight"><input value={content.titleHighlight || ''} onChange={(event) => set('titleHighlight', event.target.value)} /></Field>
    </div>
    <Field label="Description"><textarea rows={4} value={content.description || ''} onChange={(event) => set('description', event.target.value)} /></Field>
    <div className="admin-field-stack">
      <p className="section-kicker">Primary Button</p>
      <div className="admin-field-row">
        <Field label="Button Text"><input value={content.primaryButtonText || ''} onChange={(event) => set('primaryButtonText', event.target.value)} /></Field>
        <Field label="Button Link" note="Use an internal path or a full https:// URL."><input value={content.primaryButtonLink || ''} onChange={(event) => set('primaryButtonLink', event.target.value)} /></Field>
      </div>
    </div>
    <div className="admin-stat-list">
      <header className="admin-stat-list-heading">
        <p className="section-kicker">Hero Stats</p>
        <button type="button" className="admin-button-ghost" onClick={addStat}>+ Add Stat</button>
      </header>
      {stats.map((stat, index) => <StatRow key={index} index={index} value={stat} onChange={(next) => updateStat(index, next)} onRemove={() => removeStat(index)} />)}
    </div>
  </div>;
}

function HeroMediaEditor({ media, onChange, hasUnsavedUpload }) {
  const imageKey = media?.characterShowcaseImageKey || '';
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const result = await uploadSiteMedia(file);
      addPendingUpload(result.mediaKey);
      onChange({ ...media, characterShowcaseImageKey: result.mediaKey });
    } catch (err) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange({ ...media, characterShowcaseImageKey: '' });
  };

  const handleAnimationSlotsChange = (updatedMedia) => {
    onChange(updatedMedia);
  };

  return <div className="admin-editor-form">
    <div className="admin-media-preview-area">
      <p className="section-kicker">Character Showcase Image</p>
      <div className="admin-media-preview-box">
        {imageKey ? (
          <img src={`/api/media?key=${encodeURIComponent(imageKey)}`} alt="Character Showcase" className="admin-media-preview-image" />
        ) : (
          <div className="admin-media-preview-placeholder">
            <img src="/assets/home/hero-lineup-latest.png" alt="Default Character Showcase" className="admin-media-preview-image" />
            <span className="admin-media-preview-label">Default Image</span>
          </div>
        )}
      </div>
    </div>
    {uploadError && <p className="admin-field-error">{uploadError}</p>}
    {hasUnsavedUpload && <p className="admin-field-warning">Uploaded media will be lost if you leave without saving.</p>}
    <div className="admin-media-actions">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(event) => handleUpload(event.target.files?.[0])}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="button button--dark"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : imageKey ? 'Replace Image' : 'Upload Image'}
      </button>
      {imageKey && (
        <button type="button" className="admin-button-ghost is-danger" onClick={handleRemove}>
          Use Default
        </button>
      )}
    </div>
    <div className="admin-media-divider" />
    <AnimationSlotsEditor media={media} onChange={handleAnimationSlotsChange} />
  </div>;
}

function AnimationSlotCard({ slotId, slot, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const mediaKey = slot?.mediaKey || '';
  const enabled = slot?.enabled ?? true;
  const left = slot?.left ?? getDefaultSlot(slotId)?.left ?? 0;
  const top = slot?.top ?? getDefaultSlot(slotId)?.top ?? 0;
  const width = slot?.width ?? getDefaultSlot(slotId)?.width ?? 8;
  const contentScale = slot?.contentScale ?? getDefaultSlot(slotId)?.contentScale ?? 1;
  const fallbackSrc = getDefaultSlot(slotId)?.fallbackSrc || `/assets/animations/hero/${slotId}.gif`;
  const previewSrc = mediaKey ? `/api/media?key=${encodeURIComponent(mediaKey)}` : fallbackSrc;

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const result = await uploadSiteMedia(file);
      addPendingUpload(result.mediaKey);
      onChange({ ...slot, mediaKey: result.mediaKey, type: result.format });
    } catch (err) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange({ ...slot, mediaKey: '', type: 'gif' });
  };

  const updateSlot = (updates) => {
    onChange({ ...slot, ...updates });
  };

  return <div className="admin-animation-slot-card">
    <div className="admin-animation-slot-header">
      <label className="admin-checkbox-label">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => updateSlot({ enabled: e.target.checked })}
        />
        <span className={`slot-label-color slot-label-${slotId}`}>{slotId.toUpperCase()}</span>
      </label>
    </div>
    <div className="admin-animation-slot-preview">
      <img src={previewSrc} alt={slotId} className="admin-animation-slot-preview-image" />
    </div>
    {uploadError && <p className="admin-field-error">{uploadError}</p>}
    <div className="admin-animation-slot-fields">
      <div className="admin-animation-slot-row">
        <label>Left</label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={left}
          onChange={(e) => updateSlot({ left: clamp(parseFloat(e.target.value) || 0, 0, 100) })}
        />
      </div>
      <div className="admin-animation-slot-row">
        <label>Top</label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={top}
          onChange={(e) => updateSlot({ top: clamp(parseFloat(e.target.value) || 0, 0, 100) })}
        />
      </div>
      <div className="admin-animation-slot-row">
        <label>Width</label>
        <input
          type="number"
          min="1"
          max="30"
          step="0.1"
          value={width}
          onChange={(e) => updateSlot({ width: clamp(parseFloat(e.target.value) || 1, 1, 30) })}
        />
      </div>
      <div className="admin-animation-slot-row">
        <label>Scale</label>
        <input
          type="number"
          min="0.5"
          max="2"
          step="0.1"
          value={contentScale}
          onChange={(e) => updateSlot({ contentScale: clamp(parseFloat(e.target.value) || 1, 0.5, 2) })}
        />
      </div>
    </div>
    <div className="admin-animation-slot-actions">
      <input
        ref={inputRef}
        type="file"
        accept="image/gif,video/mp4"
        onChange={(e) => handleUpload(e.target.files?.[0])}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="button button--dark"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? '...' : mediaKey ? 'Replace' : 'Upload'}
      </button>
      {mediaKey && (
        <button type="button" className="admin-button-ghost is-danger" onClick={handleRemove}>
          Default
        </button>
      )}
    </div>
  </div>;
}

function AnimationSlotsEditor({ media, onChange }) {
  const slots = media?.heroAnimationSlots || [];
  const slotById = useMemo(() => new Map(slots.map((s) => [s.slotId, s])), [slots]);

  const updateSlot = (slotId, updatedSlot) => {
    const existing = slotById.get(slotId);
    const defaultSlot = getDefaultSlot(slotId);
    const mergedSlot = { ...defaultSlot, ...updatedSlot, slotId };

    const otherSlots = slots.filter((s) => s.slotId !== slotId);
    onChange({ ...media, heroAnimationSlots: [...otherSlots, mergedSlot] });
  };

  return <div className="admin-animation-slots-editor">
    <p className="section-kicker">Hero Animation Slots</p>
    <div className="admin-animation-slots-grid">
      {SLOT_IDS.map((slotId) => (
        <AnimationSlotCard
          key={slotId}
          slotId={slotId}
          slot={slotById.get(slotId)}
          onChange={(updated) => updateSlot(slotId, updated)}
        />
      ))}
    </div>
  </div>;
}

function HeroEditorWithTabs({ section, onChangeContent, onChangeDesign, onChangeMedia, savedMedia }) {
  const [activeTab, setActiveTab] = useState('content');
  const currentMedia = section.media || {};
  const savedMediaSection = savedMedia || {};
  const hasUnsavedUpload = currentMedia.characterShowcaseImageKey !== savedMediaSection.characterShowcaseImageKey;

  return <div className="admin-hero-editor-shell">
    <div className="admin-hero-editor-main">
      <div className="admin-hero-editor">
        <div className="admin-tabs">
          <button
            type="button"
            className={activeTab === 'content' ? 'admin-tab is-active' : 'admin-tab'}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button
            type="button"
            className={activeTab === 'design' ? 'admin-tab is-active' : 'admin-tab'}
            onClick={() => setActiveTab('design')}
          >
            Design
          </button>
          <button
            type="button"
            className={activeTab === 'media' ? 'admin-tab is-active' : 'admin-tab'}
            onClick={() => setActiveTab('media')}
          >
            Media
          </button>
        </div>
        <div className="admin-tab-content">
          {activeTab === 'content' && <HeroContentEditor content={section.content || {}} onChange={onChangeContent} />}
          {activeTab === 'design' && <HeroDesignEditor design={section.design || {}} onChange={onChangeDesign} />}
          {activeTab === 'media' && <HeroMediaEditor media={currentMedia} onChange={onChangeMedia} hasUnsavedUpload={hasUnsavedUpload} />}
        </div>
      </div>
    </div>
    <aside className="admin-hero-preview">
      <header className="admin-hero-preview-header">
        <p className="section-kicker">Live Preview</p>
        <span className="admin-hero-preview-badge">Unsaved Draft</span>
      </header>
      <div className="admin-hero-preview-frame">
        <HeroSection
          content={section.content || {}}
          design={section.design || {}}
          media={currentMedia}
          previewMode={true}
        />
      </div>
    </aside>
  </div>;
}

function FeaturedEditor({ content, animations = [], onChange, design = {}, onChangeDesign }) {
  const set = (field, value) => onChange({ ...content, [field]: value });
  const manual = content.mode === 'manual';
  const orderedIds = Array.isArray(content.animationIds) ? content.animationIds : [];
  const animationById = useMemo(() => new Map(animations.map((animation) => [animation.id, animation])), [animations]);
  const selectedAnimations = orderedIds.map((id) => animationById.get(id)).filter(Boolean);
  const move = (id, direction) => {
    const index = orderedIds.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= orderedIds.length) return;
    const next = [...orderedIds];
    [next[index], next[target]] = [next[target], next[index]];
    set('animationIds', next);
  };
  const remove = (id) => set('animationIds', orderedIds.filter((value) => value !== id));
  const add = (id) => {
    if (id && !orderedIds.includes(id)) set('animationIds', [...orderedIds, id]);
  };

  return <div className="admin-editor-form">
    <div className="admin-field-row"><Field label="Grid Columns"><select value={String(design.gridColumns || 4)} onChange={(event) => onChangeDesign({ ...design, gridColumns: Number(event.target.value) })}><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></Field><Field label="Card Gap"><select value={design.cardGap || 'normal'} onChange={(event) => onChangeDesign({ ...design, cardGap: event.target.value })}><option value="compact">Compact</option><option value="normal">Normal</option><option value="spacious">Spacious</option></select></Field><Field label="Card Aspect Ratio"><select value={design.cardAspectRatio || 'auto'} onChange={(event) => onChangeDesign({ ...design, cardAspectRatio: event.target.value })}><option value="auto">Original</option><option value="1/1">1:1</option><option value="4/3">4:3</option><option value="16/9">16:9</option></select></Field></div>
    <div className="admin-field-row">
      <Field label="Mode"><select value={manual ? 'manual' : 'automatic'} onChange={(event) => set('mode', event.target.value)}><option value="automatic">Automatic</option><option value="manual">Manual</option></select></Field>
      <Field label="Maximum Items"><select value={String(content.limit || HOME_FEATURED_LIMIT_DEFAULT)} onChange={(event) => set('limit', Number(event.target.value))}>{HOME_FEATURED_LIMIT_OPTIONS.map((limit) => <option key={limit} value={String(limit)}>{limit}</option>)}</select></Field>
    </div>
    <div className="admin-field-row">
      <Field label="Section Kicker"><input value={content.sectionKicker || ''} onChange={(event) => set('sectionKicker', event.target.value)} /></Field>
      <Field label="Section Title"><input value={content.sectionTitle || ''} onChange={(event) => set('sectionTitle', event.target.value)} /></Field>
    </div>
    <Field label="Title Highlight"><input value={content.sectionTitleHighlight || ''} onChange={(event) => set('sectionTitleHighlight', event.target.value)} /></Field>
    <Field label="Subtitle"><textarea rows={3} value={content.sectionSubtitle || ''} onChange={(event) => set('sectionSubtitle', event.target.value)} /></Field>
    <div className="admin-field-row">
      <Field label="Empty State Title"><input value={content.emptyTitle || ''} onChange={(event) => set('emptyTitle', event.target.value)} /></Field>
      <Field label="Empty State Description"><input value={content.emptyDescription || ''} onChange={(event) => set('emptyDescription', event.target.value)} /></Field>
    </div>
    {manual && <div className="admin-form-list">
      <header className="admin-form-list-heading"><p className="section-kicker">Selected Animations</p></header>
      {selectedAnimations.length === 0 && <p className="admin-empty-hint">No animations selected. Add a published animation below.</p>}
      {selectedAnimations.map((animation, index) => <div className="admin-manual-row" key={animation.id}>
        <span className="admin-manual-order">{index + 1}</span>
        <div className="admin-manual-info"><strong>{animation.title}</strong><span>{animation.category} · {animation.status}</span></div>
        <div className="admin-manual-row-actions">
          <button type="button" onClick={() => move(animation.id, -1)} disabled={index === 0}><ArrowUp size={12} />Move Up</button>
          <button type="button" onClick={() => move(animation.id, 1)} disabled={index === selectedAnimations.length - 1}><ArrowDown size={12} />Move Down</button>
          <button type="button" className="is-danger" onClick={() => remove(animation.id)}>Remove</button>
        </div>
      </div>)}
      <Field label="Add Animation">
        <select value="" onChange={(event) => { add(event.target.value); event.target.value = ''; }}>
          <option value="">Select a published animation</option>
          {animations.filter((animation) => animation.status === 'published' && !orderedIds.includes(animation.id)).map((animation) => <option key={animation.id} value={animation.id}>{animation.title} · {animation.category}</option>)}
        </select>
      </Field>
    </div>}
  </div>;
}

function SimpleSectionEditor({ content, onChange }) {
  const set = (field, value) => onChange({ ...content, [field]: value });
  return <div className="admin-editor-form">
    <div className="admin-field-row">
      <Field label="Section Kicker"><input value={content.sectionKicker || ''} onChange={(event) => set('sectionKicker', event.target.value)} /></Field>
      <Field label="Section Title"><input value={content.sectionTitle || ''} onChange={(event) => set('sectionTitle', event.target.value)} /></Field>
    </div>
    <Field label="Title Highlight"><input value={content.sectionTitleHighlight || ''} onChange={(event) => set('sectionTitleHighlight', event.target.value)} /></Field>
    <Field label="Subtitle"><textarea rows={4} value={content.sectionSubtitle || ''} onChange={(event) => set('sectionSubtitle', event.target.value)} /></Field>
  </div>;
}

function StringListEditor({ label, values, onChange, addLabel = 'Add item' }) {
  const items = Array.isArray(values) ? values : [];
  const update = (index, value) => onChange(items.map((item, itemIndex) => itemIndex === index ? value : item));
  return <div className="admin-form-list"><header className="admin-form-list-heading"><p className="section-kicker">{label}</p><button type="button" className="admin-button-ghost" onClick={() => onChange([...items, ''])}>+ {addLabel}</button></header>{items.map((item, index) => <div className="admin-field-row" key={index}><Field label={`${label} ${index + 1}`}><input value={item || ''} onChange={(event) => update(index, event.target.value)} /></Field><button type="button" className="admin-button-ghost is-danger" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}</div>;
}

function SectionImageEditor({ media, onChange, accept = 'image/png,image/jpeg,image/webp,image/gif', mediaField = 'imageKey' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const imageKey = media[mediaField] || '';
  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try { const result = await uploadSiteMedia(file); addPendingUpload(result.mediaKey); onChange({ ...media, [mediaField]: result.mediaKey }); } catch (err) { setError(err.message || 'Upload failed.'); } finally { setUploading(false); }
  };
  return <div className="admin-editor-form"><Field label="Image Alt Text"><input value={media.imageAlt || ''} onChange={(event) => onChange({ ...media, imageAlt: event.target.value })} /></Field>{imageKey && <img src={`/api/media?key=${encodeURIComponent(imageKey)}`} alt={media.imageAlt || 'Section'} className="admin-media-preview-image" />}{error && <p className="admin-field-error">{error}</p>}<input ref={inputRef} type="file" accept={accept} onChange={(event) => upload(event.target.files?.[0])} style={{ display: 'none' }} /><div className="admin-media-actions"><button type="button" className="button button--dark" onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading...' : imageKey ? 'Replace Image' : 'Upload Image'}</button>{imageKey && <button type="button" className="admin-button-ghost is-danger" onClick={() => onChange({ ...media, [mediaField]: '' })}>Use Default</button>}</div></div>;
}

function SupportHeroEditor({ content, onChange }) {
  const set = (field, value) => onChange({ ...content, [field]: value });
  return <div className="admin-editor-form"><Field label="Section Kicker"><input value={content.sectionKicker || ''} onChange={(event) => set('sectionKicker', event.target.value)} /></Field><div className="admin-field-row"><Field label="Title"><input value={content.title || ''} onChange={(event) => set('title', event.target.value)} /></Field><Field label="Title Highlight"><input value={content.titleHighlight || ''} onChange={(event) => set('titleHighlight', event.target.value)} /></Field></div><Field label="Description"><textarea rows={4} value={content.description || ''} onChange={(event) => set('description', event.target.value)} /></Field></div>;
}

function SupportVideoContentEditor({ content, onChange }) {
  const set = (field, value) => onChange({ ...content, [field]: value });
  return <div className="admin-editor-form">
    <Field label="Section Kicker"><input value={content.sectionKicker || ''} onChange={(event) => set('sectionKicker', event.target.value)} /></Field>
    <div className="admin-field-row"><Field label="Title"><input value={content.title || ''} onChange={(event) => set('title', event.target.value)} /></Field><Field label="Title Highlight"><input value={content.titleHighlight || ''} onChange={(event) => set('titleHighlight', event.target.value)} /></Field></div>
    <Field label="Description"><textarea rows={4} value={content.description || ''} onChange={(event) => set('description', event.target.value)} /></Field>
    <div className="admin-field-row"><Field label="Button Text"><input value={content.buttonText || ''} onChange={(event) => set('buttonText', event.target.value)} /></Field><Field label="Button Link"><input value={content.buttonLink || ''} onChange={(event) => set('buttonLink', event.target.value)} /></Field></div>
  </div>;
}

function SupportVideoDesignEditor({ design, onChange }) {
  const set = (field, value) => onChange({ ...design, [field]: value });
  return <div className="admin-editor-form">
    <div className="admin-field-row"><Field label="Layout Style"><select value={design.layoutStyle || 'split'} onChange={(event) => set('layoutStyle', event.target.value)}><option value="split">Split</option><option value="stack">Stack</option></select></Field><Field label="Media Width"><select value={design.mediaWidth || 'normal'} onChange={(event) => set('mediaWidth', event.target.value)}><option value="narrow">Narrow</option><option value="normal">Normal</option><option value="wide">Wide</option></select></Field></div>
    <div className="admin-field-row"><Field label="Spacing"><select value={design.spacing || 'normal'} onChange={(event) => set('spacing', event.target.value)}><option value="compact">Compact</option><option value="normal">Normal</option><option value="spacious">Spacious</option></select></Field><Field label="Background Color"><input value={design.backgroundColor || ''} onChange={(event) => set('backgroundColor', event.target.value)} placeholder="#FFFFFF" /></Field></div>
  </div>;
}

function FeaturedVideoMediaEditor({ media, onChange, savedMedia, pageKey }) {
  const videoInputRef = useRef(null);
  const posterInputRef = useRef(null);
  const [uploading, setUploading] = useState('');
  const [error, setError] = useState('');
  const upload = async (file, kind) => {
    if (!file) return;
    setUploading(kind);
    setError('');
    try {
      const result = await uploadSiteMedia(file, `${pageKey}/featured-video/${kind}`);
      addPendingUpload(result.mediaKey);
      onChange({ ...media, [kind === 'video' ? 'videoKey' : 'posterImageKey']: result.mediaKey });
    } catch (uploadError) {
      setError(uploadError.message || 'Upload failed.');
    } finally {
      setUploading('');
    }
  };
  const hasUnsavedUpload = media.videoKey !== (savedMedia?.videoKey || '') || media.posterImageKey !== (savedMedia?.posterImageKey || '');
  return <div className="admin-editor-form">
    <Field label="External Video URL" note="Supports YouTube watch links, youtu.be links, or direct MP4 URLs."><input value={media.videoUrl || ''} onChange={(event) => onChange({ ...media, videoUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=..." /></Field>
    {error && <p className="admin-field-error">{error}</p>}
    {hasUnsavedUpload && <p className="admin-field-warning">Uploaded media will be lost if you leave without saving.</p>}
    <div className="admin-media-preview-area"><p className="section-kicker">Uploaded Video</p><p className="admin-field-hint">{media.videoKey ? `Current Video: ${media.videoKey}` : 'Current Video: Default'}</p>{media.videoKey && <video className="admin-media-preview-image" controls src={`/api/media?key=${encodeURIComponent(media.videoKey)}`} poster={media.posterImageKey ? `/api/media?key=${encodeURIComponent(media.posterImageKey)}` : undefined} />}<input ref={videoInputRef} type="file" accept="video/mp4" onChange={(event) => upload(event.target.files?.[0], 'video')} style={{ display: 'none' }} /><div className="admin-media-actions"><button type="button" className="button button--dark" onClick={() => videoInputRef.current?.click()} disabled={Boolean(uploading)}>{uploading === 'video' ? 'Uploading...' : media.videoKey ? 'Replace MP4' : 'Upload MP4'}</button>{media.videoKey && <button type="button" className="admin-button-ghost is-danger" onClick={() => onChange({ ...media, videoKey: '' })}>Use Default / Remove</button>}</div></div>
    <div className="admin-media-preview-area"><p className="section-kicker">Poster Image</p><p className="admin-field-hint">{media.posterImageKey ? `Current Poster: ${media.posterImageKey}` : 'Current Poster: Default'}</p>{media.posterImageKey && <img className="admin-media-preview-image" src={`/api/media?key=${encodeURIComponent(media.posterImageKey)}`} alt="Support video poster" />}<input ref={posterInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => upload(event.target.files?.[0], 'poster')} style={{ display: 'none' }} /><div className="admin-media-actions"><button type="button" className="button button--dark" onClick={() => posterInputRef.current?.click()} disabled={Boolean(uploading)}>{uploading === 'poster' ? 'Uploading...' : media.posterImageKey ? 'Replace Poster' : 'Upload Poster'}</button>{media.posterImageKey && <button type="button" className="admin-button-ghost is-danger" onClick={() => onChange({ ...media, posterImageKey: '' })}>Use Default / Remove</button>}</div></div>
  </div>;
}

function FeaturedVideoEditor({ section, pageKey, onChange, onChangeDesign, onChangeMedia, savedSection }) {
  const [activeTab, setActiveTab] = useState('content');
  const content = section.content || {};
  const design = section.design || {};
  const media = section.media || {};
  return <div className="admin-hero-editor">
    <div className="admin-tabs"><button type="button" className={activeTab === 'content' ? 'admin-tab is-active' : 'admin-tab'} onClick={() => setActiveTab('content')}>Content</button><button type="button" className={activeTab === 'design' ? 'admin-tab is-active' : 'admin-tab'} onClick={() => setActiveTab('design')}>Design</button><button type="button" className={activeTab === 'media' ? 'admin-tab is-active' : 'admin-tab'} onClick={() => setActiveTab('media')}>Media</button></div>
    <div className="admin-tab-content">{activeTab === 'content' && <SupportVideoContentEditor content={content} onChange={onChange} />}{activeTab === 'design' && <SupportVideoDesignEditor design={design} onChange={onChangeDesign} />}{activeTab === 'media' && <FeaturedVideoMediaEditor media={media} onChange={onChangeMedia} savedMedia={savedSection?.media} pageKey={pageKey} />}</div>
  </div>;
}

function SupportFaqEditor({ content, onChange }) {
  const faqs = Array.isArray(content.faqs) ? content.faqs : [];
  const update = (index, patch) => onChange({ ...content, faqs: faqs.map((faq, faqIndex) => faqIndex === index ? { ...faq, ...patch } : faq) });
  const move = (index, direction) => { const target = index + direction; if (target < 0 || target >= faqs.length) return; const next = [...faqs]; [next[index], next[target]] = [next[target], next[index]]; onChange({ ...content, faqs: next.map((faq, faqIndex) => ({ ...faq, sortOrder: faqIndex })) }); };
  return <div className="admin-editor-form"><Field label="Section Label"><input value={content.sectionLabel || ''} onChange={(event) => onChange({ ...content, sectionLabel: event.target.value })} /></Field><div className="admin-form-list"><header className="admin-form-list-heading"><p className="section-kicker">FAQs ({faqs.length}/20)</p><button type="button" className="admin-button-ghost" disabled={faqs.length >= 20} onClick={() => onChange({ ...content, faqs: [...faqs, { id: `faq-${Date.now()}`, question: '', answer: '', enabled: true, sortOrder: faqs.length }] })}>+ Add FAQ</button></header>{faqs.map((faq, index) => <section className="admin-step-row" key={faq.id || index}><div className="admin-field-row"><Field label="Question"><input value={faq.question || ''} onChange={(event) => update(index, { question: event.target.value })} /></Field><label className="admin-checkbox"><input type="checkbox" checked={faq.enabled !== false} onChange={(event) => update(index, { enabled: event.target.checked })} />Enabled</label></div><Field label="Answer"><textarea rows={3} value={faq.answer || ''} onChange={(event) => update(index, { answer: event.target.value })} /></Field><div className="admin-media-actions"><button type="button" className="admin-button-ghost" onClick={() => move(index, -1)} disabled={index === 0}>Move Up</button><button type="button" className="admin-button-ghost" onClick={() => move(index, 1)} disabled={index === faqs.length - 1}>Move Down</button><button type="button" className="admin-button-ghost is-danger" onClick={() => onChange({ ...content, faqs: faqs.filter((_, faqIndex) => faqIndex !== index).map((item, faqIndex) => ({ ...item, sortOrder: faqIndex })) })}>Remove</button></div></section>)}</div></div>;
}

function SupportContactEditor({ content, onChange }) {
  const set = (field, value) => onChange({ ...content, [field]: value });
  return <div className="admin-editor-form"><div className="admin-field-row"><Field label="Section Kicker"><input value={content.sectionKicker || ''} onChange={(event) => set('sectionKicker', event.target.value)} /></Field><Field label="Email"><input value={content.email || ''} onChange={(event) => set('email', event.target.value)} /></Field></div><Field label="Title"><input value={content.title || ''} onChange={(event) => set('title', event.target.value)} /></Field><Field label="Description"><textarea rows={3} value={content.description || ''} onChange={(event) => set('description', event.target.value)} /></Field><div className="admin-field-row"><Field label="Button Text"><input value={content.buttonText || ''} onChange={(event) => set('buttonText', event.target.value)} /></Field><Field label="Button Link"><input value={content.buttonLink || ''} onChange={(event) => set('buttonLink', event.target.value)} /></Field></div></div>;
}

function SupportEditor({ content, onChange }) {
  const set = (field, value) => onChange({ ...content, [field]: value });
  const faqs = Array.isArray(content.faqs) ? content.faqs : [];
  return <div className="admin-editor-form"><div className="admin-field-row"><Field label="Kicker"><input value={content.sectionKicker || ''} onChange={(event) => set('sectionKicker', event.target.value)} /></Field><Field label="FAQ Label"><input value={content.faqLabel || ''} onChange={(event) => set('faqLabel', event.target.value)} /></Field></div><div className="admin-field-row"><Field label="Title"><input value={content.title || ''} onChange={(event) => set('title', event.target.value)} /></Field><Field label="Title Highlight"><input value={content.titleHighlight || ''} onChange={(event) => set('titleHighlight', event.target.value)} /></Field></div><Field label="Description"><textarea rows={3} value={content.description || ''} onChange={(event) => set('description', event.target.value)} /></Field><div className="admin-field-row"><Field label="Card Title"><input value={content.cardTitle || ''} onChange={(event) => set('cardTitle', event.target.value)} /></Field><Field label="Card Link"><input value={content.cardButtonLink || ''} onChange={(event) => set('cardButtonLink', event.target.value)} /></Field></div><Field label="Card Description"><textarea rows={2} value={content.cardDescription || ''} onChange={(event) => set('cardDescription', event.target.value)} /></Field><div className="admin-form-list"><header className="admin-form-list-heading"><p className="section-kicker">FAQs</p><button type="button" className="admin-button-ghost" onClick={() => set('faqs', [...faqs, { question: '', answer: '' }])}>+ Add FAQ</button></header>{faqs.map((faq, index) => <section className="admin-step-row" key={index}><div className="admin-field-row"><Field label="Question"><input value={faq.question || ''} onChange={(event) => set('faqs', faqs.map((value, itemIndex) => itemIndex === index ? { ...value, question: event.target.value } : value))} /></Field><button type="button" className="admin-button-ghost is-danger" onClick={() => set('faqs', faqs.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div><Field label="Answer"><textarea rows={3} value={faq.answer || ''} onChange={(event) => set('faqs', faqs.map((value, itemIndex) => itemIndex === index ? { ...value, answer: event.target.value } : value))} /></Field></section>)}</div><div className="admin-field-row"><Field label="Contact Label"><input value={content.contactLabel || ''} onChange={(event) => set('contactLabel', event.target.value)} /></Field><Field label="Contact Email"><input value={content.contactEmail || ''} onChange={(event) => set('contactEmail', event.target.value)} /></Field></div><Field label="Contact Title"><input value={content.contactTitle || ''} onChange={(event) => set('contactTitle', event.target.value)} /></Field></div>;
}

function HowItWorksEditor({ content, design = {}, onChange, onChangeDesign }) {
  const set = (field, value) => onChange({ ...content, [field]: value });
  const steps = Array.isArray(content.steps) ? content.steps : [];
  const updateStep = (index, patch) => onChange({ ...content, steps: steps.map((step, stepIndex) => stepIndex === index ? { ...step, ...patch } : step) });
  return <div className="admin-editor-form">
    <div className="admin-field-row"><Field label="Grid Columns"><select value={String(design.gridColumns || 4)} onChange={(event) => onChangeDesign({ ...design, gridColumns: Number(event.target.value) })}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></Field><Field label="Step Style"><select value={design.stepStyle || 'card'} onChange={(event) => onChangeDesign({ ...design, stepStyle: event.target.value })}><option value="card">Card</option><option value="minimal">Minimal</option></select></Field><label className="admin-checkbox"><input type="checkbox" checked={design.showNumbers !== false} onChange={(event) => onChangeDesign({ ...design, showNumbers: event.target.checked })} />Show Numbers</label></div>
    <div className="admin-field-row">
      <Field label="Section Kicker"><input value={content.sectionKicker || ''} onChange={(event) => set('sectionKicker', event.target.value)} /></Field>
      <Field label="Section Title"><input value={content.sectionTitle || ''} onChange={(event) => set('sectionTitle', event.target.value)} /></Field>
    </div>
    <Field label="Title Highlight"><input value={content.sectionTitleHighlight || ''} onChange={(event) => set('sectionTitleHighlight', event.target.value)} /></Field>
    <Field label="Subtitle"><textarea rows={4} value={content.sectionSubtitle || ''} onChange={(event) => set('sectionSubtitle', event.target.value)} /></Field>
    <div className="admin-step-list">
      <p className="section-kicker">Steps</p>
      {steps.map((step, index) => <section className="admin-step-row" key={index}>
        <header className="admin-step-row-head"><span className="admin-step-number">{String(index + 1).padStart(2, '0')}</span><p className="section-kicker">Step {index + 1}</p></header>
        <div className="admin-field-row">
          <Field label="Title"><input value={step.title || ''} onChange={(event) => updateStep(index, { title: event.target.value })} /></Field>
          <Field label="Description"><input value={step.description || ''} onChange={(event) => updateStep(index, { description: event.target.value })} /></Field>
        </div>
      </section>)}
    </div>
  </div>;
}

function sectionSummary(section) {
  const content = section.content || {};
  if (!section.enabled) return 'Disabled';
  switch (section.sectionKey) {
    case 'collectionGrid': return `${(content.collections || []).filter((item) => item.enabled !== false).length} collections`;
    case 'hero': return [content.title, content.titleHighlight].filter(Boolean).join(' ');
    case 'featuredAnimations': return `${content.mode === 'manual' ? 'Manual' : 'Automatic'} · ${content.limit || HOME_FEATURED_LIMIT_DEFAULT} items`;
    case 'search': return content.placeholder ? `“${content.placeholder}”` : 'Search control';
    case 'categoryFilter': return `${(content.visibleCategories || []).length} visible categories`;
    case 'sort': return DOWNLOADS_SORT_OPTIONS.find((option) => option.value === content.defaultSort)?.label || 'Newest first';
    case 'cardDisplay': return `${content.showCategory !== false ? 'Category' : 'No category'} · ${content.showPublishedDate !== false ? 'Date' : 'No date'}`;
    case 'infoBanner': return content.text || 'No banner text';
    default: return [content.sectionTitle || content.title, content.sectionTitleHighlight || content.titleHighlight].filter(Boolean).join(' ') || 'Content settings';
  }
}

function SectionHeader({ label, sectionKey, enabled, expanded, summary, onToggle, onExpand, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) {
  const noReorder = sectionKey === 'hero';
  const toggleExpand = () => onExpand(!expanded);
  const onKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpand();
    }
  };
  return <header className="admin-section-header" role="button" tabIndex={0} aria-expanded={expanded} onClick={toggleExpand} onKeyDown={onKeyDown}>
    <div className="admin-section-header-main">
      <p className="section-kicker">{label}</p>
      {!expanded && <span className="admin-section-summary">{summary}</span>}
    </div>
    <div className="admin-section-header-actions" onClick={(event) => event.stopPropagation()}>
      {!noReorder && <div className="admin-move-group" aria-label={`${label} order`}>
        <button type="button" className="admin-move-button" title="Move Up" onClick={onMoveUp} disabled={!canMoveUp}><ArrowUp size={12} />Move Up</button>
        <span className="admin-move-divider" />
        <button type="button" className="admin-move-button" title="Move Down" onClick={onMoveDown} disabled={!canMoveDown}><ArrowDown size={12} />Move Down</button>
      </div>}
      <EnabledToggle enabled={enabled} onChange={onToggle} />
      <button type="button" className="admin-section-chevron" aria-label={expanded ? `Collapse ${label}` : `Edit ${label}`} title={expanded ? 'Collapse' : 'Edit'} onClick={toggleExpand}><ChevronDown size={18} style={{ transform: expanded ? 'rotate(180deg)' : undefined }} /><span className="sr-only">{expanded ? 'Collapse' : 'Edit'}</span></button>
    </div>
  </header>;
}

function SupportDesignEditor({ sectionKey, design, onChange }) {
  const set = (field, value) => onChange({ ...design, [field]: value });
  return <div className="admin-editor-form"><div className="admin-field-row"><Field label="Spacing"><select value={design.spacing || 'normal'} onChange={(event) => set('spacing', event.target.value)}><option value="compact">Compact</option><option value="normal">Normal</option><option value="spacious">Spacious</option></select></Field><Field label="Background Color"><input value={design.backgroundColor || ''} onChange={(event) => set('backgroundColor', event.target.value)} placeholder="#FFFFFF" /></Field></div>{sectionKey === 'hero' && <Field label="Content Alignment"><select value={design.contentAlignment || 'left'} onChange={(event) => set('contentAlignment', event.target.value)}><option value="left">Left</option><option value="center">Center</option></select></Field>}{sectionKey === 'featuredVideo' && <div className="admin-field-row"><Field label="Layout"><select value={design.layoutStyle || 'split'} onChange={(event) => set('layoutStyle', event.target.value)}><option value="split">Split</option><option value="stack">Stack</option></select></Field><Field label="Media Width"><select value={design.mediaWidth || 'normal'} onChange={(event) => set('mediaWidth', event.target.value)}><option value="narrow">Narrow</option><option value="normal">Normal</option><option value="wide">Wide</option></select></Field></div>}{sectionKey === 'faq' && <Field label="FAQ Layout"><select value={design.layoutStyle || 'grid'} onChange={(event) => set('layoutStyle', event.target.value)}><option value="grid">Grid</option><option value="list">List</option></select></Field>}{sectionKey === 'contactCta' && <div className="admin-field-row"><Field label="Text Alignment"><select value={design.textAlignment || 'left'} onChange={(event) => set('textAlignment', event.target.value)}><option value="left">Left</option><option value="center">Center</option></select></Field><Field label="Button Style"><select value={design.buttonStyle || 'dark'} onChange={(event) => set('buttonStyle', event.target.value)}><option value="dark">Dark</option><option value="light">Light</option><option value="outline">Outline</option></select></Field></div>}</div>;
}

function SectionDesignEditor({ design, onChange }) {
  const set = (field, value) => onChange({ ...design, [field]: value });
  const backgroundColor = design.backgroundColor || '';
  const validColor = /^#[0-9A-Fa-f]{6}$/.test(backgroundColor);
  return <div className="admin-editor-form"><div className="admin-field-row"><Field label="Layout Style"><select value={design.layoutStyle || 'split'} onChange={(event) => set('layoutStyle', event.target.value)}><option value="split">Split</option><option value="center">Center</option><option value="grid">Grid</option></select></Field><Field label="Content Alignment"><select value={design.contentAlignment || 'left'} onChange={(event) => set('contentAlignment', event.target.value)}><option value="left">Left</option><option value="center">Center</option></select></Field></div><Field label="Spacing"><select value={design.spacing || 'normal'} onChange={(event) => set('spacing', event.target.value)}><option value="compact">Compact</option><option value="normal">Normal</option><option value="spacious">Spacious</option></select></Field><Field label="Background Color" note="Use a hex color or leave empty."><div className="admin-color-field"><input value={backgroundColor} placeholder="#FFFFFF" onChange={(event) => set('backgroundColor', event.target.value)} /><input type="color" value={validColor ? backgroundColor : '#FFFFFF'} onChange={(event) => set('backgroundColor', event.target.value)} /></div></Field></div>;
}

function SectionLayoutEditor({ section, onChange }) {
  const layout = section.layout || {};
  const breakpoints = layout.visibilityBreakpoints || {};
  const set = (field, value) => onChange({ ...layout, [field]: value });
  const setBreakpoint = (field, value) => onChange({ ...layout, visibilityBreakpoints: { ...breakpoints, [field]: value } });
  return <div className="admin-editor-form"><div className="admin-checkbox-grid"><label className={`admin-checkbox${breakpoints.desktop !== false ? ' is-checked' : ''}`}><input type="checkbox" checked={breakpoints.desktop !== false} onChange={(event) => setBreakpoint('desktop', event.target.checked)} />Desktop</label><label className={`admin-checkbox${breakpoints.tablet !== false ? ' is-checked' : ''}`}><input type="checkbox" checked={breakpoints.tablet !== false} onChange={(event) => setBreakpoint('tablet', event.target.checked)} />Tablet</label><label className={`admin-checkbox${breakpoints.mobile !== false ? ' is-checked' : ''}`}><input type="checkbox" checked={breakpoints.mobile !== false} onChange={(event) => setBreakpoint('mobile', event.target.checked)} />Mobile</label></div><Field label="Sort Order"><input type="number" value={layout.sortOrder ?? section.sortOrder ?? 0} onChange={(event) => set('sortOrder', Number(event.target.value) || 0)} /></Field></div>;
}

function SectionMediaEditor({ section, onChange }) {
  const media = section.media || {};
  if (section.sectionKey === 'newContent') return <p className="admin-empty-hint">This section does not use media.</p>;
  if (section.sectionKey === 'support') return <div className="admin-editor-form"><Field label="Video Media Key"><input value={media.videoKey || ''} onChange={(event) => onChange({ ...media, videoKey: event.target.value })} /></Field><Field label="Poster Image Key"><input value={media.posterImageKey || ''} onChange={(event) => onChange({ ...media, posterImageKey: event.target.value })} /></Field><p className="admin-field-hint">Support media uploads are available in the Featured Video section.</p></div>;
  if (section.sectionKey === 'characters') return <SectionImageEditor media={media} onChange={onChange} mediaField="sectionImageKey" />;
  return <SectionImageEditor media={media} onChange={onChange} />;
}

function CmsSectionEditor({ section, props }) {
  const [activeTab, setActiveTab] = useState('content');
  const { onChange, onChangeDesign, onChangeMedia, onChangeLayout, pageKey } = props;
  return <div className="admin-hero-editor"><div className="admin-tabs"><button type="button" className={activeTab === 'content' ? 'admin-tab is-active' : 'admin-tab'} onClick={() => setActiveTab('content')}>Content</button><button type="button" className={activeTab === 'design' ? 'admin-tab is-active' : 'admin-tab'} onClick={() => setActiveTab('design')}>Design</button><button type="button" className={activeTab === 'media' ? 'admin-tab is-active' : 'admin-tab'} onClick={() => setActiveTab('media')}>Media</button><button type="button" className={activeTab === 'layout' ? 'admin-tab is-active' : 'admin-tab'} onClick={() => setActiveTab('layout')}>Layout</button></div><div className="admin-tab-content">{activeTab === 'content' && renderCmsContentEditor(section, props)}{activeTab === 'design' && (props.pageKey === 'characters' && section.sectionKey === 'collectionGrid' ? <CharactersGridDesignEditor design={section.design || {}} onChange={onChangeDesign} /> : props.pageKey === 'support' ? <SupportDesignEditor sectionKey={section.sectionKey} design={section.design || {}} onChange={onChangeDesign} /> : <SectionDesignEditor design={section.design || {}} onChange={onChangeDesign} />)}{activeTab === 'media' && <SectionMediaEditor section={section} onChange={onChangeMedia} />}{activeTab === 'layout' && <SectionLayoutEditor section={section} onChange={onChangeLayout} />}</div></div>;
}

function renderCmsContentEditor(section, props) {
  const content = section.content || {};
  const { onChange, animations, pageKey } = props;
  if (pageKey === 'characters' && section.sectionKey === 'header') return <CharactersHeaderEditor content={content} onChange={onChange} />;
  if (pageKey === 'characters' && section.sectionKey === 'collectionGrid') return <CharactersGridEditor content={content} design={section.design || {}} onChange={onChange} onChangeDesign={props.onChangeDesign} />;
  if (section.sectionKey === 'featuredAnimations') return <FeaturedEditor content={content} design={section.design} onChangeDesign={props.onChangeDesign} animations={animations} onChange={onChange} />;
  if (section.sectionKey === 'howItWorks') return <HowItWorksEditor content={content} design={section.design} onChangeDesign={onChangeDesign} onChange={onChange} />;
  if (section.sectionKey === 'expression') return <><SimpleSectionEditor content={{ sectionKicker: content.sectionKicker, sectionTitle: content.title, sectionTitleHighlight: content.titleHighlight, sectionSubtitle: content.description }} onChange={(next) => onChange({ ...content, sectionKicker: next.sectionKicker, title: next.sectionTitle, titleHighlight: next.sectionTitleHighlight, description: next.sectionSubtitle })} /><StringListEditor label="Tags" values={content.tags} onChange={(tags) => onChange({ ...content, tags })} /><Field label="Note"><input value={content.note || ''} onChange={(event) => onChange({ ...content, note: event.target.value })} /></Field></>;
  if (section.sectionKey === 'lifestyle') return <><SimpleSectionEditor content={{ sectionKicker: content.sectionKicker, sectionTitle: content.title, sectionTitleHighlight: content.titleHighlight, sectionSubtitle: content.description }} onChange={(next) => onChange({ ...content, sectionKicker: next.sectionKicker, title: next.sectionTitle, titleHighlight: next.sectionTitleHighlight, description: next.sectionSubtitle })} /><StringListEditor label="Scenes" values={content.scenes} onChange={(scenes) => onChange({ ...content, scenes })} /></>;
  if (section.sectionKey === 'newContent') return <><SimpleSectionEditor content={{ sectionKicker: content.sectionKicker, sectionTitle: content.title, sectionTitleHighlight: content.titleHighlight, sectionSubtitle: content.description }} onChange={(next) => onChange({ ...content, sectionKicker: next.sectionKicker, title: next.sectionTitle, titleHighlight: next.sectionTitleHighlight, description: next.sectionSubtitle })} /><StringListEditor label="Content Items" values={content.items} onChange={(items) => onChange({ ...content, items })} /></>;
  if (props.pageKey === 'support' && section.sectionKey === 'hero') return <SupportHeroEditor content={content} onChange={onChange} />;
  if (['home', 'support'].includes(props.pageKey) && section.sectionKey === 'featuredVideo') return <FeaturedVideoEditor section={section} pageKey={props.pageKey} onChange={onChange} onChangeDesign={props.onChangeDesign} onChangeMedia={props.onChangeMedia} savedSection={props.savedSection} />;
  if (props.pageKey === 'support' && section.sectionKey === 'faq') return <SupportFaqEditor content={content} onChange={onChange} />;
  if (props.pageKey === 'support' && section.sectionKey === 'contactCta') return <SupportContactEditor content={content} onChange={onChange} />;
  if (section.sectionKey === 'support') return <SupportEditor content={content} onChange={onChange} />;
  return <SimpleSectionEditor content={content} onChange={onChange} />;
}

function CharactersHeaderEditor({ content, onChange }) {
  const set = (field, value) => onChange({ ...content, [field]: value });
  return <div className="admin-editor-form"><Field label="Section Kicker"><input value={content.sectionKicker || ''} onChange={(event) => set('sectionKicker', event.target.value)} /></Field><div className="admin-field-row"><Field label="Title"><input value={content.title || ''} onChange={(event) => set('title', event.target.value)} /></Field><Field label="Title Highlight"><input value={content.titleHighlight || ''} onChange={(event) => set('titleHighlight', event.target.value)} /></Field></div><Field label="Description"><textarea rows={4} value={content.description || ''} onChange={(event) => set('description', event.target.value)} /></Field></div>;
}

function CharacterCollectionCard({ collection, index, onChange, onMove }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadSiteMedia(file, collection.slotId);
      addPendingUpload(result.mediaKey);
      onChange({ ...collection, imageKey: result.mediaKey });
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };
  return <article className="admin-character-card">
    <header className="admin-character-card-header"><strong>{collection.shortTitle || collection.slotId}</strong><label className="admin-checkbox"><input type="checkbox" checked={collection.enabled !== false} onChange={(event) => onChange({ ...collection, enabled: event.target.checked })} />Enabled</label></header>
    {collection.imageKey ? <img className="admin-character-image-preview" src={`/api/media?key=${encodeURIComponent(collection.imageKey)}`} alt={collection.title || collection.slotId} /> : <div className="admin-character-image-placeholder">Default image</div>}
    <div className="admin-field-row"><Field label="Title"><input value={collection.title || ''} onChange={(event) => onChange({ ...collection, title: event.target.value })} /></Field><Field label="Short Title"><input value={collection.shortTitle || ''} onChange={(event) => onChange({ ...collection, shortTitle: event.target.value })} /></Field></div>
    <Field label="Description"><textarea rows={3} value={collection.description || ''} onChange={(event) => onChange({ ...collection, description: event.target.value })} /></Field>
    <div className="admin-field-row"><Field label="Tone"><select value={collection.tone || 'yellow'} onChange={(event) => onChange({ ...collection, tone: event.target.value })}><option value="yellow">Yellow</option><option value="coral">Coral</option><option value="blue">Blue</option><option value="pink">Pink</option><option value="dark">Dark</option></select></Field><Field label="Sort Order"><input type="number" value={collection.sortOrder ?? index} onChange={(event) => onChange({ ...collection, sortOrder: Number(event.target.value) || 0 })} /></Field></div>
    {error && <p className="admin-field-error">{error}</p>}
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => { upload(event.target.files?.[0]); event.target.value = ''; }} style={{ display: 'none' }} />
    <div className="admin-media-actions"><button type="button" className="button button--dark" onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading...' : collection.imageKey ? 'Replace Image' : 'Upload Image'}</button>{collection.imageKey && <button type="button" className="admin-button-ghost is-danger" onClick={() => onChange({ ...collection, imageKey: '' })}>Use Default</button>}<button type="button" className="admin-button-ghost" onClick={() => onMove(-1)} disabled={index === 0}>Move Up</button><button type="button" className="admin-button-ghost" onClick={() => onMove(1)} disabled={index === 3}>Move Down</button></div>
  </article>;
}

function CharactersGridDesignEditor({ design, onChange }) {
  const set = (field, value) => onChange({ ...design, [field]: value });
  return <div className="admin-editor-form"><div className="admin-field-row"><Field label="Desktop Columns"><select value={String(design.desktopColumns || 2)} onChange={(event) => set('desktopColumns', Number(event.target.value))}><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></Field><Field label="Tablet Columns"><select value={String(design.tabletColumns || 2)} onChange={(event) => set('tabletColumns', Number(event.target.value))}><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></Field><Field label="Mobile Columns"><select value={String(design.mobileColumns || 1)} onChange={(event) => set('mobileColumns', Number(event.target.value))}><option value="1">1</option><option value="2">2</option></select></Field></div><div className="admin-field-row"><Field label="Card Gap"><select value={design.cardGap || 'normal'} onChange={(event) => set('cardGap', event.target.value)}><option value="compact">Compact</option><option value="normal">Normal</option><option value="spacious">Spacious</option></select></Field><Field label="Card Style"><select value={design.cardStyle || 'default'} onChange={(event) => set('cardStyle', event.target.value)}><option value="default">Default</option><option value="minimal">Minimal</option></select></Field><Field label="Image Scale"><select value={design.imageScale || 'normal'} onChange={(event) => set('imageScale', event.target.value)}><option value="small">Small</option><option value="normal">Normal</option><option value="large">Large</option></select></Field></div></div>;
}

function CharactersGridEditor({ content, design, onChange, onChangeDesign }) {
  const fallback = [{ slotId: 'everyday', title: 'Everyday Expressions', shortTitle: 'Everyday', description: 'For everyday moods and reactions.', tone: 'yellow', enabled: true, sortOrder: 0, imageKey: '' }, { slotId: 'mood', title: 'Mood Collection', shortTitle: 'Mood', description: 'Happy, sleepy, excited, silly and more.', tone: 'coral', enabled: true, sortOrder: 1, imageKey: '' }, { slotId: 'seasonal', title: 'Seasonal Packs', shortTitle: 'Seasonal', description: 'Fresh content for holidays and special moments.', tone: 'blue', enabled: true, sortOrder: 2, imageKey: '' }, { slotId: 'special', title: 'Special Editions', shortTitle: 'Special', description: 'Unique collections and limited releases.', tone: 'pink', enabled: true, sortOrder: 3, imageKey: '' }];
  const collections = fallback.map((item) => ({ ...item, ...(content.collections || []).find((value) => value.slotId === item.slotId) })).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const update = (index, next) => onChange({ ...content, collections: collections.map((item, itemIndex) => itemIndex === index ? next : item) });
  const move = (index, direction) => { const target = index + direction; if (target < 0 || target > 3) return; const next = [...collections]; [next[index], next[target]] = [next[target], next[index]]; onChange({ ...content, collections: next.map((item, itemIndex) => ({ ...item, sortOrder: itemIndex })) }); };
  return <div className="admin-editor-form"><div className="admin-field-row"><Field label="Desktop Columns"><select value={String(design.desktopColumns || 2)} onChange={(event) => onChangeDesign({ ...design, desktopColumns: Number(event.target.value) })}><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></Field><Field label="Tablet Columns"><select value={String(design.tabletColumns || 2)} onChange={(event) => onChangeDesign({ ...design, tabletColumns: Number(event.target.value) })}><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></Field><Field label="Mobile Columns"><select value={String(design.mobileColumns || 1)} onChange={(event) => onChangeDesign({ ...design, mobileColumns: Number(event.target.value) })}><option value="1">1</option><option value="2">2</option></select></Field></div><div className="admin-field-row"><Field label="Card Gap"><select value={design.cardGap || 'normal'} onChange={(event) => onChangeDesign({ ...design, cardGap: event.target.value })}><option value="compact">Compact</option><option value="normal">Normal</option><option value="spacious">Spacious</option></select></Field><Field label="Card Style"><select value={design.cardStyle || 'default'} onChange={(event) => onChangeDesign({ ...design, cardStyle: event.target.value })}><option value="default">Default</option><option value="minimal">Minimal</option></select></Field><Field label="Image Scale"><select value={design.imageScale || 'normal'} onChange={(event) => onChangeDesign({ ...design, imageScale: event.target.value })}><option value="small">Small</option><option value="normal">Normal</option><option value="large">Large</option></select></Field></div><div className="admin-character-grid">{collections.map((collection, index) => <CharacterCollectionCard key={collection.slotId} collection={collection} index={index} onChange={(next) => update(index, next)} onMove={(direction) => move(index, direction)} />)}</div></div>;
}

function renderSectionEditor(section, props) {
  const content = section.content || {};
  const { onChange, onChangeDesign, onChangeMedia, onChangeLayout, animations, savedSection } = props;
  if (section.sectionKey === 'hero') {
    return <HeroEditorWithTabs
      section={section}
      onChangeContent={onChange}
      onChangeDesign={onChangeDesign}
      onChangeMedia={onChangeMedia}
      savedMedia={savedSection?.media}
    />;
  }
  if (['home', 'support'].includes(props.pageKey) && section.sectionKey === 'featuredVideo') return <FeaturedVideoEditor section={section} pageKey={props.pageKey} onChange={onChange} onChangeDesign={onChangeDesign} onChangeMedia={onChangeMedia} savedSection={savedSection} />;
  if (['expression', 'lifestyle', 'newContent', 'support', 'header', 'collectionGrid'].includes(section.sectionKey)) return <CmsSectionEditor section={section} props={{ ...props, onChange, onChangeDesign, onChangeMedia, onChangeLayout }} />;
  if (section.sectionKey === 'downloadCta') return <div className="admin-editor-form"><SimpleSectionEditor content={content} onChange={onChange} /><div className="admin-field-row"><Field label="Button Text"><input value={content.buttonText || ''} onChange={(event) => onChange({ ...content, buttonText: event.target.value })} /></Field><Field label="Button Link" note="Use an internal path or a full http(s) URL."><input value={content.buttonLink || ''} onChange={(event) => onChange({ ...content, buttonLink: event.target.value })} /></Field></div></div>;
  if (section.sectionKey === 'featuredAnimations') return <FeaturedEditor content={content} design={section.design} onChangeDesign={onChangeDesign} animations={animations} onChange={onChange} />;
  if (section.sectionKey === 'howItWorks') return <HowItWorksEditor content={content} design={section.design} onChangeDesign={onChangeDesign} onChange={onChange} />;
  if (section.sectionKey === 'header') {
    const set = (field, value) => onChange({ ...content, [field]: value });
    return <div className="admin-editor-form"><Field label="Kicker"><input value={content.kicker || ''} onChange={(event) => set('kicker', event.target.value)} /></Field><div className="admin-field-row"><Field label="Title"><input value={content.title || ''} onChange={(event) => set('title', event.target.value)} /></Field><Field label="Title Highlight"><input value={content.titleHighlight || ''} onChange={(event) => set('titleHighlight', event.target.value)} /></Field></div><Field label="Subtitle"><textarea rows={4} value={content.subtitle || ''} onChange={(event) => set('subtitle', event.target.value)} /></Field></div>;
  }
  if (section.sectionKey === 'infoBanner') {
    return <div className="admin-editor-form"><Field label="Text"><textarea rows={3} value={content.text || ''} onChange={(event) => onChange({ ...content, text: event.target.value })} /></Field></div>;
  }
  if (section.sectionKey === 'search') {
    return <div className="admin-editor-form"><Field label="Placeholder"><input value={content.placeholder || ''} onChange={(event) => onChange({ ...content, placeholder: event.target.value })} /></Field></div>;
  }
  if (section.sectionKey === 'categoryFilter') {
    const visible = new Set(content.visibleCategories || []);
    const toggleCategory = (category) => {
      const next = new Set(visible);
      if (next.has(category)) next.delete(category); else next.add(category);
      onChange({ ...content, visibleCategories: DOWNLOADS_CATEGORY_OPTIONS.filter((value) => next.has(value)) });
    };
    return <div className="admin-editor-form"><Field label="Visible Categories"><div className="admin-checkbox-grid">{DOWNLOADS_CATEGORY_OPTIONS.map((category) => <label key={category} className={`admin-checkbox${visible.has(category) ? ' is-checked' : ''}`}><input type="checkbox" checked={visible.has(category)} onChange={() => toggleCategory(category)} />{category}</label>)}</div></Field></div>;
  }
  if (section.sectionKey === 'sort') {
    return <div className="admin-editor-form"><Field label="Default Sort"><select value={content.defaultSort || 'newest'} onChange={(event) => onChange({ ...content, defaultSort: event.target.value })}>{DOWNLOADS_SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field></div>;
  }
  if (section.sectionKey === 'cardDisplay') {
    const design = section.design || {};
    const setDesign = (field, value) => props.onChangeDesign({ ...design, [field]: value });
    return <div className="admin-editor-form"><div className="admin-checkbox-grid"><label className={`admin-checkbox${content.showCategory !== false ? ' is-checked' : ''}`}><input type="checkbox" checked={content.showCategory !== false} onChange={(event) => onChange({ ...content, showCategory: event.target.checked })} />Show Category</label><label className={`admin-checkbox${content.showPublishedDate !== false ? ' is-checked' : ''}`}><input type="checkbox" checked={content.showPublishedDate !== false} onChange={(event) => onChange({ ...content, showPublishedDate: event.target.checked })} />Show Published Date</label></div><Field label="Initial Display Limit"><select value={String(content.initialDisplayLimit || 8)} onChange={(event) => onChange({ ...content, initialDisplayLimit: Number(event.target.value) })}>{[8, 12, 24, 48].map((limit) => <option key={limit} value={String(limit)}>{limit}</option>)}</select></Field><div className="admin-field-row"><Field label="Desktop Columns"><select value={String(design.desktopColumns || design.gridColumnsDesktop || 4)} onChange={(event) => setDesign('desktopColumns', Number(event.target.value))}>{[1, 2, 3, 4].map((value) => <option key={value} value={String(value)}>{value}</option>)}</select></Field><Field label="Tablet Columns"><select value={String(design.tabletColumns || design.gridColumnsTablet || 2)} onChange={(event) => setDesign('tabletColumns', Number(event.target.value))}>{[1, 2, 3, 4].map((value) => <option key={value} value={String(value)}>{value}</option>)}</select></Field><Field label="Mobile Columns"><select value={String(design.mobileColumns || design.gridColumnsMobile || 1)} onChange={(event) => setDesign('mobileColumns', Number(event.target.value))}>{[1, 2].map((value) => <option key={value} value={String(value)}>{value}</option>)}</select></Field></div><Field label="Card Gap"><select value={design.cardGap || 'normal'} onChange={(event) => setDesign('cardGap', event.target.value)}><option value="compact">Compact</option><option value="normal">Normal</option><option value="spacious">Spacious</option></select></Field></div>;
  }
  return <SimpleSectionEditor content={content} onChange={onChange} />;
}

function PageEditor({ pageKey, animations, onViewSite, onDirtyChange }) {
  const [sections, setSections] = useState(() => defaultSectionsFor(pageKey));
  const [savedSections, setSavedSections] = useState(() => defaultSectionsFor(pageKey));
  const [pendingUploads, setPendingUploads] = useState([]); // { key, uploadedAt }
  const [expanded, setExpanded] = useState(() => pageKey === 'home' ? new Set(['hero']) : new Set());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const dirty = useMemo(() => snapshotSections(sections) !== snapshotSections(savedSections), [sections, savedSections]);

  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminSiteConfig(pageKey).then((data) => {
      if (cancelled) return;
      const merged = mergePageSections(pageKey, data?.page?.sections);
      setSections(merged);
      setSavedSections(merged);
      setStatus('');
    }).catch((error) => setStatus(error?.message || 'Could not load page config.')).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageKey]);
  useEffect(() => {
    const warnBeforeUnload = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [dirty]);

  const sorted = useMemo(() => [...sections].sort((a, b) => a.sortOrder - b.sortOrder || a.sectionKey.localeCompare(b.sectionKey)), [sections]);
  const updateSection = (sectionKey, patch) => setSections((current) => current.map((section) => section.sectionKey === sectionKey ? { ...section, ...patch } : section));
  const save = async () => {
    setBusy(true);
    setStatus('Saving changes...');
    try {
      const result = await patchAdminSiteConfig(pageKey, sections.map((section) => ({
        sectionKey: section.sectionKey,
        enabled: section.enabled,
        sortOrder: section.sortOrder,
        content: section.content,
        design: section.design || {},
        layout: section.layout || {},
        media: section.media || {},
        seo: section.seo || {},
      })));
      const merged = mergePageSections(pageKey, result?.page?.sections);
      setSections(merged);
      setSavedSections(merged);
      clearPendingUploads();
      setStatus('Changes saved.');
    } catch (error) {
      setStatus(error?.message || 'The page config could not be saved.');
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    setSections(savedSections.map((section) => ({
      ...section,
      content: section.content,
      design: section.design || {},
      layout: section.layout || {},
      media: section.media || {},
      seo: section.seo || {},
    })));
    setStatus('');
    await cleanupPendingUploads();
  };
  const pageName = pageKey === 'downloads' ? 'Downloads' : pageKey === 'characters' ? 'Characters' : pageKey === 'support' ? 'Support' : 'Home';

  if (loading) return <section className="admin-pages-loading"><p className="section-kicker">{pageKey}</p><h1>Loading page settings</h1><p>{status}</p></section>;

  return <section className="admin-pages">
    <header className="admin-pages-sticky">
      <div className="admin-pages-sticky-inner">
        <div className="admin-pages-sticky-text"><p className="section-kicker">{pageKey.toUpperCase()} PAGE</p><h1>Edit {pageName}</h1></div>
        <div className="admin-pages-actions">
          <button type="button" className="admin-button-ghost" onClick={onViewSite}><Eye size={14} />View Page</button>
          <button type="button" className="admin-button-ghost" onClick={reset} disabled={!dirty || busy}>Reset</button>
          <button type="button" className="button button--dark" onClick={save} disabled={!dirty || busy}>{busy ? 'Saving...' : dirty ? 'Save Changes' : 'Saved'}</button>
        </div>
      </div>
      <p className={`admin-pages-status${dirty ? ' admin-pages-status--dirty' : ''}`} aria-live="polite">{status || (dirty ? 'Unsaved changes' : 'Saved')}</p>
    </header>
    <div className="admin-pages-list">
      {sorted.map((section, index) => {
        const isExpanded = expanded.has(section.sectionKey);
        return <article className={`admin-section-card${section.enabled ? '' : ' is-disabled'}`} key={section.sectionKey}>
          <SectionHeader label={(pageKey === 'home' ? HOME_SECTION_LABELS : pageKey === 'characters' ? { header: 'Header', collectionGrid: 'Collection Grid' } : pageKey === 'support' ? { hero: 'Hero', featuredVideo: 'Featured Video', faq: 'FAQ', contactCta: 'Contact CTA' } : DOWNLOADS_SECTION_LABELS)[section.sectionKey] || section.sectionKey} sectionKey={section.sectionKey} enabled={section.enabled} expanded={isExpanded} summary={sectionSummary(section)} onExpand={(isOpen) => setExpanded((current) => { const next = new Set(current); if (isOpen) next.add(section.sectionKey); else next.delete(section.sectionKey); return next; })} onToggle={(enabled) => updateSection(section.sectionKey, { enabled })} onMoveUp={() => setSections((current) => moveSection(current, section.sectionKey, -1))} onMoveDown={() => setSections((current) => moveSection(current, section.sectionKey, 1))} canMoveUp={index > 0} canMoveDown={index < sorted.length - 1} />
          {isExpanded && <div className="admin-section-body">{renderSectionEditor(section, {
            pageKey,
            animations,
            onChange: (content) => updateSection(section.sectionKey, { content }),
            onChangeDesign: (design) => updateSection(section.sectionKey, { design }),
            onChangeMedia: (media) => updateSection(section.sectionKey, { media }),
            onChangeLayout: (layout) => updateSection(section.sectionKey, { layout, sortOrder: layout.sortOrder ?? section.sortOrder }),
            savedSection: savedSections.find((s) => s.sectionKey === section.sectionKey),
          })}</div>}
        </article>;
      })}
    </div>
    <footer className="admin-pages-bottom-bar">
      <p className={`admin-pages-status${dirty ? ' admin-pages-status--dirty' : ''}`}>{dirty ? 'Unsaved changes' : 'Saved'}</p>
      <div className="admin-pages-actions"><button type="button" className="button button--dark" onClick={save} disabled={!dirty || busy}>{busy ? 'Saving...' : dirty ? 'Save Changes' : 'Saved'}</button></div>
    </footer>
  </section>;
}

export default function AdminPagesManager({ identity, onViewSite, onLogout }) {
  const [pageKey, setPageKey] = useState('home');
  const [animations, setAnimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageDirty, setPageDirty] = useState(false);
  const [pendingLeave, setPendingLeave] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/animations', { credentials: 'same-origin', headers: { accept: 'application/json' } }).then((response) => response.ok ? response.json() : null).then((data) => { if (!cancelled) setAnimations(data?.animations || []); }).catch(() => { if (!cancelled) setAnimations([]); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const requestPageChange = (nextKey) => {
    if (nextKey === pageKey) return;
    if (pageDirty) setPendingLeave({ nextKey });
    else setPageKey(nextKey);
  };

  return <main className="admin-shell">
    <header className="admin-topbar">
      <div className="admin-topbar-actions"><span className="admin-topbar-title">MiYo Studio Admin</span><nav className="admin-topbar-tabs" aria-label="Admin sections"><button type="button" disabled>Animations</button><button type="button" className="is-active">Pages</button></nav></div>
      <div className="admin-topbar-actions"><span>{identity?.email}</span><button type="button" className="text-link" onClick={onViewSite}><Eye size={15} />View site</button><button type="button" className="text-link" onClick={onLogout}><ArrowLeft size={15} />Logout</button></div>
    </header>
    <div className="admin-pages-shell">
      <aside className="admin-pages-nav"><p className="section-kicker">Pages</p><ul>{PAGE_KEYS.map((key) => <li key={key}><button type="button" className={pageKey === key ? 'is-active' : ''} onClick={() => requestPageChange(key)}>{key === 'downloads' ? 'Downloads' : key === 'characters' ? 'Characters' : key === 'support' ? 'Support' : 'Home'}</button></li>)}</ul></aside>
      <div className="admin-pages-content">{!loading && <PageEditor key={pageKey} pageKey={pageKey} animations={animations} onViewSite={() => onViewSite(pageKey === 'downloads' ? '/downloads' : pageKey === 'characters' ? '/characters' : pageKey === 'support' ? '/support' : '/')} onDirtyChange={setPageDirty} />}{loading && <section className="admin-pages-loading"><p className="section-kicker">Pages CMS</p><h1>Loading pages</h1><p>Reading the latest page config.</p></section>}</div>
    </div>
    {pendingLeave && <AdminModal title="You have unsaved changes." cancelLabel="Stay" confirmLabel="Leave" onCancel={() => setPendingLeave(null)} onConfirm={() => { const nextKey = pendingLeave.nextKey; setPendingLeave(null); setPageKey(nextKey); }}><p>Leave without saving?</p></AdminModal>}
  </main>;
}