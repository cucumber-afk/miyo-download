import { Download } from 'lucide-react';
import { getDownloadFileName, getDownloadUrl } from '../utils/downloadMedia';
import { formatUtcDate, getUtcTimestampTitle } from '../utils/formatTimestamp';
import MiYoScreenPreview from './MiYoScreenPreview';

function availableFormats(downloads = {}) {
  return ['gif', 'mp4'].filter((format) => downloads[format]?.src);
}

export default function MiYoAnimationCard({ item, screenOverride, showCategory = true, showPublishedDate = true }) {
  const formats = availableFormats(item.downloads);

  return <article className="miyo-animation-card">
    <div className="miyo-animation-card-figure"><MiYoScreenPreview item={item} size="card" screenOverride={screenOverride} /></div>
    <div className="miyo-animation-card-body"><div className="miyo-animation-card-meta"><h2>{item.title}</h2>{showCategory && <p className="card-mood">{item.category}</p>}{showPublishedDate && item.publishedAt && <p className="animation-published-at" title={getUtcTimestampTitle(item.publishedAt)}>Published {formatUtcDate(item.publishedAt)}</p>}</div>{formats.length > 0 && <div className="miyo-animation-card-actions"><p className="miyo-animation-download-label">Download Formats</p><div className="miyo-animation-downloads" aria-label="Download Formats">{item.downloads.gif?.src && <a className="miyo-download-link" href={getDownloadUrl(item.downloads.gif.src, getDownloadFileName(item.downloads.gif, item.title, 'gif'))} download={getDownloadFileName(item.downloads.gif, item.title, 'gif')} aria-label={`Download ${item.title} GIF, no audio`}>GIF · No Audio <Download size={13} /></a>}{item.downloads.mp4?.src && <a className="miyo-download-link" href={getDownloadUrl(item.downloads.mp4.src, getDownloadFileName(item.downloads.mp4, item.title, 'mp4'))} download={getDownloadFileName(item.downloads.mp4, item.title, 'mp4')} aria-label={`Download ${item.title} MP4`}>MP4 <Download size={13} /></a>}</div></div>}</div>
  </article>;
}
