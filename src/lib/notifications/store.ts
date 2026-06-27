// Notifikasi lokal — disimpan di localStorage
// Digunakan untuk notifikasi order, promo, dan informasi bantuan

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: "order" | "promo" | "info" | "support";
  read: boolean;
  createdAt: string;
  link?: string;
}

const STORAGE_KEY = "panenku.notifications";
const MAX_ITEMS = 100;

function read(): NotificationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NotificationItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: NotificationItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("panenku:notificationChange", { detail: { count: getUnreadCount() } }));
}

export function getNotifications(): NotificationItem[] {
  return read();
}

export function getUnreadCount(): number {
  return read().filter((n) => !n.read).length;
}

export function addNotification(
  title: string,
  body: string,
  type: NotificationItem["type"] = "info",
  link?: string,
): NotificationItem {
  const items = read();
  const notification: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    body,
    type,
    read: false,
    createdAt: new Date().toISOString(),
    link,
  };
  write([notification, ...items].slice(0, MAX_ITEMS));
  return notification;
}

export function markAsRead(id: string) {
  const items = read();
  const item = items.find((n) => n.id === id);
  if (item && !item.read) {
    item.read = true;
    write(items);
  }
}

export function markAllAsRead() {
  const items = read();
  items.forEach((n) => (n.read = true));
  write(items);
}

export function deleteNotification(id: string) {
  write(read().filter((n) => n.id !== id));
}

export function clearAll() {
  write([]);
}

// Utility: tambah notifikasi order
export function addOrderNotification(
  orderId: string,
  trackingCode: string,
  status: string,
) {
  const statusMap: Record<string, string> = {
    menunggu_bayar: "Pesanan menunggu pembayaran",
    dibayar: "Pesanan telah dibayar",
    disiapkan: "Pesanan sedang disiapkan petani",
    dikirim: "Pesanan sedang dalam perjalanan",
    selesai: "Pesanan telah selesai",
    dibatalkan: "Pesanan dibatalkan",
  };
  const label = statusMap[status] || status;
  addNotification(
    `Status Pesanan: ${label}`,
    `Tracking: ${trackingCode} — Klik untuk detail pesanan`,
    "order",
    `/pesanan/${orderId}`,
  );
}

// Utility: tambah notifikasi bantuan/support
export function addSupportNotification() {
  addNotification(
    "Butuh Bantuan?",
    "Hubungi kami di +62 813-1818-2643 untuk kendala atau pertanyaan.",
    "support",
  );
}