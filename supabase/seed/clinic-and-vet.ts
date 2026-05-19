import { supabase } from './client';

/**
 * Insert AMS Pune clinic + Dr Sagar (the only vet in v0).
 * Returns the IDs for use by downstream seed steps.
 */
export async function seedClinicAndVet(): Promise<{ clinicId: string; vetId: string }> {
  // AMS Pune clinic (Patch 1: no primary_color)
  const { data: clinic, error: clinicErr } = await supabase
    .from('clinics')
    .insert({
      name: 'Animal Medical Services',
      address: 'Pune, Maharashtra',
      phone: '+91-2026123456',
      email: 'reception@ams.in',
      gst: '27AAACA0000A1Z5',
      license: 'MH-VET-2018-0042',
    })
    .select('id')
    .single();

  if (clinicErr || !clinic) throw new Error(`Clinic insert failed: ${clinicErr?.message}`);
  console.log(`  + clinic: AMS Pune (${clinic.id})`);

  // Dr Sagar (the only vet in v0)
  const { data: vet, error: vetErr } = await supabase
    .from('users')
    .insert({
      clinic_id: clinic.id,
      role: 'vet',
      full_name: 'Dr Sagar Bhongale',
      phone: '+91-9822012345',
      email: 'sagar@ams.in',
      vet_license: 'MH-VET-2010-0312',
      preferred_language: 'en',
    })
    .select('id')
    .single();

  if (vetErr || !vet) throw new Error(`Vet insert failed: ${vetErr?.message}`);
  console.log(`  + vet: Dr Sagar (${vet.id})`);

  // Joydev (staff)
  const { error: staffErr } = await supabase.from('users').insert({
    clinic_id: clinic.id,
    role: 'staff',
    full_name: 'Joydev',
    phone: '+91-9822098765',
    preferred_language: 'mr',
  });
  if (staffErr) throw new Error(`Staff insert failed: ${staffErr.message}`);
  console.log(`  + staff: Joydev`);

  return { clinicId: clinic.id, vetId: vet.id };
}
