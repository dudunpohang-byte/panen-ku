-- Development seed data for Panenku.
-- Safe to run multiple times.

INSERT INTO users (
  email, phone, pin, password_hash, name, role, farm_name, farm_location,
  farm_city_id, full_address, farm_description, farm_established,
  certifications, status, balance, pending_balance, shipping_packaging_method
)
VALUES
  (
    'admin@panenku.test', '080000000000', '000000', 'dev-password-admin',
    'Admin Panenku', 'admin', NULL, NULL, NULL, NULL, NULL, NULL,
    '{}', NULL, 0, 0, NULL
  ),
  (
    'petani1@panenku.test', '081200000001', '111111', 'dev-password-farmer',
    'Pak Budi', 'farmer', 'Tani Budi', 'Garut, Jawa Barat', 'garut',
    'Jl. Raya Samarang No. 12, Garut', 'Kebun sayur dataran tinggi dengan panen harian.',
    '2018', ARRAY['Organik', 'GAP'], 'approved', 0, 0,
    'Produk dipanen pagi, disortir, lalu dikemas kardus berlubang dan dikirim hari yang sama.'
  ),
  (
    'buyer1@panenku.test', '081300000001', '222222', 'dev-password-buyer',
    'Ibu Sari', 'buyer', NULL, NULL, NULL, NULL, NULL, NULL,
    '{}', NULL, 0, 0, NULL
  )
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  pin = EXCLUDED.pin,
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  farm_name = EXCLUDED.farm_name,
  farm_location = EXCLUDED.farm_location,
  farm_city_id = EXCLUDED.farm_city_id,
  full_address = EXCLUDED.full_address,
  farm_description = EXCLUDED.farm_description,
  farm_established = EXCLUDED.farm_established,
  certifications = EXCLUDED.certifications,
  status = EXCLUDED.status,
  balance = EXCLUDED.balance,
  pending_balance = EXCLUDED.pending_balance,
  shipping_packaging_method = EXCLUDED.shipping_packaging_method,
  updated_at = now();

INSERT INTO products (
  farmer_id, name, category, description, price, unit, stock, image, rating, sold,
  harvest_date, best_before_days, pickup_available, cultivation_method,
  certifications, origin, packaging, weight_per_unit, storage_info
)
SELECT
  u.id,
  'Tomat Organik',
  'Sayur',
  'Tomat segar hasil kebun dataran tinggi, cocok untuk masakan harian.',
  12000,
  'kg',
  50,
  NULL,
  4.80,
  35,
  CURRENT_DATE,
  5,
  true,
  'Organik',
  ARRAY['Organik'],
  'Garut, Jawa Barat',
  'Kardus ventilasi',
  '1 kg per pack',
  'Simpan di tempat sejuk dan kering.'
FROM users u
WHERE u.email = 'petani1@panenku.test'
ON CONFLICT (farmer_id, name) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  unit = EXCLUDED.unit,
  stock = EXCLUDED.stock,
  image = EXCLUDED.image,
  rating = EXCLUDED.rating,
  sold = EXCLUDED.sold,
  harvest_date = EXCLUDED.harvest_date,
  best_before_days = EXCLUDED.best_before_days,
  pickup_available = EXCLUDED.pickup_available,
  cultivation_method = EXCLUDED.cultivation_method,
  certifications = EXCLUDED.certifications,
  origin = EXCLUDED.origin,
  packaging = EXCLUDED.packaging,
  weight_per_unit = EXCLUDED.weight_per_unit,
  storage_info = EXCLUDED.storage_info,
  updated_at = now();

INSERT INTO admin_settings (
  id, admin_fee_percent, own_delivery_base_fee, own_delivery_per_km,
  third_party_base_fee, third_party_per_km, free_shipping_min_subtotal
)
VALUES (true, 5, 7000, 0, 5000, 0, 100000)
ON CONFLICT (id) DO UPDATE SET
  admin_fee_percent = EXCLUDED.admin_fee_percent,
  own_delivery_base_fee = EXCLUDED.own_delivery_base_fee,
  own_delivery_per_km = EXCLUDED.own_delivery_per_km,
  third_party_base_fee = EXCLUDED.third_party_base_fee,
  third_party_per_km = EXCLUDED.third_party_per_km,
  free_shipping_min_subtotal = EXCLUDED.free_shipping_min_subtotal,
  updated_at = now();
