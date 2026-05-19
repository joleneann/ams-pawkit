## Schema (14 tables across migrations 0001-0007)

> **0007 reconstruction note:** `0007_security_hardening.sql` was applied directly to prod 2026-05-17, but the source file was never committed. Reconstructed on disk 2026-05-18 from the description in `status.md` + `CLAUDE.md`. Marked as a reconstruction in its header. **Run against staging first** to confirm idempotency before treating as canonical. See `docs/tech-debt-plan.md` F006-A.

`clinics, users, households, pets, visits, vaccinations, invoices, invoice_line_items, messages, follow_up_windows, broadcasts, broadcasts_read, health_kits, audit_log`. Full DDL in the user's schema doc, applied with **sixteen patches** (1-13 in `0001_init_schema.sql`; 14 in `0005_invoice_unpaid_status.sql` for the Billing build 2026-05-15; 15 in `0006_storage_rls.sql` for Storage RLS by household 2026-05-16; 16 in `0007_security_hardening.sql` for clinics public-read + function search_path pinning + revoking dangerous RPC executes 2026-05-17, file reconstructed 2026-05-18):

### Patch 1: drop `clinics.primary_color`
Berry #9C2B5C is a brand constant (mauve v1.4 hero, locked 2026-05-15 evening; was Teal #006D6F under v1.3, Lime under v1.2), not per-clinic. Making it per-clinic violates §1 of the design doc.

### Patch 2: add override-tracking columns to `pets`
```sql
alter table pets
  add column algorithm_match_primary text,
  add column algorithm_match_secondary text,
  add column algorithm_confidence numeric(3,2),
  add column user_override_at timestamptz;
```
Keep existing `fur_match_primary/secondary/is_auto_pair` as the **user-visible result**. The `algorithm_*` fields capture the algorithm's pick separately. Diff is the training signal §7.4 was set up to capture.

### Patch 3: update demo seed references
Mehta family replaced with Fernandes family throughout seed scripts. Four pets (Raffy, Gabby, Angel, Galaxy), photo-determined matches.

### Patch 4: drop voice fields (no voice anywhere in v0)
```sql
alter table broadcasts drop column audio_url;
alter table health_kits drop column voice_note_url, drop column voice_note_language;
alter table users drop column vet_voice_sample_url;
alter table messages drop column if exists audio_message_url;
```
All communication is text-only. Health Kit is text + photos + visual timeline. Broadcasts are text. Schema simplified accordingly.

### Patch 5: add bilingual content fields where needed
Health Kit and Broadcast tables get bilingual variants of user-facing text:
```sql
alter table health_kits
  rename column name to name_en;
alter table health_kits add column name_mr text;
alter table health_kits rename column description_text to description_text_en;
alter table health_kits add column description_text_mr text;
-- repeat for what_includes, what_to_bring (jsonb arrays of bilingual strings)

alter table broadcasts
  rename column composed_message_text to composed_message_text_en;
alter table broadcasts add column composed_message_text_mr text;
alter table broadcasts drop column composed_message_language; -- redundant with bilingual fields
```
The parent app reads either `_en` or `_mr` based on user's language toggle.

### Patch 6: clinical-lock on pet identity (parent-flows decision May 2)
```sql
alter table pets add column clinical_lock boolean not null default false;
-- Or computed via trigger: set true when first row inserted into visits for that pet.
-- Implementation TBD; either approach is acceptable.
```
Once clinical records exist for a pet, parent-side edits to `name / breed / sex / birthday-or-age` are blocked. Photo and avatar remain editable. Reason: preserves clinical record integrity. Admin UI surfaces lock status; parent UI hides edit affordances on locked pets.

### Patch 7: server-side broadcast read state (parent-flows decision May 2)
```sql
create table broadcasts_read (
  broadcast_id uuid not null references broadcasts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (broadcast_id, user_id)
);
```
Read state syncs across devices for the parent. Tap on Phone A leaves Phone B already showing the broadcast as read. Inbox feed renders a row as "unread" iff no `broadcasts_read` row exists for `(broadcast_id, current_user_id)`.

