# Handoff: Pawkit Inbox

## Overview

The Inbox is the home surface of **Pawkit**, a communication platform for veterinarians and pet parents. Pet parents can only message the vet during a **follow-up window** that opens after a clinic visit; once it closes, no new messages can be sent. The inbox is where the vet sees, prioritizes, and replies to those parent messages.

This handoff covers four states of the inbox, the workspace chrome (top bar + left rail), and the canonical pet-conversation focus card with embedded SOAP context.

## About the Design Files

The HTML file in this bundle (`Inbox.html`) is a **design reference** — a static prototype showing intended look, layout, and interactions. It is **not production code to copy directly**.

Your task is to recreate these designs **in the existing codebase**, using its established framework, component library, design tokens, and patterns. If no codebase exists yet, choose a stack that fits the project (most likely **React + lucide-react + a CSS-in-JS or Tailwind setup**) and implement there.

The prototype intentionally uses inline styles, hand-written CSS, and raw `<svg>` tags to keep it self-contained. In the real implementation, every icon should be a `lucide-react` component (see *Icons* below), and the design tokens should map to whatever theming system the codebase uses.

## Fidelity

**High-fidelity.** Colors, typography, spacing, and interaction patterns are final. Recreate pixel-perfectly within the codebase's component conventions.

## Design System Constraints

These rules were locked in during design and must not be broken:

### Colors — only these are approved

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#F8F7F5` | Card surfaces — focus card, lists, awaiting bar, composer, every "object" the vet acts on |
| `ink` | `#0F0C0A` | Primary text, structural strokes |
| `berry` | `#823159` | Primary action, vet message bubbles, active nav, focus rings, brand accents |
| `berry-deep` | `#6B1F44` | `berry` hover state |
| `white` | `#FFFFFF` | **Only for text-on-berry contexts** (button labels, vet bubble text, active tab label, clinic mark text). Never as a surface color. |

All grays are **opacity blends of `ink` over `canvas`** — never hard-coded gray hexes:

| Token | Value | Use |
|---|---|---|
| `ink-70` | `rgba(15, 12, 10, 0.72)` | Secondary text |
| `ink-50` | `rgba(15, 12, 10, 0.55)` | Tertiary text, placeholders, meta info |
| `ink-30` | `rgba(15, 12, 10, 0.35)` | Disabled, faintest hints |
| `rule` | `rgba(15, 12, 10, 0.12)` | Dividers, card borders, list row hairlines |
| `rule-soft` | `rgba(15, 12, 10, 0.06)` | Faint dividers, dashed contexts |
| `canvas-2` | `rgba(15, 12, 10, 0.04)` | Embedded surfaces (parent message bubbles, hover states, default pet avatar) |
| `rail-tint` | `rgba(15, 12, 10, 0.045)` | **The workspace "ground" tone** — top bar, left rail, and content area all sit at this tone so cards (canvas) rise off it |
| `berry-soft` | `rgba(130, 49, 89, 0.12)` | Active nav background |
| `berry-ring` | `rgba(130, 49, 89, 0.28)` | Focus ring on inputs/buttons |

**Do not introduce any other colors.** No green-for-success, no red-for-error, no avatar fur-color palette. If something needs to attract attention, use `berry`.

### Surface architecture (critical)

There are **only two surface tones** in the app:

1. **`rail-tint`** — the workspace "ground". Used by: top bar, left rail, content area, app bar. This forms one continuous tinted plane.
2. **`canvas`** — cards and objects that "lift" off the ground. Used by: focus card, awaiting list bar, awaiting list, replied list, secondary buttons, search input, composer input.

There is **no chrome hairline** between top bar / rail / content / appbar — they share `rail-tint` and flow into each other as one plane. The visual hierarchy comes from:
- Tonal contrast: `canvas` cards rise off the `rail-tint` ground
- Hairlines (`rule`): only inside cards and content — list row dividers, section dividers within the focus card, etc.
- Spacing: generous padding and gaps

**No drop shadows anywhere.** Elevation is purely from tonal contrast + hairlines. The `--shadow-card` and `--shadow-soft` tokens in the prototype are aliased to `none` so they don't crash any class names; in the real implementation just don't write shadow styles.

### Typography

