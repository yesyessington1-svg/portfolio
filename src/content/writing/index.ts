import cartography from "./the-cartography-of-almost.json";
import kitchen from "./the-kitchen-at-eleven.json";

/**
 * Blocks come out of the original .docx files:
 *   h   heading (chapter titles, section names)
 *   p   paragraph
 *   q   pull quote / epigraph
 *   div a visual divider the author used between passages
 */
export type Block = { t: "h" | "p" | "q" | "div"; v: string };

export type Piece = {
  slug: string;
  title: string;
  /** Shown in the list and at the top of the reader. */
  kind: string;
  date: string;
  blocks: Block[];
  /** One line of framing for the list. */
  note: string;
};

const wordCount = (blocks: Block[]) =>
  blocks
    .filter((b) => b.t === "p" || b.t === "q")
    .reduce((n, b) => n + b.v.split(/\s+/).length, 0);

/** ~230 wpm. A 20,000-word book should not read as "1 hr". */
export const readingTime = (blocks: Block[]) => {
  const mins = Math.max(1, Math.round(wordCount(blocks) / 230));
  if (mins < 60) return `${mins} min read`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min read` : `${h} hr read`;
};

export const pieces: Piece[] = [
  {
    slug: "the-cartography-of-almost",
    title: "The Cartography of Almost",
    kind: "Book",
    date: "2026",
    note: "Three approaches to a wall that doesn't move: knowing, feeling, willing. Some chapters are fiction, some are closer to memory.",
    blocks: cartography as Block[],
  },
  {
    slug: "the-kitchen-at-eleven",
    title: "Chapter VIII · The Kitchen at Eleven",
    kind: "Chapter",
    date: "2026",
    note: "A letter to a man who cannot receive it. Pulled out on its own because it stands up on its own.",
    blocks: kitchen as Block[],
  },
];

export const getPiece = (slug: string) => pieces.find((p) => p.slug === slug);
