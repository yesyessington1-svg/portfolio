"use client";

import { SectionHeading } from "./section-heading";
import { SplitLines } from "./split-lines";
import { Reveal } from "./reveal";
import { site } from "@/content/site";

export function About() {
  return (
    <section id="about" className="shell scroll-mt-24 py-24 md:py-32">
      <SectionHeading index="01" label="About" />

      <div className="grid gap-14 md:grid-cols-12 md:gap-10">
        {/* The lead line is the only thing most people will read. Make it big. */}
        <SplitLines className="col-span-full md:col-span-7">
          <p className="display text-[clamp(1.75rem,4.2vw,3.25rem)] font-medium text-bone-50">
            {site.about.lead}
          </p>
        </SplitLines>

        <div className="col-span-full space-y-6 md:col-span-4 md:col-start-9">
          {site.about.body.map((p, i) => (
            <Reveal
              key={i}
              as="p"
              delay={i * 0.08}
              className="text-[0.95rem] leading-[1.75] text-bone-400"
            >
              {p}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
