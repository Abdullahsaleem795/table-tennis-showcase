require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const { supabase, isSupabaseConfigured } = require('../src/config/supabase');
const playerService = require('../src/services/playerService');
const dbConfig = require('../src/config/db');

async function migrateBase64(base64String, folder) {
  if (!base64String || !base64String.startsWith('data:')) return base64String;
  
  const matches = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches) return base64String;

  const mimeType = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  
  let ext = '.bin';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
  else if (mimeType.includes('png')) ext = '.png';
  else if (mimeType.includes('webp')) ext = '.webp';
  else if (mimeType.includes('mp4')) ext = '.mp4';
  else if (mimeType.includes('webm')) ext = '.webm';

  const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
  
  console.log(`  -> Uploading ${mimeType} to Supabase: ${fileName}`);
  const { data: uploadData, error } = await supabase.storage
    .from('showcase-media')
    .upload(fileName, buffer, {
      contentType: mimeType,
      upsert: false
    });

  if (error) {
    console.error(`  -> Failed to upload ${fileName}:`, error.message);
    return base64String;
  }

  const { data: publicUrlData } = supabase.storage
    .from('showcase-media')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

async function runMigration() {
  console.log("Starting Image Migration Script...");
  await dbConfig.connectDB();

  if (!isSupabaseConfigured()) {
    console.error("Supabase is not configured. Aborting migration.");
    process.exit(1);
  }

  // Fetch all players without pagination
  const players = await playerService.getAll();
  console.log(`Found ${players.length} total players.`);

  // 1. Create a local backup file so no Base64 data is lost!
  const backupDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `players_backup_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(players, null, 2), 'utf8');
  console.log(`\n[BACKUP CREATED] Original player data (including Base64 strings) saved to:\n${backupPath}`);
  console.log("Do NOT delete this backup file until you have verified the site works.\n");

  let migratedCount = 0;

  for (const player of players) {
    let needsUpdate = false;
    const updates = {};

    console.log(`Checking player: ${player.name} (ID: ${player.id || player._id})`);

    // 1. Avatar
    if (player.avatarUrl && player.avatarUrl.startsWith('data:')) {
      const newUrl = await migrateBase64(player.avatarUrl, 'avatars');
      if (newUrl !== player.avatarUrl) {
        updates.avatarUrl = newUrl;
        needsUpdate = true;
      }
    }

    // 2. Video
    if (player.promoVideo && player.promoVideo.type === 'base64' && player.promoVideo.url.startsWith('data:')) {
      const newUrl = await migrateBase64(player.promoVideo.url, 'videos');
      if (newUrl !== player.promoVideo.url) {
        updates.promoVideo = { type: 'supabase', url: newUrl };
        needsUpdate = true;
      }
    }

    // 3. Gallery
    if (player.gallery && player.gallery.length > 0) {
      const newGallery = [];
      let galleryUpdated = false;

      for (const item of player.gallery) {
        if (item && item.startsWith('data:')) {
          const newUrl = await migrateBase64(item, 'gallery');
          newGallery.push(newUrl);
          if (newUrl !== item) galleryUpdated = true;
        } else {
          newGallery.push(item);
        }
      }

      if (galleryUpdated) {
        updates.gallery = newGallery;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`  -> Saving updates for ${player.name} to database...`);
      await playerService.update(player.id || player._id, updates);
      migratedCount++;
    } else {
      console.log(`  -> No base64 media found to migrate.`);
    }
  }

  console.log(`\nMigration complete. Successfully migrated media for ${migratedCount} players.`);
  console.log("You can safely run this script multiple times; it skips non-base64 media.");
  process.exit(0);
}

runMigration().catch(console.error);
