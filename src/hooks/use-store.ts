import { useEffect, useState } from "react";

export function useStoreSubscription<T>(getter: () => T): T {
  const [value, setValue] = useState<T>(() => getter());
  useEffect(() => {
    const sync = () => setValue(getter());
    sync();
    window.addEventListener("panenku:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("panenku:change", sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
