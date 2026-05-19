# Parent microcopy — Phase 3a (EN draft)

Drafted 2026-05-16 evening against `docs/premium-feel/voice.md` and the
locked parent app hi-fi v3.1 mockup at `mockups/parent-app-hifi.html`.

## Voice rules (carried from `voice.md`)

- **Reading level:** Flesch-Kincaid grade 5. Parent base includes ~20% low-
  literacy users.
- **Tone:** warm and matter-of-fact. Models: Things 3, Linear, Pumpkin,
  Smalls. Anti-models: Mailchimp, Slack, enterprise vet.
- **Address pets by name.** Never "your pet" when a name is available.
- **Present tense for active states.** "Dr Sagar is here for Gabby until 28
  Mar" not "Follow-up window: 5 days remaining".
- **Verbs first on chips and pills.** "Send" / "Open" / "Save" not "Send
  message" / "Open thread" / "Save changes".
- **Banned words:** Submit, Confirm, Acknowledge, Process, Click (always
  "Tap"), em dashes (`—`), exclamation marks (allowed only in onboarding
  celebration), emoji in copy (the magic-toast sparkle is an SVG, not
  Unicode).
- **"Dr Sagar"** no period. Byline form: "Dr Sagar Bhongale · AMS Pune".
- **Pet pronouns are canonical anchor**, not inferred: Raffy and Gabby = male
  (he/his), Angel and Galaxy = female (she/her). Never get this wrong.

## Template var conventions

| Var | Example | Notes |
|---|---|---|
| `{pet}` | Gabby | Pet's first name. Rendered in Lora italic in hero contexts. |
| `{pet.poss}` | his / her | Possessive pronoun, follows pet's sex. |
| `{pet.subj}` | he / she | Subject pronoun. |
| `{pet.obj}` | him / her | Object pronoun. |
| `{breed}` | Golden Retriever | Full breed name. |
| `{breed.short}` | Golden | Short form for inbox row. |
| `{age.long}` | 4 years | Long form for Pet Page subtitle. |
| `{age.short}` | 4y | Short form for inbox row. |
| `{species}` | dog / cat | Used in magic toast. |
| `{vet}` | Dr Sagar | Always with title, no period. |
| `{vet.full}` | Dr Sagar Bhongale | For bylines. |
| `{clinic}` | AMS | Short. |
| `{clinic.full}` | Animal Medical Services | Long, for publish footer. |
| `{city}` | Pune | Clinic city. |
| `{phone}` | +91 98••• ••456 | Clinic hotline. Bullets in display, real digits in tel: link. |
| `{vaccine}` | DHPPi+L4 booster | Vaccine display name. |
| `{palette}` | Honey | Fur palette display name. |
| `{date}` | 14 Mar | Context-appropriate format. |
| `{date.short}` | 14 Mar | Day + month for timeline. |
| `{date.full}` | 14 Mar 2026 | Day + month + year for invoices. |
| `{time}` | 8:42 pm | Lowercase am/pm, no period. |
| `{stamp}` | Today · 8:12 am / Mon · 9:40 am / 12 Mar · 6:30 pm | Smart-relative timestamp. |
| `{amount}` | ₹2,400 | Indian comma grouping. |
| `{count}` | 3 | Numeric. |

**MR translations** pending Phase 3b (Sarvam Translate batch on locked EN;
Pune-native-speaker review after). MR rows ship in `parent-mr.md` once EN
here locks.

**~17 sections · ~225 strings.**

---

## 1. Chrome — bottom nav, top bar, status

The 5-tab bottom nav is icon-only per spec lock (`docs/flows/parent.md:13`).
No visible labels. ARIA labels carry the role for screen readers.

| Key | Context | EN |
|---|---|---|
| `nav.aria.broadcasts` | Bottom-nav tab 1 aria-label | Broadcasts |
| `nav.aria.community` | Bottom-nav tab 2 aria-label | Community |
| `nav.aria.pets` | Bottom-nav tab 3 aria-label (default landing) | Pets |
| `nav.aria.inbox` | Bottom-nav tab 4 aria-label | Inbox |
| `nav.aria.shop` | Bottom-nav tab 5 aria-label | Shop |
| `topbar.aria.back` | Top-bar back arrow aria-label | Back |
| `wordmark.full` | Pawkit logo wordmark, "P" in Lora italic + "awkit" in Inter | Pawkit |

**Notes.** Wordmark stays Latin in both languages (product identity, not
translated). Tab aria-labels need MR equivalents per voice.md.

---

## 2. Onboarding · Step 1 — Household name

