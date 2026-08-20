import MiYoScreenPreview from './MiYoScreenPreview';
import { miyoCharacterColors } from '../data/miyoCharacters';

export default function MiYoCalibrationGallery({ slots }) {
  return <section className="miyo-calibration-gallery" aria-labelledby="miyo-calibration-gallery-title">
    <div className="miyo-calibration-gallery-heading"><p className="section-kicker">Development only</p><h2 id="miyo-calibration-gallery-title">MiYo Shell Calibration Gallery</h2></div>
    <div className="miyo-calibration-gallery-grid">{miyoCharacterColors.map((color) => <div className="miyo-calibration-gallery-item" key={color}><MiYoScreenPreview item={{ characterColor: color }} screenOverride={slots[color]} /><p>{color}</p></div>)}</div>
  </section>;
}
