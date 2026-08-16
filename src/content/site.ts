/* ────────────────────────────────────────────────────────────────
   Every word on the site lives here. Edit this file, nothing else.
   Long-form writing is the exception: it lives in src/content/writing/.

   Nothing here is a placeholder. A handful of sentences are my wording
   for things only you can confirm — the Listo stack, the olympiad
   problem set, the founding month. They read as finished because you
   asked them to; check them and correct anything I got wrong. The list
   is in the README under "Wording to check".
   ──────────────────────────────────────────────────────────────── */

export type WorkItem = {
  title: string;
  year: string;
  kind: string;
  blurb: string;
  stack: string[];
  /** Path under public/ — makes the project playable inside the site. */
  embed?: string;
  /** External link. Ignored when `embed` is set. */
  href?: string;
  /** Images under public/ — opens as a gallery instead of an iframe. */
  gallery?: string[];
  /** Screenshot for the featured block, framed in Watermelon's Browser. */
  shot?: string;
  /** Renders the featured treatment at the top of the section. */
  featured?: boolean;
  /** Small note under the metadata, e.g. how the demo is scoped. */
  note?: string;
};

export const site = {
  /* ── Identity ─────────────────────────────────────────────── */
  name: "George Lupu",
  initials: "GL",
  role: "CTO, Listo Solutions",
  location: "Bucharest, Romania",

  headline: ["I build sites,", "break ciphers,", "and stay up", "for CTFs."],

  subhead:
    "CTO at Listo Solutions, and a student at Tudor Vianu in Bucharest. Security is the part I'm actually good at; the rest is what I do when I need to get away from it.",

  /* ── About ────────────────────────────────────────────────── */
  about: {
    lead: "I'm self-taught, which mostly means I break things until they make sense.",
    body: [
      "I'm CTO at Listo Solutions. It's a booking and management platform for salon owners, with a conversational AI that picks up the phone when nobody in the salon can. The company is young, so the title mainly means I own the technical side and pick up whatever nobody else is covering yet.",
      "The rest of my time goes to security. I play CTFs with vianu_hack, took silver at the national cybersecurity olympiad this year, and I'll lose a whole evening to a cipher that turns out to be pigpen. When I want off the terminal I model things in Blender, or build small hardware projects where I do both the circuit and the code, and which work maybe half the time.",
      "I also write. Mostly philosophy, and one book so far.",
    ],
    facts: [
      { k: "Based in", v: "Bucharest" },
      { k: "Role", v: "CTO, Listo Solutions" },
      { k: "Olympiad", v: "Silver, national" },
      { k: "CTF team", v: "vianu_hack" },
    ],
  },

  /* ── Stack ticker ─────────────────────────────────────────── */
  stack: [
    "JavaScript",
    "TypeScript",
    "Node",
    "Express",
    "Python",
    "Linux",
    "Blender",
    "Git",
    "Burp",
    "CyberChef",
  ],

  /* ── Work ─────────────────────────────────────────────────────
     `embed` makes a project playable in an overlay, served from
     public/. `gallery` opens images instead. `featured` gets the big
     treatment at the top.
     ─────────────────────────────────────────────────────────── */
  work: [
    {
      title: "Listo Solutions",
      year: "2026",
      kind: "Product",
      blurb:
        "Booking, staff scheduling, clients, inventory and reporting for salon owners, plus a conversational AI that answers the phone and books people in when the salon can't pick up. Romanian-language product. I run engineering.",
      stack: ["TypeScript", "React", "Node", "Postgres", "Voice AI"],
      shot: "/media/listo-dashboard.jpg",
      featured: true,
      href: "https://listo-solutions.ro",
    },
    {
      title: "CYBER_BREACH",
      year: "2025",
      kind: "Game",
      blurb:
        "A browser escape room. It drops you into a fake operating system — terminal, dark web browser, notepad, inventory — and you work out how to get out of it. The ciphers are real ciphers; one of them is pigpen. No engine, no framework, no build step.",
      stack: ["JavaScript", "HTML", "CSS"],
      embed: "/projects/cyber-breach/intro.html",
      note: "Full game, tutorial included",
    },
    {
      title: "Chronoloop",
      year: "2026",
      kind: "Game",
      blurb:
        "A history platform built as a game: timed missions on a world map, a debate arena with an AI opponent, XP, fifteen levels and a leaderboard. Written for a Holocaust-education contest my history teacher entered me into, then kept going past the brief.",
      stack: ["JavaScript", "Node", "SVG maps", "Gemini"],
      embed: "/projects/chronoloop/chronoloop_spline.html",
      note: "Progress saves in your browser",
    },
    {
      title: "3D work",
      year: "2025 — 2026",
      kind: "Renders",
      blurb:
        "Cycles renders, done for the practice rather than for anyone. Interiors and hard-surface lighting, plus a rigged creature with a motion-blurred run cycle. This is what I do instead of watching something.",
      stack: ["Blender", "Cycles"],
      gallery: ["/media/3d-creature.jpg", "/media/3d-boardroom.jpg"],
    },
  ] as WorkItem[],

  /* ── Background ───────────────────────────────────────────── */
  background: [
    {
      org: "Listo Solutions",
      title: "CTO",
      period: "2026 — Present",
      detail:
        "A salon booking and management platform with a voice AI that answers calls. I own the technical side: the app, the data model, the infrastructure, and the decisions nobody has made yet. Most weeks that means shipping a feature and rewriting something I shipped a fortnight ago.",
    },
    {
      org: "National Cybersecurity Olympiad",
      title: "Silver medal",
      period: "2026",
      detail:
        "The national stage of the Olimpiada de Securitate Cibernetică, run by DNSC. Written like a CTF rather than an exam: web exploitation, cryptography, forensics and a reversing task, solved against the clock. The crypto and forensics sets are the ones I'm quickest on; reversing is what I lose time to.",
    },
    {
      org: "vianu_hack",
      title: "CTF player",
      period: "2025 — Present",
      detail:
        "The cybersecurity club at Tudor Vianu. The team finished 5th in Romania and 197th worldwide on CTFtime in 2025, with a 10th at Null CTF, 14th at the DefCamp quals, and 63rd at the DEF CON CTF qualifier in 2026. I take crypto and forensics.",
    },
    {
      org: "Tudor Vianu National High School of Computer Science",
      title: "Student",
      period: "Bucharest",
      detail:
        "Romania's computer-science high school. Where the CTF club is, and where most of this started.",
    },
  ],

  /* ── Contact ──────────────────────────────────────────────── */
  contact: {
    email: "georgelupu.dev@gmail.com",
    pitch: "Email is the fastest way to get me. I'm bad at LinkedIn.",
    socials: [
      {
        label: "GitHub",
        handle: "yesyessington1-svg",
        href: "https://github.com/yesyessington1-svg",
      },
      { label: "X", handle: "@raphfundsvn", href: "https://x.com/raphfundsvn" },
      {
        label: "LinkedIn",
        handle: "george-lupu",
        href: "https://www.linkedin.com/in/george-lupu-565819391/",
      },
      {
        label: "CTFtime",
        handle: "vianu_hack",
        href: "https://ctftime.org/team/379530/",
      },
    ],
  },

  /* ── Nav (order defines the page) ─────────────────────────── */
  nav: [
    { id: "top", label: "Top" },
    { id: "about", label: "About" },
    { id: "work", label: "Work" },
    { id: "background", label: "Background" },
    { id: "writing", label: "Writing" },
    { id: "contact", label: "Contact" },
  ],
};

export type Site = typeof site;
