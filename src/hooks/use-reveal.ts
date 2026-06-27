import { useEffect, useRef } from "react";

/**
 * Scroll-reveal: adds `is-visible` to children of the container when they
 * enter the viewport. Use together with `.reveal` utility class.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  selector = ".reveal",
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    for (const el of targets) io.observe(el);
    return () => io.disconnect();
  }, [selector]);

  return ref;
}