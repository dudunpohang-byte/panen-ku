import { useEffect, useRef, useState } from "react";
import { ShieldAlert, X, Eye, EyeOff } from "lucide-react";
import {
  appendAdminLog,
  verifyAdminPassword,
  type AdminLog,
  type User,
} from "@/lib/store";

export interface AdminConfirmRequest {
  action: string; // kode aksi, mis. "VERIFY_FARMER"
  title: string; // judul ditampilkan ke admin
  target: string; // ringkasan target
  summary: string[]; // bullet ringkasan tindakan
  risk?: "low" | "medium" | "high";
  onConfirm: () => void | Promise<void>;
}

/**
 * Modal konfirmasi PIN admin sebelum aksi sensitif.
 * Mencatat log otomatis (success / failed / cancelled) ke localStorage.
 */
export function AdminConfirmDialog({
  admin,
  request,
  onClose,
}: {
  admin: User;
  request: AdminConfirmRequest | null;
  onClose: () => void;
}) {
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (request) {
      setPin("");
      setError(null);
      setShow(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [request]);

  if (!request) return null;

  const logBase: Omit<AdminLog, "id" | "timestampUtc" | "status"> = {
    adminId: admin.id,
    adminName: admin.name,
    action: request.action,
    target: request.target,
  };

  const cancel = () => {
    appendAdminLog({ ...logBase, status: "cancelled", detail: "Dibatalkan admin" });
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    if (!verifyAdminPassword(pin)) {
      appendAdminLog({ ...logBase, status: "failed", detail: "PIN/Password salah" });
      setError("PIN / Password admin salah. Akses ditolak.");
      setPin("");
      return;
    }
    try {
      setBusy(true);
      await request.onConfirm();
      appendAdminLog({ ...logBase, status: "success" });
      onClose();
    } catch (err) {
      appendAdminLog({
        ...logBase,
        status: "failed",
        detail: err instanceof Error ? err.message : "Eksekusi gagal",
      });
      setError(err instanceof Error ? err.message : "Eksekusi gagal");
    } finally {
      setBusy(false);
    }
  };

  const riskColor =
    request.risk === "high"
      ? "bg-danger/15 text-danger border-danger/40"
      : request.risk === "low"
        ? "bg-success/15 text-success border-success/40"
        : "bg-warning/15 text-warning-foreground border-warning/40";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 p-0 sm:items-center sm:p-4"
      onClick={cancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-card sm:rounded-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Konfirmasi Keamanan
              </p>
              <h3 className="text-base font-extrabold leading-tight">{request.title}</h3>
            </div>
          </div>
          <button
            onClick={cancel}
            aria-label="Batal"
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={`mb-3 rounded-xl border-2 p-3 text-xs ${riskColor}`}>
          <p className="font-bold">Ringkasan tindakan</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {request.summary.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold">
              Masukkan ulang PIN / Password Admin
            </label>
            <div className="flex h-12 items-center rounded-xl border-2 border-border bg-background px-3">
              <input
                ref={inputRef}
                type={show ? "text" : "password"}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-full flex-1 bg-transparent text-base font-bold tracking-widest outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Sembunyikan" : "Tampilkan"}
                className="ml-2 rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && (
              <p className="mt-1 text-xs font-bold text-danger" role="alert">
                ⛔ {error}
              </p>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Setiap percobaan (berhasil, gagal, maupun dibatalkan) akan tercatat pada Log Audit
            Admin beserta waktu UTC dan ID admin.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={cancel}
              className="h-12 flex-1 rounded-xl border-2 border-border text-sm font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!pin || busy}
              className="h-12 flex-[1.4] rounded-xl bg-foreground text-sm font-bold text-background disabled:opacity-50"
            >
              {busy ? "Memproses…" : "Konfirmasi & Eksekusi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Hook kecil untuk mengelola state confirm dialog di sebuah halaman admin.
 */
export function useAdminConfirm() {
  const [request, setRequest] = useState<AdminConfirmRequest | null>(null);
  return {
    request,
    ask: (r: AdminConfirmRequest) => setRequest(r),
    close: () => setRequest(null),
  };
}