### Patch 8: enable media attachments on `messages` (parent-side photos and videos)
```sql
alter table messages add column attachment_url text;
alter table messages add column attachment_type text check (attachment_type in ('image', 'video'));
```
Photo and video attachments on parent-side messages (videos locked 2026-05-08).
Vet-side messages remain text-only. NO voice on either side. Storage buckets:
`messages-images` for photos, `messages-videos` for videos (private, RLS by
household for both). See `docs/supabase-config.md`.

### Patch 9: Health Kit shape revision (May 4): educational content + virality

**Course-correction over earlier session.** A Health Kit is **educational content the vet authors for pet parents** (e.g. "How to care for your dog in the summer"), NOT a bookable service bundle. Every kit is shareable to non-Pawkit users via WhatsApp / Social / Email. Kits are the **virality layer** for Pawkit.

```sql
-- Drop wrongly-invented columns (idempotent if columns absent)
alter table health_kits drop column if exists what_includes;
alter table health_kits drop column if exists what_to_bring;
alter table health_kits drop column if exists timeline_week_cards;
alter table health_kits drop column if exists pricing;
alter table health_kits drop column if exists pricing_currency;

-- Cover now optional
alter table health_kits alter column cover_image_url drop not null;

-- New content sections (bilingual)
alter table health_kits add column key_points_en jsonb not null default '[]'::jsonb;
alter table health_kits add column key_points_mr jsonb;
alter table health_kits add column warning_signs_en text;
alter table health_kits add column warning_signs_mr text;
alter table health_kits add column escalation_en text;
alter table health_kits add column escalation_mr text;

-- Virality layer
alter table health_kits add column share_count integer not null default 0;
alter table health_kits add column public_slug text unique;

-- Index for public-slug lookup on published kits
create index idx_health_kits_public_slug on health_kits(public_slug) where published = true;
```

**Final Health Kit fields:**
- `id`, `clinic_id`, `vet_id`, `created_at`, `updated_at`
- `cover_image_url` (OPTIONAL; Ink-faint placeholder if absent)
- `title_en` (req) + `title_mr`
- `key_points_en` (req, jsonb array) + `key_points_mr`
- `body_en` (req) + `body_mr` (long-form, may include inline citation links)
- `warning_signs_en` + `warning_signs_mr` (red-flag symptoms section)
- `escalation_en` + `escalation_mr` (when to call the clinic)
- `share_count` (default 0, virality metric)
- `public_slug` (unique, used in public reading URL; URL path was `/kits/[slug]` post-Patch 9, renamed to `/announcements/[slug]` in Patch 11)
- `published` (boolean) + `published_at` (timestamp)

**v1+ extension noted (NOT in v0):** premium / paid kits, re-add a nullable `price_inr` column.

### Patch 10: unify broadcasts + health_kits, extract pet_reminders (May 10)

