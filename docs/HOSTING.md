# Panduan Hosting Gratis 1 Tahun — Panenku

## 🎯 Target: Hosting GRATIS selama 1 tahun penuh

---

## Opsi 1: Vercel + Railway (RECOMMENDED ✅)

### Biaya: $0/tahun

| Layanan | Fungsi | Biaya |
|---------|--------|-------|
| **Vercel Hobby** | Frontend (React) | GRATIS selamanya |
| **Railway Starter** | Backend (Express) | $5 kredit/bulan (GRATIS) |
| **Railway PostgreSQL** | Database | GRATIS included |
| **Domain Vercel** | panenku.vercel.app | GRATIS |
| **Custom Domain** | panenku.app (opsional) | Rp150.000/tahun |

### Cara Setup (30 menit):

#### Step 1: Push ke GitHub
```bash
# Buat repository di github.com
git remote add origin https://github.com/username/panenku.git
git add .
git commit -m "feat: initial MVP"
git push origin main
```

#### Step 2: Deploy Frontend ke Vercel (GRATIS ✅)
```bash
# 1. Buka https://vercel.com
# 2. Login dengan GitHub
# 3. Klik "Add New" → "Project"
# 4. Pilih repository panenku
# 5. Framework Preset: Vite
# 6. Build Command: npm run build
# 7. Output Directory: dist/client
# 8. Environment Variables:
#    VITE_API_URL=https://panenku-api.railway.app
# 9. Deploy!
# 
# ✅ Selesai! Dapat domain: https://panenku.vercel.app
```

#### Step 3: Deploy Backend ke Railway (GRATIS 1 TAHUN ✅)
```bash
# Railway memberikan $5 kredit/bulan gratis
# Backend kita cuma butuh $3.5/bulan (starter plan)
# = GRATIS selama 1 tahun penuh!

# 1. Buka https://railway.app
# 2. Login dengan GitHub
# 3. Klik "New Project" → "Deploy from GitHub"
# 4. Pilih repository panenku
# 5. Railway akan detect server/package.json otomatis
# 6. Set Start Command: cd server && npm start
# 7. Tambah PostgreSQL:
#    - Klik "New" → "Database" → "PostgreSQL"
#    - Railway auto-create connection string
# 8. Environment Variables (di Railway dashboard):
#    DATABASE_URL=<auto dari Railway PostgreSQL>
#    XENDIT_API_KEY=sk_xxx
#    XENDIT_PUBLIC_KEY=pk_xxx
# 9. Deploy!
# 
# ✅ Selesai! Dapat domain: https://panenku-api.railway.app
```

### Kenapa Railway gratis 1 tahun?
- Railway Starter: $5/bulan
- Gratis $5 kredit SETIAP bulan
- Backend Panenku: $3.5/bulan
- **Sisa kredit: $1.5/bulan (bisa untuk DB backup)**

## Opsi 2: Cloudflare Pages + Railway

### Biaya: $0/tahun (frontend) + $5/bulan (backend)

| Layanan | Fungsi | Biaya |
|---------|--------|-------|
| **Cloudflare Pages** | Frontend | GRATIS (100k req/hari) |
| **Railway** | Backend + DB | $5/bulan |
| **Cloudflare Workers** | API proxy (optional) | GRATIS (100k req/hari) |
| **SSL** | HTTPS | GRATIS |

### Setup Cloudflare Pages:
```bash
# 1. Buka https://pages.cloudflare.com
# 2. Login → Create project
# 3. Connect GitHub repo
# 4. Build: npm run build
# 5. Output: dist/client
# 6. Deploy!
```

## Opsi 3: Self-Hosted VPS (Alternatif)

### Biaya: $6-12/bulan
```bash
# DigitalOcean Droplet: $6/bulan
# CPU: 1 vCPU, RAM: 1GB, Storage: 25GB
# Cukup untuk Panenku + PostgreSQL

# Setup:
1. ssh root@your_server_ip
2. apt update && apt upgrade
3. Install Node.js 18+, PostgreSQL
4. Clone repo
5. npm install && npm run build
6. pm2 start npm -- start
7. Setup nginx reverse proxy
8. SSL dengan certbot
```

## Perbandingan Biaya 1 Tahun

| Platform | Frontend | Backend | Database | Domain | Total 1 Tahun |
|----------|----------|---------|----------|--------|---------------|
| **Vercel + Railway** ✅ | $0 | $0 | $0 | $0 | **$0** |
| Cloudflare + Railway | $0 | $60 | $0 | $0 | **$60** |
| VPS DigitalOcean | $36 | - | - | $0 | **$36** (lebih ribet) |
| Netlify + Heroku | $0 | $120 | $0 | $0 | **$120** |

## Checklist Go Public

### Week 1: Setup Hosting
- [ ] Push ke GitHub
- [ ] Vercel deploy frontend (10 menit)
- [ ] Railway deploy backend + DB (15 menit)
- [ ] Test API dari Postman

### Week 2: Domain & SSL
- [ ] Beli domain: panenku.app (Rp150rb/thn)
- [ ] Setup custom domain di Vercel
- [ ] Setup custom domain di Railway
- [ ] SSL otomatis (Let's Encrypt)

### Week 3: Testing
- [ ] Test seluruh flow transaksi
- [ ] Test real-time chat
- [ ] Test tracking pengiriman
- [ ] Test dari HP

### Week 4: Launch
- [ ] Buat halaman landing
- [ ] Social media promotion
- [ ] Invite 10 petani pertama
- [ ] Monitoring performance

## Catatan Penting

### Railway Credit: $5/bulan GRATIS
```
- $3.5 untuk starter plan
- $1.5 sisa untuk snapshot/backup
- Jangan upgrade plan!
- Reset setiap bulan
```

### Vercel Limits (Free):
```
- 100 GB bandwidth
- 600 build hours
- Unlimited sites
- Cukup untuk MVP
```

### Scaling Plan:
```
100 pengguna:  Vercel Free + Railway Starter ($0)
1.000 pengguna: Vercel Pro ($20) + Railway Dev ($10)
10.000+:       VPS dedicated ($50-100)
```

## 🏆 Kesimpulan

**Vercel + Railway adalah solusi termurah dan termudah.**

Keuntungan:
- ✅ Frontend GRATIS selamanya di Vercel
- ✅ Backend + Database GRATIS 1 tahun di Railway
- ✅ Setup 30 menit
- ✅ Auto SSL, auto deploy dari GitHub
- ✅ Scalable sampai 1.000 pengguna tanpa biaya tambahan

**Total biaya tahun pertama: $0 🎉**