| Family | Use | Weights |
|---|---|---|
| **DM Sans** | All UI text — body, headings, buttons, labels | 400 / 500 / 600 / 700 |
| **Spectral (italic)** | Pet names in any hero context: focus card header, list rows, inbox-zero h2, awaiting bar headline | 600 italic |
| **Noto Sans Devanagari** | Marathi text (composer toggle, message bubbles in Marathi) | 400 / 500 / 600 |

Use `font-variant-numeric: tabular-nums` on **all timestamps, counts, amounts, invoice numbers, durations**. Wait times, "1d 4h", "1 of 4", message counts must all align vertically.

Letter-spacing on display sizes: `-0.005em` to `-0.015em` depending on size (see CSS for exact values).

### Icons

All icons are from **Lucide** (`lucide-react` in React, or `lucide-vue-next`, etc.). The HTML uses raw inline SVGs as placeholders; **each `<svg>` carries a `data-lucide="<icon-name>"` attribute** indicating which Lucide icon to import. Replace mechanically:

| `data-lucide` | Used for |
|---|---|
| `inbox` | Left rail · Inbox nav |
| `megaphone` | Left rail · Broadcasts nav |
| `receipt` | Left rail · Billing nav |
| `settings` | Left rail · Settings (bottom) |
| `search` | Top bar search input |
| `user-round` | Focus card "Open pet profile" icon button |
| `paperclip` | Composer · Attach |
| `mic` | Composer · Voice |
| `arrow-right` | "Start reply queue" + "Send & next" buttons |
| `arrow-left` | Focus mode · "Back to list" |
| `check` | Inbox zero illustration |

Default icon stroke width is `1.6` for rail nav, `1.8` for search, `1.5` for the large Inbox-zero check. Stroke is `currentColor` everywhere.

---

## Workspace Chrome (shared across all states)

### Top Bar (`<header class="topbar">`)

Two-column grid: a 230px clinic column (matching the rail width below it) + a 1fr right column (search + doctor). No borders anywhere; flows visually into the rail and content area below via the shared `rail-tint` background.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ⦿ AMS  Animal Medical Services   [🔍 Search pets, parents, …]   Dr Sagar Bhongale  SB │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Background:** `rail-tint` (NOT canvas — chrome shares the workspace ground)
- **No border-bottom, no internal borders**
- **Grid:** `230px 1fr`

**Clinic block** (left, width 230px to align with rail):
- Padding `14px 22px`
- 40×40 circle in `berry` with white text "AMS" in DM Sans 700 12px — **must have `flex-shrink: 0`** so the long clinic name doesn't squish it into an oval
- Clinic name "Animal Medical Services" in DM Sans 600 16px with `white-space: nowrap` (it can overflow the 230px column visually since nothing sits to its right in that grid cell)
- Gap 12px between mark and name

**Right column** (`.topbar-right`):
- Grid `1fr auto`, gap 24px, padding `14px 28px`
- Left cell: search bar
- Right cell: doctor block

**Search** (max-width 540px):
- Pill: `1px solid rule`, `border-radius: 12px`, padding `9px 14px`, background `canvas`
- Search icon left (Lucide `search`, 16×16, stroke `ink-50`)
- Placeholder "Search pets, parents, phone numbers" in DM Sans 500 14px `ink-50`
- Focus: border becomes `berry`, shadow `0 0 0 3px berry-ring`

**Doctor block** (right):
- Name "Dr Sagar Bhongale" in DM Sans 600 14px
- 34×34 circle avatar — `canvas-2` bg, `rule` border, monogram "SB" in DM Sans 700 12px
- Gap 12px

### Left Rail (`<aside class="rail">`)

230px wide vertical nav. **No right border** — it's separated from the main column purely by the tonal shift (rail-tint on the left, content also rail-tint but cards on canvas).

```
┌───────────────────────┐
│ WORKSPACE             │
│ ▤ Inbox            4  │ ← active = berry-soft bg, berry text
│ ⊕ Broadcasts          │
│ ⌹ Billing             │
│                       │
│   (flex spacer)       │
│                       │
│ ⚙ Settings            │ ← margin-top: auto pushes to bottom
└───────────────────────┘
```

- **Background:** `rail-tint`
- **No borders anywhere**
- **Padding:** `22px 0 18px`
- **Display:** flex column

