CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  country_of_residence TEXT NOT NULL,
  interested_type TEXT NOT NULL,
  message TEXT,
  terms_accepted INTEGER NOT NULL DEFAULT 1 CHECK (terms_accepted IN (0, 1)),
  consented_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  source_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  gclid TEXT,
  fbclid TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status_created_at ON inquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries (email);
