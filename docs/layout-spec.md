# Screen-by-screen layout spec

The visual brief for each screen. For each one: the layout in prose, then
tight per-element rules. Berry placement, fur-token usage,
references to steal from, key pitfall, plus motion/state/haptics where
applicable.

> Motion plus state plus haptic specs cross-reference `docs/premium-feel/`
> (split into 9 per-dimension files). Inline notes here are quick anchors;
> the per-dimension files are the source of truth.

> **Token + structure drift, 2026-05-15 evening + parent.md update.** This
> file was swept on 2026-05-16 (replace_all on the most common terms) but
> some per-section detail may still carry v1.3 phrasing. The rename map:
> **`Teal #006D6F`** became **`Berry #9C2B5C`** (and the "one Teal per
> screen" budget was relaxed at the mauve lock; Berry now legitimately
> shows up across CTAs, hero counts, vet bubbles, active tabs, segmented
> toggles, active rail, focus rings, search wash);
> **`Paper #F5F1E8`** became **`canvas #F8F7F5`** (cards) + **`rail-tint
> #EFE6E8`** (workspace ground); the v1.3 **Satoshi (display)** typeface
> was removed and **Inter** now handles body + display; **Spectral
> italic** was replaced by **Lora italic 600** (pet-name hero only);
> **Lucide** icons were swapped for **Phosphor Icons filled**
> (`@phosphor-icons/react`, global `weight: "fill"` default). The parent
> app nav also dropped from **6 tabs** to **5 tabs + Settings behind the
> avatar pill** per `docs/flows/parent.md`. Per-section detail below
> reflects the swept naming.

---

## Dashboard

### 1. App shell + nav

A sticky header carries the AMS clinic wordmark ("Animal Medical
Services" Inter Bold + "PUNE" Inter small caps below, per
`docs/brand-system.md`) and a persistent **search bar** whose behavior
is context-aware. The Pawkit brand does not appear in the dashboard
header; Pawkit-as-vendor lives quietly in Settings (the `v0.1` mark)
and on splash / login surfaces. White-label discipline: Sagar's
dashboard reads as his clinic's tool. The left rail
marks the active section with a Berry border (not fill) and lists three
destinations: Inbox, Broadcasts, Settings. There is no Pets tab; pet
profiles open contextually from inbox messages. There is no In-Surgery
toggle; vets forget to flip it; the typical-response-time chip on parent
threads sets expectations data-driven instead. Dashboard renders
desktop-only in v0; mobile-responsive deferred to v1+.

**Search bar behavior** (context-aware):
- On Inbox tab: patient/parent search (pet name, parent name, phone
  number); hit opens that pet's profile or the parent's inbox thread.
- On Broadcasts tab: keyword search across Broadcast content.
- On Settings tab: search bar is hidden (Settings has no searchable content).

**Phase 2 locked anatomy (2026-05-11 late evening, Direction C
Notion-channeled with Direction B's filled-tint search bar,
centered).** Header 64px tall, 1px Ink-faint bottom border. AMS
clinic wordmark left (28px h-padding). Search bar centered in the
header: 36px tall, filled-tint background
`rgba(168, 163, 158, 0.15)` over canvas, 4px radius, Phosphor
magnifier icon left at 14px stroke 1.75 Ink-soft, Inter 14px
Ink-soft placeholder, max-width 460px. Right header zone empty
reserve. Rail 240px wide, 1px Ink-faint right border, 20px v-padding,
12px h-padding, 4px gap between items. Faint `WORKSPACE` small-caps
section label above rail items: Inter 10px medium Ink-faint,
letter-spacing 0.16em, 16px h-padding inside rail, 4px top margin /
8px bottom margin. Rail items 40px tall, 16px h-padding, 14px gap
between icon and label, Inter 15px regular Ink-soft resting / Ink
semibold active. 4px Berry left active border (transparent otherwise).
Phosphor icons 16px stroke 1.75 (mail / megaphone / settings for Inbox
/ Broadcasts / Settings). Reference mockup file:
`mockups/archive/phase2-01-app-shell.html` Direction C (with the picked
search-bar hybrid noted in `docs/decisions-log.md`).

- **Steal:** Linear's command-bar restraint, Stripe's small-caps section labels
- **Pitfall:** filling the active rail item with Berry instead of border

### 2. Inbox

Two subtabs: **Active** and **Inactive**.

**Active** holds threads awaiting Sagar's reply where the follow-up
window is still open, sorted oldest-waiting at the top. The tab label
carries the count of pending threads.

**Inactive** holds threads Sagar has already responded to, sorted by
latest message. No count on the tab.

Each row carries pet name + pet picture (with fur-match ring if the
parent has uploaded a photo) + household name + time since the parent's
last message. The last-message preview is text only; if the parent's
most recent message is a photo or video attachment, microcopy says so
(exact "Photo" / "Video" strings locked in microcopy round). Species
and breed appear on the thread detail screen when Sagar opens the
thread and sees the pet record, not in the inbox row.

Tapping a row opens the thread with the pet's medical context already
on screen: last visit date, current medications, recent vaccinations,
chronic conditions. Sarvam voice input handles MR / Hinglish / EN
compose; whatever Sagar speaks renders as editable text before send.

On send, the thread moves to Inactive and the Active count drops by
one. If the parent replies again within the follow-up window, the
thread re-enters Active.

No buckets, no classifier pills, no AI-drafted replies. Locked
2026-05-06; restructured to Active/Inactive subtabs 2026-05-11
(supersedes the prior "single queue" treatment).

- **Steal:** Linear's hover-reveal with `--text-muted` hairline divider,
  Superhuman's tabular timestamp
- **Pitfall:** adding classifier-style buckets back. Active/Inactive
  are the only two states; richer bucket UI presupposes content the
  parent app cannot send.
- **Motion:** row send-to-Inactive collapses with FLIP for surrounding
  rows; row hover lifts action icons. Motion-token application per
  interaction locks during Phase 2 per `docs/premium-feel/motion.md`.
- **State:** loading skeleton is N row outlines (avatar circle + text
  lines per row); empty (Active) reads "No open windows right now.
  Take a breath."; empty (Inactive) reads "No past conversations
  yet." (final EN + MR strings in microcopy round); offline is a top
  banner with last-fetched timestamp.

