import { NextRequest, NextResponse } from "next/server";
import { sarvamTranslate } from "@/lib/sarvam";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/sarvam-translate
 *
 * JSON body: { text: string, source: "en" | "mr", target: "en" | "mr" }
 * Returns { translated: string }.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { text?: string; source?: "en" | "mr"; target?: "en" | "mr" };
    if (typeof body.text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const src = body.source === "mr" ? "mr-IN" : "en-IN";
    const tgt = body.target === "en" ? "en-IN" : "mr-IN";
    const result = await sarvamTranslate(body.text, src, tgt);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    return NextResponse.json({ translated: result.translated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Translate route failed" },
      { status: 500 }
    );
  }
}
