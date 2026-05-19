# Decisions Log (Pawkit v0)

The locked state of the project. Every choice that should not be relitigated. **Locked
state only.** No historical narrative, no "we changed from X to Y because", no dated
revision logs. History lives in git; rationale that needs preserving lives in
`session-logs/`.

---

## Dashboard primary-CTA size lock (locked 2026-05-18 v3)

Every primary CTA at the top of a dashboard page renders at the same anatomy:

- `size="h44"` (Pawkit-locked h-11, ~44px tall)
- `text-md` (14px), `font-semibold`, `gap-2.5`
- Berry fill via `variant="default"` (or rounded-full on the billing picker)
- Subtle drop shadow: `shadow-[0_1px_2px_rgba(15,12,10,0.06),_0_4px_14px_-6px_rgba(156,43,92,0.45)]` with deeper hover

Applied to:
- **Inbox** — `Start reply queue` (LHS)
- **Broadcasts** — `New broadcast` (LHS)
- **Billing** — `Showing {month}` (the page-defining month picker)

Filter pill-pairs across pages stay at the locked tab anatomy (`py-1.5 px-4 text-sm` with `p-1` list, `bg-canvas-2` ground). Hierarchy comes from the CTA being bigger, not from shrinking the tabs.

## Inbox header CTA-dominant rebuild (locked 2026-05-18)

The inbox top region is a single CTA-dominant row: `Start reply queue` (h44 per the dashboard CTA lock above) on the LHS, `Awaiting reply` / `Replied` pill-pair on the RHS at the locked dashboard tab size (matches Sent/Drafts on broadcasts).

**v4 update 2026-05-18:** the inline pulse dot inside the CTA was removed because it physically widened the inbox button vs its broadcasts + billing peers, breaking the dashboard-wide "all LHS buttons same size" rule (see CTA-size lock above). Live-work urgency is carried entirely by the rail badge in the sidebar.

**Removed:** the standalone berry-soft awaiting bar with "X parents are waiting on you" copy. The count was triple-redundant with the rail badge + future in-tab counts; removing it kills the visual repetition. Rail badge owns the count globally.

**Locked design principle:** primary action anchors LHS in every page header (matches the Broadcasts list flip 2026-05-18 v3 — New broadcast on LHS, Sent/Drafts tabs on RHS). First-touch position; eye lands on the click target before the chrome.

**Implementation:** `apps/dashboard/app/(dashboard)/inbox/inbox-client.tsx` — `AwaitingBar` component removed, header merged into the layout above the thread list.

**CSS:** new `.animate-pawkit-pulse` utility + `@keyframes pawkit-pulse` in `apps/dashboard/app/globals.css` for the dot's ripple effect (expanding box-shadow + opacity bounce, 1.4s loop). Clinical/subtle rather than marketing-y.

Reference at `mockups/inbox-header-redesign.html` Option C.

## Tech-debt plan locked (2026-05-18)

Audit at `TECH_DEBT_AUDIT.md`. Plan at `docs/tech-debt-plan.md`. **Phase 1-4 of that plan must be executed before any V1 feature work begins.** Phase 0 (doc + memory drift reconciliation) shipped 2026-05-18 in the same session. Phase 1-2 are post-demo, low-risk-but-non-trivial cleanup. Phase 3 is the god-file splits (`lib/data.ts`, `composer-canvas.tsx`, `billing-client.tsx`, `settings-client.tsx`). Phase 4 is test coverage for the audience resolver. Phase 5 (Supabase Auth) is V1+ scope and tracked separately in `docs/risk-register.md`.

The plan also surfaced a previously-missed item: `0007_security_hardening.sql` is in the production DB (applied 2026-05-17) but the migration file isn't committed to `supabase/migrations/`. Recovery is Phase 1 work (F006-A in the plan).

---

## Broadcast voice-dump feature (locked 2026-05-18)

Broadcast composer ships a voice-first landing in v0 demo. Vet taps "New broadcast," lands on a single big mic prompt, speaks freely for up to 10 minutes about any topic, Pawkit returns a fully structured 5-section broadcast in the existing composer chrome — ready to edit, translate, and send.

- **Pipeline.** Sarvam Saarika batch STT → Groq Llama 3.3 70B structuring → existing composer canvas (populated draft) → Sarvam Mayura on first मराठी toggle.
- **Streaming upgrade deferred, not entitlement-blocked (2026-05-19 correction).** Sarvam Saarika/Saaras WebSocket streaming is available at `wss://api.sarvam.ai/speech-to-text/ws`. The 2026-05-18 smoke tests returned 403 on five attempted URLs because none of them matched the documented path; Claude misdiagnosed as account entitlement gating and emailed `developer@sarvam.ai`. Sarvam support corrected the URL on 2026-05-19. v0 keeps the batch endpoint (working, 30s-capped via 25s rolling segments). Post-demo: swap batch for WS streaming. Connect to `wss://api.sarvam.ai/speech-to-text/ws?language_code=<lang>&model=saaras:v3&mode=transcribe&sample_rate=16000` with header `api-subscription-key: <KEY>`. Audio must be PCM (`pcm_s16le`/`pcm_l16`) or WAV; MP3 and AAC are not supported. Sarvam recommends `saaras:v3` model; `saarika:v2.5` also works over WS for continuity. Lesson logged: verify URL paths against vendor docs before hypothesizing access/entitlement issues from 403s.
- **Route structure.** v0 demo: voice-first at `/broadcasts/new`, "Compose manually instead" link to `/broadcasts/new/manual`. Post-demo: flip to mode-picker via single config constant; saves the eager-translation cost on broadcasts the vet would've typed anyway.
- **Groq fallback policy.** If Groq returns malformed JSON or fails to parse the transcript, dump the raw transcript into the Body field of the existing composer + show a soft toast "couldn't structure this one, fill in the sections manually." Vet's words are never lost.
- **Marathi translation timing: lazy.** No background translation. The existing मराठी language toggle in the composer IS the trigger. First toggle kicks off Sarvam Mayura, brief 2-3 sec spinner, MR populates and is cached for the rest of that draft session. Saves the ₹5-15 cost on any broadcast the vet doesn't toggle. No new button needed.
- **Long recording.** Soft 10-minute cap. At 8 min, an "approaching limit" badge fades in near the duration counter. At 10 min, recording auto-stops and Pawkit moves to structuring. Vet's words from 0:00-10:00 are preserved. Higher caps are a v1+ consideration when Sarvam streaming supports session chunking.
- **Three reassurance layers** to teach "speak messy, not perfect":
  1. Subtext under the headline (always visible): "Speak naturally. Cover things in any order. Restarts and corrections are fine. Pawkit sorts it out."
  2. First-use coach mark above the mic (localStorage-flagged, dismissible): "Don't worry about getting it perfect. Say something wrong? Just keep going. Pawkit organises it at the end."
  3. In-recording pill inside the live transcript card (visible while recording): "You can restart sentences or jump topics. Keep going."
- **Post-dictation hand-off.** Structured 5-section output (topic, body, key points, warning signs, when to call us) populates the existing composer canvas — same toolbar, cover photo slot, title field, body field, section editors with up/down/trash controls, add-section chips, audience strip, send footer. No new UX to learn. Per-field voice mic still available for inline edits.
- **AI scope expansion.** v0 had Sarvam Audio + Sarvam Translate only. Voice-dump adds Groq Llama 3.3 70B for transcript-to-JSON structuring. Supersedes the earlier "Sarvam vendor only" lock for v0 broadcasts. No Claude / OpenAI keys needed.
- **Cost forecast.** ~₹8-25 per broadcast (₹3-15 Sarvam STT + ₹0.10 Groq + ₹5-15 Sarvam Mayura when toggled). At 100 clinics × 80 broadcasts/year = ~₹1.2L/year AI infra, well under 1% of revenue.
- **API keys.** `SARVAM_API_KEY` (existing) for Saarika batch + Mayura. `GROQ_API_KEY` (added 2026-05-18) for Llama 3.3 70B structuring.

Mockup spec locked at `mockups/broadcast-voice-dump-options.html` (Option A with all three reassurance layers, recording state, and post-dictation review state).

## Broadcast read-receipt definition + seed (locked 2026-05-17 evening)

A broadcast is **"read" when the parent taps the broadcast detail screen
from their inbox**. One row in `broadcasts_read` per parent per broadcast
(composite PK `broadcast_id + user_id`). The parent-app handler inserts
on mount of the broadcast detail route; idempotent against the unique
constraint.

- **Seeded rates.** 88% / 68% / 41% across the three sent broadcasts:
  - Monsoon tick prevention (urgent + has health kit): 102 / 116 dog
    households = 88%
  - Annual vaccination drive (narrow audience): 34 / 50 = 68%
  - Holiday hours Aug 15 (broad, low-urgency): 61 / 150 = 41%
- **Read-time distribution.** Each read row's `read_at` staggers as 70%
  in the first 6h after `sent_at`, 30% in the remaining 18h. Produces
  the spike-then-taper curve real consumer messaging tools show.
- **Dashboard surface.** Two surfaces mocked at
  `mockups/broadcast-read-counts.html`: (1) broadcast list cards carry
  a berry-soft read pill ("88% · 102 / 116 read") + a 4px micro-bar;
  (2) detail page shows audience / read / rate / care-kit-views
  numbers across the top, with a 24-hour reads-over-time bar curve.
- **Care kit views = 0 in v0.** Tap-into-kit-from-broadcast click
  tracking is deferred to v1+; the metric is shown as muted "0" so
  the slot exists for future instrumentation.
- **Seed mechanism.** `scripts/seed-50-pets.mjs` tracks `allParentIds`,
  `dogHouseholdParentIds`, `activeHouseholdParentIds` during the
  household loop; after main inserts it shuffles each audience pool
  with a dedicated mulberry32 RNG (`0xbeef0001+`) and takes the top N
  for the target rate. Also refreshes `broadcasts.audience_count` to
  match the current dataset's matching audience.

## Audit log deferred to v1+ (locked 2026-05-17 evening)

`public.audit_log` is in the schema (`0001_init_schema.sql`) but no
triggers write to it and no UI surfaces it. v0 ships **with the empty
table + RLS-deny-all default** (no policy = no access except service
role). v1+ work: build per-table triggers on visits/invoices/messages
mutations, add a `SELECT` policy for `role IN ('vet','staff')`,
build the audit-log viewer surface.

- **Why defer.** Demo has zero pitch value for an audit log; build is
  ~3 hours; v0 demo is single-tenant single-user. Sagar will never look
  at audit logs during the pitch.
- **Schema cost.** Table sits; FKs are valid (`changed_by → users.id`);
  no broken references in queries because nothing reads from it.

## Security hardening migration 0007 (locked 2026-05-17 evening)

`supabase/migrations/0007_security_hardening.sql` resolves 11 of 11
Supabase advisor warnings flagged in the 2026-05-17 schema audit. Now
1 INFO remaining (audit_log RLS-no-policy, intentionally deferred per
above).

- `REVOKE EXECUTE` on `reset_all_data()` + `rls_auto_enable()` from
  `anon`, `authenticated`, `PUBLIC`. Closes the path where a signed-in
  parent could POST `/rest/v1/rpc/reset_all_data` and wipe the DB.
- `ALTER FUNCTION ... SET search_path = public, pg_temp` on six
  functions: `set_clinical_lock`, `set_updated_at`, `days_ago`,
  `days_ahead`, `months_ago`, `reset_all_data`, `rls_auto_enable`.
  Closes the theoretical privilege-escalation vector from same-named
  functions in malicious schemas.
- `CREATE POLICY "Public read clinics (v0 demo)"` on `clinics` for
  `anon, authenticated`. v0 is single-tenant (AMS); parent app needs
  clinic name/phone without auth gymnastics. v1+ will scope by
  clinic_id when Pawkit serves multiple clinics.

## Vaccinations seeded for every active pet (locked 2026-05-17 evening)

Each of the 50 active demo pets has **DHPP + Rabies** vaccinations
written to the `vaccinations` table at visit 1 (the vaccination
visit). `administered_date = v1` ; `next_due_date = v1 + 12 months` ;
`batch_number = B{NNN}-{1|2}`. 100 vaccination rows total + 7 Fernandes
preserved = 107.

- **Why.** v0 demo may surface "Vaccination history" on any pet card;
  empty list reads as broken. DHPP + Rabies is the AMS standard combo
  for first-year and annual boosters.
- **Quiet pets.** The 150 bare-quiet pets have no vaccinations (they
  also have no visits, invoices, messages, follow-up windows). Quiet =
  identity only.

## Supabase region: stay in Tokyo for v0 (locked 2026-05-17)

Project `pevofxnfjcvmamdcfkus` lives in `ap-northeast-1` (Tokyo).
Migration to `ap-south-1` (Mumbai) is deferred to post-demo.

- **Current state** (verified via Supabase MCP 2026-05-17): 6
  migrations applied; ~2,608 rows seeded across 12 `public` tables;
  42 storage objects across 4 buckets.
- **Migration cost.** Half-day port: create new Mumbai project,
  re-apply 6 migrations in order, re-run seed scripts, re-upload
  42 storage objects, regenerate anon + service keys, update three
  `.env.local` files (dashboard, parent app, supabase scripts),
  re-do MCP OAuth, rebuild the EAS preview APK
  (`EXPO_PUBLIC_SUPABASE_URL` is frozen at build time), smoke-test
  the round-trip.
- **Why defer.** Demo is inside Sagar's mid-May window. User
  accepted v0 latency cost (Pune → Tokyo ~80-120ms vs Pune →
  Mumbai ~10-20ms per query) in favor of demo stability.
- **Revisit trigger.** Post-demo, when AMS-paid subscription tier
  kicks in. Tracked in `docs/open-issues.md`.

## Multi-variant parent messages in seed (locked 2026-05-16 evening)

`PARENT_MESSAGES` in `scripts/seed-50-pets.mjs` is keyed by `case_type`
with **arrays of EN variants**, not single strings. The seed loop tracks
a per-case-type ordinal and picks `variants[ord % len]` so multi-pet
case_types render distinct inbox previews. A `renderParentMessage(template, pet)`
helper substitutes `{name}` / `{they}` / `{them}` / `{their}` from each
pet's name + sex.

- **Replaces** the single-string-per-case-type model that rendered 35
  of 50 inbox rows with identical bodies (e.g. Pluto + Bagheera + Yogi
  all saying *"Doctor, the Galliprant has helped but in the last 2
  days he's been refusing his evening walk..."*).
- **MR coverage unchanged.** The first pet per case_type still
  promotes to Marathi (`MARATHI_PARENT_MESSAGES[caseType]`,
  single-string). Coverage stays at 17/50 = 34%, matching the
  locked ~30% target.
- **Variant counts:** match the collision count per case_type (6 for
  skin_allergy / lameness, 4 for vaccination / wellness /
  senior_decline / gi_upset / eye_uri, 3 for spay_recovery /
  ear_otitis / ckd_recheck, 2 for tick_fever / breathing, 1 for
  single-pet cases). Smoke test in `scripts/seed-50-pets.mjs` walk
  produces 50 unique EN bodies.
- **Voice:** FK grade 5 parent voice, no em dashes, clinical terms
  preserved where natural (Galliprant, Dasuquin, Cytopoint, doxycycline,
  Mometamax, etc). Variants vary tone (anxious / calm / factual /
  vivid / brief) to read as different parent voices, not one parent
  with a thesaurus.
- **Pronoun handling:** the prior model hardcoded "he"/"she" per
  case_type (e.g. skin_allergy was "he"-only, which mis-pronouned
  Hazel + Marble). The template substitution fixes this; pronouns
  now follow each pet's sex.
- **Add-a-variant workflow:** if a new pet is added with an existing
  case_type and would push collision count past the variants array
  length, add a new variant string before re-seeding (`ord % len`
  cycles cleanly with any length).

## Mockup authorship: Claude Code only (locked 2026-05-16 evening)

All further parent-app and dashboard mockup edits are done by Claude Code
(this assistant) directly. Claude Design (the separate mockup-generating
agent that delivered v1, v2, v3 of the parent app hi-fi via Downloads) is
retired from the workflow.

- **Supersedes** the 2026-05-11 mockup-authorship reversal that put Claude
  Design in charge of Phase 2 visual mockups. That arrangement produced
  three rounds (v1 → v2 → v3 → v3.1) and Direction A photos landed
  unprompted, so the agent demonstrably had craft chops. But the v3 → v3.1
  cycle showed Claude Code can apply targeted ticket fixes inline in a
  single turn versus the slower hand-back-receive-folder round-trip.
- **Mockup canonical location:** `mockups/parent-app-hifi.html` is the
  single-file standalone that lives in the project repo.
  `mockups/index.html` links it as a Current card.
- **Editable source location:** `mockups/parent-app-source/` (locked
  2026-05-16 evening, option 2 picked). 13 source files + `assets/`
  subfolder live in-repo. The Downloads copy of the v3.1 folder was
  deleted after the move.
- **Regen pipeline:** `bash mockups/parent-app-source/regen.sh` rebuilds
  the single-file standalone at `mockups/parent-app-hifi.html` from the
  source. The script inlines tokens.css + primitives.css into a `<style>`
  block and every `.jsx` file into sequential `<script type="text/babel">`
  blocks, preserving the SVG sprite + React/Babel CDN script tags from
  `Parent App.html`. Output is deterministic; ~5200 lines, ~222 KB.
- **Edit workflow going forward:** edit individual files in
  `mockups/parent-app-source/` (one .jsx per logical surface, two .css
  files for tokens + primitives). After each edit pass run `regen.sh` to
  refresh the standalone. The standalone is the file
  `mockups/index.html` links from the Current card; the source folder is
  the editable surface.

## Parallel prep batch (Day-1 + Day-4 + Day-7 carryovers, locked 2026-05-16)

Five tasks executed in parallel with the user's in-flight hi-fi mockup pass, so build-day calendar isn't waiting on them:

1. **Storage RLS migration shipped.** [supabase/migrations/0006_storage_rls.sql](supabase/migrations/0006_storage_rls.sql) (Patch 15). Resolves the long-standing "Storage RLS is aspirational" gap from `docs/supabase-config.md`. Four buckets covered:
   - `pet-photos` and `broadcast-covers`: public-read, authenticated-write (vet-only on broadcast-covers).
   - `messages-images` and `messages-videos`: RLS-by-household using path-prefix gating (`<household_id>/<filename>`). Clinic staff get a SELECT-only carve-out scoped to their clinic's households.
   - Smoke test at the bottom of the migration: `SELECT polname FROM pg_policy WHERE polrelid = 'storage.objects'::regclass` should return ~17 policies after `supabase db push`.

2. **Parent app font swap (Spectral → Lora) shipped.** [apps/petparent/App.tsx](apps/petparent/App.tsx) now imports from `@expo-google-fonts/lora` (`Lora_400Regular`, `Lora_600SemiBold`, `Lora_600SemiBold_Italic`); [apps/petparent/screens/PetPage.tsx](apps/petparent/screens/PetPage.tsx) references `fontFamily: 'Lora_600SemiBold_Italic'` for the pet-name hero. [apps/petparent/package.json](apps/petparent/package.json) lists `@expo-google-fonts/inter ^0.4.2` + `@expo-google-fonts/lora ^0.4.2` explicitly (previously only present as transitives, a "works on my machine" landmine). User needs to run `pnpm install` once to materialise the lockfile change before next `pnpm dev`.

3. **Parent app icon kit swap (Lucide → Phosphor) shipped.** [apps/petparent/screens/PetPage.tsx](apps/petparent/screens/PetPage.tsx) now imports `CaretRight` + `Gear` from `phosphor-react-native` (was `ChevronRight` + `Settings as SettingsIcon` from `lucide-react-native`). Icon usages updated to use Phosphor's `weight="fill"` prop (was Lucide's `strokeWidth={1.75}` / `strokeWidth={2}`). [apps/petparent/package.json](apps/petparent/package.json) added `phosphor-react-native ^2.4.4`, removed `lucide-react-native`. Peer dep `react-native-svg 15.12.1` stays (was already there for Lucide; Phosphor uses it too).

4. **App icon + splash asset sources shipped as SVG.** [apps/petparent/assets/icon.svg](apps/petparent/assets/icon.svg) is the canonical vector for the Direction C icon (Lora italic 600 "P" on Honey → Peach 135° gradient, canvas-coloured letterform). [apps/petparent/assets/splash.svg](apps/petparent/assets/splash.svg) extends the gradient with Inter Bold "pawkit" wordmark + Lora italic tagline. PNG export deferred to the user's tooling (Figma / Inkscape / resvg-js); spec + size list documented in [apps/petparent/assets/README.md](apps/petparent/assets/README.md). Once PNGs are exported and dropped into the same folder, `apps/petparent/app.json` can be wired to reference them (`icon`, `splash.image`, `android.adaptiveIcon.foregroundImage`).

5. **VetByline component shipped (dashboard side).** [apps/dashboard/components/ui/vet-byline.tsx](apps/dashboard/components/ui/vet-byline.tsx) implements the 3 variants from `docs/premium-feel/byline.md` (compact / full / centre) with optional avatar (uses shadcn Avatar primitive). Uses Pawkit type tokens (`text-base` 13, `text-md` 14, `text-xs` 11) per the type-scale-tokens-only rule. Parent-app version follows during Day-4/5 build (RN primitives + NativeWind). Existing [apps/dashboard/components/ui/vet-byline-preview.tsx](apps/dashboard/components/ui/vet-byline-preview.tsx) is unrelated (broadcast composer phone-preview anatomy, 28/12/9 sizing) and stays as-is.

## Microcopy workflow lock (locked 2026-05-16)

Three-step pipeline for the Day-7 microcopy round (lifted from the user's plan during the parallel-prep batch above; codified here so future sessions don't reinvent):

