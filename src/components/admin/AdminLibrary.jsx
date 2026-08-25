import { Plus, Search } from 'lucide-react';
import { animationCategories } from '../../data/animationLibraryConstants';

function mediaLabel(item) {
  const formats = [];
  if (item.gifPath) formats.push('GIF');
  if (item.mp4Path) formats.push('MP4');
  return formats.join(' + ') || 'No media';
}

export default function AdminLibrary({ items, selectedId, search, statusFilter, categoryFilter, onSearchChange, onStatusChange, onCategoryChange, onSelect, onNew }) {
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const haystack = `${item.title} ${(item.tags || []).join(' ')}`.toLowerCase();
    return (!normalizedSearch || haystack.includes(normalizedSearch)) && (statusFilter === 'all' || item.status === statusFilter) && (categoryFilter === 'All' || item.category === categoryFilter);
  });

  return <aside className="admin-library" aria-label="Animation library">
    <header className="admin-library-header"><div><p className="section-kicker">Library</p><strong>{items.length} animations</strong></div><button className="admin-icon-button" type="button" onClick={onNew} aria-label="New animation"><Plus size={18} /></button></header>
    <label className="admin-search"><Search size={15} /><span className="sr-only">Search animations</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search title or tags" /></label>
    <div className="admin-filter-stack"><label>Status<select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}><option value="all">All statuses</option><option value="draft">Draft</option><option value="published">Published</option></select></label><label>Category<select value={categoryFilter} onChange={(event) => onCategoryChange(event.target.value)}>{animationCategories.map((category) => <option key={category} value={category}>{category === 'All' ? 'All categories' : category}</option>)}</select></label></div>
    <div className="admin-library-list">{filtered.length ? filtered.map((item) => <button key={item.id} type="button" className={`admin-library-row${item.id === selectedId ? ' is-selected' : ''}`} onClick={() => onSelect(item)}><span className="admin-library-row-main"><strong>{item.title}</strong><span>{item.category} · {mediaLabel(item)}</span></span><span className={`admin-status-badge admin-status-badge--${item.status}`}>{item.status}</span></button>) : <p className="admin-library-empty">No animations match these filters.</p>}</div>
  </aside>;
}
