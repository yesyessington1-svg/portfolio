"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import {
  CommandSearch,
  type CommandItem,
} from "@/components/watermelon-ui/command-search";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { Block } from "@/content/writing";

/**
 * A book, not a scroll.
 *
 * The text is one CSS multi-column flow with a fixed height, so the browser
 * paginates it. The frame is a window one or two columns wide. Turning a page
 * flips a paper "leaf" over the outgoing side while the flow jumps underneath —
 * sliding the text sideways read as a carousel, which is not what a book does.
 *
 * Arrow keys, space, click either edge, swipe, or ⌘K for the contents.
 */

const GAP = 84; // gutter between the two pages of a spread, px
const PAD_X = 46; // page margins
const PAD_Y = 56;

type Chapter = { title: string; column: number; isChapter: boolean };

export function BookReader({
  title,
  blocks,
  kind,
  date,
}: {
  title: string;
  blocks: Block[];
  kind: string;
  date: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const flow = useRef<HTMLDivElement>(null);
  const leaf = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState({
    pageW: 0,
    perView: 2,
    columns: 1,
  });
  const [page, setPage] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [contentsOpen, setContentsOpen] = useState(false);

  const turning = useRef(false);

  /* ── Measure ───────────────────────────────────────────────── */
  const measure = useCallback(() => {
    const f = frame.current;
    const fl = flow.current;
    if (!f || !fl) return;

    const spread = window.innerWidth >= 1024;
    const perView = spread ? 2 : 1;

    const availW = f.clientWidth;
    const availH = f.clientHeight;
    const pageW = spread ? (availW - GAP) / 2 : availW;
    const colW = pageW - PAD_X * 2;
    const colH = availH - PAD_Y * 2;
    if (colW <= 0 || colH <= 0) return;

    fl.style.height = `${colH}px`;
    fl.style.columnWidth = `${colW}px`;
    fl.style.columnGap = `${GAP + PAD_X * 2}px`;

    const step = colW + GAP + PAD_X * 2;
    const columns = Math.max(
      1,
      Math.round((fl.scrollWidth + GAP + PAD_X * 2) / step)
    );

    const found: Chapter[] = [];
    fl.querySelectorAll<HTMLElement>("h2[data-chapter]").forEach((h) => {
      const t = h.dataset.chapter || h.textContent || "";
      found.push({
        title: t,
        column: Math.floor((h.offsetLeft + 1) / step),
        isChapter: /^chapter\b/i.test(t),
      });
    });

    setMetrics({ pageW, perView, columns });
    setChapters(found);
    setPage((p) => Math.min(p, Math.max(0, columns - perView)));
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (frame.current) ro.observe(frame.current);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(() => measure());
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const maxPage = Math.max(0, metrics.columns - metrics.perView);
  const step = metrics.pageW + GAP;

  /* ── The turn ──────────────────────────────────────────────────
     Deliberately NOT inside useGSAP. useGSAP reverts the animations its
     callback created whenever the dependencies change, and `page` is one
     of those dependencies — so the flip got killed a frame after it
     started and the leaf snapped back to its CSS opacity of 0. A page
     turn is an event, not state derived from a render.
     ─────────────────────────────────────────────────────────── */
  const runTurn = useCallback(
    (raw: number) => {
      const target = Math.min(maxPage, Math.max(0, raw));
      const fl = flow.current;
      const lf = leaf.current;
      if (!fl || target === page || turning.current) return;

      const toX = -target * step;

      if (prefersReducedMotion() || !lf || !metrics.pageW) {
        setPage(target);
        gsap.set(fl, { x: toX });
        return;
      }

      const forward = target > page;
      const spread = metrics.perView === 2;
      // Forward: the right-hand leaf lifts and swings left across the spine.
      // Back: the left-hand leaf swings right. Single page: the whole sheet.
      const half = spread ? metrics.pageW + GAP / 2 : metrics.pageW;

      turning.current = true;
      setPage(target); // folio and progress update immediately

      gsap.set(lf, {
        width: half,
        left: forward ? (spread ? half : 0) : 0,
        transformOrigin: forward ? "left center" : "right center",
        rotateY: 0,
        opacity: 1,
        boxShadow: "0px 0px 0px rgba(0,0,0,0)",
      });

      gsap
        .timeline({
          onComplete: () => {
            turning.current = false;
            gsap.set(lf, { opacity: 0, rotateY: 0 });
          },
        })
        .to(lf, {
          rotateY: forward ? -168 : 168,
          duration: 0.8,
          ease: "power2.inOut",
        })
        // Shadow swells as the leaf stands up, then flattens as it lands.
        .to(
          lf,
          {
            boxShadow: `${forward ? "-" : ""}26px 0px 50px -12px rgba(58,48,34,0.45)`,
            duration: 0.36,
            ease: "power1.out",
          },
          0
        )
        .to(
          lf,
          { boxShadow: "0px 0px 0px rgba(0,0,0,0)", duration: 0.32 },
          0.46
        )
        // The other half of the spread changes too, so dip the whole flow.
        .to(fl, { autoAlpha: 0, duration: 0.16, ease: "power1.in" }, 0)
        .set(fl, { x: toX }, 0.22)
        .to(fl, { autoAlpha: 1, duration: 0.32, ease: "power1.out" }, 0.26);
    },
    [maxPage, page, step, metrics.pageW, metrics.perView]
  );

  const turn = useCallback(
    (dir: 1 | -1) => runTurn(page + dir * metrics.perView),
    [runTurn, page, metrics.perView]
  );

  // Re-anchor without animating when the measurements change (resize, fonts).
  useEffect(() => {
    if (turning.current || !flow.current || !metrics.pageW) return;
    gsap.set(flow.current, { x: -page * step, autoAlpha: 1 });
  }, [page, step, metrics.pageW]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (contentsOpen) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        turn(1);
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        turn(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn, contentsOpen]);

  const touch = useRef<number | null>(null);

  /* ── Contents, as a command palette ────────────────────────── */
  const items: CommandItem[] = useMemo(
    () =>
      chapters.map((c, i) => ({
        id: `${i}`,
        title: c.title,
        section: c.isChapter ? "Chapters" : "Front matter",
        // The page number already lives in the shortcut slot, so the icon is
        // just a rank mark: filled for a chapter, hollow for front matter.
        icon: (
          <span
            className={cn(
              "block size-1.5 rounded-full",
              c.isChapter ? "bg-flare/70" : "border border-bone-600"
            )}
          />
        ),
        shortcut: `p. ${c.column + 1}`,
        action: () =>
          runTurn(
            metrics.perView === 2 ? c.column - (c.column % 2) : c.column
          ),
      })),
    [chapters, runTurn, metrics.perView]
  );

  const progress = maxPage > 0 ? page / maxPage : 1;
  const rendered = useMemo(() => renderBlocks(blocks), [blocks]);

  return (
    <div className="book-stage relative flex h-[100svh] w-full flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="relative z-50 flex shrink-0 items-center justify-between gap-4 px-4 py-3 md:px-7">
        <Link
          href="/#writing"
          className="group flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-500 transition-colors hover:text-bone-50"
        >
          <ArrowLeft className="size-3 transition-transform duration-500 group-hover:-translate-x-0.5" />
          Back
        </Link>

        <div className="hidden min-w-0 items-baseline gap-3 lg:flex">
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-bone-500">
            {title}
          </span>
          <span className="font-mono text-[10px] text-bone-700">·</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-600">
            {kind} {date}
          </span>
        </div>

        {/* Watermelon's command palette, doing the table of contents. */}
        <div className="flex w-[13rem] shrink-0 justify-end md:w-64">
          <CommandSearch
            items={items}
            open={contentsOpen}
            onOpenChange={setContentsOpen}
            align="right"
            label="Contents"
            placeholder="Jump to a chapter…"
            shortcut="C"
          />
        </div>
      </div>

      {/* ── The book ── */}
      <div
        className="relative min-h-0 flex-1 px-3 pb-3 md:px-8 md:pb-6"
        style={{ perspective: 2400 }}
        onTouchStart={(e) => {
          touch.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 45) turn(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        <div
          ref={frame}
          className={cn(
            "book-page relative h-full w-full overflow-hidden rounded-[3px]",
            metrics.perView === 2 && "book-spine"
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            ref={flow}
            className="book-flow absolute"
            style={{ top: PAD_Y, left: PAD_X, right: PAD_X }}
          >
            {rendered}
          </div>

          {/* The turning leaf */}
          <div ref={leaf} className="book-leaf" aria-hidden />

          {/* Folios sit on the frame, not in the flow. No running head — it
              duplicated the chapter title sitting right beneath it. */}
          <div className="book-folio pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-between px-[46px]">
            <span>{page + 1}</span>
            {metrics.perView === 2 && page + 1 < metrics.columns && (
              <span>{page + 2}</span>
            )}
          </div>

          <button
            aria-label="Previous page"
            onClick={() => turn(-1)}
            disabled={page === 0}
            className="group absolute inset-y-0 left-0 z-20 flex w-[15%] cursor-w-resize items-center pl-3 disabled:cursor-default"
          >
            <ChevronLeft className="size-6 text-ink-950/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0" />
          </button>
          <button
            aria-label="Next page"
            onClick={() => turn(1)}
            disabled={page >= maxPage}
            className="group absolute inset-y-0 right-0 z-20 flex w-[15%] cursor-e-resize items-center justify-end pr-3 disabled:cursor-default"
          >
            <ChevronRight className="size-6 text-ink-950/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0" />
          </button>
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="relative z-30 flex shrink-0 items-center gap-4 px-4 pb-3 md:px-8 md:pb-5">
        <BookOpen className="size-3 shrink-0 text-bone-700" />
        <span className="font-mono text-[10px] tabular-nums text-bone-600">
          {String(page + 1).padStart(2, "0")}
        </span>
        <div className="h-px flex-1 bg-border">
          <div
            className="h-px bg-flare transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <span className="font-mono text-[10px] tabular-nums text-bone-600">
          {String(metrics.columns).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

/* ── Block rendering ─────────────────────────────────────────────
   A heading straight after a quote is an epigraph credit if it reads
   like a name; structural words are excluded outright.
   ─────────────────────────────────────────────────────────────── */

const STRUCTURAL = new Set([
  "note",
  "notes",
  "chapter",
  "part",
  "book",
  "approach",
  "approaches",
  "preface",
  "introduction",
  "author",
  "author's",
  "author’s",
  "afterword",
  "epilogue",
]);

function isAttribution(text: string) {
  const words = text.split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;
  if (words.some((w) => STRUCTURAL.has(w.toLowerCase().replace(/[.,]/g, ""))))
    return false;
  return words.every((w) => /^[A-Z]/.test(w));
}

function renderBlocks(blocks: Block[]) {
  return blocks.map((b, i) => {
    const prev = blocks[i - 1];

    if (b.t === "div") {
      return (
        <p key={i} className="ornament" aria-hidden>
          ◈
        </p>
      );
    }

    if (b.t === "q") return <blockquote key={i}>{b.v}</blockquote>;

    if (b.t === "h") {
      if (prev?.t === "q" && isAttribution(b.v)) {
        return (
          <p key={i} className="attribution">
            {b.v}
          </p>
        );
      }
      return (
        <h2 key={i} data-chapter={b.v}>
          {b.v}
        </h2>
      );
    }

    const opening = prev?.t === "h" && !isAttribution(prev.v);
    return (
      <p key={i} className={opening ? "opening" : undefined}>
        {b.v}
      </p>
    );
  });
}
