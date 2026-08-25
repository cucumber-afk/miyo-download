-- Add design, layout, media, and seo configuration columns to site_page_sections
-- All columns are optional with empty JSON defaults for backward compatibility

ALTER TABLE site_page_sections ADD COLUMN design_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE site_page_sections ADD COLUMN layout_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE site_page_sections ADD COLUMN media_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE site_page_sections ADD COLUMN seo_json TEXT NOT NULL DEFAULT '{}';
