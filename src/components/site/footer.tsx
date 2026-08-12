"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE_ENTER, prefersReducedMotion } from "@/lib/gsap";
import { site } from "@/content/site";

export function Footer() {
  const root = useRef<HTMLElement>(null);

  // The wordmark scales up as the page bottoms out. One gesture, no gimmick.
  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const mark = el.querySelector(".f-mark");
      if (!mark) return;

      gsap.fromTo(
        mark,
        { yPercent: 22, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1.4,
          ease: EASE_ENTER,
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <footer ref={root} className="relative overflow-hidden border-t border-border">
      <div className="shell pb-10 pt-20 md:pb-14">
        <div className="f-mark select-none">
          <span className="display block text-[clamp(3.5rem,17vw,15rem)] leading-[0.82] text-ink-800">
            {site.name}
          </span>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[11px] text-bone-600">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span className="font-mono text-[11px] text-bone-600">
            Next.js · Watermelon UI · GSAP
          </span>
        </div>
      </div>
    </footer>
  );
}
