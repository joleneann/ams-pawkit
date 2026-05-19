# Handoff: Pawkit Billing

## Overview

**Billing** is the third top-level workspace in **Pawkit** (alongside Inbox and Broadcasts). It is the clinic's invoice ledger — a single scannable view of every invoice the clinic has issued, scoped to a chosen month (or range), with KPI cards summarising billed / collected / outstanding for that scope.

The vet uses this screen to:
- See at-a-glance how the clinic did this month (billed, collected, outstanding)
- Spot overdue invoices that need follow-up
- Filter the ledger to a single household or pet to answer "what does this household owe us?"

This handoff covers a **single screen** — the Billing landing view. The **new-invoice flow** and the **per-invoice detail / payment view** are out of scope and have not been designed.

## About the Design Files

The HTML file in this bundle (`Billing.html`) is a **design reference** — a static prototype showing intended look, layout, and interactions. It is **not production code to copy directly**.

Your task is to recreate this design **in the existing Pawkit codebase**, using its established framework, component library, design tokens, and patterns. If no codebase exists yet, choose a stack that fits the project (most likely **React + lucide-react + a CSS-in-JS or Tailwind setup**) and implement there.

The prototype uses hand-written CSS and raw inline `<svg>` tags to keep it self-contained. In production, every icon should be a `lucide-react` component (see *Icons* below), and the design tokens should map to whatever theming system the codebase uses.

## Fidelity

**High-fidelity.** Colors, typography, spacing, and interaction patterns are final. Recreate pixel-perfectly within the codebase's component conventions.

## Relationship to the Inbox handoff

Billing reuses the **same workspace chrome** (top bar + left rail) and the **same design system** (colors, typography, button styles, surface architecture) as the Inbox. If the Inbox handoff has already been implemented, this screen slots into the existing shell — the rail's "Billing" link becomes the active one, and the main content column swaps to the billing layout.

Read `design_handoff_inbox/README.md` first if you have not. The sections it locks in apply here verbatim and are **not repeated** in this README:

- **Approved colors** (canvas / ink / berry / berry-deep / and the opacity-blend grays). No greens, no reds, no other hues. Urgency = berry.
- **Surface architecture** — two surface tones only (`rail-tint` for the workspace ground, `canvas` for cards that "lift"). No drop shadows; elevation is tonal contrast + hairlines.
- **Typography pairing** — DM Sans for all UI, Spectral italic 600 for pet names in any hero context, Noto Sans Devanagari for Marathi. `font-variant-numeric: tabular-nums` on all numbers (here: amounts, invoice numbers, dates, counts).
- **Workspace chrome** — top bar (clinic mark + search + doctor) and left rail (Inbox / Broadcasts / Billing + Settings at bottom). In this screen, **Billing is the active rail item**.

What follows below is **billing-specific**.

## Note on prototype divergences

The prototype HTML was iterated in place and has a few small inconsistencies vs. the Inbox handoff (e.g. the top bar uses a smaller 32×32 clinic mark + a thinner topbar with a bottom border, and the rail is 200px instead of 230px). **In production, follow the Inbox handoff's chrome spec** — same 230px rail, same 40×40 clinic mark, no border on the topbar. The billing-specific content (page header, KPIs, ledger table) is what's authoritative in this file.

---

