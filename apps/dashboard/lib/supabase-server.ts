import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in apps/dashboard/.env.local"
  );
}

/**
 * SERVER-ONLY Supabase client for the AMS dashboard.
 * Uses the service-role key, bypasses RLS. NEVER imported from a client
 * component (the `server-only` import enforces this at build time).
 *
 * v0 demo rationale: dashboard is the vet view (sees all 199 households +
 * their messages + invoices + broadcasts). The parent app uses the anon
 * key + Fernandes-scoped RLS policies. With no auth in v0, this is the
 * cleanest way to scope visibility per app without per-user JWTs.
 * Replace with proper Supabase Auth + RLS-by-role in v0.1+.
 */
export const supabaseServer = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
