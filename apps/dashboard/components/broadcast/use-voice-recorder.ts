"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Voice-recorder hook for the broadcast voice-dump flow.
 *
 * Records mic input via MediaRecorder, ticks a duration counter, soft-caps
 * at 8 minutes (badge), hard-caps at 10 minutes (auto-stop). On stop, sends
 * all recorded segments to /api/sarvam-stt in parallel and concatenates the
 * transcripts in order.
 *
 * Segment rotation (mirrors `components/ui/voice-mic.tsx`):
 *   Sarvam's `/speech-to-text` endpoint hard-caps each request at 30s. To
 *   let vets dictate for minutes, the recorder rolls over every 25 seconds:
 *   each segment is a complete WebM file (its own MediaRecorder gets fresh
 *   container headers), gets pushed to `segmentsRef`, and a new recorder
 *   immediately starts. After the vet hits stop, all segments hit STT in
 *   parallel and the texts join in order. Worst case is a word boundary
 *   split across two segments — acceptable for v0; Sarvam's batch async
 *   endpoint is the v1 upgrade when streaming entitlement lands.
 *
 * State machine:
 *   idle              first paint, mic not yet armed
 *   permission        getUserMedia in flight (browser permission prompt)
 *   recording         MediaRecorder is collecting audio (across segments)
 *   transcribing      all segments uploaded, awaiting Sarvam STT responses
 *   ready             transcript ready, ready to hand to structuring
 *   error             permission denied, network failure, or STT error
 *
 * Locked 2026-05-18 per docs/decisions-log.md "Broadcast voice-dump feature".
 */
export type RecorderState =
  | "idle"
  | "permission"
  | "recording"
  | "transcribing"
  | "ready"
  | "error";

const SOFT_LIMIT_SECONDS = 8 * 60; // 8:00 — "approaching limit" badge
const HARD_LIMIT_SECONDS = 10 * 60; // 10:00 — auto-stop
const SEGMENT_DURATION_MS = 25_000; // 25s — under Sarvam's 30s per-request cap

