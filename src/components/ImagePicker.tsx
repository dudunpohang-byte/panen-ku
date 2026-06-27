import { Camera, ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX_DIMENSION = 1024;
const MAX_BYTES = 800_000; // ~800KB after compression

async function fileToCompressedDataURL(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar");
  }
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
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.85;
  let out = canvas.toDataURL("image/jpeg", quality);
  while (out.length > MAX_BYTES && quality > 0.4) {
    quality -= 0.1;
    out = canvas.toDataURL("image/jpeg", quality);
  }
  return out;
}

export function ImagePicker({
  value,
  onChange,
  label = "Foto Produk",
}: {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToCompressedDataURL(file);
      onChange(dataUrl);
      toast.success("Foto siap dipakai");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memproses foto");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-muted">
          <img src={value} alt="Pratinjau" className="h-56 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Hapus foto"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted">
          <p className="text-sm text-muted-foreground">Belum ada foto</p>
        </div>
      )}
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
      <p className="mt-1 text-xs text-muted-foreground">
        Foto otomatis diperkecil. Disimpan sementara di perangkat (tanpa server) untuk uji coba.
      </p>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
