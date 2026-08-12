/**
 * Next rewrites `<Link>` hrefs for basePath automatically, but not strings we
 * hand to an `<iframe src>` or `<img src>`. Those go through here.
 *
 * Empty in every normal deploy. Only a GitHub Pages *repo* site needs it,
 * because it's served from /<repo>/ instead of the domain root.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const withBase = (path: string) =>
  path.startsWith("/") ? `${BASE}${path}` : path;
