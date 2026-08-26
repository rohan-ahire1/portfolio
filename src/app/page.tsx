import { About } from "@/components/About";
import { ConsoleNote } from "@/components/ConsoleNote";
import { Contact } from "@/components/Contact";
import { Cursor } from "@/components/Cursor";
import { Hero } from "@/components/Hero";
import { IntroWipe } from "@/components/IntroWipe";
import { Nav } from "@/components/Nav";
import { Now } from "@/components/Now";
import { Numbers } from "@/components/Numbers";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Work } from "@/components/Work";

export default function Home() {
  return (
    <>
      <IntroWipe />
      <Cursor />
      <ConsoleNote />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Numbers />
        <Now />
        <Contact />
      </main>
    </>
  );
}
