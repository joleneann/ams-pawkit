# Handoff: AMS Pawkit — Parent App

## Overview

Pawkit is the pet-parent companion app for **Animal Medical Services (AMS) Pune**. It gives pet parents a calm, durable record of every vet visit (timeline, vaccinations, invoices), a 1:1 inbox with their vet, and a one-way broadcast feed for clinic-wide updates (closures, seasonal advisories). The design centers on a "fur-match" ceremony — the app reads the dominant tone from a pet's photo and uses it as that pet's identifier throughout the product. Multiple pets per household are supported, including a respectful "memorial" state for deceased pets.

This handoff covers the **parent-facing mobile app** (Android-first, the only client surface in scope for v0). The companion vet-side "Composer" web app is out of scope here.

---

## About the Design Files

The files under `prototype/` are **design references created in HTML/CSS + React (Babel in the browser)**. They are not production code to lift directly — they are pixel-faithful mockups intended to communicate the intended look, structure, and interaction model.

Your job is to **recreate these designs in the target codebase's environment** using its established patterns, libraries, and conventions. If the target environment is React Native, lift the layout and tokens but use native primitives. If the target is native Android (Kotlin / Jetpack Compose), translate the same tokens and structure into Compose. If the project is greenfield with no existing framework, pick the framework that best fits the team and rebuild from the tokens up.

**Do not** copy `chrome.jsx`/`primitives.css` into the production tree. Use them as a specification.

---

## Fidelity

**High-fidelity.** Every screen has final colors, typography, spacing, copy, and component anatomy. All values are pulled from the locked design tokens (`prototype/tokens.css`). You should recreate the screens pixel-perfectly.

Where the prototype takes a liberty for browser rendering reasons (e.g. inline SVG icon sprites, the phosphor-icons web font), substitute the closest equivalent in the target stack (e.g. `@phosphor-icons/react`, `phosphor-android`, or an SVG asset pipeline).

---

## Tech & Platform Notes

- **Target platform:** Android mobile, 380×780 design viewport (≈ 2x density). The design assumes a portrait phone with a safe-area + status bar. Tablet/landscape are not in scope for v0.
- **Languages:** English + Marathi. The language is a single user-level setting (see Settings); the app — including broadcasts — renders entirely in the chosen language. **There is no in-screen language toggle.** Marathi body copy uses the Devanagari font and bumps body size +1px.
- **Icon library:** Phosphor (regular weight). Loaded as a web font in the prototype; in production, use the Phosphor package native to the target stack.
- **No emoji.** No drop shadows except the focus ring (`--shadow-focus`) and the primary-button micro-shadow (`--shadow-btn`).
- **No pure `#FFFFFF` / `#000000`** anywhere in the chrome — use the canvas/ink ladder below.

---

## Information Architecture

5-tab bottom nav, icon-only. Pets sits dead-center.

| # | Tab          | Icon (Phosphor) | What it is                                                            |
|---|--------------|-----------------|-----------------------------------------------------------------------|
| 1 | Broadcasts   | `megaphone`     | One-way clinic-wide feed.                                              |
| 2 | Community    | `users-three`   | V3+ teaser, non-functional in v0.                                      |
| 3 | **Pets**     | `paw-print`     | The home of the app. Each pet has its own page (multi-pet switcher).   |
| 4 | Inbox        | `tray`          | Per-pet 1:1 thread with the vet.                                       |
| 5 | Shop         | `storefront`    | V4+ teaser, non-functional in v0.                                      |

The active tab is rendered as a 40px berry-colored disc with a white icon (see `BottomNav` spec below).

---

## Screens / Views

The DesignCanvas in `prototype/Parent App.html` is organized into the following sections. Each row corresponds to one or more artboards in the prototype.

### 1. Onboarding (4 artboards)
- **01 · Household name** — Single text field. No OTP.
- **02 · First pet · Date** — Name, species (segmented control), breed (selector with caret), gender, DOB date picker.
- **02 · First pet · Age** — Same form, but DOB collapsed to a coarse "X years" stepper for users who don't know the exact date.
- **03 · Land on empty Pet Page** — Immediate drop into the empty pet page with a "Add a photo of Gabby" prompt.

