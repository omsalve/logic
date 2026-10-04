import { Section } from "@/components/layout/section";
import { CopyButton } from "@/components/ui/copy-button";
import { NodeCard } from "@/components/ui/node-card";
import { sections, site } from "@/content/site";

export function Contact() {
  const { id, index, label, title, description } = sections.contact;

  return (
    <Section id={id} index={index} label={label} title={title} description={description} side="end">
      <NodeCard
        data-reveal
        className="enter flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8"
      >
        <div className="min-w-0">
          <p className="mono-label text-fg-subtle">Email</p>
          <a
            href={`mailto:${site.email}`}
            className="group/email relative mt-3 block w-fit max-w-full truncate text-2xl font-medium tracking-[-0.02em] text-fg transition-colors duration-150 hover:text-signal md:text-[2rem]"
          >
            {site.email}
            {/* An underline that wipes in from the left, and back out the way it came. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px bg-signal transition-[clip-path] duration-250 ease-out [clip-path:inset(0_100%_0_0)] pointer-fine:group-hover/email:[clip-path:inset(0)]"
            />
          </a>
        </div>
        <CopyButton value={site.email} label="Copy email address" />
      </NodeCard>
    </Section>
  );
}
