# George Lupu — personal site

Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · **Watermelon UI** components · **GSAP** + Lenis.

Dark near-black, one accent, self-hosted type. Both games playable in-page. The book reads as a book.

---

## Read this first: two API keys need revoking

The zips you sent had live Google Gemini keys pasted into client-side HTML. Both are stripped from this repo, but stripping them here does nothing about the ones already out there. **Delete both in Google AI Studio and issue new ones.** Don't restrict them, delete them — they've been in files that left your machine.

| Key (redacted) | Was in |
| --- | --- |
| `AIza…UWKk` | `story.html`, `tutorial.html` (CYBER_BREACH) |
| `AIza…EEEQ` | `chronoloop_hub.html`, `chronoloop_arena.html` |

Also from the Chronoloop zip: `server/.env` held a `JWT_SECRET` (a guessable one, with the year and the word "demo" in it), and `server/data/users.json` held real accounts with bcrypt hashes. Neither is in this repo. Rotate the secret and get both into `.gitignore` in your own copy.

Everything the games needed those keys for now goes through server routes that read `GOOGLE_AI_API_KEY` from the environment. Put the new key in `.env.local` and the AI features work; leave it unset and the games still run, with the AI parts explaining themselves politely.

---

## Run it

```bash
npm install
cp .env.example .env.local     # paste the new Gemini key here
npm run dev                    # http://localhost:3000
npm run build && npm start
```

Node 20+. No database. See **Deploying** below for GitHub Pages and Vercel.

---

## Deploying

### GitHub Pages

Pages only serves files. There's no Node process, so the two Gemini proxy
routes can't run there.

**What that costs you:** both games stay fully playable — every puzzle, every
mission, XP, levels, the leaderboard, all of it. What stops working is the AI
extras: Vex's chat in CYBER_BREACH and Chronoloop's tutor and debate opponent.
They say so in character rather than erroring. Everything else is identical.

If you'd rather keep those, use Vercel (below). Otherwise:

**1. Push the repo.** Any name; the workflow reads it.

**2. Settings → Pages → Build and deployment → Source: GitHub Actions.**
Not "Deploy from a branch" — that skips the build entirely and serves raw
source, which won't work.

**3. Push to `main`.** `.github/workflows/deploy-pages.yml` builds and deploys.
Your site lands at `https://<user>.github.io/<repo>/`.

That's it. The workflow passes `BASE_PATH=/<repo>` automatically, because a repo
site is served from a subdirectory and every absolute path needs that prefix.

**Test it locally before pushing:**

```bash
BASE_PATH=/your-repo-name npm run build:pages
npm run preview:pages          # http://localhost:4000
```

Note that `preview:pages` serves at the root, so links will 404 unless you set
`BASE_PATH=` empty for the preview. To test the real subpath arrangement:

```bash
BASE_PATH=/your-repo-name npm run build:pages
mkdir -p /tmp/pages/your-repo-name && cp -r out/. /tmp/pages/your-repo-name/
cd /tmp/pages && python3 -m http.server 4100
# then open http://localhost:4100/your-repo-name/
```

**Custom domain, or a `<user>.github.io` repo:** the site is at the root, so the
prefix has to go. In the workflow, change the env block to `BASE_PATH: ""`.

#### How the static build works

`npm run build:pages` runs `scripts/build-pages.mjs`, which moves `src/app/api`
aside, builds with `output: 'export'`, writes `out/.nojekyll`, and puts the API
routes back — including if the build fails. Two details worth knowing:

- **`.nojekyll` is not optional.** Without it Pages runs the output through
  Jekyll, which ignores every directory starting with an underscore, including
  `_next`. You get unstyled HTML and no JavaScript.
- **basePath doesn't reach plain strings.** Next rewrites `<Link href>` for you,
  but not an `<iframe src>` or `<img src>`. Those go through `withBase()` in
  [`src/lib/paths.ts`](src/lib/paths.ts). If you add a project with an `embed`
  or `gallery` path, it's already handled; if you hardcode a path somewhere new,
  wrap it.

### Vercel

Everything works, including the AI. From the project directory:

```bash
npx vercel
```

Then add `GOOGLE_AI_API_KEY` under Settings → Environment Variables and redeploy.
Netlify and any other Node host are the same story: `npm run build`, `npm start`.

---

## Edit your content

**All the short copy is in [`src/content/site.ts`](src/content/site.ts).** Long-form writing lives in [`src/content/writing/`](src/content/writing/).

