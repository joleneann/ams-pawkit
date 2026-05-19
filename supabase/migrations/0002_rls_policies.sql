-- Pawkit v0: Row-Level Security policies
-- Per docs/architecture.md: enable RLS on every table; do NOT use FORCE ROW LEVEL SECURITY
-- so the service-role key can bypass for seeding.

-- Enable RLS (anon + authenticated MUST go through policies; service-role bypasses)
alter table clinics enable row level security;
alter table households enable row level security;
alter table users enable row level security;
alter table pets enable row level security;
alter table visits enable row level security;
alter table vaccinations enable row level security;
alter table invoices enable row level security;
alter table invoice_line_items enable row level security;
alter table messages enable row level security;
alter table follow_up_windows enable row level security;
alter table broadcasts enable row level security;
alter table broadcasts_read enable row level security;
alter table health_kits enable row level security;
alter table audit_log enable row level security;

-- =====================================================================
-- v0 baseline: deny-by-default. Real auth integration deferred to build week.
-- For demo seeding, the service-role key bypasses these policies entirely.
-- For the future authenticated app surfaces, more granular policies will be added.
-- =====================================================================

-- Public read on PUBLISHED health kits, required for the public sharing URL
-- (apps/dashboard/app/kits/[slug]/page.tsx is unauthenticated)
create policy "Public read on published kits"
on health_kits for select
using (published = true);

-- Public POST allowed against `share_count` increment via the dedicated API route only
-- (no direct table policy needed; handled at the route level by service-role)

-- Authenticated users (when wired in v1+) can read their own user row
create policy "Users can read self"
on users for select
to authenticated
using (id = auth.uid());

-- Authenticated parent can read their household + family members
create policy "Parents read own household"
on households for select
to authenticated
using (id = (select household_id from users where id = auth.uid()));

create policy "Parents read household members"
on users for select
to authenticated
using (household_id = (select household_id from users where id = auth.uid()));

-- Authenticated parent can read their pets
create policy "Parents read own pets"
on pets for select
to authenticated
using (household_id = (select household_id from users where id = auth.uid()));

-- Authenticated parent can read visits/vaccinations/invoices for their pets
create policy "Parents read own pet visits"
on visits for select
to authenticated
using (pet_id in (select id from pets where household_id = (select household_id from users where id = auth.uid())));

create policy "Parents read own pet vaccinations"
on vaccinations for select
to authenticated
using (pet_id in (select id from pets where household_id = (select household_id from users where id = auth.uid())));

create policy "Parents read own household invoices"
on invoices for select
to authenticated
using (household_id = (select household_id from users where id = auth.uid()));

create policy "Parents read invoice line items"
on invoice_line_items for select
to authenticated
using (invoice_id in (select id from invoices where household_id = (select household_id from users where id = auth.uid())));

-- Authenticated parent can read messages on their household's threads
create policy "Parents read own household messages"
on messages for select
to authenticated
using (household_id = (select household_id from users where id = auth.uid()));

-- Authenticated parent can read follow-up windows for their pets
create policy "Parents read own pet follow-up windows"
on follow_up_windows for select
to authenticated
using (pet_id in (select id from pets where household_id = (select household_id from users where id = auth.uid())));

-- Broadcasts: authenticated users see broadcasts from clinics they have a pet at
create policy "Parents read clinic broadcasts"
on broadcasts for select
to authenticated
using (clinic_id in (select distinct clinic_id from pets where household_id = (select household_id from users where id = auth.uid())));

-- Broadcast read state: parent can read + write their own
create policy "Parents read own broadcast read state"
on broadcasts_read for select
to authenticated
using (user_id = auth.uid());

create policy "Parents mark broadcasts read"
on broadcasts_read for insert
to authenticated
with check (user_id = auth.uid());

-- Vet + staff (when wired): can read all data for their clinic
create policy "Clinic staff read all clinic data"
on pets for select
to authenticated
using (clinic_id = (select clinic_id from users where id = auth.uid()) and (select role from users where id = auth.uid()) in ('vet', 'staff'));

-- audit_log: no public/authenticated access (service-role only)
-- (no policies needed; RLS denies by default when no policy matches)

-- Note: in v0 the auth provider is NOT wired. Parent identity is pre-seeded for the
-- demo (Fernandes household). All real reads in v0 happen via the seed script using
-- the service-role key, which bypasses RLS entirely. The policies above are scaffolding
-- for v1+ when SMS / Google / email auth gets added.
