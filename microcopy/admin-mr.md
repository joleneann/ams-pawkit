# Admin microcopy -- Marathi translations (Sarvam first-pass)

Generated 2026-05-12 via Sarvam Translate, model `sarvam-translate:v1`, mode `formal`, `en-IN` -> `mr-IN`.

**Every MR string is review pending** until the Pune-native-speaker pass refines it.

Known MT limitations to watch for during native-speaker review:
- **Metaphorical terms translated literally** (e.g., "open windows" of the inbox usually comes back as the Marathi word for physical window). Conceptual rewrites needed.
- **Semantic errors** on technical vocabulary (e.g., "transcription" rendered as transliteration; not the same thing).
- **Honorific calibration**: formal "tumcha" for vet-facing dashboard chrome is the default; check whether any string needs intimate "tujha".
- **Dialect**: Pune Marathi, not Mumbai/Nagpur. Specific lexical choices may differ.
- **Dr Sagar**: render consistently as the locked form per voice.md ('Dr.' with period in Devanagari abbreviation).
- **Western numerals** in both languages (per existing decisions-log lock).
- **Placeholders in braces** (e.g., `{pet_name}`, `{count}`): should be preserved verbatim. If Sarvam translated a placeholder, restore the brace form.

**Stats:** 109 strings translated, 13 skipped (Latin-locked / placeholder-only / already-Devanagari / source-flagged-no-translation), 0 failed. Sarvam input chars used: 2445. Estimated cost: Rs 4.89.

---

## 1. Chrome (cross-screen header + rail)

| Key | EN | MR (Sarvam first-pass) |
|---|---|---|
| `chrome.wordmark.line1` | Animal Medical Services | _(no translation; Latin-locked identity)_ |
| `chrome.wordmark.line2` | Pune | _(no translation; Latin-locked identity)_ |
| `chrome.rail-section-label` | Workspace | कार्यालय |
| `chrome.rail.inbox` | Inbox | इनबॉक्स |
| `chrome.rail.broadcasts` | Broadcasts | प्रसारण |
| `chrome.rail.settings` | Settings | सेटिंग्ज |
| `chrome.search.inbox-route` | Search pets, parents, phone numbers | पाळीव प्राणी, पालक, फोन नंबर शोधा |
| `chrome.search.broadcasts-route` | Search broadcasts by keyword | कीवर्डनुसार शोधांचे प्रसारण |
| `chrome.search.settings-route` | (no string; field omitted from render) | _(no translation; Source flagged no-translation)_ |

---

## 2. Screen 02 — Inbox (list view)

| Key | EN | MR (Sarvam first-pass) |
|---|---|---|
| `inbox.subtab.active` | Active | सक्रिय |
| `inbox.subtab.inactive` | Inactive | निष्क्रिय |
| `inbox.subtab.count-tnum` | {count} | _(no translation; Placeholder only)_ |
| `inbox.empty.active` | No open windows right now. Take a breath. | सध्या कोणतीही खिडकी उघडी नाही. श्वास घे. |
| `inbox.empty.inactive` | Nothing in the inactive list yet. | निष्क्रिय यादीत अजून काही नाही. |
| `inbox.timestamp.relative.minutes` | {n}m ago | {n}m पूर्वी |
| `inbox.timestamp.relative.hours` | {n}h ago | {n} तासांपूर्वी |
| `inbox.timestamp.relative.days` | {n}d ago | {n}d पूर्वी |
| `inbox.timestamp.relative.weeks` | {n}w ago | {n}w तासांपूर्वी |
| `inbox.preview.photo` | Photo | फोटो |
| `inbox.preview.video` | Video | व्हिडिओ |

---

## 3. Screen 03 — Inbox thread detail

