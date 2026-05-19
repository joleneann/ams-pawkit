"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Megaphone, BookOpen, Trash as Trash2, CircleNotch as Loader2 } from "@phosphor-icons/react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { deleteBroadcastDraftAction } from "./actions";
import { resetBroadcastDraftStorage } from "./draft-state";

type BroadcastKind = "announcement" | "educational";

type SentRow = {
  id: string;
  title: string;
  sentAt: string;
  audienceCount: number;
  kind: BroadcastKind;
};

type DraftRow = {
  id: string;
  title: string;
  updatedAt: string;
  audienceCount: number;
  kind: BroadcastKind;
};

/** Pick the row icon by kind: Megaphone for announcements (closures,
 *  schedule notes), BookOpen for educational broadcasts (health guides
 *  with sections/cover). Locked 2026-05-15 — kind is derived server-side
 *  from sections.length + cover_image_url presence, not stored as a
 *  column. */
function kindIcon(kind: BroadcastKind) {
  return kind === "educational" ? BookOpen : Megaphone;
}

/**
 * Broadcasts list (Sent / Drafts tab toggle locked 2026-05-15).
 *
 * Surface architecture: body is rail-tint ground; the broadcast row list
 * lifts off as a bg-canvas card with 1px rule border + 16px radius, same
 * treatment as the inbox awaiting list. Tabs use the same shadcn pill
 * pattern as the inbox (solid berry on active, ink-soft on inactive,
 * trailing count badge per tab — berry-deep on active, canvas-2 on
 * inactive).
 */
