import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

// v0 demo: always render fresh from DB.
export const dynamic = "force-dynamic";
export const revalidate = 0;

import {
  getInboxThreads,
  getPetByThread,
  getThreadBubbles,
  getSoapHistory,
  getInvoicesForPet,
  getThreadParentLanguage,
} from "@/lib/data";
import { FocusCard } from "@/components/inbox/focus-card";
import { Button } from "@/components/ui/button";
import { ComposeReply } from "../[threadId]/compose-reply";
import { markThreadReadAction } from "../[threadId]/actions";

/**
 * Inbox reply queue (focus mode) (inbox-v2 lock 2026-05-15).
 *
 * Sequential thread processing. Renders the FocusCard for the
 * currently-active thread + a progress bar in the app bar ("1 of 4").
 *
 * Routing:
 * - `/inbox/queue` → loads the oldest-awaiting thread
 * - `/inbox/queue?thread=<id>` → loads that specific thread (used by the
 *   ComposeReply "Send & next" + "Skip" handlers to navigate)
 * - `/inbox/queue?thread=<id>&skipped=<id>` → skip pushes the skipped
 *   thread to the END of the queue ordering; v0 simulates this by
 *   filtering the skipped IDs out of the awaiting list (so they appear
 *   last in the natural oldest-first order). For deeper queue state
 *   (persistent skip across refreshes) we'd need a server-side queue
 *   table; v0 demo doesn't need that.
 *
 * Empty queue → redirect to /inbox (renders inbox zero).
 */
export default async function ReplyQueuePage({
  searchParams,
}: {
  searchParams?: { thread?: string; skipped?: string };
}) {
  // 1. Get all awaiting threads in oldest-first order.
  const allAwaiting = await getInboxThreads(undefined, "active");
  if (allAwaiting.length === 0) {
    redirect("/inbox");
  }

  // 2. Optionally filter out a skipped thread (move-to-end semantics in v0).
  const skipped = searchParams?.skipped;
  let queue = skipped
    ? allAwaiting.filter((t) => t.id !== skipped)
    : allAwaiting;
  if (skipped) {
    const skippedThread = allAwaiting.find((t) => t.id === skipped);
    if (skippedThread) queue = [...queue, skippedThread];
  }
  if (queue.length === 0) {
    redirect("/inbox");
  }

  // 3. Pick the current thread (explicit query param OR oldest).
  const requested = searchParams?.thread;
  const currentIdx = requested
    ? queue.findIndex((t) => t.id === requested)
    : 0;
  const safeIdx = currentIdx >= 0 ? currentIdx : 0;
  const currentThread = queue[safeIdx];
  if (!currentThread) {
    redirect("/inbox");
  }

  // 4. Fetch detail for the current thread.
  let pet, bubbles, soapHistory, invoices, parentLang;
  try {
    [pet, bubbles, parentLang] = await Promise.all([
      getPetByThread(currentThread.id),
      getThreadBubbles(currentThread.id),
      getThreadParentLanguage(currentThread.id),
    ]);
    [soapHistory, invoices] = await Promise.all([
      getSoapHistory(pet.id),
      getInvoicesForPet(pet.id),
    ]);
  } catch (e) {
    notFound();
  }

  // Mark read in the background.
  markThreadReadAction(currentThread.id).catch(() => {});

  const nextThread = queue[safeIdx + 1] ?? null;
  const total = queue.length;
  const indexLabel = safeIdx + 1;
  const progressPct = total > 0 ? (indexLabel / total) * 100 : 0;
  const latestVisit = soapHistory[0] ?? null;

  return (
    <div className="flex flex-col h-full">
      {/* App bar — queue mode: back button + "N of M" progress.
          Transparent — body bg-rail-tint shows through. */}
      <div className="flex items-center gap-4 px-7 py-4 shrink-0">
        <Button asChild variant="ghost" size="sm" className="text-ink-70 hover:text-ink font-semibold gap-1.5">
          <Link href="/inbox">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
            Back to list
          </Link>
        </Button>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-ink-70 text-sm font-medium">
            <span className="font-bold font-tnum text-ink">{indexLabel}</span>
            <span className="mx-1">of</span>
            <span className="font-bold font-tnum text-ink">{total}</span>
          </span>
          <div className="w-24 h-1.5 bg-canvas-2 border border-rule rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content area — focus card. flex-1 min-h-0 lets the card fill the
          remaining viewport so the composer pins to the bottom and the
          bubbles area becomes the scroll region. */}
      <div className="px-7 pb-7 flex-1 min-h-0">
        <FocusCard
          pet={pet}
          bubbles={bubbles}
          latestVisit={latestVisit}
          totalVisits={soapHistory.length}
          threadId={currentThread.id}
          hasInvoices={invoices.length > 0}
        >
          <ComposeReply
            threadId={currentThread.id}
            parentLanguage={parentLang}
            mode="queue"
            nextThreadId={nextThread?.id ?? null}
            queueIndex={indexLabel}
            queueTotal={total}
          />
        </FocusCard>
      </div>
    </div>
  );
}
