# Pawkit Premium Direction Refinement — May 4

This plan supersedes specific decisions in the broader Pawkit v0 plan: **Brand System v1.2 → v1.3**, **fur-match-as-hero → Pet Page as Hero**. The fur-match feature stays in the v0 build as a secondary visual delight; only its positioning as the emotional centerpiece changes.

## Context

User instinct on May 4: "Nothing about Pawkit is giving premium." This is for a ₹60L+ co-founder pitch to Dr Sagar Bhongale at Animal Medical Services Pune; visual polish is part of proving she can ship product-quality work.

Three parallel research agents (premium consumer vet brands, modern B2B vet practice software, premium pet consumer DTC) returned convergent signal:

1. **Lime #DFFD06 reads juvenile / Linear-clone** — independently flagged by both consumer-side agents
2. **No typographic distinction for pet names** — premium pet brands (Pumpkin Serif, Maev, Smalls) use serif/distinctive type so pets feel "named, not numbered"
3. **Fur-match positioning reads gimmick-driven** ("look what the app does") rather than care-driven ("your pet matters")

A fourth deep palette study compared 6 forest greens + 5 alternative hero colours (terracotta, teal, burgundy, mustard, periwinkle) against the locked Paper #F8F6EE + Ink + 10-fur-token system. Result: hero choice is additive — neutrals + fur palette stay locked.

**User-locked decisions (May 4 questions):**
- Hero: **#006D6F Deep Teal** (chosen over forest greens for vet-clinical authority + max legibility; refined from initial #2A6F75 by stripping the red-bias that was muting it toward grey — pure cyan-teal reads alive, not corporate-tired; accepts the distinctiveness tradeoff vs Pumpkin/Rover/Wag also-teal landscape)
- Pet name typography: **Spectral serif italic**, hero contexts only
- Emotional centerpiece: **Pet Page as Hero**, fur-match repositioned as secondary delight

Apply all changes on Day 1 of build, before any screen work begins.

## Decision 1 — Brand colour: Lime #DFFD06 → Deep Teal #006D6F

Replace lime entirely with **Deep Teal #006D6F** as the hero colour. Same discipline preserved — one per screen, 1.5px Ink border on light surfaces, never decorative, never fur, never background.

