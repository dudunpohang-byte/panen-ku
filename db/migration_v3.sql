-- Migration v3: Full schema for Panenku + fitur baru
-- Drop existing tables in correct order
DROP TABLE IF EXISTS shipment_events CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS cart_notifications CASCADE;
DROP TABLE IF EXISTS product_discounts CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS payout_requests CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS product_stock CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enums
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'farmer', 'buyer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE farmer_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM ('menunggu_bayar', 'dibayar', 'disiapkan', 'dikirim', 'selesai', 'dibatalkan'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE shipping_method AS ENUM ('antar_sendiri', 'jasa_kirim'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE discount_type AS ENUM ('admin', 'farmer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ========== USERS ==========
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  phone text UNIQUE NOT NULL,
  pin text NOT NULL,
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
  status farmer_status DEFAULT 'pending',
  balance numeric(12,2) NOT NULL DEFAULT 0,
  pending_balance numeric(12,2) NOT NULL DEFAULT 0,
  certificate_image text,
  shipping_packaging_method text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_farmer_status ON users(status);
CREATE UNIQUE INDEX users_phone_unique ON users(phone);

-- ========== PRODUCTS ==========
CREATE TABLE products (
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

CREATE INDEX idx_products_farmer ON products(farmer_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- ========== PRODUCT_DISCOUNTS ==========
CREATE TABLE product_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  discount_type discount_type NOT NULL DEFAULT 'farmer',
  discount_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_product_discount UNIQUE (product_id, discount_type)
);

CREATE INDEX idx_product_discounts_product ON product_discounts(product_id);
CREATE INDEX idx_product_discounts_active ON product_discounts(active);

-- ========== ORDERS ==========
CREATE TABLE orders (
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

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ========== ORDER_ITEMS ==========
CREATE TABLE order_items (
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

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_farmer ON order_items(farmer_id);

-- ========== PAYOUT_REQUESTS ==========
CREATE TABLE payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX idx_payouts_farmer ON payout_requests(farmer_id);

-- ========== ADMIN_SETTINGS ==========
CREATE TABLE admin_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  admin_fee_percent numeric(5,2) NOT NULL DEFAULT 5,
  own_delivery_base_fee numeric(12,2) NOT NULL DEFAULT 7000,
  own_delivery_per_km numeric(12,2) NOT NULL DEFAULT 0,
  third_party_base_fee numeric(12,2) NOT NULL DEFAULT 5000,
  third_party_per_km numeric(12,2) NOT NULL DEFAULT 0,
  free_shipping_min_subtotal numeric(12,2) NOT NULL DEFAULT 100000,
  security_level text DEFAULT 'standard',
  require_2fa boolean DEFAULT false,
  session_timeout_minutes integer DEFAULT 120,
  max_login_attempts integer DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO admin_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

-- ========== ADMIN_LOGS ==========
CREATE TABLE admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id text NOT NULL,
  admin_name text NOT NULL,
  action text NOT NULL,
  status text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);

-- ========== CHAT_ROOMS ==========
CREATE TABLE chat_rooms (
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

CREATE INDEX idx_chat_rooms_buyer ON chat_rooms(buyer_id);
CREATE INDEX idx_chat_rooms_farmer ON chat_rooms(farmer_id);

-- ========== CHAT_MESSAGES ==========
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  text text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_room ON chat_messages(room_id, created_at);

-- ========== PRODUCT_STOCK ==========
CREATE TABLE product_stock (
  product_id uuid PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  available_stock integer NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
  reserved_stock integer NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ========== SHIPMENTS ==========
CREATE TABLE shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  buyer_id uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  courier_name text NOT NULL DEFAULT 'petani_sendiri',
  tracking_number text,
  shipping_service text,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending_pickup',
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  proof_of_delivery text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_farmer ON shipments(farmer_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX idx_shipments_status ON shipments(status);

-- ========== SHIPMENT_EVENTS ==========
CREATE TABLE shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  location text,
  notes text,
  timestamp timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipment_events_shipment ON shipment_events(shipment_id, timestamp);

-- ========== CART_NOTIFICATIONS ==========
CREATE TABLE cart_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_notified_at timestamptz NOT NULL DEFAULT now(),
  notification_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_cart_notif UNIQUE (user_id)
);

CREATE INDEX idx_cart_notifications_user ON cart_notifications(user_id);

-- ========== TRIGGERS ==========
-- Auto-create stock row when product is created
CREATE OR REPLACE FUNCTION sync_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_stock (product_id, available_stock, reserved_stock, version)
  VALUES (NEW.id, NEW.stock, 0, 1)
  ON CONFLICT (product_id) DO UPDATE
  SET available_stock = NEW.stock, updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_product_stock ON products;
CREATE TRIGGER trigger_sync_product_stock
  AFTER INSERT ON products FOR EACH ROW EXECUTE FUNCTION sync_product_stock();

-- Update stock on product stock change
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

-- ========== FULLTEXT SEARCH ==========
CREATE INDEX IF NOT EXISTS idx_products_search ON products
  USING gin (to_tsvector('indonesian', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(origin, '')));

CREATE INDEX IF NOT EXISTS idx_products_certifications ON products USING gin(certifications);
CREATE INDEX IF NOT EXISTS idx_users_certifications ON users USING gin(certifications);

-- ========== DEMO DATA (sync dengan localStorage) ==========
-- Skip demo data INSERT karena localStorage akan mengisinya
-- Data user dan produk akan di-sync via aplikasi frontend