## Page layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [shared topbar — clinic / search / doctor]                                       │
├──────────┬──────────────────────────────────────────────────────────────────────┤
│          │  Billing   May 2026 · all invoices for AMS, Pune ▾                          │
│  RAIL    │                                                                      │
│  • Inbox │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │
│  • Brdcst│  │ BILLED · MONTH  │ │ COLLECTED       │ │ OUTSTANDING (!) │         │
│  • Bill  │  │ ₹84,250         │ │ ₹71,400         │ │ ₹12,850         │         │
│          │  │ 23 invoices     │ │ 18 paid · 85% … │ │ 5 unpaid · 2 …  │         │
│          │  └─────────────────┘ └─────────────────┘ └─────────────────┘         │
│          │                                                                      │
│          │  ┌──────────────────────────────────────────────────────────────┐    │
│          │  │ All invoices    [All 23] [Unpaid 5] [Paid 18]                │    │
│          │  ├──────────────────────────────────────────────────────────────┤    │
│          │  │ Invoice    Pet · Household     Issued   Status     Amount    │    │
│          │  │ INV-…0451  Gabby · Fernandes   6 May    Paid 7 May   ₹3,150  │    │
│          │  │ INV-…0450  Coco  · Sharma     28 Apr    Paid 28 Apr  ₹24,800 │    │
│          │  │ INV-…0449  Misha · Khan       30 Apr    Due · 14d    ₹4,200  │    │
│          │  │ INV-…0448  Bruno · Patil       5 Apr    Overdue · 39d ₹2,600 │    │
│          │  │ INV-…0447  Rocky · Joshi       2 May    Paid 4 May   ₹6,400  │    │
│          │  │ INV-…0446  Gabby · Fernandes  22 Apr    Paid 23 Apr  ₹9,800  │    │
│          │  ├──────────────────────────────────────────────────────────────┤    │
│          │  │ Showing 1–6 of 23 invoices              ‹  1 / 4  ›          │    │
│          │  └──────────────────────────────────────────────────────────────┘    │
└──────────┴──────────────────────────────────────────────────────────────────────┘
```

`<main>` column structure: flex column, `gap: 22px`, padding `28px 32px 36px`.

Three stacked blocks:

1. **Page header** (h1 + scope picker)
2. **KPI row** (3 equal cards)
3. **Ledger card** (header bar + table + pagination foot)

---

## 1 · Page header

```html
<header class="page-header">
  <h1>Billing</h1>
  <div class="mp-anchor"><button class="mp-btn">…</button>…</div>
</header>
```

- Flex row, `align-items: baseline`, gap `14px`

**No header actions in v1.** Earlier iterations had Export CSV and New invoice buttons in a right-aligned `.actions` slot; both are deferred. *New invoice* is part of the build (the invoice creation flow is its own design pass), and *Export CSV* is parked until that flow lands. The `.btn` / `.btn.primary` styles stay locked (see the Inbox handoff) so the buttons can drop back in cleanly when those flows are designed.

**`h1` "Billing":** DM Sans 600 30px, line-height 1, letter-spacing `-0.015em`, color `ink`.

### Month / range picker — `.mp-btn`

This is the **scope chip** sitting next to the h1. It always reads as a single sentence: a bold underlined scope + a dimmed clarifier.

Default presentation:

> **May 2026** · all invoices for AMS, Pune ▾

- Container: transparent, no border, cursor pointer, flex inline, gap 6px
- `.label` (the scope, "May 2026" / "Custom range" / "All time"):
  - DM Sans 600 14px, color `ink`
  - `border-bottom: 1px dashed rule` with 1px padding-bottom (signals it's interactive)
  - On hover of the button, dashed border becomes solid `ink`
- `.scope` (the dimmed clarifier, "· all invoices for AMS, Pune"):
  - DM Sans 500 14px, color `ink-50`
- `.chev` — Lucide `chevron-down`, 12×12, color `ink-50`
- On hover: whole button's text shifts to `ink` (so the `.scope` also darkens)

### Month picker popover — `.mp-pop`

Opens below the `.mp-btn`, anchored to its left edge, `top: 32px`.

```
┌─ Year header ────────────────────────┐
│  ‹    2026    ›                      │ ← prev / current year / next
├──────────────────────────────────────┤
│  Jan  Feb  Mar  Apr                  │ ← grid 4 × 3 months
│  May  Jun  Jul  Aug                  │   (future months disabled)
│  Sep  Oct  Nov  Dec                  │
├──────────────────────────────────────┤
│  [This month] [Custom] [All time]    │ ← range presets
└──────────────────────────────────────┘
```

- Background `#fff`, `1px solid rule`, `border-radius: 12px`, padding 14px, width 320px
- `box-shadow: 0 12px 32px -8px rgba(0,0,0,0.18)` — **this is the one place a shadow appears**, because it's an overlay leaving the surface plane; everything on the page stays shadow-less
- z-index 50

**Year header row:**
- Flex row, space-between, margin-bottom 12px
- `<` / `>` nav buttons (Lucide `chevron-left` / `chevron-right`): 28×28, `1px solid rule` border, border-radius 7px, transparent bg, `ink-70` icon. Hover: border + icon become `ink`. Disabled (future year, or year more than 4 back): `ink-30`, opacity 0.5, cursor default.
- `.y` year label: DM Sans 600 14.5px, tabular nums

