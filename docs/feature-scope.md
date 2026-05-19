# v0 Feature Scope (Locked)

The canonical in/out list for v0. Rationale lives in `docs/decisions-log.md`; this
file is for quick reference at build time.

## In scope

### Clinic dashboard
- App shell with left rail: Inbox / Broadcasts / Settings (no Pets tab).
- Inbox: single queue of open-follow-up-window threads (no buckets, no classifier, no AI-drafted replies; every incoming message is a clinical follow-up by virtue of being in an open window).
- Per-pet medical profile: timeline of visits + vaccinations, chronic conditions, allergies, medications, open follow-up window banner.
- Clinical history full screen (view-only SOAP preview: Subjective / Objective / Assessment / Plan per visit; hand-written for v0; opened from pet panel Clinical History tab via "Open full" button).
- Itemised invoice view (view-only, opened from pet panel Invoices tab by tapping a row). Three categories only for v0: Examination, Medication, Procedure (no Follow-up / pre-paid recheck category). Examination and Procedure line items show a flexible plain-English tooltip rendered inline beneath the line name (no info icon, redundant since tooltip is always visible). Medication line items show name (with quantity / volume) + price only; no usage instructions, no tooltip. No Paid status pill, no owner/pet identity strip (identity already lives in the inbox thread above), no Download PDF affordance in v0 (deferred). Totals stack right-aligned tabular numerals (grand Total only, no Subtotal/GST breakdown row; "GST included" italic note underneath).
- Video bubble + centered pop-up overlay player (native HTML5 `<video controls>`). Sagar reviews parent-uploaded videos by tapping the bubble; opens a centered pop-up overlay covering ~60% of the dashboard viewport at default size, with an option to expand to larger (maximize affordance) + close to dismiss. Pop-up extends beyond the thread panel but stops short of full viewport (left rail remains visible). No third-party player library.
- Broadcast composer with audience filter (species, age range, exclude_deceased toggle, etc.) + voice input via Sarvam AI.
- Broadcast editor and preview. Content shape (Patch 9 + Patch 10 unification): title, key_points, body, warning_signs, escalation, all bilingual EN+MR, optional cover image, no pricing. Broadcasts surface on the parent side via the Broadcasts tab. Each broadcast gets a `public_slug` for the public web reading URL `pawkit.app/broadcasts/[slug]`.
- `/style-guide` route: shadcn primitive audit + Berry audit + Fur kit audit + Spacing audit. Per `docs/premium-feel/spacing.md`. (Vellum audit dropped 2026-05-15 alongside the vellum sweep on the dashboard.)

