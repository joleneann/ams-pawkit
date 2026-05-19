# Tech Debt Plan, Pawkit v0 → V1

Locked 2026-05-18 from the audit at `TECH_DEBT_AUDIT.md`. **All Phase 0 items are done.** Phase 1-4 must be executed before any V1 feature work starts. Phase 5 is V1+ scope to track in `docs/risk-register.md`.

## Demo-first principle

The Sagar demo (mid-May 2026 window) is the gate. Phase 0 was the only safe set of changes to ship before the demo because it's doc + memory only. Phase 1 has real code-touch risk on the parent app + composer; do not ship before the demo without a smoke-test on the demo phone.

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | ✅ Done 2026-05-18 | Doc + memory drift fixes |
| Phase 1 partial | ✅ Done 2026-05-18 | Safe pre-demo subset shipped: F011, F015, F022, F028, F006-A |
| Phase 1 remainder | ⏳ Scheduled post-demo | Risky items deferred: F010, F020, F021, F025, F029, F030 |
| Phase 2 | ⏳ Scheduled post-demo | Small Critical refactors (1 day) |
| Phase 3 | ⏳ Scheduled post-demo | God-file splits (5 days) |
| Phase 4 | ⏳ Scheduled post-demo | Test debt (2 days, ongoing) |
| Phase 5 | ⏳ V1+ scope | Auth + RLS replacement |

---

## Phase 0 — Doc + memory drift (DONE 2026-05-18)

All five items shipped in the same session that generated this plan. Zero code-touch risk; pure documentation alignment.

| ID | What | Where | Outcome |
|----|------|-------|---------|
| F005 | Update AI scope to acknowledge **3 vendors** (Sarvam STT + Sarvam Translate + Groq Llama 3.3 70B) | `CLAUDE.md` lines 63-86, `MEMORY.md/feedback_ai_scope.md` | Future sessions won't try to "fix" Groq out of the codebase |
| F006 | Migrations "0001-0007" → "0001-0006 on disk; 0007 in DB" | `CLAUDE.md`, `AGENTS.md`, `docs/schema.md` | Honest count |
| F006-A | **NEW:** `0007_security_hardening.sql` is in the production DB but the file isn't committed to `supabase/migrations/` | Tracked here, recovery in Phase 1 | See "Phase 1" below |
| F027 | Storage RLS memory: "aspirational" → "Resolved 2026-05-16 by 0006_storage_rls.sql" | `MEMORY.md/project_storage_rls.md` | Memory + reality aligned |
| F031 | Stale "Day-4 prep work" comments in `PetPage.tsx` | `apps/petparent/screens/PetPage.tsx` | Comment now links to tech-debt-plan |
| F033 | Document the `components/ui/` Pawkit composites carve-out | `CLAUDE.md` | Rule reflects reality + flags Phase 1 move |

---

## Phase 1 — Quick wins (1-2 days post-demo)

Small mechanical fixes. Bundle into 1-2 PRs.

### F006-A (NEW): Recover `0007_security_hardening.sql`

Migration was applied to prod DB on 2026-05-17, file never committed. Per `status.md` and `CLAUDE.md` it did:
- Revoked anon/authenticated EXECUTE on `reset_all_data()` + `rls_auto_enable()`
- Pinned `search_path` on six functions
- Added public-read policy on `clinics`

**Action:**
1. `pg_dump --schema-only --no-owner -t 'public.*' -t 'storage.*' >  pg-current.sql` against prod
2. Diff against the 0001-0006 files to extract the 0007 deltas
3. Reconstruct `supabase/migrations/0007_security_hardening.sql`
4. Re-apply to staging to confirm idempotency (should be no-op since already applied)

**Risk:** None if you don't re-apply to prod. **Effort:** 1-2 hours.

### F010: Hand-rolled `<input>` in composer bullets

`composer-canvas.tsx:1005` uses raw `<input type="text">`. Swap to shadcn `<Input>` (already imported on line 29). Preserve the inline keydown handler verbatim.

**Risk:** Medium. This is on the highest-visibility demo screen. Validate:
- Enter still adds a new bullet at idx+1
- Backspace on empty bullet still removes the bullet
- Focus moves correctly across bullets
- onFocus still fires `onBulletFocus(i)` so the universal mic targets the right field

**Effort:** 10 min code + 10 min manual smoke test.

### F011: Tracking-em violations sweep

Six sites use `tracking-[0.08em]`, `tracking-[0.04em]`, or `tracking-[0.1em]` instead of the locked `tracking-[0.14em]`.

| File | Line |
|------|------|
| `components/ui/vet-byline.tsx` | 115, 128 |
| `components/broadcast/composer-canvas.tsx` | 472, 782 |
| `components/broadcast/voice-dump-coachmark.tsx` | 71 |
| `components/broadcast/composer-canvas.tsx` | 1181 |

**Risk:** None visible. **Effort:** 15 min.

### F015: Inline gradient hex

