"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE_ENTER } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  label,
  className,
}: {
  index: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rule = ref.current?.querySelector(".sh-rule");
      if (!rule) return;
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          duration: 1.4,
          ease: EASE_ENTER,
          scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
        }
      );
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-5 pb-12 md:pb-16", className)}
    >
      <span className="label text-flare">{index}</span>
      <span className="label text-bone-400">{label}</span>
      <span className="sh-rule h-px flex-1 bg-border" />
    </div>
  );
}
