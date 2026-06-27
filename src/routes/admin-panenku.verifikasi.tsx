import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, X, Sprout, Eye, EyeOff, Copy, MessageCircle, MapPin, Calendar, Award, Phone, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getUsers, setFarmerStatus, type User } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { toast } from "sonner";
import { AdminConfirmDialog, useAdminConfirm } from "@/components/AdminConfirm";

export const Route = createFileRoute("/admin-panenku/verifikasi")({
  component: Verifikasi,
});

function Verifikasi() {
  const session = useSession();
  const navigate = useNavigate();
  const users = useStoreSubscription(() => getUsers());
  const [openId, setOpenId] = useState<string | null>(null);
  const [showPin, setShowPin] = useState<Record<string, boolean>>({});
  const confirm = useAdminConfirm();

  useEffect(() => {
    if (!session || session.role !== "admin") navigate({ to: "/admin-panenku" });
  }, [session, navigate]);

  if (!session || session.role !== "admin") return null;

  const farmers = users.filter((u) => u.role === "farmer");
  const pending = farmers.filter((f) => f.status === "pending");
  const approved = farmers.filter((f) => f.status === "approved");
  const rejected = farmers.filter((f) => f.status === "rejected");

  const approve = (id: string, name: string, wasRejected = false) => {
    confirm.ask({
      action: wasRejected ? "REINSTATE_FARMER" : "VERIFY_FARMER",
      title: wasRejected ? "Setujui ulang akun petani" : "Setujui verifikasi petani",
      target: `${name} (${id})`,
      risk: "medium",
      summary: [
        `Mengubah status akun ${name} menjadi APPROVED`,
        "Akun dapat langsung memasarkan produk ke pembeli",
        "Produk petani ini muncul di etalase publik",
      ],
      onConfirm: () => {
        setFarmerStatus(id, "approved");
        toast.success(`${name} diverifikasi & bisa langsung jualan`);
      },
    });
  };
  const reject = (id: string, name: string, wasApproved = false) => {
    confirm.ask({
      action: wasApproved ? "REVOKE_FARMER" : "REJECT_FARMER",
      title: wasApproved ? "Cabut verifikasi petani" : "Tolak pendaftaran petani",
      target: `${name} (${id})`,
      risk: "high",
      summary: [
        `Mengubah status akun ${name} menjadi REJECTED`,
        "Produk milik petani ini segera disembunyikan dari etalase",
        wasApproved
          ? "Tidak ada penjualan baru sampai diaktifkan kembali"
          : "Petani perlu mengajukan ulang untuk dapat berjualan",
      ],
      onConfirm: () => {
        setFarmerStatus(id, "rejected");
        toast.success(`${name} ditolak`);
      },
    });
  };

  const togglePin = (id: string) => setShowPin((p) => ({ ...p, [id]: !p[id] }));
  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} disalin`);
    } catch {
      toast.error("Gagal menyalin");
    }
  };
  const waLink = (phone: string, name: string, pin: string) => {
    const num = phone.replace(/^0/, "62").replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Halo ${name}, ini admin PanenKu. PIN akun Anda: ${pin}. Mohon segera ganti PIN setelah masuk demi keamanan.`,
    );
    return `https://wa.me/${num}?text=${msg}`;
  };

  return (
    <div className="space-y-4 p-3 pb-12">
      <div className="rounded-2xl border-2 border-warning/40 bg-warning/10 p-3 text-xs text-foreground">
        <p className="font-bold">ℹ️ Mode Uji Coba</p>
        <p className="mt-1 text-muted-foreground">
          Klik <strong>kartu petani</strong> untuk lihat profil lengkap & PIN (untuk bantu petani yang lupa PIN). Tombol
          ⚡ <strong>Setujui</strong> di header langsung mengaktifkan akun tanpa proses lain.
        </p>
      </div>

      <Section title={`⏳ Menunggu Verifikasi (${pending.length})`}>
        {pending.length === 0 ? (
          <Empty msg="Tidak ada petani menunggu" />
        ) : (
          pending.map((f) => (
            <FarmerCard
              key={f.id}
              farmer={f}
              open={openId === f.id}
              onToggle={() => setOpenId(openId === f.id ? null : f.id)}
              showPin={!!showPin[f.id]}
              onTogglePin={() => togglePin(f.id)}
              onCopy={copy}
              waLink={waLink}
            >
              <button
                onClick={() => approve(f.id, f.name)}
                className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-success font-bold text-success-foreground"
              >
                <Check className="h-5 w-5" /> Setujui Cepat
              </button>
              <button
                onClick={() => reject(f.id, f.name)}
                className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-danger font-bold text-danger-foreground"
              >
                <X className="h-5 w-5" /> Tolak
              </button>
            </FarmerCard>
          ))
        )}
      </Section>

      <Section title={`✅ Terverifikasi (${approved.length})`}>
        {approved.length === 0 ? (
          <Empty msg="Belum ada petani aktif" />
        ) : (
          approved.map((f) => (
            <FarmerCard
              key={f.id}
              farmer={f}
              open={openId === f.id}
              onToggle={() => setOpenId(openId === f.id ? null : f.id)}
              showPin={!!showPin[f.id]}
              onTogglePin={() => togglePin(f.id)}
              onCopy={copy}
              waLink={waLink}
            >
              <button
                onClick={() => reject(f.id, f.name, true)}
                className="h-10 flex-1 rounded-xl border-2 border-danger text-sm font-bold text-danger"
              >
                Cabut Verifikasi
              </button>
            </FarmerCard>
          ))
        )}
      </Section>

      {rejected.length > 0 && (
        <Section title={`❌ Ditolak (${rejected.length})`}>
          {rejected.map((f) => (
            <FarmerCard
              key={f.id}
              farmer={f}
              open={openId === f.id}
              onToggle={() => setOpenId(openId === f.id ? null : f.id)}
              showPin={!!showPin[f.id]}
              onTogglePin={() => togglePin(f.id)}
              onCopy={copy}
              waLink={waLink}
            >
              <button
                onClick={() => approve(f.id, f.name, true)}
                className="h-10 flex-1 rounded-xl border-2 border-success text-sm font-bold text-success"
              >
                Setujui Ulang
              </button>
            </FarmerCard>
          ))}
        </Section>
      )}

      <AdminConfirmDialog admin={session} request={confirm.request} onClose={confirm.close} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-extrabold">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
function Empty({ msg }: { msg: string }) {
  return <div className="rounded-2xl bg-card p-4 text-center text-sm text-muted-foreground shadow-card">{msg}</div>;
}
function FarmerCard({
  farmer,
  children,
  open,
  onToggle,
  showPin,
  onTogglePin,
  onCopy,
  waLink,
}: {
  farmer: User;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  showPin: boolean;
  onTogglePin: () => void;
  onCopy: (text: string, label: string) => void;
  waLink: (phone: string, name: string, pin: string) => string;
}) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <button onClick={onToggle} className="flex w-full items-start gap-3 text-left">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Sprout className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold">{farmer.name}</p>
          <p className="text-sm text-muted-foreground">{farmer.farmName ?? "-"}</p>
          <p className="text-xs text-muted-foreground">📍 {farmer.farmLocation ?? "-"}</p>
          <p className="text-xs text-muted-foreground">📞 {farmer.phone}</p>
        </div>
        <span className="text-xs font-bold text-primary">{open ? "Tutup ▲" : "Detail ▼"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 rounded-xl bg-muted/40 p-3 text-sm">
          {/* Profil Toko */}
          <div>
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Profil Toko</p>
            <div className="space-y-1">
              <Row icon={<Sprout className="h-4 w-4" />} label="Nama Kebun" value={farmer.farmName ?? "-"} />
              <Row icon={<Calendar className="h-4 w-4" />} label="Berdiri" value={farmer.farmEstablished ?? "-"} />
              <Row icon={<MapPin className="h-4 w-4" />} label="Alamat" value={farmer.fullAddress ?? farmer.farmLocation ?? "-"} />
              {farmer.farmDescription && (
                <p className="mt-2 rounded-lg bg-card p-2 text-xs leading-relaxed text-muted-foreground">
                  “{farmer.farmDescription}”
                </p>
              )}
              {!!farmer.certifications?.length && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <Award className="h-4 w-4 text-success" />
                  {farmer.certifications.map((c) => (
                    <span key={c} className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Akun & Keuangan */}
          <div>
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Akun</p>
            <Row icon={<Phone className="h-4 w-4" />} label="No. HP" value={farmer.phone} />
            <div className="mt-1 flex items-center justify-between rounded-lg bg-card p-2">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-warning" />
                <span className="text-xs font-bold">PIN</span>
                <code className="rounded bg-muted px-2 py-0.5 font-mono text-sm tracking-widest">
                  {showPin ? farmer.pin : "••••••"}
                </code>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={onTogglePin}
                  className="flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-xs font-bold"
                >
                  {showPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPin ? "Sembunyi" : "Lihat"}
                </button>
                <button
                  onClick={() => onCopy(farmer.pin, "PIN")}
                  className="flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-xs font-bold"
                  aria-label="Salin PIN"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Gunakan untuk membantu petani yang lupa PIN. Sarankan ganti PIN setelah masuk.
            </p>

            <a
              href={waLink(farmer.phone, farmer.name, farmer.pin)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex h-10 items-center justify-center gap-2 rounded-xl bg-success/15 text-sm font-bold text-success"
            >
              <MessageCircle className="h-4 w-4" /> Kirim PIN via WhatsApp
            </a>
          </div>

          {/* Saldo */}
          {farmer.role === "farmer" && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-card p-2 text-center">
                <p className="text-[10px] text-muted-foreground">Saldo</p>
                <p className="text-sm font-extrabold text-success">
                  Rp {(farmer.balance ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-lg bg-card p-2 text-center">
                <p className="text-[10px] text-muted-foreground">Pending</p>
                <p className="text-sm font-extrabold text-warning">
                  Rp {(farmer.pendingBalance ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-2">{children}</div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <span className="font-bold text-muted-foreground">{label}:</span>
      <span className="flex-1 text-foreground">{value}</span>
    </div>
  );
}
