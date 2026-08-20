export function buildPublicQuery(url) {
  const q = url.searchParams;
  const clauses = ["status = 'published'"];
  const bindings = [];
  if (q.get('featured') === '1') clauses.push('featured = 1');
  if (q.get('category') && q.get('category') !== 'All') { clauses.push('category = ?'); bindings.push(q.get('category')); }
  if (q.get('format') === 'gif') clauses.push('gif_url IS NOT NULL');
  if (q.get('format') === 'mp4') clauses.push('mp4_url IS NOT NULL');
  if (q.get('q')) { clauses.push('(title LIKE ? OR category LIKE ? OR description LIKE ? OR tags_json LIKE ?)'); const term = `%${q.get('q')}%`; bindings.push(term, term, term, term); }
  const order = q.get('sort') === 'name' ? 'title COLLATE NOCASE ASC' : 'published_at DESC, updated_at DESC';
  const limit = Math.min(Math.max(Number(q.get('limit') || 100), 1), 100);
  return { where: clauses.join(' AND '), bindings, order, limit };
}
