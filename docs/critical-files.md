## Critical Files

**Brand spine:**
- `packages/design-tokens/src/tokens.css`
- `packages/design-tokens/src/tailwind-preset.ts`
- `packages/design-tokens/src/colors.ts`
- `packages/design-tokens/src/motion.ts` (3 easings + 5 durations, added 2026-05-06)
- **No `TealCTA.tsx` / `BerryCTA.tsx` shared component.** Primary CTA pattern is the shadcn `<Button variant="default" size="cta">` (40px tall, 24px horizontal padding, Berry fill, 14px label) consumed directly across surfaces. The earlier planned `TealCTA.tsx` shared component was dropped at the mauve-only lock (2026-05-14) once shadcn Button's `cta` size landed and proved sufficient.

**Premium feel system (Branch B, see `docs/premium-feel/INDEX.md`, split into 9 per-dimension files):**
- `packages/design-tokens/src/motion.ts` for easing curves (3) + duration constants (5) per `docs/premium-feel/motion.md`
- `packages/design-tokens/assets/vellum.svg`, SVG filter for canvas card vellum texture (web). **Removed from dashboard 2026-05-15** alongside the inbox-v2 surface lock; remains in the package for potential parent-app use. Per `docs/premium-feel/materials.md` (banner at top of that file flags the dashboard deprecation).
- `packages/design-tokens/assets/vellum-tile.png`, 24×24 seamless PNG fallback for Expo
- `packages/design-tokens/src/components/VetByline.tsx`, 3 variants (compact / full / centre) per `docs/premium-feel/byline.md`; shared between dashboard + parent app
- `apps/dashboard/public/favicon.ico`, browser-tab favicon only in v0 (dashboard PWA manifest + dashboard app icon dropped 2026-05-10 alongside the no-Sagar-push lock; return in v1+)
- `apps/petparent/assets/icon.png` plus `splash.png`, Expo app icon + splash per `docs/premium-feel/first-run.md`
- `microcopy/`, every user-facing string EN + MR, written against `docs/premium-feel/voice.md` do/don't matrix

**Match logic (the delight):**
- `packages/match-logic/src/index.ts`
- `packages/match-logic/src/rules.ts`
- `packages/match-logic/src/__tests__/fixtures.test.ts`

