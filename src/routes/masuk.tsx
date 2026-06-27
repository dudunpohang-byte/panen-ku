import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShoppingBag, Sprout } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { loginUser, type Role } from "@/lib/store";
import logo from "@/assets/logo-panenku.png";
import { toast } from "sonner";

type SearchParams = { redirect?: string };

export const Route = createFileRoute("/masuk")({
  validateSearch: (search): SearchParams => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "",
  }),
  component: Masuk,
});

function Masuk() {
  const navigate = useNavigate();
  const sp = Route.useSearch();
  const [role, setRole] = useState<Extract<Role, "buyer" | "farmer">>("buyer");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = loginUser(phone, pin);
      // Validasi role yang dipilih cocok dengan akun
      if (user.role !== role) {
        toast.error(
          `Akun ini terdaftar sebagai ${user.role === "farmer" ? "Penjual (Petani)" : "Pembeli"}. Silakan pilih tab yang sesuai.`,
        );
        return;
      }
      toast.success(`Selamat datang, ${user.name}!`);
      const fallback = user.role === "farmer" ? "/petani" : "/";
      const raw = sp.redirect || "";
      // Only allow same-origin relative paths (must start with "/" and not "//" or "/\")
      const safeRedirect =
        raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\")
          ? raw
          : fallback;
      window.location.href = safeRedirect;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal masuk");
    }
  };

  return (
    <MobileShell hideNav>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-card px-2 py-3">
        <Link to="/akun" aria-label="Kembali" className="rounded-full p-2 hover:bg-muted">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Masuk</h1>
      </header>

      <div className="p-6">
        <div className="flex flex-col items-center">
          <span className="logo-anim inline-block overflow-hidden">
            <img src={logo} alt="Panenku" className="h-16 w-auto" width={180} height={64} />
          </span>
          <p className="mt-2 text-center text-muted-foreground">Pilih jenis akun lalu masuk</p>
        </div>

        {/* Pilih role */}
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors ${
              role === "buyer" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            <ShoppingBag className="h-5 w-5" /> Pembeli
          </button>
          <button
            type="button"
            onClick={() => setRole("farmer")}
            className={`flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors ${
              role === "farmer" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            <Sprout className="h-5 w-5" /> Penjual
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold">Nomor HP</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="Contoh: 081234567890"
              required
              maxLength={15}
              className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-lg outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">PIN (6 digit)</label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              required
              maxLength={6}
              className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={phone.length < 9 || pin.length !== 6}
            className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50"
          >
            Masuk sebagai {role === "buyer" ? "Pembeli" : "Penjual"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Belum punya akun?</p>
          <Link
            to="/daftar"
            search={{ role }}
            className="mt-2 inline-block text-base font-bold text-primary"
          >
            Daftar Baru
          </Link>
        </div>

        <div className="mt-8 rounded-xl bg-primary-soft p-3 text-sm">
          <p className="font-bold">💡 Akun demo petani:</p>
          <p>HP: <span className="font-mono font-bold">081200000001</span></p>
          <p>PIN: <span className="font-mono font-bold">111111</span></p>
          <p className="mt-1 text-xs text-muted-foreground">Pilih tab "Penjual" untuk masuk demo ini.</p>
        </div>
      </div>
    </MobileShell>
  );
}
