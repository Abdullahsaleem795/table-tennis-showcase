// One-time backfill: every object already in the "showcase-media" bucket was
// uploaded without a cacheControl option, so Supabase serves it with
// "Cache-Control: no-cache" — every page view re-downloads every image from
// origin. This re-uploads each existing object in place (same bytes, same
// path) with a 1-year immutable cache header. Filenames are unique per
// upload and never reused, so this is safe.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.production') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') }); // Fallback

const { supabase, isSupabaseConfigured } = require('../src/config/supabase');

const BUCKET = 'showcase-media';
const CACHE_CONTROL = '31536000'; // 1 year

async function listAllFiles(prefix = '') {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 });
  if (error) {
    console.error(`Error listing "${prefix}":`, error.message);
    return [];
  }

  let files = [];
  for (const entry of data) {
    // Folders come back with id === null in supabase-js
    const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) {
      files = files.concat(await listAllFiles(fullPath));
    } else {
      files.push({ path: fullPath, mimetype: entry.metadata?.mimetype, size: entry.metadata?.size });
    }
  }
  return files;
}

async function run() {
  if (!isSupabaseConfigured()) {
    console.error('ABORT: Supabase is not configured.');
    process.exit(1);
  }

  console.log('Listing existing objects in bucket...');
  const files = await listAllFiles();
  console.log(`Found ${files.length} objects to check.\n`);

  let fixed = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const { data: blob, error: dlError } = await supabase.storage.from(BUCKET).download(file.path);
      if (dlError || !blob) {
        console.error(`[SKIP] ${file.path}: download failed - ${dlError?.message}`);
        skipped++;
        continue;
      }

      const buffer = Buffer.from(await blob.arrayBuffer());
      const { error: upError } = await supabase.storage.from(BUCKET).update(file.path, buffer, {
        contentType: file.mimetype || blob.type || 'application/octet-stream',
        cacheControl: CACHE_CONTROL,
        upsert: true
      });

      if (upError) {
        console.error(`[FAIL] ${file.path}: ${upError.message}`);
        failed++;
      } else {
        console.log(`[OK]   ${file.path} (${(file.size / 1024).toFixed(0)}KB)`);
        fixed++;
      }
    } catch (err) {
      console.error(`[FAIL] ${file.path}:`, err.message);
      failed++;
    }
  }

  console.log(`\nDone. Fixed: ${fixed}, Skipped: ${skipped}, Failed: ${failed}`);
}

run();
