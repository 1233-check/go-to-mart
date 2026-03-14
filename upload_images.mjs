import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ahitvfafdnvmkkfvghbe.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaXR2ZmFmZG52bWtrZnZnaGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODkyMjQsImV4cCI6MjA4Nzk2NTIyNH0.PmkiaDe0DyLDjoVGxcaKjo96i6K_aQsODX18da95V3Y';

const supabase = createClient(supabaseUrl, supabaseKey);

const brainDir = `C:\\Users\\Shashank Chauhan\\.gemini\\antigravity\\brain\\126bdaaf-cdd0-4c6f-bc5e-af3a4300c547`;

// Vegetable name to DB Product Name mapping
const nameMapping = {
  'beans': 'Beans',
  'brinjal': 'Brinjal',
  'broccoli': 'Broccoli',
  'cabbage': 'Cabbage',
  'capsicum': 'Capsicum',
  'carrot': 'Carrot',
  'cauliflower': 'Cauliflower',
  'chillies': 'Chillies',
  'coriander': 'Coriander',
  'cucumber': 'Cucumber',
  'garlic': 'Garlic',
  'ginger': 'Ginger',
  'green_peas': 'Green Peas',
  'lady_finger': 'Lady Finger',
  'lemon': 'Lemon',
  'lettuce': 'Lettuce',
  'onion': 'Onion'
};

async function uploadAndSync() {
  const files = fs.readdirSync(brainDir).filter(f => f.endsWith('.png'));

  for (const file of files) {
    const filePath = path.join(brainDir, file);
    const content = fs.readFileSync(filePath);
    
    // Extract base name
    const baseName = file.split('_17')[0]; 
    const dbName = nameMapping[baseName];
    
    if (!dbName) {
      console.log(`Skipping ${file}`);
      continue;
    }

    const storagePath = `vegetables/${baseName}.png`;
    
    console.log(`Uploading ${storagePath}...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product_images')
      .upload(storagePath, content, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (uploadError) {
      console.error(`Error uploading ${file}:`, uploadError.message);
      continue;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product_images')
      .getPublicUrl(storagePath);
      
    console.log(`Uploaded! URL: ${publicUrl}`);
    
    console.log(`Updating DB for ${dbName}...`);
    const { error: dbError } = await supabase
      .from('products')
      .update({ image_url: publicUrl })
      .eq('name', dbName);
      
    if (dbError) {
      console.error(`Error updating DB for ${dbName}:`, dbError.message);
    } else {
      console.log(`Successfully updated ${dbName}`);
    }
  }
}

uploadAndSync().then(() => console.log('Done')).catch(console.error);
