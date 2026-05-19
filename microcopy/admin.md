# Admin microcopy — Phase 3a (EN draft)

Drafted 2026-05-12 against `docs/premium-feel/voice.md`:

- Reading level grade 8 (dashboard)
- Warm and matter-of-fact tone (Things 3 / Linear / Pumpkin / Smalls; not Mailchimp / Slack / enterprise vet)
- **Address pets by name** when name available
- **Present tense** for active states ("Dr Sagar is here for Gabby until May 16", not "Follow-up window: open")
- **Banned words:** Submit, Confirm, Acknowledge, Process (system jargon), Click (always "Tap" or omit for dashboard), em dashes, exclamation marks (no onboarding celebration on admin), emoji in copy
- **Verbs first** on chips and pills (Send / Edit / Save / Open, not Send message / Save changes)
- **"Dr Sagar"** no period everywhere; clinic byline "Dr Sagar Bhongale · Animal Medical Services"
- **Template vars** in `{braces}`; build phase substitutes at render

**MR translations** pending Phase 3b (Sarvam Translate batch on locked EN; Pune-native-speaker review after). All MR rows currently marked `(pending Phase 3b)`.

**~33 templates · ~140 strings.**

---

## 1. Chrome (cross-screen header + rail)

| Key | Context | EN |
|---|---|---|
| `chrome.wordmark.line1` | Header wordmark line 1 | Animal Medical Services |
| `chrome.wordmark.line2` | Header wordmark line 2 | Pune |
| `chrome.rail-section-label` | Left rail section header | Workspace |
| `chrome.rail.inbox` | Rail item | Inbox |
| `chrome.rail.broadcasts` | Rail item | Broadcasts |
| `chrome.rail.settings` | Rail item | Settings |
| `chrome.search.inbox-route` | Search placeholder, Inbox-route screens (01, 02, 03, 04, 05) | Search pets, parents, phone numbers |
| `chrome.search.broadcasts-route` | Search placeholder, Broadcasts-route screens (06, 06b, 06c) | Search broadcasts by keyword |
| `chrome.search.settings-route` | Search hidden on Settings (07b) per Section 1 spec | (no string; field omitted from render) |

**Notes.** Wordmark + city stay Latin script in both languages (clinic identity, not translated). Rail items get MR per voice.md `तुमचा`/formal-side calibration; "Settings" likely stays English-transliterated unless the native pass picks a stronger Marathi equivalent.

---

## 2. Screen 02 — Inbox (list view)

| Key | Context | EN |
|---|---|---|
| `inbox.subtab.active` | Subtab label (parent waiting on vet) | Awaiting reply |
| `inbox.subtab.inactive` | Subtab label (vet has replied or window closed) | Replied |
| `inbox.subtab.count-tnum` | Tabular count next to subtab label | `{count}` |
| `inbox.empty.active` | "Awaiting reply" subtab, zero rows | Nothing awaiting reply. |
| `inbox.empty.inactive` | "Replied" subtab, zero rows | No replied threads yet. |
| `inbox.timestamp.relative.minutes` | Row timestamp | `{n}m ago` |
| `inbox.timestamp.relative.hours` | Row timestamp | `{n}h ago` |
| `inbox.timestamp.relative.days` | Row timestamp | `{n}d ago` |
| `inbox.timestamp.relative.weeks` | Row timestamp | `{n}w ago` |
| `inbox.preview.photo` | Last message was a photo | Photo |
| `inbox.preview.video` | Last message was a video | Video |

**Notes.** Active = parent waiting on vet reply. Inactive = vet has replied or window closed. Empty-active copy locked in `docs/premium-feel/states.md` line 32.

---

## 3. Screen 03 — Inbox thread detail

### 3.1 Breadcrumb + headers

| Key | Context | EN |
|---|---|---|
| `thread.breadcrumb.root` | First crumb, links to Inbox | Inbox |
| `thread.breadcrumb.separator` | Visual separator | `›` |
| `thread.breadcrumb.current` | Current pet + household | `{pet_name} · {household}` |
| `thread.pet-panel.header` | Pet panel header (above Quick Facts) | `{pet_name}` |
| `thread.pet-panel.section.quick-facts` | Quick Facts section label | Quick Facts |
| `thread.pet-panel.tab.clinical` | Pet panel tab label | Clinical history |
| `thread.pet-panel.tab.invoices` | Pet panel tab label | Invoices |
| `thread.pet-panel.empty.clinical` | Clinical tab, no visits yet | No visits on file. |
| `thread.pet-panel.empty.invoices` | Invoices tab, none on file | No invoices on file. |

### 3.2 Quick Facts row labels

