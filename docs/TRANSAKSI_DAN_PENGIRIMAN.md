# Panduan Fitur Transaksi & Kirim Paket Panenku

## Flow Transaksi Lengkap

### 1. Pembuatan Pesanan (Checkout)

**Frontend flow:**
1. Pembeli menambah produk ke keranjang (`src/lib/store.ts::addToCart`)
2. Pada checkout, sistem menampilkan ringkasan & ongkos kirim
3. Klik "Bayar Sekarang" → `createOrder()` API call
4. Backend membuat order atomic dengan validasi stok

**Backend endpoint:** `POST /api/orders`
```json
{
  "buyer_id": "uuid",
  "buyer_name": "Ibu Sari",
  "shipping_address": "Jl. Mawar No. 12",
  "items": [
    {"product_id": "uuid", "qty": 5}
  ]
}
```

### 2. Pencegahan Race Condition

Masalah: Dua pembeli beli stok yang sama bersamaan
Solusi di backend (`server/src/routes/orders.ts`):
```javascript
SELECT ... FOR UPDATE SKIP LOCKED
```
- Lock baris produk yang dibeli
- SKIP LOCKED: bila terjadi konflik, request selanjutnya tidak blocking
- Kembalikan error `insufficient_stock` bila stok tidak cukup

**Frontend handling:**
- Tampilkan toast "Stok tidak mencukupi, silakan kurangi qty"
- Refresh data produk via API

### 3. Pengiriman Paket

**Membuat shipment:**
`POST /api/shipments`
```json
{
  "order_id": "uuid",
  "farmer_id": "uuid",
  "courier_name": "JNE",
  "tracking_number": "JN123456789"
}
```

**Update status pengiriman:**
`PATCH /api/shipments/:id/status`
```json
{
  "status": "picked_up",
  "location": "Kebun Pak Budi",
  "proof_of_delivery": "data:image/..."
}
```

**Status pengiriman:**
- `pending_pickup`: Menunggu petani mengirim
- `picked_up`: Kurir sudah mengambil paket
- `in_transit`: Dalam perjalanan
- `delivered`: Sudah diterima pembeli
- `failed`: Gagal dikirim

### 4. Integrasi dengan Ekspedisi

Untuk produk dengan `shipping_method = "jasa_kirim"`:
```sql
-- Webhook dari ekspedisi (JNE/TIKI) bisa update status otomatis
INSERT INTO shipment_events (shipment_id, event_type, location, notes)
VALUES ($id, $event, $location, $notes);
```

Tracking number format: ambil dari API ekspedisi saat pickup.

### 5. Konfirmasi Penerimaan

Pada status `delivered`:
- Sistem otomatis update `orders.status = 'selesai'`
- `pending_balance` petani berkurang, `balance` petani bertambah
- Notifikasi ke petani: pesanan selesai

### 6. Tips Produksi

**Pool connection settings (server/src/db-pool.ts):**
```typescript
max: 50,        // Koneksi maksimal
min: 5,         // Minimal idle connection  
idleTimeoutMillis: 30000,
connectionTimeoutMillis: 5000,
```

**Index untuk query cepat:**
```sql
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('indonesian', name));
CREATE INDEX idx_orders_buyer_status ON orders(buyer_id, status);
CREATE INDEX idx_shipments_status ON shipments(status);
```