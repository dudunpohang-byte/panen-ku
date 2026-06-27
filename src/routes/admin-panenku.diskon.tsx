import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { MobileShell } from "@/components/MobileShell";
import { API_BASE_URL, apiGet, apiPost } from "@/lib/api";
import { getProducts, type Product } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-panenku/diskon")({
  component: AdminDiskon,
});

interface DiscountWithProduct {
  id: string;
  product_id: string;
  discount_type: "admin" | "farmer";
  discount_percent: number;
  active: boolean;
  product_name: string;
  product_price: number;
  farmer_id: string;
  start_date: string;
  end_date: string | null;
}

function AdminDiskon() {
  const session = useSession();
  const [discounts, setDiscounts] = useState<(DiscountWithProduct & { farmer_name?: string })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [endDate, setEndDate] = useState("");

  const load = async () => {
    try {
      const data = await apiGet<DiscountWithProduct[]>("/api/discounts?active_only=false");
      setDiscounts(data);
    } catch { setDiscounts([]); }
    setProducts(getProducts());
  };

  useEffect(() => { load(); }, []);

  if (!session || session.role !== "admin") return null;

  const handleAdd = async () => {
    if (!selectedProduct || !discountPercent) {
      toast.error("Pilih produk dan isi persentase diskon");
      return;
    }
    try {
      await apiPost("/api/discounts", {
        product_id: selectedProduct,
        discount_type: "admin",
        discount_percent: discountPercent,
        created_by: session.id,
        end_date: endDate || null,
      });
      toast.success("Diskon admin berhasil ditambahkan!");
      setShowForm(false);
      setSelectedProduct("");
      setDiscountPercent(10);
      setEndDate("");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await fetch(`${API_BASE_URL}/api/discounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      load();
    } catch { toast.error("Gagal update"); }
  };

  const diskonAdmin = discounts.filter(d => d.discount_type === "admin");

  return (
    <MobileShell hideNav>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-foreground px-2 py-3 text-background">
        <Link to="/admin-panenku" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Atur Diskon (Admin)</h1>
      </header>

      <div className="p-3">
        <p className="mb-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
          💡 Diskon admin = rugi ditanggung admin (potongan dari fee admin).
          Berlaku untuk produk pilihan.
        </p>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground"
        >
          <Plus className="h-5 w-5" /> {showForm ? "Tutup" : "Tambah Diskon Baru"}
        </button>

        {showForm && (
          <div className="mb-4 rounded-2xl bg-card p-4 shadow-card space-y-3">
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="h-12 w-full rounded-xl border-2 border-border bg-background px-3"
            >
              <option value="">-- Pilih Produk --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {rupiah(p.price)}</option>
              ))}
            </select>
            <div>
              <label className="text-sm font-semibold">Diskon (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={discountPercent}
                onChange={e => setDiscountPercent(Number(e.target.value))}
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-3"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Tanggal Berakhir (opsional)</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-3"
              />
            </div>
            <button
              onClick={handleAdd}
              className="h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground"
            >
              Simpan Diskon
            </button>
          </div>
        )}

        <div className="space-y-2">
          {diskonAdmin.length === 0 ? (
            <p className="text-center text-muted-foreground">Belum ada diskon admin</p>
          ) : (
            diskonAdmin.map(d => (
              <div key={d.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
                <div className="flex-1">
                  <p className="font-semibold">{d.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Harga: {rupiah(d.product_price)} | Diskon: {d.discount_percent}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.active ? "🟢 Aktif" : "🔴 Nonaktif"} 
                    {d.end_date ? ` · s/d ${d.end_date}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(d.id, d.active)}
                  className={`rounded-xl p-2 ${d.active ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}
                >
                  {d.active ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </MobileShell>
  );
}