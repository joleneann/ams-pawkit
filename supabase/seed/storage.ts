import { supabase } from './client';

interface BucketConfig {
  name: string;
  public: boolean;
  description: string;
}

const BUCKETS: BucketConfig[] = [
  { name: 'pet-photos', public: true, description: 'Pet profile photos (fur-match upload)' },
  { name: 'messages-images', public: false, description: 'Image attachments on parent messages (Patch 8)' },
  { name: 'messages-videos', public: false, description: 'Video attachments on parent messages (Patch 8)' },
  { name: 'kit-covers', public: true, description: 'Health Kit cover images (optional per Patch 9)' },
  { name: 'broadcast-attachments', public: true, description: 'Files attached to broadcasts' },
];

/** Idempotently ensure all 5 v0 buckets exist. */
export async function ensureBuckets(): Promise<void> {
  const { data: existing, error } = await supabase.storage.listBuckets();
  if (error) throw error;

  const existingNames = new Set((existing ?? []).map((b) => b.name));

  for (const bucket of BUCKETS) {
    if (existingNames.has(bucket.name)) {
      console.log(`  ✓ bucket exists: ${bucket.name}`);
      continue;
    }
    const { error: createError } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
    });
    if (createError) {
      console.error(`  ✗ failed to create bucket ${bucket.name}:`, createError.message);
      throw createError;
    }
    console.log(`  + created bucket: ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
  }
}
