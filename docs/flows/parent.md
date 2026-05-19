# Parent flows: how a pet parent uses Pawkit

The parent-side experience of Pawkit. Locked decisions live in `docs/decisions-log.md`.

## What the parent app is

Paid for by the clinic, where each pet has a permanent page holding their visit records, care reminders, bills, and conversation with their vet during open follow-up windows. Bilingual EN+MR. Designed so a low-literacy user can navigate easily.

## Daily rhythm

Most days the parent doesn't open Pawkit. The app pings them when something happens (vaccination due, vet publishes a Broadcast, vet replies inside an open follow-up window). The push deep-links to the relevant screen.

When the parent does open the app, they land on **Pets** by default. The bottom nav is icon-only with five tabs, left to right: **Broadcasts / Community / Pets / Inbox / Shop**, with Pets dead-center as the home anchor. Community and Shop are v0 placeholders teasing the future Pawkit Plus social layer (Engine 2) and clinically-curated marketplace (Engine 3). Master Settings is not in the bottom nav; it's reached via a avatar pill in the top-right of the Pet Page cover.

## Pets - the brand hero

The Pets tab opens directly to the Pet Page. In multi-pet households, the parent **press-and-holds the Pets icon in the bottom nav** to surface a pet switcher (avatars in a row with fur-match rings); release on the chosen pet to swap the Pet Page underneath. The switcher row ends with a small **"+" Add-a-pet tile** (dashed Ink-soft border to read as "not a pet"); releasing on it opens the same five-field form as Onboarding Step 2. Single-pet households never trigger this affordance.

The steady-state Pet Page (after onboarding and any vet-entered clinical records) is the brand hero and the demo's emotional center:

- Real photo cover with a 10px fur-token accent border at the bottom
- Pet's name in Lora italic 600, with a gear pill icon on the right of the name row that opens Per-pet Settings (distinct from the household pill above)
- Subtitle line beneath the name in Ink-soft: `{breed} · {age}` (e.g. "Golden Retriever · 4 years")
- Three tabs: **Timeline** (visits notes, system-generated reminders), **Vaccinations** (past vaccines taken and upcoming schedule view), and **Invoices** (per-pet, per visit)
- Timeline entries render as cards with a left-aligned context icon (stethoscope for clinical visits, syringe for vaccinations), bold title, Ink-soft detail line beneath, and an Ink-faint compact date right-aligned (e.g. "14 Mar")

### Banners above the tabs

- **Open follow-up window:** 4px Berry banner above the tabs with copy in the pattern "Dr Sagar is here for `{pet name}` until `{date}`." with an **Open thread >** affordance beneath. Window expiry is shown on this banner itself, not as a separate reminder.
- **Active reminder** (vaccination due, annual checkup due, or custom clinic-set reminder): small banner sitting alongside or instead of the open-window banner; tap deep-links to the relevant Vaccinations or Timeline tab.
- **No open window, but past conversation exists:** smaller "View past conversations with Dr Sagar" link in Ink-soft sits below the byline. Hidden entirely when no thread ever existed.

### Fur-match (first photo upload)

The first time the parent uploads a pet photo, the page transitions through three states:

1. **Empty** — Ink-faint cover, diagonal-stripe placeholder.
2. **Sampling** — Sable cover, Berry scan-line, fur tokens lighting up.
3. **Transformed** — the parent's actual photo at full size, the 10px Honey accent border draws in carrying the algorithm-derived primary fur tone, and a magic toast briefly surfaces announcing the pet's name in Lora italic plus the named palette. The toast dismisses after 4–5 seconds and the page resolves into the steady-state Pet Page.

The Transformed state intentionally mirrors the steady-state so the ceremony's promise lines up with the payoff. It's a moment of secondary visual delight inside the hero, not the centerpiece.

### Override picker

If the algorithm gets the fur match wrong, the parent opens the override picker bottom sheet from Settings : 3-column grid of 10 fur tokens with live preview, a "More options" chevron that reveals the two-tone toggle, and a named save button ("Save Honey", "Save Honey + Peach"). User choice persists separately from the algorithm's match for the training pipeline.

### Multi-pet switcher discovery

Press-and-hold is a hidden gesture, so the moment the household adds a second pet, a one-time discovery cue fires. On returning to the Pet Page after submitting **Add a pet** in Settings, the Pets icon in the bottom nav performs a subtle bounce-wiggle animation and surfaces a coachmark tooltip above it in the parent's selected language: "Press and hold to switch pets" (EN) / the equivalent MR translation. The coachmark dismisses on tap or on the first successful press-and-hold, whichever comes first; if neither happens, it re-fires once at the start of each of the next two app sessions before retiring silently.

## Onboarding

For v 0.1 demo, two steps, no phone OTP:

1. **Household name** — optional, defaults to "Your household".
2. **First pet** — five required fields: name, species, breed, gender, birthday-or-age (toggle). No photo at onboarding; photo upload happens later on the Pet Page where it triggers fur-match.

Once the vet creates clinical records for a pet, name, breed, sex, and age lock on the parent side; photo and avatar remain editable.

### Adding subsequent pets