| Key | EN | MR (Sarvam first-pass) |
|---|---|---|
| `thread.breadcrumb.root` | Inbox | इनबॉक्स |
| `thread.breadcrumb.separator` | › | › |
| `thread.breadcrumb.current` | {pet_name} · {household} | {pet_name} · {household} |
| `thread.pet-panel.header` | {pet_name} | _(no translation; Placeholder only)_ |
| `thread.pet-panel.section.quick-facts` | Quick Facts | त्वरित माहिती |
| `thread.pet-panel.tab.clinical` | Clinical history | वैद्यकीय इतिहास |
| `thread.pet-panel.tab.invoices` | Invoices | देयके |
| `thread.pet-panel.empty.clinical` | No visits on file. | कोणतीही भेट नोंदवलेली नाही. |
| `thread.pet-panel.empty.invoices` | No invoices on file. | कोणतेही बीजक फाईलमध्ये नाहीत. |
| `thread.quick-fact.breed` | Breed | वंश |
| `thread.quick-fact.age` | Age | वय |
| `thread.quick-fact.weight` | Weight ({month}) | वजन ({महिना}) |
| `thread.quick-fact.chronic` | Chronic | दीर्घकालीन |
| `thread.quick-fact.last-visit` | Last visit | शेवटची भेट |
| `thread.quick-fact.value.no-chronic` | None on file | नोंदणीकृत नाही. |
| `thread.quick-fact.value.no-visits` | No visits yet | अद्याप भेट नाही. |
| `thread.followup.lead.open` | Dr Sagar is here for {pet_name} until {close_date} | डॉ. सागर {close_date} पर्यंत {pet_name} साठी इथे आहेत. |
| `thread.followup.lead.closing-soon` | {pet_name}'s follow-up window closes in {n} days | {pet_name} च्या फॉलो-अपची विंडो {n} दिवसात बंद होईल. |
| `thread.followup.lead.unreplied` | {pet_name}'s window is open. {n} waiting on you | {pet_name} ची विंडो उघडी आहे. {n} तुमची वाट पाहत आहे. |
| `thread.followup.meta` | Opened {open_date} after {visit_reason}. Closes {close_date}. | {visit_reason} नंतर {open_date} उघडले. {close_date} बंद करते. |
| `thread.followup.lead.closed` | Follow-up window closed {close_date} | फॉलो-अप विंडो बंद झाली {close_date} |
| `thread.compose.placeholder` | Reply… | उत्तर द्या... |
| `thread.compose.mic-tooltip.idle` | Use voice | आवाज वापरा |
| `thread.compose.mic-tooltip.listening` | Listening… (tap to stop) | ऐकत आहे... (थांबवण्यासाठी टॅप करा) |
| `thread.compose.send` | Send | पाठवा |
| `thread.bubble.stamp.vet` | Dr Sagar · {date}, {time} | डॉ. सागर · {दिनांक}, {वेळ} |
| `thread.bubble.stamp.parent` | {date}, {time} | {दिनांक}, {वेळ} |
| `thread.bubble.stamp.today` | Today, {time} | आज, {वेळ} |

---

## 4. Screen 04 — Itemised invoice

