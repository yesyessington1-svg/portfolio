"use client";

import { Building2 } from "lucide-react";
import { AccordionApp } from "@/components/watermelon-ui/card-split-accordion";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { site } from "@/content/site";

export function Background() {
  const items = site.background.map((entry, i) => ({
    id: i + 1,
    title: entry.org,
    subtitle: entry.title,
    meta: entry.period,
    icon: <Building2 className="size-4" strokeWidth={1.5} />,
    content: entry.detail,
  }));

  return (
    <section id="background" className="shell scroll-mt-24 py-24 md:py-32">
      <SectionHeading index="03" label="Background" />

      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        <Reveal className="col-span-full md:col-span-3">
          <p className="max-w-xs text-sm leading-relaxed text-bone-500">
            Open one for the detail.
          </p>
        </Reveal>

        <Reveal className="col-span-full md:col-span-9" y={28}>
          <AccordionApp items={items} />
        </Reveal>
      </div>
    </section>
  );
}
