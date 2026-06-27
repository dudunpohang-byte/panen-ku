# Developer Guideline — Panenku
## Panduan untuk Pengembangan & Kontribusi

**Versi:** 1.0.0
**Last Updated:** 23 Juni 2026

---

## 1. Coding Standards

### 1.1 JavaScript/TypeScript
```typescript
// Gunakan TypeScript strict
// Naming conventions:
// - camelCase untuk variabel, fungsi, method
// - PascalCase untuk komponen React, class, type
// - snake_case untuk database columns
// - UPPER_CASE untuk konstanta global

// Contoh:
export interface Product {
  id: string;
  farmerId: string;
  productName: string;  // ✅ benar
  // product_name: string; // ❌ salah (camelCase di TS)
}

const MAX_ITEMS = 50; // ✅ benar
function calculateFee(subtotal: number) {} // ✅ benar
function ProductCard() {} // ✅ benar (React component)
```

### 1.2 React Best Practices
```tsx
// ✅ Gunakan functional components + hooks
// ✅ Satu component per file
// ✅ Props type selalu explicit
// ✅ Jangan gunakan any (kecuali terpaksa)
// ✅ useEffect minimal, prioritaskan derived state

// ✅ Contoh baik:
interface Props {
  productId: string;
  onSave: (product: Product) => void;
}
function EditProduct({ productId, onSave }: Props) {
  const [name, setName] = useState("");
  // ...
}

// ❌ Contoh buruk:
function EditProduct(props: any) { ... }
```

## 2. Structure Folder

```
panenku-app-main/
├── src/
│   ├── components/    # Komponen reusable
│   │   ├── Skeleton.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FarmMap.tsx
│   │   └── MobileShell.tsx
│   ├── lib/           # Library & utilities
│   │   ├── store.ts   # State management utama
│   │   ├── api.ts     # API client
│   │   ├── format.ts  # Format rupiah, tanggal
│   │   ├── cities.ts  # Data kota & distance
│   │   ├── reviews.ts # Review & rating
│   │   ├── favorites.ts
│   │   ├── promo-codes.ts
│   │   ├── analytics.ts
│   │   ├── gamification.ts
│   │   ├── multi-vendor-cart.ts
│   │   ├── barcode-scanner.ts
│   │   ├── websocket-chat.ts
│   │   ├── invoice.ts
│   │   └── edukasi.ts
│   ├── hooks/         # Custom hooks
│   ├── routes/        # Halaman (TanStack Router)
│   ├── assets/        # Asset statis
│   └── styles.css     # Global styles
├── server/
│   ├── src/
│   │   ├── index.ts   # Express server entry
│   │   ├── db-pool.ts # PostgreSQL pool
│   │   └── routes/    # API routes
│   └── .env           # Environment variables
├── docs/              # Dokumentasi
├── public/            # Static files (manifest, sw)
└── db/                # Database migrations
```

## 3. Git Workflow

### 3.1 Branch Strategy
```bash
main        # Production-ready
├── develop # Development branch
├── feature/*  # Fitur baru
└── fix/*      # Bugfix
```

### 3.2 Commit Convention
```bash
feat: menambahkan fitur multi-vendor cart
fix: memperbaiki bug kalkulasi ongkir
docs: update PRD.md
style: merapikan CSS komponen
refactor: memisahkan store menjadi modul
test: menambahkan unit test untuk kalkulasi fee
chore: update dependencies
```

### 3.3 Pull Request Checklist
- [ ] Build sukses (`npm run build:dev`)
- [ ] Tidak ada ESLint error
- [ ] Fitur baru sudah di-test manual
- [ ] Tidak ada console.log yang terlewat
- [ ] Naming convention sesuai

## 4. Testing

### 4.1 Manual Test Checklist
```bash
# Sebelum push, test:
1. npm run build:dev  → 0 errors
2. Login buyer
3. Browse produk
4. Tambah ke keranjang
5. Checkout
6. Login petani
7. Tambah produk
8. Lihat pesanan masuk
```

