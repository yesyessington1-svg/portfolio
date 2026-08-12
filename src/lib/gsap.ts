"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

  // House easing + timing. Everything on the site inherits from here, so the
  // whole page moves like one object instead of six unrelated animations.
  gsap.defaults({ ease: "expo.out", duration: 1 });

  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Long, decelerating ease for anything that enters the viewport. */
export const EASE_ENTER = "expo.out";
/** Shorter ease for interaction feedback (hover, press). */
export const EASE_UI = "power3.out";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText, useGSAP };
