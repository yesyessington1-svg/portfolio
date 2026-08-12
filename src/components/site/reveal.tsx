"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, EASE_ENTER, prefersReducedMotion } from "@/lib/gsap";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Distance travelled, px. Keep small — this is a settle, not an entrance. */
  y?: number;
  delay?: number;
  /** Stagger direct children instead of moving the wrapper as one block. */
  stagger?: number;
  start?: string;
};

export function Reveal({
  children,
  as: Tag = "div",
  className,
  y = 22,
  delay = 0,
  stagger,
  start = "top 88%",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  // useGSAP runs in a layout effect — before paint — so hiding here never
  // flashes, and with JS disabled the content simply stays visible.
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const targets = stagger !== undefined ? Array.from(el.children) : [el];
      if (!targets.length) return;

      // fromTo, never from: an explicit end state can't be clobbered by a
      // ScrollTrigger refresh re-reading the (already hidden) current value.
      gsap.fromTo(
        targets,
        { y, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.05,
          delay,
          ease: EASE_ENTER,
          stagger: stagger ?? 0,
          overwrite: "auto",
          scrollTrigger: { trigger: el, start, once: true },
        }
      );
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {children}
    </Tag>
  );
}