**Workspace label:** DM Sans 600 10px, uppercase, letter-spacing `0.16em`, `ink-50`, padding `0 22px 10px`.

**Nav links** (`<a class="rail-nav a">`):
- Inside a `.rail-nav` div (padding `0 12px`, flex column gap 2px)
- Each link: padding `9px 12px`, border-radius 10px
- Display flex, gap 12px (icon · label · badge auto-pushed right)
- Default: `ink-70` text
- Hover: `canvas-2` bg, `ink` text
- **Active:** `berry-soft` bg, `berry` text — badge text becomes `berry` as well
- Badge: DM Sans 600 12px, tabular nums, right-aligned via `margin-left: auto`
- Icon container: 18×18 with the Lucide icon at 18×18

**Settings link** — different structure:
- Direct child of `.rail` (NOT inside `.rail-nav`)
- `margin-top: auto` pushes it to the bottom of the flex column
- Otherwise styled identically to nav links
- Inline horizontal margins `12px` to match `.rail-nav` padding

```html
<aside class="rail">
  <div class="workspace-label">Workspace</div>
  <div class="rail-nav">
    <a href="#" class="active">… Inbox</a>
    <a href="#">… Broadcasts</a>
    <a href="#">… Billing</a>
  </div>
  <a href="#" class="settings-link">… Settings</a>  <!-- NOT in .rail-nav -->
</aside>
```

### App Bar (`<header class="appbar">`)

The bar below the top bar, inside the main column. Changes contents by state:

- **Awaiting list, Replied, Inbox zero:** Tabs only ("Awaiting reply" / "Replied" with counts)
- **Reply queue (focus mode):** Back button + progress ("1 of 4" + horizontal bar)

Padding `16px 28px`, **background `rail-tint`** (continuous with content area), **no borders**.

### Content area (`.content`)

The scroll region below the app bar where cards live.

- **Background:** `rail-tint` (same as appbar, rail, topbar — one continuous plane)
- **Padding:** `24px 28px 28px`
- **Flex column, gap 20px**

Cards inside (focus card, awaiting bar, awaiting list, replied list) are `canvas` background with a `1px solid rule` border, no shadow. They visually "lift" off the rail-tint ground purely through tonal contrast.

---

## Screens / States

### State 01 · Awaiting List (the default landing view)

**Purpose:** What the vet sees on first opening Pawkit. A scannable list of parent messages awaiting reply, oldest first. The vet can either click into a single thread (one-off reply) or hit **"Start reply queue"** to enter focus mode and grind through them sequentially.

**Layout:**

```
[ Top bar (rail-tint) ]
[ Rail (rail-tint) ] | [ App bar with tabs (rail-tint) ]
                     |
                     | [ Content area (rail-tint) ]
                     |   ┌──────────────────────────────────────────┐
                     |   │ 4 parents are waiting on you  [Start →] │ ← canvas card
                     |   └──────────────────────────────────────────┘
                     |
                     |   ┌──────────────────────────────────────────┐
                     |   │ ● G  Gabby …            1d 4h  [chip]    │ ← canvas card
                     |   │ ● C  Coco …             12h    [chip]    │
                     |   │ ● M  Misha …            6h     [chip]    │
                     |   │ ● B  Bruno …            1h     [chip]    │
                     |   └──────────────────────────────────────────┘
```

**Awaiting bar** (above the list):
- `canvas` bg, `1px solid rule`, `border-radius: 14px`, padding `16px 22px`
- "**4 parents are waiting on you**" — Spectral italic 600, 22px, `-0.005em` letter-spacing — only this single line, no subhead, no hint text
- Right side: primary button "Start reply queue →"

**List container** (`.awaiting-list`):
- `canvas` bg, `1px solid rule`, `border-radius: 16px`
- Overflow hidden so child rows share the rounded corners

**Each row** (`<div class="row awaiting">`):
- Grid: `14px auto 1fr auto` (unread-dot · pet-avatar · who · meta)
- Gap 14px, padding `18px 22px`
- Border-bottom `1px solid rule` (except last row)
- Hover: `canvas-2` bg
- Cursor: pointer

**Unread dot** (first column):
- 8×8 `berry` circle, top-aligned with the pet name
- Read state: transparent (preserves spacing)

