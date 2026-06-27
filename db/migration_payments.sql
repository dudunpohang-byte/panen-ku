-- Migration: Payment Logs for Xendit Integration
-- Run: psql -d panenku -f db/migration_payments.sql

BEGIN;

-- Tabel log pembayaran Xendit
CREATE TABLE IF NOT EXISTS payment_logs (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL,
  xendit_invoice_id VARCHAR(100) UNIQUE,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  paid_at TIMESTAMP,
  raw_response JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON payment_logs(status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_xendit_invoice ON payment_logs(xendit_invoice_id);

-- Tabel notifikasi (jika belum ada)
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  type VARCHAR(50) DEFAULT 'info',
  reference_id VARCHAR(100),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Tambah kolom payment_link ke orders jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_link'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_link VARCHAR(500);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
  END IF;
END $$;

COMMIT;