### 2. Pet Page · fur-match ceremony (5 artboards)
This is the signature flow. After the user uploads a photo, the app reads its palette and announces the pet's "fur tone."

- **01 · Empty** — Pet page with no photo. A dashed berry-tinted prompt card invites adding a photo.
- **02 · Sampling** — Photo is dimmed under a sable wash; a horizontal palette of 10 fur dots shows which tones the system is matching against (vanilla → rust pulse "matched", others dim).
- **03 · Magic moment** — Centered toast: pet photo + tone swatch + lead "**Gabby** is a honey dog!" with a smaller secondary line offering a manual override link.
- **04 · Transformed (beat)** — Hero cover settles, Lora-italic name (40px) appears. Held for ~1.2s before the rest of the page slides up.
- **05 · Steady** — Final resting state: cover, name + gear, sub-line, three tabs (Vet visits / Vaccinations / Invoices), timeline.

### 3. Pet Page · three tabs
- **Vet visits** — Reverse-chronological timeline cards. Each card has an icon tile, title, sub-detail, date.
- **Vaccinations** — Rows with status pills (Due / Up to date / Overdue).
- **Invoices** — Rows of past invoices; tap opens the Invoice detail.

### 4. Pet Page · banner variations (above the tabs, mutually exclusive)
- **01 · Open follow-up window** — Berry-soft banner with a CTA to message the vet.
- **02 · Active reminder** — Warm-tone banner with a "due" pill.
- **03 · Quietest state** — No banner.

### 5. Multi-pet switcher
- **01 · Press-and-hold active** — A rounded dock of pet avatars slides up above the bottom nav.
- **02 · First-time coachmark** — Same dock + a "Press and hold to switch pets" speech bubble.
- **03 · After swapping to Angel** — Pet page re-renders with Angel's photo and her smoke-tone fur strip.

### 6. Inbox
- **01 · List** — Per-pet thread rows with avatars (fur-tinted ring). Memorial rows render the avatar grayscale with a wings badge.
- **02 · Thread · open window** — Composer is enabled.
- **03 · Thread · closed window** — Composer is disabled; an explainer card says when it reopens.
- **04 · Empty list** — Italic single-sentence empty state.