There are no `TODO` markers left — you asked for finished, so it reads finished.

### Wording to check

These sentences are mine, describing things only you can confirm. They're plausible, not verified. Read them once and fix anything wrong:

| Where | What I wrote |
| --- | --- |
| `work[0].stack` | Listo as TypeScript / React / Node / Postgres / Voice AI. Inferred from the screenshot, not from your code. |
| `background[1].detail` | The olympiad problem set as "web exploitation, cryptography, forensics and a reversing task, solved against the clock", and that reversing is where you lose time. |
| `background[0].detail` | "Most weeks that means shipping a feature and rewriting something I shipped a fortnight ago." |
| `background[0].period` | `2026 — Present`, no month. |
| `about.body[0]` | "The company is young" rather than a specific age, so it doesn't go stale. |
| `work[2].blurb` | Chronoloop "kept going past the brief". |

Everything else is either from you directly or verified: the CTFtime placements, the olympiad name and organiser, the school's English name.

`work[0].href` is empty, so the Listo block says "Private beta" instead of showing a button. Fill it in and the button appears.

---

## The two games

Both are fully playable inside the site. Click a row in Work, the overlay opens, and they run in an iframe on the same origin.

### CYBER_BREACH — `/projects/cyber-breach/`

The whole thing: `intro.html` → `cutscene.html` → `tutorial.html` → `story.html`, plus the audio, the images and the 168KB stylesheet. The mission button goes to the tutorial the way it always did.

The only change to the game's own code is the Vex chat. It used to do this:

```js
const GEMINI_API_KEY = 'AIza...'; // REMEMBER TO FUCKING REMOVE IT WHEN DISTRIBUTING RAPH
```

Now it posts `{ text }` to `/api/vex` and the route adds the prompt and the key. Which means the system prompt is server-side too, so players can't read it or talk around it.

### Chronoloop — `/projects/chronoloop/`

All five pages, entry at `chronoloop_spline.html`, plus the 1.3MB world map.

The original needed the Express server in `server/` — bcrypt, JWT, a `users.json` on disk. That server is not in this repo, because its data file held real accounts and because a portfolio shouldn't need a running backend to be clickable.

Instead, [`public/projects/chronoloop/demo-api.js`](public/projects/chronoloop/demo-api.js) re-implements all nine endpoints in the browser over `localStorage`:

```
POST /api/register          POST /api/xp             GET  /api/leaderboard
POST /api/login            POST /api/mission-log     POST /api/arena-log
GET  /api/me               POST /api/onboarding      POST /api/completed-missions
```

Same request and response shapes, same fifteen-level XP table copied out of `server/index.js`, so **not one line of the game's own logic changed**. Register, log in, run missions, earn XP, level up, climb the board. Progress persists per browser instead of per server. The leaderboard starts with nine seeded players so it isn't a list of one.

It works by patching `window.fetch` and passing anything that isn't Chronoloop's own `/api/*` straight through — `/api/gemini` and `worldHigh.svg` go to the network as normal. The script loads first in each page's `<head>`.

It stores the password in plain text in `localStorage`, deliberately. There's no server to protect it from and the data belongs to whoever is holding the mouse; hashing it would be theatre. **If you ever put the real server back, that's a different situation and bcrypt belongs there.**

### The two AI routes

| Route | For | Shape |
| --- | --- | --- |
| [`/api/vex`](src/app/api/vex/route.ts) | Vex in CYBER_BREACH | Takes `{ text }`. Prompt is server-side. |
| [`/api/gemini`](src/app/api/gemini/route.ts) | Chronoloop's AI tutor and debate arena | Forwards `{ contents, generationConfig }`, because those prompts are built in 800KB of HTML and moving them server-side would mean surgery. |

Shared plumbing is in [`src/lib/gemini.ts`](src/lib/gemini.ts). Both routes: same-origin only via `Sec-Fetch-Site`, per-IP rate limit (12/min for Vex, 20/min for Chronoloop), prompt length capped, output tokens clamped, Google's error bodies swallowed rather than forwarded.

`/api/gemini` is the weaker of the two because it forwards a body. If you'd rather not have a forwarding proxy at all, move Chronoloop's prompts into the route the way `/api/vex` does and accept `{ mode, text }`. The comment at the top of the file says so too.

---

## The book reader

`/writing/<slug>` isn't a scrolling article. It's a book.

