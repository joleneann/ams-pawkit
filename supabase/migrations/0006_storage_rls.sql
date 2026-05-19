-- Pawkit v0: Storage RLS policies
-- Patch 15 (2026-05-16). Day-1 carryover per docs/build-order.md.
--
-- Until this migration, `storage.objects` had zero policies, so the
-- supabase-config.md claim of "RLS by household" was aspirational
-- (project_storage_rls memory). This migration backfills the four buckets
-- referenced in supabase-config.md "Storage buckets":
--
--   pet-photos          public read   · authenticated write
--   messages-images     private       · RLS by household
--   messages-videos     private       · RLS by household
--   broadcast-covers    public read   · authenticated write (vet-only path)
--
-- Conventions:
--   - Object path schema for household-scoped buckets is `<household_id>/<filename>`.
--     The first folder segment is the gating key for SELECT/INSERT/UPDATE/DELETE.
--   - For public-read buckets, anon can SELECT. INSERT/UPDATE/DELETE requires
--     the authenticated role with appropriate scope.
--   - `service_role` bypasses RLS entirely; seed scripts continue to work.

-- =====================================================================
-- pet-photos  (public read · authenticated write)
-- =====================================================================
create policy "pet-photos public read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'pet-photos');

create policy "pet-photos authenticated write"
on storage.objects for insert
to authenticated
with check (bucket_id = 'pet-photos');

create policy "pet-photos owner update"
on storage.objects for update
to authenticated
using (bucket_id = 'pet-photos' and owner = auth.uid())
with check (bucket_id = 'pet-photos' and owner = auth.uid());

create policy "pet-photos owner delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'pet-photos' and owner = auth.uid());

-- =====================================================================
-- messages-images  (private · RLS by household)
-- Path schema: `<household_id>/<message_id>-<timestamp>.<ext>`
-- =====================================================================
create policy "messages-images parent read own household"
on storage.objects for select
to authenticated
using (
  bucket_id = 'messages-images'
  and (storage.foldername(name))[1] = (
    select household_id::text
    from public.users
    where id = auth.uid()
  )
);

create policy "messages-images parent write own household"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'messages-images'
  and (storage.foldername(name))[1] = (
    select household_id::text
    from public.users
    where id = auth.uid()
  )
);

create policy "messages-images parent update own household"
on storage.objects for update
to authenticated
using (
  bucket_id = 'messages-images'
  and (storage.foldername(name))[1] = (
    select household_id::text
    from public.users
    where id = auth.uid()
  )
)
with check (
  bucket_id = 'messages-images'
  and (storage.foldername(name))[1] = (
    select household_id::text
    from public.users
    where id = auth.uid()
  )
);

create policy "messages-images parent delete own household"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'messages-images'
  and (storage.foldername(name))[1] = (
    select household_id::text
    from public.users
    where id = auth.uid()
  )
);

-- Clinic staff (vet, staff) read all images attached to their clinic's threads
create policy "messages-images clinic staff read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'messages-images'
  and exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role in ('vet', 'staff')
      and (storage.foldername(name))[1] in (
        select h.id::text
        from public.households h
        join public.pets p on p.household_id = h.id
        where p.clinic_id = u.clinic_id
      )
  )
);

-- =====================================================================
-- messages-videos  (private · RLS by household)
-- Same anatomy as messages-images, locked 2026-05-08 with the parent-side
-- video bubble.
-- =====================================================================
create policy "messages-videos parent read own household"
on storage.objects for select
to authenticated
using (
  bucket_id = 'messages-videos'
  and (storage.foldername(name))[1] = (
    select household_id::text
    from public.users
    where id = auth.uid()
  )
);

create policy "messages-videos parent write own household"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'messages-videos'
  and (storage.foldername(name))[1] = (
    select household_id::text
    from public.users
    where id = auth.uid()
  )
);

create policy "messages-videos parent update own household"
on storage.objects for update
to authenticated
using (
  bucket_id = 'messages-videos'
  and (storage.foldername(name))[1] = (
    select household_id::text
    from public.users
    where id = auth.uid()
  )
)
with check (
  bucket_id = 'messages-videos'
  and (storage.foldername(name))[1] = (
    select household_id::text
    from public.users
    where id = auth.uid()
  )
);

create policy "messages-videos parent delete own household"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'messages-videos'
  and (storage.foldername(name))[1] = (
    select household_id::text
    from public.users
    where id = auth.uid()
  )
);

create policy "messages-videos clinic staff read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'messages-videos'
  and exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role in ('vet', 'staff')
      and (storage.foldername(name))[1] in (
        select h.id::text
        from public.households h
        join public.pets p on p.household_id = h.id
        where p.clinic_id = u.clinic_id
      )
  )
);

-- =====================================================================
-- broadcast-covers  (public read · vet-only write)
-- Broadcast cover images are part of the public broadcast reading view at
-- pawkit.app/broadcasts/[slug], so anon can SELECT.
-- =====================================================================
create policy "broadcast-covers public read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'broadcast-covers');

create policy "broadcast-covers vet write"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'broadcast-covers'
  and exists (
    select 1 from public.users
    where id = auth.uid() and role in ('vet', 'staff')
  )
);

create policy "broadcast-covers vet update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'broadcast-covers'
  and exists (
    select 1 from public.users
    where id = auth.uid() and role in ('vet', 'staff')
  )
)
with check (
  bucket_id = 'broadcast-covers'
  and exists (
    select 1 from public.users
    where id = auth.uid() and role in ('vet', 'staff')
  )
);

create policy "broadcast-covers vet delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'broadcast-covers'
  and exists (
    select 1 from public.users
    where id = auth.uid() and role in ('vet', 'staff')
  )
);

-- =====================================================================
-- Smoke test (run after `supabase db push`):
--
--   SELECT polname, polcmd, polroles::text[]
--   FROM pg_policy
--   WHERE polrelid = 'storage.objects'::regclass
--   ORDER BY polname;
--
-- Should return ~17 policies. If empty, RLS is still aspirational.
-- =====================================================================
