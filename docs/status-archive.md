# Status archive (pre-2026-05-16)

Pre-2026-05-16 `status.md` history, extracted on the 2026-05-16 hard-cap
slim-back to keep `status.md` under the 100-line cap from `CLAUDE.md`.
Locked decisions live in `docs/decisions-log.md`; this file is the
running-prose "what we just did" summaries that accumulated in `status.md`
before the slim-back.

Latest entries here are 2026-05-15 (Satoshi removal, ground dial-down,
billing build); oldest are early May (parent-flow co-creation). Anything
older lives in git history.

---

## Previously (2026-05-15 evening cleanup pass)
**Satoshi ripped out + uppercase eyebrow tracking dropped + seed dates spread
+ 30% inbox Marathi.**
- **Satoshi gone.** The Fontshare CDN `<link>` is removed from `app/layout.tsx`,
  `--font-display` in `globals.css` now resolves to Inter, and
  `tailwind.config.ts` `display` family is Inter. Reason: Satoshi 500/700 weights
  read as "circus" on billing KPIs + broadcast titles; Inter at the same sizes
  reads as "clinical". Lora italic 600 stays for the pet-name hero only.
- **No more uppercase eyebrows.** `font-semibold uppercase tracking-[X.XXem]`
  patterns (the "BILLED · THIS MONTH" / "WHO'S THIS FOR" / etc. shouted
  sub-headings) replaced with plain `font-medium` across 10 files. Sentence-case
  i18n strings now flow through as-is. No more visual shouting. Files: billing
  client + detail, settings, all four broadcast surfaces (composer-canvas,
  audience-modal, send-confirm-modal, preview-overlay, broadcast detail), inbox
  clinical page, inbox per-pet invoice page.
- **Demo data spread.** All 150 non-Fernandes invoices + their linked visits
  redistributed evenly across Jan 1 2025 → May 15 2026 (~3.3 days apart, md5
  deterministic shuffle so re-seeds are stable). 625 non-invoiced clinical
  visits also redistributed. Fernandes invoices (3 of 153) stay locked at
  2026-05-06 because they anchor the focus thread. Earlier the demo had ~80%
  of invoices clustered in March–May 2026; now: ~27 invoices per quarter from
  2025-Q1 onward, partial 2026-Q2 = 17. Updated `scripts/seed-50-pets.mjs` so
  the schedule is reproducible.
- **30% Marathi inbox.** 17 parent messages (one per `case_type` in
  `PARENT_MESSAGES`) now have Devanagari bodies, authored manually in
  Pune-parent tone. The 17 corresponding parent users flipped to
  `preferred_language='mr'`. Existing 1 Misha sample message stays Marathi, so
  total = 18/56 = 32%. `MARATHI_PARENT_MESSAGES` dict locked in
  `scripts/seed-50-pets.mjs`.

Type-check + lint clean. Billing KPI dry-run (this-month: 8 invoices, ₹22,042
billed / ₹17,440 collected / ₹4,602 outstanding — realistic).

## Previously (this morning)
**Font stack restored + shadcn-only rule locked.**
Body DM Sans → Inter (next/font/google). Pet-name italic hero Spectral → Lora
italic 600 (next/font/google) — picked from a 4-option study at
`mockups/archive/serif-options-study.html` because Spectral read as harsh. Tailwind
classes renamed `font-spectral` → `font-serif` across 6 component files +
globals.css. Avatar primitive installed (@radix-ui/react-avatar) and used in
chrome header for clinic + vet circles. New rule: **NO hand-rolled primitives
allowed** — every button, input, textarea, popover, dropdown, segmented control,
avatar must use the matching shadcn primitive. If one's missing, install Radix
+ wrap before shipping. Locked in CLAUDE.md + decisions-log.md.

Earlier this evening: **Ground dialed down to barely-there mauve `#EFE6E8`**
after the previous "Tasteful pop" pink `#F2DEE6` read as too pink. Same evening
locked: Boysenberry primary `#9C2B5C` (saturation lift from `#823159`) +
billing search now wired (topbar → `/billing` with `?q=` filter on pet name +
household name). Two color studies for this pass: `mockups/archive/ground-pink-dial-down.html`
(picked Option D) and `mockups/archive/ground-floral-white-compare.html` (rejected
floral white because it inverts depth). Live tokens are at
`packages/design-tokens/src/{tokens.css,colors.ts,tailwind-preset.ts}`,
`apps/dashboard/tailwind.config.ts`, `apps/dashboard/app/globals.css`. Canvas
card stays `#F8F7F5`.

Earlier (same evening, superseded by the saturation re-tune above):
**Ground tone re-tuned + billing screen built.** The interim `#ECE7E8`
mauve-gray ground still read as gray overall; the saturation-lift pass above
fixed it. Settings page redesigned to three stacked cards with card-wide edit
mode (Profile / Account / Clinic) + a small ghost Sign-out button below.

Earlier this evening: **Billing screen built.** Per `claude design/billing build/`.
Top-level `/billing` route now real (not the v0.1 placeholder). KPI cards
(Billed / Collected / Outstanding warn variant), month/year/all-time picker as
the page lead (no h1, per the just-locked "no titles" rule), pill tabs
(All / Unpaid / Paid), 6-per-page ledger table, row click → `/billing/[invoiceId]`
detail. Detail page reuses the itemised-invoice viewer from the per-pet flow +
adds a "Mark paid" CTA when unpaid. Schema patch 14 adds `'unpaid'` to
`invoices.status` check + makes `paid_at` nullable. 15 of 153 seeded invoices
flipped to unpaid via SQL (every ~10th by issued-date DESC). Two-state machine
only (`paid` / `unpaid`); no due/overdue/draft distinction. Payments remain
off-platform (no in-app Pay-now). Topbar search untouched. Per-pet invoice
filters + Export CSV + new-invoice flow all deferred to v0.1. Also dropped the
Settings h1 + subtitle this evening to honor "no titles" rule across all four
workspace destinations. Vellum sweep happened mid-day (orphaned
`vellum-filter.tsx` + `.vellum` classes + CSS rule removed). Locks in
`docs/decisions-log.md`.

## Previously (this morning)
**Broadcast composer rebuild.** Three-step
`/compose` + `/audience` + `/send` flow collapsed to a single `/broadcasts/new`
page. Custom audience as a centered modal; mobile preview as a full-screen
overlay; Send as a bilingual-confirm modal. Universal voice mic replaces all
per-field mics on the composer; Sarvam Chat sectioning prompt now classifies
announcement-vs-educational and fills only the relevant fields. Schema Patch
13 adds `broadcasts.cover_image_url`. Audience filter shape v3: condition
groups with OR-union (4 fields incl. Last visit). 50-pet inbox-expansion seed
landed earlier in the day (53 awaiting threads). Locks in `docs/decisions-log.md`.

## Previously
2026-05-11 (afternoon). **Fourth path-changing lock in 2 days:
Announcements renamed to Broadcasts everywhere** for parity with the
Lucide `megaphone` tab icon and the one-way semantics. Schema rename
(`announcements` → `broadcasts`, `announcements_read` → `broadcasts_read`,
public URL `/announcements/[slug]` → `/broadcasts/[slug]`) + user-facing
vocabulary rename (parent tab + dashboard rail both rename). Schema
Patch 12 added in `docs/schema.md`. Canonical lock + rename applied in:
`docs/decisions-log.md`, `docs/schema.md`, `CLAUDE.md`,
`docs/flows/admin.md`, `docs/flows/parent.md`. Cascade then swept across
the 15 queued docs in one pass (2026-05-11 afternoon); the 3 mockup
files were skipped because Phase 2 will replace them with the
per-screen redo.

Also locked Phase 2 reference method as **two strands per screen**: 3-4
design references (WhatsApp, Linear, Telegram, Discord etc.) for UI
taste + 2-3 category competitors (Pawp, AirVet, FirstVet, Petdesk,
Klara, Rover, Wag, Vetsource, Pumpkin, MyPet etc.) for feature
grounding. The old single-list "competitor screenshots" phrasing
conflated design references with category competitors under one word;
two strands now separate the visual-ceiling research (design taste
leaders) from the category-baseline research (vet/pet apps). Revised
step (b) + (c) of `docs/decisions-log.md` Phase 2 method block, plus
`CLAUDE.md` Current phase + Working preferences sections, plus this
file's Phase + Next concrete step sections.

Naming history today: morning rename Health Kit → Announcement (Patch
11) for parity with the then-existing Announcements tab; afternoon
rename Announcement → Broadcast (Patch 12) because the megaphone icon +
one-way semantics + "broadcast" covers both short notices and long
guides more naturally.