**Months grid:**
- `grid-template-columns: repeat(4, 1fr)`, gap 4px
- Each button: transparent bg, no border, padding `8px 4px`, border-radius 7px, DM Sans 500 13px
- Hover (not selected, not disabled): `canvas-2` bg
- **Current month** (when viewing the current year, not selected): text becomes `berry-deep`, weight 600
- **Selected:** `berry` bg, white text, weight 600 — class `.on`
- **Disabled** (future months): `ink-30`, cursor default

**Range presets foot:**
- `border-top: 1px solid rule`, padding-top 12px, margin-top 12px
- Flex wrap, gap 6px
- Three presets: **This month**, **Custom**, **All time**
- Each button: `canvas-2` bg, no border, `ink-70` text, height 28px, padding `0 10px`, border-radius 6px, DM Sans 500 12px
- Hover: `rgba(15,12,10,0.08)` bg, `ink` text
- **Selected:** `berry-soft` bg, `berry-deep` text, weight 600 — class `.on`
- **Custom** opens an inline two-date picker for an arbitrary range. Not designed in v1 — wire the button up so clicking it sets the scope kind to `'custom'` and (for now) shows the label `"Custom range"`; the range-picker UI is a follow-up.

**Mutually-exclusive selection:** picking a month sets `selRange='this-month'` and clears any active range preset. Picking a range preset clears the month grid's `.on`. Whatever the current selection is, the button label updates:

| selRange | Label text |
|---|---|
| `this-month` | `"May 2026"` (month + year of `selMonth` / `selYear`) |
| `custom` | `"Custom range"` (eventually: the two dates, e.g. `"1 Mar – 14 Apr"`) |
| `all` | `"All time"` |

Closing behavior: click outside `.mp-anchor` → close. Click inside the popover → stays open (so users can navigate years before picking).

---

## 2 · KPI row

```html
<div class="kpis">
  <div class="kpi">…Billed…</div>
  <div class="kpi">…Collected…</div>
  <div class="kpi warn">…Outstanding…</div>
</div>
```

- Grid `repeat(3, 1fr)`, gap 14px

### Each card (`.kpi`)

- `#fff` bg, `1px solid rule`, `border-radius: 14px`, padding `18px 20px`
- Flex column, gap 4px

Children, in order:

1. `.lbl` — DM Sans 600 10.5px, uppercase, letter-spacing `0.16em`, `ink-50`
2. `.v` — the big number: DM Sans 600 30px, line-height 1.1, letter-spacing `-0.02em`, `ink`, tabular nums, **margin-top 6px**
3. `.d` — the descriptor line: DM Sans 500 13px `ink-50`, margin-top 4px. Any `<b>` inside is `ink-70` weight 600 (used to bold the counts: "**18 paid** · 85% on time", "**5 unpaid** · 2 over 30d")

### Warn variant (`.kpi.warn`) — Outstanding only