| Key | EN | MR (Sarvam first-pass) |
|---|---|---|
| `invoice.back-affordance` | Back to thread with {household} | {household} असलेल्या थ्रेडवर परत जा |
| `invoice.letterhead.clinic-name` | Animal Medical Services | _(no translation; Latin-locked identity)_ |
| `invoice.letterhead.meta` | Pune · GSTIN {gstin} | पुणे · जीएसटीआयएन {gstin} |
| `invoice.number-prefix` | Invoice {number} | देयक {क्रमांक} |
| `invoice.date-prefix` | Issued {date} | जारी केले {दिनांक} |
| `invoice.category.examination` | Examination | तपासणी |
| `invoice.category.medication` | Medication | औषधोपचार |
| `invoice.category.procedure` | Procedure | प्रक्रिया |
| `invoice.totals.grand-label` | Total | एकूण |
| `invoice.totals.gst-note` | GST included | जीएसटी समाविष्ट आहे |
| `invoice.tooltip.consultation` | This is for Dr Sagar's time with {pet_name}. | हे डॉ. सागरच्या {pet_name} सोबतच्या वेळेसाठी आहे. |
| `invoice.tooltip.otoscope` | Visual examination of {pet_name}'s ear canal. | {pet_name} च्या कानाच्या नलिकेची दृश्य तपासणी. |
| `invoice.tooltip.cytology-ear` | Lab test on a sample from {pet_name}'s ear to identify what's causing the infection. | संसर्ग कशामुळे झाला हे ओळखण्यासाठी {pet_name} च्या कानातील नमुन्याची प्रयोगशाळेत तपासणी केली जात आहे. |
| `invoice.tooltip.cytology-skin` | Lab test on a skin sample to identify what's causing the irritation. | त्वचेच्या नमुन्यावर प्रयोगशाळेत चाचणी करून त्वचेला काय त्रास होत आहे ते ओळखणे. |
| `invoice.tooltip.fecal-exam` | Lab test on a stool sample to check for parasites or digestive issues. | परजीवी किंवा पचनाच्या समस्या तपासण्यासाठी विष्ठेच्या नमुन्याची प्रयोगशाळेत चाचणी. |
| `invoice.tooltip.blood-cbc` | Lab test that checks {pet_name}'s red cells, white cells, and platelets. | {pet_name}च्या लाल रक्तपेशी, पांढऱ्या रक्तपेशी आणि प्लेटलेट्स तपासणारी प्रयोगशाळेची चाचणी. |
| `invoice.tooltip.x-ray` | An image to look inside {pet_name} for fractures, foreign objects, or organ shape. | फ्रॅक्चर, परदेशी वस्तू किंवा अवयवाचा आकार पाहण्यासाठी {pet_name} च्या आत पाहण्यासाठी एक प्रतिमा. |
| `invoice.tooltip.dental-cleaning` | Scaling and polishing of {pet_name}'s teeth under sedation. | {pet_name} च्या दातांचे भूल देऊन स्केलिंग आणि पॉलिशिंग केले जात आहे. |
| `invoice.tooltip.suture-removal` | Stitches taken out after {pet_name} healed from a previous procedure. | {pet_name} मागील प्रक्रियेतून बरी झाल्यावर काढलेले टाके. |
| `invoice.tooltip.ear-flush` | Cleaning out {pet_name}'s ear canal so medication can reach the infection. | {pet_name} च्या कानाच्या नळिकेची स्वच्छता करत आहे जेणेकरून औषध संसर्गापर्यंत पोहोचेल. |

---

## 5. Screen 05 — Clinical history full screen

| Key | EN | MR (Sarvam first-pass) |
|---|---|---|
| `clinical.back-affordance` | Back to thread with {household} | {household} असलेल्या थ्रेडवर परत जा |
| `clinical.page.title` | {pet_name} · clinical history | {pet_name} · वैद्यकीय इतिहास |
| `clinical.page.sub` | {count} visits on file. Most recent first. | {count} भेटी नोंदवल्या आहेत. सर्वात नवीन प्रथम. |
| `clinical.year-marker` | {year} | _(no translation; Placeholder only)_ |
| `clinical.empty` | No clinical records yet. | अद्याप कोणतेही क्लिनिकल रेकॉर्ड्स नाहीत. |
| `clinical.vet-byline` | Dr Sagar Bhongale · Animal Medical Services | डॉ. सागर भोंगले · पशुवैद्यकीय सेवा |
| `clinical.soap.subjective` | Subjective | विषयनिष्ठ |
| `clinical.soap.objective` | Objective | उद्देश्य |
| `clinical.soap.assessment` | Assessment | मूल्यांकन |
| `clinical.soap.plan` | Plan | योजना |

---

## 6. Screen 06 — Broadcast composer (compose step)

