// Nevidljivi tipografski znakovi (NBSP, nerazdvojiva crtica, WORD JOINER, uski NBSP) smiju biti
// samo u vidljivom tekstu. Test pregledava SVE izgrađene HTML stranice (oba jezika) u dist/ i
// javlja ih ako se nađu u <title>, meta oznakama, JSON-LD-u, alt tekstovima ili URL atributima.
// Pokretanje: nakon `npm run build` → `npm run test:invisible`.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve(process.argv[2] ?? 'dist');
const CHARS = String.fromCharCode(0x00a0, 0x2011, 0x2060, 0x202f);
const BAD = new RegExp(`[${CHARS}]|&nbsp;|&#160;|&#x0*a0;`, 'i');
const NAMES = { 0xa0: 'NBSP', 0x2011: 'NB-HYPHEN', 0x2060: 'WORD JOINER', 0x202f: 'NNBSP' };
const ATTRS = ['alt', 'href', 'src', 'srcset', 'content', 'action', 'data-full', 'data-src', 'data-srcset', 'data-alt', 'data-subject', 'data-mailto'];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const describe = (s) => {
  const m = s.match(new RegExp(`[${CHARS}]`));
  return m ? NAMES[m[0].charCodeAt(0)] : 'entitet &nbsp;';
};

const files = await walk(DIST);
const problems = [];
let visibleWithNbsp = 0;

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const rel = path.relative(DIST, file).split(path.sep).join('/');
  const report = (where, value) => problems.push(`${rel}: ${where} sadrži ${describe(value)} → „${value.slice(0, 80)}”`);

  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
  if (BAD.test(title)) report('<title>', title);

  for (const m of html.matchAll(/<meta\b[^>]*>/g)) if (BAD.test(m[0])) report('meta', m[0]);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) if (BAD.test(m[1])) report('JSON-LD', m[1]);
  for (const attr of ATTRS) {
    for (const m of html.matchAll(new RegExp(`\\s${attr}="([^"]*)"`, 'g'))) if (BAD.test(m[1])) report(`atribut ${attr}`, m[1]);
  }
  // kontrola: vidljivi tekst SMIJE (i treba) sadržavati nerazdvojive razmake
  if (html.includes(String.fromCharCode(0x00a0))) visibleWithNbsp++;
}

if (problems.length) {
  console.log([...new Set(problems)].slice(0, 40).join('\n'));
  console.log(`\n✗ ${problems.length} nalaza u ${files.length} HTML datoteka`);
  process.exitCode = 1;
} else {
  console.log(`✓ ${files.length} HTML datoteka: nema nevidljivih znakova u <title>, meta, JSON-LD, alt ni URL atributima (vidljivi tekst ih koristi na ${visibleWithNbsp} stranica).`);
}
