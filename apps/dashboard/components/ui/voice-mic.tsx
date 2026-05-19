"use client";

import { useState, useRef, useCallback } from "react";
import { Microphone as Mic, Square, CircleNotch as Loader2 } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Voice mic button — records audio via MediaRecorder, sends to /api/sarvam-stt,
 * calls `onTranscript` with the returned text. Visual states: idle → listening
 * (recording with stop icon) → processing (loading spinner) → idle.
 *
 * Chunked recording (locked 2026-05-15 evening): Sarvam STT rejects audio over
 * 30 seconds. To let vets dictate freely (Broadcast bodies, long inbox replies)
 * the recorder rolls over every 25 seconds — each segment is a complete WebM
 * file, all segments transcribe in parallel after stop, and the transcripts
 * concatenate in order. Worst-case word-boundary split is acceptable for v0;
 * Sarvam's batch async endpoint is the v1 upgrade if it bites.
 */
const SEGMENT_DURATION_MS = 25_000;

export function VoiceMic({
  onTranscript,
  lang = "en",
  size = "md",
  className,
}: {
  onTranscript: (text: string) => void;
  lang?: "en" | "mr";
  size?: "sm" | "md";
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "listening" | "processing">("idle");
  const [hint, setHint] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const segmentsRef = useRef<Blob[]>([]);
  const segmentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const continueRecordingRef = useRef(false);

  const iconSize = size === "sm" ? "w-3 h-3" : "w-[17px] h-[17px]";

  const finalizeAndTranscribe = useCallback(async () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setState("processing");
    try {
      const segments = segmentsRef.current;
      segmentsRef.current = [];
      if (segments.length === 0) {
        setHint("No speech detected");
        setState("idle");
        return;
      }
      const texts = await Promise.all(
        segments.map(async (blob, idx) => {
          const fd = new FormData();
          fd.append("audio", blob, `voice-${idx}.webm`);
          fd.append("language", lang);
          const res = await fetch("/api/sarvam-stt", { method: "POST", body: fd });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "STT failed");
          return (json.text ?? "").trim();
        })
      );
      const transcript = texts.filter(Boolean).join(" ").trim();
      if (transcript) {
        onTranscript(transcript);
      } else {
        setHint("No speech detected");
      }
    } catch (e: any) {
      setHint(e?.message ?? "Voice error");
    } finally {
      setState("idle");
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
          // Rolling segment: vet is still talking, start a new recorder.
          startSegmentRecorder(streamRef.current);
        } else {
          // Vet pressed stop, run all segments through STT.
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
    setHint(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      segmentsRef.current = [];
      continueRecordingRef.current = true;
      setState("listening");
      startSegmentRecorder(stream);
    } catch (e: any) {
      const msg =
        e?.name === "NotAllowedError" ? "Mic permission blocked" : e?.message ?? "Mic error";
      setHint(msg);
      setState("idle");
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

  const toggle = () => (state === "listening" ? stop() : start());

  const isListening = state === "listening";
  const isProcessing = state === "processing";

  return (
    <div className={cn("relative inline-block", className)}>
      <Button
        type="button"
        onClick={toggle}
        disabled={isProcessing}
        variant={isListening ? "default" : "outline"}
        size={size === "sm" ? "icon" : "icon"}
        className={cn(
          size === "sm" ? "h-7 w-7" : "h-11 w-11",
          isProcessing && "opacity-60"
        )}
        aria-label={
          isListening
            ? "Stop recording"
            : isProcessing
              ? "Processing voice"
              : "Use voice"
        }
        title={
          isListening
            ? "Click to stop"
            : isProcessing
              ? "Transcribing..."
              : "Voice input (Sarvam)"
        }
      >
        {isListening ? (
          <Square className={iconSize} strokeWidth={1.5} />
        ) : isProcessing ? (
          <Loader2 className={cn(iconSize, "animate-spin")} strokeWidth={1.5} />
        ) : (
          <Mic className={iconSize} strokeWidth={1.5} />
        )}
      </Button>
      {hint && (
        <div
          className="absolute top-full right-0 mt-1 px-2 py-1 text-xxs text-ink-soft bg-canvas border border-ink-faint rounded shadow-sm whitespace-nowrap z-10"
          onClick={() => setHint(null)}
          role="alert"
        >
          {hint}
        </div>
      )}
    </div>
  );
}
