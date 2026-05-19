# AGENTS.md (Pawkit v0, AMS pitch demo)

This is the index, not the encyclopedia. Every topic links to the file that owns it.
Read `status.md` first to learn current state. Read this file every session.

## Who I am
Jolene Fernandes. Building Pawkit to pitch Dr Sagar Bhongale (longtime family vet,
AMS Pune) for a growth+ops + co-founder slot. Not a software engineer by trade,
building with Codex. Strategic, not tactical. High visual taste; AI-slop
mockups distress me viscerally.

## What we're building
Pawkit v0, a two-app demo on Supabase:
- **Clinic dashboard:** Next.js, desktop-only, deployed to Vercel.
- **Parent app:** Expo SDK 54 Android app, delivered to the demo phone as a
  release APK built via `eas build --profile preview --platform android` and
  installed on the home screen (locked 2026-05-13; see
  `docs/decisions-log.md` Parent-app demo delivery). Expo Go is the dev-time
  iteration tool only, never on the demo phone.

Anchor: Fernandes household, 4 pets (Raffy male/deceased, Gabby male/alive,
Angel female/alive, Galaxy female/alive). Demo shape: ~15 min app demo
(laptop dashboard plus phone parent app) plus ~10-15 min growth-of-app
presentation. Total ~25-30 min, cannot bore him. Inside Sagar's mid-May
availability window.

## Current phase
Pre-build co-creation, restructured 2026-05-11 to put research before /
alongside design instead of after it:
1. Co-create flows (admin + parent), admin DONE, parent in edit pass
2. UI/UX research per screen + visual mockups, run in parallel
   (locked method 2026-05-11; see `docs/decisions-log.md` Platform and
   demo target). For each screen, Codex compiles two reference strands:
   3-4 **design references** (WhatsApp / Linear / Telegram / Discord /
   etc.) for UI taste, plus 2-3 **category competitors** (Pawp / AirVet /
   FirstVet / Petdesk / Klara / Rover / Wag / Vetsource / Pumpkin etc.)
   for feature grounding. Then builds HTML/CSS Pawkit mockups applying
   each direction → user picks → cluster cohesion check → final
   heuristic audit (Nielsen 10 + Pawkit-specific) before build. All
   screens covered, not hero-first. Existing `mockups/` files are
   reference-only; full per-screen redo.
3. Microcopy round (EN + MR), after Phase 2 locks
4. Build, after microcopy
5. Debug + rehearsal
6. Demo

(Removed: product elements phase, deferred to v1+ on 2026-05-11. TealCTA
anatomy folded into Day 1 of build foundations. See
`docs/decisions-log.md` Platform and demo target section.)

## Working preferences
- Slow co-creation. One focused decision at a time. AskUserQuestion for choices.
- Don't invent features. Confirm scope before adding to specs.
- **Mockup authorship reversed 2026-05-11.** Codex builds Pawkit mockups
  during Phase 2 (per-screen reference research, two strands: design
  references for UI taste + category competitors for feature grounding
  → HTML/CSS Pawkit mockups applying each direction → user picks). User
  does NOT author mockups herself anymore. Format: real reference
  screenshots (both strands) + HTML/CSS Pawkit mockups; captions only,
  no long descriptions. NEVER ASCII wireframes. Existing `mockups/`
  files are reference-only material from earlier brand exploration, not
  deliverable; full per-screen redo planned via Phase 2.
- AI scope is strictly minimum. v0 has TWO AI features, both Sarvam-vendor,
  both dashboard-only, both producing text Sagar reviews before output
  ships: (1) **Sarvam Audio** (with Whisper as English fallback) transcribes
  voice INPUT to text on dashboard compose surfaces (Broadcast body and
  structured-section fields, inbox reply); (2) **Sarvam Translate**
  auto-generates the other-language version of a Broadcast (EN ↔ MR) at
  compose time, surfaced as text Sagar reviews and approves sequentially
  before publish. NO AI on parent app. No Sonnet Broadcast drafting. No
  Haiku classifier. No AI-drafted replies. No AI Triage (permanently
  cancelled, see `docs/decisions-log.md`).
- Push back if you disagree. Lead with research. Have opinions.
- Bypass-permissions mode is on; don't ask before edits/bash.
- No em dashes anywhere in docs, microcopy, or UI strings. Use commas,
  periods, colons, parentheses, or sentence breaks.

## Rules of engagement
- AMS facts are constraints, not preferences: walk-in only (no booking),
  payments cleared at desk (no online pay), VetBuddy nominal SoR, ~20% of
  AMS pet parents are low-literacy (design accordingly: icons over labels,
  large tap targets, visual states). Full list in `docs/decisions-log.md`.
- **Do not name AMS staff** (assistants, support staff, anyone other than
  Dr Sagar himself) anywhere in product specs, design principles, heuristic
  audits, microcopy targets, accessibility framing, status/decisions-log
  prose, or chat shorthand. Use generic phrasing: "low-literacy user",
  "support staff", "non-technical clinic staff". Demo audience is
  Jolene + Dr Sagar only.
- Pet pronouns: Raffy and Gabby are male. Angel and Galaxy are female. Don't
  get this wrong.
- The `pets.clinical_lock` rule (schema patch 6, in `0001_init_schema.sql`
  via trigger): name + breed + sex + age lock once vet creates clinical
  records. Parent UI hides edit affordances on locked pets.
