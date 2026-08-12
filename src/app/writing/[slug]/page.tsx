import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pieces, getPiece } from "@/content/writing";
import { site } from "@/content/site";
import { BookReader } from "@/components/site/book-reader";

export const dynamicParams = false;

export function generateStaticParams() {
  return pieces.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const piece = getPiece((await params).slug);
  if (!piece) return {};
  return {
    title: `${piece.title} — ${site.name}`,
    description: piece.note,
  };
}

export default async function WritingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const piece = getPiece((await params).slug);
  if (!piece) notFound();

  return (
    <BookReader
      title={piece.title}
      blocks={piece.blocks}
      kind={piece.kind}
      date={piece.date}
    />
  );
}
