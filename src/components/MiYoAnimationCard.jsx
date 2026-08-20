import { Download } from 'lucide-react';
import { getDownloadFileName, getDownloadUrl } from '../utils/downloadMedia';
import { formatUtcDate, getUtcTimestampTitle } from '../utils/formatTimestamp';
import MiYoScreenPreview from './MiYoScreenPreview';

function availableFormats(downloads = {}) {
  return ['gif', 'mp4'].filter((format) => downloads[format]?.src);
}

export default function MiYoAnimationCard({ item, onPreview, screenOverride }) {
  const formats = availableFormats(item.downloads);

  return <article className="miyo-animation-card">
    <button className="miyo-animation-card-figure" type="button" onClick={() => onPreview(item)} aria-label={`Preview ${item.title}`}><MiYoScreenPreview item={item} screenOverride={screenOverride} /></button>
    <div className="miyo-animation-card-body"><div className="miyo-animation-card-meta"><h2>{item.title}</h2><p className="card-mood">{item.category}</p>{item.publishedAt && <p className="animation-published-at" title={getUtcTimestampTitle(item.publishedAt)}>Published {formatUtcDate(item.publishedAt)}</p>}</div><div className="miyo-animation-card-actions"><button className="preview-button" type="button" onClick={() => onPreview(item)}>Preview</button>{formats.length > 0 && <div className="miyo-animation-download-group"><p className="miyo-animation-download-label">Download Formats</p><div className="miyo-animation-downloads" aria-label="Download Formats">{item.downloads.gif?.src && <a className="miyo-download-link" href={getDownloadUrl(item.downloads.gif.src, getDownloadFileName(item.downloads.gif, item.title, 'gif'))} download={getDownloadFileName(item.downloads.gif, item.title, 'gif')} aria-label={`Download ${item.title} GIF, no audio`}>GIF · No Audio <Download size={13} /></a>}{item.downloads.mp4?.src && <a className="miyo-download-link" href={getDownloadUrl(item.downloads.mp4.src, getDownloadFileName(item.downloads.mp4, item.title, 'mp4'))} download={getDownloadFileName(item.downloads.mp4, item.title, 'mp4')} aria-label={`Download ${item.title} MP4`}>MP4 <Download size={13} /></a>}</div></div>}</div></div>
  </article>;
}