Earlier today (2026-05-11): applied 9 flow-file fixes for the 2026-05-10
unification cascade (admin.md + parent.md); stripped stale
`## Notifications` section from admin.md (pure decision content; lock
lives in decisions-log); stripped "for v0 (no per-pet or per-channel
granularity)" clause from parent.md Settings; relocated
typical-response-time chip description from admin.md Navigation to
parent.md Inbox (chip is parent-facing UI; parent-only, not on admin);
**locked Admin Inbox Active/Inactive subtab structure** (Active = count
of parent messages awaiting vet reply; Inactive = vet-replied threads
+ closed-window threads sit there indefinitely; supersedes the prior
"single queue" lock); **replaced `docs/flows/admin.md`** with the
user's edited version, applying the Broadcasts rename sweep to three
stale labels in the publish-effects section (kit → Broadcast,
Announcements tab → Broadcasts tab, /kits/ → /broadcasts/);
**deferred product elements phase to v1+** (TealCTA button anatomy
folded into Day 1 of build; `product-elements/` directory deleted);
**restructured phase order 2026-05-11** to put per-screen UI/UX
research in parallel with visual mockups (old order had design before
research, illogical). New 6-phase order: flows → research + mockups →
microcopy → build → debug + rehearsal → demo. Phase 2 is far from done:
existing `mockups/` are reference-only (not deliverable); full per-screen
redo planned with research-first sequencing; formal per-screen research
not started. **Locked Phase 2 method** (Claude builds Pawkit mockups
from per-screen competitive research; reversed the old "user authors
mockups" rule; all screens covered with cluster picking + cohesion
check + final heuristic audit, Nielsen 10 + Pawkit-specific including
low-literacy one-handed completion, one-Teal-per-screen,
fur-token-never-in-chrome, bilingual EN+MR completeness, 8-value
spacing, vellum + depth). **Locked demo audience as Jolene + Dr Sagar only** (no third person);
stripped all AMS-staff name references from active docs (`CLAUDE.md`
Rules of engagement, `docs/demo-choreography.md` audience/scenes/
rehearsal/low-literacy-proof, `docs/risk-register.md` item 8,
`docs/build-order.md` Day 7-8 rehearsal logistics) and memory
(`project_ams_facts.md`, `feedback_independents_framing.md`,
`feedback_no_inventions.md`, `MEMORY.md`). Generic "low-literacy user"
/ "support staff" framing throughout. Demo flow simplified to
single-phone (Jolene drives the parent-app demo while Sagar watches);
pre-demo rehearsal keeps a separate unbriefed stand-in for usability
testing only. Frozen session-logs untouched per discipline. Also researched Sarvam STT alternatives (Soniox
/ Deepgram / Reverie pre-qualified as Plan B/C; no doc changes from
research).

Yesterday (2026-05-10): two path-changing decisions (Health Kit
unification + no-Sagar-push); four UI refinements (banner two-row card,
settings gear inline, fur-match Transformed mirror, app icon provenance).

Evening (2026-05-11): **Phase 1 admin narrative walk completed.** All 5
sections of `docs/flows/admin.md` walked against current locks. Locks
landed: dashboard search bar context-aware (Inbox = patient/parent
records; Broadcasts = keyword; Settings = hidden); dimensions and
color placements deferred to Phase 2 (brand palette stays locked per
v1.3, but specific dimensions are working drafts); Inbox row
composition (pet name + picture/fur-ring + household + time since send;
text-only preview, media-strings via microcopy); Broadcasts rail item
subtabs (Drafts + Published, both on left menu); Broadcast lifecycle
(drafts auto-save; edit-after-publish allowed; delete-after-publish
allowed, push notification that already fired cannot be unsent); **v0
AI scope expanded to TWO features** (Sarvam Audio + Sarvam Translate
for EN ↔ MR Broadcast auto-translation with sequential approval;
bilingual hard publish-block enforces both reviewed); audience filter
species (dogs, cats, or both — was wrongly "all dogs only" before
today); dashboard chrome fully bilingual (EN/MR toggle in admin
Settings only); vet license display Settings-only (never in
`<VetByline />`); admin.md Section 5 reframed (hand-seeded visit data
is demo staging, NOT a v0 product feature; SOAP note layer via Sarvam
Audio + Claude structuring is a pre-launch buildable, not a v1+
"vision"). Supabase storage buckets cleaned via UPDATE-in-place
(`kit-covers` → `broadcast-covers`; `broadcast-attachments` →
`messages-videos` with public flipped false). Storage RLS for
`messages-images` and `messages-videos` logged as Day 1 build TODO.
v1+ multi-user household design (5 questions) logged in
`docs/open-issues.md` Deferred to v1+ section.

## Phase
Pre-build co-creation, restructured 2026-05-11 (new 6-phase order: flows →
research + mockups → microcopy → build → debug + rehearsal → demo).
**Phase 1 admin narrative walk: DONE** (2026-05-11 evening). Phase 1 parent flow still in user edit pass. **Phase 2**
(UI/UX research per screen + visual mockups, in parallel) is far from
done. Method locked 2026-05-11 (see `docs/decisions-log.md` Platform and
demo target): Claude compiles two reference strands per screen (3-4
design refs + 2-3 category competitors) + builds HTML/CSS Pawkit
mockups for each direction → user picks per screen in clusters
→ cohesion check after each cluster → final heuristic audit (Nielsen 10
+ Pawkit-specific). All screens covered (not hero-first). Existing
`mockups/` files are reference-only, not deliverable. Product elements
phase removed entirely 2026-05-11; TealCTA anatomy folded into Day 1
of build foundations.

## Done (locked; see `docs/decisions-log.md` for state, `session-logs/` for rationale)
- Flows co-created (admin May 2, parent May 2).
- **Phase 1 admin narrative walk done 2026-05-11.** All 5 sections of `docs/flows/admin.md` walked against current locks; ~15 locks landed across active docs + memory.
- Brand v1.3 + Premium Feel System Branch B locked (palette v1.3, typography,
  9 cross-cutting disciplines specced under `docs/premium-feel/`).
- Key-hero exploration mockups exist in `mockups/` (Pet Page hero, admin
  shell, parent shell, premium components, app icon options) as
  REFERENCE-only material; not deliverable. Figma path abandoned
  2026-05-06. Full per-screen redo with research informing the new
  mockups = Phase 2 (in progress, far from done).
- Supabase project `pevofxnfjcvmamdcfkus` provisioned. Schema (12 tables + 12
  patches all baked into `0001_init_schema.sql`; Patch 10 unifies broadcasts
  into a single content table + creates pet_reminders; Patch 11 renames
  that table to `announcements`; Patch 12 renames it again to `broadcasts`),
  RLS policies, anon-read demo policies, Fernandes anchor + 199 synthetic
  Pune households.
- `packages/match-logic` algorithm + 17/17 vitest fixtures passing
  (centre-crop, k-means k=3, ΔE2000 fur-tone matching).
- Monorepo scaffold live (pnpm + Turborepo + design-tokens + Tailwind preset).
  Both apps boot.
- Expo SDK 51 to 54 bump complete 2026-05-06. `react-native-worklets` pinned
  to `0.5.1` to match Expo Go SDK 54's bundled native ABI.
- 6-tab icon-only parent nav + per-pet inbox + master Settings + Per-pet
  Settings locked 2026-05-09.

## Active right now

**Night session 2026-05-15: shadcn + palette audit + surface sync sweep.**
After the inbox v2 rebuild landed earlier in the day, user went to sleep
asking me to (1) hold shadcn strictness, (2) hold the locked palette,
(3) sync the rest of the build to the new surface architecture, (4)
update the mockup. All done while they slept:
- **shadcn strictness audit (clean).** Found 3 raw `<button>` elements
  in `inbox-client.tsx` (pill tabs + Load older link) and 1 in
  `soap-context-strip.tsx` (SOAP toggle pill). All refactored:
  - Pill tabs → `ToggleGroup` + `ToggleGroupItem` with the count
    badge nested inside the active item (white-on-berry flip)
  - Load older → `Button variant="link"`
  - SOAP toggle → `Button variant="outline" size="sm"` with rounded-full
  - Visit-type pills in expanded SOAP card → `Badge variant="secondary"`
  - Case chip on inbox rows → `Badge variant="secondary"`
  All raw button/input/textarea elements across `inbox-client.tsx` +
  `focus-card.tsx` + `soap-context-strip.tsx` + `compose-reply.tsx` +
  `[threadId]/page.tsx` + `queue/page.tsx` + chrome files are now zero.
- **Palette strictness audit (clean).** Grepped every inbox-v2 file for
  hex colors and off-palette Tailwind classes (red/green/blue/yellow/
  orange/pink/purple/indigo). Zero hits. Only the locked palette is in
  use: `canvas`, `ink`, `berry`, `berry-deep`/`-soft`/`-ring`,
  `ink-70`/`-50`/`-30`, `rule`/`-soft`, `canvas-2`, `rail-tint`.
- **Surface sync to non-inbox routes.** The body bg flipped to
  rail-tint earlier in the day; broadcasts/settings/billing pages
  needed their own `bg-canvas` card wrappers to lift off the new
  ground:
  - `broadcasts-list-client.tsx` — wrapped the row list in a
    `bg-canvas border-rule rounded-2xl` card, used Spectral italic
    30px for the page title (matching inbox-v2 page-title pattern),
    swapped the empty-state inner copy to Spectral italic 22px.
  - `settings-client.tsx` — wrapped all sections in a single
    `bg-canvas border-rule rounded-2xl` card after the Spectral 30px
    page title; sections stack inside on canvas.
  - `billing/page.tsx` — already centered the empty-state on the
    rail-tint ground; tightened copy + max-width.
  - `globals.css` re-added the card-border softening rule
    (`.border-[1.5px].border-ink:not(.rounded-full)` → 1px rule +
    14px radius) WITHOUT the prior shadow stack — preserves the
    inbox-v2 "no drop shadows" rule but stops the legacy 1.5px Ink
    border from looking heavy on the new ground. The
    `:not(.rounded-full)` exception preserves identity circles
    (avatars, check-icon, logo slots).
- **Mockup sync.** `admin-mauve-locked.html` Screens 02 + 03 fully
  replaced with inbox v2 anatomy:
  - Screen 02: new Awaiting bar, pill segmented tabs with count
    badge, row anatomy with unread dot + fur-ring avatar + Spectral
    pet name + breed/sex/age + household + 2-line snippet + wait
    duration (oldest in berry) + case chip
  - Screen 03: focus card replacing the 1fr/468px split — pet header
    with 72px fur-ring + Spectral 32px name + bio + "Open profile"
    icon Button → expanded SOAP context strip with S/O/A/P grid →
    thread bubbles → composer with language toggle + Attach + Voice
    + Send
  - Billing nav added to all 9 rail blocks in the mockup via
    replace_all
  - Doc-header eyebrow bumped to "v1.5 · Mauve + Inbox v2"
  - New tokens (rail-tint, canvas-2, ink-70/50, rule, rule-soft,
    berry-soft, berry-ring) added to the mockup's `:root` block
  - `.frame` background flipped to rail-tint; chrome-header +
    chrome-rail backgrounds set to transparent so the frame ground
    shows through
