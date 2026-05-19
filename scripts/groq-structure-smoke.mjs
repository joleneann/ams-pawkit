#!/usr/bin/env node
/**
 * Smoke test for Groq Llama 3.3 70B broadcast structuring.
 *
 * Reads GROQ_API_KEY from apps/dashboard/.env.local, then runs three
 * sample transcripts through Groq with the same prompt + JSON schema
 * lib/groq.ts uses. Prints the structured output so we can verify:
 *   - Clean transcripts produce reasonable structure
 *   - Mid-sentence corrections resolve to the LATEST statement
 *   - Out-of-order coverage gets reorganised properly
 *
 * Run: node scripts/groq-structure-smoke.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Groq from "groq-sdk";

const envText = readFileSync(
  resolve(".", "apps", "dashboard", ".env.local"),
  "utf8"
);
const env = Object.fromEntries(
  envText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);
const KEY = env.GROQ_API_KEY;
if (!KEY) {
  console.error("GROQ_API_KEY missing from apps/dashboard/.env.local");
  process.exit(1);
}

const client = new Groq({ apiKey: KEY });

const SYSTEM_PROMPT = `You turn a veterinarian's spoken dictation into a structured broadcast for pet parents.

The vet just spoke freely about a topic for their clinic's parent audience. The transcript may contain:
- Corrections mid-sentence ("twelve cases, sorry, fourteen cases")
- False starts and filler words
- Code-mixing (English with occasional Hindi or Marathi terms)
- Out-of-order coverage of topics

Your job is to reorganise the transcript into a clean 5-part broadcast and return EXACTLY this JSON shape:

{
  "title": "string, short concrete headline, capitalised first word only, under 70 chars, no trailing period",
  "body": "string, 2-4 sentences of opening context: what's the situation, why now, what should the parent know first",
  "keyPoints": ["array of 3 to 6 short bullets, one idea each, under 25 words"],
  "warningSigns": ["array of 2 to 5 bullets, concrete observable symptoms warranting clinic escalation"],
  "whenToCallUs": "string, 1-2 sentences on when and how to reach the clinic"
}

Rules:
- Resolve corrections in favour of the LATEST statement (if vet says "twelve, sorry fourteen," use fourteen).
- Use plain, parent-friendly English. Avoid jargon where possible.
- Preserve any medication names, dose information, or clinical specifics the vet mentioned.
- If the vet did not mention warning signs or escalation, infer reasonable defaults for the topic.
- Do NOT invent clinical facts. If the vet did not give specifics, keep guidance general.
- Capitalise the first word of the title only. Do not end the title with a period.
- Return ONLY the JSON object. No commentary, no markdown fences, no "Here is the JSON" preamble.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "body", "keyPoints", "warningSigns", "whenToCallUs"],
  properties: {
    title: { type: "string" },
    body: { type: "string" },
    keyPoints: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
    warningSigns: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
    whenToCallUs: { type: "string" },
  },
};

const SAMPLES = [
  {
    label: "Clean transcript (monsoon ticks, ~150 words)",
    transcript:
      "Monsoon is here and we've seen a sharp rise in tick fever this week. Fourteen confirmed cases at AMS so far. The two preventives I recommend are Bravecto every twelve weeks or NexGard monthly. Parents should check their dog daily, especially around the ears, between the toes, and under the collar. Avoid tall grass walks and stagnant water if you can. The warning signs are lethargy, refusing food for more than a day, pale gums (gums should look pink not white or grey), nosebleeds, gum bleeding, or fever. If you see any of these, walk in to AMS the same day. We're open nine to nine, Monday to Saturday. For after-hours emergencies, call us first and we'll guide you to the nearest 24-hour facility.",
  },
  {
    label: "Messy transcript with mid-sentence corrections + out-of-order topics",
    transcript:
      "Okay so this is about monsoon ticks. We've seen twelve, sorry, fourteen cases of tick fever this week. Um, parents should call us if their dog is lethargic or has pale gums. The drops we recommend are Bravecto or NexGard. Actually wait, Bravecto is every twelve weeks and NexGard is monthly. Daily check between the toes and around the ears. Oh and if you see nosebleeds, that's also a warning sign. We're walk-in only, nine to nine Mon to Sat. Tick fever is from ehrlichia and babesia, by the way. Avoid stagnant water walks too if possible.",
  },
  {
    label: "Short transcript (announcement-style, ~50 words)",
    transcript:
      "Hi all, AMS will be closed on August fifteenth for Independence Day. We'll be back to normal hours from the sixteenth. For emergencies on the fifteenth, please call us first and we'll redirect you to the nearest 24-hour facility.",
  },
];

const MODEL = "llama-3.3-70b-versatile";

async function structureOne(transcript) {
  const t0 = Date.now();
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
  const ms = Date.now() - t0;
  const content = completion.choices[0]?.message?.content ?? "";
  return { ms, parsed: JSON.parse(content), usage: completion.usage };
}

console.log("Groq Llama 3.3 70B broadcast structuring smoke test\n");
console.log(`Model: ${MODEL}\n`);

for (const sample of SAMPLES) {
  console.log("=".repeat(72));
  console.log(`SAMPLE: ${sample.label}`);
  console.log("=".repeat(72));
  console.log(`Transcript (${sample.transcript.length} chars):`);
  console.log(`  "${sample.transcript.slice(0, 140)}${sample.transcript.length > 140 ? "..." : ""}"\n`);
  try {
    const { ms, parsed, usage } = await structureOne(sample.transcript);
    console.log(`✓ Structured in ${ms}ms`);
    console.log(`  Tokens: ${usage?.prompt_tokens ?? "?"} in, ${usage?.completion_tokens ?? "?"} out\n`);
    console.log(`  TITLE: ${parsed.title}`);
    console.log(`  BODY: ${parsed.body}\n`);
    console.log(`  KEY POINTS (${parsed.keyPoints.length}):`);
    parsed.keyPoints.forEach((kp, i) => console.log(`    ${i + 1}. ${kp}`));
    console.log(`\n  WARNING SIGNS (${parsed.warningSigns.length}):`);
    parsed.warningSigns.forEach((w, i) => console.log(`    ${i + 1}. ${w}`));
    console.log(`\n  WHEN TO CALL US: ${parsed.whenToCallUs}`);
    console.log("");
  } catch (e) {
    console.log(`✗ Failed: ${e.message}\n`);
  }
}

console.log("=".repeat(72));
console.log("Smoke test complete.");
