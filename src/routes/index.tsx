import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { CATEGORIES, rupiah } from "@/lib/format";
import { getVisibleProducts, seedIfEmpty } from "@/lib/store";
import { useStoreSubscription } from "@/hooks/use-store";
import { NotificationBell } from "@/components/NotificationBell";
import bannerPanen from "@/assets/banner-panen.jpg";
import bannerOngkir from "@/assets/banner-ongkir.jpg";
import logo from "@/assets/logo-panenku.png";

export const Route = createFileRoute("/")({
  component: Beranda,
});

function Beranda() {
  const navigate = useNavigate();
  useEffect(() => {
    seedIfEmpty();
  }, []);

  const products = useStoreSubscription(() => getVisibleProducts());
  const [bannerIdx, setBannerIdx] = useState(0);
  const banners = [
    { img: bannerPanen, title: "Panen Hari Ini", sub: "Sayur & buah segar baru dipetik" },
    { img: bannerOngkir, title: "Gratis Ongkir", sub: "Belanja minimal Rp 50.000" },
  ];

  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const terlaris = [...products].sort((a, b) => b.sold - a.sold).slice(0, 6);
  const minggu = [...products].slice(0, 8);

  return (
    <MobileShell>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary px-3 pt-3 pb-3 text-primary-foreground">
        <div className="mb-2 flex items-center justify-between">
          <span className="logo-anim overflow-hidden">
            <img src={logo} alt="Panenku" className="h-9 w-auto brightness-0 invert" width={120} height={36} />
          </span>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link to="/keranjang" aria-label="Keranjang" className="rounded-full p-2 hover:bg-white/15">
              <ShoppingCart className="h-6 w-6" />
            </Link>
          </div>
        </div>
        <button
          onClick={() => navigate({ to: "/cari" })}
          className="flex h-12 w-full items-center gap-2 rounded-xl bg-white px-4 text-left text-[15px] text-muted-foreground shadow-soft"
        >
          <Search className="h-5 w-5 text-primary" />
          <span>Cari sayur, buah, beras…</span>
        </button>
      </header>

      {/* Banner */}
      <section className="px-3 pt-3">
        <button
          onClick={() => setBannerIdx((i) => (i + 1) % banners.length)}
          className="relative block w-full overflow-hidden rounded-2xl shadow-card gradient-primary"
        >
          <div className="flex aspect-[2/1] items-center">
            <div className="z-10 flex-1 px-4 text-left text-white">
              <p className="text-xl font-extrabold leading-tight">{banners[bannerIdx].title}</p>
              <p className="mt-1 text-sm opacity-90">{banners[bannerIdx].sub}</p>
            </div>
            <div className="absolute inset-y-0 right-0 w-3/5">
              <img src={banners[bannerIdx].img} alt="" className="h-full w-full object-cover opacity-90" width={600} height={300} />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent" />
            </div>
          </div>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </button>
      </section>

      {/* Kategori */}
      <section className="mt-4 px-3">
        <div className="rounded-2xl bg-card p-3 shadow-card">
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to="/cari"
                search={{ kategori: c.id, q: "" }}
                className="flex flex-col items-center gap-1.5 rounded-xl py-2 active:bg-primary-soft"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
                  {c.emoji}
                </div>
                <span className="text-[13px] font-semibold">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Petani */}
      <section className="mt-4 px-3">
        <Link
          to="/bandingkan"
          search={{ q: "", komoditas: "" }}
          className="mb-3 flex items-center gap-3 rounded-2xl bg-primary-soft p-3 shadow-card active:opacity-80"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl text-primary-foreground">
            ⚖️
          </div>
          <div className="flex-1">
            <p className="font-extrabold">Bandingkan Harga</p>
            <p className="text-xs text-muted-foreground">
              Cari harga termurah dari beberapa petani
            </p>
          </div>
          <span className="text-primary">→</span>
        </Link>
        <div className="rounded-2xl gradient-promo p-4 text-white shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-extrabold">Jadi Petani Penjual</p>
              <p className="mt-0.5 text-sm opacity-90">Jual hasil panen lebih untung</p>
            </div>
            <Link
              to="/petani"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-promo shadow"
            >
              Mulai
            </Link>
          </div>
        </div>
      </section>

      {/* Produk Terlaris */}
      <section className="mt-5 px-3">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-xl font-extrabold">🔥 Terlaris</h2>
          <Link to="/cari" className="text-sm font-semibold text-primary">Lihat semua</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {terlaris.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Panen Minggu Ini — horizontal */}
      <section className="mt-5">
        <div className="mb-2 flex items-end justify-between px-3">
          <h2 className="text-xl font-extrabold">🌾 Panen Minggu Ini</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto px-3 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {minggu.map((p) => (
            <Link
              key={p.id}
              to="/produk/$id"
              params={{ id: p.id }}
              className="w-36 shrink-0 overflow-hidden rounded-xl bg-card shadow-card"
            >
              <div className="aspect-square">
                <ProductImage src={p.image} alt={p.name} />
              </div>
              <div className="p-2">
                <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
                <p className="text-base font-extrabold text-primary">{rupiah(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Petani Terdekat */}
      <section className="mt-5 px-3 pb-4">
        <h2 className="mb-2 text-xl font-extrabold">📍 Petani Terdekat</h2>
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-2xl">
              👨‍🌾
            </div>
            <div className="flex-1">
              <p className="text-base font-bold">Pak Budi</p>
              <p className="text-sm text-muted-foreground">Kebun Sumber Rejeki · Magelang</p>
              <p className="mt-1 text-sm">⭐ 4.9 · {products.length} produk</p>
            </div>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}