**Pet avatar** (second column):
- 40×40 circle, `canvas-2` bg, `1px solid rule`
- Pet's initial in DM Sans 600 15px `ink`
- (In production: replace with parent-uploaded photo where available)

**Who column** (third column, flex column gap 3px):
- Pet name in Spectral italic 600 17px, then breed/sex/age in DM Sans 500 12.5px `ink-50`, 6px left margin, non-italic
- Household line: DM Sans 500 12.5px `ink-70`
- Snippet: DM Sans 400 13.5px `ink` (or `ink-70` if read), 2-line clamp, max-width 640px

**Meta column** (fourth, flex column align-end gap 8px):
- **Wait duration:** "1d 4h" in DM Sans 600 12px, tabular nums. **`ink-70` normally, `berry` if this is the oldest-awaiting row (`.row.awaiting.urgent`).**
- **Case chip:** the visit context (e.g. "Ear infection check", "Post-op recheck") — pill, `canvas-2` bg, `1px solid rule`, padding `4px 10px`, DM Sans 600 12px `ink-70`

**Empty state of this list = State 04 (Inbox zero).**

---

### State 02 · Reply Queue (focus mode, opt-in)

**Purpose:** Entered when the vet clicks "Start reply queue" on State 01. Shows one parent thread at a time, with full context (SOAP notes inline, embedded), composer fixed below. After sending, auto-advances to the next-oldest awaiting thread.

**Note:** the up-next preview strip and the "Dr Sagar is here for Gabby until 16 May" system banner are intentionally **removed** in the final design. Focus mode is just the focus card — single-minded.

**App bar contents** (changes vs. State 01):
- **Left:** `<button class="appbar-back">` — slim transparent button, arrow-left icon + "Back to list", DM Sans 600 13px `ink-70`, padding `7px 10px`, border-radius 8px. Hover: `canvas-2` bg, `ink` text. No border.
- **Right (margin-left auto):** Progress block — "1 of 4" (with the numbers in DM Sans 700, tabular nums) followed by a 96×6 progress bar. Track is `canvas-2` with `rule` border; fill is `berry`.

**Focus card** (the single card filling the content area):

```
┌──────────────────────────────────────────────────────────────┐
│ [G]   Gabby                                       [profile↗] │ ← pet header (no chips, no kebab)
│       Golden Retriever · M · 4y · 28.0kg · Fernandes h'hold  │
├──────────────────────────────────────────────────────────────┤
│ LAST VISIT  6 May · Dr Sagar · Ear infection check (right)   │ ← SOAP strip (collapsed)
│   · cefadroxil 250mg BID × 7d · recheck 16 May               │
│                            [Invoices↗] [All visits↗] [SOAP▾] │
├──────────────────────────────────────────────────────────────┤
│ [vet bubble — berry]                                         │
│                              [parent bubble — canvas-2]      │ ← thread
│ … (4 bubbles)                                                │
├──────────────────────────────────────────────────────────────┤
│ This parent writes in English. · Reply in: [English][मराठी]   │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Reply to Anjali…                                         │ │ ← composer
│ └──────────────────────────────────────────────────────────┘ │
│ [📎 Attach] [🎙 Voice]              [Skip · later] [Send & next →] │
└──────────────────────────────────────────────────────────────┘
```

**Card container:**
- `canvas` bg (rises off the `rail-tint` content area)
- `1px solid rule`, `border-radius: 16px`
- No shadow
- Flex column, no inner padding (children handle their own)

**Pet header section** (`.pet-head`):
- Grid `auto 1fr auto` (avatar · titles · actions), gap 20px, padding `22px 28px 18px`
- Border-bottom `1px solid rule`
- **Large avatar:** 72×72 circle, `1.5px solid rule` border, `canvas-2` bg, Spectral italic 600 26px monogram
- **Pet name (h2):** Spectral italic 600 32px, line-height 1, letter-spacing `-0.005em`
- **Bio line:** "Golden Retriever · M · 4 years · 28.0 kg · **Fernandes household**" — DM Sans 500 13.5px `ink-70`, separators are `·` in `rule` color, household in DM Sans 600 `ink`
- **Actions:** single icon button (`user-round` Lucide) — 36×36, `canvas` bg, `1px solid rule`, border-radius 10px. **No kebab/more button. No chips below the bio line.** Header is just identity + open-profile.

