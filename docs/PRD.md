# PRD — Product Requirements Document
## Panenku — Marketplace Petani Indonesia

**Versi:** 1.0.0
**Status:** MVP / Alpha
**Tanggal:** 23 Juni 2026

---

## 1. Visi Produk
Menjadi platform marketplace No.1 di Indonesia yang menghubungkan petani dengan pembeli secara langsung, transparan, dan adil.

## 2. Target Pengguna

| Persona | Deskripsi | Kebutuhan |
|---------|-----------|-----------|
| **Pembeli (Buyer)** | Ibu rumah tangga, pekerja, pengusaha kuliner | Beli sayur/buah segar langsung dari petani |
| **Petani (Farmer)** | Petani kecil-menengah di Jawa | Jual hasil panen langsung, tanpa tengkulak |
| **Admin** | Pengelola platform | Verifikasi, atur biaya, pantau transaksi |

**Target awal:** Pulau Jawa (114 kota/kabupaten)
**Target ekspansi:** Seluruh Indonesia (Q4 2026)

## 3. Fitur Utama (MVP)

### 3.1 Autentikasi & Pengguna
- [x] Register/login dengan PIN 6 digit
- [x] 3 role: Buyer, Farmer, Admin
- [x] Verifikasi petani (pending → approved → rejected)
- [x] Session via localStorage

### 3.2 Marketplace
- [x] Browse produk dari 13+ petani demo
- [x] Filter kategori (sayur, buah, cabai, beras, dll)
- [x] Detail produk (deskripsi, foto, sertifikat)
- [x] Stok real-time

### 3.3 Keranjang & Checkout
- [x] Multi-vendor cart (beli dari banyak petani)
- [x] Pilih metode pembayaran (QRIS, Transfer, COD)
- [x] Pilih metode pengiriman (antar petani / pihak ketiga)
- [x] Kalkulasi biaya admin + ongkir

### 3.4 Pembayaran
- [x] QRIS (Xendit) — siap integrasi
- [x] Transfer Bank (Xendit) — siap integrasi
- [x] COD — Bayar di tempat
- [x] Invoice + QR code per order

### 3.5 Pengiriman
- [x] **Diantar Petani** — Fee Rp2.500/5kg (rugi petani)
- [x] **Pihak Ketiga** — Fee Rp1.500/5kg (rugi admin)
- [x] Wajib foto barang saat dikirim
- [x] Checklist jaminan sampai
- [x] Nama pengirim + perkiraan sampai
- [x] QR tracking code

### 3.6 Chat & Negosiasi
- [x] Chat real-time WebSocket
- [x] Tawar harga (offer system)
- [x] Upload foto di chat

### 3.7 Diskon
- [x] **Admin Diskon** — Rugi admin (dari biaya admin)
- [x] **Petani Diskon** — Rugi petani (dari harga jual)
- [x] Admin atur diskon per produk
- [x] Petani atur diskon per produk sendiri

### 3.8 Biaya Admin
- [x] 3 mode: Hybrid (default), Percentage, Flat per 5kg
- [x] Hybrid: Rp1.500 base + Rp250/kg, min Rp1.500, max Rp10.000
- [x] Admin bisa ubah kapan saja

### 3.9 Review & Rating
- [x] Rating 1-5 per produk
- [x] Review dengan komentar
- [x] Lihat review per petani + per produk
- [x] Average rating

### 3.10 Fitur Tambahan
- [x] Favorites/Wishlist
- [x] Promo Code (diskon Rp / %)
- [x] Edukasi (8 topik pertanian)
- [x] Analytics Dashboard (grafik penjualan)
- [x] Gamification (10 level, 9 badge)
- [x] Barcode Scanner (QR + 1D)
- [x] Push Notification (FCM siap)
- [x] SMS Gateway (Twilio siap)
- [x] Voice Over (baca total + alamat)
- [x] Map Integration (20+ kota Indonesia)
- [x] Privacy Policy + Terms of Service
- [x] Global Error Boundary + Skeleton Loading
- [x] PWA (manifest + service worker)

