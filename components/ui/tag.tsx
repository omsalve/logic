import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-sm border border-line px-2 font-mono text-[11px] text-fg-muted">
      {children}
    </span>
  );
}
