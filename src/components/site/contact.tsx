"use client";

import { Mail } from "lucide-react";
import CopyConfirm from "@/components/watermelon-ui/copy-confirm";
import { Separator } from "@/components/watermelon-ui/separator";
import { SectionHeading } from "./section-heading";
import { SplitLines } from "./split-lines";
import { Reveal } from "./reveal";
import { site } from "@/content/site";

export function Contact() {
  return (
    <section id="contact" className="shell scroll-mt-24 py-24 md:py-32">
      <SectionHeading index="05" label="Contact" />

      <div className="grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="col-span-full md:col-span-7">
          <SplitLines>
            <h2 className="display text-[clamp(2.25rem,6.5vw,5rem)] text-bone-50">
              Let&apos;s build
              <br />
              something
              <span className="text-flare">.</span>
            </h2>
          </SplitLines>

          <Reveal delay={0.15} className="mt-10 max-w-md">
            <p className="text-[0.95rem] leading-[1.75] text-bone-400">
              {site.contact.pitch}
            </p>
          </Reveal>

          <Reveal delay={0.25} className="mt-10">
            <CopyConfirm
              valueToCopy={site.contact.email}
              icon={<Mail className="size-4" strokeWidth={1.5} />}
            />
          </Reveal>

        </div>

        <div className="col-span-full md:col-span-4 md:col-start-9">
          <span className="label text-bone-600">Elsewhere</span>
          <Separator className="my-5 bg-border" />
          <ul>
            {site.contact.socials.map((s) => (
              <Reveal as="li" key={s.label} delay={0.05}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-baseline justify-between border-b border-border py-4 transition-colors duration-500 hover:border-bone-700"
                >
                  <span className="text-sm text-bone-200 transition-colors group-hover:text-bone-50">
                    {s.label}
                  </span>
                  <span className="font-mono text-[11px] text-bone-600 transition-colors duration-300 group-hover:text-flare">
                    {s.handle}
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
