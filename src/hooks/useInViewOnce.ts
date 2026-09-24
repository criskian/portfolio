import { useEffect, useRef, useState } from "react";

/** `true` once the element has been at least `amount` visible (never flips back). */
export function useInViewOnce<T extends Element>(amount = 0.3, rootMargin = "0px") {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: amount, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount, rootMargin, visible]);

  return { ref, visible };
}