| Key | Context | EN |
|---|---|---|
| `onb.step1.title` | h1 above the form | Welcome to Pawkit |
| `onb.step1.body` | One-paragraph intro under h1 | Let's set up your household. You can change any of this later in Settings. |
| `onb.step1.field.household.label` | Field label | Household name |
| `onb.step1.field.household.placeholder` | Field placeholder | e.g. The Fernandes family |
| `onb.step1.field.household.help` | Help text under field | Optional · defaults to "Your household" |
| `onb.step1.cta.skip` | Secondary outline button | Skip |
| `onb.step1.cta.continue` | Primary button (with trailing arrow) | Continue |

**Notes.** "Your household" inside the help text is a literal string the
user will see if they skip; quote-marked because it's a system-supplied
default name, not editable copy.

---

## 3. Onboarding · Step 2 — First pet (5 fields)

| Key | Context | EN |
|---|---|---|
| `onb.step2.title` | h1 above the form | Tell us about your pet |
| `onb.step2.body` | Body under h1 | All five are required. Add a photo later. |
| `onb.step2.field.name.label` | Field label | Name |
| `onb.step2.field.species.label` | Field label | Species |
| `onb.step2.field.species.opt.dog` | Segmented control option | Dog |
| `onb.step2.field.species.opt.cat` | Segmented control option | Cat |
| `onb.step2.field.breed.label` | Field label | Breed |
| `onb.step2.field.gender.label` | Field label | Gender |
| `onb.step2.field.gender.opt.female` | Segmented control option | Female |
| `onb.step2.field.gender.opt.male` | Segmented control option | Male |
| `onb.step2.field.birthday.label` | Field label | Birthday |
| `onb.step2.field.birthday.opt.date` | Segmented control option (entry mode) | Date |
| `onb.step2.field.birthday.opt.age` | Segmented control option (entry mode) | Age |
| `onb.step2.cta.back` | Secondary outline button | Back |
| `onb.step2.cta.create` | Primary button (with trailing arrow) | Create pet page |

**Notes.** "Gender" picked over "Sex" for the form label (Settings carries
"Gender" in the locked Identity row too — consistency). "Create pet page"
not "Create pet" or "Save"; the noun grounds the next surface the user
sees.

---

## 4. Onboarding · Step 3 — Land on empty Pet Page

After Step 2 submit, the parent lands on the new Pet Page with no photo
yet. The dashed photo prompt invites the cover photo upload.

| Key | Context | EN |
|---|---|---|
| `petpage.empty.photo-prompt.lead` | Bold lead inside dashed prompt card | Add a photo of {pet} |
| `petpage.empty.photo-prompt.sub` | Sub-line under lead | We'll find {pet.poss} fur palette from it. |
| `petpage.empty.timeline.empty` | Empty timeline when no records | No visits yet. |

**Notes.** "his" / "her" via `{pet.poss}`; never "their" (the pet has a
known sex by this point — collected in Step 2). FK grade check: "We'll
find his fur palette from it" is grade 4. Good.

---

## 5. Pet Page — chrome (steady state + tabs)

| Key | Context | EN |
|---|---|---|
| `petpage.hero.subtitle` | Eyebrow line under 48px name (hero variant) | {breed} · {age.long} |
| `petpage.subtitle` | Body-row sub under 26px name (non-hero contexts) | {breed} · {age.long} |
| `petpage.gear.aria` | Gear icon aria-label on the name row | Settings for {pet} |
| `petpage.tabs.timeline` | Tab label | Timeline |
| `petpage.tabs.vaccinations` | Tab label | Vaccinations |
| `petpage.tabs.invoices` | Tab label | Invoices |

**Notes.** The eyebrow subtitle is uppercase via CSS (`text-transform`),
not in the string itself. MR equivalents likely stay lowercase since
Devanagari has no case.

### 5a. Pet Page · Timeline tab (chrome only — card titles are seed data)

| Key | Context | EN |
|---|---|---|
| `petpage.timeline.end-of-records` | Italic footer below last card | End of records. |

### 5b. Pet Page · Vaccinations tab

| Key | Context | EN |
|---|---|---|
| `petpage.vaccs.section.upcoming` | Section label above due/upcoming rows | Upcoming |
| `petpage.vaccs.section.past` | Section label above past rows | Past |
| `petpage.vaccs.due.det.relative` | Row det · "Due {date} · in {time}" | Due {date} · in {relative-time} |
| `petpage.vaccs.due.det.fixed` | Row det · for far-future scheduled vaccines | Due {date.full} |
| `petpage.vaccs.past.det` | Row det for completed vaccinations | Given {date} · {vet} |
| `petpage.vaccs.past.det.year` | Row det for past vaccines from prior years | Given {date.full} |
| `petpage.vaccs.pill.due` | Pill on rows due within the reminder window | Due soon |
| `petpage.vaccs.pill.scheduled` | Pill on rows scheduled but not yet due | On schedule |
| `petpage.vaccs.pill.done` | Pill with check icon on past rows | Done |

