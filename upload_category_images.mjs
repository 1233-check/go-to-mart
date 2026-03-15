import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load directly to avoid depending on env config during manual run
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ahitvfafdnvmkkfvghbe.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaXR2ZmFmZG52bWtrZnZnaGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODkyMjQsImV4cCI6MjA4Nzk2NTIyNH0.PmkiaDe0DyLDjoVGxcaKjo96i6K_aQsODX18da95V3Y';

const supabase = createClient(supabaseUrl, supabaseKey);

const artifactsDir = 'C:\\Users\\Shashank Chauhan\\.gemini\\antigravity\\brain\\80516ccd-beba-421a-b594-3653bcdc4fad';

const categoryMapping = {
  'cat_personal_care': 'Personal Care, Bath & Hygiene',
  'cat_cleaning': 'Cleaning & Household',
  'cat_stationery': 'Stationery',
  'cat_vegetables': 'Vegetables',
  'cat_fruits': 'Fruits',
  'cat_spices': 'Spices & Masalas',
  'cat_condiments': 'Condiments & Sauces',
  'cat_instant': 'Instant Foods & Noodles',
  'cat_sweets': 'Sweets, Candies & Chocolates',
  'cat_staples': 'Staples & Grains',
  'cat_dairy': 'Breakfast & Dairy',
  'cat_snacks': 'Snacks & Biscuits',
  'cat_beverages': 'Beverages'
};

async function uploadCategoryImages() {
  const files = fs.readdirSync(artifactsDir).filter(f => f.startsWith('cat_') && f.endsWith('.png'));

  console.log(`Found ${files.length} category images to upload...`);

  for (const file of files) {
    const filePath = path.join(artifactsDir, file);
    const content = fs.readFileSync(filePath);
    
    // Extract base name (e.g. cat_fruits_1773601610051.png -> cat_fruits)
    const baseName = file.split('_17')[0]; 
    const dbCategoryName = categoryMapping[baseName];
    
    if (!dbCategoryName) {
      console.log(`Skipping unknown file: ${file}`);
      continue;
    }

    const storagePath = `categories/${baseName}.png`;
    
    console.log(`Uploading ${storagePath} for category "${dbCategoryName}"...`);
    
    // Make sure bucket exists or just use product_images
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product_images') // re-using the existing bucket
      .upload(storagePath, content, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (uploadError) {
      console.error(`❌ Error uploading ${file}:`, uploadError.message);
      continue;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product_images')
      .getPublicUrl(storagePath);
      
    console.log(`✅ Uploaded! URL: ${publicUrl}`);
    
    console.log(`Updating DB for ${dbCategoryName}...`);
    const { error: dbError } = await supabase
      .from('categories')
      .update({ image_url: publicUrl })
      .eq('name', dbCategoryName);
      
    if (dbError) {
      console.error(`❌ Error updating DB for ${dbCategoryName}:`, dbError.message);
    } else {
      console.log(`✅ Successfully updated ${dbCategoryName} in database.`);
    }
  }
}

uploadCategoryImages().then(() => console.log('🎉 All Category Images Synced!')).catch(console.error);
