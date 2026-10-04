"use client";

import { useEffect, useRef, useState } from "react";
import { nav } from "@/content/site";

/**
 * Moves the indicator under a link with transform alone, so the slide stays on
 * the compositor. Appearing from hidden, it jumps into place, then fades in.
 */
function placeIndicator(indicator: HTMLElement, link: HTMLElement | null) {
  if (!link) {
    indicator.dataset.visible = "false";
    return;
  }

  const appearing = indicator.dataset.visible !== "true";
  if (appearing) indicator.style.transition = "none";
  indicator.style.transform = `translateX(${link.offsetLeft}px) scaleX(${link.offsetWidth / indicator.offsetWidth})`;
  if (appearing) {
    indicator.getBoundingClientRect(); // commit the jump before transitions return
    indicator.style.transition = "";
  }
  indicator.dataset.visible = "true";
}

/** Section links. A signal line on the header rule marks the section being read. */
export function SiteNav() {
  const [active, setActive] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // Active: the section crossing the middle of the viewport. None over the hero.
  useEffect(() => {
    const crossing = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) crossing.add(`#${target.id}`);
          else crossing.delete(`#${target.id}`);
        }
        setActive(nav.find(({ href }) => crossing.has(href))?.href ?? null);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );

    for (const { href } of nav) {
      const section = document.querySelector(href);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = navRef.current;
    const indicator = indicatorRef.current;
    if (!root || !indicator) return;

    const place = () =>
      placeIndicator(indicator, active ? root.querySelector(`a[href="${active}"]`) : null);
    place();

    // Link widths change at the md breakpoint and when the webfont swaps in.
    const resize = new ResizeObserver(place);
    resize.observe(root);
    return () => resize.disconnect();
  }, [active]);

  return (
    <nav ref={navRef} aria-label="Sections" className="relative flex items-center self-stretch">
      <ul role="list" className="flex items-center gap-5 md:gap-8">
        {nav.map(({ href, index, label }) => (
          <li key={href}>
            <a
              href={href}
              aria-current={active === href ? "true" : undefined}
              className="mono-label text-fg-muted transition-colors duration-150 hover:text-fg aria-[current=true]:text-fg"
            >
              <span className="text-fg-subtle max-md:hidden">{index} </span>
              {label}
            </a>
          </li>
        ))}
      </ul>
      {/* Sits on the header's bottom border. Scaled from a 100px base to each link's width. */}
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px left-0 h-px w-25 origin-left bg-signal opacity-0 shadow-[0_0_8px_var(--signal)] transition-[transform,opacity] duration-250 ease-in-out data-[visible=true]:opacity-100 motion-reduce:transition-opacity"
      />
    </nav>
  );
}
