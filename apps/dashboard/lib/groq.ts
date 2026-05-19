import "server-only";
import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.warn("GROQ_API_KEY is not set; Groq features will return errors.");
}

const client = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

/**
 * Server-only Groq helpers for v0 broadcast voice-dump structuring.
 *
 * Model: llama-3.3-70b-versatile (locked 2026-05-18 per
 * docs/decisions-log.md "Broadcast voice-dump feature"). Picked over
 * Claude Haiku for: (1) 5x cheaper input/output tokens, (2) 10x faster
 * inference (better demo theater on the structuring step), (3) parity
 * with Claude on pure structured-extraction tasks.
 *
 * Vet edits before publish, so model errors are bounded — the vet is
 * the safety gate.
 */

const MODEL = "llama-3.3-70b-versatile";

/** The structured shape we want from a transcript. Mirrors the composer's
 *  ContentSet shape: title + (expanded) body + 2 fixed sections (Warning
 *  signs + When to call us). The summary-bullets section was removed
 *  2026-05-18 because it duplicated content from the body; the body is
 *  now the primary narrative carrier. The vet can add custom sections in
 *  the composer if needed. */
export interface StructuredBroadcast {
  title: string;
  body: string;
  warningSigns: string[];
  whenToCallUs: string;
}

/**
 * System prompt that drives Groq into the 5-section NHS-care-card shape.
 * Schema is enforced via prompt + runtime validation (not Groq's `json_schema`
 * mode, which Llama 3.3 70B does not currently support — only `json_object`).
 * That's fine: vet edits before publish, plus we validate shape in parser
 * below and fall back to raw-transcript-in-body if shape is wrong.
 */
const SYSTEM_PROMPT = `You turn a veterinarian's spoken dictation into a structured broadcast for pet parents.

The vet just spoke freely about a topic for their clinic's parent audience. The transcript may contain:
- Corrections mid-sentence ("twelve cases, sorry, fourteen cases")
- False starts and filler words
- Code-mixing (English with occasional Hindi or Marathi terms)
- Out-of-order coverage of topics

The clinic is AMS, a walk-in veterinary clinic in Pune. Hours: 9am to 9pm, Monday to Saturday. AMS does NOT take phone bookings — pet parents walk in directly during clinic hours.

Return ONE of these two JSON shapes:

A) Normal structured broadcast (the usual path):
{
  "title": "string, short concrete headline, sentence-case (capitalise first word only), under 70 chars, no trailing period",
  "body": "string, 4-6 sentences. The body is the main narrative now (there is no separate summary bullets section). Cover: what is happening, why now, what the parent should DO about it, and any context that helps them act. Plain parent-friendly English. Concrete, not generic.",
  "warningSigns": ["array of 2 to 5 bullets, concrete observable symptoms warranting clinic escalation"],
  "whenToCallUs": "string, max 2 short sentences (~25 words total). Refer generically to 'these warning signs' — do NOT repeat the specific symptoms (they're already in the Warning signs section above). State the timeline (within 24 hours / within a week / same day) and AMS hours (9am-9pm Mon-Sat). Example shape: 'If you notice any of these warning signs, visit us at AMS clinic within 24 hours. We are open from 9am to 9pm, Monday to Saturday.' Keep it tight."
}

B) Refusal (use ONLY when the transcript genuinely contains no topic worth broadcasting — random words, ambient noise mistranscribed, accidental record button, or content with no clinical or operational substance):
{
  "refused": true,
  "reason": "string, one short sentence explaining what was wrong (e.g. 'Transcript appears to be background noise with no veterinary content.' or 'No clear topic or message could be identified.')"
}

Rules:
- DEFAULT to shape A. Only use shape B for genuinely unusable input. Bias strongly toward structuring — if there's any plausible broadcast in the transcript, build it.
- Do NOT invent a topic to avoid refusal. If the transcript is gibberish, refuse honestly.
- Resolve corrections in favour of the LATEST statement (if vet says "twelve, sorry fourteen," use fourteen).
- Use plain, parent-friendly English. Avoid jargon where possible.
- Preserve any medication names, dose information, or clinical specifics the vet mentioned.
- If the vet did not mention warning signs or escalation, infer reasonable defaults for the topic.
- Do NOT invent clinical facts. If the vet did not give specifics, keep guidance general.
- Use sentence case for the title. Do not Title Case Every Word. Do not end the title with a period.
- The body must be substantive (4-6 sentences). Do not under-write it — there is no summary bullets section to lean on anymore.
- Return ONLY the JSON object. No commentary, no markdown fences, no "Here is the JSON" preamble.`;

