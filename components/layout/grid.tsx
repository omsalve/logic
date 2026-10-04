import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Breakpoint = "base" | "md" | "lg";
type Column = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type Responsive<T> = Partial<Record<Breakpoint, T>>;

const prefix: Record<Breakpoint, string> = { base: "", md: "md:", lg: "lg:" };

/** { base: 2, lg: 6 } → ["col-span-2", "lg:col-span-6"]. Safelisted in globals.css. */
function responsive(property: string, value: Responsive<Column | "full"> = {}) {
  return Object.entries(value).map(
    ([breakpoint, column]) => `${prefix[breakpoint as Breakpoint]}${property}-${column}`,
  );
}

type GridProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  /**
   * `flow` — columns separated by gutters.
   * `ruled` — cells divided by hairlines that sit exactly on the grid guides,
   * with registration marks at the corners. Use with <GridCell>.
   */
  variant?: "flow" | "ruled";
};

export function Grid({ as: Tag = "div", variant = "flow", className, ...props }: GridProps) {
  return (
    <Tag
      className={cn(
        variant === "flow" ? "layout-grid" : "layout-grid-ruled registration-marks border-r border-b",
        className,
      )}
      {...props}
    />
  );
}

type GridItemProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  /** Columns to span per breakpoint: 4 columns below md, 12 from md. Full width by default. */
  span?: Responsive<Column | "full">;
  start?: Responsive<Column>;
};

export function GridItem({ as: Tag = "div", span, start, className, ...props }: GridItemProps) {
  return (
    <Tag
      className={cn(
        ...responsive("col-span", { base: "full", ...span }),
        ...responsive("col-start", start),
        className,
      )}
      {...props}
    />
  );
}

/** A cell of a ruled grid: draws its top and left rules and insets content back onto the columns. */
export function GridCell({ className, ...props }: GridItemProps) {
  return <GridItem className={cn("cell-inset border-t border-l", className)} {...props} />;
}
