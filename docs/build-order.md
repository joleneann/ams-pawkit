# Build Order

9 working days of build plus 1 day of debug plus rehearsal plus the demo session inside
Sagar's mid-May availability window. Source-of-truth for the day-by-day sequence.
References point at `docs/premium-feel/<dimension>.md` for per-discipline specs.

---

## Day 1: Foundations (the immovable day)

- Monorepo init: pnpm workspaces + Turborepo + tsconfig + design-tokens package wired to a Tailwind preset.
- Supabase project, `0001_init_schema.sql` + `0002_rls_policies.sql` pushed, type generation working.
- shadcn init in `apps/dashboard` plus neutral override (`--background`, `--foreground`, `--primary` etc. mapped to Pawkit tokens) BEFORE generating any component.
- **BerryCTA anatomy lock.** As part of shadcn Button setup, lock the Berry primary button anatomy: height, horizontal/vertical padding, corner radius, label font + size + weight, pressed/disabled/loading states. Document in a new `docs/premium-feel/button.md` (or extend `docs/brand-system.md`) for cross-screen reference. (Folded from the now-removed product elements phase into Day 1 foundations on 2026-05-11; see `docs/decisions-log.md` Platform and demo target section.)
- Both apps boot to a hello-world that proves the shared Tailwind preset renders `bg-berry` clean (no Ink border) on a real Android phone in Expo Go.
- **Motion foundations.** Wire 3 easing curves + 5 duration constants from `docs/premium-feel/motion.md` into `packages/design-tokens/src/motion.ts`. Reanimated 4 worklets plugin is auto-applied by `babel-preset-expo` on SDK 54; do NOT add it manually to `babel.config.js`. Smoke-test: a card mounts with `ease-decelerate` 250ms entrance on the hello-world page.
- **Haptics wiring.** `expo-haptics` provider in the petparent app root. Smoke-test: hello-world tap fires `Haptics.selectionAsync()` on real Android.
- **App icon + splash for parent app.** Generate Android sizes (192/512) for the Direction C icon (Lora italic 600 "P" on Honey to Peach gradient) for the Expo parent app. Expo splash extends the gradient with Inter Bold "pawkit" wordmark + Lora italic context line. See `docs/premium-feel/first-run.md` for asset specs. (Lora italic replaces the v1.3 Spectral italic letterform and Inter replaces the v1.3 Satoshi wordmark, both following the 2026-05-15 evening font swap. Dashboard PWA manifest + monochrome notification icon dropped from v0 per 2026-05-10 no-Sagar-push lock; dashboard ships a browser-tab favicon only; revisit in v1+.)
- **Hard stop:** if NativeWind 4 + Metro + pnpm fights past 4 hours, drop to NativeWind 2 immediately. Don't burn the day.
- Fernandes-family-only seed script. RLS smoke test (anon key must fail on tables not covered by `0004_v0_demo_anon_reads.sql`; service-role must succeed).
- **Storage RLS policies.** Add `0005_storage_rls.sql` migration. `messages-images` and `messages-videos` accessible only to authenticated users whose `household_id` matches the parent that owns the message (RLS-by-household per `docs/supabase-config.md`). Public buckets (`pet-photos`, `broadcast-covers`) get a read-anyone, write-authenticated policy. Verify via `SELECT * FROM pg_policy WHERE polrelid = 'storage.objects'::regclass;` returns rows after the migration. Status as of 2026-05-11: zero policies on `storage.objects`; doc claim of "RLS by household" is aspirational until this lands.

## Day 2: Match logic + dashboard core