export type StructureResult =
  | { ok: true; draft: StructuredBroadcast }
  | { ok: false; error: string; rawTranscript: string };

/**
 * Send a transcript to Groq Llama 3.3 70B and get back a structured broadcast.
 *
 * Fallback policy (locked 2026-05-18): if Groq returns malformed JSON or
 * throws, return `{ ok: false, error, rawTranscript }`. The caller should
 * drop the rawTranscript into the composer's Body field and surface the
 * "couldn't structure, fill in manually" toast.
 */
export async function structureBroadcast(
  transcript: string
): Promise<StructureResult> {
  if (!client) {
    return {
      ok: false,
      error: "GROQ_API_KEY not configured",
      rawTranscript: transcript,
    };
  }
  if (!transcript.trim()) {
    return {
      ok: false,
      error: "Empty transcript",
      rawTranscript: transcript,
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Vet's spoken dictation transcript:\n\n"""${transcript}"""\n\nReturn the structured broadcast as JSON.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return {
        ok: false,
        error: "Groq returned empty content",
        rawTranscript: transcript,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return {
        ok: false,
        error: `Groq returned invalid JSON: ${(e as Error).message}`,
        rawTranscript: transcript,
      };
    }

    // Refusal branch: model explicitly declined to structure (gibberish
    // transcript, ambient noise mistranscribed, accidental record press).
    // Surface the reason so the composer's fallback canvas can show it to
    // the vet; the raw transcript still goes into the body field.
    const refusal = parsed as { refused?: unknown; reason?: unknown };
    if (refusal.refused === true) {
      const reason =
        typeof refusal.reason === "string" && refusal.reason.trim()
          ? refusal.reason.trim()
          : "Model declined to structure this transcript.";
      return { ok: false, error: reason, rawTranscript: transcript };
    }

    // Light runtime validation. Groq's strict JSON schema should already
    // enforce shape, but defend against the model dropping a required field.
    const draft = parsed as Partial<StructuredBroadcast>;
    if (
      typeof draft.title !== "string" ||
      typeof draft.body !== "string" ||
      !Array.isArray(draft.warningSigns) ||
      typeof draft.whenToCallUs !== "string"
    ) {
      return {
        ok: false,
        error: "Groq output missing required fields",
        rawTranscript: transcript,
      };
    }

    // Hardcode first-letter capitalisation on the title. Llama 3.3 70B is
    // inconsistent about applying the sentence-case rule from the prompt
    // — about 30% of outputs come back fully lowercase ("dental diseases
    // in pets"). Post-processing here guarantees a capital first letter
    // regardless of what the model returned. The rest of the string keeps
    // the model's casing (so it doesn't fight "iPhone", "DHPP", etc.).
    const rawTitle = draft.title.trim();
    const title = rawTitle
      ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1)
      : rawTitle;

    return {
      ok: true,
      draft: {
        title,
        body: draft.body.trim(),
        warningSigns: draft.warningSigns.map((s) => s.trim()).filter(Boolean),
        whenToCallUs: draft.whenToCallUs.trim(),
      },
    };
  } catch (e) {
    const err = e as Error;
    return {
      ok: false,
      error: `Groq request failed: ${err.message}`,
      rawTranscript: transcript,
    };
  }
}
