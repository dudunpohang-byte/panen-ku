import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, Award, ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ImagePicker } from "@/components/ImagePicker";
import { updateUser } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export const Route = createFileRoute("/petani/sertifikat")({
  component: SertifikatPetani,
});

const SUGGESTED = ["Organik Indonesia", "Prima 3", "GAP", "GlobalG.A.P.", "USDA Organic", "Halal MUI"];

function SertifikatPetani() {
  const session = useSession();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  if (!session) {
    if (typeof window !== "undefined")
      navigate({ to: "/masuk", search: { redirect: "/petani/sertifikat" } });
    return null;
  }
  if (session.role !== "farmer") {
    if (typeof window !== "undefined") navigate({ to: "/akun" });
    return null;
  }

  const certs = session.certifications ?? [];

  const save = (nextCerts: string[], nextImage?: string | null) => {
    updateUser({
      ...session,
      certifications: nextCerts,
      certificateImage:
        nextImage === null ? undefined : nextImage === undefined ? session.certificateImage : nextImage,
    });
  };

  const addCert = (value: string) => {
    const v = value.trim();
    if (!v) return;
    if (certs.includes(v)) {
      toast.error("Sertifikat sudah ada");
      return;
    }
    save([...certs, v]);
    setDraft("");
    toast.success("Sertifikat ditambahkan");
  };

  const removeCert = (i: number) => {
    if (!confirm(`Hapus sertifikat "${certs[i]}"?`)) return;
    save(certs.filter((_, idx) => idx !== i));
    toast.success("Sertifikat dihapus");
  };

  const commitEdit = () => {
    if (editingIndex == null) return;
    const v = editingValue.trim();
    if (!v) return;
    const next = certs.map((c, idx) => (idx === editingIndex ? v : c));
    save(next);
    setEditingIndex(null);
    setEditingValue("");
    toast.success("Sertifikat diperbarui");
  };

  return (
    <MobileShell hideNav>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
        <Link to="/petani" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Sertifikat Saya</h1>
      </header>

      <div className="space-y-4 p-3 pb-24">
        <div className="rounded-2xl border-2 border-primary/20 bg-primary-soft p-4">
          <div className="flex items-start gap-3">
            <Award className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="font-bold text-primary">Tampilkan kepercayaan</p>
              <p className="text-sm text-muted-foreground">
                Sertifikat akan ditampilkan di profil toko & produk yang Anda pilih.
              </p>
            </div>
          </div>
        </div>

        {/* Foto sertifikat */}
        <section className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="mb-2 text-base font-bold">📸 Foto Sertifikat</h2>
          {session.certificateImage ? (
            <div className="relative overflow-hidden rounded-xl border-2 border-border">
              <img
                src={session.certificateImage}
                alt="Sertifikat"
                className="h-56 w-full object-cover"
              />
              <button
                onClick={() => {
                  if (confirm("Hapus foto sertifikat?")) {
                    save(certs, null);
                    toast.success("Foto dihapus");
                  }
                }}
                aria-label="Hapus foto"
                className="absolute right-2 top-2 rounded-full bg-danger p-2 text-white shadow"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <ImagePicker
              value={undefined}
              onChange={(dataUrl) => {
                if (dataUrl) {
                  save(certs, dataUrl);
                  toast.success("Foto sertifikat disimpan");
                }
              }}
              label="Unggah Foto Sertifikat"
            />
          )}
          {session.certificateImage && (
            <button
              onClick={() => save(certs, null)}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-primary text-sm font-bold text-primary"
            >
              <ImagePlus className="h-4 w-4" /> Ganti Foto
            </button>
          )}
        </section>

        {/* List sertifikat */}
        <section className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="mb-2 text-base font-bold">📜 Daftar Sertifikat</h2>
          {certs.length === 0 ? (
            <div className="rounded-xl bg-muted py-6 text-center text-sm text-muted-foreground">
              Belum ada sertifikat
            </div>
          ) : (
            <ul className="space-y-2">
              {certs.map((c, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-xl border-2 border-border bg-background p-2"
                >
                  {editingIndex === i ? (
                    <>
                      <input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        autoFocus
                        className="h-11 flex-1 rounded-lg border-2 border-primary bg-background px-3 text-base outline-none"
                      />
                      <button
                        onClick={commitEdit}
                        className="h-11 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => {
                          setEditingIndex(null);
                          setEditingValue("");
                        }}
                        className="h-11 rounded-lg border-2 border-border px-3 text-sm font-bold"
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <>
                      <Award className="h-5 w-5 shrink-0 text-promo" />
                      <span className="flex-1 font-semibold">{c}</span>
                      <button
                        onClick={() => {
                          setEditingIndex(i);
                          setEditingValue(c);
                        }}
                        className="h-10 rounded-lg border-2 border-border px-3 text-sm font-bold"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={() => removeCert(i)}
                        aria-label="Hapus"
                        className="rounded-lg p-2 text-danger active:bg-danger/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Tambah baru */}
        <section className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="mb-2 text-base font-bold">➕ Tambah Sertifikat</h2>
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Misal: Organik Indonesia"
              className="h-12 flex-1 rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
            />
            <button
              onClick={() => addCert(draft)}
              disabled={!draft.trim()}
              className="flex h-12 items-center gap-1 rounded-xl bg-primary px-4 font-bold text-primary-foreground disabled:opacity-50"
            >
              <Plus className="h-5 w-5" /> Tambah
            </button>
          </div>
          <p className="mt-3 text-xs font-bold text-muted-foreground">Saran:</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {SUGGESTED.filter((s) => !certs.includes(s)).map((s) => (
              <button
                key={s}
                onClick={() => addCert(s)}
                className="rounded-full border-2 border-primary bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary"
              >
                + {s}
              </button>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}