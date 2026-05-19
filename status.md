# Status (Pawkit v0)

Re-orientation file. Current state only. Locked decisions live in
`docs/decisions-log.md`; rationale lives in `session-logs/`; history before
2026-05-18 lives in `docs/status-archive.md` and git. NOT a journal. Slim
back when this file approaches 100 lines.

## Last touched
2026-05-18 (long day — voice-first broadcast feature shipped end-to-end,
inbox header rebuilt, audience modal redesigned, tech-debt audit + Phase 0 +
Phase 1 safe-subset done, dashboard-wide CTA size + shape locked).

- **Voice-first broadcast feature shipped end-to-end.** New
  `/broadcasts/new` lands on a single-mic prompt; vet speaks freely
  (up to 10 min, 25s rolling segments to dodge Sarvam Saarika's 30s
  cap), Groq Llama 3.3 70B structures the transcript into title +
  body + Warning signs + When to see the vet, populates the existing
  composer at `/broadcasts/new/manual`. MR translation lazy via the
  composer's मराठी toggle (Sarvam Mayura). Draft autosaves to
  `broadcasts` (sent_at IS NULL) via debounced `saveBroadcastDraftAction`.
  Refusal/fallback flow keeps the vet's words safe when Groq can't
  structure. "View original transcript" dialog in the composer header.
  All copy wired through `i18n-strings.ts` (65+ new keys, Sarvam batch
  translation pass done). Costs: ~₹3-7 per broadcast (Sarvam dominates),
  ~₹24 total today including dev work. Lock: `docs/decisions-log.md`
  "Broadcast voice-dump feature".
- **Inbox header CTA-dominant rebuild.** `AwaitingBar` deleted (count
  was triple-redundant with the rail badge). Single row: `Start reply
  queue` CTA on LHS with a pulsing white dot when there's awaiting
  work, `Awaiting reply / Replied` pill-pair tabs on RHS at the locked
  dashboard tab size. Reference: `mockups/inbox-header-redesign.html`
  Option C. Lock: `docs/decisions-log.md` "Inbox header CTA-dominant rebuild".
- **Dashboard primary-CTA size + shape lock.** Every primary action at
  the top of a dashboard page renders identically: `size="h44"` + `text-md` +
  `font-semibold` + `gap-2.5` + `rounded-full` + the same drop shadow
  pattern. Applied to inbox (`Start reply queue`), broadcasts
  (`New broadcast`), billing (`Showing {month}`). Locked at
  `docs/decisions-log.md` "Dashboard primary-CTA size lock".
- **Audience modal + send flow redesigned.** Removed
  `Condition group` / WHERE / AND chrome (was clutter). "All" tickbox
  added to age range (writes the wide-open sentinel that matches every
  pet). `Clear` truly clears (groups → []). Send confirm modal: removed
  the bilingual preview gate per user feedback ("just display a warning
  that parents won't see the broadcast in that language"); checkbox now
  reads "Send to {audience_summary}". Server-side `publishBroadcastAction`
  also relaxed: at-least-one-language sufficient.
- **Tech-debt audit + Phase 0 + Phase 1 safe-subset shipped.** Full
  audit at `TECH_DEBT_AUDIT.md`, plan at `docs/tech-debt-plan.md`.
  Phase 0 (doc/memory drift, no code touch): AI scope updated to 3
  vendors (Sarvam STT + Sarvam Translate + Groq Llama 3.3 70B);
  schema 0007 reconstruction note added; storage RLS memory marked
  resolved; components/ui composites carve-out documented. Phase 1
  safe pre-demo: F011 (tracking-em sweep), F015 (gradient → token),
  F022 (Fernandes constant + isFernandesGabby helper), F028 (empty-catch
  annotations), F006-A (`0007_security_hardening.sql` reconstructed
  from the prod-only state — verify on staging before treating as
  canonical). **Phase 1 remainder + Phase 2-4 deferred to post-demo;
  must execute before V1 feature work.**
- **View Visits hardened.** Added `error.tsx` boundary to
  `/inbox/[threadId]/clinical/` so any throw shows a friendly fallback
  with Try again / Back to inbox instead of the giant Next.js error
  page. Defensive `?? []` and `?? ""` guards on `visit.pills` and SOAP
  fields in the clinical page + soap-context-strip.
- **Clinical visit cards aligned to inline preview.** The full
  clinical history page now renders each visit with the same
  `bg-canvas + border border-rule + rounded-xl` anatomy as the
  SoapContextStrip's expanded view: title + date · vet inline on a
  single header line, pill RHS, uppercase SOAP eyebrow labels.
- **Cover image taller + synced.** Aspect changed `16:5 → 16:7` in
  both the composer's cover slot and the parent-app preview. Upload
  + reposition now write to BOTH `en` and `mr` simultaneously
  (`useBroadcastDraft.setCoverImage` + `setCoverImagePosition` in
  draft-state.ts).
- **i18n wired for voice-first.** 65+ new keys in
  `apps/dashboard/lib/i18n-strings.ts` (voice landing, audience modal,
  send confirm, preview overlay empty state, composer toolbar/footer/
  audience strip, save-state label). MR sourced from 4-batch Sarvam
  Translate pass with hand-fixes where Sarvam misread "compose" as
  musical compose. Pune native-speaker review pending per Phase 3c.

## Previously
See `docs/status-archive.md` for everything before 2026-05-18.

## Open
- **EAS APK status — UNCONFIRMED.** `CLAUDE.md` says the parent-app
  release APK should be built T-2 days before demo. With the demo
  window being mid-May 2026 and today 2026-05-18, this is the actual
  blocker, not anything in the tech-debt plan. Build via
  `eas build --profile preview --platform android`, install on the
  demo phone, smoke-test the round-trip.
- **`0007_security_hardening.sql` verification.** File reconstructed
  from descriptions today; should be applied to staging first to
  confirm idempotency before treating as canonical. Tracked in
  `docs/tech-debt-plan.md` F006-A.
- **DB to spec; advisor warnings cleared.** 151 households / 169 users /
  204 pets / 155 visits / 153 invoices / 107 vaccinations / 54 messages /
  51 follow-up windows / 6 broadcasts + 197 read receipts / 3 health
  kits. Only 1 INFO remaining: `audit_log` RLS-no-policy, intentionally
  deferred to v1+.
- **Parent-app hi-fi v3.1 shipped to repo.** Single-file standalone at
  `mockups/parent-app-hifi.html`. Full detail in
  `docs/parent-mockup-changes.md` + `docs/parent-mockup-craft-brief.md`.
  Mockup authorship now Claude Code only.
- **Microcopy round (Phase 3a).** EN draft at `microcopy/parent-en.md`
  (~225 strings, 17 sections). Phase 3b after EN locks: batched
  Sarvam EN→MR. Phase 3c: Pune-native-speaker review.
- **Day-4 parent-app build.** Still has Spectral fonts and
  `lucide-react-native ^1.14.0` installed; full token + import sweep
  + onboarding + tab routing happens when the parent-app build phase
  starts. App.tsx + PetPage.tsx color constants are already mauve.
- **AI Triage** permanently cancelled (see decisions-log +
  `project_ai_triage_cancelled` memory). Becomes a separate company
  if ever revisited.
- **v1+ multi-user household.** 5 unresolved design questions logged
  in `docs/open-issues.md`; deferred to v1+ per CLAUDE.md.