| Key | Context | EN |
|---|---|---|
| `thread.quick-fact.breed` | Quick Facts row | Breed |
| `thread.quick-fact.age` | Quick Facts row | Age |
| `thread.quick-fact.weight` | Quick Facts row with last-weighed month | `Weight ({month})` |
| `thread.quick-fact.chronic` | Quick Facts row | Chronic |
| `thread.quick-fact.last-visit` | Quick Facts row | Last visit |
| `thread.quick-fact.value.no-chronic` | Chronic value when none | None on file |
| `thread.quick-fact.value.no-visits` | Last visit when none | No visits yet |

### 3.3 Follow-up banner

**Voice rule:** present tense; address pet by name; never "follow-up window: open" system jargon.

| Key | Context | EN |
|---|---|---|
| `thread.followup.lead.open` | Banner first line, window active | Dr Sagar is here for `{pet_name}` until `{close_date}` |
| `thread.followup.lead.closing-soon` | Banner first line, ≤2 days left | `{pet_name}'s follow-up window closes in `{n}` days |
| `thread.followup.lead.unreplied` | Banner first line, when parent has unreplied messages waiting | `{pet_name}'s window is open. `{n}` waiting on you |
| `thread.followup.meta` | Banner second line (context) | Opened `{open_date}` after `{visit_reason}`. Closes `{close_date}`. |
| `thread.followup.lead.closed` | Banner when window has closed | Follow-up window closed `{close_date}` |

**FLAG (mockup violation):** current locked mockup uses `Open follow-up window · 5 days remaining` (system jargon, not present tense). Replace with `Dr Sagar is here for Gabby until May 16` per voice.md example. Listed in voice-violations section at end of this file.

### 3.4 Compose + actions

| Key | Context | EN |
|---|---|---|
| `thread.compose.placeholder` | Empty compose field | Reply… |
| `thread.compose.mic-tooltip.idle` | Mic button hover state | Use voice |
| `thread.compose.mic-tooltip.listening` | Mic button while recording | Listening… (tap to stop) |
| `thread.compose.send` | Send button (icon + label) | Send |
| `thread.bubble.stamp.vet` | Bubble byline + timestamp template | `Dr Sagar · {date}, {time}` |
| `thread.bubble.stamp.parent` | Bubble timestamp template (parent side, no vet name) | `{date}, {time}` |
| `thread.bubble.stamp.today` | "Today" instead of date when timestamp is today | Today, `{time}` |

**FLAG (mockup violation):** current locked mockup uses `Type or use voice to reply...` as the compose placeholder. Replace with `Reply…` (matter-of-fact, single word; the mic icon affordance is already next to the field). Listed at end.

---

## 4. Screen 04 — Itemised invoice

| Key | Context | EN |
|---|---|---|
| `invoice.back-affordance` | Back link, top-left | Back to thread with `{household}` |
| `invoice.letterhead.clinic-name` | Letterhead block | Animal Medical Services |
| `invoice.letterhead.meta` | Letterhead second line | Pune · GSTIN `{gstin}` |
| `invoice.number-prefix` | Invoice number label | Invoice `{number}` |
| `invoice.date-prefix` | Issue date label | Issued `{date}` |
| `invoice.category.examination` | Section header | Examination |
| `invoice.category.medication` | Section header | Medication |
| `invoice.category.procedure` | Section header | Procedure |
| `invoice.totals.grand-label` | Grand total row label | Total |
| `invoice.totals.gst-note` | Italic note below total | GST included |

### 4.1 Line item tooltip templates (Examination + Procedure only)

Tooltips render in plain language, conversational tone, grade 8. Medication items get no tooltip per locked content rules.

| Key | Context | EN |
|---|---|---|
| `invoice.tooltip.consultation` | Line item: Consultation | This is for Dr Sagar's time with `{pet_name}`. |
| `invoice.tooltip.otoscope` | Line item: Otoscope examination | Visual examination of `{pet_name}`'s ear canal. |
| `invoice.tooltip.cytology-ear` | Line item: Cytology · ear swab | Lab test on a sample from `{pet_name}`'s ear to identify what's causing the infection. |
| `invoice.tooltip.cytology-skin` | Line item: Cytology · skin swab | Lab test on a skin sample to identify what's causing the irritation. |
| `invoice.tooltip.fecal-exam` | Line item: Fecal examination | Lab test on a stool sample to check for parasites or digestive issues. |
| `invoice.tooltip.blood-cbc` | Line item: Complete blood count | Lab test that checks `{pet_name}`'s red cells, white cells, and platelets. |
| `invoice.tooltip.x-ray` | Line item: X-ray | An image to look inside `{pet_name}` for fractures, foreign objects, or organ shape. |
| `invoice.tooltip.dental-cleaning` | Line item: Dental cleaning | Scaling and polishing of `{pet_name}`'s teeth under sedation. |
| `invoice.tooltip.suture-removal` | Line item: Suture removal | Stitches taken out after `{pet_name}` healed from a previous procedure. |
| `invoice.tooltip.ear-flush` | Line item: Ear flush | Cleaning out `{pet_name}`'s ear canal so medication can reach the infection. |

