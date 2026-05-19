# Pawkit · Parent flows + screens — co-creation in progress

## Context

In the previous turn I jumped straight to generating 7 parent-side Excalidraw mockups (`onboarding-parent-mockup`, `pet-profile-three-states-parent-mockup`, etc.) without first co-creating parent flows step by step with the user. This violated the explicit `feedback_co_create.md` rule — flows must be locked BEFORE screens are visualised.

This plan walks back. We co-create parent flows surface-by-surface using `AskUserQuestion` rounds (one round per surface, up to 4 decisions per round). Once all 8 surfaces are locked, this plan file becomes the source of truth for what the parent app does — to be merged back into the main plan file (`i-m-pitching-to-work-wiggly-dahl.md`) as a new "Parent Flows" section paralleling the existing "Admin Flows" section, and used to regenerate (or scrap) the 7 mockup files.

The 7 existing mockup files are SCRATCH — they reflect my assumptions, not the user's locked decisions. They may or may not survive flow co-creation.

## Surfaces to co-create (8 total)

1. **Daily pattern + landing + nav** (cross-cutting): What does a parent see when they open Pawkit? Tab bar inventory? Multi-pet handling? First-launch behaviour?
2. **Onboarding** (3 steps: Sign-in / Household / First pet): Auth method, required fields, photo timing
3. **Pet profile** (Empty / Sampling / Transformed / steady state — THE HERO): Empty-state contents, steady-state structure, follow-up banner visibility, editability
4. **Override picker bottom sheet** (the fur-match override flow): First-trigger, two-tone discoverability, save microcopy, re-sample
5. **Inbox / clinic conversation** (list + thread detail): Initiator, end-of-window behaviour, attachments, response-time chip
6. **Health Kit reading view**: Discovery, "Book this kit" semantics (AMS walk-in only), bilingual toggle scope, vet credentials
7. **Invoice reading view**: Delivery, "Send to family" semantics, list controls, info-icon tooltip content
8. **Broadcast inbox / announcement cards**: Push, reply behaviour, read-state sync, multi-clinic feed

## Decisions log

(filled in as user answers each round of AskUserQuestion)

### 1. Daily pattern + landing + nav
- **Returning-user landing:** Pet profile (defaults to most-recent / first pet). Anchored by the welcome line "your pet's records, in your pocket".
- **Tab bar: 3 tabs only — `Pets / Inbox / Invoices`.** Kits REMOVED from v0 parent nav (the concept of "Kit" to a parent has not been defined yet — deferred to a definition pass before reintroducing). News/Announcements/Broadcasts location TBD (clarification round below).
- **Multi-pet handling: DEFERRED.** User wants to see visual mockup options before deciding. Revisit when parent mockups regenerate post-flow-lock.
- **Post-onboarding landing:** Empty pet profile (Vanilla cover, Add photo CTA). Specific fields: just pet name + species + age (locked under "Pet profile" below).

### 2. Onboarding
- **Step 1 Auth:** "None for V0" — exact build scope TBD (clarification round below).
- **Step 2 Household:** Optional with default 'Your household' if skipped.
- **Step 3 First pet — fields all required:** name + species + breed + gender + (birthday OR age). All five compulsory at entry. (Implication: my parent-onboarding mockup had a too-thin Step 3 form; needs revision when we regenerate.)
- **Photo timing:** Deferred to after onboarding for both reasons combined — fur-match needs the pet page as its stage AND camera permission asked too early causes drop-off.

### 3. Pet profile
- **Empty state contents:** Just pet name + species + age (minimal — focus on photo invitation). Breed and gender are stored from Step 3 but not surfaced on Empty cover screen.
- **Transformed (steady-state) layout:** Cover + name + tabs (Timeline / Visits / Vaccinations / Notes) — same shape as admin pet profile. Consistent mental model across apps.
- **Follow-up window banner:** Yes, same 4px lime bar Paper banner as admin side. Identical visual treatment.
- **Editability constraint (NEW DECISION — propagate to schema + admin flows):** A parent CAN ADD a pet at Step 3 onboarding (5 fields all required). Once the clinic creates clinical records tied to that pet (visits, vaccinations, invoices), the identifying fields — **name, breed, sex, age** — become PERMANENT. No parent-side edit allowed thereafter. Photo and avatar may still be editable (TBD). Edits to permanent fields go through clinic via support channel (not in v0 build). **Reason:** preserves clinical record integrity; prevents accidental parent edits invalidating linked clinical records. **Impact on schema/admin:** the `pets` table needs a `clinical_lock` flag (or computed: locked when `visits.count > 0`). Admin-side has no parent-edit-request flow in v0.

