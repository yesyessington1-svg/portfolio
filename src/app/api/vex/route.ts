import { NextResponse } from "next/server";
import {
  callGemini,
  clientIp,
  geminiError,
  isSameOrigin,
  rateLimited,
} from "@/lib/gemini";

/**
 * Vex, the sarcastic hacker contact in CYBER_BREACH.
 *
 * story.html and tutorial.html used to call Google directly with the key in a
 * string literal. Now they post { text } here; the prompt and the key are both
 * server-side, so players can't read the system prompt or spend the quota.
 */

const MAX_INPUT = 600;
const MAX_PER_MINUTE = 12;

const prompt = (text: string) =>
  `You are the AI model used by Vex, a sarcastic hacker friend. Your role is to answer questions Vex forwards to you, acting as his helpful, snarky AI assistant. Keep responses short (1-3 sentences), casual, funny, and use slang. **CRITICAL LIMITATION: You cannot decode complex ciphers like a spoon cipher.** You can only handle simple requests like defining 'reġnboga' or decoding Base64. Also, the person you're talking to IS NOT Vex. It is actually the player, which is vex's hacker friend. The player asked: "${text}"`;

export async function POST(req: Request) {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    return geminiError(
      "My AI's offline — whoever's running this build hasn't set GOOGLE_AI_API_KEY. The puzzles all still work without me."
    );
  }

  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  if (rateLimited(clientIp(req), MAX_PER_MINUTE)) {
    return geminiError("Slow down mate, you're melting my uplink.", 429);
  }

  let text: unknown;
  try {
    ({ text } = await req.json());
  } catch {
    return geminiError("That came through garbled.", 400);
  }

  if (typeof text !== "string" || !text.trim()) {
    return geminiError("You didn't actually say anything.", 400);
  }

  try {
    const data = await callGemini(
      {
        contents: [
          { role: "user", parts: [{ text: prompt(text.slice(0, MAX_INPUT)) }] },
        ],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.9 },
      },
      key
    );
    if (!data) {
      return geminiError("My AI's throwing a fit. Try again in a sec?", 502);
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[vex] request failed", err);
    return geminiError(
      "Connection's janky right now. Might be a firewall thing.",
      502
    );
  }
}
