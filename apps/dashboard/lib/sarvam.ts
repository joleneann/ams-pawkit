import "server-only";

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
if (!SARVAM_API_KEY) {
  console.warn("SARVAM_API_KEY is not set; Sarvam features will return errors.");
}

/**
 * Server-only Sarvam helpers. The API key is never exposed to the client;
 * routes (`/api/sarvam-stt`, `/api/sarvam-translate`) call these.
 */

export async function sarvamTranslate(
  text: string,
  source: "en-IN" | "mr-IN" = "en-IN",
  target: "en-IN" | "mr-IN" = "mr-IN"
): Promise<{ translated: string } | { error: string }> {
  if (!SARVAM_API_KEY) return { error: "Sarvam API key missing" };
  if (!text.trim()) return { translated: "" };
  try {
    const res = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": SARVAM_API_KEY,
      },
      body: JSON.stringify({
        input: text,
        source_language_code: source,
        target_language_code: target,
        model: "sarvam-translate:v1",
        mode: "formal",
      }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      return { error: `Sarvam translate ${res.status}: ${err.slice(0, 200)}` };
    }
    const obj = (await res.json()) as { translated_text?: string };
    return { translated: obj.translated_text ?? "" };
  } catch (e: any) {
    return { error: e?.message ?? "Sarvam translate failed" };
  }
}

export async function sarvamSpeechToText(
  audio: Blob | File,
  languageCode: "en-IN" | "mr-IN" | "unknown" = "unknown"
): Promise<{ text: string } | { error: string }> {
  if (!SARVAM_API_KEY) return { error: "Sarvam API key missing" };
  try {
    const formData = new FormData();
    // Sarvam expects an audio file under the "file" key plus a model name.
    formData.append("file", audio, "voice.webm");
    formData.append("model", "saarika:v2.5");
    if (languageCode !== "unknown") {
      formData.append("language_code", languageCode);
    }
    const res = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": SARVAM_API_KEY,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      return { error: `Sarvam STT ${res.status}: ${err.slice(0, 200)}` };
    }
    const obj = (await res.json()) as { transcript?: string };
    return { text: obj.transcript ?? "" };
  } catch (e: any) {
    return { error: e?.message ?? "Sarvam STT failed" };
  }
}