- `packages/match-logic` with culori, k-means k=3, four rules, vitest suite passing on the 22-photo fixture set (Vanilla and Honey separated, cream Golden vs darker Golden as distinct fixtures, mitigates Risk Register #1). LAB coordinates for all 10 fur tones baked into `packages/design-tokens/src/colors.ts`. Centre-crop preprocess (sample middle 60%), saturation floor demoting grey clusters when a saturated cluster exists.
- Dashboard app shell: sticky header, left rail with Inbox / Broadcasts / Settings, Berry brand dot. No In-Surgery toggle. No Pets tab.
- Per-pet medical profile (Gabby's page) with timeline, chronic conditions, open-follow-up-window banner with 4px Berry left bar, right-rail Quick Facts.
- Inbox: one queue of open-follow-up-window threads, 72px rows, 3px Berry left border on unreplied rows, hover-reveal action icons. No buckets, no classifier pills, no tabs (locked 2026-05-06; see `docs/decisions-log.md`).

## Day 3: Dashboard finish

- Clinical history full screen with SOAP note structure preview (S/O/A/P per visit; hand-written content for v0; opened from pet panel Clinical History tab via "Open full" button).
- Itemised invoice view (view-only, no `Mark paid` CTA; payments cleared at visit).
- Broadcast composer: body-first, audience filter form below, live audience count chip in Inter tabular, Send + 15s undo toast.
- **Voice input via Sarvam AI / Whisper.** Microphone button on Broadcast body and structured-section fields + inbox reply input, transcribes to text (Marathi support via Sarvam).
- **Sarvam Translate for EN ↔ MR auto-translation.** Broadcast composer auto-generates the other-language version when Sagar composes in one (trigger TBD: on-blur or explicit Translate button per `docs/decisions-log.md` Bilingual hard publish-block lock). Sagar reviews and approves both EN + MR sequentially before publish; bilingual publish-block enforces both filled + approved.
- v0 AI scope: TWO features total (Sarvam Audio + Sarvam Translate), both Sarvam-vendor, both dashboard-only, both with vet review before output ships.
- Follow-up window auto-close via Vercel cron route to Supabase RPC. On close: parent receives an end-of-window notification message; parent composer for that thread is disabled; Sagar's side silently moves the thread to pet history.
- Closed-thread redirect copy on the parent side: "AMS is walk-in only. Visit 9am to 9pm Mon-Sat. For urgent issues, call [clinic number]." (Final strings locked in microcopy round.)

## Day 4: Pet-parent app

- expo-router shell + 2-step onboarding flow: Step 1 household name (optional, default 'Your household' if skipped); Step 2 first pet (5 fields all required: name, species, breed, gender, birthday-or-age; NO photo). Auth pre-seeded for Fernandes household.
- 5-tab icon-only bottom nav (supersedes the 2026-05-09 6-tab lock; Settings moved out of the nav and behind the household-initial avatar pill in the Pet Page cover top-right): **Broadcasts / Community / Pets (default landing) / Inbox / Shop.** Phosphor filled tab icons: Megaphone / Users / PawPrint / Tray / ShoppingBag. No text labels (aria-labels carry the role for screen readers). Active tab uses Berry fill + Berry text; inactive uses Ink-soft. NO standalone Broadcasts directory beyond the chronological tab feed. NO Invoices tab (invoices live per-pet inside Pet Page).
- Pets tab list view: vertical list of household pets (one row per pet with 48px avatar carrying fur-match ring, Inter name, species/breed/age subline, 6px Berry open-window indicator dot, deceased pets at 60% opacity with Phosphor Heart icon). Sticky-bottom Berry "Add a pet" CTA opens shared `<PetIdentityForm />` (same form as Onboarding Step 2). Submit creates pet record, navigates to new pet's empty Pet Page (triggers fur-match flow). Locked 2026-05-08.
- Pet profile three-state flow: Empty (Ink-faint cover with diagonal-stripe placeholder, dashed Ink-soft +avatar, sticky `Add photo` Berry button), then Sampling (Sable cover full-bleed, Berry scan-line over 2.4s with 8px Berry glow, 10 chips in 2×5 grid going dim to check to glow, Inter italic match strip with rotating emoji), then Transformed (locked 2026-05-10 to mirror the steady-state Pet Page: real photo at 280px + 10px Honey accent border draws in left-to-right in ~600ms `ease-decelerate`; magic toast in canvas card with 1.5px Ink border surfaces as the only ephemeral overlay with hand-authored SVG sparkles, scale 0.95 to 1.0 + opacity 0 to 1 in 400ms `ease-emphasised`, auto-dismisses at 4-5s with reverse curve; page then resolves into the locked steady-state Pet Page). NO full-cover Honey-to-Peach gradient on the Transformed state (that pattern was retired 2026-05-10 because the steady-state never delivers a full gradient cover).
- Override picker bottom sheet via `@gorhom/bottom-sheet` (3-col chip grid of 10 fur tokens in 4 rows, two-tone toggle hidden under "More options" chevron, live preview with Dalmatian-spot SVG mask, named save button "Save Honey" / "Save Honey + Peach").
- Reanimated 4 Berry scan-line animation.
- Persist `algorithm_match_*` + `algorithm_confidence` separately from `user_choice` for the training pipeline.

## Day 5: Pet-parent finish

- **Inbox tab (per-pet thread list, locked 2026-05-08):** vertical list of one row per living pet (avatar with fur-match ring, pet name, last message snippet or system reminder text, timestamp, optional 6px Berry unread dot, 4px Berry left bar on rows with active follow-up window). Pets with no thread show "No conversations yet". Deceased pets removed.
- **Thread detail:** bounded follow-up window banner (canvas bg, 1px rule border, 4px Berry left bar); Ink-filled parent bubbles vs canvas vet bubbles; text + photo + video bubbles on parent side; vet-side text-only; system reminder cards inline (no reply UI on cards). Closed-window thread shows ClosedThreadRedirect canvas card with "AMS is walk-in only..." copy.
- **Broadcasts tab (locked 2026-05-08):** clinic-wide one-way feed of broadcasts. Vet avatar + clinic + body in selected language + per-card EN/MR toggle + timestamp + 6px Berry unread dot. Composer disabled.
- **Broadcast reading view (structured content)** (entered from a Broadcast card on Broadcasts tab; was Inbox before restructure): 280px cover full-bleed (optional, Ink-faint placeholder if absent), Sagar avatar + name + clinic, language toggle (EN/MR), title + key_points + body (with citations) + warning_signs (Phosphor WarningCircle icon in Ink prefixing section heading) + escalation (Phosphor Phone icon in Ink prefixing section heading), sticky `Share` Berry button. NO fur-token alert dots (locked 2026-05-08, fur never in chrome).
- **Per-pet Invoices tab (inside Pet Page; locked 2026-05-08):** chronological list of that pet's invoices. Invoice reading view: prominent Total canvas card with Inter 36pt tabular ₹ + "Cleared at the desk · [date]" subline, line items grouped by `item_type`, tappable info icons opening Sheets, sticky-bottom `Download PDF` only (Ink ghost; no Berry, no Pay now).
- **Pet Page homepage updates:** quick link to inbox thread (open-window banner doubles as link when active; "View past conversations" Ink-soft secondary link when window closed; hidden if neither). Reminder banner above tabs if active per-pet reminder exists (Phosphor Bell or Calendar icon in Ink, deep-links to Vaccinations/Timeline). Tabs: Timeline / Vaccinations / Invoices.
- **Community tab (v0 dummy):** teaser screen with "Coming soon · V3+" eyebrow, Inter headline, body copy explaining Pawkit Plus social vision, 5 category cards (city circles, breed groups, vet AMAs, lost-and-found, verified clinic reviews). No CTAs.
- **Shop tab (v0 dummy):** teaser screen with "Coming soon · V4+" eyebrow, Inter headline, body copy explaining clinically-curated marketplace, 5 category cards (therapeutic diets, pharma, hygiene, supplements with clinical evidence, insurance). No CTAs.
- **Master Settings screen (locked 2026-05-09; reached via the household-initial avatar pill in the Pet Page cover top-right since the 5-tab nav swap, not a bottom-nav tab):** Account section (phone read-only, household name editable inline, EN/MR language segmented toggle as the master override for the bilingual lock), Pets section (one row per living pet with fur-match-ring avatar, tap → per-pet sub-screen), Notifications section (single push on/off toggle), About section (version + clinic affiliation), full-width ghost Sign-out button at bottom. Visual: Inter eyebrow Ink-soft section labels, canvas cards 1px rule border + rule-soft dividers, no fur tokens in chrome.
- **Per-pet Settings sub-screen (locked 2026-05-09):** entered from gear pill on Pet Page cover (top-right) OR Pets section row on master Settings. Photo replace (auto-re-runs fur-match), Fur match (Re-run Berry CTA + Override ghost opens picker), Adoption year, read-only Identity card (locked because of `pets.clinical_lock`).

## Day 6: Editor screens + content + dataset + premium polish

- Dashboard-side Broadcast composer — structured-content mode / preview (educational shape): cover image OPTIONAL upload (Ink-faint placeholder if absent), vet avatar + name auto-filled, bilingual content fields with EN/MR Tabs on every field (title + key_points repeatable rows + body + warning_signs + escalation). Voice input via Sarvam on every text field. "Copy public URL" + share count display. Sticky-bottom save bar with `Publish` Berry button. Live phone-frame preview right column.
- Structured-content broadcasts surface on the parent side via the Broadcasts tab as broadcast cards (locked 2026-05-08; was Inbox before architecture restructure). Only access path for parents to discover them in v0.
- Vaccination reminder cron: Vercel cron daily 09:00 IST querying vaccinations due in 7 days, inserting messages rows.
- `/style-guide` route: scroll-spy left rail, every shadcn primitive rendered with token override, Berry audit, Fur kit ("Pet content only, never chrome"), Spacing audit (visual ledger of the 8-value scale per `docs/premium-feel/spacing.md`). Vellum audit dropped (vellum was swept out of the dashboard 2026-05-15).
- **Premium polish (vellum texture) DROPPED for dashboard 2026-05-15.** The vellum SVG filter, `<VellumFilter />` component, and `.vellum` CSS class were all removed from `apps/dashboard/`. `packages/design-tokens/assets/vellum.svg` + `vellum-tile.png` remain in the package for potential parent-app use (open question; see `docs/premium-feel/materials.md`). Original v1.3 spec: apply to Paper card surfaces (Timeline, Inbox messages, Invoice line items, etc.) — superseded.
- **Premium polish (spacing audit):** sweep all built screens against the 8-value scale (4/8/12/16/24/32/48/64). Replace stray values (6, 10, 14, 20). Replace `border-b border-ink-faint` dividers with `mb-6` or `mb-8` whitespace except in Invoice line items / Settings sections / Inbox rows. Per `docs/premium-feel/spacing.md`. ~2h.
- Synthetic Pune dataset: 199 remaining patients, 149 households (faker `en_IND` + curated Marathi/Hindi name post-process, breed distribution skewed Pune-realistic), 600-800 visits with realistic gaps. Pexels photo curation per `docs/premium-feel/photography.md` (4:5 portrait, soft window light, neutral home, +10 warmth -5 sat). ~3h curation work for 200 pets.
- 3 pre-written broadcasts seeded (including monsoon tick prevention), bilingual EN+MR.
- 3 pre-seeded structured-content broadcasts (educational, bilingual EN+MR): "How to care for your dog in the summer", "Monsoon tick prevention basics", "Vaccination schedule for your puppy". Each with `public_slug` for sharing.
- AMS rebrand assets: wordmark (Inter Bold "Animal Medical Services" + Inter small-caps "Pune", locked 2026-05-16 against the Satoshi-removed reality on the dashboard topbar), letterhead template, real address + license. ~2h.
- Brand patterns / textures: 2-3 Berry+Ink geometric patterns for marketing surfaces (deck backgrounds, leave-behind, future website). NOT for in-app. ~1-2h.
- i18n setup: `next-intl` (Next.js) + `expo-localization` + `i18n-js` (Expo). Language toggle in app settings + per-card on broadcasts. Noto Sans Devanagari fallback for Marathi rendering. ~2h.

## Day 7: Demo seeding + walkthrough script

- Re-run synthetic data with realistic timestamps relative to "now".
- Hand-tune Fernandes scenarios using the actual photo-determined matches from Day 3:
  - Raffy's memorial card preserves his fur-match gradient. Deceased overlay (60% opacity + Heart icon) layered on top.
  - Gabby's pet profile pre-set to his photo-determined match. Live demo upload during pitch RE-confirms the match. Sagar sees "the algorithm gets it right."
  - Angel pre-set to her photo-determined match (likely Milk to Vanilla auto-pair if she's white Persian).
  - Galaxy pre-set to her photo-determined match.
  - Gabby's open follow-up window with 1 unreplied parent message ("Gabby's still limping a bit") visible in the clinic inbox. Window banner shows "2 days left, 1 unreplied".
  - Angel's vaccination reminder due in 3 days.
- **Fernandes shoot.** Half-hour at home, 4-6pm Pune light, 3 new photos (Gabby + Angel + Galaxy). Raffy uses existing photo treated as archival. Phone Portrait mode is fine. Per `docs/premium-feel/photography.md`.
- **Walkthrough script written** scene-by-scene per `docs/demo-choreography.md`. Time-boxed to ~15 min app demo + ~10-15 min growth presentation.
- **Friend-rehearsal logistics:** book two friends for Day 8. One briefed as Sagar role; one unbriefed parent-app stand-in (low-literacy user surrogate) whose genuine confusion is the usability test (NOT part of the actual demo, which is Jolene + Sagar only).
- Berry audit: walk every screen, confirm Berry usage reads as intentional brand amplification (the v1.3 "one Teal per screen" budget was relaxed at the mauve lock; Berry now legitimately shows up across CTAs / hero counts / vet bubbles / active tabs / segmented toggles / active rail / focus rings / search wash).
- Eyeball every shadcn-generated component against tokens via `/style-guide`.
- **Microcopy round complete by EOD** (separate co-write session). Workflow locked 2026-05-16: **(1) finalise the EN strings first**, screen-by-screen, against the do/don't matrix in `docs/premium-feel/voice.md` (FK grade 5 parent app, FK grade 8 dashboard, ~30 system message templates). **(2) Batch-translate EN → MR via Sarvam Translate** — single API call per surface area, NOT one-string-at-a-time (the 2026-05-12 admin pass sent 225 single-string requests when 2-3 batched would have fit; that mistake doesn't repeat per `feedback_batched_api` memory). **(3) Pune-native-speaker review pass** on the MR rows; catches metaphor errors, register calibration (`तुमचा` vs `तुझा`), Pune-dialect specifics. After review, MR rows are locked and the build is microcopy-ready. Admin EN strings already locked at `microcopy/admin.md`; parent EN strings are this round's primary scope.
- **Vet byline component (`<VetByline />`)** rolled into 4 screens (Pet Page cover, Inbox row, Broadcast reading view header, broadcast cards) per `docs/premium-feel/byline.md`. Visual rhythm check: open all 4 screens side-by-side, byline composition should feel uniform.
- **Per-screen state coverage check.** Every screen has loading skeleton + empty (where applicable) + error state implemented per `docs/premium-feel/states.md`. Force-test offline mode for 30s; offline banner should appear without panic.
- **Per-screen haptic coverage check.** Parent app screens fire correct haptics per `docs/premium-feel/haptics.md` pattern map. Test with sound off; every interaction should feel.

## Day 8: Debug + two-phone rehearsal with friends

- Real Android device dry-run on a mid-range phone (NOT a flagship; clinic staff won't have flagships).
- Vercel preview deployed for Phone A.
- **EAS release APK built and installed on the demo phone (Phone B)** via
  `eas build --profile preview --platform android`. Build T-2 days minimum
  so this rehearsal has a 24-hour buffer if a spot-fix rebuild is needed.
  No Expo Go on the demo phone. The demo phone is now frozen at the
  installed APK; the dev phone keeps running Expo Go for any iteration that
  comes out of this rehearsal. See `docs/decisions-log.md` 2026-05-13
  Parent-app demo delivery lock.
- Full demo loop: vet broadcasts on Phone A, Phone B receives <5s, parent replies, Phone A inbox updates. If realtime is flaky, fall back to 5s polling.
- Test fur-match upload with Gabby's actual photo on real Android camera + image picker (multiple Android skin variants if possible: MIUI, OneUI, stock).
- Bundle 5 sample pet photos as in-app fallback if live camera fails on demo day.
- Take full screen-recording end-to-end as backup for live failure.
- Test info-icon Tooltips/Sheets render and explanations are conversational.
- Test typical-response-time chip displays correctly on parent threads.
- Test bilingual toggle on broadcast cards (Marathi rendering correct, Devanagari font fallback working).
- **Full rehearsal with 2 friends:** Sagar-friend briefed on the role; parent-app stand-in friend NOT briefed (genuine usability test, separate from the actual demo flow). Time the session. Get unscripted reactions. Practice the opening line silence and the closing line ask.
- **Failure-mode drill:** rehearse the Vercel-down handoff (switch to local + hotspot) and the fur-match-wrong handoff ("algorithm's having a moment, here's the override").
- **Hotspot config:** test phone-tethering performance for the demo duration; charge backup battery.
- **PDF deck draft email:** prepare the email-with-attachment in your phone's draft folder ready to send during the closing line.

## Demo day

T-30 ritual: charge both phones to 100%; test on venue Wi-Fi (or controlled
hotspot from third phone); open both apps to Fernandes family; confirm all
hand-tuned scenarios visible (Gabby's open follow-up window, Angel's vaccination
reminder, Raffy's memorial); screen-recording in pocket as live failure backup;
confirm Vercel deployment is the latest commit; install Pawkit app icon on both
phones' home screens (Sagar's premium first-impression check at 1cm² icon size).

**Demo phone state:** the parent app is installed as a release APK (Day 8
EAS build) launched from the home-screen icon. No Expo Go on the demo
phone. The APK is frozen at build time, so SDK upgrades on the device
can't break it. The dev phone (separate from the demo phone) still runs
Expo Go for any post-rehearsal fixes; if a fix lands, rebuild the APK and
re-install on the demo phone — never demo from Expo Go. See
`docs/decisions-log.md` 2026-05-13 Parent-app demo delivery lock and the
CLAUDE.md tech-detour-prevention block.
