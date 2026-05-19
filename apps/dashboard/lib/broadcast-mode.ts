/**
 * Landing mode for /broadcasts/new (locked 2026-05-18 per
 * docs/decisions-log.md "Broadcast voice-dump feature" → Route structure).
 *
 * - "voice-first": v0 demo default. /broadcasts/new renders the mic-first
 *   landing; "Compose manually instead" link drops to /broadcasts/new/manual.
 * - "manual-first": post-demo flip. /broadcasts/new redirects to
 *   /broadcasts/new/manual; vets reach voice only via the per-field mic
 *   inside the composer. Saves the eager Sarvam Mayura translation cost
 *   on broadcasts the vet would have typed anyway.
 *
 * Resuming a saved draft (?draftId=...) always goes to the manual composer
 * regardless of mode — the draft already has content; voice landing would
 * be the wrong starting state.
 *
 * Flip with a single edit here. No route layout change needed.
 */
export const BROADCAST_LANDING_MODE: "voice-first" | "manual-first" =
  "voice-first";
