# SCM (Supply Chain Management) Panenku

## Arsitektur Aplikasi

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    PETANI   │     │   PEMBELI   │     │    ADMIN    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ Register/Login    │ Register/Login    │ Login
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL Database                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │  users  │ │products │ │ orders  │ │shipments│ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
└────────┬────────────────────┬──────────────────────┘
         │                    │
         │ Tambah Produk      │ Cari & Beli Produk
         ▼                    ▼
   Kelola Stok         Buat Pesanan (Atomic Transaction)
         │                    │
         │                    ▼
         │              Kurangi Stok (Race Condition Protected)
         │                    │
         │                    ▼
         │              Kirim Paket (Tracking)
         │                    │
         ▼                    ▼
   Dana Masuk ──────────── Selesai (Konfirmasi)
         │
         ▼
   Tarik Dana
```

## Flow Transaksi

### 1. Registrasi & Verifikasi Petani
```
Petani mendaftar → Admin verifikasi → Status: approved/rejected
```
- Petani perlu mengisi data kebun, sertifikasi, dan metode pengiriman
- Admin memverifikasi dokumen via halaman /admin-panenku/verifikasi

### 2. Penjualan Produk
```
Petani → Tambah Produk → Set Stok Awal → Produk muncul di marketplace
Pembeli → Cari Produk → Tambah ke Keranjang → Checkout
```

### 3. Pembuatan Pesanan (Atomic)
```
POST /api/orders dengan items[]
├── Lock semua produk (FOR UPDATE SKIP LOCKED)
├── Validasi stok cukup
├── Hitung total
├── Buat record orders
├── Buat record order_items
├── Kurangi stok produk
└── Commit transaction
```

**Race Condition Prevention:** Jika dua pembeli beli stok yang sama bersamaan:
- Salah satu akan mendapatkan lock (FOR UPDATE)
- Yang lain akan mendapat error "insufficient_stock"
- Frontend cukup retry atau tampilkan pesan stok habis

### 4. Pengiriman Paket
```
Pesanan dibayar → Petani siapkan → Buat Shipment → Update Status
Shipment status: pending_pickup → picked_up → in_transit → delivered
```

### 5. Pencairan Dana
```
Pesanan selesai → pending_balance bertambah
Petani request payout → Admin proses → balance bertambah, pending_balance berkurang
```

## Schema Database

### users
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID PK | Primary key |
| phone | TEXT | Nomor HP (unique) |
| role | ENUM | admin/farmer/buyer |
| status | ENUM | pending/approved/rejected |
| balance | NUMERIC | Saldo terima |

### products
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID PK | |
| farmer_id | UUID FK | Refer ke users |
| name | TEXT | Nama produk |
| stock | INTEGER | Stok tersedia |

### orders
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID PK | |
| buyer_id | UUID FK | |
| total_amount | NUMERIC | Total bayar |
| status | ENUM | dibayar/disiapkan/dikirim/selesai |

## Cara Menjalankan Aplikasi (Lokal, Windows)

### Persiapan
```powershell
# 1. Install PostgreSQL (jika belum)
# Gunakan installer resmi postgresql.org atau pgAdmin

# 2. Buat database
createdb panenku_dev

# 3. Setup environment server
cd D:\PANENKU\panenku-app-main\server
Copy-Item .env.example .env -ErrorAction SilentlyContinue
```

### Setup Environment
Buat file `server/.env`:
```env
DATABASE_URL=postgresql://postgres@localhost:5432/panenku_dev
PORT=4000
```

### Jalankan Fullstack
```powershell
# Terminal 1: Backend API
cd server
npm run dev

# Terminal 2: Frontend
cd ..
npm run dev
```

Buka browser:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## API Endpoints

```
GET    /api/health              # Health check
GET    /api/users               # List users
POST   /api/users/login         # Login (phone+pin)
GET    /api/products            # List produk
GET    /api/products/:id        # Detail produk
POST   /api/orders              # Buat pesanan
GET    /api/orders/:id          # Detail pesanan
PATCH  /api/orders/:id/status   # Update status pesanan
POST   /api/shipments           # Buat pengiriman
PATCH  /api/shipments/:id/status # Update status pengiriman
```

## Deployment Production

1. Set `DATABASE_URL` ke PostgreSQL production
2. `NODE_ENV=production`
3. Gunakan `npm run build` untuk frontend
4. `npm run start` untuk backend