import { cn } from "@/lib/utils";

/** K3 — three nodes, every one connected to the others. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M10 3.75 3.5 15h13Z" stroke="currentColor" strokeOpacity={0.4} />
      <circle cx="10" cy="3.75" r="2" fill="currentColor" />
      <circle cx="3.5" cy="15" r="2" fill="currentColor" />
      <circle cx="16.5" cy="15" r="2" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-fg", className)}>
      {/* Inside the header link, a third of a turn about the centroid (10, 11.25):
          K3 is symmetric under it, so the mark lands exactly where it started. */}
      <LogoMark className="size-5 origin-[50%_56.25%] transition-transform duration-500 ease-out pointer-fine:motion-safe:group-hover/logo:rotate-120" />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">logic</span>
    </span>
  );
}
