"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Play, Images } from "lucide-react";
import { Badge } from "@/components/watermelon-ui/badge";
import { ShimmerButton } from "@/components/watermelon-ui/shimmer-button";
import { SectionHeading } from "./section-heading";
import { FeaturedWork } from "./featured-work";
import { ProjectViewer, type ViewerTarget } from "./project-viewer";
import { gsap, useGSAP, EASE_ENTER, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { site, type WorkItem } from "@/content/site";
import { withBase } from "@/lib/paths";

const targetFor = (p: WorkItem): ViewerTarget =>
  p.embed
    ? { kind: "embed", title: p.title, src: withBase(p.embed) }
    : p.gallery?.length
      ? { kind: "gallery", title: p.title, images: p.gallery.map(withBase) }
      : null;

export function Work() {
  const root = useRef<HTMLElement>(null);
  const chip = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [viewing, setViewing] = useState<ViewerTarget>(null);

  const chipPos = useRef<{
    x: (v: number) => void;
    y: (v: number) => void;
  } | null>(null);

  const featured = site.work.find((p) => p.featured);
  const rows = site.work.filter((p) => !p.featured);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const q = gsap.utils.selector(el);

      gsap.fromTo(
        q(".w-row"),
        { y: 34, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.1,
          stagger: 0.085,
          ease: EASE_ENTER,
          overwrite: "auto",
          scrollTrigger: {
            trigger: q(".w-list")[0],
            start: "top 85%",
            once: true,
          },
        }
      );

      if (chip.current) {
        gsap.set(chip.current, {
          xPercent: -50,
          yPercent: -50,
          scale: 0,
          autoAlpha: 0,
        });
        chipPos.current = {
          x: gsap.quickTo(chip.current, "x", { duration: 0.5, ease: "power3" }),
          y: gsap.quickTo(chip.current, "y", { duration: 0.5, ease: "power3" }),
        };
      }
    },
    { scope: root }
  );

  const onMove = (e: React.MouseEvent) => {
    const list = root.current?.querySelector(".w-list");
    if (!list || !chipPos.current) return;
    const r = list.getBoundingClientRect();
    chipPos.current.x(e.clientX - r.left);
    chipPos.current.y(e.clientY - r.top);
  };

  const showChip = (show: boolean) => {
    if (!chip.current || prefersReducedMotion()) return;
    gsap.to(chip.current, {
      scale: show ? 1 : 0,
      autoAlpha: show ? 1 : 0,
      duration: 0.42,
      ease: "power3.out",
    });
  };

  const active = hovered !== null ? rows[hovered] : null;
  const chipLabel = active?.embed
    ? "Play"
    : active?.gallery?.length
      ? "View"
      : active?.href
        ? "Open"
        : "Offline";
  const live = Boolean(active?.embed || active?.gallery?.length || active?.href);

  return (
    <>
      <section
        id="work"
        ref={root}
        className="shell scroll-mt-24 py-24 md:py-32"
      >
        <SectionHeading index="02" label="Selected work" />

        {featured && <FeaturedWork project={featured} />}

        <div
          className="w-list relative"
          onMouseMove={onMove}
          onMouseEnter={() => showChip(true)}
          onMouseLeave={() => {
            setHovered(null);
            showChip(false);
          }}
        >
          <div
            ref={chip}
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-0 top-0 z-20 hidden select-none items-center gap-1.5 rounded-full px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] md:flex",
              live
                ? "bg-bone-50 text-ink-950"
                : "border border-border bg-ink-900 text-bone-500"
            )}
          >
            {chipLabel}
            {active?.embed ? (
              <Play className="size-3 fill-current" />
            ) : active?.gallery?.length ? (
              <Images className="size-3" />
            ) : active?.href ? (
              <ArrowUpRight className="size-3 stroke-[2.5]" />
            ) : null}
          </div>

          {rows.map((project, i) => {
            const target = targetFor(project);
            const linked = !target && Boolean(project.href);
            const clickable = Boolean(target);

            const rowClass = cn(
              "w-row group relative block w-full border-t border-border py-8 text-left transition-[opacity,transform] duration-500 md:py-10",
              i === rows.length - 1 && "border-b",
              hovered !== null && hovered !== i ? "opacity-35" : "opacity-100",
              !clickable && !linked && "cursor-default"
            );

            const body = (
              <>
                {(clickable || linked) && (
                  <span className="absolute inset-x-0 top-[-1px] h-px origin-left scale-x-0 bg-flare transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                )}

                <div className="grid grid-cols-12 items-baseline gap-x-6 gap-y-4">
                  <span className="col-span-2 font-mono text-[11px] text-bone-600 md:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="col-span-10 md:col-span-6">
                    <h3
                      className={cn(
                        "text-[clamp(1.4rem,3.4vw,2.6rem)] font-medium leading-[1.05] tracking-[-0.03em] text-bone-50 transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                        (clickable || linked) && "group-hover:translate-x-2"
                      )}
                    >
                      {project.title}
                    </h3>

                    {/* Thumbnails double as a hint that there's something to open */}
                    {project.gallery?.length ? (
                      <div className="mt-5 flex gap-2">
                        {project.gallery.slice(0, 3).map((src) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={src}
                            src={withBase(src)}
                            alt=""
                            aria-hidden
                            className="h-16 w-24 rounded-sm border border-border object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-100 md:h-20 md:w-32"
                          />
                        ))}
                      </div>
                    ) : null}

                    {/* `as="span"` because the whole row is the button —
                        a nested <button> would be invalid markup. */}
                    {project.embed ? (
                      <ShimmerButton
                        as="span"
                        className="mt-5 rounded-full bg-bone-50 px-4 py-2 text-xs text-ink-950"
                      >
                        <span className="flex items-center gap-1.5">
                          <Play className="size-3 fill-current" />
                          Play it
                        </span>
                      </ShimmerButton>
                    ) : null}
                  </div>

                  <div className="col-span-10 col-start-3 flex flex-col gap-1 md:col-span-2 md:col-start-8">
                    <span className="label text-bone-600">{project.kind}</span>
                    <span className="font-mono text-[11px] tabular-nums text-bone-500">
                      {project.year}
                    </span>
                    {project.note && (
                      <span className="mt-1 max-w-[12rem] font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-flare/70">
                        {project.note}
                      </span>
                    )}
                  </div>

                  <div className="col-span-10 col-start-3 md:col-span-3 md:col-start-10">
                    <p className="mb-4 max-w-sm text-sm leading-relaxed text-bone-400">
                      {project.blurb}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.stack.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="border-border bg-transparent px-2.5 py-0.5 font-mono text-[10px] font-normal tracking-wide text-bone-500"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );

            if (target) {
              return (
                <button
                  key={project.title}
                  type="button"
                  onMouseEnter={() => setHovered(i)}
                  onClick={() => setViewing(target)}
                  className={rowClass}
                >
                  {body}
                </button>
              );
            }

            if (linked) {
              return (
                <a
                  key={project.title}
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setHovered(i)}
                  className={rowClass}
                >
                  {body}
                </a>
              );
            }

            return (
              <div
                key={project.title}
                onMouseEnter={() => setHovered(i)}
                className={rowClass}
              >
                {body}
              </div>
            );
          })}
        </div>
      </section>

      <ProjectViewer target={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