**SOAP context strip** (`.ctx`):
- `canvas` bg, `1px solid rule` border-bottom
- **Collapsed (default):** single row grid `auto 1fr auto auto auto`, padding `12px 28px`, gap 14px
  - Label "LAST VISIT" — DM Sans 600 11px, uppercase, letter-spacing `0.12em`, `ink-50`
  - Summary line: when (tabular nums, `ink-50`) · title (DM Sans 600 `ink`) · diagnosis fragment (`ink-70`)
  - Inline link buttons (no border, berry text, font weight 600): "Invoices ↗", "All visits ↗"
  - Toggle pill "SOAP ▾" — `canvas` bg, `1px solid rule`, border-radius 999px, padding `5px 11px`, DM Sans 600 12px `ink-70`. On hover: `canvas-2` bg, `ink` text, `ink` border.
- **Expanded:** dashed top border, padding `4px 28px 20px`, embedded SOAP card inside
  - SOAP card: `canvas` bg, `1px solid rule`, border-radius 12px, padding `18px 22px`
  - Header row: title (DM Sans 600 16px) + date/author (DM Sans 500 12.5px `ink-50`) on left, tag chips on right
  - Body: `<dl>` grid `110px 1fr`, gap `10px 22px` — labels "SUBJECTIVE" / "OBJECTIVE" / "ASSESSMENT" / "PLAN" in DM Sans 600 11px uppercase letter-spacing 0.14em `ink-50`, values in DM Sans 400 14px `ink`
  - Foot: "Open full clinical history (2 visits) ↗" link in berry, plus older-visits hint in `ink-50` tabular nums

**Thread section** (`.thread`):
- `canvas` bg, padding `22px 28px 18px`, flex column gap 12px
- **No system banner** — earlier designs had "Dr Sagar is here for Gabby until 16 May" at the top. Removed because the same info lives in the header bio line. (When the follow-up window has CLOSED, the composer state changes — see Interactions below — but no banner is needed in the open state.)

**Bubbles:**
- Max-width 64% of container
- Padding `12px 16px`, border-radius 16px
- DM Sans/Noto Devanagari 400 14.5px line-height 1.5
- **Parent (`.bubble.them`):** `canvas-2` bg, `1px solid rule`, `ink` text, align-self flex-start, bottom-left corner radius 4px (tail)
- **Vet (`.bubble.me`):** `berry` bg, white text, align-self flex-end, bottom-right corner radius 4px (tail), **no border**
- Meta line below content: DM Sans 500 11.5px tabular nums. Parent: `ink-50`. Vet: `rgba(255,255,255,0.7)`. 6px top margin.
- Consecutive bubbles from the same sender: `-4px` top margin (slight overlap effect)

**Composer** (`.composer`):
- `canvas` bg, `1px solid rule` border-top, padding `14px 28px 18px`

**Language toggle row** (`.composer-lang`):
- DM Sans 500 12.5px `ink-50`, flex gap 10px, margin-bottom 10px
- Text: "This parent writes in English. · Reply in:"
- Pill tabs (`.ltabs`): `canvas` bg, `1px solid rule`, border-radius 999px, padding 2px
- Each tab button: padding `4px 12px`, DM Sans/Noto Devanagari 600 11.5px, border-radius 999px
- Active tab: `berry` bg, white text. Inactive: `ink-70` text on transparent.

**Input field** (`.composer-box`):
- Transparent bg, `1px solid rule`, border-radius 12px, padding `14px 16px`, min-height 72px
- Placeholder text in DM Sans 400 14.5px `ink-50`
- Focus/hover: border becomes `berry`, shadow `0 0 0 3px berry-ring`

**Action row** (`.composer-actions`):
- Flex, gap 6px, margin-top 10px
- Left side: secondary buttons "Attach" (paperclip), "Voice" (mic)
- Right side (margin-left auto): "Skip · later" (ghost button — same as .btn but `ink-50` text) + **"Send & next →"** primary button

---

### State 03 · Replied

**Purpose:** Browse past conversations. Most recent reply first. Filters are intentionally **not** built in v1 (vet specifically asked to hold off until reviewed). Each row shows the pet, the vet's last reply snippet, timestamp, and case chip.

