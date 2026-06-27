import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { getUnreadCount } from "@/lib/notifications/store";
import { useEffect, useState } from "react";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getUnreadCount());

    const handler = () => {
      setCount(getUnreadCount());
    };
    window.addEventListener("panenku:notificationChange", handler);
    return () => window.removeEventListener("panenku:notificationChange", handler);
  }, []);

  return (
    <Link
      to="/notifikasi"
      aria-label="Notifikasi"
      className="relative rounded-full p-2 hover:bg-white/15"
    >
      <Bell className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-danger-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}