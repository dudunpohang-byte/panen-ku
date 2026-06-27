# Panduan Hosting Gratis di Firebase — Panenku

## 🎯 Target: Hosting GRATIS dengan Firebase

| Layanan | Fungsi | Biaya |
|---------|--------|-------|
| **Firebase Hosting** | Frontend (React SPA) | GRATIS (10 GB storage, 100 GB bandwidth/bln) |
| **Cloudflare Workers / Railway** | Backend API (opsional) | GRATIS |
| **Neon PostgreSQL** | Database | GRATIS (0.5 GB storage) |
| **SSL** | HTTPS otomatis | GRATIS |
| **Custom Domain** | panenku.web.app | GRATIS |

---

## Prasyarat

1. **Akun Google** — untuk Firebase
2. **Node.js 18+** — sudah terinstall
3. **Git** — untuk push ke GitHub
4. **Firebase CLI** — akan diinstall saat setup

---

## Tahapan Hosting Firebase

### 🔹 Step 1: Install Firebase CLI

Buka terminal (PowerShell / CMD) dan jalankan:

```powershell
# Install Firebase CLI secara global
npm install -g firebase-tools

# Verifikasi instalasi
firebase --version
```

> **Catatan:** Jika error "tidak dikenali", buka PowerShell sebagai Administrator dan coba lagi.

---

### 🔹 Step 2: Login ke Firebase

```powershell
firebase login
```

Perintah ini akan membuka browser. Login dengan akun Google Anda, lalu beri izin Firebase CLI.

---

### 🔹 Step 3: Buat Project Firebase

#### Opsi A: Lewat Website Firebase
1. Buka https://console.firebase.google.com
2. Klik **"Add project"** (atau **"Buat project"**)
3. Masukkan nama project: **panenku-app**
4. Ikuti向导 sampai selesai

#### Opsi B: Lewat CLI (alternatif)
```powershell
firebase projects:create panenku-app
```

Catat **Project ID** Firebase Anda. Biasanya: `panenku-app-xxxxx`

---

### 🔹 Step 4: Init Firebase di Project Panenku

```powershell
# Dari folder project Panenku
cd D:\PANENKU\panenku-app-main

# Init Firebase Hosting
firebase init hosting
```

Selama proses init, pilih:

| Pertanyaan | Jawaban |
|------------|---------|
| Select Firebase project | Pilih **panenku-app** yang tadi dibuat |
| What do you want to use as your public directory? | Ketik: **dist/client** |
| Configure as a single-page app (rewrite all urls to /index.html)? | **Ya** (pilih Yes) |
| Set up automatic builds with GitHub? | **Tidak** (opsional) |
| File dist/client/index.html already exists. Overwrite? | **Tidak** (pilih No) |

Setelah selesai, Firebase akan membuat 2 file baru:
- `firebase.json` — konfigurasi hosting
- `.firebaserc` — menyimpan project ID

---

### 🔹 Step 5: Konfigurasi Firebase untuk TanStack Start

Project ini menggunakan **TanStack Start (SSR)**. Firebase Hosting hanya untuk file statis, jadi kita perlu build khusus untuk mode SPA (client-only).

#### 📌 Buat file `.env.production` di root project

```env
VITE_API_URL=https://your-api-url.com
```

#### 📌 Konfigurasi `firebase.json`

Edit firebase.json dengan isi berikut:

```json
{
  "hosting": {
    "public": "dist/client",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

#### 📌 Tambahkan script build khusus Firebase di `package.json`

Edit `package.json` bagian `"scripts"`:

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "build:firebase": "vite build --mode production",
    "preview": "vite preview",
    "deploy:firebase": "npm run build:firebase && firebase deploy --only hosting",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

---

### 🔹 Step 6: Build Aplikasi

```powershell
# Build untuk production (mode SPA/client)
npm run build:firebase
```

Hasil build akan keluar di folder `dist/client/`.

---

### 🔹 Step 7: Deploy ke Firebase

```powershell
# Deploy hanya hosting
npm run deploy:firebase

