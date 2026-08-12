import { NextResponse } from "next/server";
import {
  asGeminiReply,
  callGemini,
  clientIp,
  geminiError,
  isSameOrigin,
  rateLimited,
} from "@/lib/gemini";

/**
 * Gemini proxy for Chronoloop's AI tutor and debate arena.
 *
 * The game builds its own prompts (they're long and content-specific, spread
 * across 800KB of HTML), so unlike /api/vex this route forwards the request
 * body rather than constructing it. That makes it a narrow proxy, so it's
 * fenced in: same-origin only, prompt size capped, output tokens clamped,
 * rate limited per IP. The key never leaves the server.
 *
 * If you'd rather not expose a forwarding proxy at all, move Chronoloop's
 * prompts in here the way /api/vex does and accept `{ mode, text }` instead.
 */

const MAX_PROMPT_CHARS = 8_000;
const MAX_OUTPUT_TOKENS = 2_048;
const MAX_PER_MINUTE = 20;

type Part = { text?: string };
type Content = { role?: string; parts?: Part[] };

export async function POST(req: Request) {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    return geminiError(
      "The AI features are switched off in this build — GOOGLE_AI_API_KEY isn't set. Everything else works."
    );
  }

  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  if (rateLimited(clientIp(req), MAX_PER_MINUTE)) {
    return geminiError("Too many requests in a row. Give it a minute.", 429);
  }

  let body: { contents?: Content[]; generationConfig?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed body" }, { status: 400 });
  }

  const contents = body.contents;
  if (!Array.isArray(contents) || contents.length === 0) {
    return NextResponse.json({ error: "contents required" }, { status: 400 });
  }

  const totalChars = contents.reduce(
    (n, c) => n + (c.parts ?? []).reduce((m, p) => m + (p.text?.length ?? 0), 0),
    0
  );
  if (totalChars === 0 || totalChars > MAX_PROMPT_CHARS) {
    return NextResponse.json({ error: "Prompt out of range" }, { status: 400 });
  }

  // Rebuild rather than pass through, so only the fields we expect get sent.
  const safeBody = {
    contents: contents.map((c) => ({
      role: c.role === "model" ? "model" : "user",
      parts: (c.parts ?? [])
        .filter((p) => typeof p.text === "string")
        .map((p) => ({ text: p.text as string })),
    })),
    generationConfig: {
      temperature: clamp(body.generationConfig?.temperature, 0, 1, 0.7),
      maxOutputTokens: clamp(
        body.generationConfig?.maxOutputTokens,
        1,
        MAX_OUTPUT_TOKENS,
        1024
      ),
    },
  };

  try {
    const data = await callGemini(safeBody, key);
    if (!data) return geminiError("The AI is unavailable right now.", 502);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[gemini] request failed", err);
    return NextResponse.json(
      asGeminiReply("Couldn't reach the AI. Try again in a moment."),
      { status: 502 }
    );
  }
}

function clamp(v: unknown, min: number, max: number, fallback: number) {
  return typeof v === "number" && Number.isFinite(v)
    ? Math.min(max, Math.max(min, v))
    : fallback;
}