export function BroadcastsListClient({
  status,
  sent,
  drafts,
  sentCount,
  draftsCount,
  searchQuery,
}: {
  status: "sent" | "drafts";
  sent: SentRow[];
  drafts: DraftRow[];
  sentCount: number;
  draftsCount: number;
  searchQuery?: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();

  const visibleRows = status === "sent" ? sent : drafts;
  const matchingNoun =
    visibleRows.length === 1
      ? t("broadcasts.list.matchSingular")
      : t("broadcasts.list.matchPlural");

  const withStatus = (next: "sent" | "drafts") => {
    const p = new URLSearchParams(params?.toString() ?? "");
    if (next === "drafts") p.set("status", "drafts");
    else p.delete("status");
    const qs = p.toString();
    return `/broadcasts${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      {/* New broadcast CTA (LHS) + Sent / Drafts tab toggle (RHS) on one row.
          Placement flipped 2026-05-18 v3: primary action goes left so it's
          the first thing the eye hits; the status filter is secondary chrome
          and reads as a switcher on the right. */}
      <Tabs
        value={status}
        onValueChange={(v) => {
          if (v === "sent" || v === "drafts") router.push(withStatus(v));
        }}
        className="flex items-center justify-between"
      >
        <Button
          asChild
          size="h44"
          className="rounded-full text-md gap-2.5 shadow-[0_1px_2px_rgba(15,12,10,0.06),_0_4px_14px_-6px_rgba(156,43,92,0.45)] hover:shadow-[0_1px_2px_rgba(15,12,10,0.08),_0_6px_18px_-6px_rgba(156,43,92,0.5)]"
        >
          <Link
            href="/broadcasts/new"
            // Fresh-start semantic: this CTA means "I want a blank composer",
            // so wipe any localStorage draft before navigation.
            onClick={resetBroadcastDraftStorage}
          >
            <Plus className="w-4 h-4" strokeWidth={1.6} />
            {t("broadcasts.list.new")}
          </Link>
        </Button>
        <TabsList
          aria-label="Broadcast status filter"
          className="h-auto border-b-0 bg-canvas-2 rounded-full p-1 gap-0 justify-start items-center"
        >
          <TabsTrigger
            value="sent"
            className={cn(
              "py-1.5 px-4 rounded-full border-b-0 text-sm leading-none -mb-0 transition-colors gap-1.5",
              "data-[state=active]:bg-berry data-[state=active]:text-canvas data-[state=active]:font-semibold data-[state=active]:border-transparent",
              "data-[state=inactive]:text-ink-soft"
            )}
          >
            {t("broadcasts.list.tab.sent")}
            <span
              className={cn(
                "font-tnum text-xs font-semibold rounded-full px-1.5 py-0.5 leading-none",
                status === "sent"
                  ? "bg-berry-deep text-canvas"
                  : "bg-canvas-2 text-ink-soft"
              )}
            >
              {sentCount}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="drafts"
            className={cn(
              "py-1.5 px-4 rounded-full border-b-0 text-sm leading-none -mb-0 transition-colors gap-1.5",
              "data-[state=active]:bg-berry data-[state=active]:text-canvas data-[state=active]:font-semibold data-[state=active]:border-transparent",
              "data-[state=inactive]:text-ink-soft"
            )}
          >
            {t("broadcasts.list.tab.drafts")}
            <span
              className={cn(
                "font-tnum text-xs font-semibold rounded-full px-1.5 py-0.5 leading-none",
                status === "drafts"
                  ? "bg-berry-deep text-canvas"
                  : "bg-canvas-2 text-ink-soft"
              )}
            >
              {draftsCount}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {searchQuery && (
        <div className="text-sm text-ink-70">
          {visibleRows.length === 0
            ? `${t("broadcasts.list.searchEmpty")}`
            : `${visibleRows.length} ${matchingNoun} "${searchQuery}".`}
        </div>
      )}

      {visibleRows.length === 0 ? (
        <div className="h-[420px] bg-canvas border border-rule rounded-2xl flex flex-col items-center justify-center gap-3 px-6">
          <p className="text-ink-50 text-center text-base font-medium">
            {searchQuery ? (
              t("broadcasts.list.searchEmpty")
            ) : status === "drafts" ? (
              t("broadcasts.list.drafts.empty")
            ) : (
              <>
                {t("broadcasts.list.empty")} {t("broadcasts.list.emptyHint.tap")}{" "}
                <strong className="not-italic font-semibold text-ink">
                  {t("broadcasts.list.new")}
                </strong>{" "}
                {t("broadcasts.list.emptyHint.toStart")}
              </>
            )}
          </p>
        </div>
      ) : status === "sent" ? (
        <div className="bg-canvas border border-rule rounded-2xl overflow-hidden">
          <ul>
            {sent.map((b, i) => {
              const Icon = kindIcon(b.kind);
              return (
              <li key={b.id}>
                <Link
                  href={`/broadcasts/${b.id}`}
                  className={
                    "grid grid-cols-[36px_1fr_120px_140px] items-center gap-4 px-5 py-4 hover:bg-canvas-2 transition-colors " +
                    (i < sent.length - 1 ? "border-b border-rule" : "")
                  }
                  title={b.kind === "educational" ? "Educational broadcast" : "Announcement"}
                >
                  <div className="w-9 h-9 rounded-full bg-canvas-2 border border-rule flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-ink-50" strokeWidth={1.6} />
                  </div>
                  <span className="text-md font-semibold text-ink truncate">
                    {b.title}
                  </span>
                  <span className="text-sm text-ink-70 font-tnum text-right font-medium">
                    {b.audienceCount} {t("broadcasts.list.parents")}
                  </span>
                  <span className="text-sm text-ink-50 font-tnum text-right whitespace-nowrap">
                    {b.sentAt}
                  </span>
                </Link>
              </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="bg-canvas border border-rule rounded-2xl overflow-hidden">
          <ul>
            {drafts.map((b, i) => (
              <DraftRow
                key={b.id}
                draft={b}
                isLast={i === drafts.length - 1}
                parentsLabel={t("broadcasts.list.parents")}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Draft row — content wrapped in a Link, trash button overlays at the right.
// Trash button uses event.stopPropagation() so the click does not bubble to
// the row Link. Confirms via the browser's native confirm dialog (small v0
// affordance; we can swap for a shadcn AlertDialog later if needed).
// ============================================================================

function DraftRow({
  draft,
  isLast,
  parentsLabel,
}: {
  draft: {
    id: string;
    title: string;
    updatedAt: string;
    audienceCount: number;
    kind: BroadcastKind;
  };
  isLast: boolean;
  parentsLabel: string;
}) {
  const Icon = kindIcon(draft.kind);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(
      `Delete the draft \"${draft.title}\"? This cannot be undone.`
    );
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteBroadcastDraftAction(draft.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Server revalidates /broadcasts; the refresh re-fetches the drafts
      // list and the row disappears.
      router.refresh();
    });
  };

  return (
    <li className={cn("relative", !isLast && "border-b border-rule")}>
      <Link
        href={`/broadcasts/new?draftId=${draft.id}`}
        className="grid grid-cols-[36px_1fr_120px_160px_36px] items-center gap-4 px-5 py-4 hover:bg-canvas-2 transition-colors"
        title={draft.kind === "educational" ? "Educational broadcast draft" : "Announcement draft"}
      >
        <div className="w-9 h-9 rounded-full bg-canvas-2 border border-rule flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-ink-50" strokeWidth={1.6} />
        </div>
        <span className="text-md font-semibold text-ink truncate">
          {draft.title}
        </span>
        <span className="text-sm text-ink-70 font-tnum text-right font-medium">
          {draft.audienceCount > 0 ? `${draft.audienceCount} ${parentsLabel}` : "—"}
        </span>
        <span className="text-sm text-ink-50 font-tnum text-right whitespace-nowrap">
          Saved {draft.updatedAt}
        </span>
        {/* Trash placeholder in the grid so the row has a stable column for it. */}
        <span aria-hidden="true" />
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={pending}
        aria-label={`Delete draft \"${draft.title}\"`}
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md text-ink-faint hover:text-ink",
          pending && "cursor-wait"
        )}
      >
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.7} />
        ) : (
          <Trash2 className="w-4 h-4" strokeWidth={1.7} />
        )}
      </Button>
      {error && (
        <p className="absolute right-4 -bottom-0.5 text-xs font-semibold text-ink bg-canvas-2 rounded px-2 py-0.5">
          {error}
        </p>
      )}
    </li>
  );
}
