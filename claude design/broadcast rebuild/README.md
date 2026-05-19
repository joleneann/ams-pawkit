# Handoff: AMS Pawkit · Broadcast Composer

## Overview

The Broadcast Composer is the screen vets use to send announcements and educational messages to pet parents through the **Pawkit Parents** mobile app. A broadcast has a title, a body, an audience (everyone, or a custom segment of parents), and an optional set of structured sections (summary bullets, warning signs, when-to-call-us, cover photo). Broadcasts can be written in English and Marathi (मराठी) side-by-side, dictated by voice, and previewed as the parent would see them on their phone before being sent.

The composer is designed around two real-world shapes the same form supports:

1. **Quick announcement** — short, urgent, sent in a few seconds (e.g. "We're closed Mon for Diwali"). Plain title + body, audience = all parents.
2. **Educational broadcast** — longer, structured, often segmented to a subset of parents (e.g. "Monsoon ear-infection watch for dogs"). Cover photo, summary bullets, warning block, dictation, custom audience.

Two overlays appear on top of the composer:

- **Custom audience popup** — a centered modal that opens when the vet clicks "Custom…" / "Edit filters". Lets them build conditions (species, age, last-visit, etc.) with a live audience-count footer.
- **Mobile preview** — a full-screen overlay showing an iPhone frame with the broadcast rendered as it will appear in the Pawkit Parents app.

## About the Design Files

The HTML file in this bundle is a **design reference**, not production code to copy directly. It was built as a clickable prototype to communicate the intended look and behavior of the composer in a single, shareable artifact. Both composer states are stacked vertically on one page so they can be reviewed side-by-side — in the real product they are the **same screen** in two different configurations driven by content.

Your task is to **recreate these designs in the target codebase's existing environment** (React + the AMS design system, presumably) using its established patterns, component library, routing, and state management. If no environment exists yet, choose the framework that fits the rest of the product. Pull the exact pixel values from the prototype, but wire it up using whatever buttons, inputs, modal, and form primitives already exist in the codebase. Do not ship the raw HTML.

## Fidelity

**High-fidelity (hifi).** Colors, type scale, spacing, border radii, hover states, and copy are all final. Implement pixel-perfectly. Modals and overlays should match the prototype's open/close behavior (Esc, backdrop click, explicit close buttons all dismiss).

## Screens / Views

### 1. Composer canvas

The composer is a single page inside the AMS Pawkit web app shell.

**Layout:**
- **App shell** (shared with other Pawkit screens):
  - Topbar: 60px tall, white, bottom border `1px solid rgba(15,12,10,0.12)`. Left: clinic mark (32×32, berry square, "AMS" in white) + clinic name. Right: search input (~360px wide) + doctor name + doctor avatar (28×28 circle).
  - Left rail: 200px wide, light tinted background `rgba(15,12,10,0.045)`, right border. Contains "Workspace" label + nav items (Inbox, Broadcasts [active], Billing) + Settings link pinned to bottom.
  - Main area: fills remaining width, scrollable.
- **Page header** inside main area:
  - `padding: 24px 32px 18px`, flex baseline-aligned.
  - `<h1>` "New broadcast" — DM Sans 600, 30px, letter-spacing -0.015em.
  - Sub-label "Autosaved 12s ago" — DM Sans 500, 13.5px, ink-50.
  - Right-aligned action group: `Preview as parent` (preview-btn style) + `Save draft` (btn style).
- **Broadcast card** (the actual form):
  - White card, `border: 1px solid var(--rule)`, `border-radius: 14px`, lives in `padding: 0 32px 32px`.
  - Sections in order, separated by horizontal rules `1px solid var(--rule)`:
    1. **Audience strip** — "Who's this for?" label + audience pill ("All AMS parents" or "Custom: Dog parents, ages 1–12" in berry) + count + Custom… / Edit filters button. Below: sample pet row (avatars + names) with "+ N more" trailing.
    2. **Language toolbar** — "Writing in" label + segmented `English | मराठी` tabs (berry-on when active) + "Auto-fill मराठी after sending" toggle button + mic icon for dictation.
    3. **Title field** — label "Title · required", text input that grows. DM Sans 600 26px, no border.
    4. **Body field** — label "Body · required", textarea. DM Sans 400 15px / 1.6 line-height, `white-space: pre-wrap`.
    5. **Add chips** — pill buttons for optional sections: `+ Summary bullets`, `+ Warning signs`, `+ When to call us`, `+ Cover photo`, `More options ▾`. As sections are added, they disappear from this list.
    6. **Send footer** — left: "Ready to send to N pets across M households · in English & मराठी". Right: `Preview` + `Send broadcast →` (berry primary).