`voice-first-landing.tsx:510` (mic button background) hardcodes 3 hex values including `#A53565` which isn't in the palette. Either:
- (a) Define `--berry-gradient` CSS var in design-tokens, use `bg-[var(--berry-gradient)]`
- (b) Add a Tailwind utility `bg-berry-gradient` to the preset

**Risk:** Visual diff on the hero mic. **Effort:** 20 min.

### F020: Drop `PAPER` / `TEAL` aliases in `PetPage.tsx`

```ts
const PAPER = CANVAS;
const TEAL = BERRY;
```

Sweep references in the file. Drop both.

**Risk:** If a reference is missed, the parent app breaks at that site. Demo phone smoke test required. **Effort:** 30 min.

### F021: Drop unused font weights

`apps/petparent/App.tsx:25-33` loads Inter 700 + Lora 400/600/600_italic. `PetPage.tsx` uses only Inter 400/500/600.

**Risk:** If a font weight IS used and the audit was wrong, parent app falls back to system font. Demo phone smoke test required. **Effort:** 5 min + smoke test.

### F022: Fernandes household constant

5 sites of `pet?.name === "Gabby" && (pet as any).household?.name === "The Fernandes Family"` in `lib/data.ts`. Extract to `isFernandesGabby(pet)` + `FERNANDES_HOUSEHOLD_NAME`.

**Risk:** If a site is missed during sweep, that getter still uses magic strings (consistent with old behavior — no regression, just incomplete refactor). **Effort:** 30 min.

### F025: `npx depcheck`

Run against `apps/dashboard`. Drop any unused deps. Verify build still passes.

**Risk:** If a dep is used only at runtime via dynamic import, depcheck flags as unused but removing breaks at runtime. Build + smoke test required. **Effort:** 15 min.

### F028: Empty catch sweep

8 sites of `catch {}`:
- `use-voice-recorder.ts:259,281` (cleanup; intentional)
- `draft-state.ts:307,325,564,581,594,856` (localStorage; mostly intentional)

Annotate each with a one-line "why swallowed" comment OR add `console.warn` for the ones that could mask real bugs.

**Risk:** None if just comments. **Effort:** 20 min.

### F029: Ink rgba reconciliation

Dashboard uses `text-ink-30/50/70` (rgba opacities). Design-tokens preset only has `ink.DEFAULT/soft/faint`. Pick: add the rgba variants to the preset (cheaper) OR sweep dashboard usage.

**Risk:** If sweeping dashboard, 200+ visual touches. Path-of-least-resistance is adding the variants to the preset. **Effort:** 30 min (preset path).

### F030: Drop `SAMPLE_SUMMER_DRAFT` + special-case branch

`draft-state.ts:226-286` exports a constant that's never imported, plus a hydration branch (`isUneditedSummerSeed`) that resets to default when this specific stale shape is seen.

**Risk:** If a vet has the old summer-seed cached in browser localStorage, removing the special case means they see the stale draft instead of a blank composer. Mitigation: bump `STORAGE_VERSION` so all old shapes get migrated. **Effort:** 15 min.

### Phase 1 total: ~3-4 hours

---

## Phase 2 — Small Critical refactors (1 day post-demo)

### F003: Type-scale divergence

`packages/design-tokens/src/tailwind-preset.ts:85-95` has different fontSize values than `apps/dashboard/tailwind.config.ts:35-46`. Dashboard's is canonical per `CLAUDE.md`.

**Action:** Update preset to match dashboard. Delete dashboard override. Verify petparent renders.

**Risk:** Visual diff in petparent (single screen — tractable smoke test).

### F004: De-duplicate brand hex

Export `FUR_HEX` from `@pawkit/design-tokens`. Replace inline declarations in `pet-data.ts` + `PetPage.tsx`.

**Risk:** None if imports are correctly added. **Effort:** 1 hour.

### F008 + F009: Shared audience-migrations module

Extract `parseBodyShape` (data.ts:885-964), `liftFlatToSections` + `normaliseSections` (draft-state.ts:332-385), and `audience_filter v1/v2/v3 projection` (data.ts:982-1032) into `lib/_shared/audience-migrations.ts` consumed by both files.

**Risk:** If the consolidated impl is subtly less permissive than either original, legacy rows break. Use the more permissive of the two as the base. **Effort:** 2 hours.

---

## Phase 3 — God-file splits (5 days post-demo)

These are the big architectural moves. Schedule after Phase 1-2 land.

