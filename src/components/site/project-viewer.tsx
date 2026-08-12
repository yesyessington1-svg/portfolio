"use client";

import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { gsap, useGSAP, EASE_UI, prefersReducedMotion } from "@/lib/gsap";

export type ViewerTarget =
  | { kind: "embed"; title: string; src: string }
  | { kind: "gallery"; title: string; images: string[] }
  | null;

/**
 * Full-screen overlay for looking at a project without leaving the page.
 * Two modes: an iframe for the playable demo, a gallery for renders.
 * Escape closes, arrow keys page through images, scroll is locked behind it.
 */
export function ProjectViewer({
  target,
  onClose,
}: {
  target: ViewerTarget;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const open = target !== null;
  const images = target?.kind === "gallery" ? target.images : [];

  useEffect(() => setIndex(0), [target]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (!images.length) return;
      if (e.key === "ArrowRight")
        setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, images.length]);

  // Lenis reads scroll off the window, so hiding overflow parks the page.
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !open) return;
      const stage = el.querySelector(".pv-stage");
      if (prefersReducedMotion()) {
        gsap.set([el, stage], { autoAlpha: 1, y: 0 });
        return;
      }
      gsap
        .timeline()
        .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .fromTo(
          stage,
          { y: 26, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: EASE_UI },
          "-=0.12"
        );
    },
    { dependencies: [open, target], scope: root }
  );

  if (!target) return null;

  const isEmbed = target.kind === "embed";

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={target.title}
      className="fixed inset-0 z-[70] flex flex-col bg-ink-950/95 backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="label text-flare">
            {isEmbed ? "Playing" : "Viewing"}
          </span>
          <span className="truncate font-mono text-xs text-bone-300">
            {target.title}
          </span>
          {!isEmbed && images.length > 1 && (
            <span className="font-mono text-[11px] tabular-nums text-bone-600">
              {index + 1} / {images.length}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={isEmbed ? target.src : images[index]}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-400 transition-colors hover:border-bone-700 hover:text-bone-50"
          >
            New tab
            <ExternalLink className="size-3" />
          </a>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-full bg-bone-50 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-950 transition-opacity hover:opacity-90"
          >
            Close
            <X className="size-3 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {isEmbed ? (
        <div className="pv-stage min-h-0 flex-1 border-t border-border">
          <iframe
            key={target.src}
            src={target.src}
            title={target.title}
            className="h-full w-full bg-black"
            // Same origin so the demo can reach its own assets and /api routes.
            // Popups and top-level navigation stay blocked.
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
            allow="autoplay; fullscreen"
          />
        </div>
      ) : (
        <div className="pv-stage relative flex min-h-0 flex-1 items-center justify-center border-t border-border p-4 md:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={images[index]}
            src={images[index]}
            alt={`${target.title} — ${index + 1} of ${images.length}`}
            className="max-h-full max-w-full rounded-md border border-border object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                aria-label="Previous"
                onClick={() =>
                  setIndex((i) => (i - 1 + images.length) % images.length)
                }
                className="absolute left-3 flex size-11 items-center justify-center rounded-full border border-border bg-ink-900/80 text-bone-300 backdrop-blur transition-colors hover:text-bone-50 md:left-6"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="Next"
                onClick={() => setIndex((i) => (i + 1) % images.length)}
                className="absolute right-3 flex size-11 items-center justify-center rounded-full border border-border bg-ink-900/80 text-bone-300 backdrop-blur transition-colors hover:text-bone-50 md:right-6"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