**State 02 extras** (when the broadcast grows into educational format):
- A **cover-photo slot** appears at the top of the body region — 16:5 aspect, rounded, with Replace/Remove actions on hover.
- A **summary section** with rounded bullet items (white card, `border-radius: 10px`, each bullet ~12px vertical padding).
- A **warning block** — soft-red background `rgba(179,58,58,0.06)`, red border `rgba(179,58,58,0.25)`, red icon. Includes "Remove section" link in the field-label row.
- A **dictation overlay** strip — appears inline between the language toolbar and the rest of the form when the vet is dictating. Berry-tinted (`var(--berry-soft)`), berry border, with pulsing mic icon, "Dictating · 0:34" label, and "Stop & insert" button.

### 2. Custom audience popup

Opens when the vet clicks **Custom…** (State 01) or **Edit filters** (State 02).

**Layout:**
- Backdrop: `rgba(15, 12, 10, 0.45)` + `backdrop-filter: blur(4px)`, fixed full-viewport, `z-index: 1000`.
- Card: centered, `max-width: 760px`, `max-height: calc(100vh - 64px)`, `border-radius: 16px`, `box-shadow: 0 30px 80px -20px rgba(0,0,0,0.5)`. Three regions:
  - **Header** (white, bottom-bordered): h3 "Who's this for?" + sub "Narrow this broadcast with conditions. Audience size updates as you change them." + close `×` button (top-right).
  - **Body** (scrollable, canvas background): a single **Condition group** card.
    - Group label "CONDITION GROUP A" (uppercase, tracked, ink-50) + group actions (duplicate, remove) top-right.
    - Conditions stacked, each with grid `64px 130px 36px 1fr`:
      - **Connector** chip (Where / And) — uppercase, tracked, gray pill.
      - **Field name** (Species, Age range, Deceased pets, Last visit) — DM Sans 600 14.5px.
      - **Operator** word (is / within) — DM Sans 400, ink-50.
      - **Value** control — varies per row:
        - Segmented pill control (`.seg`) for multi-choice (species, deceased pets, last visit).
        - Number inputs for ranges (Age range from N to M years).
    - Each `.seg` has a 3px padding, 8px radius, `var(--canvas-2)` track, with the on-button in berry (`#823159`) and white text. Off-buttons are ink-70 transparent.
    - "Add condition" dashed-border ghost button at the bottom of the group.
  - **Footer** (white, top-bordered): left summary "**187 pets** · 142 households · 73% of dog parents", right actions Cancel + Apply audience (berry primary).
- Close mechanisms: × button, Cancel button, Apply button, Esc key, backdrop click all dismiss the modal.

### 3. Mobile preview overlay

Opens when the vet clicks **Preview as parent** (page header) or **Preview** (send footer).

