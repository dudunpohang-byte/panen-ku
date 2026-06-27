import { type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BottomNav } from "./BottomNav";
import { useReveal } from "@/hooks/use-reveal";

export function MobileShell({
  children,
  hideNav = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mainRef = useReveal<HTMLElement>();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto min-h-screen max-w-md bg-background shadow-card">
        <main
          key={pathname}
          ref={mainRef}
          className={
            (hideNav ? "min-h-screen" : "min-h-screen safe-bottom") +
            " page-transition"
          }
        >
          {children}
        </main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
