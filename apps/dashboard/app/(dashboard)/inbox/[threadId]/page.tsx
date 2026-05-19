import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

// v0 demo: always render fresh from DB. No Next.js fetch caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;

import {
  getPetByThread,
  getThreadBubbles,
  getSoapHistory,
  getInvoicesForPet,
  getThreadParentLanguage,
} from "@/lib/data";
import { FocusCard } from "@/components/inbox/focus-card";
import { Button } from "@/components/ui/button";
import { ComposeReply } from "./compose-reply";
import { markThreadReadAction } from "./actions";

/**
 * Inbox thread detail — single-thread focus mode (no queue progress bar).
 * App-bar shows "Back to list"; Send returns to the list rather than
 * advancing (that's `/inbox/queue`). SOAP / clinical / invoices render
 * inline in the FocusCard via the collapsible SoapContextStrip.
 */
export default async function ThreadDetailPage({
  params,
}: {
  params: { threadId: string };
}) {
  let pet, bubbles, soapHistory, invoices, parentLang;
  try {
    [pet, bubbles, parentLang] = await Promise.all([
      getPetByThread(params.threadId),
      getThreadBubbles(params.threadId),
      getThreadParentLanguage(params.threadId),
    ]);
    [soapHistory, invoices] = await Promise.all([
      getSoapHistory(pet.id),
      getInvoicesForPet(pet.id),
    ]);
  } catch (e) {
    notFound();
  }

  // Mark thread as read in the background.
  markThreadReadAction(params.threadId).catch(() => {});

  const latestVisit = soapHistory[0] ?? null;

  return (
    <div className="flex flex-col h-full">
      {/* App bar — single-thread mode: just "Back to list" (no queue progress).
          Transparent — body bg-rail-tint shows through to keep the chrome ground continuous. */}
      <div className="px-7 py-4 shrink-0">
        <Button asChild variant="ghost" size="sm" className="text-ink-70 hover:text-ink font-semibold gap-1.5">
          <Link href="/inbox">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
            Back to list
          </Link>
        </Button>
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
          threadId={params.threadId}
          hasInvoices={invoices.length > 0}
        >
          <ComposeReply
            threadId={params.threadId}
            parentLanguage={parentLang}
            mode="single"
          />
        </FocusCard>
      </div>
    </div>
  );
}