The text is one CSS multi-column flow with a fixed height, so **the browser**
paginates it. The frame is a window one or two columns wide. Real pagination: no
scrollbar, no half-cut lines, and the page count recalculates when you resize.

**Turning a page** flips a paper leaf. A sheet rotates on the Y axis from the
spine, casting a shadow that swells as it stands up and flattens as it lands,
while the flow jumps underneath where you can't see it. Sliding the text
sideways — the first version — read as a carousel, which is not what a book does.

- Two-page spread above 1024px, single page below
- Arrow keys, space, PageUp/PageDown, click either edge, or swipe
- `C` or ⌘K opens the contents; type to filter, arrows to move, enter to jump
- Folios sit on the frame, not in the flow. No running head — it duplicated the
  chapter title sitting directly beneath it.
- Drop cap on the first paragraph of each chapter, indented paragraphs after the
  first, justified with hyphenation
- Your `◈` dividers survive as centred ornaments
- Epigraphs get a rule; a heading straight after a quote becomes an attribution
  if it reads like a name — that's how "Pierre-Simon Laplace" ends up small and
  mono while "Feeling" stays a heading (`isAttribution()` in `book-reader.tsx`)

The Cartography of Almost comes out around 73 spread-pages at 1512px wide;
Chapter VIII around 21. Both change with the window, as they should.

**Type:** EB Garamond for the page, Geist Mono for the furniture. Paper is
`--color-paper` `#f2ece1`, with a 1px crease and a 30px soft shadow at the spine.
The first version used two 42px gradients there and it read as a dark canyon
down the middle of the spread.

**To add a piece:** convert the .docx to `{t, v}` blocks (`h` heading, `p`
paragraph, `q` quote, `div` divider) with `python-docx`, drop the JSON in
`src/content/writing/`, add an entry to `pieces` in `index.ts`. Empty array and
the whole Writing section disappears from the page and the nav.

---

## Design system

Tokens live once, in `@theme` inside [`src/app/globals.css`](src/app/globals.css).

| Token | Value | Used for |
| --- | --- | --- |
| `--color-ink-950` | `#08080a` | page background |
| `--color-bone-50 → 700` | – | text, primary down to barely-there |
| `--color-flare` | `#de4536` | **the** accent |
| `--color-paper` | `#f2ece1` | the book |

The accent appears in maybe eight places: wordmark initials, eyebrow rule, section indices, a terminal full stop, the hover rule on work rows, the scroll progress line, the active dock icon, the project notes. Change `--color-flare` and nothing else if you want a different one.

**Typefaces**, self-hosted via Fontsource — no third-party requests, no layout shift:

- **Instrument Sans** — display and body. Deliberately not Inter.
- **Geist Mono** — indices, dates, labels.
- **EB Garamond** — the book, and only the book.

Utilities: `.display`, `.label`, `.shell`, `.rule`, and the `.book-*` set.

---

## Watermelon UI

