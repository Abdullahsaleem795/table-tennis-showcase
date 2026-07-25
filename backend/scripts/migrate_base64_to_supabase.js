const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.production') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') }); // Fallback

const fs = require('fs');
const playerService = require('../src/services/playerService');
const { supabase, isSupabaseConfigured } = require('../src/config/supabase');

async function uploadBase64ToSupabase(base64String, folder = 'uploads') {
  if (!base64String || !base64String.startsWith('data:')) return base64String;
  if (!isSupabaseConfigured()) {
    console.error("Supabase is not configured. Cannot upload.");
    return base64String;
  }
  
  try {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error("Invalid base64 string format.");
      return base64String;
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    let ext = '.png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
    if (mimeType.includes('webp')) ext = '.webp';
    if (mimeType.includes('svg')) ext = '.svg';
    
    const fileName = `${folder}/migrated-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    
    const { data, error } = await supabase.storage
      .from('showcase-media')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
        cacheControl: '31536000'
      });
      
    if (error) {
      console.error("Supabase storage upload error:", error.message);
      return base64String; // Return original on failure
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('showcase-media')
      .getPublicUrl(fileName);
      
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Error uploading Base64 to Supabase:", err);
    return base64String;
  }
}

async function runMigration() {
  console.log("Starting Base64 to Supabase Storage Migration...");
  
  if (!isSupabaseConfigured()) {
    console.error("ABORT: Supabase is not configured. Check your environment variables.");
    process.exit(1);
  }
  
  try {
    // Get all players without pagination
    const { players } = await playerService.getAll(1, 10000, '');
    console.log(`Found ${players.length} players to check.`);
    
    let updatedCount = 0;
    
    for (const player of players) {
      let needsUpdate = false;
      const originalPlayer = { ...player };
      
      // Check avatar
      if (player.avatarUrl && player.avatarUrl.startsWith('data:image/')) {
        console.log(`[Player: ${player.name}] Migrating avatar...`);
        const newUrl = await uploadBase64ToSupabase(player.avatarUrl, 'avatars');
        if (newUrl && newUrl !== player.avatarUrl) {
          player.avatarUrl = newUrl;
          needsUpdate = true;
        }
      }
      
      // Check gallery images
      if (player.gallery && Array.isArray(player.gallery)) {
        for (let i = 0; i < player.gallery.length; i++) {
          const imgUrl = player.gallery[i];
          if (imgUrl && imgUrl.startsWith('data:image/')) {
            console.log(`[Player: ${player.name}] Migrating gallery image ${i + 1}/${player.gallery.length}...`);
            const newUrl = await uploadBase64ToSupabase(imgUrl, 'gallery');
            if (newUrl && newUrl !== imgUrl) {
              player.gallery[i] = newUrl;
              needsUpdate = true;
            }
          }
        }
      }
      
      if (needsUpdate) {
        console.log(`[Player: ${player.name}] Saving updated record...`);
        await playerService.update(player.id, player);
        updatedCount++;
      } else {
        console.log(`[Player: ${player.name}] No Base64 images found. Skipping.`);
      }
    }
    
    console.log(`\nMigration completed successfully! Updated ${updatedCount} player records.`);
    
  } catch (error) {
    console.error("\nMigration failed with error:", error);
  }
}

runMigration();
