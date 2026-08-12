#!/usr/bin/env node
/**
 * Static export for GitHub Pages.
 *
 * Pages only serves files, so the two Gemini proxy routes can't come with us —
 * `output: 'export'` refuses to build a POST route handler, and even if it
 * didn't, there'd be no server to run it. This moves src/app/api aside for the
 * duration of the build and puts it straight back afterwards, including when
 * the build fails.
 *
 * Consequence: on Pages both games are fully playable, but the AI extras (Vex's
 * chat, Chronoloop's tutor and debate opponent) have no backend. They say so
 * politely instead of breaking. Everything else is identical.
 *
 * Usage:
 *   BASE_PATH=/my-repo node scripts/build-pages.mjs
 *   BASE_PATH= node scripts/build-pages.mjs        # user site or custom domain
 */
import { spawnSync } from "node:child_process";
import { existsSync, renameSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const api = join(root, "src", "app", "api");
const parked = join(root, "src", "app", "_api.disabled-for-export");
const basePath = process.env.BASE_PATH ?? "";

let moved = false;

function restore() {
  if (moved && existsSync(parked)) {
    renameSync(parked, api);
    moved = false;
    console.log("· restored src/app/api");
  }
}

process.on("exit", restore);
process.on("SIGINT", () => {
  restore();
  process.exit(130);
});

try {
  if (existsSync(api)) {
    if (existsSync(parked)) {
      throw new Error(
        `${parked} already exists — a previous run was interrupted. ` +
          `Rename it back to src/app/api and try again.`
      );
    }
    renameSync(api, parked);
    moved = true;
    console.log("· parked src/app/api (no server on Pages)");
  }

  console.log(
    `· building static export${basePath ? ` for base path "${basePath}"` : " for the domain root"}`
  );

  const res = spawnSync("npx", ["next", "build"], {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_OUTPUT: "export",
      NEXT_PUBLIC_BASE_PATH: basePath,
    },
  });

  if (res.status !== 0) process.exit(res.status ?? 1);

  // Without this, Pages runs the output through Jekyll, which drops every
  // directory beginning with an underscore — including _next. Nothing loads.
  const out = join(root, "out");
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, ".nojekyll"), "");
  console.log("· wrote out/.nojekyll");
  console.log("\n  Static site is in ./out — that's what Pages serves.\n");
} finally {
  restore();
}
