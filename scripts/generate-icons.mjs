// scripts/generate-icons.mjs
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../public/icons');

// 간단한 캘린더 아이콘 SVG
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#0f172a"/>
  <rect x="${size * 0.1}" y="${size * 0.25}" width="${size * 0.8}" height="${size * 0.65}" rx="${size * 0.05}" fill="white"/>
  <rect x="${size * 0.2}" y="${size * 0.1}" width="${size * 0.12}" height="${size * 0.2}" rx="${size * 0.03}" fill="#0f172a"/>
  <rect x="${size * 0.68}" y="${size * 0.1}" width="${size * 0.12}" height="${size * 0.2}" rx="${size * 0.03}" fill="#0f172a"/>
  <text x="${size * 0.5}" y="${size * 0.72}" font-family="Arial, sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="#0f172a" text-anchor="middle">S</text>
</svg>
`;

async function generateIcons() {
  await mkdir(iconsDir, { recursive: true });

  const sizes = [192, 512];

  for (const size of sizes) {
    const svg = createIconSVG(size);
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
  }

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
