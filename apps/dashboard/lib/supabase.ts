import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/dashboard/.env.local');
}

/**
 * Browser/server Supabase client for the AMS dashboard.
 * Uses the public anon key. RLS policies enforce row-level security.
 *
 * v0 demo mode: real auth not implemented yet. The dashboard hardcodes
 * "the vet" via lookup (single vet row in the seed). See lib/current-user.ts.
 */
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
