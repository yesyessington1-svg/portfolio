/**
 * Two build targets.
 *
 * Default (Vercel, Netlify, any Node host): a normal Next build. The two
 * Gemini proxy routes exist, so the AI features in both games work.
 *
 * GitHub Pages (`npm run build:pages`): a static export. Pages can only serve
 * files, so the API routes can't come along — see scripts/build-pages.mjs.
 * Everything else works, including both games.
 *
 * BASE_PATH matters on Pages: a repo site is served from
 * https://<user>.github.io/<repo>, so every absolute path needs that prefix.
 * Leave it empty for a user site (<user>.github.io) or a custom domain.
 */
const isExport = process.env.NEXT_OUTPUT === "export";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isExport
    ? {
        output: "export",
        // Pages serves /about/ rather than /about, so emit directories.
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
