import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://ahitvfafdnvmkkfvghbe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaXR2ZmFmZG52bWtrZnZnaGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODkyMjQsImV4cCI6MjA4Nzk2NTIyNH0.PmkiaDe0DyLDjoVGxcaKjo96i6K_aQsODX18da95V3Y';
const supabase = createClient(supabaseUrl, supabaseKey);

const STORAGE_BASE = 'https://ahitvfafdnvmkkfvghbe.supabase.co/storage/v1/object/public/product_images';
const IMAGE_DIR = 'C:\\Users\\Shashank Chauhan\\Downloads\\go to mart';

// Map: local filename (without extension) -> { dbProductName, storagePath }
const MATCHES = [
  { file: 'Catch Sprinkler Chat Masala.jpeg', dbName: 'Chat Masala', storagePath: 'spices/chat_masala.jpeg' },
  { file: 'Classic Non-Fruit Vinegar.jpeg', dbName: 'Vinegar', storagePath: 'condiments/vinegar.jpeg' },
  { file: 'Coca-Cola Original Taste.jpeg', dbName: 'Regular Coke', storagePath: 'beverages/regular_coke.jpeg' },
  { file: 'EveryDay Refined Iodised Salt.jpeg', dbName: 'Salt', storagePath: 'spices/salt.jpeg' },
  { file: 'EveryDay Spices Chicken Masala.jpeg', dbName: 'Chicken Masala', storagePath: 'spices/chicken_masala.jpeg' },
  { file: 'Keya Wonder Hot Red Chilli Flakes.jpeg', dbName: 'Chilli Flakes', storagePath: 'spices/chilli_flakes.jpeg' },
  { file: 'KEYA Dark Soya Sauce.jpeg', dbName: 'Soya Sauce', storagePath: 'condiments/soya_sauce.jpeg' },
  { file: 'Lifebuoy Expert Defence.jpeg', dbName: 'Lifebuoy Soap', storagePath: 'personal_care/lifebuoy_soap.jpeg' },
  { file: 'MTR Gulab Jamun.jpeg', dbName: 'Gulab Jamun', storagePath: 'sweets/gulab_jamun.jpeg' },
  { file: 'MTR Rasogolla.jpeg', dbName: 'Rasgulla', storagePath: 'sweets/rasgulla.jpeg' },
  { file: 'Mothers Recipe Mixed Fruit Jam.jpeg', dbName: 'Kissan Jam', storagePath: 'condiments/kissan_jam.jpeg' },
  { file: 'Samyang Buldak Carbonara Hot Chicken Flavor Ramen.jpeg', dbName: 'Buldak Ramen', storagePath: 'instant_foods/buldak_ramen.jpeg' },
  { file: 'Siginas EveryDay Spices Haldi Powder.jpeg', dbName: 'Turmeric Powder', storagePath: 'spices/turmeric_powder.jpeg' },
  { file: 'Sigmas EveryDay Spices Garam Masala.jpeg', dbName: 'Garam Masala', storagePath: 'spices/garam_masala.jpeg' },
  { file: 'Sigmas EveryDay Spices MIRCH POWDER.jpeg', dbName: 'Chilli Powder (100g)', storagePath: 'spices/chilli_powder_100g.jpeg' },
  { file: 'Sigmas Everyday Spices Meat Masala.jpeg', dbName: 'Meat Masala', storagePath: 'spices/meat_masala.jpeg' },
  { file: 'Softouch Fabric Conditioner Garden Bouquet.jpeg', dbName: 'Comfort Fabric Conditioner', storagePath: 'cleaning/comfort_fabric_conditioner.jpeg' },
  { file: 'Sprite Lemon-Lime.jpeg', dbName: 'Sprite', storagePath: 'beverages/sprite.jpeg' },
  { file: 'Sujhas EveryDay Spices Jeera Powder.jpeg', dbName: 'Jeera Powder', storagePath: 'spices/jeera_powder.jpeg' },
  { file: 'TRESemme Keratin Smooth Professional Shampoo.jpeg', dbName: 'Tresemme Shampoo', storagePath: 'personal_care/tresemme_shampoo.jpeg' },
  { file: 'TRESemm Hairfall Defense Keratin Fillers Professional Shampoo.jpeg', dbName: 'Tresemme Conditioner', storagePath: 'personal_care/tresemme_conditioner.jpeg' },
  { file: 'VEGA Bath Sponge.jpeg', dbName: 'Sponge Loofah', storagePath: 'personal_care/sponge_loofah.jpeg' },
  { file: 'Camlin Budapest Notebook.jpeg', dbName: 'Notebook', storagePath: 'stationery/notebook.jpeg' },
  { file: 'Cello Maxriter Ball Pen.jpeg', dbName: 'Ball Pen', storagePath: 'stationery/ball_pen.jpeg' },
];

async function main() {
  console.log('🚀 Starting product image replacement...\n');
  console.log(`📂 Source folder: ${IMAGE_DIR}`);
  console.log(`📦 Total matches: ${MATCHES.length}\n`);

  let success = 0;
  let failed = 0;

  for (const match of MATCHES) {
    const localPath = path.join(IMAGE_DIR, match.file);

    // Check file exists
    if (!fs.existsSync(localPath)) {
      console.error(`  ❌ File not found: ${match.file}`);
      failed++;
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    console.log(`  📤 Uploading: ${match.file} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);

    // Upload to Supabase Storage (upsert to replace existing)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product_images')
      .upload(match.storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error(`  ❌ Upload failed for ${match.dbName}: ${uploadError.message}`);
      failed++;
      continue;
    }

    // Get public URL
    const newUrl = `${STORAGE_BASE}/${match.storagePath}`;

    // Update DB
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({ image_url: newUrl })
      .eq('name', match.dbName)
      .select('id, name');

    if (updateError) {
      console.error(`  ❌ DB update failed for ${match.dbName}: ${updateError.message}`);
      failed++;
    } else if (!updateData || updateData.length === 0) {
      console.warn(`  ⚠️  No matching product in DB for: ${match.dbName}`);
      failed++;
    } else {
      console.log(`  ✅ ${match.dbName} → ${match.storagePath}`);
      success++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`  ✅ Replaced: ${success}`);
  console.log(`  ❌ Failed: ${failed}`);
}

main().catch(console.error);