| Key | EN | MR (Sarvam first-pass) |
|---|---|---|
| `broadcast.step-nav.1` | Compose | रचना करा |
| `broadcast.step-nav.2` | Audience | प्रेक्षक |
| `broadcast.step-nav.3` | Send | पाठवा |
| `compose.eyebrow.draft` | Draft · {title_or_untitled} | ड्राफ्ट · {title_or_untitled} |
| `compose.eyebrow.untitled` | Untitled broadcast | शीर्षक नसलेले प्रसारण |
| `compose.field.cover.label` | Cover image (optional) | मुखपृष्ठ प्रतिमा (ऐच्छिक) |
| `compose.field.cover.placeholder` | Drag in a photo, or skip | फोटोमध्ये ओढा, किंवा वगळा. |
| `compose.field.url-slug.label` | Public URL | सार्वजनिक URL |
| `compose.field.url-slug.template` | pawkit.app/broadcasts/{slug} | pawkit.app/broadcasts/{slug} |
| `compose.field.url-slug.copy` | Copy | नक्कल करा |
| `compose.field.url-slug.meta` | Live once you send. Edit slug while drafting. | एकदा पाठवल्यावर लाईव्ह करा. मसुदा तयार करताना स्लग संपादित करा. |
| `compose.field.language.label` | Composing in | रचना करत आहे. |
| `compose.field.language.en` | English | इंग्रजी |
| `compose.field.language.mr` | मराठी | _(no translation; Already Devanagari)_ |
| `compose.field.language.helper` | Both languages publish together. Other language fills in via Sarvam Translate, you review before send. | दोन्ही भाषा एकत्र प्रकाशित होतात. इतर भाषा सर्वम ट्रान्सलेटद्वारे भरल्या जातात, तुम्ही पाठवण्यापूर्वी पुनरावलोकन करता. |
| `compose.field.title.label` | Title | शीर्षक |
| `compose.field.title.placeholder` | What's this about? | हे कशाबद्दल आहे? |
| `compose.field.summary.label` | Summary | सारांश |
| `compose.field.summary.placeholder` | One short line per key point | प्रत्येक की पॉइंटसाठी एक लहान ओळ |
| `compose.field.body.label` | Body | शरीर |
| `compose.field.body.placeholder` | The longer version. Plain language, grade 5 reading level for parents. | लांब आवृत्ती. पालकांसाठी सोपी भाषा, इयत्ता 5 वी च्या वाचन स्तरावर. |
| `compose.field.warning.label` | Warning signs | इशारा देणारी चिन्हे |
| `compose.field.warning.placeholder` | Symptoms that mean parents should act fast | लक्षणे ज्यांचा अर्थ पालकांनी त्वरित कृती करावी. |
| `compose.field.escalation.label` | When to call us | आम्हाला कधी कॉल करावा |
| `compose.field.escalation.placeholder` | Clinic number, hours, and what counts as urgent | क्लिनिक क्रमांक, तास आणि तातडीचे काय मानले जाते. |
| `compose.mic.idle.tooltip` | Use voice | आवाज वापरा |
| `compose.mic.listening.tooltip` | Listening… (tap to stop) | ऐकत आहे... (थांबवण्यासाठी टॅप करा) |
| `compose.preview.label` | Parent view | पालक दृश्य |
| `compose.draft-saved.idle` | Draft saved | ड्राफ्ट जतन केला. |
| `compose.draft-saved.saving` | Saving… | सेव्ह करत आहे... |
| `compose.cta.next` | Next: Audience → | पुढील: प्रेक्षक → |

---

## 7. Screen 06b — Broadcast audience

| Key | EN | MR (Sarvam first-pass) |
|---|---|---|
| `audience.eyebrow` | Broadcast · {title} | प्रसारण · {शीर्षक} |
| `audience.eyebrow.edit-link` | Edit | संपादित करा |
| `audience.page.title` | Who's this for? | हे कोणासाठी आहे? |
| `audience.page.sub` | Pick which parents see this. Live count updates as you add conditions. | हे कोणती पालक पाहतात ते निवडा. तुम्ही अटी जोडता तसे लाईव्ह काउंट अपडेट्स मिळवा. |
| `audience.group.header` | Condition group A | अट गट अ |
| `audience.group.add-condition` | + Add condition | + अट जोडा |
| `audience.group.add-or-group` | + Add OR group | + OR गट जोडा |
| `audience.property.species` | Species | प्रजाती |
| `audience.value.species.dogs` | Dogs | कुत्रे |
| `audience.value.species.cats` | Cats | मांजरी |
| `audience.value.species.both` | Dogs and cats | कुत्रे आणि मांजरी |
| `audience.property.age` | Age range | वयोगट |
| `audience.value.age.from-label` | from | मधून |
| `audience.value.age.to-label` | to | ला |
| `audience.value.age.unit` | years | वर्षे |
| `audience.property.deceased` | Deceased pets | मृत पाळीव प्राणी |
| `audience.value.deceased.include` | Include | समावेश करा |
| `audience.value.deceased.exclude` | Exclude | वगडा करा |
| `audience.operator.is` | is | आहे. |
| `audience.operator.is-not` | is not | नाही आहे. |
| `audience.operator.between` | between | मध्ये |
| `audience.connector.and` | AND | आणि |
| `audience.connector.or` | OR | किंवा |
| `audience.count.template` | {pets} pets · {households} households · {pct}% of AMS pet parents | {पाळीव प्राणी} पाळीव प्राणी · {कुटुंब} कुटुंबे · {टक्केवारी}% AMS पाळीव प्राणी पालक |
| `audience.count.empty` | No parents match these filters. Loosen a condition. | या फिल्टरसाठी कोणतेही पालक जुळत नाहीत. अट शिथिल करा. |
| `audience.cta.back` | ← Back to Compose | ← कंपोझवर परत जा |
| `audience.cta.next` | Next: Send → | पुढील: पाठवा → |

