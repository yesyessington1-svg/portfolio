import { NextResponse } from "next/server";

/**
 * Shared plumbing for the two Gemini proxies (/api/vex, /api/gemini).
 *
 * Both games originally called Google straight from the browser with the key
 * pasted into an HTML file, which meant anyone could view-source and spend the
 * quota. These routes hold the key server-side instead.
 */

export const MODEL = "gemini-2.5-flash";
export const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** Gemini's response shape, so game code can parse errors the same way. */
export const asGeminiReply = (text: string) => ({
  candidates: [{ content: { parts: [{ text }] } }],
});

export const geminiError = (text: string, status = 200) =>
  NextResponse.json(asGeminiReply(text), { status });

/* ── Rate limiting ────────────────────────────────────────────────────
   In-memory, so it resets when the server does. That's fine: it exists to
   stop someone hammering the endpoint and draining the quota, not to be an
   audit log. For anything serious this wants Redis.
   ─────────────────────────────────────────────────────────────────── */
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

export function rateLimited(ip: string, maxPerMinute: number) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > maxPerMinute;
}

export const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

/**
 * These endpoints exist for the embedded games, not for general use. Browsers
 * send Sec-Fetch-Site on same-origin requests, so this turns away drive-by
 * calls from other sites and scripts without breaking the iframes.
 */
export function isSameOrigin(req: Request) {
  const site = req.headers.get("sec-fetch-site");
  if (!site) return true; // header absent (older clients, server-side) — allow
  return site === "same-origin" || site === "none";
}

export async function callGemini(body: unknown, key: string) {
  const upstream = await fetch(`${ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25_000),
  });

  if (!upstream.ok) {
    // Never forward Google's error body — it can echo request details back.
    console.error("[gemini] upstream responded", upstream.status);
    return null;
  }
  return upstream.json();
}
