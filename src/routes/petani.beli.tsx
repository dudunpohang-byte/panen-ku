import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShoppingCart, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ProductCard } from "@/components/ProductCard";
import { getVisibleProducts, addToCart, getCart } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { CATEGORIES } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/petani/beli")({
  component: PetaniBeli,
});

function PetaniBeli() {
  const session = useSession();
  const products = useStoreSubscription(() => getVisibleProducts());
  const cart = useStoreSubscription(() => (session ? getCart(session.id) : []));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = products.filter(p => {
    if (category && p.category !== category) return false;
    if (search) return p.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  if (!session) return null;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleAdd = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    addToCart(session.id, productId, 1);
    toast.success(`${prod.name} ditambahkan ke keranjang`);
  };

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 bg-primary px-3 pt-3 pb-3 text-primary-foreground">
        <div className="mb-2 flex items-center justify-between">
          <Link to="/petani" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-bold">Beli dari Petani Lain</h1>
          <Link to="/keranjang" className="relative rounded-full p-2 hover:bg-white/15">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="h-11 w-full rounded-xl bg-white pl-10 pr-4 text-sm text-foreground outline-none"
            />
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="h-11 rounded-xl bg-white px-3 text-sm text-foreground outline-none"
          >
            <option value="">Semua</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="p-3">
        {filtered.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-5xl">🛒</p>
            <p className="mt-3 font-semibold">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </MobileShell>
  );
}