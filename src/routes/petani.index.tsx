import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  Package,
  ShoppingBag,
  Wallet,
  Truck,
  TrendingUp,
  BookOpen,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  MessageSquare,
  Edit,
  Award,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ProductImage } from "@/components/ProductImage";
import { ImagePicker } from "@/components/ImagePicker";
import { rupiah, tanggalID } from "@/lib/format";
import {
  deleteProduct,
  getOrders,
  getProducts,
  updateProduct,
} from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/petani/")({
  component: PetaniDashboard,
});

function PetaniDashboard() {
  const session = useSession();
  const navigate = useNavigate();
  const allProducts = useStoreSubscription(() => getProducts());
  const allOrders = useStoreSubscription(() => getOrders());
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

  if (!session) {
    if (typeof window !== "undefined")
      navigate({ to: "/masuk", search: { redirect: "/petani" } });
    return null;
  }
  if (session.role !== "farmer") {
    return (
      <MobileShell>
        <Header />
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl">🌱</p>
          <h2 className="mt-3 text-xl font-bold">Belum jadi petani</h2>
          <p className="mt-1 text-muted-foreground">
            Daftar sebagai petani untuk berjualan hasil panen
          </p>
          <Link
            to="/daftar"
            className="mt-5 rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground"
          >
            Daftar Petani
          </Link>
        </div>
      </MobileShell>
    );
  }

  const myProducts = allProducts.filter((p) => p.farmerId === session.id);
  const myOrders = allOrders.filter((o) =>
    o.items.some((it) => it.farmerId === session.id),
  );
  const newOrders = myOrders.filter((o) => o.status === "dibayar").length;
  const monthRevenue = myOrders
    .filter(
      (o) =>
        o.status === "selesai" &&
        new Date(o.createdAt).getMonth() === new Date().getMonth(),
    )
    .reduce(
      (s, o) =>
        s +
        o.items
          .filter((i) => i.farmerId === session.id)
          .reduce((a, i) => a + i.price * i.qty, 0),
      0,
    );

  // Smart panen recommendations
  const recommendations = myProducts
    .filter((p) => p.harvestDate)
    .map((p) => {
      const date = new Date(p.harvestDate!);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.round(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      let label = "Tunda";
      let color = "text-muted-foreground";
      if (diffDays === 0) {
        label = "Panen hari ini!";
        color = "text-success";
      } else if (diffDays === 1) {
        label = "Panen besok";
        color = "text-promo";
      } else if (diffDays > 1 && diffDays <= 3) {
        label = `H-${diffDays} panen`;
        color = "text-promo";
      }
      return { product: p, label, color, diffDays };
    })
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 3);

  const lowStock = myProducts.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStock = myProducts.filter((p) => p.stock === 0);

  return (
    <MobileShell>
      <Header />

      {/* Greeting */}
      <section className="bg-primary px-4 pt-2 pb-6 text-primary-foreground">
        <p className="text-sm opacity-90">Selamat datang 👋</p>
        <p className="text-2xl font-extrabold">Halo, {session.name}!</p>
        <p className="mt-0.5 text-sm opacity-90">{session.farmName}</p>
      </section>

      {/* Stat cards */}
      <section className="-mt-4 px-3">
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            icon={ShoppingBag}
            label="Pesanan Baru"
            value={String(newOrders)}
            color="bg-promo/15 text-promo"
          />
          <StatCard
            icon={Package}
            label="Produk Aktif"
            value={String(myProducts.length)}
            color="bg-primary-soft text-primary"
          />
          <StatCard
            icon={Wallet}
            label="Saldo"
            value={rupiah(session.balance ?? 0)}
            color="bg-success/15 text-success"
            small
          />
          <StatCard
            icon={TrendingUp}
            label="Pendapatan Bulan Ini"
            value={rupiah(monthRevenue)}
            color="bg-blue-100 text-blue-700"
            small
          />
        </div>
      </section>

      {/* Saldo & Tarik Dana */}
      <section className="mt-4 px-3">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground shadow-card">
          <p className="text-sm opacity-90">Saldo tersedia</p>
          <p className="text-3xl font-extrabold">{rupiah(session.balance ?? 0)}</p>
          {(session.pendingBalance ?? 0) > 0 && (
            <p className="mt-1 text-xs opacity-90">
              + {rupiah(session.pendingBalance ?? 0)} masih diproses
            </p>
          )}
          <Link
            to="/petani/tarik-dana"
            className="mt-3 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 font-bold text-primary"
          >
            <Wallet className="mr-2 h-5 w-5" /> Tarik Dana
          </Link>
        </div>

        {/* SLA Pembayaran — transparansi kapan dana cair */}
        <div className="mt-2 rounded-2xl border-2 border-success/30 bg-success/5 p-3">
          <div className="flex items-start gap-2">
            <span className="text-xl">⏱️</span>
            <div className="flex-1 text-sm">
              <p className="font-bold text-success">Jaminan Pembayaran Panenku</p>
              <ul className="mt-1 space-y-0.5 text-foreground/80">
                <li>• Dana masuk <b>otomatis</b> setelah pembeli klik "Diterima".</li>
                <li>• Maks. <b>1×24 jam</b> dari status "Selesai".</li>
                <li>• Penarikan ke rekening: <b>1–2 hari kerja</b>.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Shortcut */}
      <section className="mt-4 px-3">
        <div className="grid grid-cols-4 gap-2 rounded-2xl bg-card p-3 shadow-card">
          <Shortcut to="/petani/tambah-produk" icon={Plus} label="Tambah" />
          <Shortcut to="/petani/sertifikat" icon={Award} label="Sertifikat" />
          <Shortcut to="/petani/edukasi" icon={BookOpen} label="Edukasi" />
          <Shortcut to="/pesanan" icon={ShoppingBag} label="Pesanan" />
          <Shortcut to="/chat" icon={MessageSquare} label="Chat" />
        </div>
      </section>

      {/* Rekomendasi panen pintar */}
      <section className="mt-4 px-3">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-extrabold">
          🌱 Rekomendasi Panen
        </h2>
        <div className="space-y-2">
          {recommendations.length === 0 ? (
            <div className="rounded-2xl bg-card p-4 text-center text-sm text-muted-foreground shadow-card">
              Belum ada produk dengan jadwal panen.
            </div>
          ) : (
            recommendations.map((r) => (
              <div
                key={r.product.id}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  <ProductImage src={r.product.image} alt={r.product.name} />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{r.product.name}</p>
                  <p className={`text-sm font-semibold ${r.color}`}>{r.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {tanggalID(r.product.harvestDate!)}
                  </p>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  Stok {r.product.stock}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Peringatan Stok */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <section className="mt-4 px-3">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-extrabold">
            <AlertTriangle className="h-5 w-5 text-promo" /> Peringatan Stok
          </h2>
          <div className="space-y-2">
            {outOfStock.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border-2 border-danger/30 bg-danger/5 p-3"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                  <ProductImage src={p.image} alt={p.name} />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-sm font-semibold text-danger">Stok habis</p>
                </div>
              </div>
            ))}
            {lowStock.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border-2 border-promo/30 bg-promo/5 p-3"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                  <ProductImage src={p.image} alt={p.name} />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-sm font-semibold text-promo">
                    Sisa {p.stock} {p.unit} — segera restok
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Produk Saya — terintegrasi */}
      <section className="mt-4 px-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Package className="h-5 w-5" /> Produk di Toko Saya
          </h2>
          <Link to="/petani/tambah-produk" className="text-sm font-bold text-primary">
            + Tambah
          </Link>
        </div>
        {myProducts.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 text-center shadow-card">
            <p className="text-5xl">📦</p>
            <p className="mt-2 font-semibold">Belum ada produk</p>
            <Link
              to="/petani/tambah-produk"
              className="mt-3 inline-block rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground"
            >
              Tambah Produk Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myProducts.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-card p-3 shadow-card"
              >
                <div className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <ProductImage src={p.image} alt={p.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 font-semibold">{p.name}</p>
                    <p className="font-extrabold text-primary">
                      {rupiah(p.price)} /{p.unit}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stok: {p.stock} · Terjual: {p.sold}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus "${p.name}"?`)) {
                        deleteProduct(p.id);
                        toast.success("Produk dihapus");
                      }
                    }}
                    aria-label="Hapus"
                    className="self-start rounded-lg p-2 text-danger active:bg-danger/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() =>
                      setEditingPhotoId(editingPhotoId === p.id ? null : p.id)
                    }
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary text-sm font-bold text-primary"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {editingPhotoId === p.id ? "Tutup" : "Ganti Foto"}
                  </button>
                  <Link
                    to="/petani/produk/$id"
                    params={{ id: p.id }}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground"
                  >
                    <Edit className="h-4 w-4" /> Edit Produk
                  </Link>
                </div>
                {editingPhotoId === p.id && (
                  <div className="mt-2">
                    <ImagePicker
                      value={
                        p.image && (p.image.startsWith("data:") || p.image.startsWith("http"))
                          ? p.image
                          : undefined
                      }
                      onChange={(dataUrl) => {
                        updateProduct({
                          ...p,
                          image: dataUrl ?? p.image,
                        });
                        if (dataUrl) {
                          setEditingPhotoId(null);
                        }
                      }}
                      label="Foto Baru"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lacak paket */}
      <section className="mt-4 px-3 pb-4">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-extrabold">
          <Truck className="h-5 w-5" /> Paket Sedang Dikirim
        </h2>
        <div className="space-y-2">
          {myOrders.filter((o) => o.status === "dikirim").length === 0 ? (
            <div className="rounded-2xl bg-card p-4 text-center text-sm text-muted-foreground shadow-card">
              Belum ada paket dalam pengiriman
            </div>
          ) : (
            myOrders
              .filter((o) => o.status === "dikirim")
              .slice(0, 3)
              .map((o) => (
                <div key={o.id} className="rounded-2xl bg-card p-3 shadow-card">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{o.buyerName}</p>
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                      Dikirim
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {o.items.map((i) => i.productName).join(", ")}
                  </p>
                  <p className="mt-1 text-sm">📍 {o.address}</p>
                </div>
              ))
          )}
        </div>
      </section>
    </MobileShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  small = false,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div
        className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-extrabold ${small ? "text-base" : "text-2xl"}`}>{value}</p>
    </div>
  );
}

function Shortcut({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Plus;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1 rounded-xl py-2 active:bg-primary-soft"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-center text-[12px] font-semibold leading-tight">
        {label}
      </span>
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
      <Link
        to="/"
        aria-label="Kembali"
        className="rounded-full p-2 hover:bg-white/15"
      >
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <h1 className="text-xl font-bold">Toko Saya</h1>
    </header>
  );
}
