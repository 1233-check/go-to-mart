import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const GEMINI_API_KEY = 'AIzaSyDP-5veCSAI4SvND7h0kIpAv5plZCVudfM';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;

const supabaseUrl = 'https://ahitvfafdnvmkkfvghbe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaXR2ZmFmZG52bWtrZnZnaGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODkyMjQsImV4cCI6MjA4Nzk2NTIyNH0.PmkiaDe0DyLDjoVGxcaKjo96i6K_aQsODX18da95V3Y';
const supabase = createClient(supabaseUrl, supabaseKey);

const PROMPT_TEMPLATE = (subject) =>
  `Perfectly centered product shot of ${subject}, isolated perfectly on a pure, solid white background (#FFFFFF). Clean, vibrant, minimalist commercial product photography designed for an Indian quick-commerce mobile app UI. The packaging, styling, and visual context MUST strictly look like products bought from an Indian grocery store or supermarket (desi style). Bright, even, diffused studio lighting, shot from a clear, straightforward angle (eye-level or slight top-down) to show depth. Ultra-realistic, 8k resolution, macro-level sharp focus. STRICTLY NO shadows, NO props, NO text, NO watermarks, NO background clutter, NO lifestyle elements. Plain white background only.`;

// All remaining products by category with descriptive subjects
const failedItems = JSON.parse(fs.readFileSync('failed_items.json', 'utf8'));
const PRODUCTS = {
  vegetables: [
    { name: 'Potato', subject: 'three whole fresh, clean brown potatoes' },
    { name: 'Pudina (Mint)', subject: 'a fresh bunch of bright green mint leaves (pudina)' },
    { name: 'Spinach', subject: 'a fresh bunch of dark green, leafy spinach (palak)' },
    { name: 'Spring Onion', subject: 'a bunch of fresh spring onions with white bulbs and green stalks' },
    { name: 'Tomato', subject: 'three whole fresh, bright red ripe tomatoes' },
  ],
  fruits: [
    { name: 'Apple', subject: 'two whole fresh, shiny red apples' },
    { name: 'Avocado', subject: 'one whole fresh, dark green ripe avocado' },
    { name: 'Banana', subject: 'a bunch of three fresh, ripe yellow bananas' },
    { name: 'Coconut', subject: 'one whole fresh, brown mature coconut' },
    { name: 'Dragon Fruit', subject: 'one whole fresh, vibrant pink dragon fruit (pitaya)' },
    { name: 'Grapes', subject: 'a bunch of fresh, green seedless grapes' },
    { name: 'Guava', subject: 'two whole fresh, light green guavas, one cut in half showing pink flesh' },
    { name: 'Kiwi', subject: 'three whole fresh, fuzzy brown kiwi fruits' },
    { name: 'Orange', subject: 'two whole fresh, bright orange oranges' },
    { name: 'Papaya', subject: 'one whole fresh, ripe yellow-green papaya' },
    { name: 'Pineapple', subject: 'one whole fresh, golden pineapple with crown' },
    { name: 'Pomegranate', subject: 'one whole fresh, deep red pomegranate' },
    { name: 'Pomegranate (2 pc)', subject: 'two whole fresh, deep red pomegranates' },
    { name: 'Strawberry', subject: 'a small pile of fresh, bright red strawberries' },
    { name: 'Watermelon', subject: 'one whole fresh, large green striped watermelon' },
  ],
  spices: [
    { name: 'Black Pepper', subject: 'a small glass jar of whole black peppercorns' },
    { name: 'Chat Masala', subject: 'a generic, unbranded small pouch of chat masala spice powder' },
    { name: 'Chicken Masala', subject: 'a generic, unbranded small pouch of orange-brown chicken masala powder' },
    { name: 'Chilli Flakes', subject: 'a small glass jar of red chilli flakes' },
    { name: 'Chilli Powder (100g)', subject: 'a generic, unbranded transparent pouch of bright red chilli powder, 100g' },
    { name: 'Chilli Powder (200g)', subject: 'a generic, unbranded transparent pouch of bright red chilli powder, 200g' },
    { name: 'Coriander Powder', subject: 'a generic, unbranded pouch of yellow-brown coriander powder' },
    { name: 'Garam Masala', subject: 'a generic, unbranded pouch of dark brown garam masala powder' },
    { name: 'Jeera Powder', subject: 'a generic, unbranded pouch of light brown cumin (jeera) powder' },
    { name: 'Meat Masala', subject: 'a generic, unbranded pouch of dark reddish-brown meat masala powder' },
    { name: 'Mutton Masala', subject: 'a generic, unbranded pouch of dark brown mutton masala powder' },
    { name: 'Oregano', subject: 'a small glass jar of dried green oregano herbs' },
    { name: 'Piri Piri', subject: 'a small bottle of red piri piri seasoning' },
    { name: 'Salt', subject: 'a generic, unbranded white packet of iodized table salt' },
    { name: 'Turmeric Powder', subject: 'a generic, unbranded pouch of bright yellow turmeric (haldi) powder' },
  ],
  condiments: [
    { name: 'Kissan Jam', subject: 'a generic, unbranded glass jar of red mixed fruit jam' },
    { name: 'Mayonnaise', subject: 'a generic, unbranded squeeze bottle of creamy white mayonnaise' },
    { name: 'Nutella', subject: 'a generic, unbranded glass jar of chocolate hazelnut spread' },
    { name: 'Peanut Butter', subject: 'a generic, unbranded glass jar of creamy peanut butter' },
    { name: 'Soya Sauce', subject: 'a generic, unbranded dark glass bottle of soya sauce' },
    { name: 'Tomato Ketchup', subject: 'a generic, unbranded red squeeze bottle of tomato ketchup' },
    { name: 'Vinegar', subject: 'a generic, unbranded clear glass bottle of white vinegar' },
  ],
  instant_foods: [
    { name: 'Buldak Ramen', subject: 'a generic, unbranded square block of spicy red instant ramen noodles in packaging' },
    { name: 'Chowmein', subject: 'a generic, unbranded packet of instant chowmein noodles' },
    { name: 'Maggi', subject: 'a generic, unbranded square block of yellow instant ramen noodles in packaging' },
    { name: 'Wai Wai Noodles', subject: 'a generic, unbranded round block of fried instant noodles in packaging' },
    { name: 'Yippee Noodles', subject: 'a generic, unbranded round block of instant noodles in a yellow packet' },
  ],
  sweets: [
    { name: '5 Star', subject: 'a generic, unbranded chocolate-caramel nougat candy bar in a gold wrapper' },
    { name: 'Alpenliebe', subject: 'a generic, unbranded small wrapped caramel candy' },
    { name: 'Choki Choki', subject: 'a generic, unbranded chocolate paste stick in a thin tube' },
    { name: 'Chupa Chups', subject: 'a generic, unbranded round colorful lollipop on a stick' },
    { name: 'Cocon Jelly (3 pc)', subject: 'three generic, unbranded small colorful fruit jelly cups' },
    { name: 'Cocon Jelly (6 pc)', subject: 'six generic, unbranded small colorful fruit jelly cups' },
    { name: 'Dairy Milk', subject: 'a generic, unbranded wrapped purple-packaged milk chocolate bar' },
    { name: 'Dairy Milk Oreo', subject: 'a generic, unbranded chocolate bar with cookie pieces inside, in blue packaging' },
    { name: 'Dairy Milk Silk', subject: 'a generic, unbranded premium smooth milk chocolate bar in purple silk wrapping' },
    { name: 'Galaxy', subject: 'a generic, unbranded smooth premium milk chocolate bar in brown packaging' },
    { name: 'Gems', subject: 'a generic, unbranded small tube of colorful candy-coated chocolate buttons' },
    { name: 'Gulab Jamun', subject: 'three fresh, dark brown gulab jamun (Indian milk dessert balls) in sugar syrup in a small bowl' },
    { name: 'Happydent', subject: 'a generic, unbranded small pack of white chewing gum pellets' },
    { name: 'Kaju Katli', subject: 'four pieces of silver-foil covered diamond-shaped kaju katli (cashew sweet)' },
    { name: 'Kinder Joy', subject: 'a generic, unbranded egg-shaped chocolate treat, white and brown halves' },
    { name: 'Kitkat', subject: 'a generic, unbranded four-finger crispy wafer chocolate bar in red wrapper' },
    { name: 'Kopiko', subject: 'a generic, unbranded small wrapped dark brown coffee candy' },
    { name: 'Laddu by Lal', subject: 'three fresh, round golden yellow besan laddu (Indian gram flour sweet balls)' },
    { name: 'Milk Cake', subject: 'a rectangular piece of light brown milk cake (Indian sweet)' },
    { name: 'Munch', subject: 'a generic, unbranded thin crispy wafer chocolate bar in yellow wrapper' },
    { name: 'Orbit Chewing Gum', subject: 'a generic, unbranded slim pack of mint chewing gum' },
    { name: 'Pulse', subject: 'a generic, unbranded small wrapped tangy hard candy' },
    { name: 'Rasgulla', subject: 'three fresh, white round rasgulla (Indian cottage cheese balls) in sugar syrup in a small bowl' },
    { name: 'Snickers', subject: 'a generic, unbranded chocolate-peanut-caramel candy bar in brown wrapper' },
    { name: 'Twix', subject: 'a generic, unbranded twin chocolate caramel cookie bar in gold wrapper' },
  ],
  staples: [
    { name: 'Atta (1kg)', subject: 'a generic, unbranded 1kg packet of whole wheat flour (atta)' },
    { name: 'Atta (2kg)', subject: 'a generic, unbranded 2kg packet of whole wheat flour (atta)' },
    { name: 'Basmati Rice (5kg)', subject: 'a generic, unbranded 5kg bag of white basmati rice' },
    { name: 'Besan', subject: 'a generic, unbranded 500g packet of yellow besan (gram flour/chickpea flour)' },
    { name: 'Bhuna Chana', subject: 'a small pile of roasted brown chickpeas (bhuna chana)' },
    { name: 'Chole Chickpeas', subject: 'a generic, unbranded transparent packet of dried white chickpeas (chole)' },
    { name: 'Fortune Basmati Rice', subject: 'a generic, unbranded 1kg pack of premium white basmati rice' },
    { name: 'Fortune Mustard Oil', subject: 'a generic, unbranded yellow plastic bottle of pure mustard oil' },
    { name: 'Kala Chana', subject: 'a generic, unbranded transparent packet of dried dark brown kala chana (black chickpeas)' },
    { name: 'Kden Rice', subject: 'a generic, unbranded 1kg pack of plain white rice' },
    { name: 'Maida (1kg)', subject: 'a generic, unbranded 1kg packet of white all-purpose flour (maida)' },
    { name: 'Maida (500g)', subject: 'a generic, unbranded 500g packet of white all-purpose flour (maida)' },
    { name: 'Masoor Dal', subject: 'a generic, unbranded transparent packet of orange-red masoor dal (split red lentils)' },
    { name: 'Parmal Rice', subject: 'a generic, unbranded 1kg pack of plain white parmal rice' },
    { name: 'Rajma', subject: 'a generic, unbranded transparent packet of dark red kidney beans (rajma)' },
    { name: 'Refined Oil', subject: 'a generic, unbranded 1-liter yellow plastic bottle of refined vegetable cooking oil' },
    { name: 'Sooji', subject: 'a generic, unbranded packet of yellow semolina (sooji/rava)' },
  ],
  breakfast_dairy: [
    { name: 'Amul Taaza (Big)', subject: 'a generic, unbranded bright white large carton box of toned milk' },
    { name: 'Amul Taaza (Small)', subject: 'a generic, unbranded small white carton box of toned milk' },
    { name: 'Bournvita', subject: 'a generic, unbranded brown jar of chocolate malt health drink powder' },
    { name: 'Butter (Big)', subject: 'a generic, unbranded 500g block of yellow salted butter in foil wrapping' },
    { name: 'Butter (Small)', subject: 'a generic, unbranded 100g block of yellow butter in foil wrapping' },
    { name: 'Cheese Slices', subject: 'a generic, unbranded pack of individually wrapped yellow cheese slices' },
    { name: 'Chocos', subject: 'a generic, unbranded box of chocolate-flavored breakfast cereal' },
    { name: 'Corn Flakes Original', subject: 'a generic, unbranded box of golden corn flakes breakfast cereal' },
    { name: 'Horlicks', subject: 'a generic, unbranded yellow jar of malted health drink powder' },
    { name: 'Quaker Rolled Instant Oats', subject: 'a generic, unbranded cylindrical canister of rolled instant oats' },
    { name: 'Shredded Mozzarella Cheese', subject: 'a generic, unbranded resealable bag of white shredded mozzarella cheese' },
  ],
  snacks: [
    { name: 'Chips (Lays/Kurkure/Uncle Chips)', subject: 'a generic, unbranded yellow packet of potato chips' },
    { name: 'Dark Fantasy Biscuits', subject: 'a generic, unbranded dark brown packet of chocolate cream biscuits' },
    { name: 'Digestive Biscuits', subject: 'a generic, unbranded pack of round whole wheat digestive biscuits' },
    { name: 'Good Day Biscuits', subject: 'a generic, unbranded yellow packet of butter cookies' },
    { name: 'Hide and Seek Biscuits', subject: 'a generic, unbranded brown packet of chocolate chip cookies' },
    { name: 'Krack Jack', subject: 'a generic, unbranded pack of sweet-salty cream cracker biscuits' },
    { name: 'Little Hearts', subject: 'a generic, unbranded pack of small heart-shaped sugar-coated biscuits' },
    { name: 'Milk Bikis Atta Biscuit', subject: 'a generic, unbranded pack of round milk and wheat biscuits' },
    { name: 'Monaco Chessling Biscuit', subject: 'a generic, unbranded pack of small round salted cheese crackers' },
    { name: 'Oreo Biscuits', subject: 'a generic, unbranded pack of black-and-white cream sandwich cookies' },
    { name: 'Parle-G', subject: 'a generic, unbranded yellow pack of glucose biscuits' },
  ],
  beverages: [
    { name: 'Diet Coke', subject: 'a generic, unbranded silver aluminum can of diet cola drink' },
    { name: 'Everyday Dairy Whitener', subject: 'a generic, unbranded white pouch of dairy whitener powder (400g)' },
    { name: 'Fanta', subject: 'a generic, unbranded orange-colored soft drink PET bottle' },
    { name: 'Frooti', subject: 'a generic, unbranded small yellow tetra pack of mango juice drink' },
    { name: 'Lipton Honey Lemon Green Tea', subject: 'a generic, unbranded green box of honey lemon green tea bags' },
    { name: 'Maaza', subject: 'a generic, unbranded yellow PET bottle of thick mango juice drink' },
    { name: 'Mogu Mogu', subject: 'a generic, unbranded round PET bottle of nata de coco fruit drink' },
    { name: 'Mountain Dew', subject: 'a generic, unbranded bright green PET bottle of citrus soda' },
    { name: 'Nescafe Classic Coffee (2 pc)', subject: 'two small generic, unbranded single-serve coffee sachets' },
    { name: 'Nescafe Classic Coffee (24g)', subject: 'a generic, unbranded small brown jar of instant coffee powder (24g)' },
    { name: 'Nescafe Classic Coffee (45g)', subject: 'a generic, unbranded small brown jar of instant coffee powder (45g)' },
    { name: 'Pepsi', subject: 'a generic, unbranded blue aluminum can of cola soft drink' },
    { name: 'Red Label Tea', subject: 'a generic, unbranded red packet of CTC leaf tea (250g)' },
    { name: 'Redbull', subject: 'a generic, unbranded slim silver-blue aluminum can of energy drink' },
    { name: 'Regular Coke', subject: 'a generic, unbranded red aluminum can of cola soft drink' },
    { name: 'Sprite', subject: 'a generic, unbranded green PET bottle of lemon-lime clear soda' },
    { name: 'Thumbs Up', subject: 'a generic, unbranded dark red PET bottle of strong cola' },
    { name: 'Yakult Drink', subject: 'a pack of five small generic, unbranded white probiotic yogurt drink bottles with red caps' },
  ],
  personal_care: [
    { name: 'Cetaphil Face Wash', subject: 'a generic, unbranded white squeeze tube of gentle daily face wash' },
    { name: 'Cinthol Lime Soap', subject: 'four generic, unbranded green lime-scented bath soap bars' },
    { name: 'Clinic Plus Shampoo', subject: 'a generic, unbranded blue shampoo bottle' },
    { name: 'Close Up', subject: 'a generic, unbranded red gel toothpaste tube' },
    { name: 'Colgate', subject: 'a generic, unbranded red-and-white toothpaste tube' },
    { name: 'Dettol Hand Wash', subject: 'a generic, unbranded pump bottle of antibacterial liquid hand wash' },
    { name: 'Dettol Soap', subject: 'four generic, unbranded green antibacterial bath soap bars' },
    { name: 'Dot and Key Face Wash', subject: 'a generic, unbranded pastel-colored tube of brightening face wash' },
    { name: 'Dove Conditioner', subject: 'a generic, unbranded white bottle of moisturizing hair conditioner' },
    { name: 'Dove Shampoo', subject: 'a generic, unbranded white shampoo bottle with gold cap' },
    { name: 'Dove Soap', subject: 'three generic, unbranded white cream beauty soap bars' },
    { name: 'Head & Shoulders', subject: 'a generic, unbranded blue anti-dandruff shampoo bottle' },
    { name: 'Lifebuoy Soap', subject: 'seven generic, unbranded red health soap bars' },
    { name: 'Loreal Conditioner', subject: 'a generic, unbranded white premium hair conditioner bottle' },
    { name: 'Loreal Paris Shampoo', subject: 'a generic, unbranded white premium shampoo bottle' },
    { name: 'Lux Soap', subject: 'three generic, unbranded pink perfumed beauty soap bars' },
    { name: 'Nivea Body Lotion', subject: 'a generic, unbranded blue-and-white body lotion pump bottle' },
    { name: 'Nivea Men Face Wash', subject: 'a generic, unbranded dark blue tube of men\'s face wash' },
    { name: 'Pears Soap', subject: 'three generic, unbranded translucent amber glycerin soap bars' },
    { name: 'Plum Face Wash', subject: 'a generic, unbranded green tube of natural face wash' },
    { name: 'Sdy (Stayfree)', subject: 'a generic, unbranded blue-white pack of 18 sanitary pads' },
    { name: 'Sensodyne', subject: 'a generic, unbranded blue-and-white sensitive toothpaste tube' },
    { name: 'Sensodyne Toothbrush', subject: 'three generic, unbranded soft-bristled toothbrushes in blue packaging' },
    { name: 'Sponge Loofah', subject: 'two colorful round bath sponge loofahs' },
    { name: 'Stayfree', subject: 'a generic, unbranded blue-white pack of 16 sanitary pads' },
    { name: 'Sunsilk Shampoo', subject: 'a generic, unbranded pink shampoo bottle' },
    { name: 'Tresemme Conditioner', subject: 'a generic, unbranded black professional hair conditioner bottle' },
    { name: 'Tresemme Shampoo', subject: 'a generic, unbranded black professional shampoo bottle' },
    { name: 'Vaseline Body Lotion', subject: 'a generic, unbranded yellow body lotion bottle' },
    { name: 'Vaseline Jelly', subject: 'a generic, unbranded clear jar of petroleum jelly' },
    { name: 'Whisper', subject: 'a generic, unbranded purple-blue pack of 15 sanitary pads' },
  ],
  cleaning: [
    { name: 'Ariel', subject: 'a generic, unbranded blue-green bag of laundry detergent powder' },
    { name: 'Comfort Fabric Conditioner', subject: 'a generic, unbranded blue bottle of fabric softener conditioner' },
    { name: 'Dettol Antiseptic Liquid', subject: 'a generic, unbranded brown bottle of antiseptic disinfectant liquid' },
    { name: 'Exo Dishwash Bar', subject: 'four generic, unbranded green-yellow dishwashing soap bars' },
    { name: 'Goodnight', subject: 'a generic, unbranded pack of four mosquito repellent refill cartridges' },
    { name: 'Rin Detergent', subject: 'a generic, unbranded blue bag of detergent powder' },
    { name: 'Surf', subject: 'a generic, unbranded blue detergent powder bag' },
    { name: 'Surf Excel Soap', subject: 'a generic, unbranded blue detergent washing soap bar' },
    { name: 'Tide', subject: 'a generic, unbranded orange-yellow bag of laundry detergent powder' },
    { name: 'Tissues', subject: 'a generic, unbranded white box of soft facial tissues' },
    { name: 'Vim Liquid', subject: 'a generic, unbranded green bottle of dish washing liquid (900ml)' },
    { name: 'Wheel', subject: 'a generic, unbranded green laundry detergent powder bag' },
  ],
  stationery: [
    { name: 'Ball Pen', subject: 'a pack of five generic, unbranded blue ball point pens' },
    { name: 'Gel Pen', subject: 'a pack of five generic, unbranded colorful gel ink pens' },
    { name: 'Notebook', subject: 'one generic, unbranded spiral-bound ruled notebook' },
  ],
};

