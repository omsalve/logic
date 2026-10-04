import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./node-card.module.css";
import { Spotlight } from "./spotlight";

type NodeCardProps = HTMLAttributes<HTMLElement> & { as?: ElementType };

/**
 * The system's base surface: a bordered node that glows faintly when pointed at,
 * with a soft light that follows the pointer across it.
 */
export function NodeCard({ as: Tag = "div", className, children, ...props }: NodeCardProps) {
  return (
    <Tag className={cn(styles.node, className)} {...props}>
      <Spotlight />
      {children}
    </Tag>
  );
}
