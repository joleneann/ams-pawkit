# Premium Feel Plan — Branch B (locked May 4, 2026)

> **Archived plan** — this is the May 4 planning artifact that fed `docs/premium-feel.md` and the v1.3 + Premium Feel patches across the project doc set. Authoritative implementation lives in `docs/premium-feel.md`. Cross-references: `docs/decisions-log.md` Premium Feel System Locked entry, `docs/build-order.md` Day 1 + Day 6 + Day 7 sections, `docs/feature-scope.md` in-scope/out-of-scope updates.
>
> Original plan-mode scratchpad: `~/.claude/plans/i-m-pitching-to-work-wiggly-dahl.md` (kept as plan-mode scratchpad per workflow; substantive content archived here per CLAUDE.md "All Pawkit artifacts live in this project folder").

---

# Pawkit Premium Polish — Beyond Colour

## Context

The v1.3 work delivered a **brand refresh**: Lime → Teal #006D6F, Spectral italic for pet names, Pet Page as Hero positioning, and 5 accepted-but-never-specced tactical moves. That is necessary but not sufficient for the "premium look and feel" you originally asked for.

**Premium feel beyond colour is a system of ~12 disciplined dimensions** — motion, surface materials, photography, microcopy voice, spacing rhythm, states (loading/empty/error/offline/stale), haptic feedback, iconography polish, vet byline component, onboarding ceremony, first-run artifacts (app icon, splash, PWA), and performance perception.

In the current docs, **most of these are either un-specced or covered by a single bullet** that's not implementable from the page. This plan closes those gaps in a way that:

- Ships **one new spec doc** (`docs/premium-feel.md`) that holds the cross-cutting system
- Patches **four existing docs** with targeted inserts (no duplication)
- Sequences work into Figma-now vs. Build-day-X
- Is **cuttable at every level** — must-have for pitch vs. nice-to-have
- Respects the 7-day build window with explicit timeline tradeoff

