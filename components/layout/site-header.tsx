import { Logo } from "@/components/ui/logo";
import { site } from "@/content/site";
import { Container } from "./container";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-md">
      <Container className="flex h-(--header-h) items-center justify-between">
        <a href="#top" aria-label={`${site.name} — back to top`} className="group/logo">
          <Logo />
        </a>
        <SiteNav />
      </Container>
    </header>
  );
}
