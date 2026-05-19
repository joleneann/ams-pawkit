"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";

/**
 * First-use coach mark for the broadcast voice-dump landing.
 *
 * Renders a paper-edge popover above the mic the FIRST time a vet visits
 * /broadcasts/new. Reassures them that messy speech, corrections, and
 * out-of-order delivery are all fine — counterintuitive for someone used
 * to dictation software that punishes mistakes.
 *
 * Once dismissed (via "Got it" or auto-dismiss on first recording start),
 * a localStorage flag suppresses it forever on that browser.
 *
 * Locked 2026-05-18 per docs/decisions-log.md "Broadcast voice-dump feature".
 */
const STORAGE_KEY = "pawkit_broadcast_voice_coachmark_dismissed";

export function VoiceDumpCoachmark({
  onDismiss,
}: {
  onDismiss?: () => void;
}) {
  // null = haven't hydrated yet (server) — render nothing on first paint to
  // avoid a flash before localStorage is read.
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const dismissed =
      typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_KEY) === "1";
    setVisible(!dismissed);
  }, []);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setVisible(false);
    onDismiss?.();
  };

  if (visible !== true) return null;

  return (
    <div
      role="dialog"
      aria-label="First-time tip for voice broadcast"
      className="absolute left-1/2 -translate-x-1/2 z-10 w-[380px] max-w-[calc(100vw-48px)] rounded-[14px] border border-berry/30 px-6 pt-5 pb-4 text-left text-ink"
      style={{
        bottom: "calc(100% + 36px)",
        background: "linear-gradient(180deg, #FFFFFF 0%, #FCFAF7 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 16px -4px rgba(156,43,92,0.12), 0 16px 36px -12px rgba(15,12,10,0.14)",
      }}
    >
      <div className="flex items-center gap-1.5 text-xxs font-semibold uppercase tracking-[0.14em] text-berry mb-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-berry" />
        First-time tip
      </div>
      <p className="text-base leading-[1.6] text-ink m-0">
        Don&apos;t worry about getting it perfect. Say something wrong? Just
        keep going. Pawkit organises it at the end.
      </p>
      <div className="flex items-center justify-end mt-3.5 pt-3 border-t border-rule-soft">
        <button
          type="button"
          onClick={handleDismiss}
          // tracking-[0.04em] is intentional here — this is a button label
          // ("Got it"), not an eyebrow. The CLAUDE.md "tracking-[0.14em]
          // everywhere" rule is scoped to eyebrow / small-caps labels;
          // 0.14em on a 6-char button reads as space-out gibberish.
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-berry-deep tracking-[0.04em] rounded-md hover:bg-berry-soft transition-colors"
        >
          Got it
          <ArrowRight className="w-3 h-3" strokeWidth={2} />
        </button>
      </div>
      {/* Tail/triangle pointing down to the mic */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45"
        style={{
          bottom: "-8px",
          background:
            "linear-gradient(135deg, transparent 50%, #FCFAF7 50%)",
          borderRight: "1px solid rgba(156, 43, 92, 0.30)",
          borderBottom: "1px solid rgba(156, 43, 92, 0.30)",
        }}
      />
    </div>
  );
}

/** Programmatically mark the coach-mark as dismissed (used when the vet
 *  starts recording without explicitly tapping "Got it"). */
export function markVoiceDumpCoachmarkDismissed() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, "1");
  }
}
