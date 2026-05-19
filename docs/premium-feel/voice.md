# Voice and microcopy

Every screen has copy. Premium feel equals restraint plus warmth in every word.
Plain language at very specific reading levels is what makes the parent app
usable for low-literacy users.

## North star

> *"We see your pet as you do, a full character with a story. This app is a
> space to honour that, not optimise it."*

## Reading level targets

- **Parent app:** Flesch-Kincaid grade 5. The parent base includes low-literacy
  users (about 20% of AMS pet parents fit this profile, similar across most
  independent clinics in tier-2 cities). Most strings short enough that this
  isn't measurable per-string; applies to body paragraphs in broadcasts and
  onboarding.
- **Dashboard:** grade 8. Sagar plus desk-side assistant workflows; some
  clinical terminology necessary.

## Tone calibration

- **Warm and matter-of-fact** (not chirpy, not formal)
- **Models:** Things 3 (warmth via restraint), Linear (matter-of-fact
  precision), Pumpkin Pet Insurance (emotional honesty without cutesy puns),
  Smalls (humane warmth without baby talk)
- **Anti-models:** Mailchimp (too jokey), Slack (too casual), enterprise vet
  software (too clinical)

## Do / don't matrix

The full matrix (~30 rows) lives in `microcopy/` post-microcopy round. Anchor
examples:

| Do | Don't |
|---|---|
| Send to Dr Sagar | Submit |
| Gabby's window closes in 2 days | Follow-up window: 2 days remaining |
| Couldn't find your photo. Try again? | Error: file_upload_failed (500) |
| Your message is on its way. | Message sent successfully |
| Tap to add Gabby's photo. | Click here to upload an image |
| Your invoice is ready. | New invoice issued |
| Dr Sagar shared a broadcast with you. | Broadcast notification: 1 new |
| Gabby's vaccination is due next week. | Reminder: vaccination due 11 May |
| You're offline. Pawkit's still working. | Network unavailable. Please retry. |
| Pawkit took the time to see her. | AI fur-match complete. |
| Awaiting reply (5) | Active (5) |
| Nothing awaiting reply. | No open windows right now. Take a breath. |

## Hard rules

- **Address pets by name.** Never "your pet" when a name is available.
- **Present tense for active states.** "Dr Sagar is here for Gabby until 2 May"
  not "Follow-up window: open".
- **Avoid system jargon.** Submit / Confirm / Acknowledge / Process all banned.
- **Never use "Click".** Always "Tap" (parent app is touch-first; dashboard
  "Tap" reads consistent).
- **Verbs first on chips and pills.** "Send" / "Open" / "Save" not "Send
  message" / "Open thread" / "Save changes".
- **Icon plus 1-2 word labels** on chips and pills, never full sentences.
- **Vet name carries Dr title** everywhere. "Dr Sagar" not "Sagar".
- **No exclamation marks** except in onboarding celebration ("Galaxy is all set
  up.").
- **No emoji in copy.** Emoji only in the magic toast sparkle moment (and those
  are SVG, not Unicode).
- **No em dashes anywhere.** Use commas, periods, colons, parentheses, or
  sentence breaks. (Banned across all Pawkit docs and microcopy. See
  `~/.claude/projects/.../memory/feedback_no_em_dashes.md`.)

## Marathi voice rules

- **Non-literal translation.** Marathi mirrors English emotional register, not
  word-for-word.
- **Native-speaker review** of every string (Pune Marathi, not Mumbai/Nagpur
  dialect).
- **Western numerals** in both languages (per existing decisions-log).
- **Dr title in Marathi:** "डॉ. सागर" (uses Devanagari abbreviation for
  "डॉक्टर").
- **Honorifics calibrated to relationship.** Formal "तुमचा" for parent-to-vet
  ("Dr Sagar"); intimate "तुझा" for parent-to-pet copy ("तुझा गॅबी").

## System message templates

The microcopy round produces ~30 system templates against this spec.
Categories:

- Window-close in-thread message (parent + admin sides)
- Closed-thread redirect copy: "AMS is walk-in only. Visit 9am to 9pm Mon-Sat.
  For urgent issues, call [clinic number]." (parent side, when parent expects a
  message surface outside an open window)
- Send confirmation (text and photo variants)
- Draft saved
- Offline banner
- Retry prompt
- Empty inbox, empty invoices
- Permission request (camera, notifications)
- Onboarding step transitions
- Magic toast (the fur-match reveal, currently placeholder)
- Memorial card line (Raffy)