**Data spine:**
- `supabase/migrations/0001_init_schema.sql`, 14 tables total (clinics, users, households, pets, visits, vaccinations, invoices, invoice_line_items, messages, follow_up_windows, broadcasts, broadcasts_read, health_kits, audit_log). **Patches 1–13 baked in here:** Patch 1 (no `clinics.primary_color`), Patch 2 (`pets.algorithm_match_*`), Patch 3 (Fernandes seed), Patch 4 (no voice fields), Patch 5 (bilingual `_en`/`_mr` columns), Patch 6 (`pets.clinical_lock` + trigger), Patch 7 (`broadcasts_read` table), Patch 8 (parent-side media attachments on `messages`: image, video; locked 2026-05-08), Patch 9 (structured-content broadcast shape with `key_points / warning_signs / escalation / share_count / public_slug`), Patch 10 (unification: short broadcast + structured-content rows live in one table), Patch 11 (rename to `announcements`), Patch 12 (rename to `broadcasts`), Patch 13 (`broadcasts.cover_image_url`).
- `supabase/migrations/0005_invoice_unpaid_status.sql`, **Patch 14:** lifts the paid-only constraint on `invoices.status` to accept `('paid', 'unpaid')` + makes `paid_at` nullable. Locked 2026-05-15 with the Billing build.
- `supabase/migrations/0006_storage_rls.sql`, **Patch 15:** Storage RLS policies for the four buckets per `docs/supabase-config.md`. `pet-photos` + `broadcast-covers` are public-read / authenticated-write; `messages-images` + `messages-videos` are RLS-by-household using a `<household_id>/<filename>` path schema (first `storage.foldername(name)` segment is the gating key). Clinic vet + staff get a separate SELECT policy on the message buckets scoped to their clinic's households. Locked 2026-05-16; resolves the "Storage RLS is aspirational" gap from `docs/supabase-config.md` + the Day-1 carryover in `docs/build-order.md`.
- `supabase/migrations/0007_security_hardening.sql`, **Patch 16:** (a) `REVOKE EXECUTE` on `reset_all_data()` + `rls_auto_enable()` from `anon` + `authenticated` so signed-in parents can't nuke the DB via RPC; (b) `ALTER FUNCTION ... SET search_path = public, pg_temp` on six functions (`set_clinical_lock`, `set_updated_at`, `days_ago`, `days_ahead`, `months_ago`, `reset_all_data`, `rls_auto_enable`) to close the mutable-search-path advisory; (c) public-read policy on `clinics` so the parent app can render AMS name/phone without auth. Locked 2026-05-17 evening.
- `supabase/migrations/0002_rls_policies.sql`, RLS on every table; `to authenticated` policies for v1+ auth; service-role bypasses for seed
- `supabase/migrations/0003_seed_helpers.sql`, helper RPCs for programmatic seed
- `supabase/migrations/0004_v0_demo_anon_reads.sql`, narrow anon-read policies for the Fernandes household chain + clinic vet (parent app uses anon key, no auth wired in v0). Added 2026-05-06.
- `supabase/seed/seed.ts`, entry, idempotent
- `supabase/seed/clinic-and-vet.ts`, clinic + Sagar
- `supabase/seed/fernandes.ts`, anchor data (Fernandes household + 4 pets + Gabby's open follow-up window)
- `supabase/seed/synthetic.ts`, population data (200 pets / 150 households)
- `supabase/seed/broadcasts.ts`, pre-written broadcasts EN+MR (3 short + 3 structured-content with Patch 9 shape: `key_points / warning_signs / escalation / share_count / public_slug`)
- `supabase/seed/storage.ts`, Storage bucket setup + media upload helpers (photos and videos)
- `supabase/seed/client.ts`, service-role client wrapper
- `supabase/seed/reset.ts`, wipe-and-reset helper
- `packages/db-types/src/database.types.ts`, generated by `supabase gen types`

**Dashboard demo screens:**
- `apps/dashboard/app/(app)/layout.tsx`
- `apps/dashboard/app/inbox/page.tsx`
- `apps/dashboard/app/pets/[id]/page.tsx`
- `apps/dashboard/app/invoices/[id]/page.tsx`
- `apps/dashboard/app/(dashboard)/billing/page.tsx`, top-level Billing ledger (server). Resolves scope/status/page from URL, fetches KPIs + ledger rows, hands to client. Locked 2026-05-15.
- `apps/dashboard/app/(dashboard)/billing/billing-client.tsx`, month picker + KPI cards + ledger table + pagination. No h1 title (page lead is the scope chip).
- `apps/dashboard/app/(dashboard)/billing/[invoiceId]/page.tsx`, invoice detail (server). Fetches one invoice by UUID + clinic header.
- `apps/dashboard/app/(dashboard)/billing/[invoiceId]/billing-detail-client.tsx`, reuses the itemised-invoice layout from `/inbox/[threadId]/invoice/[invoiceIdx]` + adds the "Mark paid" CTA when unpaid.
- `apps/dashboard/app/(dashboard)/billing/actions.ts`, `markInvoicePaidAction()` server action that flips status + revalidates `/billing` + `/billing/[invoiceId]`.
- `apps/dashboard/app/(app)/broadcasts/new/page.tsx`, admin compose new (unified composer; structured-content mode toggle exposes the Patch 9 fields `title / key_points / body / warning_signs / escalation`)
- `apps/dashboard/app/(app)/broadcasts/[id]/edit/page.tsx`, admin editor for existing broadcasts
- `apps/dashboard/app/broadcasts/[slug]/page.tsx`, PUBLIC unauthenticated broadcast reading view (May 4 virality layer; structured-content broadcasts only — short broadcasts surface only in-app)
- `apps/dashboard/app/api/transcribe/route.ts`, Sarvam Audio voice-input transcription endpoint (the only AI route in v0)
- `apps/dashboard/app/api/broadcasts/[slug]/share/route.ts`, public POST endpoint to increment `share_count` (May 4 virality layer)
- `apps/dashboard/app/style-guide/page.tsx`

**Pet-parent demo screens (PLANNED structure for Day 4 of build, 5-tab nav + Settings behind avatar pill, no auth):**

> The expo-router shell + tab paths below are the **planned** structure for the build phase. Current
> codebase has only `apps/petparent/App.tsx` + `apps/petparent/screens/PetPage.tsx` (a data-plumbing
> stub from the SDK 51 to 54 bump on 2026-05-06; the App.tsx still carries the v1.3 Spectral / Paper /
> Teal stack and is part of the Day-4 mauve sweep). The expo-router shell + per-tab routes are deferred
> until Day 4 of the build per `docs/build-order.md`.

**5-tab icon-only nav routes (superseded the 2026-05-09 6-tab lock; current per `docs/flows/parent.md`):** Broadcasts / Community / Pets (default landing) / Inbox / Shop. Phosphor filled icons: Megaphone / Users / PawPrint / Tray / ShoppingBag. No text labels; aria-labels carry the role for screen readers. Master Settings sits behind the household-initial avatar pill in the Pet Page cover top-right (no longer a 6th nav tab).

- `apps/petparent/app/(onboarding)/household.tsx`, Step 1
- `apps/petparent/app/(onboarding)/first-pet.tsx`, Step 2 (renders shared `<PetIdentityForm />`)
- `apps/petparent/app/(tabs)/broadcasts/index.tsx`, **Broadcasts tab** clinic-wide one-way feed of broadcasts. Composer disabled. Locked 2026-05-08.
- `apps/petparent/app/(tabs)/broadcasts/[id].tsx`, Broadcast reading view (entered from a Broadcast card on the Broadcasts tab; was previously inside Inbox). Renders structured-content broadcasts (title + key_points + body + warning_signs + escalation).
- `apps/petparent/app/(tabs)/community/index.tsx`, **Community tab** v0 dummy carrying V3+ Pawkit Plus social-layer teaser (city circles, breed groups, AMAs, lost-and-found, verified clinic reviews). No active functionality. Locked 2026-05-08.
- `apps/petparent/app/(tabs)/pets/index.tsx`, **Pets tab** vertical list view of household pets + sticky-bottom Berry "Add a pet" CTA. Centre tab; default landing on app open.
- `apps/petparent/app/(tabs)/pets/new.tsx`, Add subsequent pet form (renders shared `<PetIdentityForm />`; on submit, creates pet and navigates to `[id].tsx` empty state to trigger fur-match flow)
- `apps/petparent/app/(tabs)/pets/[id].tsx`, **Pet Page** (Empty / Sampling / Transformed states + steady-state with **Timeline / Vaccinations / Invoices** tabs locked 2026-05-08; quick link to inbox thread on homepage; per-pet reminder banner if active; clinical_lock honour). Note: tabs changed from prior Timeline/Visits/Vaccinations/Notes — Visits collapsed into Timeline, Notes folded into Timeline rows, Invoices added.
- `apps/petparent/components/PetIdentityForm.tsx`, shared 5-field form (name, species, breed, gender, birthday-or-age) used by Onboarding Step 2 and the Add subsequent pet flow.
- `apps/petparent/app/(tabs)/inbox/index.tsx`, **Inbox tab** per-pet 1:1 thread list (locked 2026-05-08; was previously a chronological feed mixing 1:1 threads + broadcasts, restructured). One row per living pet; deceased pets removed from list.
- `apps/petparent/app/(tabs)/inbox/[threadId].tsx`, Thread detail (text + photo + video bubbles on parent side; vet-side text-only; no voice; system reminder cards inline with no reply UI).
- `apps/petparent/app/(tabs)/shop/index.tsx`, **Shop tab** v0 dummy carrying V4+ clinically-curated marketplace teaser (therapeutic diets, pharma, hygiene, supplements with clinical evidence, insurance). No active functionality. Locked 2026-05-08.
- `apps/petparent/app/settings/index.tsx`, **Master Settings screen** locked 2026-05-09; reached via the household-initial avatar pill in the Pet Page cover top-right (no longer a bottom-nav tab). Account section (phone read-only, household name editable inline, EN/MR language toggle), Pets section (one row per living pet linking to per-pet sub-screen), Notifications section (single push toggle), About section (version + clinic), Sign-out ghost button at bottom.
- `apps/petparent/app/settings/pets/[id].tsx`, **Per-pet Settings sub-screen** locked 2026-05-09. Editable: photo (auto-re-runs fur-match on replace), fur-match (Re-run match Berry CTA + Override ghost opens picker), adoption year. Read-only Identity card (name + breed + sex + birthday) honouring `pets.clinical_lock`. Same screen reachable from gear pill on Pet Page cover (`/(tabs)/pets/[id].tsx` top-right).
- `apps/petparent/components/FurMatchUploader.tsx`
- `apps/petparent/components/OverrideSheet.tsx`, two-tone toggle hidden behind 'More options' chevron
- `apps/petparent/components/InboxFeedRow.tsx`, renders conversation + broadcast-card variants
- `apps/petparent/components/PetFilterChipStrip.tsx`, used on Invoices list (only multi-pet surface in v0)
- `apps/petparent/components/ClosedThreadRedirect.tsx`, the empty-state canvas card shown when a parent opens a closed thread or expects a message surface outside an open window. Renders the redirect copy: "AMS is walk-in only. Visit 9am to 9pm Mon-Sat. For urgent issues, call [clinic number]." (New for the no-incoming-messages-outside-window lock 2026-05-06.)
- `apps/petparent/components/VideoBubble.tsx`, video bubble in the thread (first-frame thumbnail + Phosphor Play icon). Renders alongside text and photo bubbles. (New for the parent-side video lock 2026-05-08; icon kit swap from Lucide to Phosphor 2026-05-15 evening.)
- `apps/petparent/components/InlineVideoOverlay.tsx`, the absolutely-positioned overlay scoped to the thread panel that opens when the parent taps a `VideoBubble`. Wraps `expo-video` in a canvas card with 1px rule border, no shadow, canvas backdrop. Dismiss via backdrop click, X button, or Escape. (New for the parent-side video lock 2026-05-08; backdrop dropped vellum 2026-05-15 alongside the dashboard sweep.)
- `apps/dashboard/components/VideoBubble.tsx` plus `apps/dashboard/components/InlineVideoOverlay.tsx`, dashboard equivalents (native HTML5 `<video controls>` instead of `expo-video`; same visual shell). For Sagar reviewing parent-uploaded videos in-thread.

**Current petparent files (as of 2026-05-06 SDK upgrade detour):**
- `apps/petparent/App.tsx`, root. **Currently loads Inter + Spectral fonts and uses `#F5F1E8` / `#006D6F` (v1.3 Paper + Teal); needs swap to Inter + Lora italic + canvas `#F8F7F5` + Berry `#9C2B5C` during Day-4 parent-app mauve sweep.**
- `apps/petparent/index.js`, `registerRootComponent`
- `apps/petparent/screens/PetPage.tsx`, data-plumbing stub for Gabby (NOT the demo Pet Page)
- `apps/petparent/lib/supabase.ts`, anon-key client
- `apps/petparent/lib/current-household.ts`, Fernandes household lookup
- `apps/petparent/lib/pet-data.ts`, Pet/visits/follow-up/vet fetchers + formatters (`shortVetName`, `formatAge`, etc.)

**Co-creation session logs (chronological, frozen-in-time, do not edit):**
- `session-logs/2026-05-02-parent-flows-co-creation.md`, parent flow co-creation log (8 surfaces locked May 2)
- `session-logs/2026-05-04-parallel-coding-plan.md`, parallel-coding plan (Patch 9 structured-broadcast shape + Phase 1 to 4 parallel work, locked May 4)
- `session-logs/2026-05-04-premium-direction-v1.3.md`, v1.3 brand refinement plan (Lime to Teal + Spectral + Pet Page as Hero, locked May 4)
- `session-logs/2026-05-04-premium-feel-plan.md`, Premium Feel System Branch B plan (9 cross-cutting dimensions specced, locked May 4; fed `docs/premium-feel/` per-dimension files)

**Visual mockups (HTML, under `mockups/` in project root):**

> **Two files in `mockups/` are current** (`design-system.html` and `index.html`). **Everything else lives in `mockups/archive/`** (moved 2026-05-16) — v1.3 Teal/Paper/Satoshi/Spectral/Lucide era, or interim mauve studies that fed locks. The mauve-only build superseded them on 2026-05-14. The current visual reference is the running dashboard (`apps/dashboard/`) plus the design-system page.

Current:
- `mockups/design-system.html` (2026-05-16): Pawkit design system reference. Live tokens, type scale, shadcn primitives, Phosphor icon kit, composite patterns (awaiting bar, KPI cards, inbox row), discipline rules. Single page, rendered against the running rail-tint ground.
- `mockups/index.html` (2026-05-16 rewrite): landing page on mauve tokens. Cards regrouped into Current / Mauve-era historical / Phase 2 historical / v1.3 historical.

Archived (in `mockups/archive/`):
- `mockups/archive/admin-mauve-locked.html` (mauve era, pre-saturation-lift): admin screens on the original Berry `#823159` and the interim ground tones. Reference, not current.
- `mockups/archive/admin-v1.3.html`, `mockups/archive/parent-v1.3.html`, `mockups/archive/premium-components-v1.3.html` (v1.3 HISTORICAL): full app surfaces rendered at the v1.3 Teal/Paper/Satoshi/Spectral stack. Useful as design history; every token, typeface, and icon-kit statement inside is superseded.
- `mockups/archive/app-icon-options-v2.html` (v1.3 HISTORICAL): app icon comparison, Direction C locked. The icon DIRECTION (uppercase "P" on Honey → Peach gradient) survives, but the letterform inside this mockup is Spectral italic; the running spec needs to swap that to Lora italic 600 per the 2026-05-15 font lock.
- `mockups/archive/phase2-*.html`, `admin-skeletons-phase2.html` (interim mauve, pre-saturation-lift): Phase 2 wireframes on the older mauve ground tones (`#ECE7E8` etc.) before the 2026-05-15 evening dial-down.
- `mockups/archive/pawkit-mauve-palette-explore.html`, `palette-revisit.html`, `pet-page-hero-options.html`, `topbar-identity-study.html`, `ground-tone-study.html`, `ground-tone-mauve-variants.html`, `brand-saturation-study.html`, `ground-pink-dial-down.html`, `ground-floral-white-compare.html`, `serif-options-study.html` (color/typography studies): pick-the-lock studies that fed individual decisions. Decisions live in `docs/decisions-log.md`; the studies themselves are scaffolding.
- `mockups/archive/admin-locked.html` (pre-mauve admin lock): superseded by `admin-mauve-locked.html` and then by the running dashboard.
- (The earlier Excalidraw mockup set + JS generators were superseded by these HTML mockups; no longer present in the project.)

**Workspace + config (May 4 parallel coding plan):**
- `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.npmrc`, `package.json` (root)
- `.gitignore`, `.env.example`
- `docs/supabase-config.md`

---
