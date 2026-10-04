"use client";

import { useEffect } from "react";

/**
 * Marks each [data-reveal] region with data-inview the first time it scrolls
 * into view, releasing the entrances held inside it (see Motion in globals.css).
 */
export function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting, boundingClientRect } of entries) {
          // Still below the fold. Regions already scrolled past (a restored
          // scroll position, a deep link) reveal straight away.
          if (!isIntersecting && boundingClientRect.top > 0) continue;
          target.setAttribute("data-inview", "");
          observer.unobserve(target);
        }
      },
      // A little way in, so the entrance is seen — but shallow enough that the
      // footer still triggers when the page bottoms out.
      { rootMargin: "0px 0px -64px 0px" },
    );

    document.querySelectorAll("[data-reveal]").forEach((region) => observer.observe(region));
    return () => observer.disconnect();
  }, []);

  return null;
}