**Notes.** "Due soon" picked over "Reminder" or "Coming up" — the urgency
signal is in the pill color, the words just confirm. FK grade check
clean.

### 5c. Pet Page · Invoices tab

| Key | Context | EN |
|---|---|---|
| `petpage.inv.row.when` | Date column | {date.full} |
| `petpage.inv.row.paid-pill` | Pill next to the date on paid rows | Paid |
| `petpage.inv.end-of-records` | Italic footer | End of records. |

---

## 6. Pet Page — fur-match ceremony

Empty → Sampling → Magic Moment → Transformed (beat) → Steady.

### 6a. Sampling state

| Key | Context | EN |
|---|---|---|
| `petpage.sampling.eyebrow` | Berry-deep eyebrow above the fur-dot reading | Reading fur palette… |

**Notes.** Ellipsis is Unicode U+2026, not three periods. Trails the eye
forward — present-progressive tense reinforces "this is happening now".

### 6b. Magic Moment (take-over panel)

| Key | Context | EN |
|---|---|---|
| `petpage.magic.copy` | Centered copy below pet's photo + palette swatch | Meet {pet}, a {palette} palette {species}. |

**Notes.** No "Dismissing in 4s…" debug copy — banned. Panel
self-dismisses after 2s with no visible countdown. "palette" twice is
intentional rhythm; FK grade 4. Magic toast = the demo's first emotional
hit — keep this string clean.

### 6c. Transformed beat / Steady

No additional copy — the moment lives entirely in typography (name lands
at 68px, reflows to 48px Steady) plus the cover photo's reveal. The
ceremony's voice is the visual itself.

---

## 7. Pet Page — banner variants

Three banner variants, mutually exclusive, sit above the tabstrip.

### 7a. Open follow-up window (Berry banner)

| Key | Context | EN |
|---|---|---|
| `petpage.banner.window.lead` | Berry banner lead, white text on Berry | Dr Sagar is here for {pet} until {date}. |
| `petpage.banner.window.cta` | CTA line with trailing arrow, underlined white | Open thread |

**Notes.** "{date}" is short-format ("28 Mar"). Present tense ("is here")
per active-state rule. "Open thread" verb-first (not "Open the thread").
Pet name rendered Lora italic via `<b>` wrapper in build.

### 7b. Warm reminder (vaccination due, scheduled visit, etc.)

| Key | Context | EN |
|---|---|---|
| `petpage.banner.reminder.head` | Bold head with leading clock icon | {vaccine} due {date} |
| `petpage.banner.reminder.det` | Body line under head | Walk-in 9am–9pm Mon–Sat at {clinic} {city}. |
| `petpage.banner.reminder.cta` | Berry-underlined link with trailing arrow | See schedule |

**Notes.** "Walk-in" hyphenated to match the spec voice (AMS is walk-in
only). En dash `–` in time ranges is OK (only em dashes `—` are banned).
"AMS Pune" form here, not "Animal Medical Services" — short form for
banner.

### 7c. Quiet state

No banner copy — the timeline shows directly under the tabstrip.

---

## 8. Pet Page — multi-pet switcher

Press-and-hold the Pets nav icon to surface the switcher row.

| Key | Context | EN |
|---|---|---|
| `switcher.label-tiny` | Eyebrow at the start of the row | Switch to |
| `switcher.coachmark` | First-time discovery toast, dark Ink pill | Press and hold to switch pets |
| `switcher.add.aria` | Dashed "+" tile aria-label | Add a pet |
| `switcher.memorial.aria` | Wings badge on memorial avatar aria-label | Memorial: {pet} |

**Notes.** "Add a pet" not "Add pet" — definite article makes it feel
intentional, less command-line. "Switch to" present-imperative — the
user is about to act, not being told what the row is.

---

## 9. Pet Page — memorial

Memorial pets stay reachable. Page renders with sable cover wash, italic
sub-line, no gear pill, reduced opacity on timeline.

| Key | Context | EN |
|---|---|---|
| `petpage.memorial.subtitle.head` | Italic sub-line line 1 | {breed} · {birth-year} to {death-year}. |
| `petpage.memorial.subtitle.tail` | Italic sub-line line 2 | A very good {species}. |
| `petpage.memorial.records-count` | Italic footer below last card | {n} years of records. |