**Layout:** Same shell as State 01. Content is a single `canvas` card (`.replied-list`) containing rows.

**Row structure** (`.row`):
- Grid `auto 1fr auto`, gap 16px, padding `16px 22px`
- Border-bottom `1px solid rule`
- Hover: `canvas-2` bg, cursor pointer

**Avatar:** 40×40 default pet avatar (canvas-2 bg, rule border, ink monogram)

**Who:** Pet name in Spectral italic 600 17px, breed line + household, then snippet with **"You:"** prefix in DM Sans 600 `ink`. Snippet is single-line clamped, max-width 720px.

**Meta:** Timestamp ("today, 10:14" / "7 May, 19:05") in DM Sans 500 12px tabular nums `ink-50`, then case chip below.

**Case chip text** is the actual last-visit name (e.g. "Annual wellness", "Ear infection check", "Limping evaluation", "UTI recheck"), **not** a vague status fragment like "Skin · ongoing".

**Foot row** (`.replied-foot`): "Showing 6 of 12 recent replies · **Load older →**" — `border-top: 1px solid rule`, DM Sans 500 13px `ink-50`, "Load older →" in berry 600.

---

### State 04 · Inbox Zero

**Purpose:** When there are 0 awaiting replies. Per design call: **deliberately bare.** No "follow-ups due", no "suggested broadcasts", no stats. Just acknowledgment.

**Layout:** Centered vertically and horizontally in the content area, padding `80px 24px`, flex column align-center gap 14px.

**Components:**
- 64×64 circle (`1.5px solid ink`, `canvas` bg) with a Lucide `check` icon inside (28×28, stroke `ink`, stroke-width 1.5)
- Heading "Inbox zero." in **Spectral italic 600 36px**, line-height 1.05
- Subhead "Every parent has heard back from you. Go grab a chai." in DM Sans 500 15.5px `ink-70`, max-width 340px

---

## Components — reusable

### Pet Avatar (`<PetAvatar size="md|lg" initial="G" />`)

Two sizes:
- **md (40×40):** `canvas-2` bg, `1px solid rule`, DM Sans 600 15px ink monogram, border-radius 50%
- **lg (72×72):** `canvas-2` bg, `1.5px solid rule`, Spectral italic 600 26px ink monogram

In production: accept an optional image URL; render the image if present, fall back to the initial monogram. No fur-color palette — every avatar uses the same neutral monogram styling.

### Chip (`<Chip>` or `<Chip variant="case">`)

Single style:
- Border-radius 999px (pill)
- `canvas-2` bg, `1px solid rule`
- Padding `4px 10px`
- DM Sans 600 12px tabular nums `ink-70`
- White-space nowrap

### Buttons

**Primary** (`.btn.primary`):
- 40px height, padding `0 18px`
- `berry` bg/border, white text, DM Sans 600 13.5px
- Hover: `berry-deep` bg
- Focus: `0 0 0 3px berry-ring` shadow, no outline
- Optional trailing icon (`arrow-right`), 15×15

**Secondary / ghost** (`.btn`):
- 36px height, padding `0 14px`
- `canvas` bg, `1px solid rule`, `ink-70` text, DM Sans 600 13px
- Hover: `canvas-2` bg, `ink` border, `ink` text
- Optional leading icon, 15×15

**Skip variant** (`.btn.skip`):
- Same as secondary but `ink-50` text — used for "Skip · later"

**Icon button** (`.iconbtn`):
- 36×36, `canvas` bg, `1px solid rule`, border-radius 10px
- 16×16 icon, `ink-70` stroke
- Hover: `canvas-2` bg, `ink` border + stroke

**Inline link button** (`.btn-link`):
- No bg, no border, padding `5px 8px`
- DM Sans 600 12.5px `berry`
- Hover: underline, `text-underline-offset: 3px`

**App bar back button** (`.appbar-back`):
- Slim, transparent until hover (then `canvas-2`)
- No border, DM Sans 600 13px `ink-70`, padding `7px 10px`, border-radius 8px

### Tabs (`.tabs`)