**Notes.** Tooltip pool extensible at build time as new procedures appear in real invoices. Keep each tooltip to 1-2 sentences. Address pet by name; never "your pet" since the invoice is for a specific pet.

**FLAG (mockup violation):** current locked mockup tooltips use `Dr.` with period ("This is for Dr. Sagar's time examining your pet."). Voice.md says `Dr Sagar` no period. Also `your pet` should be `{pet_name}` (Gabby in the rendered mockup). Listed at end.

---

## 5. Screen 05 — Clinical history full screen

| Key | Context | EN |
|---|---|---|
| `clinical.back-affordance` | Back link | Back to thread with `{household}` |
| `clinical.page.title` | Page title | `{pet_name}` · clinical history |
| `clinical.page.sub` | Page sub | `{count}` visits on file. Most recent first. |
| `clinical.year-marker` | Year separator between visit groups | `{year}` |
| `clinical.empty` | Pet has no clinical records yet | No clinical records yet. |
| `clinical.vet-byline` | Visit card byline (italic, Ink-faint) | Dr Sagar Bhongale · Animal Medical Services |
| `clinical.soap.subjective` | SOAP grid label | Subjective |
| `clinical.soap.objective` | SOAP grid label | Objective |
| `clinical.soap.assessment` | SOAP grid label | Assessment |
| `clinical.soap.plan` | SOAP grid label | Plan |

### 5.1 Visit type pills (placeholder taxonomy — see open issue)

**Status:** `status.md` line 282-285 flags this as TBD pending vocabulary lock. Placeholders below; full taxonomy + final copy decided after vet review of common visit types.

| Key | Placeholder EN |
|---|---|
| `clinical.pill.sick-visit` | Sick visit |
| `clinical.pill.wellness` | Wellness |
| `clinical.pill.vaccination` | Vaccination |
| `clinical.pill.recheck` | Recheck |
| `clinical.pill.emergency` | Emergency |

---

## 6. Screen 06 — Broadcast composer (compose step)

### 6.1 Step nav (shared across 06 / 06b / 06c)

| Key | Context | EN |
|---|---|---|
| `broadcast.step-nav.1` | Step 1 label | Compose |
| `broadcast.step-nav.2` | Step 2 label | Audience |
| `broadcast.step-nav.3` | Step 3 label | Send |

### 6.2 Compose stage

| Key | Context | EN |
|---|---|---|
| `compose.eyebrow.draft` | Eyebrow when broadcast is a draft | Draft · `{title_or_untitled}` |
| `compose.eyebrow.untitled` | Eyebrow draft-title fallback | Untitled broadcast |
| `compose.field.cover.label` | Cover image field label | Cover image (optional) |
| `compose.field.cover.placeholder` | Cover image empty state | Drag in a photo, or skip |
| `compose.field.url-slug.label` | URL slug field label | Public URL |
| `compose.field.url-slug.template` | URL preview | `pawkit.app/broadcasts/{slug}` |
| `compose.field.url-slug.copy` | Copy-link button | Copy |
| `compose.field.url-slug.meta` | URL state meta line | Live once you send. Edit slug while drafting. |
| `compose.field.language.label` | Language toggle row label | Composing in |
| `compose.field.language.en` | Toggle pill | English |
| `compose.field.language.mr` | Toggle pill (Devanagari) | मराठी |
| `compose.field.language.helper` | Toggle helper note | Both languages publish together. Other language fills in via Sarvam Translate, you review before send. |
| `compose.field.title.label` | Title field label | Title |
| `compose.field.title.placeholder` | Title field placeholder | What's this about? |
| `compose.field.summary.label` | Summary field label | Summary |
| `compose.field.summary.placeholder` | Summary field placeholder | One short line per key point |
| `compose.field.body.label` | Body field label | Body |
| `compose.field.body.placeholder` | Body field placeholder | The longer version. Plain language, grade 5 reading level for parents. |
| `compose.field.warning.label` | Warning signs field label | Warning signs |
| `compose.field.warning.placeholder` | Warning signs placeholder | Symptoms that mean parents should act fast |
| `compose.field.escalation.label` | Escalation field label | When to call us |
| `compose.field.escalation.placeholder` | Escalation field placeholder | Clinic number, hours, and what counts as urgent |
| `compose.mic.idle.tooltip` | Mic button idle tooltip | Use voice |
| `compose.mic.listening.tooltip` | Mic button while recording | Listening… (tap to stop) |
| `compose.preview.label` | Right-column phone preview label | Parent view |
| `compose.draft-saved.idle` | Draft auto-save indicator (idle) | Draft saved |
| `compose.draft-saved.saving` | Draft auto-save indicator (in flight) | Saving… |
| `compose.cta.next` | Bottom-right CTA | Next: Audience → |

