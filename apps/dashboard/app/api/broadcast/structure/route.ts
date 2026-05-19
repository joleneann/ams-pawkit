import { NextRequest, NextResponse } from "next/server";
import { structureBroadcast } from "@/lib/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/broadcast/structure
 *
 * Two request shapes:
 *
 *   1. `{ transcript: string }` — real structuring request. Response:
 *        - 200 { ok: true, draft: { title, body, keyPoints, warningSigns, whenToCallUs } }
 *        - 200 { ok: false, error: string, rawTranscript: string }
 *          (Groq failed, returned malformed JSON, or explicitly refused. Per
 *          the locked fallback policy in docs/decisions-log.md, the client
 *          drops rawTranscript into the composer's Body field.)
 *        - 400 if transcript is missing/empty
 *
 *   2. `{ warmup: true }` — no-op that returns 200 immediately. Used by
 *      /broadcasts/new on page mount to compile the route handler + load the
 *      Groq SDK module so the vet's first real request hits the fast path
 *      (~1.5s) instead of the cold path (~9s on first Next dev compile).
 *      Does NOT call Groq — saves ₹0.01 per page visit.
 *
 * Server-only — GROQ_API_KEY never reaches the client.
 *
 * Request-level logging is emitted to the dev server stdout under the
 * `[bcast]` tag so future stalls / failures can be diagnosed from the
 * terminal alone instead of having to inspect browser state.
 */
export async function POST(req: NextRequest) {
  const rid = `bcast-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const body = (await req.json().catch(() => null)) as
      | { transcript?: unknown; warmup?: unknown }
      | null;

    if (body && body.warmup === true) {
      console.log(`[${rid}] warmup ping received`);
      return NextResponse.json({ warmedUp: true });
    }

    if (!body || typeof body.transcript !== "string") {
      console.warn(`[${rid}] reject: transcript missing or non-string`);
      return NextResponse.json(
        { error: "transcript (string) is required in the request body" },
        { status: 400 }
      );
    }
    const transcript = body.transcript.trim();
    if (!transcript) {
      console.warn(`[${rid}] reject: transcript empty after trim`);
      return NextResponse.json(
        { error: "transcript must not be empty" },
        { status: 400 }
      );
    }

    const startedAt = Date.now();
    console.log(
      `[${rid}] structuring ${transcript.length} chars / ~${Math.round(transcript.length / 5)} tokens`
    );
    const result = await structureBroadcast(transcript);
    const ms = Date.now() - startedAt;
    if (result.ok) {
      console.log(
        `[${rid}] ok (${ms}ms) title=${JSON.stringify(result.draft.title.slice(0, 60))}`
      );
    } else {
      console.warn(`[${rid}] not-ok (${ms}ms) reason="${result.error}"`);
    }
    // Always 200 — both success and graceful-failure are valid downstream
    // responses; the client routes them via the `ok` discriminator.
    return NextResponse.json(result);
  } catch (e: any) {
    console.error(`[${rid}] threw: ${e?.message ?? e}`);
    return NextResponse.json(
      {
        ok: false,
        error: e?.message ?? "structure route failed",
        rawTranscript: "",
      },
      { status: 500 }
    );
  }
}