**Layout:**
- Backdrop: `rgba(15, 12, 10, 0.55)` + `backdrop-filter: blur(6px)`, fixed full-viewport.
- Centered two-column stage (`grid-template-columns: minmax(260px,320px) 380px`, gap 56px):
  - **Left column (meta)** — white-on-dark explanatory text:
    - Eyebrow "PREVIEW AS PARENT"
    - h3 "This is what Gabby's family will see." (the pet's first name uses Spectral italic 600 inline if rendered — see Typography section)
    - Paragraph explaining what's being shown.
    - "Channels" card: rounded box on faint white tint, listing delivery channels:
      - Push to Pawkit Parents app · N devices (green dot)
      - WhatsApp · off for this broadcast (muted, gray dot)
    - "Close preview · esc" button.
  - **Right column (phone frame)** — 380×760 iPhone-like frame:
    - Outer body `#0F0C0A`, 12px padding, 46px radius, inset white-tint border, drop shadow.
    - Top notch (`::after` pseudo, 110×28).
    - Inner screen `#F5F2EC`, 36px radius, overflow hidden, flex column.
    - Status bar (height 48): time "9:41" + signal/wifi/battery icons.
    - App bar: back arrow + "From your vet" title + share icon.
    - Body (scrollable):
      - Sender row: AMS avatar (berry, 36×36), clinic name + timestamp, "for [Pet name]" pill on the right (pet name in Spectral italic).
      - **For educational previews:** cover-photo placeholder (height 130, striped warm gradient).
      - Title (DM Sans 600, 22px, letter-spacing -0.012em).
      - **For educational previews:** summary card (white, rule border, 14px radius) with bulleted list (berry bullets).
      - Body text (DM Sans 400, 14px / 1.55).
      - **For educational previews:** warning card (soft-red bg, red border) with bullet list (red bullets).
      - CTA row: secondary "Call hotline" / "Book a check-up" + primary berry "Reply to AMS" / "Message AMS".
    - Home indicator bar at the bottom (110×4, ink, 50% opacity).
- Close mechanisms: explicit close button, Esc key, backdrop click.

## Interactions & Behavior

- **Modal open/close**: All three overlays (custom audience, mobile preview x2) follow the same pattern — `.open` class toggles `display: flex`; Esc, backdrop click, and explicit close buttons remove `.open`.
- **Segmented controls (`.seg`)**: Click toggles `.on` class on the clicked button, removes from siblings. Single-select within a control.
- **Language tabs (`.lang-tabs`)**: Single-select, same pattern. Toggling between English / मराठी should swap the title/body content.
- **Mic button**: Toggle `.recording` class; when recording, show the dictation overlay strip inline above the title field.
- **Dictation overlay "Stop & insert"**: Stops recording, fills title + body + any matched section fields with the dictated content (the AI sorts speech into the right fields server-side).
- **Add chips**: Click adds the corresponding section (summary / warning / when-to-call / cover) to the form and removes the chip from the list. Each added section has its own "Remove section" link inside.
- **Custom audience modal**: Audience-count footer updates live as conditions change. The composer's audience strip updates after Apply.
- **Mobile preview**: Renders the current draft content (title, body, summary, warning, cover) inside the phone frame. Pet name in the "for [Pet]" pill is sampled from the current audience (Gabby for All parents, Bruno for dog parents, etc.).
- **Autosave**: "Autosaved Ns ago" updates as the user types; debounce at ~2s of inactivity.

## State Management

- **Draft state**:
  - `audience` — `{ type: 'all' | 'custom', conditions: ConditionGroup[], pillLabel: string, petCount: number, householdCount: number, sampleParents: Pet[] }`
  - `language` — `'en' | 'mr'` (active editing language; both versions stored separately).
  - `autofillTranslation` — boolean (auto-fill मराठी after sending toggle).
  - `title` — `{ en: string, mr: string }`
  - `body` — `{ en: string, mr: string }`
  - `sections` — ordered list of optional sections, each with type (`summary` | `warning` | `whenToCall` | `cover`) and content.
  - `lastAutosaveAt` — timestamp.
- **UI state**:
  - `audienceModalOpen` — boolean.
  - `previewOverlayOpen` — boolean.
  - `dictation` — `{ active: boolean, durationMs: number }`
- **Server**: `POST /broadcasts` to save draft (debounced) and `POST /broadcasts/:id/send` to send.

## Design Tokens

### Colors

```
--canvas:      #F8F7F5     /* page + card background */
--ink:         #0F0C0A     /* primary text */
--berry:       #823159     /* brand primary / CTA */
--berry-deep:  #6B1F44     /* hover state */

--ink-70:      rgba(15, 12, 10, 0.72)   /* secondary text */
--ink-50:      rgba(15, 12, 10, 0.55)   /* tertiary text, labels */
--ink-30:      rgba(15, 12, 10, 0.35)   /* placeholders */
--rule:        rgba(15, 12, 10, 0.12)   /* default border */
--rule-soft:   rgba(15, 12, 10, 0.06)   /* lighter divider */
--canvas-2:    rgba(15, 12, 10, 0.04)   /* hover / chip track */
--rail-tint:   rgba(15, 12, 10, 0.045)  /* left rail bg */
--berry-soft:  rgba(130, 49, 89, 0.12)  /* berry chip bg */
--berry-ring:  rgba(130, 49, 89, 0.28)  /* berry focus ring */

--warn:        #B33A3A                   /* warning red */
--warn-soft:   rgba(179, 58, 58, 0.06)   /* warning bg */
--warn-border: rgba(179, 58, 58, 0.25)   /* warning border */
```

### Typography

- **Primary UI font**: `DM Sans` (Google Fonts), weights 400 / 500 / 600 / 700. Loaded as a variable font with optical-size axis.
- **Pet-name accent**: `Spectral` (Google Fonts), **italic 600 only**. **Use Spectral *only* for pet names** — never for headings, titles, or anywhere else.
- **Devanagari (मराठी) script**: `Noto Sans Devanagari` (Google Fonts), weights 400 / 500 / 600. Stack as fallback after DM Sans: `'DM Sans', 'Noto Sans Devanagari', system-ui, sans-serif`.
- Body default: 15px / 1.5, antialiased.
- Tabular numerals: apply `font-variant-numeric: tabular-nums` to numeric labels (pet counts, audience size, time).

Key size/weight pairings used in the prototype:

| Use | Spec |
|---|---|
| Page h1 | DM Sans 600 / 30px / letter-spacing -0.015em |
| Card h3 | DM Sans 600 / 18–19px / -0.005em |
| Title input | DM Sans 600 / 26px / -0.015em |
| Body text | DM Sans 400 / 15px / 1.6 line-height |
| UI label | DM Sans 500 / 13–13.5px |
| Eyebrow / overline | DM Sans 600 / 11px / uppercase / letter-spacing 0.14–0.16em / ink-50 |
| Button | DM Sans 600 / 13px |
| Pet name | **Spectral** italic 600 / 14px |
| Phone-title | DM Sans 600 / 22px / -0.012em |
| Audience size big number | DM Sans 600 / 44px / -0.02em / tabular-nums |

### Spacing & radii

- Card padding: 24–32px horizontal, 20–24px vertical.
- Section gap (between form sections): 24px with rule divider.
- Button height: 36px standard, 38px on emphasis (next/send), 30px on compact controls (seg, num-input).
- Border radii: 6 (chips inside seg), 8 (inputs, small buttons), 10 (preview-btn), 12 (medium card), 14 (large card), 16 (modal), 18 (app shell outer), 46 (phone body), 36 (phone screen), 999 (pills).

### Shadows

- Modal card: `0 30px 80px -20px rgba(0,0,0,0.5)`
- Phone frame: `0 0 0 1.5px rgba(255,255,255,0.08) inset, 0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)`
- Focus ring: `0 0 0 3px var(--berry-ring)` on focus-visible for primary buttons / inputs.

## Assets

No bitmap assets are bundled. All visuals are CSS / inline SVG:

- **Logos / icons**: Inline SVG using `stroke="currentColor"`. Pull final icons from your icon library (lucide, phosphor, or the AMS-internal set). The prototype uses lucide-style outlines (1.6–1.8 stroke).
- **Clinic mark "AMS"**: 32×32 berry rounded square with white "AMS" text. Replace with the real AMS Pawkit logo asset if available.
- **Doctor avatar "SB"**: monogram placeholder. Replace with real avatar image source.
- **Pet avatars**: single-letter circular monograms. In production these should be real photos (with monogram fallback).
- **Cover photo slot**: striped warm-gradient placeholder. In production this is a real uploaded image (16:5 aspect, object-fit: cover).

## Files

The single design source is:

- `Broadcast Composer.html` — full prototype with both composer states, the custom-audience modal, and both mobile-preview overlays. Open it in a browser to interact:
  - Click **Custom…** or **Edit filters** to see the audience popup.
  - Click **Preview as parent** in either state's header (or **Preview** in the send footer) to see the mobile preview overlay.
  - Esc closes any open overlay.
