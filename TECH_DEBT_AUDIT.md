# Tech Debt Audit, Pawkit v0
Generated 2026-05-18. Scope: full monorepo (`apps/dashboard`, `apps/petparent`, `packages/*`, `supabase/`). ~19.4k LOC source. No `.git` directory present, so churn-based prioritization (the skill's normal lever) is unavailable. Findings below are ranked by structural complexity, cross-reference reach, and explicit project-rule violations from `CLAUDE.md` + auto-memory.

## Executive summary

- 4 Critical findings, 9 High, 14 Medium, 6 Low. The Critical four all sit on the broadcast composer path, which is the highest-stakes screen for the Sagar demo.
- `apps/dashboard/lib/data.ts` is the largest debt concentration. 1,309 LOC, 19 `as any` / `as unknown` casts, three eras of broadcast-content shape (v1 flat → v3 conditionGroups → v4 sections) all decoded in one file with no abstraction.
- The `@pawkit/design-tokens` Tailwind preset and the `apps/dashboard/tailwind.config.ts` override disagree on the type scale: same class name renders different pixel sizes in the dashboard vs. the petparent app. The dashboard's values are the canonical ones per `CLAUDE.md`; the preset is wrong.
- `CLAUDE.md`'s "TWO AI features, both Sarvam-vendor" rule is stale. A third vendor (Groq Llama 3.3 70B) is wired and serving the broadcast voice-dump path (`/api/broadcast/structure`), locked 2026-05-18 in `docs/decisions-log.md`. `MEMORY.md` is even further behind.
- Brand hex values (`#9C2B5C`, `#0F0C0A`, etc.) are duplicated across the design-tokens package, the petparent's `lib/pet-data.ts`, the petparent's `screens/PetPage.tsx`, and inline in dashboard components. Any color tweak now requires 4+ edits.
- The shadcn-only rule (locked 2026-05-15 after four audit rounds) has one residual violation: hand-rolled `<input>` inside section bullets in `composer-canvas.tsx:1005`.
- Letter-spacing scale rule (`tracking-[0.14em]` everywhere) has 6 source-side violations: `tracking-[0.08em]` and `tracking-[0.04em]` and `tracking-[0.1em]` survive in 5 files.
- `composer-canvas.tsx` is a 1,316-LOC god file with 7 internal subcomponents declared inside one module. Splitting along the natural seams unlocks future work on the composer without re-touching the whole file.
- Documentation drift on the schema doc: `CLAUDE.md` and `docs/schema.md` reference "migrations 0001-0007", but only 0001 through 0006 exist on disk.

## Architectural mental model

Pawkit v0 is a Turborepo pnpm workspace with two apps and three shared packages, all backed by a single Supabase project (`pevofxnfjcvmamdcfkus`):

- **`apps/dashboard`** (Next.js 14 App Router, desktop-only, deployed to Vercel). Server components fetch data via a service-role Supabase client (`lib/supabase-server.ts`) that bypasses RLS — the v0 demo treats the entire dashboard as Dr Sagar with full clinic visibility, no auth wired. Client components own most surface complexity: the broadcast composer (single-page, autosaving, bilingual, with audience condition-groups), the billing ledger (scoped by month/range), and the inbox queue.
- **`apps/petparent`** (Expo SDK 54 + RN 0.81 + NativeWind 4, Android-only for v0). Single-screen app (`PetPage.tsx`, 488 LOC) anchored to the Fernandes household's Gabby. Uses the anon Supabase key against the `0004_v0_demo_anon_reads.sql` RLS policies that scope reads to the Fernandes household by name.
- **`packages/`**: `design-tokens` (color palette + type scale + motion easings + Tailwind preset, consumed by both apps); `db-types` (generated Supabase types, 982 LOC); `match-logic` (fur-tone clustering, the only package with tests, vitest).
- **`supabase/`**: 6 migrations covering schema (`0001`), RLS (`0002`, `0004`), seed helpers (`0003`), invoice status (`0005`), and storage RLS (`0006`). Seed scripts live under `seed/` and run via `tsx`.

AI scope (out of date in `CLAUDE.md`): the dashboard calls three vendors — Sarvam Saarika for STT (`/api/sarvam-stt`), Sarvam Translate for EN ↔ MR (`/api/sarvam-translate`), and Groq Llama 3.3 70B for transcript-to-structured-broadcast (`/api/broadcast/structure`). The petparent app has zero AI calls.

The system is small enough (19k LOC) that no truly architectural problem has space to hide. The debt is concentrated: the broadcast feature stack (composer, draft state, audience resolver, data adapter) holds ~4,000 of those LOC and accumulates almost every Critical and High finding below.

## Findings

| ID | Category | File:Line | Severity | Effort | Description | Recommendation |
|----|----------|-----------|----------|--------|-------------|----------------|
| F001 | Architectural decay | `apps/dashboard/lib/data.ts:1-1309` | Critical | L | 1,309-LOC server-only data layer mixes pet adapters, inbox-thread denormalization, clinical history, invoices, billing ledger, broadcasts, audience-count, and vet/clinic singletons. 19 `as any` / `as unknown` casts. Three broadcast-content shape eras (v3 flat / v4 sections) decoded in `parseBodyShape` (lines 885-964) and a parallel `audience_filter` v1/v2/v3 projector (lines 982-1032). | Split into `lib/data/pets.ts`, `lib/data/inbox.ts`, `lib/data/billing.ts`, `lib/data/broadcasts.ts`. Extract `parseBodyShape` + `projectV3Group` + `fillGroup` into `lib/data/broadcasts-migrations.ts` shared with `draft-state.ts:332-528` (same migration logic, duplicated). |
| F002 | Architectural decay | `apps/dashboard/components/broadcast/composer-canvas.tsx:1-1316` | Critical | M | 1,316-LOC client component declares 10 internal subcomponents (`FieldBlock`, `SectionEditor`, `SectionIconButton`, `AddSectionRow`, `AddSectionChip`, `AudiencePill`, `SamplePetRow`, `TranscriptDialog`, `SaveStateLabel`, `describeAudiencePill`) inline. Includes its own autosave debounce / hash / promise-chain logic (lines 139-273) that belongs in a hook. | Extract `SectionEditor` (lines 816-1051) and the autosave logic (`useBroadcastAutosave`) into separate modules. Keep `ComposerCanvas` as the layout shell + state-wiring only. Target: <500 LOC for the main component. |
| F003 | Consistency rot | `packages/design-tokens/src/tailwind-preset.ts:85-95` vs `apps/dashboard/tailwind.config.ts:35-46` | Critical | S | Same Tailwind class renders different sizes in different apps. Preset: `md`=13px, `base`=14px, `lg`=15px, `xl`=17px. Dashboard override: `base`=13px, `md`=14px, `lg`=17px (no xl). Petparent inherits the preset, so a shared component would render visibly different. `CLAUDE.md` documents the dashboard's values as canonical. | Make the preset match the dashboard's values, delete the dashboard's `fontSize` override block. Verify petparent doesn't regress (its `tailwind.config.js` inherits the preset; values would shift but match design-system intent). |
| F004 | Consistency rot | `packages/design-tokens/src/colors.ts:30-39` + `apps/petparent/lib/pet-data.ts:132-143` + `apps/petparent/screens/PetPage.tsx:35-43` | Critical | S | Brand and fur-tone hex values triplicated. `design-tokens` is the workspace dep (petparent imports it via `tailwind.config.js`), but `PetPage` redeclares `INK`, `INK_SOFT`, `INK_FAINT`, `CANVAS`, `BERRY`, `BERRY_DEEP` as local const, and `pet-data.ts` redeclares all 10 fur hexes as `FUR_HEX`. Any palette tweak requires editing 3 files. | Export `FUR_HEX` from `@pawkit/design-tokens` (derive from `palette`), import in `PetPage.tsx` and `pet-data.ts`. Replace inline structural constants in `PetPage.tsx` with `palette.ink`, `palette.berry`, etc. |
| F005 | Documentation drift | `CLAUDE.md:32-46` ("v0 has TWO AI features, both Sarvam-vendor") + `MEMORY.md` `feedback_ai_scope.md` | High | S | Project rule says only Sarvam STT + Sarvam Translate are wired, "NO Sonnet Broadcast drafting. No Haiku classifier." Reality (locked 2026-05-18 per `docs/decisions-log.md`): `apps/dashboard/lib/groq.ts` + `app/api/broadcast/structure/route.ts` invoke Groq Llama 3.3 70B for transcript-to-broadcast structuring, called from `components/broadcast/voice-first-landing.tsx:205,248`. `MEMORY.md`'s `feedback_ai_scope.md` is even further behind (still mentions Haiku). | Update `CLAUDE.md` "AI scope" paragraph to acknowledge three vendors: Sarvam STT, Sarvam Translate, Groq structuring. Update `MEMORY.md/feedback_ai_scope.md` to the same. Memory rule says memory is authoritative on conflict, so memory should match reality first. |
| F006 | Documentation drift | `CLAUDE.md:51` + `docs/schema.md` (referenced) | Medium | S | `CLAUDE.md` says "Schema (14 tables across migrations 0001-0007)". Only 0001 through 0006 exist on disk. Patch 15 (storage RLS) shipped as 0006_storage_rls.sql, not 0007. | Change "0001-0007" to "0001-0006" in `CLAUDE.md`, sync `docs/schema.md` and `docs/critical-files.md` if they repeat the count. |
| F007 | Type & contract debt | `apps/dashboard/lib/data.ts` (19 occurrences) | High | M | `as any` / `as unknown as PetRow` casts threaded through every Supabase query result. `getInboxThreads` line 220 stores `latestByThread.set(m.thread_id, m)` against an untyped Map<string, any>. `getInvoiceById` lines 799-810 cast `inv as any` six times to read fields the query just selected. | Generate proper row types from `packages/db-types/src/database.types.ts` (which exists, 982 LOC of generated types, but isn't being imported here). Replace `as any` with `Database["public"]["Tables"]["pets"]["Row"]`-style types. |
| F008 | Duplicated logic | `apps/dashboard/lib/data.ts:880-964` (`parseBodyShape`) and `apps/dashboard/app/(dashboard)/broadcasts/draft-state.ts:332-385` (`liftFlatToSections` + `normaliseSections`) | High | M | Two parallel implementations of "lift legacy broadcast body shape into v4 sections". Diverge subtly: `parseBodyShape` doesn't handle the legacy summer-seed reset path; `migrateLegacyDraft` does. Same legacy field names (`summary`, `warningSigns`, `escalation`), same fallback rules, two separate files. | Extract a `liftBroadcastBody(raw): { body, sections }` helper into a single module both files import. Match the more permissive of the two impls. |
| F009 | Duplicated logic | `apps/dashboard/lib/data.ts:982-1032` (audience_filter v1/v2/v3 projection) | High | M | Three eras of `audience_filter` JSON shape decoded in one function: v1 flat (`species`, `ageMin`, `ageMax`), v2 (`groupA`/`groupB`), v3 (`conditionGroups`). `fillGroup` and `projectV3Group` rebuild the same union one row at a time. Same projection logic appears in `draft-state.ts:504-528` (`legacyFilterToConditions`). | Move both projectors into a shared `lib/broadcast-audience-migrations.ts`. Decide: do you still need v1+v2 round-trip support, or can you backfill seeded rows to v3 once and drop the legacy decoders? |
| F010 | Architectural decay | `apps/dashboard/components/broadcast/composer-canvas.tsx:1005-1033` | High | S | Hand-rolled `<input type="text">` inside the section bullet list. `CLAUDE.md` "NO hand-rolled UI primitives. Ever" rule was locked 2026-05-15 after four audit rounds. This one survived. | Replace with shadcn `<Input>` (already imported on line 29) configured with the same className. Keep the inline keydown handler. |
| F011 | Consistency rot | `apps/dashboard/components/ui/vet-byline.tsx:115,128` + `components/broadcast/composer-canvas.tsx:472,782` + `components/broadcast/voice-dump-coachmark.tsx:71` + `composer-canvas.tsx:1181` | High | S | `CLAUDE.md` "Eyebrow letter-spacing is `tracking-[0.14em]` everywhere" rule has 6 violations: four `tracking-[0.08em]`, one `tracking-[0.04em]`, one `tracking-[0.1em]`. Audit Round 4 found 50+ off-scale uses, this is the residue. | Sweep these 6 sites to `tracking-[0.14em]`. Audit nightly via a simple ripgrep one-liner in pre-commit if you want to prevent reintroduction. |
| F012 | Architectural decay | `apps/dashboard/app/(dashboard)/broadcasts/draft-state.ts:405-501` | High | M | `migrateLegacyDraft` handles v1, v2, v3 → v4 shape migrations on the client. Same file also exports `SAMPLE_SUMMER_DRAFT` (lines 226-286) that's flagged in `migrateLegacyDraft` as "isUneditedSummerSeed" and explicitly reset — a constant the code is wired to forget about. | Drop `SAMPLE_SUMMER_DRAFT`, drop the `isUneditedSummerSeed` detection, drop the v1+v2 migrators if no browser still has those shapes in localStorage (bump `STORAGE_VERSION` to clear them on read). Keep v3→v4 only. |
| F013 | Architectural decay | `apps/dashboard/app/(dashboard)/billing/billing-client.tsx` (824 LOC) | Medium | M | Single client component handles month picker, KPI cards, search hint, ledger, pagination. Internal `MonthPicker` (lines 119+), `KpiCards`, `Ledger`, `SearchHint`, `Pagination` all declared inline. | Split into `components/billing/MonthPicker.tsx`, `KpiCards.tsx`, `Ledger.tsx`. Same shape as the recommended split for `composer-canvas.tsx`. |
| F014 | Architectural decay | `apps/dashboard/app/(dashboard)/settings/settings-client.tsx` (689 LOC) | Medium | M | Similar pattern: single client component, ~22 uses of `text-ink-N` rgba shadow tokens (defined only in dashboard `globals.css`, not in the design-tokens package). | Extract sections by tab; align ink-N token naming with the design-tokens package (`ink.soft`, `ink.faint`) or formalize the rgba variants by adding them to the preset. |
| F015 | Consistency rot | `apps/dashboard/components/broadcast/voice-first-landing.tsx:510` | Medium | S | Inline gradient hardcodes three hex values (`#A53565 0%, #9C2B5C 50%, #7C1F47 100%`). `#A53565` is invented inline — it's not in the `palette`. The other two are `berry` + `berry-deep`. | Define a `berry-gradient` token in `design-tokens` or extract the gradient as a Tailwind utility. Drop the inline hex. |
| F016 | Type & contract debt | `apps/dashboard/lib/data.ts:200-204` | Medium | S | Inbox-thread query uses `.select("...messages, pet:pets!inner(id, ...)")` then immediately walks `latestByThread.set(m.thread_id, m)` against an inferred `any` shape. Schema drift would not surface until runtime. | Add a `MessageWithPet` type in `seed.ts` (or `db-types`) reflecting the joined shape, annotate `.select` result via `.returns<MessageWithPet[]>()`. |
| F017 | Type & contract debt | `apps/dashboard/lib/sarvam.ts:41,72` + `lib/groq.ts` (multiple) | Medium | S | `catch (e: any)` then `e?.message ?? "..."`. Five of these across sarvam/groq routes. Same pattern in `app/api/sarvam-stt/route.ts:29`, `sarvam-translate/route.ts:26`. | Type catches as `unknown`, narrow with `e instanceof Error ? e.message : String(e)`. Three of these are in API routes that return the message to the client — bounded but not guaranteed safe. |
| F018 | Error handling | `apps/dashboard/components/broadcast/composer-canvas.tsx:199,243` | Medium | S | Two `.catch(() => {})` on the autosave chain. Silent swallow means a failing autosave never surfaces unless the next state-change happens to recover. The error handling for save state ("error" branch on line 222-226) exists but only fires when the inner try catches — the outer chain catch never reaches it. | Either remove the outer `.catch(() => {})` (let the inner try be the only catch), or have it set `saveState("error")`. Right now the chain protects against unhandled-promise warnings but loses the failure signal. |
| F019 | Architectural decay | `apps/dashboard/components/broadcast/voice-first-landing.tsx:203-215` | Medium | S | "Warmup ping" effect fires a POST on every page mount with `{warmup: true}` purely to load Next's compiled route + Groq SDK module. Caveat documented but is dev-mode tooling living in production code. | Gate the warmup on `process.env.NODE_ENV === "development"` or remove now that the path is being deployed via Vercel build (which precompiles, so the cold-start problem is dev-only). |
| F020 | Consistency rot | `apps/petparent/screens/PetPage.tsx:43-44` | Medium | S | `const PAPER = CANVAS; const TEAL = BERRY;` — "legacy aliases for any in-file usages that haven't been swept yet; remove on Day-4". Today is 2026-05-18; Day 4 was the build week, which has passed. | Sweep `PAPER` and `TEAL` references in the file, drop the alias declarations. |
| F021 | Architectural decay | `apps/petparent/App.tsx:25-33` | Low | S | Loads 7 Google Fonts (`Inter_400`/`500`/`600`/`700`, `Lora_400`/`600`/`600_Italic`). `PetPage.tsx` references only `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`. Inter 700 and the three Lora weights are loaded but unused in the current single-screen build. | Drop the unused weights from `useFonts` until a surface actually uses them. Saves font payload on demo phone first-launch. |
| F022 | Type & contract debt | `apps/dashboard/lib/data.ts:447,521,549,574,802` | Medium | S | Pet identity check `pet?.name === "Gabby" && (pet as any).household?.name === "The Fernandes Family"` repeated 5 times across `getSoapHistory`, `getInvoicesForPet`, `getInvoiceDetail`. The string `"The Fernandes Family"` is a magic constant that also appears in `migrations/0004_v0_demo_anon_reads.sql:16`. | Extract `isFernandesGabby(pet)` helper and a `FERNANDES_HOUSEHOLD_NAME` constant in `lib/seed.ts`. |
| F023 | Architectural decay | `apps/dashboard/lib/data.ts:160-170` and lines `415-437`, `459-475` | Medium | S | Inline IST date formatting (`toLocaleDateString("en-IN", {..., timeZone: "Asia/Kolkata"})`) repeated 12+ times across getters with slightly different `month`/`day`/`year` options. | Extract `formatIstShortDate`, `formatIstLongDate`, `formatIstDayMonthYear` helpers. Already partially started — `formatIssuedDate` (line 595) is one of these but isn't reused. |
| F024 | Test debt | `packages/match-logic/src/__tests__/fixtures.test.ts` is the only test file in the repo | High | M | Only `match-logic` has tests (164 LOC). `apps/dashboard`, `apps/petparent`, and the audience-resolver in `actions.ts` (which has non-trivial AND/OR set algebra) have zero coverage. The audience resolver is the highest-risk untested code in the demo path: a wrong count silently shows the vet they're broadcasting to fewer/more parents than they are. | Add unit tests for `getAudienceCountAction` covering: empty groups, single-condition wide-open group, age-range bounds, deceased exclude, lastVisit windows, OR-union dedupe across groups. |
| F025 | Dependency debt | `apps/dashboard/package.json:14-32` | Medium | S | `groq-sdk` (24KB minified) is loaded but `CLAUDE.md` says no AI structuring; reality says Groq is in scope. Once the doc is updated (F005), this is fine. But: SDK is server-only, so confirm the bundle doesn't include it (Next dynamic imports). | After resolving F005, run `npx depcheck` to verify no other accidental dependencies leaked in. |
| F026 | Security hygiene | `apps/dashboard/lib/supabase-server.ts:24` | Medium | S | Service-role key (RLS-bypass) is loaded into every server component via `force-dynamic` rendering and used for every dashboard query. v0 demo decision is documented (line 18-22) but the comment says "Replace with proper Supabase Auth + RLS-by-role in v0.1+". For demo, fine; for any post-demo use, this is the single biggest auth gap. | Track as v1+ work; not blocking demo. Document in `docs/risk-register.md` if not already there. |
| F027 | Documentation drift | `docs/supabase-config.md` (referenced) vs `supabase/migrations/0006_storage_rls.sql` | Low | S | Memory note `project_storage_rls.md` says "Storage RLS policies are aspirational; supabase-config.md describes RLS-by-household for messages-* buckets but zero policies exist". Migration 0006 (Patch 15, 2026-05-16) fixed this — RLS policies now exist for `pet-photos`, `messages-images`, `messages-videos`, `broadcast-covers`. | Update `MEMORY.md/project_storage_rls.md` to "Resolved 2026-05-16 by migration 0006_storage_rls.sql". Memory rule says memory is authoritative; stale "aspirational" claim is now wrong. |
| F028 | Error handling | `apps/dashboard/components/broadcast/use-voice-recorder.ts:259,281` + `apps/dashboard/app/(dashboard)/broadcasts/draft-state.ts:307,325,564,581,594,856` | Low | S | 8 sites of empty `catch {}`. Some are intentional (localStorage may throw in private-browsing; safe to swallow). Some bury real errors. | Audit each: keep the swallow with a one-line comment explaining why, or replace with `catch (e) { console.warn("[draft]", e); }` so a corrupt-storage bug isn't silent. |
| F029 | Consistency rot | `apps/dashboard/app/globals.css:36-38,129-131` (`--ink-70`, `--ink-50`, `--ink-30` rgba variants) | Low | S | The dashboard defines `text-ink-70` / `text-ink-50` / `text-ink-30` as rgba opacities of Ink, used 200+ times. The design-tokens preset only ships `ink.DEFAULT`, `ink.soft`, `ink.faint`. The two naming conventions exist side by side and neither dominates. | Pick one: add `ink.50`, `ink.70`, `ink.30` to the preset (so petparent gets them too), OR sweep `text-ink-50` in the dashboard to `text-ink-faint`/`text-ink-soft`. The first is cheaper, the second matches the design-tokens contract better. |
| F030 | Architectural decay | `apps/dashboard/app/(dashboard)/broadcasts/draft-state.ts:226-286` | Low | S | `SAMPLE_SUMMER_DRAFT` is exported but never imported. Comment says "preserved as an exported constant for future Load example affordances. NOT auto-loaded on page open." It also triggers a special-case reset on hydration (line 411-414). | Drop the constant and the matching `isUneditedSummerSeed` branch — neither is reachable, and the special-case reset is the kind of code that breaks when somebody forgets it exists. |
| F031 | Documentation drift | `apps/petparent/screens/PetPage.tsx:42-44` ("legacy aliases ... remove on Day-4") | Low | S | "Day-4 prep work" comment lists `lucide-react-native → phosphor-react-native` swap and `Spectral → Lora` font swap as complete. Same comment line 43 marks `PAPER`/`TEAL` aliases as "remove on Day-4". Day 4 is in the rear-view; aliases still exist. | See F020. |
| F032 | Performance & resource hygiene | `apps/dashboard/lib/data.ts:194-324` (`getInboxThreads`) | Medium | M | Single function does three DB roundtrips serially: messages-with-pet join, follow_up_windows, visits-for-case-chip. The visits query happens after the message walk (line 236-247), which can't start until the messages query completes. Also: all messages are loaded into memory then filtered to "active" or "inactive" — at 50-pet seed scale this is fine, at clinic scale it isn't. | Run the three queries in parallel via `Promise.all`. Push the active/inactive filter into the SQL `WHERE` clause (or build a view) so memory doesn't grow with thread count. |
| F033 | Documentation drift | `docs/critical-files.md` (referenced) | Low | S | `CLAUDE.md` "How to find things" table claims `apps/dashboard/components/ui/` houses Avatar, Badge, Button, Checkbox, Dialog, DropdownMenu, Input, Popover, Sheet, Skeleton, Tabs, Textarea, ToggleGroup, Tooltip. Reality: also includes `pet-avatar.tsx`, `universal-voice-input.tsx`, `vet-byline.tsx`, `vet-byline-preview.tsx`, `voice-mic.tsx` (not shadcn primitives — Pawkit-specific). | Either document the Pawkit additions in `CLAUDE.md` or move them out of `components/ui/` (since the rule is "every interactive element in `apps/dashboard/**` must use a shadcn primitive from `components/ui/`" — having non-primitives there muddies the rule). |

## Top 5: if you fix nothing else, fix these

### 1. Split `lib/data.ts` (F001)

A 1,309-LOC server-only data layer mixing 7 unrelated concerns is the single biggest blocker for any future change in the dashboard. The audience-resolver migration logic alone (lines 982-1032) is duplicated in `draft-state.ts:332-528`, which means any tweak to the v3 condition-groups shape now needs two coordinated edits. The 19 `as any` casts make schema drift invisible until runtime.

Refactor sketch:
```
apps/dashboard/lib/data/
├── pets.ts          (adaptPet, getPet, household helpers)
├── inbox.ts         (getInboxThreads, getThreadBubbles, getOpenWindow)
├── clinical.ts      (getClinicalHistory, getSoapHistory, parseStructuredSoap)
├── billing.ts       (getBillingStats, getBillingLedger, getInvoiceById, formatters)
├── broadcasts.ts    (getBroadcastById, getSentBroadcasts, getDraftBroadcasts)
└── _shared/
    ├── audience-migrations.ts  (shared with draft-state.ts)
    └── ist-dates.ts            (formatIstShortDate, ...)
```

Don't rewrite — move-and-extract. The current logic is correct; the architecture is what's wrong.

### 2. Reconcile the type-scale divergence (F003)

```ts
// packages/design-tokens/src/tailwind-preset.ts (current, WRONG):
fontSize: {
  md: ['13px', ...],
  base: ['14px', ...],
  lg: ['15px', ...],
  xl: ['17px', ...],
}

// apps/dashboard/tailwind.config.ts (override, RIGHT per CLAUDE.md):
fontSize: {
  base: ['13px', ...],
  md: ['14px', ...],
  lg: ['17px', ...],
  // no xl
}
```

Replace the preset's `fontSize` block with the dashboard's. Delete the override. Verify petparent renders correctly (it has only one screen, so the visual diff is tractable). This is a 10-minute change and unblocks shared components.

### 3. Update `CLAUDE.md` and `MEMORY.md` AI scope (F005)

`CLAUDE.md` "Working preferences > AI scope is strictly minimum" paragraph (lines 32-46) describes a world where Sarvam is the only vendor. Reality, locked 2026-05-18:

- Sarvam Saarika v2.5 STT — voice input
- Sarvam Translate v1 — EN ↔ MR
- **Groq Llama 3.3 70B versatile** — transcript-to-structured-broadcast (NHS care-card shape)

The Groq path is well-implemented (graceful fallback, 25s timeout, vet-edits-before-publish safety gate). It's not the problem; the stale doc is. Update both `CLAUDE.md` and `MEMORY.md/feedback_ai_scope.md` to reflect the third vendor. Without this, the next session's Claude will read the rule as gospel and try to "fix" Groq out of the codebase.

### 4. Extract `composer-canvas.tsx` into 3 files (F002)

```
components/broadcast/
├── composer-canvas.tsx          (shell + state-wiring, ~400 LOC)
├── composer/section-editor.tsx  (was lines 816-1077, ~300 LOC)
├── composer/use-autosave.ts     (was lines 139-273, ~150 LOC hook)
└── composer/parts.tsx           (FieldBlock, AddSection*, AudiencePill, SamplePetRow, ~200 LOC)
```

The `useBroadcastAutosave` hook is the most extractable piece — it owns the debounce timer, the hash diff, the promise chain, and the save-state state machine. Pulling it out makes both the composer testable and the autosave invariants (promise-chain prevents duplicate INSERTs, hash skips no-ops, draftIdRef syncs externally) reviewable in isolation.

### 5. De-duplicate brand hex (F004)

```ts
// packages/design-tokens/src/colors.ts (add to existing palette block)
export const FUR_HEX: Record<FurTone, string> = {
  milk: palette.milk,
  vanilla: palette.vanilla,
  honey: palette.honey,
  peach: palette.peach,
  rust: palette.rust,
  mushroom: palette.mushroom,
  smoke: palette.smoke,
  steel: palette.steel,
  bark: palette.bark,
  sable: palette.sable,
};
```

Then in `apps/petparent/lib/pet-data.ts`, replace lines 132-143 with `import { FUR_HEX } from '@pawkit/design-tokens';`. In `apps/petparent/screens/PetPage.tsx:35-44`, replace `INK`, `INK_SOFT`, etc. with imports from `palette`. This is mechanical and removes a real Day-N maintenance trap.

## Quick wins (Low effort × Medium-or-higher severity)

- [ ] **F006**: Change "0001-0007" → "0001-0006" in `CLAUDE.md` and `docs/schema.md`.
- [ ] **F010**: Swap `<input type="text">` for shadcn `<Input>` in `composer-canvas.tsx:1005`.
- [ ] **F011**: Sweep 6 tracking-em violations to `tracking-[0.14em]`.
- [ ] **F015**: Replace inline `#A53565` gradient hex in `voice-first-landing.tsx:510` with a design-tokens utility.
- [ ] **F020**: Delete `PAPER = CANVAS` and `TEAL = BERRY` aliases in `PetPage.tsx:43-44` and sweep their references.
- [ ] **F021**: Drop unused font weights from `apps/petparent/App.tsx:25-33`.
- [ ] **F022**: Extract `FERNANDES_HOUSEHOLD_NAME` constant + `isFernandesGabby` helper.
- [ ] **F025**: Run `npx depcheck` against the dashboard, drop any unused deps.
- [ ] **F027**: Update `MEMORY.md/project_storage_rls.md` to "Resolved 2026-05-16 by 0006_storage_rls.sql".
- [ ] **F030**: Delete `SAMPLE_SUMMER_DRAFT` + `isUneditedSummerSeed` branch from `draft-state.ts`.

## Things that look bad but are actually fine

- **The service-role key bypassing RLS in the dashboard** (`lib/supabase-server.ts`) reads alarming, but it's a documented v0 decision (no auth wired, single-vet demo, `force-dynamic` rendering everywhere). The `"server-only"` import on line 1 prevents leakage to client bundles. F026 captures the v1+ work; not a real flag for v0.
- **The Groq "warmup ping" on page mount** (`voice-first-landing.tsx:203-215`) looks like a footgun (an effect that POSTs on every render), but `{warmup: true}` is explicitly checked server-side and short-circuits before calling Groq (`route.ts:39-42`). Cost is one Next route invocation per page load. F019 captures the production-vs-dev cleanup.
- **The `audience_filter` v1/v2/v3 multi-shape decoder** (`lib/data.ts:982-1032`) looks like the kind of legacy soup that wants to be deleted, but seeded broadcasts in the DB are stored in v1/v2 shape (see seed scripts under `supabase/seed/`), and the detail page genuinely needs to render them all. F009 captures the consolidation into a shared helper, not the deletion.
- **The `Promise chain ensuring at most ONE save is in flight`** (`composer-canvas.tsx:152` + line 198) looks over-engineered, but the comment is correct: rapid edits + slow network really do produce duplicate draft rows without this. The chain is load-bearing.
- **The hand-rolled `<input type="file">` in `cover-photo-slot.tsx:104,307` and `settings-client.tsx:590`**: not a shadcn-rule violation — shadcn doesn't ship a FileInput primitive, and these are hidden inputs triggered by a wrapping `<Button>`. Standard pattern.
- **`@pawkit/db-types/src/database.types.ts` at 982 LOC**: auto-generated from Supabase via `pnpm db:types`. Not a god file; touching it manually would be the bug.
- **`packages/match-logic` has its own test setup but other packages don't**: match-logic is the only piece with real algorithmic complexity (k-means + Delta-E 2000 in CIELAB space). The dashboard data layer is mostly query-and-adapt, which is harder to unit-test usefully. F024 still flags the audience-resolver as worth covering, but blanket "add tests everywhere" would be ceremony.

## Open questions for the maintainer

- **`SAMPLE_SUMMER_DRAFT` in `draft-state.ts:226-286`**: the comment says "NOT auto-loaded on page open. If we ever add a drafts list or examples menu, this is the canonical Pawkit demo broadcast". Is the "Load example" affordance still on the v0+ roadmap, or has it been deferred and the constant should be deleted (F030 assumes deletion)?
- **`apps/dashboard/lib/seed.ts` (330 LOC)**: holds both type definitions used by `lib/data.ts` AND demo fallback objects (`gabbySoapCards`, `gabbyMay6Invoice`, `gabbyInvoices`, `demoBroadcast`). The file is named `seed.ts` but isn't a seed script — it's a hybrid types+fixtures module. Worth renaming to `lib/types.ts` and moving fixtures elsewhere?
- **`apps/dashboard/components/ui/` non-primitives** (`pet-avatar`, `universal-voice-input`, `vet-byline`, `vet-byline-preview`, `voice-mic`): `CLAUDE.md` reserves `components/ui/` for shadcn primitives. These are Pawkit-specific composites. Move them to `components/pawkit/` or update the rule's documented scope (F033)?
- **`getActiveThreadCount()` in `lib/data.ts:327-330`** runs `getInboxThreads(undefined, "active")` and counts the array. With the layout being `force-dynamic` (re-runs every request) and seeded at ~50 threads, that's a full inbox query just to render a sidebar badge. Worth a dedicated `count(*)` query, or is the demo data small enough that it doesn't matter?
- **Petparent app delivery (EAS APK)**: `CLAUDE.md` says the demo APK should be built T-2 before the demo. With today being 2026-05-18 and the demo window being "mid-May 2026", has the APK been built and smoke-tested yet? If not, that's a more urgent risk than anything in this audit.
- **Groq cost / latency in production**: the `25s hard timeout` in `voice-first-landing.tsx:230-232` and the fallback to `rawTranscript`-in-body suggest the team has experienced slowdowns. Should the audit track Groq P95 latency? Or is the fallback-good-enough framing the final call?
