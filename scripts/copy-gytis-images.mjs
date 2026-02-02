import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Check if outputs directory exists
if (!fs.existsSync(OUTPUTS_DIR)) {
  console.error('❌ outputs aplankas neegzistuoja!');
  process.exit(1);
}

// Get all image files from outputs
const imageFiles = fs.readdirSync(OUTPUTS_DIR)
  .filter(file => file.startsWith('image_') && file.endsWith('.png'))
  .sort();

if (imageFiles.length === 0) {
  console.log('⚠️ Nuotraukos outputs aplanke nerastos.');
  console.log('   Paleiskite: npm run generate:images');
  process.exit(0);
}

console.log(`📸 Rastos ${imageFiles.length} nuotraukos outputs aplanke`);

// Copy first 4 images to public as gytis_1.png, gytis_2.png, etc.
const numToCopy = Math.min(4, imageFiles.length);
let copied = 0;

for (let i = 0; i < numToCopy; i++) {
  const sourceFile = path.join(OUTPUTS_DIR, imageFiles[i]);
  const destFile = path.join(PUBLIC_DIR, `gytis_${i + 1}.png`);
  
  try {
    fs.copyFileSync(sourceFile, destFile);
    console.log(`✅ Nukopijuota: ${imageFiles[i]} -> public/gytis_${i + 1}.png`);
    copied++;
  } catch (error) {
    console.error(`❌ Klaida kopijuojant ${imageFiles[i]}:`, error.message);
  }
}

console.log(`\n✅ Iš viso nukopijuota ${copied} nuotraukos į public aplanką`);
console.log('📁 Nuotraukos bus matomos Gytis profilyje!');
