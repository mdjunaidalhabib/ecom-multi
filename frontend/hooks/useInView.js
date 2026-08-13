"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ✅ True once the element has scrolled near the viewport (stays true
 * afterwards — observer disconnects on first hit). Used to lazy-start
 * work (like the live-stock fetch) only for cards the user is actually
 * about to see, instead of every card on the page at once.
 */
export function useInView({ rootMargin = "400px", enabled = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(!enabled);

  useEffect(() => {
    if (!enabled || inView) return;

    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, inView, rootMargin]);

  return [ref, inView];
}