**Notes.** "A very good dog/cat" is the only place "very" survives the
voice-discipline cull — it's deliberate sentiment for memorials.
"records" not "memories" — the pet's medical record is what's kept; the
memories live in the parent. FK grade check: 2 (intentionally simple).

---

## 10. Inbox — list + thread states

### 10a. Inbox list

| Key | Context | EN |
|---|---|---|
| `inbox.pagehead.title` | h1 page header | Inbox |
| `inbox.pagehead.sub` | Sub line under h1 | Threads with Dr Sagar · per pet |
| `inbox.row.breed-age` | Inline breed + age in the row name | · {breed.short}, {age.short} |
| `inbox.row.empty-snip` | Italic snip on rows with zero conversations | No conversations yet. |
| `inbox.row.when.yesterday` | Relative timestamp | Yest. |
| `inbox.empty.page` | Centered italic line for fully empty inbox | No messages from Dr Sagar yet. |

**Notes.** "Yest." short for Yesterday (~5 chars) — fits in the 44px
right-aligned timestamp column without truncation. Day-of-week ("Mon",
"Fri") used for same-week, date format ("8 Apr") for older, year suffix
("Aug '24") for >1y old. Memorial rows use the year suffix.

### 10b. Thread — open follow-up window

| Key | Context | EN |
|---|---|---|
| `thread.topbar.title` | Pet name | {pet} |
| `thread.topbar.subtitle.open` | Subtitle under title | with {vet} · until {date} |
| `thread.topbar.subtitle.closed` | Subtitle when window is closed | with {vet} · window closed |
| `thread.topbar.pill.open` | Berry pill in topbar right slot | Open |
| `thread.topbar.pill.closed` | Dim pill in topbar right slot | Closed |
| `thread.expect-chip` | Centered chip at top of thread | {vet} typically replies within 24 hours. |
| `thread.bubble.time.you-prefix` | "from you · " prefix on parent's first bubble of a session | from you · {stamp} |

**Notes.** "Open" / "Closed" as pill labels are noun-states, not actions —
pill chips can break the verbs-first rule when they label a state, not a
command. "typically replies" softens the SLA claim — not a contract,
just a reasonable expectation.

### 10c. System bubble templates (sys bubbles inside threads)

| Key | Context | EN |
|---|---|---|
| `thread.sys.vaccination-reminder` | Vaccination reminder, dashed-border centered sys bubble | {pet}'s {vaccine} due {date}. Walk in 9am–9pm Mon–Sat. |

**Notes.** Only one sys-bubble template is exercised in the v3.1 mockup
(vaccination reminder). Build may need others (window-opening,
window-closing, invoice-ready) — those copy templates should be added in
Phase 3a refinement.

### 10d. Composer + closed-window card

| Key | Context | EN |
|---|---|---|
| `composer.placeholder` | Italic placeholder inside the rounded input | Reply to {vet}… |
| `closed-card.lead` | Bold lead inside the closed-window card | {clinic} is walk-in only. |
| `closed-card.body` | Body line after the lead | Visit 9am to 9pm Mon to Sat. |
| `closed-card.tail` | Tail line with bold phone number | For urgent issues, call {phone}. |

**Notes.** Closed-card copy matches the locked redirect from `CLAUDE.md`:
"AMS is walk-in only. Visit 9am to 9pm Mon-Sat. For urgent issues, call
[clinic number]." Replaced the inline "Mon-Sat" hyphen with "Mon to Sat"
for clearer voice + cleaner Marathi translation. Phone number bullets
preserved in display; real digits go in the `tel:` href.

---

## 11. Broadcasts — list + reader + share + public web view

### 11a. Broadcasts list

| Key | Context | EN |
|---|---|---|
| `broadcasts.pagehead.title` | h1 page header | Broadcasts |
| `broadcasts.pagehead.sub` | Sub line under h1 | From {vet} · {clinic} {city} |
| `broadcasts.card.who` | Who-line in card header | {vet} · {clinic} |
| `broadcasts.card.stamp` | Timestamp under who-line | {stamp} |
| `broadcasts.card.read-more` | Inline link below preview body | Read full → |
| `broadcasts.card.read-more.mr` | Marathi card read-more | पूर्ण वाचा → |
| `broadcasts.empty.page` | Centered italic line on empty list | No broadcasts from {vet} yet. |