---

## 8. Screen 06c — Broadcast send (final review)

| Key | EN | MR (Sarvam first-pass) |
|---|---|---|
| `send.eyebrow` | Broadcast ready · {title} | प्रसारणासाठी सज्ज · {title} |
| `send.eyebrow.edit-link` | Edit | संपादित करा |
| `send.page.title` | One last look | एक शेवटची नजर |
| `send.page.sub` | Check what parents will read on the left. Check who's getting it on the right. Send has a 15-second undo. | आई काय वाचेल ते डावीकडे तपासा. कोणाला मिळत आहे ते उजवीकडे तपासा. पाठवण्यामध्ये 15 सेकंदांचा पूर्ववत करण्याचा पर्याय आहे. |
| `send.preview.label` | Parent view | पालक दृश्य |
| `send.hero.label` | Sending to | पाठवत आहे |
| `send.hero.count-template` | {pets} pets | {पाळीव प्राणी} पाळीव प्राणी |
| `send.hero.meta-template` | across {households} households · {pct}% of AMS pet parents | {घरांमध्ये} कुटुंबे · {टक्केवारी}% AMS पाळीव प्राण्यांचे पालक |
| `send.filter.section-label` | Audience filter | प्रेक्षक फिल्टर |
| `send.filter.row.species` | Species | प्रजाती |
| `send.filter.row.age` | Age range | वयोगट |
| `send.filter.row.deceased` | Deceased pets | मृत पाळीव प्राणी |
| `send.filter.value.dogs-only` | Dogs only | फक्त कुत्रे |
| `send.filter.value.cats-only` | Cats only | फक्त मांजरी |
| `send.filter.value.dogs-and-cats` | Dogs and cats | कुत्रे आणि मांजरी |
| `send.filter.value.age-range-template` | {from} to {to} years | {पासून} ते {पर्यंत} वर्षे |
| `send.filter.value.deceased-included` | Included | समाविष्ट |
| `send.filter.value.deceased-excluded` | Excluded | वगळलेले |
| `send.delivery.section-label` | Delivery | वितरण |
| `send.delivery.in-app.line` | Appears in each parent's Broadcasts tab | प्रत्येक पालकांच्या ब्रॉडकास्ट टॅबमध्ये दिसते. |
| `send.delivery.in-app.meta` | in-app · instant | इन-ॲप · इन्स्टंट |
| `send.delivery.push.line` | Push notification fires on each parent's phone | प्रत्येक पालकांच्या फोनवर पुश नोटिफिकेशन पाठवले जाते. |
| `send.delivery.push.meta` | mobile · instant | मोबाईल · त्वरित |
| `send.delivery.web.line` | Public web page goes live | सार्वजनिक वेबपेज लाईव्ह झाले. |
| `send.delivery.web.meta` | pawkit.app/broadcasts/{slug} | pawkit.app/broadcasts/{slug} |
| `send.undo.hint` | Send has a 15-second undo window | पाठवण्यासाठी 15 सेकंदांची पूर्ववत करण्याची विंडो आहे. |
| `send.cta.back` | ← Back to Audience | ← श्रोत्यांकडे परत जा |
| `send.cta.send` | Send to {pets} parents | {pets} च्या पालकांना पाठवा. |
| `send.cta.send-fallback` | Send broadcast | प्रसारण पाठवा |

