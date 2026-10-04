import { cn } from "@/lib/utils";

/**
 * A hairline across the full grid, marked where it crosses the outer guides.
 * Draws itself left to right, marks included, as it scrolls into view.
 */
export function Rule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-reveal
      className={cn(
        "enter-draw-x bleed-to-guides registration-marks h-px bg-line [--draw-bleed:6px]",
        className,
      )}
    />
  );
}
