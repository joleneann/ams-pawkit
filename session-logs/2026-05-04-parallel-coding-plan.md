# Pawkit v0 — Parallel coding work while Figma redesign is in progress

## Context

User is studying Figma to redo the visual design. The current Excalidraw mockups are sketch-quality and don't satisfy their visual standard, so any React component / Tailwind class consumption / pixel-level UI work will likely need to be redone after Figma designs land.

**What's safe to build NOW in parallel:**
- **Data layer** — Supabase schema, RLS, type generation, seed data. Doesn't change with visual design.
- **Pure logic** — the fur-match algorithm. Pure TS, no UI dependency. The pitch's hero moment.
- **Brand-token data** — CSS vars + LAB colour coords. Palette v1.2 is LOCKED, won't change with Figma.
- **Workspace scaffolding** — monorepo + Tailwind preset + a throwaway smoke test that proves the toolchain compiles `bg-lime` from one source. De-risks the NativeWind+pnpm setup BEFORE build week, where it becomes critical.

**What we DEFER until Figma lands:**
- shadcn/ui component generation
- The `<LimeCTA />` React component
- All `apps/dashboard/app/**` and `apps/petparent/app/**` real screen code
- Haiku classifier (no inbox UI to populate)
- Sarvam/Whisper voice-to-text (no compose UI to dictate from)
- Vercel deployment (no app to deploy)
- Vaccination reminder cron (Vercel cron — wait for deployment)

This is locked work from `docs/build-order.md` Day 1 + Day 2 backend slice, plus Day 6's synthetic dataset moved earlier. Nothing invented.

## Health Kit shape — locked May 4 (course-correction over earlier session)

**A Health Kit is educational content the vet authors for pet parents.** Not a bookable service bundle. Example: "How to care for your dog in the summer."

Every kit is **sharable so parents can forward to non-Pawkit friends** — Kits are the **virality layer** for Pawkit. Recipients without Pawkit installed can read the kit on the public web.

### Kit data shape (LOCKED)

- `cover_image_url` — OPTIONAL (publish without cover; reading view shows Vanilla placeholder)
- `title_en` (required) + `title_mr` (Marathi)
- `key_points_en` (required, jsonb array) + `key_points_mr` — bullet summary of the article
- `body_en` (required) + `body_mr` — long-form content with inline citations to further reading
- `warning_signs_en` + `warning_signs_mr` — distinct section: red-flag symptoms
- `escalation_en` + `escalation_mr` — distinct section: when to call the clinic
- `share_count` (integer, default 0) — virality metric
- `public_slug` (text, unique) — for shareable URL `pawkit.app/kits/[public_slug]`
- `vet_id`, `clinic_id`, `published`, `published_at`, `created_at`, `updated_at`

### What was wrongly invented in earlier session (dropped May 4)

- ~~Pricing block~~ → Dropped for v0. v1+ extension noted in `docs/decisions-log.md`.
- ~~"Book this kit" CTA on parent side~~ → Replaced by Share button (WhatsApp / Social / Email).
- ~~`what_includes` jsonb~~ → Replaced by `key_points`.
- ~~`what_to_bring` jsonb~~ → Removed entirely (educational content has no "bring this" semantic).
- ~~Timeline week cards~~ → Removed entirely (most kits are single-article).
- ~~"AMS Puppy Vaccination Pack" sample kit~~ → Replaced by 3 actual educational topics (see Phase 4 below).

### Parent reading view (revised)

- Cover image (or Vanilla placeholder if none)
- Vet row (Sagar avatar + name + clinic)
- Title
- Key-points bullet list
- Body (with inline citation links)
- Warning signs section (small Peach alert dot — only fur-token use in chrome, per palette discipline)
- Escalation section (when to call us — small Peach alert dot)
- Sticky-bottom: **Share button** → opens sheet with WhatsApp / Social / Email options
- EN/MR toggle top-right of cover (or top of page if no cover)

### Public sharing infrastructure (new in Phase 1+2)

- Each published kit gets a public URL: `pawkit.app/kits/[public_slug]` (or your dashboard domain)
- Public Next.js route renders the kit content for unauthenticated readers
- OS share sheet → WhatsApp / Social / Email pre-formatted with public URL + title
- Share count incremented via public API endpoint (no auth required)
- Adds: `apps/dashboard/app/kits/[slug]/page.tsx` (public reading route, read-only)

