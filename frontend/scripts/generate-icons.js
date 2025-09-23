import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconSizes = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

async function generateIcons() {
  const logoPath = path.join(__dirname, '../public/logo.webp');
  
  if (!fs.existsSync(logoPath)) {
    console.error('Logo not found at:', logoPath);
    return;
  }

  for (const icon of iconSizes) {
    try {
      await sharp(logoPath)
        .resize(icon.size, icon.size)
        .png()
        .toFile(path.join(__dirname, '../public', icon.name));
      
      console.log(`Generated ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`Error generating ${icon.name}:`, error);
    }
  }
  
  console.log('All icons generated successfully!');
}

generateIcons();
