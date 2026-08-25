import MiYoScreenPreview from '../MiYoScreenPreview';

export default function AdminPreviewSidebar({ item }) {
  const preview = item.gifPath ? { type: 'gif', src: item.gifPath } : item.mp4Path ? { type: 'mp4', src: item.mp4Path } : null;
  return <aside className="admin-preview-aside"><header><p className="section-kicker">Live preview</p><span>{item.category}</span></header>{preview ? <MiYoScreenPreview item={{ ...item, preview }} size="admin" /> : <div className="admin-empty-preview">Upload GIF or MP4 to preview.</div>}<dl className="admin-preview-details"><div><dt>Character</dt><dd>{item.characterColor}</dd></div><div><dt>Scale</dt><dd>{item.contentScale}</dd></div><div><dt>Featured</dt><dd>{item.featured ? 'Yes' : 'No'}</dd></div></dl></aside>;
}
