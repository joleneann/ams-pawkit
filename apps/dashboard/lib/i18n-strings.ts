/**
 * EN + MR string pairs for the visible dashboard chrome + Settings surfaces.
 * MR strings sourced from `microcopy/admin-mr.md` (Sarvam Translate first-pass,
 * 2026-05-12) — tagged review pending for the Pune-native-speaker pass.
 *
 * Scope: chrome (header + rail) + Settings page + Inbox subtab labels.
 * Per-broadcast bilingual content (compose/audience/send) is independent
 * (it ships in both languages regardless of the dashboard chrome language;
 * locked in decisions-log).
 */

export type Lang = "en" | "mr";

type Pair = { en: string; mr: string };

export const i18n: Record<string, Pair> = {
  // --- Chrome ---
  "chrome.workspace": { en: "Workspace", mr: "कार्यालय" },
  "chrome.rail.inbox": { en: "Inbox", mr: "इनबॉक्स" },
  "chrome.rail.broadcasts": { en: "Broadcasts", mr: "प्रसारण" },
  "chrome.rail.billing": { en: "Billing", mr: "बिलिंग" },
  "chrome.rail.settings": { en: "Settings", mr: "सेटिंग्ज" },
  "chrome.search.inbox": {
    en: "Search pets, parents, phone numbers",
    mr: "पाळीव प्राणी, पालक, फोन नंबर शोधा",
  },
  "chrome.search.broadcasts": {
    en: "Search broadcasts by keyword",
    mr: "कीवर्डनुसार प्रसारण शोधा",
  },
  "chrome.search.billing": {
    en: "Search invoices by pet or household",
    mr: "पाळीव प्राणी किंवा कुटुंबानुसार इनव्हॉइस शोधा",
  },

  // --- Inbox list ---
  "inbox.subtab.active": { en: "Awaiting reply", mr: "उत्तराच्या प्रतीक्षेत" },
  "inbox.subtab.inactive": { en: "Replied", mr: "उत्तर दिले" },
  "inbox.empty": {
    en: "Nothing awaiting reply.",
    mr: "उत्तराच्या प्रतीक्षेत काहीही नाही.",
  },
  "inbox.household.suffix": { en: "household", mr: "कुटुंब" },
  "inbox.backToThreadWith": {
    en: "Back to thread with",
    mr: "थ्रेडकडे परत:",
  },
  "inbox.you.prefix": { en: "You:", mr: "तुम्ही:" },

  // --- Broadcasts list ---
  "broadcasts.list.new": { en: "New broadcast", mr: "नवीन प्रसारण" },
  "broadcasts.list.parents": { en: "parents", mr: "पालक" },
  "broadcasts.list.empty": {
    en: "No broadcasts yet.",
    mr: "अद्याप कोणतेही प्रसारण नाही.",
  },
  "broadcasts.list.emptyHint.tap": { en: "Tap", mr: "टॅप करा" },
  "broadcasts.list.emptyHint.toStart": { en: "to start one.", mr: "एक सुरू करण्यासाठी." },
  "broadcasts.list.searchEmpty": {
    en: "Try a different search.",
    mr: "वेगळी शोध वापरून पहा.",
  },
  "broadcasts.list.matchSingular": { en: "broadcast matching", mr: "प्रसारण जुळणारे" },
  "broadcasts.list.matchPlural": { en: "broadcasts matching", mr: "प्रसारणे जुळणारी" },
  "broadcasts.list.tab.sent": { en: "Sent", mr: "पाठवले" },
  "broadcasts.list.tab.drafts": { en: "Drafts", mr: "मसुदे" },
  "broadcasts.list.drafts.empty": {
    en: "No drafts yet. Start a new broadcast above.",
    mr: "अद्याप मसुदे नाहीत. वर एक नवीन प्रसारण सुरू करा.",
  },

  // --- Billing landing ---
  "billing.picker.prefix": { en: "Showing", mr: "दाखवत आहे" },
  "billing.picker.scope.allTime": { en: "All time", mr: "नेहमी" },
  "billing.picker.range.from": { en: "From", mr: "पासून" },
  "billing.picker.range.to": { en: "To", mr: "पर्यंत" },
  "billing.picker.range.apply": { en: "Apply", mr: "लागू करा" },
  "billing.picker.scope.custom": { en: "Custom range", mr: "सानुकूल श्रेणी" },
  "billing.picker.preset.thisMonth": { en: "This month", mr: "या महिन्यात" },
  "billing.picker.preset.custom": { en: "Custom", mr: "सानुकूल" },
  "billing.picker.preset.allTime": { en: "All time", mr: "नेहमी" },
  "billing.kpi.billed.thisMonth": { en: "Billed · this month", mr: "बिल केलेले · या महिन्यात" },
  "billing.kpi.billed.allTime": { en: "Billed · all time", mr: "बिल केलेले · नेहमी" },
  "billing.kpi.billed.custom": { en: "Billed · custom range", mr: "बिल केलेले · सानुकूल श्रेणी" },
  "billing.kpi.billed.month": { en: "Billed · ", mr: "बिल केलेले · " },
  "billing.kpi.collected": { en: "Collected", mr: "जमा" },
  "billing.kpi.outstanding": { en: "Outstanding", mr: "थकबाकी" },
  "billing.kpi.outstanding.empty": { en: "All clear", mr: "सर्व साफ" },
  "billing.kpi.invoices": { en: "invoices", mr: "इनव्हॉइस" },
  "billing.kpi.invoice.singular": { en: "invoice", mr: "इनव्हॉइस" },
  "billing.kpi.paid": { en: "paid", mr: "भरलेले" },
  "billing.kpi.unpaid": { en: "unpaid", mr: "थकलेले" },
  "billing.ledger.title.all": { en: "All invoices", mr: "सर्व इनव्हॉइस" },
  "billing.ledger.title.paid": { en: "Paid invoices", mr: "भरलेले इनव्हॉइस" },
  "billing.ledger.title.unpaid": { en: "Unpaid invoices", mr: "थकलेले इनव्हॉइस" },
  "billing.ledger.tab.all": { en: "All", mr: "सर्व" },
  "billing.ledger.tab.unpaid": { en: "Unpaid", mr: "थकलेले" },
  "billing.ledger.tab.paid": { en: "Paid", mr: "भरलेले" },
  "billing.ledger.col.invoice": { en: "Invoice", mr: "इनव्हॉइस" },
  "billing.ledger.col.petHousehold": { en: "Pet · Household", mr: "पाळीव प्राणी · कुटुंब" },
  "billing.ledger.col.issued": { en: "Issued", mr: "जारी" },
  "billing.ledger.col.status": { en: "Status", mr: "स्थिती" },
  "billing.ledger.col.amount": { en: "Amount", mr: "रक्कम" },
  "billing.status.unpaid": { en: "Unpaid", mr: "थकलेले" },
  "billing.foot.showing": { en: "Showing", mr: "दाखवत आहे" },
  "billing.foot.of": { en: "of", mr: "मधून" },
  "billing.foot.invoices": { en: "invoices", mr: "इनव्हॉइस" },
  "billing.empty.allScope": { en: "No invoices yet.", mr: "अद्याप इनव्हॉइस नाहीत." },
  "billing.empty.allScope.sub": {
    en: "Invoices issued from a visit show up here.",
    mr: "भेटीतून जारी केलेले इनव्हॉइस इथे दिसतील.",
  },
  "billing.empty.unpaidScope": { en: "All caught up.", mr: "सगळे आटोपलेले." },
  "billing.empty.unpaidScope.sub": {
    en: "No unpaid invoices in this scope.",
    mr: "या व्याप्तीत कोणतेही थकलेले इनव्हॉइस नाहीत.",
  },
  "billing.empty.paidScope": { en: "No paid invoices yet.", mr: "अद्याप कोणतेही भरलेले इनव्हॉइस नाहीत." },
  "billing.empty.paidScope.sub": {
    en: "Nothing has been collected in this scope.",
    mr: "या व्याप्तीत काहीही जमा झालेले नाही.",
  },
  "billing.search.matchSingular": {
    en: "invoice matching",
    mr: "इनव्हॉइस जुळणारा",
  },
  "billing.search.matchPlural": {
    en: "invoices matching",
    mr: "इनव्हॉइसेस जुळणारे",
  },
  "billing.search.empty": {
    en: "No invoices match",
    mr: "कोणतेही इनव्हॉइस जुळत नाही",
  },
  "billing.detail.back": { en: "Back to Billing", mr: "बिलिंगकडे परत" },
  "billing.detail.markPaid": { en: "Mark paid", mr: "भरले म्हणून चिन्हांकित करा" },
  "billing.detail.markPaid.pending": { en: "Marking paid…", mr: "भरले म्हणून चिन्हांकित करत आहे…" },
  "billing.detail.markedPaid": { en: "Marked paid", mr: "भरले म्हणून चिन्हांकित" },

  // --- Settings page ---
  "settings.section.profile": { en: "Profile", mr: "प्रोफाइल" },
  "settings.section.account": { en: "Account", mr: "खाते" },
  "settings.section.clinic": { en: "Clinic", mr: "क्लिनिक" },
  "settings.profile.photo.label": { en: "Profile photo", mr: "प्रोफाइल फोटो" },
  "settings.profile.photo.help": {
    en: "Appears in your byline on every Broadcast and inbox reply.",
    mr: "प्रत्येक प्रसारणावर आणि इनबॉक्स उत्तरावर तुमच्या नावासह दिसते.",
  },
  "settings.profile.upload": { en: "Upload", mr: "अपलोड" },
  "settings.profile.fullname": { en: "Full name", mr: "पूर्ण नाव" },
  "settings.profile.license": { en: "Vet license", mr: "पशुवैद्यकीय परवाना" },
  "settings.profile.email": { en: "Email", mr: "ईमेल" },
  "settings.profile.email.placeholder": { en: "Not added", mr: "जोडलेले नाही" },
  "settings.account.phone": { en: "Phone", mr: "फोन" },
  "settings.clinic.logo": { en: "Clinic logo", mr: "क्लिनिकचा लोगो" },
  "settings.clinic.logo.help": {
    en: "Shows in the header next to the clinic name. Square image works best.",
    mr: "हेडरमध्ये क्लिनिकच्या नावाशेजारी दिसते. चौकोनी प्रतिमा सर्वोत्तम काम करते.",
  },
  "settings.clinic.name": { en: "Name", mr: "नाव" },
  "settings.clinic.phone": { en: "Phone", mr: "फोन" },
  "settings.clinic.gstin": { en: "GSTIN", mr: "GSTIN" },
  "settings.clinic.address": { en: "Address", mr: "पत्ता" },
  "settings.clinic.hours": {
    en: "Open 9am to 9pm, Mon to Sat",
    mr: "सकाळी 9 ते रात्री 9, सोम ते शनि",
  },
  "settings.account.language": {
    en: "Dashboard language",
    mr: "डॅशबोर्ड भाषा",
  },
  "settings.account.language.helper": {
    en: "Changes labels and buttons in your dashboard. Broadcasts always ship to parents in both languages.",
    mr: "तुमच्या डॅशबोर्डमधील लेबले आणि बटणे बदलते. प्रसारण नेहमी पालकांना दोन्ही भाषांमध्ये पाठवले जाते.",
  },
  "settings.signout": { en: "Sign out", mr: "साइन आउट" },
  "settings.field.edit": { en: "Edit", mr: "सुधारणे" },
  "settings.field.add": { en: "Add", mr: "जोडा" },

  // --- Pill labels ---
  "lang.en": { en: "English", mr: "English" }, // language name in own script
  "lang.mr": { en: "मराठी", mr: "मराठी" },

  // --- Inbox thread detail ---
  "thread.breadcrumb.inbox": { en: "Inbox", mr: "इनबॉक्स" },
  "thread.banner.heading": {
    en: "Dr Sagar is here for {pet} until {date}",
    mr: "डॉ. सागर {date} पर्यंत {pet} साठी उपलब्ध आहेत",
  },
  "thread.banner.openedAfter": {
    en: "Opened {date} after the visit.",
    mr: "भेटीनंतर {date} रोजी उघडले.",
  },
  "thread.compose.placeholder": { en: "Reply...", mr: "उत्तर..." },
  "thread.compose.send": { en: "Send", mr: "पाठवा" },
  "thread.compose.sending": { en: "Sending...", mr: "पाठवत आहे..." },

  // --- Pet panel Quick Facts ---
  "petpanel.quickfacts": { en: "Quick Facts", mr: "त्वरित माहिती" },
  "petpanel.weight": { en: "Weight", mr: "वजन" },
  "petpanel.lastvisit": { en: "Last visit", mr: "अलीकडील भेट" },
  "petpanel.chronic": { en: "CHRONIC", mr: "दीर्घकालीन" },
  "petpanel.tab.clinical": { en: "Clinical history", mr: "क्लिनिकल इतिहास" },
  "petpanel.tab.invoices": { en: "Invoices", mr: "बिले" },
  "petpanel.empty": {
    en: "No clinical history on record.",
    mr: "क्लिनिकल इतिहास नोंदलेला नाही.",
  },

  // --- Clinical SOAP labels ---
  "clinical.heading.suffix": { en: "Clinical history", mr: "क्लिनिकल इतिहास" },
  "clinical.soap.s": { en: "Subjective", mr: "व्यक्तिनिष्ठ" },
  "clinical.soap.o": { en: "Objective", mr: "वस्तुनिष्ठ" },
  "clinical.soap.a": { en: "Assessment", mr: "मूल्यांकन" },
  "clinical.soap.p": { en: "Plan", mr: "उपचार योजना" },
  "clinical.earlier": { en: "Earlier visits (compact)", mr: "मागील भेटी (संक्षिप्त)" },

  // --- Invoice labels ---
  "invoice.heading.invoice": { en: "Invoice", mr: "बिल" },
  "invoice.heading.issued": { en: "Issued", mr: "जारी" },
  "invoice.total": { en: "Total", mr: "एकूण" },
  "invoice.gstincluded": { en: "GST included", mr: "जीएसटी समाविष्ट" },

  // --- Broadcast compose ---
  "broadcast.field.title": { en: "Title", mr: "शीर्षक" },
  "broadcast.field.summary": { en: "Summary", mr: "सारांश" },
  "broadcast.field.body": { en: "Body", mr: "मजकूर" },
  "broadcast.field.warnings": { en: "Warning signs", mr: "धोक्याची चिन्हे" },
  "broadcast.field.escalation": { en: "When to call us", mr: "आम्हाला कधी कॉल करावा" },
  "broadcast.composing.in": { en: "Composing in:", mr: "यामध्ये लिहित आहे:" },
  "broadcast.translate.to.mr": { en: "Translate to मराठी", mr: "मराठीमध्ये भाषांतर करा" },
  "broadcast.translate.to.en": { en: "Translate to English", mr: "इंग्रजीमध्ये भाषांतर करा" },
  "broadcast.translate.pending": { en: "Translating...", mr: "भाषांतर करत आहे..." },
  "broadcast.next.audience": { en: "Next: Audience", mr: "पुढे: प्रेक्षक" },
  "broadcast.next.send": { en: "Next: Send", mr: "पुढे: पाठवा" },
  "broadcast.back.compose": { en: "← Back to Compose", mr: "← लिहिण्याकडे परत" },
  "broadcast.back.audience": { en: "← Back to Audience", mr: "← प्रेक्षकाकडे परत" },
  "broadcast.audience.title": { en: "Who's this for?", mr: "हे कोणासाठी आहे?" },
  "broadcast.audience.subtitle": {
    en: "Pick which parents see this. Live count updates as you change conditions.",
    mr: "कोणत्या पालकांना हे दिसेल ते निवडा. अटी बदलल्यावर थेट संख्या अपडेट होते.",
  },
  "broadcast.audience.size": { en: "Audience size", mr: "प्रेक्षक संख्या" },
  "broadcast.audience.pets": { en: "pets", mr: "पाळीव प्राणी" },
  "broadcast.audience.across": { en: "across", mr: "ओलांडून" },
  "broadcast.audience.households": { en: "households", mr: "कुटुंबे" },
  "broadcast.send.heading": { en: "One last look", mr: "एक शेवटची नजर" },
  "broadcast.send.subheading": {
    en: "Check what parents will read on the left. Check who's getting it on the right. Send has a 15-second undo.",
    mr: "पालक डावीकडे काय वाचतील ते तपासा. कोण ते उजवीकडे मिळवेल ते तपासा. पाठवण्यास 15-सेकंदाचे पूर्ववत आहे.",
  },
  "broadcast.send.sentHeading": { en: "Sent.", mr: "पाठवले." },
  "broadcast.send.undo": { en: "Undo", mr: "पूर्ववत" },
  "broadcast.send.pendingIn": { en: "Sending in", mr: "पाठवत आहे" },
  "broadcast.send.canUndo": { en: "You can still undo.", mr: "तुम्ही अजूनही पूर्ववत करू शकता." },

  // --- Single-page composer rebuild 2026-05-15 ---
  // Keys ready for the t() polish pass; composer components currently inline
  // English. Marathi translations sanity-checked but pending Sarvam Translate
  // pass for fluency review.
  "composer.new": { en: "New broadcast", mr: "नवीन प्रसारण" },
  "composer.autosaved.now": { en: "Autosaved just now", mr: "नुकतेच स्वयंसेव्ह केले" },
  "composer.preview.as.parent": { en: "Preview as parent", mr: "पालक म्हणून पूर्वावलोकन" },
  "composer.save.draft": { en: "Save draft", mr: "मसुदा जतन करा" },
  "composer.audience.all": { en: "All AMS parents", mr: "सर्व AMS पालक" },
  "composer.audience.custom": { en: "Custom...", mr: "सानुकूल..." },
  "composer.audience.edit": { en: "Edit filters", mr: "फिल्टर संपादित करा" },
  "composer.audience.sampleLabel": { en: "Sample", mr: "नमुना" },
  "composer.toolbar.writingIn": { en: "Writing in", mr: "यामध्ये लिहित" },
  "composer.toolbar.autofill.after": { en: "Auto-fill मराठी after sending", mr: "पाठवल्यानंतर मराठी आपोआप भरा" },
  "composer.toolbar.autofill.now": { en: "Auto-fill {lang} now", mr: "आत्ता {lang} भरा" },
  "composer.add.summary": { en: "Summary bullets", mr: "सारांश बुलेट्स" },
  "composer.add.warning": { en: "Warning signs", mr: "धोक्याची चिन्हे" },
  "composer.add.whenToCall": { en: "When to call us", mr: "आम्हाला कधी कॉल करावा" },
  "composer.add.cover": { en: "Cover photo", mr: "मुखपृष्ठ छायाचित्र" },
  "composer.section.remove": { en: "Remove section", mr: "विभाग काढून टाका" },
  "composer.section.addBullet": { en: "Add bullet", mr: "बुलेट जोडा" },
  "composer.cover.add": { en: "Add a cover photo", mr: "मुखपृष्ठ छायाचित्र जोडा" },
  "composer.cover.hint": {
    en: "16:5 ratio, JPG or PNG, up to 8 MB",
    mr: "16:5 गुणोत्तर, JPG किंवा PNG, 8 MB पर्यंत",
  },
  "composer.cover.uploading": { en: "Uploading cover...", mr: "मुखपृष्ठ अपलोड करत आहे..." },
  "composer.cover.replace": { en: "Replace", mr: "बदला" },
  "composer.cover.remove": { en: "Remove", mr: "काढून टाका" },
  "composer.footer.ready": { en: "Ready to send", mr: "पाठवण्यासाठी तयार" },
  "composer.footer.send": { en: "Send broadcast", mr: "प्रसारण पाठवा" },
  "composer.footer.preview": { en: "Preview", mr: "पूर्वावलोकन" },

  // Audience modal
  "audModal.title": { en: "Who's this for?", mr: "हे कोणासाठी आहे?" },
  "audModal.subtitle": {
    en: "Narrow this broadcast with conditions. Audience size updates as you change them.",
    mr: "अटींसह हे प्रसारण कमी करा. तुम्ही बदलत असताना प्रेक्षक संख्या अपडेट होते.",
  },
  "audModal.group": { en: "Condition group", mr: "अट गट" },
  "audModal.where": { en: "WHERE", mr: "जिथे" },
  "audModal.and": { en: "AND", mr: "आणि" },
  "audModal.or": { en: "OR", mr: "किंवा" },
  "audModal.addCondition": { en: "Add condition", mr: "अट जोडा" },
  "audModal.addOrGroup": { en: "Add another group", mr: "दुसरा गट जोडा" },
  "audModal.field.species": { en: "Species", mr: "प्रजाती" },
  "audModal.field.age": { en: "Age range", mr: "वयोगट" },
  "audModal.field.deceased": { en: "Deceased pets", mr: "मृत पाळीव प्राणी" },
  "audModal.field.lastVisit": { en: "Last visit", mr: "शेवटची भेट" },
  "audModal.op.is": { en: "is", mr: "आहे" },
  "audModal.op.within": { en: "within", mr: "मध्ये" },
  "audModal.species.dogs": { en: "Dogs", mr: "कुत्रे" },
  "audModal.species.cats": { en: "Cats", mr: "मांजरी" },
  "audModal.species.both": { en: "Dogs and cats", mr: "कुत्रे आणि मांजरी" },
  "audModal.deceased.include": { en: "Include", mr: "समाविष्ट करा" },
  "audModal.deceased.exclude": { en: "Exclude", mr: "वगळा" },
  "audModal.visit.3m": { en: "3 months", mr: "3 महिने" },
  "audModal.visit.12m": { en: "12 months", mr: "12 महिने" },
  "audModal.visit.24m": { en: "24 months", mr: "24 महिने" },
  "audModal.visit.any": { en: "Any", mr: "कधीही" },
  "audModal.from": { en: "from", mr: "पासून" },
  "audModal.to": { en: "to", mr: "पर्यंत" },
  "audModal.years": { en: "years", mr: "वर्षे" },
  "audModal.apply": { en: "Apply audience", mr: "प्रेक्षक लागू करा" },
  "audModal.cancel": { en: "Cancel", mr: "रद्द करा" },

  // Preview overlay
  "preview.eyebrow": { en: "Preview as parent", mr: "पालक म्हणून पूर्वावलोकन" },
  "preview.heading": {
    en: "This is what {pet}'s family will see.",
    mr: "{pet}चे कुटुंब हे पाहील.",
  },
  "preview.subtitle": {
    en: "Rendered as a push notification + broadcast detail in the Pawkit Parents app. Same in मराठी for parents with a Marathi preference.",
    mr: "Pawkit Parents अॅपमध्ये पुश सूचना + प्रसारण तपशील म्हणून प्रदर्शित. मराठी पसंत असलेल्या पालकांसाठी मराठीतच.",
  },
  "preview.channels": { en: "Channels", mr: "चॅनेल" },
  "preview.push": { en: "Push to Pawkit Parents · app", mr: "Pawkit Parents अॅपवर पुश" },
  "preview.whatsapp": { en: "WhatsApp · off for this broadcast", mr: "WhatsApp · या प्रसारणासाठी बंद" },
  "preview.close": { en: "Close preview · esc", mr: "पूर्वावलोकन बंद करा · esc" },
  "preview.replyToAms": { en: "Reply to AMS", mr: "AMS ला उत्तर द्या" },
  "preview.callHotline": { en: "Call hotline", mr: "हॉटलाइन कॉल करा" },

  // Send confirm modal (bilingual gate)
  "sendModal.title": { en: "Ready to send?", mr: "पाठवण्यासाठी तयार?" },
  "sendModal.subtitle": {
    en: "Please review both languages before you publish.",
    mr: "प्रकाशित करण्यापूर्वी कृपया दोन्ही भाषांचे पुनरावलोकन करा.",
  },
  "sendModal.viewed": { en: "Viewed in preview", mr: "पूर्वावलोकनात पाहिले" },
  "sendModal.notViewed": { en: "Not previewed", mr: "पूर्वावलोकन केले नाही" },
  "sendModal.missing": {
    en: "Missing — fill the title and body in this language before sending.",
    mr: "गहाळ — पाठवण्यापूर्वी या भाषेत शीर्षक आणि मजकूर भरा.",
  },
  "sendModal.confirm": { en: "Both look right.", mr: "दोन्ही बरोबर दिसतात." },
  "sendModal.openPreview": {
    en: "Open Preview as parent and toggle between English and मराठी before sending. Both must be viewed to publish.",
    mr: "पाठवण्यापूर्वी पालक म्हणून पूर्वावलोकन उघडा आणि English आणि मराठी दरम्यान टॉगल करा. प्रकाशित करण्यासाठी दोन्ही पाहणे आवश्यक आहे.",
  },

  // ==========================================================================
  // Voice-first broadcast composer (locked 2026-05-18 v3 rebuild).
  // MR sourced from a 4-batch Sarvam Translate pass (2026-05-18), with
  // hand-fixes where Sarvam misread "compose" as musical compose. Pune
  // native-speaker review pending per the locked Phase 3c workflow.
  // ==========================================================================

  // Voice landing — initial state
  "voice.eyebrow": { en: "NEW BROADCAST", mr: "नवीन प्रसारण" },
  "voice.headline": {
    en: "Say what you want parents to know",
    mr: "पालकांना काय सांगावे ते सांगा",
  },
  "voice.sub": {
    en: "Speak in English or Marathi, for as long as you need. Restart, change topics, take your time. You'll edit the structured draft before publishing",
    mr: "इंग्रजी किंवा मराठीमध्ये बोला, तुम्हाला हवे तितके वेळ बोला. थांबा, विषय बदला, वेळ घ्या. प्रकाशित करण्यापूर्वी तुम्ही संरचित मसुदा संपादित कराल",
  },
  "voice.cta.tap-to-start": {
    en: "Tap to start",
    mr: "सुरू करण्यासाठी टॅप करा",
  },
  "voice.cta.permission": {
    en: "Allow microphone access to continue",
    mr: "सुरू ठेवण्यासाठी मायक्रोफोन ॲक्सेसला अनुमती द्या",
  },
  "voice.header.title": { en: "New broadcast", mr: "नवीन प्रसारण" },
  // Hand-fixed: Sarvam mistranslated "Compose" as musical compose ("संगीत").
  // "स्वतः लिहा" = "write manually" — matches the action.
  "voice.header.compose-manually": {
    en: "Compose manually",
    mr: "स्वतः लिहा",
  },

  // Coach mark
  "voice.coachmark.tag": { en: "First-time tip", mr: "पहिल्या वेळेसाठी टीप" },
  "voice.coachmark.body": {
    en: "Don't worry about getting it perfect. Say something wrong? Just keep going. Pawkit organises it at the end.",
    mr: "ते परिपूर्ण करण्याबद्दल काळजी करू नका. काहीतरी चुकीचे बोललात? फक्त पुढे चालू ठेवा. पॉवकिट शेवटी ते व्यवस्थित करेल.",
  },
  "voice.coachmark.dismiss": { en: "Got it", mr: "समजले" },

  // Recording state
  "voice.recording.label": { en: "Recording", mr: "रेकॉर्डिंग" },
  "voice.recording.tap-to-stop": {
    en: "· Tap to stop",
    mr: "· थांबवण्यासाठी टॅप करा",
  },
  "voice.recording.approaching-limit": {
    en: "approaching limit",
    mr: "मर्यादेजवळ पोहोचत आहे",
  },

  // Transcribing + Structuring busy states
  "voice.transcribing.headline": {
    en: "Transcribing your recording",
    mr: "तुमच्या रेकॉर्डिंगचे लिप्यंतरण करत आहे",
  },
  "voice.transcribing.sub": {
    en: "We are converting your voice to text. Usually a few seconds.",
    mr: "आम्ही तुमचा आवाज टेक्स्टमध्ये रूपांतरित करत आहोत. सहसा काही सेकंद लागतील.",
  },
  "voice.structuring.headline": {
    en: "Structuring your broadcast",
    mr: "तुमच्या प्रसारणाची रचना करत आहोत",
  },
  "voice.structuring.sub": {
    en: "Pawkit is organising your dictation into title, body, and sections.",
    mr: "पॉवकिट तुमच्या श्रुतलेखनाला शीर्षक, मुख्य भाग आणि विभागांमध्ये व्यवस्थित करत आहे.",
  },

  // Fallback (Groq couldn't structure)
  "voice.fallback.headline": {
    en: "Couldn't auto-structure this one",
    mr: "हे स्वयंचलितपणे संरचित करता आले नाही",
  },
  "voice.fallback.sub": {
    en: "Your words are safe. We'll drop the full transcript into the body field and you can structure as you go.",
    mr: "तुमचे शब्द सुरक्षित आहेत. आम्ही संपूर्ण लिप्यंतरण मुख्य भागात टाकू आणि तुम्ही पुढे जाताना संरचित करू शकता.",
  },
  "voice.fallback.cta.continue": {
    en: "Continue with raw text",
    mr: "कच्च्या मजकुरासह पुढे चालू ठेवा",
  },
  "voice.fallback.cta.retry": {
    en: "Try recording again",
    mr: "पुन्हा रेकॉर्ड करण्याचा प्रयत्न करा",
  },
  "voice.fallback.transcript-label": {
    en: "Your transcript",
    mr: "तुमचे लिप्यंतरण",
  },

  // Error (mic permission / STT failure)
  "voice.error.headline": { en: "Couldn't record", mr: "रेकॉर्ड करता आले नाही" },
  "voice.error.sub.permission": {
    en: "Check that your browser has microphone permission for this site, then try again.",
    mr: "तुमच्या ब्राउझरमध्ये या साइटसाठी मायक्रोफोनची परवानगी आहे का ते तपासा, नंतर पुन्हा प्रयत्न करा.",
  },
  "voice.error.cta.retry": { en: "Try again", mr: "पुन्हा प्रयत्न करा" },
  "voice.error.cta.manual": {
    en: "Compose manually instead",
    mr: "त्याऐवजी स्वतः लिहा", // hand-fixed compose→music
  },

  // View original transcript dialog
  "composer.view-transcript.button": {
    en: "View original transcript",
    mr: "मूळ लिप्यंतरण पहा",
  },
  "composer.view-transcript.dialog-title": {
    en: "Your original recording",
    mr: "तुमचे मूळ रेकॉर्डिंग",
  },
  "composer.view-transcript.dialog-footer": {
    en: "Stays available for this draft on this browser. Edits above don't change the transcript.",
    mr: "हा मसुदा या ब्राउझरवर उपलब्ध राहील. वरील संपादन लिप्यंतरणात बदल करत नाही.",
  },

  // Audience modal
  "audience.modal.title": { en: "Who is this for", mr: "हे कोणासाठी आहे" },
  "audience.modal.description": {
    en: "Narrow this broadcast with conditions. Audience size updates as you change them.",
    mr: "अटींसह हे प्रसारण मर्यादित करा. तुम्ही बदल केल्यानुसार दर्शकांच्या आकारातील बदल दर्शविले जातील.",
  },
  "audience.row.species": { en: "Species", mr: "प्रजाती" },
  "audience.row.age": { en: "Age range", mr: "वयोगट" },
  "audience.row.age.all": { en: "All", mr: "सर्व" },
  "audience.row.deceased": { en: "Deceased pets", mr: "मृत पाळीव प्राणी" },
  "audience.row.lastVisit": { en: "Last visit", mr: "शेवटची भेट" },
  "audience.empty.headline": {
    en: "No audience filters. The broadcast will reach 0 parents until you add some.",
    mr: "कोणतेही दर्शक फिल्टर नाहीत. तुम्ही काही फिल्टर जोडेपर्यंत हे प्रसारण 0 पालकांपर्यंत पोहोचेल.",
  },
  "audience.empty.cta": { en: "Add filters", mr: "फिल्टर जोडा" },
  "audience.footer.clear": { en: "Clear", mr: "क्लिअर करा" },
  "audience.footer.apply": { en: "Apply audience", mr: "दर्शक लागू करा" },

  // Audience strip (in composer)
  "composer.audience.eyebrow": {
    en: "WHO IS THIS FOR",
    mr: "हे कोणासाठी आहे",
  },
  "composer.audience.sample-prefix": { en: "Sample:", mr: "नमुना:" },
  "composer.audience.select-cta": { en: "Select audience", mr: "दर्शक निवडा" },
  "composer.audience.edit-cta": {
    en: "Edit filters",
    mr: "फिल्टर संपादित करा",
  },

  // Toolbar (sticky top of composer)
  "composer.toolbar.writing-in": { en: "Writing in", mr: "लिहित आहात" },
  "composer.toolbar.mic-disabled-tooltip": {
    en: "To write with voice, click into a section",
    mr: "आवाजासह लिहिण्यासाठी, एका विभागात क्लिक करा",
  },
  "composer.toolbar.autofill-en": {
    en: "Auto-fill English now",
    mr: "आता इंग्रजी ऑटो-फिल करा",
  },
  "composer.toolbar.autofill-mr": {
    en: "Auto-fill मराठी now",
    mr: "आता मराठी ऑटो-फिल करा",
  },

  // Send footer + confirm
  "composer.footer.save": { en: "Save draft", mr: "मसुदा जतन करा" },
  "composer.footer.preview": {
    en: "Preview as parent",
    mr: "पालक म्हणून पूर्वावलोकन करा",
  },
  "composer.footer.send": { en: "Send broadcast", mr: "प्रसारण पाठवा" },
  "composer.footer.send-disabled-tooltip": {
    en: 'Pick an audience in "Who is this for" first',
    mr: '"हे कोणासाठी आहे" मध्ये दर्शक निवडा',
  },
  "send.warn.mr-empty": {
    en: "Marathi version is empty. Parents with a Marathi preference won't see this broadcast.",
    mr: "मराठी आवृत्ती रिक्त आहे. ज्या पालकांना मराठी भाषेला प्राधान्य आहे, त्यांना हे प्रसारण दिसणार नाही.",
  },
  "send.warn.en-empty": {
    en: "English version is empty. Parents with an English preference won't see this broadcast.",
    mr: "इंग्रजी आवृत्ती रिक्त आहे. ज्या पालकांना इंग्रजी भाषेला प्राधान्य आहे, त्यांना हे प्रसारण दिसणार नाही.",
  },
  "send.warn.both-empty": {
    en: "No content yet. Add either an English or Marathi version before sending.",
    mr: "अद्याप कोणतीही सामग्री नाही. पाठवण्यापूर्वी एकतर इंग्रजी किंवा मराठी आवृत्ती जोडा.",
  },

  // Preview overlay
  "preview.appbar.from": { en: "From", mr: "येथून" },
  "preview.empty.headline.mr": {
    en: "Marathi version not yet generated",
    mr: "मराठी आवृत्ती अद्याप तयार केलेली नाही",
  },
  "preview.empty.headline.en": {
    en: "English version not yet filled",
    mr: "इंग्रजी आवृत्ती अद्याप भरलेली नाही",
  },
  "preview.empty.sub-mr-from-en": {
    en: "Translate the English content with Sarvam Mayura, then review.",
    mr: "इंग्रजी सामग्रीचे सर्वम मयूरामध्ये भाषांतर करा, नंतर पुनरावलोकन करा.",
  },
  "preview.empty.sub-en-from-mr": {
    en: "Translate the Marathi content with Sarvam Mayura, then review.",
    mr: "मराठी सामग्रीचे सर्वम मयूरामध्ये भाषांतर करा, नंतर पुनरावलोकन करा.",
  },
  "preview.empty.sub-both-empty": {
    en: "Fill in the composer first, then come back to preview.",
    mr: "प्रथम कंपोझरमध्ये भरा, नंतर पूर्वावलोकनावर परत या", // hand-fixed compose→music
  },

  // Save state label
  "composer.save-state.saving": { en: "Saving...", mr: "जतन करत आहे..." },
  "composer.save-state.saved": { en: "Saved", mr: "जतन केले" },
  "composer.save-state.error": { en: "Couldn't save", mr: "जतन करता आले नाही" },
};

export function t(key: keyof typeof i18n, lang: Lang): string {
  const pair = i18n[key];
  if (!pair) return key;
  return pair[lang];
}
