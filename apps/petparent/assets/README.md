# Parent app assets

Canonical vector sources for the parent app's first-run surfaces. PNG exports
needed before `app.json` can reference them.

## Files in this folder

| File | Type | Purpose |
|---|---|---|
| `icon.svg` | Vector source | Pawkit app icon (Direction C, locked 2026-05-15 evening). Lora italic 600 "P" on Honey → Peach 135° gradient. |
| `splash.svg` | Vector source | Splash screen extending the icon gradient + Inter Bold "pawkit" wordmark + Lora italic tagline. |

## PNG exports needed

Once exported, wire into `apps/petparent/app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#F8F7F5"
    },
    "android": {
      "package": "ai.pawkit.petparent",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#F8F7F5"
      }
    }
  }
}
```

### Required sizes

| Output file | Source | Size | Used for |
|---|---|---|---|
| `icon.png` | `icon.svg` | 512×512 | Expo `icon` (auto-scales for iOS / Android home screen) |
| `adaptive-icon.png` | `icon.svg` | 1024×1024 | Android adaptive foreground (safe zone = centre 66%) |
| `favicon.png` | `icon.svg` | 48×48 | Web (only matters if we ever ship a parent-app web PWA, v1+) |
| `splash.png` | `splash.svg` | 1284×2778 | Portrait splash; Expo handles scaling |

### Export workflow

Pick one:

**Figma:** open the SVG → Export at the listed size → PNG, 32-bit.

**Inkscape (CLI):**

```bash
cd apps/petparent/assets
inkscape icon.svg --export-type=png --export-filename=icon.png --export-width=512 --export-height=512
inkscape icon.svg --export-type=png --export-filename=adaptive-icon.png --export-width=1024 --export-height=1024
inkscape icon.svg --export-type=png --export-filename=favicon.png --export-width=48 --export-height=48
inkscape splash.svg --export-type=png --export-filename=splash.png --export-width=1284 --export-height=2778
```

**Node (resvg):**

```bash
npx @resvg/resvg-js@latest icon.svg -o icon.png -w 512 -h 512
# repeat for other sizes
```

### Font fallback warning

The SVGs reference Lora and Inter via `font-family`. The rasterization tool
needs those fonts installed locally (Lora + Inter are both Google Fonts; install
once on your machine, then export). If the fonts aren't present, the export will
fall back to Georgia / Helvetica Neue and lose the letterform fidelity.

## Spec sources

- `docs/premium-feel/first-run.md` — full first-run spec
- `docs/brand-system.md` — palette + typography (mauve-only v1.4)
- `docs/decisions-log.md` 2026-05-15 evening — font swap (Spectral → Lora,
  Satoshi → Inter) that this asset set reflects
