import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Truck, MapPin, Wallet, Volume2, VolumeX, MapPinned, Banknote, QrCode, Building2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ProductImage } from "@/components/ProductImage";
import { rupiah, rupiahSpoken, tanggalID, unitSpoken } from "@/lib/format";
import {
  CITIES,
  calculateShippingOptions,
  clearCart,
  createOrder,
  getAdminSettings,
  getCart,
  getProducts,
  setCart,
  type ShippingMethod,
} from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { usePrefs } from "@/hooks/use-prefs";
import { useVoiceOver } from "@/hooks/use-voice-over";
import { toast } from "sonner";
import { generateQrisString, saveQrisPayment } from "@/lib/payments";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

const SELECTION_KEY = "panenku.cart.selection";

type PaymentMethod = "qris" | "transfer" | "cod";

function Checkout() {
  const session = useSession();
  const navigate = useNavigate();
  const products = useStoreSubscription(() => getProducts());
  const cart = useStoreSubscription(() => (session ? getCart(session.id) : []));
  const settings = useStoreSubscription(() => getAdminSettings());
  const [prefs] = usePrefs();
  const { supported: ttsSupported, speaking, speak, stop } = useVoiceOver();

  const [address, setAddress] = useState("");
  const [buyerCityId, setBuyerCityId] = useState<string>("jakarta");
  const [shipping, setShipping] = useState<ShippingMethod>("antar_sendiri");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qris");
  const [confirmedByVoice, setConfirmedByVoice] = useState(false);
  const [selectedIds] = useState<Set<string> | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(SELECTION_KEY);
      if (!raw) return null;
      const arr = JSON.parse(raw) as string[];
      return Array.isArray(arr) && arr.length ? new Set(arr) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!session || session.role === "admin") {
      navigate({ to: "/masuk", search: { redirect: "/checkout" } });
    }
  }, [session, navigate]);

  const items = useMemo(
    () =>
      cart
        .filter((c) => (selectedIds ? selectedIds.has(c.productId) : true))
        .map((c) => {
          const p = products.find((x) => x.id === c.productId);
          return p
            ? { product: p, qty: c.qty, price: c.priceOverride ?? p.price, negotiated: c.priceOverride !== undefined }
            : null;
        })
        .filter(Boolean) as {
          product: typeof products[number];
          qty: number;
          price: number;
          negotiated: boolean;
        }[],
    [cart, products, selectedIds],
  );

  const farmerCityId = items[0]?.product.farmCityId;
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const quotes = calculateShippingOptions(buyerCityId, farmerCityId, subtotal);
  const selectedQuote = quotes.find((q) => q.method === shipping) ?? quotes[0];
  const adminFee = Math.round((subtotal * settings.adminFeePercent) / 100);
  const total = subtotal + (selectedQuote?.fee ?? 0) + adminFee;

  if (!session || session.role === "admin") return null;

  if (items.length === 0) {
    return (
      <MobileShell hideNav>
        <Header />
        <div className="p-8 text-center">
          <p className="text-5xl">🛒</p>
          <p className="mt-3">Keranjang kosong</p>
          <Link to="/" className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">Belanja</Link>
        </div>
      </MobileShell>
    );
  }

  const buildSummaryText = () => {
    const ship = selectedQuote;
    const paymentLabel = paymentMethod === "qris" ? "QRIS" : paymentMethod === "transfer" ? "Transfer Bank" : "Bayar di tempat atau COD";
    
    // Detail setiap barang: "5 kilogram Tomat Merah Segar, harga satuan dua belas ribu rupiah, total enam puluh ribu rupiah"
    const itemDetails = items.map((it) => {
      const qtySpoken = rupiahSpoken(it.qty * 1000).replace("ribu rupiah", "").replace("rupiah", "").trim() || it.qty.toString();
      const qtyText = `${it.qty} ${unitSpoken(it.product.unit)}`;
      const unitPriceText = rupiahSpoken(it.price);
      const lineTotalText = rupiahSpoken(it.price * it.qty);
      return `${qtyText} ${it.product.name}, harga satuan ${unitPriceText}, total ${lineTotalText}`;
    }).join(". ");
    
    return [
      `Halo ${session.name}.`,
      `Anda akan membeli: ${itemDetails}.`,
      `Subtotal ${rupiahSpoken(subtotal)}.`,
      ship?.fee
        ? `Ongkos kirim ${ship.label} sebesar ${rupiahSpoken(ship.fee)}.`
        : ship
          ? `Ongkos kirim ${ship.label} gratis.`
          : "",
      adminFee > 0 ? `Biaya layanan sebesar ${rupiahSpoken(adminFee)}.` : "",
      `Total yang harus dibayar ${rupiahSpoken(total)}.`,
      `Metode pembayaran ${paymentLabel}.`,
      `Alamat pengiriman: ${address || "belum diisi"}.`,
      "Silakan tekan tombol bayar sekarang jika semua sudah benar.",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const handleVoiceConfirm = () => {
    if (speaking) {
      stop();
      return;
    }
    if (!address.trim()) {
      toast.error("Mohon isi alamat dulu sebelum dibacakan");
      return;
    }
    const ok = speak(buildSummaryText(), () => {
      setConfirmedByVoice(true);
      setTimeout(() => {
        toast.success("✅ Konfirmasi suara selesai", {
          description: "Silakan tekan Bayar Sekarang untuk lanjut.",
          duration: 8000,
        });
        try {
          if ("vibrate" in navigator) navigator.vibrate?.([200, 100, 200]);
        } catch {
          // ignore
        }
      }, 200);
    });
    if (!ok) toast.error("Voice over tidak didukung di perangkat ini");
  };

  const handlePay = () => {
    if (!address.trim()) {
      toast.error("Mohon isi alamat pengiriman");
      return;
    }
    if (prefs.voiceOver && !confirmedByVoice) {
      toast.info("Mode lansia: tekan dulu tombol 'Bacakan & Konfirmasi'", {
        description: "Agar Anda yakin pesanan sudah benar.",
      });
      return;
    }

    const orderId = `o_${Date.now()}`;

    createOrder({
      buyerId: session.id,
      buyerName: session.name,
      buyerPhone: session.phone,
      address: address,
      buyerCityId,
      distanceKm: selectedQuote?.distanceKm ?? 0,
      items: items.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        image: it.product.image,
        farmerId: it.product.farmerId,
        farmerName: it.product.farmerName,
        price: it.price,
        qty: it.qty,
        preOrder: it.product.preOrder || undefined,
        harvestPlannedDate: it.product.harvestPlannedDate,
      })),
      subtotal,
      shipping: selectedQuote?.fee ?? 0,
      adminFee,
      total,
      status: "dibayar",
      shippingMethod: shipping,
      paymentMethod,
      paymentProvider: paymentMethod === "cod" ? "cod" : paymentMethod === "qris" ? "xendit_qris" : "xendit_transfer",
      paymentStatus: "pending",
    });

    // Simpan QRIS payment jika metode pembayaran QRIS
    if (paymentMethod === "qris") {
      saveQrisPayment({
        id: `qris_${Date.now()}`,
        orderId,
        qrisString: generateQrisString(orderId, total),
        amount: total,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }

    if (selectedIds) {
      const remaining = cart.filter((c) => !selectedIds.has(c.productId));
      setCart(session.id, remaining);
    } else {
      clearCart(session.id);
    }
    try {
      sessionStorage.removeItem(SELECTION_KEY);
    } catch {
      // ignore
    }

    // Voice over sukses bayar - sebutkan detail lengkap
    const itemList = items.map((it) => {
      return `${it.qty} ${unitSpoken(it.product.unit)} ${it.product.name} dengan harga total ${rupiahSpoken(it.price * it.qty)}`;
    }).join(", ");
    const successText = [
      `Pembayaran berhasil!`,
      `Total ${rupiahSpoken(total)}.`,
      `Pesanan ${itemList} sudah tercatat.`,
      `Alamat pengiriman ke ${address}.`,
      "Terima kasih telah berbelanja di Panenku.",
    ].join(" ");
    speak(successText);

    toast.success("Pesanan berhasil dibuat!", { description: "Cek di menu Pesanan" });
    navigate({ to: "/pesanan" });
  };

  return (
    <MobileShell hideNav>
      <Header />

      {prefs.voiceOver && (
        <section className="bg-primary-soft p-3">
          <button
            onClick={handleVoiceConfirm}
            disabled={!ttsSupported}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary text-base font-bold text-primary-foreground disabled:opacity-50"
          >
            {speaking ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            {speaking ? "Hentikan Suara" : "🔊 Bacakan & Konfirmasi Pesanan"}
          </button>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Suara akan membaca total & alamat untuk pembeli lansia.
          </p>
        </section>
      )}

      <section className="bg-card p-4">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
          <MapPinned className="h-5 w-5 text-primary" /> Kota Anda
        </h2>
        <select
          value={buyerCityId}
          onChange={(e) => setBuyerCityId(e.target.value)}
          className="h-14 w-full rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.province}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Jarak ke kebun petani: <strong>{selectedQuote?.distanceKm ?? 0} km</strong>
        </p>
      </section>

      <section className="mt-2 bg-card p-4">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
          <MapPin className="h-5 w-5 text-primary" /> Alamat Pengiriman
        </h2>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Contoh: Jl. Mawar No. 12, RT 03, Desa Sukamaju"
          rows={3}
          className="w-full resize-none rounded-xl border-2 border-border bg-background p-3 text-base outline-none focus:border-primary"
        />
      </section>

      <section className="mt-2 bg-card p-4">
        <h2 className="mb-2 text-lg font-bold">Pilih Pengiriman</h2>
        <div className="space-y-2">
          {quotes.map((q) => (
            <button
              key={q.method}
              onClick={() => { setShipping(q.method); setConfirmedByVoice(false); }}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left ${
                shipping === q.method ? "border-primary bg-primary-soft" : "border-border bg-background"
              }`}
            >
              <Truck className={`h-6 w-6 ${shipping === q.method ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <p className="font-semibold">{q.label}</p>
                <p className="text-sm text-muted-foreground">{q.desc}</p>
                <p className="text-sm font-bold text-primary">
                  {q.free ? "GRATIS" : rupiah(q.fee)}
                </p>
              </div>
              <div className={`h-5 w-5 rounded-full border-2 ${shipping === q.method ? "border-primary bg-primary" : "border-border"}`} />
            </button>
          ))}
        </div>
      </section>

      <section className="mt-2 bg-card p-4">
        <h2 className="mb-2 text-lg font-bold">Metode Pembayaran</h2>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: "qris", label: "QRIS", icon: QrCode },
            { id: "transfer", label: "Transfer", icon: Building2 },
            { id: "cod", label: "COD", icon: Banknote },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPaymentMethod(opt.id as PaymentMethod)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 ${
                paymentMethod === opt.id ? "border-primary bg-primary-soft" : "border-border"
              }`}
            >
              <opt.icon className={`h-6 w-6 ${paymentMethod === opt.id ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs font-bold">{opt.label}</span>
            </button>
          ))}
        </div>
        {paymentMethod === "qris" && (
          <div className="mt-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary-soft/50 p-4 text-center">
            {total > 0 ? (
              <>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(generateQrisString(`checkout_${Date.now()}`, total))}`}
                  alt="QRIS Payment"
                  className="mx-auto rounded-xl"
                  width={200}
                  height={200}
                />
                <p className="mt-2 text-sm font-bold">Scan QRIS untuk Bayar</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Scan kode QR ini dengan aplikasi e-wallet (GoPay, OVO, DANA, ShopeePay, LinkAja) atau mobile banking
                </p>
                <p className="mt-2 text-lg font-extrabold text-primary">{rupiah(total)}</p>
              </>
            ) : (
              <>
                <QrCode className="mx-auto h-16 w-16 text-primary" />
                <p className="mt-2 text-sm font-bold">Bayar dengan QRIS</p>
                <p className="text-xs text-muted-foreground">Tunjukkan kode QR di kasir saat pengiriman</p>
              </>
            )}
          </div>
        )}
        {paymentMethod === "transfer" && (
          <div className="mt-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary-soft/50 p-4">
            <p className="text-sm font-bold">Transfer ke:</p>
            <p className="text-sm">Bank Mandiri 1234-5678-9012 a.n. Panenku</p>
          </div>
        )}
        {paymentMethod === "cod" && (
          <div className="mt-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary-soft/50 p-4">
            <p className="text-sm font-bold">Bayar di tempat (COD)</p>
            <p className="text-xs text-muted-foreground">Bayar saat paket diterima</p>
          </div>
        )}
      </section>

      <section className="mt-2 bg-card p-4 pb-40">
        <h2 className="mb-2 text-lg font-bold">Produk Dipesan</h2>
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.product.id} className="flex gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <ProductImage src={it.product.image} alt={it.product.name} />
              </div>
              <div className="flex-1">
                <p className="line-clamp-1 font-semibold">{it.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {it.qty} {it.product.unit} × {rupiah(it.price)}
                  {it.negotiated && <span className="ml-1 font-bold text-success">· hasil tawar 🤝</span>}
                </p>
                {it.product.preOrder && (
                  <p className="mt-0.5 text-xs font-semibold text-primary">
                    🌱 Pre-Order · panen {it.product.harvestPlannedDate ? tanggalID(it.product.harvestPlannedDate) : "menyusul"}
                  </p>
                )}
              </div>
              <p className="font-bold text-primary">{rupiah(it.price * it.qty)}</p>
            </div>
          ))}
        </div>
      </section>

      <div
        className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-card p-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <button
          onClick={handlePay}
          className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-soft"
        >
          Bayar Sekarang · {rupiah(total)}
        </button>
      </div>
    </MobileShell>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
      <Link to="/keranjang" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <h1 className="text-xl font-bold">Checkout</h1>
    </header>
  );
}