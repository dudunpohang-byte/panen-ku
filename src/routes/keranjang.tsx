import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ProductImage } from "@/components/ProductImage";
import { rupiah } from "@/lib/format";
import { getCart, getProducts, setCart, MIN_ORDER_QTY } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { toast } from "sonner";

const SELECTION_KEY = "panenku.cart.selection";

export const Route = createFileRoute("/keranjang")({
  component: Keranjang,
});

function Keranjang() {
  const session = useSession();
  const navigate = useNavigate();
  const products = useStoreSubscription(() => getProducts());
  const cart = useStoreSubscription(() => (session ? getCart(session.id) : []));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Pertahankan hanya yang ada di keranjang. Default: semua dipilih.
  useEffect(() => {
    setSelected((prev) => {
      const validIds = new Set(cart.map((c) => c.productId));
      const next = new Set<string>();
      // Kalau belum pernah memilih, defaultkan semua.
      if (prev.size === 0) {
        validIds.forEach((id) => next.add(id));
        return next;
      }
      prev.forEach((id) => validIds.has(id) && next.add(id));
      // Item baru → ikut tercentang.
      cart.forEach((c) => {
        if (!prev.has(c.productId) && !next.has(c.productId) && prev.size > 0) {
          // Saat user sudah punya seleksi sebelumnya, item baru tetap dipilih untuk kemudahan.
          next.add(c.productId);
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  if (!session || session.role === "admin") {
    return (
      <MobileShell>
        <Header />
        <EmptyState
          emoji="🔒"
          title="Masuk dulu"
          desc="Silakan masuk untuk melihat keranjang"
          cta="Masuk"
          onClick={() => navigate({ to: "/masuk", search: { redirect: "/keranjang" } })}
        />
      </MobileShell>
    );
  }

  const items = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.productId);
      return p ? { ...c, product: p, effectivePrice: c.priceOverride ?? p.price } : null;
    })
    .filter(Boolean) as {
      productId: string;
      qty: number;
      priceOverride?: number;
      product: typeof products[number];
      effectivePrice: number;
    }[];

  const selectedItems = items.filter((it) => selected.has(it.productId));
  const subtotal = selectedItems.reduce((s, it) => s + it.effectivePrice * it.qty, 0);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const toggleItem = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((it) => it.productId)));
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Pilih dulu produk yang akan dibeli");
      return;
    }
    try {
      sessionStorage.setItem(
        SELECTION_KEY,
        JSON.stringify(selectedItems.map((it) => it.productId)),
      );
    } catch {
      // ignore
    }
    navigate({ to: "/checkout" });
  };

  const updateQty = (productId: string, delta: number) => {
    const next = cart.map((c) =>
      c.productId === productId
        ? { ...c, qty: Math.max(MIN_ORDER_QTY, c.qty + delta) }
        : c,
    );
    setCart(session.id, next);
  };

  const removeItem = (productId: string) => {
    setCart(session.id, cart.filter((c) => c.productId !== productId));
  };

  return (
    <MobileShell>
      <Header />
      {items.length === 0 ? (
        <EmptyState
          emoji="🛒"
          title="Keranjang kosong"
          desc="Yuk belanja sayur dan buah segar!"
          cta="Mulai Belanja"
          onClick={() => navigate({ to: "/" })}
        />
      ) : (
        <>
          <div className="flex items-center justify-between bg-card px-4 py-2 shadow-card">
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm font-bold text-primary"
            >
              {allSelected ? (
                <CheckSquare className="h-5 w-5" />
              ) : (
                <Square className="h-5 w-5" />
              )}
              Pilih Semua
            </button>
            <span className="text-xs text-muted-foreground">
              {selectedItems.length} dari {items.length} dipilih
            </span>
          </div>

          <div className="space-y-2 p-3">
            {items.map((it) => (
              <div key={it.productId} className="flex gap-2 rounded-2xl bg-card p-3 shadow-card">
                <button
                  type="button"
                  onClick={() => toggleItem(it.productId)}
                  aria-label={selected.has(it.productId) ? "Batal pilih" : "Pilih"}
                  className="flex h-7 w-7 shrink-0 items-center justify-center self-start"
                >
                  {selected.has(it.productId) ? (
                    <CheckSquare className="h-6 w-6 text-primary" />
                  ) : (
                    <Square className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <ProductImage src={it.product.image} alt={it.product.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-base font-semibold leading-tight">{it.product.name}</p>
                  <p className="mt-1 text-lg font-extrabold text-primary">{rupiah(it.effectivePrice * it.qty)}</p>
                  {it.priceOverride !== undefined && it.priceOverride !== it.product.price && (
                    <p className="text-[11px] font-bold text-success">
                      🤝 Harga hasil tawar: {rupiah(it.priceOverride)}/{it.product.unit}
                      <span className="ml-1 text-muted-foreground line-through font-normal">
                        {rupiah(it.product.price)}
                      </span>
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={() => removeItem(it.productId)}
                      aria-label="Hapus"
                      className="rounded-lg p-2 text-danger active:bg-danger/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(it.productId, -1)}
                        aria-label="Kurangi"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border text-primary"
                        disabled={it.qty <= MIN_ORDER_QTY}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-lg font-bold">{it.qty}</span>
                      <button
                        onClick={() => updateQty(it.productId, 1)}
                        aria-label="Tambah"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border text-primary"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-primary">
                    Min. {MIN_ORDER_QTY} {it.product.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky checkout */}
          <div
            className="fixed bottom-16 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-card p-3 shadow-card"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total ({selectedItems.length} dipilih)
                </p>
                <p className="text-2xl font-extrabold text-primary">{rupiah(subtotal)}</p>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="h-14 rounded-xl bg-primary px-6 text-base font-bold text-primary-foreground disabled:opacity-50"
              >
                Bayar ({selectedItems.length})
              </button>
            </div>
          </div>
        </>
      )}
    </MobileShell>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
      <Link to="/" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <h1 className="text-xl font-bold">Keranjang</h1>
    </header>
  );
}

function EmptyState({ emoji, title, desc, cta, onClick }: { emoji: string; title: string; desc: string; cta: string; onClick: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <p className="text-6xl">{emoji}</p>
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-1 text-muted-foreground">{desc}</p>
      <button onClick={onClick} className="mt-6 h-13 rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground">
        {cta}
      </button>
    </div>
  );
}