- **Verification (final).** TypeScript zero errors. `pnpm next build`
  clean across 14 routes. Dev server boots in 2.2s. All 9 dashboard
  routes return 200: `/inbox`, `/inbox?status=replied`,
  `/inbox/queue`, `/billing`, `/settings`, `/broadcasts`,
  `/broadcasts/compose`, `/broadcasts/audience`, `/broadcasts/send`.

The codebase is in a coherent state for review in the morning. Live
dashboard renders the inbox v2 lock end-to-end; the mockup matches.

**Inbox v2 rebuild landed 2026-05-15 (handoff from `claude design/`).**
Per the design lock at `claude design/README.md`, the inbox was rebuilt
end-to-end (all four states + chrome). Eight phases shipped:
- **Phase 1 — Surface architecture.** Body bg flipped from `bg-canvas`
  (cool off-white) to `bg-rail-tint` (`rgba(15,12,10,0.045)`) so top bar
  + rail + content area form one continuous "ground". `canvas` is now
  reserved for cards/objects that "lift" off the ground. **All drop
  shadows removed** — elevation is purely tonal contrast + 1px `rule`
  hairlines. New tokens in globals.css: `--rail-tint`, `--canvas-2`,
  `--ink-70/50/30`, `--rule`, `--rule-soft`, `--berry-soft`,
  `--berry-ring`, `--berry-deep`. Spectral italic font added back to
  the stack via `next/font/google` for hero pet names.
- **Phase 2 — Chrome.** Top bar rebuilt: 230px clinic column (matches
  rail width below) + 40×40 berry-filled logo circle with
  `flex-shrink:0` + clinic name DM Sans 600 16px + search bar with
  `bg-canvas` + 1px rule + 12px radius + 34×34 vet avatar circle. Rail
  rebuilt: 230px wide, no right border, **Billing nav added** between
  Broadcasts and Settings (placeholder route until data lands per
  user), Lucide stroke 1.6, active state = `bg-berry-soft` +
  `text-primary` + count badge in berry. Awaiting count threaded from
  `getActiveThreadCount` through Shell → Rail badge.
- **Phase 3 — Inbox list view.** New **Awaiting bar** above the list:
  `bg-canvas` card with Spectral italic 22px "N parents are waiting on
  you" + primary "Start reply queue →" CTA. Row anatomy rebuilt:
  `[unread dot 8px berry] [pet avatar with fur ring + photo] [who: pet
  name Spectral italic + breed/sex/age + household + 2-line snippet]
  [wait duration + case chip]`. Wait duration computed from latest
  parent message `created_at`, formatted as "1d 4h" / "6h" / "1h" — the
  oldest awaiting row renders this in `text-primary` (berry) to draw
  the eye. Case chip pulls from each pet's latest visit `chief_complaint`
  via a new `visits` table query batched per page render. Tabs swapped
  to pill segmented control with count badges that flip white-on-berry
  when active. **Pet fur rings kept** (handoff said neutral monogram;
  we explicitly override per Pawkit brand discipline — real Pexels
  photos render inside the fur-tone ring).
- **Phase 4 — Focus card + reply queue.** Brand-new shared component
  `components/inbox/focus-card.tsx`: 72×72 pet avatar + Spectral 32px
  pet name + bio line + "Open pet profile" icon button → embedded SOAP
  context strip (collapsible — collapsed by default, expanded shows
  S/O/A/P grid + "Open full clinical history" link) → thread bubbles
  → composer slot. **The 468px right pet panel was dropped entirely** —
  SOAP/clinical/invoices now live inline. New
  `components/inbox/soap-context-strip.tsx` handles the collapsed/expanded
  states. New route `app/(dashboard)/inbox/queue/page.tsx` for focus
  mode with progress bar ("N of M" + 96×6 berry fill bar). Single-thread
  `[threadId]/page.tsx` uses the same FocusCard sans progress bar.
  Auto-advance logic: on Send, query oldest-first awaiting threads,
  pick next, navigate. Skip pushes current to end via
  `?skipped=<id>` query param. Empty queue → redirect to `/inbox`
  (renders inbox zero).
- **Phase 5 / 6 — Replied list + Inbox zero.** Folded into
  `inbox-client.tsx` alongside the awaiting list. Replied rows use the
  same anatomy with "**You:**" prefix on the snippet + a "Load older
  →" foot link. Inbox zero: centered 64px check-circle (1.5px solid
  Ink + Lucide check 28×28) + Spectral italic 36px "Inbox zero." +
  DM Sans 500 15.5px "Every parent has heard back from you. Go grab a
  chai." Renders automatically when the active list has 0 threads.
- **Phase 7 — Attachments wired.** New `uploadAttachmentAction` in
  `inbox/[threadId]/actions.ts` accepts a FormData blob, routes by
  MIME type to `messages-images` or `messages-videos` Supabase bucket,
  returns the public URL. `sendReplyAction` extended with optional
  `{attachmentUrl, attachmentType}` opts that get persisted alongside
  `body`. `getThreadBubbles` extended to select `attachment_url` +
  `attachment_type`. FocusCard renders `<img>` / `<video controls>`
  inline above the body text. Composer gains a Paperclip "Attach"
  button + file picker + 10MB cap + preview chip with remove. Schema
  was already attachment-ready (`attachment_type` + `attachment_url`
  columns on `messages` since 2026-05-04 init).