**Phase 2 locked anatomy (2026-05-11 late evening, Direction C
Hey-channeled).** Inbox rows 56px tall, padding 16px vertical, 1px
Ink-faint divider between rows. Avatar-ring outer 46px / avatar
photo inner 40px / 3px fur-match ring carrying the algorithm's
primary tone (Honey for Gabby, Milk+Vanilla gradient for Angel,
etc., per `packages/match-logic`). Sender column fixed 180px wide,
stacks pet name (Inter 14px semibold Ink) over household subline
(Inter 11px Ink-soft). Preview column flexes, Inter 13px Ink-soft,
**maximum 2 lines** via `-webkit-line-clamp: 2` plus
`display: -webkit-box`, `-webkit-box-orient: vertical`,
`overflow: hidden`. Messages longer than two lines truncate
with a trailing ellipsis ("...") rendered automatically by
webkit/blink; the vet sees the full message when they open the
thread. "Photo" / "Video" microcopy renders as a single short
word when the parent's last message is a media attachment
(exempt from truncation). Relative timestamp Inter 12px
Ink-faint tabular, right-aligned, top-of-row. Subtab strip above
the list: Active (label + count chip with 2px Ink underline when
active) / Inactive (no count). Active rows sorted oldest-waiting at
top per the Section 2 sort lock. Reference exploration file:
`mockups/archive/phase2-02-inbox.html` Direction C.

### 3. Inbox thread detail (with pet record panel)

The screen Sagar lands on when he taps a row in the Inbox list
(Section 2). Two-column layout: **conversation + reply compose on
the LEFT** (the working surface where Sagar reads and replies), **pet
record panel on the RIGHT** (the clinical context he reads to reply
well). No standalone per-pet destination exists in the admin app;
the pet record surfaces ONLY here as a panel, never as its own
route. Locked 2026-05-11 late evening.

A breadcrumb up top reads `Inbox > [Pet name] · [Household]`. The
open follow-up window banner (4px Berry left bar, canvas bg, 1.5px
Ink border) sits prominently above the conversation when the window
is active.

The conversation column shows message bubbles in chronological order:
parent-side bubbles Ink-filled with canvas text, vet-side bubbles
canvas-bg with Ink text and 1px Ink-faint border. Parent bubbles may
carry text, photos, or videos; vet bubbles are text-only (no voice
on either side). Below the bubbles sits the reply compose surface:
a canvas-card text field with Sarvam voice-input affordance (Phosphor
`Mic` icon) and a Berry `Send` CTA.

The **pet record panel** on the right carries (top to bottom): pet
photo (40-48px circle with fur-match ring), pet name (Inter
semibold Ink), meta line (species + breed + age + household, Inter
12px Ink-soft), chronic-condition chips (Ink outlines, no fur
tokens), Quick Facts rows (microchip, weight + date, regular vet,
recent invoice).

When the follow-up window expires, the reply compose surface is
replaced by the bounded-window closed treatment per spec (admin side
shows the thread as Inactive with no reply affordance; parent app
surfaces a graceful redirect).

- **Berry:** 4px left bar on follow-up banner + filled `Send` CTA on
  compose surface (these are co-resident; per the one-Berry rule, the
  banner bar and the Send CTA share screen real estate intentionally
  as the same Berry usage, surfacing urgency and action together)
- **Steal:** Linear's right-sidebar properties-list anatomy for the
  pet record panel, Klara's open-conversation banner pinned above
  thread, iMessage/Hey bubble grammar inverted to Ink/canvas
- **Pitfall:** building a separate per-pet destination route (banned,
  this is the only surface the pet record appears on); decorating
  bubbles with coloured roles
- **State:** loading skeleton = pet record panel rows + conversation
  bubble outlines; empty conversation (rare; threads land here only
  after the parent sends a message) = "Awaiting parent message"
  eyebrow Ink-faint

**Phase 2 locked anatomy (2026-05-11 late evening, Direction B Quick
Facts + Direction C Clinical History hybrid; 55/45 split locked
2026-05-12).** Two-column main area at 55/45 ratio: ~572px
conversation column on the LEFT (1fr flex), 468px pet record panel
on the RIGHT (fixed width; was 400px before 2026-05-12 rebalance). Bubble grammar (Sagar's admin view): parent bubbles
canvas-bg + 1px Ink-faint border + 14px border-radius (bottom-left
corner 4px) on the LEFT; Sagar's reply bubbles Ink-filled with canvas
text + 14px border-radius (bottom-right corner 4px) on the RIGHT.
Bubble max-width 65% of conversation column. Bubble stamp Inter 10px
Ink-faint tabular below each bubble. Compose surface: 44px tall
text field with 1px Ink-faint border + 6px radius + 14px h-padding,
Phosphor Microphone ghost button (44×44px with 1px Ink-faint border), filled
Berry Send button with Phosphor PaperPlaneTilt icon + label. Pet panel anatomy
top to bottom: header row (56px photo + 3px Honey fur-match ring,
gap 14px, pet name Inter 19px Bold, NAME ONLY — no meta lines, no
household); Quick Facts as inline label/value rows (NO card, NO outer border
— just rows with hairline 1px Ink-faint dividers between them),
section label "QUICK FACTS" Inter 10px Ink-faint small-caps
letter-spacing 0.14em above, 5 inline rows (Breed / Age / Weight +
month-taken / Chronic with " · " separator between conditions /
Last visit + reason): label Inter 12px Ink-soft LEFT + value Inter
13px Ink semibold (weight 600) tabular RIGHT (right-aligned),
11px row padding. Font hierarchy intentionally mirrors the Clinical
History block so the two panel sections read as one cohesive
rhythm: the Quick Facts label (12px Ink-soft) sits at the same
visual weight as the Clinical History meta (12px Ink-soft) and the
Quick Facts value (13px Ink semibold) sits at the same weight as
the Clinical History title (13px Ink semibold); below Quick Facts
the panel has a tab toggle between **Clinical History** and
**per-pet Invoices** (each tab fills the full 400px panel width
when active, no two-column split). Clinical History tab content:
2-column editorial section (60px date column Inter 11px Ink-faint
tabular + body column with title Inter 13px Ink semibold + meta
Inter 12px Ink-soft 1.55 line-height, 14px row padding, hairline
Ink-faint dividers between entries, scrollable container showing
last ~8 entries with older entries scrolling into view); rows are
tappable (cursor pointer, light hover state at rgba(168,163,158,0.08))
to open Screen 05 Clinical history full screen, mirroring the
Invoices tab pattern of row-tap-to-open. Invoices tab content:
compact list of this pet's invoices (row content TBD as part of
Screen 04 Phase 2 invoice exploration); tap an invoice row → opens
view-only Screen 04 invoice screen (full screen) with a Back
affordance returning to the thread (Invoices tab still active).
Default-active tab on thread open = Clinical History.
Reference
exploration file: `mockups/archive/phase2-03-thread-detail.html` Direction
B Quick Facts + Direction C Clinical History hybrid.