### Schema Patch 9 (becomes `supabase/migrations/0009_health_kit_revision.sql` in Phase 2)

```sql
-- Drop wrongly-invented columns (idempotent if columns absent)
alter table health_kits drop column if exists what_includes;
alter table health_kits drop column if exists what_to_bring;
alter table health_kits drop column if exists timeline_week_cards;
alter table health_kits drop column if exists pricing;
alter table health_kits drop column if exists pricing_currency;

-- Cover now optional
alter table health_kits alter column cover_image_url drop not null;

-- New content sections (bilingual)
alter table health_kits add column key_points_en jsonb not null default '[]'::jsonb;
alter table health_kits add column key_points_mr jsonb;
alter table health_kits add column warning_signs_en text;
alter table health_kits add column warning_signs_mr text;
alter table health_kits add column escalation_en text;
alter table health_kits add column escalation_mr text;

-- Virality layer
alter table health_kits add column share_count integer not null default 0;
alter table health_kits add column public_slug text unique;

-- Index for public-slug lookup on published kits
create index idx_health_kits_public_slug on health_kits(public_slug) where published = true;
```

## Pre-execution doc updates (BEFORE Phase 1 starts)

Plan-mode edits are restricted to this single file. After approval, the FIRST execution step is reconciling the docs/ files to the Health Kit shape locked above:

- `docs/schema.md` — add Patch 9 block (above)
- `docs/decisions-log.md` — log: "May 4 — Health Kit shape locked as educational content with virality layer (sharable via WhatsApp/Social/Email). Pricing dropped for v0. Cover image now optional. Sections: title + key_points + body + warning_signs + escalation. Earlier 'AMS Puppy Vaccination Pack' / 'Book this kit' / pricing block / what-includes / what-to-bring / timeline-week-cards were earlier-session inventions, dropped."
- `docs/parent-flows.md` — revise "Health Kit reading view" subsection (drop Book this kit; add Share; add warning_signs + escalation sections; add public-URL note)
- `docs/layout-spec.md` — revise #6 (admin Health Kit editor: drop pricing block + what-includes + what-to-bring + timeline; add key_points + warning_signs + escalation editors) and #12 (parent reading view: drop Book this kit; add Share; add warning signs + escalation)
- `docs/admin-flows.md` — revise Health Kit creation section
- `docs/feature-scope.md` — IN scope: Kits sharable via WhatsApp/Social/Email (virality layer); IN scope: public unauthenticated kit reading URL. OUT of scope: Kit pricing (deferred v1+).
- `docs/critical-files.md` — add `apps/dashboard/app/kits/[slug]/page.tsx` (public reading route)
- `docs/supabase-config.md` — NEW file. Contents: project ID `pevofxnfjcvmamdcfkus`, dashboard URL https://supabase.com/dashboard/project/pevofxnfjcvmamdcfkus, API URL `https://pevofxnfjcvmamdcfkus.supabase.co`, region (TBD — verify), env-var setup pattern (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`), notes on RLS test pattern. NEVER commit secrets — only the project ID + URLs.
- `.gitignore` (project root) — confirm `.env*` and `.env.local` are ignored before any env file is created
- `.env.example` (project root) — template with the three env-var names and dummy values, committable

ALSO regenerate the Health Kit Excalidraw mockups (slated for Figma redo anyway, but keep current state coherent):
- `mockups/admin/health-kit-editor-mockup.excalidraw` — new editor sections
- `mockups/parent/health-kit-reading-parent-mockup.excalidraw` — Share button + revised sections

## Scope — 4 phases, ~3–5 days of focused work

### Phase 1 — Monorepo + design tokens + toolchain smoke test (½–1 day)

Lay the workspace infrastructure. Prove the shared Tailwind preset renders `bg-lime` from one source on both Next.js (web) and Expo (Android).

