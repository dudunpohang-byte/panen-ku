import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MessageSquare, Phone, ImagePlus } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { getRoomsForUser, getUsers, getUnreadCount } from "@/lib/store";
import { useMemo } from "react";

export const Route = createFileRoute("/chat/")({
  component: ChatListPage,
});

function ChatListPage() {
  const session = useSession();
  const navigate = useNavigate();

  if (!session) {
    return (
      <MobileShell>
        <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
          <Link to="/" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold">Pesan</h1>
        </header>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl">💬</p>
          <h2 className="mt-3 text-xl font-bold">Silakan Masuk Dulu</h2>
          <p className="mt-1 text-muted-foreground">Masuk untuk melihat percakapan Anda</p>
          <button
            onClick={() => navigate({ to: "/masuk", search: { redirect: "/chat" } })}
            className="mt-5 h-14 rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground"
          >
            Masuk
          </button>
        </div>
      </MobileShell>
    );
  }

  const role = session.role === "farmer" ? "farmer" : "buyer";
  const rooms = useStoreSubscription(() => getRoomsForUser(session.id, role));
  const users = useStoreSubscription(() => getUsers());
  const unreadTotal = useMemo(() => getUnreadCount(session.id, role), [session.id, role]);

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
        <Link to="/" aria-label="Kembali" className="rounded-full p-2 hover:bg-white/15">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Pesan</h1>
          {unreadTotal > 0 && (
            <p className="text-xs opacity-90">{unreadTotal} pesan belum dibaca</p>
          )}
        </div>
      </header>

      <div className="p-3 pb-20">
        {rooms.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
            <p className="text-6xl">💬</p>
            <h2 className="mt-3 text-xl font-bold">Belum Ada Percakapan</h2>
            <p className="mt-1 text-muted-foreground">
              {role === "buyer"
                ? "Mulai chat dengan petani dari halaman produk"
                : "Pembeli akan menghubungi Anda lewat chat"}
            </p>
            {role === "buyer" && (
              <Link
                to="/"
                className="mt-5 inline-flex h-14 items-center rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground"
              >
                Jelajahi Produk
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map((room) => {
              const partnerId = role === "buyer" ? room.farmerId : room.buyerId;
              const partner = users.find((u) => u.id === partnerId);
              const unread = role === "buyer" ? room.unreadBuyer : room.unreadFarmer;
              const timeLabel = room.lastMessageAt
                ? formatTime(room.lastMessageAt)
                : "";

              return (
                <Link
                  key={room.id}
                  to={`/chat/${room.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card active:bg-primary-soft transition-colors"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-2xl">
                    {partner?.avatar ? (
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{partner?.role === "farmer" ? "👨‍🌾" : "🙂"}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-base font-bold">
                        {partner?.name ?? "Pengguna"}
                      </p>
                      {timeLabel && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {timeLabel}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {room.productName && (
                        <span className="font-semibold text-primary">
                          {room.productName} ·{" "}
                        </span>
                      )}
                      {room.lastMessage ?? "Belum ada pesan"}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-promo px-1.5 text-xs font-bold text-promo-foreground">
                      {unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 24) {
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffH < 48) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