**Notes.** "Composing in: English" toggle scope is the BROADCAST content language Sagar is currently typing in, not the dashboard chrome language (which is set in Settings). Both EN + MR get published — Sarvam Translate auto-generates the other, Sagar reviews + approves both sequentially before send (bilingual publish-block).

---

## 7. Screen 06b — Broadcast audience

| Key | Context | EN |
|---|---|---|
| `audience.eyebrow` | Eyebrow with broadcast title | Broadcast · `{title}` |
| `audience.eyebrow.edit-link` | Edit affordance, right of eyebrow | Edit |
| `audience.page.title` | Stage title | Who's this for? |
| `audience.page.sub` | Stage sub | Pick which parents see this. Live count updates as you add conditions. |
| `audience.group.header` | Group A header | Condition group A |
| `audience.group.add-condition` | Inline CTA below conditions | + Add condition |
| `audience.group.add-or-group` | Lazy-revealed CTA below Group A | + Add OR group |

### 7.1 Property labels + value pills

| Key | Context | EN |
|---|---|---|
| `audience.property.species` | Property label | Species |
| `audience.value.species.dogs` | Value pill | Dogs |
| `audience.value.species.cats` | Value pill | Cats |
| `audience.value.species.both` | Value pill | Dogs and cats |
| `audience.property.age` | Property label | Age range |
| `audience.value.age.from-label` | Age input prefix | from |
| `audience.value.age.to-label` | Age input separator | to |
| `audience.value.age.unit` | Age unit suffix | years |
| `audience.property.deceased` | Property label | Deceased pets |
| `audience.value.deceased.include` | Value pill | Include |
| `audience.value.deceased.exclude` | Value pill | Exclude |
| `audience.operator.is` | Operator pill | is |
| `audience.operator.is-not` | Operator pill | is not |
| `audience.operator.between` | Operator pill | between |
| `audience.connector.and` | Inside-group connector | AND |
| `audience.connector.or` | Between-group connector (lazy-revealed) | OR |

### 7.2 Count strip + actions

| Key | Context | EN |
|---|---|---|
| `audience.count.template` | Count strip text | `{pets}` pets · `{households}` households · `{pct}`% of AMS pet parents |
| `audience.count.empty` | Filter resolves to zero matches | No parents match these filters. Loosen a condition. |
| `audience.cta.back` | Bottom-left ghost | ← Back to Compose |
| `audience.cta.next` | Bottom-right Teal | Next: Send → |

---

## 8. Screen 06c — Broadcast send (final review)

| Key | Context | EN |
|---|---|---|
| `send.eyebrow` | Eyebrow with broadcast title | Broadcast ready · `{title}` |
| `send.eyebrow.edit-link` | Edit affordance, right of eyebrow | Edit |
| `send.page.title` | Stage title | One last look |
| `send.page.sub` | Stage sub | Check what parents will read on the left. Check who's getting it on the right. Send has a 15-second undo. |
| `send.preview.label` | Mobile preview column label | Parent view |
| `send.hero.label` | Sending-to hero eyebrow | Sending to |
| `send.hero.count-template` | Hero count line | `{pets}` pets |
| `send.hero.meta-template` | Hero meta line | across `{households}` households · `{pct}`% of AMS pet parents |
| `send.filter.section-label` | Audience filter section label | Audience filter |
| `send.filter.row.species` | Filter row prop | Species |
| `send.filter.row.age` | Filter row prop | Age range |
| `send.filter.row.deceased` | Filter row prop | Deceased pets |
| `send.filter.value.dogs-only` | Filter value | Dogs only |
| `send.filter.value.cats-only` | Filter value | Cats only |
| `send.filter.value.dogs-and-cats` | Filter value | Dogs and cats |
| `send.filter.value.age-range-template` | Filter value | `{from}` to `{to}` years |
| `send.filter.value.deceased-included` | Filter value | Included |
| `send.filter.value.deceased-excluded` | Filter value | Excluded |
| `send.delivery.section-label` | Delivery section label | Delivery |
| `send.delivery.in-app.line` | Channel line | Appears in each parent's Broadcasts tab |
| `send.delivery.in-app.meta` | Channel meta | in-app · instant |
| `send.delivery.push.line` | Channel line | Push notification fires on each parent's phone |
| `send.delivery.push.meta` | Channel meta | mobile · instant |
| `send.delivery.web.line` | Channel line | Public web page goes live |
| `send.delivery.web.meta` | Channel meta (template URL) | `pawkit.app/broadcasts/{slug}` |
| `send.undo.hint` | Italic hint above actions bar | Send has a 15-second undo window |
| `send.cta.back` | Bottom-left ghost | ← Back to Audience |
| `send.cta.send` | Bottom-right Teal (replaces "Confirm and Send") | Send to `{pets}` parents |
| `send.cta.send-fallback` | Same CTA when count unavailable | Send broadcast |