**Files created:**
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `.npmrc` (with `node-linker=hoisted`, `public-hoist-pattern[]=*` — Expo + pnpm gotchas from `docs/architecture.md`)
- `package.json` (root, pnpm workspaces declared)
- `packages/design-tokens/package.json`
- `packages/design-tokens/src/tokens.css` (14 CSS vars, palette v1.2)
- `packages/design-tokens/src/colors.ts` (typed export — fur palette + LAB coords for matching)
- `packages/design-tokens/src/tailwind-preset.ts` (Tailwind Config preset — exports `bg-canvas`, `bg-fur-vanilla`, `bg-lime`, `text-ink`, etc.)
- `packages/design-tokens/src/index.ts` (barrel)
- `apps/dashboard/` — minimal Next.js 14 app, single `app/page.tsx` rendering a `bg-lime` div with 1.5px Ink border + Inter loaded via `next/font`
- `apps/dashboard/tailwind.config.ts` — imports preset from `@pawkit/design-tokens`
- `apps/petparent/` — minimal Expo SDK 51 app, single screen rendering a `bg-lime` View with NativeWind 4
- `apps/petparent/babel.config.js` — `nativewind/babel` + `react-native-reanimated/plugin` LAST
- `apps/petparent/metro.config.js` — `withNativeWind` + monorepo resolver (watchFolders + nodeModulesPaths)
- `apps/petparent/tailwind.config.js` — same preset

**Verification:**
- `pnpm dev` boots both apps
- Dashboard at `localhost:3000` shows the `bg-lime` div with Ink border
- Expo Go on a real Android phone shows the `bg-lime` View

