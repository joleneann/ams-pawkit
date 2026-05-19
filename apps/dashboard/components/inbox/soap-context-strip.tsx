"use client";

import Link from "next/link";
import { useState } from "react";
import { CaretDown as ChevronDown, CaretUp as ChevronUp } from "@phosphor-icons/react";
import type { SoapVisit } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Embedded SOAP context strip (inbox-v2 lock 2026-05-15, action order locked
 * 2026-05-15: Expand last visit → All visits → All Invoices).
 *
 * Anatomy per `claude design/README.md` State 02 → SOAP context strip:
 * - Collapsed (default): single row with LAST VISIT label + date + title +
 *   diagnosis fragment + three trailing actions in this order:
 *     1. "Expand last visit ▾" toggle pill (was named "SOAP"; renamed for
 *        intuitiveness per 2026-05-15 — vets aren't all fluent in the SOAP
 *        acronym and the pill IS the expander, so the label says so).
 *     2. "All visits ↗" link → /inbox/<threadId>/clinical
 *     3. "All Invoices ↗" link → /inbox/<threadId>/invoices (was "Invoices ↗"
 *        that jumped to /invoice/0, which hid every invoice except the
 *        most recent; now goes to a proper invoice list page).
 * - Expanded: dashed top border, embedded SOAP card showing the latest visit's
 *   Subjective / Objective / Assessment / Plan grid + "Open full clinical history"
 *
 * Click anywhere on the header (not on the inline links) to toggle.
 */
export function SoapContextStrip({
  petId,
  latestVisit,
  totalVisits,
  threadId,
  hasInvoices,
}: {
  petId: string;
  latestVisit: SoapVisit | null;
  totalVisits: number;
  threadId: string;
  hasInvoices: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!latestVisit) {
    return (
      <div className="bg-canvas border-b border-rule px-7 py-3 text-sm text-ink-50 italic">
        No clinical history on file yet.
      </div>
    );
  }

  return (
    <div className={cn("bg-canvas border-b border-rule", open && "")}>
      {/* Collapsed row */}
      <div
        className="grid items-center gap-3.5 px-7 py-3 cursor-pointer hover:bg-canvas-2 transition-colors"
        style={{ gridTemplateColumns: "auto 1fr auto auto auto" }}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <span
          className="text-xs text-ink-50 uppercase font-semibold tracking-[0.14em]"
        >
          Last visit
        </span>
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-ink-50 text-sm font-tnum whitespace-nowrap">
            {latestVisit.dateFull}
          </span>
          <span className="text-ink font-semibold text-sm truncate">
            {latestVisit.reason}
          </span>
          {latestVisit.a && (
            <span className="text-ink-70 text-sm truncate hidden md:inline">
              · {latestVisit.a}
            </span>
          )}
        </div>
        {/* Action order locked 2026-05-15: expand-last-visit pill FIRST
            (was third), then All visits, then All Invoices (was first, but
            jumped to the latest invoice only; now routes to the full
            invoices list). */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="rounded-full px-3 h-7 gap-1 text-xs font-semibold text-ink-70 hover:text-ink"
        >
          {open ? "Collapse last visit" : "Expand last visit"}
          {open ? (
            <ChevronUp className="w-3 h-3" strokeWidth={1.8} />
          ) : (
            <ChevronDown className="w-3 h-3" strokeWidth={1.8} />
          )}
        </Button>
        <Link
          href={`/inbox/${threadId}/clinical`}
          className="text-primary font-semibold text-xs hover:underline underline-offset-2 px-2 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          All visits ↗
        </Link>
        {hasInvoices && (
          <Link
            href={`/inbox/${threadId}/invoices`}
            className="text-primary font-semibold text-xs hover:underline underline-offset-2 px-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            All Invoices ↗
          </Link>
        )}
      </div>

      {/* Expanded SOAP card */}
      {open && (
        <div className="border-t border-dashed border-rule px-7 pt-1 pb-5">
          <div className="bg-canvas border border-rule rounded-xl px-6 py-5 mt-4">
            <header className="flex items-baseline justify-between gap-3 mb-4 pb-3 border-b border-rule">
              <div className="flex items-baseline gap-3">
                <h3 className="text-ink font-semibold text-base">
                  {latestVisit.reason}
                </h3>
                <span className="text-ink-50 text-xs font-tnum">
                  {latestVisit.dateFull} · {latestVisit.vetByline}
                </span>
              </div>
              <div className="flex gap-1.5">
                {/* Defensive: see clinical/page.tsx F-bug-fix 2026-05-18 v4. */}
                {(latestVisit.pills ?? []).map((p) => (
                  <Badge
                    key={p}
                    variant="secondary"
                    className="bg-canvas-2 border border-rule text-ink-70 uppercase tracking-wider text-xs"
                    style={{ letterSpacing: "0.04em" }}
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </header>
            <dl
              className="grid gap-y-2.5 gap-x-6"
              style={{ gridTemplateColumns: "110px 1fr" }}
            >
              <SoapRow label="Subjective" body={latestVisit.s ?? ""} />
              <SoapRow label="Objective" body={latestVisit.o ?? ""} />
              <SoapRow label="Assessment" body={latestVisit.a ?? ""} />
              <SoapRow label="Plan" body={latestVisit.p ?? ""} />
            </dl>
            <footer className="flex items-baseline justify-between mt-5 pt-4 border-t border-rule-soft">
              <Link
                href={`/inbox/${threadId}/clinical`}
                className="text-primary font-semibold text-sm hover:underline underline-offset-2"
              >
                Open full clinical history ({totalVisits} visit
                {totalVisits === 1 ? "" : "s"}) ↗
              </Link>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function SoapRow({ label, body }: { label: string; body: string }) {
  return (
    <>
      <dt
        className="text-xs text-ink-50 uppercase font-semibold tracking-[0.14em]"
      >
        {label}
      </dt>
      <dd className="text-ink text-sm leading-[1.55]">{body}</dd>
    </>
  );
}
