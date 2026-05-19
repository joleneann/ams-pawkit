import { getDraftBroadcasts, getSentBroadcasts } from "@/lib/data";
import { BroadcastsListClient } from "./broadcasts-list-client";

// v0 demo: always render fresh from DB.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BroadcastsPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string };
}) {
  const q = searchParams?.q?.trim();
  const status = searchParams?.status === "drafts" ? "drafts" : "sent";
  const sent = status === "sent" ? await getSentBroadcasts(q) : [];
  const drafts = status === "drafts" ? await getDraftBroadcasts(q) : [];
  // Counts for the tab badges always reflect the full sets (so the vet sees
  // "3 drafts" even when on the Sent tab).
  const [allSent, allDrafts] = await Promise.all([
    getSentBroadcasts(),
    getDraftBroadcasts(),
  ]);
  return (
    <BroadcastsListClient
      status={status}
      sent={sent}
      drafts={drafts}
      sentCount={allSent.length}
      draftsCount={allDrafts.length}
      searchQuery={q}
    />
  );
}
