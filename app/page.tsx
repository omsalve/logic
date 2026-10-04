import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Method } from "@/components/sections/method";
import { Team } from "@/components/sections/team";

export default function Home() {
  return (
    <>
      <Hero />
      <Team />
      <Method />
      <Contact />
    </>
  );
}
