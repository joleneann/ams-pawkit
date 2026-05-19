"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Microphone,
  CircleNotch,
  ArrowRight,
  WarningCircle,
  Pencil,
  Square,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import {
  DEFAULT_DRAFT,
  EMPTY_CONTENT,
  STANDARD_SECTION_LABELS,
  seedBroadcastDraftStorage,
  type BroadcastDraft,
  type ContentSet,
  type Section,
} from "@/app/(dashboard)/broadcasts/draft-state";
import {
  useVoiceRecorder,
  type RecorderState,
} from "./use-voice-recorder";
import {
  VoiceDumpCoachmark,
  markVoiceDumpCoachmarkDismissed,
} from "./voice-dump-coachmark";

/**
 * Voice-first landing for /broadcasts/new (locked 2026-05-18 per
 * docs/decisions-log.md "Broadcast voice-dump feature").
 *
 * The vet lands on a single mic prompt. They speak freely (up to 10 min,
 * soft-warned at 8), stop, Pawkit transcribes via Sarvam Saarika, then
 * structures via Groq Llama 3.3 70B, then writes the structured BroadcastDraft
 * to localStorage and navigates to /broadcasts/new/manual where the existing
 * composer canvas hydrates from that draft and the vet edits before publish.
 *
 * Marathi translation is lazy: the manual composer's existing मराठी toggle
 * triggers Sarvam Mayura on first switch. No background translation here.
 *
 * Fallback policy: if Groq returns ok:false, we offer the vet two paths
 * inline (continue with raw transcript dropped into the Body field, or try
 * recording again). The vet's words are never lost.
 */

const MANUAL_HREF = "/broadcasts/new/manual";

/** Local UI state that layers on top of the recorder's own state machine. */
type StructuringState =
  | { kind: "idle" }
  | { kind: "in-progress" }
  | { kind: "fallback"; transcript: string; reason: string }
  | { kind: "error"; message: string };

