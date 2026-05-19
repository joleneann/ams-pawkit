"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CaretLeft as ChevronLeft,
  Warning as AlertTriangle,
  Phone,
  Chat as MessageSquare,
  Bell,
  Link as LinkIcon,
  Users,
  Copy,
  CircleNotch as Loader2,
} from "@phosphor-icons/react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BroadcastDetail, BroadcastContent } from "@/lib/data";
import { duplicateBroadcastAsDraftAction } from "../actions";
import { resetBroadcastDraftStorage } from "../draft-state";

/**
 * Broadcast detail (sent) renderer. Read-only view of what was sent + who
 * got it + when. Bilingual switcher when MR content exists; otherwise
 * silently renders EN only.
 */
export function BroadcastDetailClient({ broadcast: b }: { broadcast: BroadcastDetail }) {
  const hasMr = !!b.mr && (b.mr.title.trim() !== "" || b.mr.body.trim() !== "");
  const [lang, setLang] = useState<"en" | "mr">("en");
  const content: BroadcastContent = lang === "mr" && b.mr ? b.mr : b.en;
  const router = useRouter();
  const [duplicating, startDuplicate] = useTransition();
  const [dupError, setDupError] = useState<string | null>(null);

  const audSpeciesLabel = (s: "dog" | "cat" | "both") =>
    s === "dog" ? "Dogs only" : s === "cat" ? "Cats only" : "Dogs and cats";

  /** Clone this sent broadcast into a fresh draft, then route the vet to
   *  the composer for the new draft. Implements the "reuse" path (locked
   *  2026-05-15 — sent comms are immutable, but cloning is the supported
   *  way to start from a previous broadcast as a template). */
  const handleDuplicate = () => {
    setDupError(null);
    startDuplicate(async () => {
      const res = await duplicateBroadcastAsDraftAction(b.id);
      if (!res.ok) {
        setDupError(res.error);
        return;
      }
      // Wipe localStorage so the composer hydrates from the freshly-cloned
      // DB draft, not whatever the browser was holding.
      resetBroadcastDraftStorage();
      router.push(`/broadcasts/new?draftId=${res.newDraftId}`);
    });
  };

  return (
    <div className="overflow-y-auto">
      <Link
        href="/broadcasts"
        className="px-8 pt-4 flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        Back to Broadcasts
      </Link>

      <div
        className="max-w-[1080px] mx-auto px-10 pt-6 pb-12 grid gap-9 items-start"
        style={{ gridTemplateColumns: "1fr 360px" }}
      >
        {/* Content column */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-ink text-lg font-semibold">
              {content.title || (
                <span className="text-ink-faint italic">—</span>
              )}
            </h1>
            {hasMr && (
              <ToggleGroup
                type="single"
                value={lang}
                onValueChange={(v) => {
                  if (v === "en" || v === "mr") setLang(v);
                }}
                aria-label="Broadcast language"
                className="shrink-0 ml-4"
              >
                <ToggleGroupItem value="en">English</ToggleGroupItem>
                <ToggleGroupItem value="mr">मराठी</ToggleGroupItem>
              </ToggleGroup>
            )}
          </div>

          <p className="text-sm text-ink-soft mb-7 flex items-center gap-3 font-tnum">
            <span>Sent {b.sentAt}</span>
            <span className="text-ink-faint">·</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3" strokeWidth={1.5} />
              {b.audienceCount} parents
            </span>
          </p>

          {/* Body sits before sections — sections are vet-ordered detail blocks
              that follow the opening paragraph. */}
          {content.body && (
            <section className="mb-7">
              <p className="text-base text-ink leading-[1.65]">{content.body}</p>
            </section>
          )}

          {/* Sections — iterate in the order the vet locked at compose time
              (sections v4 2026-05-15). Each section renders by type: warning
              gets the AlertTriangle + 1.5px ink frame; whenToCall gets the
              Phone icon; summary + custom use the calm canvas-2 treatment.
              Palette tokens only — semantic lives in icon + bold eyebrow,
              not red. */}
          {content.sections.map((section) => {
            const isCustom = section.type === "custom";
            const isHighlighted =
              section.type === "warning" || (isCustom && section.emphasis === "highlight");
            const Icon = isHighlighted
              ? AlertTriangle
              : section.type === "whenToCall"
                ? Phone
                : null;
            const renderAsParagraph = isCustom && section.format === "paragraph";
            const paragraphBody = renderAsParagraph ? (section.items[0] ?? "").trim() : "";
            const isLast = content.sections[content.sections.length - 1]?.id === section.id;
            return (
              <section
                key={section.id}
                className={isHighlighted
                  ? "mb-5 border-[1.5px] border-ink rounded-md px-5 py-4 bg-canvas-2"
                  : isLast
                    ? "mb-7 px-0 py-2"
                    : "mb-5 px-0 py-2"}
              >
                <div className="flex items-center gap-2 mb-2">
                  {Icon && <Icon className="w-3.5 h-3.5 text-ink" />}
                  <span className="text-xxs font-medium text-ink-soft">
                    {section.label}
                  </span>
                </div>
                {renderAsParagraph ? (
                  <p className="text-base text-ink leading-[1.6] whitespace-pre-wrap">
                    {paragraphBody}
                  </p>
                ) : (
                  <ul className="text-base text-ink leading-[1.6]">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-2 mb-1">
                        <span>·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}

          {/* Duplicate-as-draft CTA — locked under the body content
              2026-05-15 (was an obscure outline button in the header).
              Berry-filled primary so the affordance reads as the natural
              next step after reading the broadcast. */}
          <div className="mt-8 pt-6 border-t border-rule flex items-center gap-3">
            <Button
              type="button"
              onClick={handleDuplicate}
              disabled={duplicating}
              size="cta"
              title="Clone this broadcast into a new editable draft"
            >
              {duplicating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.7} />
              ) : (
                <Copy className="w-3.5 h-3.5" strokeWidth={1.7} />
              )}
              Duplicate as draft
            </Button>
            {dupError && (
              <span className="text-sm font-semibold text-ink bg-canvas-2 rounded px-2 py-1">
                {dupError}
              </span>
            )}
          </div>
        </div>

        {/* Side metadata — all three sidebar cards now share the same
            canvas + 1.5px ink-frame treatment 2026-05-15 (the "Sent to"
            card used to fill berry, which over-shouted in the sidebar
            against the other two muted cards). The hero count stays the
            visual anchor via its 30px tabular weight, not via colour. */}
        <aside className="flex flex-col gap-5 sticky top-5 self-start">
          <div
            className="bg-canvas border-[1.5px] border-ink/20 rounded-md"
            style={{ padding: "16px 20px" }}
          >
            <div className="text-xxs font-medium text-ink-faint mb-2">
              Sent to
            </div>
            <div className="font-display text-3xl font-bold text-ink tracking-tight font-tnum leading-none">
              {b.audienceCount} pets
            </div>
            {hasMr && (
              <div className="text-sm text-ink-soft mt-2 leading-snug">
                Sent bilingually, each parent reads in their preferred language.
              </div>
            )}
          </div>

          {b.audienceFilter && (
            <div
              className="bg-canvas border-[1.5px] border-ink/20 rounded-md"
              style={{ padding: "16px 20px" }}
            >
              <div className="text-xxs font-medium text-ink-faint mb-3">
                Audience filter
              </div>
              {b.audienceFilter.groupB && (
                <div className="text-xxs font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                  Group A
                </div>
              )}
              <FilterSummary group={b.audienceFilter.groupA} speciesLabel={audSpeciesLabel} />
              {b.audienceFilter.groupB && (
                <>
                  <div className="text-center py-2">
                    <Badge variant="secondary" className="text-xxs tracking-wider">
                      OR
                    </Badge>
                  </div>
                  <div className="text-xxs font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                    Group B
                  </div>
                  <FilterSummary group={b.audienceFilter.groupB} speciesLabel={audSpeciesLabel} />
                </>
              )}
            </div>
          )}

          <div
            className="bg-canvas border-[1.5px] border-ink/20 rounded-md"
            style={{ padding: "16px 20px" }}
          >
            <div className="text-xxs font-medium text-ink-faint mb-3">
              Delivery
            </div>
            <ChannelRow
              icon={<MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />}
              label="In-app Broadcasts tab"
            />
            <ChannelRow
              icon={<Bell className="w-3.5 h-3.5" strokeWidth={1.5} />}
              label="Push notification"
            />
            <ChannelRow
              icon={<LinkIcon className="w-3.5 h-3.5" strokeWidth={1.5} />}
              label="Public web page"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function FilterSummary({
  group,
  speciesLabel,
}: {
  group: { species: "dog" | "cat" | "both"; ageMin: number; ageMax: number; excludeDeceased: boolean };
  speciesLabel: (s: "dog" | "cat" | "both") => string;
}) {
  return (
    <>
      <Row prop="Species" value={speciesLabel(group.species)} />
      <Row prop="Age range" value={`${group.ageMin} to ${group.ageMax} years`} />
      <Row prop="Deceased pets" value={group.excludeDeceased ? "Excluded" : "Included"} last />
    </>
  );
}

function Row({ prop, value, last }: { prop: string; value: string; last?: boolean }) {
  return (
    <div
      className={
        "flex justify-between items-center py-2 text-sm " +
        (last ? "" : "border-b border-ink-faint")
      }
    >
      <span className="text-ink-soft">{prop}</span>
      <span className="text-ink font-semibold">{value}</span>
    </div>
  );
}

function ChannelRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 text-sm text-ink">
      <span className="text-ink shrink-0">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
