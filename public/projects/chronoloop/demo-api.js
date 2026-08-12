/* ══════════════════════════════════════════════════════════════════════
   CHRONOLOOP — demo backend

   The original build talked to an Express server (bcrypt, JWT, a
   users.json on disk). That server isn't in this repo, for two reasons:
   its data file held real accounts with password hashes, and a portfolio
   shouldn't need a running backend to be playable.

   So this file re-implements the nine endpoints the game calls, in the
   browser, over localStorage. Same request and response shapes, so not a
   single line of the game's own logic changed. Register, log in, earn XP,
   level up, climb the board — all of it works, and it persists per
   browser instead of per server.

   Load this BEFORE the game's own scripts. It patches window.fetch and
   passes anything that isn't /api/* straight through.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const STORE = "cl_demo_state_v1";
  const TOKEN_PREFIX = "demo.";

  // Straight from the original server, so levelling behaves identically.
  const LEVELS = [
    { level: 1, xpNeeded: 0, title: "Time Cadet" },
    { level: 2, xpNeeded: 100, title: "Chronicle Scout" },
    { level: 3, xpNeeded: 250, title: "History Seeker" },
    { level: 4, xpNeeded: 450, title: "Era Navigator" },
    { level: 5, xpNeeded: 700, title: "Time Architect" },
    { level: 6, xpNeeded: 1000, title: "Epoch Master" },
    { level: 7, xpNeeded: 1400, title: "Temporal Sage" },
    { level: 8, xpNeeded: 1900, title: "Chrono Sentinel" },
    { level: 9, xpNeeded: 2500, title: "Timeline Warden" },
    { level: 10, xpNeeded: 3200, title: "Paradox Breaker" },
    { level: 11, xpNeeded: 4000, title: "Eternity Scholar" },
    { level: 12, xpNeeded: 5000, title: "Chrono Commander" },
    { level: 13, xpNeeded: 6200, title: "Temporal Overlord" },
    { level: 14, xpNeeded: 7600, title: "Infinity Keeper" },
    { level: 15, xpNeeded: 9999, title: "Master of Time" },
  ];

  const levelFor = (xp) =>
    LEVELS.reduce((acc, t) => (xp >= t.xpNeeded ? t : acc), LEVELS[0]);

  // A board with only you on it looks broken, so it starts populated.
  const SEED_BOARD = [
    { id: "npc_1", displayName: "Ilinca V.", xp: 4820, arenaWins: 31 },
    { id: "npc_2", displayName: "Matei F.", xp: 3960, arenaWins: 24 },
    { id: "npc_3", displayName: "Andrei P.", xp: 3175, arenaWins: 19 },
    { id: "npc_4", displayName: "Sofia D.", xp: 2540, arenaWins: 17 },
    { id: "npc_5", displayName: "Tudor M.", xp: 1880, arenaWins: 12 },
    { id: "npc_6", displayName: "Elena R.", xp: 1420, arenaWins: 9 },
    { id: "npc_7", displayName: "Vlad C.", xp: 990, arenaWins: 6 },
    { id: "npc_8", displayName: "Ana B.", xp: 640, arenaWins: 4 },
    { id: "npc_9", displayName: "Radu N.", xp: 310, arenaWins: 2 },
  ].map((u) => {
    const lvl = levelFor(u.xp);
    return { ...u, level: lvl.level, title: lvl.title, schoolCode: null, createdAt: "2026-01-15T09:00:00.000Z" };
  });

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || { users: [] };
    } catch {
      return { users: [] };
    }
  };
  const write = (s) => localStorage.setItem(STORE, JSON.stringify(s));

  const publicUser = (u) => ({
    id: u.id,
    displayName: u.displayName,
    email: u.email,
    xp: u.xp,
    level: u.level,
    title: u.title,
    streak: u.streak || 0,
    missionHistory: u.missionHistory || [],
    onboarding: u.onboarding || null,
    createdAt: u.createdAt,
    completedMissions: u.completedMissions || [],
    arenaWins: u.arenaWins || 0,
  });

  const json = (body, status) =>
    new Response(JSON.stringify(body), {
      status: status || 200,
      headers: { "Content-Type": "application/json" },
    });

  const fail = (msg, status) => json({ error: msg }, status || 400);

  /** The real server signs a JWT. Nothing here is a security boundary — the
   *  data lives in this browser and belongs to whoever is holding the mouse —
   *  so the "token" is just the user id in a recognisable wrapper. */
  const tokenFor = (u) => TOKEN_PREFIX + u.id;

  function currentUser(headers) {
    const auth = headers && (headers.get ? headers.get("authorization") : headers.authorization);
    if (!auth || !auth.startsWith("Bearer ")) return null;
    const id = auth.slice(7).replace(TOKEN_PREFIX, "");
    return read().users.find((u) => u.id === id) || null;
  }

  function touchStreak(u) {
    const today = new Date().toISOString().split("T")[0];
    if (u.lastActiveDate === today) return;
    if (u.lastActiveDate) {
      const days = Math.floor(
        (new Date(today) - new Date(u.lastActiveDate)) / 86400000
      );
      u.streak = days === 1 ? (u.streak || 0) + 1 : 1;
    } else {
      u.streak = 1;
    }
    u.lastActiveDate = today;
  }

  const save = (u) => {
    const s = read();
    const i = s.users.findIndex((x) => x.id === u.id);
    if (i === -1) s.users.push(u);
    else s.users[i] = u;
    write(s);
  };

  const ROUTES = {
    "POST /api/register": (body) => {
      const { email, password, displayName } = body;
      if (!email || !/.+@.+\..+/.test(email)) return fail("Valid email required");
      if (!password || password.length < 6)
        return fail("Password must be at least 6 characters");
      if (!displayName || !displayName.trim())
        return fail("Display name is required");

      const s = read();
      if (s.users.find((u) => u.email === email))
        return fail("An account with this email already exists", 409);

      const lvl = levelFor(0);
      const user = {
        id: "user_" + Math.abs(hash(email)).toString(36),
        displayName: displayName.trim(),
        email,
        // No hashing: there is no server to protect this from, and pretending
        // otherwise would be security theatre. Demo data, this browser only.
        password,
        xp: 0,
        level: lvl.level,
        title: lvl.title,
        createdAt: new Date().toISOString(),
        streak: 0,
        lastActiveDate: null,
        missionHistory: [],
        onboarding: null,
        completedMissions: [],
        arenaHistory: [],
        arenaWins: 0,
      };
      s.users.push(user);
      write(s);
      return json({ token: tokenFor(user), user: publicUser(user) });
    },

    "POST /api/login": (body) => {
      const { email, password } = body;
      const user = read().users.find((u) => u.email === email);
      if (!user || user.password !== password)
        return fail("Invalid email or password", 401);
      touchStreak(user);
      save(user);
      return json({ token: tokenFor(user), user: publicUser(user) });
    },

    "GET /api/me": (body, headers) => {
      const u = currentUser(headers);
      if (!u) return fail("Invalid or expired token", 401);
      return json(publicUser(u));
    },

    "POST /api/xp": (body, headers) => {
      const u = currentUser(headers);
      if (!u) return fail("Invalid or expired token", 401);
      if (typeof body.amount !== "number")
        return fail("amount must be a number");
      u.xp += body.amount;
      const lvl = levelFor(u.xp);
      u.level = lvl.level;
      u.title = lvl.title;
      touchStreak(u);
      save(u);
      return json({ xp: u.xp, level: u.level, title: u.title, streak: u.streak || 0 });
    },

    "POST /api/mission-log": (body, headers) => {
      const u = currentUser(headers);
      if (!u) return fail("Invalid or expired token", 401);
      if (!body.missionId) return fail("missionId is required");
      u.missionHistory = (u.missionHistory || []).concat({
        missionId: body.missionId,
        missionName: body.missionName || body.missionId,
        passed: !!body.passed,
        score: body.score || 0,
        xpEarned: body.xpEarned || 0,
        timestamp: new Date().toISOString(),
      });
      if (u.missionHistory.length > 10) u.missionHistory = u.missionHistory.slice(-10);
      save(u);
      return json({ missionHistory: u.missionHistory });
    },

    "POST /api/onboarding": (body, headers) => {
      const u = currentUser(headers);
      if (!u) return fail("Invalid or expired token", 401);
      if (!body.onboarding || typeof body.onboarding !== "object")
        return fail("onboarding data required");
      u.onboarding = body.onboarding;
      save(u);
      return json({ onboarding: u.onboarding });
    },

    "GET /api/leaderboard": () => {
      const mine = read().users.map((u) => ({
        id: u.id,
        displayName: u.displayName,
        xp: u.xp || 0,
        level: u.level || 1,
        title: u.title || "Time Cadet",
        arenaWins: u.arenaWins || 0,
        schoolCode: u.schoolCode || null,
        createdAt: u.createdAt,
      }));
      return json(SEED_BOARD.concat(mine).sort((a, b) => b.xp - a.xp));
    },

    "POST /api/arena-log": (body, headers) => {
      const u = currentUser(headers);
      if (!u) return fail("Invalid or expired token", 401);
      u.arenaHistory = (u.arenaHistory || []).concat({
        topicId: body.topicId,
        won: !!body.won,
        score: body.score || 0,
        xpEarned: body.xpEarned || 0,
        timestamp: new Date().toISOString(),
      });
      if (body.won) u.arenaWins = (u.arenaWins || 0) + 1;
      if (u.arenaHistory.length > 20) u.arenaHistory = u.arenaHistory.slice(-20);
      save(u);
      return json({ arenaHistory: u.arenaHistory, arenaWins: u.arenaWins || 0 });
    },

    "POST /api/completed-missions": (body, headers) => {
      const u = currentUser(headers);
      if (!u) return fail("Invalid or expired token", 401);
      if (!Array.isArray(body.completedMissions))
        return fail("completedMissions must be an array");
      u.completedMissions = body.completedMissions;
      save(u);
      return json({ completedMissions: u.completedMissions });
    },
  };

  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i) | 0;
    return h;
  }

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : input && input.url;
    if (!url) return nativeFetch(input, init);

    let path;
    try {
      path = new URL(url, window.location.href).pathname;
    } catch {
      return nativeFetch(input, init);
    }

    // /api/gemini is a real server route, so it goes to the network — but on a
    // static host (GitHub Pages) there's no server to answer it. Rather than
    // let the game show a generic failure, answer in Gemini's own shape.
    if (path.endsWith("/api/gemini")) {
      try {
        const res = await nativeFetch(input, init);
        const type = res.headers.get("content-type") || "";
        // Don't key on a status code: a static host answers a POST to a
        // path it doesn't have with 404, 405 or 501 depending on the host.
        // "Did we get JSON back?" is the question that actually matters.
        if (res.ok && type.includes("json")) return res;
      } catch {
        /* offline or blocked — fall through to the canned reply */
      }
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: "The AI tutor needs a server, and this copy is running as static files — so I'm not available here. Every mission, the arena scoring and the leaderboard all still work.",
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Everything else that isn't Chronoloop's own game API passes through.
    if (!path.startsWith("/api/")) return nativeFetch(input, init);

    const method = ((init && init.method) || "GET").toUpperCase();
    const handler = ROUTES[method + " " + path];
    if (!handler) return nativeFetch(input, init);

    let body = {};
    if (init && init.body) {
      try {
        body = JSON.parse(init.body);
      } catch {
        return fail("Malformed request body");
      }
    }

    const headers = new Headers((init && init.headers) || {});
    // Small delay so loading states in the UI actually get to render.
    await new Promise((r) => setTimeout(r, 90));
    return handler(body, headers);
  };

  console.info(
    "[chronoloop] demo backend active — accounts and progress are stored in this browser."
  );
})();