- Pill segmented control: `canvas-2` bg, `1px solid rule`, border-radius 999px, padding 3px
- Each tab button: padding `6px 16px`, DM Sans 600 13px `ink-70`, border-radius 999px
- Tab count (`.n`): nested pill, tabular nums, DM Sans 600 11.5px, `canvas` bg, `rule` border
- **Active tab:** `berry` bg, white text. Count nested pill flips: white bg, `berry` text, `berry` border.

---

## Interactions & Behavior

### State transitions

1. **App opens →** State 01 (Awaiting list) with the Awaiting tab pre-selected.
2. **Click "Start reply queue" →** State 02 (Reply queue) loading the oldest-awaiting thread. URL should change so the state is shareable/refreshable, e.g. `/inbox/queue` or `/inbox/thread/<id>?mode=queue`.
3. **Click a single row in the list →** State 02-equivalent layout but **without** the queue progress bar; "Back to list" still works. Sending should return to the list (not auto-advance to next).
4. **In queue mode, click "Send & next →" →** Send message, advance to next-oldest awaiting thread. Progress increments. When queue is empty, route to State 04 (Inbox zero).
5. **In queue mode, click "Skip · later" →** Move current thread to end of queue, load next. Skipped threads return to the queue at the end.
6. **Click "Back to list" →** Return to State 01 keeping the Awaiting tab selected. Threads replied during the queue session are now gone from Awaiting and visible in Replied.
7. **Click the Replied tab in any state →** State 03.

### Follow-up window behavior

Each thread has an associated **follow-up window**. Parent messages can only arrive while it's open. The window:

- Opens at the time of the corresponding clinic visit
- Has a duration determined by visit type (set elsewhere in the system)
- Closes automatically when duration elapses

When closed, the thread:
- Cannot receive new parent messages
- Composer becomes disabled: input placeholder text changes to "Follow-up window closed on 16 May", text color `ink-30`, Send button disabled
- (Optional banner above composer reading "Follow-up window closed on 16 May" — design TBD for v2)

For v1 demo, only-open threads are shown in Awaiting. Closed-but-recently-replied threads are still visible in Replied.

### "Awaiting" ordering rule

**Strictly chronological by wait time, longest-wait first.** No urgency overrides. No manual pinning. The oldest-awaiting row's wait duration is rendered in `berry` instead of `ink-70` to draw the eye (CSS class `.row.awaiting.urgent`).

### SOAP strip toggle

Click the "SOAP ▾" pill or any part of the strip header → expands the inline SOAP card. Click again → collapses. The caret rotates between `▾` and `▴`. Animation: 150ms ease.

### Language toggle

The composer's language toggle controls **how the reply is rendered** when sent. Switching from English to मराठी does NOT translate already-typed text — it just changes the keyboard hint, the font family, and the submission language flag. The "This parent writes in X." sentence is auto-detected from the parent's last message.

### Search

Top bar search is global across pets, parents, and phone numbers. Returns a dropdown of matches (design not in this handoff — open question for next round).

### Hover / focus states

Already specified per component above. Universal rules:
- All clickable rows + cards: `canvas-2` bg on hover
- All inputs: `berry` border + `berry-ring` shadow on focus
- All primary buttons: `berry-deep` bg on hover
- Buttons with secondary styles: `canvas-2` bg + `ink` border on hover

---

## State Management

### Data model (suggested)

```ts
interface Thread {
  id: string;
  petId: string;
  householdId: string;
  caseChip: string;             // e.g. "Ear infection check" — matches the last visit's title
  followUpWindow: {
    openedAt: Date;
    closesAt: Date;
  };
  messages: Message[];
  parentLanguage: 'en' | 'mr';  // auto-detected
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  sex: 'M' | 'F';
  age: string;                  // "4 years"
  weight: string;               // "28.0 kg"
  householdName: string;
  avatarUrl?: string;
  clinicalHistory: Visit[];
}

interface Visit {
  date: Date;
  title: string;                // "Ear infection check (right)"
  authorName: string;
  tags: string[];               // ["Sick visit", "Otitis"]
  soap: { subjective; objective; assessment; plan; };
}

interface Message {
  id: string;
  sender: 'vet' | 'parent';
  senderName: string;
  content: string;
  language: 'en' | 'mr';
  sentAt: Date;
}
```

### View state

