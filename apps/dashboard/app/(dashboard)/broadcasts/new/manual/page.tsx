import { ComposerCanvas } from "@/components/broadcast/composer-canvas";
import { getBroadcastDraftById } from "@/lib/data";
import { getVetProfileAction } from "../../actions";
import type { BroadcastDraft } from "../../draft-state";

export const dynamic = "force-dynamic";

/**
 * Manual broadcast composer (the existing form-first canvas).
 *
 * Reached via:
 *   - "Compose manually instead" link on the voice-first landing
 *     (/broadcasts/new) in v0.
 *   - `/broadcasts/new?draftId=…` is redirected here by the voice-first
 *     entry so resuming a saved draft always lands on the form, not the mic.
 *   - When BROADCAST_LANDING_MODE flips to "manual-first" post-demo,
 *     /broadcasts/new also redirects here for fresh composes.
 *
 * Two entry shapes (same as the voice-first → manual hand-off):
 *   - `/broadcasts/new/manual`              → blank composer (hydrates from
 *      localStorage if a draft is in flight — voice-first writes its
 *      structured output there before navigating here).
 *   - `/broadcasts/new/manual?draftId=…`    → loads the named DB draft.
 */
export default async function ManualNewBroadcastPage({
  searchParams,
}: {
  searchParams?: { draftId?: string };
}) {
  const vet = await getVetProfileAction();
  const rawDraft = searchParams?.draftId
    ? await getBroadcastDraftById(searchParams.draftId)
    : null;
  const initialDraft = rawDraft
    ? ((rawDraft as unknown) as BroadcastDraft)
    : null;
  return (
    <ComposerCanvas
      vetByline={vet.fullName}
      vetAvatarUrl={vet.avatarUrl}
      initialDraft={initialDraft}
    />
  );
}