interface GroqResponse {
  ok?: boolean;
  draft?: {
    title: string;
    body: string;
    warningSigns: string[];
    whenToCallUs: string;
  };
  error?: string;
  rawTranscript?: string;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/** Map Groq's structured shape onto the composer's BroadcastDraft. The MR
 *  side stays empty — the vet triggers translation lazily via the existing
 *  मराठी toggle inside the manual composer. Audience also stays empty so
 *  the vet picks it explicitly (matches DEFAULT_DRAFT behaviour).
 *
 *  Section composition (2026-05-18): the summary-bullets section was
 *  removed because it duplicated body content. The body is now the
 *  primary narrative carrier (4-6 sentences); only Warning signs + When
 *  to call us are appended as structured sections. */
function buildStructuredDraft(
  structured: NonNullable<GroqResponse["draft"]>,
  transcript: string,
): BroadcastDraft {
  const sections: Section[] = [];
  if (structured.warningSigns.length > 0) {
    sections.push({
      id: newId("s-warning"),
      type: "warning",
      label: STANDARD_SECTION_LABELS.warning.en,
      items: structured.warningSigns,
    });
  }
  if (structured.whenToCallUs.trim()) {
    sections.push({
      id: newId("s-when"),
      type: "whenToCall",
      label: STANDARD_SECTION_LABELS.whenToCall.en,
      items: [structured.whenToCallUs.trim()],
    });
  }
  const en: ContentSet = {
    title: structured.title,
    body: structured.body,
    sections,
    coverImageUrl: null,
    coverImagePosition: null,
  };
  return {
    ...DEFAULT_DRAFT,
    en,
    mr: { ...EMPTY_CONTENT },
    language: "en",
    slug: "voice-draft",
    serverDraftId: null,
    voiceTranscript: transcript,
  };
}

/** Fallback draft when Groq can't structure: drop the full transcript into
 *  the Body field so the vet can structure as they go. Title stays empty so
 *  the vet's first action on the manual page is to pick a headline. */
function buildFallbackDraft(transcript: string): BroadcastDraft {
  const en: ContentSet = {
    title: "",
    body: transcript,
    sections: [],
    coverImageUrl: null,
    coverImagePosition: null,
  };
  return {
    ...DEFAULT_DRAFT,
    en,
    mr: { ...EMPTY_CONTENT },
    language: "en",
    slug: "voice-draft",
    serverDraftId: null,
    voiceTranscript: transcript,
  };
}

function formatDurationFromSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function stateBadgeFor(
  recorderState: RecorderState,
  structuring: StructuringState
): { label: string; tone: "pre" | "live" | "post" | "warn" } | null {
  if (structuring.kind === "error") return { label: "Couldn't record", tone: "warn" };
  if (structuring.kind === "fallback") return { label: "Couldn't structure", tone: "warn" };
  if (structuring.kind === "in-progress") return { label: "Structuring", tone: "post" };
  switch (recorderState) {
    case "permission":
      return { label: "Allow mic", tone: "pre" };
    case "recording":
      return { label: "Recording", tone: "live" };
    case "transcribing":
      return { label: "Transcribing", tone: "post" };
    case "error":
      return { label: "Couldn't record", tone: "warn" };
    case "ready":
    case "idle":
    default:
      // Initial state intentionally has no badge — the headline + mic carry
      // the moment; an "Initial state" pill reads as developer chrome.
      return null;
  }
}

export function VoiceFirstLanding() {
  const router = useRouter();
  const recorder = useVoiceRecorder();
  const { t } = useLanguage();
  const [structuring, setStructuring] = useState<StructuringState>({ kind: "idle" });

  /**
   * Tracks which transcript we've already kicked off structuring for. Used
   * INSTEAD of listing `structuring.kind` in the useEffect deps — listing
   * the state in deps caused the effect's cleanup to fire the instant we
   * called `setStructuring({kind: "in-progress"})`, which aborted the fetch
   * before it could complete. The ref lets us guard re-firing without
   * making the effect's lifecycle dependent on its own side-effect.
   */
  const structuredForTranscriptRef = useRef<string | null>(null);

  /**
   * Pre-warm the structure route on page load. Next dev mode JIT-compiles
   * the handler + loads the Groq SDK module on first hit, which costs ~9s
   * cold versus ~1.5s warm. We fire a `{warmup: true}` ping the moment the
   * landing mounts — by the time the vet finishes speaking and STT returns,
   * the route is warm and Groq is ready. The warmup branch does NOT call
   * Groq (saves ₹0.01 / page visit); it just exercises the Next route +
   * module imports.
   */
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/broadcast/structure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warmup: true }),
      signal: controller.signal,
    }).catch(() => {
      // Best-effort. Swallow errors — if warmup fails, the real request
      // just pays the cold-start cost. No user-visible state change.
    });
    return () => controller.abort();
  }, []);

  // When the recorder hits "ready" with a fresh transcript, fire Groq once.
  useEffect(() => {
    if (recorder.state !== "ready" || !recorder.transcript) return;
    if (structuredForTranscriptRef.current === recorder.transcript) return;
    structuredForTranscriptRef.current = recorder.transcript;

    const transcript = recorder.transcript;
    setStructuring({ kind: "in-progress" });

    // 25s hard timeout. Groq typically returns in ~1-2s; anything past 25s
    // is a spike or a hung fetch. Fall through to the fallback path so the
    // vet isn't stuck on a "Structuring..." spinner indefinitely.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new DOMException("Structuring timeout", "AbortError"));
    }, 25_000);

    // `aborted` only flips true when the cleanup runs (unmount or recorder
    // reset). It distinguishes "the user moved on" (don't touch state) from
    // "the timeout fired" (do set fallback state). Now that `structuring.kind`
    // is NOT a useEffect dep, cleanup no longer fires the instant we set
    // in-progress — so we can safely abort on cleanup without self-cancelling.
    let aborted = false;
    let timedOut = false;
    controller.signal.addEventListener("abort", () => {
      if (aborted) return;
      timedOut = true;
    });

    (async () => {
      try {
        const res = await fetch("/api/broadcast/structure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
          signal: controller.signal,
        });
        const json = (await res.json().catch(() => ({}))) as GroqResponse;
        if (aborted) return;
        if (json.ok && json.draft) {
          const draft = buildStructuredDraft(json.draft, transcript);
          seedBroadcastDraftStorage(draft);
          router.push(MANUAL_HREF);
          return;
        }
        const reason = json.error ?? "Structuring returned an unexpected response.";
        const fallbackTranscript = json.rawTranscript ?? transcript;
        setStructuring({ kind: "fallback", transcript: fallbackTranscript, reason });
      } catch (e) {
        if (aborted) return;
        const err = e as Error;
        if (timedOut || err.name === "AbortError") {
          setStructuring({
            kind: "fallback",
            transcript,
            reason:
              "Structuring took longer than 25 seconds — dropping the raw transcript into the body so you're not stuck.",
          });
          return;
        }
        setStructuring({
          kind: "fallback",
          transcript,
          reason: err.message ?? "Structuring request failed",
        });
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    return () => {
      aborted = true;
      clearTimeout(timeoutId);
      if (!controller.signal.aborted) controller.abort();
    };
  }, [recorder.state, recorder.transcript, router]);

  // Surface recorder errors at the same UI layer.
  useEffect(() => {
    if (recorder.state === "error" && recorder.error) {
      setStructuring({ kind: "error", message: recorder.error });
    }
  }, [recorder.state, recorder.error]);

  const handleStart = useCallback(async () => {
    markVoiceDumpCoachmarkDismissed();
    setStructuring({ kind: "idle" });
    await recorder.start();
  }, [recorder]);

  const handleStop = useCallback(async () => {
    await recorder.stop();
  }, [recorder]);

  const handleRetry = useCallback(() => {
    structuredForTranscriptRef.current = null;
    recorder.reset();
    setStructuring({ kind: "idle" });
  }, [recorder]);

  const handleContinueWithRaw = useCallback(() => {
    if (structuring.kind !== "fallback") return;
    const draft = buildFallbackDraft(structuring.transcript);
    seedBroadcastDraftStorage(draft);
    router.push(MANUAL_HREF);
  }, [structuring, router]);

  const badge = stateBadgeFor(recorder.state, structuring);
  // Mic canvas covers idle / permission / recording in a single visual.
  // Recording is no longer a "second page" — the mic icon swaps to a stop
  // square in-place, the rings pulse, and the status line below the mic
  // shows the duration. Locked 2026-05-18 per user feedback.
  const showMicCanvas =
    structuring.kind === "idle" &&
    (recorder.state === "idle" ||
      recorder.state === "permission" ||
      recorder.state === "recording");
  const showTranscribingCanvas =
    structuring.kind === "idle" && recorder.state === "transcribing";
  const showStructuringCanvas = structuring.kind === "in-progress";
  const showFallbackCanvas = structuring.kind === "fallback";
  const showErrorCanvas = structuring.kind === "error";

  return (
    <>
      <div className="px-8 pt-6 pb-3 flex items-baseline gap-4">
        <h1 className="text-ink text-lg font-semibold">
          {t("voice.header.title")}
        </h1>
        {badge && <StateBadge label={badge.label} tone={badge.tone} />}
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={MANUAL_HREF}>
              <Pencil className="w-3.5 h-3.5" weight="regular" />
              {t("voice.header.compose-manually")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-canvas border border-rule rounded-2xl min-h-[520px] flex flex-col">
          {showMicCanvas && (
            <MicCanvas
              recorderState={recorder.state}
              durationDisplay={recorder.durationDisplay}
              approachingLimit={recorder.approachingLimit}
              onStart={handleStart}
              onStop={handleStop}
            />
          )}
          {showTranscribingCanvas && (
            <BusyCanvas
              headline={t("voice.transcribing.headline")}
              sub={t("voice.transcribing.sub")}
            />
          )}
          {showStructuringCanvas && (
            <BusyCanvas
              headline={t("voice.structuring.headline")}
              sub={t("voice.structuring.sub")}
            />
          )}
          {showFallbackCanvas && (
            <FallbackCanvas
              reason={structuring.kind === "fallback" ? structuring.reason : ""}
              transcript={structuring.kind === "fallback" ? structuring.transcript : ""}
              onContinue={handleContinueWithRaw}
              onRetry={handleRetry}
            />
          )}
          {showErrorCanvas && (
            <ErrorCanvas
              message={structuring.kind === "error" ? structuring.message : ""}
              onRetry={handleRetry}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// State badge (matches the mockup's .state-badge anatomy)
// ============================================================================

function StateBadge({
  label,
  tone,
}: {
  label: string;
  tone: "pre" | "live" | "post" | "warn";
}) {
  const toneClasses =
    tone === "live"
      ? "bg-berry-soft border-berry/30 text-berry-deep"
      : tone === "post"
        ? "bg-moss-soft border-moss/25 text-moss"
        : tone === "warn"
          ? "bg-berry-soft border-berry/30 text-berry-deep"
          : "bg-canvas-2 border-rule text-ink-soft";
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xxs font-semibold uppercase tracking-[0.14em] " +
        toneClasses
      }
    >
      {tone === "live" && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-berry animate-pulse" />
      )}
      {label}
    </span>
  );
}

// ============================================================================
// Mic canvas — unified idle / permission / recording (locked 2026-05-18 v2)
//
// Recording is no longer a "second page" with a separate transcript card.
// The vet stays on the same screen: same headline, same sub copy, same mic
// position. Only the mic icon (mic → stop square), the rings (subtle →
// pulsing), and the status line below (Tap to start → RECORDING · 0:42 →
// Tap to stop) change. Visual continuity, no jarring layout swap.
// ============================================================================

function MicCanvas({
  recorderState,
  durationDisplay,
  approachingLimit,
  onStart,
  onStop,
}: {
  recorderState: RecorderState;
  durationDisplay: string;
  approachingLimit: boolean;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
}) {
  const { t } = useLanguage();
  const isPermission = recorderState === "permission";
  const isRecording = recorderState === "recording";
  const isIdle = recorderState === "idle";

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-14">
      <div className="text-xxs font-semibold uppercase tracking-[0.14em] text-berry-deep mb-3">
        {t("voice.eyebrow")}
      </div>
      <h2 className="text-3xl font-semibold text-ink leading-tight max-w-[560px] mb-4">
        {t("voice.headline")}
      </h2>
      <p className="text-md text-ink-soft leading-[1.6] max-w-[560px] mb-20">
        {t("voice.sub")}
      </p>

      <div className="relative flex items-center justify-center">
        {isIdle && <VoiceDumpCoachmark />}
        {/* Rings pulse while recording, sit still otherwise. */}
        <span
          aria-hidden="true"
          className={
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border-[1.5px] border-berry/20 pointer-events-none" +
            (isRecording ? " animate-pulse" : "")
          }
        />
        <span
          aria-hidden="true"
          className={
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border-[1.5px] border-berry/30 pointer-events-none" +
            (isRecording ? " animate-pulse" : "")
          }
        />
        <span
          aria-hidden="true"
          className={
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full border-[1.5px] border-berry/40 pointer-events-none" +
            (isRecording ? " animate-pulse" : "")
          }
        />
        <Button
          type="button"
          onClick={isRecording ? onStop : onStart}
          disabled={isPermission}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className="bg-berry-gradient relative z-[1] w-24 h-24 rounded-full p-0 text-canvas shadow-[0_12px_28px_-8px_rgba(156,43,92,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] !h-24 hover:opacity-95"
        >
          {isPermission ? (
            <CircleNotch className="w-9 h-9 animate-spin" weight="bold" />
          ) : isRecording ? (
            <Square className="w-8 h-8" weight="fill" />
          ) : (
            <Microphone className="w-9 h-9" weight="fill" />
          )}
        </Button>
      </div>

      {/* Status line below mic. Single line, no card swap. */}
      <div className="mt-20 flex items-center justify-center gap-3">
        {isPermission && (
          <span className="text-sm text-ink-faint">
            {t("voice.cta.permission")}
          </span>
        )}
        {isIdle && (
          <span className="text-xxs font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {t("voice.cta.tap-to-start")}
          </span>
        )}
        {isRecording && (
          <>
            <span className="inline-flex items-center gap-2 text-xxs font-semibold uppercase tracking-[0.14em] text-berry-deep leading-none">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-berry animate-pulse" />
              {t("voice.recording.label")}
            </span>
            <span className="text-xxs font-semibold uppercase tracking-[0.14em] text-ink tabular-nums leading-none">
              {durationDisplay}
            </span>
            {approachingLimit && (
              <span className="inline-flex items-center rounded-full border border-berry/30 bg-berry-soft px-2 py-0.5 text-xxs font-semibold uppercase tracking-[0.14em] text-berry-deep leading-none">
                {t("voice.recording.approaching-limit")}
              </span>
            )}
            <span className="text-xxs font-semibold uppercase tracking-[0.14em] text-ink-faint leading-none">
              {t("voice.recording.tap-to-stop")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Busy canvas (transcribing / structuring)
// ============================================================================

function BusyCanvas({ headline, sub }: { headline: string; sub: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
      <CircleNotch
        className="w-10 h-10 text-berry animate-spin mb-5"
        weight="bold"
      />
      <h2 className="text-2xl font-semibold text-ink mb-2">{headline}</h2>
      <p className="text-md text-ink-soft leading-[1.6] max-w-[420px]">{sub}</p>
    </div>
  );
}

// ============================================================================
// Fallback canvas (Groq returned ok:false but we have the raw transcript)
// ============================================================================

function FallbackCanvas({
  reason,
  transcript,
  onContinue,
  onRetry,
}: {
  reason: string;
  transcript: string;
  onContinue: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-14">
      <WarningCircle
        className="w-10 h-10 text-berry mb-4"
        weight="fill"
      />
      <h2 className="text-2xl font-semibold text-ink mb-2">
        Couldn&apos;t auto-structure this one
      </h2>
      <p className="text-md text-ink-soft leading-[1.6] max-w-[480px] mb-2">
        Your words are safe. We&apos;ll drop the full transcript into the
        body field and you can structure as you go.
      </p>
      <p className="text-xs text-ink-faint mb-6">{reason}</p>
      <div className="flex items-center gap-3">
        <Button type="button" onClick={onContinue} size="cta">
          Continue with raw text
          <ArrowRight className="w-3.5 h-3.5" weight="bold" />
        </Button>
        <Button type="button" onClick={onRetry} variant="outline" size="cta">
          Try recording again
        </Button>
      </div>
      {transcript && (
        <div className="mt-8 w-full max-w-[560px] text-left">
          <div className="text-xxs font-semibold uppercase tracking-[0.14em] text-ink-faint mb-2">
            Your transcript
          </div>
          <div className="rounded-xl border border-rule-soft bg-canvas-2 px-4 py-3 text-sm leading-[1.65] text-ink-soft italic max-h-[180px] overflow-auto">
            {transcript}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Error canvas (mic permission denied or STT failed)
// ============================================================================

function ErrorCanvas({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
      <WarningCircle
        className="w-10 h-10 text-berry mb-4"
        weight="fill"
      />
      <h2 className="text-2xl font-semibold text-ink mb-2">
        Couldn&apos;t record
      </h2>
      <p className="text-md text-ink-soft leading-[1.6] max-w-[440px] mb-1">
        {message || "The mic didn't respond."}
      </p>
      <p className="text-sm text-ink-faint mb-6 max-w-[440px]">
        Check that your browser has microphone permission for this site, then
        try again.
      </p>
      <div className="flex items-center gap-3">
        <Button type="button" onClick={onRetry} size="cta">
          Try again
        </Button>
        <Button type="button" asChild variant="outline" size="cta">
          <Link href={MANUAL_HREF}>Compose manually instead</Link>
        </Button>
      </div>
    </div>
  );
}
