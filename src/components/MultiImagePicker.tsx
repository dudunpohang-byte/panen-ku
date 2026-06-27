import { Camera, ImagePlus, X, Star } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX_DIMENSION = 1024;
const MAX_BYTES = 800_000;
const MAX_PHOTOS = 5;

async function compress(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("Gagal membaca file"));
    fr.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Gambar tidak valid"));
    i.src = dataUrl;
  });
  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const r = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * r);
    height = Math.round(height * r);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung");
  ctx.drawImage(img, 0, 0, width, height);
  let q = 0.85;
  let out = canvas.toDataURL("image/jpeg", q);
  while (out.length > MAX_BYTES && q > 0.4) {
    q -= 0.1;
    out = canvas.toDataURL("image/jpeg", q);
  }
  return out;
}

/**
 * Pemilih foto banyak (multi).
 * - Foto pertama otomatis jadi foto utama (sampul).
 * - Pengguna bisa ketuk thumbnail untuk menjadikannya utama.
 * - Maks 5 foto.
 */
export function MultiImagePicker({
  value,
  onChange,
  label = "Foto Produk",
  max = MAX_PHOTOS,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const remaining = Math.max(0, max - value.length);
      const list = Array.from(files).slice(0, remaining);
      const results: string[] = [];
      for (const f of list) {
        try {
          results.push(await compress(f));
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Gagal memproses foto");
        }
      }
      if (results.length) {
        onChange([...value, ...results]);
        toast.success(`${results.length} foto ditambahkan`);
      }
      if (files.length > remaining) {
        toast.info(`Maks ${max} foto`);
      }
    } finally {
      setBusy(false);
    }
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const makeMain = (i: number) => {
    if (i === 0) return;
    const next = [...value];
    const [picked] = next.splice(i, 1);
    next.unshift(picked);
    onChange(next);
  };

  const canAdd = value.length < max;

  return (
    <div>
      <label className="mb-1 block text-sm font-bold">
        {label} <span className="text-xs font-normal text-muted-foreground">({value.length}/{max})</span>
      </label>

      {value.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted">
          <p className="text-sm text-muted-foreground">Belum ada foto</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {value.map((src, i) => (
            <div
              key={i}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 ${
                i === 0 ? "border-primary" : "border-border"
              } bg-muted`}
            >
              <button
                type="button"
                onClick={() => setPreview(i)}
                className="block h-full w-full"
                aria-label={`Pratinjau foto ${i + 1}`}
              >
                <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              </button>
              {i === 0 && (
                <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  <Star className="h-2.5 w-2.5 fill-current" /> Utama
                </span>
              )}
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => makeMain(i)}
                  className="absolute left-1 top-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-primary"
                >
                  Jadikan utama
                </button>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Hapus foto"
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAdd && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={busy}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            <Camera className="h-5 w-5" /> Kamera
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={busy}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card text-sm font-bold text-primary disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" /> Galeri
          </button>
        </div>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        Foto pertama jadi sampul. Ketuk foto untuk melihat besar.
      </p>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />

      {/* Lightbox */}
      {preview !== null && value[preview] && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreview(null)}
          role="dialog"
        >
          <img
            src={value[preview]}
            alt={`Pratinjau ${preview + 1}`}
            className="max-h-full max-w-full rounded-xl object-contain"
          />
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-bold"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
