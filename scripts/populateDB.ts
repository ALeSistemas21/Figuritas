import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read env variables manually since we might not have next.js environment loaded
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    acc[key] = value;
  }
  return acc;
}, {} as Record<string, string>);

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// We can extract all sticker IDs from figuData
import { STAR_PLAYERS } from '../app/utils/figuData';

const allStickerIds = Object.keys(STAR_PLAYERS);

async function main() {
  console.log("Fetching users from 'perfiles' table...");
  const { data: profiles, error } = await supabase.from('perfiles').select('id, nombre');
  
  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  console.log(`Found ${profiles.length} profiles. Generating collections...`);

  const TOTAL_STICKERS_COUNT = allStickerIds.length;

  for (const profile of profiles) {
    const collection: Record<string, number> = {};
    const numStickersToGenerate = Math.floor(Math.random() * 400) + 100;
    
    for (let i = 0; i < numStickersToGenerate; i++) {
      const randomId = allStickerIds[Math.floor(Math.random() * allStickerIds.length)];
      // Añadimos entre 1 y 4 unidades por iteración para asegurar repetidas masivas
      const qtyToAdd = Math.floor(Math.random() * 4) + 1;
      collection[randomId] = (collection[randomId] || 0) + qtyToAdd;
    }

    console.log(`Updating ${profile.nombre} (${profile.id}) with ${Object.keys(collection).length} unique stickers...`);
    
    const rowsToInsert = Object.entries(collection).map(([stickerId, qty]) => ({
      perfil_id: profile.id,
      sticker_id: stickerId,
      cantidad: qty
    }));

    // Upsert the collection rows
    const { error: upsertError } = await supabase
      .from('colecciones')
      .upsert(rowsToInsert);

    if (upsertError) {
      console.error(`Failed to update collections for ${profile.nombre}:`, upsertError);
      continue;
    }

    // Update completitud
    const ownedCount = Object.keys(collection).length;
    const completitud = Math.round((ownedCount / TOTAL_STICKERS_COUNT) * 100);

    const { error: profileError } = await supabase
      .from('perfiles')
      .update({ completitud })
      .eq('id', profile.id);

    if (profileError) {
      console.error(`Failed to update completitud for ${profile.nombre}:`, profileError);
    } else {
      console.log(`Successfully updated ${profile.nombre}. Completitud: ${completitud}%`);
    }
  }

  console.log("All profiles updated successfully!");
}

main().catch(console.error);
