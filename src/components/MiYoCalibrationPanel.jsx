import { useEffect, useState } from 'react';
import { miyoCharacterColors, miyoCharacters } from '../data/miyoCharacters';

const STEP_BUTTONS = [-0.5, -0.1, 0.1, 0.5];

function initialSlots() {
  return Object.fromEntries(miyoCharacterColors.map((color) => [color, { ...miyoCharacters[color].screen }]));
}

function slotConfig(color, slot) {
  return `${color}: { image: '${miyoCharacters[color].image}', screen: { left: ${slot.left}, top: ${slot.top}, width: ${slot.width} } },`;
}

export default function MiYoCalibrationPanel({ onSlotsChange }) {
  const [selectedColor, setSelectedColor] = useState('gray');
  const [slots, setSlots] = useState(initialSlots);
  const selectedSlot = slots[selectedColor];

  const updateSlot = (field, delta) => setSlots((current) => ({
    ...current,
    [selectedColor]: { ...current[selectedColor], [field]: Number((current[selectedColor][field] + delta).toFixed(1)) },
  }));

  useEffect(() => {
    onSlotsChange(slots);
  }, [onSlotsChange, slots]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.matches('input, select, textarea, button')) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); updateSlot(event.shiftKey ? 'width' : 'left', -0.1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); updateSlot(event.shiftKey ? 'width' : 'left', 0.1); }
      if (event.key === 'ArrowUp') { event.preventDefault(); updateSlot('top', -0.1); }
      if (event.key === 'ArrowDown') { event.preventDefault(); updateSlot('top', 0.1); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const copy = (text) => navigator.clipboard.writeText(text);

  return <section className="miyo-calibration-panel" aria-label="MiYo screen calibration">
    <div><p className="section-kicker">Development only</p><h2>Screen Calibration</h2></div>
    <div className="miyo-calibration-colors" role="group" aria-label="MiYo color">{miyoCharacterColors.map((color) => <button className={color === selectedColor ? 'miyo-color-button miyo-color-button--active' : 'miyo-color-button'} key={color} type="button" onClick={() => setSelectedColor(color)}>{color}</button>)}</div>
    <div className="miyo-calibration-values">{['left', 'top', 'width'].map((field) => <div key={field}><strong>{field}</strong><span>{selectedSlot[field].toFixed(1)}%</span><div className="miyo-calibration-steps">{STEP_BUTTONS.map((step) => <button key={step} type="button" onClick={() => updateSlot(field, step)}>{step > 0 ? `+${step}` : step}</button>)}</div></div>)}</div>
    <div className="miyo-calibration-actions"><button type="button" onClick={() => copy(slotConfig(selectedColor, selectedSlot))}>Copy Slot Config</button><button type="button" onClick={() => copy(miyoCharacterColors.map((color) => slotConfig(color, slots[color])).join('\n'))}>Copy All Slot Config</button></div>
    <p className="miyo-calibration-help">Arrow keys adjust left/top by 0.1%. Shift + Left/Right adjusts width by 0.1%.</p>
  </section>;
}