- **Phase 8 — Verification.** TypeScript zero errors. Fresh dev server
  boots in 2.3s. All 9 routes return 200: `/inbox`,
  `/inbox?status=replied`, `/inbox/queue`, `/billing`, `/settings`,
  `/broadcasts`, `/broadcasts/compose`, `/broadcasts/audience`,
  `/broadcasts/send`. Deleted: `inbox/[threadId]/pet-panel-tabs.tsx`
  (replaced by FocusCard's embedded SOAP). i18n addition:
  `chrome.rail.billing` key (EN: "Billing", MR: "बिलिंग").

**Hero token renamed teal → berry (2026-05-15 cleanup).** After the v1.3
Teal/Paper build was deleted 2026-05-14, the legacy `palette.teal` /
`--teal` / `bg-teal` className had been kept as a backward-compat alias
(it resolved to Boysenberry). Misleading. Renamed everywhere:
`palette.berry`, `--berry`, `--berry-rgb`, `bg-berry`. Six files: tokens
(`colors.ts`, `tokens.css`, `tailwind-preset.ts`, `tailwind.config.ts`),
the focus-ring + rail active-state CSS in `globals.css`, and the one
consumer using the raw className (the "Broadcast sent" success banner in
`broadcasts/send/page.tsx`). Most code uses `bg-primary` from shadcn,
not `bg-berry` directly, so the consumer footprint was tiny. TypeScript
+ dev server boot clean; `/inbox`, `/broadcasts/send`, `/settings` all
return 200.

**Mauve-only build (locked 2026-05-14, late). v1.3 Teal/Paper deleted.**
After four passes of refinement on the alt mauve theme, user decided
to delete v1.3 entirely and ship mauve as the only theme. The
`data-theme="mauve"` switching machinery and the Settings Appearance
toggle are gone. The mauve build is now just "the build".
Cascade applied:
- **`packages/design-tokens/src/colors.ts`** — `paper` flipped to
  `#F8F7F5` (cool off-white), `teal` flipped to `#823159` (Boysenberry),
  `inkFaint` bumped to `#8F8B86`. The `teal` property name is kept
  for backward-compatible Tailwind class resolution (`bg-teal`,
  `border-teal`, etc.) but now resolves to Boysenberry — no
  className churn across the consumer surfaces.
- **`packages/design-tokens/src/tokens.css`** — same flip for
  `--bg-canvas`, `--bg-canvas-rgb`, `--text-muted`, `--teal`,
  `--teal-rgb`.
- **`apps/dashboard/app/globals.css`** — completely rewritten. The
  `:root[data-theme="mauve"]` blocks (both shadcn HSL overrides and
  hex aliases + derived tokens) folded into the single `:root`
  declaration. The Phase 4a chrome adaptations (rail wash, soft cards,
  vellum-hidden, search-bar wash) re-scoped from
  `[data-theme="mauve"]` to plain `:root`. Type scale + Ink-faint
  bump + Marathi `[lang="mr"]` +1px rules all kept, no longer behind
  a data-theme gate.
- **`apps/dashboard/components/chrome/theme-controller.tsx`** — file
  deleted. The ThemeController component, `useTheme` hook, `Theme`
  type, cookie/localStorage persistence, and URL-param precedence are
  gone.
- **`apps/dashboard/app/(dashboard)/layout.tsx`** — `<ThemeController>`
  wrapper removed; layout just nests LanguageProvider → TooltipProvider
  → Shell now.
- **`apps/dashboard/app/(dashboard)/settings/settings-client.tsx`** —
  Appearance section (Theme toggle row + helper) removed, `ThemeToggle`
  helper function deleted, `useTheme` import deleted, `Palette` Lucide
  icon import deleted (only used by the dead toggle).
- **`apps/dashboard/lib/i18n-strings.ts`** — `settings.section.appearance`,
  `settings.appearance.theme`, `settings.appearance.theme.default`,
  `settings.appearance.theme.mauve`, `settings.appearance.theme.helper`
  i18n keys removed.
- **`apps/dashboard/app/(dashboard)/broadcasts/compose/page.tsx`** —
  `useUniversalMic = theme === "mauve"` conditional flattened. The
  universal voice mic is now the only voice entry point on the
  composer; per-field `<VoiceMic />` instances and the `onTranscript`
  prop on `<Field>` were deleted. The conditional `{useUniversalMic && ...}`
  wrapper around the universal mic is gone too — it just always
  renders.
- **TypeScript zero errors, all 7 routes return 200**, including
  `?theme=mauve` URL param (now a harmless no-op).

The dashboard now boots into the mauve build as default: Boysenberry
#823159 hero on cool off-white #F8F7F5 canvas, DM Sans throughout,
real Pexels pet photos seeded, Settings anchored to rail bottom, hero
color amplified across cards / vet bubbles / tabs / toggles, soft
12px-radius cards, no vellum. Nothing to switch — it's the only theme.

**Fourth-pass polish 2026-05-14: dropped Fraunces + amplified brand color.**
User flagged the Fraunces serif "Settings" heading as "absolutely
disgusting" and said the hero color was barely visible across the build.
Two-part fix:
- **Dropped Fraunces entirely.** Mauve theme now uses **DM Sans for both
  body AND display**. Cohesive geometric sans throughout, Sarvam-aligned.
  The Boysenberry hero color now carries the differentiation from the
  vet-space norm instead of the typeface. Removed the `Fraunces` import
  + variable from `app/layout.tsx`, updated `--font-display` in the
  mauve block of `globals.css`.
- **Amplified brand color across the chrome.** Five high-impact swaps:
  1. **ToggleGroup default tone** flipped from Ink-fill to primary-fill
     (every segmented pill across compose/audience/settings/inbox now
     auto-paints Teal in v1.3, Boysenberry in mauve). Renamed the old
     `default` tone to `ink` so callers can opt-in to the Ink fallback
     when needed.
  2. **Tabs active state** (Clinical / Invoices in the pet panel) now
     uses `data-[state=active]:text-primary` + `border-primary` for both
     the underline and the label.
  3. **Hero count cards** (audience-page "X pets", send-page "Sending to
     N pets", broadcast detail "Sent to N pets") all switched from
     `bg-ink text-canvas` to `bg-primary text-primary-foreground` —
     these are the biggest visual blocks per page and now reflect the
     brand.
  4. **Vet message bubbles** in the inbox thread detail flipped from
     `bg-ink text-canvas` to `bg-primary text-primary-foreground`. Dr
     Sagar's voice in every thread carries the brand color.
  5. **Broadcast "sent" confirmation banner** already used `bg-teal/10
     border-teal/30` — kept as is (it's the brand-color success state).
TypeScript clean, all routes return 200 in both themes.

**Mauve theme legibility + font + chrome polish 2026-05-14 (third pass).**
After the shadcn whole-build sweep landed, user fed back a list of polish
fixes that all landed in one pass:
- **Header font unified** — both the clinic name and the vet name on the
  header now use the body font (Inter in v1.3, DM Sans in mauve); the
  prior `font-display` on the clinic name made the two halves of the
  header read as different fonts.
- **Settings anchored to the rail bottom** in both themes via a `flex-1`
  spacer between the primary nav (Inbox + Broadcasts) and the footer nav
  (Settings). Rail reads top-to-bottom as "things you do" → "things you
  configure".
- **Ink-faint bumped** under mauve from `#A8A39E` (L≈68, ~2.7:1) to
  `#8F8B86` (L≈58, ~3.5:1) — still soft, now legible at small sizes
  on the cool off-white canvas. `border-ink-faint` similarly bumped to
  `#C9C5C0` for proportional contrast on row dividers.
- **Type scale bumped for mauve** to match the Sarvam aesthetic + give
  Devanagari a safer floor: xxs 10→11, xs 11→12, sm 12→13, md 13→14,
  base 14→15, lg 15→17, 2xl 22→26, 3xl 26→30, display 48→40 (hero
  numbers tighter, less dominating). lg/xl unchanged elsewhere.
- **Marathi-mode +1px** via `:root[data-theme="mauve"][lang="mr"]` for
  body sizes (xs/sm/md/base each +1px) when the dashboard chrome is
  in Marathi — Devanagari conjuncts need more pixel real estate than
  Latin. Wired by syncing `document.documentElement.lang` from the
  LanguageProvider on every lang change.
- **Mauve theme font swap** — DM Sans (body) + Fraunces (display).
  Both pulled via `next/font/google` in `app/layout.tsx`, exposed as
  `--font-dm-sans` and `--font-fraunces` CSS vars, then swapped under
  `[data-theme="mauve"]` by overriding `--font-body` and `--font-display`
  in globals.css. v1.3 default keeps Inter + Satoshi untouched. Noto
  Sans Devanagari stays the Marathi fallback in both themes.
- **Real pet photos seeded for the demo 5** — sourced 5 free pet
  portraits from Pexels matching each pet's breed + fur tone (Gabby
  Golden Retriever, Bruno black Labrador, Misha white Persian, Rocky
  grey curly mixed, Coco brown Indie). Downloaded locally, uploaded to
  the `pet-photos` Supabase Storage bucket (public read), set
  `pets.avatar_url` per row via SQL UPDATE. `Pet` type gained a
  `photoUrl: string | null` field; `adaptPet()` in `lib/data.ts` now
  selects `avatar_url` and maps it. `PetAvatar` renders the photo when
  present, falls back to the paw silhouette over a faint Ink wash when
  missing. Both inbox row + thread-detail header pass `photoUrl` through.
  Both themes get the photos for free (data is theme-agnostic; only the
  chrome around the photo changes).
- **Encoding incident logged:** the PowerShell command used to add
  `avatar_url` to a SELECT statement double-mojibaked `lib/data.ts`
  (read as cp1252, written as UTF-8, repeated). Reversed via a proper
  cp1252→UTF-8 roundtrip; one stray `?` at file head + the Devanagari
  regex range had to be patched manually. **Lesson:** never use
  PowerShell's `Get-Content` / `Set-Content` for source-file mutation;
  always specify UTF-8 read + UTF-8-no-BOM write, or use Edit.

**Second shadcn sweep 2026-05-14 (same day).** After the first sweep
landed Button / Dialog / Tabs / Tooltip / DropdownMenu / Sheet / ToggleGroup,
the user flagged one CTA as "filthy" (chunky locked-anatomy CTA size
read heavy under the mauve theme's softer corners) and asked to extend
shadcn discipline across the entire build. Second pass:
- **Refined `cta` size** in `Button.tsx`: `h-10 px-6 text-sm` (40px, 24px
  horizontal, 14px) replaces the previous `px-5 py-3 text-[13px]` chunky
  anatomy — shadcn-standard primary-CTA proportions, one rung above
  default and one below lg. Theme corners (4px v1.3, 8px mauve) still
  resolved through `--radius`.
- **Three new primitives ported:** `components/ui/input.tsx`,
  `components/ui/textarea.tsx`, `components/ui/badge.tsx`. Input + Textarea
  use the same `--input` / `--ring` / `--background` token bridge as the
  rest of the kit; Badge has `default` / `secondary` / `destructive` /
  `outline` variants with theme-aware `--primary` fill.
- **Every remaining hand-rolled `<button>` / `<input>` / `<textarea>` /
  badge swept** (consumer code only; the two `<input type="file">` hidden
  pickers stay raw because shadcn doesn't replace file pickers — the
  idiomatic pattern is hidden input + Button trigger, which is what we
  have). Surfaces touched:
  - Chrome `Header`: search bar (Input + Button clear), clinic logo zone,
    vet avatar zone (both Button asChild ghost)
  - Chrome `Rail`: nav items refactored to `Button asChild variant="ghost"`
    while preserving the locked 4px primary left-bar active anatomy via
    className (`border-primary` so v1.3 stays Teal, mauve flips to
    Boysenberry)
  - Inbox compose-reply: textarea → Textarea
  - Broadcast compose: slug Input, Title Input, Summary / Body / Warning
    signs / Escalation all Textarea (warning + escalation keep the locked
    NHS-Care-Card red border treatment via className override)
  - Audience page: age min/max Input, OR / WHERE / AND connector pills →
    Badge (`secondary` for connector, `outline` for WHERE)
  - Send page: OR connector → Badge, phone-preview Share CTA → Button
  - Broadcast detail: OR connector → Badge
  - Settings: inline-edit field Input across `EditableFieldRow` +
    `EditableClinicField`, Avatar / Clinic-logo upload triggers →
    `Button variant="outline" size="icon"` (12×12 circle, image fill)
  - VoiceMic: hand-rolled mic toggle → Button variant `default` (recording)
    / `outline` (idle) size `icon`; listening state now picks up brand
    primary automatically (Teal v1.3, Boysenberry mauve)
  - UniversalVoiceInput: same Button refactor, plus the "Re-record" link
    swapped to `Button variant="link"`
  - Clinical SOAP visit pills (Sick visit / Wellness / Otitis / etc.) →
    Badge `secondary`
- **Dead code removed:** the obsolete chunky-button anatomy notes from
  Button.tsx variants, the unused `EditPill` helper from settings.
TypeScript zero errors. `pnpm next build` green across all 10 routes.
Live dev server smoke-test: every route returns 200 in both default and
`?theme=mauve`. The two raw inputs that remain (file pickers) are the
shadcn-idiomatic pattern and intentionally kept.

**shadcn/ui primitives installed + dashboard refactored 2026-05-14.**
Pawkit dashboard now sits on shadcn/ui anatomy (Radix UI + cva + a Pawkit
token bridge), not hand-rolled JSX. Tokens map both themes (v1.3 Teal/Paper
default + alt Boysenberry mauve) into shadcn's `--primary` / `--background`
/ `--card` / `--ring` / `--radius` HSL vars in `apps/dashboard/app/globals.css`,
so every shadcn primitive auto-paints correctly in both themes from one set
of variant classes. `apps/dashboard/tailwind.config.ts` exposes the
shadcn-style semantic colors + radius alongside the existing Pawkit
`canvas` / `teal` aliases so old class names keep working. Primitives
ported: Button (cva with default / outline / secondary / ghost / link /
destructive / teal-cta variants + size variants including `h44` for
form-pair height parity and `cta` for the broadcast wizard), Dialog,
Tabs, Tooltip (mounted at layout level with `delayDuration={250}`),
DropdownMenu, Sheet, ToggleGroup. Refactors landed across the dashboard:
inbox compose reply (Send + Reply-in language pill), broadcast compose
wizard (Compose-in EN/MR pills + Auto-fill + Next: Audience), broadcast
audience page (Species / Deceased ToggleGroups + Add OR group + Remove +
Next: Send + Back to Compose + Edit), broadcast send page (Mark reviewed
/ Reviewed + Send to N parents + Undo + Back to Audience + Start
another + Edit), Settings (Sign-out modal swapped to Dialog, LangToggle
+ ThemeToggle to ToggleGroup, EditableFieldRow + EditableClinicField
Save / Cancel / Edit + Avatar + Logo Upload buttons to Button, dead
EditPill helper removed), pet panel Tabs (Clinical history / Invoices),
broadcast detail page EN/MR ToggleGroup, inbox subtab Active / Replied
ToggleGroup (now uses `router.push` to preserve the search-query +
server-refetch behaviour). TypeScript + production build both clean
after the pass (`pnpm tsc --noEmit` zero errors, `pnpm next build`
green across all 10 routes). Parent app deferred to Day 4–5 build — when
those screens land they will consume the shadcn pattern directly (Sheet
for the override picker, Tabs for any per-pet surfaces, Button for the
fur-match CTAs) so the parent app is born shadcn-native, not hand-rolled
then refactored.

**Alt theme exploration locked + shipped 2026-05-14: Boysenberry mauve
(#823159) + cool off-white (#F8F7F5), Sarvam-style chrome, universal voice
mic with Sarvam Chat sectioning.** All landed as a `data-theme="mauve"`
switch that co-exists with the locked v1.3 Teal/Paper default; v1.3 stays
the default both apps' default and is untouched. Toggle from Settings →
Appearance or `?theme=mauve` URL param; persists via cookie + localStorage.
Five phases delivered: (1) palette swatch explorer
`mockups/archive/pawkit-mauve-palette-explore.html` showing 3 mauves anchored to
the AMS clinic uniform; (2) refactored `@pawkit/design-tokens` preset to
`rgb(var(--*-rgb) / <alpha-value>)` form so theme swap composes with
Tailwind alpha modifiers; (3) ThemeController client component + Settings
Appearance toggle + URL/cookie/localStorage precedence; (4) Sarvam-style
chrome adaptations under `[data-theme="mauve"]` — light rail with
mauve-tinted active pill (NOT dark, per user feedback on initial mockup),
soft 12px-radius cards, no vellum, mauve-tinted search wash; (5) universal
voice mic on broadcast compose replacing the 5 per-field mics, with new
`/api/sarvam-section` route calling Sarvam Chat (Sarvam M model) to split
long dictation into Title / Body / Summary / Warning signs / Escalation.
v0 AI scope expanded from 2 Sarvam features (Audio + Translate) to 3
(+ Chat) per the lock in `docs/decisions-log.md` 2026-05-14. Parent app
theme implementation (Phase 3b + 4b) deferred to the Day 4–5 parent build;
shared tokens package is already theme-aware so NativeWind picks up the
swap when the parent build wires its own ThemeProvider context.

**Parent-app demo delivery locked as EAS release APK 2026-05-13.** The
parent app ships to the demo phone as an Android release APK built via
`eas build --profile preview --platform android`, installed from the EAS
download link or USB sideload, launched from the home-screen icon. No
Expo Go on the demo phone. Expo Go remains the dev iteration tool on a
separate dev phone or emulator. Rationale: Expo Go cold-start in
dev-tunnel mode (10–20s bundle download per launch) is too slow for
reliable demo footing; release APK boots in ~2 seconds and behaves like
any installed app. Build cadence: T-2 days before demo so rehearsal has
a 24-hour buffer for spot-fix + rebuild. See `docs/decisions-log.md`
Platform and demo target → Parent-app demo delivery for the full lock.
Cascade applied 2026-05-13 to `CLAUDE.md`, `AGENTS.md`,
`docs/build-order.md` Day 8 + Demo day, `docs/demo-choreography.md`
physical setup + failure modes, `docs/reusable-tooling.md` worklets pin
+ added EAS Build entry, `docs/risk-register.md` item 5 (camera
permissions reframed), `docs/verification-plan.md` two-phone E2E.

**UX polish pass on the live admin app completed 2026-05-13** (per
`~/.claude/plans/just-look-at-the-generic-wombat.md` 3-tier critique
authored by the second-opinion agent + executed against the rendered
Next.js dashboard, not the static mockup). Scope locked by user:
Tier A1-A4 + vellum, Tier B1-B5 + subtab rename, Tier C1 +
skeleton anatomy + empty-state copy change. Skipped: ⌘K hint chip.

Visual changes landed:
- **Satoshi font** local-hosted via `next/font/local` (weights
  400/500/700 in `apps/dashboard/public/fonts/satoshi-*.woff2`,
  pulled from Fontshare CDN once at build time; `--font-satoshi`
  CSS variable feeds the `--font-display` stack). Replaces the
  earlier Fontshare-link approach that was blocking FCP + preview
  tooling. Wordmark + page titles + hero counts now render in
  Satoshi (with Inter fallback during load).
- **Vellum SVG filter** wired via injected `<VellumFilter />` in
  the Shell + `.vellum` CSS utility class. Applied to clinical
  visit cards, parent-side conversation bubbles, audience-filter
  card on Screen 06c, delivery-channels card on Screen 06c.
  Per `docs/premium-feel/materials.md` runtime application (no
  longer a Day 6 deferral).
- **Lucide stroke 1.5** sweep across all 11 dashboard `.tsx`
  files (sed replaced `strokeWidth={1.75}` + `{2}` with `{1.5}`).
  Honours the locked v0 override per `premium-feel/INDEX.md`.
- **Depth language upgrade**: clinical visit cards + Broadcast
  send confirmation cards + parent conversation bubbles upgraded
  to `border-[1.5px]` Ink-tinted; structural row dividers stay
  1px Ink-faint.
- **Type scale tokens codified** in the Tailwind preset
  (`packages/design-tokens/src/tailwind-preset.ts`): xxs/xs/sm/md/
  base/lg/xl/2xl/3xl/display covering 10/11/12/13/14/15/17/22/26/
  48px sizes. Pawkit defaults override Tailwind's defaults (so
  `text-xs` = 11px not 12px). Spacing tokens `pk-1` through
  `pk-16` added as named utilities (Tailwind's default 4px grid
  covers most cases). Arbitrary `text-[Npx]` swept to canonical
  tokens across all dashboard `.tsx` files via sed; 4 outliers
  intentionally kept (9px phone-preview captions, 16px composer
  title input, 19px locked pet-panel name, 24px locked Audience
  page title).
- **Inbox subtab rename** Active → Awaiting reply, Inactive →
  Replied (clinical voice per the second-opinion plan; locked
  in `docs/premium-feel/voice.md` do/don't matrix +
  `microcopy/admin.md` 2026-05-13).
- **Empty-state copy** "No open windows right now. Take a breath."
  retired; replaced with "Nothing awaiting reply." (matter-of-fact,
  matches the renamed subtab; voice.md anchor flipped to Don't
  column; microcopy/admin.md `inbox.empty.active` + `inbox.empty.inactive`
  updated).
- **Quick Facts signalment compression** in pet panel: 5-row stack
  collapsed to 1-line signalment subline under pet name
  ("Golden Retriever · M · 4 years"), Weight + Last visit rows
  kept, Chronic moved into its own callout. New `signalment()`
  helper in `lib/seed.ts` composes the shorthand.
- **Chronic callout** treatment: 4px Ink left bar + AlertCircle
  Lucide + "CHRONIC" small-caps label + condition name on Paper
  card, replaces the prior hairline row. Per the agent's plan
  matches the locked banner pattern in `docs/brand-system.md`.
- **Inbox row unread/read state**: 2 rows (Rocky / Coco) marked
  `unread: false` ("vet has seen, not replied"; lighter weight +
  Ink-soft); 3 rows (Misha / Bruno / Gabby) marked `unread: true`
  (full weight Ink + 6px Teal dot indicator next to timestamp).
  `InboxThread.unread` flag added to the type.
- **Pet panel header signalment subline** under pet name (1-line
  shorthand, see B1).
- **Edited audit-trail marker** on May 6 Gabby SOAP card byline:
  italic "· edited 12m ago" suffix appended after vet byline.
  `SoapVisit.editedAgo` optional field added; nullable so other
  cards render clean. Locked anatomy refinement.
- **Focus-visible discipline** global rule in `globals.css`:
  2px Teal outline at 4px offset on every `:focus-visible`
  element; inputs at 2px offset, buttons / links / rail items
  at 4px. Browser default `outline: none` on plain `:focus`.
- **Skeleton-load anatomy**: reusable `<Skeleton>` and
  `<SkeletonCircle>` components (Ink-faint at 50% opacity, no
  shimmer per `docs/premium-feel/states.md`). `loading.tsx`
  added to `/inbox`, `/inbox/[threadId]`, `/inbox/[threadId]/clinical`,
  `/inbox/[threadId]/invoice/[invoiceIdx]` route segments —
  Next.js Suspense boundaries fire these during async route
  segment loading.

Files touched: ~20 across `apps/dashboard/`, `packages/design-tokens/`,
`docs/premium-feel/voice.md`, `microcopy/admin.md`. All 11 admin
routes verified 200 + content rendering via preview eval +
inspect.



**Phase 3b microcopy translation completed 2026-05-12.** All 225 admin
microcopy entries from `microcopy/admin.md` processed via Sarvam
Translate (`sarvam-translate:v1`, `formal` mode, `en-IN` to `mr-IN`).
212 successfully translated, 13 skipped (Latin-locked clinic
identity + already-Devanagari + placeholder-only + GSTIN regulatory
acronym), 0 failed after rerun with throttle + retry + cache. Output:
`microcopy/admin-mr.md`. Total Sarvam cost ~Rs 9.68 (across 2 runs:
first hit 429 rate limit at ~100 calls; rerun with 1-call/sec
throttle + exponential-backoff retry + JSON cache file completed
clean). Translation script kept at
`scripts/translate-admin-microcopy.ps1`, cache at
`microcopy/admin-mr-cache.json` (idempotent reruns).
**Phase 3c (Pune-native-speaker review pass) still pending.**
Known MT limitations flagged in `microcopy/admin-mr.md` preamble:
metaphor errors (e.g., "open windows" rendered as physical window),
semantic errors on technical vocabulary (e.g., transcription
rendered as transliteration), honorific calibration, dialect tuning.

**Voice.md violations in mockup cleaned up 2026-05-12** (sweep
applied to `mockups/archive/admin-locked.html` after EN microcopy locked).
9 targeted edits: 6 user-facing strings + 3 internal references to
match. Followup banner lead now present-tense + addresses pet by
name ("Dr Sagar is here for Gabby until May 16"); compose
placeholder trimmed to "Reply..."; invoice tooltips drop "Dr." with
period + replace "your pet" with pet name; Screen 06c terminal
commit CTA renamed from "Confirm and Send" to "Send to 187
parents" (uses live audience count; "Confirm" is banned per
voice.md system-jargon rule); Screen 06c sub copy rewritten to drop
"confirm" verb usage; mockup anatomy + comments updated to
reference the renamed CTA for consistency.

**Phase 4 Day 1 + Day 2 partial completed 2026-05-12.**
Apps/dashboard now has:
- `lib/utils.ts` shadcn-style `cn()` helper (clsx + tailwind-merge).
- `components/ui/button.tsx` with TealCTA + Ghost + Disabled variants
  per locked anatomy (12px 20px padding, 4px radius, Inter 13pt 600,
  8px icon gap; inline-form variant via `height44` prop for the
  Screen 03 compose-bar pair).
- Fonts wired: Inter + Noto Sans Devanagari via `next/font/google`
  (CSS variables `--font-inter`, `--font-noto-devanagari`); Satoshi
  via Fontshare `<link>` in root layout (will switch to
  `next/font/local` in Day 6 polish). `font-display` + `font-tnum`
  utilities added in `globals.css`.
- `components/chrome/{header,rail,shell}.tsx` implementing the
  locked Screen 01 anatomy (header 64px tall + grid `1fr auto 1fr` +
  28px gap; rail 240px with 4px Teal active border; Lucide icons
  mail / megaphone / settings at stroke 1.75). Search bar is
  route-context-aware: Inbox-route screens show "Search pets,
  parents, phone numbers"; Broadcasts-route shows "Search broadcasts
  by keyword"; Settings route HIDES the search bar entirely (empty
  middle grid cell preserves layout integrity) per Section 1 spec.
  Active rail item determined client-side via `usePathname`.
- Route structure: `app/page.tsx` redirects `/` to `/inbox`;
  `app/(dashboard)/layout.tsx` wraps the three real routes with
  `<Shell>`; `app/(dashboard)/{inbox,broadcasts,settings}/page.tsx`
  are minimal stubs rendering the locked empty-state copy.
  Dependencies added: `clsx` + `tailwind-merge` + `lucide-react`
  via `pnpm --filter @pawkit/dashboard add`. Dev server starts
  clean (`pnpm dev`, ready in 7.3s, no compile errors); all 4
  routes (`/`, `/inbox`, `/broadcasts`, `/settings`) verified via
  curl smoke test — correct route-context search placeholder + empty
  states render, Settings route confirmed search-hidden (0 "Search"
  occurrences in HTML).
- **shadcn init deferred** for now: chrome shell + Button primitives
  built directly with Pawkit tokens; shadcn Dialog / Tabs / Tooltip
  / Sheet primitives will be added incrementally as later screens
  need them (Day 3 brings Dialog for sign-out + Tabs for pet panel +
  Tooltip for invoice info icons).

**Phase 4 remaining (per `docs/build-order.md` Day 2-3):** Inbox
list view with row anatomy + subtabs + fur-match avatars; Inbox
thread detail (Screen 03) with conversation + pet panel + Quick
Facts + Clinical / Invoices tabs; Invoice full screen (Screen 04);
Clinical history full screen (Screen 05); Broadcast composer flow
(Screen 06 + 06b + 06c); Settings full implementation (Screen 07b
Profile + Account + Clinic + Sign out blocks). Then Day 4-5 parent
app, Day 6 polish (vellum + spacing audit + i18n + dataset), Day 7
demo seeding + rehearsal.
**Phase 2 admin Screen 01 (App shell + nav) LOCKED 2026-05-11 late
evening.** User picked Direction C (Notion-channeled) with Direction
B's filled-tint search bar, centered in the header. Full anatomy
flushed to `docs/decisions-log.md` + `docs/layout-spec.md` Section 1.
Reference mockup: `mockups/archive/phase2-01-app-shell.html` (4-direction
exploration retained as Phase 2 history).

**Phase 2 admin Screen 02 (Inbox) LOCKED 2026-05-11 late evening.**
User picked Direction C (Hey-channeled) row anatomy: 56px rows, 46px
avatar-ring + 3px fur-match ring + 40px photo, 180px sender column
stacked (pet name + household), 2-line preview wrap, relative
tabular timestamp top-right. Subtabs: Active (count + Ink underline)
/ Inactive. Active sorted oldest-waiting at top. Flushed to
`docs/decisions-log.md` + `docs/layout-spec.md` Section 2 + appended
to `mockups/archive/admin-locked.html` as Section 02.

**Phase 2 admin Screen 03 (Inbox thread detail with pet record
panel) LOCKED 2026-05-11 late evening.** User picked a hybrid: Quick
Facts treatment from **Direction A** (Linear-channeled, inline
label/value rows with 1px Ink-faint hairline dividers, NO card) +
Clinical History treatment from Direction C (Notion-channeled,
2-col editorial). Initial pick was Direction B's bordered card for
Quick Facts; revised same evening before any downstream work. Font
hierarchy tuned for cohesion: Quick Facts label Inter 12px Ink-soft
+ value Inter 13px Ink semibold tabular, mirroring Clinical
History's 12px ch-meta / 13px ch-title rhythm. Pet panel
restructured per user: header = photo + name only; Quick Facts =
Breed / Age / Weight (month) / Chronic inline / Last visit;
Clinical history scrollable below. Bubble grammar fixed: parent
Paper-LEFT, Sagar Ink-RIGHT (WhatsApp grammar). Pet panel widened
to 400px so Sagar gets the clinical depth of the killed standalone
screen without leaving the thread. Flushed to
`docs/decisions-log.md` + `docs/layout-spec.md` Section 3 +
appended to `mockups/archive/admin-locked.html` as Section 03.
**2026-05-12 follow-up updates locked:** (1) panel widened from
400px to 468px (55/45 main-area split, was effectively 62/38 at
640/400 reference); (2) Clinical history + Invoices structured as
two tabs under Quick Facts, each row tap-to-open its full screen
(Screen 04 Invoice / Screen 05 Clinical history); (3) year
markers (Inter 12px Ink-soft semibold uppercase, 1px Ink-faint
hairline above each group, suppressed on first) group dated rows
in both tabs; (4) admin media bubble overlay unlocked from
inline-scoped-to-thread to centered ~60% dashboard pop-up with
expand + close (admin-only; parent app inline-scoped behavior
preserved due to phone form factor); (5) "Mark deceased"
affordance removed from pet record panel footer (not surfaced
anywhere in v0 admin UI; pre-seeded deceased state for demo
via Raffy).

**Phase 2 admin Screen 04 (Itemised invoice) LOCKED + GRADUATED
2026-05-12.** Direction A (Stripe-channeled, classic invoice
document) picked from 4 directions in
`mockups/archive/phase2-04-invoice.html`, refined with v0 content rules: no
Paid pill, no patient/household strip, no section subtotals, no
Download PDF in v0, only Examination/Medication/Procedure categories
(no Follow-up), flexible plain-English tooltips on Examination +
Procedure only, Medication shows name + quantity + price only (no
usage instructions, no info icon), totals stack = grand Total only
with "GST included" italic note below (no Subtotal/GST breakdown
row). Total ₹3,150 for Gabby's May 6 ear infection check (7 line
items, 3 categories). Pet panel May 6 invoice updated same turn.
Directions B/C/D left as scratch reference in
`phase2-04-invoice.html`. **Appended to `mockups/archive/admin-locked.html`
as Section 04** with full anatomy block + rendered frame; TOC
updated (Screen 04 no longer pending). Cohesion check against
Screens 01/02/03 to follow before further work.

