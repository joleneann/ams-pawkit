import { supabase } from './client';

async function main() {
  console.log('Resetting all data via reset_all_data() RPC...');
  const { error } = await supabase.rpc('reset_all_data');
  if (error) {
    console.error('Reset failed:', error.message);
    process.exit(1);
  }
  console.log('✓ All public-table data reset.');
}

main();
