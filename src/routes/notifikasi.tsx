import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, CheckCheck, Trash2, Phone, ShoppingBag, Info, AlertCircle } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
  type NotificationItem,
  addSupportNotification,
} from "@/lib/notifications/store";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/notifikasi")({
  component: NotifikasiPage,
  head: () => ({
    meta: [
      { title: "Notifikasi — Panenku" },
      { name: "description", content: "Daftar notifikasi dan pemberitahuan aplikasi Panenku." },
    ],
  }),
});

function NotifikasiPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());

    const handler = () => {
      setNotifications(getNotifications());
      setUnreadCount(getUnreadCount());
    };
    window.addEventListener("panenku:notificationChange", handler);
    return () => window.removeEventListener("panenku:notificationChange", handler);
  }, []);

  const handleMarkAllRead = () => {
    markAllAsRead();
    setNotifications(getNotifications());
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    clearAll();
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleClick = (item: NotificationItem) => {
    if (!item.read) {
      markAsRead(item.id);
      setNotifications(getNotifications());
      setUnreadCount(getUnreadCount());
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="h-5 w-5" />;
      case "promo":
        return <Info className="h-5 w-5" />;
      case "support":
        return <Phone className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getIconBg = (type: NotificationItem["type"]) => {
    switch (type) {
      case "order":
        return "bg-primary text-primary-foreground";
      case "promo":
        return "bg-promo/15 text-promo";
      case "support":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-muted text-foreground";
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHr < 24) return `${diffHr} jam lalu`;
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <MobileShell hideNav>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground shadow-soft">
        <Link to="/" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15 active:scale-95 transition-transform">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold flex-1">Notifikasi</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 rounded-xl bg-white/20 px-3 py-1.5 text-sm font-semibold active:scale-95 transition-transform"
          >
            <CheckCheck className="h-4 w-4" /> Semua Dibaca
          </button>
        )}
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="rounded-full p-2 hover:bg-white/15 active:scale-95 transition-transform"
            aria-label="Hapus semua notifikasi"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </header>

      <main className="p-3 space-y-3 page-transition">
        {/* Support contact card */}
        <div className="rounded-2xl gradient-primary p-4 text-white shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Phone className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold">Butuh Bantuan?</p>
              <p className="text-sm opacity-90">+62 813-1818-2643</p>
            </div>
            <a
              href="tel:+6281318182643"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary shadow active:scale-95 transition-transform"
            >
              Hubungi
            </a>
          </div>
        </div>

        {/* Notification list */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Bell className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-semibold">Belum Ada Notifikasi</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Notifikasi tentang pesanan, promo, dan informasi penting akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClick(item)}
                className={`relative flex items-start gap-3 rounded-2xl p-4 shadow-card cursor-pointer active:scale-[0.98] transition-all ${
                  item.read ? "bg-card" : "bg-card border-l-4 border-primary"
                }`}
              >
                {!item.read && (
                  <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-primary" />
                )}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getIconBg(item.type)}`}
                >
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <p className={`text-sm ${item.read ? "font-medium" : "font-bold"}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.body}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">{formatDate(item.createdAt)}</p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="shrink-0 rounded-full p-1.5 hover:bg-muted opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Hapus notifikasi"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </MobileShell>
  );
}