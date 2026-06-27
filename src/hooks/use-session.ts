import { useEffect, useState } from "react";
import { getSession, type User } from "@/lib/store";

export function useSession() {
  const [user, setUser] = useState<User | null>(() =>
    typeof window === "undefined" ? null : getSession(),
  );

  useEffect(() => {
    const sync = () => setUser(getSession());
    window.addEventListener("panenku:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("panenku:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return user;
}
