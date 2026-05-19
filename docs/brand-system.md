## Brand System (Quick Reference, v1.4 mauve-only, locked 2026-05-14; saturation re-tuned 2026-05-15 evening)

> **SUPERSEDED HISTORY BELOW.** The running build as of 2026-05-14 is the
> **mauve-only v1.4 lock**: **Boysenberry `#9C2B5C`** ("Tasteful pop"
> saturation-lift, locked 2026-05-15 evening; was `#823159` 2026-05-14 →
> 2026-05-15 evening) replaces Teal, **cool
> off-white `#F8F7F5`** replaces Paper, **rail-tint ground `#EFE6E8`**
> (barely-there mauve, locked 2026-05-15 late evening after dial-down from
> the briefly-locked #F2DEE6 pink), **Ink-faint bumped to `#8F8B86`**,
> **Inter (body + display) + Lora italic (pet-name hero serif)** (locked
> 2026-05-15 evening; Satoshi removed because it read as "circus" on
> KPIs at 22-26px; DM Sans interlude and Spectral italic both dropped
> earlier the same day). Icon kit: **Phosphor Icons filled** (locked
> 2026-05-15 evening via `@phosphor-icons/react ^2.1.10`, global
> `weight: "fill"` default in `components/chrome/icon-provider.tsx`;
> Lucide ripped out the same evening). The
> `data-theme="mauve"` switch is gone — mauve is the only theme. **Token
> rename 2026-05-15:** `palette.teal` / `--teal` / `bg-teal` className all
> renamed to `berry` / `--berry` / `bg-berry` so the variable name matches
> the actual color identity (Boysenberry). No more "teal means Boysenberry"
> backward-compat alias. Type scale
> bumped +1-2px across the board (xxs 11 → display 40). The locked v1.3
> "one Teal per screen" rule is intentionally relaxed: the Boysenberry hero
> color shows up across CTAs + hero count cards + vet message bubbles +
> active tabs + segmented toggles + active rail item + focus rings + search
> wash. Real Pexels pet portraits seeded for the 5 demo pets. Source of
> truth for the running build: `apps/dashboard/app/globals.css` +
> `packages/design-tokens/src/{colors.ts,tokens.css}` +
> `apps/dashboard/components/ui/*` (shadcn primitives). Full lock notes in
> `docs/decisions-log.md` 2026-05-14 + 2026-05-15 entries.
>
> The v1.3 spec preserved below is useful as design-history reference, but
> every token / typeface / hero-rule statement is now superseded. The
> 10-token **fur kit is unchanged** (still pet-content-only, never chrome),
> and the **hard rules** (no pure white/black, no fur in chrome, auto-pair
> Milk/Sable) are unchanged.

---

## Brand System (Quick Reference, v1.3, locked May 4 — HISTORICAL)

> **Companion doc:** `docs/premium-feel/INDEX.md` holds the cross-cutting premium-feel system that this brand spec underpins (motion, photography direction, voice and microcopy, states, haptics, vet byline, spacing rhythm, materials). Brand tokens here; system disciplines there (split into 9 per-dimension files under `docs/premium-feel/`).

### Changelog

- **v1.0 to v1.1:** added 10-token fur kit (LAB-tuned to real pet fur), Vanilla/Honey split (cream Golden vs darker Golden as distinct tokens; addressed v1.0's failure mode where the algorithm couldn't separate yellow Lab from darker Golden).
- **v1.1 to v1.2 (2026-05-02):** Paper changed from `#F4F2EC` (L=95, warm cream) to `#F8F6EE` (L=97, brighter warm) after side-by-side comparison test. Original Paper was too close in luminance to Lime (L=92) and shared the same warm-yellow hue family; Lime didn't pop. New Paper widens the luminance gap by 2pt while preserving warmth. Other 13 tokens unchanged.
- **v1.2 to v1.3 (2026-05-04):** Three locked refinements after convergent research signal flagged v1.2 as reading too "indie SaaS / Linear-clone" rather than premium-pet-warm:
  1. **Hero swap:** Lime `#DFFD06` replaced with **Deep Teal `#006D6F`** (chosen over forest greens for vet-clinical authority + max legibility; refined from initial #2A6F75 by stripping the red-bias that was muting it toward grey; pure cyan-teal reads alive, not corporate-tired).
  2. **Pet name typography:** add **Spectral semibold italic** for pet names in hero contexts only (Pet Profile cover, broadcast personalisation, magic toast, memorial card). Selected after side-by-side comparison of 12 serif candidates. Inter remains body; Satoshi remains display.
  3. **Pet Page as Hero:** the per-pet profile (steady-state Pet Page) becomes the emotional center of the parent app AND the demo's emotional center. Fur-match stays in v0 as a secondary visual delight inside the hero, not the wow, not the centerpiece.
- **v1.3 + Premium Feel System (2026-05-04):** brand tokens unchanged; new disciplinary system layered on top via `docs/premium-feel/` (split into 9 per-dimension files). 9 cross-cutting dimensions specced: motion (3 easings + 5 durations + per-screen specs), photography direction (4:5 portrait, soft window light 4500K, treatment), voice and microcopy (do/don't matrix + Marathi rules), states (loading/empty/error/offline/stale), haptics (parent app `expo-haptics` pattern map), first-run assets (app icon + splash + PWA), vet byline component (3 variants), spacing rhythm (8-value scale), materials (vellum SVG filter + depth language). Items 10 to 12 (custom icons, onboarding ceremony, perf polish) deferred to v0.1.
- **v1.3 palette shifts (2026-05-08):** Three tokens shifted after a clash audit against real-world fur references:
  1. **Paper** `#F8F6EE` &rarr; `#F5F1E8`: less yellow, more taupe-neutral. Solves the "Paper looks slightly yellow-shifted" feel AND the visual clash with Milk fur token (was only ~4 lightness points apart, white-pet swatches blended into the page).
  2. **Smoke** `#A8B4BA` &rarr; `#8B928A`: cool-neutral mid-grey with slight green undertone. Was cool blue-grey ("Apple iPad colour"), not real pet fur. Reference: Sico Russian Blue Cat paint `#6F7974`. New value plausible for Russian Blue, Korat, Chartreux, grey tabby.
  3. **Steel** `#6B7B82` &rarr; `#5F6961`: cool-neutral dark grey with slight green undertone. Was cool blue-grey, not real pet fur. Same family as new Smoke (Smoke and Steel pair as a tonal family). Plausible for darker Schnauzer banding, Korat, charcoal cats.
  Other 11 tokens unchanged (Teal, Ink, Ink-soft, Ink-faint, Milk, Vanilla, Honey, Peach, Rust, Mushroom, Bark, Sable). Match-logic LAB targets recompute at module load from updated hex; fixture suite needs re-run.

### Colour tokens (14 total, three roles)

**Structural neutrals (NEVER fur-match):**

| Token | Hex | L | Job |
|---|---|---|---|
| `--bg-canvas` | `#F5F1E8` (Paper, shifted 2026-05-08 from `#F8F6EE`) | 95 | Page background, app chrome, card surfaces |
| `--text-primary` | `#0F0C0A` (Ink) | 4 | All body text, headlines, structural shadow |
| `--text-secondary` | `#5C5550` (Ink-soft) | 36 | Secondary text, captions, handles |
| `--text-muted` | `#A8A39E` (Ink-faint) | 67 | Muted text, dividers, disabled states |

**Fur kit (10 tones, ONLY for pet fur matching, NEVER chrome):**

| Token | Hex | L | Reference fur |
|---|---|---|---|
| Milk | `#FFFCF2` | 99 | Samoyed, Maltese, white Persian |
| Vanilla | `#EAE0C8` | 89 | Yellow Lab, cream Golden, light Indie |
| Honey | `#E5C896` | 81 | Darker Golden Retriever, wheaten coats |
| Peach | `#E8A87C` | 70 | Orange tabby, Vizsla, ginger kitten |
| Rust | `#B05E2E` | 47 | Irish Setter, Dachshund, ruby Cavalier |
| Mushroom | `#A8927A` | 57 | Adult brown Lab, fawn Pug, Indie |
| Smoke | `#8B928A` (shifted 2026-05-08 from `#A8B4BA`) | 59 | Russian Blue, Korat, Chartreux, grey tabby |
| Steel | `#5F6961` (shifted 2026-05-08 from `#6B7B82`) | 42 | Schnauzer banding, Cane Corso, dark grey cat |
| Bark | `#5C4A3A` | 30 | Chocolate Lab, brown tabby, dark Indie |
| Sable | `#2B221A` | 13 | Black Lab, panther cat, black Pom |

**Hero:** Deep Teal `#006D6F`. Primary CTAs, online dots, key tags, brand mark. **One job per screen.** Never decorative, never fur, never background. **No Ink border.** Teal's saturation plus low luminance grounds itself; the border (a Lime-era discipline) was removed May 5 because it competed with the Teal's authority. Filled Teal CTAs render clean.

### Typography (v1.3)

- **Inter** for body, 14-16px, all weights as needed. Inter primary for Ink; Ink-soft secondary; Ink-faint muted. Excellent Devanagari fallback alongside Noto Sans Devanagari for Marathi rendering.
- **Satoshi (Fontshare, free)** for display headlines, 28-40px **Bold (700)**. Geometric sans, Circular-adjacent. Pawkit reads as modern-product, not editorial. Note: Satoshi ships Light/Regular/Medium/Bold/Black weights only; no Semibold (600) exists in this family. Bold is the locked display weight (corrected May 6; earlier "Satoshi semibold" copy in brand docs referenced a weight that does not exist in Fontshare's Satoshi).
- **Spectral (Google Fonts, free, NEW in v1.3)**, semibold italic, 24-36pt. Pet names in hero contexts ONLY (Pet Profile cover, broadcast card opening with personalised pet name, magic-toast pet name reveal, memorial card). Designed by Production Type for editorial screen reading. Warm-contemporary serif with generous proportions.
- **Inter tabular-nums** for invoices, broadcast counts, timestamps, ages, durations. Western numerals only, both languages.
- **Noto Sans Devanagari** as fallback font for Marathi rendering (Inter and Satoshi don't fully cover Devanagari).
- **AMS wordmark** is Satoshi Bold, "Animal Medical Services" plus "Pune" in Inter small caps below. Type-only, no logomark.

### Hard rules

- Pure white `#FFFFFF` and pure black `#000000` are forbidden. Paper and Ink are intentional choices.
- Fur tokens NEVER leak into structural styles (card bg, page bg, body text).
- Auto-pair fires only on solo Milk (becomes +Vanilla) or solo Sable (becomes +Bark). Never extends to other tones.
- Teal CTAs render border-less (locked May 5). The `<TealCTA />` component still encapsulates the rest of the discipline (one-per-screen invariant, surface prop, hover/pressed states), just without the border. **Build gotcha:** when implementing the component as a `<button>` (web) or `<Pressable>` (RN), set `border: none` / `border-0` explicitly; relying on the absence of the property leaves the browser's default button border visible (this bit us during the May 5 mockup rerender).
- **NEW (v1.3):** Spectral serif italic NEVER used outside the four hero pet-name contexts. Body text, headlines, button labels stay sans (Inter or Satoshi).

### Tailwind namespace

`bg-canvas`, `text-ink`, `text-ink-soft`, `text-ink-faint`, `bg-fur-vanilla`, `bg-fur-honey`, `bg-fur-sable`, `bg-teal`. The `fur.*` nesting catches typos at build time.

### Allowed exceptions to the discipline

- **Fur tokens are NEVER used in chrome (hardened 2026-05-08).** No exceptions.
  The previous Peach-as-alert-dot carve-out (error toasts, banners, Broadcast
  structured-section warning_signs and escalation sections) is removed. The previous Rust-as-form-
  error-border carve-out is removed. Alerts now use 4px Ink left bar plus a
  Lucide AlertCircle icon prefix (banner, toast); inline form errors use 2px
  Ink underline plus a Lucide AlertCircle icon at the right of the field. No
  colour distinguishes alert from non-alert chrome.
- **Sable as Sampling-state cover** on parent-app fur-match (the moment is
  *about* fur; the cover IS pet content during sampling, so this is not a
  chrome carve-out).
- Empty-state cover on parent-app pet profile uses **Ink-faint #A8A39E**
  (structural neutral). Earlier Vanilla treatment was dropped May 5 because it
  read too "fur-token-as-placeholder"; Ink-faint reads as honest "structural
  placeholder, ready for content" without borrowing from the fur palette. Same
  applies to Broadcast cover empty state (vet has not uploaded a cover image).

### Pet Page as Hero (v1.3 brand discipline)

The per-pet profile is the emotional centerpiece of the parent app AND the demo's emotional center. Composition:
- Real pet photo as cover (full-bleed at 280px); **10px** accent border at the bottom edge of the cover uses fur-match-derived primary tone (e.g., 10px Honey for Gabby). The bottom border is the only fur-match ambient signal on the steady-state Pet Page; per locked fur kit discipline, no other chrome on the page carries a fur token. (Locked 2026-05-08, see `docs/decisions-log.md`.)
- Pet name in Spectral 32pt semibold italic.
- One warm context line in Inter 14pt Ink-soft.
- Vet credentials as magazine byline (Inter 14pt semibold + Inter 11pt Ink-soft small caps for license). See `docs/premium-feel/byline.md` for the full `<VetByline />` component spec.
- Editorial timeline of clinical moments below. Paper cards with 1.5px Ink border, presented as content not data tables.
- Open follow-up window banner if active: 4px Teal left bar, Paper bg, 1.5px Ink border, headline in Spectral semibold italic.

### App icon (locked May 5)

Spectral italic uppercase "P" in Paper, on a 135° linear gradient from Honey `#E5C896` to Peach `#E8A87C` (Gabby's actual fur-match result). No frame, no Teal in the icon itself. The fur palette carries the warmth; Teal is reserved for in-app CTAs.

- **Why this direction.** Most distinctive in the app store. The Honey-to-Peach gradient is Gabby's actual fur-match result, so the icon carries warmth derived from the parent app's pet content. The Spectral italic ties the icon to the same letterform discipline used for pet names everywhere else in the app, so the icon and the in-app pet names share visual DNA.
- **Splash screen extends the icon.** Same Honey-to-Peach gradient full-screen with "pawkit" wordmark in Satoshi Paper + Spectral italic tagline in Paper at 70% opacity. Reads as one continuous warm surface from icon tap to app open.
- **Notification icon.** Spectral italic uppercase "P" in Ink on transparent (no gradient at this size). Android renders it white in the status bar.
- **Full spec:** `docs/premium-feel/first-run.md`. Visual reference: `mockups/archive/app-icon-options-v2.html` Direction C.

### Materials (v1.3 + Premium Feel System)

Surface treatments give Paper cards depth without shadows. Full spec in `docs/premium-feel/materials.md`.

- **Vellum texture.** 4% opacity grain overlay on every Paper card via SVG filter (web) or PNG tile (native). Aesop / Maev / Smalls precedent. Invisible at glance, present at attention. Applied to: Timeline cards, Inbox messages, Invoice line items, Quick Facts rail, Pet Page open-window banner, Magic toast card. NOT applied to: whole-screen Paper background, buttons, image surfaces, loading skeletons.
- **Depth language**, borders signal layer; never shadows:
  - 1.5px Ink for primary surface (Paper cards)
  - 1px Ink-soft for structural (invoice line items, settings dividers)
  - 0 for background (whole screen)
- **No shadows anywhere, ever.** Premium feel is signalled by border weight plus vellum, not drop-shadows.

### Motion principles (v1.3 + Premium Feel System)

Three easings, five durations, never bounce. Full spec in `docs/premium-feel/motion.md`.

- **Easings:** `ease-emphasised cubic-bezier(0.2,0,0,1)`, `ease-standard cubic-bezier(0.4,0,0.2,1)`, `ease-decelerate cubic-bezier(0,0,0.2,1)`. No other curves.
- **Durations:** Instant 50ms, Quick 150ms, Standard 250ms, Expressive 400ms, Ceremonial 800ms (Pet Page first-load only).
- **Choreography rules:** stagger entrances 30ms; FLIP for layout shifts; never animate two attention-grabbing elements simultaneously.
- **Frame budget:** 60fps minimum on mid-range Android; Reanimated 4 worklets (auto-applied via `babel-preset-expo` on SDK 54, requires New Architecture which is on by default) keep animations off the JS thread.

### Photography direction (v1.3 + Premium Feel System)

Pet photos are the emotional core. The Fernandes 4 plus 200 synthetics share one visual standard. Full spec in `docs/premium-feel/photography.md`.

- **Composition:** 4:5 portrait crop, pet centred, eyes at upper third, 60% pet / 40% negative space.
- **Lighting:** soft window light camera-left at 45°, no flash, 4-6pm Pune (golden-hour adjacent), 3:1 highlight-to-shadow ratio.
- **Background:** neutral home environment, blurred ~f/2.0-2.8 equiv, never clinical.
- **Treatment:** subtle warmth +10 (yellow), saturation -5; no filters.
- **Pose:** alert plus eye contact preferred; avoid mid-yawn/bark/groom.
- **Synthetic curation:** Pexels keyword-filtered plus manual cull for lighting consistency; ~3h work for 200 pets.

### TealCTA anatomy (locked 2026-05-12)

Single canonical primary-action button across every admin screen. Day 1 build codifies this into the `<TealCTA />` shadcn component; mockup rendering already conforms.

- **Padding:** `12px 20px` (both on the 8-value scale).
- **Border-radius:** `4px`.
- **Fill:** `var(--teal)` background, `var(--bg-canvas)` text.
- **Label:** Inter 13pt 600.
- **Icon:** 14px stroke-current, `8px` gap between label and icon. Right-arrow for "Next" wizard CTAs; paper-plane for "Send" terminal commits.
- **Inline-form variant:** when paired with a 44px-tall compose field (e.g., Screen 03 reply compose row), keep explicit `height: 44px` and padding `0 20px`; same anatomy otherwise. Paired ghost button (e.g., compose-mic) inherits the same `4px` radius for visual coherence in the bar.
- **Terminal-commit variant:** Screen 06c "Confirm and Send" uses the same anatomy as wizard "Next" CTAs (no font / size / radius differentiation). Semantic weight of the terminal commit comes from label + paper-plane icon + 15-second undo hint, not from visual heaviness.
- **DSR reference buttons** (`.dsr-btn-teal` / `.dsr-btn-ghost` / `.dsr-btn-disabled` at the top of `mockups/archive/admin-locked.html`) use the same padding so the design system reference matches what screens render.
- **Pressed / disabled / loading states:** deferred to Day 1 build implementation of `<TealCTA />` shadcn component.

One-Teal-per-screen rule applies: the TealCTA is the **primary action** semantic category. Rail active border + active-window indicator are the other two acceptable semantic Teal categories per `docs/decisions-log.md`.

---

## Alt theme exploration (locked 2026-05-14) — NOT a replacement

A parallel visual direction co-exists with the locked v1.3 Teal/Paper as a
`data-theme="mauve"` switch on the dashboard `<html>` root. v1.3 stays the
default for both apps; mauve is opt-in via Settings → Appearance or
`?theme=mauve` URL param. Both themes use the same data, same routes, same
mutations.

### Mauve palette anchors

| Role | Hex | Notes |
|---|---|---|
| Primary (was Teal #006D6F) | **#9C2B5C** Boysenberry "Tasteful pop" | AMS clinic uniform family; saturation-lifted from the original #823159 on 2026-05-15 evening (HSL 327→334, 45→57, 35→39) to pull the brand out of the gray zone while keeping the Boysenberry identity |
| Ground (rail-tint) | **#EFE6E8** | Barely-there mauve. Locked 2026-05-15 late evening — dialed back from #F2DEE6 (which read as "too pink") and from the earlier #ECE7E8 / `rgba(15,12,10,0.045)` rounds (which read as gray). Reads as premium warm neutral with a whisper of Boysenberry hue, letting the canvas card lift cleanly and the berry accents pop. See `mockups/archive/ground-pink-dial-down.html` Option D. |
| Canvas (was Paper #F5F1E8) | **#F8F7F5** cool off-white | Slight warmth retained for caring-clinic character, harmony with warm fur tokens + pet photography, gentler under long viewing |

Three mauves were originally sampled in `mockups/archive/pawkit-mauve-palette-explore.html`
against the AMS uniform reference photo: Mulberry #71355C (exact uniform
match), Boysenberry #823159 (saturated lift, locked pick), Magenta wine
#8E3B6C (lighter SaaS-modern lean). The 2026-05-15 evening saturation re-tune
study sits at `mockups/archive/brand-saturation-study.html`. Three whites were
compared in the same earlier file: Pure #FFFFFF, Near-white #FAFAFA, Cool
off-white #F8F7F5 (locked).

### Typography (locked 2026-05-15 final)

**Size scale (in `apps/dashboard/tailwind.config.ts`):**
- `text-xxs` 10px — section eyebrows (sentence-case, not all-caps)
- `text-xs` 11px — captions, timestamps, helper text
- `text-sm` 12px — Ink-soft body, field labels
- `text-base` 13px — default body, row content
- `text-md` 14px — pet meta, button labels, rail items
- `text-lg` 17px — compact display, headlines, list-row pet names
- `text-2xl` 22px — page titles, KPI hero numbers
- `text-3xl` 26px — focus-card pet hero, broadcast title input, oversized callouts
- `text-display` 48px — hero count primary (largest)

**Weight conventions:**
- `font-normal` (400) — body prose, helper paragraphs
- `font-medium` (500) — `variant="ghost"` / `variant="link"` Buttons, eyebrow labels, sub-headings
- `font-semibold` (600) — every other Button (the new base), active tab, active rail item, heading, badge, status pill, KPI label, hero italic pet name
- `font-bold` (700) — display hero numbers via `font-display` (Inter at the display weight)

**Eyebrow rule (locked 2026-05-15 evening):** Sentence-case only. No
`uppercase`. No `tracking-[X.XXem]` letter-spacing. `font-medium` only. The
old "BILLED · THIS MONTH" / "WHO'S THIS FOR" / "WRITING IN" pattern shouted
from every surface; the locked rule is sentence-case + plain weight so
eyebrows feel like quiet hierarchy, not decorative chrome.

**Off-scale ban:** No `text-[Npx]` / `text-[X.5px]` arbitrary values. No `style={{ fontSize: N }}` inline. Pull from scale tokens.

### What stays unchanged across themes

- **Ink, Ink-soft, Ink-faint** — structural neutrals don't vary
- **All 10 fur tokens** (Milk → Sable) — the fur kit is a v1.3 lock independent of theme
- **Brand discipline rules** — one Teal/mauve per screen, fur never in chrome, focus rings, etc.
- **Bilingual publish-block, Sarvam wiring, RLS / data layer** — orthogonal to theme

### Chrome direction under mauve

- **Rail** — light Ink-wash (rgba(15,12,10,0.025)) bg + 1px Ink/6 right divider, mauve-tinted (rgba(130,49,89,0.12)) filled-pill active item with mauve text, no 4px Teal left bar
- **Cards** — 12px radius (vs v1.3's 4px), 1px Ink/8 border + low-elevation shadow stack (vs v1.3's 1.5px Ink frame)
- **Vellum** — hidden on mauve theme (paper-grain doesn't read on white)
- **Header search well** — faint mauve wash (rgba(130,49,89,0.06)), 8px radius
- **Primary CTAs** — same mauve as the active rail pill, no Ink border (per v1.3 CTA discipline carried forward)
- **Parent-app under mauve (Day 4–5 build):** light bottom tab nav with mauve filled-pill active, mauve Share CTA, softer 1px-Ink-bordered bubbles, mauve-tinted follow-up-window banner

### Token plumbing

`packages/design-tokens/src/tokens.css` defines both hex aliases and RGB
triplets for the swap-target tokens:

```css
:root {
  --bg-canvas: #F5F1E8;
  --bg-canvas-rgb: 245 241 232;
  --teal: #006D6F;
  --teal-rgb: 0 109 111;
}
```

Tailwind preset compiles `canvas` and `teal` to `rgb(var(--*-rgb, ...) / <alpha-value>)`
so opacity modifiers + the `[data-theme="mauve"]` override both work. The
override block in `apps/dashboard/app/globals.css`:

```css
:root[data-theme="mauve"] {
  --bg-canvas: #F8F7F5;
  --bg-canvas-rgb: 248 247 245;
  --teal: #823159;
  --teal-rgb: 130 49 89;
  --card-radius: 12px;
  --rail-bg: rgba(15, 12, 10, 0.025);
  --rail-active-bg: rgba(130, 49, 89, 0.12);
}
```

All Phase 4a chrome adaptations live in scoped `[data-theme="mauve"]` blocks
in the same file (OUTSIDE any `@layer` so they beat Tailwind's
`@layer utilities` regardless of specificity).

