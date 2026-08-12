"use client";

import { useEffect, useRef, useState } from "react";
import {
  Asterisk,
  Fingerprint,
  Layers,
  History,
  PenLine,
  AtSign,
} from "lucide-react";
import { TooltipNavbar } from "@/components/watermelon-ui/tooltip-navbar";
import { gsap, useGSAP, ScrollTrigger, EASE_UI } from "@/lib/gsap";
import { site } from "@/content/site";

const ICONS: Record<string, React.ReactNode> = {
  top: <Asterisk className="h-full w-full" strokeWidth={1.5} />,
  about: <Fingerprint className="h-full w-full" strokeWidth={1.5} />,
  work: <Layers className="h-full w-full" strokeWidth={1.5} />,
  background: <History className="h-full w-full" strokeWidth={1.5} />,
  writing: <PenLine className="h-full w-full" strokeWidth={1.5} />,
  contact: <AtSign className="h-full w-full" strokeWidth={1.5} />,
};

export function Dock() {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>("top");
  // Sections can opt out of rendering (Writing does when it has no posts),
  // so the dock is built from what's actually on the page.
  const [present, setPresent] = useState<string[]>([]);

  useEffect(() => {
    setPresent(site.nav.filter((n) => document.getElementById(n.id)).map((n) => n.id));
  }, []);

  // Which section owns the viewport right now.
  useEffect(() => {
    if (!present.length) return;
    const triggers = present.map((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && setActive(id),
      })
    );
    return () => triggers.forEach((t) => t.kill());
  }, [present]);

  // The dock stays out of the way until you've committed to scrolling —
  // otherwise it sits on top of the hero's bottom row. Depends on `present`
  // because the dock isn't in the DOM until we know which sections exist.
  useGSAP(
    () => {
      const el = wrap.current;
      if (!el) return;
      gsap.set(el, { y: 96, autoAlpha: 0 });
      gsap.to(el, {
        y: 0,
        autoAlpha: 1,
        duration: 0.9,
        ease: EASE_UI,
        scrollTrigger: {
          start: 320,
          end: 99999,
          toggleActions: "play none none reverse",
        },
      });
    },
    { dependencies: [present] }
  );

  const items = site.nav
    .filter((n) => present.includes(n.id))
    .map((n) => ({
      icon: ICONS[n.id],
      label: n.label,
      labelHasKeyword: false as const,
      active: active === n.id,
      onClick: () => {
        document
          .getElementById(n.id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    }));

  if (items.length < 2) return null;

  return (
    <div
      ref={wrap}
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 hidden justify-center md:flex"
    >
      <div className="pointer-events-auto">
        <TooltipNavbar items={items} tooltipDelay={120} />
      </div>
    </div>
  );
}