**Notes.** Per-card EN/MR toggle is a `pk-seg` segmented control: opt
labels are literal "EN" / "MR" (Latin script in both language modes —
it's an interface affordance, not localized content). The "Read full →"
link gets translated; the toggle does not.

### 11b. Broadcast reader (long + short variants)

| Key | Context | EN |
|---|---|---|
| `broadcasts.reader.topbar.title` | Reader top bar title | From your vet |
| `broadcasts.reader.byline` | Eyebrow byline above h1 | {vet.full} · {clinic} {city} · {date}, {time} |
| `broadcasts.reader.summary.label` | Summary section eyebrow inside the warm box | Summary |
| `broadcasts.reader.warning.head` | Warning box head with leading triangle icon | Warning signs |
| `broadcasts.reader.escal.head` | Escalation box head, uppercase eyebrow | If it's already serious |
| `broadcasts.reader.escal.cta.call` | Outline button with phone icon | Call clinic |
| `broadcasts.reader.escal.cta.dir` | Outline button with pin icon | Directions |

**Notes.** "From your vet" titles the reader so the parent knows
provenance without re-reading the byline. "If it's already serious"
softer than "Emergency"; matches the spec's calm-not-alarmed tone for
escalation boxes.

### 11c. Share footer (sticky on reader) + Share sheet

| Key | Context | EN |
|---|---|---|
| `broadcasts.share.footer.lead` | Berry sticky footer with share icon | Share with someone |
| `broadcasts.share.tile.whatsapp` | Share tile label | WhatsApp |
| `broadcasts.share.tile.more` | Share tile label (more apps) | More apps |
| `broadcasts.share.tile.email` | Share tile label | Email |
| `broadcasts.share.tile.copy-link` | Share tile label | Copy link |
| `broadcasts.share.sheet.title` | h2 in the share sheet header | Share this broadcast |
| `broadcasts.share.sheet.sub` | Sub-line in header (with broadcast slug) | Opens at pawkit.app/broadcasts/{slug} |
| `broadcasts.share.sheet.copy` | Right-side action in the link row | Copy |
| `broadcasts.share.sheet.cancel` | Centered cancel button | Cancel |

### 11d. Public web view (the only surface non-Pawkit users see)

| Key | Context | EN |
|---|---|---|
| `public.open-in-app.title` | Wordmark next to the P square in the banner | Pawkit |
| `public.open-in-app.sub` | Sub-line under wordmark | From {clinic} {city} · for pet parents |
| `public.open-in-app.cta` | Right-side Berry-underlined link | Open in app |
| `public.eyebrow` | Eyebrow above h1 in the article | {vet.full} · {clinic} {city} |
| `public.footer.published` | Italic footer line above acquisition CTA | Published by {clinic.full} on {date.full}. |
| `public.footer.acquire` | Acquisition CTA below the published line | Want this for your clinic? pawkit.app |

**Notes.** Public view byline omits the timestamp (the article is timeless
in feel; the published date below is the canonical reference). "for pet
parents" lowercased — gentle, not titled. Acquisition CTA is the only
sell on this surface; restraint everywhere else.

---

## 12. Settings — Master, Per-pet, Override

### 12a. Master Settings

| Key | Context | EN |
|---|---|---|
| `settings.topbar.title` | Top-bar title | Settings |
| `settings.section.account` | Section eyebrow | Account |
| `settings.account.household.k` | Row label | Household name |
| `settings.account.phone.k` | Row label | Phone number |
| `settings.account.language.k` | Row label | Language |
| `settings.account.language.sub` | Sub-line under label | Overrides device locale. |
| `settings.account.language.opt.en` | Segmented control option (Latin both sides) | EN |
| `settings.account.language.opt.mr` | Segmented control option (Latin both sides) | MR |
| `settings.section.pets` | Section eyebrow | Pets |
| `settings.pets.add-row.label` | Berry CTA row label | Add a pet |
| `settings.section.notifications` | Section eyebrow | Notifications |
| `settings.notifs.push.k` | Row label | Push notifications |
| `settings.notifs.push.sub` | Sub-line under label | Vaccinations, broadcasts, vet replies. |
| `settings.sign-out` | Ink-underlined link in the footer | Sign out |
| `settings.version` | Version line under sign-out | {wordmark} v0.1 · {clinic} {city} |

**Notes.** "Push notifications" not "Notifications" — disambiguates from
in-app notifications. Sub-line lists the 3 sources the parent will see
pushed. "Sign out" not "Log out" — softer, matches Pawkit's editorial
register.

### 12b. Per-pet Settings (reached via the gear on the Pet Page name row)

| Key | Context | EN |
|---|---|---|
| `per-pet.topbar.title` | Top-bar title | {pet} |
| `per-pet.section.photo` | Section eyebrow | Photo |
| `per-pet.photo.change.k` | Row label | Change cover photo |
| `per-pet.photo.change.sub` | Sub-line under label | Re-runs fur match. |
| `per-pet.section.fur-match` | Section eyebrow | Fur match |
| `per-pet.fur.current.sub` | Sub-line under current palette name | Matched from photo · {date} |
| `per-pet.fur.override` | Berry-underlined link on the fur-match row | Override |
| `per-pet.fur.rerun.k` | Row label | Re-run from current photo |
| `per-pet.section.locked` | Section eyebrow with leading lock icon | From {vet} |
| `per-pet.locked.name.k` | Locked row label | Name |
| `per-pet.locked.breed.k` | Locked row label | Breed |
| `per-pet.locked.gender.k` | Locked row label | Gender |
| `per-pet.locked.birthday.k` | Locked row label | Birthday |
| `per-pet.locked.explanation` | Italic note under the locked rows | These fields are locked because {vet} has clinical records on file for {pet}. |
| `per-pet.section.household` | Section eyebrow at the bottom | Household & app |
| `per-pet.household.k` | Row label | Household, language, notifications |
| `per-pet.household.sub` | Sub-line under label | Settings that apply to every pet. |

**Notes.** Locked-section heading is "From {vet}" not "Clinical lock" or
"Read-only" — names the source instead of the state. The italic
explanation tells the parent why without lecturing. "Gender" not "Sex"
(consistency with Onboarding Step 2).

### 12c. Fur-match override sheet

| Key | Context | EN |
|---|---|---|
| `override.sheet.title` | h2 in sheet header | Pick {pet}'s fur palette |
| `override.sheet.sub` | Sub-line under h2 | Live preview at the top. Saves separately from the algorithm match. |
| `override.preview.more-options` | Ink-underlined link in preview row right | More options |
| `override.cancel` | Footer left-side cancel | Cancel |
| `override.save` | Footer primary button | Save {palette} |

**Notes.** "Pick {pet}'s fur palette" not "Choose…" — pick is friendlier
+ one syllable shorter. "Saves separately from the algorithm match" tells
the parent the override is durable + co-existing with the auto-match.

### 12d. Fur palette display names (used across override sheet + Pet Page)

| Key | Context | EN |
|---|---|---|
| `palette.milk` | Fur token display name | Milk |
| `palette.vanilla` | Fur token display name | Vanilla |
| `palette.honey` | Fur token display name | Honey |
| `palette.peach` | Fur token display name | Peach |
| `palette.rust` | Fur token display name | Rust |
| `palette.mushroom` | Fur token display name | Mushroom |
| `palette.smoke` | Fur token display name | Smoke |
| `palette.steel` | Fur token display name | Steel |
| `palette.bark` | Fur token display name | Bark |
| `palette.sable` | Fur token display name | Sable |
| `palette.honey.desc` | Sub in override preview row when selected | Single tone · most Goldens |
| `palette.peach.desc` | Sub in override preview row when selected | Warm orange-cream |
| `palette.smoke.desc` | Sub in override preview row when selected | Cool grey-blue |
| `palette.vanilla.desc` | Sub in override preview row when selected | Pale cream |
| `palette.milk.desc` | Sub in override preview row when selected | Off-white |
| `palette.rust.desc` | Sub in override preview row when selected | Deep amber |
| `palette.mushroom.desc` | Sub in override preview row when selected | Warm taupe |
| `palette.steel.desc` | Sub in override preview row when selected | Cool charcoal |
| `palette.bark.desc` | Sub in override preview row when selected | Rich dark brown |
| `palette.sable.desc` | Sub in override preview row when selected | Near-black |

**Notes.** Palette names stay Latin in both languages (they're brand
tokens, like Pantone). Descriptions translate. "Single tone · most
Goldens" is the only breed-anchored description; others are pure visual.

---

## 13. Community + Shop — v3+ / v4+ teasers (non-functional in v0)

### 13a. Community teaser

| Key | Context | EN |
|---|---|---|
| `teaser.community.pagehead.title` | h1 page header | Community |
| `teaser.community.pagehead.sub` | Sub-line | Coming with Pawkit Plus |
| `teaser.community.hero.lead` | Bold h2-sized lead on Berry card | A social layer for pet parents. |
| `teaser.community.hero.sub` | Sub-line under lead, white-soft | City circles, breed groups, monthly vet AMAs, lost-and-found, verified clinic reviews. |
| `teaser.community.section` | Eyebrow above items list | What's coming |
| `teaser.community.item.circles.t` | List item title | Pune pet-parent circles |
| `teaser.community.item.circles.d` | List item description | Trade walk routes, recommend groomers, swap monsoon advice. |
| `teaser.community.item.breed.t` | List item title | Breed groups · Golden Retrievers |
| `teaser.community.item.breed.d` | List item description | Indian-climate-aware threads on diet, summer care, hip dysplasia. |
| `teaser.community.item.ama.t` | List item title | Monthly vet AMAs |
| `teaser.community.item.ama.d` | List item description | Live Q&A with rotating Pawkit clinics. |
| `teaser.community.item.lost.t` | List item title | Lost & found · geo-pinged |
| `teaser.community.item.lost.d` | List item description | Alerts within 3 km when a Pawkit pet goes missing nearby. |
| `teaser.community.notify` | Italic footer | Notify me when Community opens. |

### 13b. Shop teaser

| Key | Context | EN |
|---|---|---|
| `teaser.shop.pagehead.title` | h1 page header | Shop |
| `teaser.shop.pagehead.sub` | Sub-line | Clinically-curated. Vet-approved. |
| `teaser.shop.hero.lead` | Bold lead in Ink-bordered card | Only what your vet would prescribe. |
| `teaser.shop.hero.sub` | Sub-line under lead | Therapeutic diets, prescription refills, supplements with clinical evidence, pet insurance. |
| `teaser.shop.section` | Eyebrow above tile grid | Coming categories |
| `teaser.shop.tile.diets.t` | Tile title | Therapeutic diets |
| `teaser.shop.tile.diets.d` | Tile description | Renal, hepatic, weight. |
| `teaser.shop.tile.refills.t` | Tile title | Prescription refills |
| `teaser.shop.tile.refills.d` | Tile description | Tied to your vet's script. |
| `teaser.shop.tile.hygiene.t` | Tile title | Vet-approved hygiene |
| `teaser.shop.tile.hygiene.d` | Tile description | Shampoos, ear cleaners. |
| `teaser.shop.tile.supplements.t` | Tile title | Supplements |
| `teaser.shop.tile.supplements.d` | Tile description | Clinical evidence only. |
| `teaser.shop.tile.insurance.t` | Tile title (wide tile) | Pet health insurance |
| `teaser.shop.tile.insurance.d` | Tile description | Underwritten with partner insurers; vet-validated claims. |
| `teaser.shop.callout.head` | Bold label inside Ink-bordered callout | Not what we sell: |
| `teaser.shop.callout.body` | Callout body | kibble, toys, fashion, generic accessories. There's a hundred apps for that already. |

**Notes.** "There's a hundred apps for that already" keeps the slight
editorial cheek — calibrates positioning without going jokey. "Pawkit
Plus" is the social subscription brand (Engine 2 in the three-engine
ARR model); locked in `CLAUDE.md`.

