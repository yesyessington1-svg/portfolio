# George Lupu - Personal site

Personal site. Portfolio, two playable browser games, and a long-form reader for
written work.

**Live:** https://yesyessington1-svg.github.io/portfolio/

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · GSAP + Lenis ·
[Watermelon UI](https://ui.watermelon.sh)

Dark near-black palette with a single accent. Type is self-hosted through
Fontsource, so there are no third-party font requests and no layout shift.

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Node 20+. No database, no services.

Optional: the AI features in both games call Google Gemini through a server
route. Copy `.env.example` to `.env.local` and add a `GOOGLE_AI_API_KEY` to
switch them on. Without it everything else runs normally and the AI parts say
they're unavailable.

```bash
npm run build        # production build
npm run start        # serve the production build
npm run build:pages  # static export for GitHub Pages
```

---

## Content

All short copy lives in [`src/content/site.ts`](src/content/site.ts) — name,
headline, bio, projects, background, socials, navigation order. No component
needs editing to change a word.

Long-form writing lives in [`src/content/writing/`](src/content/writing/) as
block JSON, with metadata in `index.ts`.

A few conventions in `site.ts`:

| Field | Effect |
| --- | --- |
| `work[].featured` | Renders the large treatment at the top of the Work section |
| `work[].embed` | Path under `public/` — the project becomes playable in an overlay |
| `work[].gallery` | Image paths — the project opens as a gallery instead |
| `work[].href` | External link. Falls back to a "private beta" label when empty |
| `work[].note` | Small caption under the metadata |
| `stack[]` | Feeds the logo ticker; names map to marks in `stack-marquee.tsx` |

Empty the `pieces` array in `src/content/writing/index.ts` and the Writing
section disappears from both the page and the navigation.

---

## Architecture

### The book reader

`/writing/<slug>` paginates rather than scrolls.

The text is laid out as one CSS multi-column flow with a fixed height, so the
browser does the pagination. The frame is a window one or two columns wide, and
turning a page transforms the flow. No scrollbar, no half-cut lines, and the
page count recalculates on resize.

Turning a page flips a paper leaf: a sheet rotates on the Y axis from the spine,
casting a shadow that swells as it stands up and flattens as it lands, while the
flow jumps underneath while it's covered.

- Two-page spread above 1024px, single page below
- Arrow keys, space, PageUp/PageDown, click either edge, swipe
- `C` or ⌘K opens a searchable table of contents with real page numbers
- Drop caps on chapter openings, indented paragraphs, justified with hyphenation
- A heading immediately after a quote is rendered as an epigraph attribution
  when it reads like a name (`isAttribution()` in `book-reader.tsx`)

Set in EB Garamond on a paper ground, with a 1px crease at the spine.

Adding a piece: convert the source to `{t, v}` blocks (`h` heading, `p`
paragraph, `q` quote, `div` divider), drop the JSON in `src/content/writing/`,
and add an entry to `pieces`.

### Embedded games

Both games run inside the site, in an iframe on the same origin, opened from the
Work section.

**CYBER_BREACH** — `public/projects/cyber-breach/`. A browser escape room built
on a fake operating system: terminal, dark web browser, notepad, inventory, and
real ciphers. Plain HTML, CSS and JavaScript with no build step.

**Chronoloop** — `public/projects/chronoloop/`. A history platform built as a
game: timed missions on a world map, a debate arena with an AI opponent, XP,
fifteen levels and a leaderboard.

Chronoloop originally required an Express server for accounts and progress.
[`demo-api.js`](public/projects/chronoloop/demo-api.js) reimplements all nine of
its endpoints in the browser over `localStorage`, matching the original request
and response shapes exactly, so none of the game's own logic changed:

```
POST /api/register     POST /api/xp             GET  /api/leaderboard
POST /api/login        POST /api/mission-log    POST /api/arena-log
GET  /api/me           POST /api/onboarding     POST /api/completed-missions
```

It patches `window.fetch` and passes anything that isn't Chronoloop's own
`/api/*` through untouched. Progress persists per browser, and the leaderboard
seeds with players so a new account has something to climb. Credentials are
stored in plain text on purpose: there is no server to protect them from, and
the data belongs to whoever is at the keyboard. A real deployment with a real
backend should hash them.

### AI routes

| Route | Serves | Request |
| --- | --- | --- |
| `/api/vex` | The in-game contact in CYBER_BREACH | `{ text }` — the prompt is server-side |
| `/api/gemini` | Chronoloop's tutor and debate arena | `{ contents, generationConfig }` |

Shared plumbing in [`src/lib/gemini.ts`](src/lib/gemini.ts). Both routes are
same-origin only via `Sec-Fetch-Site`, rate limited per IP, cap prompt length
and output tokens, and never forward upstream error bodies.

`/api/gemini` forwards a request body rather than building it, because
Chronoloop's prompts are constructed across a large amount of inline HTML.
Moving those prompts into the route would make it as narrow as `/api/vex`.

---

## Design system

Tokens are declared once, in `@theme` inside
[`src/app/globals.css`](src/app/globals.css).

| Token | Value | Role |
| --- | --- | --- |
| `--color-ink-950` | `#08080a` | page background |
| `--color-bone-50` → `700` | – | text, primary through to barely-there |
| `--color-flare` | `#de4536` | the accent |
| `--color-paper` | `#f2ece1` | the book |

The accent appears in about eight places across the whole site: the wordmark
initials, the eyebrow rule, section indices, a terminal full stop, the hover
rule on work rows, the scroll progress line, the active navigation icon, and
project notes. Changing `--color-flare` changes all of them and nothing else.

**Typefaces:** Instrument Sans for display and body, Geist Mono for indices and
metadata, EB Garamond for the book.

**Utilities:** `.display`, `.label`, `.shell`, `.rule`, and the `.book-*` set.

---

## Motion

GSAP drives the animation; Lenis owns the scroll position. They share one clock:
`gsap.ticker` drives Lenis, and Lenis's scroll event drives `ScrollTrigger`.
Plugins register once in [`src/lib/gsap.ts`](src/lib/gsap.ts).

Two reusable primitives:

- **`<SplitLines>`** — masked line reveal. Each line sits in an overflow-hidden
  box and slides up from beneath it, so type reads as uncovered rather than
  flown in.
- **`<Reveal>`** — a small translate and fade, with optional stagger.

Everything respects `prefers-reduced-motion`: Lenis doesn't initialise, reveals
resolve immediately, and page turns snap instead of flipping.

### Notes for anyone extending this

Five constraints worth knowing, each learned the hard way:

1. **Use `fromTo`, never `from`, with a ScrollTrigger.** A `from()` tween reads
   its end state from the element's current value. If a refresh lands after the
   from-state has rendered, it re-reads the already-hidden value as the
   destination and the element animates hidden to hidden — invisible forever.
2. **Give `SplitText` the text element, not a wrapper.** Splitting a container
   that holds a `<p>` restructures its children and breaks the nesting.
3. **`useGSAP` needs its dependencies.** Anything that mounts conditionally must
   list the state that gates it, or its entrance animation never gets set up.
4. **Don't drive an event animation from `useGSAP`.** It reverts whatever its
   callback created when dependencies change, which kills an in-flight
   animation a frame after it starts. Page turns are a plain callback with a
   separate effect that re-anchors on resize.
5. **Measure the book after `document.fonts.ready`.** Column counts depend on
   font metrics, so measuring before the serif loads gives a wrong page total.

---

## Component library

Components come from the [Watermelon UI](https://ui.watermelon.sh) registry and
live in `src/components/watermelon-ui/`. It's a copy-paste registry, so they're
part of this codebase rather than a dependency.

```bash
npx shadcn@latest add "https://registry.watermelon.sh/<component>.json"
```

| Component | Used for |
| --- | --- |
| `browser` | Frames the Listo screenshot in the featured block |
| `marquee` | The logo ticker |
| `command-search` | The book's contents palette |
| `card-split-accordion` | The Background section |
| `shimmer-button` | Primary calls to action |
| `copy-confirm` | Copy-to-clipboard control |
| `tooltip-navbar` | The floating section navigation |
| `badge` · `button` · `card` · `input` · `separator` | Primitives |

### Local modifications

Six registry files are modified rather than used as shipped. Each carries a
comment explaining why. Re-running `shadcn add` on any of them will overwrite
the change.

| File | Change |
| --- | --- |
| `marquee.tsx` | Animation moved out of the Tailwind theme key. `--animate-marquee: marquee var(--duration) …` is declared on `:root`, and a custom property resolves its inner `var()` where it is declared — but `--duration` is set by the component further down the tree. The property was invalid at `:root`, so the computed animation was `none` and the marquee never moved. Now a plain class, which resolves the duration on the element. |
| `browser.tsx` | Tab ids and sample timestamps came from `Date.now()`, producing different values on server and client — a hydration mismatch. Both are now deterministic. |
| `shimmer-button.tsx` | Hardcoded as a `<button>`, which is invalid nested inside another button or an anchor. Added an `as` prop. |
| `command-search.tsx` | `section` was a literal union of the demo's own three names; the panel only opened one direction; no external open state. Added `section: string`, `align`, `open`/`onOpenChange`, custom label and shortcut, and ⌘K. |
| `tooltip-navbar.tsx` | No click handling, so it could not work as navigation. Added `onClick` and `active`. |
| `card-split-accordion.tsx` | Widened from the demo's fixed width, added `subtitle` and `meta` fields, tightened the corner radius. |

---

## Deploying

### GitHub Pages

A static export deploys automatically from `main` via
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). Set
**Settings → Pages → Source** to **GitHub Actions**.

The two Gemini routes need a server, so they don't run on Pages. Both games stay
fully playable — every puzzle, mission, level and leaderboard — but the AI
extras report themselves unavailable.

Build it locally the same way CI does:

```bash
BASE_PATH=/<repo-name> npm run build:pages
```

Two details in [`scripts/build-pages.mjs`](scripts/build-pages.mjs) worth
knowing. It writes `out/.nojekyll`, without which Pages runs the output through
Jekyll and drops every underscore-prefixed directory, including `_next`. And it
moves `src/app/api` aside for the duration of the build, since `output: 'export'`
can't compile route handlers, restoring it afterwards even if the build fails.

Because a repo site is served from a subdirectory, absolute asset paths need a
prefix. `<Link>` gets this from Next automatically; `<iframe src>` and
`<img src>` go through `withBase()` in [`src/lib/paths.ts`](src/lib/paths.ts).
For a custom domain or a `<user>.github.io` repo, set `BASE_PATH: ""` in the
workflow.

### Vercel

```bash
npx vercel
```

Everything runs, including the AI routes. Add `GOOGLE_AI_API_KEY` under
Settings → Environment Variables. Any other Node host works the same way with
`npm run build` and `npm start`.

---

## Project structure

```
src/
├── app/
│   ├── globals.css              # design tokens, book styles
│   ├── layout.tsx               # smooth scroll; chrome is per-page
│   ├── page.tsx                 # homepage section order
│   ├── api/vex/route.ts
│   ├── api/gemini/route.ts
│   └── writing/[slug]/page.tsx
├── content/
│   ├── site.ts                  # all short copy
│   └── writing/                 # long-form pieces
├── components/
│   ├── site/                    # the page itself
│   └── watermelon-ui/           # registry components
├── lib/                         # gsap · gemini · paths · utils
└── public/
    ├── media/
    └── projects/                # cyber-breach · chronoloop
```

Reordering the page means reordering `page.tsx`. Adding a section means adding
it there, adding an entry to `site.nav`, giving the `<section>` a matching `id`,
and adding an icon to the map in `dock.tsx`.
