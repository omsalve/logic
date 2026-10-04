import type { CSSProperties } from "react";
import { Container } from "@/components/layout/container";
import { Grid, GridCell, GridItem } from "@/components/layout/grid";
import { Rule } from "@/components/layout/rule";
import { ButtonLink } from "@/components/ui/button";
import { RiseWords } from "@/components/ui/rise-words";
import { hero, sections } from "@/content/site";

/**
 * Opens the page on the left half, like the sections that alternate after it;
 * the network turns in the open right half. The facts close the copy — four
 * across from md, two by two within the half from lg — and a rule closes the hero.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" data-side="start">
      <Container>
        <Grid className="pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-28 lg:pb-32">
          <GridItem span={{ lg: 6 }} className="lg:[--grid-cols:6]">
            <p className="enter mono-label flex items-center gap-2.5 text-fg-muted">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]"
              />
              {hero.eyebrow}
            </p>
            <h1
              id="hero-title"
              aria-label={hero.title.join(" ")}
              className="mt-8 text-display font-medium text-fg"
            >
              <RiseWords text={hero.title[0]} step={1} className="block" />
              <RiseWords text={hero.title[1]} step={2} className="block text-fg-subtle" />
            </h1>
            <p className="enter enter-step-3 mt-8 max-w-[33rem] text-lg leading-relaxed text-pretty text-fg-muted">
              {hero.intro}
            </p>
            <div className="enter enter-step-4 mt-10 flex flex-wrap gap-3">
              <ButtonLink href={`#${sections.team.id}`}>
                Meet the team{" "}
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-200 ease-out pointer-fine:motion-safe:group-hover/button:translate-y-0.5"
                >
                  ↓
                </span>
              </ButtonLink>
              <ButtonLink href={`#${sections.contact.id}`} variant="secondary">
                Start a conversation
              </ButtonLink>
            </div>

            {/* The ruled frame fades so its lines never leave the guides; each fact rises in turn. */}
            <Grid as="dl" variant="ruled" className="enter-fade enter-step-4 mt-16">
              {hero.facts.map(({ label, value }, i) => (
                <GridCell
                  key={label}
                  span={{ base: 2, md: 3 }}
                  className="py-5"
                  style={{ "--enter-step": 5 + i } as CSSProperties}
                >
                  <dt className="enter mono-label text-fg-subtle">{label}</dt>
                  <dd className="enter mt-2 text-[15px] text-fg">{value}</dd>
                </GridCell>
              ))}
            </Grid>
          </GridItem>
        </Grid>
        <Rule />
      </Container>
    </section>
  );
}
