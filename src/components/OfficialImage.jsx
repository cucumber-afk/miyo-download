import { useState } from 'react';
import { assets } from '../data/content';

export function OfficialImage({ src, alt, className = '', loading = 'lazy', ...props }) {
  const [failed, setFailed] = useState(false);
  return <img {...props} className={className} src={failed ? assets.heroLineup : src} alt={alt} loading={loading} onError={() => setFailed(true)} />;
}
