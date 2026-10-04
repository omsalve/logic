import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = HTMLAttributes<HTMLElement> & { as?: ElementType };

/** The content column: centred, max 1200px, with responsive page gutters. */
export function Container({ as: Tag = "div", className, ...props }: ContainerProps) {
  return <Tag className={cn("page-container", className)} {...props} />;
}
