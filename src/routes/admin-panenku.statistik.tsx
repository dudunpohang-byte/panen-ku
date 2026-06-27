import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShoppingBag, Users, Package, TrendingUp } from "lucide-react";
import { getOrders, getProducts, getUsers, getAdminSettings } from "@/lib/store";
import { rupiah, ORDER_STATUS_LABEL } from "@/lib/format";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";

export const Route = createFileRoute("/admin-panenku/statistik")({
  component: Statistik,
});

function Statistik() {
  const session = useSession();
  const navigate = useNavigate();
  const orders = useStoreSubscription(() => getOrders());
  const users = useStoreSubscription(() => getUsers());
  const products = useStoreSubscription(() => getProducts());
  const settings = useStoreSubscription(() => getAdminSettings());

  useEffect(() => {
    if (!session || session.role !== "admin") navigate({ to: "/admin-panenku" });
  }, [session, navigate]);

  if (!session || session.role !== "admin") return null;

  const buyers = users.filter((u) => u.role === "buyer").length;
  const farmers = users.filter((u) => u.role === "farmer").length;
  const farmersApproved = users.filter((u) => u.role === "farmer" && u.status === "approved").length;

  const gmv = orders.reduce((s, o) => s + o.subtotal, 0);
  const adminRevenue = orders.reduce((s, o) => s + o.adminFee, 0);
  const completed = orders.filter((o) => o.status === "selesai").length;

  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  // Top sellers
  const topProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);

  return (
    <div className="space-y-4 p-3 pb-12">
      <div className="grid grid-cols-2 gap-2">
        <Stat icon={ShoppingBag} label="Total Order" value={String(orders.length)} color="bg-blue-100 text-blue-700" />
        <Stat icon={TrendingUp} label="GMV" value={rupiah(gmv)} color="bg-success/15 text-success" small />
        <Stat icon={Users} label="Pembeli" value={String(buyers)} color="bg-promo/15 text-promo" />
        <Stat icon={Users} label={`Petani (${farmersApproved}/${farmers})`} value={String(farmersApproved)} color="bg-primary-soft text-primary" />
        <Stat icon={Package} label="Produk Aktif" value={String(products.length)} color="bg-purple-100 text-purple-700" />
        <Stat icon={TrendingUp} label={`Pendapatan Admin (${settings.adminFeePercent}%)`} value={rupiah(adminRevenue)} color="bg-foreground text-background" small />
      </div>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <h2 className="mb-3 text-base font-extrabold">📊 Status Pesanan</h2>
        <div className="space-y-2">
          {(["menunggu_bayar", "dibayar", "disiapkan", "dikirim", "selesai"] as const).map((s) => (
            <div key={s} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{ORDER_STATUS_LABEL[s]}</span>
              <span className="font-bold">{byStatus[s] ?? 0}</span>
            </div>
          ))}
          <div className="mt-2 border-t border-border pt-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold">Selesai / Total</span>
              <span className="font-extrabold text-primary">{completed} / {orders.length}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <h2 className="mb-3 text-base font-extrabold">🔥 Produk Terlaris</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada produk</p>
        ) : (
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft font-bold text-primary">{i + 1}</span>
                <span className="flex-1 font-semibold">{p.name}</span>
                <span className="text-muted-foreground">Terjual {p.sold}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color, small = false }: { icon: typeof Users; label: string; value: string; color: string; small?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-extrabold ${small ? "text-base" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
