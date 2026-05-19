import { getInboxThreads } from "@/lib/data";
import { InboxClient } from "./inbox-client";

// v0 demo: always render fresh from DB. No Next.js fetch caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InboxPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string };
}) {
  const q = searchParams?.q?.trim();
  const status = searchParams?.status === "replied" ? "inactive" : "active";
  // Awaiting count is computed once in the dashboard layout for the rail
  // badge; the inbox tab no longer carries a count of its own (locked
  // 2026-05-16 to remove the triple-55 redundancy with the rail + awaiting
  // bar). Drop the second `getActiveThreadCount()` call here.
  const threads = await getInboxThreads(q, status);
  return (
    <InboxClient
      threads={threads}
      searchQuery={q}
      currentStatus={status}
    />
  );
}
