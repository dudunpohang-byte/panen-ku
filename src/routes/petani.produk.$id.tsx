import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Save, Trash2, Award } from "lucide-react";
import { useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { MultiImagePicker } from "@/components/MultiImagePicker";
import { CATEGORIES } from "@/lib/format";
import { deleteProduct, getProducts, updateProduct, type Product } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { toast } from "sonner";

export const Route = createFileRoute("/petani/produk/$id")({
  component: EditProduk,
});

const UNITS = ["kg", "ikat", "buah", "sisir", "pack"];

function EditProduk() {
  const session = useSession();
  const navigate = useNavigate();
  const { id } = useParams({ from: "/petani/produk/$id" });
  const products = useStoreSubscription(() => getProducts());
  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);

  if (!session || session.role !== "farmer") {
    if (typeof window !== "undefined")
      navigate({ to: "/masuk", search: { redirect: `/petani/produk/${id}` } });
    return null;
  }

  if (!product) {
    return (
      <MobileShell hideNav>
        <Header />
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl">📦</p>
          <p className="mt-3 font-semibold">Produk tidak ditemukan</p>
          <Link to="/petani" className="mt-4 rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground">
            Kembali
          </Link>
        </div>
      </MobileShell>
    );
  }

  if (product.farmerId !== session.id) {
    return (
      <MobileShell hideNav>
        <Header />
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl">🚫</p>
          <p className="mt-3 font-semibold">Bukan produk Anda</p>
        </div>
      </MobileShell>
    );
  }

  return <EditForm product={product} farmerCerts={session.certifications ?? []} />;
}

