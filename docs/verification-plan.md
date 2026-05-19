## Verification Plan

### Algorithm tests (no real photos needed at first)
**22-photo fixture set** (palette v1.1, Vanilla and Honey separated) covering: solid white cat (Milk auto-pair to Milk+Vanilla), solid black dog (Sable auto-pair to Sable+Bark), **yellow Lab / cream Golden (must be solid Vanilla, Raffy reference photo from v1.1 testing)**, **darker Golden Retriever (Gabby case, must be solid Honey)**, tan Lab (Vanilla/Honey border), tuxedo cat (Sable+Milk two-tone), Husky (Smoke+Milk), brindle, calico, plus 13 edge cases including the Vanilla/Honey decision boundary (cream-to-darker Golden gradient). Each fixture has JSON sidecar with `expectedPrimary` + `expectedSecondary`. Vitest snapshot. Sources: Pexels, Unsplash, Stanford Dogs (research-OK for fixtures). Hand-pick.

### RLS verification
Day 2 acceptance test: `pnpm db:seed` from clean DB produces Fernandes household (1) + 4 pets (Raffy, Gabby, Angel, Galaxy) + 1 vet user + visits + open follow-up window for Gabby. Then run a SELECT through the **anon key on tables NOT covered by `0004_v0_demo_anon_reads.sql`** (e.g. `audit_log`, synthetic-household pets); must return 0 rows. Confirms RLS is actually on. (The Fernandes household chain + clinic vet ARE intentionally readable by anon per migration 0004 because v0 has no auth wired.)

### Clinical lock parent-side enforcement (Day 4 build task)
When implementing `<PetIdentityForm />` (the Pet Identity edit modal used in Onboarding Step 2, Settings → Pets → Edit, and the press-and-hold switcher's "+" tile flow), branch on `pet.clinical_lock`:
- **If `false`** (pre-clinical pet): render name / breed / sex / age (birthday) as editable shadcn `<Input>` + `<Select>` + `<DatePicker>` primitives.
- **If `true`** (clinical records exist): render the same four fields as static text rows with a small `Lock` Phosphor icon and a Tooltip reading "Locked after first clinical visit. Contact AMS to correct." Photo + weight + chronic conditions remain editable.

The DB trigger `set_clinical_lock` is the belt-and-braces enforcement at write time. The UI rule prevents the parent from seeing an editable field that errors on submit — which would read as "Pawkit is broken," not "this field is locked."

Smoke test: open Gabby's profile in the demo APK, verify name/breed/sex/age render as locked text (Gabby has clinical records). Open the "Add a pet" flow, verify all fields are editable.

### Two-phone end-to-end on real Android (by day 10 latest)
Use mid-range Android (Dr Sagar's clinic staff won't have flagships). `pnpm dev` runs both apps. Vercel preview for Phone A. The demo phone (Phone B) runs the EAS preview APK installed from `eas build --profile preview --platform android` — no Expo Go on the demo phone. Test loop: vet broadcasts on Phone A; Phone B receives within 5s; parent replies; Phone A inbox updates. See `docs/decisions-log.md` 2026-05-13 Parent-app demo delivery lock.

### Demo-day ritual (T-30 minutes before pitch)
1. Charge both phones to 100%
2. Test on actual venue Wi-Fi (or hotspot from third phone you control)
3. Open both apps to Fernandes family. Confirm Gabby's open follow-up window visible, Angel's vaccination reminder visible, **Raffy's memorial card visible with his preserved fur-match gradient (algorithm-determined from his photo, per the Demo anchor section of `docs/decisions-log.md`) + Heart icon at 60% opacity**
4. Confirm invoice info-icon Tooltips render with conversational explanations
5. Confirm fur-match upload works. Try once with Gabby's actual photo, expect **Honey + Peach** result
6. Take a full screen recording end-to-end as backup if anything fails live
7. Confirm Vercel deployment is the latest commit
8. Open Pawkit on Phone A's Inbox: one queue of open-window threads. Gabby's open follow-up window with one unreplied parent message visible. Window banner shows "2 days left, 1 unreplied".

---