1. **Finalise EN strings first.** Screen-by-screen pass against `docs/premium-feel/voice.md` do/don't matrix. FK grade 5 for parent app, FK grade 8 for dashboard. ~30 system message templates (vaccination reminder, follow-up window close, broadcast publish confirmation, etc.). Admin EN strings already locked at `microcopy/admin.md`; parent EN is the primary scope this round.

2. **Batch-translate EN → MR via Sarvam Translate.** Single API call per surface area (e.g. one call for the full Pet Page string set, one for Inbox, one for Broadcasts), NOT one-string-at-a-time. The 2026-05-12 admin microcopy pass sent 225 single-string requests when 2-3 batched would have fit, triggered Sarvam's rate limit, wasted 4 minutes, spammed the dashboard. That mistake doesn't repeat per `feedback_batched_api` memory. Per-request payload limit must be checked before this round kicks off.

3. **Pune-native-speaker review pass on MR.** Catches metaphor errors (e.g. the खिडकी / "window" issue from testing), register calibration (`तुमचा` vs `तुझा` based on relationship), Pune-dialect specifics. After review, MR rows are locked and the build is microcopy-ready.

## Multi-pet switcher gets an "Add a pet" + tile (locked 2026-05-16)
- The press-and-hold pet switcher (Pets bottom-nav icon → avatar row floats
  above the nav) now ends its row with a small **"+" Add-a-pet tile**.
  Releasing on the "+" opens the same five-field `<PetIdentityForm />` used
  by Onboarding Step 2 and by the existing Settings → Pets → Add a pet
  entry point. Submit creates the pet and lands on its empty Pet Page,
  where photo upload triggers fur-match exactly as the first-pet path does.
- The "+" tile renders with a dashed Ink-soft border (not a fur-match ring)
  so it reads as "not a pet" inside the pet row. Always last in the row,
  after all living pets and any memorial avatars.
- **Supersedes** the prior "Adding a new pet happens from Settings → Pets
  → Add a pet, **never from the Pets tab itself**" rule in `docs/flows/parent.md`
  (now amended to permit two entry points). The "never from the Pets tab"
  intent survives in spirit: the Pet Page chrome itself still carries no
  inline creation affordance; the "+" lives inside the press-and-hold popover,
  which is a transient overlay surfaced by gesture, not a permanent Pet Page
  element.
- Rationale: when the household has 2+ pets the switcher is the natural moment
  to discover the parent's mental model around pet identity. Adding the "+"
  there shortens "I want to add my new kitten" from `tap avatar pill → master
  Settings → Pets section → scroll → Add a pet` (4 hops) to `press-hold Pets
  → release on +` (1 gesture). Reduces friction for the most common
  parent-app cold-start flow after the demo (Jolene adding Galaxy, Sagar's
  parents adding a new patient, etc.) without breaking the "Pets tab stays
  clean" framing.
- Reflected in `claude design/Parent App Wireframes.html` (the user-built
  pre-visual wireframe under Section 13 Memorial Pet Page switcher); now
  reflected in `docs/flows/parent.md` Pets section + "Adding subsequent
  pets" section.

## Stale-doc cleanup pass (locked 2026-05-16)
- Canonical docs that described current state still carried the v1.3
  Teal/Paper/Satoshi/Spectral/Lucide stack. Swept the most-read files so
  future sessions don't act on stale truth: `docs/critical-files.md` (TealCTA
  bullet dropped; mockup section rewritten as HISTORICAL; 6-tab → 5-tab;
  parent `App.tsx` flagged as needing Day-4 mauve sweep), `docs/brand-system.md`
  banner (Satoshi removed, Phosphor + Lora swap noted, link added to
  2026-05-15 decisions), `docs/feature-scope.md` (6-tab → 5-tab paragraph
  rewrite, Lucide → Phosphor, Teal → Berry, Spectral → Lora, vellum audit
  dropped from `/style-guide`), `docs/layout-spec.md` (banner at top
  announcing the rename; per-section v1.3 detail left as historical
  reference to avoid 50+ point edits), `docs/demo-choreography.md` (font +
  palette in the parent-app act + the takeaway-deck spec),
  `docs/build-order.md` (icon + splash spec; bg-teal → bg-berry smoke
  test), `docs/reusable-tooling.md` (Lucide → Phosphor with name-map
  pointer, Sarvam Chat sectioning cancelled, AI scope back to 2 features,
  Spectral → Lora swap recorded, vellum filter marked removed),
  `docs/premium-feel/INDEX.md` (header tokens + cross-cutting principles
  + deferred-section icon-kit). `CLAUDE.md` and `AGENTS.md` mockup-lookup
  tables now distinguish current (design-system.html) from HISTORICAL
  (v1.3 files).
- `mockups/index.html` rewritten on mauve tokens + Inter/Lora fonts.
  Cards regrouped into Current / Mauve-era historical / Phase 2
  historical / v1.3 historical buckets. Old "Brand system v1.3" footer
  replaced with the current mauve spec.
- `apps/petparent/app.json` splash + adaptiveIcon background swapped
  from `#F5F1E8` to `#F8F7F5`. The rest of the parent app
  (`App.tsx` Spectral imports + `#006D6F` spinner; `PetPage.tsx`
  Lucide imports + PAPER/TEAL constants; `package.json` Lucide + Spectral
  packages) is left for the Day-4 parent-app mauve sweep per `docs/build-order.md`.
- `experiments/inbox.html` deleted (v1.3-era inbox premium experiment;
  superseded by the `claude design/inbox rebuild/` work and the running
  dashboard). Empty `experiments/` folder removed.
- **Wave 2 (same day, completes Tier 1):** swept `docs/premium-feel/{motion,
  spacing, byline, first-run, states, materials, photography}.md` (the four
  remaining files have no stale tokens to begin with: `voice.md`, `haptics.md`
  + INDEX.md + the two already-cleaned files). `materials.md` got a
  DEPRECATED-on-dashboard banner at the top because vellum is no longer in
  the dashboard build; depth-language section survives. `first-run.md`
  letterform inside the locked Direction C app icon now reads Lora italic
  600 in canvas `#F8F7F5` (was Spectral semibold italic in Paper); wordmark
  inside the splash now reads Inter (was Satoshi). `states.md` icons
  renamed Lucide → Phosphor with `AlertCircle` → `WarningCircle` and `mic`
  / `mic-off` → `Microphone` / `MicrophoneSlash`. Also swept the
  per-section detail in `docs/layout-spec.md` (was banner-only on Wave 1);
  `docs/build-order.md` Day-4 / Day-5 / Day-6 lines that still carried
  Satoshi / Lucide / Teal references; `docs/flows/parent.md` Spectral and
  Teal references in the steady-state Pet Page spec; `docs/schema.md`
  Patch-1 rationale (Teal → Berry) and the broadcast-rename rationale
  (Lucide megaphone → Phosphor Megaphone); `docs/open-issues.md` Spectral
  references in pending microcopy items; `docs/demo-choreography.md` AMS
  wordmark (Satoshi → Inter, locked under the AMS-font-question resolution
  of 2026-05-16, "Inter is current reality on the dashboard topbar").
- **AMS clinic wordmark = Inter (locked 2026-05-16).** The AMS wordmark
  ("Animal Medical Services" + "Pune") renders in Inter on the running
  dashboard topbar (since Satoshi was removed from the Pawkit build on
  2026-05-15 evening). Locked as the spec for the demo-day AMS rebrand
  assets: wordmark, letterhead, deck slide masthead. The alternative
  (reintroduce Satoshi via Fontshare scoped to the wordmark only) was
  rejected to keep the font payload single-family.
- **Wave 3 (Tiers 2-5, same day):** Tier 2 — parent app stub color
  swap on `apps/petparent/App.tsx` (spinner + bg + status-bar) and
  `apps/petparent/screens/PetPage.tsx` (constants block: INK_FAINT
  bumped to `#8F8B86`, CANVAS `#F8F7F5` + RAIL_TINT `#EFE6E8` + BERRY
  `#9C2B5C` + BERRY_DEEP `#7C1F47` introduced; legacy `PAPER` and
  `TEAL` aliases kept pointing at the new values to avoid breaking
  in-file usages until Day-4). Tier 3 — physical mockup archive: 26
  v1.3 / interim mauve / Phase 2 mockup files moved to
  `mockups/archive/`; path references updated across 12 docs
  (CLAUDE.md, AGENTS.md, critical-files.md, decisions-log.md,
  status.md, layout-spec.md, open-issues.md, brand-system.md,
  premium-feel/first-run.md, reusable-tooling.md, microcopy/admin.md,
  mockups/index.html). `mockups/` proper now holds only
  `design-system.html` + `index.html`. Tier 4 — `status.md`
  hard-capped at <100 lines (73 actual); pre-2026-05-16 content moved
  to `docs/status-archive.md`. Tier 4 also added SUPERSEDED markers
  to five legacy locks in this file: 6-tab parent nav, universal voice
  mic + Sarvam Chat sectioning, Brand v1.3 section, Typography v1.3
  section, TealCTA anatomy lock. Tier 5 (correctly-stale files like
  `session-logs/*`) intentionally untouched.
- **Still NOT swept:** Parent-app code (`apps/petparent/App.tsx`
  Spectral font imports + `screens/PetPage.tsx` Lucide imports +
  `package.json` Spectral + lucide-react-native packages) Spectral /
  Lucide remnants are Day-4 build tasks, not doc-cleanup tasks (color
  constants are now correct).

## Parent nav reduced to 5 tabs + Settings behind avatar pill (locked 2026-05-16; supersedes 2026-05-09 6-tab lock)
- The 6-tab parent nav from the 2026-05-09 lock (Broadcasts / Community /
  Pets / Inbox / Shop / **Settings**) is superseded. The new parent nav is
  **5 tabs**: Broadcasts / Community / Pets (default landing) / Inbox /
  Shop. **Master Settings is no longer a bottom-nav destination**; it sits
  behind the household-initial avatar pill in the top-right of the Pet Page
  cover. Per-pet Settings still reachable from either the Pets row inside
  master Settings or the gear pill on the pet's name row.
- Rationale: Settings is a low-frequency destination. Giving it 1/6 of the
  bottom-nav real estate was over-weighting it; pushing it behind the avatar
  pill freed a tab slot and aligned with the "Pets is home, your dog is the
  hero" framing. The avatar pill also reads as a household identity affordance,
  not just a settings entry-point.
- Already reflected in [docs/flows/parent.md](docs/flows/parent.md) and the
  pre-visual wireframe at `Parent App Wireframes.html` (delivered earlier);
  this entry is the formal flush retroactively. `docs/feature-scope.md`,
  `docs/critical-files.md`, `CLAUDE.md`, `AGENTS.md` swept in the same
  cleanup pass above. `docs/layout-spec.md` per-section detail still
  references 6-tab; banner at the top of the file announces the supersede.

## Inbox tab badge removed, segment labels only (locked 2026-05-16)
- The active "Awaiting reply" tab no longer carries a count mini-pill. Tabs
  are pure segment labels ("Awaiting reply" / "Replied"). Pill-pair anatomy
  preserved (canvas-2 container, berry fill on active, ink-soft on inactive).
- Rationale: the awaiting count appeared three times on one screen, in the
  rail ("Inbox 55"), the tab (nested berry-deep mini-pill), and the awaiting
  bar ("55 parents are waiting on you" at berry-deep 17px). The bar carries
  the urgency loudly; the rail covers cross-screen awareness; the tab badge
  was the redundant middle term. Asymmetric anyway (only the active tab
  carried it, never the Replied tab), confirming it functioned as emphasis
  rather than segment math.
- `activeCount` prop drill removed across [inbox/page.tsx](apps/dashboard/app/(dashboard)/inbox/page.tsx)
  → [inbox-client.tsx](apps/dashboard/app/(dashboard)/inbox/inbox-client.tsx)
  → `InboxTabs`. The second `getActiveThreadCount()` call in `inbox/page.tsx`
  also removed; the dashboard layout still calls it once for the rail badge.

## Inbox awaiting bar = berry-soft tinted band (locked 2026-05-16)
- The `/inbox` awaiting strip ("N parents are waiting on you" + Start reply
  queue CTA) now fills with `bg-berry-soft` (12% berry tint, the same token
  used for active nav) + `border-berry/20`. Count renders in `text-berry-deep
  text-lg` (17px) bold with `tabular-nums`; sentence label stays text-sm
  semibold ink. Container `py-2.5` → `py-3` (~60px), still a thin announcement
  strip not a hero card. CTA unchanged (primary shadcn Button).
- Picked from 4 options at `claude design/inbox rebuild/awaiting-bar-options.html`
  (A: berry-soft tint, B: hero count + rail, C: filled berry, D: left rail +
  dot). Option A wins because hue contrast against the rail-tint ground
  carries the lift without competing with the active inbox-tab pill or
  breaking the thin-strip intent recorded in the prior JSDoc.
- Files: [inbox-client.tsx](apps/dashboard/app/(dashboard)/inbox/inbox-client.tsx)
  (AwaitingBar), [globals.css](apps/dashboard/app/globals.css) (added
  `.text-berry-deep` utility next to `.bg-berry-deep`; was referenced in
  `billing-client.tsx` but undeclared, so 5+ existing usages had been silent
  no-ops).

## Icons: Phosphor filled, Lucide removed (locked 2026-05-15 evening)
- Lucide outlines replaced with **Phosphor filled** across the entire dashboard.
  `lucide-react` dropped from `package.json`; `@phosphor-icons/react` installed.
- Single global default via [components/chrome/icon-provider.tsx](apps/dashboard/components/chrome/icon-provider.tsx)
  wrapping `{children}` in [layout.tsx](apps/dashboard/app/layout.tsx) — sets
  `weight: "fill"` on every Phosphor icon by default. Individual icons can
  override via their own `weight` prop if a surface needs a lighter treatment.
- Imports use **aliasing** so JSX call sites stay untouched
  (e.g. `import { CaretLeft as ChevronLeft } from "@phosphor-icons/react";`).
  This means 28 files only needed import-line edits, not JSX rewrites.
- Lucide → Phosphor name map: AlertTriangle → Warning, AlertCircle/CircleAlert →
  WarningCircle, Chevron* → Caret*, Loader2 → CircleNotch, LogOut → SignOut,
  MessageCircle → ChatCircle, MessageSquare → Chat, Mic → Microphone, Move →
  ArrowsOutCardinal, RefreshCw → ArrowsClockwise, Save → FloppyDisk, Search →
  MagnifyingGlass, Send → PaperPlaneTilt, Settings → Gear, Share2 →
  ShareNetwork, Inbox → Tray, Trash2 → Trash, UserRound → User.
- `strokeWidth` props on JSX usages are now no-ops (filled icons have no
  stroke) but left in place — not worth a sweep.

## Audience pct scope = species-aware label (locked 2026-05-15 evening)
- The audience modal previously rendered "% of dog parents" regardless of the
  species filter, which read as a bug when the vet picked cats only. Replaced
  with **scope-aware label**:
  - Audience contains only dogs → "X% of dog parents" (denominator = all
    dog-owning households)
  - Audience contains only cats → "X% of cat parents"
  - Audience contains both species → "X% of all parents" (denominator = all
    households with any non-deceased pet)
- Server returns `pctOfParents` + `pctScope: "dog" | "cat" | "all"`; client
  switches the label off `pctScope`. Old `pctOfDogParents` field renamed +
  removed from [actions.ts](apps/dashboard/app/(dashboard)/broadcasts/actions.ts),
  [lib/data.ts](apps/dashboard/lib/data.ts), and [lib/seed.ts](apps/dashboard/lib/seed.ts).

## Composer voice = per-field manual dictation (locked 2026-05-15 evening)
- The Sarvam Chat sectioning flow is **cancelled**. The model claimed to fill
  Title / Body / Summary[] / Warning[] / Escalation[] from one universal
  dictation but in practice only ever filled `body` and silently dropped the
  structured sections, leaving the composer in a broken half-filled state
  ("Filled 5 fields" but only 1 actually populated).
- Replacement: **one mic, focused-field dispatch.** The vet clicks into the
  field they want (Title, Body, any section bullet, a custom section label),
  then clicks the mic, dictates as long as they want, and the transcript
  drops into that field. No AI in the path beyond Sarvam STT.
- Long-audio handling stays the chunked-recording approach locked earlier the
  same evening — 25-second rolling segments, parallel transcription, ordered
  concatenation.
- Files: [components/ui/universal-voice-input.tsx](apps/dashboard/components/ui/universal-voice-input.tsx) (now exports `ComposerVoiceMic`),
  [components/broadcast/composer-canvas.tsx](apps/dashboard/components/broadcast/composer-canvas.tsx) (tracks `focusedField` state),
  `/api/sarvam-section` route + `sarvamChat` helper both deleted.
- AI scope is back to **2 features** (Sarvam Audio + Sarvam Translate); the
  third Sarvam Chat feature added 2026-05-14 is reverted. CLAUDE.md updated.

## Font stack — Inter + Lora (Satoshi removed 2026-05-15 evening)
- **Body + UI + display: Inter** (next/font/google, weights 400/500/600/700).
  Inter covers everything from body prose to hero headlines. Satoshi was
  trialled for the display family but read as "circus" on billing KPIs +
  broadcast titles at the 22/26/30px range; Inter at the same sizes reads as
  "clinical", which is the locked aesthetic for this app.
- **Pet-name italic hero: Lora italic 600** (next/font/google). Used in the
  focus card header, inbox row pet names, billing ledger pet column,
  inbox-zero h2, and awaiting-bar headline. Lora picked from a 4-option
  study (Fraunces, Newsreader, Crimson Pro, Lora) in
  `mockups/archive/serif-options-study.html`.
- **Marathi: Noto Sans Devanagari** (unchanged).
- **Tailwind family map** (in `apps/dashboard/tailwind.config.ts`):
  - `font-sans` → `var(--font-inter)` (Inter)
  - `font-display` → `var(--font-inter)` (Inter) — Satoshi removed
  - `font-serif` → `var(--font-lora)` (Lora)
- The Fontshare `<link>` for Satoshi has been removed from
  `apps/dashboard/app/layout.tsx`; `--font-display` in
  `apps/dashboard/app/globals.css` is now Inter-only.

## No uppercase eyebrow labels (locked 2026-05-15 evening)
- The `font-semibold uppercase tracking-[0.12em|0.14em|0.16em]` eyebrow
  pattern is banned across the dashboard. Eyebrows ("Billed · this month",
  "Who's this for", "Writing in", section headers, table column labels)
  render in sentence-case, `font-medium` only.
- Reason: ALL-CAPS eyebrows shouted from every surface. They violated the
  "clinical, not circus" rule and read as decorative chrome rather than
  scannable hierarchy.
- Live files touched: billing-client + billing-detail-client, settings,
  composer-canvas, audience-modal, send-confirm-modal, preview-overlay,
  broadcast detail-client, inbox clinical page, inbox per-pet invoice page.

## Demo data spread — invoices + visits even Jan 2025 → May 2026 (locked 2026-05-15 evening)
- All 150 non-Fernandes invoices + their linked visits + their `paid_at`
  timestamps now spread evenly across 2025-01-01 → 2026-05-15 (500 days,
  ~3.3 days per invoice, md5-deterministic shuffle). Quarterly KPI is
  realistic: ~27 invoices per full quarter, ~₹1L revenue per quarter.
- All 625 non-invoiced clinical visits also redistributed evenly across
  the same window so clinical histories don't all bunch around the same
  three months.
- **Fernandes 3 invoices stay locked at 2026-05-06** because they anchor
  the focus thread + the Mark-Paid demo CTA. Their linked visits also stay.
- Raffy (deceased 2024-08-20) keeps his single pre-death visit at
  2024-05-16 (excluded from redistribution).
- `scripts/seed-50-pets.mjs` updated with a deterministic `VISIT_SCHEDULE`
  builder so any re-seed reproduces the same spread.

## 30% inbox Marathi (locked 2026-05-15 evening)
- 17 parent messages (one per `case_type` in `PARENT_MESSAGES`) now have
  Devanagari bodies, manually authored in Pune-parent tone with English
  clinical terms (BOAS, Cytopoint, Galliprant, DHPP, etc.) preserved where
  natural. Plus 1 pre-existing Misha message = 18/56 = 32% of inbox parent
  messages now render in Marathi.
- The 17 corresponding parent users flipped to `preferred_language='mr'`.
- `MARATHI_PARENT_MESSAGES` dict locked in `scripts/seed-50-pets.mjs`; first
  pet per case_type gets the Marathi body + `mr` preference on re-seed.

## No hand-rolled primitives — shadcn-only rule (locked 2026-05-15 final)
- **Every interactive element MUST use a shadcn primitive** (or wrap one
  via `asChild`). Hand-rolled `<button>` / `<input>` / `<textarea>` /
  segmented controls / popovers / dropdowns / checkboxes / avatars are
  banned in `apps/dashboard/**`.
- Available primitives at `apps/dashboard/components/ui/`:
  Avatar (added 2026-05-15 final), Badge, Button, Checkbox, Dialog,
  DropdownMenu, Input, Popover, Sheet, Skeleton, Tabs, Textarea, Toggle,
  ToggleGroup, Tooltip.
- If a primitive is missing, install the matching `@radix-ui/react-*`
  package and add a shadcn wrapper at `components/ui/<name>.tsx` BEFORE
  reaching for `<div>` or `<button>` with classnames. Don't ship the
  hand-rolled version "for now".
- Rationale: four audit rounds across the build kept finding hand-rolled
  versions of primitives that already existed in the codebase. The rule
  closes that loop.

---

