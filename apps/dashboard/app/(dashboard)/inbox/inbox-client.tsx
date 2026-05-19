"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "@phosphor-icons/react";
import type { InboxThread } from "@/lib/seed";
import { PetAvatar } from "@/components/ui/pet-avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/components/language-provider";
import { usePollRefresh } from "@/components/hooks/use-poll-refresh";
import { cn } from "@/lib/utils";

/**
 * Inbox list (inbox-v2 lock 2026-05-15).
 *
 * Three states render here based on threads + currentStatus:
 *   1. Awaiting list  — currentStatus=active, threads.length > 0
 *      → CTA-dominant header (Start reply queue + pulse + tabs) + rows
 *   2. Replied list   — currentStatus=inactive
 *      → CTA-dominant header (no pulse) + rows with "You:" prefix
 *   3. Inbox zero     — currentStatus=active, threads.length === 0
 *      → centered check-icon + "Inbox zero." + chai copy
 *
 * Header redesigned 2026-05-18 v3 per `mockups/inbox-header-redesign.html`
 * Option C: single row with CTA on LHS dominating tabs on RHS. The
 * "X parents are waiting on you" copy + the separate berry-soft awaiting
 * bar were removed — the rail badge owns that count globally.
 *
 * Anatomy lives in `claude design/README.md` States 01 / 03 / 04. The 468px
 * right pet panel was dropped 2026-05-15; the focus card on /inbox/[id] +
 * /inbox/queue now contains the embedded SOAP context strip instead.
 *
 * Fur rings on the pet avatars are KEPT (overriding the handoff's "neutral
 * monogram" rule per Pawkit brand discipline). Real Pexels photos render
 * inside the fur-tone ring for all 55 seeded demo pets (5 Fernandes anchor +
 * 50 inbox-expansion seed delivered 2026-05-15).
 *
 * Preview-weight bifurcation was removed 2026-05-15 — the per-row read/unread
 * weight created visual chop instead of signal and leaked demo-test artifacts
 * when `read_at` happened to be set on some threads but not others. The
 * awaiting-bar count + per-row wait duration already carry the urgency
 * signal; preview text is uniform weight per status (active = text-ink,
 * replied = text-ink-70).
 */
export function InboxClient({
  threads,
  searchQuery,
  currentStatus,
}: {
  threads: InboxThread[];
  searchQuery?: string;
  currentStatus: "active" | "inactive";
}) {
  usePollRefresh(5000);
  const isAwaiting = currentStatus === "active";
  const isReplied = currentStatus === "inactive";
  const showZero = isAwaiting && threads.length === 0 && !searchQuery;

  if (showZero) {
    return <InboxZero />;
  }

  // Pulse fires when there's awaiting work to do. Inline placement (left of
  // text, where an icon would sit) so it reads as a proper status indicator,
  // not a stuck-on corner badge. Button anatomy (height/padding/fill/radius)
  // matches its peers; only the natural width is ~16px larger because of the
  // extra inline element — text-length variance between the three CTAs is
  // already larger than that. Locked 2026-05-18 v6.
  const hasLiveWork = isAwaiting && threads.length > 0;

  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      {/* Inbox header — CTA-dominant, no count copy (rail badge owns it).
          Locked 2026-05-18 v6 (pulse re-added inline). All three LHS CTAs
          rounded-full per the locked dashboard CTA shape (billing month-
          picker style). */}
      <div className="flex items-center justify-between gap-4">
        <Button
          asChild
          size="h44"
          className="rounded-full text-md gap-2.5 shadow-[0_1px_2px_rgba(15,12,10,0.06),_0_4px_14px_-6px_rgba(156,43,92,0.45)] hover:shadow-[0_1px_2px_rgba(15,12,10,0.08),_0_6px_18px_-6px_rgba(156,43,92,0.5)]"
        >
          <Link href="/inbox/queue">
            {hasLiveWork && (
              <span
                aria-hidden="true"
                className="inline-block w-2 h-2 rounded-full bg-white animate-pawkit-pulse"
              />
            )}
            Start reply queue
            <ArrowRight className="w-4 h-4" weight="bold" />
          </Link>
        </Button>
        <InboxTabs currentStatus={currentStatus} />
      </div>

      {searchQuery && (
        <div className="text-sm text-ink-70">
          {threads.length === 0
            ? `No threads match "${searchQuery}".`
            : `${threads.length} thread${threads.length === 1 ? "" : "s"} matching "${searchQuery}".`}
        </div>
      )}

      {threads.length > 0 && (
        <div
          className="bg-canvas border border-rule rounded-2xl overflow-hidden grid gap-x-6"
          style={{
            gridTemplateColumns: "14px 56px auto minmax(0,1fr) auto",
          }}
        >
          {threads.map((thread, i) => (
            <InboxRow
              key={thread.id}
              thread={thread}
              isOldestAwaiting={isAwaiting && i === 0}
              isReplied={isReplied}
              isLast={i === threads.length - 1}
            />
          ))}
        </div>
      )}

      {isReplied && threads.length > 0 && (
        <RepliedFoot total={threads.length} />
      )}
    </div>
  );
}