### 4. Itemised invoice (dashboard, view-only)

A letterhead block, an owner/pet strip, and a line-items table grouped by
`item_type`. Each line item carries an `Info` icon immediately after its
name. Tooltip on hover. Totals stack right-aligned
tabular, status pill reads "Paid". There is no `Mark paid` CTA; payments
are cleared at the desk during the visit. Pawkit invoices are receipts,
not bills. v0 invoice records are hand-seeded; no entry workflow exists
yet.

- **Berry:** none on this screen (a view-only receipt has no primary action)
- **Steal:** Stripe invoice tooltip pattern but always-visible icon,
  Pulley's plain-English tooltip voice, Ramp's category section dividers
- **Pitfall:** accidentally re-introducing `Mark paid` (it's wrong); tiny
  info icons (must be 14px visible, 28×28 hit target)

### 5. Clinical history full screen (dashboard, view-only SOAP preview)

Opens from the Screen 03 pet record panel's Clinical History tab via
the "Open full clinical history" button (sticky-bottom of tab).
Full-screen view-only surface showing this pet's clinical history as
SOAP notes (Subjective / Objective / Assessment / Plan structure per
visit), a preview of the production data-entry path that replaces
VetBuddy (Sagar dictates via Sarvam Audio, Claude structures into
SOAP fields, visit record is written). v0 content is hand-written
per pet (Gabby's full history seeded for the demo). Back affordance
top-left returns to the Screen 03 inbox thread with Clinical History
tab still active.

Anatomy locked 2026-05-12 at concept level: header carries pet photo
+ name + Back affordance; body is a chronological list of visit
cards (latest first), each card holds visit date + visit reason + 4
labeled SOAP fields (Subjective, Objective, Assessment, Plan) in
editorial layout. Specific dimensions, typography, card vs.
accordion treatment, and pinned-current-visit handling land as part
of the Phase 2 Screen 05 mockup exploration.

- **Berry:** none on this screen (view-only preview surface, no
  primary action)
- **Steal:** to be researched in Phase 2 (likely candidates: EHR
  clinical note layouts, medical SOAP note publishers, case-study
  editorial formats)
- **Pitfall:** treating SOAP fields as form inputs (read-only in
  v0); cramping the 4 fields without clear hierarchy; mixing the
  panel-tab event-log format with the full-screen SOAP format
  (distinct treatments)
- **State:** loading skeleton mirrors visit-card structure with
  Inter 11px Ink-faint placeholder rows

### 6. Broadcast composer

The Broadcasts rail item branches into two subtabs on the left menu:
**Drafts** (in-progress work that hasn't been sent yet) and **Published**
(all past published Broadcasts, latest first).

Tapping **Create new Broadcast** opens a two-column editor with a live
phone-frame preview on the right that updates as Sagar types. The
required fields are title and body, both bilingual EN+MR with
side-by-side EN/MR tab affordances. Sarvam voice input is available
on every text field; failure-mode treatments (mic blocked, network
failure, low-confidence transcription, silence detected) specced in
`docs/premium-feel/states.md` voice-input states section. Sagar
composes in either language; **Sarvam Translate** auto-generates
the other-language version (trigger TBD: on field blur or explicit
Translate button). He reviews and approves both versions
sequentially before publish; bilingual publish is a hard block
(cannot publish until both languages are filled and approved).

**Optional structured sections** (Sagar adds only when relevant):
cover image (Ink-faint placeholder if absent); key points (bulleted,
repeatable rows with drag handles); warning signs (red-flag symptoms
parents should watch for); escalation (when to call the clinic). The
same composer surface handles both short clinic notices and long
educational pieces, with structured sections progressively disclosed.

The audience filter (species: dogs, cats, or both; exclude deceased
toggle; age ranges; etc.) lives in the editor with a live audience
count chip ("142 households, 187 pets") so Sagar can confirm exactly
who'll receive it.

**Publish** has a 15-second undo. On publish: the Broadcast lands in
every recipient's Broadcasts tab as a card; a parent-side push
notification fires; the Broadcast gets a `public_slug` for the public
web reading URL `pawkit.app/broadcasts/[slug]` (the virality layer
since it's shareable to non-Pawkit parents).

**Drafts** save as Sagar types and surface under the Drafts subtab.
Drafts have no audience filter applied yet and no public URL until
publish.

**Edit after publish** is allowed: Sagar opens a published Broadcast,
edits, re-publishes; parent-side cards reflect the latest content.
Edit-indicator treatment on the parent side and whether edits trigger
a fresh push are pending lock.

**Delete after publish** is allowed: the card disappears from every
recipient's Broadcasts tab; the public URL 404s. The push
notification that already fired cannot be unsent. Parents who tap a
stale push notification after delete see a graceful empty state on
the Broadcasts tab (specifics in microcopy round).

- **Steal:** Substack post composer for bilingual long-form fields;
  Mailchimp segment-builder for live audience count; Notion
  drag-handle on key-points repeatable rows.
- **Pitfall:** banner-ifying the AI voice-input hint; filling the
  audience count chip with Berry; treating the composer as a
  service-bundle builder (it's a content authoring tool, more like a
  blog post editor than a checkout flow).
- **Demo moment:** count updates "143 to 142" as Sagar toggles
  Exclude deceased. Raffy is honoured by data discipline.
- **Demo line:** publishing generates a public URL
  (`pawkit.app/broadcasts/[slug]`) the vet can share to non-Pawkit
  parents. Broadcasts are the virality layer.

Specific dimensions, color placements, and exact visual treatment
(column ratios, button anatomy, count-chip styling, preview frame
size, etc.) deferred to Phase 2 per the
dimensions-and-color-placements-after-research lock 2026-05-11.

### 7. Style guide (`/style-guide`) — Phase 2 design descoped 2026-05-11

> **Not a Phase 2 design surface.** Internal dev/design reference page,
> not user-facing, not part of the demo flow. The locked brand v1.3 +
> premium-feel system already IS the design system; this page just
> renders it for dev workflow. Built pragmatically during the build
> phase using whatever ergonomic layout serves devs. The description
> below stays as a content / sections reference.

A scroll-spy with sections for Tokens, Type, Buttons, Forms, Cards, Tabs,
Tooltips, Badges, Sheets, Avatars, Empty states, Loading, Error states,
Berry audit, Fur kit, plus Spacing audit (the 8-value scale visualised) and
Vellum audit (canvas card with vs without filter, side-by-side at 40cm
distance). Berry-audit section enforces the "one Berry per screen" rule.
Fur-kit section carries a stark "Pet content only, never chrome" warning.

- **Berry:** the single canonical `Button` lives in the Berry audit section
- **Pitfall:** becoming a museum nobody opens; add a "what changed today"
  diff strip.

### 7b. Dashboard Settings

A scrollable single-column page reached from the Settings rail item.
Sections in order:

**Profile** card. Profile photo (the avatar that renders in Sagar's
`<VetByline />` component everywhere; upload control with Ink-faint
placeholder when no photo). Full name (editable inline). Vet license
number (editable inline; surfaced ONLY in Settings, NEVER in the
byline per `docs/premium-feel/byline.md` locked 2026-05-09). Email
(optional, editable inline).

**Account** card. Phone number (read-only; tied to auth identifier).
EN/MR language toggle (segmented; master switch for dashboard chrome
rendering, locked as a Settings-only surface in v0 per
`docs/decisions-log.md`). Note: this toggle affects Sagar's
dashboard chrome only. Per-Broadcast bilingual content is always
both EN + MR for parents regardless of Sagar's chrome language.

**Sign out** ghost button. Full-width, Ink border + Ink text, no
Berry. Confirmation flow on tap (microcopy in microcopy round).

Clinic info (AMS Pune + address + license) is hard-coded in v0; no
clinic-edit affordance.

- **Steal:** Linear settings density, Stripe profile screen rhythm,
  Notion small-caps section labels.
- **Pitfall:** showing the vet license in the byline (banned);
  adding per-tab notification preferences (out of scope, no
  Sagar-side push in v0); adding multi-vet invite affordance
  (deferred to v1+).
- **State:** loading skeleton is section header outlines + 2-3 row
  outlines per card; empty doesn't apply (Profile + Account always
  have values).

**Locked 2026-05-12 · Direction A (Linear-channeled)** of 3-direction
exploration in `mockups/archive/phase2-07b-settings.html`. 720px stage, 36px
gap between section blocks, small-caps Inter 10pt 600 Ink-faint
section labels (Profile / Account / Clinic), hairline 1px Ink-faint
row dividers. Each editable row: 160px label column Inter 12pt
Ink-soft + value flex Inter 13pt Ink semibold + "Edit" pill on the
right (Inter 11pt Ink-soft, 1px Ink-faint border, 3px radius, 4/10
padding). 12px row v-padding. Empty-state values render italic
Ink-faint placeholder text with "Add" pill verb (vs "Edit").

Profile photo row: 1px Ink-faint top + bottom borders, 48px circular
slot with Phosphor User icon Ink-faint stroke 1.75, "Upload" pill on
the right. Vet license row uses `font-variant-numeric: tabular-nums`.

Phone row read-only: no Edit pill (absence of pill = read-only,
Linear pattern consistent with Screen 03 pet panel `pp-quick` rows).
Ink-soft value + tabular-nums.

EN/MR toggle: segmented pill pair, 3px inset padding, 5/12px pill
padding, active = Ink fill + canvas text, inactive = transparent +
Ink-soft. Helper line below at 176px indent in Ink-faint 11pt:
"Changes labels and buttons in your dashboard. Broadcasts always
ship to parents in both languages."

Clinic block: plain prose lines, no card chrome, no tinted
background, no edit affordance. Inter 14pt 700 clinic name + Inter
12pt Ink-soft address / GSTIN tabular / hours lines, 1.65 line-height.

Sign out: full-width Ink ghost button (no Berry; one-Berry-per-screen
rule honoured by rail active border alone). 11px v-padding, 1px Ink
border, Phosphor SignOut icon prefix.

Pawkit vendor mark: centred footer, 48px top margin, 24px top
padding, 1px Ink-faint top border. "Pawkit" Inter 11pt Ink-faint
+ middle dot + "v0.1" Inter 10pt Ink-faint tabular. The ONLY surface
where Pawkit-as-vendor appears in dashboard chrome (white-label
discipline per `docs/decisions-log.md`).

Header search bar hidden on this route per Section 1 spec; empty
middle column preserves chrome grid integrity. Rendered frame in
`mockups/archive/admin-locked.html` Section 07b.

---

## Pet-parent (Expo, Android-first)

### 8. Auth + onboarding (2 steps in v0; no phone OTP)

Step 1 is household name. Pawkit wordmark up top, a Inter 18pt welcome
line ("Your pet's records, in your pocket"), a text input with placeholder
"[e.g. The Fernandes Family]", and a Skip link defaulting to "[Your
household]". Step 2 is the first pet, five fields all required: name,
species (Dog/Cat toggle), breed (free text), gender (Male/Female toggle),
and birthday-OR-age. No photo on this step. Auth is pre-seeded for the
Fernandes household demo. Each step is one decision and one Berry CTA.

- **Berry:** primary CTA per step
- **Steal:** Cal.com's progressive disclosure rhythm, Things 3 serif
  welcome heading
- **Pitfall:** asking for the pet photo here. It must wait for screen 9.

### 8b. Pets tab list view + Add pet flow (locked 2026-05-08; default-landing tab in 5-tab nav, locked 2026-05-09)

The Pets tab is the default-landing tab in the parent app bottom nav
(left-to-right: Broadcasts / Community / Pets / Inbox / Shop /
Settings; 5-tab icon-only nav locked 2026-05-09). On app open the user
lands here. The tab is a vertical list, one row per pet in the
household. Each row is 72px tall with a 48px circular avatar on the
left (real photo if uploaded, Ink-faint placeholder otherwise), the
pet's name in Inter 16pt semibold Ink (NOT Lora;
Lora stays restricted to its 4 hero contexts), a subline in Inter
12pt Ink-soft showing species + breed + age (e.g., "Golden Retriever ·
4 years"), and a 6px Berry indicator dot top-right on rows with an open
follow-up window. The 3px fur-match-derived ring around the avatar carries
the ambient fur signal (Honey for Gabby, Milk for Angel, etc.). Tap row
navigates to that pet's steady-state Pet Page (composition from Screen 9
post-Transformed).

Deceased pets (Raffy) render the entire row at 60% opacity with a Phosphor
Heart outline icon replacing the open-window dot per the locked deceased
treatment. Tap still works; opens the memorial Pet Page.

Sticky-bottom Berry CTA labelled "Add a pet" with a Phosphor `Plus` icon
prefix. The CTA is filled Berry, border-less (per locked discipline). It is
the only entry point for adding subsequent pets post-onboarding.

Tapping the CTA opens a form identical to Onboarding Step 2 (Screen 8): five
required fields (name, species Dog/Cat toggle, breed free text, gender
Male/Female toggle, birthday-or-age), no photo. Submit creates the pet
record and navigates to the new pet's empty Pet Page (Screen 9 State A),
where the photo upload triggers the three-state fur-match flow. The form is
implemented as a shared `<PetIdentityForm />` component reused by both
Onboarding Step 2 and this flow.

- **Berry:** sticky-bottom `Add a pet` CTA; 6px Berry indicator dots on rows
  with active follow-up windows
- **Steal:** Things 3 list rows (avatar + name + subline rhythm); iMessage
  contact list density; Apple Music library row pattern
- **Pitfall:** using Lora for the pet name in list rows (it's restricted
  to 4 hero contexts per locked typography rule); over-decorating the row
  with multiple Berry accents (the dot is enough)
- **Motion:** row tap fires 250ms ease-standard cross-fade to the Pet Page;
  Add pet CTA tap pushes the form route with 400ms ease-emphasised slide
- **State:** loading skeleton equals 4 row outlines (48px circle + 2 text
  lines per row); empty equals not applicable since onboarding requires at
  least one pet; offline shows top banner with last-fetched timestamp
- **Haptics:** row tap fires light impact; Add pet CTA tap fires medium
  impact

### 9. Pet profile, three states (secondary delight)

> The **steady-state Pet Page** (the composition that exists
> post-fur-match) is the parent app's brand hero AND the demo's emotional
> center per `docs/decisions-log.md`. The three-state flow below is a
> moment of secondary visual delight inside that hero. NOT the wow, NOT
> the centerpiece, NOT the demo's signature moment. Demonstrable in the
> demo, lives quietly inside the parent app the rest of the time.

**State A (Empty):** a 240px Ink-faint cover with a diagonal-stripe
placeholder, a dashed Ink-soft +avatar circle, a single Ink-faint hint
card ("Bring this page to life. Snap a pic of [Pet] and his page becomes
his color."), and a sticky-bottom `Add photo` Berry button (filled, no Ink
border).

**State B (Sampling):** a Sable cover full-bleed, photo centred at 200×200
with a 4px Sable bezel. A Berry scan-line sweeps top-to-bottom over 2.4
seconds with an 8px Berry glow. Below, 10 fur-token chips in a 2×5 grid go
dim, check, glow as the algorithm samples each tone. A Inter italic
match strip below reads "Looking for [PetName]'s colours…" with a
rotating emoji. Multi-colour pets get a "⚡ MULTI-COLOR" flag top-right of
the photo and two chips scale up plus pulse.

**State C (Transformed) — refined 2026-05-10 to mirror the locked
steady-state.** Previously this state showed a full Honey-to-Peach
gradient cover that the parent never actually saw in steady-state, since
the Pet Page cover is locked at 2026-05-08 as real photo + 10px accent.
The Transformed state now shows: the parent's actual photo at 280px
(matching Screen 02), the **10px Honey accent border at the bottom edge
draws in with a small animation** carrying the algorithm-derived primary
fur tone (Gabby gets Honey, Angel gets Milk, Galaxy whatever her photo
determines), and a magic toast in a canvas card with 1.5px Ink border is
the only ephemeral overlay (Lora italic pet name, then Inter line
"[Primary] + [Secondary] · A palette as unique as she is." as the
locked working draft, final EN + MR microcopy in microcopy round). 3
hand-authored SVG sparkles (slightly irregular, not lucide) twinkle on
the toast for ~4 seconds. Toast auto-dismisses, page resolves into the
locked steady-state Pet Page (Screen 02). The colour-badge button on
the Pet Page (steady-state) is the entry point to the override picker
(Screen 04) for one-time use; Per-pet Settings (Section 19) is the
any-time entry point afterwards.

- **Berry:** Empty CTA (State A) becomes animated scan-line (State B)
  becomes absent in State C (the moment IS the Berry).
- **Fur:** the algorithm output drives the 10px accent border (animated
  draw-in) and the colour-name reveal in the toast. NOT a full-cover
  gradient (banned 2026-05-10 because the steady-state doesn't deliver
  a full-cover gradient).
- **Steal:** Lensa style sampling but quieter, Photoroom's transformation
  timing care, Replicate's chip progress, Glossier-app warmth.
- **Pitfall:** Material-style toast (slide-in-from-top, dismissable X);
  it's a moment, not a message. Auto-dismiss 4-5s, no close. Sparkles
  MUST be hand-authored SVGs with slight irregularity, not lucide.
  **Reverting to a full-cover Honey-to-Peach gradient on the Transformed
  state is banned 2026-05-10** (it created a promise / payoff mismatch
  with the steady-state).
- **Motion:** Pet Page entrance, photo fades plus scales 1.02 to 1.0 in
  800ms ceremonial; name plus byline stagger 150ms after; timeline cards
  stagger 30ms each. **10px accent border draws in left-to-right in
  ~600ms `ease-decelerate`** synchronized with the toast's scale-up.
  Magic toast (State C), scale 0.95 to 1.0 plus opacity 0 to 1 in 400ms
  expressive `ease-emphasised`; 3 sparkles twinkle on independent 1.2s
  loops staggered 200ms each; auto-dismiss at 4-5s with reverse curve.
  Sampling (State B), Berry scan-line sweeps 2.4s linear; chips dim,
  check, glow on per-fur-token timing.
- **State:** loading skeleton equals cover rectangle (4:5) plus Lora
  italic name placeholder plus 3 timeline cards. Photo upload thumb fades
  in at 200ms; full image cross-fades at 400ms expressive after upload
  settles.
- **Haptics:** photo upload complete fires medium impact; fur-match reveal
  (synchronised with magic toast scale-up) fires success notification;
  chip selection in override picker fires light impact each.

### 10. Override picker bottom sheet

A 75% sheet height with a drag handle. The two-tone toggle is hidden under
a "More options" chevron at the top; most parents only need solo tone;
two-tone is the edge case for tuxedos and calicos. Body is a 3-column chip
grid of 10 fur tokens in 4 rows (3+3+3+1, last chip bottom-left); each
chip selected gets a 3px Ink ring. A live preview card uses a
Dalmatian-spot SVG mask in two-tone mode. The named save button reads
"Save Honey" for solo or "Save Honey + Peach" for two-tone, in Berry with
1.5px Ink border (this is one of the few Berry CTAs that keeps the border,
because it sits over a non-canvas sheet surface). A "Try a new photo" link
sits at the bottom for re-sampling. First trigger is the colour-badge
button on the Transformed pet profile; override is opt-in.

- **Berry:** named save button
- **Steal:** Things 3 named-save tag picker, Apple Music sheet drag
  physics, Linear command-palette ring discipline
- **Pitfall:** auto-applying changes without a save step. Naming the
  action is what makes the override feel intentional.
- **Motion:** sheet open via gorhom, spring damping 22, stiffness 280
  (never bouncy); drag handle responds 1:1 to gesture; chip select fires
  50ms instant scale 1.0 to 0.96 to 1.0 in 150ms quick; "More options"
  chevron expand fires 250ms standard.
- **State:** loading skeleton equals sheet header plus 10 chip
  placeholders (3-col grid).
- **Haptics:** chip selection fires light impact each; sheet drag
  scrolling between chips fires selection haptic rate-limited 50ms; save
  button tap fires medium impact on tap-down.

### 11. Inbox / clinic conversation (locked 2026-05-08: per-pet threads only)

The Inbox tab is a vertical list of per-pet 1:1 threads. One row per
living pet in the household. Each row carries the pet's avatar (with
fur-match-derived ring, 32px), the pet's name in Inter 14pt semibold, the
last message snippet or system reminder text in Inter 12pt Ink-soft, a
timestamp, and a 6px Berry dot top-right if the parent owes a reply inside
an active follow-up window. A 4px Berry left bar marks rows with an active
follow-up window. Pets with no thread history yet (e.g. Galaxy in the
Fernandes demo) render with empty-state subline "No conversations yet"
in Ink-faint italic. Deceased pets (Raffy) are removed from the list;
their past messages remain readable from their memorial Pet Page.

