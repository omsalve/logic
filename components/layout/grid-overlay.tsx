import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";

/**
 * The page's column grid, drawn as faint guides behind everything.
 * Same geometry as a ruled grid, so section rules and cell borders land on these lines.
 * On load the guides draw down the page, left to right, before the content lands on them.
 */
export function GridOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <Container className="h-full">
        <div className="layout-grid-ruled h-full">
          {Array.from({ length: 12 }, (_, column) => (
            <div
              key={column}
              className={cn(
                "enter-draw-y border-l border-line-faint",
                // The closing guide belongs to the last visible column, so it draws with it.
                column === 3 && "max-md:border-r",
                column === 11 && "border-r",
                column >= 4 && "max-md:hidden",
              )}
              style={{ "--enter-offset": `${column * 40}ms` } as CSSProperties}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
