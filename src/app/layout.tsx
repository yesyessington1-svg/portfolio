import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.subhead,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.subhead,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
};

/**
 * Only the smooth-scroll wiring is global. The header and the dock belong to
 * the homepage — a reading page has its own chrome and doesn't want a nav
 * dock floating over 20,000 words.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="grain antialiased">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