---

## 14. Invoice detail

| Key | Context | EN |
|---|---|---|
| `inv.topbar.title` | Top-bar title | Invoice · {date} |
| `inv.topbar.pill` | Right-slot pill | Paid |
| `inv.for.eyebrow` | Eyebrow above pet pill | For |
| `inv.row.visit` | Label column | Visit |
| `inv.row.visit.v` | Value column | {date.full}, {time} |
| `inv.row.attended` | Label column | Attended by |
| `inv.row.attended.v` | Value column | {vet.full} |
| `inv.row.reason` | Label column | Reason |
| `inv.row.reason.v` | Value column (seed data, e.g. "Annual check-up") | {reason} |
| `inv.section.line-items` | Section eyebrow | Line items |
| `inv.totals.subtotal` | Subtotal row left | Subtotal |
| `inv.totals.total` | Total row left | Total |
| `inv.paid.head` | Bold "Paid" in the paid card | Paid |
| `inv.paid.tail` | Sub line in the paid card | {date} · cash at clinic |
| `inv.cta.download` | Outline button with download icon | Download PDF |
| `inv.cta.email` | Outline button with envelope icon | Email me a copy |

**Notes.** "cash at clinic" is the canonical payment language — AMS is
desk-payment only per `CLAUDE.md`. "Email me a copy" first-person — the
parent is the subject of the action. "Download PDF" not "Download" (the
format affords expectation about what they're getting).

---

## 15. Empty states

| Key | Context | EN |
|---|---|---|
| `empty.timeline` | Pet Page Timeline tab, zero records | No visits yet. |
| `empty.vaccinations` | Pet Page Vaccinations tab, zero records | No vaccinations on file yet. |
| `empty.invoices` | Pet Page Invoices tab, zero records | No invoices yet. |
| `empty.inbox.thread-row` | Inbox row where this pet has no conversations | No conversations yet. |
| `empty.inbox.page` | Inbox page with zero rows (rare) | No messages from {vet} yet. |
| `empty.broadcasts.page` | Broadcasts page with zero cards (rare) | No broadcasts from {vet} yet. |

**Notes.** Single italic sentence per spec — "calm absence" voice.
"on file" picked over "recorded" for vaccinations (gentler, less
clinical). FK grade 2 across all six.

---

## 16. Offline + errors

### 16a. Offline state

| Key | Context | EN |
|---|---|---|
| `offline.banner` | Top banner with wifi-slash icon | You're offline. Messages will send when you're back. |
| `offline.bubble.pending` | Timestamp on a bubble that hasn't sent yet | Will send when online · just now |

**Notes.** "You're back" not "you're online" — softer, locates the user
not the connection. "Will send" not "We'll send" — system as honest
attendant, not protagonist.

### 16b. Error anatomies

| Key | Context | EN |
|---|---|---|
| `error.inline.example.label` | Field-level error example: field label | Phone number |
| `error.inline.example.body` | Field-level error example: italic message under field | Looks short. Indian numbers are 10 digits. |
| `error.banner.example.ttl` | Page-level error example: bold title | Couldn't load {pet}'s records |
| `error.banner.example.det` | Page-level error example: body | The clinic's records server isn't responding. Cached records below may be stale. |
| `error.banner.example.retry` | Page-level error example: retry link | Try again |
| `error.toast.example` | Transient error example: ink toast | Couldn't send. Will retry in a moment. |

**Notes.** All three patterns: lead with "Couldn't…" / "Looks short…"
not "Error:" / "Invalid:". System is friendly attendant, never
gatekeeper. Inline errors don't block the page; banner errors title +
body + retry; toasts auto-dismiss. Patterns + voice locked here;
specific instances added during build.

---

## 17. Onboarding celebration (post-Step 2 reveal, the only allowed `!`)

Reserved for the moment a household finishes setting up their first pet.
Not yet drawn in the v3.1 mockup, but locked in `voice.md`:

| Key | Context | EN |
|---|---|---|
| `celebration.first-pet` | Toast or sub-line after first Pet Page created | {pet} is all set up. |
| `celebration.first-pet.alt` | Alternate copy if "all set up" reads dry | Welcome, {pet}. |

**Notes.** Exclamation marks are not in v3.1 — `voice.md` says they're
permitted only here. Either string fits the brief. Pick during the audit
or push the moment off until v1+.

---

## Audit checklist (what to look for in the EN review)

1. **Sex-pronoun pass.** Every `{pet.poss}` / `{pet.subj}` / `{pet.obj}` resolves
   correctly for Gabby (he/his/him), Angel/Galaxy (she/her/her), Raffy
   (he/his/him). Run substitutions for each anchor pet and read aloud.
2. **FK grade per surface.** Parent app target is grade 5. Auto-check
   the long-form strings (banner det, broadcast preview, error banners,
   teaser sub-lines).
3. **Banned word sweep.** Submit / Confirm / Acknowledge / Process /
   Click / em dashes / exclamation marks (outside celebration) / emoji.
4. **Length pass at small sizes.** Verify chrome strings (~11-14px)
   don't wrap awkwardly. Inbox `{breed.short}, {age.short}` at
   `var(--text-sm)` = 12px sample with longest expected breeds
   ("Doberman Pinscher", "German Shepherd").
5. **Translatability flags.** Mark strings that won't translate cleanly
   to Marathi — e.g. "All set up", "On schedule", "Walk in" verb +
   "Walk-in" hyphenated noun. The native-speaker pass catches metaphors;
   we flag candidates here.
6. **System-message templates to add.** Phase 3a should also capture
   templates the build needs but the mockup didn't exercise:
   window-opening, window-closing, invoice-ready, broadcast-published,
   appointment-booked (if booking comes back).

---

## What goes to Sarvam next (Phase 3b)

Per `docs/decisions-log.md` "Microcopy workflow lock" and the
`feedback_batched_api` memory, the Sarvam Translate pass is **batched
per surface area**, not per string. Suggested batch shape (~8 calls):

1. Onboarding (sections 2 + 3 + 4) — ~25 strings
2. Pet Page chrome + ceremony (sections 5 + 6 + 7 + 8 + 9) — ~40 strings
3. Inbox + threads (section 10) — ~15 strings
4. Broadcasts (section 11) — ~25 strings
5. Settings (section 12) — ~40 strings
6. Teasers (section 13) — ~25 strings
7. Invoice + Empty states + Offline + Errors (sections 14 + 15 + 16) — ~25 strings
8. Chrome + ARIA + Celebration (sections 1 + 17) — ~10 strings

Total ~205 strings across 8 batches. Comfortably under any per-request
limit if Sarvam Translate accepts arrays.

After Sarvam: `parent-mr.md` gets the MR rows; Pune-native-speaker
review fills in the dialect calibration; locks for build.