- The parent app accepts no incoming messages outside an open follow-up
  window. No "Message clinic" button, no "Ask a question" affordance, no
  parent-initiated cold thread. Closed-thread surface shows graceful
  redirect copy: "AMS is walk-in only. Visit 9am to 9pm Mon-Sat. For urgent
  issues, call [clinic number]."
- Pet Page steady-state is the brand hero of the parent app AND the demo's
  emotional center. Fur-match three-state is secondary visual delight, NOT
  the wow, NOT the centerpiece. Banned framing across all docs.
- When in doubt about scope, default smallest possible and ask.
- Plan-mode is for planning code-writing implementations. Use it when about
  to start implementation; don't use it for design conversations.
- Update `status.md` after every meaningful session (what was done, what's
  next). Keep it <=100 lines; it's a re-orientation file, not a journal.
- All Pawkit artifacts live in this project folder. Do NOT create files
  under `~/.Codex/plans/` for this project; that's Codex's plan-mode
  scratchpad, not project storage.

## Memory discipline
- Auto-memory at `C:\Users\Jolene Fernandes\.Codex\projects\D--Codex-Projects-Animal-Medical-Services\memory\`
  (indexed by `MEMORY.md`) holds cross-session feedback + project facts.
  Load automatically every session. **Authoritative for any conflict with
  project docs.**
- Before asserting positioning, scope, or feature-facts about Pawkit, **grep
  the relevant doc first**. Do not synthesize from prior session memory. If
  a feedback memory's rule applies to the current task, flag it explicitly
  before proceeding.

## Tech-detour prevention
- **Parent-app delivery to the demo phone = EAS release APK**, not Expo Go.
  Build via `eas build --profile preview --platform android` at least T-2
  days before the demo, install on the demo phone, smoke-test the
  round-trip, then leave the phone alone. The APK is frozen at build time;
  no SDK upgrade can break it on demo morning. See `docs/decisions-log.md`
  2026-05-13 Parent-app demo delivery lock.
- **During development, Expo Go is still the iteration tool** (a ~15-minute
  EAS rebuild per code change is too slow for active dev). The dev phone or
  Android emulator runs Expo Go; the demo phone does not. Keep them
  separate.
- **Before bumping any Expo / RN / Reanimated / worklets version**, run
  `pnpm exec expo install --check` first. Confirm the dev phone's installed
  Expo Go SDK matches the project SDK. SDK mismatch is the #1 source of
  tech detours in this project.
- **`react-native-worklets` is pinned to `0.5.1`** in
  `apps/petparent/package.json` to match Expo Go SDK 54's bundled native
  ABI on the dev phone AND the EAS preview profile's native ABI in the
  release APK. Do not bump without verifying both paths.
- **Windows pnpm `ERR_PNPM_ENOENT` during install rename** is AV-related
  (Defender touching `*_tmp_*` dirs during pnpm rename). Recover with
  `pnpm install --force`. Don't escalate or panic.

## How to find things
| Topic | File |
|---|---|
| Locked decisions (do not relitigate) | `docs/decisions-log.md` |
| Demo arc + scene transitions | `docs/demo-choreography.md` |
| Admin (Sagar) flows | `docs/flows/admin.md` |
| Parent app flows | `docs/flows/parent.md` |
| Palette v1.3 + brand discipline | `docs/brand-system.md` |
| Premium feel system (9 disciplines) | `docs/premium-feel/INDEX.md` |
| Schema (14 tables across migrations 0001-0007; 0007 was reconstructed 2026-05-18 — verify against prod per `docs/tech-debt-plan.md` F006-A) | `docs/schema.md` |
| Broadcast content rules (voice, length, structure, bilingual, NHS Care Cards) | `docs/broadcast-content-format.md` |
| Monorepo / Next.js + Expo / workspace gotchas | `docs/architecture.md` |
| Supabase project config + env vars | `docs/supabase-config.md` |
| Per-screen visual spec | `docs/layout-spec.md` |
| Day-by-day build plan | `docs/build-order.md` |
| In/out of scope | `docs/feature-scope.md` |
| Risk register | `docs/risk-register.md` |
| Verification plan | `docs/verification-plan.md` |
| Pinned package choices + ABI pins | `docs/reusable-tooling.md` |
| Files that exist + planned files | `docs/critical-files.md` |
| Deferred decisions awaiting next round | `docs/open-issues.md` |
| Design system (current, mauve) | `mockups/design-system.html` |
| Visual mockups (HISTORICAL, v1.3) | `mockups/archive/admin-v1.3.html`, `mockups/archive/parent-v1.3.html`, `mockups/archive/premium-components-v1.3.html` (every token, typeface, icon-kit statement inside is superseded; reference only) |
| App icon direction C (letterform needs Spectral → Lora swap) | `mockups/archive/app-icon-options-v2.html` |
| Mockups index | `mockups/index.html` (also on v1.3 styling; due for rewrite) |
| Microcopy EN + MR | `microcopy/` (after product elements, empty) |
| Archived planning artifacts | `session-logs/` (frozen-in-time, do not edit) |

## External pointers
- **Pitch target:** Dr Sagar Bhongale, AMS Pune, ~₹3 lakh/day revenue clinic.
- **Three-engine ARR model beyond v0:** clinic SaaS + parent subscription
  (Pawkit Plus: social, lifetime cross-clinic history, partner discounts) +
  clinically-curated marketplace (therapeutic diets, pharma, hygiene,
  supplements, insurance only; NOT generic pet retail). 20cr ARR target in
  3 years.
