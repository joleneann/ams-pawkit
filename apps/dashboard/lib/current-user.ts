import { supabase } from './supabase';

/**
 * v0 demo: there is no real auth flow yet. The dashboard always renders
 * as "the vet" (Dr Sagar). Look up the vet user row by role at request time.
 *
 * Replace with proper Supabase Auth in v0.1+.
 */
export async function getCurrentVet() {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, language')
    .eq('role', 'vet')
    .single();

  if (error || !data) {
    throw new Error(`Failed to load vet user: ${error?.message ?? 'no vet row found in users table'}`);
  }

  return data;
}

/**
 * Look up the AMS clinic row (single clinic in v0).
 */
export async function getCurrentClinic() {
  const { data, error } = await supabase
    .from('clinics')
    .select('id, name, location')
    .single();

  if (error || !data) {
    throw new Error(`Failed to load clinic: ${error?.message ?? 'no clinic row found'}`);
  }

  return data;
}