## 4. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19 + TanStack Router + Vite 7 |
| Backend | Node.js + Express (port 4000) |
| Database | PostgreSQL 18 + pg |
| Local State | localStorage |
| Payment Gateway | Xendit (QRIS + Transfer) |
| Shipment | BiteShip (opsional) |
| Notification | FCM + Twilio |
| Chat | WebSocket (ws://) |
| Map | Google Maps / OpenStreetMap link |
| PWA | manifest.json + sw.js |

## 5. Arsitektur Database

### Tabel PostgreSQL:
1. `users` — Pengguna (buyer, farmer, admin)
2. `products` — Produk pertanian
3. `orders` — Pesanan
4. `order_items` — Detail item per pesanan
5. `reviews` — Review & rating
6. `chat_rooms` — Room chat
7. `chat_messages` — Pesan chat
8. `shipments` — Tracking pengiriman
9. `shipment_events` — Timeline event
10. `promo_codes` — Kode diskon
11. `admin_logs` — Log aktivitas admin
12. `favorites` — Wishlist
13. `notifications` — Notifikasi push
14. `settings` — Pengaturan aplikasi

### LocalStorage Keys:
```
panenku.users, panenku.session, panenku.products,
panenku.cart, panenku.orders, panenku.prefs,
panenku.adminSettings, panenku.adminLogs,
panenku.chat.rooms, panenku.chat.messages,
panenku.reviews, panenku.favorites, panenku.promo_codes,
panenku.gamification
```

## 6. Keamanan

### Sudah:
- [x] PIN-based auth (6 digit)
- [x] Role-based access (buyer/farmer/admin)
- [x] Admin logs (semua aktivitas tercatat)
- [x] Produk hanya visible jika petani approved
- [x] XSS protection (React otomatis)
- [x] CORS di backend (Express)

### Belum (Roadmap):
- [ ] Hash PIN (bcrypt)
- [ ] JWT token
- [ ] Rate limiting
- [ ] 2FA
- [ ] HTTPS (otomatis di hosting)
- [ ] Validasi server-side

## 7. Hosting Plan (Gratis 1 Tahun)

### Opsi 1: Vercel + Railway (RECOMMENDED ✅)
| Komponen | Platform | Biaya |
|----------|----------|-------|
| Frontend | Vercel Hobby | GRATIS selamanya |
| Backend | Railway Starter | GRATIS $5/bulan = $60 kredit |
| Database | Railway PostgreSQL | GRATIS (included) |
| Domain | Vercel subdomain | GRATIS |
| Total: **GRATIS 1 TAHUN** |

### Opsi 2: Cloudflare Pages + Workers
| Komponen | Platform | Biaya |
|----------|----------|-------|
| Frontend | Cloudflare Pages | GRATIS (100k req/hari) |
| Backend | Railway | $5/bulan |
| Total: **GRATIS + $5/bulan** |

### Setup 30 menit:
```
1. Push ke GitHub
2. Vercel → Import repo → Deploy (Gratis)
3. Railway → New Project → Add PostgreSQL plugin (Gratis)
4. Connect GitHub → Deploy backend
5. Selesai! 🎉
```

## 8. Metrik Kesuksesan (MVP)

| Metrik | Target |
|--------|--------|
| Jumlah petani terverifikasi | 50+ dalam 3 bulan |
| Produk aktif | 500+ |
| Transaksi per hari | 20+ |
| Response time server | <500ms |
| Build success rate | 100% |
| Error rate (client) | <1% |

## 9. Milestone

| Fase | Tanggal | Target |
|------|---------|--------|
| Alpha testing | Juni 2026 | Internal + 10 petani |
| Beta closed | Juli 2026 | 50 petani + 200 pembeli |
| Public launch | Agustus 2026 | 200+ petani |
| Play Store | September 2026 | PWA + App |
| Ekspansi nasional | Q4 2026 | Luar Jawa |

## 10. Daftar Halaman (Routes)

| Route | Halaman | Role |
|-------|---------|------|
| `/` | Beranda | All |
| `/masuk` | Login | Guest |
| `/daftar` | Register | Guest |
| `/cari` | Cari produk | All |
| `/keranjang` | Keranjang | Buyer |
| `/checkout` | Checkout | Buyer |
| `/pesanan` | Pesanan saya | All |
| `/pesanan/$id` | Detail pesanan | All |
| `/akun` | Akun saya | All |
| `/toko/$farmerId` | Toko petani | All |
| `/chat/$roomId` | Chat room | All |
| `/bandingkan` | Bandingkan produk | All |
| `/bantuan` | Bantuan | All |
| `/syarat` | Syarat & Ketentuan | All |
| `/privasi` | Kebijakan Privasi | All |
| `/petani` | Dashboard petani | Farmer |
| `/petani/produk` | Kelola produk | Farmer |
| `/petani/produk/$id` | Edit produk | Farmer |
| `/petani/tambah-produk` | Tambah produk | Farmer |
| `/petani/diskon` | Atur diskon | Farmer |
| `/petani/edukasi` | Edukasi | Farmer |
| `/petani/beli` | Beli dari toko lain | Farmer |
| `/petani/tarik-dana` | Tarik saldo | Farmer |
| `/petani/sertifikat` | Sertifikat | Farmer |
| `/admin-panenku` | Dashboard admin | Admin |
| `/admin-panenku/verifikasi` | Verifikasi petani | Admin |
| `/admin-panenku/diskon` | Diskon admin | Admin |
| `/admin-panenku/biaya` | Biaya admin | Admin |
| `/admin-panenku/log` | Log admin | Admin |
| `/admin-panenku/statistik` | Statistik | Admin |
| `/admin-panenku/withdrawals` | Penarikan saldo | Admin |
| `/admin-panenku/security` | Keamanan | Admin |
| `/admin-panenku/returns` | Pengembalian | Admin |

## 11. API Endpoints (Server)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/shipments/order/:orderId` | Ambil shipment |
| POST | `/api/shipments` | Buat shipment |
| PATCH | `/api/shipments/:id/status` | Update status |
| GET | `/api/discounts/product/:productId` | Ambil diskon |
| POST | `/api/discounts` | Buat diskon |
| PATCH | `/api/discounts/:id` | Update diskon |
| DELETE | `/api/discounts/:id` | Hapus diskon |
| WebSocket | `/chat?userId=xxx` | Live chat |

## 12. Biaya & Revenue Model

### Revenue:
- Admin fee: Hybrid Rp1.500 + Rp250/kg (transaksi < 5kg)
- Atau: Flat fee per 5kg (transaksi > 5kg)
- Atau: 5% percentage (produk premium)

### Biaya Operasional (estimated):
```
Xendit: 2% + Rp2.000/transaksi
Server: $7/bulan (Railway)
Domain: Rp150.000/tahun
Developer: Free (self-built)
```

### Break Even Point:
```
3.000 transaksi/bulan @ rata-rata Rp3.000 fee
= Rp9.000.000/bulan
= Cukup untuk server + domain + 1 admin
```

---

**Dokumen ini diperbarui:** 23 Juni 2026
**Penulis:** Panenku Dev Team