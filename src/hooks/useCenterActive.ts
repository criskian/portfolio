import { useEffect, useRef, useState } from "react";

/**
 * Touch screens have no hover: mark an element "active" while it crosses the
 * middle band of the viewport, so hover-only effects still play on phones.
 * Always `false` on devices with a fine pointer (they get real hover).
 */
export function useCenterActive<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "-38% 0px -38% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, active };
}
