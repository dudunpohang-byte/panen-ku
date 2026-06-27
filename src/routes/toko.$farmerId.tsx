import { createFileRoute, Link, useRouter, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, BadgeCheck, ShieldCheck, Package, Star, MessageCircle } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ProductCard } from "@/components/ProductCard";
import { rupiah } from "@/lib/format";
import { getUsers, getVisibleProducts, createChatRoom } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { toast } from "sonner";

export const Route = createFileRoute("/toko/$farmerId")({
  component: TokoPetani,
  head: () => ({
    meta: [
      { title: "Toko Petani — Panenku" },
      { name: "description", content: "Lihat profil & semua produk segar langsung dari toko petani." },
    ],
  }),
});

function TokoPetani() {
  const { farmerId } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const session = useSession();
  const users = useStoreSubscription(() => getUsers());
  const products = useStoreSubscription(() => getVisibleProducts());
  const [showCert, setShowCert] = useState(false);

  const farmer = users.find((u) => u.id === farmerId && u.role === "farmer");
  const myProducts = products.filter((p) => p.farmerId === farmerId);

  if (!farmer) {
    return (
      <MobileShell hideNav>
        <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
          <button onClick={() => router.history.back()} aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Toko Petani</h1>
        </header>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl">🥲</p>
          <h2 className="mt-3 text-xl font-bold">Toko tidak ditemukan</h2>
          <Link to="/" className="mt-5 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">
            Ke Beranda
          </Link>
        </div>
      </MobileShell>
    );
  }

  const totalSold = myProducts.reduce((s, p) => s + p.sold, 0);
  const avgRating =
    myProducts.length > 0
      ? myProducts.reduce((s, p) => s + p.rating, 0) / myProducts.length
      : 0;
  const minPrice = myProducts.length > 0 ? Math.min(...myProducts.map((p) => p.price)) : 0;
  const certs = farmer.certifications ?? [];

  const handleChat = () => {
    if (!session || session.role === "admin") {
      toast.error("Masuk dulu untuk mengirim pesan");
      navigate({ to: "/masuk", search: { redirect: `/toko/${farmerId}` } });
      return;
    }
    if (session.id === farmer.id) {
      toast.info("Ini toko Anda sendiri");
      return;
    }
    const room = createChatRoom(session.id, farmer.id);
    navigate({ to: `/chat/${room.id}` });
  };

  return (
    <MobileShell hideNav>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
        <button
          onClick={() => router.history.back()}
          aria-label="Kembali"
          className="rounded-full p-2 hover:bg-white/15"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="truncate text-xl font-bold">Toko Petani</h1>
      </header>

      {/* Banner toko */}
      <div className="gradient-primary p-5 text-primary-foreground">
        <div className="flex items-start gap-3">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 text-4xl">
            👨‍🌾
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-lg font-extrabold">
                {farmer.farmName ?? farmer.name}
              </p>
              {farmer.status === "approved" && (
                <BadgeCheck className="h-5 w-5 shrink-0" aria-label="Terverifikasi" />
              )}
            </div>
            <p className="text-sm opacity-90">{farmer.name}</p>
            {farmer.farmEstablished && (
              <p className="mt-0.5 text-xs opacity-80">
                Berdiri sejak {farmer.farmEstablished}
              </p>
            )}
            <p className="mt-1 flex items-start gap-1 text-xs opacity-90">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-2">{farmer.farmLocation}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stat ringkas */}
      <div className="grid grid-cols-3 gap-px bg-border">
        <StatCell label="Produk" value={String(myProducts.length)} />
        <StatCell label="Terjual" value={String(totalSold)} />
        <StatCell
          label="Rating"
          value={
            <span className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 fill-promo text-promo" />
              {avgRating ? avgRating.toFixed(1) : "-"}
            </span>
          }
        />
      </div>

      {/* Aksi */}
      <div className="bg-card p-3">
        <button
          onClick={handleChat}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground"
        >
          <MessageCircle className="h-5 w-5" /> Hubungi Petani
        </button>
      </div>

      {/* Deskripsi */}
      {farmer.farmDescription && (
        <section className="mt-2 bg-card p-4">
          <h2 className="text-base font-bold">Tentang Toko</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
            {farmer.farmDescription}
          </p>
        </section>
      )}

      {/* Sertifikat */}
      {(certs.length > 0 || farmer.certificateImage) && (
        <section className="mt-2 bg-card p-4">
          <h2 className="text-base font-bold">Sertifikat & Standar Mutu</h2>
          {certs.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {certs.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> {c}
                </span>
              ))}
            </div>
          )}
          {farmer.certificateImage && (
            <button
              type="button"
              onClick={() => setShowCert(true)}
              className="mt-3 block w-full overflow-hidden rounded-xl border-2 border-border bg-muted"
              aria-label="Lihat foto sertifikat"
            >
              <img
                src={farmer.certificateImage}
                alt="Foto sertifikat kebun"
                className="h-44 w-full object-cover"
              />
            </button>
          )}
          {farmer.certificateImage && (
            <p className="mt-1 text-xs text-muted-foreground">Ketuk foto untuk memperbesar.</p>
          )}
        </section>
      )}

      {/* Alamat & cara kirim */}
      <section className="mt-2 bg-card p-4">
        <h2 className="text-base font-bold">Lokasi & Pengiriman</h2>
        {farmer.fullAddress && (
          <div className="mt-2 rounded-lg bg-muted p-3 text-sm">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="font-semibold">Alamat Kebun:</span>
                <br />
                {farmer.fullAddress}
              </span>
            </p>
          </div>
        )}
        {farmer.shippingPackagingMethod && (
          <div className="mt-2 rounded-lg border-2 border-primary/20 bg-primary-soft p-3">
            <p className="flex items-center gap-2 text-sm font-bold text-primary">
              <Package className="h-4 w-4" /> Cara Pengemasan & Pengiriman
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">
              {farmer.shippingPackagingMethod}
            </p>
          </div>
        )}
      </section>

      {/* Produk toko */}
      <section className="mt-2 bg-card p-4 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">
            Semua Produk ({myProducts.length})
          </h2>
          {minPrice > 0 && (
            <p className="text-xs text-muted-foreground">
              Mulai <span className="font-bold text-primary">{rupiah(minPrice)}</span>
            </p>
          )}
        </div>
        {myProducts.length === 0 ? (
          <div className="mt-6 rounded-xl bg-muted p-6 text-center">
            <p className="text-5xl">📦</p>
            <p className="mt-2 text-sm font-semibold">Belum ada produk di toko ini</p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {myProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Lightbox sertifikat */}
      {showCert && farmer.certificateImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowCert(false)}
          role="dialog"
          aria-label="Sertifikat"
        >
          <img
            src={farmer.certificateImage}
            alt="Sertifikat kebun"
            className="max-h-full max-w-full rounded-xl object-contain"
          />
          <button
            type="button"
            onClick={() => setShowCert(false)}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-bold"
          >
            Tutup
          </button>
        </div>
      )}
    </MobileShell>
  );
}

function StatCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-card p-3 text-center">
      <p className="text-base font-extrabold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
