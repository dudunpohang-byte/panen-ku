import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Ban, Trash2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAdminLogs, type AdminLog, type AdminLogStatus } from "@/lib/store";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { AdminConfirmDialog, useAdminConfirm } from "@/components/AdminConfirm";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-panenku/log")({
  component: LogAudit,
});

const STATUS_FILTERS: Array<{ key: "all" | AdminLogStatus; label: string }> = [
  { key: "all", label: "Semua" },
  { key: "success", label: "✅ Sukses" },
  { key: "failed", label: "⛔ Gagal" },
  { key: "cancelled", label: "↺ Batal" },
];

function LogAudit() {
  const session = useSession();
  const navigate = useNavigate();
  const logs = useStoreSubscription(() => getAdminLogs());
  const [filter, setFilter] = useState<"all" | AdminLogStatus>("all");
  const confirm = useAdminConfirm();

  useEffect(() => {
    if (!session || session.role !== "admin") navigate({ to: "/admin-panenku" });
  }, [session, navigate]);

  if (!session || session.role !== "admin") return null;

  const filtered = useMemo(
    () => (filter === "all" ? logs : logs.filter((l) => l.status === filter)),
    [logs, filter],
  );

  const counts = useMemo(
    () => ({
      success: logs.filter((l) => l.status === "success").length,
      failed: logs.filter((l) => l.status === "failed").length,
      cancelled: logs.filter((l) => l.status === "cancelled").length,
    }),
    [logs],
  );

  const clearAll = () => {
    confirm.ask({
      action: "CLEAR_ADMIN_LOGS",
      title: "Hapus seluruh Log Audit",
      target: `${logs.length} entri log`,
      risk: "high",
      summary: [
        `Menghapus permanen ${logs.length} entri log audit admin`,
        "Tindakan ini tidak dapat dibatalkan",
        "Riwayat sebelum penghapusan tidak akan dapat dipulihkan",
      ],
      onConfirm: () => {
        localStorage.removeItem("panenku.adminLogs");
        window.dispatchEvent(
          new CustomEvent("panenku:change", { detail: { key: "panenku.adminLogs" } }),
        );
        toast.success("Log audit telah dihapus");
      },
    });
  };

  return (
    <div className="space-y-3 p-3 pb-12">
      <div className="rounded-2xl bg-foreground p-3 text-background">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-sm font-extrabold">Log Audit Admin</p>
        </div>
        <p className="mt-1 text-xs opacity-80">
          Mencatat seluruh tindakan administratif berisiko (waktu UTC, ID admin, perintah, status
          eksekusi). 500 entri terbaru disimpan.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <Stat label="Sukses" value={counts.success} tone="success" />
          <Stat label="Gagal" value={counts.failed} tone="danger" />
          <Stat label="Batal" value={counts.cancelled} tone="muted" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              filter === f.key
                ? "bg-foreground text-background"
                : "border border-border bg-card text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={clearAll}
          disabled={logs.length === 0}
          className="ml-auto flex items-center gap-1 rounded-full border border-danger px-3 py-1.5 text-xs font-bold text-danger disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" /> Bersihkan
        </button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            Belum ada log untuk filter ini.
          </div>
        ) : (
          filtered.map((l) => <LogRow key={l.id} log={l} />)
        )}
      </div>

      <AdminConfirmDialog admin={session} request={confirm.request} onClose={confirm.close} />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "danger" | "muted";
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : "text-background/70";
  return (
    <div className="rounded-xl bg-background/10 p-2">
      <p className={`text-lg font-extrabold ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

function LogRow({ log }: { log: AdminLog }) {
  const Icon =
    log.status === "success" ? CheckCircle2 : log.status === "failed" ? XCircle : Ban;
  const tone =
    log.status === "success"
      ? "text-success bg-success/10"
      : log.status === "failed"
        ? "text-danger bg-danger/10"
        : "text-muted-foreground bg-muted";

  const local = new Date(log.timestampUtc).toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "medium",
  });

  return (
    <div className="rounded-2xl bg-card p-3 shadow-card">
      <div className="flex items-start gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 text-sm">
          <p className="font-extrabold">{log.action}</p>
          <p className="text-xs text-muted-foreground">Target: {log.target}</p>
          {log.detail && (
            <p className="mt-1 text-[11px] text-muted-foreground">↳ {log.detail}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
            <span>🕐 UTC: {log.timestampUtc}</span>
            <span>🕒 Lokal: {local}</span>
            <span>👤 {log.adminName} ({log.adminId})</span>
          </div>
        </div>
      </div>
    </div>
  );
}