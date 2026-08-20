CREATE TABLE IF NOT EXISTS animations (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  published_at TEXT,
  character_color TEXT NOT NULL DEFAULT 'gray',
  content_scale REAL NOT NULL DEFAULT 1 CHECK (content_scale > 0),
  gif_url TEXT,
  gif_file_name TEXT,
  gif_file_size INTEGER,
  mp4_url TEXT,
  mp4_file_name TEXT,
  mp4_file_size INTEGER,
  gif_object_key TEXT,
  mp4_object_key TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS animations_status_idx ON animations(status);
CREATE INDEX IF NOT EXISTS animations_featured_idx ON animations(featured);
CREATE INDEX IF NOT EXISTS animations_category_idx ON animations(category);
CREATE INDEX IF NOT EXISTS animations_published_at_idx ON animations(published_at);