**Earlier note (now superseded by direction-locked block above):
Screen 04 was REBUILD NEEDED** because prior
`mockups/archive/phase2-04-invoice.html` and `mockups/assets/screen-04-refs/`
(stripe.svg, pulley.webp, ramp.jpg, brex.png, petdesk.png, weave.png,
vetsource.png) were deleted 2026-05-12 then user-locked as undo
same turn (admin invoice is in scope per `docs/feature-scope.md`
"Clinic dashboard" section, `docs/build-order.md` Day 3,
`docs/demo-choreography.md` scene 4 ~2min, `mockups/index.html`
admin card). File contents not recoverable (no git, no local-history
backup, full file never Read). Fresh Phase 2 rebuild required:
per-screen two-strand reference research + 4-direction HTML/CSS
Pawkit mockups + user pick. **Admin invoice access path locked 2026-05-12: contextual from pet
record panel.** Pet panel surfaces Clinical History and per-pet
Invoices as two tabs under Quick Facts (each fills 400px panel
width when active; no two-column split). Tap an invoice row in
the Invoices tab → opens view-only Screen 04 invoice screen (full
screen), with a Back affordance returning to the thread with
Invoices tab still active. No rail tab (admin nav stays Inbox /
Broadcasts / Settings). User-stated reason: AMS has not given
permission to switch system of record from VetBuddy in v0; tabbed
panel is a deliberate v0 compromise pending migration.