### 7. Broadcasts
- **01 · List** — Three card types: photo-illustrated long-form, short text-only notice, and Marathi card (rendered when the parent's app language is Marathi).
- **02 · Reading view · full payload** — Byline, headline, cover photo, body, Warning-signs box, "If serious" escalation card, share footer.
- **03 · Reading view · short notice** — Byline, headline, body, share footer.

### 8. Sharing flow
- **01 · Share sheet** — In-app sheet: 4 share tiles (WhatsApp green, Facebook blue, Email neutral, Copy link neutral). Tile chrome: 56px square, 16px radius, white glyph on brand background for tinted; ink glyph on canvas-2 for neutral.
- **02 · Public web view** — Browser chrome wraps a public, no-auth article. Open-in-app strip at the top.

### 9. Settings
- **01 · Per-pet Settings** — Pet photo, name, fur-match override entry, language override.
- **02 · Master Settings** — Account, household, language (EN/MR segmented), notifications.
- **03 · Override · Honey** — Sheet of all 10 fur tones; one selected.
- **04 · Override · Peach picked** — Live preview shows the pet page recoloring.
- **05 · Override · Smoke picked** — Live preview at a cool tone.

### 10. Memorial Pet Page (2 artboards)
- **01 · Switcher with Raffy** — In the switcher, deceased pets' photos render grayscale + wings badge. Others stay full color.
- **02 · Memorial Pet Page** — Raffy's full page. Cover photo is in **full color** (no dulling). The name row has no gear (no editing). Sub-line is italic. Timeline reads as a quiet record of past visits.

### 11. Empty states
- **Vaccinations · empty** — italic single sentence.
- **Invoices · empty** — italic single sentence.

### 12. Invoice detail
- **Invoice · 14 Mar** — Per-visit, read-only. Line items, totals, "Download PDF" + "Email copy" outline buttons.

### 13. Offline + errors
- **Offline state** — Achromatic ink + warning icon banner.
- **Three error anatomies** — Inline / blocking / recoverable.

---

## Component Inventory

All components live in `prototype/chrome.jsx`, `prototype/screens-*.jsx`, and `prototype/primitives.css`. Below is what to recreate in production.

### Frame & chrome
- `PawkitFrame` — Android device frame, status bar, content surface, gesture pill.
- `TopBar` — Back / title / right slot.
- `PageHead` — Larger title + subtitle.
- `BottomNav` — 5-tab icon nav, active tab is a 40px berry disc with white icon (z-index above the disc — both `<svg>` and `<i>` font glyphs).

### Pet page primitives
- `Cover` — Hero or compact cover image with a `tone` (fur-tone) strip beneath. Props: `tone`, `hero`, `sampling`, `empty`, `memorial`, `photo`.
- `PetNameRow` — Lora italic 600 name + gear icon. Hero variant is 40px / `line-height: 1.08` (must clear Lora descenders on g/y/p).
- `PetSubline` — One line of meta below the name.
- `TabStrip` — Berry-underlined active tab.
- `BerryBanner`, `WarmBanner` — Tinted info bars above the tabs.
- `TimelineCard` — Visit row with icon tile, title, sub, date.
- `FurDot` — Single fur-color circle with three states: normal, `dim` (0.28 opacity), `matched` (2px ring of `--canvas` + 3px ring of `--berry`).

### Avatars
- `SwitcherAv` — Circular pet avatar in the press-and-hold switcher. When `wings`, photo renders `filter: grayscale(1) contrast(0.95)` and the wings badge sits at the top-right.
- `PetAvatar` — Inbox row avatar. Memorial variant uses `filter: grayscale(0.55) brightness(...)` + wings badge.
- `WingsBadge` — 22×16 pill, canvas background, ink border, wings glyph at 11px.

### Inbox
- `pk-ibx-row` — Avatar + body + meta. `.memorial` modifier drops opacity to 0.78.
- `pk-bub` — Chat bubble. `.me` aligns left with berry background + white text; vet bubbles align right with canvas-2.
- `pk-composer` — Sticky bottom composer with mic, text input, send (berry filled circle).

### Broadcasts
- `pk-bcast` — Feed card: header (avatar + who + stamp + unread dot), cover, title, body preview, "Read full →" link. **No language toggle in this card — it was removed.**
- `pk-reader` — Article view inside the device. Header is byline + h1 + cover; then body; then `warn-box`; then `escal`; then share footer.
- `pk-share-footer` — Sticky berry-colored footer with 4 round white pills: WhatsApp, Facebook, Email, Copy link (Phosphor: `whatsapp-logo`, `facebook-logo`, `envelope`, `link-simple`).

### Share sheet (in-app)
- `ShareTile` — 56×56 rounded tile + label below. Props: `label`, `icon`, optional `tint` for brand color (WhatsApp #25D366, Facebook #1877F2).

### Settings
- `pk-setrow` — Row with label/sub on the left, control on the right.
- `pk-setrow-pet` — Pet picker row with avatar + name + fur badge.
- `pk-setrow-add` — Berry-filled "Add a pet" row.

### Buttons
- `pk-btn.primary` — Berry filled, white text, subtle inner highlight, `--shadow-btn`.
- `pk-btn.outline` — 1px ink border, transparent. Used for secondary actions ("Download PDF", "Email copy").
- `pk-pill` — Status pills: `.berry`, `.ink`, `.dim`.
- `pk-toggle` — iOS-style toggle. On = berry track.

### Icons (Phosphor regular)
The sprite/font supports at least: `paw-print`, `tray`, `megaphone`, `gear`, `microphone`, `paper-plane-tilt`, `magnifying-glass`, `arrow-right`, `check`, `chat-circle`, `clock`, `warning`, `x`, `floppy-disk`, `plus`, `calendar`, `dots-three`, `syringe`, `heart`, `camera`, `house`, `bell`, `users-three`, `storefront`, `envelope`, `link-simple`, `whatsapp-logo`, `facebook-logo`, `share-network`, `map-pin`, `phone`, `download-simple`, `arrow-left`. Custom: `wings` (SVG sprite, used for memorial badge).

---

## Interactions & Behavior

### Fur-match ceremony (Pet page · Empty → Steady)
1. User uploads photo from the Empty state prompt.
2. Cover dims under a `--fur-sable` overlay at 0.86 opacity. A horizontal "scan" line sweeps once (~600ms).
3. Palette dots: 4 closest tones get the `matched` berry ring; the other 6 dim to 0.28 opacity. ~1.6s.
4. Sampling overlay fades out. Magic-moment toast slides in centered: pet photo + tone swatch + "**<name>** is a <tone> dog!". Stays ~2.4s.
5. Toast fades, cover re-paints in full color, name renders at 40px Lora italic.
6. ~1.2s beat (Transformed state) before the tabs and timeline slide up into the Steady state.

### Multi-pet switcher
- **Trigger:** Press-and-hold the Pets tab in the bottom nav.
- **Animation:** Dock slides up from the bottom nav (~150ms, `cubic-bezier(0.2, 0.8, 0.2, 1)`).
- **First-time:** Show a small "Press and hold to switch pets" coachmark above the active pet for 4 seconds, then fade.
- **Swap:** Release on a pet to switch — the Pet page re-renders with that pet's cover, fur strip, and name.

### Broadcasts
- **Language:** Each broadcast is authored by the vet in EN and MR. The client renders whichever language matches the parent's app setting. **No per-card toggle.**
- **Unread dot:** Shown on the first card if it hasn't been opened yet.
- **Reading view:** Tap a card to push the full reader. Share footer sticks to the bottom of the device.

### Sharing
- **Share sheet:** Tapping any tile invokes the OS-level intent for that channel and pre-populates the public URL.
- **Copy link:** Copies the public URL to clipboard, shows a brief toast.

### Inbox
- **Open window:** Composer enabled. Send button is berry filled when input is non-empty.
- **Closed window:** Composer disabled; replace with an explainer card. The parent can still scroll history.

### Memorial
- **In the switcher and inbox list:** photo renders grayscale + wings badge.
- **On the Memorial Pet Page (full page):** the hero cover photo is **full color** (we explicitly do not dull deceased pets on their own page). The gear icon is hidden — no editing. The name row uses standard ink color (not memorial dim). The pet's record is read-only.

### Motion tokens
- `--duration-quick: 120ms` — micro-feedback (button press)
- `--duration-base: 150ms` — most transitions (panels, tabs)
- `--duration-slow: 240ms` — multi-property transitions (fur-match beats)
- `--ease: cubic-bezier(0.2, 0.8, 0.2, 1)` — every motion in the app

### Focus & accessibility
- Focus ring is the **only** allowed box-shadow in chrome: `0 0 0 3px var(--berry-ring)`.
- Tap targets ≥ 44×44 px.
- Marathi: Devanagari font; body size +1px to compensate for x-height.

---

## State Management

Most screens are pure views. The following are app-level state concerns the developer should plan for:

| State                       | Source / shape                                                       |
|-----------------------------|----------------------------------------------------------------------|
| Authenticated household     | One household → many pets. Persisted server-side after onboarding.   |
| Active pet                  | One pet at a time on the Pet page. Persists between launches.         |
| Pet records                 | Per pet: name, species, breed, gender, DOB, photo URL, fur tone, status (`alive` / `memorial`). |
| Fur tone                    | Either inferred from the photo or manually overridden. Stored on the pet record. |
| Timeline / Vaccinations / Invoices | Per-pet, server-fed, paginated reverse-chronological.          |
| Inbox threads               | One per pet. Read state per message.                                 |
| Broadcasts feed             | Household-wide. Read state per broadcast.                            |
| Language                    | One user-level setting (`en` / `mr`). Affects ALL surfaces including broadcasts. |
| Notifications               | Standard per-channel toggles (vet messages, broadcasts, reminders).  |

---

## Design Tokens

The locked source of truth is `prototype/tokens.css`. Below is a concise mirror.

### Colors

#### Structural neutrals
| Token            | Value                  | Use                                                  |
|------------------|------------------------|------------------------------------------------------|
| `--canvas`       | `#F8F7F5`              | Card surface                                         |
| `--rail-tint`    | `#EFE6E8`              | App ground / behind device                           |
| `--ink`          | `#0F0C0A`              | Primary text, structural strokes                     |
| `--ink-soft`     | `#5C5550`              | Secondary text                                       |
| `--ink-faint`    | `#8F8B86`              | Placeholder elements                                 |
| `--ink-70/50/30` | rgba ladder of `--ink` | Tertiary text and iconography                        |
| `--rule`         | `rgba(15,12,10,0.12)`  | Hairlines                                            |
| `--rule-soft`    | `rgba(15,12,10,0.06)`  | Soft dividers                                        |
| `--canvas-2`     | `rgba(15,12,10,0.04)`  | Tinted recess                                        |

#### Brand (Boysenberry)
| Token          | Value                  | Use                                                  |
|----------------|------------------------|------------------------------------------------------|
| `--berry`      | `#9C2B5C`              | Primary CTA, active states, focus, vet bubbles       |
| `--berry-deep` | `#7C1F47`              | Hover, accents on tinted backgrounds                 |
| `--berry-soft` | `rgba(156,43,92,0.12)` | Active nav background, banners                       |
| `--berry-ring` | `rgba(156,43,92,0.30)` | Focus ring                                           |

#### Fur tones (pet-fur matching ONLY — never chrome)
`--fur-milk #FFFCF2` · `--fur-vanilla #EAE0C8` · `--fur-honey #E5C896` · `--fur-peach #E8A87C` · `--fur-rust #B05E2E` · `--fur-mushroom #A8927A` · `--fur-smoke #8B928A` · `--fur-steel #5F6961` · `--fur-bark #5C4A3A` · `--fur-sable #2B221A`

The only chrome use of `--fur-sable` is the temporary overlay during the Sampling state of the fur-match ceremony.

#### Brand colors (third-party, share tiles only)
- WhatsApp green: `#25D366`
- Facebook blue: `#1877F2`

### Typography

**Families**
- `--font-inter` — Inter (400/500/600/700) — body, UI, headings
- `--font-lora` — Lora italic 600 ONLY — pet name hero
- `--font-devanagari` — Noto Sans Devanagari (400/500/600) — Marathi

**Scale (the only allowed sizes)**
| Token              | Size  | Line height |
|--------------------|-------|-------------|
| `--text-xxs`       | 10px  | 14px        |
| `--text-xs`        | 11px  | 16px        |
| `--text-sm`        | 12px  | 18px        |
| `--text-base`      | 13px  | 19.5px      |
| `--text-md`        | 14px  | 20px        |
| `--text-lg`        | 17px  | 22px        |
| `--text-xl`        | 20px  | 25px        |
| `--text-2xl`       | 22px  | 26px        |
| `--text-3xl`       | 26px  | 29px        |
| `--text-display`   | 48px  | 48px        |

**Semantic styles**
- `h1` — `--text-3xl` / 600 / `-0.01em`
- `h2` — `--text-2xl` / 600 / `-0.005em`
- `h3` — `--text-lg` / 600
- `eyebrow` — `--text-xxs` / 600 / uppercase / `letter-spacing: 0.14em` (invariant — never change)
- `pet-name-hero` (Lora) — 40px / `line-height: 1.08` (the line-height is critical: Lora's italic descenders on g/y/p clip below 1.05)

### Spacing
4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 56 (px). Use `--space-N` tokens.

### Radii
- `--radius-sm` 8 — buttons, inputs
- `--radius-md` 10 — fur swatches, icon cells
- `--radius-lg` 12 — surface cards
- `--radius-xl` 14 — page cards, KPI cards, inbox row
- `--radius-pill` 999 — badges, tabs, eyebrow chips

### Elevation
Tonal only. The **only** allowed `box-shadow` in chrome:
- `--shadow-focus` — `0 0 0 3px var(--berry-ring)` (focus ring)
- `--shadow-btn` — `0 1px 2px rgba(15,12,10,0.04)` (primary button only)

Bottom-nav active disc and primary buttons may add a `inset 0 1px 0 rgba(255,255,255,0.18)` inner highlight. No drop shadows.

---

## Copywriting Notes

- **Tone:** Calm, plain English. The vet's voice is professional and warm. Avoid exclamation marks except in the magic-moment toast.
- **Pet names** are always italicized when inline (Lora italic 600) — see "**Gabby** is a honey dog!"
- **Empty states** are a single italic sentence. No illustrations, no CTAs in empty states.
- **Errors** are achromatic: ink text + warning icon. No red except where the destructive token applies (rarely used in v0).
- **Marathi:** Don't transliterate. Marathi-language broadcasts and screens use the Devanagari font and locally-authored copy.

---

## Assets

Under `prototype/assets/`:
- `logo-pawkit.svg` — Full Pawkit wordmark (italic Lora P + sans "awkit").
- `logo-mark.svg` — Just the italic P mark.
- `phosphor-sprite.svg` — Inline SVG sprite, includes the custom `i-wings` glyph for the memorial badge. In production, ship `wings.svg` as an asset and use the standard Phosphor package for everything else.

Sample photos used in the prototype come from Unsplash and are placeholders only. In production, replace with user-uploaded pet photos.

---

## Files

```
prototype/
├── Parent App.html          ← Entry point. Open in a browser to view the canvas.
├── app.jsx                  ← Mounts the DesignCanvas with all sections.
├── design-canvas.jsx        ← Pan/zoom design-canvas shell.
├── android-frame.jsx        ← Device-bezel component.
├── chrome.jsx               ← Shared primitives: PawkitFrame, BottomNav, TopBar, Cover, BottomNav, PetAvatar, Icon, etc.
├── tokens.css               ← LOCKED design tokens (mirror in production).
├── primitives.css           ← Component CSS (use as styling spec).
├── screens-onboarding.jsx
├── screens-pet-page.jsx     ← Fur-match ceremony + tabs + banners + switcher + memorial.
├── screens-inbox.jsx
├── screens-broadcasts.jsx   ← List + reader + share footer + public web view.
├── screens-settings.jsx     ← Per-pet, master, fur-match override sheets.
├── screens-misc.jsx         ← Invoice detail, empty states, errors, offline, teasers.
└── assets/
    ├── logo-pawkit.svg
    ├── logo-mark.svg
    └── phosphor-sprite.svg
```

To preview locally: open `prototype/Parent App.html` in a browser (no build step — it uses Babel-in-the-browser).

---

## Open Questions for the Developer

These are intentional gaps the design left for engineering to decide:

1. **Photo upload + tone inference** — The prototype mocks the "Sampling" state with a fixed timeline. Real implementation needs a tone-extraction service (likely client-side k-means on the dominant ROI, or a server-side endpoint). Define the contract.
2. **Push notifications** — The Settings screen exposes toggles, but the channel mapping (FCM topics, etc.) is not designed.
3. **Offline cache strategy** — The "Offline state" is shown, but the actual eviction / refresh policy is engineering's call.
4. **Search** — Inbox and Broadcasts have no search in v0. If you add it, follow the `magnifying-glass` icon and use the same berry-underline link style.
5. **Pagination** — Timelines, vaccinations, invoices, inbox, broadcasts all need pagination. The design assumes lazy-load on scroll; spinner pattern is undefined.
