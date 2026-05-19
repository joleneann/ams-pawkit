# Parent app hi-fi mockup · v3 brief for Claude Design

Hand-off brief for the v3 round. v1 and v2 produced a disciplined mockup
with real photos. v3 needs to push from "disciplined product mockup" to
"magazine-cover Pawkit pitch piece". Three directions to land. Each is
concrete and self-contained.

## Where you're starting from

**v2 mockup folder:**
`C:\Users\Jolene Fernandes\Downloads\Pawkit Parent Mocks\parent_app\hi_fi\`
(12 files + an `assets/` folder with `phosphor-sprite.svg`, `logo-mark.svg`,
`logo-pawkit.svg`).

**What v2 already has, do not undo:**

- Real photos throughout via the `PETS` registry in `chrome.jsx:10-18`
  and `BROADCAST_PHOTOS` for broadcast covers.
- `Cover` primitive accepts a `photo` prop + a `memorial` overlay
  (full sable wash at 0.62 opacity for deceased pets).
- Memorial Raffy inbox avatar has `filter: grayscale(0.55) brightness(0.85)`.
- Sampling state has a dramatic full sable wash at 0.86 opacity over
  Gabby's photo, with the berry scan line on top
  (`chrome.jsx:149-154`).
- Hand-traced `i-wings` glyph in the SVG sprite (`Parent App.html:67`),
  used in inbox memorial row + switcher memorial avatar. Heart was
  replaced; do not revert.
- Per-card EN/MR segmented control on Broadcast cards (a real two-option
  toggle, not a pill).
- Berry primary CTA "Add a pet" row in Settings (`.pk-setrow-add` with
  `background: var(--berry)` and white text).
- Composer is 3 controls only: plus, input, send. No microphone icon.
  Parent app has zero AI features per `CLAUDE.md`.
- "Reply to Dr Sagar…" placeholder copy on the composer.
- "Gender" (not "Sex") in the locked Identity row; Gabby `Gender: Male`.
- Adoption year field dropped from Per-pet Settings.
- Galaxy is "Indie, 11y", not "Indie kitten, 5m".
- All font sizes use `var(--text-*)` tokens. Zero hardcoded `font-size:
  Npx` or `fontSize: N` anywhere in Pawkit-product files (`primitives.css`,
  `chrome.jsx`, all `screens-*.jsx`).
- Zero em dashes (`—`) in any UI copy string. JS comments still have
  some; leave them alone.
- 5-tab icon-only bottom nav. **No labels.** Locked across
  `docs/flows/parent.md:13`, `docs/critical-files.md:66`,
  `docs/decisions-log.md:2125` (locked 2026-05-09),
  `docs/layout-spec.md:483`. Aria-labels carry the role for screen readers.
- Fernandes anchor:
  - Gabby (male, Golden Retriever, 4y)
  - Angel (female, Persian, 8y)
  - Galaxy (female, Indie, 11y)
  - Raffy (male, Indie, deceased 2009 to 2024)

## What v3 needs

Three directions, in priority order. Land at least the first one. Two if
time. All three if you have the room.

### Direction D · Hero the Pet Page like a magazine cover  (highest priority)

The Pet Page steady-state is **the brand hero** per `docs/flows/parent.md`.
It's the demo's emotional centre. Currently rendered as a 140-180px cover
band with a 26px name above a body-row subline above a tabstrip; reads
as a tab UI with a banner. Make it the cover.

Concrete asks:

- **Cover photo full-bleed at 320-380px height.** Currently `height={140}`
  or `height={180}` across Pet Page screens; bump the default. Edit
  `chrome.jsx Cover` default and every `screens-pet-page.jsx` usage that
  passes a height.
- **Pet name at `var(--text-display)` 48px Lora italic**, overlapping
  the cover's bottom edge by ~20-24px (drop-cap style). Currently in
  `primitives.css .pk-petname-row .name` at `--text-3xl` (26px). Keep
  26px in non-hero contexts (inbox row, switcher avatar fallback,
  settings row, memorial pet sub). Only the Pet Page hero gets 48px.
  Probably introduce a `.pk-petname-row.hero` variant.
- **Subtitle becomes an eyebrow line**, not a body row.
  `primitives.css .pk-petsub` currently uses `var(--text-sm)` with
  `color: var(--ink-70)`. Hero variant: `var(--text-xxs)` uppercase
  with `letter-spacing: var(--tracking-eyebrow)`, `color: var(--ink-50)`.
- **Tabstrip with breathing room**, not docked directly under the cover.
  Add ~16-20px of canvas air between the name/subline block and the
  tabstrip start.
- **First Timeline card framed by air.** Padding-top on the scroll area,
  framing the first row as the gateway into the content list.

Apply to: `PetPageSteady`, `PetPageTimeline`, `PetPageVaccinations`,
`PetPageInvoices`, `PetPageWindowOpen`, `PetPageReminder`, `PetPageQuiet`,
the Pet Page backdrops in `SwitcherActive` / `SwitcherCoachmark` /
`SwitcherPostSwap`, `MemorialPetPage`.

Do not apply to: `PetPageEmpty`, `PetPageSampling`, `PetPageTransformed`.
These are ceremony states; the hero only emerges at Steady (see Direction
B for the beat that transitions in).

### Direction B · Finish the hero moments

Sampling landed in v2. Three sub-moments still need ceremony.

- **MagicToast** (`screens-pet-page.jsx:131-147`, primitive
  `pk-magic-toast` in `primitives.css`). Currently a 12px-tall horizontal
  strip with a swatch + name + the engineer-debug text `"Dismissing in
  4s…"`. **Drop the "Dismissing in 4s…" line entirely.** Re-stage as a
  centered take-over panel: Gabby's photo at the top of the panel,
  palette swatch + the copy "Meet Gabby, a Honey palette dog." beneath.
  About 60-70% the height of the cover band. Holds for 2 seconds before
  dismissing, no visible countdown. Reads as a ceremony, not a
  notification.

