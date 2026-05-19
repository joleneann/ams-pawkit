"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  CaretDown as ChevronDown,
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  Check,
  WarningCircle as CircleAlert,
  Receipt,
} from "@phosphor-icons/react";
import type {
  BillingRow,
  BillingScope,
  BillingStats,
  BillingStatusFilter,
} from "@/lib/seed";
import { useLanguage } from "@/components/language-provider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MONTH_LABELS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_LABELS_MR = [
  "जाने", "फेब्रु", "मार्च", "एप्रिल", "मे", "जून",
  "जुलै", "ऑग", "सप्टें", "ऑक्टो", "नोव्हें", "डिसें",
];

/**
 * Billing landing client. Three stacked blocks:
 *  1. Month/range picker (lone page lead — no h1 per 2026-05-15 "no titles" rule)
 *  2. Three KPI cards (Billed / Collected / Outstanding warn variant)
 *  3. Ledger card (pill tabs + table + pagination foot)
 *
 * Scope picker is the master control: changing scope updates URL → server
 * re-fetches → KPIs + ledger render together. There is no way for them to
 * drift out of sync.
 */
export function BillingClient({
  scope,
  status,
  page,
  pageSize,
  currentYear,
  currentMonth,
  stats,
  rows,
  totalRows,
  tabCounts,
  searchQuery,
}: {
  scope: BillingScope;
  status: BillingStatusFilter;
  page: number;
  pageSize: number;
  currentYear: number;
  currentMonth: number;
  stats: BillingStats;
  rows: BillingRow[];
  totalRows: number;
  tabCounts: { all: number; unpaid: number; paid: number };
  searchQuery?: string;
}) {
  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      <MonthPicker
        scope={scope}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
      <KpiCards stats={stats} />
      {searchQuery && <SearchHint searchQuery={searchQuery} matchCount={tabCounts.all} />}
      <Ledger
        rows={rows}
        totalRows={totalRows}
        page={page}
        pageSize={pageSize}
        status={status}
        tabCounts={tabCounts}
        searchQuery={searchQuery}
      />
    </div>
  );
}

/**
 * Small inline hint that mirrors the pattern used by the inbox + broadcasts
 * list. Surfaces "5 invoices matching 'fernandes'" when search is active so
 * the user can read the filter back without scanning the URL bar.
 */
function SearchHint({ searchQuery, matchCount }: { searchQuery: string; matchCount: number }) {
  const { t } = useLanguage();
  if (matchCount === 0) {
    return (
      <div className="text-sm text-ink-70 font-medium">
        {t("billing.search.empty")} &ldquo;{searchQuery}&rdquo;.
      </div>
    );
  }
  const noun = matchCount === 1 ? t("billing.search.matchSingular") : t("billing.search.matchPlural");
  return (
    <div className="text-sm text-ink-70 font-medium">
      <span className="font-tnum">{matchCount}</span> {noun} &ldquo;{searchQuery}&rdquo;.
    </div>
  );
}

