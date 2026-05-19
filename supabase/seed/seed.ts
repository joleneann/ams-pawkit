import { supabase } from './client';
import { ensureBuckets } from './storage';
import { seedClinicAndVet } from './clinic-and-vet';
import { seedFernandes } from './fernandes';
import { seedHealthKits } from './health-kits';
import { seedBroadcasts } from './broadcasts';
import { seedSyntheticPune } from './synthetic';

async function main() {
  const start = Date.now();
  console.log('Pawkit v0 seed: starting...\n');

  console.log('1. Ensuring Storage buckets exist...');
  await ensureBuckets();

  console.log('\n2. Resetting public-table data (idempotent)...');
  const { error: resetError } = await supabase.rpc('reset_all_data');
  if (resetError) throw new Error(`reset_all_data failed: ${resetError.message}`);
  console.log('  ✓ reset complete');

  console.log('\n3. Seeding clinic + vet...');
  const { clinicId, vetId } = await seedClinicAndVet();

  console.log('\n4. Seeding Fernandes anchor (Phase 4a)...');
  await seedFernandes(clinicId, vetId);

  console.log('\n5. Seeding 3 educational Health Kits (Patch 9 shape)...');
  const kitIds = await seedHealthKits(clinicId, vetId);

  console.log('\n6. Seeding 3 broadcasts (one with attached kit)...');
  await seedBroadcasts(clinicId, vetId, kitIds);

  console.log('\n7. Seeding synthetic Pune dataset (Phase 4b: 199 pets / 149 households)...');
  await seedSyntheticPune(clinicId, vetId);

  // Quick verification
  console.log('\n8. Verification counts:');
  for (const table of ['clinics', 'users', 'households', 'pets', 'visits', 'vaccinations', 'invoices', 'invoice_line_items', 'messages', 'follow_up_windows', 'broadcasts', 'health_kits']) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`  ${String(count ?? 0).padStart(4)}  ${table}`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✓ Seed complete in ${elapsed}s`);
}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err);
  process.exit(1);
});
