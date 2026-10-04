"use client";

import { useEffect, useRef } from "react";
import styles from "./spotlight.module.css";

/**
 * A soft light under the content of its parent that follows the pointer.
 * The parent must be positioned and isolated (see node-card.module.css).
 * Fine pointers only; off with reduced motion.
 */
export function Spotlight() {
  const spotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const spot = spotRef.current;
    const surface = spot?.parentElement?.parentElement;
    if (!spot || !surface) return;

    const query = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
    if (!window.matchMedia(query).matches) return;

    let frame = 0;
    const follow = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { left, top } = surface.getBoundingClientRect();
        spot.style.transform = `translate(${event.clientX - left}px, ${event.clientY - top}px)`;
      });
    };

    surface.addEventListener("pointermove", follow);
    return () => {
      surface.removeEventListener("pointermove", follow);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span aria-hidden="true" className={styles.spotlight}>
      <span ref={spotRef} className={styles.spot} />
    </span>
  );
}
