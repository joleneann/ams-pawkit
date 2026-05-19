import { NextRequest, NextResponse } from "next/server";
import { sarvamSpeechToText } from "@/lib/sarvam";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/sarvam-stt
 *
 * Accepts multipart/form-data with `audio` (Blob) and optional `language`
 * ("en" | "mr"). Forwards to Sarvam STT and returns the transcript text.
 * Server-only — Sarvam API key never reaches the client.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio");
    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: "audio (Blob) is required" }, { status: 400 });
    }
    const langParam = formData.get("language");
    const languageCode =
      langParam === "en" ? "en-IN" : langParam === "mr" ? "mr-IN" : "unknown";
    const result = await sarvamSpeechToText(audio, languageCode);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    return NextResponse.json({ text: result.text });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "STT route failed" },
      { status: 500 }
    );
  }
}