**Path-changing decision (locked 2026-05-10).** Collapse the broadcast/Kit content split into a single `health_kits` table, and extract per-pet automated reminders out of the `messages` stream into a new dedicated `pet_reminders` table. (Naming was kept as "Health Kit" here; reversed in Patch 11 where the table renames to `announcements` for parity with the parent app's Announcements tab.)

```sql
-- Drop broadcasts (table + per-user read-state join)
drop table if exists broadcasts_read;
drop table if exists broadcasts;

-- Widen health_kits to support short-form (one-line clinic notices)
alter table health_kits alter column body_en drop not null;
alter table health_kits alter column body_mr drop not null;
-- (cover_image_url, key_points_*, warning_signs_*, escalation_* already nullable from Patch 9)

-- Audience filter on health_kits (was on broadcasts)
alter table health_kits add column audience_filter jsonb;
-- jsonb shape: { species?: string[], age_range?: [number, number], exclude_deceased?: boolean }
-- null = all parents in the clinic-household relationship

-- Per-user read state on health_kits (mirrors prior broadcasts_read shape, renamed)
create table health_kits_read (
  health_kit_id uuid not null references health_kits(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (health_kit_id, user_id)
);

-- New table: pet_reminders (extracted from messages stream)
create table pet_reminders (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  type text not null check (type in ('vaccination', 'annual_checkup', 'custom')),
  title_en text not null,
  title_mr text not null,
  body_en text,
  body_mr text,
  due_date date not null,
  status text not null default 'active' check (status in ('active', 'acted_on', 'dismissed')),
  created_at timestamptz not null default now(),
  acted_on_at timestamptz
);
create index idx_pet_reminders_pet_status on pet_reminders(pet_id, status, due_date);

-- messages cleanup: cron-inserted reminder rows stop landing here.
-- Vaccination cron retargets from inserting into messages to inserting into pet_reminders.
-- The follow-up-window-close end-of-window notification message is unaffected by this patch.
-- (no DDL change to messages itself.)
```

**Behaviour changes that ride on this patch:**
- Vercel vaccination cron (Day 6) now writes a `pet_reminders` row instead of a `messages` row.
- Parent inbox thread renderer reads from both `messages` (conversational vet ↔ parent bubbles) and `pet_reminders` (centered system reminder cards), merging chronologically by timestamp. The schema cleanup is purely backend: from a parent's perspective, the thread still shows reminder cards inline alongside vet replies as before.
- Pet Page Reminder banner reads from `pet_reminders` (was indirectly from `messages` before).
- Announcements tab card render: one card grammar (was: broadcast body card OR broadcast-with-attached-kit card). Underlying content always comes from one `health_kits` row.
- Dashboard left rail: Broadcasts entry collapses into Health Kits.
- Reminder push notification fires on `pet_reminders` insert; deep-links to the relevant Pet Page section.
- WhatsApp delivery for reminders flagged as v1+ (when WhatsApp integration lands; out of scope for v0).

### Patch 11: rename health_kits → announcements (May 11)

**Path-changing decision (locked 2026-05-11).** Rename the unified content table from `health_kits` to `announcements` for parity with the parent app's Announcements tab. User-facing vocabulary becomes "Announcement" everywhere (vet's compose rail, dashboard composer heading, parent reading view), matching the tab name. Schema rename is intentional even though `health_kits` is invisible to non-developers; consistency between table name and product noun reduces future drift.

```sql
-- Rename main table
alter table health_kits rename to announcements;

-- Rename per-user read-state join + its FK column
alter table health_kits_read rename to announcements_read;
alter table announcements_read rename column health_kit_id to announcement_id;

-- Recreate public-slug index under the new name
drop index if exists idx_health_kits_public_slug;
create index idx_announcements_public_slug on announcements(public_slug) where published = true;
```

**Behaviour changes that ride on this patch:**
- Public reading URL becomes `pawkit.app/announcements/[slug]` (was `pawkit.app/kits/[slug]` per Patch 9). When the Next.js route is built, the directory will be `apps/dashboard/app/announcements/[slug]/`.
- Dashboard left rail label becomes "Announcements" (was "Health Kits" per Patch 10).
- All in-code references plan to use Announcement vocabulary (component names, type names, hook names); no code exists yet for v0 build, so this is a forward direction, not a refactor.
- Parent app Announcements tab is unchanged in name (already "Announcements"); only the noun for individual cards changes from "Health Kit" to "Announcement".
- Patches 1-10 retain their `health_kits` references because they describe the schema at the time of authoring; readers follow the patch sequence to end at the current state.

### Patch 12: rename announcements → broadcasts (May 11)

**Path-changing decision (locked 2026-05-11; third rename in 48 hours).** Rename the unified content table from `announcements` back to `broadcasts` for parity with the parent app's bottom-nav tab (which also renames from "Announcements" to "Broadcasts") and the Phosphor `Megaphone` icon (was Lucide `megaphone` before the 2026-05-15 evening icon-kit swap). User-facing label becomes "Broadcast" everywhere.

**Naming history:** pre-unification there was a `broadcasts` table (one of two content types alongside `health_kits`). Patch 10 dropped that table when collapsing both into `health_kits`. Patch 11 renamed `health_kits` to `announcements`. Patch 12 renames `announcements` to `broadcasts`, restoring the name but with the unified content shape (variable from short notice to long educational piece). Reader caution: the `broadcasts` table at end-of-history is NOT the same content shape as the `broadcasts` table dropped in Patch 10.

