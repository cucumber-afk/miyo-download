import { defaultMiyoCharacterColor, miyoCharacters, SHOW_MIYO_CARD_SLOT_DEBUG } from '../data/miyoCharacters';

function isVideo(src) {
  return /\.(webm|mp4)(\?.*)?$/i.test(src ?? '');
}

export default function MiYoScreenPreview({ item = {}, size = 'card', screenOverride }) {
  const color = item.characterColor ?? defaultMiyoCharacterColor;
  const character = miyoCharacters[color] ?? miyoCharacters[defaultMiyoCharacterColor];
  const screen = screenOverride ?? character.screen;
  const style = {
    '--content-scale': item.contentScale ?? 1,
    '--screen-left': `${screen.left}%`,
    '--screen-top': `${screen.top}%`,
    '--screen-width': `${screen.width}%`,
  };

  const preview = item.preview;

  return <div className={`miyo-screen-preview miyo-screen-preview--${size}`} style={style}>
    <img className="miyo-shell-image" src={character.image} alt={`${color} MiYo figure`} />
    <span className={`miyo-screen-overlay${SHOW_MIYO_CARD_SLOT_DEBUG ? ' miyo-screen-overlay--debug' : ''}`} aria-hidden="true">{preview?.src && (preview.type === 'mp4' || preview.type === 'webm' || isVideo(preview.src) ? <video autoPlay loop muted playsInline preload="metadata" src={preview.src} /> : <img src={preview.src} alt="" />)}{SHOW_MIYO_CARD_SLOT_DEBUG && <span className="miyo-screen-debug-label">{color}</span>}</span>
  </div>;
}