**Scope locked (May 4):** Branch B — Tier 1 (all 7) + Tier 2 selective (#8 spacing + #9 surface treatments). Items #10 #11 #12 deferred to v0.1 / post-pitch (kept in this doc for traceability). Total cost ~9 working days. Demo target shifts from Day 9 → Day 12 (still inside Sagar's mid-May availability window).

---

## The 12 dimensions, framed by impact-on-pitch

### Tier 1 — Sagar / Joydev experience these directly during the demo (must-have)

| # | Dimension | Currently specced | Gap rating |
|---|---|---|---|
| 1 | **Motion system** (easings, durations, choreography) | Teal scan-line + "no shimmer" loading + magic-toast 4s auto-dismiss. That's it. | 5/5 — biggest premium-feel multiplier in the app |
| 2 | **Photography direction** (composition, lighting, treatment, curation criteria) | "4500K, soft afternoon, portrait" — one bullet | 5/5 — pet photos are the emotional core |
| 3 | **Microcopy voice** (do/don't, reading level, system templates) | One north-star sentence + 4 bullets | 5/5 — every screen has copy; Joydev moment depends on this |
| 4 | **States system** (loading + empty + error + offline + stale) | Loading skeleton style + empty grammar + error toast — partial | 4/5 — Sagar will see at least 2 states in 1 hour |
| 5 | **Haptic feedback** (parent app) | Nothing. Zero mention anywhere | 5/5 — Joydev moment + general native polish |
| 6 | **App icon + splash + PWA assets** | Nothing — no Pawkit mark exists yet | 4/5 — first thing Sagar sees on each phone |
| 7 | **Vet credentials editorial byline** | One bullet in v1.3 plan, never specced as component | 4/5 — repeated premium signal across 4+ screens |

### Tier 2 — Elevates but doesn't break the pitch (nice-to-have)

| # | Dimension | Currently specced | Gap rating |
|---|---|---|---|
| 8 | **Spacing rhythm system** (formal scale + rules) | "mb-6 or mb-8" — one bullet | 3/5 |
| 9 | **Surface treatments** (vellum SVG/PNG asset, depth language, hover/pressed states) | "4% noise" bullet, no asset | 3/5 |
| 10 | **Iconography polish** (Lucide stroke override + custom pet marks) | Lucide chosen, defaults assumed | 2/5 — Lucide alone is fine if disciplined |
| 11 | **Onboarding ceremony** (first-run lottie, transitions, celebration) | Bare 2-step flow | 2/5 |
| 12 | **Performance perception** (optimistic UI, pre-fetch, frame budget) | Skeleton spec only | 3/5 |

---

## Tier 1 deliverables (full detail in `docs/premium-feel.md`)

### 1. Motion system — `docs/premium-feel.md §1`
3 easings (`ease-emphasised cubic-bezier(0.2,0,0,1)` / `ease-standard cubic-bezier(0.4,0,0.2,1)` / `ease-decelerate cubic-bezier(0,0,0.2,1)`); 5 durations (Instant 50ms / Quick 150ms / Standard 250ms / Expressive 400ms / Ceremonial 800ms — Pet Page first-load only); choreography rules (stagger 30ms, FLIP for layout shifts, never two attention-grabbing animations simultaneously); per-screen specs in `layout-spec.md`; 60fps frame budget on mid-range Android via Reanimated 3.10 worklets. **Effort: 10h.**

### 2. Photography direction — `docs/premium-feel.md §2`
4:5 portrait crop, pet centred, eyes upper third, 60% pet / 40% negative space; soft window light camera-left at 45°, no flash, 4–6pm Pune; neutral home environment blurred; treatment +10 warmth -5 saturation; alert + eye contact poses preferred. Synthetic 200 curated from Pexels with keyword pre-filter + manual cull (~3h). Fernandes shoot half-hour at home: Gabby + Angel + Galaxy new, Raffy archival. **Effort: 4.5h.**

### 3. Microcopy voice — `docs/premium-feel.md §3`
Reading level grade 5 (parent app, Joydev test) / grade 8 (dashboard); warm + matter-of-fact tone (Things 3 / Linear / Pumpkin models); ~30-row do/don't matrix anchored by examples ("Send to Dr Sagar" not "Submit", "Couldn't find your photo. Try again?" not "Error: file_upload_failed (500)"); Marathi mirrors EN emotional register non-literally with native review; ~30 system message templates for the 14 screens; Joydev-specific patterns (verbs first, never "Click"). **Effort: 16h.**

### 4. States system — `docs/premium-feel.md §4`
Per-screen loading skeletons (solid faint, no shimmer, fade-in 200ms after request fires); empty grammar (Satoshi italic single sentence, no illustrations); 3 error types (inline form / banner / toast — never red, Peach for alert role); offline banner with on-device fur-match still working; stale data caption "Updated Nm ago". **Effort: 14h.**

### 5. Haptic feedback (parent app) — `docs/premium-feel.md §5`
`expo-haptics` (Expo SDK 51, no extra dep). Pattern map: tab switch → selection; chip select → light impact; photo upload + send confirm → medium impact; fur-match reveal → success notification; error → warning notification. Never on hover/auto-events/within 100ms. Replaces audio cues v0 doesn't have (Joydev moment). **Effort: 3h.**

### 6. App icon + splash + PWA — `docs/premium-feel.md §6`
Type-only "p" mark (Satoshi semibold) in Ink rounded square (1.5px Ink border, Paper interior); Teal dot at the bowl from 64×64+ scales. Expo splash: Paper bg + Satoshi wordmark "pawkit" + Teal dot + Spectral italic context line "your pet's records, in your pocket". PWA manifest theme #006D6F. Monochrome notification icon. **Effort: 6h.**

### 7. Vet byline component — `docs/premium-feel.md §7`
`<VetByline vet={vet} variant="compact|full" align="left|center" />`. Compact = horizontal `Dr Sagar Bhongale · BVSc Mumbai 2018` (Inter 13pt + 11pt small caps tabular). Full = two-line stack for Pet Page cover / Health Kit reading. Centre = under Health Kit cover. 32px avatar circle external left, never inside. Never wraps to 3 lines. **Effort: 5h.**

---

## Tier 2 deliverables (selective — IN scope for Branch B)

### 8. Spacing rhythm system — `docs/premium-feel.md §8`
8-value scale 4/8/12/16/24/32/48/64 px with element-specific rules (4 = icon padding, 8 = chip gap, 16 = card padding, 24 = chip-to-content, 32 = within-screen sections, 48 = major section breaks, 64 = pet name → context line breath). Spectral italic optical correction +2px ascent. Replace `border-b border-ink-faint` dividers with whitespace except in Invoice / Settings / Inbox rows. **Why included:** feeds straight into Figma — every text-style and component spacing locks against this scale, so downstream Figma + build work moves faster (not slower) once it's in place. **Effort: 4h.**

### 9. Surface treatments (vellum + depth language) — `docs/premium-feel.md §9`
Vellum SVG filter (`<feTurbulence baseFrequency="2.4" numOctaves="2"/>` + `<feColorMatrix>` tinted Ink at 4% alpha) on every Paper card surface; 24×24 PNG fallback for Expo. Depth language: 1.5px Ink = primary surface (Paper cards), 1px Ink-soft = structural (invoice line items), 0 = background. No shadows anywhere ever. **Why included:** the single biggest visual differentiator from "shadcn defaults" — flat Paper cards read template-y; vellum-textured Paper reads handcrafted. Aesop / Maev precedent. **Effort: 5h.**

---

## Deferred to v0.1 / post-pitch (kept here + in `docs/premium-feel.md §10–§12` for traceability)

### 10. Iconography polish — DEFERRED
Lucide stroke override to 1.5px is trivial and stays in Tier 1 motion/spacing work as a one-line CSS rule. The deferred piece is the **6h custom illustration set** (vaccine vial, microchip, water bowl, paw scale, leash, treat). Lucide alone is disciplined enough for v0.

### 11. Onboarding ceremony Lottie — DEFERRED
First-run Lottie + post-Step 2 celebration screen. The transition slide between Step 1 → Step 2 stays (covered under motion system), but the ceremonial Lottie is a v0.1 thing — onboarding is a 2-step flow that fires once per user, not a recurring premium signal.

### 12. Performance perception (optimistic UI / pre-fetch / frame budget) — DEFERRED
Modern Next.js + Expo handle pre-fetch and lazy-load implicitly. Optimistic UI on send is genuinely worth doing but can ship as a v0.1 polish pass. Frame budget monitoring is a debug tool, not a user-facing feature — defer until perf bugs surface.

---

## What's cuttable inside Branch B if time runs short (in cut order)

1. Vellum texture (#9) — Paper colour is warm enough alone; cut saves 5h
2. Stale data caption (#4 sub-item) — ship without; add v1; saves 1h
3. MR microcopy review polish (#3) — ship with DeepL-drafted MR + minimal review; saves 2h
4. Spacing audit on already-built screens (#8 audit half) — apply scale to new work only; saves 2h

**Never cut:** motion system, photography, microcopy do/don't spec, vet byline, app icon, haptics, basic states. These are pitch-critical.

---

## Sequencing

**Now (Figma design phase, before Day 1 of build):**
- Tier 1 #1 motion sketches (Smart Animate prototypes for Pet Page, magic toast, sheet)
- Tier 1 #2 photography spec written + Fernandes shoot scheduled
- Tier 1 #3 microcopy do/don't drafted
- Tier 1 #4 state designs in Figma
- Tier 1 #6 app icon + splash design
- Tier 1 #7 vet byline component in Figma library

**Day 1 (build foundations — promote 3 items into this day):**
- Wire Reanimated easing curves + duration scale into `packages/design-tokens`
- Wire `expo-haptics`
- Wire app icon + splash + PWA manifest

**Days 2–5 (screen build):**
- Apply per-screen motion specs as each screen lands
- Apply state specs (loading/empty/error) per screen
- Implement `<VetByline />` component, replace inline vet text everywhere

**Day 6 (premium polish day, repurposed for Branch B):**
- Vellum texture (Tier 2 #9) — SVG filter into design-tokens, applied to all Paper card surfaces
- Spacing audit (Tier 2 #8) — gutter sweep across already-built screens; lock scale into Figma library

**Day 7 (microcopy + photography):**
- Microcopy round against do/don't spec
- Fernandes shoot + Pexels curation
- Marathi review

---

## Effort summary

| Tier | Dimension | Figma | Build | Total |
|---|---|---|---|---|
| 1 | Motion | 4h | 6h | 10h |
| 1 | Photography | 4.5h (mostly curation) | 0 | 4.5h |
| 1 | Microcopy | 6h spec | 8h round + 2h MR review | 16h |
| 1 | States | 6h | 4h + 4h spec | 14h |
| 1 | Haptics | 0 | 2h + 1h spec | 3h |
| 1 | App icon + splash | 4h | 2h | 6h |
| 1 | Vet byline | 2h | 2h + 1h spec | 5h |
| **Tier 1 total** | | **~26.5h** | **~32h** | **~58.5h ≈ 7 working days** |
| 2 | Spacing rhythm | 2h | 2h | 4h |
| 2 | Surface treatments | 0 | 5h | 5h |
| **Tier 2 selective total** | | **~2h** | **~7h** | **~9h ≈ 1 day** |
| **BRANCH B GRAND TOTAL** | | **~28.5h** | **~39h** | **~67.5h ≈ 9 working days** |

**Net cost:** ~9 working days, ~3.5 days Figma + ~5 days build. Demo timeline shifts from original Day 9 → Day 12 (well within Sagar's mid-May return window).

Deferred items (#10, #11, #12) cost ~20h / ~2.5 days if revived later.

---

## Verification (how to know it's actually premium)

After each Tier 1 dimension lands:

1. **Motion:** rehearse Pet Page first-load with someone unbriefed (Joydev-friend on Day 8). If it doesn't draw a "wait, do that again" reaction, tune the easing
2. **Photography:** print 4 Fernandes covers + 4 random synthetics at 4×5 cm. Lay them next to a Pumpkin/Smalls/Maev print sample on the table. Pawkit photos should hold
3. **Microcopy:** read 5 random screens aloud to Joydev-friend during rehearsal. If any word makes him pause, rewrite it
4. **States:** force offline mid-demo for 30s. Sagar should see the offline banner without panicking
5. **Haptics:** demo on second phone with sound off. Joydev should feel each interaction without seeing the screen
6. **App icon:** install on Sagar's phone day-of. Icon must read at 1cm² home-screen size
7. **Vet byline:** open 4 screens that show byline (Pet Page, Inbox row, Health Kit reading, broadcast card). Visual rhythm should feel uniform across all four

---

## Open dependencies (need scheduling, not deciding)

1. **Fernandes shoot:** half-hour at home, 4–6pm Pune light, 4 pets (Raffy archival photo only). Should happen on Day 7 of build at latest. No external dependency, but worth blocking out the slot now.
2. **Marathi native-speaker review:** ~2h of someone's time, ideally a Pune Marathi speaker. Used during the microcopy round.
3. **Joydev-friend rehearsal:** Day 8 unbriefed run-through for Joydev seat. Unbriefed is the point — needs at least 24h notice but no prep.
4. **Sagar's mid-May return date:** softens or hardens the demo deadline. Branch B fits comfortably if Sagar is back ~May 15. If earlier, the cuttable list at the end of Branch B comes into play.