**Risk hard-stop (per Risk Register #2):** if NativeWind 4 + pnpm + Metro fights past 4 hours → drop to NativeWind 2 immediately. Note the choice in `docs/decisions-log.md`.

**What we DON'T do in Phase 1:** shadcn init, the `<LimeCTA />` component, any meaningful UI beyond the bg-lime smoke test.

### Phase 2 — Supabase project + 8 schema migrations + RLS + type generation (1 day)

Set up the data layer. All schema is locked in `docs/schema.md`.

**Files created:**
- `supabase/config.toml` (project config)
- `supabase/migrations/0001_init_schema.sql` (12 tables + audit_log)
- `supabase/migrations/0002_rls_policies.sql` (RLS on every table — no `FORCE`, so service-role bypasses for seed)
- `supabase/migrations/0003_seed_helpers.sql` (helper RPCs for programmatic seed)
- `supabase/migrations/0004_fur_match_columns.sql` (Patch 2 — `algorithm_match_*` override-tracking)
- `supabase/migrations/0005_bilingual_columns.sql` (Patch 5 — `name_en/mr`, `description_text_en/mr`, etc.)
- `supabase/migrations/0006_clinical_lock.sql` (Patch 6 — `pets.clinical_lock`)
- `supabase/migrations/0007_broadcasts_read.sql` (Patch 7 — server-side broadcast read state)
- `supabase/migrations/0008_message_attachments.sql` (Patch 8 — image-only attachments)
- `packages/db-types/package.json`
- `packages/db-types/src/database.types.ts` (generated by `supabase gen types`)
- `docs/supabase-config.md` (project ID + URL reference; secrets in `.env.local`, never in repo)

**Supabase project (already created by user):**
- Dashboard: https://supabase.com/dashboard/project/pevofxnfjcvmamdcfkus
- Project ID: `pevofxnfjcvmamdcfkus`
- API URL: `https://pevofxnfjcvmamdcfkus.supabase.co` (standard format)
- Region: TBD — verify at first connect (`supabase projects list`)
- Anon key + service-role key: NOT in repo — store in `apps/dashboard/.env.local` and `apps/petparent/.env.local`. The `service_role` key is service-only and lives in seed scripts via env var, never client-side.

**Setup steps:**
1. ~~Create cloud Supabase project~~ — DONE by user (project ID above)
2. `supabase link --project-ref pevofxnfjcvmamdcfkus` to wire local CLI
3. Push migrations via Supabase CLI: `supabase db push`
4. RLS smoke test: `pnpm db:test:anon` must FAIL loudly, `pnpm db:test:service` must SUCCEED
5. Generate types: `supabase gen types typescript --project-id pevofxnfjcvmamdcfkus > packages/db-types/src/database.types.ts`

**Storage buckets to create:**
- `pet-photos` — public read, authenticated write (fur-match upload)
- `messages-images` — private, RLS by household (Patch 8)
- `kit-covers` — public read, vet-only write
- `broadcast-attachments` — public read, vet-only write (for kit cards inside broadcasts)

**What we DON'T do in Phase 2:** Edge Functions, cron jobs, realtime subscription config, the Haiku classifier trigger. All deferred to build week.

### Phase 3 — Match-logic package with full vitest coverage (1 day) — THE PITCH HERO

The fur-match algorithm. Pure TS, no UI dependency. Standalone-testable. Building it standalone NOW with full test coverage de-risks Day 4 of build week, where it becomes the screenshottable wow moment.

**Files created:**
- `packages/match-logic/package.json` (deps: `culori` ^4)
- `packages/match-logic/src/index.ts` — entry: `resolveFurMatch(photoBytes) → { primary, secondary?, isAutoPair, isTwoTone, confidence }`
- `packages/match-logic/src/lab.ts` — culori wrappers (sRGB → LAB, Delta-E 2000)
- `packages/match-logic/src/kmeans.ts` — k-means k=3 with deterministic seed (so tests are stable)
- `packages/match-logic/src/preprocess.ts` — centre-crop middle 60% + saturation floor (demote grey clusters when a saturated cluster exists)
- `packages/match-logic/src/rules.ts` — 4 rules: solo / two-tone / Milk auto-pair (Rule 03) / Sable auto-pair (Rule 04)
- `packages/match-logic/src/__tests__/fixtures.test.ts` — 22-photo fixture suite
- `packages/match-logic/src/__tests__/fixtures/` — 22 photos (Pexels / Unsplash / Stanford Dogs subset)
- `packages/match-logic/src/__tests__/fixtures/manifest.json` — each fixture's expected `primary` + `secondary`
- `packages/match-logic/vitest.config.ts`

**Critical test cases (mitigates Risk #1 — fur-match tuning):**
- Yellow Lab → solo Vanilla
- Darker Golden → solo Honey (the Vanilla/Honey decision boundary — was the v1.0 failure mode)
- Cream-to-darker Golden gradient — boundary case
- Tuxedo cat → Sable + Milk two-tone
- White Persian → Milk + Vanilla auto-pair (Rule 03)
- Black Lab → Sable + Bark auto-pair (Rule 04)
- Husky → Smoke + Milk
- Brindle, calico, plus 13 more edge cases

**Reuses:** `packages/design-tokens/src/colors.ts` for the 10 fur tone LAB coords (written in Phase 1).

### Phase 4 — Fernandes seed + synthetic Pune dataset (1–2 days)

Programmatic seed via service-role key (per `docs/architecture.md` — NOT seed.sql). Two sub-phases: anchor data first (Fernandes), then population.

**Files created:**
- `supabase/seed/seed.ts` — entry, runs all sub-seeds; idempotent (upsert by stable IDs)
- `supabase/seed/fernandes-family.ts` — anchor data (Phase 4a)
- `supabase/seed/synthetic-pune.ts` — population data (Phase 4b)
- `supabase/seed/broadcasts.ts` — 3 pre-written broadcasts EN+MR
- `supabase/seed/helpers.ts` — date helpers (timestamps relative to `now()`), name post-processing, breed/age distribution samplers
- `supabase/seed/data/pune-names.json` — curated Pune Marathi/Hindi first + last names (~200 each)
- `supabase/seed/data/breed-distribution.json` — locked Pune-realistic species/breed split
- `supabase/seed/photos/fernandes/` — 4 actual Fernandes pet photos (Storage upload)
- `supabase/seed/photos/synthetic/` — ~200 curated public-domain photos for synthetic pets
- `scripts/curate-photos.ts` — one-shot script to download + verify photos from Pexels API + Stanford Dogs subset, runs once locally then commits the photo folder

#### Phase 4a — Fernandes anchor (½ day)

The 4 hand-crafted pets that drive the demo. Per `docs/decisions-log.md`:

- **Raffy** — yellow Lab, deceased — fur-match from Phase 3 algorithm output (his real photo); memorial card preserves the match with 60% opacity + Heart icon overlay
- **Gabby** — Golden Retriever, alive — fur-match from Phase 3; recent visit creates an OPEN follow-up window; 3 messages in inbox from his parent:
  - 1 unreplied: "Gabby's still limping a bit" → `clinical_followup` bucket
  - 1 unreplied: "What time do you open tomorrow?" → `logistics` bucket
  - 1 read (older): "Thanks for yesterday's visit" → `feedback` bucket
- **Angel** — white Persian, alive — Milk+Vanilla auto-pair (Rule 03); vaccination reminder due in 3 days from `now()`
- **Galaxy** — species TBD by photo, alive — fur-match from Phase 3 algorithm output
- 1 household ("The Fernandes Family"), 1 user (the parent), 4 pets, ~12 visits across all 4 (some shared, some pet-specific), ~8 vaccinations, 4 invoices (1 per pet's most recent visit)

#### Phase 4b — Synthetic Pune dataset (½–1 day)

199 additional pets across 149 households for population realism. Locked generation parameters:

**Counts:**
- 199 pets / 149 households (some households have 2–4 pets; ratio ≈ 1.33)
- 600–800 visits across ~24 months
- ~250 vaccinations
- ~400 invoices (one per visit)
- ~80 inbox messages distributed across ~50 households (~33% have active threads)

**Species split (Pune-realistic):**
- 70% dogs, 30% cats

**Dog breed distribution:**
- Indie / mixed (~32%), Lab (~15%), Pug (~10%), Golden Retriever (~8%), Shih Tzu (~8%), German Shepherd (~7%), Beagle (~5%), other purebred (~15%)

**Cat breed distribution:**
- Persian (~40%), DSH / mixed (~30%), Maine Coon (~10%), Bombay (~10%), Siamese (~5%), other (~5%)

**Age distribution:**
- Puppy / kitten under 1yr (~15%), adult 1–8yr (~70%), senior 8yr+ (~15%)

**Visit type split:**
- Consultation (~60%), vaccination (~25%), surgery (~10%), grooming (~5%)
- NO `emergency`, NO `dental`, NO `boarding` (per locked schema)

**Visit cadence:**
- Most pets: 2–5 visits over the 24-month window with realistic gaps (3–9 month intervals)
- ~10% chronic patients: 10–15 visits clustered tighter (1–2 month intervals)
- Vaccinations on age-appropriate schedule (puppies/kittens 3–5 in first year; adults annual)

**Inbox message classification (hard-coded per locked decision; Haiku NOT wired yet in Phase 4):**
- 60% logistics ("hours", "directions", "reschedule")
- 30% clinical_followup ("limping", "appetite drop", "wound check")
- 10% feedback ("thanks", "great visit")
- ~10 of these are open follow-up threads (within window); rest are closed

**Names:**
- `@faker-js/faker` locale `en_IND` for first pass
- Post-process owner names against curated Pune Marathi/Hindi list (Patil, Joshi, Deshpande, Kulkarni, Gokhale, etc.)
- Pet names mix Indian (Bruno, Simba, Coco, Snowy, Mishti, Pepper) and Marathi (Kalu, Rani, Moti)

**Geographic spread (in `households.address` field):**
- Koregaon Park, Kothrud, Aundh, Hadapsar, Wakad, Baner, Viman Nagar, Camp, Sinhagad Road
- Synthetic +91 numbers (10-digit, prefixed `9` for mobile)

**Photos:**
- Curated public-domain set: Pexels (free commercial use), Unsplash (free), Stanford Dogs subset (research-OK for demo fixtures)
- ~200 photos pre-downloaded into `supabase/seed/photos/synthetic/`, indexed by breed
- Seed picks per pet: match breed, age (puppy vs adult), and species

**Pre-seeded broadcasts (3, all bilingual EN+MR):**
1. Monsoon tick prevention reminder — audience: all dogs
2. Annual vaccination drive — audience: all pets due in next 30 days
3. Holiday hours notice — audience: all households

**Pre-seeded Health Kits (3, all bilingual EN+MR — educational content, locked May 4):**
1. **"How to care for your dog in the summer"** / "उन्हाळ्यात तुमच्या कुत्र्याची काळजी कशी घ्यावी" — key points (hydration, paw protection, never leave in car, recognise heat stroke), body with citation links, warning signs (excessive panting, drooling, vomiting), escalation (call clinic if rectal temp >103°F)
2. **"Monsoon tick prevention basics"** / "पावसाळ्यात गोचिडांपासून संरक्षण" — key points (preventives, daily checks, household sanitisation), body, warning signs (lethargy, loss of appetite, fever), escalation (immediate visit if tick fever symptoms)
3. **"Vaccination schedule for your puppy"** / "तुमच्या पिल्लाचे लसीकरण वेळापत्रक" — key points (6-week DHPPi, 9-week DHPPi+L, 12-week rabies, annual boosters), body with citation links, warning signs (lethargy/swelling at injection site), escalation (call if fever >24h post-vaccination)

Each kit has a `public_slug` so it can be shared to non-Pawkit users via WhatsApp / Social / Email. 1–2 of these are referenced from a broadcast in the seed (kits surface in parent app via broadcast cards per locked parent-flow).

**Verification:**
- `pnpm db:reset && pnpm db:seed` produces a clean dataset from empty in <30 seconds
- Counts: 200 pets, 150 households, 600–800 visits, ~250 vaccinations, ~400 invoices, ~83 messages, 3 broadcasts
- Fernandes pets visible in Supabase dashboard with correct fur-match values + photos in Storage
- Synthetic pets pass spot-check: open 5 random pet records, confirm believable name + breed + age + visit history
- RLS smoke: anon SELECT on `pets` returns 0 rows (RLS blocks); service-role returns 200
- Run-twice idempotency: second `pnpm db:seed` doesn't duplicate (upsert by stable IDs)
- Disk: Supabase Storage usage well under free-tier 1GB cap (200 photos × ~200KB ≈ 40MB)

## Critical files to reference

- `docs/schema.md` — full DDL + 8 patches
- `docs/architecture.md` — monorepo layout, Supabase setup, workspace gotchas (NativeWind+pnpm, shadcn neutrals override timing)
- `docs/build-order.md` — Day 1 (foundations) + Day 2 (match logic) + Day 6 (synthetic dataset) — this plan executes those backend slices early
- `docs/reusable-tooling.md` — pinned package versions (`culori` ^4, `NativeWind 4`, `@faker-js/faker` `en_IND`)
- `docs/risk-register.md` — Risk #1 (fur-match tuning) and Risk #2 (NativeWind+pnpm) directly mitigated by this work
- `docs/decisions-log.md` — Fernandes anchor + AMS facts + locked AI scope (Haiku classify + Sarvam transcribe ONLY)
- `docs/feature-scope.md` — in/out of scope reference
- `docs/brand-system.md` — palette v1.2 hex values for `tokens.css`
- `docs/critical-files.md` — file path inventory (now matches what Phase 1 builds)

## Verification (after all 4 phases)

1. `pnpm dev` boots both apps; both render `bg-lime` from shared `@pawkit/design-tokens` preset
2. `pnpm --filter @pawkit/match-logic test` passes 22 fixtures
3. `pnpm db:reset && pnpm db:seed` produces a clean Fernandes-anchored dataset of ~200 pets in Supabase
4. RLS smoke: anon key fails, service-role succeeds
5. `pnpm db:types` regenerates `packages/db-types/src/database.types.ts` cleanly
6. After Phase 3: append the actual algorithm-determined fur-match for each Fernandes pet to `docs/decisions-log.md` so Phase 4 seed uses real values
7. After each phase lands: append a one-line entry to `status.md` (e.g. "2026-05-04 Phase 1 landed — monorepo + design-tokens + bg-lime smoke test working on web + Android")

## What this UNblocks for Figma

When the Figma designs land, they can reference real data shapes (database types), real fur-match outputs (algorithm runs on Gabby's photo right now), and real palette tokens (the CSS vars). Visual decisions get grounded in the actual product, not mockup approximations. The Tailwind preset already exists and accepts whatever class additions Figma motivates.

## What this does NOT include

- Visual UI beyond the bg-lime smoke test (waits for Figma)
- shadcn init / shadcn components (waits for Figma)
- The `<LimeCTA />` React component (waits for Figma — palette is locked, but the exact button anatomy may shift)
- Real screens for dashboard or pet-parent (waits for Figma + microcopy + UI/UX research)
- Haiku classifier (no inbox UI to populate yet — bucket assignments hard-coded in Phase 4 seed)
- Sarvam/Whisper transcription (no compose UI to dictate from yet)
- Vercel deployment (no app to deploy)
- Vaccination reminder cron (Vercel cron — wait for deployment)
- shadcn `Sheet` for dashboard or `@gorhom/bottom-sheet` for native (UI primitives — wait for Figma)
- Lottie animations
- AMS rebrand assets (wordmark, letterhead) — waits for Figma to set the visual language

## Post-approval first move

After approval, move this plan file from `~/.claude/plans/chutiya-ask-me-these-jiggly-sparrow.md` to `D:\Claude Code Projects\Animal Medical Services\session-logs\2026-05-04-parallel-coding-plan.md` per the CLAUDE.md rule (no Pawkit files in `~/.claude/plans/`).

Then start with **Phase 1, sub-step 1**: pnpm-workspace.yaml + turbo.json + tsconfig.base.json + .npmrc.