**FLAG (mockup violation):** current locked mockup uses `Confirm and Send` for the bottom-right Teal CTA. "Confirm" is banned per voice.md system-jargon rule. Replace with `Send to {pets} parents` (dynamic, uses live count which is already on the screen) or `Send broadcast` (static fallback). Same flag for the sub copy `Confirm what parents will read on the left, and confirm who's getting it on the right.` Listed at end.

---

## 9. Screen 07b — Settings

### 9.1 Page header + section labels

| Key | Context | EN |
|---|---|---|
| `settings.page.title` | Page title | Settings |
| `settings.page.sub` | Page sub | Your profile, account, and clinic details. |
| `settings.section.profile` | Section label | Profile |
| `settings.section.account` | Section label | Account |
| `settings.section.clinic` | Section label | Clinic |

### 9.2 Profile section

| Key | Context | EN |
|---|---|---|
| `settings.profile.photo.label` | Photo row label | Profile photo |
| `settings.profile.photo.help` | Photo row help line | Appears in your byline on every Broadcast and inbox reply. |
| `settings.profile.photo.cta-empty` | Photo CTA when no photo | Upload |
| `settings.profile.photo.cta-filled` | Photo CTA when photo exists | Replace |
| `settings.profile.full-name.label` | Field label | Full name |
| `settings.profile.vet-license.label` | Field label | Vet license |
| `settings.profile.email.label` | Field label | Email |
| `settings.profile.email.placeholder` | Empty-state value (italic, Ink-faint) | Not added |
| `settings.field.edit-pill` | Edit pill (every editable row with existing value) | Edit |
| `settings.field.add-pill` | Add pill (every editable row with no value) | Add |

### 9.3 Account section

| Key | Context | EN |
|---|---|---|
| `settings.account.phone.label` | Field label (read-only) | Phone |
| `settings.account.language.label` | EN/MR toggle row label | Dashboard language |
| `settings.account.language.toggle.en` | Toggle pill | English |
| `settings.account.language.toggle.mr` | Toggle pill (Devanagari) | मराठी |
| `settings.account.language.helper` | Toggle helper line below the row | Changes labels and buttons in your dashboard. Broadcasts always ship to parents in both languages. |

### 9.4 Clinic section

| Key | Context | EN |
|---|---|---|
| `settings.clinic.name` | Clinic name line | Animal Medical Services |
| `settings.clinic.address-line-1` | Street + city + pincode | Karve Road, Kothrud, Pune 411038 |
| `settings.clinic.address-line-2` | State + country | Maharashtra, India |
| `settings.clinic.gstin-template` | GSTIN line (tabular-nums) | GSTIN `{gstin}` |
| `settings.clinic.hours` | Hours line | Open 9am to 9pm, Mon to Sat |

### 9.5 Sign out + vendor

| Key | Context | EN |
|---|---|---|
| `settings.signout.button` | Full-width Ink ghost button | Sign out |
| `settings.vendor.brand` | Footer vendor mark | Pawkit |
| `settings.vendor.version` | Footer version | v0.1 |

---

## 10. System messages (cross-cutting)

### 10.1 Empty states

Locked in `docs/premium-feel/states.md`; reproduced here for translation grouping.

| Key | Context | EN |
|---|---|---|
| `empty.admin-inbox` | Active subtab, no waiting threads | No open windows right now. Take a breath. |
| `empty.admin-broadcasts-list` | Broadcasts list, none published yet | No broadcasts yet. Tap **New broadcast** to start one. |
| `empty.admin-drafts` | Drafts subtab, none in progress | No drafts. Anything you start saves here. |

### 10.2 Voice input states (spec'd in `docs/premium-feel/states.md` voice-input section, finalised here)

| Key | Context | EN |
|---|---|---|
| `voice.mic-blocked.caption` | Inline caption when browser denies mic | Mic blocked in browser settings. |
| `voice.network-failure.toast` | Toast headline + body when Sarvam API unreachable | Voice transcription is offline. Try typing instead. |
| `voice.low-confidence.caption` | Inline caption under dotted-underline draft transcription | Tap to confirm or retype. |
| `voice.silence.caption` | Inline caption when no audio for 4s | Didn't catch anything. Try again. |

### 10.3 Sign-out confirmation dialog (rendered as `<AlertDialog>` at build)

| Key | Context | EN |
|---|---|---|
| `signout.dialog.title` | Dialog heading | Sign out of AMS dashboard? |
| `signout.dialog.body` | Dialog body | You'll need your phone to sign back in. Any unsaved draft stays here. |
| `signout.dialog.cancel` | Ghost button left | Stay signed in |
| `signout.dialog.confirm` | Ink button right | Sign out |

