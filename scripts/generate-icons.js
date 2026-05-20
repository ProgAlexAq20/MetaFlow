import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='; // 1x1 PNG transparent
const buffer = Buffer.from(base64, 'base64');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = [
  'icon-96x96.png',
  'icon-192x192.png',
  'icon-512x512.png',
  'icon-maskable-192x192.png',
  'icon-maskable-512x512.png',
  'screenshot-1.png',
  'screenshot-2.png',
];

files.forEach((name) => {
  const p = path.join(outDir, name);
  fs.writeFileSync(p, buffer);
  console.log('Wrote', p);
});

console.log('Icons generated in public/ (1x1 transparent PNG placeholder)');
