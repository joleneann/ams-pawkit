import { supabase } from './supabase';

/**
 * v0 demo: there is no real auth flow yet. The parent app always renders
 * as the Fernandes household (the demo anchor). Look up by household name.
 *
 * Replace with proper Supabase Auth + per-user household lookup in v0.1+.
 */
export async function getCurrentHousehold() {
  const { data, error } = await supabase
    .from('households')
    .select('id, name, address, phone')
    .eq('name', 'The Fernandes Family')
    .single();

  if (error || !data) {
    throw new Error(`Failed to load Fernandes household: ${error?.message ?? 'household not found in seed data'}`);
  }

  return data;
}

/**
 * Get the primary parent user for the current household.
 * In v0 demo: returns the first parent user under Fernandes household.
 */
export async function getCurrentParent(householdId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, phone, preferred_language, avatar_url')
    .eq('household_id', householdId)
    .eq('role', 'parent')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error(`Failed to load parent user: ${error?.message ?? 'no parent user in household'}`);
  }

  return data;
}

/**
 * Get all pets for the current household (Fernandes by default in v0).
 * Returns Raffy (deceased/memorial), Gabby, Angel, Galaxy.
 */
export async function getHouseholdPets(householdId: string) {
  const { data, error } = await supabase
    .from('pets')
    .select(`
      id,
      name,
      species,
      breed,
      sex,
      birthday,
      avatar_url,
      fur_match_primary,
      fur_match_secondary,
      is_auto_pair,
      deceased,
      deceased_at,
      clinical_lock,
      chronic_conditions,
      allergies
    `)
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load pets: ${error.message}`);
  }

  return data ?? [];
}