### 10.4 Broadcast publish + post-send

| Key | Context | EN |
|---|---|---|
| `publish.toast.success` | Toast after Send fires + 15s undo expires | Your broadcast is on its way to `{pets}` parents. |
| `publish.toast.undo-window` | 15s undo affordance (toast variant during the undo window) | Sending in `{n}`s. Tap to undo. |
| `publish.toast.undone` | Toast after Sagar taps Undo | Send cancelled. Draft kept. |
| `publish.toast.failed` | Toast on server error after Send | Send didn't go through. Tap to retry. |

### 10.5 Form validation + error templates

Voice rule: name the problem in human terms, never error codes; offer a next step.

| Key | Context | EN template |
|---|---|---|
| `error.inline.required` | Required field empty on save | This one's needed before you can send. |
| `error.inline.bad-email` | Email format invalid in Settings | That email doesn't look right. |
| `error.inline.bad-license` | Vet license format invalid in Settings | That license number doesn't look right. |
| `error.banner.broadcast-send` | Top-of-screen blocker on send failure | Send failed. We can try again or save the draft. |
| `error.banner.broadcast-send.retry-link` | Retry link inside banner | Try again |
| `error.banner.broadcast-send.save-draft-link` | Save-draft link inside banner | Save as draft |
| `error.toast.photo-upload` | Toast on profile photo upload failure | Couldn't upload that photo. Try again? |
| `error.toast.draft-save` | Toast on draft auto-save failure | Couldn't save draft. Working offline? |

### 10.6 Offline + stale data

| Key | Context | EN |
|---|---|---|
| `offline.banner` | Top-of-screen banner when network drops | You're offline. Drafts save locally. |
| `offline.recovered.toast` | Toast when network returns + queued items send | Back online. Sending queued drafts. |
| `stale.data.caption` | Top-right caption on data screens | Updated `{n}`m ago |
| `stale.data.caption.refresh-link` | Tappable refresh affordance (after 10m+) | refresh |

### 10.7 Permission prompts

| Key | Context | EN |
|---|---|---|
| `permission.mic.prompt` | Inline prompt above compose field before first mic use | Pawkit needs mic permission to transcribe your voice. |
| `permission.mic.cta-allow` | Allow CTA inline with prompt | Allow |
| `permission.mic.cta-skip` | Skip CTA inline with prompt | Skip, I'll type |

### 10.8 Memorial card (admin-side display of deceased pet)

Per spec, "Mark deceased" affordance removed from admin pet panel (status.md line 197); deceased state pre-seeded for demo (Raffy). Card line below renders in pet record panel header when `pets.deceased_at` is non-null.

| Key | Context | EN |
|---|---|---|
| `memorial.pet-panel.header` | Italic line under pet name in pet record panel header | In memory of `{pet_name}` (`{year_birth}`–`{year_death}`) |
| `memorial.clinical.banner` | Top of `{pet_name}`'s clinical history view | `{pet_name}` passed `{date_death}`. Records preserved. |

---

## 11. Screen 06d — Voice-first broadcast (2026-05-18 v3 rebuild)

The voice-first composer replaces the prior step-1/2/3 flow. Vet lands on a single mic prompt, dictates freely, Pawkit structures + populates the composer canvas. Section 6 above is superseded for the voice path (Section 6 strings still apply to manual composer / draft resume).

### 11.1 Voice landing — initial state

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `voice.eyebrow` | Top eyebrow | NEW BROADCAST | (pending) |
| `voice.headline` | Hero headline (no trailing period) | Say what you want parents to know | (pending) |
| `voice.sub` | Sub-paragraph under headline (no trailing period) | Speak in English or Marathi, for as long as you need. Restart, change topics, take your time. You'll edit the structured draft before publishing | (pending) |
| `voice.cta.tap-to-start` | Eyebrow status below mic, idle state | Tap to start | (pending) |
| `voice.cta.permission` | Below mic, awaiting browser mic permission | Allow microphone access to continue | (pending) |
| `voice.header.title` | Top-left "New broadcast" | New broadcast | (pending) |
| `voice.header.compose-manually` | Top-right outline link to manual composer | Compose manually | (pending) |

### 11.2 Coach mark (first-use, dismissible)

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `voice.coachmark.tag` | Eyebrow tag above coach mark body | FIRST-TIME TIP | (pending) |
| `voice.coachmark.body` | Reassurance copy | Don't worry about getting it perfect. Say something wrong? Just keep going. Pawkit organises it at the end. | (pending) |
| `voice.coachmark.dismiss` | Dismiss button | Got it | (pending) |

