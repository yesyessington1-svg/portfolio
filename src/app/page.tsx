import { Chrome } from "@/components/site/chrome";
import { Dock } from "@/components/site/dock";
import { Hero } from "@/components/site/hero";
import { StackMarquee } from "@/components/site/stack-marquee";
import { About } from "@/components/site/about";
import { Work } from "@/components/site/work";
import { Background } from "@/components/site/background";
import { Writing } from "@/components/site/writing";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";

export default function Page() {
  return (
    <>
      <Chrome />
      <main>
        <Hero />
        <StackMarquee />
        <About />
        <Work />
        <Background />
        <Writing />
        <Contact />
        <Footer />
      </main>
      <Dock />
    </>
  );
}