### 4. Override picker
- **First trigger:** Tap the colour-badge button on Transformed pet profile. Override is opt-in — auto-match treated as "good enough" until parent disagrees.
- **Two-tone toggle discoverability:** Hidden under a 'More options' chevron at top of sheet. (Deviation from my recommendation. Reasoning: most parents only need solo tone; reduces noise on first sheet open. Two-tone is the edge case for tuxedos/calicos.)
- **Save microcopy:** Named save button — `Save Honey →` for solo, `Save Honey + Peach →` for two-tone. Per existing Layout Spec lock.
- **Re-sample:** Yes — 'Try a new photo' link at bottom of sheet. Photo was bad? Take another, run algorithm fresh.

### 5. Inbox / conversation
- **Initiator: vet only.** Parent replies within follow-up windows; cannot start cold threads. No "Message clinic" CTA on pet profile or anywhere.
- **End-of-window behaviour:** Composer disabled + system message in-thread + 'Closed' status pill on inbox row. The closing-message microcopy itself is co-written in the upcoming microcopy round (placeholder for now).
- **Attachment types: photos only.** Camera + gallery. Text + image bubbles supported. (Reversed from earlier "photos + videos" answer — video was dropped to avoid admin-side video-player scope add.)
- **Typical-response-time chip:** Yes, on every active thread. Symmetric expectation-setting — parent sees what Sagar sees.

### 6. Health Kit reading
- **Access path:** Vet shares a kit in a broadcast/announcement; parent taps the kit card to open the reading view. Kits surface ONLY through broadcasts (no inbox-thread sharing, no pet-profile suggestions, no catalogue). **Cross-cutting impact:** broadcast composer (admin) now needs a "Attach a Kit" affordance that turns a broadcast into a kit-card carrier. Update admin spec.
- **Bilingual toggle scope:** TBD (skipped this round — covered in microcopy round at the per-string level).
- **Vet credentials display:** TBD (skipped this round — confirm in design pass).

