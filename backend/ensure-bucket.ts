import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

async function main() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  
  const bucketExists = buckets.some(b => b.name === 'docmind-documents');
  if (!bucketExists) {
    console.log('Creating bucket...');
    const { error: createError } = await supabase.storage.createBucket('docmind-documents', { public: true });
    if (createError) throw createError;
    console.log('Bucket created!');
  } else {
    console.log('Bucket already exists.');
  }
}
main().catch(console.error);
