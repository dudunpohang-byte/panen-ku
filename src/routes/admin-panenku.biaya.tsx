import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { getAdminSettings, setAdminSettings, type AdminSettings } from "@/lib/store";
import { rupiah } from "@/lib/format";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { AdminConfirmDialog, useAdminConfirm } from "@/components/AdminConfirm";

export const Route = createFileRoute("/admin-panenku/biaya")({
  component: BiayaOngkir,
});

function BiayaOngkir() {
  const session = useSession();
  const navigate = useNavigate();
  const [s, setS] = useState<AdminSettings>(() => getAdminSettings());
  const confirm = useAdminConfirm();

  useEffect(() => {
    if (!session || session.role !== "admin") navigate({ to: "/admin-panenku" });
  }, [session, navigate]);

  if (!session || session.role !== "admin") return null;

  const save = () => {
    const current = getAdminSettings();
    const diffs: string[] = [];
    (Object.keys(s) as Array<keyof AdminSettings>).forEach((k) => {
      if (current[k] !== s[k]) diffs.push(`${k}: ${current[k]} → ${s[k]}`);
    });
    if (diffs.length === 0) {
      toast("Tidak ada perubahan untuk disimpan.");
      return;
    }
    confirm.ask({
      action: "UPDATE_FEE_SETTINGS",
      title: "Simpan perubahan biaya & ongkir",
      target: "AdminSettings (global)",
      risk: diffs.some((d) => d.startsWith("adminFeePercent")) ? "high" : "medium",
      summary: [
        `${diffs.length} parameter akan diubah`,
        ...diffs.slice(0, 6),
        "Perubahan berlaku seketika untuk semua transaksi baru",
      ],
      onConfirm: () => {
        setAdminSettings(s);
        toast.success("Pengaturan tersimpan");
      },
    });
  };

  const set = <K extends keyof AdminSettings>(k: K, v: number) => setS({ ...s, [k]: v });

  // Preview perhitungan untuk 15 km
  const previewKm = 15;
  const ownPreview = s.ownDeliveryBaseFee + previewKm * s.ownDeliveryPerKm;
  const tpPreview = s.thirdPartyBaseFee + previewKm * s.thirdPartyPerKm;

  return (
    <div className="space-y-4 p-3 pb-32">
      <Card title="💰 Biaya Layanan Platform">
        <NumberField
          label="Persentase biaya admin (%)"
          value={s.adminFeePercent}
          onChange={(v) => set("adminFeePercent", v)}
          step={0.5}
          max={30}
          suffix="%"
          help="Dipotong dari pendapatan petani per transaksi."
        />
      </Card>

      <Card title="🚚 Antar oleh Petani (Kirim Sendiri)">
        <NumberField label="Tarif dasar (Rp)" value={s.ownDeliveryBaseFee} onChange={(v) => set("ownDeliveryBaseFee", v)} step={1000} />
        <NumberField label="Tarif per km (Rp)" value={s.ownDeliveryPerKm} onChange={(v) => set("ownDeliveryPerKm", v)} step={500} />
        <p className="text-xs text-muted-foreground">
          Contoh 15 km: <strong>{rupiah(ownPreview)}</strong>
        </p>
      </Card>

      <Card title="📦 Jasa Kirim Pihak Ketiga">
        <NumberField label="Tarif dasar (Rp)" value={s.thirdPartyBaseFee} onChange={(v) => set("thirdPartyBaseFee", v)} step={1000} />
        <NumberField label="Tarif per km (Rp)" value={s.thirdPartyPerKm} onChange={(v) => set("thirdPartyPerKm", v)} step={500} />
        <p className="text-xs text-muted-foreground">
          Contoh 15 km: <strong>{rupiah(tpPreview)}</strong>
        </p>
      </Card>

      <Card title="🎁 Gratis Ongkir">
        <NumberField
          label="Min belanja gratis ongkir (Rp)"
          value={s.freeShippingMinSubtotal}
          onChange={(v) => set("freeShippingMinSubtotal", v)}
          step={10000}
          help="Belanja di atas nilai ini → ongkir antar/jasa kirim jadi gratis."
        />
      </Card>

      <div
        className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-card p-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <button
          onClick={save}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-primary-foreground"
        >
          <Save className="h-5 w-5" /> Simpan Pengaturan
        </button>
      </div>

      <AdminConfirmDialog admin={session} request={confirm.request} onClose={confirm.close} />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-card">
      <h2 className="mb-3 text-base font-extrabold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  max,
  suffix,
  help,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  max?: number;
  suffix?: string;
  help?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>
      <div className="flex h-14 items-center rounded-xl border-2 border-border bg-background px-3">
        <input
          type="number"
          value={value}
          step={step}
          min={0}
          max={max}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-full flex-1 bg-transparent text-lg font-bold outline-none"
        />
        {suffix && <span className="ml-2 text-base font-bold text-muted-foreground">{suffix}</span>}
      </div>
      {help && <p className="mt-1 text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}
