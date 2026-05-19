# Open Issues (Deferred Decisions)

Items still requiring a decision. As items lock, move them to
`docs/decisions-log.md` and remove the entry from here.

## Awaiting microcopy round

2. **Window-close in-thread system message** microcopy in EN + MR (vet side +
   parent side variants).
3. **End-of-window closing message** in inbox threads, exact strings in EN +
   MR.
4. **Closed-thread redirect copy.** Final EN + MR strings for "AMS is walk-in
   only. Visit 9am to 9pm Mon-Sat. For urgent issues, call [clinic number]."
   Working draft is locked (see `docs/decisions-log.md`) and rendered in
   `mockups/archive/parent-v1.3.html` Screen 11; microcopy round refines tone,
   length, MR translation.
5. **Magic toast pet-name reveal copy** (currently a placeholder Spectral
   italic line in `docs/layout-spec.md` screen 9 State C).
6. **Memorial card line for Raffy.** Lora italic dedication, exact
   wording pending.
7. **Video upload cap copy.** EN + MR strings for: (a) the cap notice on
   the parent app's attach surface ("Videos up to 60 seconds" or
   equivalent); (b) the over-duration rejection/trim message; (c) the
   over-size (>50 MB) rejection message ("please record a new video" or
   equivalent). Locked behavior 2026-05-08; final strings pending.
8. **Settings screen labels.** Once Settings scope confirms, EN + MR
   strings for each row label, the section headers, and the sign-out
   confirmation.

## Recently closed (locked 2026-05-09)

- Broadcast bilingual toggle scope → bilingual authoring required, parent
  reads in selected app-wide language, no per-broadcast toggle.
- Vet credentials display detail → name + clinic only, applied across all
  byline variants.
- Marketplace surface in v0 → no active marketplace beyond Shop teaser tab.
- Closed-thread redirect visual treatment → mockup shipped as
  `mockups/archive/parent-v1.3.html` Screen 11; visual locked in
  `docs/decisions-log.md`.
- Settings screen for parent app → 6th tab, icon-only nav, master Settings
  (Account / Pets / Notifications / About / Sign-out) plus per-pet
  sub-screen reached from gear pill on Pet Page cover. Mockups shipped
  as `mockups/archive/parent-v1.3.html` Screens 12 + 13. Tabs lost their text
  labels in the same lock.

## Deferred to v1+ design round (multi-user household model)

Schema already supports multiple users per household (`users.household_id`
is a single-column FK with no uniqueness constraint, so N users can share
one `household_id`). The invite UI is deferred to v1+ per
`docs/flows/parent.md:205-206`. Before v1+ build starts, these five
design questions need to be answered. Logged 2026-05-11; surface at the
start of v1+ design before any auth or multi-user UI work.

1. **Can a user belong to more than one household?** Current schema says
   no, `users.household_id` is a single column, not a join table. Blocks
   divorced co-parents, adult kids who moved out, temporary access
   (dog-walkers, boarders, pet sitters). Decision: keep
   one-household-per-user or convert to a `household_members` join table.
2. **Voice attribution in the inbox thread.** Two parents reply to Dr
   Sagar in the same thread. Does each bubble show "Sent by [user name]"
   attribution, or does the household speak as one? Affects vet-side
   thread UX too (Sagar reading replies from co-parents).
3. **Phone number and language preference resolution.** Households have
   one phone (`households.phone`). Each user has their own
   `preferred_language`. Master Settings shows phone as the auth
   identifier, but per which user? Decide household-level vs user-level
   for each field, and whether the language toggle is per-user or
   per-household.
4. **Disagreement resolution.** Pet identity locks once clinical records
   exist. Before lock, if two users disagree about a pet's adoption year,
   photo, or fur-match override, who wins? First-write wins, last-write
   wins, explicit primary-user role, or notification-to-secondary on
   write?
5. **Pet ownership granularity.** Pets belong to households, not specific
   users. Is that fine, or should a household be able to mark "this pet
   is primarily mine" (e.g., a kid's first pet) for filter/notification
   purposes?

## Deferred to post-demo

### Supabase region migration (Tokyo → Mumbai)

Project `pevofxnfjcvmamdcfkus` is in `ap-northeast-1` (Tokyo).
Migration to `ap-south-1` (Mumbai) deferred post-demo, locked
2026-05-17 (see `docs/decisions-log.md`). Revisit when AMS-paid
subscription tier kicks in. Migration is a half-day port (new
project + 6 migrations + seed + 42 storage objects + key
rotation + three `.env.local` files + MCP re-auth + EAS APK
rebuild + smoke test).

## Process

- **Audit cadence.** Sash recommends every 2 weeks; the doc restart on
  2026-05-06 serves as the reset. Set a calendar reminder to run an audit two
  weeks from now.
- **Skill creation.** Skills must be authored in Claude Code (not Cowork) to
  be visible on both surfaces. Defer until specific reusable workflows
  emerge.
