import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Users, Settings, BarChart3, LogOut, ScrollText, Lock, KeyRound, Wallet, Package, Percent } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { adminLogin, logout } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-panenku")({
  component: AdminLayout,
});

function AdminLayout() {
  const session = useSession();
  const navigate = useNavigate();

  if (!session || session.role !== "admin") {
    return <AdminLogin />;
  }

  return (
    <MobileShell hideNav>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 bg-foreground px-2 py-3 text-background">
        <div className="flex items-center gap-2">
          <Link to="/" aria-label="Keluar admin" className="rounded-full p-2 hover:bg-white/15">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Admin Panenku
          </h1>
        </div>
        <button
          onClick={() => {
            logout();
            toast.success("Logout admin");
            navigate({ to: "/" });
          }}
          className="rounded-full p-2 hover:bg-white/15"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <section className="bg-foreground px-4 pb-5 pt-1 text-background">
        <p className="text-sm opacity-80">Login sebagai</p>
        <p className="text-lg font-bold">{session.name}</p>
      </section>

      <nav className="grid grid-cols-4 gap-2 p-3">
        <NavBtn to="/admin-panenku/verifikasi" icon={Users} label="Verifikasi" />
        <NavBtn to="/admin-panenku/withdrawals" icon={Wallet} label="Penarikan" />
        <NavBtn to="/admin-panenku/security" icon={Lock} label="Keamanan" />
        <NavBtn to="/admin-panenku/biaya" icon={Settings} label="Biaya" />
        <NavBtn to="/admin-panenku/statistik" icon={BarChart3} label="Statistik" />
        <NavBtn to="/admin-panenku/log" icon={ScrollText} label="Log" />
        <NavBtn to="/admin-panenku/diskon" icon={Percent} label="Diskon" />
        <NavBtn to="/admin-panenku/returns" icon={Package} label="Return" />
      </nav>

      <Outlet />
    </MobileShell>
  );
}

function NavBtn({ to, icon: Icon, label }: { to: string; icon: typeof Users; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1 rounded-2xl bg-card p-3 text-center shadow-card active:bg-primary-soft"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      adminLogin(username, password);
      toast.success("Selamat datang, Admin");
      navigate({ to: "/admin-panenku/verifikasi" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login gagal");
    }
  };

  return (
    <MobileShell hideNav>
      <div className="flex min-h-screen flex-col bg-foreground p-6 text-background">
        <Link to="/" className="self-start rounded-full p-2 hover:bg-white/10" aria-label="Kembali">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="mx-auto mt-12 w-full max-w-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-background text-foreground">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold">Admin Panenku</h1>
            <p className="mt-1 text-sm opacity-80">Akses terbatas — internal only</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-bold">Username (bebas)</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Misal: admin"
                className="h-14 w-full rounded-xl border-2 border-white/20 bg-white/5 px-4 text-base text-background placeholder:text-background/50 outline-none focus:border-background"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-14 w-full rounded-xl border-2 border-white/20 bg-white/5 px-4 text-base text-background placeholder:text-background/50 outline-none focus:border-background"
              />
            </div>
            <button
              type="submit"
              disabled={!password}
              className="h-14 w-full rounded-xl bg-background text-lg font-bold text-foreground disabled:opacity-50"
            >
              Masuk Admin
            </button>
          </form>
          <p className="mt-6 text-center text-xs opacity-60">
            Halaman ini tidak terhubung ke menu publik aplikasi.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}
