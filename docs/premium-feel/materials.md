# Materials (depth language; vellum DEPRECATED on dashboard)

> **DEPRECATED ON DASHBOARD, 2026-05-15.** The vellum SVG filter, the
> `<VellumFilter />` component, the `.vellum` CSS class, and the
> `vellum-filter.tsx` orphan were all swept out of `apps/dashboard/`
> during the inbox-v2 surface lock. The depth language (1.5px / 1px / 0
> borders) survives and is the current source of truth for surface
> elevation — see the **Depth language** section below. The vellum spec
> in the **Vellum texture** section below is preserved as v1.3 history
> and as an open question for the parent app (which still has the
> assets in `packages/design-tokens/assets/` but doesn't consume them
> yet). The Paper / Teal token names throughout this file map to
> canvas / Berry under the mauve build; see `docs/brand-system.md`
> banner for the full rename.

The single biggest visual differentiator from "shadcn defaults" (v1.3
intent, mostly retired in the mauve build): flat canvas
cards read template-y; vellum-textured canvas reads handcrafted. Aesop /
Maev / Smalls precedent.

## Vellum texture

A subtle paper grain overlay on every canvas card surface (4% opacity).

**Web (SVG filter):**

```html
<svg width="0" height="0" style="position:absolute">
  <filter id="vellum">
    <feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves="2" seed="4" />
    <feColorMatrix values="0 0 0 0 0.06
                           0 0 0 0 0.05
                           0 0 0 0 0.04
                           0 0 0 0.04 0" />
  </filter>
</svg>
```

Apply via `filter: url(#vellum)` on a `::before` pseudo-element of the card.
The `feColorMatrix` keeps the noise tinted toward Ink (warm desaturated
brown) at 4% alpha. Invisible at glance, present at attention.

**Native (Expo PNG fallback):**

24×24 seamless tile PNG generated from the same SVG filter (export at 4× then
downscale). Loaded as `<ImageBackground>` overlay at 4% opacity on canvas cards.

**Where vellum applies:**
- canvas cards in Timeline, Inbox messages, Invoice line items, Clinical history visit cards, Quick Facts rail
- Audience-filter card + Delivery-channels card on Broadcast send screen (06c)
- Pet Page open-window banner
- Magic toast card

Clinical history visit cards (`.s5-card`) and Broadcast send confirmation cards (`.s6c-confirm-block`, `.s6c-confirm-channels`) added 2026-05-12 via heuristic audit; same document-record surface semantic as invoice line items + Quick Facts rail. The Broadcast send hero (`.s6c-confirm-hero`) stays excluded because it's Ink-on-canvas-inverted, not a canvas surface.

**Inbox row dividers removed from the structural depth layer 2026-05-13** per UX polish pass: top-zone line stutter (4 horizontal rules in 190px) reduced first by dropping the subtab container border, then by dropping the per-row dividers. Inbox rows now group by 56px rhythm + 46px avatar circles + 180px sender-column anchor; no hairline. The depth-language table above reflects this (entry removed from the structural 1px Ink-soft row).

**Open issue 2026-05-13: vellum filter renders as a uniform tint, not a paper-grain texture.** Diagnostic on the inbox `<ul>` (large bare surface adjacent to canvas, no border to hide a tint shift) showed the filter is functionally broken: the `feColorMatrix` outputs constant brown RGB regardless of input noise, alpha varies with noise but `baseFrequency: 2.4` is sub-pixel so the noise averages out to a uniform tint. Net effect on canvas (`#F5F1E8`): peak ~4% alpha drops canvas to ~`#ECE8DF`, a 9-RGB shift that reads as a distinct tinted block. Today this is masked everywhere it ships because every eligible vellum surface has a 1.5px Ink border (cards/banners/toast) that visually justifies the tint shift, OR is small enough to not register against neighboring surfaces. Brand-system fix (filter rework: lower `baseFrequency` ~0.7 + alpha derived from noise RGB so texture is visible, not just tint) is open. Until then: do not extend vellum to bare-surface contexts. Adding inbox `<ul>` to the vellum-eligible list is deferred until filter is reworked.

**Where vellum does NOT apply:**
- Whole-screen canvas / rail-tint background (would read noisy at full coverage)
- Buttons (Berry CTA stays clean)
- Image surfaces (covers, avatars)
- Loading skeletons (clean reads as "loading")

## Depth language

No shadows, anywhere, ever. Depth is signalled by border weight:

| Layer | Border | Use |
|---|---|---|
| Primary surface | 1.5px Ink | canvas cards (Timeline, Quick Facts, Magic toast, Banners), App icon frame |
| Structural | 1px Ink-soft | Invoice line items, Settings section dividers |
| Background | 0 | Whole screen, sheet backdrops |
| **Berry CTAs** | **0** on canvas surfaces | Filled Berry background grounds itself; no Ink border. **Build gotcha:** when implementing as `<button>`, set `border: none` (or `border: 0`) explicitly. Omitting the property leaves the browser's default button border visible. Same applies to React Native `<Pressable>` / NativeWind: the `border-0` class must be set explicitly. |

**Exception:** the override-picker save button keeps the 1.5px Ink border because
it sits over a non-canvas sheet surface where Berry alone doesn't ground enough.

## Hover / pressed states

- **Hover (web):** card border darkens from 1.5px Ink (alpha 1.0) to 1.5px Ink (alpha 1.0); i.e. no change. Hover state lives in the cursor plus 4px shift of an icon if interactive.
- **Pressed (touch):** card scales 1.0 to 0.98 in 50ms instant plus medium impact haptic on tap-down. Returns 0.98 to 1.0 in 150ms quick on tap-up.
- **Disabled:** opacity 0.4, no border change, no haptic.

## Asset paths

- `packages/design-tokens/assets/vellum.svg`, SVG filter definition (web)
- `packages/design-tokens/assets/vellum-tile.png`, 24×24 PNG fallback (Expo)
