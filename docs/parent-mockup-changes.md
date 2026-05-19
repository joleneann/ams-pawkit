# Parent app hi-fi mockup · change tickets

Generated 2026-05-16 from the audit pass on
`C:\Users\Jolene Fernandes\Downloads\AMS Pawkit\parent_app\hi_fi\` (12-file folder:
`tokens.css`, `primitives.css`, `chrome.jsx`, `design-canvas.jsx`, `app.jsx`,
`android-frame.jsx`, plus `screens-onboarding.jsx`, `screens-pet-page.jsx`,
`screens-inbox.jsx`, `screens-broadcasts.jsx`, `screens-settings.jsx`,
`screens-misc.jsx`).

Each ticket is independent. Severity bands:
- **P0** — demo content / spec violations that contradict CLAUDE.md or project anchor. Must fix before Day-4 build code.
- **P1** — discipline violations (token / em-dash / hardcoded values) per CLAUDE.md locked rules.
- **P2** — spec mismatches with `docs/flows/parent.md` or `docs/brand-system.md`.
- **P3** — nits / polish.

Status: all Open unless marked.

## Index

| ID | Title | Sev | Status |
|----|-------|-----|--------|
| PA-001 | Gabby shown as female across app, should be male | P0 | **Done (1 leak)** |
| PA-002 | Replace Misha + Bruno with Angel + Galaxy (Fernandes anchor) | P0 | **Done** |
| PA-003 | SysBubble references Angel inside Misha's thread | P0 | **Done** |
| PA-004 | Remove microphone icon from composer (no parent-app AI) | P0 | **Done** |
| PA-005 | Em dashes in 7 UI copy strings | P1 | **Done** |
| PA-006 | Hardcoded font-sizes bypass type-scale tokens | P1 | **Done** |
| PA-007 | Demo-dataset dates are inconsistent with "today" | P1 | **Deferred** to build |
| PA-008 | Settings "Add a pet" row should be Berry, not dashed Ink-soft | P2 | **Done** |
| PA-009 | Memorial badge uses heart glyph, spec says wings | P2 | **Done** |
| PA-010 | Per-card EN/MR pill reads as label, spec says toggle | P2 | **Done** |
| PA-011 | "Indie kitten" reads as dog-breed phrasing for a cat | P2 | **Done** |
| PA-012 | `android-frame.jsx` is dead code (orphan) | P3 | **Deferred** (kept as spare) |
| PA-013 | `dangerouslySetInnerHTML` on CommItem title is unnecessary | P3 | **Done** |
| PA-014 | Composer placeholder "Message Dr Sagar" should be "Reply" | P3 | **Done** |
| PA-015 | "Sex" vs "Gender" label inconsistency | P3 | **Done** |
| PA-016 | "Adoption year" appears in Settings but not Onboarding | P3 | **Done** (field dropped) |
| PA-017 | `PawkitMark size={N}` prop takes raw pixels, bypasses tokens | P3 | **Done** |
| PA-018 | WhatsApp share tile uses "WA" text instead of glyph | P3 | **Deferred** to build |

## v2 audit pass (2026-05-16, on `Pawkit Parent Mocks/parent_app/hi_fi/`)

15 of 18 tickets closed, 3 explicitly deferred (PA-007 / PA-012 / PA-018).
**Plus a bonus:** real Unsplash photos wired into Pet Page covers + inbox /
switcher / settings avatars + memorial Raffy with grayscale filter. That's
craft-brief Direction A landed alongside the tickets.

Two new findings caught during the v2 verification pass — filed as
PA-019 / PA-020 below:

| ID | Title | Sev | Status |
|----|-------|-----|--------|
| PA-019 | Onboarding OnbLand still says "her fur palette" (PA-001 leak) | P0 | **Done in v3** |
| PA-020 | Gabby + Galaxy both fall back to letter "G" in photo-less switcher avatars | P3 | **Done in v3** |
| PA-022 | DCSection "resilience" subtitle has em dash in `app.jsx:186` | P3 | **Done in v3.1** |
| PA-023 | MemorialSwitcher Pet Page backdrop missing `hero` props | P3 | **Done in v3.1** |

---

## PA-001 · Gabby shown as female across app, should be male

**Severity:** P0
**Status:** Open

Gabby Fernandes is male per `CLAUDE.md` ("Pet pronouns: Raffy and Gabby are male.
Angel and Galaxy are female.") and `MEMORY.md` `project_pets.md`. The mockup
treats Gabby as female in 5 places.

**Files:**
- `screens-settings.jsx:134` — locked clinical field renders `Sex: Female`
- `screens-onboarding.jsx:77` — `Seg options={['Female', 'Male']} on="Female"` for Gender field
- `screens-onboarding.jsx:74` — `"We'll find her fur palette from it."` (under "Add a photo of Gabby")
- `screens-onboarding.jsx:113` — same string in `OnbLand` (PetPage post-onboarding)
- `screens-pet-page.jsx:74` — same string in `PetPageEmpty`
- `screens-inbox.jsx:111` — `"She's not shaking her head anymore."` (parent's message about Gabby)

**Desired:**
- Locked clinical Sex: `Male`
- Onboarding Gender default: `Male` selected
- Photo prompt: `"We'll find his fur palette from it."`
- Inbox bubble: `"He's not shaking his head anymore."`

---

## PA-002 · Replace Misha + Bruno with Angel + Galaxy (Fernandes anchor)

**Severity:** P0
**Status:** Open

`CLAUDE.md`: "Anchor: Fernandes household, 4 pets (Raffy male/deceased, Gabby
male/alive, Angel female/alive, Galaxy female/alive)." The mockup invents two
pets (Misha · Persian 7y; Bruno · Labrador 2y) and drops Angel entirely. Galaxy
appears in one inbox row only.

**Files:**
- `screens-inbox.jsx:22-31` — Misha row → Angel row
- `screens-inbox.jsx:32-41` — Bruno row → can be deleted or repurposed (5 rows total is plenty with Gabby/Angel/Galaxy/Raffy)
- `screens-pet-page.jsx:397-422` — `SwitcherPostSwap` Misha → Angel (rename, recolour, rebreed)
- `screens-pet-page.jsx:355-358` — Switcher avatars: `M / B / +` → `Angel / Galaxy / +`
- `screens-pet-page.jsx:440-444` — Memorial switcher avatars: same swap
- `screens-settings.jsx:40-47` — Pets list Misha row → Angel row
- `app.jsx:91` — canvas label `"After swapping to Misha"` → `"After swapping to Angel"`

**Desired:** All non-Gabby, non-Raffy slots populated with Angel + Galaxy.
Breeds/ages need to come from the user (project memory doesn't carry them).

---

## PA-003 · SysBubble references Angel inside Misha's thread

**Severity:** P0
**Status:** Open

`screens-inbox.jsx:132` `<TopBar title="Misha" />` but `:139` SysBubble reads
`"Angel's DHPPi+L4 booster due 12 May."` Wrong pet referenced on wrong thread.

Cleanest fix combines with PA-002: rename `ThreadClosed` to be an Angel thread
end-to-end (topbar title, breed line, all bubble copy). That single change
solves the SysBubble mismatch and adds Angel to the on-screen cast.

**Files:**
- `screens-inbox.jsx:128-156` — `ThreadClosed`: replace Misha → Angel everywhere
- `screens-inbox.jsx:139` SysBubble copy stays as written (Angel reminder on Angel thread)

**Desired:** Topbar title `"Angel"`, subtitle `"with Dr Sagar · window closed"`,
SysBubble unchanged, parent bubbles re-pronoun if needed.

---

## PA-004 · Remove microphone icon from composer

**Severity:** P0
**Status:** Open

`CLAUDE.md`: "NO AI on parent app." A mic icon in a composer universally reads
as voice-to-text (Sarvam/Whisper). `docs/flows/parent.md:77` also lists composer
inputs explicitly: "text, photo, or video bubbles" — audio is not in scope.

**Files:**
- `chrome.jsx:347-356` — `Composer` primitive: remove the `<Icon id="microphone" size={18} />` icon-btn line
- `screens-misc.jsx:272-277` — `OfflineState` re-implements the composer inline; drop the mic icon-btn there too

**Desired:** Composer becomes 3 controls: `+` (attach), input field, send.

The mic SVG sprite in `Parent App.html:30` can stay (harmless if unused) or be
removed for hygiene.

---

## PA-005 · Em dashes in 7 UI copy strings

**Severity:** P1
**Status:** Open

`CLAUDE.md`: "No em dashes anywhere in docs, microcopy, or UI strings. Use
commas, periods, colons, parentheses, or sentence breaks." Seven em dashes (`—`,
U+2014) remain in UI copy. JS comment em dashes are out of scope here but worth
fixing in a separate pass.

**Files & fixes:**
- `screens-pet-page.jsx:11` — `"Annual check-up — all clear"` → `"Annual check-up, all clear"`
- `screens-pet-page.jsx:48` — same string in `TimelineShort`
- `screens-pet-page.jsx:408` — `"Dental cleaning — uneventful"` → `"Dental cleaning, uneventful"`
- `screens-inbox.jsx:36` — `"Skin scrape came back clear — no fungal."` → `"Skin scrape came back clear, no fungal."`
- `screens-inbox.jsx:111` — `"Hi Sagar — we cleaned Gabby's ear"` → `"Hi Sagar, we cleaned Gabby's ear"`
- `screens-inbox.jsx:142` — `"Photo of gums attached — they look a bit red"` → `"Photo of gums attached. They look a bit red"` (sentence break)
- `screens-misc.jsx:259` — `"Hi Sagar — we cleaned Gabby's ear"` → comma

---

## PA-006 · Hardcoded font-sizes bypass type-scale tokens

**Severity:** P1
**Status:** Open

`CLAUDE.md`: "Type sizes use Pawkit scale tokens only. No `text-[Npx]` arbitrary
values, no `style={{ fontSize: N }}` inline." Eight Pawkit-product hits (not
counting the design-canvas / android-frame scaffolding which doesn't ship).

**Files & fixes:**
- `primitives.css:46` — `font-size: 13px` (status bar) → `var(--text-base)`
- `primitives.css:174` — `font-size: 10px` (bottom nav label) → `var(--text-xxs)`
- `primitives.css:795` — `font-size: 10.5px` (bubble timestamp) — **off-scale entirely**, pick 10 (`--text-xxs`) or 11 (`--text-xs`)
- `chrome.jsx:330` — `fontSize: 10` (video duration overlay) → `var(--text-xxs)`
- `chrome.jsx:335` — `fontSize: 10.5` (media bubble caption) — off-scale, same fix
- `screens-misc.jsx:267` — `fontSize: 10.5` (offline-state media caption) — off-scale duplicate
- `screens-broadcasts.jsx:120, 150` — `fontSize: 11` ("WA" pill text) → `var(--text-xs)`
- `screens-broadcasts.jsx:268` — `fontSize: 16` (Pawkit "P" mark in OG banner) — off-scale; pick 14 (`--text-md`) or 17 (`--text-lg`)

---

## PA-007 · Demo-dataset dates inconsistent with "today"

**Severity:** P1
**Status:** Open

Multiple "open follow-up windows" point to dates already past relative to the
demo's "today" (2026-05-16). Either pick a single demo reference date and align
everything, or push all banner / due dates into the demo's near future.

**Files & current values:**
- `screens-pet-page.jsx:293` and `screens-inbox.jsx:105` — `until="28 Mar"` (past)
- `screens-pet-page.jsx:403` — Misha banner `until="22 Apr"` (past)
- `screens-pet-page.jsx:196` — `"Due 12 May · in 3 weeks"` — 12 May was 4 days ago

**Desired:** Define a single demo reference date (e.g. day of Sagar's pitch).
Drive all banner / due / "weeks-out" copy from that anchor so dates are
self-consistent. Build phase can store this in a constant: `const DEMO_TODAY = '2026-06-15'` (or whichever) and compute deltas.

---

## PA-008 · Settings "Add a pet" row should be Berry, not dashed Ink-soft

**Severity:** P2
**Status:** Open

`docs/flows/parent.md:103`: "An **Add a pet** Berry row sits at the bottom of
the card as the single entry point for adding subsequent pets." Mockup uses
the same dashed-Ink-soft treatment as the switcher "+" tile, which is
specifically the secondary route (per `parent.md:65`). Spec wants the two to
look different so the primary CTA reads as a primary CTA.

**Files:**
- `primitives.css:1181-1205` — `.pk-setrow-add` styles (currently dashed)
- `screens-settings.jsx:48-55` — usage

**Two options:**
1. Update `.pk-setrow-add` to use Berry background + white text + Phosphor `plus` icon in white, matching `pk-btn.primary`.
2. Get `parent.md:103` updated to specify dashed Ink-soft (consistent with switcher tile).

User picks the direction; flush to `decisions-log.md`.

---

## PA-009 · Memorial badge uses heart glyph, spec says wings

**Severity:** P2
**Status:** Open

`docs/flows/parent.md` and `status.md` frame memorial pets as having wings.
Mockup uses Phosphor `heart` (filled) inside a paper pill with ink border. Heart
reads as "loved", wings reads as "passed". Different signals.

**Files:**
- `chrome.jsx:287-294` — `WingsBadge` primitive uses `<Icon id="heart" size={10} />`
- `screens-inbox.jsx:55-61` — inline reimplementation also uses heart
- `screens-pet-page.jsx:370` — `SwitcherAv` wings prop also uses heart
- `Parent App.html` icon sprite — would need a new `<symbol id="i-wings">` hand-traced in Phosphor's filled style

**Two options:**
1. Hand-trace a wings glyph and add to the Phosphor sprite, swap heart → wings in all 3 usage sites.
2. Keep heart, update `parent.md` + `decisions-log.md` to say "memorial badge = Phosphor heart filled" (owns the substitution).

---

## PA-010 · Per-card EN/MR pill reads as label, spec says toggle

**Severity:** P2
**Status:** Open

`docs/flows/parent.md:84`: "Each card carries... **a per-card EN/MR toggle**".
Mockup renders a single static pill (`EN` or `मराठी`) with no chevron and no
second option visible. Reads as a metadata badge, not as an interactive toggle.

**Files:**
- `primitives.css:915-924` — `.pk-bcast .header .lang-toggle` style
- `screens-broadcasts.jsx:19, 39, 56` — three usage sites

**Desired:** Two-option segmented control (EN | MR with one highlighted) using
the existing `pk-seg` primitive sized down. Or a single pill with an explicit
swap glyph (e.g. `swap-horizontal`) that affords action. The current "EN" pill
alone fails the affordance test.

---

## PA-011 · "Indie kitten" reads as dog-breed phrasing for a cat

**Severity:** P2
**Status:** Open

`screens-inbox.jsx:45` describes Galaxy as `"Indie kitten, 5m"`. "Indie" is
shorthand for "Indian street dog" in Indian pet vocabulary. For a cat, the
parallel would be "Indian shorthair", "non-pedigree cat", or just "kitten ·
5m" without the breed qualifier. Worth a microcopy decision (defer to user).

**Files:**
- `screens-inbox.jsx:45` — `<span className="breed">· Indie kitten, 5m</span>`
- Anywhere else Galaxy is rendered with a breed line (PA-002 will introduce more
  if Galaxy gets switcher / pet-page slots)

**Desired:** User confirms Galaxy's actual breed/species framing. Microcopy
applies consistently across inbox + switcher + settings.

---

## PA-012 · `android-frame.jsx` is dead code (orphan)

**Severity:** P3
**Status:** Open

215 lines of Material 3 Android device frame (`AndroidDevice`,
`AndroidStatusBar`, `AndroidAppBar`, `AndroidListItem`, `AndroidNavBar`,
`AndroidKeyboard`) with a teal palette and Roboto font. Nothing imports it —
every Pawkit screen wraps in `PawkitFrame` from `chrome.jsx`.

**Files:**
- `android-frame.jsx` (whole file)
- `Parent App.html:78-86` — script tag block doesn't reference it (already absent)

**Desired:** Delete the file. Or add a header comment explaining why it's kept
(e.g. "spare for future cross-platform mockup rounds").

---

## PA-013 · `dangerouslySetInnerHTML` on CommItem title is unnecessary

**Severity:** P3
**Status:** Open

`screens-misc.jsx:53` uses `dangerouslySetInnerHTML={{ __html: title }}` so that
`title` strings can contain HTML entities like `&amp;` (e.g.
`"Lost &amp; found · geo-pinged"` on line 30). Plain JSX text would render
literally as `Lost &amp; found`. The fix is to pass the actual `&` character
in the prop, not the entity.

**Files:**
- `screens-misc.jsx:30` — `"Lost &amp; found · geo-pinged"` → `"Lost & found · geo-pinged"`
- `screens-misc.jsx:53` — change `dangerouslySetInnerHTML={{ __html: title }}` to `{title}`

**Desired:** No HTML injection, just plain string interpolation.

---

## PA-014 · Composer placeholder "Message Dr Sagar" should be "Reply"

**Severity:** P3
**Status:** Open

The parent never initiates a thread (`CLAUDE.md`: "The parent app accepts no
incoming messages outside an open follow-up window. No 'Message clinic'
button..."). All composer use is reply-only, inside an open window initiated by
Dr Sagar. "Message Dr Sagar…" implies cold-thread initiation.

**Files:**
- `chrome.jsx:347` — `placeholder = "Message Dr Sagar…"`
- `screens-misc.jsx:274` — inline composer placeholder same string

**Desired:** `"Reply to Dr Sagar…"` or `"Type a reply…"`.

---

## PA-015 · "Sex" vs "Gender" label inconsistency

**Severity:** P3
**Status:** Open

Onboarding Step 2 (`screens-onboarding.jsx:75`) labels the segmented control
"Gender". Per-pet Settings locked field (`screens-settings.jsx:134`) labels it
"Sex". Pick one for v0 consistency.

**Files:**
- `screens-onboarding.jsx:75` — `<div className="label">Gender</div>`
- `screens-settings.jsx:134` — `<div className="k">Sex</div>`

**Desired:** Pick one term, apply both places. Defer to user; flush to
`decisions-log.md` if non-obvious.

---

## PA-016 · "Adoption year" appears in Settings but not Onboarding

**Severity:** P3
**Status:** Open

Onboarding Step 2 collects 5 fields (Name / Species / Breed / Gender /
Birthday). Per-pet Settings adds a sixth: "Adoption year" (an editable
parent-controlled field, `screens-settings.jsx:124-127`). If it's a real field,
onboarding should collect it. If it's edit-only-later, document that.

**Files:**
- `screens-settings.jsx:124-127` — `Adoption year: 2022 ›`
- `screens-onboarding.jsx:60-88` — Step 2 form: no adoption year field

**Desired:** Either add Adoption year to Onboarding Step 2 (becomes 6 fields,
update `parent.md` if so), or document in `parent.md` that adoption year is a
post-onboarding field.

---

## PA-017 · `PawkitMark size={N}` prop takes raw pixels, bypasses tokens

**Severity:** P3
**Status:** Open

`chrome.jsx:364-371` `<PawkitMark size={N} />` accepts a numeric `size` and
applies it as `fontSize: size` inline. Used with `size=14` (Master Settings
footer, OG banner) and `size=22` (default). Both numbers happen to match
existing type tokens (`--text-md` = 14, `--text-2xl` = 22) but the prop bypasses
the token system.

**Files:**
- `chrome.jsx:364-371` — `PawkitMark` component definition
- `screens-settings.jsx:69` — `<PawkitMark size={14} />`
- `screens-broadcasts.jsx:271` — `<PawkitMark size={14} />`

**Desired:** Either restrict the prop to scale-token names (`md`, `2xl`) or
make `PawkitMark` a brand-mark exception (declared in the brand-system doc).

---

## PA-018 · WhatsApp share tile uses "WA" text instead of glyph

**Severity:** P3
**Status:** Open

`screens-broadcasts.jsx:120, 150` use `<div className="pill" title="WhatsApp">WA</div>`
in the sticky reading-view share footer. `:186` does the same in the share sheet
(`<ShareTile label="WhatsApp" mark="WA" />`). Acceptable for mockup, but in
build the universally-recognized green WhatsApp glyph is what users actually
look for.

**Files:**
- `screens-broadcasts.jsx:120, 150, 186`
- Would need a WhatsApp glyph SVG in the icon sprite, OR import the actual
  brand asset (likely outside the Phosphor kit since it's a third-party brand)

**Desired:** Real WhatsApp icon (green, recognizable). Brand assets are usually
fine to embed as static SVGs since WhatsApp share-target buttons are an
established pattern.

---

---

## PA-019 · Onboarding OnbLand still says "her fur palette"

**Severity:** P0
**Status:** Open

PA-001 said "her → his" in 3 places. The fix landed in
`screens-pet-page.jsx:74` (PetPageEmpty) and `screens-inbox.jsx:101`
(ThreadOpen pronoun bubble) but the parallel string in
`screens-onboarding.jsx:113` (OnbLand) was missed.

**File:**
- `screens-onboarding.jsx:113` — `<div>We'll find her fur palette from it.</div>` → `<div>We'll find his fur palette from it.</div>`

Trivial one-line fix.

---

## PA-020 · Gabby + Galaxy both fall back to letter "G" in switcher

**Severity:** P3
**Status:** Open

`screens-pet-page.jsx:355-357, 440-442` — `SwitcherAv` calls pass
`letter="G"` for both Gabby (honey) and Galaxy (peach). When the
Unsplash photos load, the letter is hidden (`color: transparent`). If
photos fail to load (offline, CDN hiccup) both avatars show the same
"G" indistinguishably.

**Files:**
- `screens-pet-page.jsx:357` and `:442` — `<SwitcherAv tone="peach" letter="G" photo={PETS.galaxy.photo} />`

**Fix options:**
1. Change Galaxy's fallback letter to `"Gx"` (matching the v1 Inbox row treatment).
2. Add a `name` prop and derive initials from it.
3. Accept the risk since photos almost always load (Unsplash CDN is reliable).

---

---

## PA-022 · DCSection "resilience" subtitle has em dash

**Severity:** P3
**Status:** Done in v3.1 (`app.jsx:186`)

`app.jsx:186` carried `subtitle="Achromatic — Ink + warning icon."` This text
is rendered as canvas chrome (visible to anyone scrolling the design canvas),
not a JS comment, so the em-dash ban applies. Fixed to a colon:
`subtitle="Achromatic: Ink + warning icon."`

---

## PA-023 · MemorialSwitcher Pet Page backdrop missing `hero` props

**Severity:** P3
**Status:** Done in v3.1 (`screens-pet-page.jsx:448-450`)

`SwitcherActive` and `MemorialSwitcher` are both press-and-hold switcher
backdrops on the same Pet Page. v3 left them inconsistent: `SwitcherActive`
used `Cover hero` + `PetNameRow hero` + `PetSubline hero`, but
`MemorialSwitcher` still had the old un-hero layout
(`Cover tone="honey" height={140}` + `PetNameRow` + `PetSubline`).

Fixed by aligning MemorialSwitcher to match `SwitcherActive`:
- `<Cover hero tone="honey" photo={PETS.gabby.photo} />` (dropped explicit `height={140}`)
- `<PetNameRow hero name="Gabby" />`
- `<PetSubline hero>Golden Retriever · 4 years</PetSubline>`

Both switcher backdrops now show the same magazine-cover Pet Page beneath
the popover.

---

## Status legend

- **Open** — needs work
- **Done** — fixed in mockup or in build code
- **Wontfix** — explicitly declined; reason must be in `decisions-log.md`
- **Deferred** — pushed past v0; reason in `docs/open-issues.md`
