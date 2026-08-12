"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { pieces, readingTime } from "@/content/writing";
import { cn } from "@/lib/utils";

export function Writing() {
  // Driven by what's actually in src/content/writing. No pieces, no section.
  if (pieces.length === 0) return null;

  return (
    <section id="writing" className="shell scroll-mt-24 py-24 md:py-32">
      <SectionHeading index="04" label="Writing" />

      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        <Reveal className="col-span-full md:col-span-3">
          <p className="max-w-xs text-sm leading-relaxed text-bone-500">
            Philosophy, mostly. It reads better than it summarises, so it&apos;s
            here in full rather than linked out.
          </p>
        </Reveal>

        <div className="col-span-full md:col-span-9">
          <Reveal stagger={0.08} className="grid grid-cols-1">
            {pieces.map((piece, i) => (
              <Link
                key={piece.slug}
                href={`/writing/${piece.slug}`}
                className={cn(
                  "group block border-t border-border py-7 transition-colors duration-500 hover:border-bone-700",
                  i === pieces.length - 1 && "border-b"
                )}
              >
                <div className="flex items-baseline justify-between gap-6">
                  <div className="flex min-w-0 items-baseline gap-5">
                    <span className="label shrink-0 text-bone-600">
                      {piece.kind}
                    </span>
                    <h3 className="truncate text-lg font-medium tracking-tight text-bone-100 transition-colors duration-300 group-hover:text-bone-50 md:text-xl">
                      {piece.title}
                    </h3>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <span className="hidden font-mono text-[11px] text-bone-600 sm:inline">
                      {readingTime(piece.blocks)}
                    </span>
                    <ArrowUpRight className="size-4 text-bone-600 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-flare" />
                  </div>
                </div>

                <p className="mt-3 max-w-xl text-sm leading-relaxed text-bone-500">
                  {piece.note}
                </p>
              </Link>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