# Atau manual:
firebase deploy --only hosting
```

Tunggu proses selesai. Firebase akan memberi URL:
```
✔  Deploy complete!
Project Console: https://console.firebase.google.com/project/panenku-app/overview
Hosting URL: https://panenku-app.web.app
```

---

## 🔹 Step 8: Test Hasil Deploy

Buka browser dan akses:
```
https://panenku-app.web.app
```

Test semua halaman:
- ✅ Halaman Beranda (`/`)
- ✅ Login & Register (`/masuk`, `/daftar`)
- ✅ Checkout (`/checkout`)
- ✅ Notifikasi (`/notifikasi`)
- ✅ Bantuan (`/bantuan`)

---

## Setup Backend & Database

Karena Firebase Hosting hanya untuk frontend statis, backend API perlu dihosting terpisah.

### Opsi 1: Railway (RECOMMENDED ✅)
Backend Express + PostgreSQL gratis 1 tahun.
Lihat panduan lengkap di `docs/HOSTING.md`.

### Opsi 2: Cloudflare Workers
Untuk API sederhana. GRATIS 100.000 request/hari.

### Opsi 3: Firebase Cloud Functions
Bisa deploy backend sebagai Cloud Function. GRATIS 2 juta invokasi/bulan.

---

## Domain Kustom (Opsional)

Untuk pakai domain sendiri (misal `panenku.app`):

1. Buka **Firebase Console** → **Hosting**
2. Klik **"Add custom domain"**
3. Masukkan domain: `panenku.app`
4. Ikuti petunjuk untuk menambahkan record DNS
5. Tunggu propagasi DNS (5-30 menit)

**Biaya domain:** ~Rp150.000/tahun di Niagahoster atau Namecheap.

---

## Update Aplikasi (Re-deploy)

Setiap kali ada perubahan kode:

```powershell
# 1. Build ulang
npm run build:firebase

# 2. Deploy ulang
npm run deploy:firebase
```

Atau jika ingin **auto-deploy** dari GitHub:
1. Di Firebase Console → **Hosting** → **GitHub Actions**
2. Ikuti setup workflow
3. Setiap push ke `main` akan auto-deploy

---

## Batasan Firebase Hosting Gratis

| Resource | Batasan |
|----------|---------|
| Storage | 10 GB |
| Bandwidth | 100 GB / bulan |
| Custom Domain | Ya |
| SSL | Otomatis (Let's Encrypt) |
| Redirects / Rewrites | Ya |
| Header kustom | Ya |

**Panenku dengan ~100 pengguna aktif tidak akan mencapai batasan ini.**

---

## Troubleshooting

### ❌ "Error: HTTP Error: 404, Could not find project"
**Solusi:** Pastikan project ID di `.firebaserc` benar.
```json
{
  "projects": {
    "default": "panenku-app-xxxxx"  // Ganti dengan project ID kamu
  }
}
```

### ❌ Halaman blank/putih setelah deploy
**Solusi:**
1. Buka `dist/client/index.html` pastikan ada konten
2. Cek console browser (F12) untuk error JavaScript
3. Pastikan `firebase.json` punya rewrite `"**" → "/index.html"`

### ❌ API tidak bisa diakses
**Solusi:** Pastikan `VITE_API_URL` di `.env.production` sudah benar:
```
VITE_API_URL=https://panenku-api.railway.app
```

### ❌ "firebase" bukan perintah yang dikenal
**Solusi:** Install ulang Firebase CLI:
```powershell
npm install -g firebase-tools
# Restart terminal
```

---

## 🏆 Ringkasan Biaya

| Item | Biaya |
|------|-------|
| Firebase Hosting | **GRATIS** |
| SSL / HTTPS | **GRATIS** |
| Domain firebase (panenku-app.web.app) | **GRATIS** |
| Custom Domain (panenku.app) | Rp150.000/tahun (opsional) |
| Backend API (Railway) | **GRATIS** 1 tahun |
| Database Neon | **GRATIS** |
| **Total Tahun Pertama** | **$0 ✅** |