| ID | File | Target | Effort |
|----|------|--------|--------|
| F001 | `lib/data.ts` (1,309 LOC) | Split into `lib/data/{pets,inbox,clinical,billing,broadcasts}.ts` + `_shared/` | 1 day |
| F002 | `composer-canvas.tsx` (1,316 LOC) | Split into shell + `composer/section-editor.tsx` + `composer/use-autosave.ts` hook + `composer/parts.tsx` | 1 day |
| F007 | 19 `as any` casts in data layer | Replace with `Database["public"]["Tables"][...]["Row"]` types from `@pawkit/db-types` | 0.5 day |
| F012 | Drop v1+v2 localStorage migrators in `draft-state.ts` | Bump `STORAGE_VERSION`, keep v3→v4 only | 1 hour |
| F013 | `billing-client.tsx` (824 LOC) | Split into `components/billing/{MonthPicker,KpiCards,Ledger}.tsx` | 0.5 day |
| F014 | `settings-client.tsx` (689 LOC) | Split by tab | 0.5 day |
| F016 | Inbox-thread query type | `.returns<MessageWithPet[]>()` | 30 min |
| F017 | `catch (e: any)` everywhere | Narrow to `e instanceof Error` | 30 min |
| F019 | Groq warmup ping | Gate on `NODE_ENV === "development"` | 5 min |
| F023 | IST date formatters | Extract `formatIstShortDate` etc., replace 12+ inline duplicates | 30 min |
| F032 | `getInboxThreads` serial queries | Parallelize via `Promise.all`, push active/inactive into SQL | 1 hour |

### Phase 3 total: ~5 days

---

## Phase 4 — Test debt (2 days post-demo, ongoing)

### F024: Audience resolver tests

`getAudienceCountAction` in `actions.ts` is the highest-risk untested code in the demo path. A wrong count silently lies to the vet about reach. Add vitest coverage:

- Empty groups → 0 pets / 0 households
- Single condition group, species "both", age 0-30, deceased include, lastVisit any → 100% baseline
- Age range bounds (1-5 should exclude puppies under 1 and pets over 5)
- Deceased exclude drops households where every pet is deceased
- lastVisit "12m" drops pets with no visit in 12 months
- OR-union dedupe: two groups overlap, total = union (no double-count)

**Effort:** 1 day to write + test fixtures.

### Future: broadcast body-shape migrator tests

After Phase 2.3 consolidates the v3→v4 lift logic into `_shared/audience-migrations.ts`, add tests for that helper.

**Effort:** 0.5 day.

---

## Phase 5 — V1+ scope (not blocking V1 build start)

### F026: Service-role key → Supabase Auth

Dashboard currently uses the service-role key for every server-component query (RLS bypass). Documented v0 decision per the comment in `lib/supabase-server.ts:24`. For V1 (when more than Dr Sagar uses it):

1. Wire Supabase Auth with email magic links
2. Reverse the RLS posture: deny-by-default, grant clinic-staff read via row policy
3. Replace `supabaseServer` with a per-request authenticated client

**Risk:** Large refactor. Should not gate V1 feature work; can run as a parallel security workstream.

**Effort:** 1 week.

### F026 dependent: stronger storage RLS

The `0006_storage_rls.sql` policies are scoped to the Fernandes household by name (the v0 anon hack). For V1, replace name-match with proper auth.uid()-driven policies.

**Effort:** Folded into F026.

---

## Audit follow-throughs (not in numbered phases)

### "Things that look bad but are actually fine"

Per the audit:
- Service-role key bypassing RLS — documented v0 decision (F026 = V1+)
- Groq warmup ping — production effect but harmless cost (F019 makes it dev-only)
- audience_filter multi-shape decoder — seeded data needs all three eras (F009 consolidates, doesn't delete)
- Promise-chain in autosave — load-bearing, prevents duplicate INSERTs (keep)
- Hand-rolled `<input type="file">` — shadcn doesn't ship FileInput; pattern is fine
- `db-types/database.types.ts` 982 LOC — auto-generated, don't touch
- match-logic tests, others not — match-logic has real algorithmic complexity (k-means + Delta-E 2000); data adapters are query-and-adapt, harder to test usefully

### Open questions resolved 2026-05-18

| Question | Resolution |
|----------|------------|
| `SAMPLE_SUMMER_DRAFT` future? | Delete (F030 Phase 1) |
| Rename `lib/seed.ts`? | Yes, split into `lib/types.ts` + fixtures elsewhere — couple with F001 in Phase 3 |
| Move `components/ui/` composites? | Yes, to `components/pawkit/` (F033 → Phase 1 file move). For Phase 0 just documented the carve-out. |
| `getActiveThreadCount` full query? | Demo data is fine. Risk-register entry for v1+ scale work. |
| Petparent EAS APK status? | **Open blocker** — confirm built + smoke-tested on demo phone BEFORE any of this plan. |
| Groq P95 tracking? | Defer to post-demo observability work. Current 25s timeout + fallback is good enough for v0. |

---

## How to find things related to this plan

This plan supersedes ad-hoc tech-debt notes scattered in inline TODOs. When you encounter `TODO (tech-debt FNNN)` markers in code, look them up here.

| Marker style | Where logged |
|--------------|--------------|
| `TODO (tech-debt FNNN)` in source code | This document |
| Doc drift between CLAUDE.md / MEMORY.md / decisions-log.md | Phase 0 + run a fresh audit periodically |
| New tech debt introduced post-2026-05-18 | Add a new row below the relevant phase |

---

## Maintenance

Run a fresh audit (similar shape to `TECH_DEBT_AUDIT.md`) before each major milestone:
- Before V1 feature work begins (must pass Phase 1-4 first)
- Before each public release
- After every god-file split in Phase 3 (to ensure no new debt accumulated in extraction)
