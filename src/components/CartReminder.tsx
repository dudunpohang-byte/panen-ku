import { useEffect, useState } from "react";
import { ShoppingCart, Bell, X, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getCart, getProducts, getSession, getVisibleProducts, type User } from "@/lib/store";
import { rupiah } from "@/lib/format";

/**
 * CartReminder - Komponen notifikasi AI yang mengingatkan user
 * untuk membeli produk yang ada di keranjang setiap 1 hari sekali,
 * dan menawarkan produk termurah setiap 3 jam sekali.
 */
const REMINDER_KEY = "panenku.cart_reminder";
const CHEAPEST_OFFER_KEY = "panenku.cheapest_offer";

interface ReminderState {
  lastShownAt: string;
  productCount: number;
}

interface CheapestOfferState {
  lastShownAt: string;
  lastProductId: string;
}

export function CartReminder() {
  const [show, setShow] = useState(false);
  const [session, setSession] = useState<User | null>(null);
  const [items, setItems] = useState<{ name: string; qty: number }[]>([]);
  const [offerProduct, setOfferProduct] = useState<{ id: string; name: string; price: number; unit: string; image?: string } | null>(null);
  const [mode, setMode] = useState<"cart" | "offer">("cart");

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (!s || s.role === "admin") return;

    const now = Date.now();

    // === CEK PRODUK TERMURAH (tawarkan setiap 3 jam) ===
    try {
      const stored = localStorage.getItem(CHEAPEST_OFFER_KEY);
      if (stored) {
        const state: CheapestOfferState = JSON.parse(stored);
        const last = new Date(state.lastShownAt).getTime();
        const hoursSinceLast = (now - last) / (1000 * 60 * 60);
        if (hoursSinceLast >= 3) {
          showCheapestOffer(s, state.lastProductId);
          return;
        }
      } else {
        showCheapestOffer(s, "");
        return;
      }
    } catch {
      showCheapestOffer(s, "");
      return;
    }

    // === CEK CART REMINDER (setiap 24 jam) ===
    const cart = getCart(s.id);
    if (cart.length === 0) return;

    try {
      const stored = localStorage.getItem(REMINDER_KEY);
      if (stored) {
        const state: ReminderState = JSON.parse(stored);
        const last = new Date(state.lastShownAt).getTime();
        const hoursSinceLast = (now - last) / (1000 * 60 * 60);
        if (hoursSinceLast < 24 && state.productCount === cart.length) {
          return;
        }
      }
    } catch {
      // ignore
    }

    showCartReminder(s, cart);
  }, []);

  function showCheapestOffer(s: User, excludeProductId: string) {
    const allProducts = getVisibleProducts();
    if (allProducts.length === 0) return;

    // Urutkan dari termurah
    const sorted = [...allProducts].sort((a, b) => a.price - b.price);
    // Cari produk termurah yang bukan yang terakhir ditawarkan
    let cheapest = sorted[0];
    if (excludeProductId && sorted.length > 1) {
      const filtered = sorted.filter((p) => p.id !== excludeProductId);
      if (filtered.length > 0) cheapest = filtered[0];
    }

    setOfferProduct({
      id: cheapest.id,
      name: cheapest.name,
      price: cheapest.price,
      unit: cheapest.unit,
      image: cheapest.image,
    });
    setMode("offer");

    // Mark as shown
    localStorage.setItem(CHEAPEST_OFFER_KEY, JSON.stringify({
      lastShownAt: new Date().toISOString(),
      lastProductId: cheapest.id,
    } as CheapestOfferState));

    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }

  function showCartReminder(s: User, cart: any[]) {
    const products = getProducts();
    const itemDetails = cart.map((c) => {
      const p = products.find((pr) => pr.id === c.productId);
      return { name: p?.name || "Produk", qty: c.qty };
    });
    setItems(itemDetails);
    setMode("cart");

    localStorage.setItem(REMINDER_KEY, JSON.stringify({
      lastShownAt: new Date().toISOString(),
      productCount: cart.length,
    } as ReminderState));

    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }

  if (!show || !session) return null;

  // Mode: Tawarkan Produk Termurah (setiap 3 jam)
  if (mode === "offer" && offerProduct) {
    return (
      <div className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-24px)] max-w-md -translate-x-1/2 animate-in slide-in-from-bottom-4">
        <div className="rounded-2xl border-2 border-orange-300 bg-white p-4 shadow-xl dark:border-orange-400/30 dark:bg-card">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100">
              <Tag className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">🔥 Produk Termurah Hari Ini!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {offerProduct.name} — mulai dari <strong className="text-primary">{rupiah(offerProduct.price)}</strong>/{offerProduct.unit}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  to="/"
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
                  onClick={() => setShow(false)}
                >
                  <ShoppingCart className="h-4 w-4" /> Lihat & Beli
                </Link>
                <button
                  onClick={() => setShow(false)}
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-muted px-4 text-sm font-semibold"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
            <button
              onClick={() => setShow(false)}
              className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode: Cart Reminder (setiap 24 jam)
  return (
    <div className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-24px)] max-w-md -translate-x-1/2 animate-in slide-in-from-bottom-4">
      <div className="rounded-2xl border-2 border-primary/30 bg-white p-4 shadow-xl dark:border-primary/20 dark:bg-card">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground">🛒 Masih ada di keranjang!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Produk yang Anda simpan:{' '}
              {items.slice(0, 3).map(i => `${i.qty} ${i.name}`).join(', ')}
              {items.length > 3 ? `, dan ${items.length - 3} lainnya` : ''}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Link
                to="/keranjang"
                className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
                onClick={() => setShow(false)}
              >
                <ShoppingCart className="h-4 w-4" /> Lihat Keranjang
              </Link>
              <button
                onClick={() => setShow(false)}
                className="flex h-10 items-center gap-1.5 rounded-xl bg-muted px-4 text-sm font-semibold"
              >
                Nanti Saja
              </button>
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}