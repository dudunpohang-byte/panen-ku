import { Link, useLocation } from "@tanstack/react-router";
import { Home, Search, ShoppingCart, ListOrdered, User } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import { getCart } from "@/lib/store";

type NavItem = {
  to: "/" | "/cari" | "/keranjang" | "/pesanan" | "/akun";
  label: string;
  icon: typeof Home;
  badge?: boolean;
};

const items: NavItem[] = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/cari", label: "Cari", icon: Search },
  { to: "/keranjang", label: "Keranjang", icon: ShoppingCart, badge: true },
  { to: "/pesanan", label: "Pesanan", icon: ListOrdered },
  { to: "/akun", label: "Akun", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const session = useSession();
  const cartCount = useStoreSubscription(() =>
    session ? getCart(session.id).reduce((s, i) => s + 1, 0) : 0,
  );

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active =
            it.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[13px] font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className={`h-6 w-6 ${active ? "stroke-[2.5]" : ""}`} />
                  {it.badge && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-danger-foreground">
                      {cartCount}
                    </span>
                  )}
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
