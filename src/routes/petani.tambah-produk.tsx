import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { MultiImagePicker } from "@/components/MultiImagePicker";
import { CATEGORIES } from "@/lib/format";
import { addProduct } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export const Route = createFileRoute("/petani/tambah-produk")({
  component: TambahProduk,
});

function TambahProduk() {
  const session = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("sayur");
  const [emoji, setEmoji] = useState("🥬");
  const [photos, setPhotos] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [preOrder, setPreOrder] = useState(false);
  const [harvestPlannedDate, setHarvestPlannedDate] = useState("");
  const [cultivationMethod, setCultivationMethod] = useState("");
  const [packaging, setPackaging] = useState("");
  const [weightPerUnit, setWeightPerUnit] = useState("");
  const [storageInfo, setStorageInfo] = useState("");
  const [bestBeforeDays, setBestBeforeDays] = useState("");
  const [certifications, setCertifications] = useState("");

  if (!session || session.role !== "farmer") {
    if (typeof window !== "undefined") navigate({ to: "/masuk", search: { redirect: "/petani/tambah-produk" } });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [mainPhoto, ...rest] = photos;
    addProduct({
      farmerId: session.id,
      farmerName: session.name,
      farmLocation: session.farmLocation ?? "",
      farmCityId: session.farmCityId,
      name,
      category,
      price: Number(price),
      unit,
      stock: Number(stock),
      description,
      image: mainPhoto ?? `emoji:${emoji}`,
      images: rest.length ? rest : undefined,
      harvestDate: harvestDate || undefined,
      preOrder: preOrder || undefined,
      harvestPlannedDate: preOrder ? (harvestPlannedDate || undefined) : undefined,
      cultivationMethod: cultivationMethod || undefined,
      packaging: packaging || undefined,
      weightPerUnit: weightPerUnit || undefined,
      storageInfo: storageInfo || undefined,
      bestBeforeDays: bestBeforeDays ? Number(bestBeforeDays) : undefined,
      certifications: certifications
        ? certifications.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      origin: session.farmLocation ?? undefined,
    });
    toast.success("Produk berhasil ditambahkan!");
    navigate({ to: "/petani" });
  };

  const valid =
    name.length >= 2 &&
    Number(price) > 0 &&
    Number(stock) > 0 &&
    description.length >= 5 &&
    (!preOrder || !!harvestPlannedDate);

  return (
    <MobileShell hideNav>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
        <Link to="/petani" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Tambah Produk</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 pb-32">
        <MultiImagePicker value={photos} onChange={setPhotos} label="Foto Produk (bisa lebih dari satu)" />

        {photos.length === 0 && (
          <div>
            <label className="mb-1 block text-sm font-bold">Atau pilih ikon emoji</label>
            <div className="grid grid-cols-6 gap-2">
              {["🥬", "🍅", "🌶️", "🧅", "🍚", "🫚", "🥕", "🥔", "🍌", "🍎", "🍊", "🌾"].map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`flex aspect-square items-center justify-center rounded-xl border-2 text-3xl ${
                    emoji === e ? "border-primary bg-primary-soft" : "border-border bg-card"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        <Field label="Nama Produk" value={name} onChange={setName} placeholder="Contoh: Tomat Merah Segar" />

        <div>
          <label className="mb-1 block text-sm font-bold">Kategori</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  category === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Harga (Rp)" value={price} onChange={(v) => setPrice(v.replace(/\D/g, ""))} type="tel" placeholder="12000" />
          <div>
            <label className="mb-1 block text-sm font-bold">Satuan</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-14 w-full rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
            >
              <option value="kg">kg</option>
              <option value="ikat">ikat</option>
              <option value="buah">buah</option>
              <option value="sisir">sisir</option>
            </select>
          </div>
        </div>

        <Field label="Stok Tersedia" value={stock} onChange={(v) => setStock(v.replace(/\D/g, ""))} type="tel" placeholder="50" />

        <div>
          <label className="mb-1 block text-sm font-bold">Deskripsi Produk</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Ceritakan tentang produkmu…"
            className="w-full resize-none rounded-xl border-2 border-border bg-background p-3 text-base outline-none focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold">Tanggal Panen (opsional)</label>
          <input
            type="date"
            value={harvestDate}
            onChange={(e) => setHarvestDate(e.target.value)}
            className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-start gap-3 rounded-xl border-2 border-primary/20 bg-primary-soft p-4">
          <span className="text-2xl">🚜</span>
          <div>
            <p className="text-base font-bold text-primary">Diantar oleh Petani</p>
            <p className="text-sm text-muted-foreground">
              Pesanan akan diantar langsung oleh petani ke alamat pembeli. Tidak ada opsi ambil di kebun.
            </p>
          </div>
        </div>

        {/* ---- Pre-Order H-1 ---- */}
        <div className="rounded-xl border-2 border-primary/30 bg-primary-soft p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={preOrder}
              onChange={(e) => setPreOrder(e.target.checked)}
              className="mt-1 h-6 w-6 accent-primary"
            />
            <span>
              <span className="block text-base font-bold text-primary">🌱 Aktifkan Pre-Order</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Produk belum dipanen. Pembeli pesan dulu, Anda panen sesuai pesanan — tidak ada sayuran terbuang.
              </span>
            </span>
          </label>
          {preOrder && (
            <div className="mt-3">
              <label className="mb-1 block text-sm font-bold">Perkiraan Tanggal Panen</label>
              <input
                type="date"
                value={harvestPlannedDate}
                onChange={(e) => setHarvestPlannedDate(e.target.value)}
                min={new Date(Date.now() + 86400_000).toISOString().slice(0, 10)}
                className="h-14 w-full rounded-xl border-2 border-primary bg-background px-4 text-base outline-none"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Pembeli akan tahu pesanan dikirim setelah tanggal ini.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-card p-4 shadow-card">
          <h2 className="text-base font-bold">Detail Tambahan (opsional)</h2>
          <p className="mb-3 text-xs text-muted-foreground">Lengkapi agar pembeli lebih percaya</p>
          <div className="space-y-3">
            <Field label="Berat per kemasan" value={weightPerUnit} onChange={setWeightPerUnit} placeholder="1 kg per pack" />
            <Field label="Metode tanam" value={cultivationMethod} onChange={setCultivationMethod} placeholder="Organik / Konvensional ramah lingkungan" />
            <Field label="Kemasan" value={packaging} onChange={setPackaging} placeholder="Plastik food-grade / kardus" />
            <Field label="Tahan disimpan (hari)" value={bestBeforeDays} onChange={(v) => setBestBeforeDays(v.replace(/\D/g, ""))} type="tel" placeholder="7" />
            <div>
              <label className="mb-1 block text-sm font-bold">Tips Penyimpanan</label>
              <textarea
                value={storageInfo}
                onChange={(e) => setStorageInfo(e.target.value)}
                rows={2}
                placeholder="Simpan di kulkas, bertahan 1 minggu"
                className="w-full resize-none rounded-xl border-2 border-border bg-background p-3 text-base outline-none focus:border-primary"
              />
            </div>
            <Field
              label="Sertifikat (pisah dengan koma)"
              value={certifications}
              onChange={setCertifications}
              placeholder="Prima 3, Organik Indonesia"
            />
          </div>
        </div>
      </form>

      <div
        className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-card p-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <button
          onClick={handleSubmit}
          disabled={!valid}
          className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50"
        >
          Simpan Produk
        </button>
      </div>
    </MobileShell>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
      />
    </div>
  );
}
