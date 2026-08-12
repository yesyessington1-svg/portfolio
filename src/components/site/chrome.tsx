"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE_UI } from "@/lib/gsap";
import { site } from "@/content/site";

/** Hairline scroll-progress rule pinned to the very top of the page. */
function Progress() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!bar.current) return;
    gsap.set(bar.current, { scaleX: 0, transformOrigin: "left center" });
    gsap.to(bar.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.4 },
    });
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-px">
      <div ref={bar} className="h-px w-full bg-flare" />
    </div>
  );
}

export function Chrome() {
  const bar = useRef<HTMLDivElement>(null);

  // Background only materialises once you leave the hero.
  useGSAP(() => {
    if (!bar.current) return;
    gsap.to(bar.current, {
      backgroundColor: "rgba(8,8,10,0.72)",
      backdropFilter: "blur(14px)",
      borderBottomColor: "#21212a",
      duration: 0.5,
      ease: EASE_UI,
      scrollTrigger: {
        start: 40,
        end: 99999,
        toggleActions: "play none none reverse",
      },
    });
  }, []);

  return (
    <>
      <Progress />
      <header
        ref={bar}
        className="fixed inset-x-0 top-0 z-40 border-b border-transparent"
        style={{ backgroundColor: "rgba(8,8,10,0)" }}
      >
        <div className="shell flex h-14 items-center">
          <a
            href="#top"
            aria-label={`${site.name} — back to top`}
            className="group flex items-baseline gap-2.5 text-sm font-medium tracking-tight"
          >
            <span className="font-mono text-[11px] text-flare">
              {site.initials}
            </span>
            <span className="text-bone-50 transition-colors group-hover:text-bone-200">
              {site.name}
            </span>
          </a>
        </div>
      </header>
    </>
  );
}