From the [Watermelon UI](https://ui.watermelon.sh) registry, in `src/components/watermelon-ui/`. Copy-paste architecture, so they're yours to edit.

| Component | Where |
| --- | --- |
| `browser` | frames the Listo screenshot in the featured block |
| `shimmer-button` | "Play it", "Open Listo" |
| `marquee` | the tooling ticker |
| `card-split-accordion` | the Background section |
| `copy-confirm` | copy-email control |
| `command-search` | the book's contents palette |
| `tooltip-navbar` | the floating dock |
| `badge` · `button` · `card` · `input` · `separator` | primitives |
| `scroll-fade` · `status-indicator` | installed, currently unused |

```bash
npx shadcn@latest add "https://registry.watermelon.sh/<component>.json"
```

### Local modifications

Five registry files were edited rather than used as shipped. Each is commented in the source; re-running `shadcn add` overwrites them.

1. **`browser.tsx`** — generated tab ids with `Date.now()` and seeded its sample history from `Date.now()`, so the server and client rendered different values: a hydration mismatch (React error #418). Ids are index-based now and timestamps derive from a fixed epoch. Imports repointed from `@/components/ui/*`.
2. **`shimmer-button.tsx`** — hardcoded as a `<button>`, so nesting it in a clickable row or an anchor produced invalid HTML and another hydration error. Added an `as` prop.
3. **`tooltip-navbar.tsx`** — no click handling at all, so it couldn't work as navigation. Added `onClick` and `active`, repalettised.
4. **`card-split-accordion.tsx`** — widened from the demo's fixed `w-sm`, added `subtitle` and `meta`, radius 20px → 10px, repalettised.
5. **`copy-confirm.tsx`** — ships as a centred light-mode demo card. Shell and props are ours; the character-swap animation is theirs.
6. **`command-search.tsx`** — `section` was a literal union of the demo's three names, so it couldn't take "Chapters"; the panel always opened down-and-right, which runs off screen from a top-right trigger; and there was no way to open it from outside. Added `section: string`, `align`, `open`/`onOpenChange`, `label`/`placeholder`/`shortcut`, and bound ⌘K alongside the single-key shortcut.

---

## Motion

GSAP does the work; Lenis owns the scroll. One clock: `gsap.ticker` drives Lenis, Lenis's scroll event drives `ScrollTrigger.update`. Plugins register once in [`src/lib/gsap.ts`](src/lib/gsap.ts). GSAP 3.13+ ships every plugin free, so SplitText needs no licence.

- **`<SplitLines>`** — masked line reveal. Each line sits in an overflow-hidden box and slides up from under it, so type reads as uncovered rather than flown in.
- **`<Reveal>`** — small y-translate and fade, with optional `stagger`.

Plus: the hero timeline, section rules drawing left to right, work rows staggering in and dimming their siblings while a pointer-tracked chip follows via `gsap.quickTo`, the footer wordmark rising, and the book's page turns.

Everything respects `prefers-reduced-motion` — Lenis doesn't initialise, reveals no-op, page turns snap instead of sliding.

### Five gotchas already handled

- **Use `fromTo`, never `from`, with a ScrollTrigger.** A `from()` tween reads its end state from the element's *current* value. If a refresh lands after the from-state rendered, it re-reads the already-hidden value as the destination and the element animates hidden → hidden, invisible forever.
- **Hand `SplitText` the text element, not a wrapper.** Splitting a container holding a `<p>` restructures its children and shreds the nesting.
- **`useGSAP` needs the dependency.** The dock isn't in the DOM until an effect works out which sections exist, so its entrance animation must depend on that state or it never gets set up — and then it sits on top of the hero from the first frame.
- **Measure the book after `document.fonts.ready`.** Column counts depend on metrics; measuring before the serif loads gives the wrong page total. There's a `ResizeObserver` too.
- **Don't drive an event animation from `useGSAP`.** It reverts whatever its callback created when the dependencies change. The page turn originally lived in a `useGSAP` keyed on `page`, so changing the page killed the flip a frame after it started and the leaf snapped back to its CSS `opacity: 0`. The turn is now a plain callback, with a separate `useEffect` that re-anchors the flow on resize.

---

## Structure

```
src/
├── app/
│   ├── globals.css              # Tailwind v4 @theme — tokens + .book-*
│   ├── layout.tsx               # smooth scroll only; chrome is per-page
│   ├── page.tsx                 # the homepage
│   ├── api/vex/route.ts         # Gemini proxy — CYBER_BREACH
│   ├── api/gemini/route.ts      # Gemini proxy — Chronoloop
│   └── writing/[slug]/page.tsx  # the book
├── content/
│   ├── site.ts                  # ← ALL SHORT COPY
│   └── writing/                 # ← THE BOOK
├── components/
│   ├── site/
│   │   ├── book-reader.tsx      # paginated spread, contents, page turns
│   │   ├── project-viewer.tsx   # full-screen embed / gallery overlay
│   │   ├── featured-work.tsx    # the Listo block
│   │   ├── chrome.tsx · dock.tsx · smooth-scroll.tsx
│   │   ├── reveal.tsx · split-lines.tsx · section-heading.tsx
│   │   └── hero · about · stack-marquee · work
│   │     · background · writing · contact · footer
│   └── watermelon-ui/
├── lib/
│   ├── gsap.ts · gemini.ts · utils.ts
└── public/
    ├── media/                   # Listo screenshot, cropped renders
    └── projects/
        ├── cyber-breach/        # the full game
        └── chronoloop/          # all five pages + demo-api.js
```

Reordering the page is reordering `page.tsx`. Adding a section: add it there, add an entry to `site.nav`, give the `<section>` a matching `id`, add an icon to the map in `dock.tsx`.

---

## Still worth doing

- Revoke and reissue those two Gemini keys. Top of this file.
- Fill in `work[0].href` when Listo has a public URL.
- Read the "Wording to check" table.
- `src/app/opengraph-image.tsx` for link previews, once the copy settles.