### Pet-parent app
- 2-step onboarding (household optional → first pet with 5 fields all required: name + species + breed + gender + birthday-or-age). NO phone OTP. Auth pre-seeded for the Fernandes demo.
- 5-tab icon-only bottom nav: **Broadcasts / Community / Pets (default landing) / Inbox / Shop.** Phosphor tab icons (filled weight): Megaphone / Users / PawPrint / Tray / ShoppingBag. Active tab uses Berry fill + Berry text; inactive uses Ink-soft; no text labels (aria-labels carry the role for screen readers). **Master Settings is not in the bottom nav** (was the 6th tab in the 2026-05-09 lock); it's reached via the household-initial avatar pill in the top-right of the Pet Page cover. The earlier 6-tab + Lucide stack is fully superseded; see `docs/flows/parent.md` for the current parent nav model.
- **Broadcasts tab.** Clinic-wide one-way feed of broadcasts from the vet, chronological. Vet avatar + clinic name + body in selected language + per-card EN/MR toggle + timestamp + 6px Berry unread dot. Composer disabled (one-way).
- **Pets tab.** Vertical list view with one row per pet (avatar with fur-match ring + name in Inter + species/breed/age subline + 6px Berry open-window indicator dot). Deceased pets at 60% opacity with a Phosphor Heart icon. Sticky-bottom Berry "Add a pet" CTA opens a form identical to Onboarding Step 2 (`<PetIdentityForm />` shared component). Submit lands on new pet's empty Pet Page, triggers fur-match flow on first photo upload.
- **Inbox tab.** Per-pet 1:1 threads only (locked 2026-05-08). One row per living pet (avatar with fur-match ring + pet name + last message snippet or system reminder text + timestamp + optional 6px Berry unread dot + 4px Berry left bar on rows with active follow-up window). Pets with no threads yet show "No conversations yet" subline. Deceased pets removed from list (past messages live on memorial Pet Page). Vet-only initiator. Photo and video attachments on parent-side; vet-side text-only.
- **Community tab.** Dummy tab in v0 carrying a pitchable teaser screen for the V3+ Pawkit Plus social layer (city circles, breed groups, vet AMAs, lost-and-found, verified clinic reviews). Engine 2 of the three-engine ARR model.
- **Shop tab.** Dummy tab in v0 carrying a pitchable teaser screen for the V4+ clinically-curated marketplace (therapeutic diets, pharma, hygiene, supplements with clinical evidence, insurance). Engine 3 of the three-engine ARR model.
- **Master Settings screen (locked 2026-05-09; entry-point moved from a 6th nav tab to the household-initial avatar pill in the Pet Page cover top-right).** Sections: Account (phone read-only, household name editable inline, EN/MR language segmented toggle as the master override for the bilingual lock); Pets (one row per living pet with fur-match-ring avatar, tap navigates to that pet's Per-pet Settings sub-screen); Notifications (single push on/off toggle); About (version line + clinic affiliation in Ink-faint); Sign-out ghost button at bottom. Visual: Inter eyebrow Ink-soft section labels, canvas cards with 1px rule border + rule-soft dividers, 56-64px row height, no fur tokens in chrome.
- **Per-pet Settings sub-screen (locked 2026-05-09).** Reachable from two entry points: gear pill on Pet Page cover top-right AND the Pets section row on master Settings. Editable: Photo (auto-re-runs fur-match on replace), Fur match (Re-run match Berry CTA, Override ghost opens picker bottom sheet), Adoption year. Read-only Identity card (name + breed + sex + birthday) locked because of `pets.clinical_lock`, with italic footnote explaining why.
- Pet profile three-state fur-match flow (Empty Ink-faint → Sampling Sable+Berry-scan-line → Transformed gradient cover + magic toast).
- Steady-state Pet Page: full-bleed photo cover with 10px fur-token accent border at bottom + name in Lora italic 600 + vet byline + tabs (**Timeline / Vaccinations / Invoices**, locked 2026-05-08). Open follow-up window banner with 4px Berry bar (doubles as quick link to that pet's inbox thread). Closed-window quick link "View past conversations with Dr Sagar" in Ink-soft, hidden if no thread ever existed. Reminder banner above tabs if an active per-pet reminder exists (Phosphor Bell or Calendar icon in Ink, deep-links to relevant tab).
- Per-pet reminders surface on Pet Page homepage banner AND as system message cards in that pet's inbox thread (no reply UI; acting on the reminder = clinic walk-in).
- Override picker bottom sheet (two-tone toggle hidden behind 'More options' chevron, 3-col chip grid of 10 fur tokens, named save button, 'Try a new photo' link).
- Video bubble + inline overlay player (`expo-video`). Parent reviews their own uploaded video by tapping its bubble; opens an inline overlay scoped to the thread panel (not a full-screen modal). 60-second cap surfaced on the attach surface before upload begins.
- Broadcast reading view (entered from a Broadcast card on the Broadcasts tab, "Back to Broadcasts" pill): title, key_points bullet list, body, warning_signs (Phosphor WarningCircle prefix in Ink), escalation (Phosphor Phone prefix in Ink). Sticky-bottom Share button (WhatsApp / Social / Email).
- Public unauthenticated broadcast reading URL at `apps/dashboard/app/broadcasts/[slug]/page.tsx`.
- Invoices surface in two places (locked 2026-05-15): (1) PER-PET inside Pet Page — each pet's Invoices tab lists that pet's invoices chronologically; tap → reading view with Total + line items + Download PDF only; (2) TOP-LEVEL `/billing` ledger — clinic-wide invoice list, scope picker (current month / specific month / all time), Billed / Collected / Outstanding KPI cards, ink-fill pill tabs (All / Unpaid / Paid), 6-rows-per-page table, row click → `/billing/[invoiceId]` detail page. Two-state status (paid / unpaid). Mark paid is manual status tracking on the detail page (no in-app payment processing). Reverses the 2026-05-08 "no top-level Invoices tab" lock; both surfaces now coexist.
- `pets.clinical_lock` enforcement: edit affordances hidden once clinical records exist.
- Server-side broadcast read state (synced across devices). Definition of read: parent taps the broadcast detail screen from their inbox (one INSERT into `broadcasts_read` per parent per broadcast, composite PK enforces idempotency). Dashboard surface displays per-broadcast read count + rate (mockup at `mockups/broadcast-read-counts.html`; locked 2026-05-17 evening).
- Pawkit app icon + Expo splash screen extending the Honey→Peach gradient. Per `docs/premium-feel/first-run.md`.
- Haptic feedback (`expo-haptics`). Per `docs/premium-feel/haptics.md`.

### Cross-cutting Premium Feel System
9 disciplines specced under `docs/premium-feel/` (one file each):

- Motion (3 easings + 5 durations, 60fps on mid-range Android via Reanimated 4)
- Photography direction (4:5 portrait, soft window light, +10 warmth -5 saturation)
- Voice & microcopy (FK grade 5 parent / 8 dashboard, do/don't matrix, Marathi non-literal mirror)
- States (loading skeletons, empty grammar, 3 error types, offline banner, stale caption)
- Haptics (parent app pattern map)
- First-run assets (app icon + splash + PWA manifest + notification icon)
- Vet byline component (`<VetByline />` 3 variants)
- Spacing rhythm (8-value scale + Lora italic ascent correction; was Spectral italic in v1.3)
- Materials (depth language: 1.5px / 1px / 0; vellum SVG filter swept out of dashboard 2026-05-15, parent-app status open)

## Out of scope for v0

- WhatsApp / AiSensy
- AI Triage (permanently cancelled from Pawkit, locked 2026-05-06; future diagnostics product is a separate company that may or may not integrate with Pawkit later, see `docs/decisions-log.md`)
- In-app payments (no Razorpay / Stripe; parent invoice is view-only, no Pay now CTA; dashboard "Mark paid" is manual status tracking only)
- Appointment booking (AMS is walk-in only; no calendar, no booking flow, no "Booking request" classifier bucket)
- At-home examinations
- Multi-clinic, multi-vet schedules
- Community posts / circles / lost-and-found
- Pawkit Plus
- Three-tone matching, pattern detection beyond colour clustering
- Dark mode
- Phone OTP / SMS auth in v0 onboarding
- Voice attachments on messages (parent or admin side)
- Vet-side media attachments (vet replies are text-only; parent-side carries photos and videos)
- Parent-initiated cold threads (vet-only initiator)
- Standalone Broadcast catalogue / browseable directory (Broadcasts tab is chronological feed only)
- "Send to family" CTA on invoices
- Invoice filtering by pet / household inside `/billing` (popover plumbing exists in the design pack but no triggers in v0; deferred to v0.1)
- Custom date-range picker UI on `/billing` (URL `?range=custom&from=...&to=...` works; the picker UI is deferred to v0.1)
- New-invoice flow (creating an invoice from the dashboard; deferred to v0.1 — invoices arrive via the seed only)
- Export CSV on `/billing` (deferred until new-invoice flow ships)
- Searching by invoice number / amount in the topbar search (topbar search keeps its inbox-context placeholder; deferred to v0.1)
- Active functionality on Community and Shop tabs (placeholders only in v0; teaser content for V3/V4)
- Parent reply / reaction on broadcasts (Broadcasts tab is one-way)
- `audit_log` writes (table exists in schema, no triggers, no UI surface; deferred to v1+ per `docs/decisions-log.md` 2026-05-17 evening)
- Care kit views tracking (broadcasts_read tracks the tap-into-broadcast event but not the deep tap-into-attached-kit event; the "Care kit views" metric on the broadcast detail page renders muted 0 in v0)
- Multi-clinic broadcast feed
- Broadcast pricing / paid broadcasts (deferred to v1+)
- Broadcast booking CTA (broadcasts are informational, not bookable)
- Custom pet-specific iconography (vaccine vial, microchip, water bowl, paw scale, leash, treat). Phosphor filled alone is disciplined enough for v0; deferred to v0.1.
- Onboarding ceremony Lottie (5-8s first-run animation + post-Step-2 celebration screen; deferred to v0.1; Step 1 to Step 2 transition stays under motion system)
- Performance perception polish (optimistic UI on send / pre-fetch / frame-budget monitoring; deferred to v0.1; modern Next.js + Expo handle pre-fetch implicitly)
- Sound design (haptics replace audio cues for parent app)
- Dashboard PWA manifest + dashboard app icon + monochrome notification icon (dropped 2026-05-10 alongside the no-Sagar-push lock; v1+ when push comes back; see `docs/decisions-log.md` Notifications section). Dashboard ships a browser-tab favicon only in v0.
- Sagar-side push notifications of any kind (no PWA-on-Android, no Web Push API on the desktop browser; locked 2026-05-10; v1+ when dashboard either goes mobile-responsive or grows browser-push)

## v0 AI scope (locked)

Two features, both Sarvam-vendor, both dashboard-only, both producing
text Sagar reviews before output ships:

1. **Sarvam Audio (with Whisper fallback for English) transcribes voice
   INPUT to text** on dashboard compose surfaces (Broadcast body and
   structured-section fields, inbox reply).
2. **Sarvam Translate auto-generates the other-language version of a
   Broadcast (EN ↔ MR)** at compose time, surfaced as text Sagar
   reviews and approves sequentially before publish.

No classifier, no drafted replies, no triage, no clinical decision
support. No AI on parent app.