Clinic-wide broadcasts no longer live here; they're on the Broadcasts
tab. The previous "single chronological feed mixing 1:1 threads +
broadcasts" was retired 2026-05-08.

The thread detail screen shows a bounded follow-up window banner (canvas
bg, 1.5px Ink border, 4px Berry left bar) at the top, then Ink-filled
parent bubbles vs canvas-bg vet bubbles below. Parent-side bubbles carry
text, photos, or videos; vet-side bubbles are text-only. No voice on
either side. The vet is the only initiator; parent replies bounded to
the open follow-up window. A typical-response-time chip sits on every
active thread, symmetric with the admin side.

Video bubbles render the first frame as a thumbnail with a Phosphor `Play`
icon overlaid centre. Tapping the bubble opens `<InlineVideoOverlay />`,
an absolutely-positioned overlay scoped to the thread panel (not a
viewport modal). Inside: a canvas card with 1.5px Ink border, no shadow,
holding `expo-video` (parent app) or native HTML5 `<video controls>`
(dashboard). Autoplay on open. Dismiss via backdrop click, top-right X,
or Escape. Video uploads cap at 60 seconds; the attach surface surfaces
the cap before upload begins (final microcopy in microcopy round).

When a parent opens a closed thread (or otherwise expects a message
surface), the composer is replaced by a quiet canvas card with the
redirect copy: "AMS is walk-in only. Visit 9am to 9pm Mon-Sat. For urgent
issues, call [clinic number]." Locked 2026-05-06; the parent app accepts
no incoming messages outside an open window. Final EN + MR strings
finalised in the microcopy round.

