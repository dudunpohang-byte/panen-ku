import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search, TrendingDown, MapPin, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ProductImage } from "@/components/ProductImage";
import { rupiah } from "@/lib/format";
import { getVisibleProducts, type Product } from "@/lib/store";
import { useStoreSubscription } from "@/hooks/use-store";

type SearchParams = { q?: string; komoditas?: string };

export const Route = createFileRoute("/bandingkan")({
  validateSearch: (s): SearchParams => ({
    q: typeof s.q === "string" ? s.q : "",
    komoditas: typeof s.komoditas === "string" ? s.komoditas : "",
  }),
  component: Bandingkan,
});

function normalize(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

function Bandingkan() {
  const sp = Route.useSearch();
  const [q, setQ] = useState(sp.q ?? "");
  const products = useStoreSubscription(() => getVisibleProducts());

  // Group by commodity (normalized product name)
  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const key = normalize(p.name);
      const list = map.get(key) ?? [];
      list.push(p);
      map.set(key, list);
    }
    return Array.from(map.entries())
      .map(([key, items]) => ({
        key,
        name: items[0].name,
        items: items.sort((a, b) => a.price - b.price),
      }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [products]);

  const selected = sp.komoditas
    ? groups.find((g) => g.key === sp.komoditas)
    : undefined;

  const filtered = groups.filter(
    (g) => !q || g.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
        <Link
          to={selected ? "/bandingkan" : "/"}
          search={selected ? { q: "", komoditas: "" } : undefined}
          aria-label="Kembali"
          className="rounded-full p-2 hover:bg-white/15"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-bold">
          {selected ? `Bandingkan: ${selected.name}` : "Bandingkan Harga"}
        </h1>
      </header>

      {!selected && (
        <>
          <div className="bg-primary px-3 pb-4 text-primary-foreground">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari komoditas (cabai, tomat, beras...)"
                className="h-12 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-base text-foreground outline-none"
              />
            </div>
            <p className="mt-2 text-xs opacity-90">
              💡 Pilih komoditas untuk lihat harga dari berbagai petani.
            </p>
          </div>

          <section className="space-y-2 p-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
                Belum ada komoditas yang cocok.
              </div>
            ) : (
              filtered.map((g) => {
                const min = g.items[0].price;
                const max = g.items[g.items.length - 1].price;
                return (
                  <Link
                    key={g.key}
                    to="/bandingkan"
                    search={{ q: "", komoditas: g.key }}
                    className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card active:bg-primary-soft"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                      <ProductImage src={g.items[0].image} alt={g.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-1 font-bold">{g.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {g.items.length} petani · /{g.items[0].unit}
                      </p>
                      <p className="text-sm font-extrabold text-primary">
                        {min === max ? rupiah(min) : `${rupiah(min)} – ${rupiah(max)}`}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                      Bandingkan
                    </span>
                  </Link>
                );
              })
            )}
          </section>
        </>
      )}

      {selected && (
        <section className="space-y-3 p-3">
          <div className="rounded-2xl bg-success/10 p-3 text-sm">
            <p className="flex items-center gap-2 font-bold text-success">
              <TrendingDown className="h-4 w-4" /> Termurah hari ini
            </p>
            <p className="mt-1">
              <b>{rupiah(selected.items[0].price)}</b> /{selected.items[0].unit} —{" "}
              {selected.items[0].farmerName}
            </p>
          </div>

          {selected.items.map((p, idx) => {
            const isCheapest = idx === 0;
            return (
              <div
                key={p.id}
                className={`rounded-2xl bg-card p-3 shadow-card ${isCheapest ? "border-2 border-success" : ""}`}
              >
                <div className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <ProductImage src={p.image} alt={p.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 font-bold">{p.farmerName}</p>
                      {isCheapest && (
                        <span className="shrink-0 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-white">
                          TERMURAH
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {p.farmLocation}
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-primary">
                      {rupiah(p.price)}
                      <span className="text-sm font-semibold text-muted-foreground">
                        {" "}/{p.unit}
                      </span>
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-promo text-promo" />
                        {p.rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        · Stok {p.stock} {p.unit}
                      </span>
                      {p.preOrder && (
                        <span className="rounded-full bg-promo/20 px-2 py-0.5 text-[10px] font-bold text-promo">
                          PRE-ORDER
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  to="/produk/$id"
                  params={{ id: p.id }}
                  className="mt-2 flex h-10 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground"
                >
                  Lihat & Pesan
                </Link>
              </div>
            );
          })}
        </section>
      )}
    </MobileShell>
  );
}
