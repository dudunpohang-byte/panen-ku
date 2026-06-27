import { rupiah } from "./format";

export type QrisStatus = "pending" | "paid" | "expired";

export interface QrisPayment {
  id: string;
  orderId: string;
  qrisString: string;
  amount: number;
  status: QrisStatus;
  createdAt: string;
  paidAt?: string;
}

const QRIS_KEY = "panenku.qris_payments";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("panenku:change", { detail: { key } }));
}

/**
 * Generate QRIS string untuk pembayaran.
 * Format: QRIS standar dengan merchant PANENKU
 */
export function generateQrisString(orderId: string, amount: number): string {
  // Format QRIS standar Indonesia
  // NMID (National Merchant ID) untuk Panenku
  const nmid = "ID1021012345678";
  const merchantName = "PANENKU";
  const merchantCity = "JAKARTA";
  const merchantPostal = "12345";
  const txId = orderId.slice(-20);
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);

  // QRIS Content string (simulasi format standar QRIS)
  // Format: QRIS dengan payload merchant presented mode
  const payload = [
    "000201010211",                          // Payload Format Indicator + Point of Initiation Method
    `26620012ID${nmid}`,                     // Merchant Account Info
    `0108${merchantName.padEnd(8, " ")}`,    // Merchant Name (8 chars padded)
    `0308${merchantCity.padEnd(8, " ")}`,    // Merchant City
    `0408${merchantPostal.padEnd(8, " ")}`,  // Postal Code
    `51440005ID`,                            // Country Code
    `52045802`,                              // Transaction Currency (IDR)
    `5303${String(amount).padStart(10, "0")}`, // Transaction Amount
    `5402ID`,                                // Terminal Label
    `5502${txId}`,                           // Transaction ID
    `6205${timestamp}`,                      // Transaction Time
    "6304",                                  // CRC placeholder (akan diisi)
  ].join("");

  return payload;
}

/**
 * Simpan pembayaran QRIS ke local storage
 */
export function saveQrisPayment(qris: QrisPayment) {
  const all = read<QrisPayment[]>(QRIS_KEY, []);
  all.unshift(qris);
  write(QRIS_KEY, all);
}

/**
 * Ambil semua pembayaran QRIS
 */
export function getQrisPayments(): QrisPayment[] {
  return read<QrisPayment[]>(QRIS_KEY, []);
}

/**
 * Update status QRIS payment
 */
export function updateQrisStatus(orderId: string, status: QrisStatus) {
  const all = getQrisPayments().map((q) =>
    q.orderId === orderId ? { ...q, status, paidAt: status === "paid" ? new Date().toISOString() : q.paidAt } : q,
  );
  write(QRIS_KEY, all);
}

// ===== WITHDRAWAL REQUESTS =====

export type WithdrawalStatus = "pending" | "approved" | "rejected" | "completed";

export interface WithdrawalRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  accountName: string;
  accountNumber: string;
  provider: string;
  providerType: "bank" | "ewallet";
  amount: number;
  status: WithdrawalStatus;
  notes?: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
}

const WITHDRAWAL_KEY = "panenku.withdrawal_requests";

/**
 * Buat permintaan tarik dana
 */
export function createWithdrawalRequest(req: {
  farmerId: string;
  farmerName: string;
  farmName: string;
  accountName: string;
  accountNumber: string;
  provider: string;
  providerType: "bank" | "ewallet";
  amount: number;
}): WithdrawalRequest {
  const requests = read<WithdrawalRequest[]>(WITHDRAWAL_KEY, []);
  const withdrawal: WithdrawalRequest = {
    ...req,
    id: `wd_${Date.now()}`,
    status: "pending",
    requestedAt: new Date().toISOString(),
  };
  write(WITHDRAWAL_KEY, [withdrawal, ...requests]);
  return withdrawal;
}

/**
 * Ambil semua permintaan tarik dana
 */
export function getWithdrawalRequests(): WithdrawalRequest[] {
  return read<WithdrawalRequest[]>(WITHDRAWAL_KEY, []);
}

/**
 * Proses permintaan tarik dana (approve/reject)
 */
export function processWithdrawal(
  withdrawalId: string,
  status: "approved" | "rejected",
  processedBy: string,
  notes?: string,
) {
  const all = getWithdrawalRequests().map((w) =>
    w.id === withdrawalId
      ? { ...w, status, processedAt: new Date().toISOString(), processedBy, notes }
      : w,
  );
  write(WITHDRAWAL_KEY, all);
  return all.find((w) => w.id === withdrawalId);
}

/**
 * Ambil permintaan tarik dana untuk farmer tertentu
 */
export function getFarmerWithdrawals(farmerId: string): WithdrawalRequest[] {
  return getWithdrawalRequests().filter((w) => w.farmerId === farmerId);
}