"use client";

import { useRef } from "react";
import {
  gsap,
  useGSAP,
  SplitText,
  EASE_ENTER,
  prefersReducedMotion,
} from "@/lib/gsap";

type SplitLinesProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Play immediately instead of waiting for the scroll trigger. */
  immediate?: boolean;
};

/**
 * Masked line reveal. Each line sits in its own overflow-hidden box and
 * slides up from beneath it — the type reads as uncovered rather than
 * flown in. No opacity fade: the mask does the work.
 */
export function SplitLines({
  children,
  className,
  delay = 0,
  stagger = 0.085,
  immediate = false,
}: SplitLinesProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      // Split the text elements themselves, not this wrapper — handing
      // SplitText a container restructures its children and breaks nesting.
      const targets = el.children.length ? Array.from(el.children) : [el];

      const split = SplitText.create(targets, {
        type: "lines",
        mask: "lines",
        linesClass: "line-inner",
      });

      const tween = gsap.fromTo(
        split.lines,
        { yPercent: 112 },
        {
          yPercent: 0,
          duration: 1.25,
          delay,
          stagger,
          ease: EASE_ENTER,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
        }
      );

      return () => {
        tween.kill();
        split.revert();
      };
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
