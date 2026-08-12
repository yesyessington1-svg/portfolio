"use client";

import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/watermelon-ui/badge";
import { Browser } from "@/components/watermelon-ui/browser";
import { ShimmerButton } from "@/components/watermelon-ui/shimmer-button";
import { Reveal } from "./reveal";
import { SplitLines } from "./split-lines";
import type { WorkItem } from "@/content/site";
import { withBase } from "@/lib/paths";

/**
 * The featured slot. Listo is a real product, so it gets shown as one —
 * the screenshot sits in Watermelon's <Browser /> chrome rather than
 * floating as a bare image.
 */
export function FeaturedWork({ project }: { project: WorkItem }) {
  return (
    <div className="mb-24 md:mb-32">
      <div className="grid gap-10 md:grid-cols-12 md:gap-10">
        <div className="col-span-full md:col-span-5">
          <Reveal className="mb-6 flex items-center gap-4">
            <span className="label text-flare">Current</span>
            <span className="font-mono text-[11px] text-bone-600">
              {project.year}
            </span>
          </Reveal>

          <SplitLines>
            <h3 className="display text-[clamp(1.9rem,4.6vw,3.4rem)] text-bone-50">
              {project.title}
            </h3>
          </SplitLines>

          <Reveal delay={0.1} className="mt-7 max-w-md">
            <p className="text-[0.95rem] leading-[1.75] text-bone-400">
              {project.blurb}
            </p>
          </Reveal>

          <Reveal delay={0.18} className="mt-7 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="border-border bg-transparent px-2.5 py-0.5 font-mono text-[10px] font-normal tracking-wide text-bone-500"
              >
                {s}
              </Badge>
            ))}
          </Reveal>

          {project.href ? (
            <Reveal delay={0.26} className="mt-9">
              {/* `as="span"` — the anchor owns the click, so a nested
                  <button> would be invalid markup. */}
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-block"
              >
                <ShimmerButton
                  as="span"
                  className="rounded-full bg-bone-50 px-6 py-3 text-sm text-ink-950"
                >
                  <span className="flex items-center gap-2">
                    Open Listo
                    <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </ShimmerButton>
              </a>
            </Reveal>
          ) : (
            <Reveal delay={0.26} className="mt-9">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone-600">
                Private beta
              </span>
            </Reveal>
          )}
        </div>

        <Reveal
          y={30}
          delay={0.12}
          className="col-span-full md:col-span-7 md:pt-14"
        >
          <div className="overflow-hidden rounded-lg border border-border bg-ink-900 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)]">
            <Browser
              image={project.shot ? withBase(project.shot) : undefined}
              initialUrl="https://app.listo.solutions/panou"
              initialTabs={[{ title: "Listo — Panou" }]}
              showWindowControls
              showStatusBar={false}
              enableBookmarks={false}
              enableHistory={false}
              enableDownloads={false}
              enableSettings={false}
              simulateLoading={false}
              className="w-full"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
