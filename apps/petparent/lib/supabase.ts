import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in apps/petparent/.env.local');
}

/**
 * Supabase client for the Pawkit parent native app (Expo).
 * Uses the public anon key. RLS policies enforce row-level security.
 *
 * v0 demo mode: real auth not implemented. The parent app hardcodes
 * "the Fernandes household" via lookup (anchor demo household). See lib/current-household.ts.
 */
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
