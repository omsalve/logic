import type { ReactNode } from "react";
import { RiseWords } from "@/components/ui/rise-words";
import { Container } from "./container";
import { Grid, GridItem } from "./grid";
import { Rule } from "./rule";

/** Which half of the page a section's content takes from lg; the network takes the other. */
export type Side = "start" | "end";

type SectionProps = {
  id: string;
  /** Two-digit position in the page, shared with the nav. */
  index: string;
  label: string;
  title: string;
  description?: ReactNode;
  side: Side;
  children: ReactNode;
};

/**
 * A numbered page section: header, content on the grid, then a closing rule.
 * From lg the content keeps to one half of the grid — sections alternate sides,
 * and <NeuralBackground> crosses to the open half as each one arrives. Within
 * that half the grid is six columns, so nested grids still land on the guides.
 * The header enters as it scrolls into view: label, then the title word by word, then the description.
 */
export function Section({ id, index, label, title, description, side, children }: SectionProps) {
  const titleId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={titleId} data-side={side}>
      <Container>
        <Grid className="pt-20 pb-20 md:pt-28 md:pb-28 lg:pt-32 lg:pb-32">
          <GridItem span={{ lg: 6 }} start={{ lg: side === "start" ? 1 : 7 }} className="lg:[--grid-cols:6]">
            <Grid as="header" data-reveal className="gap-y-6 md:gap-y-8">
              <GridItem as="p" className="enter mono-label flex items-center gap-3 text-fg-subtle">
                <span className="text-fg-muted">{index}</span>
                <span aria-hidden="true" className="enter-draw-x enter-step-1 h-px w-8 bg-line-strong" />
                {label}
              </GridItem>
              <GridItem
                as="h2"
                id={titleId}
                aria-label={title}
                className="text-title font-medium text-balance text-fg"
              >
                <RiseWords text={title} step={1} />
              </GridItem>
              {description && (
                <GridItem
                  as="p"
                  span={{ md: 8, lg: 5 }}
                  className="enter enter-step-3 leading-relaxed text-pretty text-fg-muted"
                >
                  {description}
                </GridItem>
              )}
            </Grid>
            <div className="mt-12 md:mt-16">{children}</div>
          </GridItem>
        </Grid>
        <Rule />
      </Container>
    </section>
  );
}
