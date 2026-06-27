import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Wallet, Building2, Smartphone, CheckCircle2, Clock, XCircle, History, ExternalLink } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { rupiah } from "@/lib/format";
import { updateUser } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { EWALLET_LIST, BANK_LIST } from "@/assets/payment-logos";
import { createWithdrawalRequest, getFarmerWithdrawals, type WithdrawalRequest } from "@/lib/payments";

export const Route = createFileRoute("/petani/tarik-dana")({
  component: TarikDana,
});

const EWALLETS = EWALLET_LIST.map(e => ({ id: e.id, name: e.name, emoji: e.name[0], color: "bg-primary-soft text-primary" }));
const BANKS = BANK_LIST.map(b => ({ id: b.id, name: b.name, emoji: "🏦", color: "bg-primary-soft text-primary" }));

function TarikDana() {
  const session = useSession();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bank" | "ewallet">("bank");
  const [provider, setProvider] = useState<string>("bca");
  const [account, setAccount] = useState("");
  const [accountName, setAccountName] = useState("");

  if (!session || session.role !== "farmer") {
    if (typeof window !== "undefined") navigate({ to: "/masuk", search: { redirect: "/petani/tarik-dana" } });
    return null;
  }

  const balance = session.balance ?? 0;
  const pending = session.pendingBalance ?? 0;
  const amt = Number(amount);
  const providers = method === "bank" ? BANKS : EWALLETS;
  const selectedProvider = providers.find((p) => p.id === provider) ?? providers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amt < 10000) { toast.error("Minimal tarik Rp 10.000"); return; }
    if (amt > balance) { toast.error("Saldo tidak cukup"); return; }
    if (account.length < 6) { toast.error("Mohon isi nomor rekening/HP"); return; }
    if (accountName.trim().length < 2) { toast.error("Mohon isi nama pemilik rekening"); return; }

    // Buat withdrawal request yang perlu disetujui admin
    createWithdrawalRequest({
      farmerId: session.id,
      farmerName: session.name,
      farmName: session.farmName || "",
      accountName,
      accountNumber: account,
      provider: selectedProvider.name,
      providerType: method,
      amount: amt,
    });

    // Freeze saldo (pindahkan ke pendingBalance)
    updateUser({ ...session, balance: balance - amt, pendingBalance: pending + amt });

    toast.success(`Permintaan tarik ${rupiah(amt)} ke ${selectedProvider.name} berhasil!`, {
      description: `a.n. ${accountName} · sedang diverifikasi admin (1x24 jam)`,
    });
    navigate({ to: "/petani" });
  };

  return (
    <MobileShell hideNav>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
        <Link to="/petani" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Tarik Dana</h1>
      </header>

      {/* Saldo */}
      <section className="bg-primary px-4 pt-2 pb-6 text-primary-foreground">
        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          <p className="text-sm opacity-90">Saldo Tersedia</p>
          <p className="mt-1 text-3xl font-extrabold">{rupiah(balance)}</p>
          <div className="mt-3 border-t border-white/20 pt-2 text-sm opacity-90">
            Dana ditahan: <span className="font-bold">{rupiah(pending)}</span>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 pb-32">
        <div>
          <label className="mb-1 block text-sm font-bold">Jumlah Penarikan</label>
          <div className="flex h-14 items-center rounded-xl border-2 border-border bg-background px-4">
            <span className="mr-2 text-lg font-bold text-muted-foreground">Rp</span>
            <input
              type="tel"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="h-full flex-1 bg-transparent text-2xl font-bold outline-none"
            />
          </div>
          <div className="mt-2 flex gap-2">
            {[50000, 100000, 250000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(Math.min(v, balance)))}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold"
              >
                {rupiah(v)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold">Pilih Tujuan</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setMethod("bank"); setProvider("bca"); }}
              className={`flex h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 ${
                method === "bank" ? "border-primary bg-primary-soft" : "border-border bg-card"
              }`}
            >
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold">Bank</span>
            </button>
            <button
              type="button"
              onClick={() => { setMethod("ewallet"); setProvider("dana"); }}
              className={`flex h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 ${
                method === "ewallet" ? "border-primary bg-primary-soft" : "border-border bg-card"
              }`}
            >
              <Smartphone className="h-6 w-6 text-primary" />
              <span className="font-bold">E-Wallet</span>
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold">
            {method === "bank" ? "Pilih Bank" : "Pilih E-Wallet"}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p.id)}
                className={`flex h-16 flex-col items-center justify-center gap-0.5 rounded-xl border-2 text-xs font-bold ${
                  provider === p.id ? "border-primary bg-primary-soft" : "border-border bg-card"
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${p.color} text-base`}>
                  {p.emoji}
                </span>
                <span className="leading-tight">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold">
            {method === "bank" ? "Nomor Rekening" : "Nomor HP E-Wallet"}
          </label>
          <input
            type="tel"
            value={account}
            onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
            placeholder={method === "bank" ? "Contoh: 1234567890" : "Contoh: 081234567890"}
            className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold">Nama Pemilik Rekening</label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Sesuai buku tabungan / akun"
            className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
          />
        </div>

        <div className="rounded-xl bg-primary-soft p-3 text-sm">
          <p className="flex items-center gap-2 font-bold">
            <Wallet className="h-4 w-4" /> Info Penarikan
          </p>
          <ul className="mt-1 list-inside list-disc text-muted-foreground">
            <li>Minimal tarik Rp 10.000</li>
            <li>Diproses 1x24 jam kerja</li>
            <li>Bebas biaya admin</li>
            <li>Tujuan: <strong>{selectedProvider.name}</strong></li>
          </ul>
        </div>
      </form>

      <div
        className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-card p-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <button
          onClick={handleSubmit}
          disabled={amt < 10000 || amt > balance || account.length < 6 || accountName.trim().length < 2}
          className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50"
        >
          Tarik ke {selectedProvider.name}
        </button>
      </div>
    </MobileShell>
  );
}