### 11.3 Recording state (in-place, no second screen)

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `voice.recording.label` | Eyebrow next to pulsing dot | RECORDING | (pending) |
| `voice.recording.tap-to-stop` | Status next to duration | · TAP TO STOP | (pending) |
| `voice.recording.approaching-limit` | Badge when >8 min in | APPROACHING LIMIT | (pending) |

### 11.4 Transcribing / Structuring busy states

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `voice.transcribing.headline` | Busy canvas headline | Transcribing your recording | (pending) |
| `voice.transcribing.sub` | Busy canvas sub copy | We are converting your voice to text. Usually a few seconds. | (pending) |
| `voice.structuring.headline` | Busy canvas headline | Structuring your broadcast | (pending) |
| `voice.structuring.sub` | Busy canvas sub copy | Pawkit is organising your dictation into title, body, and sections. | (pending) |

### 11.5 Fallback (Groq couldn't structure)

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `voice.fallback.headline` | Fallback card headline | Couldn't auto-structure this one | (pending) |
| `voice.fallback.sub` | Sub copy | Your words are safe. We'll drop the full transcript into the body field and you can structure as you go. | (pending) |
| `voice.fallback.cta.continue` | Primary action | Continue with raw text | (pending) |
| `voice.fallback.cta.retry` | Secondary action | Try recording again | (pending) |
| `voice.fallback.transcript-label` | Eyebrow above raw transcript preview | YOUR TRANSCRIPT | (pending) |
| `voice.fallback.timeout-reason` | Reason shown when 25s timeout fires | Structuring took longer than 25 seconds — dropping the raw transcript into the body so you're not stuck. | (pending) |

### 11.6 Error (mic permission / STT failure)

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `voice.error.headline` | Error card headline | Couldn't record | (pending) |
| `voice.error.sub.permission` | Helper line | Check that your browser has microphone permission for this site, then try again. | (pending) |
| `voice.error.cta.retry` | Primary action | Try again | (pending) |
| `voice.error.cta.manual` | Secondary action | Compose manually instead | (pending) |

### 11.7 View original transcript dialog (composer header)

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `composer.view-transcript.button` | Toolbar link button (only when voiceTranscript set) | View original transcript | (pending) |
| `composer.view-transcript.dialog-title` | Dialog title | Your original recording | (pending) |
| `composer.view-transcript.dialog-footer` | Below the transcript text | Stays available for this draft on this browser. Edits above don't change the transcript. | (pending) |

### 11.8 Audience modal

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `audience.modal.title` | Dialog title | Who is this for | (pending) |
| `audience.modal.description` | Sub-paragraph under title | Narrow this broadcast with conditions. Audience size updates as you change them. | (pending) |
| `audience.row.species` | Field label | Species | (pending) |
| `audience.row.age` | Field label | Age range | (pending) |
| `audience.row.age.all` | Tickbox label | All | (pending) |
| `audience.row.deceased` | Field label | Deceased pets | (pending) |
| `audience.row.lastVisit` | Field label | Last visit | (pending) |
| `audience.empty.headline` | Empty state when Clear pressed | No audience filters. The broadcast will reach 0 parents until you add some. | (pending) |
| `audience.empty.cta` | Add-filters button | Add filters | (pending) |
| `audience.footer.clear` | Footer ghost link | Clear | (pending) |
| `audience.footer.apply` | Footer primary action | Apply audience | (pending) |

### 11.9 Audience strip (in composer, below sections)

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `composer.audience.eyebrow` | Strip eyebrow | WHO IS THIS FOR | (pending) |
| `composer.audience.sample-prefix` | Sample row prefix | Sample: | (pending) |
| `composer.audience.select-cta` | Right-aligned action when empty | Select audience | (pending) |
| `composer.audience.edit-cta` | Right-aligned action when set | Edit filters | (pending) |

### 11.10 Toolbar (sticky, top of composer card)

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `composer.toolbar.writing-in` | Left-side label | WRITING IN | (pending) |
| `composer.toolbar.autofill` | Translate button (target lang varies) | Auto-fill `{target_lang}` now | (pending) |
| `composer.toolbar.mic-disabled-tooltip` | Tooltip when no field focused | To write with voice, click into a section | (pending) |

### 11.11 Send footer + confirm modal

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `composer.footer.save` | Bottom-left action | Save draft | (pending) |
| `composer.footer.preview` | Bottom action | Preview as parent | (pending) |
| `composer.footer.send` | Primary CTA | Send broadcast | (pending) |
| `composer.footer.send-disabled-tooltip` | Tooltip when audience unset | Pick an audience in "Who is this for" first | (pending) |
| `send.confirm.checkbox` | Final confirm tickbox | Send to `{audience_summary}`. | (pending) |
| `send.warn.mr-empty` | Banner when MR unfilled | Marathi version is empty. Parents with a Marathi preference won't see this broadcast. | (pending) |
| `send.warn.en-empty` | Banner when EN unfilled | English version is empty. Parents with an English preference won't see this broadcast. | (pending) |
| `send.warn.both-empty` | Banner when both unfilled | No content yet. Add either an English or Marathi version before sending. | (pending) |