---

## 9. Screen 07b — Settings

| Key | EN | MR (Sarvam first-pass) |
|---|---|---|
| `settings.page.title` | Settings | सेटिंग्ज |
| `settings.page.sub` | Your profile, account, and clinic details. | तुमची प्रोफाइल, खाते आणि दवाखान्याची माहिती. |
| `settings.section.profile` | Profile | प्रोफाइल |
| `settings.section.account` | Account | खाते |
| `settings.section.clinic` | Clinic | क्लिनिक |
| `settings.profile.photo.label` | Profile photo | प्रोफाइल फोटो |
| `settings.profile.photo.help` | Appears in your byline on every Broadcast and inbox reply. | प्रत्येक ब्रॉडकास्ट आणि इनबॉक्स रिप्लायवर तुमच्या बायलाइनमध्ये दिसते. |
| `settings.profile.photo.cta-empty` | Upload | अपलोड करा |
| `settings.profile.photo.cta-filled` | Replace | बदलणे |
| `settings.profile.full-name.label` | Full name | संपूर्ण नाव |
| `settings.profile.vet-license.label` | Vet license | पशुवैद्यकीय परवाना |
| `settings.profile.email.label` | Email | ईमेल |
| `settings.profile.email.placeholder` | Not added | जोडलेले नाही |
| `settings.field.edit-pill` | Edit | संपादित करा |
| `settings.field.add-pill` | Add | जोडा |
| `settings.account.phone.label` | Phone | फोन |
| `settings.account.language.label` | Dashboard language | डॅशबोर्ड भाषा |
| `settings.account.language.toggle.en` | English | इंग्रजी |
| `settings.account.language.toggle.mr` | मराठी | _(no translation; Already Devanagari)_ |
| `settings.account.language.helper` | Changes labels and buttons in your dashboard. Broadcasts always ship to parents in both languages. | तुमच्या डॅशबोर्डमधील लेबल्स आणि बटणे बदला. ब्रॉडकास्ट नेहमी दोन्ही भाषांमधील पालकांना पाठवले जातात. |
| `settings.clinic.name` | Animal Medical Services | _(no translation; Latin-locked identity)_ |
| `settings.clinic.address-line-1` | Karve Road, Kothrud, Pune 411038 | करवे रोड, कोथरूड, पुणे 411 038 |
| `settings.clinic.address-line-2` | Maharashtra, India | महाराष्ट्र, भारत |
| `settings.clinic.gstin-template` | GSTIN {gstin} | _(no translation; GSTIN format template, regulatory acronym)_ |
| `settings.clinic.hours` | Open 9am to 9pm, Mon to Sat | सकाळी 9 ते रात्री 9 पर्यंत, सोमवार ते शनिवार उघडे |
| `settings.signout.button` | Sign out | साइन आउट करा |
| `settings.vendor.brand` | Pawkit | _(no translation; Latin-locked identity)_ |
| `settings.vendor.version` | v0.1 | _(no translation; Latin-locked identity)_ |

---

## 10. System messages (cross-cutting)

