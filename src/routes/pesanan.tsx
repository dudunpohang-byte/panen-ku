import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Printer, Share2, Check } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ProductImage } from "@/components/ProductImage";
import { ORDER_STATUS_LABEL, rupiah, waktuID } from "@/lib/format";
import { getOrders, updateOrderStatus, type Order, type OrderStatus } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { printInvoice, shareInvoice } from "@/lib/invoice";
import { toast } from "sonner";

export const Route = createFileRoute("/pesanan")({
  component: Pesanan,
});

const STATUS_COLORS: Record<OrderStatus, string> = {
  menunggu_bayar: "bg-promo/15 text-promo",
  dibayar: "bg-blue-100 text-blue-700",
  disiapkan: "bg-yellow-100 text-yellow-700",
  dikirim: "bg-indigo-100 text-indigo-700",
  selesai: "bg-success/15 text-success",
};

const STATUS_FLOW: OrderStatus[] = [
  "menunggu_bayar",
  "dibayar",
  "disiapkan",
  "dikirim",
  "selesai",
];
const STATUS_SHORT: Record<OrderStatus, string> = {
  menunggu_bayar: "Bayar",
  dibayar: "Dibayar",
  disiapkan: "Disiapkan",
  dikirim: "Dikirim",
  selesai: "Tiba",
};

function StatusTimeline({ status }: { status: OrderStatus }) {
  const currentIdx = STATUS_FLOW.indexOf(status);
  return (
    <div className="mt-3 rounded-xl bg-primary-soft/40 p-3">
      <div className="flex items-start justify-between">
        {STATUS_FLOW.map((s, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s} className="flex flex-1 flex-col items-center">
              <div className="relative flex w-full items-center justify-center">
                {i > 0 && (
                  <div
                    className={`absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${
                      i <= currentIdx ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground ring-2 ring-border"
                  } ${active ? "ring-2 ring-primary" : ""}`}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
              </div>
              <span
                className={`mt-1 text-[10px] font-semibold leading-tight ${
                  done ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {STATUS_SHORT[s]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Pesanan() {
  const session = useSession();
  const navigate = useNavigate();
  const allOrders = useStoreSubscription(() => getOrders());

  if (!session) {
    return (
      <MobileShell>
        <Header />
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl">🔒</p>
          <p className="mt-3 text-lg font-semibold">Masuk untuk melihat pesanan</p>
          <button
            onClick={() => navigate({ to: "/masuk", search: { redirect: "/pesanan" } })}
            className="mt-5 rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground"
          >
            Masuk
          </button>
        </div>
      </MobileShell>
    );
  }

  const orders =
    session.role === "buyer"
      ? allOrders.filter((o) => o.buyerId === session.id)
      : allOrders.filter((o) => o.items.some((it) => it.farmerId === session.id));

  return (
    <MobileShell>
      <Header />
      {orders.length === 0 ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl">📦</p>
          <p className="mt-3 text-lg font-semibold">Belum ada pesanan</p>
          <p className="text-muted-foreground">{session.role === "buyer" ? "Yuk belanja produk segar!" : "Pesanan akan muncul di sini"}</p>
        </div>
      ) : (
        <div className="space-y-3 p-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl bg-card p-3 shadow-card">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{waktuID(o.createdAt)}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[o.status]}`}>
                  {ORDER_STATUS_LABEL[o.status]}
                </span>
              </div>
              <div className="space-y-2">
                {o.items.map((it) => (
                  <div key={it.productId} className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                      <ProductImage src={it.image} alt={it.productName} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-semibold">{it.productName}</p>
                      <p className="text-sm text-muted-foreground">{it.qty} × {rupiah(it.price)}</p>
                      {session.role === "farmer" && (
                        <p className="text-xs text-muted-foreground">Pembeli: {o.buyerName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-extrabold text-primary">{rupiah(o.total)}</span>
              </div>

              {/* Timeline status pengiriman */}
              <StatusTimeline status={o.status} />

              {/* Invoice actions — tampil setelah pesanan dibayar */}
              {o.status !== "menunggu_bayar" && (
                <InvoiceActions order={o} />
              )}

              {/* Actions */}
              {session.role === "buyer" && o.status === "dikirim" && (
                <button
                  onClick={() => {
                    updateOrderStatus(o.id, "selesai");
                    toast.success("Terima kasih! Pesanan selesai");
                  }}
                  className="mt-3 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground"
                >
                  Konfirmasi Diterima
                </button>
              )}
              {session.role === "farmer" && (
                <FarmerActions
                  status={o.status}
                  onNext={(next) => {
                    updateOrderStatus(o.id, next);
                    toast.success(`Status diubah: ${ORDER_STATUS_LABEL[next]}`);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </MobileShell>
  );
}

function InvoiceActions({ order }: { order: Order }) {
  const handleShare = async () => {
    const result = await shareInvoice(order);
    if (result === "copied") toast.success("Invoice disalin ke clipboard");
    else if (result === "unsupported") toast.error("Share tidak didukung di perangkat ini");
  };
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <button
        onClick={() => printInvoice(order)}
        className="flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card text-sm font-bold text-primary"
      >
        <Printer className="h-4 w-4" /> Cetak / PDF
      </button>
      <button
        onClick={handleShare}
        className="flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-border bg-card text-sm font-bold"
      >
        <Share2 className="h-4 w-4" /> Bagikan
      </button>
    </div>
  );
}

function FarmerActions({ status, onNext }: { status: OrderStatus; onNext: (s: OrderStatus) => void }) {
  if (status === "selesai") return null;
  const flow: Record<OrderStatus, OrderStatus | null> = {
    menunggu_bayar: "dibayar",
    dibayar: "disiapkan",
    disiapkan: "dikirim",
    dikirim: "selesai",
    selesai: null,
  };
  const next = flow[status];
  if (!next) return null;
  const labels: Record<OrderStatus, string> = {
    menunggu_bayar: "Tandai Dibayar",
    dibayar: "Mulai Siapkan",
    disiapkan: "Kirim Pesanan",
    dikirim: "Tandai Selesai",
    selesai: "",
  };
  return (
    <button
      onClick={() => onNext(next)}
      className="mt-3 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground"
    >
      {labels[status]}
    </button>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
      <Link to="/" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <h1 className="text-xl font-bold">Pesanan Saya</h1>
    </header>
  );
}
