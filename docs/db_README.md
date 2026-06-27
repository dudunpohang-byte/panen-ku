**Database PostgreSQL Panenku**

Status saat ini: database lokal `panenku_dev` sudah bisa dibuat dan diisi lewat script Node, tanpa perlu `psql` tersedia di PATH.

**File Penting**

- `db/schema.sql`: schema PostgreSQL utama.
- `db/seed.sql`: data awal untuk development.
- `server/scripts/setup-db.mjs`: runner setup database.
- `server/.env`: konfigurasi koneksi database.

**Konfigurasi**

Pastikan `server/.env` berisi:

```env
DATABASE_URL=postgresql://postgres@localhost:5432/panenku_dev
PORT=4000
```

Jika PostgreSQL memakai password, gunakan format:

```env
DATABASE_URL=postgresql://postgres:PASSWORD_ANDA@localhost:5432/panenku_dev
PORT=4000
```

**Setup Database**

Dari folder `server`:

```powershell
cd d:\PANENKU\panenku-app-main\server
npm.cmd run db:setup
```

Script ini akan:

- Membuat database `panenku_dev` jika belum ada.
- Menjalankan `db/schema.sql`.
- Menjalankan `db/seed.sql`.
- Menampilkan jumlah tabel, user, dan produk.

Output sukses contoh:

```text
Database panenku_dev already exists
Schema applied
Seed applied
Verified: 9 tables, 3 users, 1 products
```

**Tabel Utama**

- `users`: admin, petani, pembeli.
- `products`: produk petani.
- `orders`: pesanan.
- `order_items`: item pesanan.
- `payouts`: pencairan dana petani.
- `admin_settings`: biaya admin dan ongkir.
- `admin_logs`: log tindakan admin.
- `chat_rooms`: room chat.
- `chat_messages`: pesan chat.

**Akun Seed Development**

Admin PostgreSQL:

```text
email: admin@panenku.test
phone: 080000000000
password_hash demo: dev-password-admin
pin: 000000
```

Petani:

```text
email: petani1@panenku.test
phone: 081200000001
pin: 111111
status: approved
```

Pembeli:

```text
email: buyer1@panenku.test
phone: 081300000001
pin: 222222
```

**Menjalankan Server**

```powershell
cd d:\PANENKU\panenku-app-main\server
npm.cmd run debug
```

Server API:

```text
http://localhost:4000
```

Endpoint verifikasi:

```text
GET  /api/health
GET  /api/users
POST /api/users/login
GET  /api/products
POST /api/orders
```

**Catatan Frontend**

Backend dan database sudah PostgreSQL. Beberapa halaman frontend lama masih memakai `localStorage` untuk mode demo. Data PostgreSQL sudah tersedia lewat API server dan siap disambungkan penuh ke UI.