## Ground pink dial-down — "Barely there" (locked 2026-05-15 final pass)
- **`--rail-tint: #EFE6E8`** (HSL 330°, 12%, 91%). Replaces the briefly-locked
  `#F2DEE6` (which read as "pinking too hard"). Same Boysenberry hue family
  as the prior values, saturation dialed down ~70% from #F2DEE6. The eye
  reads "premium warm neutral with a whisper of the brand" rather than
  "a pink page".
- **Boysenberry primary stays `#9C2B5C`** ("Tasteful pop" — locked same
  evening, see entry below). Canvas card stays `#F8F7F5`.
- Berry accents (picker chip full-berry, Outstanding KPI warn variant,
  unpaid status pills) pop cleanly because the ground steps further back.
- Chosen from a 5-option dial-down study comparing saturations from 43%
  → 12%, plus a separate floral-white compare round (`mockups/archive/ground-pink-dial-down.html`
  + `mockups/archive/ground-floral-white-compare.html`). The floral-white
  alternative (#FFFAF0) was considered but rejected because it would
  invert the depth language (cards become darker than ground).

---

## Brand saturation re-tune — "Tasteful pop" (locked 2026-05-15 late evening; ground later dialed down — see entry above)
- **Boysenberry primary: `#9C2B5C`** (HSL 334, 57%, 39%). Saturation lift
  from the prior `#823159` (HSL 327, 45%, 35%) — same Boysenberry hue
  family, +12 saturation, +4 lightness. Pulls the brand out of the gray
  zone without leaving Boysenberry territory. Chosen from a 4-option
  saturation study; see `mockups/archive/brand-saturation-study.html`. **Still
  the running primary.**
- **Rail-tint ground: `#F2DEE6`** (visibly pink, low chroma). Replaced
  the prior `#ECE7E8` mauve-gray (locked earlier same evening but still
  read as gray). **Superseded later the same evening** by `#EFE6E8`
  barely-there mauve — see entry above.
- **Derived tokens shift in concert.** `--berry-deep: #7C1F47`,
  `--berry-soft: rgba(156, 43, 92, 0.12)`, `--berry-ring: rgba(156, 43, 92, 0.30)`,
  shadcn `--primary` / `--accent` / `--ring` all bump to HSL `334 57% 39%`.
- **Canvas card unchanged** at `#F8F7F5`. Two-tone architecture preserved:
  rail-tint = ground, canvas = cards. No drop shadows; elevation = tonal
  contrast + 1px hairlines.
- Live source-of-truth files updated: `packages/design-tokens/src/{tokens.css,colors.ts}`,
  `packages/design-tokens/src/tailwind-preset.ts` (fallback RGB),
  `apps/dashboard/tailwind.config.ts` (fallback RGB),
  `apps/dashboard/app/globals.css` (rail-tint + berry ladder + shadcn HSL).
  `docs/brand-system.md` palette anchors table updated.

---

## Workspace ground tone (locked 2026-05-15 evening, superseded same night by Brand saturation re-tune above)
- **`--rail-tint` was `#ECE7E8`** — desaturated mauve-gray, opaque hex.
  Replaced the prior `rgba(15, 12, 10, 0.045)` neutral ink wash (which
  composited to ~#EEEDEA and read as cool/dull).
- Stayed in the Boysenberry hue family but pulled toward warm-gray so
  berry-soft accents (picker chip, Outstanding KPI warn card, unpaid
  status pills) kept their pop against the ground. Chosen from
  `mockups/archive/ground-tone-mauve-variants.html` B2.
- **Superseded later the same evening** because the page still read as
  gray overall — the desaturation went too far. The "Tasteful pop" lock
  above (ground `#F2DEE6` + berry `#9C2B5C`) is the running build.
- Canvas card stays at `#F8F7F5` across both rounds. Two-tone architecture
  preserved.
- The original color study (`mockups/archive/ground-tone-study.html`) considered
  four directions (warm cream, mauve wash, soft blush, vellum). Mauve was
  picked for brand coherence.

---

## Billing screen (locked 2026-05-15)
- **Top-level Billing screen is in scope for v0.** Reverses the 2026-05-08
  "no top-level Invoices tab" lock; the Billing rail item (previously
  "placeholder until data lands") is now a real route at `/billing` rendering
  an invoice ledger across the whole clinic. The per-pet Invoices tab inside
  Pet Page stays — both surfaces coexist.
- **Two-state status machine only: `paid` / `unpaid`.** No `draft`. No
  distinction between `due` and `overdue` (would create demo confusion). The
  `invoices.status` check constraint accepts those two values only. Schema
  patch 14 (in `0001_init_schema.sql`) lifts the prior paid-only constraint
  and makes `paid_at` nullable so unpaid rows can hold NULL.
- **No payment processing.** Payments cleared at the desk (AMS fact). Mark
  paid is manual status tracking only, fired by Sagar from the invoice
  detail page after a parent settles. No Pay-now CTA. No Razorpay / Stripe.
  No reminders to parents.
- **Mark paid lives on the detail page**, not inline on the ledger row. The
  flow: ledger row → invoice detail at `/billing/[invoiceId]` → "Mark paid"
  CTA below the Total → `markInvoicePaidAction()` flips status + sets
  `paid_at = now()` + revalidates `/billing` + `/billing/[invoiceId]`.
- **Picker chip is the page lead. No h1 "Billing".** Honors the same
  "no titles" rule that just stripped h1s from Inbox / Broadcasts / Settings.
  The picker reads `<scope> · all invoices for AMS, Pune ▾`.
- **Default scope on load: current month.** `/billing` with no query params
  resolves to today's calendar month in Asia/Kolkata. URL surface:
  `?y=YYYY&m=M` (0-indexed) for a specific month, `?range=all` for all time.
  Custom date range URL works (`?range=custom&from=...&to=...`) but the picker
  UI for it is deferred.
- **KPI cards: Billed / Collected / Outstanding.** Outstanding renders the
  berry-soft warn variant when value > 0, otherwise falls back to default
  card with "₹0 / All clear". The first card's label re-words to match scope
  ("Billed · this month" / "Billed · all time" / "Billed · &lt;Month Year&gt;").
- **Pill tabs: All / Unpaid / Paid.** Active tab uses ink fill + canvas text
  (not berry — the berry urgency colour is reserved for the unpaid status
  pill in the table). Tab counts always reflect scope-wide totals regardless
  of which tab is active. Ledger h3 swaps to "All invoices" / "Unpaid
  invoices" / "Paid invoices" with the tab.
- **Unpaid status pill: berry-soft bg + berry-deep text + `circle-alert` icon.**
  Single quieter berry treatment for unpaid, not the louder berry-fill the
  mockup reserved for "overdue" — because Pawkit doesn't distinguish those.
- **Filters (pet / household), Export CSV, new-invoice flow: deferred to v0.1.**
  The mockup README spec includes popover plumbing for filters; Pawkit v0
  doesn't expose triggers for them.
- **Topbar search behaviour unchanged.** Searching by invoice number / amount
  inside Billing is deferred. Existing pet / household search keeps the
  inbox placeholder copy.
- **Seeded reality: 153 invoices across 53 pets, 51 households (3 Fernandes
  anchor + 150 from the 50-pet expansion).** 15 marked unpaid via SQL
  (every ~10th by issued-date DESC for spread). May 2026 default scope
  surfaces 53 invoices summing to ₹1,72,874 billed / ₹1,59,848 collected /
  ₹13,026 outstanding (5 unpaid).
- **Invoice number formats coexist in the ledger as-is**: the 50-pet
  expansion uses `INV-2026-NNNN`; the Fernandes anchor uses
  `INV-2026-FERN-NNN`. No format normalisation in v0.

---

## Broadcast composer rebuild (locked 2026-05-15)
- **Single-page composer at `/broadcasts/new`.** Collapses the three-step flow
  `/broadcasts/compose` + `/broadcasts/audience` + `/broadcasts/send` into one
  canvas card. Custom audience opens a centered modal; mobile preview opens a
  full-screen overlay; Send opens a small bilingual-review modal. The three
  old route directories + the step-nav component were deleted. `/broadcasts`
  list and `/broadcasts/[broadcastId]` detail are untouched.
- **Bilingual publish-block kept as a quiet gate.** `reviewedEn` + `reviewedMr`
  flags on `BroadcastDraft` are flipped to true as the vet views each language
  in the Mobile Preview overlay (the language toggle on the preview's meta
  column drives this). The Send confirm modal shows EN+MR side-by-side; the
  "Both look right" checkbox is enabled only when both flags are true AND
  both languages have a title + body. Send button stays disabled until the
  checkbox is ticked. Editing any field in a language resets that flag.
- **Optional sections via add-chips.** `ContentSet` keeps its flat shape
  (`title`, `body`, `summary[]`, `warningSigns[]`, `escalation[]`,
  `coverImageUrl`). UI shows a section when its array is non-empty (or the
  cover URL is set); empty sections are reachable via add-chips below the
  body. The universal voice mic's AI sectioning chooses the shape: an
  announcement dictation fills only `title + body` (other arrays stay empty);
  an educational dictation fills all five. The vet can also add sections
  manually via the chips.
- **Universal voice mic, per-field mics removed from compose.**
  > **SUPERSEDED 2026-05-15 evening** by "Composer voice = per-field manual
  > dictation" (see entry above). The universal voice mic + sectioning was
  > reverted; `<ComposerVoiceMic />` now drops the transcript into whichever
  > field the vet has focused. The 5 per-field mics on the composer were NOT
  > restored; the universal mic with focused-field dispatch is the running
  > pattern. `<VoiceMic />` stays in the codebase for the inbox reply surface.

  The composer
  has one mic in the toolbar (`<UniversalVoiceInput />` reused from existing
  alt-theme work). On click it records → `/api/sarvam-stt` for transcription
  → `/api/sarvam-section` for Sarvam Chat sectioning into the five fields →
  `replaceLanguageContent()` populates the active language. The 5 per-field
  `<VoiceMic />` instances that used to live on the compose page are gone.
  `VoiceMic` itself stays in the codebase (still used by the inbox reply
  surface).
- **Sarvam Chat sectioning prompt classifies announcement vs educational.**
  > **SUPERSEDED 2026-05-15 evening, CANCELLED.** The `/api/sarvam-section`
  > route and the `sarvamChat` helper are deleted; AI scope is back to 2
  > features (Sarvam Audio + Sarvam Translate). See "Composer voice =
  > per-field manual dictation" entry above for the replacement.

  `/api/sarvam-section`'s system prompt now requires the model to decide
  the shape first. Announcement → only `title` + `body`, empty arrays for
  `summary`/`warningSigns`/`escalation`. Educational → all five fields
  populated. The model is instructed not to invent sections that weren't
  in the dictation.
- **"When to call us" = `escalation`.** UI label rename only; DB column and
  draft-state key remain `escalation`. The locked `broadcast.field.escalation`
  i18n key already says "When to call us" / "आम्हाला कधी कॉल करावा".
- **Cover photo on broadcasts.** New `cover_image_url text` column on
  `broadcasts` (Patch 13). Uploads reuse the existing `broadcast-covers`
  bucket under key `broadcasts/<slug>-<timestamp>.<ext>` via the new
  `uploadBroadcastCoverAction()` server action. 16:5 aspect, JPG/PNG/WebP,
  up to 8 MB. The cover URL lives on `ContentSet.coverImageUrl` for both
  languages (in practice they share the same image; the resolver falls back
  EN → MR when writing the DB row).
- **Audience filter v3: condition-groups model.** `BroadcastDraft.conditionGroups:
  ConditionGroup[]` replaces the old flat `audienceFilter` + optional
  `audienceFilterGroupB`. Top-level groups are OR-unioned; each group's
  conditions are AND-joined. Conditions cover four fields:
  - `species` (dog / cat / both)
  - `ageRange` (min/max in years)
  - `deceased` (include / exclude)
  - `lastVisit` (3m / 12m / 24m / any) — new in v3, queries
    `visits.visit_date` via a set-membership prefilter in `petsMatching()`.
  `getAudienceCountAction()` returns `{ pets, households, pctOfDogParents,
  samplePets[] }` — the sample pets array drives the audience-strip pet row
  + the preview overlay's "for [Pet]" pill.
- **Detail-page back-compat shim.** `getBroadcastById()` (`lib/data.ts`)
  projects the v3 `conditionGroups` shape down to the existing v2
  `{groupA, groupB}` shape for the detail page's `FilterSummary` component
  (loses Last-visit info — not currently shown on the detail page). v2 and
  v1 (pre-build flat) shapes still parse for old broadcasts.
- **Autosave indicator.** New `lastAutosaveAt: number` on the draft, bumped
  on every persist. Page header renders "Autosaved Ns ago" with a 5s tick
  to refresh the relative-time label.
- **Sample-pet sourcing in preview.** The Mobile Preview overlay's "for [Pet]"
  pill samples the first pet from `getAudienceCountAction().samplePets[]` —
  dynamic with the audience filter (Bruno for dog-only, Misha for cat-only,
  etc.). Falls back to "Gabby" if the audience hasn't resolved yet.
- **Schema Patch 13.** `alter table broadcasts add column if not exists
  cover_image_url text;` applied via migration `add_broadcast_cover_image_url`.

## Platform and demo target
- **Inbox v2 surface sync + audit (locked 2026-05-15, night session).**
  After the inbox v2 rebuild + user request to "execute all phases · use
  shadcn strictly · stick to the palette":
  1. **shadcn strictness verified.** Four raw native elements found and
     refactored: pill tabs → `ToggleGroup`/`ToggleGroupItem`, Load older
     link → `Button variant="link"`, SOAP toggle pill → `Button outline
     sm rounded-full`, visit-type + case chip pills → `Badge`. Zero raw
     button/input/textarea remains in any inbox-v2 file.
  2. **Palette strictness verified.** Zero off-palette colors (no
     red/green/blue/yellow/orange/pink/purple/indigo Tailwind classes;
     zero raw hex codes outside the locked palette). Only the
     handoff-locked tokens in use: canvas, ink, berry, berry-deep/-soft/
     -ring, ink-70/-50/-30, rule/-soft, canvas-2, rail-tint.
  3. **Surface sync to non-inbox routes.** Body bg is rail-tint
     (set in globals.css); broadcasts list / settings / billing pages
     now wrap their content in `bg-canvas border-rule rounded-2xl`
     cards so they lift off the ground cleanly. Settings page title
     and broadcasts page title now use Spectral italic 30px to match
     the inbox-v2 page-title pattern. Empty-state copy in broadcasts
     list uses Spectral italic 22px.
  4. **Card border softening preserved without shadows.** Re-added
     `:root .border-[1.5px].border-ink:not(.rounded-full)` rule to
     globals.css that converts the v1.3 1.5px Ink card frames to 1px
     `rule` (ink/12) + 14px radius — NO drop shadow (the inbox-v2
     "no shadows" rule holds). `:not(.rounded-full)` exception
     preserves identity circles (avatars, check-icon, logo slots).
  5. **Mockup `admin-mauve-locked.html` synced.** Screens 02 + 03
     fully rebuilt to the inbox-v2 anatomy: Awaiting bar + pill
     tabs + new row anatomy on Screen 02; focus card replacing the
     1fr/468px split + embedded SOAP strip + composer with Attach
     on Screen 03. Billing nav added to all 9 rail blocks. New
     tokens added to mockup `:root` (rail-tint, canvas-2, ink-70/
     50, rule, rule-soft, berry-soft, berry-ring). `.frame` ground
     flipped to rail-tint; chrome-header + chrome-rail set
     transparent so the frame shows through. Doc-header bumped to
     "v1.5 · Mauve + Inbox v2".
  6. **Verification.** TypeScript zero errors. `pnpm next build`
     clean across 14 routes. All 9 dashboard routes return 200.
- **Inbox v2 rebuild (locked 2026-05-15).** Full end-to-end rebuild of the
  inbox surface per the `claude design/` handoff (README + Inbox.html).
  Eight phases, all shipped same day:
  1. **Surface architecture flip:** body bg `bg-rail-tint`
     (`rgba(15,12,10,0.045)`) shared by top bar + rail + content area as
     one continuous ground; `canvas` (`#F8F7F5`) reserved for cards that
     "lift" off the ground. **All drop shadows removed** —
     elevation = tonal contrast + 1px `rule` hairlines only.
  2. **Chrome rebuilt:** 230px clinic column with `flex-shrink:0` 40×40
     berry logo, search bar `bg-canvas` + 1px rule + 12px radius, new
     **Billing nav item** in the rail (placeholder route until data
     lands), Lucide stroke 1.6, awaiting count threaded to rail badge.
  3. **Inbox list:** new Awaiting bar ("N parents are waiting on you")
     + primary "Start reply queue →" CTA. New row anatomy with wait
     duration ("1d 4h"; oldest in berry) + case chip (pulled from each
     pet's latest `visits.chief_complaint`). Pill segmented tabs.
  4. **Reply queue + focus card:** new
     `components/inbox/focus-card.tsx` (72px fur-ring avatar +
     Spectral 32px name + embedded SOAP context strip via
     `soap-context-strip.tsx` + thread bubbles + composer slot). New
     `/inbox/queue` route with progress bar + auto-advance on Send.
     Single-thread `[threadId]` reuses the same FocusCard without the
     queue progress. **The 468px right pet panel was dropped entirely**
     and `pet-panel-tabs.tsx` deleted.
  5. **Inbox zero** ("Inbox zero." Spectral 36px + check-circle + "Go
     grab a chai.") rendered automatically when active list has 0 threads.
  6. **Attachments wired:** new `uploadAttachmentAction` routes by MIME
     to `messages-images` / `messages-videos` Supabase Storage buckets,
     returns public URL. `sendReplyAction` extended with attachment opts.
     Composer Paperclip button + file picker + 10MB cap + preview chip.
     Schema was already attachment-ready.
  7. **Pet fur rings kept (explicit override of handoff):** the handoff
     spec says "no fur-color palette, flat monogram avatars". Per Pawkit
     brand discipline we kept the 46px outer fur-tone ring + 3px band +
     real Pexels photo inside on every inbox row + focus-card header.
     Locked exception, recorded here so future maintainers don't
     "re-correct" it.
  8. **Spectral italic** font restored to the stack (via
     `next/font/google`) for hero pet names. v1.3 had Spectral; the
     mauve flip dropped it; inbox v2 needs it back for the pet-name
     identity treatment in focus card + list rows + inbox-zero h2 +
     awaiting bar headline.
  Source of truth: `apps/dashboard/app/(dashboard)/inbox/*` +
  `apps/dashboard/components/inbox/*` + `apps/dashboard/app/globals.css`.
  Design lock: `claude design/README.md`.
- **Hero token renamed teal → berry (locked 2026-05-15 cleanup).** The
  legacy `palette.teal` / `--teal` / `bg-teal` className kept since the
  v1.3 → mauve flip was misleading future maintainers ("why does `bg-teal`
  paint Boysenberry?"). Renamed everywhere: `palette.berry`, `--berry`,
  `--berry-rgb`, `bg-berry`, `border-berry`, `text-berry`. Six files
  touched (`colors.ts`, `tokens.css`, `tailwind-preset.ts`,
  `tailwind.config.ts`, `globals.css`, `broadcasts/send/page.tsx`). The
  shadcn `--primary` HSL var path is unchanged — most consumer code uses
  `bg-primary` from the shadcn primitives, not `bg-berry` directly; only
  one consumer (the "Broadcast sent" success banner) used the raw
  className. The legacy `teal` name remained in token-file plumbing for
  ~24 hours; this cleanup zeros it out so the codebase reads honestly.
- **Mauve-only build, v1.3 Teal/Paper deleted (locked 2026-05-14, late).** After
  exploration as an alt theme switchable via `data-theme="mauve"`, the mauve build
  was promoted to be the only theme and the entire v1.3 Teal/Paper build was deleted.
  - **No more theme switching.** `data-theme="mauve"` attribute, ThemeController
    component, useTheme hook, cookie + localStorage persistence, URL `?theme=` param,
    and Settings → Appearance toggle are all gone.
  - **Tokens flipped permanently:** `--bg-canvas: #F8F7F5` (cool off-white),
    `--teal: #823159` (Boysenberry — variable name kept for backward-compatible
    `bg-teal` / `border-teal` class resolution), `--text-muted: #8F8B86`
    (Ink-faint bumped), `--radius: 0.5rem` (8px), shadcn `--primary` HSL set to
    Boysenberry. Mauve type scale (xxs 11 → display 40) baked into the single
    `:root` in `apps/dashboard/app/globals.css`.
  - **Chrome adaptations no longer behind a selector:** light rail wash with
    Boysenberry filled-pill active state (replaces v1.3's 4px Teal left bar),
    soft 12px-radius cards with 1px Ink/8 border + low-elevation shadow, vellum
    hidden, mauve-tinted search bar wash, `[lang="mr"]` +1px Devanagari bump —
    all live in plain `:root` blocks now.
  - **i18n purge:** `settings.section.appearance` +
    `settings.appearance.theme.{default,mauve,helper}` keys deleted from
    `lib/i18n-strings.ts`.
  - **Broadcast composer simplified:** universal voice mic is the only voice
    entry point; per-field `<VoiceMic />` instances + the `onTranscript` prop
    on `<Field>` deleted. `useUniversalMic = theme === "mauve"` conditional
    flattened.
  - **Supersedes all prior 2026-05-14 alt-theme entries below** ("Alt theme
    exploration", "Mauve display face DM Sans", "Mauve theme legibility +
    font + chrome polish", "Brand color amplified across chrome", "shadcn
    discipline across the whole dashboard"). Those entries describe the
    journey; this entry is the final lock.
- **Mauve display face: DM Sans (Fraunces rejected 2026-05-14).** The
  earlier "DM Sans + Fraunces" pick was tried and rejected within hours —
  Fraunces' serif felt too editorial-heavy for page-title roles like
  "Settings". Mauve theme now uses **DM Sans for both body and display**:
  cohesive geometric sans throughout, matches the Sarvam aesthetic, lets
  the Boysenberry hero color carry the differentiation from the vet-space
  norm. v1.3 default keeps Inter + Satoshi unchanged. Implementation:
  removed the Fraunces import from `app/layout.tsx`, set `--font-display:
  var(--font-dm-sans)` in the mauve block of `globals.css`.
- **Brand color amplified across chrome (locked 2026-05-14).** User feedback:
  the hero color was barely visible. Five swaps applied to both themes
  (so each picks up its own primary — Teal v1.3, Boysenberry mauve):
  1. **ToggleGroup default tone** uses primary fill on active (was Ink).
     Old Ink-filled tone renamed to `ink` for opt-in fallback.
  2. **Tabs active state** uses `text-primary` + `border-primary` for
     label color + underline.
  3. **Hero count cards** (audience, send, broadcast detail) use
     `bg-primary text-primary-foreground` for the big-number blocks.
  4. **Vet message bubbles** in inbox thread use `bg-primary
     text-primary-foreground` — Dr Sagar's voice carries the brand color.
  5. **Broadcast sent confirmation** already used `bg-teal/10` (kept as is).
  Supersedes the v1.3 "one Teal per screen" rule for these specific
  surfaces — the brand needed more visibility than the prior 2-3 Teal
  budget per screen allowed.
- **Mauve theme legibility + font + chrome polish (locked 2026-05-14).**
  Six interlocking refinements:
  1. **Header font unified** — clinic name + vet name both render in the
     body font (Inter v1.3, DM Sans mauve). The prior `font-display` on
     the clinic name created a visible disharmony in the chrome.
  2. **Settings anchored to the rail bottom** in both themes via a
     `flex-1` spacer between primary (Inbox + Broadcasts) and footer
     (Settings) groups.
  3. **Ink-faint bumped** under mauve from `#A8A39E` (~2.7:1) to
     `#8F8B86` (~3.5:1) for small-size legibility on cool off-white.
     `border-ink-faint` similarly bumped to `#C9C5C0`.
  4. **Type scale bumped +1-2px across the board under mauve** to match
     Sarvam aesthetic + provide a safer Devanagari floor: xxs 10→11,
     xs 11→12, sm 12→13, md 13→14, base 14→15, lg 15→17, 2xl 22→26,
     3xl 26→30, display 48→40 (hero counts tighten). Implemented via
     `:root[data-theme="mauve"] .text-*` overrides in globals.css.
  5. **Marathi mode +1px** when `[lang="mr"]` is active under mauve,
     covering xs/sm/md/base body sizes. Wired by syncing
     `document.documentElement.lang` from LanguageProvider on every
     setLang call.
  6. **Mauve font swap: DM Sans + Fraunces.** Pulled via
     `next/font/google`, exposed as `--font-dm-sans` and `--font-fraunces`,
     swapped via `--font-body` + `--font-display` override in the
     mauve block. v1.3 default keeps Inter + Satoshi untouched. Noto
     Sans Devanagari remains the Marathi fallback in both themes.
- **Real pet photos seeded for the demo 5 (locked 2026-05-14).** Sourced
  5 Pexels portraits matching each demo pet's breed + fur tone (Gabby
  Golden Retriever, Bruno black Labrador, Misha white Persian, Rocky
  grey mixed-breed, Coco brown Indie), uploaded to the `pet-photos`
  Supabase Storage bucket, set `pets.avatar_url` per row via SQL UPDATE.
  `Pet` type now carries `photoUrl: string | null`; `adaptPet()` selects
  `avatar_url` and maps it; `PetAvatar` renders the photo when present
  with a paw-silhouette fallback. Inbox row + thread-detail header both
  pass `photoUrl` through. Theme-agnostic — both v1.3 and mauve render
  the same photos. (Earlier v0 demo had only the paw silhouette over
  the fur-tone ring; the silhouette stays the fallback for any pet
  without an `avatar_url`.)
- **shadcn discipline across the whole dashboard (locked 2026-05-14, second pass).**
  After the initial install, the rest of the build was swept so no hand-rolled
  button / input / textarea / badge / pill remains in consumer code. Three new
  primitives joined the kit: `components/ui/input.tsx`, `components/ui/textarea.tsx`,
  `components/ui/badge.tsx`. Every chrome surface (Header search + clinic/vet
  zones, Rail nav items), every form control (compose textarea, broadcast
  title + slug + summary + body + warning + escalation, audience age inputs,
  Settings inline-edit fields), every pill (audience OR/WHERE/AND connectors,
  send/detail OR markers, clinical SOAP visit tags), every secondary button
  (VoiceMic, UniversalVoiceInput, phone-preview Share, Avatar/Logo upload
  triggers) now resolves through the shadcn primitive set. Only exception:
  `<input type="file">` hidden file pickers, which stay raw because the
  shadcn-idiomatic pattern is hidden input + Button trigger (which is what
  the avatar/logo upload uses). Rail active state preserves the locked 4px
  primary left-bar anatomy from `docs/layout-spec.md` §1 by layering
  `border-primary` on `Button asChild variant="ghost"` — Teal in v1.3,
  Boysenberry in mauve, no hand-rolled CSS. The `cta` Button size was also
  refined from the locked chunky `px-5 py-3 text-[13px]` anatomy to
  `h-10 px-6 text-sm` (shadcn-standard primary-CTA proportions). The locked
  TealCTA anatomy from `docs/brand-system.md` is now superseded by the
  shadcn cta variant for all post-2026-05-14 work; the bare `bg-teal`
  className is no longer used anywhere in consumer code.
- **shadcn/ui installed + dashboard primitives ported (locked 2026-05-14).** The
  dashboard now sits on shadcn/ui anatomy (Radix primitives + cva variants +
  Pawkit token bridge), not hand-rolled JSX. Token bridge in
  `apps/dashboard/app/globals.css` maps both themes (v1.3 Teal/Paper default
  + alt Boysenberry mauve) into shadcn's `--primary` / `--background` /
  `--card` / `--ring` / `--radius` HSL vars so every primitive auto-paints
  correctly across both themes from one variant class. Pawkit-specific
  semantic colors (`canvas`, `teal`) stay as the canonical class names —
  the shadcn HSL vars live alongside them in `apps/dashboard/tailwind.config.ts`
  so old class names continue to compose with alpha modifiers. Primitives
  shipped: Button (cva: default / outline / secondary / ghost / link /
  destructive / teal-cta variants + `default` / `sm` / `lg` / `h44` / `cta` /
  `icon` sizes; `asChild` slot prop), Dialog, Tabs, Tooltip (TooltipProvider
  mounted at dashboard layout with 250ms delay), DropdownMenu, Sheet (for
  future parent-app override picker + dashboard side surfaces), ToggleGroup
  (with Pawkit `default` Ink-filled and `primary` auto-mauve tones, plus
  `default` and `sm` sizes; context-propagated so items inherit from the
  group). All listed in `apps/dashboard/components/ui/`. Dashboard refactor
  surfaces: inbox compose reply Send + language pill, broadcast compose
  wizard Auto-fill + Compose-in EN/MR + Next: Audience, broadcast audience
  page Species + Deceased pets ToggleGroups + Add OR group + Remove + Next:
  Send + Back to Compose + Edit, broadcast send page Mark reviewed + Send
  to N parents + Undo + Back to Audience + Start another + Edit, Settings
  Sign-out Dialog + Lang + Theme ToggleGroups + EditableFieldRow +
  EditableClinicField Save / Cancel / Edit + Avatar / Logo Upload buttons,
  pet panel Clinical history / Invoices Tabs, broadcast detail EN/MR
  ToggleGroup, inbox subtab Active / Replied ToggleGroup (router.push
  preserves the search-query + server-refetch). The dead `EditPill`
  helper was removed. TypeScript and the Next.js production build are
  both clean post-refactor. Parent-app build (Day 4–5) will consume the
  same shadcn pattern from day one, so the parent app is born
  shadcn-native rather than hand-rolled then refactored.
- **Alt theme exploration (locked 2026-05-14): Boysenberry mauve + cool off-white,
  data-theme="mauve" switch.** Parallel visual direction co-existing with the
  locked v1.3 Teal/Paper default. Activated by `data-theme="mauve"` on the
  dashboard's `<html>` root via `<ThemeController />` (URL `?theme=mauve` →
  cookie → localStorage precedence; persists across navigation + refresh).
  Toggled from the new Settings "Appearance" section (alongside the language
  toggle). Default state (no data-theme attribute) is the locked v1.3 chrome
  and stays untouched.
  - **Mauve palette anchor:** `#823159` Boysenberry. Picked from
    `mockups/archive/pawkit-mauve-palette-explore.html` against the AMS clinic uniform
    reference (mulberry-wine family, mid-saturation, slight pink lean). Other
    options shown in the explorer: Mulberry `#71355C`, Magenta wine `#8E3B6C`.
  - **White anchor:** `#F8F7F5` cool off-white. Picked over pure `#FFFFFF`
    (too clinical) and `#FAFAFA` (too neutral) because (a) the slight warmth
    keeps the "caring independent clinic" character central to Pawkit's
    position, (b) it harmonises with the warm fur tokens + real pet
    photography that are the parent-app emotional center, (c) it's gentler on
    long inbox-staring sessions.
  - **Chrome direction under mauve:** Sarvam-style light rail (faint Ink wash,
    NOT dark) with a mauve-tinted filled-pill active state (replaces v1.3's
    4px Teal left bar), soft-rounded cards (12px radius), softer 1px
    Ink/8 card borders + low-elevation shadow stack, no vellum filter (paper
    grain doesn't read on white), mauve-tinted search bar wash.
  - **Token plumbing (locked 2026-05-14):** theme-aware Tailwind colors
    (`canvas`, `teal`) compile to `rgb(var(--*-rgb, ...) / <alpha-value>)` so
    alpha modifiers (`bg-teal/10`, `bg-canvas/40`) still work AND a
    `:root[data-theme="mauve"]` block in the app's globals.css swaps the
    `--*-rgb` triplets. Direct CSS consumers (focus outline, body bg, vellum
    filter background) read the hex aliases `--teal` / `--bg-canvas` which
    are also overridden in the same block. Ink, Ink-soft, Ink-faint, and the
    10 fur tokens stay as direct hex — they don't vary across themes.
  - **Applies to both apps.** Tokens live in the shared
    `@pawkit/design-tokens` package; the parent app will pick up the same
    theme machinery during the Day 4–5 build via NativeWind 4 + a parallel
    `<ThemeProvider>` context (no `data-theme` HTML attribute on Expo).
    Anatomy direction for parent-app mauve theme: light bottom tab nav with
    mauve filled-pill active state, mauve "Share" CTA on broadcast reading
    view, softer 1px-Ink-bordered conversation bubbles, mauve-tinted
    follow-up-window banner.
  - **Demo posture:** decide BEFORE rehearsal which theme to demo. Don't
    toggle live during the demo unless rehearsed; both themes work but
    rehearsing one keeps the script tight.
- **v0 AI scope expanded to 3 Sarvam features (locked 2026-05-14):** Audio
  (Saarika STT) + Translate (Sarvam Translate v1) + **Chat (Sarvam M)**. The
  third feature, Sarvam Chat Completions, is used by `/api/sarvam-section` to
  split a long broadcast dictation into Title / Body / Summary / Warning
  signs / Escalation fields when the alt mauve theme's universal voice mic is
  active. Still Sarvam-only (no Anthropic SDK introduced), still
  vet-reviewed output (the sectioned fields drop into the compose form, which
  the vet must still approve via the bilingual review gate before publish),
  still dashboard-only (no AI on the parent app). Supersedes the 2026-05-11
  "TWO features" entry in count, not in spirit. Tiny added cost
  (~₹0.05–0.10 per dictation). Default v1.3 theme keeps the 5 per-field mics
  unchanged; only the mauve theme renders the universal mic.
- **Two-app architecture:** Next.js clinic dashboard (desktop-only) plus an
  Expo Android pet-parent app delivered to the demo phone as an EAS release
  APK (see Parent-app demo delivery lock below). Android-first, no iOS for v0.
- **Dashboard target viewport (locked 2026-05-08):** desktop browser only. No
  Tailwind responsive breakpoints, no bottom tab strip, no mobile Sheets in v0.
  Mobile-responsive scope deferred to v1+ when the dashboard is deployed for
  actual clinic ops. Build hours go into parent-app polish (the brand hero,
  shown on phone).
- **Demo target:** live Vercel link running on Jolene's laptop (dashboard) plus
  the parent app installed on the demo phone as a release APK launched from
  the home-screen icon (see Parent-app demo delivery lock below).
- **Parent-app demo delivery: EAS release APK on the demo phone (locked 2026-05-13).**
  The parent app ships to the demo phone as a release-mode APK built via
  `eas build --profile preview --platform android`, installed via the EAS
  download link or USB sideload. No Expo Go on the demo phone. Build at T-2
  days minimum so rehearsal has a 24-hour buffer to spot-fix and rebuild if
  needed. Expo Go remains the development iteration tool on a separate dev
  phone or emulator (a ~15-minute EAS rebuild per code change is too slow for
  active dev). Rationale: Expo Go cold-start under dev-tunnel mode is too
  slow (10–20s bundle download per launch) to be reliable demo footing; a
  release APK boots in ~2 seconds from the home-screen icon and behaves
  identically to a real installed app. The home-screen icon at 1cm² is part
  of the premium first-impression check per `docs/build-order.md` demo-day
  ritual. The Supabase data path is unchanged; only the install path
  changed. Supersedes the prior "Expo Go QR" delivery mechanism.
- **Demo shape:** ~15 min app demo (laptop dashboard plus phone parent app) plus
  ~10-15 min growth-of-app presentation. Total ~25-30 min. Inside Sagar's
  mid-May availability window.
- **Section-by-section research intake** is the chosen co-creation pattern (over
  big-dump or file-attach).
- **Dimensions and color placements deferred to Phase 2 (locked 2026-05-11).**
  Brand palette (Teal, Ink, Paper, fur kit) stays locked per
  `docs/brand-system.md` v1.3. But specific dimensions (header heights,
  rail widths, button heights, border weights, brand-dot sizes, etc.) and
  per-element color placements (which surface gets Teal vs Ink vs Paper)
  are NOT finalized during Phase 1 narrative review; they lock during
  Phase 2 research + mockups. Working drafts in `docs/layout-spec.md` may
  carry current placeholders but those aren't locks.
- **Admin dashboard search bar (locked 2026-05-11).** Persistent header
  search bar on the dashboard. Behavior is context-aware: on Inbox tab it
  scans patient/parent records (pet name, parent name, phone number) and
  a hit opens that pet's profile or that parent's inbox thread; on
  Broadcasts tab it scans Broadcast content by keyword; on Settings tab
  the search bar is hidden (no searchable content).
- **Dashboard header wordmark = AMS clinic, not Pawkit (locked 2026-05-11
  late evening).** The dashboard header carries the AMS clinic wordmark
  ("Animal Medical Services" Satoshi Bold + "PUNE" Inter small caps
  below, per `docs/brand-system.md`). The Pawkit brand does not appear
  in the dashboard header. White-label discipline: Sagar's dashboard
  reads as HIS clinic's tool, with Pawkit-as-vendor living quietly in
  Settings (the `v0.1` mark) and on splash / login surfaces. Replaces
  the prior "Pawkit wordmark plus brand dot" anatomy in
  `docs/layout-spec.md` Section 1 (updated same day).
- **Dashboard header brand dot dropped (locked 2026-05-11 late
  evening).** The Teal brand dot previously specced next to the header
  wordmark is removed. It carried no defined job, the wordmark grounds
  itself, and it was reading as visual noise next to the clinic
  wordmark. Removed from `docs/layout-spec.md` Section 1.
- **Cmd-K-hidden search patterns banned on dashboard (locked 2026-05-11
  late evening).** The persistent header search bar is always visible.
  Patterns that hide the search behind a keyboard-shortcut command
  palette (Superhuman / Linear-style cmd-K-only chrome) are banned on
  the Pawkit dashboard. Sagar is a daily Windows user, not a
  keyboard-shortcut power user; shortcut-hidden chrome creates discovery
  friction. Lock applies across all Phase 2 directions; surfaced when
  reviewing Direction D (Superhuman-channeled) in the Phase 2 admin
  Screen 01 mockup.
- **Inbox row avatar discipline clarified (locked 2026-05-11 late
  evening).** Avatar fill = real pet photo (or Ink-faint placeholder
  + Lucide paw-print mark when no photo). Avatar fur-token GRADIENT
  fills are explicitly banned (the gradient pattern violates the
  fur-tokens-never-in-chrome rule; the chrome is the avatar frame,
  the photo is the content). Fur-match ring (3px around the avatar)
  remains the locked carrier of the fur signal in inbox rows per
  `docs/layout-spec.md` Section 2.
- **Screen 01 dashboard chrome locked, Phase 2 (2026-05-11 late
  evening).** User picked Direction C (Notion-channeled) chrome
  with Direction B's filled-tint search bar, centered. Anatomy:
  64px header; 240px rail; 1px Ink-faint header-bottom + rail-right
  borders; AMS clinic wordmark left (per earlier same-day lock);
  filled-tint search bar centered in header (36px tall, bg
  `rgba(168, 163, 158, 0.15)` over Paper, 4px radius, Lucide
  magnifier icon left at 14px stroke 1.75 Ink-soft, Inter 14px
  Ink-soft placeholder, max-width 460px); right header zone empty
  reserve. Rail: faint `WORKSPACE` small-caps section label above
  items (Inter 10px medium Ink-faint, letter-spacing 0.16em, 16px
  h-padding); rail items 40px tall, Inter 15px regular Ink-soft
  resting / Ink semibold active, 4px Teal left active border
  (transparent otherwise), Lucide icons 16px stroke 1.75 (mail /
  megaphone / settings for Inbox / Broadcasts / Settings); generous
  4px gap between items. Updated `docs/layout-spec.md` Section 1
  same turn. Supersedes the prior "dimensions deferred to Phase 2"
  placeholder.
- **Screen 02 admin Inbox locked, Phase 2 (2026-05-11 late
  evening).** User picked Direction C (Hey-channeled). Row
  anatomy: 56px tall inbox rows with 1px Ink-faint dividers; 46px
  avatar-ring outer / 40px avatar-photo inner with 3px fur-match
  ring (Honey for Gabby, etc., per `packages/match-logic`); sender
  column 180px stacking pet name (Inter 14px semibold Ink) over
  household (Inter 11px Ink-soft); preview column flex, Inter 13px
  Ink-soft, 2-line wrap via `-webkit-line-clamp: 2`; relative
  timestamp Inter 12px Ink-faint tabular, top-right of row. Subtab
  strip: Active (count + 2px Ink underline when active) / Inactive.
  Active rows sorted oldest-waiting at top per Section 2 spec.
  Updated `docs/layout-spec.md` Section 2 same turn.
- **Screen 02 inbox preview truncation lock (2026-05-11 late
  evening).** Inbox row previews render at most TWO lines of the
  parent's last message. Messages longer than two lines truncate
  with a trailing ellipsis ("..."); the vet sees the full message
  when they tap the row and open the thread. Implementation:
  `-webkit-line-clamp: 2` + `display: -webkit-box` +
  `-webkit-box-orient: vertical` + `overflow: hidden` (webkit/blink
  auto-renders the ellipsis). The "Photo" / "Video" microcopy for
  media-only messages is exempt from truncation since it's a
  single short word.
- **Screen 03 scope flipped — Inbox thread detail (with pet record
  panel), not standalone per-pet profile (locked 2026-05-11 late
  evening).** The "Per-pet medical profile" standalone screen
  previously described in `docs/layout-spec.md` Section 3 is killed.
  There is NO standalone pet page in the admin dashboard. The pet's
  clinical record surfaces ONLY as the right-hand panel on the Inbox
  thread detail view, which opens when Sagar taps a row in the Inbox
  list (Section 2). Layout: conversation + reply compose on the
  LEFT, pet record panel on the RIGHT. Section 3 of layout-spec
  rewritten to spec this thread-detail surface. Old reference
  exploration `mockups/phase2-03-pet-profile.html` deleted same turn;
  new exploration file `mockups/archive/phase2-03-thread-detail.html` holds
  the 4-direction comparison. Aligns with the earlier locked principle
  "pet profiles open contextually from inbox messages" (CLAUDE.md);
  the prior Section 3 text contradicted that principle and was a
  spec drift.
- **Screen 03 admin Inbox thread detail locked, Phase 2 (2026-05-11
  late evening; Quick Facts treatment revised from B to A same
  evening).** User picked a hybrid: Quick Facts treatment from
  Direction A (Linear-channeled, inline label/value rows with
  hairline dividers, no card) + Clinical History treatment from
  Direction C (Notion-channeled, 2-col editorial). Initial pick
  was Direction B's bordered card for Quick Facts; user revised to
  Direction A immediately after, before any downstream work.
  Two-column main area: ~640px conversation column on the LEFT
  (breadcrumb + open follow-up banner + bubbles + compose) and
  **400px pet record panel on the RIGHT**. Bubble grammar (Sagar's
  view): parent bubbles Paper-bg + 1px Ink-faint border, LEFT side;
  Sagar's reply bubbles Ink-filled, RIGHT side (WhatsApp grammar
  from Sagar's perspective). Compose surface: 44px Paper-bordered
  text field + Lucide Mic ghost button + filled Teal Send CTA. Pet
  panel content (top to bottom): pet photo (56px) with 3px
  fur-match ring + pet name ONLY (no meta lines, no household, no
  microchip in header); **Quick Facts as inline label/value
  rows with hairline 1px Ink-faint dividers (NO card, NO outer
  border)**, "QUICK FACTS" small-caps section label above, 5 rows
  (Breed, Age, Weight + month taken, Chronic with · separator
  between conditions, Last visit + reason); label Inter 12px
  Ink-soft + value Inter 13px Ink semibold tabular (font hierarchy
  cohesively mirrors Clinical History: 12px Ink-soft label ≈ 12px
  ch-meta, 13px Ink semibold value ≈ 13px ch-title); **Clinical History
  2-column editorial section** below Quick Facts (60px date column
  + body with title + 1-2 line clinical meta, hairline dividers,
  scrollable to show last ~8 entries with older entries scrolling
  into view). Microchip, regular vet, last invoice ₹, adopted year
  dropped from header per simplification — they live in the full
  invoice (Section 4) or are dropped from v0. Updated
  `docs/layout-spec.md` Section 3 same turn.
- **Broadcast lifecycle (locked 2026-05-11).** The Broadcasts rail
  item branches into TWO subtabs on the left menu: **Drafts**
  (in-progress work that hasn't been sent yet) and **Published** (all
  past published Broadcasts, latest first). Drafts save as Sagar
  composes. **Edit after publish is allowed** (Sagar opens, edits,
  re-publishes; parent cards reflect latest content). **Delete after
  publish is allowed** (card removed from parents' Broadcasts tab,
  public URL 404s). The push notification that already fired CANNOT
  be unsent; parents who tap a stale push notification post-delete see
  a graceful empty state on the Broadcasts tab. UX details TBD:
  auto-save vs explicit Save-draft button, edit-indicator on parent
  cards, whether edit triggers a fresh push, exact post-delete tap
  microcopy.
- **Bilingual hard publish-block + auto-translation (locked 2026-05-11).**
  Every published Broadcast must have both EN and MR content, both
  reviewed and approved by Sagar before publish. **Sarvam Translate**
  auto-generates the other-language version when Sagar composes in one
  language (trigger TBD: on-blur or explicit Translate button).
  Sequential approval flow: Sagar reviews EN, approves; reviews MR
  translation, edits if needed, approves; publish. Added a second AI
  feature to v0 scope (see AI scope expansion below).
- **Broadcast audience filter species (locked 2026-05-11).** Audience
  filter supports species selection: dogs, cats, or both. Other
  species not in v0 scope (synthetic dataset is dogs + cats; revisit
  if AMS sees other species at meaningful volume).
- **Dashboard chrome bilingual + EN/MR toggle location (locked 2026-05-11).**
  The dashboard ships fully bilingual EN + MR in v0. Every label,
  button, microcopy string, and empty state renders in both languages,
  switching based on Sagar's `users.preferred_language` setting. The
  EN/MR toggle lives ONLY in admin Settings, not in the persistent
  header or any other surface. Per-Broadcast bilingual content (the
  EN + MR text in published Broadcasts) is independent of this toggle:
  published Broadcasts are always bilingual EN + MR for parents
  regardless of Sagar's chrome language.
- **Vet license display (locked 2026-05-11).** Vet license number
  (`users.vet_license`) is editable by Sagar in admin Settings only.
  Never shown in `<VetByline />` (per locked byline rule 2026-05-09:
  "No school, no graduation year, no license number anywhere on the
  byline"). No "About this vet" detail panel in v0; deferred to v1+
  if a parent-side vet-credential surface is needed.
- **v0 AI scope expanded to TWO features (locked 2026-05-11).**
  Previous lock (2026-05-06) was "one AI feature, Sarvam Audio
  voice-input only." Updated 2026-05-11 to two features, both
  Sarvam-vendor, both dashboard-only, both producing text Sagar
  reviews before output ships:
  1. **Sarvam Audio** (Whisper fallback for English): voice-to-text
     transcription on dashboard compose surfaces (Broadcast body and
     structured-section fields, inbox reply).
  2. **Sarvam Translate**: EN ↔ MR auto-translation of Broadcast
     content at compose time, surfaced as text Sagar reviews and
     approves sequentially before publish.
  Still excluded: no Sonnet, no Haiku, no Anthropic SDK, no
  classifier, no AI-drafted replies, no AI Triage (permanently
  cancelled), no AI on parent app, no AI at parent-side read-time
  (parent reads stored bilingual content).
- **Product elements phase deferred to v1+ (locked 2026-05-11).**
  Originally planned as a discrete co-creation phase between flows and
  microcopy to consolidate reusable primitives (`<VetByline />`,
  `<TealCTA />`, Pet Page composition, open follow-up window banner).
  Deferred because most candidates are already specced under the
  premium-feel system (`docs/premium-feel/byline.md`, brand-system,
  layout-spec, decisions-log). The one real gap, `<TealCTA />` button
  anatomy, is folded into Day 1 of build foundations (see
  `docs/build-order.md`). `product-elements/` directory deleted. Phase
  removed entirely from the phase sequence as part of the 2026-05-11
  restructure (see CLAUDE.md Current phase).
- **Phase sequence restructured (locked 2026-05-11).** Old order had
  visual mockups at Phase 2 and per-screen UI/UX research at Phase 5,
  which sequenced design before research (illogical). New 6-phase
  order: (1) flows; (2) UI/UX research per screen + visual mockups in
  parallel; (3) microcopy EN + MR; (4) build; (5) debug + rehearsal;
  (6) demo. The product elements phase is removed entirely. Existing
  mockups under `mockups/` are reference material only, not deliverable;
  the plan is a full per-screen redo with research informing the new
  mockups first. Formal per-screen research has not started. Phase 2 is
  far from done.
- **Screen 07 Style guide descoped from Phase 2 design (locked
  2026-05-11 late evening).** The `/style-guide` page is an internal
  dev/design reference, not a user-facing screen, not part of the demo
  flow. The locked brand v1.3 + premium-feel system IS the design
  system spec; the page just renders it for dev workflow. Phase 2
  design exploration (4-direction comparison + cohesion check +
  heuristic audit) is overengineering for an internal tool. Built
  pragmatically during the build phase using whatever ergonomic
  layout serves devs. Exploration file `mockups/phase2-07-style-
  guide.html` and `mockups/assets/screen-07-refs/` deleted same turn.
  Section 7 of `docs/layout-spec.md` stays as a page description
  (what the page contains) but is removed from the Phase 2 admin
  design queue. Admin Phase 2 design queue is now: 01 ✓, 02 ✓, 03 ✓,
  04 (pick open), 05 (pick open), 07b (pending).
- **Phase 2 method locked (2026-05-11).** Mockup authorship reversed:
  Claude builds the mockups (was: user authors HTML/CSS herself).
  Per-screen method, all screens (not hero-first):
  (a) **List all screens** by auditing `docs/layout-spec.md` + flows +
      `docs/premium-feel/states.md` (empty / loading / error states
      count as screens too).
  (b) **Per-screen reference research, two strands.** Claude compiles
      both: (i) 3-4 **design references** per screen from best-in-class
      UI taste leaders (WhatsApp, Linear, Telegram, Discord, etc.) for
      interaction grammar and visual ceiling; (ii) 2-3 **category
      competitors** per screen from vet/pet apps (Pawp, AirVet,
      FirstVet, Petdesk, Klara, Rover, Wag, Vetsource, Pumpkin, MyPet,
      etc.) for feature grounding and category-specific patterns. Real
      screenshots only. Captions only, no long descriptions.
  (c) **Per-screen Pawkit mockups.** Claude builds HTML/CSS Pawkit
      mockups applying each direction (from either strand) to the
      actual Pawkit screen, using brand v1.3 + premium-feel system.
  (d) **User picks** the direction per screen, in clusters (admin set
      together, parent set together).
  (e) **Cohesion check** after each cluster, before moving to the next.
  (f) **Final heuristic audit** before build: Nielsen 10 plus
      Pawkit-specific checks (low-literacy one-handed completion,
      one-Teal-per-screen, fur-token-never-in-chrome, bilingual EN+MR
      completeness, 8-value spacing audit per
      `docs/premium-feel/spacing.md`, vellum + depth language per
      `docs/premium-feel/materials.md`).
- **Admin invoice access path: contextual from pet record panel
  (locked 2026-05-12 for v0).** Admin nav stays Inbox / Broadcasts /
  Settings (no Invoices rail tab). The Screen 03 pet record panel
  surfaces Clinical History and per-pet Invoices as two tabs under
  Quick Facts (toggle between them; each tab fills the full 400px
  panel width when active, no two-column split). Clinical History
  tab content = the existing 2-column editorial section. Invoices
  tab content = a compact list of this pet's invoices; tap an
  invoice row → opens view-only Screen 04 invoice screen (full
  screen) with a Back affordance that returns to the inbox thread
  (conversation column on the left, pet panel on the right with
  Invoices tab still active). User-stated reason: AMS has not
  given permission to switch system of record from VetBuddy, so
  v0 does not introduce a top-level invoices browse destination;
  the tabbed panel is a deliberate v0 compromise pending VetBuddy
  migration permission. Parent app retains locked per-pet Invoices
  tab inside Pet Page (2026-05-08 lock, unchanged).
- **Screen 05 Clinical history full screen + Screen 04 Invoice
  full screen as contextual destinations (locked 2026-05-12).**
  Both are full-screen views reached from the Screen 03 pet record
  panel tabs. Rows in both tabs are tappable as entry points to
  their full screens: Clinical History tab rows tap to open
  Screen 05; Invoices tab rows tap to open Screen 04. Back affordance on
  each full screen returns to the inbox thread with the originating
  panel tab still active. Locked admin mental model preserved (no
  Pets rail tab; pet record surfaces only contextually). Screen 05
  Clinical history full screen shows SOAP note structure (Subjective
  / Objective / Assessment / Plan per visit), a preview of the
  production data-entry path that replaces VetBuddy (Sagar dictates
  via Sarvam Audio, Claude structures into SOAP fields, visit record
  written); v0 content is hand-written per pet (Gabby's full history
  seeded for the demo). Renumber 2026-05-12: Broadcast composer
  Screen 05 → Screen 06 (file rename `phase2-05-broadcast-composer.html`
  → `phase2-06-broadcast-composer.html`, `screen-05-refs/` →
  `screen-06-refs/`); Settings stays Screen 07b; Style guide
  Section 7 DESCOPED notice unchanged. Admin Phase 2 design queue
  now: 01 ✓, 02 ✓, 03 ✓ ("Open full" affordance added to Clinical
  History tab content same turn), 04 Invoice full screen (rebuild
  needed), 05 Clinical history full screen (new, research not yet
  started), 06 Broadcast composer (pick pending; subject to
  Compose/Audience+send split scope-locked 2026-05-12, sub-numbering
  pending), 07b Settings (pending).

- **Screen 03 column split rebalanced to 55/45 (locked 2026-05-12).**
  Pet record panel widened from 400px to 468px; conversation column
  retains 1fr (flex), shrinking from ~640 to ~572 at the reference
  ~1040px main area. Panel breathes more for Quick Facts values,
  Clinical history meta, and Invoices list rows; conversation column
  loses ~10.6% width (compose text field ~385px, bubble max-width
  ~372px at 65% rule). User-stated reason: pet panel needs more
  visual parity with conversation surface, matching the new role of
  pet panel as primary contextual surface (Clinical history +
  Invoices tabs + tap-to-open full screens). Updated
  `mockups/archive/admin-locked.html` `.td-main` grid-template-columns +
  `.pet-panel` width; updated `docs/layout-spec.md` Section 3
  Phase 2 locked anatomy.
- **Admin media bubble overlay behavior unlocked (locked 2026-05-12
  for v0).** Was: inline overlay scoped to the thread panel, NOT a
  viewport-modal Dialog. Now: media bubble tap opens a centered
  pop-up overlay covering ~60% of the dashboard viewport at default
  size, with an option to expand to larger (maximize affordance);
  close affordance dismisses to thread. Pop-up extends beyond the
  thread panel area but stops short of full viewport (left rail
  remains visible at the periphery). Applies to admin only (HTML5
  `<video controls>`); parent-side inline-overlay-scoped-to-thread
  behavior preserved due to phone form factor. User-stated reason:
  bubble-size review is inadequate for assessing clinical detail
  (limp gait, lesion area); full-viewport modal is too aggressive;
  60% pop-up balances scrutiny with context. Updated
  `docs/feature-scope.md` Clinic dashboard video bubble line.

- **Screen 04 Invoice direction + v0 content rules locked 2026-05-12.**
  User picked **Direction A (Stripe-channeled, classic invoice
  document)** from the 4 directions explored in
  `mockups/archive/phase2-04-invoice.html` (A Stripe / B Ramp / C Brex /
  D Notion+Pulley); B, C, D become scratch reference. Direction A
  refined with the following v0 content rules (apply globally to
  Screen 04 regardless of direction):
  (1) **No Paid status pill** anywhere on the invoice canvas (locked
  2026-05-12; was in the prior exploration). User-stated reason:
  unnecessary; the rule is that payments clear at the desk, so an
  invoice in Pawkit IS by definition a record of a paid receipt,
  not a bill awaiting payment.
  (2) **No owner/pet identity strip** (Patient / Household block
  removed). Identity already lives in the inbox thread above; the
  invoice is opened contextually from that thread.
  (3) **No per-section subtotals** in category headers (Examination /
  Medication / Procedure). Section name only. Grand total at bottom
  carries all the totaling weight.
  (4) **No Download PDF button** in v0 (deferred "for the time being",
  user-stated). May return v1+.
  (5) **Only three categories in v0:** Examination, Medication,
  Procedure. **No Follow-up / pre-paid recheck category** (deferred
  "for now", user-stated).
  (6) **Tooltip copy rules:** Examination and Procedure line items
  show a flexible plain-English tooltip rendered inline beneath the
  line name (example voice: "This is for Dr. Sagar's time examining
  your pet." Quiet, generic, no clinical detail / instruction).
  **No info icon** on any row (removed 2026-05-12 as redundant
  decoration since the tooltip is always visible inline; line-row
  grid simplified from 1fr/18px/100px to 1fr/100px). **Medication
  line items show name (with quantity or volume) + price only;**
  no usage instructions ("twice daily for 7 days" etc.), no tooltip.
  The rule is that Pawkit does not write medication instructions
  anywhere in the invoice surface.
  Visible result: total drops from ₹3,450 (8 line items, 4 categories
  including Follow-up) to ₹3,150 (7 line items, 3 categories).
  Updated `mockups/archive/phase2-04-invoice.html` Direction A inv-stage +
  direction-sub; updated `mockups/archive/admin-locked.html` pet panel
  Invoices tab May 6 invoice total. B, C, D directions left as-is
  (scratch). Same turn: also locked (7) totals stack treatment:
  grand Total only (no Subtotal/GST breakdown row), with "GST
  included" italic note right-aligned underneath. Screen 04
  graduated same turn to `mockups/archive/admin-locked.html` as Section 04
  with full anatomy block + rendered frame; TOC updated.

- **Production SOAP + invoice pipeline refined (locked 2026-05-12
  for pre-launch build, not v0).** Refines the prior "Sagar dictates
  a SOAP note" framing in `docs/flows/admin.md` Visit data origin
  to an ambient-capture model.
  (1) Vet hits "start recording" at the beginning of the consult,
  consult proceeds normally, vet hits "stop" when done.
  (2) AI engine extracts SOAP structure (4 pre-built labeled fields
  filled from the consult audio) AND suggests invoice line items
  from mentioned medications, procedures, and examinations.
  (3) Alternative path: vet can dictate invoice line items directly,
  instead of or in addition to the AI extraction.
  (4) Vet reviews and approves AI-generated SOAP + invoice in a
  single review motion. Zero post-consult manual data entry except
  the approval click.
  (5) On approval, the invoice auto-routes to the billing desk,
  where non-vet support staff see it queued for the parent to pay;
  SOAP note saved to pet's clinical history.
  (6) **New admin role implied: billing desk support staff** (non-vet,
  non-technical). Pre-launch SOAP build must add this role surface.
  v0 admin remains Sagar-only.
  (7) **AI scope expands beyond current v0 lock.** Current v0 AI
  lock is Sarvam Audio voice-to-text on dashboard compose surfaces
  + Sarvam Translate for EN-MR. This production vision additionally
  needs an LLM layer on top of transcription to perform structured
  field extraction (SOAP S/O/A/P) and item identification (mapping
  mentioned drugs/procedures/exams to invoice line items + AMS
  price list). Product class: ambient AI scribe (Suki / DAX / Heidi
  for human medicine; Talkatoo / ScribeMD for vet). Fresh AI-scope
  lock required when pre-launch build planning starts; not blocking
  on v0.
  (8) v0 demo unchanged: Screen 05 surfaces hand-seeded SOAP content
  (read-only history view); ambient capture + invoice auto-routing
  + billing-desk surface all live in the growth pitch (slides /
  verbal), not in the live demo run-through.
  User-stated reason: zero post-consult workflow overhead for the
  vet; AI captures and structures everything during/from the
  consult; vet only approves; invoice routes itself to billing.

- **Build vs buy locked: own AI orchestration (2026-05-12 for
  pre-launch build).** Pawkit owns the SOAP + invoice AI
  orchestration layer rather than licensing existing vet AI scribes
  (Scribenote, VetSoap.ai, HappyDoc, Talkatoo, Vetrec, Heidi Health,
  etc.). User-stated reasons:
  (a) **Indian language requirement.** All existing vendors are
  English-only; AMS Pune needs Marathi + Hinglish. Sarvam Audio
  (already in v0 lock) handles Indian languages; vendors do not.
  (b) **Invoice line item extraction.** Pawkit's locked production
  vision extracts invoice items from consult audio + auto-routes to
  billing desk; no vendor offers this.
  (c) **Vertical product integration.** SOAP feeds parent-app
  clinical history, marketplace medication suggestions, broadcast
  composer context. Vendor APIs cannot extend into Pawkit's other
  surfaces.
  (d) **Unit economics at scale.** Vendor subscriptions (Scribenote
  Pro ~₹6,500/mo per vet, VetSoap.ai ~₹4,200/mo per user) become
  significant outflow at 100-clinic scale; API orchestration cost is
  sub-linear and bundles into clinic SaaS without per-vet seat fees.
  (e) **Brand + pitch positioning.** "Pawkit, Indian-built ambient
  AI scribe" is a stronger pitch than "Pawkit + Scribenote
  integration."
  (f) **Data residency.** DPDP Act 2023 trajectory favors
  Indian-resident processing; Sarvam is Indian, foundation-model
  vendors (Anthropic / OpenAI) have configurable regions; vet AI
  scribe vendors route through US / Canada by default.
  Note: own-orchestration here means stitching foundation-model APIs
  (Sarvam Audio + LLM structuring layer), NOT training a custom ML
  model from scratch. Same architectural pattern Scribenote and
  VetSoap.ai use internally; Pawkit owns the orchestration + UX +
  data + brand.

- **SOAP layer production-spec implications pinned (2026-05-12, from
  real-vet sentiment in r/VetTech "AI SOAP notes" thread).**
  Practitioner failure modes + feature requests captured across
  Scribenote (loved 5/5 mentions), Otto Flow (positive), HappyDoc
  (positive), Talkingvet (positive), Vetrec (positive), VetSoap
  (mixed), Talkatoo (mixed-negative), Heidi Health (cross-domain
  positive). Use as the design-against list when the pre-launch SOAP
  build starts.

  **Universal complaints to design against:**
  - Drug name spelling errors
  - Pet name errors (especially "double petter" problem in
    multi-pet households)
  - Hallucination (model inserts content never discussed; "dog
    loved to play in the snow" example; "throws stuff in there"
    pattern)
  - Misinterpretation of dictation ("pills / plants in the house"
    became "diet consisting of pills" in one Reddit user's example)
  - Cost (clinics that love products can't afford them; Pawkit
    advantage: bundle AI into clinic SaaS, no per-vet seat)
  - Environmental concern (raised by the Reddit OP; text-only LLMs
    are relatively low-impact, but Pawkit should be ready to disclose
    energy posture if asked)

  **Production-spec features to incorporate (pre-launch build, not
  v0):**
  (1) **Hallucination mitigation UX.** Low-confidence highlighting on
  drug names, dose units, and pet names. Drug-name validation against
  a pharmacy dictionary. Mandatory edit-before-approve (already in
  the locked production flow).
  (2) **Conversation-as-receipt.** Retain the raw transcript (and
  consider raw audio for a defined retention window) tied to each
  SOAP record. Vets value this for he-said / she-said disputes;
  multiple Reddit users explicitly named the audio recording as
  liability shield.
  (3) **Discharge summary as sibling output.** Same ambient AI
  pipeline generates a bilingual EN+MR client-friendly visit summary,
  sent to the parent app's clinical-history view. Scribenote ships
  this and vets love it. Strong parent-app value-add: parents get a
  plain-language summary of what happened, what's prescribed, what
  to watch for.
  (4) **Multi-pet "double petter" disambiguation.** Known failure
  mode. Pawkit structures the recording around a single pet context:
  vet opens Gabby's record FIRST, then hits "start recording," so the
  AI knows which pet's SOAP it's building. UI: recording controls
  live on the specific pet's surface, not as a global "start
  recording" button.
  (5) **Templates beyond SOAP for v1+.** Surgery report, discharge
  note, callback recap, plain dictation. Otto Flow's template
  variety was specifically praised in the Reddit thread. v0 ships
  SOAP-only; flag others for the deferred pile.

- **Screen 05 Clinical history full screen: Direction C locked
  (2026-05-12).** User picked Linear-channeled direction from the 4
  explored in `mockups/archive/phase2-05-clinical-history.html`
  (A NEJM / editorial · B Notion collapsible · C Linear cards ·
  D Scribenote / Digitail color-coded SOAP cards). Direction C
  structural anatomy: per-visit subtly-bordered card (rgba(15,12,10,
  0.02) bg, 1px Ink-faint border, 6px radius, 18px / 22px padding);
  card header carries date (Inter 12px Ink-soft tabular semibold) +
  visit reason (Inter 14px Ink semibold) + pill-style metadata tags
  (Inter 10px uppercase Ink-soft on rgba(15,12,10,0.08) bg) + vet
  byline row (Inter 11px Ink-faint italic); SOAP body below as 80px
  label / 1fr body two-column grid per S/O/A/P section (label Inter
  10px Ink-faint uppercase semibold letter-spacing 0.14em + body
  Inter 13px Ink line-height 1.6). Directions A, B, D become scratch
  reference. **Copy marked TBD (revisit pending).** Metadata copy
  especially: pill tag taxonomy (Sick visit / Wellness / Vaccination
  / Otitis / Allergy in the current mockup) is placeholder pending a
  finalized vocabulary lock (need to define the visit-type tag set,
  the body-system / condition tag set, and the rules for which pills
  attach to which visit). Vet byline format and SOAP body voice
  (currently clinical-shorthand-heavy: "T 38.6°C, P 92, R 24",
  "Cytology: cocci +++, yeast +", etc.) also flagged for the copy
  pass.

- **Broadcast composer split sub-numbering locked 2026-05-12:
  Screen 06 Compose + Screen 06b Audience+send.** Mirrors the 07b
  Settings sub-letter pattern. Style guide DESCOPED notice stays
  at Section 7 of `docs/layout-spec.md` (no Phase 2 design surface);
  Settings stays Screen 07b. Asset folders:
  `mockups/assets/screen-06-refs/` (Compose, existing,
  supplemented 2026-05-12 with mailchimp-mobile, stripo, beehiiv,
  beefree on top of the existing substack / mailchimp / notion /
  ghost / petdesk lineup) and `mockups/assets/screen-06b-refs/`
  (Audience+send, new 2026-05-12, sourced with mailchimp-segments,
  klaviyo-segments, customerio, substack-publish, weave-audience,
  hubspot-segments [substitute for paywalled Petdesk + Klara
  audience UIs]). Phase 2 admin design queue now: 01 ✓, 02 ✓,
  03 ✓, 04 ✓ (Invoice), 05 ✓ (Clinical history), 06 (Compose,
  research sourced, mockups + pick pending), 06b (Audience+send,
  research sourced, mockups + pick pending), 07b Settings (research
  + mockups not yet started).

- **Broadcast content rules locked 2026-05-12 in
  `docs/broadcast-content-format.md`.** Three refinements adopted
  to the field structure based on content-format research (Mayo /
  CDC / NHS / VCA / AKC / Queen Creek / Preventive Vet / academic
  patient-education literature):
  (1) Rename "Key points" → "Summary" (CDC "At a glance" /
  MedlinePlus "Summary" is the recognizable house style; "Key
  points" is rare as a field label in real advisories).
  (2) Add optional "Who this applies to" microfield near the title
  (real outbreak advisories always answer "is this me?" within the
  first 50 words; example: "For: puppies under 16 weeks").
  (3) ~~Live readability indicator in the composer~~ **REVOKED
  2026-05-12** as condescending chrome ("Grade 8 bullshit", user
  said). The underlying length / voice / low-literacy guidance
  remains (target 8-12 words per sentence, Grade 6-8 reading level
  for AMS's ~20% low-literacy audience) and informs field hints,
  placeholder copy, and the microcopy round; just not surfaced as
  a visible Grade-X widget in the composer.
  Locked field structure (6 fields): Title (required) · Who applies
  (optional) · Summary (optional, was "Key points") · Body
  (required) · Warning signs (optional) · Escalation (optional).
  Both Title and Body bilingual EN+MR; Summary / Warnings /
  Escalation also bilingual when populated.
  NHS Care Cards visual treatment locked for Warning signs +
  Escalation (red-bordered card, bold heading + icon, bulleted body;
  color is supplementary not primary signal; one visual variant for
  v0 since AMS is a single walk-in clinic). Source:
  https://service-manual.nhs.uk/design-system/components/care-cards
  Bilingual structure refined: side-by-side EN/MR tabs per field on
  the dashboard composer (current spec validated); STACKED
  Marathi-then-English per field on the parent app reading view +
  public web reading URL (side-by-side fails on phone; heading
  parity required in both languages; no mixed-language sentences;
  Devanagari needs more vertical space than Latin, use Mukta or
  Tiro Devanagari Marathi).
  Voice defaults: "we" for clinic, "you / your dog" for parent;
  active voice (passive flagged, target <5%); action verbs in
  warning + escalation ("Watch for...", "Call us if..."); conditional
  not absolute ("Call us if you see X", not "You should call us");
  matter-of-fact tone (the red card does the urgency work, words
  inside stay calm).
  Low-literacy / accessibility: icons WITH labels, not icons
  REPLACING labels (the `CLAUDE.md` "icons over labels" principle
  is about navigation chrome only; in broadcast body content,
  icons must be accompanied by text labels).
  See `docs/broadcast-content-format.md` for full detail and source
  citations.

- **Screen 06 Broadcast composer (compose half) locked + graduated
  2026-05-12.** Direction A picked (faithful older-mockup structure
  + full mobile preview) from the 4 directions explored in
  `mockups/archive/phase2-06-broadcast-composer.html`. Refined this turn
  with: (a) 3-step flow nav at top (Compose · Audience · Send,
  Compose active, imported from Direction C); (b) global "Composing
  in: EN / MR" toggle after the URL bar (replaces per-field EN/MR
  tabs; Sarvam Translate auto-pairs the other language); (c) Sarvam
  voice-input mic button in every field header; (d) "Next: Audience
  →" CTA (replaces "Continue → Audience"); (e) phone preview shrunk
  from 360px to 290px with 580px max-height + internal scroll
  (normal mobile size, not oversized); (f) Grade-X readability
  indicator under Body REMOVED (see revocation in the Broadcast
  content rules entry above). Directions B / C / D become scratch
  reference in `phase2-06-broadcast-composer.html`. Graduated same
  turn to `mockups/archive/admin-locked.html` as Section 06 with full
  anatomy block + rendered frame; TOC updated (Screen 06 no longer
  pending; 06b added as pending). Screen 06b rework (matching
  06's design language: 3-step nav with Audience active, etc.) in
  progress this turn; 06b pick + graduation pending.

- **Broadcast flow expanded to three screens 2026-05-12: 06 Compose
  · 06b Audience · 06c Send.** Previously the locked split was
  06 / 06b only (Compose + Audience-and-Send combined). Refined this
  turn to a three-step flow where 06b is audience-filter-only and
  06c is a dedicated final-review-and-send screen (mobile preview
  on the left, audience confirmation on the right, "Confirm and
  Send" Teal CTA with 15-second undo). The 3-step nav at the top of
  every broadcast screen (Compose · Audience · Send) now matches
  this 1:1.
  Screen 06b Direction C (Klaviyo AND/OR conditional groups) locked
  this turn after refinements: "ticks live as conditions change"
  hallucinated chrome line removed from the count strip; age range
  inputs restyled to match Direction C's other form controls
  (.c-age-input + .c-age-label, matching .c-cond-select); Publish
  CTA replaced with "Next: Send →" across all four 06b directions
  (since Send now lives on 06c); undo hint removed from 06b bottom
  bar (undo lives on 06c instead).
  Screen 06c built as a single-direction exploration file
  (`mockups/archive/phase2-06c-broadcast-send.html`) matching the
  user-specified layout: chrome with 3-step nav (Compose done ·
  Audience done · Send active); 320px mobile preview LEFT; audience
  confirmation RIGHT (hero count + filter conditions list + delivery
  channels: in-app Broadcasts tab, push notification, public web URL
  goes live); bottom bar with Back to Audience (ghost) and Confirm
  and Send (Teal) CTAs + 15-second undo hint.
  Both 06b and 06c graduated to `admin-locked.html` as Section 06b
  + Section 06c on 2026-05-12 same turn (TOC updated, future-sections
  comment narrowed to 07b only). Phone preview consistency fix
  applied across 06 / 06c (bezel 8px → 4px, border-radius 36px →
  32px, scrollbar hidden via cross-browser CSS, phone centered via
  margin auto) so the parent-side preview looks like a real phone,
  not a misaligned scrollable container with default Chrome
  scrollbar.

- **Screen 07b Settings LOCKED + GRADUATED 2026-05-12.** Direction
  A (Linear-channeled) picked from 3-direction exploration file
  `mockups/archive/phase2-07b-settings.html` (A Linear-channeled dense
  inline-edit hairlines-only / B Stripe-channeled cards with profile
  photo prominence / C Notion-channeled narrow-stage pencil-edits).
  Skipped two-strand reference grid for this screen following the 06c
  precedent of going straight to directions when Steal anchors are
  already locked in `docs/layout-spec.md` (Linear / Stripe / Notion
  are the locked Steal targets for Section 7b). 720px stage,
  single-column scrollable, 36px gap between section blocks.
  Profile section: 48px circular photo slot (Lucide user icon
  Ink-faint stroke 1.75) with 1px Ink-faint top + bottom borders +
  "Upload" pill on the right; then Full name / Vet license / Email
  rows. Vet license surfaced ONLY here, never in `<VetByline />`
  per byline.md lock 2026-05-09. Email row uses italic Ink-faint
  "Not added" placeholder + "Add" pill verb instead of "Edit".
  Account section: read-only Phone row (no Edit pill = read-only,
  Linear pattern consistent with Screen 03 pet panel `pp-quick`
  rows; tied to auth identifier per layout-spec); EN/MR segmented
  pill toggle (active = Ink fill + Paper text, inactive =
  transparent + Ink-soft) with helper line "Changes labels and
  buttons in your dashboard. Broadcasts always ship to parents in
  both languages." (load-bearing copy disambiguating the toggle's
  scope from the per-Broadcast bilingual content lock). Clinic
  section: plain prose lines, no card chrome, no tinted background,
  no edit affordance (clinic info hard-coded in v0; clinic-edit
  ships v1+ when Pawkit goes multi-clinic with proper clinic-admin
  role). Satoshi 14pt clinic name + Inter 12pt Ink-soft address /
  GSTIN tabular / hours lines. Sign out: full-width Ink ghost
  button (Lucide log-out icon prefix), no Teal, one-Teal-per-screen
  rule honoured by rail Settings-active border alone. Pawkit v0.1
  vendor mark centred at the bottom below 1px Ink-faint top border
  is the ONLY place Pawkit-as-vendor appears in dashboard chrome
  (white-label discipline; Sagar's dashboard reads as his clinic's
  tool, not Pawkit's). Header search bar hidden on Settings route
  per Section 1 spec (Settings has no searchable content); empty
  middle column in chrome grid preserves wordmark-left / right-zone
  grid integrity. Directions B + C left as scratch reference in
  `phase2-07b-settings.html`. Graduated to
  `mockups/archive/admin-locked.html` as Section 07b with anatomy block +
  rendered frame; TOC updated (07b no longer pending);
  future-sections comment removed (all admin Phase 2 screens
  locked). Layout-spec Section 7b updated same turn with full
  dimension + visual treatment notes replacing the prior "deferred
  to Phase 2" stub.

- **One-Teal-per-screen rule interpretation locked 2026-05-12:
  SEMANTIC.** Earlier `dsr-callout` text at top of
  `mockups/archive/admin-locked.html` ("the single Teal element per route
  is the primary action OR the active rail item") was ambiguous
  about active-window indicators + step nav state Teals +
  decorative icons. Cluster cohesion check 2026-05-12 surfaced the
  ambiguity: Screen 03 has 3 Teal elements (rail active border +
  followup banner 4px Teal left bar + compose-send button), Screen
  06c had 8 Teal elements before fixes (rail + Confirm CTA + 2
  step nav done + 3 delivery channel icons + parent-app phone
  preview Share button). Three interpretations weighed: strict
  (every visible Teal pixel counts, exactly 1 per screen),
  semantic (one Teal element per semantic category per screen
  acceptable), action-only (Teal reserved only for primary
  actions; rail + active-window indicators exempt; everything else
  must go). **Locked: semantic.** Three Teal categories acceptable
  per screen: (a) route indicator = rail active 4px left border,
  every screen; (b) active-window indicator = 4px Teal left bar on
  follow-up window banners per Pet Page / admin pet panel locked
  anatomies; (c) primary action CTA = one per screen where
  present. Decorative reinforcement (delivery channel icons on
  Screen 06c) and step nav state Teals (done state in broadcast
  flow) are NOT counted as acceptable and must be recoloured.
  Parent-app renderings inside admin phone previews count toward
  the parent app's own Teal budget when those screens get audited,
  not the admin screen they're embedded in. Practical effect post
  cohesion-check fixes: Screens 01 / 02 / 04 / 05 / 07b =
  rail-only-Teal (1 semantic Teal); Screen 03 = rail + followup
  banner + compose-send = 3 semantic Teals; Screen 06 = rail +
  Next CTA = 2 semantic Teals (parent-app Share button inside
  phone preview not counted); Screen 06b = rail + Next CTA = 2;
  Screen 06c = rail + Confirm and Send = 2 (step nav done
  recoloured to Ink-soft; delivery channel icons recoloured to
  Ink). Dev-time invariant in `<TealCTA />` (Day 1 build) should
  count semantic Teal categories per screen, not raw Teal pixels.

- **TealCTA anatomy locked at mockup stage 2026-05-12.**
  > **SUPERSEDED 2026-05-14** at the mauve-only lock. The `<TealCTA />` /
  > `<BerryCTA />` shared component was dropped in favor of the shadcn
  > `<Button variant="default" size="cta">` primitive (40px tall, 24px
  > horizontal padding, Berry fill, 14px label) consumed directly across
  > surfaces. See `docs/critical-files.md` "Brand spine" section.

  Canonical
  spec: padding `12px 20px` (both on 8-value scale), border-radius
  `4px`, Inter 13pt 600 label, `8px` gap to icon, `14px`
  stroke-current icon. Inline-form variant (`.compose-send` in
  Screen 03 reply compose row) keeps explicit `height: 44px` for
  inline rhythm with the 44px compose field, padding `0 20px`,
  same anatomy otherwise. Mic button paired with compose-send
  shares the same `border-radius: 4px` via the
  `.compose-mic, .compose-send` shared rule (dropped from 6px to
  4px in this lock for compose-bar visual coherence). DSR
  reference buttons (`.dsr-btn-teal` / `.dsr-btn-ghost` /
  `.dsr-btn-disabled`) updated to match so documentation tracks
  rendered screens. Screen 06c's terminal commit "Confirm and
  Send" CTA normalized to 13pt font (was 14pt) and 14px icon
  (was 15px); semantic weight of terminal commit comes from label
  + paper-plane icon + 15s undo hint, not from font size.
  Supersedes Day 1 build TealCTA deferral per
  `docs/build-order.md` line 14; Day 1 build only needs to codify
  these values into the `<TealCTA />` shadcn component.
  Pressed / disabled / loading states still deferred to Day 1
  build implementation.

- **Pragmatic spacing-scale sweep scope locked 2026-05-12.**
  8-value scale (4/8/12/16/24/32/48/64) per
  `docs/premium-feel/spacing.md` governs **layout spacing**
  (stage paddings, section gaps, container margins, row paddings),
  NOT element-internal micro-padding (pill paddings like 4/10,
  input paddings like 7/10, button heights, card paddings 18/22
  used as card convention). Mockup-stage sweep normalized
  layout-spacing values only: broadcast flow stages aligned to
  `24px 32px 32px` (`.s6-split`, `.s6b-shell`, `.s6c-stage`);
  clinical history stage `.s5-stage` to `24px 32px 64px`;
  settings stage `.s7-stage` to `32px 32px 64px` with `32px`
  section gaps (`.s7-section`, `.s7-page-sub`). Row paddings
  already normalized to 12px 0 in the cohesion check pass.
  Off-scale element-internal values explicitly out of scope and
  stay deferred to Day 6 build-time sweep per
  `docs/build-order.md` line 71 if normalization needed at that
  point.

- **UX polish pass on live admin app 2026-05-13.** Second-opinion
  agent's 3-tier critique at
  `~/.claude/plans/just-look-at-the-generic-wombat.md` reviewed +
  executed against the rendered Next.js dashboard, not the static
  mockup. User-locked scope: Tier A1-A4 plus runtime vellum
  (no longer mockup-deferred since the build is live); Tier B1-B5
  plus subtab rename to "Awaiting reply / Replied"; Tier C1 plus
  skeleton anatomy plus empty-state copy retirement; skipped
  the ⌘K hint chip. Landed changes:
  - **Satoshi local font** via `next/font/local` (weights
    400/500/700 lifted from Fontshare CDN into
    `apps/dashboard/public/fonts/`). Supersedes the prior
    Fontshare CDN approach that blocked FCP. Day 6 build-order
    note about Satoshi wiring (originally "Day 6 polish") moved
    forward.
  - **Vellum SVG filter** runtime-applied. `<VellumFilter />`
    injected at the Shell level; `.vellum` CSS utility on
    eligible Paper card surfaces. Updates
    `docs/premium-feel/materials.md` from "deferred to Day 6
    build" to "runtime-applied via SVG filter ::before".
  - **Lucide stroke 1.5** sweep across all dashboard `.tsx`
    files. Honours the locked v0 override per
    `premium-feel/INDEX.md`.
  - **Type scale tokens** locked in Tailwind preset
    (xxs=10 / xs=11 / sm=12 / md=13 / base=14 / lg=15 / xl=17 /
    2xl=22 / 3xl=26 / display=48). Overrides Tailwind defaults
    so `text-xs` is 11px (Pawkit) not 12px (Tailwind). Spacing
    tokens `pk-1` through `pk-16` added.
  - **Inbox subtab voice change** Active → "Awaiting reply",
    Inactive → "Replied" (clinical-specific labeling; resolves
    the parked subtab-rename question from
    `~/.claude/plans/just-look-at-the-generic-wombat.md` Tier B
    2.1). Voice.md anchor table updated with new Do/Don't pair.
  - **Empty-state copy** retirement of "No open windows right
    now. Take a breath." (previously locked as the anchor
    warmer-for-vet's-eye example). Replaced with "Nothing
    awaiting reply." Voice.md retires the prior anchor; pattern
    flipped from "warmer for the vet's eye" to "matter-of-fact
    clinical queue state". Rationale: matches the renamed
    subtab vocabulary, reads as actionable not whimsical.
  - **Quick Facts signalment compression** in pet panel.
    Five-row stack (Breed / Age / Weight / Chronic / Last visit)
    collapsed to: 1-line signalment subline under pet name
    ("Golden Retriever · M · 4 years") + Weight row + Last visit
    row + dedicated Chronic callout. Matches top vet-tech idiom
    (ezyVet, Provet, Shepherd compress signalment as clinical
    handover shorthand). `signalment()` helper added to
    `apps/dashboard/lib/seed.ts`.
  - **Chronic callout pattern** applied: 4px Ink left bar +
    AlertCircle Lucide + small-caps "CHRONIC" label + condition
    name on Paper card. Replaces the prior hairline-row treatment.
    Matches the locked banner pattern from `docs/brand-system.md`
    depth-language section; reads as a clinical handover flag,
    not a generic data row.
  - **Inbox row unread/read state** added. `InboxThread.unread`
    flag drives weight + color (unread = 600 Ink, read = 500
    Ink-soft) + 6px Teal dot indicator next to timestamp on
    unread rows. Demo state: Rocky + Coco read, Misha + Bruno +
    Gabby unread (gives visible variation).
  - **Edited audit-trail marker** on SOAP byline. `SoapVisit.editedAgo`
    optional field renders as italic "· edited Nm ago" suffix
    after vet byline. Demo state: Gabby's May 6 visit card shows
    "edited 12m ago"; other cards stay clean. Adds the clinical
    audit-trail trust signal the second-opinion agent flagged as
    a vet-tech standard.
  - **Focus-visible discipline** global rule. 2px Teal outline at
    4px offset on every keyboard-focused interactive element;
    inputs 2px offset; browser default `outline: none` on plain
    `:focus`. Per the agent's Tier C1; locked here.
  - **Skeleton-load anatomy**. `<Skeleton>` + `<SkeletonCircle>`
    reusable components (Ink-faint 50% opacity, no shimmer per
    `docs/premium-feel/states.md`); `loading.tsx` Next.js
    Suspense boundary files added to inbox + thread + clinical +
    invoice routes. Anatomy locked at runtime, no longer deferred
    to Day 7 verification.

  Pending follow-ups: refine type-scale outliers if needed (4
  arbitrary values at 9 / 16 / 19 / 24px kept as locked exceptions
  per spec); MR review pass for renamed strings ("Awaiting reply"
  / "Replied" / "Nothing awaiting reply" need fresh Sarvam
  translations in the parent-app microcopy round).

- **UX polish pass second-audit corrections 2026-05-13.** After the
  first-pass landing, computed-style inspection showed the
  type-scale override hadn't reached Tailwind's compile (pet name
  rendering at 16px Tailwind-default instead of locked 14px;
  `text-md` an unknown class falling back to browser default).
  Root cause: the design-tokens preset's `theme.extend.fontSize`
  wasn't invalidating Next.js's JIT cache when changed
  cross-package. Fix: moved the fontSize override out of
  `packages/design-tokens/src/tailwind-preset.ts` into
  `apps/dashboard/tailwind.config.ts` directly (using
  `theme.fontSize` not `theme.extend.fontSize`), which guarantees
  app-level precedence + invalidates correctly on hot reload.

  Type scale (final, locked at dashboard config level):
  - xxs    10  small-caps section labels, wordmark line 2
  - xs     11  household subline, captions, helper
  - sm     12  timestamps, Ink-soft body, field labels
  - base   13  preview body, row content, default body
  - md     14  pet names, button labels, wordmark line 1, rail items, subtab labels
  - lg     17  compact display
  - 2xl    22  page titles (Satoshi)
  - 3xl    26  oversized callouts
  - display 48 hero count primary

  Note `text-base` = 13 (Pawkit) not 16 (Tailwind default). Most
  swept `text-base` ↔ `text-md` swaps needed across all dashboard
  `.tsx` files so swept classes produce the right locked-anatomy
  sizes under the new scale (sed 3-step swap with temp marker).

  **Inbox row anatomy second-audit fixes:**
  - Row height 56px (`h-14` + `items-center`, dropped `items-start
    py-4` which produced 81.2px rows).
  - Active subtab underline flipped to `bg-teal` (was `bg-ink`).
    Resolves the inconsistency between locked anatomy (Teal) and
    earlier mockup CSS comment ("2px Ink underline").
  - Unread teal-dot indicators dropped. Unread state now carries
    via weight + color contrast only: unread = pet name 14pt 600
    Ink + preview Ink full-weight; read = pet name 14pt 500
    Ink-soft + preview Ink-soft.
  - Household always renders `text-ink-soft` regardless of read
    state (was `text-ink-faint` on read variant per first pass).
  - Pet panel + rail child elements use canonical type tokens;
    rail items at `text-md` (14px) not `text-lg` (17px).

  **Teal budget commitment locked 2026-05-13.** On the Inbox
  surface specifically, semantic Teal categories used: (a) route
  indicator (rail active 4px border) + (b) active-subtab
  underline (2px Teal). Two semantic Teals; under the locked
  3-category budget (route + active-state + primary action).
  No primary action CTA on Inbox list, no per-row unread dots,
  no fur-token usage. Choice between "Ink subtab + Teal dots"
  (first-pass) and "Teal subtab + no dots" (second-pass)
  resolved in favor of the latter: locked subtab anatomy uses
  Teal as the canonical active-state signal; dropping per-row
  Teal dots keeps the budget clean + relies on weight/color
  contrast for unread, which the second-opinion plan
  characterizes as the cleaner pattern.

  **What this audit did NOT change (deliberate keeps):**
  - Vellum NOT applied to `main::before` or `ul::before` on the
    Inbox list route. Per `docs/premium-feel/materials.md` the
    eligible-surface list names "Inbox messages" (= conversation
    bubbles, already vellum'd) not "Inbox row container". The
    whole-screen Paper background is explicitly excluded.
    Whether to apply vellum to the inbox list `ul` for added
    handcraftedness is a discretionary call still ESCALATEd; if
    locked, update materials.md + apply.

- **Heuristic audit (Phase 2 final gate) completed 2026-05-12.**
  Nielsen 10 + Pawkit-specific 6 dimensions × 9 admin screens
  (126 audited cells; dimensions 4 + 14 handled by cohesion
  check). Zero FAILs, 4 ESCALATEs surfaced + resolved same turn:

  **ESC-3 + ESC-6 (vellum eligibility extension):** Day 6 vellum
  apply list extended to include clinical history visit cards
  (`.s5-card`) + Broadcast send confirmation cards
  (`.s6c-confirm-block`, `.s6c-confirm-channels`). Reason: same
  document-record surface semantic as invoice line items + Quick
  Facts rail (both already in eligible list). The Day 6 list was
  written 2026-05-04 era before Screen 05 was specced 2026-05-12,
  so this is oversight not deliberate exclusion. Broadcast send
  hero (`.s6c-confirm-hero`) stays excluded because it's
  Ink-on-Paper-inverted, not a Paper surface. Updated
  `docs/premium-feel/materials.md` + `docs/build-order.md`
  line 70.

  **ESC-4 (voice-input failure spec):** added "Voice input
  states" section to `docs/premium-feel/states.md`. Four failure
  modes covered: (a) Mic blocked → silent fallback to text +
  `mic-off` icon + Ink-soft caption "Mic blocked in browser
  settings"; (b) Network failure → 3s timeout → text fallback +
  Toast (per existing Error states) "Voice transcription
  unavailable"; (c) Low-confidence transcription (Sarvam
  confidence < ~0.6) → draft text with 1px Ink-faint dotted
  underline + caption "Tap to confirm or retype" (tap removes
  underline = confirms acceptance); (d) Silence detected (no
  audio for 4s) → "Didn't catch anything, try again" caption.
  Mic icon states: resting Ink-soft, listening Ink (NOT Teal,
  keeps one-Teal-per-screen budget clean) with 2px Ink pulse
  ring, blocked `mic-off` Ink-faint. Exact copy finalised in
  Phase 3 microcopy round. Reference added to
  `docs/layout-spec.md` Section 6 alongside the Sarvam mention.
  Rationale: voice input is load-bearing in-scope AI feature;
  failure modes are predictable; speccing now prevents Day 3
  build improvisation + rework cycle.

  **ESC-5 (Group B lazy-reveal anatomy refinement):** Direction
  C audience filter in Section 06b refined from
  "always-visible disabled Group B placeholder" to "lazy-reveal
  via '+ Add OR group' CTA centered below Group A." The
  disabled `.s6b-group.disabled` block + the `.s6b-group-conn`
  AND/OR pills between groups (~120-180px vertical chrome on
  every audience step) removed. Replaced with a single
  `.s6b-add-cond`-styled CTA wrapped in a centered
  `.s6b-add-or-group` container. Clicking promotes the CTA into
  a second Group B block with its own conditions + AND/OR
  connector pill between the two groups (dynamic state not in
  the static mockup). Rationale: matches Klaviyo / Mailchimp /
  HubSpot industry pattern (the named reference for Direction
  C); AMS broadcasts skew single-group (dogs OR cats, age range,
  exclude deceased); Group B is rare; vet learns the affordance
  once. Also brushes against the locked
  `feedback_no_hallucinated_chrome` rule (showing
  "infrastructure not yet activated" with a disabled block).
  Anatomy block in `mockups/archive/admin-locked.html` updated same
  turn: prior "Group connector" + "Second group" anatomy rows
  collapsed into one "Second group (optional)" row describing
  the lazy-reveal pattern.

  Pre-existing TBD re-flagged for continuity: Screen 05
  metadata pill taxonomy (Sick visit / Wellness / Vaccination /
  Otitis / Allergy as placeholders) still pending Phase 3
  microcopy round per `status.md` line 282-285. Not a new
  escalation; flagged so the copy revisit pass doesn't drop it.

  Audited NOW (mockup stage): static visual properties, info
  hierarchy, affordance discoverability, copy quality within
  Phase 2 constraints, one-Teal / fur-token rules,
  hallucinated-chrome catches, plain-language match,
  back/undo/cancel paths specced. Deferred to build-time
  (consistent across screens): loading skeleton renders, error
  state renders, motion timings, vellum filter application,
  full MR translation render, haptics (admin has none).

  **Phase 2 admin: DONE.** Next gate per locked sequence:
  Phase 3 microcopy round (EN + MR, ~30 system message
  templates, Marathi native-speaker review) → Phase 4 admin
  build.

## Tech stack
- **Dashboard:** Next.js 14+ app router plus Tailwind plus **shadcn/ui** with neutrals
  overridden to map to Pawkit Ink/Canvas tokens.
- **Pet-parent app:** Expo SDK 54 plus **NativeWind 4** plus **React Native Reusables**.
  React 19.1, RN 0.81.5, Reanimated 4 (worklets babel plugin auto-applied by
  `babel-preset-expo`), New Architecture on, `react-native-worklets` pinned to
  `0.5.1` to match Expo Go SDK 54's bundled native ABI on the dev phone AND
  the EAS preview profile's native ABI in the release APK shipped to the
  demo phone. Both delivery paths share the SDK 54 + RN 0.81 ABI lock.
- **Match runtime:** on-device fur-match for v0 in both apps via shared
  `packages/match-logic`. Pure-function contract `resolveFurMatch(photo)` returns
  `{ primary, secondary?, isAutoPair, isTwoTone, confidence }`. Server migration
  deferred.
- **Token sharing:** monorepo with shared packages (pnpm workspaces plus Turborepo).
  One source of truth for colours and `resolveFurMatch`.

## Communication and AI features
- **In-app messaging only.** No WhatsApp / AiSensy in v0. `channel` column built
  channel-agnostic for v1.
- **Asymmetric chat attachments.** Parent-side messages may attach photos or
  videos (videos added 2026-05-08). Vet-side messages remain text-only. No
  audio bubbles, no voice messages on either side. Voice INPUT on dashboard
  compose surfaces (Sarvam transcription) outputs text, not a voice attachment.
- **Video cap: 60 seconds and 50 MB (locked 2026-05-08).** Parent app
  surfaces the cap on the attach surface before upload begins (final
  microcopy in microcopy round). Implementation: `expo-image-picker` with
  `videoMaxDuration: 60` AND `videoQuality: '720p'` for in-app recording
  (yields ~5-15 MB at 720p H.264; eliminates need for on-device compression
  library). Gallery-picked videos run a post-pick check on both duration
  (>60s rejected) and size (>50 MB rejected with "please record a new
  video" message). No on-device compression library in v0. Server-side
  compression deferred to v1+ (see `docs/risk-register.md` item 9).
- **Video player (locked 2026-05-08).** Dashboard uses native HTML5
  `<video controls>`; parent app uses `expo-video` (Expo's modern video
  player). No third-party player library on either side (no `video.js`, no
  `plyr`, no `react-player`). Both render inside a custom inline overlay
  scoped to the thread panel container (NOT a viewport-modal Dialog).
  Player chrome is the platform-native controls; overlay shell is Pawkit
  Paper card with 1.5px Ink border and no shadow per material discipline.
  Two components: `<VideoBubble />` (first-frame thumbnail plus Lucide Play
  overlay rendered in the thread) and `<InlineVideoOverlay />` (the popup
  shell that wraps the platform player). Dismiss via backdrop click, X
  button, or Escape.
- **No incoming messages outside an open follow-up window** on the parent side. The
  parent app has no "Message clinic" button, no "Ask a question" affordance, no
  parent-initiated cold thread anywhere. Inside an open window, parents reply within
  the window's vet-initiated thread. Outside the window, the parent app shows
  graceful redirect copy: "AMS is walk-in only. Visit 9am to 9pm Mon-Sat. For urgent
  issues, call [clinic number]." This is the structural answer to why Pawp / AirVet /
  FirstVet failed; "message your vet anytime" destroyed the founding vet.
- **Admin inbox structure (locked 2026-05-06; restructured 2026-05-11 with
  Active/Inactive subtabs).** No classifier, no drafted replies, no logistics
  or feedback buckets (incoming messages only exist inside open follow-up
  windows, every message is clinical follow-up by virtue of being in the
  window). Inbox has **two subtabs**: **Active** (threads where the parent's
  last message awaits the vet's reply; tab label shows the count of pending
  threads; sorted oldest-waiting at top) and **Inactive** (threads the vet
  has already replied to; sorted by latest message; closed-window threads
  remain in Inactive indefinitely rather than leaving the inbox). On send,
  a thread moves Active → Inactive; if the parent replies again within the
  open follow-up window, the thread re-enters Active. Each thread opens
  with full pet medical context already on screen.
- **AI scope (locked, ONE thing only):**
  1. **Sarvam Audio (with Whisper fallback for English)** transcribes voice **input**
     to text on dashboard compose surfaces (Broadcast body and structured-section
     fields, inbox reply). Voice is INPUT only; the output is always text Sagar
     reviews and edits.
- **No Sonnet Broadcast drafting.** Sagar's voice stays his.
- **No Haiku classifier** (removed 2026-05-06 alongside the bucket decision; nothing
  to route to).
- **No AI-drafted replies** of any kind. Sagar hand-writes every clinical reply with
  voice-input transcription support only.
- **AI Triage permanently cancelled (locked 2026-05-06).** Pawkit ships no triage
  flow on either side. Not deferred, not vet-side-only, not pending validation. The
  diagnostic-routing opportunity becomes a separate company / product with its own
  clinical validation arc, its own go-to-market, and its own moat. It may or may not
  integrate with Pawkit later. No clinical decisions, no triage UI, no four-output
  decision tree, no red-flag detection, no symptom checker, no AI photo triage, no
  parent-facing conversational clinical AI of any kind.

## Demo anchor (Fernandes household)
- **Raffy** is a male dog, deceased (yellow Lab assumption).
- **Gabby** is a male dog, alive (Golden Retriever). Live fur-match showcase pet.
- **Angel** is a female cat, alive (white Persian). Pre-rendered Milk+Vanilla
  auto-pair.
- **Galaxy** is a female cat, alive (species/breed/coat photo-determined).
- **All pet matches are photo-determined,** not pre-decided. Day 3 of build runs all
  four photos through the algorithm; results lock in. Day 7 hand-tuning may override
  if a result feels emotionally wrong.
- **Raffy's memorial card preserves his fur-match gradient** with a deceased treatment
  overlay (60% opacity, Heart icon replacing status pill).
- **Hand-crafted demo state:** Gabby's recent visit creates an open follow-up window
  with one un-replied parent message visible in clinic inbox ("Gabby's still limping
  a bit"). Angel has a vaccination reminder due in 3 days. The pitch in scene 2 of
  `docs/demo-choreography.md` rests on the bounded-window architecture made visible
  ("2 days left, 1 unreplied"), not on classifier buckets.

## Fur-match scope in v0
- **Brand position:** secondary visual delight. NOT the hero. NOT the demo wow.
  NOT the screenshottable moment. NOT the centerpiece. (User has corrected this
  framing twice; locked 2026-05-06.)
- **Demo position:** a moment of delight in the parent app, demonstrable during
  the demo. The demo's emotional center is the Pet Page steady-state, not this.
- **Full three-state upload flow** plus override picker bottom sheet plus all four
  match rules (solo, two-tone, white auto-pair Milk to Vanilla, black auto-pair Sable
  to Bark) ship in v0 on the pet-parent app.
- **Three-state Transformed refinement (locked 2026-05-10).** Previously the
  Transformed state showed a full Honey-to-Peach gradient cover that the
  parent never actually sees in steady-state (the locked Pet Page cover is
  real photo plus 10px accent stripe, see brand v1.3 lock). The Transformed
  state now **mirrors the steady-state**: real photo at 280px, 10px Honey
  accent border draws in with a small animation (`ease-decelerate`, ~600ms
  per `docs/premium-feel/motion.md`), magic toast in a Paper card with
  1.5px Ink border surfaces as the only ephemeral overlay (Spectral italic
  pet name + Inter line "Honey + Peach &middot; A palette as unique as she
  is." as the locked working draft, final EN + MR microcopy in microcopy
  round). Toast dismisses in 4-5 seconds (`ease-emphasised`), page
  resolves into the locked steady-state Pet Page (Screen 02). Override
  picker (Screen 04) is reachable from the toast for the one-time moment
  AND from Per-pet Settings (Screen 13) any time after. Empty and
  Sampling states unchanged.
- **Where fur-match output threads through the app (clarified 2026-05-10):**
  per-pet algorithm result drives the avatar fur-match ring on every pet
  representation (Pets tab list, Inbox per-pet rows, master Settings Pets
  section), the Pet Page 10px bottom accent border, the memorial card for
  deceased pets (preserved gradient at 60% opacity with Heart icon),
  and the Sable cover during the Sampling state itself. Brand-level
  artefacts derived from one specific match and frozen: the Pawkit app
  icon (Honey to Peach is Gabby's actual fur-match result, frozen as the
  brand signature for every install) and the splash screen extending
  that same gradient. The icon and splash are NOT generated per
  household; per-pet personalization is exclusively inside the app.

## Brand v1.3 (locked May 4)

> **SUPERSEDED 2026-05-14** by the mauve-only v1.4 lock (Boysenberry
> `#9C2B5C` saturation-lifted from `#823159` on 2026-05-15 evening +
> canvas `#F8F7F5` + rail-tint `#EFE6E8` ground + Inter body+display +
> Lora italic for pet names + Phosphor icon kit). The v1.3 Teal / Paper
> / Satoshi / Spectral / Lucide stack is dead. The "one Teal per screen"
> budget was relaxed. Content below is preserved as design history; see
> `docs/brand-system.md` banner for the current spec.

- **Hero colour:** Deep Teal `#006D6F`. Primary CTAs, online dots, key tags, brand
  mark. **One Teal per screen.** Never decorative, never fur, never background.
  **Filled Teal CTAs render border-less.** Teal grounds itself.
- **Pet name typography:** Spectral semibold italic, 24-36pt, in **four hero contexts
  only:** Pet Profile cover, Broadcast personalisation, magic-toast pet name reveal,
  memorial card. Never used elsewhere.
- **Pet Page as Hero:** the per-pet profile (steady-state Pet Page) is the brand
  hero of the parent app AND the emotional center of the demo. Fur-match
  three-state is a secondary moment of delight inside the parent app, not the wow,
  not the hero, not the centerpiece.
- **Pet Page cover treatment (locked 2026-05-08).** Full-bleed real pet photo at
  280px, 4:5 portrait, soft window light, +10 warmth -5 saturation per
  `docs/premium-feel/photography.md`. Bottom edge of the cover carries a
  **10px** fur-token accent border in the pet's algorithm-derived primary fur
  colour (Gabby gets Honey, Angel gets Milk, Galaxy whatever her photo
  determines, etc.). The accent border is the only fur-match ambient signal on
  the steady-state Pet Page. A subtle bottom vignette grades into the Paper
  body so the Spectral italic pet name reads cleanly. No other chrome on the
  page carries fur tokens (see fur kit discipline below).
- **Fur kit discipline (hardened 2026-05-08).** Fur tokens (the 10 named pet
  colours) are used ONLY on pet content surfaces: the Pet Page cover photo
  border, the avatar ring, the fur-match three-state flow, the deceased
  memorial gradient, the Pet Page colour-badge button. Fur tokens are NEVER
  used in chrome (tabs, banners, status pills, navigation, alert dots, error
  borders, anywhere structural). The previous "Peach as alert dot" carve-out
  is removed. Alerts use Ink plus a Lucide alert icon for signal; no colour
  distinguishes alert from non-alert chrome.
- **Empty pet profile cover:** Ink-faint `#A8A39E` with diagonal-stripe placeholder.
  Not Vanilla, not any fur token. Same applies to Empty Broadcast cover.
- **Sable as Sampling-state cover** stays. The only fur-token-as-cover that survives,
  because that moment is genuinely about fur.

## Premium Feel System Branch B (locked May 4)
9 disciplines in scope for v0. Full specs split across `docs/premium-feel/`.

1. **Motion.** 3 easings (`ease-emphasised` / `ease-standard` / `ease-decelerate`)
   plus 5 durations (50/150/250/400/800ms). 60fps on mid-range Android via
   Reanimated 4.
2. **Photography.** 4:5 portrait, soft window light camera-left at 45°, 4-6pm Pune
   light, +10 warmth -5 saturation. Pexels-curated 200 synthetics plus Fernandes
   shoot.
3. **Voice and microcopy.** Flesch-Kincaid grade 5 (parent app, low-literacy
   assistant test) / grade 8 (dashboard). Do/don't matrix. Marathi non-literal mirror
   with native review.
4. **States.** Per-screen loading skeletons (no shimmer), empty grammar (Satoshi
   italic single sentence), 3 error types (inline, banner, toast; never red, never
   any fur token; alert signal is 4px Ink left bar plus Lucide alert icon prefix
   in the headline), offline banner with on-device fur-match still working.
5. **Haptics (parent app).** `expo-haptics` pattern map. Replaces audio cues v0
   doesn't have.
6. **First-run assets.** Direction C app icon (Spectral italic "P" on the
   Honey-to-Peach brand gradient), splash screen extends the same gradient,
   PWA manifest theme matches. The Honey-to-Peach palette is **frozen as the
   Pawkit brand signature for every install**; it is NOT generated per
   household. Provenance: it was derived by running the fur-match algorithm
   on a real pet's photo (Gabby's), not picked in Figma. Per-pet
   personalization happens inside the app (avatar rings, Pet Page accent
   borders, memorial cards), not at the icon or splash.
7. **Vet byline component.** `<VetByline />` 3 variants (compact / full / centre).
   Editorial magazine byline, not profile chip.
8. **Spacing rhythm.** 8-value scale `4·8·12·16·24·32·48·64`. Spectral italic +2px
   ascent compensation in hero contexts.
9. **Materials (vellum + depth language).** Vellum SVG filter on every Paper card
   surface. Depth by border weight (1.5px Ink primary / 1px Ink-soft structural / 0
   background). No shadows ever.

Items 10 (custom iconography), 11 (onboarding ceremony Lottie), 12 (performance
perception polish) deferred to v0.1.

## Design tooling
- **Figma path abandoned.** HTML mockups in `mockups/` plus brand docs are the design
  source of truth. Sagar sees real running code on phones, not Figma.

## Typography (v1.3)

> **SUPERSEDED 2026-05-15 evening.** Satoshi (display) was removed because
> it read as "circus" on KPIs at 22-26px. Spectral italic (pet-name hero)
> was replaced by Lora italic 600 because Spectral read as too harsh. DM
> Sans interlude was killed earlier the same day. Current stack: Inter
> body + display, Lora italic 600 for pet names in hero contexts only,
> Noto Sans Devanagari for Marathi. See "Font stack — Inter + Lora" entry
> at the top of this file.

- **Body:** Inter, 14-16px. Excellent Devanagari fallback for Marathi.
- **Display and headlines:** Satoshi (Fontshare, free), 28-40px **Bold (700)**.
  Satoshi ships Light/Regular/Medium/Bold/Black only; no Semibold.
- **Pet name (hero contexts only):** Spectral (Google Fonts, free), semibold italic,
  24-36pt.
- **Numbers:** Inter tabular-nums everywhere (invoices, Broadcast audience counts, timestamps,
  ages, durations). Western numerals only, both languages.
- **Marathi fallback:** Noto Sans Devanagari (Inter and Satoshi don't fully cover
  Devanagari).
- **AMS wordmark:** Satoshi Bold, "Animal Medical Services" plus "Pune" in Inter
  small caps below. Type-only, no logomark.

## Illustration and imagery
- **Lucide icons** (`lucide-react` web, `lucide-react-native` Expo) for all UI
  iconography.
- **Real photography for pet content.** Fernandes 4 plus Pune-grounded stock (Pexels
  curated plus Stanford Dogs research subset) for the synthetic 200-patient
  population.
- **Custom hand-authored SVGs** for the fur-match transformation moment only:
  sparkles (slightly imperfect, NOT lucide), Teal scan-line, chip-glow.
- **Lottie animations** for onboarding plus app-loading chrome only. NOT in main app
  surfaces (real pet photos own that territory). Abstract/geometric, not cartoony.
- **No illustrated pets** anywhere; pet identity is photographic.

## Bilingual UX
- **Full bilingual EN + Marathi as a parent-app-wide preference (locked
  2026-05-09).** Selection mechanism: auto-detect from the device locale at
  first launch, with override available in Settings. The preference governs
  both body content (Broadcast text, system messages, reminders) AND chrome
  (section headers, button labels, "Read", vet byline, tab labels,
  navigation). No per-Broadcast, per-screen, or per-message persistent
  toggle; the per-card alt-language affordance on Broadcast cards is a
  body-only momentary peek (not a chrome switch). No language prioritised.
- **Numerals stay Western** in both modes (most Indian users read Western numerals
  natively).
- **Translation pipeline:** every user-facing string keyed; English source first,
  DeepL or Google Translate API drafts Marathi, user reviews. Free translator only.
- **i18n libraries:** `next-intl` (Next.js dashboard), `expo-localization` plus
  `i18n-js` (Expo parent app).

## Parent app (locked May 2)
- **No phone OTP / Step 1 in v0 onboarding.** 2 steps: household name (optional,
  default 'Your household') plus first pet (5 fields all required: name, species,
  breed, gender, birthday-or-age; NO photo).
- **6-tab parent nav, icon-only (locked 2026-05-09; was 5-tab + text labels
  through 2026-05-08; tab name renamed to Broadcasts 2026-05-11).**
  > **SUPERSEDED 2026-05-16** by "Parent nav reduced to 5 tabs + Settings
  > behind avatar pill" at the top of this file. The 5-tab structure
  > (Broadcasts / Community / Pets / Inbox / Shop) is current; Settings
  > moved out of the bottom nav. Icon kit also changed: Lucide → Phosphor
  > filled (locked 2026-05-15 evening; see "Icons: Phosphor filled, Lucide
  > removed"). The original 6-tab content below is preserved as design
  > history.

  Order: **Broadcasts / Community / Pets (default landing) / Inbox /
  Shop / Settings.** Pets is the home anchor; Inbox holds per-pet 1:1
  threads; Broadcasts is the clinic-wide one-way vet feed; Community
  and Shop are dummy tabs in v0 carrying pitchable V3/V4 teaser content
  (Community = pet-parent groups / AMA / lost-and-found / verified
  reviews; Shop = clinically-curated marketplace, therapeutic diets /
  pharma / supplements / insurance); Settings is the master account
  screen plus the per-pet sub-screen entry point. **Tabs render icons
  only, no text labels** (locked 2026-05-09). Active state: icon Ink +
  stroke-width 2. Inactive: icon Ink-faint + stroke-width 1.75.
  Aria-labels carry the role for screen readers. Active-tab background
  never uses Teal (one-Teal-per-screen + chrome discipline). Lucide tab
  icons: `megaphone` (Broadcasts), `users-round` (Community),
  `paw-print` (Pets), `mail` (Inbox), `shopping-bag` (Shop), `settings`
  (Settings). No Invoices tab (invoices are per-pet inside Pet Page;
  see Pet Page composition lock).
- **Inbox tab is per-pet threads only (locked 2026-05-08).** One row per
  living pet in the household. Each row shows the pet's avatar (with
  fur-match ring), the pet's name, the last message snippet or system
  reminder text, the timestamp, and a 6px Teal dot if there's an unreplied
  parent-side message inside an active follow-up window. Pets with no
  thread history show the row with empty-state subline ("No conversations
  yet"). Deceased pets (e.g., Raffy) are removed from the Inbox list once
  marked deceased; their past messages remain viewable from their memorial
  Pet Page. Tap row → that pet's thread detail.
- **Broadcasts tab (locked 2026-05-08 as Announcements; tab + content type
  renamed to Broadcasts 2026-05-11).** Clinic-wide one-way feed of
  Broadcast cards, chronological. Each card carries vet avatar + clinic
  name + body in selected language + per-card EN/MR toggle + timestamp +
  6px Teal unread dot. Card render is the same whether the Broadcast is
  short-form (one-line clinic notice) or multi-section structured
  (educational content); long Broadcasts show body preview only and open
  the reading view on tap. All household members of all the parent's
  pets see the same Broadcasts feed (clinic-wide, not pet-scoped, until
  audience filter on the Broadcast narrows it). Composer disabled (one-way).
- **Broadcasts are the only content type the vet pushes to parents
  (locked 2026-05-10).** Replaces the prior broadcast/Kit split. Vet
  composes a Broadcast at any shape from one-line to multi-section.
  Discovery in-app: push notification on publish + the Broadcasts tab
  card. No catalogue, no separate Broadcasts list outside the tab, no
  pet-profile suggestions, no per-pet Broadcast surfacing.
- **Per-pet reminders (locked 2026-05-08; restructured 2026-05-10).**
  Automated reminders (e.g. "Angel's DHPPi+L4 booster due 12 May") live in
  the new `pet_reminders` table (see Schema Patch 10) and surface in four
  places: (1) **Pet Page Reminder banner** above the tabs (Lucide `Bell` or
  `Calendar` icon in Ink, Inter 12pt, Ink-soft body) deep-linking to the
  relevant Vaccinations or Timeline tab; (2) **per-pet inbox thread** as a
  centered system reminder card rendered inline alongside conversational
  bubbles, no reply UI on the card itself (the thread renderer reads from
  both `messages` and `pet_reminders` and merges chronologically by
  timestamp); (3) **push notification** on insert, deep-linking to the
  same Pet Page; (4) **WhatsApp** in v1+ when the WhatsApp integration
  lands (not in v0). Acting on a reminder is still a clinic walk-in; no
  in-app reply path on the reminder itself.
- **Community tab dummy (v0; teaser surface, locked 2026-05-08).** Tab is
  navigable in v0 but renders a teaser screen explaining the V3+ Pawkit
  Plus social layer: pet-parent city circles, breed groups, AMA threads,
  lost-and-found, verified clinic reviews. Pitch surface for Engine 2 of
  the three-engine ARR model during the demo. Lucide `users-round` tab
  icon.
- **Shop tab dummy (v0; teaser surface, locked 2026-05-08).** Tab is
  navigable in v0 but renders a teaser screen explaining the V4
  clinically-curated marketplace: therapeutic diets, pharma, hygiene,
  supplements with clinical evidence, insurance, narrowly-defined
  enrichment items. Pitch surface for Engine 3 of the three-engine ARR
  model during the demo. Lucide `shopping-bag` tab icon.
- **Photos or videos** as attachments on parent-side messages (videos locked
  2026-05-08). Vet-side messages remain text-only. NO voice on either side.
- **`pets.clinical_lock`:** once clinical records exist for a pet, name/breed/sex/age
  fields lock; no parent-side edit. Photo and avatar remain editable. Schema patch 6.
- **Server-side per-user read state on Broadcasts.** `broadcasts_read` join
  table (introduced under the same name in Schema patch 7 for the old
  pre-unification broadcasts table, renamed to `health_kits_read` in
  Schema patch 10 when the old broadcasts collapsed, renamed to
  `announcements_read` in Schema patch 11, renamed back to `broadcasts_read`
  in Schema patch 12).
- **Override picker two-tone toggle hidden under "More options" chevron.** Most
  parents only need solo tone.
- **Multi-pet UI:** Pets tab is a vertical list view (one row per pet).
  Inbox tab is also a vertical list (one row per pet's thread, locked
  2026-05-08). Invoices is now per-pet inside Pet Page (no top-level
  Invoices tab; no chip-strip filter needed). Multi-pet handling fully
  resolved.
- **Pets tab structure + Add subsequent pet flow (locked 2026-05-08).** Pets
  tab is a vertical list view, one row per pet showing the pet's avatar (with
  fur-match-derived ring), the pet's name in Inter (NOT Spectral; Spectral
  remains restricted to its 4 hero contexts), species/breed/age subline in
  Ink-soft, and a 6px Teal indicator dot if the pet has an open follow-up
  window. Tap row navigates to that pet's steady-state Pet Page. Deceased
  pets (Raffy) render at 60% opacity with Heart icon replacing the
  open-window dot, per the locked deceased pet treatment. Sticky-bottom Teal
  CTA labelled "Add a pet" with a Lucide `Plus` icon prefix is the only
  entry point for adding subsequent pets post-onboarding. Tapping the CTA
  opens a form identical to Onboarding Step 2 (5 required fields: name,
  species, breed, gender, birthday-or-age; no photo at this step). Submit
  creates the pet record and navigates to the new pet's empty Pet Page
  (Screen 9 State A), where photo upload triggers the three-state fur-match
  flow. The form is implemented as a shared `<PetIdentityForm />` component
  reused by both Onboarding Step 2 and this flow.
- **Invoice screen: Download PDF only.** No Send-to-family, no Pay now.
- **Invoices live per-pet inside Pet Page (locked 2026-05-08).** No top-level
  Invoices tab. Each pet's Pet Page has an Invoices tab that lists that
  pet's invoices chronologically. Tap an invoice → reading view (Total,
  line items, Download PDF only).
- **Pet Page tabs (locked 2026-05-08): Timeline / Vaccinations / Invoices.**
  Was Timeline / Visits / Vaccinations / Notes. Visits collapse into
  Timeline (one tab); Notes folds into Timeline rows (vet's clinical notes
  per visit appear inline in each Timeline row, no separate tab); Invoices
  added (moved from former top-level tab).
- **Pet Page homepage quick link to inbox thread (locked 2026-05-08;
  two-row banner spec refined 2026-05-09).** When there's an active
  follow-up window, the open-window banner doubles as the thread quick
  link (tap → that pet's thread detail). The banner renders as a
  **two-row card**: row 1 is the editorial Spectral italic context line
  (e.g. "Dr Sagar is here for Gabby until 2 May."); row 2 is an explicit
  CTA line in **Inter 12pt semibold Ink reading "Open thread &rsaquo;"
  with a Lucide ChevronRight (14px, Ink, stroke-width 2)**. The whole
  card stays the press target; the explicit CTA line removes any
  ambiguity that the banner is a link (the chevron-alone affordance
  read as too subtle in real-device testing). When the window is
  closed, the banner is replaced by an Ink-soft Inter 12pt link "View
  past conversations with Dr Sagar &rsaquo;" below the byline (no Teal
  accent, ChevronRight Ink-soft 14px), which renders only if past
  messages exist for this pet. When neither has happened, both surfaces
  are hidden.
- **Parent inbox: vet-only initiator.** No parent-initiated cold threads.
- **Closed-thread redirect visual (locked 2026-05-09).** When the parent
  opens a thread whose follow-up window has closed, past message history
  remains scrollable above where the compose surface used to be, and the
  compose surface itself is replaced by an empty-state Paper card. Card
  composition: Spectral italic line "AMS is walk-in only.", Inter regular
  subline "Visit 9am to 9pm, Monday to Saturday.", a 1px Ink-faint
  divider, then a centred row with Lucide PhoneCall icon (Ink) plus the
  clinic phone number underlined in Ink (tappable `tel:` link in the live
  app). No text input, no attach button, no mic button, no "Message
  clinic" CTA. System reminders inside the closed thread surface as Paper
  cards with Lucide Bell prefix in Ink (no Teal accent, no left bar; not
  alerts; tapping does NOT unlock messaging). The "Follow-up window
  closed · [date]" inline divider marks the transition between
  conversational period and system-only period. Reachable from two entry
  points: Inbox row tap (closed-state row) AND Pet Page "View past
  conversations with Dr Sagar" link when window is closed. Final EN + MR
  microcopy strings deferred to microcopy round (open-issues 7-9). Visual
  reference: `mockups/parent-v1.3.html` Screen 11.
- **No active marketplace surface in v0 (locked 2026-05-09).** Only the
  Shop teaser tab (V4+ pitch surface) renders inside the parent app. No
  transactions, no SKU list, no cart, no checkout, no affiliate flows. The
  marketplace as Engine 3 of the three-engine ARR model is sold via the
  teaser screen during the live demo, not via product surface in v0.
- **Master Settings (Settings tab, locked 2026-05-09).** Reached via the
  6th bottom-nav tab. Sections in order: Account (Phone number read-only;
  Household name editable inline with chevron-right; Language preference
  EN/MR segmented toggle as the master override for the bilingual lock),
  Pets (one row per living pet with fur-match-ring avatar plus chevron,
  tap navigates to that pet's Per-pet Settings sub-screen), Notifications
  (single push on/off toggle; no per-pet or per-type granularity in v0),
  About (version line plus clinic affiliation in Ink-faint centered).
  Sign out is a full-width ghost button at the bottom (Ink border + Ink
  text + no Teal); tap shows confirmation flow (microcopy in microcopy
  round). Visual treatment per spec: section labels Inter 9pt small caps
  Ink-soft + 0.14em letter-spacing; rows on Paper cards with 1.5px Ink
  border + 8px radius and 1px Ink-faint dividers between rows; each row
  56-64px tall. Visual reference: `mockups/parent-v1.3.html` Screen 12.
- **Per-pet Settings sub-screen (locked 2026-05-09).** Pet-level mutables
  edited here: Photo (current 4:5 thumbnail with 5px Honey accent border;
  "Change photo" ghost button opens camera/gallery picker; replacing the
  photo automatically re-runs fur-match), Fur match (current primary +
  secondary swatches, "Re-run match" Teal CTA as the screen's one Teal,
  "Override" ghost button opens the existing override picker bottom
  sheet), Patient since (adoption year editable inline with chevron, year
  picker on tap), Identity read-only (Name + Breed + Sex + Birthday
  rendered with Ink-soft labels + Ink values; locked because
  `pets.clinical_lock` trips once clinical records exist; italic
  footnote explains why). **Two entry points to this screen:** small
  Lucide Settings icon (18px, Ink-soft, stroke-width 1.75) **inline with
  the pet name row on the Pet Page body, right-aligned, no pill
  background** (refined 2026-05-09 from a cover-pill version that read
  as too chunky and dropped chrome onto the editorial photo; the photo
  is the brand hero, chrome stays off it); 32px Pressable hit area for
  accessibility. AND the Pets section row on master Settings (Screen
  12). Visual reference: `mockups/parent-v1.3.html` Screen 13.
- **Settings deferred to v1+ (recorded 2026-05-09; do not reintroduce in
  v0):** per-pet or per-type notification granularity (mute one pet's
  reminders, separate channels for Sagar vs system); privacy / data
  export / account deletion; add-household-member or multi-user invites
  at the household or pet level; help / FAQ / contact surface (the
  closed-thread redirect carries clinic phone for v0); theme / dark mode;
  pet-level edits surfaced in master Settings (those live on Per-pet
  Settings only); memorial-mode editing for deceased pets; mark-deceased
  toggle from Per-pet Settings; delete-pet-record action from anywhere.

## Broadcasts (unified content type, locked 2026-05-10)
- **Single content type from the vet to parents.** Replaces the prior
  broadcast/Kit split (old `broadcasts` table dropped in Schema Patch 10;
  `health_kits` renamed to `announcements` in Patch 11, renamed again to
  `broadcasts` in Patch 12). A Broadcast can be a one-line clinic notice
  ("Closed Monday for staff training") or a multi-section educational
  piece ("How to care for your dog in summer"). Shape is variable; vet
  decides how much to fill at compose time.
- **Naming is "Broadcast" everywhere (locked 2026-05-11).** Tab and
  content type share the name. Reasoning: the Lucide `megaphone` tab
  icon fits broadcast semantics naturally; "broadcast" implies one-way
  (the locked discipline); both short notices and long educational
  pieces fit comfortably (real-world precedent: TV broadcasts cover both
  news flashes and long-form documentaries). Backend table is
  `broadcasts`; user-facing label is "Broadcast"; public URL is
  `pawkit.app/broadcasts/[slug]`.
- **Required minimum on every Broadcast:** `title_en` + `title_mr` +
  `body_en` + `body_mr`. All other structured sections optional.
- **Optional structured sections:** `cover_image_url` (Ink-faint placeholder
  if absent), `key_points` (jsonb), `warning_signs`, `escalation`. Each
  section the vet fills must be bilingual EN + MR (publish hard-block on
  any partially-filled section). See Schema Patch 9 + Patch 10 + Patch 11
  + Patch 12.
- **Audience.** Defaults to all parents in the clinic-household
  relationship. Optional filter on species, age range, exclude_deceased
  toggle. Audience filter lives on the Broadcast row (`audience_filter`
  jsonb).
- **Universal sharability.** Every Broadcast gets a `public_slug` and a
  public Next.js route at `pawkit.app/broadcasts/[slug]`. Recipients
  without Pawkit installed can read on the public web. `share_count`
  tracked per Broadcast. Sharability is not gated by long-form: a one-line
  "Closed Monday" Broadcast gets a public URL too.
- **In-app discovery (locked 2026-05-10):** push notification on publish +
  a card in the parent's Broadcasts tab. No catalogue, no per-pet
  Broadcast surfacing. Tap card → reading view.
- **Reading view CTA:** Share button (WhatsApp / Social / Email).
- **One-way to parents** (no reply path; no comment, no reaction).
- **Pricing dropped** for v0. v1+ extension via re-added nullable
  `price_inr`.
- **Pre-seeded Broadcasts in v0 (6 mixed-shape):** three educational
  long-form ("How to care for your dog in summer", "Monsoon tick prevention
  basics", "Vaccination schedule for your puppy") + three short-form clinic
  notices (exact short-form titles to be locked in microcopy round;
  placeholder examples: "Closed Monday for staff training", "Annual rabies
  drive Saturday", "Monsoon walk-in hours adjusted").
- **Bilingual authoring (locked 2026-05-09; scope unchanged 2026-05-11).**
  The vet authors every Broadcast in EN AND MR; both required for every
  section that exists. Dashboard composer renders side-by-side EN/MR text
  fields per section. Hard block on publish if any present section is
  missing one language. Sarvam Audio covers Marathi voice-input; Whisper
  fallback for English. No machine translation in v0.
- **Bilingual rendering (locked 2026-05-09; scope unchanged 2026-05-11).**
  Parent reads each Broadcast in their selected language per the whole-app
  preference (see Bilingual UX). No per-Broadcast persistent toggle on the
  reading view. Fallback: legacy Broadcast with only EN content shows EN
  with a small Ink-soft "Translation pending" note above the body.
- **Vet byline format on reading view (locked 2026-05-09).** "Dr Sagar
  Bhongale" (line 1) over "Animal Medical Services" (line 2). The byline
  carries clinic affiliation, not credentials list. Same name + clinic
  format applies across all byline surfaces (Pet Page cover, Inbox row
  meta, thread header, Broadcast cards, Broadcast reading view); see
  `docs/premium-feel/byline.md` for component spec.

## Notifications (locked 2026-05-10)
- **No Sagar-side push notifications in v0.** Dashboard is desktop-only
  (locked 2026-05-08), so no PWA-on-Android-phone install path. No Web
  Push API integration on the desktop browser either. No Sagar-side
  notifications of any kind in v0. Sagar checks the dashboard between
  consultations (the "at least once a day" rhythm already in
  `docs/flows/admin.md`). Walk-in clinic context absorbs the absence.
  Sagar-side notifications deferred to v1+ when the dashboard either
  goes mobile-responsive or grows browser-push.
- **Dashboard PWA manifest dropped from v0 entirely (locked 2026-05-10).**
  Was previously in scope for the now-removed Android-install path. With
  no Sagar-side push, the manifest's only remaining value would be
  desktop-install branding (Chrome/Edge dock icon + standalone window),
  which doesn't carry enough demo value to justify Day 1 build hours.
  Dashboard ships a browser-tab favicon only in v0. Day 1 first-run-asset
  work generates only the Expo parent-app icon and splash (Direction C
  Honey-to-Peach). PWA manifest revisit in v1+ when push comes back.
- **Parent-side push notifications stay in v0.** Two triggers: (1) Broadcast
  publish (push fires for all parents in the audience filter scope,
  deep-links to the Broadcasts tab card); (2) `pet_reminders` row insert
  (push fires per affected household, deep-links to the relevant Pet Page
  section). Implemented via Expo push notifications on the parent app.
- **WhatsApp delivery** for parent-side notifications flagged as v1+
  when WhatsApp integration lands. Out of scope for v0.

## Supabase project
- **Project ID:** `pevofxnfjcvmamdcfkus`
- **Dashboard:** https://supabase.com/dashboard/project/pevofxnfjcvmamdcfkus
- **API URL:** `https://pevofxnfjcvmamdcfkus.supabase.co`
- **Auth provider for v0: NONE.** Parent identity pre-seeded for the Fernandes demo.
  See `docs/supabase-config.md` for env vars and RLS test pattern.
