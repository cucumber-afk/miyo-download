CREATE TABLE IF NOT EXISTS site_global_config (
  id TEXT PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  content_json TEXT NOT NULL DEFAULT '{}',
  design_json TEXT NOT NULL DEFAULT '{}',
  media_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
