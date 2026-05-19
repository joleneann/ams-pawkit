-- Pawkit v0: seed helper RPCs
-- Used by supabase/seed/seed.ts to compute timestamps relative to "now" so the
-- demo data always feels current regardless of when it was seeded.

-- Days ago helper (returns a timestamptz N days before now)
create or replace function days_ago(n integer)
returns timestamptz as $$
begin
  return now() - make_interval(days => n);
end;
$$ language plpgsql immutable;

-- Days ahead helper (for vaccination next-due-dates)
create or replace function days_ahead(n integer)
returns date as $$
begin
  return (current_date + make_interval(days => n))::date;
end;
$$ language plpgsql immutable;

-- Months ago helper (for visit cadence in synthetic data)
create or replace function months_ago(n integer)
returns date as $$
begin
  return (current_date - make_interval(months => n))::date;
end;
$$ language plpgsql immutable;

-- Reset everything (for `pnpm db:reset` development workflow)
-- WARNING: drops ALL rows from public tables. Service-role only.
create or replace function reset_all_data()
returns void as $$
begin
  delete from broadcasts_read;
  delete from broadcasts;
  delete from invoice_line_items;
  delete from invoices;
  delete from follow_up_windows;
  delete from messages;
  delete from vaccinations;
  delete from visits;
  delete from pets;
  delete from users where role in ('parent', 'staff');
  delete from health_kits;
  delete from households;
  delete from users where role = 'vet';
  delete from clinics;
  delete from audit_log;
end;
$$ language plpgsql security definer;

revoke execute on function reset_all_data from public;
revoke execute on function reset_all_data from anon;
-- service_role retains execute by default (function is SECURITY DEFINER)
