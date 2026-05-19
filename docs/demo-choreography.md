# Demo Shape and Choreography

The pitch at AMS. **~15 min app demo on a phone plus ~10-15 min growth-of-app
presentation. Total ~25-30 min, can't bore Sagar.** This is the choreographic
source of truth. When in doubt during the build, optimise for the moments below.

## Frame

- **Venue:** AMS clinic, Sagar's consultation desk, dedicated session inside his
  mid-May availability window.
- **Audience:** Dr Sagar. Jolene presents.
- **Physical setup:** Sit at his desk, laptop open on the desk surface running
  the clinic dashboard at the Vercel URL, the demo phone flat on the desk
  with Pawkit installed as a release APK and visible on the home screen.
  Charger nearby for laptop and phone.
- **Choreography:** Jolene drives the laptop dashboard for scenes 1-5 while
  narrating; Sagar watches and asks questions (he's evaluating, not learning
  the dashboard UI). The phone comes out at scene 6 for the parent app:
  Jolene runs the scripted parent-app demo while Sagar watches and reacts.

## Narrative arc

Tight version. Drop into any beat if Sagar pulls a phone toward a question; pick
back up where you left off.

### App demo (~15 min)

1. **Opening (~30s).** Laptop already open to the dashboard. *"Sagar, this is
   the clinic inbox today."* Then silence. Action-first, no preamble.
2. **Inbox cold open (~3 min).** The laptop dashboard sits on the inbox: one
   queue of open-follow-up-window threads, each showing pet name, parent's
   last message, time remaining on the window ("2 days left"), unreplied
   state. The system bounds Sagar's work. The independent-clinic comms-chaos
   pain, solved before any branding or intro. The pitch lands: Pawkit isn't
   24/7 chat that destroys you, it's bounded post-visit windows that survive
   you. Earns both audiences immediately.
3. **Per-pet medical profile + open follow-up window banner (~3 min).** Open
   Gabby's inbox thread. The 4px Berry banner with "2 days left, 1 unreplied"
   tells Sagar the system bounds his work. Tap "Open full clinical history" on
   the pet panel: Screen 05 full screen shows Gabby's history as SOAP notes
   (Subjective / Objective / Assessment / Plan per visit), a preview of the
   production data-entry path that replaces VetBuddy.
4. **Itemised invoice with info-icons (~2 min).** Gabby's invoice. Tap a couple
   of line items, conversational tooltip in plain English. Addresses
   billing-transparency pain.
5. **Broadcast composer + audience count toggle (~2 min).** Compose the monsoon
   broadcast. Toggle "Exclude deceased", count ticks "143 to 142." Raffy
   honoured by data discipline. (This is a quiet moment; let it land without
   narrating it.)
6. **Pet Page on parent app (~3 min).** Pivot. *"Now the parent side."* The
   phone comes off the desk. Tap Angel's profile. The page opens to her
   steady-state Pet Page: real photo cover, Lora italic name, vet
   byline, editorial timeline. **This is the parent app's brand hero, the
   demo's emotional center.** Sit with it. Then: tap Gabby. Live photo
   upload triggers the three-state fur-match flow (Empty, Sampling with
   Berry scan-line, Transformed gradient cover + magic toast). Secondary
   delight, not the centerpiece.
7. **Broadcast reading view + bilingual toggle (~1.5 min).** Open the
   "Vaccination schedule for your puppy" broadcast (or whichever fits the moment).
   Toggle EN to MR. Bilingual accessibility lands without you having to sell it.

### Growth pitch (~10-15 min)

8. **Wrap demo, pivot to growth.** *"That's the product. Now the business."*
   This is the flip moment. Phones go down on the desk, you face Sagar fully.
9. **Three-engine revenue model.** Walk Engine 1 (clinic SaaS, flat monthly fee
   tiered by `active_patient_count`, AMS as anchor expanding into Pune /
   Maharashtra / India), Engine 2 (parent subscription ₹199/mo with social
   layer + lifetime cross-clinic history portability + partner discounts as
   the three pillars), Engine 3 (clinically-curated marketplace where brands
   pay for catalogue inclusion in therapeutic diets, pharma, supplements,
   insurance only). 20cr ARR forecast in 3 years equals the sum of three
   engines. Each engine can stand alone if one underperforms.