// =====================================================================
// Month / range picker
// =====================================================================
function MonthPicker({
  scope,
  currentYear,
  currentMonth,
}: {
  scope: BillingScope;
  currentYear: number;
  currentMonth: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { lang, t } = useLanguage();
  // Radix Popover handles outside-click + escape-to-close + focus management;
  // we only keep `open` state so navigate() can close the popover after a
  // scope change.
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    scope.kind === "this-month" ? scope.year : currentYear
  );
  // Custom range editor lives inside the popover. Toggled on by the "Custom"
  // preset chip; off by Back. When the page is already viewing a custom
  // scope, default to showing the editor when the popover opens.
  const [customMode, setCustomMode] = useState(scope.kind === "custom");
  const todayIso = new Date().toISOString().slice(0, 10);
  const defaultFrom = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  })();
  const [customFrom, setCustomFrom] = useState(
    scope.kind === "custom" ? scope.from : defaultFrom
  );
  const [customTo, setCustomTo] = useState(
    scope.kind === "custom" ? scope.to : todayIso
  );
  const customRangeValid = customFrom && customTo && customFrom <= customTo;

  const months = lang === "mr" ? MONTH_LABELS_MR : MONTH_LABELS_EN;

  // Label for the picker chip.
  const chipLabel = (() => {
    if (scope.kind === "all") return t("billing.picker.scope.allTime");
    if (scope.kind === "custom") return t("billing.picker.scope.custom");
    return `${months[scope.month]} ${scope.year}`;
  })();

  const navigate = (next: BillingScope) => {
    const p = new URLSearchParams(params?.toString() ?? "");
    // Reset page on scope change.
    p.delete("page");
    p.delete("from");
    p.delete("to");
    p.delete("range");
    p.delete("y");
    p.delete("m");
    if (next.kind === "all") {
      p.set("range", "all");
    } else if (next.kind === "custom") {
      p.set("range", "custom");
      p.set("from", next.from);
      p.set("to", next.to);
    } else {
      p.set("y", String(next.year));
      p.set("m", String(next.month));
    }
    const qs = p.toString();
    router.push(`/billing${qs ? `?${qs}` : ""}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="default"
          size="h44"
          className="rounded-full bg-primary text-primary-foreground hover:bg-berry-deep border-transparent gap-2.5 font-semibold text-md focus-visible:ring-berry-ring w-fit shadow-[0_1px_2px_rgba(15,12,10,0.06),_0_4px_14px_-6px_rgba(156,43,92,0.45)] hover:shadow-[0_1px_2px_rgba(15,12,10,0.08),_0_6px_18px_-6px_rgba(156,43,92,0.5)]"
        >
          <span className="font-medium text-primary-foreground/75">{t("billing.picker.prefix")}</span>
          <span className="font-bold tracking-tight">{chipLabel}</span>
          <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px]">
        {customMode ? (
          /* Custom range editor — two native date inputs + Apply. Replaces
             the month grid when active. Native `<input type="date">` gives
             us a calendar UI for free per browser; the shadcn Input wrapper
             handles the rest of the styling. */
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setCustomMode(false)}
                aria-label="Back to month picker"
                className="h-7 w-7 text-ink-70 hover:text-ink"
              >
                <ChevronLeft className="w-3 h-3" strokeWidth={2} />
              </Button>
              <span className="text-sm font-semibold text-ink">
                {t("billing.picker.scope.custom")}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xxs font-medium text-ink-50">
                  {t("billing.picker.range.from")}
                </span>
                <Input
                  type="date"
                  value={customFrom}
                  max={customTo || todayIso}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-8 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xxs font-medium text-ink-50">
                  {t("billing.picker.range.to")}
                </span>
                <Input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  max={todayIso}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-8 text-sm"
                />
              </label>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={!customRangeValid}
              onClick={() =>
                navigate({ kind: "custom", from: customFrom, to: customTo })
              }
              className="w-full"
            >
              {t("billing.picker.range.apply")}
            </Button>
          </div>
        ) : (
          <>
            {/* Year row */}
            <div className="flex items-center justify-between mb-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setViewYear((y) => y - 1)}
                disabled={viewYear <= currentYear - 4}
                aria-label="Previous year"
                className="h-7 w-7 rounded-md text-ink-70 hover:text-ink hover:border-ink"
              >
                <ChevronLeft className="w-3 h-3" strokeWidth={2} />
              </Button>
              <span className="font-semibold text-sm font-tnum text-ink">
                {viewYear}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setViewYear((y) => y + 1)}
                disabled={viewYear >= currentYear}
                aria-label="Next year"
                className="h-7 w-7 rounded-md text-ink-70 hover:text-ink hover:border-ink"
              >
                <ChevronRight className="w-3 h-3" strokeWidth={2} />
              </Button>
            </div>

            {/* Months grid */}
            <div className="grid grid-cols-4 gap-1">
              {months.map((m, idx) => {
                const isCurrent = viewYear === currentYear && idx === currentMonth;
                const isSelected =
                  scope.kind === "this-month" &&
                  scope.year === viewYear &&
                  scope.month === idx;
                const isFuture =
                  viewYear > currentYear ||
                  (viewYear === currentYear && idx > currentMonth);
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={isFuture}
                    onClick={() => navigate({ kind: "this-month", year: viewYear, month: idx })}
                    className={cn(
                      "h-8 rounded-md text-xs font-medium transition-colors",
                      isSelected
                        ? "bg-primary text-canvas font-semibold"
                        : isFuture
                          ? "text-ink-30 cursor-default"
                          : isCurrent
                            ? "text-berry-deep font-semibold hover:bg-canvas-2"
                            : "text-ink hover:bg-canvas-2"
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            {/* Range presets */}
            <div className="mt-3 pt-3 border-t border-rule flex flex-wrap gap-1.5">
              <PresetBtn
                label={t("billing.picker.preset.thisMonth")}
                active={
                  scope.kind === "this-month" &&
                  scope.year === currentYear &&
                  scope.month === currentMonth
                }
                onClick={() => navigate({ kind: "this-month", year: currentYear, month: currentMonth })}
              />
              <PresetBtn
                label={t("billing.picker.preset.custom")}
                active={scope.kind === "custom"}
                onClick={() => setCustomMode(true)}
              />
              <PresetBtn
                label={t("billing.picker.preset.allTime")}
                active={scope.kind === "all"}
                onClick={() => navigate({ kind: "all" })}
              />
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Range preset chip inside the month picker popover. Built on shadcn `Button`
 * with className overrides for the compact chip dimensions and the
 * active-state berry-soft pill. Hand-rolled in earlier passes; refactored to
 * the primitive 2026-05-15 final audit.
 */
function PresetBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-7 px-2.5 rounded-md text-xs font-medium",
        active
          ? "bg-berry-soft text-primary font-semibold hover:bg-berry-soft hover:text-primary"
          : "bg-canvas-2 text-ink-70 hover:bg-canvas-2 hover:text-ink"
      )}
    >
      {label}
    </Button>
  );
}

// =====================================================================
// KPI cards
// =====================================================================
function KpiCards({ stats }: { stats: BillingStats }) {
  const { t, lang } = useLanguage();
  const months = lang === "mr" ? MONTH_LABELS_MR : MONTH_LABELS_EN;

  const billedLabel = (() => {
    if (stats.scope.kind === "all") return t("billing.kpi.billed.allTime");
    if (stats.scope.kind === "custom") return t("billing.kpi.billed.custom");
    const now = new Date();
    if (
      stats.scope.year === now.getFullYear() &&
      stats.scope.month === now.getMonth()
    ) {
      return t("billing.kpi.billed.thisMonth");
    }
    return `${t("billing.kpi.billed.month")}${months[stats.scope.month]} ${stats.scope.year}`;
  })();

  const noOutstanding = stats.outstandingInr === 0;

  return (
    <div className="grid grid-cols-3 gap-3.5">
      <Kpi
        label={billedLabel}
        value={formatInr(stats.billedInr)}
        detail={`${stats.billedCount} ${stats.billedCount === 1 ? t("billing.kpi.invoice.singular") : t("billing.kpi.invoices")}`}
      />
      <Kpi
        label={t("billing.kpi.collected")}
        value={formatInr(stats.collectedInr)}
        detail={
          <>
            <b className="text-ink-70 font-semibold">
              {stats.paidCount} {t("billing.kpi.paid")}
            </b>
          </>
        }
      />
      <Kpi
        label={t("billing.kpi.outstanding")}
        value={formatInr(stats.outstandingInr)}
        detail={
          noOutstanding ? (
            t("billing.kpi.outstanding.empty")
          ) : (
            <>
              <b className="text-berry-deep font-semibold">
                {stats.unpaidCount} {t("billing.kpi.unpaid")}
              </b>
            </>
          )
        }
        variant={noOutstanding ? "default" : "warn"}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  detail,
  variant = "default",
}: {
  label: string;
  value: string;
  detail: React.ReactNode;
  variant?: "default" | "warn";
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 flex flex-col gap-1 border",
        variant === "warn"
          ? "bg-berry-soft border-berry-ring"
          : "bg-canvas border-rule"
      )}
    >
      <div
        className={cn(
          "text-sm font-medium uppercase",
          variant === "warn" ? "text-berry-deep" : "text-ink-50"
        )}
      >
        {label}
      </div>
      <div className="font-display text-xl font-bold font-tnum text-ink mt-0.5">
        {value}
      </div>
      <div
        className={cn(
          "text-sm font-medium mt-0.5",
          variant === "warn" ? "text-berry-deep" : "text-ink-50"
        )}
      >
        {detail}
      </div>
    </div>
  );
}

// =====================================================================
// Ledger
// =====================================================================
function Ledger({
  rows,
  totalRows,
  page,
  pageSize,
  status,
  tabCounts,
  searchQuery,
}: {
  rows: BillingRow[];
  totalRows: number;
  page: number;
  pageSize: number;
  status: BillingStatusFilter;
  tabCounts: { all: number; unpaid: number; paid: number };
  searchQuery?: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();

  const setStatus = (next: BillingStatusFilter) => {
    const p = new URLSearchParams(params?.toString() ?? "");
    p.delete("page");
    if (next === "all") p.delete("status");
    else p.set("status", next);
    const qs = p.toString();
    router.push(`/billing${qs ? `?${qs}` : ""}`);
  };

  const setPage = (next: number) => {
    const p = new URLSearchParams(params?.toString() ?? "");
    if (next <= 1) p.delete("page");
    else p.set("page", String(next));
    const qs = p.toString();
    router.push(`/billing${qs ? `?${qs}` : ""}`);
  };

  const fromRow = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const toRow = Math.min(page * pageSize, totalRows);
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  return (
    <div className="bg-canvas border border-rule rounded-2xl overflow-hidden">
      {/* Head: pill tabs only (h3 dropped; the active tab IS the section
          label, mirrors the no-titles rule applied across the workspace). */}
      <div className="px-5 py-3.5 border-b border-rule">
        <Tabs
          value={status}
          onValueChange={(v) => {
            if (v === "all" || v === "paid" || v === "unpaid") setStatus(v);
          }}
        >
          <TabsList
            aria-label="Invoice status filter"
            className="h-auto border-b-0 bg-canvas-2 rounded-full p-[3px] gap-[2px] inline-flex w-auto"
          >
            <BillingPillTab value="all" label={t("billing.ledger.tab.all")} count={tabCounts.all} active={status === "all"} />
            <BillingPillTab value="unpaid" label={t("billing.ledger.tab.unpaid")} count={tabCounts.unpaid} active={status === "unpaid"} />
            <BillingPillTab value="paid" label={t("billing.ledger.tab.paid")} count={tabCounts.paid} active={status === "paid"} />
          </TabsList>
        </Tabs>
      </div>

      {rows.length === 0 ? (
        // When the user is searching, the SearchHint above already announces the
        // zero-match state. Skip the empty hero so we don't double up.
        searchQuery ? null : <LedgerEmpty status={status} />
      ) : (
        <>
          {/* CSS Grid ledger. The parent defines 5 auto-sized tracks with
              `justify-content: space-between` so Invoice hugs the left edge,
              Amount hugs the right edge, and the three middle columns
              distribute the remaining width equally. Each row uses
              `grid-template-columns: subgrid` so its cells inherit the
              parent's column widths — columns line up vertically across
              every row without computing widths per-row. */}
          <div
            role="table"
            className="grid"
            style={{
              gridTemplateColumns: "auto auto auto auto auto",
              justifyContent: "space-between",
            }}
          >
            <div
              role="row"
              className="col-span-full grid bg-canvas-2 border-b border-rule"
              style={{ gridTemplateColumns: "subgrid" }}
            >
              <ColHeader className="px-5 py-2">{t("billing.ledger.col.invoice")}</ColHeader>
              <ColHeader className="px-5 py-2">{t("billing.ledger.col.petHousehold")}</ColHeader>
              <ColHeader className="px-5 py-2">{t("billing.ledger.col.issued")}</ColHeader>
              <ColHeader className="px-5 py-2">{t("billing.ledger.col.status")}</ColHeader>
              <ColHeader align="right" className="px-5 py-2">{t("billing.ledger.col.amount")}</ColHeader>
            </div>
            {rows.map((r) => (
              <LedgerRow key={r.id} row={r} />
            ))}
          </div>

          {/* Foot: count + pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-rule bg-canvas-2">
            <span className="text-sm text-ink-50 font-medium font-tnum">
              {t("billing.foot.showing")}{" "}
              <b className="text-ink-70 font-semibold">{fromRow}–{toRow}</b>{" "}
              {t("billing.foot.of")}{" "}
              <b className="text-ink-70 font-semibold">{totalRows}</b>{" "}
              {t("billing.foot.invoices")}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
                className="h-7 w-7 rounded-md bg-canvas text-ink-70 hover:text-ink hover:border-ink"
              >
                <ChevronLeft className="w-3 h-3" strokeWidth={2} />
              </Button>
              <span className="text-sm font-semibold font-tnum text-ink-70 px-2.5">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
                className="h-7 w-7 rounded-md bg-canvas text-ink-70 hover:text-ink hover:border-ink"
              >
                <ChevronRight className="w-3 h-3" strokeWidth={2} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ColHeader({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <div
      role="columnheader"
      className={cn(
        "text-sm font-medium uppercase text-ink-50 whitespace-nowrap",
        align === "right" ? "text-right" : "text-left",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Shadcn TabsTrigger-based pill tab for the billing ledger. Active state
 * is ink-fill (not berry) per the mockup — berry is reserved for the
 * unpaid status pill in the table body. The nested count chip flips from
 * `ink/[0.08]` (inactive) to `white/[0.18]` (active) so the count reads
 * as a sub-element inside the ink pill.
 */
function BillingPillTab({
  value,
  label,
  count,
  active,
}: {
  value: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "h-[30px] px-3 pl-3.5 rounded-full border-b-0 text-sm font-semibold leading-none -mb-0 transition-colors gap-1.5",
        "data-[state=active]:bg-ink data-[state=active]:text-canvas data-[state=active]:border-transparent",
        "data-[state=inactive]:text-ink-70"
      )}
    >
      {label}
      <span
        className={cn(
          "text-xs font-bold font-tnum rounded-full px-1.5 py-px min-w-[22px] text-center leading-none",
          active ? "bg-white/[0.18] text-canvas" : "bg-ink/[0.08] text-ink-70"
        )}
      >
        {count}
      </span>
    </TabsTrigger>
  );
}

function LedgerRow({ row }: { row: BillingRow }) {
  const cellLink = `/billing/${row.id}`;
  return (
    <div
      role="row"
      className="col-span-full grid items-center border-b border-rule-soft hover:bg-ink/[0.015] transition-colors"
      style={{ gridTemplateColumns: "subgrid" }}
    >
      <div role="cell" className="px-5 py-3">
        <Link
          href={cellLink}
          className="text-md font-semibold font-tnum text-ink"
        >
          {row.invoiceNumber}
        </Link>
      </div>
      <div role="cell" className="px-5 py-3">
        <Link href={cellLink} className="block leading-[1.3]">
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-serif italic font-semibold text-md text-ink"
              style={{ letterSpacing: "-0.005em" }}
            >
              {row.petName}
            </span>
            {row.petMeta && (
              <span className="text-sm font-medium text-ink-50">
                · {row.petMeta}
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-ink-50 mt-0.5">
            {row.household}
          </div>
        </Link>
      </div>
      <div role="cell" className="px-5 py-3">
        <Link href={cellLink} className="text-sm font-medium text-ink-70 font-tnum whitespace-nowrap">
          {row.issuedDate}
        </Link>
      </div>
      <div role="cell" className="px-5 py-3">
        <Link href={cellLink} className="inline-block">
          <StatusPill row={row} />
        </Link>
      </div>
      <div role="cell" className="px-5 py-3 text-right">
        <Link
          href={cellLink}
          className="text-md font-semibold font-tnum text-ink whitespace-nowrap"
        >
          {row.amountDisplay}
        </Link>
      </div>
    </div>
  );
}

/**
 * Status pill in the ledger row. Two-state machine only (paid / unpaid).
 * Built on shadcn `Badge` with override classes:
 *   - paid: canvas-2 bg + ink-70 text + check icon (neutral, in-flow)
 *   - unpaid: berry-soft bg + berry-deep text + circle-alert icon (soft urgency,
 *     quieter than the mockup's "overdue" berry-fill since Pawkit doesn't
 *     distinguish due / overdue)
 */
function StatusPill({ row }: { row: BillingRow }) {
  if (row.status === "paid") {
    return (
      <Badge
        variant="outline"
        className="bg-canvas-2 border-transparent text-ink-70 gap-1.5 font-semibold whitespace-nowrap"
      >
        <Check className="w-2.5 h-2.5" strokeWidth={2} />
        {row.statusLabel}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-berry-soft border-transparent text-berry-deep gap-1.5 font-semibold whitespace-nowrap"
    >
      <CircleAlert className="w-2.5 h-2.5" strokeWidth={2} />
      {row.statusLabel}
    </Badge>
  );
}

function LedgerEmpty({ status }: { status: BillingStatusFilter }) {
  const { t } = useLanguage();
  const headline =
    status === "unpaid"
      ? t("billing.empty.unpaidScope")
      : status === "paid"
        ? t("billing.empty.paidScope")
        : t("billing.empty.allScope");
  const sub =
    status === "unpaid"
      ? t("billing.empty.unpaidScope.sub")
      : status === "paid"
        ? t("billing.empty.paidScope.sub")
        : t("billing.empty.allScope.sub");

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20">
      <div className="w-16 h-16 rounded-full border-[1.5px] border-rule bg-canvas flex items-center justify-center">
        <Receipt className="w-7 h-7 text-ink-50" strokeWidth={1.5} />
      </div>
      <h2 className="font-serif italic font-semibold text-3xl text-ink text-center">
        {headline}
      </h2>
      <p className="text-sm font-medium text-ink-70 text-center max-w-[340px]">
        {sub}
      </p>
    </div>
  );
}

function formatInr(amount: number): string {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}
