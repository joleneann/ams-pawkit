-- Pawkit v0: Initial schema
-- All 9 schema patches from docs/schema.md baked in (this is pre-deployment, no live data to migrate).
-- Patches: 1 (no clinics.primary_color), 2 (algorithm_match_*), 3 (Fernandes seed), 4 (no voice fields),
-- 5 (bilingual columns), 6 (pets.clinical_lock), 7 (broadcasts_read), 8 (message attachments),
-- 9 (Health Kit revision: May 4 lock).

-- Extensions
create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- =====================================================================
-- clinics: one row in v0 (AMS Pune)
-- =====================================================================
create table clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  email text,
  gst text,
  license text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- households: one per pet-parent group
-- =====================================================================
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Your household',
  address text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- users: vets, staff, and parents (referenced from auth.users in v1+)
-- =====================================================================
create table users (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete set null,
  household_id uuid references households(id) on delete set null,
  role text not null check (role in ('vet', 'staff', 'parent')),
  full_name text,
  phone text,
  email text,
  vet_license text,                                     -- nullable, only for vets
  avatar_url text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'mr')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_clinic on users(clinic_id);
create index idx_users_household on users(household_id);

-- =====================================================================
-- pets: Patches 2, 6 baked in
-- =====================================================================
create table pets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  clinic_id uuid not null references clinics(id),       -- which clinic owns the medical record
  name text not null,
  species text not null check (species in ('dog', 'cat')),
  breed text,
  sex text check (sex in ('male', 'female')),
  birthday date,
  age_years_at_entry integer,                           -- if exact birthday unknown at onboarding
  weight_kg numeric(5,2),
  microchip_id text,
  chronic_conditions text[] default '{}',
  allergies text[] default '{}',
  current_medications text[] default '{}',
  regular_vet_id uuid references users(id) on delete set null,
  avatar_url text,
  deceased boolean not null default false,
  deceased_at timestamptz,
  -- Fur match (user-visible result)
  fur_match_primary text,
  fur_match_secondary text,
  is_auto_pair boolean not null default false,
  -- Patch 2: algorithm output (separate from user-visible result)
  algorithm_match_primary text,
  algorithm_match_secondary text,
  algorithm_confidence numeric(3,2),
  user_override_at timestamptz,
  -- Patch 6: clinical lock. Set true when first visit row inserts via trigger below.
  clinical_lock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pets_household on pets(household_id);
create index idx_pets_clinic on pets(clinic_id);
create index idx_pets_deceased on pets(deceased) where deceased = true;