10. **Closing line (~30s).** *"I'm sending you the deck. I'd like to come back
    next Tuesday with the role + comp plan. Same time?"* Trigger PDF email
    send from your phone in the same breath. (Backup if he says "let me
    think": *"Understood. Same time next Tuesday gives both of us a week.
    Deal?"*)

## Interactivity

Mostly monologue, with 2 explicit pause points: after the invoice info-icons
on the laptop (let him lean in, point at a line item, ask a question), after
the Pet Page on the phone (let the moment land). Drive uninterrupted between
pauses; pauses invite reaction.

## The low-literacy proof

The parent app must serve low-literacy users (about 20% of AMS pet parents
fit this profile, and the same proportion holds across most independent
clinics in tier-2 cities). The proof during the demo is structural: the
bilingual toggle, icon-led design, large tap targets, and tap-and-see
flows are specifically built so the app works without reading. Validation
happens during Day 8 rehearsal with an unbriefed low-literacy stand-in
(see `docs/build-order.md`). Demo-day audience is Sagar + Jolene only; no
live usability test during the demo itself.

This is the spine of the founding philosophy made visible. Tools for
independent clinics include serving the staff and patients the chains
write off, not as an accessibility footnote but as the structural reason
independent clinics keep their relationships intact.

## What Sagar takes home

- **PDF deck (8-12 slides)** emailed during the closing line. Branded (Inter
  body + display, Lora italic for pet names, canvas + rail-tint + Ink +
  Berry per the mauve-only v1.4 lock). Forwardable. Deck content co-written
  AFTER microcopy AFTER build.
- **Live Vercel URL.** He can revisit the demo solo any time.

## Follow-up rhythm

- **Same evening:** brief WhatsApp thanking him + reconfirming next Tuesday's
  slot. No closing attempts via WhatsApp.
- **Next Tuesday:** return with full growth + ops + tech plan + comp ask.
  Today's pitch earned the right; next week is where it closes.

## The single biggest risk

**Sagar nods through the demo but doesn't actually commit.** Mitigation: the
closing line is specifically designed to extract a verbal commitment. The
two-step ask (today = vision, next-week = role/comp) means today's demo only
needs to earn the right to come back, not close.

## Failure-mode handles (rehearsed verbal recovery)

- **Vercel/Wi-Fi down:** the laptop is already the dashboard surface, so
  switch the URL from Vercel to local dev (`pnpm dev` already running on
  the laptop in a second tab). The demo phone's APK doesn't need local
  network for code (the bundle is installed), only for Supabase data
  fetches; Jolene's second phone hotspots the laptop and the demo phone
  if clinic Wi-Fi fails. Verbal frame: *"Let me show you how it works
  offline first, same experience."*
- **Live fur-match returns 'wrong' colour for Gabby:** acknowledge and laugh.
  *"Algorithm's having a moment. Here's the override."* Open the bottom
  sheet, tap to override, save "Honey + Peach." Turns the failure into an
  override-as-feature demo.
- **Parent app on demo phone doesn't launch:** the installed APK has no
  Expo Go dependency, so this is almost always a Supabase / network issue,
  not an SDK / Expo Go upgrade. Force-close the app, switch the phone to
  the hotspot from Jolene's second phone, re-launch. If the app icon
  itself isn't there, the APK was uninstalled — the screen-recording
  backup carries the demo through.

## Pre-demo rehearsal

Day 8: full rehearsal with two friends and the laptop+phone setup. One
playing Sagar (watches the laptop scenes 1-5, watches the phone at scene 6
for the parent-app demo). One unbriefed parent-app stand-in (low-literacy
user surrogate) tests the parent app on a separate phone for the usability
check (NOT briefed; their genuine confusion is the test, NOT part of the
actual demo flow). Time the session. Get unscripted reactions. Practice
the opening line silence ("Sagar, this is the clinic inbox today.") and
the closing line ask.

## AMS rebrand for the demo

- **Wordmark only**, no logomark. "Animal Medical Services" set in Inter
  Bold + "Pune" in Inter small caps (was Satoshi Bold under v1.3; locked
  2026-05-16 against the Satoshi-removed reality on the dashboard topbar).
  Real AMS address + license. Frame in pitch: *"I treated AMS the way I'd
  treat any premium clinic in our system, type, structure, restraint."*
- **Brand patterns / textures** (Berry + Ink geometric/abstract) for marketing
  surfaces only. PDF deck slide backgrounds, leave-behind, future website.
  NOT for in-app surfaces.

## VetBuddy framing (if he asks)

Don't position Pawkit as a VetBuddy replacement (defensive). Position as the
parent-facing plus staff-friendly layer that finally gets adopted. *"You
already pay for VetBuddy. Pawkit is what your staff actually uses."* The
moment in scene 6 (Pet Page lands, low-literacy navigation works) IS the
proof.

## Three-engine revenue model (ARR pitch spine)

- **Engine 1 (Clinic SaaS):** flat monthly fee tiered by `active_patient_count`.
  AMS as anchor; expansion to other Pune clinics, Maharashtra, India.
- **Engine 2 (Parent subscription, Pawkit Plus):** ₹199/mo. Three things only:
  social layer (city circles, breed groups, AMA, lost-and-found, verified
  reviews), lifetime cross-clinic history portability (records survive when
  families move clinics or cities; deceased pets preserved permanently),
  partner discounts (insurance, therapeutic diets, supplements).
- **Engine 3 (Clinically-curated marketplace):** brands and partners pay
  Pawkit for access to the engaged pet-parent base, but only across
  vet-approved categories: therapeutic diets, pharma, hygiene, supplements
  with clinical evidence, insurance, narrowly-defined enrichment items.
  Pawkit does not compete in generic pet retail.
- **20cr ARR in 3 years** equals the sum of three engines. Each engine can
  stand alone if one underperforms.
