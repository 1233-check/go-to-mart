import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  'https://ahitvfafdnvmkkfvghbe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaXR2ZmFmZG52bWtrZnZnaGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODkyMjQsImV4cCI6MjA4Nzk2NTIyNH0.PmkiaDe0DyLDjoVGxcaKjo96i6K_aQsODX18da95V3Y'
)

async function run() {
  const { data, error } = await supabase.from('products').select('id, name').order('name');
  if (error) {
    console.error(error);
    return;
  }
  fs.writeFileSync('product_names.json', JSON.stringify(data, null, 2));
  console.log(`Dumped ${data.length} products to product_names.json`);
}

run();
