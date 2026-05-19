-- Patch 14 (2026-05-15 Billing build).
--
-- Lift the paid-only constraint on `invoices.status` so the new `/billing`
-- ledger can show unpaid rows. Two-state machine only — `paid` / `unpaid`.
-- No `due`, `overdue`, or `draft` (would create demo confusion per the
-- 2026-05-15 lock). Mark-paid is manual status tracking only; payments are
-- still cleared at the desk (no in-app processing).

ALTER TABLE public.invoices DROP CONSTRAINT invoices_status_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('paid', 'unpaid'));

-- `paid_at` is required when status = 'paid', NULL when 'unpaid'.
ALTER TABLE public.invoices ALTER COLUMN paid_at DROP NOT NULL;
ALTER TABLE public.invoices ALTER COLUMN paid_at DROP DEFAULT;