```sql
-- Rename main table
alter table announcements rename to broadcasts;

-- Rename per-user read-state join + its FK column
alter table announcements_read rename to broadcasts_read;
alter table broadcasts_read rename column announcement_id to broadcast_id;

-- Recreate public-slug index under the new name
drop index if exists idx_announcements_public_slug;
create index idx_broadcasts_public_slug on broadcasts(public_slug) where published = true;
```

**Behaviour changes that ride on this patch:**
- Public reading URL becomes `pawkit.app/broadcasts/[slug]` (was `pawkit.app/announcements/[slug]` per Patch 11). When the Next.js route is built, the directory will be `apps/dashboard/app/broadcasts/[slug]/`.
- Dashboard left rail label becomes "Broadcasts" (was "Announcements" per Patch 11).
- Parent app bottom-nav tab renames from "Announcements" to "Broadcasts" (Phosphor `Megaphone` icon (was Lucide `megaphone` before the 2026-05-15 evening icon-kit swap) unchanged).
- All in-code references plan to use Broadcast vocabulary (component names, type names, hook names).
- Naming rationale: Phosphor `Megaphone` icon (was Lucide `megaphone` before the 2026-05-15 evening icon-kit swap) fits broadcast semantics naturally; "Broadcast" implies one-way (locked discipline); short notices + long guides both fit the noun (TV broadcasts span news flashes to long-form documentaries).
- Patches 1-11 retain their references to whichever table name was current at the time of authoring; readers follow the patch sequence to end at the current state (`broadcasts`).

### Follow-up window durations (LOCKED v2, May 2)
- **Normal consultation: 0 days** (no follow-up window; questions handled at the desk during visit)
- **Special-case consultation: 48 hours** (vet flags this manually for chronic management / complex diagnosis / post-procedure concern)
- **Surgery: 3 days** (post-op concerns)
- **Vaccination: 0 days**
- **Grooming: 0 days** (not a clinical follow-up)
- **NO 'emergency' visit category** (dropped)
- **NO 'dental' or 'boarding' visit categories** (dental is a sub-activity of consultation/surgery; boarding is handled outside Pawkit)
- Vet can manually extend a window via dashboard (schema's `window_days` column already supports this).
- **On window close:** parent's composer is disabled for that thread, parent receives an end-of-window notification message, and the parent app shows the redirect copy ("AMS is walk-in only. Visit 9am to 9pm Mon-Sat. For urgent issues, call [clinic number].") if they expect a message surface. On Sagar's side the thread silently moves to pet history (no inbox visibility, accessible via pet profile).

---

### Patch 13: cover image on broadcasts (2026-05-15 composer rebuild)
```sql
alter table broadcasts add column if not exists cover_image_url text;
```
Optional public URL pointing at the existing `broadcast-covers` bucket under
key `broadcasts/<slug>-<timestamp>.<ext>`. Set by the cover-photo slot in the
new single-page composer (`/broadcasts/new`) for educational broadcasts;
NULL for quick announcements. Detail page renders the cover at 16:5 aspect.

### Patch 14: invoices accept `unpaid` + `paid_at` nullable (2026-05-15 Billing build)
```sql
alter table invoices drop constraint invoices_status_check;
alter table invoices add constraint invoices_status_check
  check (status in ('paid', 'unpaid'));
alter table invoices alter column paid_at drop not null;
alter table invoices alter column paid_at drop default;
```
Lifts the prior paid-only constraint so the new `/billing` ledger can show
unpaid rows. Two-state machine only (paid / unpaid); no `due` / `overdue` /
`draft` (would create demo confusion). `paid_at` is required when status =
'paid', NULL when 'unpaid'. Mark-paid action sets `paid_at = now()` +
`status = 'paid'`. 15 of 153 seeded invoices flipped to unpaid via SQL after
this migration for demo variety.

---