| Key | EN | MR (Sarvam first-pass) |
|---|---|---|
| `empty.admin-inbox` | No open windows right now. Take a breath. | सध्या कोणतीही खिडकी उघडी नाही. श्वास घे. |
| `empty.admin-broadcasts-list` | No broadcasts yet. Tap **New broadcast** to start one. | अद्याप कोणतेही प्रसारण नाही. सुरू करण्यासाठी **नवीन प्रसारण** वर टॅप करा. |
| `empty.admin-drafts` | No drafts. Anything you start saves here. | कोणतेही मसुदे नाहीत. तुम्ही जे काही सुरू करता ते येथे जतन होते. |
| `voice.mic-blocked.caption` | Mic blocked in browser settings. | ब्राउझर सेटिंग्जमध्ये माईक ब्लॉक केले. |
| `voice.network-failure.toast` | Voice transcription is offline. Try typing instead. | व्हॉइस ट्रांसक्रिप्शन ऑफलाइन आहे. त्याऐवजी टाइप करण्याचा प्रयत्न करा. |
| `voice.low-confidence.caption` | Tap to confirm or retype. | पुष्टी करण्यासाठी किंवा पुन्हा टाइप करण्यासाठी टॅप करा. |
| `voice.silence.caption` | Didn't catch anything. Try again. | काहीच पकडले नाही. पुन्हा प्रयत्न करा. |
| `signout.dialog.title` | Sign out of AMS dashboard? | एएमएस डॅशबोर्डमधून साइन आउट करायचे आहे? |
| `signout.dialog.body` | You'll need your phone to sign back in. Any unsaved draft stays here. | परत साइन इन करण्यासाठी तुम्हाला तुमचा फोन लागेल. कोणताही सेव्ह न केलेला ड्राफ्ट इथेच राहील. |
| `signout.dialog.cancel` | Stay signed in | साइन इन केलेले रहा |
| `signout.dialog.confirm` | Sign out | साइन आउट करा |
| `publish.toast.success` | Your broadcast is on its way to {pets} parents. | तुमचे प्रसारण {पाळीव प्राणी} च्या पालकांकडे जात आहे. |
| `publish.toast.undo-window` | Sending in {n}s. Tap to undo. | {n} पाठवत आहे. पूर्ववत करण्यासाठी टॅप करा. |
| `publish.toast.undone` | Send cancelled. Draft kept. | रद्द केले. मसुदा ठेवला. |
| `publish.toast.failed` | Send didn't go through. Tap to retry. | पाठवणे झाले नाही. पुन्हा प्रयत्न करण्यासाठी टॅप करा. |
| `error.inline.required` | This one's needed before you can send. | तुम्ही पाठवू शकाल त्याआधी हे आवश्यक आहे. |
| `error.inline.bad-email` | That email doesn't look right. | तो ईमेल बरोबर दिसत नाही. |
| `error.inline.bad-license` | That license number doesn't look right. | तो परवाना क्रमांक बरोबर दिसत नाही. |
| `error.banner.broadcast-send` | Send failed. We can try again or save the draft. | पाठवणे अयशस्वी झाले. आपण पुन्हा प्रयत्न करू शकतो किंवा मसुदा जतन करू शकतो. |
| `error.banner.broadcast-send.retry-link` | Try again | पुन्हा प्रयत्न कर. |
| `error.banner.broadcast-send.save-draft-link` | Save as draft | ड्राफ्ट म्हणून जतन करा |
| `error.toast.photo-upload` | Couldn't upload that photo. Try again? | तो फोटो अपलोड करता आला नाही. पुन्हा प्रयत्न करायचा? |
| `error.toast.draft-save` | Couldn't save draft. Working offline? | ड्राफ्ट सेव्ह करता आले नाही. ऑफलाइन काम करत आहात? |
| `offline.banner` | You're offline. Drafts save locally. | तुम्ही ऑफलाइन आहात. मसुदे स्थानिक पातळीवर जतन केले जातात. |
| `offline.recovered.toast` | Back online. Sending queued drafts. | परत ऑनलाइन. रांगेत असलेले ड्राफ्ट पाठवत आहे. |
| `stale.data.caption` | Updated {n}m ago | {n} मिनिटांपूर्वी सुधारित |
| `stale.data.caption.refresh-link` | refresh | ताजेतवाने करा |
| `permission.mic.prompt` | Pawkit needs mic permission to transcribe your voice. | तुमचा आवाज लिप्यंतरित करण्यासाठी पॉकीटला माईक परवानगीची आवश्यकता आहे. |
| `permission.mic.cta-allow` | Allow | परवानगी द्या. |
| `permission.mic.cta-skip` | Skip, I'll type | सोडा, मी टाइप करते. |
| `memorial.pet-panel.header` | In memory of {pet_name} ({year_birth}–{year_death}) | {pet_name} ({जन्मवर्ष}–{मृत्यूवर्ष}) यांच्या स्मरणार्थ |
| `memorial.clinical.banner` | {pet_name} passed {date_death}. Records preserved. | {pet_name} यांचे {date_death} रोजी निधन झाले. नोंदी जतन केल्या आहेत. |

