import { getBillingLedger, getBillingStats } from "@/lib/data";
import type { BillingScope, BillingStatusFilter } from "@/lib/seed";
import { BillingClient } from "./billing-client";

// v0 demo: always render fresh from DB so a Mark-paid action shows up in the
// list + KPIs immediately on revalidatePath.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 6;

/**
 * Billing landing screen (Screen 08, locked 2026-05-15).
 *
 * The clinic's invoice ledger — a single scannable view of every invoice with
 * KPI cards (Billed / Collected / Outstanding) summed across the active scope.
 * Scope picker is the master control; KPIs + ledger always agree on what
 * scope they represent. See `claude design/billing build/README.md` for spec.
 *
 * Two-state status machine: `paid` / `unpaid`. No drafts, no due/overdue
 * distinction (would confuse the demo per 2026-05-15 lock). Mark-paid lives
 * on the detail route, not inline on rows.
 *
 * URL params (all optional):
 *   - `y` + `m`         → "this-month" scope (year + 0-indexed month)
 *   - `range=all`       → "all time"
 *   - `range=custom`    → "custom" with `from` + `to` (UI deferred to v0.1)
 *   - `status=paid|unpaid|all`
 *   - `page=N`
 */
export default async function BillingPage({
  searchParams,
}: {
  searchParams?: {
    y?: string;
    m?: string;
    range?: string;
    from?: string;
    to?: string;
    status?: string;
    page?: string;
    q?: string;
  };
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Resolve scope from URL.
  let scope: BillingScope;
  if (searchParams?.range === "all") {
    scope = { kind: "all" };
  } else if (searchParams?.range === "custom" && searchParams.from && searchParams.to) {
    scope = { kind: "custom", from: searchParams.from, to: searchParams.to };
  } else {
    const y = searchParams?.y ? parseInt(searchParams.y, 10) : currentYear;
    const m = searchParams?.m ? parseInt(searchParams.m, 10) : currentMonth;
    scope = {
      kind: "this-month",
      year: Number.isFinite(y) ? y : currentYear,
      month: Number.isFinite(m) ? m : currentMonth,
    };
  }

  const status: BillingStatusFilter =
    searchParams?.status === "paid"
      ? "paid"
      : searchParams?.status === "unpaid"
        ? "unpaid"
        : "all";

  const page = (() => {
    const p = parseInt(searchParams?.page ?? "1", 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  })();

  const q = searchParams?.q?.trim() || undefined;

  const [stats, ledger] = await Promise.all([
    // KPI cards always reflect the scope (independent of search/status filter)
    // so Sagar gets a stable picture of the period's totals while drilling in.
    getBillingStats(scope),
    getBillingLedger(scope, status, page, PAGE_SIZE, q),
  ]);

  return (
    <BillingClient
      scope={scope}
      status={status}
      page={page}
      pageSize={PAGE_SIZE}
      currentYear={currentYear}
      currentMonth={currentMonth}
      stats={stats}
      rows={ledger.rows}
      totalRows={ledger.total}
      tabCounts={ledger.tabCounts}
      searchQuery={q}
    />
  );
}
