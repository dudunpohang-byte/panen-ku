import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trash2, Edit } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ProductImage } from "@/components/ProductImage";
import { rupiah } from "@/lib/format";
import { deleteProduct, getProducts } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { toast } from "sonner";

export const Route = createFileRoute("/petani/produk")({
  component: ProdukSaya,
});

function ProdukSaya() {
  const session = useSession();
  const navigate = useNavigate();
  const products = useStoreSubscription(() => getProducts());

  if (!session || session.role !== "farmer") {
    if (typeof window !== "undefined") navigate({ to: "/masuk", search: { redirect: "/petani/produk" } });
    return null;
  }

  const myProducts = products.filter((p) => p.farmerId === session.id);

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
        <Link to="/petani" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Produk Saya</h1>
      </header>

      <div className="p-3">
        <Link
          to="/petani/tambah-produk"
          className="mb-3 flex h-13 items-center justify-center rounded-xl bg-primary py-3 font-bold text-primary-foreground"
        >
          + Tambah Produk Baru
        </Link>

        {myProducts.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-6xl">📦</p>
            <p className="mt-3 font-semibold">Belum ada produk</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myProducts.map((p) => (
              <div key={p.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-card">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <ProductImage src={p.image} alt={p.name} />
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 font-semibold">{p.name}</p>
                  <p className="font-extrabold text-primary">{rupiah(p.price)} /{p.unit}</p>
                  <p className="text-sm text-muted-foreground">Stok: {p.stock} · Terjual: {p.sold}</p>
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
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
