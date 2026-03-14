import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahitvfafdnvmkkfvghbe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaXR2ZmFmZG52bWtrZnZnaGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODkyMjQsImV4cCI6MjA4Nzk2NTIyNH0.PmkiaDe0DyLDjoVGxcaKjo96i6K_aQsODX18da95V3Y';
const supabase = createClient(supabaseUrl, supabaseKey);

const STORAGE_BASE = 'https://ahitvfafdnvmkkfvghbe.supabase.co/storage/v1/object/public/product_images';

// Map every product name -> category_slug/filename.png
// This must exactly match the names used in generate_all_images.mjs
const PRODUCT_MAP = {
  // Vegetables (first 17 were uploaded by upload_images.mjs, remaining 5 by generate script)
  'Potato': 'vegetables/potato.png',
  'Pudina (Mint)': 'vegetables/pudina_mint.png',
  'Spinach': 'vegetables/spinach.png',
  'Spring Onion': 'vegetables/spring_onion.png',
  'Tomato': 'vegetables/tomato.png',
  // Already correct in DB (17 from upload_images.mjs):
  'Beans (250g)': 'vegetables/beans.png',
  'Brinjal': 'vegetables/brinjal.png',
  'Broccoli (300g)': 'vegetables/broccoli.png',
  'Cabbage (400g)': 'vegetables/cabbage.png',
  'Capsicum (250g)': 'vegetables/capsicum.png',
  'Carrot (500g)': 'vegetables/carrot.png',
  'Cauliflower (400g)': 'vegetables/cauliflower.png',
  'Chillies (100g)': 'vegetables/chillies.png',
  'Coriander (100g)': 'vegetables/coriander.png',
  'Cucumber (500g)': 'vegetables/cucumber.png',
  'Garlic (200g)': 'vegetables/garlic.png',
  'Ginger (200g)': 'vegetables/ginger.png',
  'Green Peas': 'vegetables/green_peas.png',
  'Lady Finger': 'vegetables/lady_finger.png',
  'Lemon (200g)': 'vegetables/lemon.png',
  'Lettuce (100g)': 'vegetables/lettuce.png',
  'Onion (1 kg)': 'vegetables/onion.png',

  // Fruits
  'Apple': 'fruits/apple.png',
  'Avocado': 'fruits/avocado.png',
  'Banana': 'fruits/banana.png',
  'Coconut': 'fruits/coconut.png',
  'Dragon Fruit': 'fruits/dragon_fruit.png',
  'Grapes': 'fruits/grapes.png',
  'Guava': 'fruits/guava.png',
  'Kiwi': 'fruits/kiwi.png',
  'Orange': 'fruits/orange.png',
  'Papaya': 'fruits/papaya.png',
  'Pineapple': 'fruits/pineapple.png',
  'Pomegranate': 'fruits/pomegranate.png',
  'Pomegranate (2 pc)': 'fruits/pomegranate_2_pc.png',
  'Strawberry': 'fruits/strawberry.png',
  'Watermelon': 'fruits/watermelon.png',

  // Spices
  'Black Pepper': 'spices/black_pepper.png',
  'Chat Masala': 'spices/chat_masala.png',
  'Chicken Masala': 'spices/chicken_masala.png',
  'Chilli Flakes': 'spices/chilli_flakes.png',
  'Chilli Powder (100g)': 'spices/chilli_powder_100g.png',
  'Chilli Powder (200g)': 'spices/chilli_powder_200g.png',
  'Coriander Powder': 'spices/coriander_powder.png',
  'Garam Masala': 'spices/garam_masala.png',
  'Jeera Powder': 'spices/jeera_powder.png',
  'Meat Masala': 'spices/meat_masala.png',
  'Mutton Masala': 'spices/mutton_masala.png',
  'Oregano': 'spices/oregano.png',
  'Piri Piri': 'spices/piri_piri.png',
  'Salt': 'spices/salt.png',
  'Turmeric Powder': 'spices/turmeric_powder.png',

  // Condiments
  'Kissan Jam': 'condiments/kissan_jam.png',
  'Mayonnaise': 'condiments/mayonnaise.png',
  'Nutella': 'condiments/nutella.png',
  'Peanut Butter': 'condiments/peanut_butter.png',
  'Soya Sauce': 'condiments/soya_sauce.png',
  'Tomato Ketchup': 'condiments/tomato_ketchup.png',
  'Vinegar': 'condiments/vinegar.png',

  // Instant Foods
  'Buldak Ramen': 'instant_foods/buldak_ramen.png',
  'Chowmein': 'instant_foods/chowmein.png',
  'Maggi': 'instant_foods/maggi.png',
  'Wai Wai Noodles': 'instant_foods/wai_wai_noodles.png',
  'Yippee Noodles': 'instant_foods/yippee_noodles.png',

  // Sweets
  '5 Star': 'sweets/5_star.png',
  'Alpenliebe': 'sweets/alpenliebe.png',
  'Choki Choki': 'sweets/choki_choki.png',
  'Chupa Chups': 'sweets/chupa_chups.png',
  'Cocon Jelly (3 pc)': 'sweets/cocon_jelly_3_pc.png',
  'Cocon Jelly (6 pc)': 'sweets/cocon_jelly_6_pc.png',
  'Dairy Milk': 'sweets/dairy_milk.png',
  'Dairy Milk Oreo': 'sweets/dairy_milk_oreo.png',
  'Dairy Milk Silk': 'sweets/dairy_milk_silk.png',
  'Galaxy': 'sweets/galaxy.png',
  'Gems': 'sweets/gems.png',
  'Gulab Jamun': 'sweets/gulab_jamun.png',
  'Happydent': 'sweets/happydent.png',
  'Kaju Katli': 'sweets/kaju_katli.png',
  'Kinder Joy': 'sweets/kinder_joy.png',
  'Kitkat': 'sweets/kitkat.png',
  'Kopiko': 'sweets/kopiko.png',
  'Laddu by Lal': 'sweets/laddu_by_lal.png',
  'Milk Cake': 'sweets/milk_cake.png',
  'Munch': 'sweets/munch.png',
  'Orbit Chewing Gum': 'sweets/orbit_chewing_gum.png',
  'Pulse': 'sweets/pulse.png',
  'Rasgulla': 'sweets/rasgulla.png',
  'Snickers': 'sweets/snickers.png',
  'Twix': 'sweets/twix.png',

  // Staples
  'Atta (1kg)': 'staples/atta_1kg.png',
  'Atta (2kg)': 'staples/atta_2kg.png',
  'Basmati Rice (5kg)': 'staples/basmati_rice_5kg.png',
  'Besan': 'staples/besan.png',
  'Bhuna Chana': 'staples/bhuna_chana.png',
  'Chole Chickpeas': 'staples/chole_chickpeas.png',
  'Fortune Basmati Rice': 'staples/fortune_basmati_rice.png',
  'Fortune Mustard Oil': 'staples/fortune_mustard_oil.png',
  'Kala Chana': 'staples/kala_chana.png',
  'Kden Rice': 'staples/kden_rice.png',
  'Maida (1kg)': 'staples/maida_1kg.png',
  'Maida (500g)': 'staples/maida_500g.png',
  'Masoor Dal': 'staples/masoor_dal.png',
  'Parmal Rice': 'staples/parmal_rice.png',
  'Rajma': 'staples/rajma.png',
  'Refined Oil': 'staples/refined_oil.png',
  'Sooji': 'staples/sooji.png',

  // Breakfast & Dairy
  'Amul Taaza (Big)': 'breakfast_dairy/amul_taaza_big.png',
  'Amul Taaza (Small)': 'breakfast_dairy/amul_taaza_small.png',
  'Bournvita': 'breakfast_dairy/bournvita.png',
  'Butter (Big)': 'breakfast_dairy/butter_big.png',
  'Butter (Small)': 'breakfast_dairy/butter_small.png',
  'Cheese Slices': 'breakfast_dairy/cheese_slices.png',
  'Chocos': 'breakfast_dairy/chocos.png',
  'Corn Flakes Original': 'breakfast_dairy/corn_flakes_original.png',
  'Horlicks': 'breakfast_dairy/horlicks.png',
  'Quaker Rolled Instant Oats': 'breakfast_dairy/quaker_rolled_instant_oats.png',
  'Shredded Mozzarella Cheese': 'breakfast_dairy/shredded_mozzarella_cheese.png',

  // Snacks
  'Chips (Lays/Kurkure/Uncle Chips)': 'snacks/chips_lays_kurkure_uncle_chips.png',
  'Dark Fantasy Biscuits': 'snacks/dark_fantasy_biscuits.png',
  'Digestive Biscuits': 'snacks/digestive_biscuits.png',
  'Good Day Biscuits': 'snacks/good_day_biscuits.png',
  'Hide and Seek Biscuits': 'snacks/hide_and_seek_biscuits.png',
  'Krack Jack': 'snacks/krack_jack.png',
  'Little Hearts': 'snacks/little_hearts.png',
  'Milk Bikis Atta Biscuit': 'snacks/milk_bikis_atta_biscuit.png',
  'Monaco Chessling Biscuit': 'snacks/monaco_chessling_biscuit.png',
  'Oreo Biscuits': 'snacks/oreo_biscuits.png',
  'Parle-G': 'snacks/parle_g.png',

  // Beverages
  'Diet Coke': 'beverages/diet_coke.png',
  'Everyday Dairy Whitener': 'beverages/everyday_dairy_whitener.png',
  'Fanta': 'beverages/fanta.png',
  'Frooti': 'beverages/frooti.png',
  'Lipton Honey Lemon Green Tea': 'beverages/lipton_honey_lemon_green_tea.png',
  'Maaza': 'beverages/maaza.png',
  'Mogu Mogu': 'beverages/mogu_mogu.png',
  'Mountain Dew': 'beverages/mountain_dew.png',
  'Nescafe Classic Coffee (2 pc)': 'beverages/nescafe_classic_coffee_2_pc.png',
  'Nescafe Classic Coffee (24g)': 'beverages/nescafe_classic_coffee_24g.png',
  'Nescafe Classic Coffee (45g)': 'beverages/nescafe_classic_coffee_45g.png',
  'Pepsi': 'beverages/pepsi.png',
  'Red Label Tea': 'beverages/red_label_tea.png',
  'Redbull': 'beverages/redbull.png',
  'Regular Coke': 'beverages/regular_coke.png',
  'Sprite': 'beverages/sprite.png',
  'Thumbs Up': 'beverages/thumbs_up.png',
  'Yakult Drink': 'beverages/yakult_drink.png',

  // Personal Care
  'Cetaphil Face Wash': 'personal_care/cetaphil_face_wash.png',
  'Cinthol Lime Soap': 'personal_care/cinthol_lime_soap.png',
  'Clinic Plus Shampoo': 'personal_care/clinic_plus_shampoo.png',
  'Close Up': 'personal_care/close_up.png',
  'Colgate': 'personal_care/colgate.png',
  'Dettol Hand Wash': 'personal_care/dettol_hand_wash.png',
  'Dettol Soap': 'personal_care/dettol_soap.png',
  'Dot and Key Face Wash': 'personal_care/dot_and_key_face_wash.png',
  'Dove Conditioner': 'personal_care/dove_conditioner.png',
  'Dove Shampoo': 'personal_care/dove_shampoo.png',
  'Dove Soap': 'personal_care/dove_soap.png',
  'Head & Shoulders': 'personal_care/head_shoulders.png',
  'Lifebuoy Soap': 'personal_care/lifebuoy_soap.png',
  'Loreal Conditioner': 'personal_care/loreal_conditioner.png',
  'Loreal Paris Shampoo': 'personal_care/loreal_paris_shampoo.png',
  'Lux Soap': 'personal_care/lux_soap.png',
  'Nivea Body Lotion': 'personal_care/nivea_body_lotion.png',
  'Nivea Men Face Wash': 'personal_care/nivea_men_face_wash.png',
  'Pears Soap': 'personal_care/pears_soap.png',
  'Plum Face Wash': 'personal_care/plum_face_wash.png',
  'Sdy (Stayfree)': 'personal_care/sdy_stayfree.png',
  'Sensodyne': 'personal_care/sensodyne.png',
  'Sensodyne Toothbrush': 'personal_care/sensodyne_toothbrush.png',
  'Sponge Loofah': 'personal_care/sponge_loofah.png',
  'Stayfree': 'personal_care/stayfree.png',
  'Sunsilk Shampoo': 'personal_care/sunsilk_shampoo.png',
  'Tresemme Conditioner': 'personal_care/tresemme_conditioner.png',
  'Tresemme Shampoo': 'personal_care/tresemme_shampoo.png',
  'Vaseline Body Lotion': 'personal_care/vaseline_body_lotion.png',
  'Vaseline Jelly': 'personal_care/vaseline_jelly.png',
  'Whisper': 'personal_care/whisper.png',

  // Cleaning
  'Ariel': 'cleaning/ariel.png',
  'Comfort Fabric Conditioner': 'cleaning/comfort_fabric_conditioner.png',
  'Dettol Antiseptic Liquid': 'cleaning/dettol_antiseptic_liquid.png',
  'Exo Dishwash Bar': 'cleaning/exo_dishwash_bar.png',
  'Goodnight': 'cleaning/goodnight.png',
  'Rin Detergent': 'cleaning/rin_detergent.png',
  'Surf': 'cleaning/surf.png',
  'Surf Excel Soap': 'cleaning/surf_excel_soap.png',
  'Tide': 'cleaning/tide.png',
  'Tissues': 'cleaning/tissues.png',
  'Vim Liquid': 'cleaning/vim_liquid.png',
  'Wheel': 'cleaning/wheel.png',

  // Stationery
  'Ball Pen': 'stationery/ball_pen.png',
  'Gel Pen': 'stationery/gel_pen.png',
  'Notebook': 'stationery/notebook.png',
};

async function main() {
  console.log('🔧 Fixing product image URLs in database...\n');

  let updated = 0;
  let failed = 0;
  let notFound = 0;

  for (const [productName, storagePath] of Object.entries(PRODUCT_MAP)) {
    const fullUrl = `${STORAGE_BASE}/${storagePath}`;

    const { data, error } = await supabase
      .from('products')
      .update({ image_url: fullUrl })
      .eq('name', productName)
      .select('id, name');

    if (error) {
      console.error(`  ❌ ${productName}: ${error.message}`);
      failed++;
    } else if (!data || data.length === 0) {
      console.warn(`  ⚠️  ${productName}: No matching product in DB`);
      notFound++;
    } else {
      console.log(`  ✅ ${productName} → ${storagePath}`);
      updated++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Not found: ${notFound}`);
  console.log(`  Failed: ${failed}`);
}

main().catch(console.error);
