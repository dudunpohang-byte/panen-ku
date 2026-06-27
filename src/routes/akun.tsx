import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Sprout, User as UserIcon, Phone, MapPin, Settings, Type, Volume2, ShieldCheck, Camera, X, FileText, HelpCircle, Shield, MessageSquare } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { logout, updateUser } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { usePrefs } from "@/hooks/use-prefs";
import logo from "@/assets/logo-panenku.png";
import { toast } from "sonner";
import { useRef, useState } from "react";

const MAX_AVATAR_DIM = 512;
const MAX_AVATAR_BYTES = 250_000;

async function fileToAvatarDataURL(file: File): Promise<string> {
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
  // Crop center square
  const size = Math.min(img.width, img.height);
  const sx = (img.width - size) / 2;
  const sy = (img.height - size) / 2;
  const out = Math.min(MAX_AVATAR_DIM, size);
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung");
  ctx.drawImage(img, sx, sy, size, size, 0, 0, out, out);
  let q = 0.85;
  let result = canvas.toDataURL("image/jpeg", q);
  while (result.length > MAX_AVATAR_BYTES && q > 0.4) {
    q -= 0.1;
    result = canvas.toDataURL("image/jpeg", q);
  }
  return result;
}

export const Route = createFileRoute("/akun")({
  component: Akun,
});