/**
 * Inbox tabs (Awaiting reply / Replied).
 *
 * Pill-pair segmented control. Active = solid berry fill, white text,
 * font-semibold. Inactive = transparent inside the canvas-2 container, ink-soft
 * text. Container is a canvas-2 wash with rounded-full to frame the pair.
 *
 * Count badge removed 2026-05-16. The awaiting count is already carried
 * loudly by the awaiting bar below (berry-deep 17px) and by the rail badge
 * globally; surfacing it a third time inside the active tab was triple-
 * redundancy on a single screen. Tabs are now pure segment labels.
 *
 * Override the shared shadcn Tabs primitive's underline base styling
 * (border-b-0, -mb-0, leading-none) so the pill anatomy sits on top.
 * Pet-panel tabs (Clinical / Invoices) keep the underline since the
 * underline reads correctly as section nav there.
 *
 * onValueChange → router.push so the URL stays authoritative and the
 * server-side filter re-runs on click.
 */
function InboxTabs({
  currentStatus,
}: {
  currentStatus: "active" | "inactive";
}) {
  const { t } = useLanguage();
  const params = useSearchParams();
  const router = useRouter();
  const withStatus = (status: "active" | "replied") => {
    const p = new URLSearchParams(params?.toString() ?? "");
    if (status === "replied") p.set("status", "replied");
    else p.delete("status");
    const qs = p.toString();
    return `/inbox${qs ? `?${qs}` : ""}`;
  };
  const value = currentStatus === "active" ? "active" : "replied";

  // Tab anatomy matches the broadcasts list (Sent / Drafts) — locked
  // dashboard filter-tab size. Earlier 2026-05-18 v3 attempt shrunk these
  // to text-xs for "ambient chrome" but that broke parity with broadcasts.
  // CTA dominance comes from the h44 button + shadow + text-md on the LHS,
  // not from shrinking the tabs.
  const listOverride =
    "h-auto border-b-0 bg-canvas-2 rounded-full p-1 gap-0 justify-start items-center";
  const triggerOverride =
    "py-1.5 px-4 rounded-full border-b-0 text-sm leading-none -mb-0 transition-colors " +
    "data-[state=active]:bg-berry data-[state=active]:text-canvas data-[state=active]:font-semibold data-[state=active]:border-transparent " +
    "data-[state=inactive]:text-ink-soft";

  return (
    <Tabs
      value={value}
      onValueChange={(v) => {
        if (v === "active") router.push(withStatus("active"));
        else if (v === "replied") router.push(withStatus("replied"));
      }}
    >
      <TabsList aria-label="Inbox status filter" className={listOverride}>
        <TabsTrigger value="active" className={triggerOverride}>
          {t("inbox.subtab.active")}
        </TabsTrigger>
        <TabsTrigger value="replied" className={triggerOverride}>
          {t("inbox.subtab.inactive")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

// AwaitingBar removed 2026-05-18 v3. The "X parents are waiting on you" copy
// was triple-redundant with the rail badge + the in-tab count (when it
// existed). The new inbox header (above) merges the Start reply queue CTA
// and the filter tabs into a single CTA-dominant row, with a pulsing white
// dot inside the CTA carrying the "live work" signal in place of the count
// copy. See `mockups/inbox-header-redesign.html` Option C and
// `docs/decisions-log.md` "Inbox header CTA-dominant rebuild" for the lock.

function InboxRow({
  thread,
  isOldestAwaiting,
  isReplied,
  isLast,
}: {
  thread: InboxThread;
  isOldestAwaiting: boolean;
  isReplied: boolean;
  isLast: boolean;
}) {
  const { t } = useLanguage();
  const householdLabel = `${thread.pet.household} ${t("inbox.household.suffix")}`;
  const preview = thread.previewFromVet
    ? `${t("inbox.you.prefix")} ${thread.preview}`
    : thread.preview;

  // Preview-weight discipline (2026-05-15 fix): every row in the Awaiting
  // tab is by definition awaiting a reply, so a per-row read/unread weight
  // bifurcation creates visual chop instead of a real signal (and was
  // leaking demo-test artifacts when `read_at` happened to be set on some
  // threads but not others). Uniform weight: text-ink font-medium for active
  // rows, text-ink-70 for replied rows. The unread-dot column is preserved
  // for layout alignment but always renders transparent.
  return (
    <Link
      href={`/inbox/${thread.id}`}
      className={cn(
        "col-span-full grid items-center gap-6 px-5 py-2.5 transition-colors hover:bg-canvas-2",
        !isLast && "border-b border-rule"
      )}
      style={{ gridTemplateColumns: "subgrid" }}
    >
      {/* Column 1 spacer — kept so the avatar column lines up with the
          awaiting-bar gutter above. */}
      <div aria-hidden="true" />

      {/* Pet avatar — vertically centered via items-center on the row. */}
      <PetAvatar
        size="lg"
        furTone={thread.pet.furTone}
        photoUrl={thread.pet.photoUrl}
        alt={`${thread.pet.name}, ${householdLabel}`}
      />

      {/* Pet stack — name + breed/sex/age on top row, household below. */}
      <div className="flex flex-col gap-[3px] min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-serif text-lg font-semibold leading-[1.15] text-ink">
            {thread.pet.name}
          </span>
          <span className="text-ink-50 font-medium text-xs">
            {thread.pet.breed} · {thread.pet.sex} · {thread.pet.ageDisplay}
          </span>
        </div>
        <span className="text-ink-70 text-xs font-medium">{householdLabel}</span>
      </div>

      {/* Message content — middle column, takes remaining width.
          font-semibold (not font-medium) because Noto Sans Devanagari at
          500 reads visually lighter than Inter at 500; bumping to 600 makes
          mixed-language previews look uniformly weighted. */}
      <p
        className={cn(
          "text-sm leading-[1.45] overflow-hidden font-semibold min-w-0",
          isReplied ? "text-ink-70" : "text-ink"
        )}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: isReplied ? 1 : 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {isReplied && thread.previewFromVet ? (
          <>
            <strong className="text-ink font-semibold">{t("inbox.you.prefix")}</strong>{" "}
            {thread.preview}
          </>
        ) : (
          preview
        )}
      </p>

      {/* Meta column — wait-duration only. The case chip was removed
          2026-05-15 evening: it duplicated info the vet sees one click in,
          can't be acted on from the list, and bloated the row. */}
      <div className="text-right">
        {isReplied ? (
          <span className="text-ink-50 text-xs font-medium font-tnum">
            {thread.timestamp}
          </span>
        ) : (
          <span
            className={cn(
              "text-xs font-semibold font-tnum",
              isOldestAwaiting ? "text-primary" : "text-ink-70"
            )}
          >
            {thread.waitDuration ?? thread.timestamp}
          </span>
        )}
      </div>
    </Link>
  );
}

function RepliedFoot({ total }: { total: number }) {
  return (
    <div className="border-t border-rule pt-4 text-sm text-ink-50 font-medium flex items-center justify-between">
      <span>Showing {total} recent replies</span>
      <Button variant="link" size="sm" className="text-primary font-semibold px-0">
        Load older →
      </Button>
    </div>
  );
}

/**
 * Inbox zero state. Centered vertically + horizontally inside the content
 * area. Heading is sans-serif semibold — Lora italic is reserved for
 * pet-name hero contexts (per `docs/brand-system.md`), and "Inbox zero." is
 * not a pet name.
 */
function InboxZero() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-3 px-6 py-20">
      <div className="w-14 h-14 rounded-full border-[1.5px] border-ink bg-canvas flex items-center justify-center">
        <Check className="w-6 h-6 text-ink" strokeWidth={1.5} />
      </div>
      <h2 className="text-ink text-center text-lg font-semibold">
        Inbox zero.
      </h2>
      <p className="text-ink-70 text-center text-sm font-medium leading-[1.5] max-w-[340px]">
        Every parent has heard back from you. Go grab a chai.
      </p>
    </div>
  );
}
