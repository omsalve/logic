import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

const base =
  "group/button inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-node px-4 text-sm font-medium whitespace-nowrap select-none transition-[color,background-color,border-color,scale] duration-150 ease-out active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-canvas hover:bg-white",
  secondary: "border border-line-strong text-fg hover:border-fg-subtle hover:bg-fg/4",
};

export function buttonClasses(variant: Variant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant };

export function ButtonLink({ variant, className, ...props }: ButtonLinkProps) {
  return <a className={buttonClasses(variant, className)} {...props} />;
}