**Phase 2 admin Screen 05 (Clinical history full screen) locked
2026-05-12.** Full-screen view-only surface opened from Screen 03
pet record panel's Clinical History tab by tapping any row
(mirrors the Invoices tab row-tap-to-open pattern); shows
this pet's history
as SOAP notes (Subjective / Objective / Assessment / Plan per
visit), a preview of the production data-entry path that replaces
VetBuddy. v0 content hand-written per pet (Gabby's full history
for the demo). Back affordance top-left returns to thread with
Clinical History tab still active. **Phase 2 reference research
sourced 2026-05-12** (8 references in `mockups/assets/screen-05-refs/`:
NEJM via Wikimedia cover, Notion, Linear, ezyVet, Provet Cloud,
Athena Health, Digitail substituted for JAVMA, Scribenote bonus as
strongest direct SOAP-card competitor). 4-direction mockups + pick
still pending. **Production capture flow refined 2026-05-12:**
ambient AI scribe replaces prior "vet dictates" framing, invoice
auto-routes to billing desk, new non-vet support-staff role
implied for pre-launch build, AI scope expands beyond current
v0 lock; see `docs/decisions-log.md` 2026-05-12 Production SOAP +
invoice pipeline entry for full detail. **Build-vs-buy locked
2026-05-12: own orchestration** (Sarvam + LLM under Pawkit's
brand, not licensing Scribenote / VetSoap.ai / Talkatoo / etc.;
rationale: Indian language requirement, invoice extraction
integration, vertical product integration, unit economics, brand
positioning, data residency). **5 production-spec features pinned
same turn** from real-vet sentiment in r/VetTech thread: (1)
hallucination mitigation UX (low-confidence highlighting + drug
dictionary validation + mandatory edit-before-approve), (2)
conversation-as-receipt (raw transcript + audio retention for
he-said/she-said disputes), (3) discharge summary as sibling
output (bilingual EN+MR plain-language visit summary sent to
parent app), (4) multi-pet "double petter" disambiguation
(recording scoped to specific pet's surface), (5) templates
beyond SOAP for v1+ (surgery / discharge / callback / dictation).
See decisions-log.md for full detail. v0 demo (Screen 05
read-only SOAP view) unchanged.

**Direction C locked 2026-05-12** (Linear-channeled, bordered
visit cards with metadata-pill header + 80px-label SOAP grid).
Directions A/B/D become scratch reference in
`phase2-05-clinical-history.html`. **Copy flagged TBD** (esp.
metadata pill taxonomy: Sick visit / Wellness / Vaccination /
Otitis / Allergy are placeholders pending vocabulary lock; vet
byline format and SOAP body voice also pending copy pass).
**Graduated to `admin-locked.html` as Section 05 same turn**
(2026-05-12), copy left as-is per user direction (no TBD markers
on the screen itself, ugly). TOC updated; future-sections comment
narrowed to 06 + 07b. Copy revisit pending as a separate pass.

**Phase 2 admin Screen 06 (Broadcast composer) IN PROGRESS;
split into Compose + Audience+send scope-locked 2026-05-12
(sub-numbering pending).** Renumbered Screen 05 → Screen 06 on
2026-05-12 when Clinical history full screen took Screen 05 (file
rename `phase2-05-broadcast-composer.html` →
`phase2-06-broadcast-composer.html`, asset folder
`screen-05-refs/` → `screen-06-refs/`). User locked split scope:
Compose (title + body + structured sections + bilingual EN+MR +
Sarvam voice + Sarvam Translate + draft auto-save + phone preview
+ Continue → audience CTA) and Audience+send (audience filter
species/exclude_deceased/age ranges + live count chip + 15s undo +
back preserves draft). Existing 4-direction unified composer
mockup in `mockups/archive/phase2-06-broadcast-composer.html` (A Substack
/ B Mailchimp / C Notion / D Ghost) becomes scratch reference;
split execution pending (admin.md Broadcasts section update +
layout-spec section split + Phase 2 mockups per new screen).
**Sub-numbering locked 2026-05-12: Screen 06 Compose + Screen 06b
Audience+send** (mirrors 07b Settings sub-letter pattern; Settings
stays 07b, Style guide DESCOPED stays at Section 7).
**Reference research sourced 2026-05-12:**
`mockups/assets/screen-06-refs/` supplemented with mailchimp-mobile
+ stripo + beehiiv + beefree (stripo is the standout, exact Pawkit
anatomy in the wild); `mockups/assets/screen-06b-refs/` created
new with mailchimp-segments + klaviyo-segments + customerio +
substack-publish + weave-audience + hubspot-segments. **Content-format
research completed 2026-05-12** (Mayo / CDC / NHS / VCA / AKC /
Queen Creek / Preventive Vet / academic patient-education
literature). Findings flushed to `docs/broadcast-content-format.md`.
Three refinements adopted: (1) rename "Key points" → "Summary"
(CDC "At a glance" pattern); (2) add optional "Who this applies
to" microfield near the title; (3) live readability indicator in
composer (sentence length + reading grade target 8-12 words /
Grade 6-8 for AMS's ~20% low-literacy audience). NHS Care Cards
pattern locked for warning + escalation visual treatment.
Bilingual structure refined: side-by-side on dashboard composer
(current), STACKED Marathi-then-English on parent app + public
web reading view (not side-by-side, fails on phone). **Both 06 +
06b mockups built 2026-05-12** with 4 directions each on the
locked chrome: `mockups/archive/phase2-06-broadcast-composer.html`
(Compose: A faithful older-mockup-structure / B Mailchimp
sectioned wizard / C Beehiiv multi-step / D Substack minimalist)
and `mockups/archive/phase2-06b-broadcast-audience.html` (Audience+send:
A Mailchimp chip filter / B Customer.io hero count + sample
preview / C Klaviyo AND/OR groups / D Weave toggle cards). **Screen
06 Direction A locked + graduated to `admin-locked.html` as
Section 06 (2026-05-12)** with refinements: 3-step nav at top
(Compose · Audience · Send), global "Composing in: EN / MR"
toggle (replaces per-field tabs), Sarvam voice-input mic in every
field header, phone preview shrunk to 290px / 580px internal
scroll (normal mobile size), "Next: Audience →" CTA, Grade-X
readability indicator REMOVED (user-rejected as condescending).
Screen 06b reworked same turn to match (3-step nav with Audience
active added to all 4 directions). **Broadcast flow expanded to
three screens 2026-05-12: 06 Compose · 06b Audience · 06c Send.**
06b Direction C (Klaviyo AND/OR) locked with refinements: removed
"ticks live" hallucinated chrome line, age inputs restyled to
match Direction C, Publish CTA changed to "Next: Send →" across
all 4 directions (Send now lives on 06c). **Screen 06c (Send)
built same turn** at `mockups/archive/phase2-06c-broadcast-send.html` as
a single-direction file matching user-specified layout: 320px
mobile preview LEFT + audience confirmation RIGHT (hero count +
filter conditions list + delivery channels: in-app + push +
public web URL) + Back to Audience (ghost) + Confirm and Send
(Teal) + 15-second undo hint. **Both 06b and 06c graduated to `admin-locked.html` as Section
06b + Section 06c on 2026-05-12 same turn.** TOC updated (both
no longer pending); future-sections comment narrowed to just 07b.
Phone preview consistency fix applied across 06 + 06c (bezel
8px → 4px, scrollbar hidden cross-browser, phone centered).

**Screen 07 (Style guide) DESCOPED from Phase 2 design 2026-05-11
late evening.** Internal dev/design reference page, not a Phase 2
design surface; built pragmatically during the build phase.
Exploration file `mockups/phase2-07-style-guide.html` and
`mockups/assets/screen-07-refs/` deleted. Section 7 of layout-spec
stays as page-content description. **Design system CONTENT** (4
structural tokens + Teal hero + 10 fur tokens with 96×80 swatches +
hex codes · Inter / Satoshi / Spectral / Noto Sans Devanagari with
Marathi rendering sample · 3 button variants · Teal audit callout +
fur warning) now lives at the TOP of `mockups/archive/admin-locked.html` as
a compact "Design system reference" section — the key for the
locked screens below.

**Screen 07b (Settings) LOCKED + GRADUATED 2026-05-12.** Direction
A (Linear-channeled) picked from 3-direction exploration in
`mockups/archive/phase2-07b-settings.html`. Dense inline-edit single column
on 720px stage, no card chrome, small-caps section labels (Profile
/ Account / Clinic) with hairline 1px Ink-faint row dividers.
Profile section: 48px photo slot with Lucide user icon + "Upload"
pill, then Full name + Vet license + Email rows (each row 160px
label column + value flex + Edit/Add pill right). Vet license
surfaced only here, never in `<VetByline />` per byline.md lock
2026-05-09. Account section: read-only phone (no Edit pill =
read-only, Linear pattern) + EN/MR segmented pill toggle with
helper line "Changes labels and buttons in your dashboard.
Broadcasts always ship to parents in both languages." Clinic
section: plain prose lines (AMS name + Karve Road Kothrud address
+ Maharashtra + GSTIN 27ABCDE1234F1Z2 tabular + 9am-9pm hours), no
card, no edit affordance (hard-coded in v0). Full-width Ink ghost
Sign out button (no Teal; one-Teal-per-screen rule honoured by rail
active border alone). Quiet "Pawkit · v0.1" vendor mark centred at
the bottom is the only place Pawkit-as-vendor appears in dashboard
chrome (white-label discipline). Header search bar hidden per
Section 1 spec. Directions B (Stripe-channeled cards) + C
(Notion-channeled narrow-stage pencil-edits) left as scratch
reference in `phase2-07b-settings.html`. **Appended to
`mockups/archive/admin-locked.html` as Section 07b** with anatomy block +
rendered frame; TOC updated (07b no longer pending); future-sections
comment removed (all admin Phase 2 screens locked). Layout-spec
Section 7b updated same turn with full dimension + visual treatment
notes replacing the prior "deferred to Phase 2" stub.

**Cluster cohesion check (Phase 2 final pass) completed 2026-05-12.**
Static analysis across all 9 locked admin screens against chrome /
typography / spacing / color / components / density. 6 targeted
fixes applied to `mockups/archive/admin-locked.html`:
- **Settings rail icon SVG standardized** to Lucide M19.4 variant
  across Screens 01-05 (replacing older M12.22 chunky-toothed
  variant from earlier build sessions); 06 / 06b / 06c / 07b
  already on M19.4.
- **Section label weight normalized to 600** across
  `.s5-soap-label`, `.s6c-confirm-block-label`, `.s7-section-label`
  (replacing 700 weight drift introduced incrementally in newer
  screens).
- **List-row padding normalized to 12px 0** (on the 8-value scale)
  across `.pp-quick .row`, `.s4-line-row`, `.ch-row`,
  `.s7-photo-row` (replacing off-scale 11/14 drift);
  `.s7-field-row` and `.inv-row` already at 12px 0.
- **`.s6-phone-avatar` background changed** from `var(--honey)` to
  `var(--ink-faint)` (vet byline avatar inside parent-app phone
  preview was a fur-token-in-chrome violation per `dsr-fur-warning`
  rule "fur tokens pet content only, never chrome").
- **`.s6-step.done .s6-step-num` background changed** from
  `var(--teal)` to `var(--ink-soft)` (step nav done state was a
  Teal pixel exceeding one-Teal-per-screen semantic budget;
  Ink-soft fill stays distinguishable from resting light tint and
  active full Ink).
- **`.s6c-confirm-channel-row svg` color changed** from
  `var(--teal)` to `var(--ink)` (delivery channel icons were
  decorative Teal reinforcement on Screen 06c, not primary action,
  exceeding semantic budget). After fixes Screen 06c has exactly
  rail active border + Confirm and Send CTA = 2 semantic Teal
  elements (route indicator + primary action).

**Deferrals from cohesion check:** general spacing-scale sweep to
Day 6 build-time audit per `docs/build-order.md` line 71; Teal CTA
padding variance across `.s6-publish-btn` / `.s6b-next-btn` /
`.s6c-send-confirm-btn` / `.compose-send` / `.dsr-btn-teal` to
Day 1 build TealCTA anatomy lock per `docs/build-order.md`
line 14; empty/loading/error state coverage to Day 7 build-time
state check per build-order line 96. **Escalation locked
2026-05-12: one-Teal-per-screen rule interpreted SEMANTIC** (route
indicator + active-window indicator + primary action acceptable
per screen; decorative reinforcement and step nav state Teals
out of budget); full clarification in `docs/decisions-log.md`.

**TealCTA anatomy lock + pragmatic spacing-scale sweep completed
2026-05-12.** 14 targeted edits to `mockups/archive/admin-locked.html`:
7 TealCTA standardizations (canonical anatomy: padding 12px 20px,
border-radius 4px, Inter 13pt 600, 8px gap to icon, 14px icon)
across `.s6-publish-btn`, `.s6b-next-btn`, `.s6c-send-confirm-btn`
(also normalized font 14pt → 13pt and icon 15px → 14px),
`.compose-send` (inline-form variant keeps height 44px with
padding 0 20px and gap 8px), `.compose-mic, .compose-send` shared
border-radius (6px → 4px, affects mic button too for compose-bar
visual coherence), and DSR reference buttons `.dsr-btn-teal` /
`.dsr-btn-ghost` / `.dsr-btn-disabled` (replace_all on shared
padding string, 3 hits). 7 stage-padding + section-gap
normalizations to 8-value scale: broadcast flow stages all on
24px 32px 32px (`.s6-split`, `.s6b-shell`, `.s6c-stage`); clinical
history `.s5-stage` on 24px 32px 64px; settings `.s7-stage` on
32px 32px 64px with section gaps `.s7-section` and `.s7-page-sub`
both 32px (down from 36px). Deferrals removed: Day 1 build
TealCTA anatomy lock (now defined at mockup stage, build only
needs to codify into `<TealCTA />` component); Day 6
spacing-scale sweep for layout-spacing values (element-internal
micro-padding like pill 4/10 and input 7/10 stays deferred).
State coverage (loading / empty / error) remains deferred to
Day 7 build-time verification per `docs/build-order.md` line 96.

**Heuristic audit (Phase 2 final gate) completed 2026-05-12.**
Nielsen 10 + Pawkit-specific 6 dimensions × 9 admin screens (126
audited cells, dimensions 4 + 14 handled by cohesion check).
Zero FAILs, 4 ESCALATEs surfaced + resolved + applied this turn.
Resolutions:
- **ESC-3 + ESC-6 (vellum eligibility):** clinical history visit
  cards (`.s5-card`) and Broadcast send confirmation cards
  (`.s6c-confirm-block`, `.s6c-confirm-channels`) added to the
  Day 6 vellum-apply list in `docs/premium-feel/materials.md` +
  `docs/build-order.md` line 70. Broadcast send hero
  (`.s6c-confirm-hero`) stays excluded because it's
  Ink-on-Paper-inverted, not a Paper surface.
- **ESC-4 (voice-input failure spec):** added "Voice input
  states" section to `docs/premium-feel/states.md` covering 4
  failure modes (mic blocked, network failure, low-confidence
  transcription, silence detected) plus mic icon resting /
  listening / blocked states. Mic listening state uses Ink
  (not Teal) to keep one-Teal-per-screen budget clean. Brief
  reference added to `docs/layout-spec.md` Section 6 alongside
  the Sarvam voice-input mention. Phase 3 microcopy round
  finalises exact copy.
- **ESC-5 (Group B lazy-reveal):** refined locked Direction C
  anatomy in `mockups/archive/admin-locked.html` Section 06b. Removed
  always-visible disabled "Condition group B · not yet defined"
  placeholder block + the AND/OR connector pills between
  groups; replaced with a single "+ Add OR group" CTA centered
  below Group A (uses existing `.s6b-add-cond` dashed-border
  style wrapped in new `.s6b-add-or-group` centered container).
  Clicking promotes the CTA into a second Group B block with
  its own conditions + AND/OR connector. Matches Klaviyo /
  Mailchimp / HubSpot industry pattern; keeps default audience
  surface compact for the common single-group case (AMS
  broadcasts skew single-group: dogs OR cats, age range,
  exclude deceased). Anatomy block updated same turn to
  describe lazy-reveal pattern (collapsed prior "Group
  connector" + "Second group" anatomy rows into one).
Pre-existing TBD re-flagged: Screen 05 metadata pill taxonomy
(Sick visit / Wellness / etc.) still pending Phase 3 microcopy
round per `status.md` line 282-285. No new action needed.

**Admin Phase 2 queue:** All 9 admin screens (01, 02, 03, 04, 05,
06, 06b, 06c, 07b) locked + graduated + cohesion-check fixes
applied + TealCTA anatomy locked + pragmatic spacing sweep
applied + heuristic audit completed + 4 escalations resolved as
of 2026-05-12. **Phase 2 admin: DONE.** Next gates per locked
sequence in Next concrete step below: Phase 3 microcopy round
(EN + MR, ~30 system message templates, Marathi native-speaker
review) → Phase 4 admin build.

`docs/flows/parent.md` still in user edit pass; Phase 1 parent
narrative walk happens after Phase 2-4 admin per the app sequencing
lock.

`apps/petparent/screens/PetPage.tsx` exists as a data-plumbing stub from the
SDK upgrade detour. NOT the demo Pet Page; visual rough by design. Will be
replaced when build resumes. `lucide-react-native ^1.14.0` plus
`react-native-svg 15.12.1` installed via `expo install` 2026-05-09 (both
SDK-54 compatible).

## Demo target
Inside Sagar's mid-May availability window. Demo shape: 15 min app demo
(laptop dashboard plus phone parent app) plus 10-15 min growth-of-app
presentation. Total 25-30 min, cannot bore him.

## Next concrete step
**App sequencing locked 2026-05-11 late afternoon:** admin app moves
through every phase first (Phase 1 narrative review → Phase 2 research +
mockups → Phase 3 microcopy → Phase 4 build → Phase 5 debug + rehearsal
of admin flows), THEN pet parent app same. No timeline compression
intended; this replaces the prior phase-by-phase parallel cadence where
admin + parent advanced through each phase together. Final demo
rehearsal in Phase 5 cross-cuts both apps once parent lands.

1. Phase 1 admin narrative walk, section by section, against current locks.
2. Phase 2 admin: per-screen two-strand reference research (3-4 design
   refs + 2-3 category competitors) + HTML/CSS Pawkit mockups for each
   direction; user picks per screen in clusters; cohesion check; final
   heuristic audit (Nielsen 10 + Pawkit-specific).
3. Phase 3 admin microcopy (EN + MR, per the do/don't matrix in
   `docs/premium-feel/voice.md`).
4. Phase 4 admin build (includes shared foundations: monorepo, Supabase
   wiring, design-tokens, motion, haptics, vellum SVG, that pet parent
   will inherit on day 1 of its build).
5. Then pet parent: Phases 1 → 4 same shape. Phase 5 (debug + rehearsal)
   covers both apps end-to-end before demo.

## Open deferrals
See `docs/open-issues.md` for items pending mockup review or microcopy round.

## Risks
See `docs/risk-register.md`. Fur-match algorithm tuning is mitigated by the
17/17 fixture suite. NativeWind+pnpm friction is wired clean. Conversion risk
(Sagar nods but doesn't commit) is mitigated by the closing-line script in
`docs/demo-choreography.md`.