const OUTPUT_DIR = path.join(process.cwd(), 'product_images');

async function generateImage(subject) {
  const prompt = PROMPT_TEMPLATE(subject);
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  };

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  // Find the image part in the response
  for (const candidate of data.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        return Buffer.from(part.inlineData.data, 'base64');
      }
    }
  }
  throw new Error('No image found in response');
}

async function uploadToSupabase(buffer, storagePath) {
  const { data, error } = await supabase.storage
    .from('product_images')
    .upload(storagePath, buffer, { contentType: 'image/png', upsert: true });
  if (error) throw new Error(`Upload error: ${error.message}`);
  const { data: { publicUrl } } = supabase.storage
    .from('product_images')
    .getPublicUrl(storagePath);
  return publicUrl;
}

async function processProduct(categorySlug, product, index, total) {
  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
  const storagePath = `${categorySlug}/${slug}.png`;
  const localPath = path.join(OUTPUT_DIR, categorySlug, `${slug}.png`);

  console.log(`  [${index}/${total}] Generating: ${product.name}...`);

  try {
    const buffer = await generateImage(product.subject);

    // Save locally
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, buffer);

    // Upload to Supabase Storage
    const publicUrl = await uploadToSupabase(buffer, storagePath);
    console.log(`  ✅ ${product.name} → ${publicUrl}`);

    return { name: product.name, url: publicUrl, success: true };
  } catch (err) {
    console.error(`  ❌ ${product.name}: ${err.message}`);
    return { name: product.name, url: null, success: false, error: err.message };
  }
}