Two entry points (both land on the same five-field form, both submit-then-redirect to the new pet's empty Pet Page where photo upload triggers fur-match):

1. **Settings → Pets → Add a pet.** The primary route. Reaches the form via the master Settings Pets section, where the "Add a pet" row sits at the bottom of the existing-pets list.
2. **Switcher → "+" tile.** Secondary route added 2026-05-16. The multi-pet switcher (press-and-hold the Pets nav icon) ends its avatar row with a small "+" tile; releasing on it opens the same form. The "+" tile is dashed Ink-soft (not a fur ring) so it reads as "not a pet" inside the pet row.

Both routes use the same `<PetIdentityForm />` component (Onboarding Step 2 reuse). There is no separate "second pet onboarding" flow. The Pets tab itself still stays a clean Pet Page of the focused pet, never a creation surface; the "+" lives inside the press-and-hold popover, not inline on the Pet Page chrome.

## Inbox

Per-pet 1:1 conversations with Dr Sagar. One row per living pet, each showing the pet's avatar (with fur-match ring), name, last message snippet or system reminder text, and a 6px Berry unread dot if the parent owes a reply inside an active follow-up window.

Pets with no conversation history yet (e.g. Galaxy in the Fernandes demo) show with a "No conversations yet" subline. Deceased pets (Raffy) are removed from the active Inbox list once marked deceased; their past messages remain viewable on their memorial Pet Page.

### Thread detail

- **Composing:** when a follow-up window is open, the parent can message the vet with text, photo, or video bubbles. The vet's can similarly reply with text or file attachments. 
- **Expectation chip** above the message bubbles: "Dr Sagar typically replies within 24 hours." Sets expectations without depending on Sagar manually flipping any status.
- **System reminders** (e.g. "Angel's DHPPi+L4 booster due 12 May. Walk in 9am-9pm Mon-Sat.") render inline as centered system message cards with no reply UI. Acting on a reminder means a clinic walk-in.
- **Closed window:** composer is replaced by a quiet card — "AMS is walk-in only. Visit 9am to 9pm Mon-Sat. For urgent issues, call [clinic number]." Past messages remain readable but can't be added to.

## Broadcasts

The clinic-wide one-way feed from Dr Sagar, ranging from short clinic notices (monsoon ticks, holiday hours, vaccination drives) to longer educational pieces. Each card carries the vet's avatar, clinic name, body in the parent's selected language, a per-card EN/MR toggle, timestamp, and a 6px Berry unread dot when unread. Long Broadcasts show a body preview only and open the full reading view on tap; short Broadcasts show their full body inline.

Tapping a card opens the reading view. The vet byline and title are always present; cover image, key points, body, warning signs, and escalation each show only if the vet filled that section. A sticky Berry **Share** CTA sits at the bottom regardless, opening a sheet with WhatsApp / Social / Email options. Anyone can read a Broadcast on the public web at `pawkit.app/broadcasts/[slug]` without Pawkit installed.

Read-only — no reply path. The locked discipline: no incoming messages outside an open follow-up window, and broadcasts aren't follow-ups.

## Community (V3+ teaser)

Placeholder in v0. Teaser screen explaining Pawkit Plus's future social layer: pet-parent city circles, breed groups, monthly vet AMAs, geo-pinged lost-and-found, verified clinic reviews. Navigable but non-functional in v0 — exists so Sagar can see the V3+ vision in-product during the demo (Engine 2 of the three-engine ARR model).

## Shop (V4+ teaser)

Placeholder in v0. Teaser screen explaining the future clinically-curated marketplace: therapeutic diets, pharma refills tied to a vet's prescription, vet-approved hygiene products, supplements with clinical evidence, pet health insurance. Pawkit deliberately does not compete in generic pet retail (kibble, toys, fashion). Non-functional in v0; serves as the pitch surface for Engine 3.

## Settings

Master Settings opens when the parent taps the household-initial avatar pill in the top-right of the Pet Page cover (it no longer has a bottom-nav slot). The screen has:

- **Account** — phone number read-only (it's the auth identifier), household name editable inline, Language EN/MR segmented toggle that overrides the auto-detected device locale and governs every UI surface across the app.
- **Pets** — list of each living pet with fur-match ring avatar; tap a row to land on that pet's Per-pet Settings sub-screen. An **Add a pet** Berry row sits at the bottom of the card as the single entry point for adding subsequent pets.
- **Notifications** — single push toggle.
- **About** — version number plus clinic affiliation in faint type.
- **Sign-out** — full-width ghost button at the bottom; ceremonial in v0 (nothing to sign back into), but ships for parity with v1+.

### Per-pet Settings

Same sub-screen reachable from two entry points: the Pets row inside master Settings, or the gear pill on the right of the name row on any Pet Page. The screen lets the parent:

- Change the pet's photo (auto-re-runs fur-match on the new image)
- Re-run or override the fur match
- Edit the adoption year

A read-only **Identity** card at the bottom shows name, breed, sex, and birthday with an Ink-faint footnote: locked because Dr Sagar has clinical records on file.

Mark-deceased, delete-pet, and multi-user invites are all v1+ deferrals.
