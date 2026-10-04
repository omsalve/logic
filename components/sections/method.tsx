import type { CSSProperties } from "react";
import { Grid, GridCell } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { principles, sections } from "@/content/site";
import { pad } from "@/lib/utils";

export function Method() {
  const { id, index, label, title, description } = sections.method;

  return (
    <Section id={id} index={index} label={label} title={title} description={description} side="start">
      {/* The ruled frame fades so its lines never leave the guides; each axiom rises in turn.
          Two by two: across twelve columns from md, then across the section's six from lg. */}
      <Grid as="ol" variant="ruled" role="list" data-reveal className="enter-fade">
        {principles.map((principle, i) => (
          <GridCell
            as="li"
            key={principle.title}
            data-reveal
            span={{ md: 6, lg: 3 }}
            className="pt-6 pb-10 md:pb-12"
            style={{ "--enter-step": i + 1 } as CSSProperties}
          >
            <span className="enter mono-label block text-fg-subtle">{pad(i + 1)}</span>
            <h3 className="enter mt-8 text-lg font-medium tracking-[-0.01em] text-fg md:mt-12">
              {principle.title}
            </h3>
            <p className="enter mt-3 max-w-[22rem] text-[15px] leading-relaxed text-pretty text-fg-muted">
              {principle.body}
            </p>
          </GridCell>
        ))}
      </Grid>
    </Section>
  );
}
