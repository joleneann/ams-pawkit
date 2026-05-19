# Premium Feel System (Index)

The cross-cutting disciplines that make Pawkit feel premium beyond colour.
Brand tokens (Boysenberry `#9C2B5C`, Lora italic, fur kit, cool off-white
canvas `#F8F7F5` + rail-tint ground `#EFE6E8` + Ink) live in
`docs/brand-system.md`. This folder holds the implementable specs for the 9
disciplines that turn those tokens into a premium product.

> **Token + kit drift, 2026-05-15 evening.** The per-dimension specs below
> were written against the v1.3 Teal / Paper / Satoshi / Spectral / Lucide
> stack. The mauve-only build superseded all of those:
> - **Teal `#006D6F`** → **Berry `#9C2B5C`**
> - **Paper `#F5F1E8`** → **canvas `#F8F7F5`** (cards) + **rail-tint
>   `#EFE6E8`** (workspace ground)
> - **Satoshi (display)** → **Inter (body + display)**
> - **Spectral italic** → **Lora italic 600** (pet-name hero only)
> - **Lucide** → **Phosphor Icons filled**
> - **Vellum SVG filter** swept out of the dashboard 2026-05-15 (orphaned
>   vellum-filter.tsx + `.vellum` classes + CSS rule removed). Status on
>   parent app: open.
>
> Anywhere the per-dimension files below reference the old tokens, treat
> the principle as still binding but the token name as renamed.

Load the specific file you need; these are reference docs, not auto-loaded
into every session.

| File | Dimension | Load when |
|---|---|---|
| [motion.md](motion.md) | 3 easings + 5 durations + per-screen choreography | Wiring Reanimated, animating any transition, building Pet Page entrance |
| [photography.md](photography.md) | 4:5 portrait, soft window light, treatment | Curating Pexels for synthetic 200, planning Fernandes shoot, treating photos |
| [voice.md](voice.md) | Microcopy reading level + do/don't matrix + Marathi rules | Writing any user-facing string, microcopy round, system message templates |
| [states.md](states.md) | Loading skeletons + empty grammar + 3 error types + offline | Implementing any screen's state coverage |
| [haptics.md](haptics.md) | `expo-haptics` pattern map (parent app only) | Wiring haptics on any parent-app interaction |
| [first-run.md](first-run.md) | App icon + splash + PWA manifest + notification icon | Building Day 1 first-run assets |
| [byline.md](byline.md) | `<VetByline />` 3 variants (compact / full / centre) | Implementing the vet credentials component |
| [spacing.md](spacing.md) | 8-value scale `4·8·12·16·24·32·48·64` + Lora italic ascent correction (was Spectral italic in v1.3) | Spacing audit (Day 6), Tailwind class discipline |
| [materials.md](materials.md) | Depth language (1.5px / 1px / 0). Vellum SVG filter swept out of dashboard 2026-05-15. | Building any canvas card surface |

## Cross-cutting principles
- **Berry is the brand amplifier, not a budget.** The v1.3 "one Teal per
  screen" rule was relaxed at the mauve lock (2026-05-14): Boysenberry now
  shows up across CTAs, hero count cards, vet bubbles, active tabs,
  segmented toggles, active rail item, focus rings, and search wash. See
  `docs/brand-system.md` mauve banner.
- **One ceremonial moment per session.** Pet Page first-load animation fires
  once, not on every navigation.
- **Stillness signals confidence.** No spinners, no shimmers, no decorative
  motion.
- **Restraint over flourish.** Every premium dimension is about what's NOT
  there.
- **Editorial over functional.** Pet Page is content, not a form. Structured
  broadcasts are magazine articles, not checkout flows.

## Deferred to v0.1 (kept for traceability, not in v0 build)
- **Iconography polish.** Custom pet-specific illustration set (vaccine vial,
  microchip, water bowl, paw scale, leash, treat). Phosphor filled alone is
  disciplined enough for v0 (locked 2026-05-15 evening; replaced the prior
  Lucide stroke kit).
- **Onboarding ceremony Lottie.** First-run Lottie plus post-Step-2
  celebration screen. Step-1 to Step-2 transition stays under motion system.
- **Performance perception polish.** Optimistic UI on send plus pre-fetch
  plus frame budget monitoring. Modern Next.js + Expo handle pre-fetch
  implicitly. Frame budget logging is a debug tool, not user-facing.
