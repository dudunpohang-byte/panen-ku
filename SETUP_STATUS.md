# Panenku Setup Status

## Ringkasan (15 Juni 2026)

Panenku adalah aplikasi marketplace pertanian (React + TypeScript + TanStack Router) dengan backend Node/Express dan database PostgreSQL.

## Status Saat Ini ✅ & ⚠️

### Frontend App (Aplikasi Utama)
- ✅ **React + TanStack Router** — sudah siap, bisa dijalankan dengan `npm run dev`
- ✅ **Routes untuk petani, pembeli, admin** — sudah ada
- ✅ **UI components (shadcn/ui)** — Accordion, Button, Form, Modal, Card, dll sudah tersedia
- ✅ **Fitur Edukasi untuk Petani** — sudah ditambahkan dengan materi+link YouTube
Masukkan password PostgreSQL user 'postgres': 
### Backend Server (Node/Express)
- ✅ **Folder `server/`** — struktur siap, menggunakan Express + pg
- ✅ **Endpoints dasar:**
  - `GET /api/health` — health check
  - `GET /api/products` — list produk
  - `GET /api/users/:id` — info user
  - `POST /api/orders` — create order (transactional)
- ✅ **Drizzle ORM** — integrasi tersedia di `server/src/db_drizzle.ts`
- ⚠️ **Belum dijalankan** — belum install & test

### Database (PostgreSQL)
- ✅ **Schema SQL** — sudah dibuat di `db/schema.sql` (users, products, orders, order_items, payouts)
- ✅ **Seed data** — sudah dibuat di `db/seed.sql`
- ⚠️ **PostgreSQL BELUM TERINSTALL** — perlu install manual di Windows
- ⚠️ **Database BELUM DIBUAT** — `panenku_dev` belum ada

### Documentation
- ✅ `docs/SCM_AND_RUN.md` — penjelasan alur app + cara menjalankan + debug
- ✅ `docs/db_README.md` — panduan install PostgreSQL + setup database + troubleshooting
- ✅ `server/README.md` — cara menjalankan server
- ✅ `.vscode/launch.json` — konfigurasi debug untuk server

## Langkah Next (TODO)

### 1. Install PostgreSQL (Windows) — 5-10 menit
```bash
# Download dari https://www.postgresql.org/download/windows/
# Jalankan installer, catat password superuser 'postgres'
# Restart terminal PowerShell setelah instalasi
```

### 2. Buat Database & Schema
```bash
cd d:\PANENKU\panenku-app-main

createdb -U postgres panenku_dev
psql -U postgres -d panenku_dev -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
psql -U postgres -d panenku_dev -f db/schema.sql
psql -U postgres -d panenku_dev -f db/seed.sql

# Verifikasi
psql -U postgres -d panenku_dev -c "\dt"
```

### 3. Setup Server
```bash
cd server

# Copy .env
cp .env.example .env

# Edit .env — ganti YOUR_PASSWORD dengan password PostgreSQL yang diset
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/panenku_dev

npm install
npm run dev
```

### 4. Test Koneksi
```bash
# Terminal baru, jalankan:
curl http://localhost:4000/api/health
curl http://localhost:4000/api/products
```

Jika mendapat JSON response → **Server sudah terhubung ke database** ✅

### 5. Jalankan Frontend
```bash
# Terminal lain
npm run dev
# Buka http://localhost:5173
```

## File Structure
```
panenku-app-main/
├── src/                    # React frontend
│   ├── routes/            # Pages (petani, pembeli, admin)
│   ├── components/        # UI components
│   ├── lib/
│   │   ├── store.ts       # In-memory data store
│   │   ├── edukasi.ts     # Edukasi topics + links
│   │   └── ...
│   └── hooks/
├── db/
│   ├── schema.sql         # PostgreSQL schema
│   └── seed.sql           # Seed data
├── server/
│   ├── src/
│   │   ├── index.ts       # Express app
│   │   ├── db.ts          # pg Pool
│   │   ├── db_drizzle.ts  # Drizzle ORM
│   │   └── routes/        # API endpoints
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── SCM_AND_RUN.md     # App alur & cara menjalankan
│   └── db_README.md       # Database setup guide
└── .vscode/
    └── launch.json        # Debug config
```

## Catatan Penting

1. **Data saat ini disimpan di memory** (`src/lib/store.ts`) — belum terhubung ke database.
   - Server API sudah siap, tapi frontend masih pakai in-memory store.
   - Untuk production, update `src/lib/store.ts` untuk fetch dari server API.

2. **Authentication belum diimplementasikan** — pakai session mock di `src/hooks/use-session.ts`.

3. **Password seed di database adalah placeholder** — jangan gunakan di production.

4. **Environment variables (.env di server/)** tidak di-commit — buat sendiri dari `.env.example`.

## Troubleshooting Quick Links
- PostgreSQL tidak terdeteksi? → Lihat `docs/db_README.md` bagian "Troubleshooting"
- Server tidak connect ke DB? → Cek `DATABASE_URL` di `server/.env`
- Debug server di VS Code? → `F5` dengan launch config di `.vscode/launch.json`

---

**Next Action:** Install PostgreSQL, buat database, test server connection. Dokumentasi lengkap ada di `docs/db_README.md`.