export interface UseVoiceRecorder {
  state: RecorderState;
  duration: number;
  durationDisplay: string; // "M:SS"
  approachingLimit: boolean; // true once duration >= SOFT_LIMIT_SECONDS
  transcript: string | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  reset: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function useVoiceRecorder(): UseVoiceRecorder {
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const segmentsRef = useRef<Blob[]>([]);
  const segmentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const continueRecordingRef = useRef<boolean>(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startMsRef = useRef<number>(0);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const clearSegmentTimer = useCallback(() => {
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
  }, []);

  /**
   * Send every captured segment to Sarvam STT in parallel and join transcripts.
   * Called once after the final segment's onstop pushes its blob.
   */
  const finalizeAndTranscribe = useCallback(async () => {
    setState("transcribing");
    try {
      const segments = segmentsRef.current;
      segmentsRef.current = [];
      if (segments.length === 0) {
        throw new Error("No speech detected");
      }
      const texts = await Promise.all(
        segments.map(async (blob, idx) => {
          const form = new FormData();
          form.append("audio", blob, `voice-${idx}.webm`);
          form.append("language", "en");
          const res = await fetch("/api/sarvam-stt", {
            method: "POST",
            body: form,
          });
          if (!res.ok) {
            const errBody = await res
              .json()
              .catch(() => ({ error: res.statusText }));
            throw new Error(errBody.error ?? `STT failed (${res.status})`);
          }
          const json = (await res.json()) as { text?: string; error?: string };
          if (json.error) throw new Error(json.error);
          return (json.text ?? "").trim();
        })
      );
      const merged = texts.filter(Boolean).join(" ").trim();
      if (!merged) throw new Error("Empty transcript returned from STT");
      setTranscript(merged);
      setState("ready");
    } catch (e) {
      const msg = (e as Error).message ?? "Transcription failed";
      setError(msg);
      setState("error");
    }
  }, []);

  /**
   * Spin up a single 25-second segment recorder. On its `stop` event it
   * either chains into another segment (if the vet is still recording) or
   * finalises and runs the parallel STT pass.
   */
  const startSegmentRecorder = useCallback(
    (stream: MediaStream) => {
      chunksRef.current = [];
      // Force the parent container mime (no `;codecs=opus` suffix). Sarvam's
      // STT validator rejects the suffixed string even though the audio
      // bytes are identical. Mirrors `components/ui/voice-mic.tsx`.
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorderRef.current = recorder;
      recorder.addEventListener("dataavailable", (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      });
      recorder.addEventListener(
        "stop",
        () => {
          const segmentBlob = new Blob(chunksRef.current, {
            type: "audio/webm",
          });
          chunksRef.current = [];
          if (segmentBlob.size > 0) segmentsRef.current.push(segmentBlob);
          if (continueRecordingRef.current && streamRef.current) {
            startSegmentRecorder(streamRef.current);
          } else {
            cleanupStream();
            void finalizeAndTranscribe();
          }
        },
        { once: true }
      );
      recorder.start();
      segmentTimerRef.current = setTimeout(() => {
        if (recorderRef.current?.state === "recording") {
          recorderRef.current.stop();
        }
      }, SEGMENT_DURATION_MS);
    },
    [cleanupStream, finalizeAndTranscribe]
  );

  /**
   * Centralised stop logic so the timer's auto-stop, the user's manual stop,
   * and unmount cleanup all go through the same path. Setting
   * `continueRecordingRef.current = false` ensures the active segment's
   * onstop handler routes to finalise instead of recursing into a new
   * segment.
   */
  const internalStop = useCallback(() => {
    continueRecordingRef.current = false;
    clearSegmentTimer();
    stopTimer();
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      // The recorder's onstop handler will fire finalizeAndTranscribe.
    } else if (segmentsRef.current.length > 0) {
      // Recorder already inactive but we have segments — transcribe them.
      cleanupStream();
      void finalizeAndTranscribe();
    } else {
      cleanupStream();
    }
  }, [
    clearSegmentTimer,
    stopTimer,
    cleanupStream,
    finalizeAndTranscribe,
  ]);

  const start = useCallback(async () => {
    if (state === "recording" || state === "permission") return;
    setError(null);
    setTranscript(null);
    setDuration(0);
    segmentsRef.current = [];
    setState("permission");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      continueRecordingRef.current = true;
      startSegmentRecorder(stream);

      startMsRef.current = Date.now();
      tickRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startMsRef.current) / 1000);
        setDuration(secs);
        if (secs >= HARD_LIMIT_SECONDS) {
          // Auto-stop at hard limit. internalStop is idempotent.
          internalStop();
        }
      }, 250);
      setState("recording");
    } catch (e) {
      const msg = (e as Error).message ?? "Microphone access failed";
      setError(msg);
      setState("error");
      cleanupStream();
    }
  }, [state, startSegmentRecorder, internalStop, cleanupStream]);

  const stop = useCallback(async () => {
    if (state !== "recording") return;
    internalStop();
  }, [state, internalStop]);

  const reset = useCallback(() => {
    continueRecordingRef.current = false;
    clearSegmentTimer();
    stopTimer();
    cleanupStream();
    const r = recorderRef.current;
    if (r && r.state === "recording") {
      try {
        r.stop();
      } catch {
        // Intentionally swallowed (tech-debt F028 audited 2026-05-18):
        // MediaRecorder.stop() throws if already inactive due to a race
        // (e.g., reset() during a timer-driven auto-stop). Swallow safely;
        // the recorder is being torn down regardless.
      }
    }
    recorderRef.current = null;
    chunksRef.current = [];
    segmentsRef.current = [];
    setDuration(0);
    setTranscript(null);
    setError(null);
    setState("idle");
  }, [clearSegmentTimer, stopTimer, cleanupStream]);

  // Cleanup on unmount: stop tracks, kill timers, halt recorder.
  useEffect(() => {
    return () => {
      continueRecordingRef.current = false;
      clearSegmentTimer();
      stopTimer();
      cleanupStream();
      const r = recorderRef.current;
      if (r && r.state !== "inactive") {
        try {
          r.stop();
        } catch {
          // Intentionally swallowed (tech-debt F028 audited 2026-05-18):
          // unmount cleanup; component is going away, recorder state
          // doesn't matter past this point. Same race as the reset path.
        }
      }
    };
  }, [clearSegmentTimer, stopTimer, cleanupStream]);

  return {
    state,
    duration,
    durationDisplay: formatDuration(duration),
    approachingLimit: duration >= SOFT_LIMIT_SECONDS,
    transcript,
    error,
    start,
    stop,
    reset,
  };
}