- **Transformed beat.** With Direction D, Steady moves to 48px. Use
  Transformed as the beat: draw 2 mockup frames in the design canvas.
  Frame 1, immediately after the Magic toast fades: name lands at
  64-72px Lora italic. Frame 2: name reflows down to the 48px Steady
  size with the rest of the Pet Page chrome settling beneath. Shows the
  cadence to the build team.

- **Override sheet** (`screens-settings.jsx OverrideSheet`). Currently
  shows one static state with Honey selected. Add 2 more mockup frames
  depicting the live-preview swap: pick Peach, preview swatch at the
  top of the sheet changes to Peach and the ring moves to the Peach
  token. Pick Smoke, same with Smoke. Each is its own DCArtboard in the
  Settings section of the canvas.

### Direction C · Texture / paper / material craft

The mockup is on-token and almost too clean. Layer in editorial paper.
Subtle, never visible unless you look. **Not** Material Design 3
elevation, **not** AI-slop maximalism. The principle is editorial paper
warmth per `docs/premium-feel/materials.md`.

Concrete asks:

- **Cover photos get a vellum filter.** A low-opacity warm overlay div
  over the cover photo. `mix-blend-mode: multiply` with a vanilla/honey
  tint at 6-8% opacity, or a CSS `filter: brightness(0.98)
  saturate(0.95)` plus a `linear-gradient` warm wash
  absolute-positioned inside the cover. Goal: photo feels like it's
  printed on warm paper, not a digital RGB blast.
- **Cards get inner-light.** A 1px inset highlight on the top edge:
  `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5)` on cards,
  banners, sheets. Subtle paper-edge sheen, not a Material 3
  elevation halo.
- **Berry primary CTAs get inner-light.** Same treatment on
  `.pk-btn.primary`, the Berry "Add a pet" row, and the open-follow-up
  `pk-banner.berry`. Brand colour stays mauve; the highlight makes it
  feel pressable.
- **Open-follow-up Berry banner gets paper grain.** Currently a flat
  berry block. Add a very subtle inset `linear-gradient(...)` or a
  low-opacity noise SVG background to suggest paper. Should read as
  "vet's note pinned for you", not as a notification block.
- **Bottom nav soft top edge.** Currently a flat
  `border-top: 1px solid var(--rule)`. Replace with a soft top edge: a
  gradient hairline (`linear-gradient(...)` at 1-2px) or a very subtle
  upward `box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.03)`. Hairline weight,
  paper-edge tone, not a Material drop shadow.
- **Pill chips and `pill-paid` get gentle paper edges.** Existing
  `pk-pill` rounded chips on the Pet Page banner area + invoice rows.

Do not add new colours. Do not add drop shadows. Do not decorate.
Texture only.

## Outstanding audit tickets

Two v2-pass follow-ups, both trivially closeable:

- **PA-019** · `screens-onboarding.jsx:113` (OnbLand) still says
  `"We'll find her fur palette from it."`. PA-001 said "her → his" in
  three places; this is the third. One-word fix.
- **PA-020** · Switcher avatars at `screens-pet-page.jsx:357, 442` use
  `letter="G"` for both Gabby (honey) and Galaxy (peach). When photos
  load, the letter is hidden (`color: transparent`); if Unsplash
  hiccups they're indistinguishable. Use `letter="Gx"` for Galaxy to
  match the inbox row treatment.

Three v2 tickets deferred to the build phase (not your problem):
- PA-007 demo-dataset dates (banner `until="28 Mar"` etc. refer to past
  dates relative to today 2026-05-16).
- PA-012 `android-frame.jsx` orphan, kept as spare.
- PA-018 WhatsApp share tile uses text "WA" instead of the brand glyph.

Full ticket file: `docs/parent-mockup-changes.md`.

## Cross-references

- Audit tickets: `docs/parent-mockup-changes.md`
- Premium feel disciplines: `docs/premium-feel/INDEX.md`,
  `docs/premium-feel/photography.md`, `docs/premium-feel/materials.md`,
  `docs/premium-feel/motion.md`
- Pet Page spec: `docs/flows/parent.md` § "Pet Page"
- Brand system: `docs/brand-system.md`
- Type-scale tokens: `packages/design-tokens/src/tokens.css` (project
  source of truth, mirrors the mockup's `tokens.css`)
- v2 mockup (your starting point):
  `C:\Users\Jolene Fernandes\Downloads\Pawkit Parent Mocks\parent_app\hi_fi\`
- v1.3 archive (atmosphere reference only, not colour; the colour system
  has since moved to mauve):
  `mockups/archive/parent-v1.3.html`,
  `mockups/archive/premium-components-v1.3.html`
