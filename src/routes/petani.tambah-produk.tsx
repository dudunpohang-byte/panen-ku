import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Truck, Camera, User, CheckCircle, Clock, Package } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { MultiImagePicker } from "@/components/MultiImagePicker";
import { CATEGORIES } from "@/lib/format";
import { addProduct, type ShippingOption } from "@/lib/store";
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

  // === SHIPPING OPTIONS ===
  const [shippingOption, setShippingOption] = useState<ShippingOption>("diantar_petani");
  const [shippingProofPhoto, setShippingProofPhoto] = useState(true);
  const [estimatedDelivery, setEstimatedDelivery] = useState("1-2 jam");
  const [courierName, setCourierName] = useState("");
  const [deliveryChecklist, setDeliveryChecklist] = useState(false);

  // === OPTIONAL DETAILS ===
  const [preOrder, setPreOrder] = useState(false);
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
      // === NEW FIELDS ===
      shippingOption,
      shippingProofPhoto,
      estimatedDelivery: estimatedDelivery || undefined,
      courierName: shippingOption === "diantar_petani" ? (courierName || undefined) : undefined,
      deliveryChecklist,
      // === PRE-ORDER (coming soon) ===
      preOrder: preOrder || undefined,
      harvestDate: undefined, // REMOVED: tanggal panen dihilangkan
      harvestPlannedDate: undefined, // REMOVED: tanggal panen dihilangkan
      // === OPTIONAL DETAILS ===
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
    description.length >= 5;

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
              <option value="pack">pack</option>
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

        {/* ===== SHIPPING OPTIONS ===== */}
        <div className="rounded-xl border-2 border-primary/30 p-4 space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Truck className="h-5 w-5" /> Ketentuan Pengiriman
          </h2>

          {/* Pilih opsi pengiriman */}
          <div>
            <label className="mb-2 block text-sm font-bold">Metode Pengiriman</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShippingOption("diantar_petani")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 ${
                  shippingOption === "diantar_petani" ? "border-primary bg-primary-soft" : "border-border"
                }`}
              >
                <Truck className={`h-8 w-8 ${shippingOption === "diantar_petani" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-bold">Diantar Petani</span>
                <span className="text-xs text-muted-foreground">Fee Rp2.500/5kg (rugi petani)</span>
              </button>
              <button
                type="button"
                onClick={() => setShippingOption("pihak_ketiga")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 ${
                  shippingOption === "pihak_ketiga" ? "border-primary bg-primary-soft" : "border-border"
                }`}
              >
                <Package className={`h-8 w-8 ${shippingOption === "pihak_ketiga" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-bold">Pihak Ketiga</span>
                <span className="text-xs text-muted-foreground">Fee Rp1.500/5kg (rugi admin)</span>
              </button>
            </div>
          </div>

          {/* Jika diantar petani: nama pengirim */}
          {shippingOption === "diantar_petani" && (
            <Field
              label="Nama Pengirim (yang mengantar)"
              value={courierName}
              onChange={setCourierName}
              placeholder="Nama Anda / staf yang mengantar"
              icon={<User className="h-4 w-4 text-muted-foreground" />}
            />
          )}

          {/* Perkiraan Sampai */}
          <div>
            <label className="mb-1 block text-sm font-bold flex items-center gap-1">
              <Clock className="h-4 w-4" /> Perkiraan Waktu Sampai
            </label>
            <select
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              className="h-14 w-full rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
            >
              <option value="30 menit - 1 jam">30 menit - 1 jam</option>
              <option value="1-2 jam">1-2 jam</option>
              <option value="2-4 jam">2-4 jam</option>
              <option value="H+1">H+1 (keesokan hari)</option>
              <option value="H+2">H+2</option>
              <option value="1-3 hari">1-3 hari</option>
            </select>
          </div>

          {/* Checklist & Foto */}
          <div className="space-y-3 rounded-xl border border-border p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shippingProofPhoto}
                onChange={(e) => setShippingProofPhoto(e.target.checked)}
                className="mt-1 h-5 w-5 accent-primary"
              />
              <span className="flex items-center gap-1 text-sm">
                <Camera className="h-4 w-4 text-primary" /> 
                Wajib memfoto barang saat dikirim (untuk jaminan)
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryChecklist}
                onChange={(e) => setDeliveryChecklist(e.target.checked)}
                className="mt-1 h-5 w-5 accent-primary"
              />
              <span className="flex items-center gap-1 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" /> 
                Checklist: "Benar-benar akan sampai ke pembeli"
              </span>
            </label>
            {!deliveryChecklist && (
              <p className="text-xs text-danger ml-8">Harus dicentang untuk menjamin barang sampai</p>
            )}
          </div>
        </div>

        {/* ===== PRE-ORDER (Coming Soon) ===== */}
        <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center opacity-70">
          <span className="text-2xl">🚜</span>
          <p className="text-sm font-bold text-muted-foreground">Pre-Order</p>
          <p className="text-xs text-muted-foreground">Coming Soon — Fitur pre-order akan tersedia di versi berikutnya</p>
        </div>

        {/* ===== OPTIONAL DETAILS ===== */}
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
          type="button"
          onClick={handleSubmit}
          disabled={!valid || !deliveryChecklist}
          className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          Simpan Produk
        </button>
        {!deliveryChecklist && (
          <p className="mt-1 text-xs text-danger text-center">Centang checklist pengiriman terlebih dahulu</p>
        )}
      </div>
    </MobileShell>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", icon }: { 
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold flex items-center gap-1">{icon} {label}</label>
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