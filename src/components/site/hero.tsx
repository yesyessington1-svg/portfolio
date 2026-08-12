"use client";

import { useRef } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/watermelon-ui/button";
import {
  gsap,
  useGSAP,
  SplitText,
  EASE_ENTER,
  prefersReducedMotion,
} from "@/lib/gsap";
import { site } from "@/content/site";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q(".h-anim"), { autoAlpha: 1, y: 0 });
        return;
      }

      const split = SplitText.create(q(".h-line"), {
        type: "lines",
        mask: "lines",
        linesClass: "line-inner",
      });

      const tl = gsap.timeline({ delay: 0.15 });

      tl.set(q(".h-anim"), { autoAlpha: 1 })
        .from(q(".h-eyebrow-rule"), {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.1,
          ease: EASE_ENTER,
        })
        .from(
          q(".h-eyebrow-text"),
          { yPercent: 120, duration: 0.9, ease: EASE_ENTER },
          "-=0.9"
        )
        .from(
          split.lines,
          { yPercent: 115, duration: 1.35, stagger: 0.09, ease: EASE_ENTER },
          "-=0.75"
        )
        .from(
          q(".h-sub"),
          { y: 20, autoAlpha: 0, duration: 1.1, ease: EASE_ENTER },
          "-=0.95"
        )
        .from(
          q(".h-cta"),
          {
            y: 16,
            autoAlpha: 0,
            duration: 0.9,
            stagger: 0.07,
            ease: EASE_ENTER,
          },
          "-=0.85"
        )
        .from(
          q(".h-meta"),
          {
            autoAlpha: 0,
            y: 12,
            duration: 0.9,
            stagger: 0.06,
            ease: EASE_ENTER,
          },
          "-=0.8"
        );

      // The hero doesn't just scroll away — it recedes.
      gsap.to(q(".h-stage"), {
        y: -70,
        autoAlpha: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      // Hairline grid drifts at a different rate. Depth without parallax kitsch.
      gsap.to(q(".h-grid"), {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      return () => split.revert();
    },
    { scope: root }
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 pt-32 md:pb-24"
    >
      {/* Structure, not decoration: a hairline grid and one soft pool of light. */}
      <div
        aria-hidden
        className="h-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #16161b 1px, transparent 1px)",
          backgroundSize: "clamp(80px, 12vw, 190px) 100%",
          maskImage:
            "radial-gradient(120% 85% at 15% 100%, #000 20%, transparent 78%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 -z-10 h-[36rem] w-[36rem] rounded-full opacity-[0.16] blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, var(--color-flare) 0%, transparent 68%)",
        }}
      />

      <div className="shell h-stage">
        {/* Eyebrow */}
        <div className="h-anim mb-10 flex items-center gap-5 md:mb-14">
          <span className="h-eyebrow-rule h-px w-12 bg-flare md:w-20" />
          <span className="line-mask">
            <span className="h-eyebrow-text label block text-bone-400">
              {site.role} — {site.location}
            </span>
          </span>
        </div>

        {/* Headline */}
        {/* Sized for four lines. Drop to three and you can push this bigger. */}
        <h1 className="h-anim display text-[clamp(2.6rem,8.2vw,7rem)] text-bone-50">
          {site.headline.map((line, i) => (
            <span key={i} className="h-line block">
              {i === site.headline.length - 1 ? (
                <>
                  {line.replace(/\.$/, "")}
                  <span className="text-flare">.</span>
                </>
              ) : (
                line
              )}
            </span>
          ))}
        </h1>

        {/* Subhead + CTAs */}
        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-8">
          <p className="h-anim h-sub col-span-full max-w-xl text-[1.0625rem] leading-relaxed text-bone-400 md:col-span-6 md:col-start-1 lg:col-span-5">
            {site.subhead}
          </p>

          <div className="col-span-full flex flex-wrap items-center gap-3 md:col-span-6 md:col-start-7 md:justify-end lg:col-span-5 lg:col-start-8">
            <Button
              asChild
              size="lg"
              className="h-anim h-cta group rounded-full px-6 font-medium"
            >
              <a href="#work">
                Selected work
                <ArrowDownRight className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-anim h-cta group rounded-full border-border bg-transparent px-6 font-medium text-bone-200 hover:bg-ink-850 hover:text-bone-50 dark:bg-transparent dark:hover:bg-ink-850"
            >
              <a href="#contact">
                Get in touch
                <ArrowUpRight className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Corner meta */}
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-border pt-6 sm:grid-cols-4 md:mt-24">
          {site.about.facts.map((f) => (
            <div key={f.k} className="h-anim h-meta">
              <div className="label mb-1.5 text-bone-600">{f.k}</div>
              <div className="text-sm text-bone-200">{f.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
