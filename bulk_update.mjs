import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  'https://ahitvfafdnvmkkfvghbe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3NzIzODkyMjQsImV4cCI6MjA4Nzk2NTIyNH0.PmkiaDe0DyLDjoVGxcaKjo96i6K_aQsODX18da95V3Y'
)

const products = JSON.parse(fs.readFileSync('product_names.json', 'utf8'));

// Heuristic 'AI' Generation for 192 products
function generateAI(name) {
  const n = name.toLowerCase();
  let desc = `Premium quality ${name}, carefully sourced for your everyday needs.`;
  let type = "Grocery";
  let brand = name.split(' ')[0];
  let packaging = "Standard Pack";
  
  // Categorization
  if (n.includes('apple') || n.includes('banana') || n.includes('avocado') || n.includes('orange') || n.includes('dragon fruit') || n.includes('grapes') || n.includes('guava') || n.includes('kiwi') || n.includes('papaya') || n.includes('pineapple') || n.includes('pomegranate') || n.includes('strawberry') || n.includes('watermelon') || n.includes('lemon')) {
    desc = `Farm-fresh ${name}, handpicked to ensure maximum quality and daily nutrition.`;
    type = "Fresh Fruit";
    packaging = "Loose/Box";
    brand = "Fresh Produce";
  } else if (n.includes('cabbage') || n.includes('capsicum') || n.includes('carrot') || n.includes('cauliflower') || n.includes('brinjal') || n.includes('broccoli') || n.includes('onion') || n.includes('potato') || n.includes('tomato') || n.includes('spinach') || n.includes('lady finger') || n.includes('beans') || n.includes('cucumber') || n.includes('garlic') || n.includes('ginger') || n.includes('lettuce') || n.includes('pudina')) {
    desc = `Locally sourced, fresh ${name} delivered straight to your kitchen.`;
    type = "Fresh Vegetable";
    packaging = "Loose/Bag";
    brand = "Fresh Produce";
  } else if (n.includes('milk') || n.includes('butter') || n.includes('cheese') || n.includes('amul')) {
    desc = `Rich and creamy ${name}, perfect for all your cooking and snacking needs.`;
    type = "Dairy";
    if(n.includes('amul')) brand = "Amul";
  } else if (n.includes('shampoo') || n.includes('conditioner') || n.includes('soap') || n.includes('face wash') || n.includes('lotion')) {
    desc = `Gentle and effective ${name} for daily personal hygiene and refreshing care.`;
    type = "Personal Care";
    if(n.includes('dove')) brand = "Dove";
    if(n.includes('nivea')) brand = "Nivea";
    if(n.includes('loreal')) brand = "L'Oreal";
  } else if (n.includes('biscuit') || n.includes('chocolate') || n.includes('cake') || n.includes('sweet') || n.includes('gems') || n.includes('dairy milk') || n.includes('snickers') || n.includes('kitkat')) {
    desc = `Delicious ${name}, the perfect treat to satisfy your sweet cravings anytime.`;
    type = "Snacks & Sweets";
  } else if (n.includes('masala') || n.includes('powder') || n.includes('salt') || n.includes('chilli') || n.includes('oregano') || n.includes('coriander')) {
    desc = `Authentic and aromatic ${name} to bring out the best flavors in your meals.`;
    type = "Spices & Condiments";
    packaging = "Sealed Pouch/Jar";
  } else if (n.includes('detergent') || n.includes('wash') || n.includes('surf') || n.includes('tide') || n.includes('ariel')) {
    desc = `Tough on stains, ${name} leaves your clothes fresh and brilliantly clean.`;
    type = "Household Cleaning";
  } else if (n.includes('coke') || n.includes('pepsi') || n.includes('fanta') || n.includes('sprite') || n.includes('maaza') || n.includes('redbull')) {
    desc = `Chilled and refreshing ${name} to instantly quench your thirst.`;
    type = "Beverage";
  } else if (n.includes('rice') || n.includes('atta') || n.includes('maida') || n.includes('sooji') || n.includes('dal') || n.includes('chana') || n.includes('rajma') || n.includes('besan')) {
    desc = `High-quality, unadulterated ${name} for wholesome and nutritious family meals.`;
    type = "Staples & Grains";
  }

  // Refine common brands
  const commonBrands = ["Amul", "Ariel", "Cetaphil", "Loreal", "Lux", "Lifebuoy", "Lays", "Kurkure", "Fortune", "Maggi", "Yippee", "Nescafe", "Lipton", "Red Label", "Sensodyne", "Colgate", "Tide", "Surf Excel", "Vaseline", "Snickers", "Twix", "Galaxy", "Oreo", "Nutella", "Dettol", "Vim", "Exo", "Pepsi", "Coke", "Redbull", "Sprite", "Fanta"];
  for (let b of commonBrands) {
    if (n.includes(b.toLowerCase())) brand = b;
  }

  return {
    id: name,
    desc: desc,
    high: {
      "Brand": brand,
      "Type": type,
      "Packaging": packaging,
      "Quality": "Premium"
    }
  };
}

async function runBulkUpdate() {
  console.log('Generating AI metadata...');
  const jsonOutput = products.map(p => generateAI(p.name));
  fs.writeFileSync('generated_meta.json', JSON.stringify(jsonOutput, null, 2));
  
  console.log(`Starting bulk update for ${jsonOutput.length} products...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const item of jsonOutput) {
    // According to the new schema and current data, we will store the description
    // Wait, the products table has 'description'. We can store the highlight JSON
    // directly inside description as string, OR we can format it nicely!
    
    // Formatting the 'desc' and 'high' into the description field since the DB 
    // only has a text `description` column.
    const highlightsText = Object.entries(item.high).map(([k, v]) => `${k}: ${v}`).join(' | ');
    const combinedDescription = `${item.desc}\n\nHighlights: ${highlightsText}`;

    const { error } = await supabase
      .from('products')
      .update({ description: combinedDescription })
      .eq('name', item.id);
      
    if (error) {
      console.error(`Error updating ${item.id}:`, error.message);
      errorCount++;
    } else {
      successCount++;
    }
    
    // visual progress
    if ((successCount + errorCount) % 20 === 0) {
      console.log(`Processed ${successCount + errorCount} items...`);
    }
  }

  console.log(`Update Complete! Success: ${successCount}. Errors: ${errorCount}.`);
}

runBulkUpdate();
