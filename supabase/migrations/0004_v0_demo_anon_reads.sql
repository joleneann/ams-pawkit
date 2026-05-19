-- Pawkit v0 demo: anon-key read access for the parent app.
--
-- The parent Expo app uses the Supabase anon key because v0 has no auth wired
-- (per docs/decisions-log.md: 2-step onboarding without phone OTP). The parent
-- demo always renders as the Fernandes household. Without these policies the
-- anon key gets 0 rows from RLS and the app errors with
-- "cannot coerce the result to a single JSON object".
--
-- Scope is intentionally narrow: only the Fernandes household chain + the
-- single clinic vet (Dr Sagar). Synthetic households remain hidden from anon.
--
-- TEMPORARY: replace with proper Supabase Auth + authenticated policies in v0.1.

create policy "v0 demo: anon read Fernandes household"
on households for select to anon
using (name = 'The Fernandes Family');

create policy "v0 demo: anon read Fernandes household members + clinic vet"
on users for select to anon
using (
  household_id in (select id from households where name = 'The Fernandes Family')
  or role = 'vet'
);

create policy "v0 demo: anon read Fernandes pets"
on pets for select to anon
using (household_id in (select id from households where name = 'The Fernandes Family'));

create policy "v0 demo: anon read Fernandes pet visits"
on visits for select to anon
using (pet_id in (
  select id from pets where household_id in (select id from households where name = 'The Fernandes Family')
));

create policy "v0 demo: anon read Fernandes pet vaccinations"
on vaccinations for select to anon
using (pet_id in (
  select id from pets where household_id in (select id from households where name = 'The Fernandes Family')
));

create policy "v0 demo: anon read Fernandes pet follow-ups"
on follow_up_windows for select to anon
using (pet_id in (
  select id from pets where household_id in (select id from households where name = 'The Fernandes Family')
));
