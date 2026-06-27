-- PostgreSQL schema for Panenku marketplace.
-- Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'farmer', 'buyer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE farmer_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE order_status AS ENUM ('menunggu_bayar', 'dibayar', 'disiapkan', 'dikirim', 'selesai', 'dibatalkan');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'menunggu_bayar';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'disiapkan';

DO $$
BEGIN
  CREATE TYPE shipping_method AS ENUM ('antar_sendiri', 'jasa_kirim');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  phone text UNIQUE,
  pin text,
  password_hash text,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'buyer',
  avatar text,
  farm_name text,
  farm_location text,
  farm_city_id text,
  full_address text,
  farm_description text,
  farm_established text,
  certifications text[] NOT NULL DEFAULT '{}',
  status farmer_status,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  pending_balance numeric(12,2) NOT NULL DEFAULT 0,
  certificate_image text,
  shipping_packaging_method text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_location text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_city_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_address text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_description text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_established text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS certifications text[] NOT NULL DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status farmer_status;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_balance numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS certificate_image text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS shipping_packaging_method text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique_idx ON users (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_farmer_status ON users(status);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Sayur',
  description text,
  price numeric(12,2) NOT NULL,
  unit text NOT NULL DEFAULT 'pcs',
  stock integer NOT NULL DEFAULT 0,
  image text,
  images text[] NOT NULL DEFAULT '{}',
  rating numeric(3,2) NOT NULL DEFAULT 0,
  sold integer NOT NULL DEFAULT 0,
  harvest_date date,
  best_before_days integer,
  pickup_available boolean NOT NULL DEFAULT false,
  cultivation_method text,
  certifications text[] NOT NULL DEFAULT '{}',
  origin text,
  packaging text,
  weight_per_unit text,
  storage_info text,
  pre_order boolean NOT NULL DEFAULT false,
  harvest_planned_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Sayur';
ALTER TABLE products ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating numeric(3,2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sold integer NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS best_before_days integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pickup_available boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cultivation_method text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS certifications text[] NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS packaging text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_per_unit text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_info text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pre_order boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS harvest_planned_date date;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_products_farmer ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS products_farmer_name_unique_idx ON products(farmer_id, name);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  buyer_name text,
  buyer_phone text,
  address text,
  buyer_city_id text,
  distance_km numeric(8,2),
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  shipping numeric(12,2) NOT NULL DEFAULT 0,
  admin_fee numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'dibayar',
  shipping_method shipping_method NOT NULL DEFAULT 'jasa_kirim',
  shipping_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ALTER COLUMN buyer_id DROP NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_phone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_city_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS distance_km numeric(8,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_fee numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method shipping_method NOT NULL DEFAULT 'jasa_kirim';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  farmer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  product_name text,
  image text,
  price numeric(12,2) NOT NULL,
  qty integer NOT NULL,
  pre_order boolean NOT NULL DEFAULT false,
  harvest_planned_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE order_items ALTER COLUMN farmer_id DROP NOT NULL;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS pre_order boolean NOT NULL DEFAULT false;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS harvest_planned_date date;

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_farmer ON order_items(farmer_id);

CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_payouts_farmer ON payouts(farmer_id);

CREATE TABLE IF NOT EXISTS admin_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  admin_fee_percent numeric(5,2) NOT NULL DEFAULT 5,
  own_delivery_base_fee numeric(12,2) NOT NULL DEFAULT 7000,
  own_delivery_per_km numeric(12,2) NOT NULL DEFAULT 0,
  third_party_base_fee numeric(12,2) NOT NULL DEFAULT 5000,
  third_party_per_km numeric(12,2) NOT NULL DEFAULT 0,
  free_shipping_min_subtotal numeric(12,2) NOT NULL DEFAULT 100000,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO admin_settings (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id text NOT NULL,
  admin_name text NOT NULL,
  action text NOT NULL,
  status text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  farmer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text,
  unread_buyer integer NOT NULL DEFAULT 0,
  unread_farmer integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_buyer ON chat_rooms(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_farmer ON chat_rooms(farmer_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  text text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- PRODUCT_STOCK: Stok terpisah dengan row locking untuk konkurensi aman
-- Setiap perubahan stok harus lewat prosedur ini untuk mencegah race condition
CREATE TABLE IF NOT EXISTS product_stock (
  product_id uuid PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  available_stock integer NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
  reserved_stock integer NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
  version integer NOT NULL DEFAULT 1, -- optimistic locking
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_stock_available ON product_stock(available_stock DESC);

-- Trigger: auto-create stock row
CREATE OR REPLACE FUNCTION sync_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_stock (product_id, available_stock, reserved_stock, version)
  VALUES (NEW.id, NEW.stock, 0, 1)
  ON CONFLICT (product_id) DO UPDATE
  SET available_stock = NEW.stock, updated_at = now()
  WHERE product_stock.product_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_product_stock ON products;
CREATE TRIGGER trigger_sync_product_stock
  AFTER INSERT ON products FOR EACH ROW EXECUTE FUNCTION sync_product_stock();

-- TRIGGER for stock updates
CREATE OR REPLACE FUNCTION update_product_stock_on_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_stock (product_id, available_stock, reserved_stock, version)
  VALUES (NEW.id, NEW.stock, 0, 1)
  ON CONFLICT (product_id) DO UPDATE
  SET available_stock = NEW.stock, updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_stock ON products;
CREATE TRIGGER trigger_update_product_stock
  AFTER UPDATE OF stock ON products FOR EACH ROW EXECUTE FUNCTION update_product_stock_on_change();

-- FULLTEXT INDEX untuk pencarian produk
CREATE INDEX IF NOT EXISTS idx_products_search ON products
  USING gin (to_tsvector('indonesian', name || ' ' || description || ' ' || coalesce(origin, '')));

-- GIN index untuk array fields
CREATE INDEX IF NOT EXISTS idx_products_certifications ON products USING gin(certifications);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at);

-- SHIPMENTS: Tracking pengiriman paket
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  buyer_id uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  courier_name text NOT NULL DEFAULT 'petani_sendiri',
  tracking_number text,
  shipping_service text, -- 'jne', 'tiki', 'pos', 'grab', 'gojek', dll
  cost numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending_pickup', -- pending_pickup, picked_up, in_transit, delivered, failed
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  proof_of_delivery text, -- foto paket diterima
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_farmer ON shipments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- SHIPMENT_EVENTS: Timeline perjalanan paket
CREATE TABLE IF NOT EXISTS shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'picked_up', 'in_transit', 'delivered', 'failed', 'note_added'
  location text,
  notes text,
  timestamp timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment ON shipment_events(shipment_id, timestamp);
