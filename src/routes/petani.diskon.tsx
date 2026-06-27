import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { MobileShell } from "@/components/MobileShell";
import { API_BASE_URL, apiGet, apiPost } from "@/lib/api";
import { getProducts, type Product } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/petani/diskon")({
  component: PetaniDiskon,
});

interface DiscountWithProduct {
  id: string;
  product_id: string;
  discount_type: "admin" | "farmer";
  discount_percent: number;
  active: boolean;
  product_name: string;
  product_price: number;
  start_date: string;
  end_date: string | null;
}

function PetaniDiskon() {
  const session = useSession();
  const [discounts, setDiscounts] = useState<DiscountWithProduct[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [endDate, setEndDate] = useState("");

  const load = async () => {
    if (!session) return;
    try {
      const data = await apiGet<DiscountWithProduct[]>(`/api/discounts?farmer_id=${session.id}&active_only=false`);
      setDiscounts(data);
    } catch { setDiscounts([]); }
    setMyProducts(getProducts().filter(p => p.farmerId === session!.id));
  };

  useEffect(() => { load(); }, [session?.id]);

  if (!session || session.role !== "farmer") return null;

  const handleAdd = async () => {
    if (!selectedProduct || !discountPercent) {
      toast.error("Pilih produk dan isi persentase diskon");
      return;
    }
    try {
      await apiPost("/api/discounts", {
        product_id: selectedProduct,
        discount_type: "farmer",
        discount_percent: discountPercent,
        created_by: session.id,
        end_date: endDate || null,
      });
      toast.success("Diskon petani berhasil ditambahkan!");
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

  const diskonSaya = discounts.filter(d => d.discount_type === "farmer");

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
        <Link to="/petani" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Atur Diskon Produk</h1>
      </header>

      <div className="p-3">
        <p className="mb-3 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-700">
          💡 Diskon petani = rugi ditanggung petani (potongan dari harga jual).
        </p>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground"
        >
          <Plus className="h-5 w-5" /> {showForm ? "Tutup" : "Buat Diskon Baru"}
        </button>

        {showForm && (
          <div className="mb-4 rounded-2xl bg-card p-4 shadow-card space-y-3">
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="h-12 w-full rounded-xl border-2 border-border bg-background px-3"
            >
              <option value="">-- Pilih Produk --</option>
              {myProducts.map(p => (
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
              {selectedProduct && (() => {
                const prod = myProducts.find(p => p.id === selectedProduct);
                if (!prod) return null;
                const potongan = prod.price * discountPercent / 100;
                const hargaAkhir = prod.price - potongan;
                return (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Harga asli: {rupiah(prod.price)} → Harga diskon: <strong className="text-primary">{rupiah(hargaAkhir)}</strong> (hemat {rupiah(potongan)})
                  </p>
                );
              })()}
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
          {diskonSaya.length === 0 ? (
            <p className="text-center text-muted-foreground">Belum ada diskon untuk produk Anda</p>
          ) : (
            diskonSaya.map(d => (
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