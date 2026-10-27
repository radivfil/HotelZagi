// Generira responzivne varijante (AVIF + WebP) za sve slike u public/uploads/
// i zapisuje manifest (dimenzije + dostupne širine) u src/data/images.json.
//
// Uređivač (ili budući CMS) samo spremi JPG/PNG u public/uploads/<kategorija>/,
// a ova skripta se pokreće automatski prije `npm run dev` i `npm run build`.
// Već generirane varijante se preskaču, pa je ponovno pokretanje brzo.
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const UPLOADS = path.join(ROOT, 'public', 'uploads');
const OUT = path.join(UPLOADS, '_gen');
const MANIFEST = path.join(ROOT, 'src', 'data', 'images.json');
const WIDTHS = [480, 768, 1024, 1440, 1920];
const SOURCE_EXT = new Set(['.jpg', '.jpeg', '.png']);
const FORCE = process.argv.includes('--force');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (SOURCE_EXT.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

const files = await walk(UPLOADS);
const manifest = {};
let generated = 0;

for (const file of files) {
  const rel = path.relative(UPLOADS, file).split(path.sep).join('/');
  const key = `/uploads/${rel}`;
  const base = rel.replace(/\.[^.]+$/, '');
  const meta = await sharp(file).metadata();
  const widths = WIDTHS.filter((w) => w < meta.width);
  widths.push(Math.min(meta.width, 1920));
  const unique = [...new Set(widths)].sort((a, b) => a - b);

  for (const w of unique) {
    for (const format of ['avif', 'webp']) {
      const target = path.join(OUT, `${base}-${w}.${format}`);
      // Postojeće varijante se ne diraju (commitane su u repozitorij da build bude brz).
      // Za ponovno generiranje: `npm run images -- --force`.
      if (!FORCE && existsSync(target)) continue;
      await mkdir(path.dirname(target), { recursive: true });
      const pipeline = sharp(file).rotate().resize({ width: w, withoutEnlargement: true });
      if (format === 'avif') await pipeline.avif({ quality: 52, effort: 4 }).toFile(target);
      else await pipeline.webp({ quality: 74 }).toFile(target);
      generated++;
    }
  }
  manifest[key] = {
    width: meta.width,
    height: meta.height,
    widths: unique,
    gen: `/uploads/_gen/${base}`,
  };
}

await mkdir(path.dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`[images] ${files.length} izvornih slika, ${generated} novih varijanti → ${path.relative(ROOT, MANIFEST)}`);
