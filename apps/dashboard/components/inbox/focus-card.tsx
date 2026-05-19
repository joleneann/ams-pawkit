import Link from "next/link";
import { User as UserRound } from "@phosphor-icons/react/dist/ssr";
import type { Pet, Bubble, SoapVisit } from "@/lib/seed";
import { PetAvatar } from "@/components/ui/pet-avatar";
import { Button } from "@/components/ui/button";
import { SoapContextStrip } from "./soap-context-strip";

/**
 * Inbox focus card — centerpiece of `/inbox/[threadId]` and `/inbox/queue`.
 * Header, SOAP context, conversation, and a composer-slot all stack in one
 * card. The composer itself renders via the `children` prop because queue
 * mode and single-thread mode need different action buttons ("Send & next →"
 * vs "Send").
 *
 * Anatomy: 72×72 fur ring + photo, Lora italic pet name, bio line,
 * "Open pet profile" icon button, collapsible SOAP context strip, then
 * the thread bubbles (vet berry / parent canvas-2).
 */
export function FocusCard({
  pet,
  bubbles,
  latestVisit,
  totalVisits,
  threadId,
  hasInvoices,
  children,
}: {
  pet: Pet;
  bubbles: Bubble[];
  latestVisit: SoapVisit | null;
  totalVisits: number;
  threadId: string;
  hasInvoices: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="bg-canvas border border-rule rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Pet header */}
      <header
        className="grid items-center gap-5 px-7 py-5 border-b border-rule shrink-0"
        style={{ gridTemplateColumns: "auto 1fr auto" }}
      >
        <PetAvatar
          furTone={pet.furTone}
          photoUrl={pet.photoUrl}
          size="lg"
          alt={pet.name}
        />
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1
            className="font-serif text-3xl font-semibold leading-none text-ink"
            style={{ letterSpacing: "-0.005em" }}
          >
            {pet.name}
          </h1>
          <p className="text-base text-ink-70 font-medium">
            <span>{pet.breed}</span>
            <RuleDot />
            <span>{pet.sex === "F" ? "F" : "M"}</span>
            <RuleDot />
            <span>{pet.ageDisplay}</span>
            {pet.weightDisplay && (
              <>
                <RuleDot />
                <span className="font-tnum">{pet.weightDisplay}</span>
              </>
            )}
            <RuleDot />
            <strong className="text-ink font-semibold">
              {pet.household} household
            </strong>
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-[10px]"
          aria-label="Open pet profile"
        >
          <Link href={`/inbox/${threadId}/clinical`}>
            <UserRound className="w-4 h-4 text-ink-70" strokeWidth={1.6} />
          </Link>
        </Button>
      </header>

      {/* SOAP context strip (collapsible) */}
      <SoapContextStrip
        petId={pet.id}
        latestVisit={latestVisit}
        totalVisits={totalVisits}
        threadId={threadId}
        hasInvoices={hasInvoices}
      />

      {/* Thread bubbles — flex-1 min-h-0 + overflow-y-auto makes this the
          scroll region so the composer below stays pinned to the card foot
          at any viewport height. */}
      <div className="bg-canvas px-7 py-5 flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
        {bubbles.length === 0 ? (
          <p className="text-sm text-ink-50 italic mt-2">No messages yet.</p>
        ) : (
          bubbles.map((b, i) => {
            const prevSameSide = i > 0 && bubbles[i - 1]?.side === b.side;
            return (
              <div
                key={i}
                className={
                  "flex " + (b.side === "parent" ? "justify-start" : "justify-end")
                }
                style={prevSameSide ? { marginTop: -4 } : undefined}
              >
                <div
                  className={
                    "max-w-[64%] flex flex-col gap-1 " +
                    (b.side === "parent" ? "items-start" : "items-end")
                  }
                >
                  <div
                    className={
                      "text-md px-4 py-3 leading-[1.5] rounded-2xl " +
                      (b.side === "parent"
                        ? "bg-canvas-2 border border-rule text-ink rounded-bl-[4px]"
                        : "bg-primary text-primary-foreground rounded-br-[4px]")
                    }
                  >
                    {renderBubbleBody(b)}
                  </div>
                  <div
                    className={
                      "text-xs font-tnum px-1.5 " +
                      (b.side === "vet"
                        ? "text-ink-50"
                        : "text-ink-50")
                    }
                  >
                    {b.side === "vet" ? "Dr Sagar · " : ""}
                    {b.date}, {b.time}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer slot — consumer renders different actions for queue vs single-thread */}
      {children}
    </article>
  );
}

function RuleDot() {
  return <span className="text-rule mx-2">·</span>;
}

function renderBubbleBody(b: Bubble): React.ReactNode {
  if (b.attachmentUrl) {
    if (b.attachmentType === "image") {
      return (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.attachmentUrl}
            alt="attachment"
            className="rounded-lg max-w-full max-h-[320px] object-cover"
          />
          {b.body && <p>{b.body}</p>}
        </div>
      );
    }
    if (b.attachmentType === "video") {
      return (
        <div className="flex flex-col gap-2">
          <video
            src={b.attachmentUrl}
            controls
            className="rounded-lg max-w-full max-h-[320px]"
          />
          {b.body && <p>{b.body}</p>}
        </div>
      );
    }
  }
  return b.body;
}
