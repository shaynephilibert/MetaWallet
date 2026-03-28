// Run with: node scripts/generate-icons.mjs
// Requires: npm install -D sharp
import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#7c3aed"/>
  <text
    x="50%"
    y="55%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="-apple-system, sans-serif"
    font-size="${size * 0.55}"
    fill="white"
  >🔒</text>
</svg>`;

for (const size of [16, 48, 128]) {
  await sharp(Buffer.from(svg(size)))
    .png()
    .toFile(`public/icons/icon${size}.png`);
  console.log(`Generated icon${size}.png`);
}
