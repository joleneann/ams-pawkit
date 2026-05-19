# First-run assets (app icon + splash)

First thing Sagar sees on each phone. First thing he installs. The icon
represents Pawkit at 1cm², must be premium at that size.

## App icon (Pawkit), Direction C locked

**Lora italic "P" on a fur-tone gradient.** Editorial typography sits on
Pawkit's signature warm palette. Direction "C" picked over paw print, dog
silhouette, and Ink-framed letterform variants after side-by-side comparison.

The icon is **frozen at the brand level for every install** — same Honey to
Peach gradient on every phone, every household. It is NOT generated per pet
or per household. Per-pet personalization happens inside the app (avatar
rings, Pet Page accent borders, memorial cards driven by each pet's own
algorithm result). The icon is the shared brand surface; the inside-app
treatments are the per-pet identities.

- **Background:** linear gradient at 135°, from Honey `#E5C896` (top-left) to Peach `#E8A87C` (bottom-right). The palette has provenance in real pet content: it was derived by running the fur-match algorithm on Gabby's photo, not picked in Figma. Once derived, frozen as the Pawkit brand signature.
- **Letter:** uppercase "P" in **Lora italic 600**, in canvas `#F8F7F5` (was Spectral semibold italic in Paper `#F5F1E8` under v1.3; letterform swap locked 2026-05-15 evening, canvas hex locked 2026-05-14 at the mauve lock).
- **Letter sizing:** P fills approximately 75% of icon height. Optically centred, slight downward bias to compensate for the italic descender.
- **Frame:** none. The gradient fills edge to edge.
- **Corner radius:** 22% of icon size (matches iOS/Android system mask, so the icon will not look awkwardly clipped on any platform).
- **No Berry in the icon.** The fur palette carries the warmth; Berry is reserved for in-app CTAs.

**Why this direction.** Most distinctive in the app store (no other pet app
uses this composition). The brand palette has provenance in real pet content:
the Honey-to-Peach gradient is what the fur-match algorithm returned on
Gabby's photo, so the icon's warmth was derived from a real pet rather than
picked as a brand-decorative palette. Once derived, it's frozen as Pawkit's
signature; every household sees the same icon. The Lora italic ties to
the same letterform discipline used for pet names everywhere else in the
app, so the icon and the in-app pet names share visual DNA.

**Sizes to generate:**
- Android adaptive icon: 192 / 512
- Play Store listing: 512
- iOS placeholders for v1: 1024 (master), 60 / 76 / 120 / 152 / 180

**Smallest size handling.** At 32×32 notification, the gradient compresses and the
"P" is hard to read. Notification icon switches to monochrome (see Notification
icon section below).

## Splash screen (Expo)

- **Background:** Honey to Peach gradient (same 135° gradient as the app icon). Full-screen, no canvas bg.
- **Centred wordmark:** "pawkit" in Inter 36pt canvas, no Berry dot (the icon's signature warmth carries the brand recognition; the splash extends that into the wordmark surface).
- **Below wordmark:** warm context line "your pet's records, in your pocket" in Lora italic 14pt in canvas at 70% opacity, sitting on the gradient.
- **Auto-dismiss:** when JS bundle loads (typical 1 to 2s on first cold start)
- **No spinner, no progress bar.** Stillness reads premium.

## PWA manifest (dashboard) — deferred to v1+

Dropped from v0 alongside the 2026-05-10 no-Sagar-push lock. Dashboard
ships a browser-tab favicon only in v0; no installable PWA shell. PWA
manifest + dashboard app icon return in v1+ when dashboard either goes
mobile-responsive or grows browser-push. See `docs/decisions-log.md`
Communication and AI features section.

## Notification icon (parent app only)

32×32 monochrome: Lora italic uppercase "P" in Ink on transparent
background, no gradient, no frame. Android renders this in white on the
notification shade automatically. The italic stays visible at 32px because
uppercase letterforms survive better at small sizes than lowercase.
(Dashboard side has no notification icon in v0 per the 2026-05-10
no-Sagar-push lock.)

## Visual reference

`mockups/archive/app-icon-options-v2.html` Direction C.