### 11.12 Preview overlay (phone frame)

| Key | Context | EN | MR (pending Phase 3b) |
|---|---|---|---|
| `preview.appbar.from` | Top app bar | From `{vet_full_name}` | (pending) |
| `preview.empty.headline.mr` | When MR side is empty | Marathi version not yet generated | (pending) |
| `preview.empty.headline.en` | When EN side is empty | English version not yet filled | (pending) |
| `preview.empty.sub-mr-from-en` | When EN has content + MR empty | Translate the English content with Sarvam Mayura, then review. | (pending) |
| `preview.empty.sub-en-from-mr` | When MR has content + EN empty | Translate the Marathi content with Sarvam Mayura, then review. | (pending) |
| `preview.empty.sub-both-empty` | When both empty | Fill in the composer first, then come back to preview. | (pending) |
| `preview.empty.cta-mr` | Translate-now button (target MR) | Auto-fill मराठी now | (pending) |
| `preview.empty.cta-en` | Translate-now button (target EN) | Auto-fill English now | (pending) |

### 11.13 Section labels (renamed 2026-05-18 v3)

| Key | Context | EN | MR |
|---|---|---|---|
| `section.warning.label` | Warning signs section eyebrow | WARNING SIGNS | धोक्याची चिन्हे |
| `section.whenToCall.label` | When-to-call section eyebrow (renamed from "When to call us") | WHEN TO SEE THE VET | (pending — MR was "आम्हाला कधी कॉल करावा"; new EN suggests "पशुवैद्याला कधी भेटायचे" but awaits Phase 3b Sarvam pass + native-speaker review) |

---

## Voice.md violations in current locked mockup (separate cleanup)

The mockup was authored before the voice.md round; some strings violate locked rules. Flagged here for separate sweep after the EN microcopy round locks. Each item links to the EN replacement above.

| # | Mockup string | Rule violated | Replacement key |
|---|---|---|---|
| V1 | `Open follow-up window · 5 days remaining` (Screen 03 followup banner `.lead`) | Not present tense; system jargon | `thread.followup.lead.open` → "Dr Sagar is here for `{pet_name}` until `{close_date}`" |
| V2 | `Type or use voice to reply...` (Screen 03 compose placeholder) | Clunky; matter-of-fact rule suggests trim | `thread.compose.placeholder` → "Reply…" |
| V3 | `This is for Dr. Sagar's time examining your pet.` (Screen 04 Consultation tooltip) | "Dr." with period (voice.md says "Dr Sagar" no period); "your pet" should use pet name when available | `invoice.tooltip.consultation` → "This is for Dr Sagar's time with `{pet_name}`." |
| V4 | `Visual examination of the ear canal.` (Screen 04 Otoscope tooltip) | "the ear canal" generic; should reference pet name | `invoice.tooltip.otoscope` → "Visual examination of `{pet_name}`'s ear canal." |
| V5 | `Confirm and Send` (Screen 06c bottom-right Teal CTA) | "Confirm" is system jargon, banned | `send.cta.send` → "Send to `{pets}` parents" (or fallback `Send broadcast`) |
| V6 | `Confirm what parents will read on the left, and confirm who's getting it on the right. Send fires with a 15-second undo window.` (Screen 06c sub) | "Confirm" repeated; verbose | `send.page.sub` → "Check what parents will read on the left. Check who's getting it on the right. Send has a 15-second undo." |

**Proposed cleanup sweep:** apply V1-V6 to `mockups/archive/admin-locked.html` after this microcopy file locks. 6 targeted Edits. Will also update `docs/decisions-log.md` to note the voice-rule-driven copy refinements.

---

## What's pending

- **Phase 3b — Sarvam batch translation** of all EN strings above into MR; runs after you review + lock the EN drafts. Will write MR rows back into this same file, replacing `(pending Phase 3b)`. Each MR string tagged `(Sarvam first-pass, review pending)` until the native-speaker pass.
- **Phase 3c — Pune-native-speaker review pass** (yours or coordinated) on the MR rows. Catches metaphor errors (e.g., the खिडकी / "window" issue we saw in testing), register calibration (`तुमचा` vs `तुझा` per relationship), Pune-dialect specifics. After this pass, MR rows are locked and the file is build-ready.
- **Pre-existing TBD:** Screen 05 visit-card pill taxonomy (`clinical.pill.*` above). Placeholder labels are flagged per `status.md` line 282-285. Lock the taxonomy + final labels before build.
- **Mockup voice-violation cleanup:** 6 Edits to `mockups/archive/admin-locked.html` to apply V1-V6 above. Separate task; queued after EN lock.