function EditForm({ product, farmerCerts }: { product: Product; farmerCerts: string[] }) {
  const navigate = useNavigate();
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [price, setPrice] = useState(String(product.price));
  const [unit, setUnit] = useState(product.unit);
  const [stock, setStock] = useState(String(product.stock));
  const [description, setDescription] = useState(product.description);
  const [photos, setPhotos] = useState<string[]>(() => {
    const list: string[] = [];
    const isUploaded = (s?: string) => !!s && (s.startsWith("data:") || s.startsWith("http"));
    if (isUploaded(product.image)) list.push(product.image!);
    (product.images ?? []).forEach((s) => isUploaded(s) && list.push(s));
    return list;
  });
  const [weightPerUnit, setWeightPerUnit] = useState(product.weightPerUnit ?? "");
  const [packaging, setPackaging] = useState(product.packaging ?? "");
  const [storageInfo, setStorageInfo] = useState(product.storageInfo ?? "");
  const [harvestDate, setHarvestDate] = useState(product.harvestDate ?? "");
  const [bestBeforeDays, setBestBeforeDays] = useState(
    product.bestBeforeDays ? String(product.bestBeforeDays) : "",
  );
  const [selectedCerts, setSelectedCerts] = useState<string[]>(product.certifications ?? []);

  const valid =
    name.trim().length >= 2 &&
    Number(price) > 0 &&
    Number(stock) >= 0 &&
    description.trim().length >= 5;

  const toggleCert = (c: string) =>
    setSelectedCerts((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const handleSave = () => {
    if (!valid) return;
    const [main, ...rest] = photos;
    updateProduct({
      ...product,
      name: name.trim(),
      category,
      price: Number(price),
      unit,
      stock: Math.floor(Number(stock)),
      description: description.trim(),
      image: main ?? product.image,
      images: rest.length ? rest : undefined,
      weightPerUnit: weightPerUnit || undefined,
      packaging: packaging || undefined,
      storageInfo: storageInfo || undefined,
      harvestDate: harvestDate || undefined,
      bestBeforeDays: bestBeforeDays ? Number(bestBeforeDays) : undefined,
      certifications: selectedCerts.length ? selectedCerts : undefined,
    });
    toast.success("Produk diperbarui");
    navigate({ to: "/petani" });
  };

  const handleDelete = () => {
    if (!confirm(`Hapus produk "${product.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    deleteProduct(product.id);
    toast.success("Produk dihapus");
    navigate({ to: "/petani" });
  };

  return (
    <MobileShell hideNav>
      <Header title="Edit Produk" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-4 p-4 pb-32"
      >
        {/* Foto */}
        <section className="rounded-2xl bg-card p-3 shadow-card">
          <MultiImagePicker value={photos} onChange={setPhotos} label="Foto Produk (bisa lebih dari satu)" />
        </section>

        {/* Info Inti */}
        <section className="rounded-2xl bg-card p-4 shadow-card space-y-3">
          <h2 className="text-base font-bold">📝 Info Produk</h2>
          <Field label="Nama Produk" value={name} onChange={setName} placeholder="Tomat Merah Segar" />

          <div>
            <label className="mb-1 block text-sm font-bold">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    category === c.id ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border-2 border-border bg-background p-3 text-base outline-none focus:border-primary"
            />
          </div>
        </section>

        {/* Harga & Stok */}
        <section className="rounded-2xl bg-card p-4 shadow-card space-y-3">
          <h2 className="text-base font-bold">💰 Harga & Stok</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Harga (Rp)"
              value={price}
              onChange={(v) => setPrice(v.replace(/\D/g, ""))}
              type="tel"
              placeholder="12000"
            />
            <div>
              <label className="mb-1 block text-sm font-bold">Satuan</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="h-14 w-full rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Stok Tersedia</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStock(String(Math.max(0, Number(stock || 0) - 1)))}
                className="h-14 w-14 rounded-xl border-2 border-border text-2xl font-bold"
              >
                −
              </button>
              <input
                type="tel"
                value={stock}
                onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
                className="h-14 flex-1 rounded-xl border-2 border-border bg-background px-4 text-center text-xl font-bold outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setStock(String(Number(stock || 0) + 1))}
                className="h-14 w-14 rounded-xl border-2 border-border text-2xl font-bold"
              >
                +
              </button>
            </div>
          </div>
        </section>

        {/* Sertifikat */}
        <section className="rounded-2xl bg-card p-4 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Award className="h-5 w-5 text-promo" /> Sertifikat Produk
            </h2>
            <Link to="/petani/sertifikat" className="text-xs font-bold text-primary">
              Kelola
            </Link>
          </div>
          {farmerCerts.length === 0 ? (
            <div className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
              Belum ada sertifikat di profil.{" "}
              <Link to="/petani/sertifikat" className="font-bold text-primary underline">
                Tambahkan dulu
              </Link>
              .
            </div>
          ) : (
            <>
              <p className="mb-2 text-xs text-muted-foreground">
                Pilih sertifikat yang berlaku untuk produk ini.
              </p>
              <div className="flex flex-wrap gap-2">
                {farmerCerts.map((c) => {
                  const on = selectedCerts.includes(c);
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => toggleCert(c)}
                      className={`rounded-full border-2 px-3 py-2 text-sm font-bold ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card"
                      }`}
                    >
                      {on ? "✓ " : "+ "}
                      {c}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Detail tambahan */}
        <section className="rounded-2xl bg-card p-4 shadow-card space-y-3">
          <h2 className="text-base font-bold">📦 Detail Tambahan</h2>
          <Field label="Berat per kemasan" value={weightPerUnit} onChange={setWeightPerUnit} placeholder="1 kg per pack" />
          <Field label="Kemasan" value={packaging} onChange={setPackaging} placeholder="Plastik food-grade" />
          <div>
            <label className="mb-1 block text-sm font-bold">Tips Penyimpanan</label>
            <textarea
              value={storageInfo}
              onChange={(e) => setStorageInfo(e.target.value)}
              rows={2}
              placeholder="Simpan di kulkas"
              className="w-full resize-none rounded-xl border-2 border-border bg-background p-3 text-base outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-bold">Tanggal Panen</label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="h-14 w-full rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
              />
            </div>
            <Field
              label="Tahan (hari)"
              value={bestBeforeDays}
              onChange={(v) => setBestBeforeDays(v.replace(/\D/g, ""))}
              type="tel"
              placeholder="7"
            />
          </div>
        </section>

        <button
          type="button"
          onClick={handleDelete}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-danger text-base font-bold text-danger"
        >
          <Trash2 className="h-5 w-5" /> Hapus Produk
        </button>
      </form>

      <div
        className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-card p-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <button
          onClick={handleSave}
          disabled={!valid}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50"
        >
          <Save className="h-5 w-5" /> Simpan Perubahan
        </button>
      </div>
    </MobileShell>
  );
}

function Header({ title = "Edit Produk" }: { title?: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
      <Link to="/petani" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
      />
    </div>
  );
}