async function main() {
  console.log('🚀 Starting product image generation...\n');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const allResults = [];
  const categories = Object.entries(PRODUCTS);
  let globalIndex = 0;
  const globalTotal = categories.reduce((s, [, prods]) => s + prods.length, 0);

  for (const [catSlug, products] of categories) {
    console.log(`\n📦 Category: ${catSlug} (${products.length} products)`);

    for (const product of products) {
      globalIndex++;
      
      const isFailed = failedItems.includes(product.name);
      if (!isFailed) {
         continue;
      }

      const result = await processProduct(catSlug, product, globalIndex, globalTotal);
      allResults.push(result);

      // Longer delay to avoid timeouts
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Update DB for all successful products
  console.log('\n\n📊 Updating database...');
  const successful = allResults.filter(r => r.success);
  const failed = allResults.filter(r => !r.success);

  for (const result of successful) {
    const { error } = await supabase
      .from('products')
      .update({ image_url: result.url })
      .eq('name', result.name);
    if (error) {
      console.error(`  DB update failed for ${result.name}: ${error.message}`);
    }
  }

  console.log(`\n\n✅ Done! ${successful.length}/${globalTotal} images generated and uploaded.`);
  if (failed.length > 0) {
    console.log(`❌ Failed (${failed.length}):`);
    failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }

  // Save results
  fs.writeFileSync(path.join(OUTPUT_DIR, 'results.json'), JSON.stringify(allResults, null, 2));
  console.log(`\nResults saved to ${path.join(OUTPUT_DIR, 'results.json')}`);
}

main().catch(console.error);
