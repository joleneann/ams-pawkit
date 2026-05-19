"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Microphone as Mic, Square, CircleNotch as Loader2 } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Composer voice mic (locked 2026-05-15 evening — Sarvam Chat sectioning
 * ripped out).
 *
 * Single mic for the entire broadcast composer. Workflow:
 *   1. Vet clicks into the field they want to dictate (Title, Body, or any
 *      section bullet). Composer tracks that as the "focused target".
 *   2. Vet clicks the mic. Recording starts.
 *   3. Vet speaks for however long they need. Recording rolls over every 25s
 *      under the hood (Sarvam STT rejects audio >30s) — each segment is a
 *      complete WebM, all segments transcribe in parallel after stop, and the
 *      transcripts concatenate in order.
 *   4. Vet clicks stop. Transcript drops into the focused field via
 *      `onTranscript`.
 *
 * Previous attempt at AI sectioning into 5 fields (Sarvam Chat + sectioning
 * route) was abandoned because the model only ever filled the body and
 * silently ignored Summary / Warning / Escalation. Per-field manual dictation
 * is the v0 flow — Sagar reviews + manually shapes each field, no AI in the
 * loop except for translation (Sarvam Translate) and transcription itself.
 */
const SEGMENT_DURATION_MS = 25_000;

type State =
  | { kind: "idle" }
  | { kind: "recording" }
  | { kind: "transcribing" }
  | { kind: "error"; message: string };

export function ComposerVoiceMic({
  enabled,
  targetLabel,
  lang = "en",
  onTranscript,
}: {
  /** True when a field is focused (or was last focused) — mic is clickable. */
  enabled: boolean;
  /** Human label of the focused field, e.g. "Title", "Body", "Warning signs · bullet 1". */
  targetLabel: string | null;
  lang?: "en" | "mr";
  onTranscript: (text: string) => void;
}) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const segmentsRef = useRef<Blob[]>([]);
  const segmentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const continueRecordingRef = useRef(false);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      if (segmentTimerRef.current) clearTimeout(segmentTimerRef.current);
    };
  }, []);

  const finalizeAndTranscribe = useCallback(async () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    const segments = segmentsRef.current;
    segmentsRef.current = [];
    if (segments.length === 0) {
      setState({ kind: "error", message: "No speech detected" });
      return;
    }
    setState({ kind: "transcribing" });
    try {
      const texts = await Promise.all(
        segments.map(async (blob, idx) => {
          const fd = new FormData();
          fd.append("audio", blob, `voice-${idx}.webm`);
          fd.append("language", lang);
          const res = await fetch("/api/sarvam-stt", { method: "POST", body: fd });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Voice transcribe failed");
          return ((json.text as string) ?? "").trim();
        })
      );
      const transcript = texts.filter(Boolean).join(" ").trim();
      if (!transcript) {
        setState({ kind: "error", message: "No speech detected" });
        return;
      }
      onTranscript(transcript);
      setState({ kind: "idle" });
    } catch (e: any) {
      setState({ kind: "error", message: e?.message ?? "Voice flow error" });
    }
  }, [lang, onTranscript]);

  const startSegmentRecorder = useCallback(
    (stream: MediaStream) => {
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const segmentBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        if (segmentBlob.size > 0) segmentsRef.current.push(segmentBlob);
        if (continueRecordingRef.current && streamRef.current) {
          startSegmentRecorder(streamRef.current);
        } else {
          finalizeAndTranscribe();
        }
      };
      recorder.start();
      segmentTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, SEGMENT_DURATION_MS);
    },
    [finalizeAndTranscribe]
  );

  const start = useCallback(async () => {
    setState({ kind: "idle" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      segmentsRef.current = [];
      continueRecordingRef.current = true;
      setState({ kind: "recording" });
      startSegmentRecorder(stream);
    } catch (e: any) {
      const msg =
        e?.name === "NotAllowedError" ? "Mic permission blocked" : e?.message ?? "Mic error";
      setState({ kind: "error", message: msg });
    }
  }, [startSegmentRecorder]);

  const stop = useCallback(() => {
    continueRecordingRef.current = false;
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleClick = () => {
    if (state.kind === "recording") {
      stop();
    } else if (state.kind === "idle" || state.kind === "error") {
      if (!enabled) return;
      start();
    }
  };

  const isRecording = state.kind === "recording";
  const isBusy = state.kind === "transcribing";
  // Always berry fill — the mic is the primary action on the toolbar and
  // needs to read at the same weight as the Boysenberry brand chip elsewhere.
  // Disabled state dims to 50% via Button's built-in `disabled:opacity-50`.
  const buttonVariant: "default" = "default";

  const helperText: string =
    state.kind === "error"
      ? state.message
      : isRecording
        ? lang === "mr"
          ? "रेकॉर्डिंग सुरू आहे... थांबविण्यासाठी टॅप करा"
          : "Recording... tap to stop"
        : isBusy
          ? lang === "mr"
            ? "ट्रान्सक्राइब करत आहे..."
            : "Transcribing..."
          : !enabled
            ? lang === "mr"
              ? "आधी एका फील्डवर क्लिक करा"
              : "Click into a field first"
            : targetLabel
              ? lang === "mr"
                ? `${targetLabel} मध्ये रेकॉर्ड`
                : `Record into ${targetLabel}`
              : lang === "mr"
                ? "रेकॉर्ड करा"
                : "Record";

  return (
    <div className="inline-flex items-center gap-2.5">
      <Button
        type="button"
        // Don't steal focus from the input the vet just clicked into.
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleClick}
        disabled={isBusy || (!enabled && !isRecording)}
        variant={buttonVariant}
        size="icon"
        className={cn(
          "rounded-full shrink-0",
          isRecording && "animate-pulse",
          isBusy && "opacity-60 cursor-wait"
        )}
        aria-label={
          isRecording
            ? "Stop recording"
            : isBusy
              ? "Transcribing"
              : "Record into focused field"
        }
        title={helperText}
      >
        {isRecording ? (
          <Square className="w-3.5 h-3.5" strokeWidth={2} />
        ) : isBusy ? (
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
        ) : (
          <Mic className="w-4 h-4" strokeWidth={1.5} />
        )}
      </Button>
      <span
        className={cn(
          "text-xs font-medium text-ink-soft max-w-[220px] truncate",
          state.kind === "error" && "italic"
        )}
      >
        {helperText}
      </span>
    </div>
  );
}