- Background: `berry-soft`
- Border: `berry-ring`
- `.lbl` color → `berry-deep`
- `.d b` color → `berry-deep`
- `.v` stays `ink` (the number itself doesn't go berry — only the secondary text does, which matches how urgency is signalled elsewhere)

**Rule:** the warn variant only renders when the value is > 0. If there are no outstanding invoices, render this card as a standard `.kpi` (with `.v` = `₹0`, `.d` = `"All clear"` in `ink-50`).

### Content per card (this month's view)

| Card | `.lbl` | `.v` | `.d` |
|---|---|---|---|
| Billed this month | `BILLED · THIS MONTH` | `₹84,250` | `23 invoices` |
| Collected | `COLLECTED` | `₹71,400` | `**18 paid** · 85% on time` |
| Outstanding (warn) | `OUTSTANDING` | `₹12,850` | `**5 unpaid** · 2 over 30d` |

**Currency formatting:** Indian rupee, `₹` prefix, no decimals, **lakh-style grouping** (`₹1,24,800` for 124800). The prototype's values happen not to hit a lakh, but the formatter must use `Intl.NumberFormat('en-IN')`.

When the scope changes, the first card's `.lbl` re-words to match: `BILLED · THIS MONTH` / `BILLED · CUSTOM RANGE` / `BILLED · ALL TIME`. The other two labels (`COLLECTED`, `OUTSTANDING`) stay constant.

---

## 3 · Ledger card

```html
<div class="ledger">
  <div class="ledger-head">…title + pill tabs + (filters + search)…</div>
  <div class="filter-active-row">…active filter chips…</div>   <!-- hidden by default -->
  <table class="ledger-table">…</table>
  <div class="ledger-foot">…count + pagination…</div>
</div>
```

- `#fff` bg, `1px solid rule`, `border-radius: 14px`, `overflow: hidden` (so the table corners get clipped)

### Ledger header bar (`.ledger-head`)

- Flex row, align center, gap 14px, padding `14px 18px`, `border-bottom: 1px solid rule`, `#fff` bg

Children:

- **h3 "All invoices"** — DM Sans 600 15.5px, letter-spacing `-0.005em`. (Title changes when the pill tabs change: "All invoices" / "Unpaid invoices" / "Paid invoices".)
- **Pill tabs** (`.pill-tabs`) — the status filter, see below
- *(Filters and search were prototyped but are not wired in v1. The CSS for `.filter`, `.search`, and the filter popovers is preserved in `Billing.html` so they can be re-enabled in v2 — see Open Questions.)*

### Pill tabs (`.pill-tabs`) — status filter

Three tabs: **All · Unpaid · Paid**. Each carries a count.

- Container: `canvas-2` bg, border-radius 999px, padding 3px, inline-flex gap 2px
- Each button: transparent bg, no border, height 30px, padding `0 12px 0 14px`, DM Sans 600 12.5px `ink-70`, border-radius 999px, inline-flex gap 7px (label + count)
- Count chip (`.n`): nested pill — DM Sans 700 11px tabular nums, `rgba(15,12,10,0.08)` bg, `ink-70` text, border-radius 999px, padding `1px 7px`, min-width 22px, text-align center
- Hover (not active): text → `ink`
- **Active** (`.on`): `ink` bg, white text. Count chip flips: `rgba(255,255,255,0.18)` bg, white text.

**One-of-three** selection — clicking changes selection, the ledger table updates client-side. The h3 title also updates as noted above.

### Ledger table (`table.ledger-table`)

Five columns:

| # | Header | Align | Width |
|---|---|---|---|
| 1 | `Invoice` | left | auto |
| 2 | `Pet · Household` | left | flex (takes remaining) |
| 3 | `Issued` | left | auto |
| 4 | `Status` | left | auto |
| 5 | `Amount` | **right** | auto |

**Header row (`thead th`):**
- DM Sans 600 10.5px, uppercase, letter-spacing 0.14em, `ink-50`, `canvas-2` bg, `border-bottom: 1px solid rule`
- Padding `12px 20px`, white-space nowrap
- The `Amount` column header has class `right` → text-align right

**Body rows (`tbody tr`):**
- Cell padding `16px 20px`, `border-bottom: 1px solid rule-soft`, vertical-align middle, DM Sans 400 14px `ink`
- Last row has no border-bottom
- Hover: row bg `rgba(15,12,10,0.015)` (extremely subtle — just enough to track the row across columns)
- Whole row is clickable → opens that invoice's detail view (not designed in v1)

#### Cell · 1 · Invoice

- `<span class="inv-id">INV-2026-0451</span>` — DM Sans 600 13.5px `ink`, tabular nums, letter-spacing `-0.005em`
- **Draft variant** (when invoice has status `draft`, not in current sample data): `<span class="inv-id draft-id">DRAFT</span>` — `ink-50`, weight 500, italic. (Reserved class, no rows use it in the prototype.)

#### Cell · 2 · Pet · Household

Two stacked lines:

```html
<div class="pet-row">
  <span class="pet-name">Gabby</span>
  <span class="pet-meta">· Golden, F, 4y</span>
</div>
<div class="hh">Fernandes household</div>
```

- `.pet-name` — **Spectral italic 600 15px** `ink`, letter-spacing `-0.005em`. This is the small-row pet treatment (same family/weight as inbox list rows, just one step down in size).
- `.pet-meta` — DM Sans 500 12.5px `ink-50`, baseline-aligned with the name (the `·` separator is part of this span)
- `.hh` (household line) — DM Sans 500 12.5px `ink-50`, `margin-top: 2px`

Breed-sex-age fragment format: `"<Breed>, <M|F>, <N>y"` (compact, no spaces around the commas inside the slashes, single-letter sex, "y" for years).

#### Cell · 3 · Issued

- `<span class="issued">6 May 2026</span>` — DM Sans 500 13.5px `ink-70`, tabular nums
- Date format: `D MMM YYYY`. Always full year (so "6 May 2026" and "28 Apr 2026" both fit cleanly when straddling months).

#### Cell · 4 · Status — the pill

There are **four** status pills. Each is `.st` plus a status modifier and contains a 11×11 Lucide icon + label.

| Class | Icon (Lucide) | Bg | Border | Text | Use |
|---|---|---|---|---|---|
| `.st.paid` | `check` | `canvas-2` | transparent | `ink-70` | `Paid 7 May` — the relative date is the payment date |
| `.st.due` | `info` | `#fff` | `1px solid ink` | `ink` | `Due · 14d` — 14 days until due date |
| `.st.overdue` | `info` | `berry` | `berry` | white | `Overdue · 39d` — 39 days since due date passed |
| `.st.draft` | (none in prototype; use `pencil` in production) | `#fff` | **`1px dashed rule`** | `ink-50` | `Draft` — saved but not yet sent |

Common: inline-flex, gap 5px, border-radius 999px, padding `4px 10px`, DM Sans 600 12px, white-space nowrap.

The `.overdue` pill is the **only place** in the entire screen where berry is used as a fill behind text (everywhere else berry is used for accents on light backgrounds, or as the primary button color). This is deliberate — overdue is the one row state that needs to grab the eye when scanning.

**Status text format:**
- Paid: `"Paid <D MMM>"` — relative date is the actual payment date
- Due: `"Due · <N>d"` — `N` is days until due date
- Overdue: `"Overdue · <N>d"` — `N` is days since due date elapsed
- Draft: `"Draft"`

#### Cell · 5 · Amount (right-aligned)

- `<span class="amt">₹3,150</span>` — DM Sans 600 14.5px `ink`, tabular nums
- **Draft variant** (`.amt.amt-draft`): `ink-50`, weight 500 — used when the row is a draft

### Ledger foot (`.ledger-foot`)

- Flex row, space-between, padding `12px 18px`, `border-top: 1px solid rule`, `canvas-2` bg

Left:
- `<span class="count">Showing <b>1–6</b> of <b>23</b> invoices</span>` — DM Sans 500 12.5px `ink-50`, `<b>` is `ink-70` weight 600, tabular nums

Right (`.page-nav`):
- Flex, gap 4px
- Prev / next buttons: 28×28, `1px solid rule`, `#fff` bg, `ink-70` icon (Lucide `chevron-left` / `chevron-right`), border-radius 7px
  - Hover (not disabled): border + icon → `ink`
  - Disabled: `ink-30`, cursor default
- Page indicator `<span class="num">1 / 4</span>` — DM Sans 600 12.5px `ink-70`, padding `0 10px`, tabular nums

Page size: **6 rows per page** (matches the prototype).

---

## Filter system — active row + popovers (deferred, but spec'd)

The prototype includes plumbing for **pet** and **household** filters (popover triggers + selection lists + an "active filter" row that appears between the ledger head and the table). In v1 these are **not user-exposed** — the popovers exist in CSS but no trigger buttons are rendered in the markup. They are kept ready because the vet specifically wants to scope the ledger to a household ("what does the Fernandes household owe us?") in v2.

When enabled in v2:

- Filter triggers (`.filter`): pill, `#fff` bg, `1px solid rule`, border-radius 999px, height 32px, padding `0 12px 0 14px`, DM Sans 500 12.5px `ink-70`. Hover: border + text → `ink`. **Active** (`.filter.active`): `berry-soft` bg, `berry-ring` border, `berry-deep` text. Each carries an inline icon + chevron, and an `×` close button when active.
- Popover (`.pop`): `#fff`, `1px solid rule`, border-radius 12px, same `0 12px 32px -8px rgba(0,0,0,0.18)` shadow as the month picker. Max-height 380px, scrollable list inside, with an inline search at the top.
- Each option (`.pop .opt`): 24×24 avatar + name (Spectral italic for pets, DM Sans for households) + secondary line ("Fernandes household" / "3 pets · 12 invoices") + count on the right.
- Selecting an option turns the trigger active and shows it as a chip in the **`.filter-active-row`** between the ledger head and the table. The active row's "Clear all" button on the right resets all filters.

See `Billing.html` (the popover CSS block + the script's `[data-pop]` handler) for the full styling — it just needs trigger markup added when this is wired up.

---

## Interactions & behavior

### Default view on load

- Rail's **Billing** link is the active one (`berry-soft` bg, `berry` text)
- Scope is **current month** (server's calendar month at load time, in clinic's timezone)
- Status tab is **All**
- Ledger is sorted by **Issued date, newest first**

### Status tab selection

Clicking `All` / `Unpaid` / `Paid` filters the visible rows client-side. "Unpaid" means status ∈ `{due, overdue}`. The counts in the tab labels reflect the **scope** (current month/range), not the all-time totals.

Re-rendering rules when a tab changes:
- Ledger h3 title swaps: "All invoices" / "Unpaid invoices" / "Paid invoices"
- Table body filters
- Pagination resets to page 1
- The KPI row does **not** change — it always reflects scope-wide stats regardless of the active tab

### Scope (month picker) selection

**The month picker is the master scope control for the entire page.** Changing scope re-fetches data and reflows the page — the three KPI cards **and** the ledger table both update together. The picker label and the KPIs always agree on what scope they represent; there is no way for them to drift out of sync.

When scope changes:
- Picker button label updates as described in the picker section above
- **All three KPI cards** re-render with the new scope's totals
- The first KPI's `.lbl` re-words to match the scope (`BILLED · THIS MONTH` / `BILLED · CUSTOM RANGE` / `BILLED · ALL TIME`)
- The ledger refetches and pagination resets to page 1
- Pill tab counts update

Future months are disabled in the grid; the year nav `>` is disabled at the current year (no point browsing into the future).

### Row click

Clicking a row opens that invoice's detail view (out of scope — design TBD). For accessibility, each row should be a `<tr role="button" tabIndex={0}>` with keyboard handlers (Enter / Space → open).

### Pagination

Client-side over the fetched dataset (assume the API returns the full month at once — counts are low, this isn't a multi-thousand-row table). 6 rows per page.

### Empty states

- **No invoices in the scope at all:** Replace the table with a centered empty state inside the ledger card — same construction as Inbox zero (64×64 ring with a Lucide `receipt` icon, "No invoices yet." in Spectral italic 600 28px, scope-appropriate subhead in DM Sans 500 14.5px `ink-70`). KPIs above stay rendered showing `₹0` / `0 invoices`. *(No primary CTA inside the empty state in v1 because the new-invoice flow is deferred — add one when that flow ships.)*
- **No invoices matching the active tab:** Same construction but tab-specific message — e.g. "All caught up." / "Nothing unpaid in this scope." / "No paid invoices yet for this scope." No CTA needed.

### Hover / focus / disabled states

- Rows: `rgba(15,12,10,0.015)` bg on hover
- Buttons: as locked in the Inbox handoff
- Disabled buttons (e.g. prev when on page 1, year `>` when on current year): `ink-30` text/icon, cursor default, no hover effect
- Focus rings on primary actions: `0 0 0 3px berry-ring`, no outline

---

## State management (suggested)

```ts
interface BillingViewState {
  scope: {
    kind: 'month' | 'custom' | 'all';
    year?: number;      // when kind === 'month'
    month?: number;     // when kind === 'month' (0-indexed)
    from?: Date;        // when kind === 'custom'
    to?: Date;          // when kind === 'custom'
  };
  statusTab: 'all' | 'unpaid' | 'paid';
  filters: {
    petId?: string;     // v2
    householdId?: string; // v2
  };
  page: number;
}

interface Invoice {
  id: string;           // "INV-2026-0451"
  status: 'paid' | 'due' | 'overdue' | 'draft';
  petId: string;
  householdId: string;
  issuedAt: Date;
  dueAt: Date;
  paidAt?: Date;        // present iff status === 'paid'
  amountPaise: number;  // stored in paise (integer), formatted at render
  lineItems: LineItem[]; // not used in this screen
}

interface ScopeStats {
  billed: { amountPaise: number; count: number };
  collected: { amountPaise: number; paidCount: number; onTimePct: number };
  outstanding: { amountPaise: number; unpaidCount: number; over30Count: number };
}
```

**Status derivation** (server-side, but the rule is shared):
- `paid` if `paidAt` is set
- `overdue` if `now > dueAt` and not paid
- `due` if `now <= dueAt` and not paid and the invoice has been **sent**
- `draft` if the invoice has been saved but never sent

The "39d" / "14d" numbers in the status pill are computed at render: `Math.abs(daysBetween(dueAt, now))`.

---

## Icons (Lucide)

| `data-lucide` | Used for |
|---|---|
| `search` | Top bar search input |
| `inbox` | Rail nav · Inbox |
| `megaphone` | Rail nav · Broadcasts |
| `receipt` | Rail nav · Billing (active here) + empty-state illustration |
| `settings` | Rail · Settings |
| `chevron-down` | Month picker trigger caret |
| `chevron-left` / `chevron-right` | Month picker year nav, pagination |
| `check` | Paid status pill |
| `info` | Due / Overdue status pills (the same circle-i icon — only the color/bg shifts to convey urgency) |
| `pencil` | Draft status pill (use this in production; the prototype has no draft icon) |
| `x` | Active-filter chip close button (v2) |

Stroke width: `1.7` for button icons, `2` for chevrons/x, `1.6` for rail nav, `1.8` for the search icon. Stroke is `currentColor` everywhere.

---

## Design tokens

Identical to the Inbox handoff — copy that `:root` block verbatim. No new tokens are introduced in this screen.

The only thing that's billing-specific styling-wise is the **overlay shadow** used by the month picker popover and (in v2) the filter popovers:

```css
--shadow-overlay: 0 12px 32px -8px rgba(0,0,0,0.18);
```

This shadow is only ever applied to **floating, transient overlays** (popovers / dropdowns / dialogs). It is **never** applied to in-flow surfaces (cards, list rows, kpi cards, etc.) — the rest of the page stays shadow-less, in line with the Inbox handoff's "elevation is tonal contrast + hairlines" rule.

---

## Sample data shown in the prototype

For reference when implementing — the prototype shows these six invoices, in order. They demonstrate every status state except `draft`.

| ID | Pet | Breed/sex/age | Household | Issued | Status | Amount |
|---|---|---|---|---|---|---|
| INV-2026-0451 | Gabby | Golden, F, 4y | Fernandes | 6 May 2026 | Paid 7 May | ₹3,150 |
| INV-2026-0450 | Coco | Lab, F, 4y | Sharma | 28 Apr 2026 | Paid 28 Apr | ₹24,800 |
| INV-2026-0449 | Misha | Persian, F, 7y | Khan | 30 Apr 2026 | Due · 14d | ₹4,200 |
| INV-2026-0448 | Bruno | GSD, M, 2y | Patil | 5 Apr 2026 | Overdue · 39d | ₹2,600 |
| INV-2026-0447 | Rocky | Mixed, M, 6y | Joshi | 2 May 2026 | Paid 4 May | ₹6,400 |
| INV-2026-0446 | Gabby | Golden, F, 4y | Fernandes | 22 Apr 2026 | Paid 23 Apr | ₹9,800 |

Note that the same pet (Gabby) appears twice — multi-invoice-per-pet is normal and not flagged in any way in the row treatment.

---

## Open questions for next round

1. **Invoice detail view** — clicking a row should open the invoice. Not designed yet. Likely a side-panel or a stacked modal showing line items, payment status, payment history, "Send reminder" / "Record payment" actions.
2. **New invoice flow** — entire flow not designed. Should it be a modal, a side panel, or a route?
3. **Pet / household filters** — the popover styling is ready but no trigger UI is exposed in v1. Decide v2 scope and ergonomics: do filters live in the ledger head row, or should the active row be replaced with a dedicated filter bar above the table?
4. **Payment reminders** — for overdue invoices, the natural next action is "send a reminder to the parent". Whether that lives as an inline button on overdue rows, or only inside the invoice detail view, is undecided.
5. **Tax / GST handling** — amounts in the prototype are bare numbers. Whether the ledger shows pre-tax / post-tax / a separate tax column is TBD with the vet.
6. **Multi-currency / multi-clinic** — out of scope for v1 (Pune-only, INR-only).

---

## Files in this bundle

- `Billing.html` — the full hi-fi prototype. Open at viewport ≥ 1240px. The CSS for the deferred filter popovers (`.pop`, `.filter`, `.pop-anchor`, `.filter-active-row`) is retained in the file even though no triggers render in v1; it's the v2 starting point.

Open it in a browser at viewport ≥ 1240px wide to see the design as intended.