**Rationale (research-backed):**
- Convergent research signal flagged lime as juvenile / Linear-clone
- Deep teal #006D6F: pure cyan-teal (R=0, G=109, B=111 — no red contamination), high chroma, highest legibility at all sizes including 8px online dots
- The earlier #2A6F75 candidate had R=42 contributing a red bias that muted the teal toward grey; #006D6F clears that grey-fog while preserving the same hue family + depth
- Pumpkin Pet Insurance precedent validates teal for vet authority + reassurance (blue = trust, green = growth, teal = both)
- Universal compatibility with all 10 fur tokens — no tone clash to fix
- User explicitly chose authority + legibility over the more distinctive forest options (#386641, #4A5D23) and the heavier #2D5016
- Acknowledged tradeoff: pet-tech competitors (Pumpkin, Rover, Wag, Pawp) lean teal/blue. Pawkit must compensate via brand discipline elsewhere (Spectral pet names, Pet Page editorial treatment, voice direction)

**Token renames (Day 1, before any screen build):**
- CSS: `--lime` → `--teal`; `--lime-rgb` → `--teal-rgb`
- Tailwind utility classes: `bg-lime` / `text-lime` / `border-lime` → `bg-teal` / `text-teal` / `border-teal`
- Component: `<LimeCTA />` → `<TealCTA />` (file rename + import-path sweep across both `apps/dashboard` and `apps/petparent`)
- Brand artifacts: brand patterns/textures, Lottie curation colour palette, PDF deck templates — all swap lime → teal
- 10 fur tokens UNCHANGED. 4 structural neutrals UNCHANGED. Only the hero swaps.

## Decision 2 — Pet names in serif italic (Spectral, hero contexts only)

Add **Spectral** (free, Google Fonts, contemporary serif designed by Production Type for screen reading) — used ONLY for pet names in hero contexts. Inter remains body; Satoshi remains display; no other change to the type system.

**Why Spectral:**
- Free, designed by Production Type (Schroeter, Brunet) for editorial screen reading; warm-contemporary serif with generous proportions, pairs cleanly with Inter + Satoshi
- Selected after side-by-side comparison of 12 candidates (Spectral, Newsreader, Source Serif 4, EB Garamond, Cormorant Garamond, Playfair Display, DM Serif Display, Crimson Pro, Literata, Bodoni Moda, Italiana). Spectral chosen for warmth + restraint balance — Spectral felt quirky-warm but landed too display-personality; Source Serif 4 felt too cold/restrained; classical Garamonds felt too literary; Playfair/Bodoni too high-contrast/fashion
- Not variable (fixed weights 200–800 + italics) — slightly less flexible than Spectral' variable axis, accepted tradeoff for the visual character

**Hero contexts where Spectral semibold italic is used (and ONLY here):**
- Pet Profile cover — pet's name at 32pt
- Broadcast card opening — pet name when broadcast is personalised
- Magic-toast moment — fur-match pet name reveal
- Memorial card — Raffy's name

**Everywhere else:** Inter (body) + Satoshi (display). Zero serif outside those four contexts. Body text, button labels, headlines all stay sans.

## Decision 3 — Pet Page as Hero (fur-match → secondary delight)

The per-pet profile (steady-state Pet Page) becomes the emotional center of the parent app. Fur-match stays in the v0 build as a secondary visual delight — still demoed live, still earns the "this app sees my pet's identity" trust point — but it is no longer THE hero.

**Rationale:** Premium pet brands lead with "your pet matters" (care-driven), not "look what the app does" (gimmick-driven). The per-pet page treated as editorial subject is the better hero — accumulating (parents see daily, not just once), premium-pet-brand aligned (Maev / Smalls / Pumpkin all treat per-pet pages as the centerpiece), natural cold-open for the demo.

**Pet Page as Hero composition:**
- **Cover:** pet's real photo, full-bleed at 320px height, treated as art (not gradient — actual photograph). Subtle 3px accent ring around the photo uses fur-match-derived primary tone (e.g., 3px Honey ring on Gabby) — fur-match's contribution becomes ambient, not announced
- **Name:** Spectral 32pt semibold italic ("Gabby")
- **Context line:** Inter 14pt Ink-soft, single line — "Golden Retriever · 4 years · Patient at Animal Medical Services since 2024"
- **Vet byline:** Dr Sagar's name + license rendered as magazine byline below context line (see additive move 4)
- **Editorial timeline:** quiet stack of Paper cards with 1.5px Ink border — last visit, next vaccination, current medications — presented as content not data tables
- **Open follow-up window banner:** if active, appears at top of timeline. 4px Teal left bar, Paper bg, 1.5px Ink border, headline in Spectral semibold italic: "Dr Sagar is here for Gabby until 2 May."

**Demo cold-open (parent app reveal):** Joydev opens the parent app to Gabby's page. Audio cue: *"This is Gabby's page. Not a record — her page."* Fur-match transformation moves to a later beat as a subtle algorithm-honour moment: *"And the colour around her photo? Pawkit took the time to see her."*

## Brand System v1.3 (supersedes v1.2 in broader Pawkit plan)

### Structural neutrals (unchanged from v1.2)

| Token | Hex | L | Job |
|---|---|---|---|
| `--bg-canvas` | `#F8F6EE` Paper | 97 | Page background, app chrome, card surfaces |
| `--text-primary` | `#0F0C0A` Ink | 4 | Body text, headlines, structural shadow |
| `--text-secondary` | `#5C5550` Ink-soft | 36 | Secondary text, captions, handles |
| `--text-muted` | `#A8A39E` Ink-faint | 67 | Muted text, dividers, disabled states |

Research confirmed: Paper warmth + cool teal creates "perceived depth" (Patagonia/Aesop precedent), not a flaw. No neutral shift needed.

### Fur kit (unchanged from v1.2 — pet fur ONLY, never chrome)

| Token | Hex | Reference fur |
|---|---|---|
| Milk | `#FFFCF2` | Samoyed, Maltese, white Persian |
| Vanilla | `#EAE0C8` | Yellow Lab, cream Golden, light Indie |
| Honey | `#E5C896` | Darker Golden Retriever, wheaten coats |
| Peach | `#E8A87C` | Orange tabby, Vizsla, ginger kitten |
| Rust | `#B05E2E` | Irish Setter, Dachshund, ruby Cavalier |
| Mushroom | `#A8927A` | Adult brown Lab, fawn Pug, Indie |
| Smoke | `#A8B4BA` | Russian Blue, Husky, Weimaraner |
| Steel | `#6B7B82` | Schnauzer, Cane Corso, dark gray cat |
| Bark | `#5C4A3A` | Chocolate Lab, brown tabby, dark Indie |
| Sable | `#2B221A` | Black Lab, panther cat, black Pom |

Research confirmed: every fur token harmonises acceptably with Deep Teal #006D6F (universal blue-green compatibility). No tuning required.

### Hero (CHANGED v1.2 → v1.3)

~~Lime #DFFD06~~ → **Deep Teal #006D6F**

- Primary CTAs, online dots, key tags, brand mark
- One job per screen
- Always 1.5px Ink border on light surfaces
- Never decorative, never fur, never background
- Bake into `<TealCTA />` component with surface prop

### Typography (CHANGED — Spectral added)

- **Inter** — body, 14–16px, all weights as needed
- **Satoshi** — display headlines, 28–40px semibold
- **Spectral semibold italic (NEW)** — pet names in hero contexts ONLY, 24–36pt
- **Inter tabular-nums** — numbers (invoices, counts, timestamps)
- **Noto Sans Devanagari** — Marathi fallback

### Hard rules (updated)

- Pure white #FFFFFF and pure black #000000 forbidden
- Fur tokens NEVER in structural styles
- Auto-pair fires only on solo Milk (→+Vanilla) or solo Sable (→+Bark) — unchanged
- Teal CTA always 1.5px Ink border on light surfaces — baked into `<TealCTA />` component
- **NEW:** Spectral serif italic NEVER used outside the four hero pet-name contexts. Body, headlines, button labels stay sans (Inter or Satoshi)

### Tailwind namespace (renamed)

`bg-canvas`, `text-ink`, `text-ink-soft`, `text-ink-faint`, `bg-fur-vanilla`, `bg-fur-honey`, `bg-fur-sable`, `bg-teal` (was `bg-lime`)

### Allowed exceptions to discipline (unchanged from v1.2)

- Peach as alert dot in chrome (Error toasts only)
- Vanilla as Empty-state cover on parent-app pet profile (pre-photo upload)
- Sable as Sampling-state cover on parent-app fur-match (the moment is *about* fur)

## 5 additive tactical moves (research-supported, included in this plan; flag for rejection on review if any feel wrong)

1. **Vellum-paper texture on card surfaces** — 4% grain/noise overlay on all Paper card surfaces (SVG filter or PNG texture at 4% opacity). Differentiates from flat shadcn defaults. References Aesop product cards. Cost: 2h.

2. **16–24px gutter whitespace replaces divider lines** — Replace any `border-b border-ink-faint` divider in dashboard with `mb-6` or `mb-8` whitespace. Section breaks felt, not drawn. Cost: 1h grep+replace.

3. **Real pet photography lit at 4500K** — Fernandes family photos (Day 7 of build) shot in soft afternoon light, portrait orientation, shallow depth of field. No flash, no clinical lighting. Synthetic dataset uses Pexels images matching this standard. Cost: 2h shoot + curation.

4. **Vet credentials in editorial byline type** — Dr Sagar's name + license appears across the product (Health Kit, broadcast cards, conversation threads, Pet Profile cover) rendered as a magazine byline: full name in Inter 14pt Ink semibold; "BVSc · License XXXXX" in Inter 11pt Ink-soft small caps below. NOT a profile chip — editorial attribution. Cost: 1h component design.

5. **Voice direction north star (feeds into existing microcopy round):** *"We see your pet as you do — a full character with a story. This app is a space to honour that, not optimise it."*
   - Address pets by name; never "your pet" when a name is available
   - Present tense for active states ("Dr Sagar is here for Gabby until 2 May" not "Follow-up window: open")
   - Avoid system jargon ("Submitted" → "Sent to Dr Sagar")
   - Marathi voice mirrors English voice intent, not literal translation
   - Brand voice models: Smalls (humane warmth) + Pumpkin (emotional honesty, no cutesy puns)

## Sections of the broader Pawkit plan requiring ripple updates (apply on Day 1)

The broader Pawkit v0 plan (held in conversation context, comprising Context / Decisions Log / Demo Shape & Choreography / Admin Flows / Parent Flows / Brand System / Architecture / Schema / v0 Feature Scope / Screen-by-Screen Layout Spec / Build Order / Risk Register / Critical Files / Reusable Tooling / Verification Plan) needs the following targeted updates when this refinement is applied:

- **Brand System — Quick Reference (existing v1.2 section):** delete in place, replace with v1.3 above
- **Decisions Log → Typography:** add Spectral re-introduction note (strict scope: pet names only, four hero contexts)
- **Decisions Log → Demo anchor:** add "Pet Page as Hero — fur-match repositioned as secondary delight"
- **Decisions Log → Communication & AI features:** unchanged (no AI scope change in this refinement)
- **Demo Shape & Choreography → Narrative arc:** re-sequence — cold open is parent app on Gabby's Pet Page (not clinic inbox); fur-match moment moves later as a subtle algorithm-honour beat
- **Screen-by-Screen Layout Spec #9 (Pet Profile three-state):** rewrite Transformed state as steady-state Pet Page hero with Spectral serif italic name + real photo cover + editorial timeline; fur-match gradient demoted to 3px accent ring around photo
- **All Screen-by-Screen Layout Spec annotations of "Lime: ..."** swap to "Teal: ..."
- **Reusable Tooling:** add Spectral (Google Fonts via `next/font` and `expo-font`); document pet-name-only scope
- **Build Order Day 1:** add token rename + Spectral wiring + TealCTA invariant before any screen build
- **Build Order Day 4:** Pet Profile build starts with steady-state Pet Page (hero), then layers fur-match three-state as secondary delight
- **Build Order Day 6:** brand patterns + Lottie curation + AMS rebrand assets all use Teal

## Critical files to modify (when build begins)

- `packages/design-tokens/src/tokens.css` — `--lime` → `--teal`; value `#DFFD06` → `#006D6F`
- `packages/design-tokens/src/tailwind-preset.ts` — colour key `lime` → `teal`
- `packages/design-tokens/src/colors.ts` — typed export of palette; add Spectral font family export
- `packages/design-tokens/src/components/LimeCTA.tsx` → rename file to `TealCTA.tsx`; rename component; update internal class refs from `bg-lime` → `bg-teal`
- `apps/dashboard/app/globals.css` — shadcn variable overrides; `--primary` value → `#006D6F`
- `apps/dashboard/app/layout.tsx` — load Spectral alongside Inter via `next/font`
- `apps/petparent/app/_layout.tsx` — load Spectral alongside Inter via `expo-font`
- All component files importing `LimeCTA` — sweep imports to `TealCTA`
- `/style-guide` route — Lime audit section becomes Teal audit section

## Verification

End-to-end checks once refinement is applied:

1. **Token sweep:** `grep -ri "lime\|#DFFD06\|#dffd06"` returns zero hits across `apps/`, `packages/`, `supabase/` (except in this Premium Direction document's historical notes)
2. **TealCTA invariant:** `<TealCTA />` component throws dev-time warning if more than one renders per route; `/style-guide` route shows the canonical button
3. **Spectral scope check:** `grep -ri "font-serif\|Spectral\|spectral"` returns hits ONLY in pet-name component files (PetCoverName, BroadcastPetName, MagicToastPetName, MemorialName). Zero hits in body/headline contexts
4. **Pet Page as Hero visual check:** Open parent app on Gabby's profile. Top of screen reads: real photo (320px), Spectral serif italic name (32pt), context line, vet byline, editorial timeline. No fur-match gradient as cover
5. **Demo rehearsal beat (Day 8):** during friend rehearsal, does the cold open on Gabby's Pet Page land emotionally for the unbriefed Joydev-friend? Their first reaction is the signal
6. **Fur ring + Teal CTA harmony check:** on a Paper card, place a Honey ring around a pet avatar next to a Teal CTA. Visual exercise from research synthesis. If anything fights, escalate
7. **Online dot legibility:** render the 8px Teal online dot next to Spectral italic pet name. Should read "active/trusted" at a glance. Print + check at desk distance

## Implementation cost

- Day 1 token rename + TealCTA component rebuild + Spectral wiring + font loading on both apps: **1 day** (front-loaded; everything downstream depends on it)
- Day 4 Pet Page as Hero rebuild: **+0.5 day** on original Day 4 estimate
- Demo choreography re-sequence: **0** (re-rehearse on Day 8)
- Voice direction north star: factored into existing microcopy round (Day 7)
- 5 additive tactical moves: **~6h total** spread across days 4, 6, 7

**Net added build cost: ~1.5–2 days.** Demo target shifts day 9 → day 11 of build. With user's 18-day buffer (Sagar out of country until ~mid-May), comfortable headroom remains.
