import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search, X } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/format";
import { getVisibleProducts } from "@/lib/store";
import { useStoreSubscription } from "@/hooks/use-store";

type SearchParams = { q?: string; kategori?: string };

export const Route = createFileRoute("/cari")({
  validateSearch: (search): SearchParams => ({
    q: typeof search.q === "string" ? search.q : "",
    kategori: typeof search.kategori === "string" ? search.kategori : "",
  }),
  component: Cari,
});

function Cari() {
  const sp = Route.useSearch();
  const [q, setQ] = useState(sp.q ?? "");
  const [kategori, setKategori] = useState(sp.kategori ?? "");
  const products = useStoreSubscription(() => getVisibleProducts());

  const filtered = products.filter((p) => {
    const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
    const matchK = !kategori || p.category === kategori;
    return matchQ && matchK;
  });

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
        <Link to="/" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari produk…"
            className="h-12 w-full rounded-xl bg-white pl-10 pr-10 text-base text-foreground outline-none"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Hapus"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      <section className="border-b border-border bg-card px-3 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setKategori("")}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              !kategori ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            Semua
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setKategori(c.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                kategori === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </section>

      <section className="p-3">
        {filtered.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-5xl">🔍</p>
            <p className="mt-3 text-base font-semibold">Produk tidak ditemukan</p>
            <p className="mt-1 text-sm text-muted-foreground">Coba kata lain atau ganti kategori</p>
          </div>
        ) : (
          <>
            <p className="mb-2 text-sm text-muted-foreground">{filtered.length} produk ditemukan</p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </section>
    </MobileShell>
  );
}
