// Promo Code system — localStorage only

const KEY = "panenku.promo_codes";

export type PromoCode = {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // percentage (0-100) or fixed amount
  minPurchase: number;
  maxUsage: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
};

export function getPromoCodes(): PromoCode[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PromoCode[]) : [];
  } catch {
    return [];
  }
}

export function addPromoCode(code: Omit<PromoCode, "usedCount">): PromoCode {
  const all = getPromoCodes();
  if (all.find((p) => p.code.toLowerCase() === code.code.toLowerCase())) {
    throw new Error("Kode promo sudah ada");
  }
  const newCode: PromoCode = { ...code, usedCount: 0 };
  all.push(newCode);
  localStorage.setItem(KEY, JSON.stringify(all));
  return newCode;
}

export function validatePromo(code: string, cartTotal: number, userId: string): { valid: boolean; discount: number; message: string } {
  const promos = getPromoCodes();
  const promo = promos.find((p) => p.code.toLowerCase() === code.toLowerCase() && p.active);

  if (!promo) return { valid: false, discount: 0, message: "Kode promo tidak ditemukan" };

  const now = new Date();
  const validFrom = new Date(promo.validFrom);
  const validUntil = new Date(promo.validUntil);

  if (now < validFrom) return { valid: false, discount: 0, message: "Kode promo belum aktif" };
  if (now > validUntil) return { valid: false, discount: 0, message: "Kode promo sudah kadaluarsa" };
  if (promo.usedCount >= promo.maxUsage) return { valid: false, discount: 0, message: "Kode promo sudah habis" };
  if (cartTotal < promo.minPurchase) return { valid: false, discount: 0, message: `Minimal pembelian Rp${promo.minPurchase.toLocaleString("id-ID")}` };

  // Check if user already used this code
  const usageKey = `panenku.promo_usage.${userId}`;
  const usedPromos = (() => {
    try {
      const raw = localStorage.getItem(usageKey);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  })();

  if (usedPromos.includes(promo.code)) {
    return { valid: false, discount: 0, message: "Kode promo sudah digunakan" };
  }

  let discount = 0;
  if (promo.discountType === "percentage") {
    discount = Math.round((cartTotal * promo.discountValue) / 100);
  } else {
    discount = Math.min(promo.discountValue, cartTotal);
  }

  return { valid: true, discount, message: `Diskon Rp${discount.toLocaleString("id-ID")} berhasil diterapkan!` };
}

export function applyPromoCode(code: string, userId: string): boolean {
  const promos = getPromoCodes();
  const promo = promos.find((p) => p.code.toLowerCase() === code.toLowerCase() && p.active);

  if (!promo) return false;

  // Increment usage
  promo.usedCount += 1;
  localStorage.setItem(KEY, JSON.stringify(promos));

  // Mark as used by user
  const usageKey = `panenku.promo_usage.${userId}`;
  const usedPromos = (() => {
    try {
      const raw = localStorage.getItem(usageKey);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  })();
  usedPromos.push(promo.code);
  localStorage.setItem(usageKey, JSON.stringify(usedPromos));

  return true;
}