-- =====================================================================
-- visits: locked types: consultation, surgery, vaccination, grooming
-- =====================================================================
create table visits (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  vet_id uuid references users(id),
  visit_type text not null check (visit_type in ('consultation', 'surgery', 'vaccination', 'grooming')),
  visit_date date not null,
  chief_complaint text,
  diagnosis text,
  soap_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_visits_pet on visits(pet_id);
create index idx_visits_date on visits(visit_date desc);

-- Patch 6 trigger: lock pet identity once first visit lands
create or replace function set_clinical_lock()
returns trigger as $$
begin
  update pets set clinical_lock = true where id = new.pet_id and clinical_lock = false;
  return new;
end;
$$ language plpgsql;

create trigger trg_visits_set_clinical_lock
after insert on visits
for each row execute function set_clinical_lock();

-- =====================================================================
-- vaccinations
-- =====================================================================
create table vaccinations (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  visit_id uuid references visits(id) on delete set null,
  vaccine_type text not null,
  administered_date date not null,
  next_due_date date,
  batch_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_vaccinations_pet on vaccinations(pet_id);
create index idx_vaccinations_due on vaccinations(next_due_date) where next_due_date is not null;

-- =====================================================================
-- invoices: payments cleared at desk (no payment processing in Pawkit)
-- =====================================================================
create table invoices (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  visit_id uuid references visits(id) on delete set null,
  household_id uuid not null references households(id) on delete cascade,
  invoice_number text unique not null,
  issued_date date not null default current_date,
  subtotal_inr integer not null,
  gst_inr integer default 0,
  total_inr integer not null,
  status text not null default 'paid' check (status in ('paid')),
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_invoices_pet on invoices(pet_id);
create index idx_invoices_household on invoices(household_id);
create index idx_invoices_issued on invoices(issued_date desc);

-- =====================================================================
-- invoice_line_items
-- =====================================================================
create table invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  item_type text not null check (item_type in ('consultation', 'procedure', 'medication', 'vaccination')),
  item_name text not null,
  item_code text,                                       -- for tooltip dictionary lookup
  qty integer not null default 1,
  unit_price_inr integer not null,
  line_total_inr integer not null
);

create index idx_invoice_line_items_invoice on invoice_line_items(invoice_id);

-- =====================================================================
-- messages: Patch 4 (no audio) + Patch 8 (parent-side media: image, video) baked in
-- =====================================================================
create table messages (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  thread_id uuid not null,                              -- groups messages into a thread
  sender_type text not null check (sender_type in ('parent', 'vet', 'system')),
  sender_id uuid references users(id),
  body text,
  -- Patch 8: parent-side media attachments (image, video). Vet-side text-only.
  attachment_url text,
  attachment_type text check (attachment_type in ('image', 'video')),
  -- Haiku classification
  bucket text check (bucket in ('logistics', 'clinical_followup', 'feedback')),
  bucket_assigned_at timestamptz,
  ai_drafted_reply text,                                -- Haiku's pre-drafted reply, vet edits
  -- Status
  replied_at timestamptz,
  replied_by uuid references users(id),
  read_at timestamptz,                                  -- when recipient saw the message
  created_at timestamptz not null default now()
);

create index idx_messages_thread on messages(thread_id, created_at);
create index idx_messages_household on messages(household_id);
create index idx_messages_bucket on messages(bucket) where bucket is not null;
create index idx_messages_unreplied on messages(created_at) where replied_at is null and sender_type = 'parent';

-- =====================================================================
-- follow_up_windows
-- Locked durations: consultation 0d, special-case 48h, surgery 3d, vaccination 0d, grooming 0d
-- =====================================================================
create table follow_up_windows (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  visit_id uuid not null references visits(id) on delete cascade,
  thread_id uuid not null,                              -- links to messages.thread_id
  window_days integer not null,
  opened_at timestamptz not null default now(),
  closes_at timestamptz not null,
  closed_at timestamptz,
  closed_reason text check (closed_reason in ('expired', 'manual')),
  created_at timestamptz not null default now()
);

create index idx_followup_pet on follow_up_windows(pet_id);
create index idx_followup_open on follow_up_windows(closes_at) where closed_at is null;

-- =====================================================================
-- broadcasts: Patches 4 (no audio_url), 5 (bilingual) baked in
-- =====================================================================
create table broadcasts (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  vet_id uuid not null references users(id),
  topic_en text not null,
  topic_mr text,
  composed_message_text_en text not null,               -- Patch 5
  composed_message_text_mr text,                        -- Patch 5
  audience_filter jsonb not null default '{}'::jsonb,   -- { species, age_range, exclude_deceased, ... }
  audience_count integer,
  attached_kit_id uuid,                                 -- FK added below after health_kits exists
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_broadcasts_clinic on broadcasts(clinic_id);
create index idx_broadcasts_sent on broadcasts(sent_at desc) where sent_at is not null;

-- =====================================================================
-- health_kits: Patch 9 (May 4) FULL revision: educational content + virality
-- Patches 4 (no voice_note_url), 5 (bilingual) also baked in
-- =====================================================================
create table health_kits (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  vet_id uuid not null references users(id),
  cover_image_url text,                                 -- OPTIONAL per Patch 9
  -- Bilingual content (Patches 5 + 9)
  title_en text not null,
  title_mr text,
  key_points_en jsonb not null default '[]'::jsonb,     -- bullet array
  key_points_mr jsonb,
  body_en text not null,                                -- long-form, may include inline citation links
  body_mr text,
  warning_signs_en text,                                -- distinct section per Patch 9
  warning_signs_mr text,
  escalation_en text,                                   -- when to call the clinic
  escalation_mr text,
  -- Virality layer (Patch 9, May 4)
  share_count integer not null default 0,
  public_slug text unique,
  -- Publishing
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_health_kits_clinic on health_kits(clinic_id);
create index idx_health_kits_public_slug on health_kits(public_slug) where published = true;

-- Now add the FK from broadcasts → health_kits (defined after both tables exist)
alter table broadcasts add constraint fk_broadcasts_attached_kit
  foreign key (attached_kit_id) references health_kits(id) on delete set null;

-- Patch 13 (2026-05-15 broadcast composer rebuild): optional cover image for
-- educational broadcasts. Public URL points at the existing `broadcast-covers`
-- bucket under `broadcasts/<slug>-<ts>.<ext>`.
alter table broadcasts add column if not exists cover_image_url text;

-- =====================================================================
-- broadcasts_read: Patch 7 (server-side broadcast read state)
-- =====================================================================
create table broadcasts_read (
  broadcast_id uuid not null references broadcasts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (broadcast_id, user_id)
);

create index idx_broadcasts_read_user on broadcasts_read(user_id);

-- =====================================================================
-- audit_log: append-only history
-- =====================================================================
create table audit_log (
  id bigserial primary key,
  table_name text not null,
  record_id uuid,
  action text not null check (action in ('insert', 'update', 'delete')),
  changed_by uuid references users(id),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_log_table_record on audit_log(table_name, record_id);
create index idx_audit_log_created on audit_log(created_at desc);

-- =====================================================================
-- updated_at auto-touch trigger function
-- =====================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to every table with updated_at
do $$
declare
  t text;
begin
  for t in
    select table_name from information_schema.columns
    where table_schema = 'public' and column_name = 'updated_at'
  loop
    execute format('create trigger trg_%I_set_updated_at before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;
