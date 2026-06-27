-- ============================================
-- MIGRATION V2: Payment Methods, Withdrawals, Returns
-- ============================================

-- 1. PAYMENT METHODS: E-Wallet & Bank untuk penarikan dana
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('ewallet', 'bank')),
  -- E-Wallet
  ewallet_provider text CHECK (ewallet_provider IN ('dana', 'gopay', 'ovo', 'shopeepay', 'linkaja')),
  ewallet_phone text,
  ewallet_name text,
  -- Bank
  bank_name text,
  bank_account_number text,
  bank_account_name text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT at_least_one_type CHECK (
    (type = 'ewallet' AND ewallet_provider IS NOT NULL AND ewallet_phone IS NOT NULL AND ewallet_name IS NOT NULL)
    OR 
    (type = 'bank' AND bank_name IS NOT NULL AND bank_account_number IS NOT NULL AND bank_account_name IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);

-- 2. WITHDRAWALS: Riwayat penarikan dana petani & admin
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('farmer', 'admin')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  fee numeric(12,2) NOT NULL DEFAULT 0,
  net_amount numeric(12,2) NOT NULL CHECK (net_amount > 0),
  payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL,
  -- Detail metode pembayaran (snapshot)
  payment_type text NOT NULL,
  payment_provider text,
  payment_account text,
  payment_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  admin_id text, -- siapa yang memproses (untuk admin)
  admin_notes text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- 3. ADMIN BALANCE: Saldo fee admin yang bisa ditarik
CREATE TABLE IF NOT EXISTS admin_fee_balance (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  total_fee_collected numeric(12,2) NOT NULL DEFAULT 0,
  total_withdrawn numeric(12,2) NOT NULL DEFAULT 0,
  current_balance numeric(12,2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO admin_fee_balance (id, total_fee_collected, total_withdrawn, current_balance)
VALUES (true, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- 4. RETURN REQUESTS: Pengembalian barang
CREATE TABLE IF NOT EXISTS return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES order_items(id) ON DELETE SET NULL,
  buyer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  description text,
  evidence_images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'cancelled')),
  refund_amount numeric(12,2),
  refund_method text, -- 'balance' atau ke metode asal
  admin_id text,
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_return_requests_order ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_buyer ON return_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status);

-- 5. Tambah kolom di tabel users untuk rekening penarikan (opsional, bisa via payment_methods)
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_holder text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ewallet_type text; -- 'dana','gopay','ovo','shopeepay','linkaja'
ALTER TABLE users ADD COLUMN IF NOT EXISTS ewallet_account text;