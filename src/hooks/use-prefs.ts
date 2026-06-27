import { useEffect, useState, useCallback } from "react";
import { getPrefs, setPrefs, type Prefs } from "@/lib/store";

export function usePrefs(): [Prefs, (next: Partial<Prefs>) => void] {
  const [prefs, setLocal] = useState<Prefs>(() =>
    typeof window === "undefined" ? { largeFont: false, voiceOver: false } : getPrefs(),
  );

  useEffect(() => {
    const sync = () => setLocal(getPrefs());
    window.addEventListener("panenku:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("panenku:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Apply CSS class to <html> for global font scaling.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("panenku-large-font", prefs.largeFont);
  }, [prefs.largeFont]);

  const update = useCallback((next: Partial<Prefs>) => {
    const merged = { ...getPrefs(), ...next };
    setPrefs(merged);
    setLocal(merged);
  }, []);

  return [prefs, update];
}
