import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base prompt for image generation
const BASE_PROMPT = "Photorealistic documentary-style portrait photo. Middle-aged man, relaxed on a beach chair in Egypt, tanned like a white tourist after several days, holding a half-full clear plastic cup of Coca-Cola. Natural harsh sunlight, no glamour, no filters, realistic skin texture. Vertical photo. No text, no watermark.";

// Configuration
const NUM_IMAGES = 4; // Generate 4 images
const OUTPUT_DIR = path.join(__dirname, '..', 'outputs');
const IMAGE_SIZE = '1024x1792'; // Vertical format (OpenAI supported sizes: 1024x1024, 1024x1792, 1792x1024)

// Validate API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Klaida: OPENAI_API_KEY nerastas .env faile!');
  console.error('   Prašome pridėti OPENAI_API_KEY=your_key_here į .env failą projekto šaknyje.');
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✅ Sukurtas ${OUTPUT_DIR} aplankas`);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateImage(prompt, imageNumber) {
  try {
    console.log(`📸 Generuojama nuotrauka ${imageNumber}/${NUM_IMAGES}...`);
    
    // Note: OpenAI Images API uses "dall-e-3" or "dall-e-2" as model names
    // "gpt-image-1" doesn't exist, so we'll use "dall-e-3" for best quality
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: IMAGE_SIZE,
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data[0].url;
    
    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Nepavyko atsisiųsti nuotraukos: ${imageResponse.statusText}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const imagePath = path.join(OUTPUT_DIR, `image_${String(imageNumber).padStart(2, '0')}.png`);
    
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
    console.log(`✅ Išsaugota: ${imagePath}`);
    
    return imagePath;
  } catch (error) {
    console.error(`❌ Klaida generuojant nuotrauką ${imageNumber}:`, error.message);
    throw error;
  }
}

async function generateAllImages() {
  console.log('🚀 Pradedamas nuotraukų generavimas...');
  console.log(`📝 Prompt: ${BASE_PROMPT}`);
  console.log(`📊 Kiekis: ${NUM_IMAGES} nuotraukos`);
  console.log(`📐 Dydis: ${IMAGE_SIZE}\n`);

  const generatedPaths = [];
  
  for (let i = 1; i <= NUM_IMAGES; i++) {
    try {
      const imagePath = await generateImage(BASE_PROMPT, i);
      generatedPaths.push(imagePath);
      
      // Add delay between requests to avoid rate limiting
      if (i < NUM_IMAGES) {
        console.log('⏳ Laukiama 2 sekundes prieš kitą užklausą...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Nepavyko generuoti nuotraukos ${i}`);
      // Continue with next image even if one fails
    }
  }

  console.log('\n✅ Generavimas baigtas!');
  console.log(`📁 Iš viso sugeneruota: ${generatedPaths.length} nuotraukos`);
  console.log(`📂 Aplankas: ${OUTPUT_DIR}`);
  
  return generatedPaths;
}

// Run the generation
generateAllImages()
  .then(() => {
    console.log('\n🎉 Visos nuotraukos sėkmingai sugeneruotos!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Kritinė klaida:', error);
    process.exit(1);
  });
