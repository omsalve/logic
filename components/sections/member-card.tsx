import { NodeCard } from "@/components/ui/node-card";
import { Tag } from "@/components/ui/tag";
import type { Member } from "@/content/team";
import { initials, pad } from "@/lib/utils";

type MemberCardProps = {
  member: Member;
  /** 1-based position in the team. */
  index: number;
};

export function MemberCard({ member, index }: MemberCardProps) {
  const nameId = `${member.id}-name`;

  return (
    <NodeCard as="article" aria-labelledby={nameId} className="enter group flex h-full flex-col">
      <header className="flex h-14 items-center justify-between border-b border-line px-5">
        <span className="mono-label text-fg-subtle">Node {pad(index)}</span>
        <span className="mono-label flex items-center gap-2 text-fg-muted">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-fg-subtle transition-colors duration-200 group-hover:bg-signal"
          />
          {member.layer}
        </span>
      </header>

      <div className="flex flex-1 flex-col px-5 pt-6 pb-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-node border border-line-strong bg-canvas font-mono text-xs tracking-[0.04em] text-fg transition-colors duration-200 group-hover:border-signal/40"
          >
            {initials(member.name)}
          </span>
          <div className="min-w-0">
            <h3 id={nameId} className="text-lg leading-tight font-medium tracking-[-0.01em] text-fg">
              {member.name}
            </h3>
            <p className="mt-1 text-sm text-fg-muted">{member.role}</p>
          </div>
        </div>

        <p className="mt-6 max-w-[36rem] text-[15px] leading-relaxed text-pretty text-fg-muted">
          {member.bio}
        </p>

        <ul role="list" aria-label="Focus areas" className="mt-auto flex flex-wrap gap-1.5 pt-8">
          {member.focus.map((area) => (
            <li key={area}>
              <Tag>{area}</Tag>
            </li>
          ))}
        </ul>
      </div>

      <footer className="flex h-12 items-center gap-6 border-t border-line px-5">
        {member.links.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="group/link mono-label text-fg-muted transition-colors duration-150 hover:text-fg"
          >
            {label}{" "}
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-200 ease-out pointer-fine:motion-safe:group-hover/link:translate-x-0.5 pointer-fine:motion-safe:group-hover/link:-translate-y-0.5"
            >
              ↗
            </span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ))}
      </footer>
    </NodeCard>
  );
}