- **Berry:** 4px left bar on bounded-window banner
- **Steal:** Hey's read-state discipline, iMessage bubble grammar
  inverted to Ink/canvas
- **Pitfall:** colouring the banner red or amber; the Berry bar IS the
  urgency, gentled by the Ink border.
- **Motion:** new bubble entrance fires fade plus slide-up 4px in 250ms
  ease-decelerate; send confirmation fires row collapse height 72px to 0
  in 250ms ease-standard with FLIP for surrounding rows; window-close
  fires composer fade out plus system message fade in, both 250ms
  standard.
- **State:** loading skeleton equals 5 row outlines for list, 3 bubble
  outlines for thread; empty (parent) equals "No messages from Dr Sagar
  yet." Inter 16pt italic Ink-faint; offline equals top banner with
  last-fetched on rows plus "Will send when online" footnote on pending
  sends.
- **Haptics:** message send confirmed (after server ack, not on tap)
  fires medium impact; tab switch fires selection haptic; incoming
  message push fires OS-level (don't override).

### 12. Broadcast reading view (structured content)

A parent reaches a structured broadcast only via a Broadcast card on the
Broadcasts tab (Screen 15; entry point updated 2026-05-08, was Inbox
feed before the architecture restructure). There is no standalone
Broadcasts directory beyond the chronological tab feed. A "Back to
Broadcasts" pill button sits on the cover. The cover itself is 280px
full-bleed, optional (Ink-faint placeholder banner if no cover image was
uploaded). A vet row carries Sagar's avatar plus clinic name. A language
toggle (EN/MR) sits at the top-right of the cover area. Below: title,
key_points bullet list, body (with inline citation links),
warning_signs section (Phosphor WarningCircle icon in Ink, 18px, 1.75
stroke, prefixing the section heading; bold Inter heading), escalation
section ("when to call us", Phosphor Phone icon in Ink as the section
prefix). Sticky-bottom action: a `Share` Berry button (filled, no Ink
border) opening a sheet with WhatsApp / Social / Email options.

The same broadcast content renders at
`apps/dashboard/app/broadcasts/[slug]/page.tsx` (an unauthenticated
Next.js route). Same layout, same EN/MR toggle, but with a "Get Pawkit"
footer CTA instead of the Share button; that's how recipients without
Pawkit installed read the broadcast on the public web.

- **Berry:** `Share` CTA
- **Fur:** none on this screen (locked 2026-05-08, fur tokens never in
  chrome; warning_signs and escalation sections now use Phosphor
  WarningCircle / Phone icons in Ink, no colour signal)
- **Steal:** Substack post reader for body+citations, Apple News article
  rhythm for the section breaks, iMessage native share-sheet UX
- **Pitfall:** treating Share as a secondary action. Share IS the primary
  action because broadcasts are the virality layer.
- **Motion:** entrance from Broadcasts tap fires 250ms standard
  cross-fade with 4px Y-axis lift; EN/MR toggle fires 200ms cross-fade
  body content; Share sheet open via gorhom (RN) / shadcn Sheet (web)
  fires 400ms expressive ease-emphasised; Back to Broadcasts pill tap
  fires reverse cross-fade.
- **State:** loading skeleton equals cover rectangle (if applicable) plus
  title line plus 5 key_points lines plus body paragraph block; empty
  body equals "Dr Sagar is finalising this broadcast." (rare; published
  broadcasts should always have body).
- **Haptics:** Share sheet open fires light impact; Share channel
  selection (WhatsApp/Social/Email) fires medium impact.

### 13. Invoice list + reading view (per-pet, locked 2026-05-08)

Invoices live per-pet inside Pet Page (no top-level Invoices tab as of
2026-05-08). The Invoices tab on each pet's Pet Page renders a
chronological feed (latest first) of that pet's invoices. Each row shows
the invoice id plus total plus Paid pill. No pet-filter chip strip needed
(the invoice list is already scoped to a single pet). Tap any row,
reading view opens.

Reading view: back chevron, then the Total prominently in a canvas card.
Inter 36pt tabular ₹ amount plus "Cleared at the desk, [date]" subline.
Line items group by `item_type` with small caps section headers, each
row has a tappable info icon opening a Sheet (plain English explanation
of procedure / medication, e.g. "Cefadroxil: antibiotic"). Status pill
reads "Paid". There is no `Pay now` CTA; payments cleared at the desk.
There is no `Send to family`; OS file-share covers forwarding the
downloaded PDF. The sticky-bottom action is `Download PDF` only,
Ink-outline ghost (no Berry). New invoices auto-appear on next app open;
no push notification.

- **Berry:** none on this screen (a view-only invoice has no primary
  action that warrants Berry)
- **Steal:** Stripe invoice mobile (Total ~25% of pre-scroll height),
  Brex tap-to-expand explanations
- **Pitfall:** info-icon tap targets too small (16px icon, 32×32 hit
  target); accidentally re-introducing a payment CTA

### 15. Broadcasts tab (locked 2026-05-08)

Top-level tab in the 5-tab parent nav (Settings moved out of the nav and behind the avatar pill 2026-05-16) (leftmost; locked 2026-05-09).
Clinic-wide one-way feed of broadcasts, chronological. Header reads
"Broadcasts" + "From Animal Medical Services" subline. Card composition
is the same as Screen 14 (Sagar avatar + clinic + body in selected
language + per-card EN/MR toggle + timestamp + 6px Berry unread dot).
Structured-content broadcasts open Screen 12 (broadcast reading view).
Composer disabled (one-way; the Broadcasts tab has no parent reply
path).

- **Berry:** 6px unread dot per card (list-level Berry)
- **Steal:** WhatsApp Channel feed grammar, Substack feed mobile
- **Pitfall:** treating it like the old chronological inbox feed; mixing
  in 1:1 conversation threads (those live on Inbox tab, Screen 11).

### 16. Community tab (v0 dummy; V3+ teaser)

Top-level tab in the 5-tab parent nav (Settings moved out of the nav and behind the avatar pill 2026-05-16) (between Broadcasts and Pets).
Dummy placeholder in v0; carries pitchable teaser content for the
Pawkit Plus social layer (Engine 2 of the three-engine ARR model).
Composition: "Coming soon · V3+" eyebrow in Ink-faint, Inter 24pt
headline ("A community for India's pet parents."), 1-2 sentence body
in Inter Ink-soft, then 5 category cards each with a Phosphor icon plus
1-line description (city circles, breed groups, vet AMAs,
lost-and-found, verified clinic reviews). No CTAs.

- **Berry:** none (teaser is window-into-future, not actionable)
- **Steal:** Substack waitlist landing page rhythm, Apple "Coming Fall"
  preview pages
- **Pitfall:** adding a "Sign up" or "Join waitlist" CTA — v0 is
  pre-launch teaser only, no user data captured.

### 17. Shop tab (v0 dummy; V4+ teaser)

Top-level tab in the 5-tab parent nav (Settings moved out of the nav and behind the avatar pill 2026-05-16) (5th of 6, just before Settings).
Dummy placeholder in v0; carries pitchable teaser content for the
clinically-curated marketplace (Engine 3). Same composition pattern as
Screen 16: "Coming soon · V4+" eyebrow, Inter headline ("A
marketplace your vet curates."), body explaining vet-judgement-required
scope, then 5 category cards (therapeutic diets, pharma, hygiene,
supplements with clinical evidence, insurance). No CTAs in v0.

- **Berry:** none (same teaser logic as Screen 16)
- **Steal:** Same as Screen 16
- **Pitfall:** suggesting transactional capability (no Browse, no
  Pre-order). Pawkit deliberately does not compete in generic pet retail
  (kibble, toys, fashion); category strict carve-out.

### 18. Master Settings screen (locked 2026-05-09; nav structure superseded 2026-05-16)

Reached via the household-initial avatar pill in the Pet Page cover top-right
(was the rightmost tab in the 6-tab nav until 2026-05-16; Settings moved out
of the bottom nav at that point). The header is a single
"Settings" h1 in Inter 22pt. Sections in order:

**Account** card (canvas, 1px rule border, dividers between rows): Phone
number row (label left, value Ink-soft right, read-only because phone
is the auth identifier); Household name row (editable inline, chevron
right opens a focused edit sub-screen or inline rename); Language row
(EN/MR segmented toggle, EN active = Ink filled with canvas text, MR
inactive = Ink-faint border + Ink-soft text). The Language toggle is
the master override for the bilingual-rendering lock; auto-detect at
first launch then sticks until changed here.

**Pets** card: one row per living pet, 32px fur-match-ring avatar +
pet name (Inter 13pt semibold) + species/breed/age subline (Ink-soft
11pt) + chevron right. Tap row navigates to that pet's Per-pet Settings
sub-screen (Section 19). Deceased pets excluded for v0; memorial-mode
editing is a v1+ deferral.

**Notifications** card: single row with push toggle (on by default).
Toggle is Ink track when on, Ink-faint track when off, canvas knob; no
Berry. Tap area covers the full row. Subline explains scope ("Reminders,
replies from Dr Sagar, broadcasts.").

**About** card: version row ("Pawkit" + "v0.1" Ink-soft right); below
it a centred Ink-faint footer with letter-spacing 0.06em ("Animal
Medical Services · Pune").

**Sign out** ghost button at the bottom of the scroll, full-width,
Ink border + Ink text + no Berry. Confirmation flow on tap (microcopy in
microcopy round). Sign-out clears local session; with v0's pre-seeded
Fernandes identity there's nothing to sign back into, but the affordance
ships for parity with v1+ when real auth lands.

- **Berry:** none on this surface (Settings is configuration, not action;
  one-Berry-per-screen rule honoured by absence)
- **Steal:** iOS Settings list rhythm, Things 3 quiet section labels
- **Pitfall:** adding per-pet or per-channel notification granularity
  (deferred to v1+); adding privacy / data export / account deletion
  rows (deferred to v1+); reintroducing fur tokens in chrome (always
  banned)

### 19. Per-pet Settings sub-screen (locked 2026-05-09)

Sub-screen reached either by tapping a small Phosphor Gear icon
inline with the pet name row on the Pet Page body (Screen 02; 18px
Ink-soft, stroke-width 1.75, right-aligned with the Lora italic
pet name; no pill background; 32px Pressable hit area; refined
2026-05-09 from a cover-pill version that read as too chunky and
dropped chrome onto the editorial photo) OR by tapping a row in the
master Settings Pets section (Section 18). Header shows a back chevron,
"Settings" eyebrow in Inter 9pt small caps Ink-soft, then the pet's
name in Lora 18pt italic semibold Ink (the pet name is the visual
anchor for which pet this is).

**Photo** card: current 4:5 thumbnail (64×80) with a 5px Honey accent
border at the bottom edge (matching the Pet Page cover discipline);
Ink-soft caption "Replacing the photo re-runs fur-match on the new
image."; "Change photo" ghost button (Ink border, Ink text, opens
camera/gallery picker).

**Fur match** card: current primary + secondary swatches (28px Ink
border circles) plus breed-tone label ("Honey + Peach", "Auto-paired
from Gabby's photo, 14 Mar 2026."). Two action buttons: **"Re-run
match"** as the screen's one Berry CTA (border-less filled Berry, the
meaningful primary action since it triggers the algorithm on a fresh
photo) and "Override" as a ghost button (opens the existing override
picker bottom sheet, Section 10).

**Patient since** card: single row, "Adoption year" label left + value
+ chevron right; tap chevron opens a year picker.

**Identity (locked)** card: read-only display of Name + Breed + Sex +
Birthday rows (Ink-soft labels, Ink values). Italic Ink-faint footnote
underneath: "Locked because Dr Sagar has clinical records on file."
This card explains the absence of edit affordances on identity fields,
so the parent doesn't wonder why they can't change Gabby's birthday.

- **Berry:** "Re-run match" only (one Berry per screen rule)
- **Steal:** iOS per-item edit screens, Notion locked-field UX
- **Pitfall:** adding mark-deceased toggle (v1+ memorial-mode deferral);
  adding delete-pet from this surface (no destructive irreversible
  actions in v0); surfacing identity edits before clinical_lock state
  is known (the read-only treatment is correct for the demo's locked
  state)

---

## Cross-cutting patterns (define once, reuse)

1. **`<BerryCTA />`.** Encapsulates the Berry CTA discipline: dev-time
   invariant warning if more than one renders per route, hover/pressed
   states, surface prop. No Ink border on canvas surfaces (Berry grounds
   itself). The override-picker save button is the exception; it sits
   over a sheet and keeps a 1.5px Ink border.
2. **`<InfoTooltip />` / `<InfoSheet />`.** Same API, web Tooltip plus
   mobile Sheet, conversational English max 2 sentences.
3. **Bounded follow-up window banner.** Full-width, canvas bg, 1.5px Ink
   border, Berry left bar (3px in inbox rows, 4px in banner contexts).
   On the parent's Pet Page the banner is a **two-row card** (refined
   2026-05-09): row 1 is the editorial Lora italic context line
   ("Dr Sagar is here for Gabby until 2 May."); row 2 is an explicit
   "Open thread &rsaquo;" CTA in Inter 12pt semibold Ink with a Phosphor
   ChevronRight (14px, Ink, stroke-width 2). The whole card is the
   press target; the explicit CTA line removes any ambiguity that the
   banner is a link.
4. **Empty state grammar.** Inter 16pt italic Ink-faint, single
   sentence ending in period, no illustrations.
5. **Loading skeleton.** Solid `--text-faint` (3% darker than canvas), no
   shimmer.
6. **Error toast.** canvas card, 1.5px Ink border, 4px Ink left bar plus
   Phosphor WarningCircle icon (18px, 1.75 stroke) prefixing the headline.
   Never red. No fur token (locked 2026-05-08, fur never in chrome).
7. **Status pill.** 1px Ink-soft border, canvas bg, Inter 11pt tabular
   Ink. No coloured dot. Alert/important states differentiated by text
   only ("Overdue", "In surgery") plus optional Phosphor icon prefix in
   Ink (locked 2026-05-08, fur never in chrome).
8. **`<Surface />`.** Codifies the 1.5px / 1px / 0 border discipline;
   designers reach for borders, not shadows.
9. **`<Numeric />`.** Auto-applies `font-feature-settings: 'tnum'` to
   Inter for all numbers.
10. **Deceased pet treatment.** 60% opacity, Heart lucide outline
    replacing active-status pill, no candles, no condolence copy.
    Reverence-through-restraint.
11. **`<ClosedThreadRedirect />`.** Empty-state canvas card shown when a
    parent opens a closed thread or expects a message surface outside an
    open window. Renders the redirect copy ("AMS is walk-in only. Visit
    9am to 9pm Mon-Sat. For urgent issues, call [clinic number]."). Final
    visual treatment authored by user; new in v0 per the
    no-incoming-messages-outside-window lock 2026-05-06.
12. **`<VideoBubble />` plus `<InlineVideoOverlay />`.** Two-component pair
    for parent-uploaded video playback in threads (locked 2026-05-08).
    `<VideoBubble />` renders inline next to text and photo bubbles: first
    frame as a 4:3 or 16:9 thumbnail (matching source aspect) plus a Phosphor
    `Play` icon centred at 32px in canvas with 4px Berry ring on hover
    (dashboard) or pressed state (parent app). Tap opens
    `<InlineVideoOverlay />`: an absolutely-positioned overlay scoped to
    the thread panel container (`position: relative` parent, `position:
    absolute; inset: 0;` overlay). Backdrop is canvas at
    ~85% opacity; click-to-dismiss. Inside the backdrop, a canvas card with
    1.5px Ink border, no shadow, max-width sized to the thread panel, holds
    the platform-native player (`expo-video` Expo, HTML5 `<video controls>`
    dashboard) plus a top-right X close button (Phosphor `X`, 20px, Ink). The
    thread message list scroll position is preserved across open/dismiss.
    NOT a shadcn Dialog (those are viewport-modal); this is scoped to the
    thread panel only.