### 4.2 Unit Test (Future)
```typescript
// File: __tests__/calculateAdminFee.test.ts
test('hybrid fee untuk 1kg = Rp1.750', () => {
  expect(calculateAdminFee(10000, 1)).toBe(1750);
});
test('hybrid fee untuk 5kg = Rp2.750', () => {
  expect(calculateAdminFee(50000, 5)).toBe(2750);
});
test('max fee tidak lebih dari Rp10.000', () => {
  expect(calculateAdminFee(500000, 100)).toBe(10000);
});
```

## 5. Performance

### 5.1 Image Optimization
```typescript
// ✅ Gunakan ukuran kecil untuk thumbnail
// ✅ Lazy loading untuk gambar
// ✅ Jangan base64 gambar besar

// Contoh komponen gambar optimal:
function ProductImage({ src, alt }: { src: string; alt: string }) {
  const THUMB_SIZE = 300; // 300px cukup untuk mobile
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="aspect-square object-cover"
    />
  );
}
```

### 5.2 Code Splitting
```typescript
// ✅ Dynamic import untuk halaman besar
const AdminDashboard = React.lazy(() => import('./routes/admin-panenku'));

// ✅ Hindari import massive library
// ❌ import L from 'leaflet'; // 500KB+
// ✅ Gunakan static map images / link
```

## 6. Error Handling

### 6.1 Component Level
```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

function MyPage() {
  return (
    <ErrorBoundary>
      <ExpensiveComponent />
    </ErrorBoundary>
  );
}
```

### 6.2 API Calls
```typescript
// ✅ Async function selalu try-catch
async function fetchData() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    toast.error(`Gagal memuat data: ${err.message}`);
    return null;
  }
}
```

## 7. State Management

### 7.1 Local State (localStorage)
```typescript
// ✅ Gunakan fungsi store.ts untuk semua operasi
import { getProducts, addProduct } from "@/lib/store";

// ❌ Jangan akses localStorage langsung
// localStorage.getItem('panenku.products'); // ❌
```

### 7.2 Migration
```typescript
// ✅ Selalu handle migration untuk settings
export function getAdminSettings(): AdminSettings {
  const stored = read(KEYS.settings, {});
  if (!stored.__v || stored.__v < 3) {
    // Migration v2 → v3
    const migrated = { ...DEFAULT, ...stored };
    write(KEYS.settings, { ...migrated, __v: 3 });
    return migrated;
  }
}
```

## 8. Database

### 8.1 Migration Files
```sql
-- db/migration_v3.sql
-- Format: db/migration_v{number}.sql

BEGIN;
  CREATE TABLE IF NOT EXISTS users ( ... );
  CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
COMMIT;
```

### 8.2 Query Pattern
```typescript
// ✅ Parameterized query (SQL injection safe)
await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ String concatenation (BERBAHAYA)
await pool.query(`SELECT * FROM users WHERE id = '${userId}'`); // ❌
```

## 9. Deployment

### 9.1 Local Development
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
npm run dev

# Buka: http://localhost:5173
```

### 9.2 Production Build
```bash
npm run build        # Build production
npm run start        # Start production server
```

### 9.3 Environment Variables
```bash
# server/.env
DATABASE_URL=postgresql://...
XENDIT_API_KEY=sk_...
BITESHIP_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# VITE_ prefix untuk frontend env
VITE_API_URL=https://api.panenku.app
VITE_XENDIT_PUBLIC_KEY=pk_...
```

## 10. Security Checklist

### Before Production:
- [ ] Hash PIN pengguna (bcrypt)
- [ ] HTTPS enabled
- [ ] CORS restricted
- [ ] Rate limiting di endpoint login
- [ ] Environment variables tidak di commit
- [ ] SQL injection protection
- [ ] XSS protection (React otomatis)
- [ ] File upload validation
- [ ] Session timeout
- [ ] Admin activity logging

---

**Catatan:** Dokumen ini hidup dan akan diperbarui seiring perkembangan proyek.