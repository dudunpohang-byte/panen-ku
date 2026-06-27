-- ============================================
-- MIGRATION V3: Admin Security & Super Admin
-- ============================================

-- 1. ADMIN SESSIONS: Token-based session dengan expiry
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id text NOT NULL,
  admin_name text NOT NULL,
  token text NOT NULL UNIQUE,
  ip_address text,
  user_agent text,
  expires_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);

-- 2. ADMIN 2FA: PIN untuk aksi sensitif (verifikasi petani, withdrawal, refund)
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_2fa_pin text; -- PIN 6 digit untuk super admin
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role text CHECK (admin_role IN ('super_admin', 'admin', 'finance', 'support'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_permissions jsonb NOT NULL DEFAULT '[]'::jsonb; -- array permission strings
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_ip text;

-- 3. SECURITY LOGS: Log semua aksi sensitif dengan IP
ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 4. RATE LIMIT: Track percobaan login per IP
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  identifier text, -- phone atau email
  attempt_type text NOT NULL DEFAULT 'login' CHECK (attempt_type IN ('login', 'admin_login', '2fa_verify')),
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON login_attempts(identifier, created_at DESC);

-- 5. ENCRYPTED PIN: Ganti pin plain-text dengan hash
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash text;

-- 6. DATA PRIVACY: Log akses data pribadi
CREATE TABLE IF NOT EXISTS data_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by text NOT NULL,
  access_type text NOT NULL, -- 'view_profile', 'view_balance', 'view_order', 'export_data'
  target_user_id text,
  target_data text, -- apa yang diakses
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_access_logs_user ON data_access_logs(accessed_by, created_at DESC);

-- 7. UPDATE ADMIN SETTINGS: Timestamp validasi
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS security_level text NOT NULL DEFAULT 'standard' CHECK (security_level IN ('standard', 'high', 'super'));
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS require_2fa boolean NOT NULL DEFAULT false;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS session_timeout_minutes integer NOT NULL DEFAULT 30;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS max_login_attempts integer NOT NULL DEFAULT 5;

-- 8. Set default security settings
UPDATE admin_settings SET 
  security_level = 'high',
  require_2fa = true,
  session_timeout_minutes = 30,
  max_login_attempts = 5
WHERE id = true;