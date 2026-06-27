import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  MessageCircle,
  ShoppingCart,
  MapPin,
  Calendar,
  Star,
  Minus,
  Plus,
  ShieldCheck,
  Leaf,
  Package,
  Clock,
  Store,
  BadgeCheck,
} from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ProductImage } from "@/components/ProductImage";
import { rupiah, tanggalID } from "@/lib/format";
import { addToCart, getUsers, getVisibleProducts, createChatRoom, MIN_ORDER_QTY } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { toast } from "sonner";

export const Route = createFileRoute("/produk/$id")({
  component: DetailProduk,
  notFoundComponent: () => (
    <MobileShell>
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="text-6xl">🥲</p>
        <h2 className="mt-3 text-xl font-bold">Produk tidak ditemukan</h2>
        <Link to="/" className="mt-5 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">Ke Beranda</Link>
      </div>
    </MobileShell>
  ),
});

function DetailProduk() {
  const { id } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const session = useSession();
  const products = useStoreSubscription(() => getVisibleProducts());
  const farmers = useStoreSubscription(() => getUsers());
  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(MIN_ORDER_QTY);
  const [showCert, setShowCert] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showPhotoLightbox, setShowPhotoLightbox] = useState(false);

  if (!product) {
    return (
      <MobileShell>
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl">🥲</p>
          <h2 className="mt-3 text-xl font-bold">Produk tidak ditemukan</h2>
          <Link to="/" className="mt-5 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">Ke Beranda</Link>
        </div>
      </MobileShell>
    );
  }

  const farmer = farmers.find((u) => u.id === product.farmerId);

  // Galeri foto: image utama + images tambahan, dedup & valid.
  const gallery = [product.image, ...(product.images ?? [])].filter(
    (s, i, arr): s is string => !!s && arr.indexOf(s) === i,
  );
  const safeActive = Math.min(activePhoto, Math.max(0, gallery.length - 1));

  const requireLogin = () => {
    if (!session || session.role === "admin") {
      toast.error("Masuk dulu untuk memesan", { description: "Silakan masuk sebagai pembeli atau petani" });
      navigate({ to: "/masuk", search: { redirect: `/produk/${id}` } });
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!requireLogin() || !session) return;
    if (qty < MIN_ORDER_QTY) {
      toast.error(`Minimal pembelian ${MIN_ORDER_QTY} ${product.unit}`);
      return;
    }
    addToCart(session.id, product.id, qty);
    toast.success(`${qty} ${product.unit} ditambahkan ke keranjang`);
  };

  const handleBuyNow = () => {
    if (!requireLogin() || !session) return;
    if (qty < MIN_ORDER_QTY) {
      toast.error(`Minimal pembelian ${MIN_ORDER_QTY} ${product.unit}`);
      return;
    }
    addToCart(session.id, product.id, qty);
    navigate({ to: "/keranjang" });
  };

  // Estimasi tanggal best-before
  const bestBeforeDate =
    product.harvestDate && product.bestBeforeDays
      ? new Date(new Date(product.harvestDate).getTime() + product.bestBeforeDays * 86400_000)
          .toISOString()
          .slice(0, 10)
      : null;

  const productCerts = product.certifications ?? [];
  const farmerCerts = farmer?.certifications ?? [];

  const isPreOrder = !!product.preOrder;
  const harvestPlanned = product.harvestPlannedDate;

  return (
    <MobileShell hideNav>
      <div className="relative">
        {/* Header overlay */}
        <header className="absolute top-0 right-0 left-0 z-30 flex items-center justify-between p-3">
          <button
            onClick={() => router.history.back()}
            aria-label="Kembali"
            className="rounded-full bg-white/90 p-2.5 shadow"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <Link to="/keranjang" aria-label="Keranjang" className="rounded-full bg-white/90 p-2.5 shadow">
            <ShoppingCart className="h-6 w-6" />
          </Link>
        </header>

        {/* Image gallery */}
        <button
          type="button"
          onClick={() => gallery.length > 0 && setShowPhotoLightbox(true)}
          className="block aspect-square w-full bg-primary-soft"
          aria-label="Perbesar foto"
        >
          <ProductImage src={gallery[safeActive] ?? product.image} alt={product.name} />
        </button>
        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto bg-card px-3 py-2">
            {gallery.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActivePhoto(i)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === safeActive ? "border-primary" : "border-border"
                }`}
                aria-label={`Foto ${i + 1}`}
              >
                <ProductImage src={src} alt={`${product.name} ${i + 1}`} />
              </button>
            ))}
          </div>
        )}

        {/* Info utama */}
        <div className="bg-card p-4">
          <p className="text-3xl font-extrabold text-primary">
            {rupiah(product.price)}
            <span className="text-base font-medium text-muted-foreground"> /{product.unit}</span>
          </p>
          <h1 className="mt-2 text-xl font-bold leading-tight">{product.name}</h1>
          {isPreOrder && (
            <div className="mt-3 rounded-xl border-2 border-primary bg-primary-soft p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                🌱 Produk Pre-Order
              </p>
              <p className="mt-1 text-xs text-foreground">
                Belum dipanen. Pesanan Anda akan dipanen segar dan dikirim setelah{" "}
                <span className="font-bold">
                  {harvestPlanned ? tanggalID(harvestPlanned) : "tanggal panen"}
                </span>
                .
              </p>
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-promo text-promo" />
              <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
            </span>
            <span>· Terjual {product.sold}</span>
            <span>· Stok {product.stock}</span>
          </div>

          {/* Sertifikat produk */}
          {productCerts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {productCerts.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Spesifikasi singkat */}
        <div className="mt-2 grid grid-cols-2 gap-px bg-border">
          {product.weightPerUnit && (
            <SpecCell icon={<Package className="h-4 w-4" />} label="Berat" value={product.weightPerUnit} />
          )}
          {product.cultivationMethod && (
            <SpecCell icon={<Leaf className="h-4 w-4" />} label="Metode Tanam" value={product.cultivationMethod} />
          )}
          {product.origin && (
            <SpecCell icon={<MapPin className="h-4 w-4" />} label="Asal" value={product.origin} />
          )}
          {product.packaging && (
            <SpecCell icon={<Package className="h-4 w-4" />} label="Kemasan" value={product.packaging} />
          )}
        </div>

        {/* Jadwal panen & best-before */}
        {(product.harvestDate || bestBeforeDate) && (
          <div className="mt-2 bg-card p-4">
            <h2 className="text-lg font-bold">Kesegaran</h2>
            {product.harvestDate && (
              <p className="mt-2 flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-primary" />
                Dipanen <span className="font-semibold">{tanggalID(product.harvestDate)}</span>
              </p>
            )}
            {bestBeforeDate && (
              <p className="mt-1 flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-primary" />
                Baik dikonsumsi sebelum{" "}
                <span className="font-semibold">{tanggalID(bestBeforeDate)}</span>
              </p>
            )}
            {product.storageInfo && (
              <p className="mt-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                💡 {product.storageInfo}
              </p>
            )}
            <p className="mt-2 text-sm font-semibold text-primary">🚜 Diantar langsung oleh petani</p>
          </div>
        )}

        {/* Deskripsi */}
        <div className="mt-2 bg-card p-4">
          <h2 className="text-lg font-bold">Deskripsi Produk</h2>
          <p className="mt-2 whitespace-pre-line text-base leading-relaxed">{product.description}</p>
        </div>

        {/* Toko / Petani */}
        <div className="mt-2 bg-card p-4">
          <h2 className="text-lg font-bold">Toko Petani</h2>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-3xl">
              👨‍🌾
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-base font-bold">{farmer?.farmName ?? product.farmerName}</p>
                {farmer?.status === "approved" && (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Petani terverifikasi" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{product.farmerName}</p>
              {farmer?.farmEstablished && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Berdiri sejak {farmer.farmEstablished}
                </p>
              )}
            </div>
            <Link
              to="/toko/$farmerId"
              params={{ farmerId: product.farmerId }}
              className="self-start rounded-full border-2 border-primary px-3 py-1.5 text-xs font-bold text-primary"
            >
              <Store className="mr-1 inline h-3.5 w-3.5" /> Toko
            </Link>
          </div>

          {farmer?.farmDescription && (
            <p className="mt-3 text-sm leading-relaxed text-foreground">{farmer.farmDescription}</p>
          )}

          {/* Sertifikat petani */}
          {farmerCerts.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sertifikat Kebun
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {farmerCerts.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-semibold text-primary"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Alamat lengkap */}
          <div className="mt-3 rounded-lg bg-muted p-3">
            <p className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="font-semibold">Alamat Kebun:</span>
                <br />
                {farmer?.fullAddress ?? product.farmLocation}
              </span>
            </p>
          </div>

          {/* Cara kirim & kemasan dari petani */}
          {farmer?.shippingPackagingMethod && (
            <div className="mt-3 rounded-lg border-2 border-primary/20 bg-primary-soft p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                <Package className="h-4 w-4" /> Cara Pengemasan & Pengiriman
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-foreground">
                {farmer.shippingPackagingMethod}
              </p>
            </div>
          )}

          {/* Foto sertifikat */}
          {farmer?.certificateImage && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Foto Sertifikat
              </p>
              <button
                type="button"
                onClick={() => setShowCert(true)}
                className="block w-full overflow-hidden rounded-xl border-2 border-border bg-muted"
                aria-label="Lihat sertifikat ukuran penuh"
              >
                <img
                  src={farmer.certificateImage}
                  alt="Sertifikat kebun"
                  className="h-40 w-full object-cover"
                />
              </button>
              <p className="mt-1 text-xs text-muted-foreground">Ketuk foto untuk memperbesar.</p>
            </div>
          )}
        </div>

        {/* Qty selector */}
        <div className="mt-2 bg-card p-4 pb-32">
          <h2 className="text-lg font-bold">Jumlah</h2>
          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={() => setQty((q) => Math.max(MIN_ORDER_QTY, q - 1))}
              aria-label="Kurangi"
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border text-primary disabled:opacity-40"
              disabled={qty <= MIN_ORDER_QTY}
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="min-w-[60px] text-center text-2xl font-extrabold">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              aria-label="Tambah"
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border text-primary disabled:opacity-40"
              disabled={qty >= product.stock}
            >
              <Plus className="h-5 w-5" />
            </button>
            <span className="text-sm text-muted-foreground">{product.unit}</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-primary">
            ⚠️ Minimal pembelian {MIN_ORDER_QTY} {product.unit} per produk
          </p>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card p-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!requireLogin() || !session) return;
              const room = createChatRoom(session.id, product.farmerId, product.id, product.name);
              navigate({ to: `/chat/${room.id}` });
            }}
            className="flex h-14 w-16 flex-col items-center justify-center rounded-xl border-2 border-border text-primary"
            aria-label="Chat"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-[11px] font-semibold">Chat</span>
          </button>
          <button
            onClick={handleAddToCart}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary text-base font-bold text-primary"
          >
            <ShoppingCart className="h-5 w-5" /> Keranjang
          </button>
          <button
            onClick={handleBuyNow}
            className="h-14 flex-1 rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-soft"
          >
            {isPreOrder ? "Pesan Pre-Order" : "Beli Sekarang"}
          </button>
        </div>
      </div>

      {/* Lightbox sertifikat */}
      {showCert && farmer?.certificateImage && (
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

      {/* Lightbox foto produk */}
      {showPhotoLightbox && gallery.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4"
          onClick={() => setShowPhotoLightbox(false)}
          role="dialog"
          aria-label="Foto produk"
        >
          <div className="max-h-[80vh] max-w-full">
            <ProductImage src={gallery[safeActive]} alt={product.name} />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  className={`h-2.5 w-2.5 rounded-full ${i === safeActive ? "bg-white" : "bg-white/40"}`}
                  aria-label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowPhotoLightbox(false)}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-bold"
          >
            Tutup
          </button>
        </div>
      )}
    </MobileShell>
  );
}

function SpecCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-snug">{value}</p>
    </div>
  );
}
