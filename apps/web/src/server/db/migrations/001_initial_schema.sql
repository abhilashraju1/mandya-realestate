-- Migration 001: Initial PostgreSQL Schema for Mandya Real Estate Marketplace

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'SEEKER',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON sessions(user_id, expires_at);

CREATE TABLE IF NOT EXISTS otp_records (
  phone VARCHAR(20) PRIMARY KEY,
  code VARCHAR(16) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  attempts_count INT NOT NULL DEFAULT 0,
  resend_cooldown_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_code VARCHAR(32) NOT NULL UNIQUE,
  title_en VARCHAR(255) NOT NULL,
  title_kn VARCHAR(255) NOT NULL,
  description_en TEXT NOT NULL,
  description_kn TEXT NOT NULL,
  category VARCHAR(32) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL,
  price_inr NUMERIC(15, 2) NOT NULL,
  price_per_sqft NUMERIC(10, 2),
  area_display VARCHAR(64) NOT NULL,
  area_sqft NUMERIC(12, 2) NOT NULL,
  guntas NUMERIC(10, 2),
  acres NUMERIC(10, 2),
  taluk VARCHAR(64) NOT NULL,
  locality_en VARCHAR(128) NOT NULL,
  locality_kn VARCHAR(128) NOT NULL,
  coordinates_lat NUMERIC(9, 6),
  coordinates_lng NUMERIC(9, 6),
  is_location_approximate BOOLEAN NOT NULL DEFAULT TRUE,
  exact_survey_number VARCHAR(64),
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  contact_preferences JSONB NOT NULL DEFAULT '{"allowPhoneCall": true, "allowWhatsApp": true}'::jsonb,
  seller_name VARCHAR(120) NOT NULL,
  seller_phone VARCHAR(20) NOT NULL,
  seller_role VARCHAR(20) NOT NULL DEFAULT 'OWNER',
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING_APPROVAL',
  rejection_reason TEXT,
  view_count INT NOT NULL DEFAULT 0,
  enquiries_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_properties_status_taluk_price ON properties(status, taluk, price_inr);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_code ON properties(property_code);

CREATE TABLE IF NOT EXISTS enquiries (
  id VARCHAR(64) PRIMARY KEY,
  property_id VARCHAR(64) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  property_code VARCHAR(32) NOT NULL,
  seller_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seeker_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  seeker_name VARCHAR(120) NOT NULL,
  seeker_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  idempotency_key VARCHAR(128) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_enquiries_seller ON enquiries(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_seeker ON enquiries(seeker_user_id);

CREATE TABLE IF NOT EXISTS site_visits (
  id VARCHAR(64) PRIMARY KEY,
  property_id VARCHAR(64) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  property_code VARCHAR(32) NOT NULL,
  seller_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seeker_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  seeker_name VARCHAR(120) NOT NULL,
  seeker_phone VARCHAR(20) NOT NULL,
  preferred_date VARCHAR(20) NOT NULL,
  preferred_time_slot VARCHAR(20) NOT NULL,
  idempotency_key VARCHAR(128) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_site_visits_seller ON site_visits(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_seeker ON site_visits(seeker_user_id);

CREATE TABLE IF NOT EXISTS favorites (
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(64) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

CREATE TABLE IF NOT EXISTS moderation_audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  property_id VARCHAR(64) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  actor_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_name VARCHAR(120) NOT NULL,
  action VARCHAR(32) NOT NULL,
  reason TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_property ON moderation_audit_logs(property_id);
