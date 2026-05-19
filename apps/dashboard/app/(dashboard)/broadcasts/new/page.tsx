import { redirect } from "next/navigation";
import { BROADCAST_LANDING_MODE } from "@/lib/broadcast-mode";
import { VoiceFirstLanding } from "@/components/broadcast/voice-first-landing";

export const dynamic = "force-dynamic";

/**
 * /broadcasts/new — entry point for composing a new broadcast.
 *
 * Routing rules (locked 2026-05-18 per docs/decisions-log.md
 * "Broadcast voice-dump feature"):
 *
 *   - `?draftId=…` → always /broadcasts/new/manual?draftId=… (resuming a
 *      saved draft skips the mic; the draft already has content).
 *   - BROADCAST_LANDING_MODE === "voice-first" (v0 demo) → renders the
 *      mic-first <VoiceFirstLanding />. The "Compose manually" link in the
 *      page header drops to /broadcasts/new/manual.
 *   - BROADCAST_LANDING_MODE === "manual-first" (post-demo flip) → redirects
 *      to /broadcasts/new/manual. The single config constant in
 *      `lib/broadcast-mode.ts` flips the default; no route layout change.
 */
export default async function NewBroadcastPage({
  searchParams,
}: {
  searchParams?: { draftId?: string };
}) {
  if (searchParams?.draftId) {
    redirect(`/broadcasts/new/manual?draftId=${searchParams.draftId}`);
  }
  if (BROADCAST_LANDING_MODE === "manual-first") {
    redirect("/broadcasts/new/manual");
  }
  return <VoiceFirstLanding />;
}
