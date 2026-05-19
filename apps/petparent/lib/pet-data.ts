import { supabase } from './supabase';

/**
 * Get a specific pet by name within a household.
 * v0 demo: typically used to fetch Gabby for the Pet Page demo.
 */
export async function getPetByName(householdId: string, petName: string) {
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
      allergies,
      created_at
    `)
    .eq('household_id', householdId)
    .eq('name', petName)
    .single();

  if (error || !data) {
    throw new Error(`Failed to load pet "${petName}": ${error?.message ?? 'pet not found'}`);
  }
  return data;
}

/**
 * Get the visit timeline for a pet, most recent first.
 */
export async function getPetVisits(petId: string) {
  const { data, error } = await supabase
    .from('visits')
    .select('id, visit_type, visit_date, chief_complaint, diagnosis')
    .eq('pet_id', petId)
    .order('visit_date', { ascending: false });

  if (error) throw new Error(`Failed to load visits: ${error.message}`);
  return data ?? [];
}

/**
 * Get the active (open) follow-up window for a pet, if any.
 * Returns null if no open window.
 */
export async function getActiveFollowUp(petId: string) {
  const { data, error } = await supabase
    .from('follow_up_windows')
    .select('id, opened_at, closes_at, window_days')
    .eq('pet_id', petId)
    .is('closed_at', null)
    .order('opened_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to load follow-up: ${error.message}`);
  return data;
}

/**
 * Get the clinic's vet (Dr Sagar in v0).
 */
export async function getClinicVet() {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, vet_license, avatar_url')
    .eq('role', 'vet')
    .single();

  if (error || !data) throw new Error(`Failed to load vet: ${error?.message ?? 'no vet'}`);
  return data;
}

/**
 * Render the warm short form of a vet's name: title plus first name.
 * "Dr Sagar Bhongale" becomes "Dr Sagar". Falls back to "Dr Sagar" if name is missing.
 */
export function shortVetName(fullName: string | null | undefined): string {
  if (!fullName) return 'Dr Sagar';
  const parts = fullName.split(' ').filter(Boolean);
  if (parts[0]?.replace(/\.$/, '').toLowerCase() === 'dr') {
    return parts[1] ? `Dr ${parts[1]}` : 'Dr Sagar';
  }
  return parts[0] ?? 'Dr Sagar';
}

/**
 * Format a pet's age from birthday (YYYY-MM-DD).
 * Returns "5 years" or "8 months" etc.
 */
export function formatAge(birthday: string | null): string {
  if (!birthday) return '';
  const bd = new Date(birthday);
  const now = new Date();
  const ms = now.getTime() - bd.getTime();
  const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
  if (years >= 1) return `${years} year${years === 1 ? '' : 's'}`;
  const months = Math.floor(ms / (1000 * 60 * 60 * 24 * 30.44));
  return `${months} month${months === 1 ? '' : 's'}`;
}

/**
 * Format a date as "14 Mar" (short month, day). Matches the mockup's timeline cards.
 */
export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Format the open-follow-up close date as a warm sentence date.
 * Returns "2 May" style. For use in "Dr Sagar is here for Gabby until 2 May".
 */
export function formatFollowUpDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Map a fur token name (lowercase string from DB) to the Pawkit hex value.
 * Used to render the 3px accent ring on Pet Page covers and avatars.
 */
export const FUR_HEX: Record<string, string> = {
  milk: '#FFFCF2',
  vanilla: '#EAE0C8',
  honey: '#E5C896',
  peach: '#E8A87C',
  rust: '#B05E2E',
  mushroom: '#A8927A',
  smoke: '#8B928A',
  steel: '#5F6961',
  bark: '#5C4A3A',
  sable: '#2B221A',
};
