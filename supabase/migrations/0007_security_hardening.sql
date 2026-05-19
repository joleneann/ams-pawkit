-- Pawkit v0 — Security hardening (Patch 16)
--
-- Reconstructed 2026-05-18 from `status.md` + `CLAUDE.md` descriptions of the
-- migration applied directly to prod on 2026-05-17. The original file was
-- never committed to `supabase/migrations/` — tracked as F006-A in
-- `docs/tech-debt-plan.md`.
--
-- What this migration is documented to do (per status.md):
--   1. Revoke anon/authenticated EXECUTE on `reset_all_data()` + `rls_auto_enable()`
--   2. Pin `search_path = ''` on six existing functions (security_definer best practice)
--   3. Add public-read policy on `clinics` (parent app needs clinic name/hours)
--
-- Recovery path: apply to STAGING first to confirm idempotency (should be a
-- no-op against the production DB since the changes are already there). If
-- staging matches prod, this file is faithful and can be committed as the
-- canonical 0007. If it diverges, run `pg_dump --schema-only --no-owner`
-- against prod, diff against this file, and reconcile.
--
-- Supabase advisor flags this resolved (11/11 per status.md):
--   - "Function Search Path Mutable" warnings (×6, one per function below)
--   - "Anonymous Access to Function" errors (×2: reset_all_data, rls_auto_enable)
--   - "Public Read Missing on clinics" info-level flag (×1)
--   - "Audit Log RLS-no-policy" remains INTENTIONAL (deferred to v1+ per
--      decisions-log audit_log entry; not in this migration)

-- =====================================================================
-- 1. Pin search_path on functions to prevent search-path manipulation attacks
-- =====================================================================
-- Functions from 0001_init_schema.sql
alter function public.set_clinical_lock() set search_path = '';
alter function public.set_updated_at() set search_path = '';

-- Functions from 0003_seed_helpers.sql
alter function public.days_ago(integer) set search_path = '';
alter function public.days_ahead(integer) set search_path = '';
alter function public.months_ago(integer) set search_path = '';
alter function public.reset_all_data() set search_path = '';

-- =====================================================================
-- 2. Revoke EXECUTE on dangerous RPCs from anon + authenticated
-- =====================================================================
-- reset_all_data() truncates the entire dataset; service-role only.
revoke execute on function public.reset_all_data() from anon, authenticated;

-- rls_auto_enable() existed in prod per the description but isn't on disk in
-- any earlier migration. If it doesn't exist when this runs, comment out
-- the next line — pg will error on REVOKE against a non-existent function.
-- TODO (F006-A verification): confirm whether rls_auto_enable() exists in
-- prod. If yes, the line below is correct. If no, drop it and the doc claim
-- in status.md is also stale.
revoke execute on function public.rls_auto_enable() from anon, authenticated;

-- =====================================================================
-- 3. Public read on clinics (parent app reads clinic name + hours)
-- =====================================================================
create policy "Public read on clinics"
on clinics for select
using (true);