- `activeTab: 'awaiting' | 'replied'`
- `mode: 'list' | 'queue' | 'single-thread'`
- `currentThreadId: string | null` (when in queue or single-thread mode)
- `queueProgress: { index: number; total: number }` (when in queue mode)
- `soapExpanded: boolean` (per thread)
- `composerLanguage: 'en' | 'mr'`
- `composerDraft: string` (persisted per thread)

---

## Design Tokens (final)

```css
:root {
  /* APPROVED PALETTE */
  --canvas:      #F8F7F5;
  --ink:         #0F0C0A;
  --berry:       #823159;
  --berry-deep:  #6B1F44;

  /* DERIVED (opacity blends — no new hexes) */
  --ink-70:      rgba(15, 12, 10, 0.72);
  --ink-50:      rgba(15, 12, 10, 0.55);
  --ink-30:      rgba(15, 12, 10, 0.35);
  --rule:        rgba(15, 12, 10, 0.12);
  --rule-soft:   rgba(15, 12, 10, 0.06);
  --canvas-2:    rgba(15, 12, 10, 0.04);
  --rail-tint:   rgba(15, 12, 10, 0.045);
  --berry-soft:  rgba(130, 49, 89, 0.12);
  --berry-ring:  rgba(130, 49, 89, 0.28);

  /* NO SHADOWS — keep these aliased to none if your codebase expects the names */
  --shadow-card: none;
  --shadow-soft: none;
}
```

### Spacing

The prototype doesn't use a strict scale, but observed values: `4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 28 · 32px`. A `4px` base scale fits cleanly.

### Border radius

- Pills (chips, tabs, buttons): `999px`
- Standard buttons: `8px` (back), `10px` (secondary), `12px` (input)
- Cards: `14px` (small) / `16px` (main)
- Avatars: `50%`
- App shell outer: `18px`

### Typography scale

| Use | Family | Size | Weight | Line-height |
|---|---|---|---|---|
| Pet name (focus card h2) | Spectral italic | 32px | 600 | 1 |
| Inbox zero h2 | Spectral italic | 36px | 600 | 1.05 |
| Awaiting bar h2 | Spectral italic | 22px | 600 | – |
| Pet name (row) | Spectral italic | 17px | 600 | 1.15 |
| Section heading | DM Sans | 16px | 600 | – |
| Body / bubble | DM Sans | 14.5px | 400 | 1.5 |
| List meta | DM Sans | 13.5px / 13px | 500 / 400 | 1.4 |
| Nav, buttons | DM Sans | 13–13.5px | 600 | – |
| Chip / pill | DM Sans | 12px | 600 | – |
| Timestamps / meta | DM Sans | 11.5–12px tabular | 500 | – |
| Labels (uppercase) | DM Sans | 10–11px | 600 | letter-spacing 0.12–0.16em |

---

## Assets

No image assets in the prototype. In production:
- Pet avatars: parent-uploaded photos (fall back to monogram on canvas-2 if absent)
- Clinic logo: client-uploaded — render as text monogram on `berry` if absent (with `flex-shrink: 0` so a long clinic name doesn't squish the logo into an oval)
- All icons: `lucide-react` package, names listed in *Icons* section

---

## Open Questions Flagged for Next Round

These were intentionally deferred during design and need product/PM input before implementation:

1. **Filters in Replied tab** — held back per vet's call. Confirm scope before adding.
2. **Search dropdown UI** — typeahead results for pets/parents/phone not designed yet.
3. **Closed follow-up window banner** — v1 just disables the composer; a visible banner is TBD.
4. **Multi-vet teams** — out of scope for v1; current design assumes a single vet (Dr Sagar). Architecture leaves room for assignment/ownership in v2.
5. **Mobile** — desktop-only for v1. Mobile shell TBD.
6. **Single-thread open** — when the vet clicks a single row (not the queue CTA), should it reuse the focus card UI without the queue progress, or open a different (lighter) view? Currently spec'd as: same focus card, but `appbar` shows only "Back to list" (no progress bar). Confirm before building.

---

## Files in this bundle

- `Inbox.html` — the full hi-fi prototype with all 4 states stacked vertically. Use it as a visual reference and to copy CSS values. Each state is wrapped in `<section class="state">` with a labelled banner.

Open it in a browser at viewport ≥1240px wide to see the design as intended.
