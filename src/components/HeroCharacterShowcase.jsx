import { useEffect, useMemo, useState } from 'react';
import { heroAnimationSlots } from '../data/heroAnimationSlots';

const SHOW_HERO_SLOT_DEBUG = false;
const SHOW_HERO_CALIBRATION = false;
const SLOT_FIELDS = ['left', 'top', 'width'];
const STEP_OPTIONS = [-0.5, -0.1, 0.1, 0.5];

function getSlotStyle(slot) {
  return {
    left: slot.left,
    top: slot.top,
    width: slot.width,
    aspectRatio: slot.aspectRatio,
  };
}

function formatPercent(value) {
  return `${Number.parseFloat(value).toFixed(1)}%`;
}

function formatSlotConfig(slot) {
  return `{\n  slotId: '${slot.id || slot.slotId}',\n  left: '${slot.left}',\n  top: '${slot.top}',\n  width: '${slot.width}'\n}`;
}

function DebugSlot({ slot }) {
  return <div className="hero-animation-slot-debug" style={getSlotStyle(slot)}>{slot.id || slot.slotId}</div>;
}

function AnimationSlot({ slot }) {
  if (!slot.enabled || !slot.src) return null;

  const style = getSlotStyle(slot);

  if (slot.type === 'image' || slot.type === 'gif') {
    return <div className="hero-animation-slot" style={style}>
      <img className="hero-animation-slot-image" style={{ '--hero-content-scale': slot.contentScale ?? 1 }} src={slot.src} alt="" />
    </div>;
  }

  if (slot.type === 'mp4' || slot.type === 'webm') {
    return <video className="hero-animation-slot" style={style} autoPlay loop muted playsInline poster={slot.poster || undefined}>
      <source src={slot.src} type={`video/${slot.type}`} />
    </video>;
  }

  return null;
}

function CalibrationPanel({ slots, selectedId, onSelect, onAdjust }) {
  const selectedSlot = slots.find((slot) => (slot.id || slot.slotId) === selectedId);
  const [copied, setCopied] = useState('');

  async function copy(text, label) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1500);
  }

  return <aside className="hero-calibration-panel" aria-label="Hero animation slot calibration">
    <div className="hero-calibration-heading">
      <strong>Slot Calibration</strong>
      <span>Debug only</span>
    </div>
    <div className="hero-calibration-tabs" role="tablist" aria-label="Choose a Hero slot">
      {slots.map((slot) => <button className={(slot.id || slot.slotId) === selectedId ? 'is-selected' : ''} key={slot.id || slot.slotId} onClick={() => onSelect(slot.id || slot.slotId)} type="button">{slot.id || slot.slotId}</button>)}
    </div>
    <div className="hero-calibration-values">
      <strong>{selectedSlot.id || selectedSlot.slotId}</strong>
      {SLOT_FIELDS.map((field) => <div key={field}><span>{field}</span><output>{selectedSlot[field]}</output></div>)}
    </div>
    <div className="hero-calibration-controls">
      {SLOT_FIELDS.map((field) => <div className="hero-calibration-control" key={field}>
        <span>{field}</span>
        <div>{STEP_OPTIONS.map((amount) => <button key={amount} onClick={() => onAdjust(field, amount)} type="button">{amount > 0 ? '+' : ''}{amount.toFixed(1)}</button>)}</div>
      </div>)}
    </div>
    <div className="hero-calibration-copy-actions">
      <button onClick={() => copy(formatSlotConfig(selectedSlot), 'Slot copied')} type="button">Copy Slot Config</button>
      <button onClick={() => copy(slots.map(formatSlotConfig).join(',\n'), 'All slots copied')} type="button">Copy All Slot Config</button>
      {copied && <span role="status">{copied}</span>}
    </div>
  </aside>;
}

export default function HeroCharacterShowcase({ media = {}, design = {}, previewMode = false }) {
  const [selectedId, setSelectedId] = useState(heroAnimationSlots[0].slotId);
  const [slotValues, setSlotValues] = useState(() => Object.fromEntries(heroAnimationSlots.map((slot) => [slot.slotId, Object.fromEntries(SLOT_FIELDS.map((field) => [field, Number.parseFloat(slot[field])]))])));

  const mergedSlots = useMemo(() => {
    const storedSlots = media.heroAnimationSlots || [];
    const slotMap = new Map(heroAnimationSlots.map((slot) => [slot.slotId, slot]));
    for (const stored of storedSlots) {
      if (slotMap.has(stored.slotId)) {
        const defaultSlot = slotMap.get(stored.slotId);
        slotMap.set(stored.slotId, {
          ...defaultSlot,
          ...stored,
          id: stored.slotId,
          src: stored.mediaKey ? `/api/media?key=${encodeURIComponent(stored.mediaKey)}` : defaultSlot.fallbackSrc
        });
      }
    }
    return Array.from(slotMap.values());
  }, [media.heroAnimationSlots]);

  const calibratedSlots = useMemo(() => mergedSlots.map((slot) => ({
    ...slot,
    ...Object.fromEntries(SLOT_FIELDS.map((field) => [field, formatPercent(slotValues[slot.slotId]?.[field] ?? Number.parseFloat(slot[field]))])),
  })), [mergedSlots, slotValues]);

  function adjustSlot(field, amount) {
    setSlotValues((values) => ({
      ...values,
      [selectedId]: { ...values[selectedId], [field]: values[selectedId][field] + amount },
    }));
  }

  useEffect(() => {
    if (previewMode) return;
    function handleKeyDown(event) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const action = {
        ArrowLeft: ['left', -0.1],
        ArrowRight: ['left', 0.1],
        ArrowUp: ['top', -0.1],
        ArrowDown: ['top', 0.1],
      }[event.key];
      if (!action) return;
      event.preventDefault();
      adjustSlot(event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight') ? 'width' : action[0], action[1]);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, slotValues, previewMode]);

  const hasEnabledAnimationSlots = calibratedSlots.some((slot) => slot.enabled && slot.src);
  const showcaseImage = media.characterShowcaseImageKey ? `/api/media?key=${encodeURIComponent(media.characterShowcaseImageKey)}` : '/assets/home/hero-lineup-latest.png';

  return <div className="hero-showcase" aria-label="Six MiYo digital characters">
    <img className="hero-showcase-image" src={showcaseImage} alt="Six MiYo characters arranged by color" loading="eager" />
    {hasEnabledAnimationSlots && <div className="hero-animation-layer" aria-hidden="true">
      {calibratedSlots.map((slot) => <AnimationSlot key={slot.id || slot.slotId} slot={slot} />)}
      {SHOW_HERO_SLOT_DEBUG && calibratedSlots.map((slot) => <DebugSlot key={`debug-${slot.id}`} slot={slot} />)}
    </div>}
    {SHOW_HERO_CALIBRATION && !previewMode && <>
      <div className="hero-animation-debug-notice">Hero Animation Slot Debug</div>
      <CalibrationPanel slots={calibratedSlots} selectedId={selectedId} onSelect={setSelectedId} onAdjust={adjustSlot} />
    </>}
  </div>;
}
