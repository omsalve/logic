import { Logo } from "@/components/ui/logo";
import { Container } from "./container";
import { Grid, GridItem } from "./grid";

// Sits under the last section's closing rule.
export function SiteFooter() {
  return (
    <footer className="relative z-10">
      <Container>
        <Grid data-reveal className="items-center gap-y-5 py-10">
          <GridItem span={{ md: 4 }} className="enter flex items-center gap-4">
            <Logo />
            <span className="mono-label text-fg-subtle">© {new Date().getFullYear()}</span>
          </GridItem>
          <GridItem as="p" span={{ md: 5 }} className="enter enter-step-1 mono-label text-fg-subtle">
            Set on a 12-column grid in Inter &amp; JetBrains Mono
          </GridItem>
          <GridItem span={{ md: 3 }} className="enter enter-step-2 md:justify-self-end">
            <a
              href="#top"
              className="group/top mono-label text-fg-muted transition-colors duration-150 hover:text-fg"
            >
              Back to top{" "}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 ease-out pointer-fine:motion-safe:group-hover/top:-translate-y-0.5"
              >
                ↑
              </span>
            </a>
          </GridItem>
        </Grid>
      </Container>
    </footer>
  );
}