### 7. Invoice reading
- **Delivery:** Auto-appears in Invoices tab on next app open. **No push notification.** Quieter UX — parent discovers when they next open the app.
- **Sticky-bottom action: Download PDF only.** Drop "Send to family" entirely (existing Layout Spec #13 needs revision). One ghost button, that's it.
- **List filter: filter by pet (multi-pet households).** Pet picker chip strip atop the Invoices list ONLY in v0. The chip-strip pattern is NOT yet locked across other surfaces — Pets and Inbox tabs defer multi-pet handling until mockups regenerate.
- **Info-icon tooltip content:** Plain English explanation of procedure / medication (e.g., "Cefadroxil: antibiotic for soft-tissue infection"). Static dictionary keyed by item code. **NO** vet's free-text SOAP note — that stays private.

### 8. Broadcast inbox
- **Location: inside the Inbox tab.** Broadcasts appear as one-way cards alongside conversation threads. (Layout choice between unified feed vs sub-tabs Conversations/Announcements is a visual question — defer to mockup regeneration.)
- **Push notification:** Yes, every broadcast triggers push. Symmetric to clinic messages.
- **Reply: one-way.** Broadcasts are announcements, not conversations. Parent cannot reply to a broadcast.
- **Read state:** Server-side, syncs across devices. Tap on Phone A → already-read on Phone B. Adds a `broadcast_read_state` table or a per-row `read_at` timestamp on a join table.

## New project decisions to propagate to main plan file

- **`pets.clinical_lock`** — once clinical records exist (`visits.count > 0` for that pet), name/breed/sex/age fields lock. Add to schema patches list. Update admin flows to surface lock status; parent UI hides edit affordances on locked pets.
- **3-tab parent nav** (Pets / Inbox / Invoices) is canonical. Update `gen-parent-mockups.js` `tabBar()` helper; remove Kits and News tabs. Update Build Order Day 4 description.
- **No Step 1 phone OTP** in v0 onboarding. Onboarding starts at Step 2 (household name, optional with default 'Your household'). Step 3 is first pet (5 fields all required). Skipped Step 1 surface in build entirely. Affects Supabase Auth scope (no SMS provider needed).
- **Step 3 onboarding pet form is heavier than current mockup** — name + species + breed + gender + (birthday OR age), all five required. Update `screenOnboarding()` in generator.
- **Broadcasts live inside Inbox tab** for parent app. No standalone News/Announcements tab. Update inbox-conversation-parent mockup to show broadcast cards interleaved with conversation rows OR Inbox sub-tabs (visual decision deferred to mockup regeneration).
- **Health Kits surface only via broadcast cards** in v0 parent app. **Admin ripple:** broadcast composer needs a "Attach a Kit" affordance. Update admin broadcast composer mockup + spec.
- **Photos-only attachments** on parent-side messages. No videos. No voice. (Photo + image bubbles only — symmetric with admin side.)
- **Server-side broadcast read state.** Add `broadcasts_read` table or `read_at` column to schema. Update Patches list.
- **Window-close in-thread microcopy** is a microcopy-round string (placeholder until then).
- **Override picker two-tone toggle hidden under 'More options' chevron** at top of sheet (deviation from Layout Spec #10 which had it always-visible). Update Layout Spec #10.
- **Multi-pet UI pattern: chip strip on Invoices list ONLY in v0.** Pets and Inbox tabs defer multi-pet handling until mockups regenerate. (Risk: inconsistent multi-pet UX across tabs — flag for review post-regeneration.)
- **Drop "Send to family" from invoice screen.** Layout Spec #13 needs revision — sticky-bottom action is just Download (PDF), no Send.
- **Bilingual toggle scope on Health Kit reading view + vet credentials display** were skipped this round; defer to design pass after mockups regenerate.

## Open deferrals (lock later)

1. **Multi-pet handling on Pets and Inbox tabs** — pending mockup regeneration. User wants to see options visually before deciding.
2. **Inbox tab layout** — broadcasts interleaved with conversations vs sub-tabs (Conversations / Announcements). Visual decision.
3. **Health Kit bilingual toggle scope** — what does the EN/MR toggle switch (whole page chrome vs body content only)?
4. **Vet credentials displayed on Health Kit reading view** — name only, name+clinic, name+license, etc.
5. **Window-close in-thread system message** — exact microcopy in EN + MR. Microcopy round.
6. **Closing-message microcopy for end-of-window** in inbox threads. Microcopy round.

## Critical files

- **Main plan file** (target merge): `C:\Users\Jolene Fernandes\.claude\plans\i-m-pitching-to-work-wiggly-dahl.md` — needs new "Parent Flows" section parallel to existing "Admin Flows" section
- **Mockup files** (need re-check after flow lock):
  - `onboarding-parent-mockup.excalidraw`
  - `pet-profile-three-states-parent-mockup.excalidraw`
  - `override-picker-parent-mockup.excalidraw`
  - `inbox-conversation-parent-mockup.excalidraw`
  - `health-kit-reading-parent-mockup.excalidraw`
  - `invoice-reading-parent-mockup.excalidraw`
  - `broadcast-inbox-parent-mockup.excalidraw`
- **Generator script**: `gen-parent-mockups.js` (re-runnable after decisions lock — adjust per-screen functions to match locked decisions)

## Implementation steps (next session)

1. **Update `gen-parent-mockups.js`** with locked decisions:
   - `tabBar()` → 3 tabs (Pets / Inbox / Invoices), drop Kits and News
   - `screenOnboarding()` → 2 phones only (skip sign-in step entirely); Step 2 household + Step 3 pet (with all 5 fields visible)
   - `screenInboxConversation()` → text + image bubbles only (no video icon); show broadcast cards interleaved with conversation rows OR add sub-tab structure (decide visual)
   - `screenInvoiceReading()` → drop Send button; only Download CTA; add pet-filter chip strip atop list
   - `screenBroadcastInbox()` → reframe as Inbox content (this file may merge into inbox-conversation file or become a sub-view)
   - `screenHealthKitReading()` → entry context becomes "opened from a broadcast card" (add a back-to-broadcast affordance)
   - Override picker two-tone toggle behind 'More options' chevron — update `pickerPhone()`
   - Honour `pets.clinical_lock` visually on Transformed pet profile (greyed-out edit affordances when locked)

2. **Re-run generator** → produce 6 (or fewer) updated parent mockup files.

3. **Merge locked decisions into main plan file** `i-m-pitching-to-work-wiggly-dahl.md`:
   - Add a new "Parent Flows" section (parallel structure to "Admin Flows" section, locked May 2)
   - Update Layout Spec #10 (override picker — two-tone discoverability change)
   - Update Layout Spec #13 (invoice — drop Send to family)
   - Update Schema section with `pets.clinical_lock` patch + `broadcasts_read` table patch
   - Update Decisions Log with new entries (no Step 1 OTP, 3-tab nav, broadcasts-in-inbox, kits-via-broadcasts-only, photos-only attachments)
   - Update Build Order Day 4 description to reflect 2-step onboarding instead of 3

4. **Open deferrals tracking** — create a small "Parent flow open issues" subsection in the main plan file listing the 6 deferrals above so they're visible to next-session-me.

5. **Verification** — walk every locked decision against `feedback_no_inventions.md` and `project_ams_facts.md` to confirm no scope violations. Compare against `feedback_ai_scope.md` to confirm AI scope unchanged (still Haiku classify+draft + Sarvam voice-input only).

## Verification (after implementation)

1. Open each regenerated mockup file in Excalidraw — confirm chrome is consistent (3 tabs not 5), no Send-on-invoice, no video icon in composer.
2. Confirm main plan file's Parent Flows section reads as a coherent parallel to Admin Flows section.
3. Confirm schema has the two new patches (`pets.clinical_lock`, `broadcasts_read`).
4. Run a "delta diff" against the old 7 parent mockup files — should be: 1 file deleted (separate broadcast file likely merged into inbox), 1 file changed structurally (onboarding from 3 phones to 2), all others updated for nav + content.