function Akun() {
  const session = useSession();
  const navigate = useNavigate();
  const [prefs, setPrefs] = usePrefs();

  if (!session) {
    return (
      <MobileShell>
        <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
          <Link to="/" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold">Akun</h1>
        </header>

        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <span className="logo-anim inline-block overflow-hidden">
            <img src={logo} alt="Panenku" className="h-20 w-auto" width={200} height={80} />
          </span>
          <p className="mt-4 text-lg font-semibold">Selamat datang di Panenku</p>
          <p className="text-muted-foreground">Masuk untuk mulai belanja atau berjualan</p>
          <div className="mt-6 flex w-full flex-col gap-3">
            <button
              onClick={() => navigate({ to: "/masuk" })}
              className="h-14 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground"
            >
              Masuk
            </button>
            <button
              onClick={() => navigate({ to: "/daftar" })}
              className="h-14 w-full rounded-xl border-2 border-primary text-base font-bold text-primary"
            >
              Daftar Baru
            </button>
          </div>

          {/* Aksesibilitas tetap tersedia untuk tamu */}
          <div className="mt-8 w-full">
            <AccessibilityCard prefs={prefs} setPrefs={setPrefs} />
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
        <Link to="/" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Akun Saya</h1>
      </header>

      {/* Profile card */}
      <section className="bg-primary p-4 pt-2 pb-6 text-primary-foreground">
        <div className="flex items-center gap-3">
          <AvatarEditor user={session} />
          <div>
            <p className="text-xl font-bold">{session.name}</p>
            <p className="text-sm opacity-90">{session.phone}</p>
            <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold">
              {session.role === "farmer"
                ? `🌱 Petani · ${session.status === "approved" ? "Terverifikasi" : session.status === "pending" ? "Menunggu Verifikasi" : "Ditolak"}`
                : session.role === "admin"
                ? "🛡️ Admin"
                : "🛍️ Pembeli"}
            </span>
          </div>
        </div>
      </section>

      <div className="space-y-2 p-3">
        {session.role === "farmer" && session.status !== "approved" && (
          <div className="rounded-2xl border-2 border-promo bg-promo/10 p-4 text-sm">
            <p className="font-bold text-promo">⏳ Akun petani Anda sedang ditinjau</p>
            <p className="mt-1 text-muted-foreground">
              Produk Anda belum tampil ke pembeli sebelum disetujui admin. Anda masih bisa menambah produk sambil menunggu.
            </p>
          </div>
        )}

        {session.role === "farmer" && (
          <Link
            to="/petani"
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card active:bg-primary-soft"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Sprout className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold">Dashboard Petani</p>
              <p className="text-sm text-muted-foreground">Kelola produk & pesanan</p>
            </div>
          </Link>
        )}

        {session.role === "admin" && (
          <Link
            to="/admin-panenku"
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card active:bg-primary-soft"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold">Dashboard Admin</p>
              <p className="text-sm text-muted-foreground">Verifikasi, biaya, statistik</p>
            </div>
          </Link>
        )}

        {session.role === "buyer" && (
          <Link
            to="/daftar"
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card active:bg-primary-soft"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-promo/15 text-promo">
              <Sprout className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold">Jadi Petani Penjual</p>
              <p className="text-sm text-muted-foreground">Jual hasil panenmu sendiri</p>
            </div>
          </Link>
        )}

        {/* Chat — semua role */}
        <Link
          to="/chat"
          className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card active:bg-primary-soft"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold">Pesan Chat</p>
            <p className="text-sm text-muted-foreground">
              {session.role === "farmer" ? "Percakapan dengan pembeli" : "Hubungi petani langsung"}
            </p>
          </div>
          <span className="text-muted-foreground text-lg">›</span>
        </Link>

        <InfoRow icon={UserIcon} label="Nama" value={session.name} />
        <InfoRow icon={Phone} label="Nomor HP" value={session.phone} />
        {session.role === "farmer" && (
          <>
            <InfoRow icon={Sprout} label="Nama Kebun" value={session.farmName ?? "-"} />
            <InfoRow icon={MapPin} label="Lokasi Kebun" value={session.farmLocation ?? "-"} />
          </>
        )}

        <AccessibilityCard prefs={prefs} setPrefs={setPrefs} />

        {/* Legal & Help links */}
        <div className="rounded-2xl bg-card p-2 shadow-card space-y-1">
          <LegalRow icon={FileText} label="Syarat & Ketentuan" to="/syarat" />
          <LegalRow icon={Shield} label="Kebijakan Privasi" to="/privasi" />
          <LegalRow icon={HelpCircle} label="Bantuan & FAQ" to="/bantuan" />
        </div>

        <button
          onClick={() => toast.info("Pengaturan tambahan akan datang")}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-card active:bg-muted"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
            <Settings className="h-6 w-6" />
          </div>
          <p className="flex-1 text-left text-base font-bold">Pengaturan Lainnya</p>
        </button>

        <button
          onClick={() => {
            logout();
            toast.success("Anda telah keluar");
            navigate({ to: "/" });
          }}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-danger text-base font-bold text-danger"
        >
          <LogOut className="h-5 w-5" /> Keluar
        </button>
      </div>
    </MobileShell>
  );
}

function AvatarEditor({ user }: { user: import("@/lib/store").User }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const fallback = user.role === "farmer" ? "👨‍🌾" : user.role === "admin" ? "🛡️" : "🙂";

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToAvatarDataURL(file);
      updateUser({ ...user, avatar: dataUrl });
      toast.success("Foto profil diperbarui");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memproses foto");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeAvatar = () => {
    updateUser({ ...user, avatar: undefined });
    toast.success("Foto profil dihapus");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        aria-label="Ubah foto profil"
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white text-3xl shadow-md ring-2 ring-white/40 disabled:opacity-60"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <span>{fallback}</span>
        )}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/55 py-0.5 text-[10px] font-bold text-white">
          <Camera className="mr-1 h-3 w-3" /> Ubah
        </span>
      </button>
      {user.avatar && (
        <button
          type="button"
          onClick={removeAvatar}
          aria-label="Hapus foto profil"
          className="absolute -right-1 -top-1 rounded-full bg-danger p-1 text-white shadow"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

function AccessibilityCard({
  prefs,
  setPrefs,
}: {
  prefs: { largeFont: boolean; voiceOver: boolean };
  setPrefs: (next: Partial<{ largeFont: boolean; voiceOver: boolean }>) => void;
}) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <p className="px-1 pb-2 text-sm font-bold uppercase text-muted-foreground">Mode Lansia</p>
      <Toggle
        icon={Type}
        title="Teks Besar"
        desc="Perbesar semua teks & tombol"
        on={prefs.largeFont}
        onChange={(v) => setPrefs({ largeFont: v })}
      />
      <Toggle
        icon={Volume2}
        title="Voice Over Saat Bayar"
        desc="Suara membaca total & alamat sebelum bayar"
        on={prefs.voiceOver}
        onChange={(v) => setPrefs({ voiceOver: v })}
      />
    </div>
  );
}

function Toggle({
  icon: Icon,
  title,
  desc,
  on,
  onChange,
}: {
  icon: typeof Type;
  title: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex w-full items-center gap-3 rounded-xl p-3 text-left active:bg-muted"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${on ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <p className="font-bold">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted-foreground/30"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`} />
      </div>
    </button>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof UserIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
  );
}

function LegalRow({
  icon: Icon,
  label,
  to,
}: {
  icon: typeof FileText;
  label: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex w-full items-center gap-3 rounded-xl p-3 text-left active:bg-muted transition-colors"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="flex-1 text-base font-bold">{label}</p>
      <span className="text-muted-foreground text-lg">›</span>
    </Link>
  );
}
