CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS cms_content (
  id SERIAL PRIMARY KEY,
  scope TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  created_by TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cms_media (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO cms_content (scope, payload)
VALUES
  ('site', '{"home":{"title":"Together for a living Tunisia","subtitle":"Protecting nature, empowering communities, and advancing a sustainable future for North Africa.","heroImage":"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"},"about":{"mission":"To stop the degradation of the natural environment and build a future in which people live in harmony with nature.","vision":"A healthy, resilient region where people and nature thrive together.","summary":"WWF North Africa works with communities, institutions, and partners to preserve biodiversity, restore ecosystems, and improve livelihoods."},"projects":[],"news":[],"team":[],"partners":[],"contact":{"email":"contact@wwfna.org","phone":"+216 00 000 000","address":"5 Rue Ibn El Monadi, El Menzah 1, 1004 Tunis","facebook":"https://www.facebook.com","instagram":"https://www.instagram.com","linkedin":"https://www.linkedin.com"},"downloads":[]}')
ON CONFLICT (scope) DO NOTHING;

INSERT INTO cms_content (scope, payload)
VALUES
  ('approved', '{"home":{"title":"Together for a living Tunisia","subtitle":"Protecting nature, empowering communities, and advancing a sustainable future for North Africa.","heroImage":"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"},"about":{"mission":"To stop the degradation of the natural environment and build a future in which people live in harmony with nature.","vision":"A healthy, resilient region where people and nature thrive together.","summary":"WWF North Africa works with communities, institutions, and partners to preserve biodiversity, restore ecosystems, and improve livelihoods."},"projects":[],"news":[],"team":[],"partners":[],"contact":{"email":"contact@wwfna.org","phone":"+216 00 000 000","address":"5 Rue Ibn El Monadi, El Menzah 1, 1004 Tunis","facebook":"https://www.facebook.com","instagram":"https://www.instagram.com","linkedin":"https://www.linkedin.com"},"downloads":[]}')
ON CONFLICT (scope) DO NOTHING;
