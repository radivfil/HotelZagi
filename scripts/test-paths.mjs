// Provjera putanja uz base (GitHub Pages project site):
//  - korijen preusmjerava na /<base>/hr/
//  - obilazak svih internih stranica: nijedan zahtjev prema istom poslužitelju ne vraća 4xx/5xx
//  - svaki interni URL u href/src/srcset/data-* počinje s base
//  - brošure (PDF) i sve slike iz lightboxa postoje
//  - nepostojeća adresa vraća 404 stranicu sa stilovima
// Pokretanje: build s BASE_PATH, `npm run preview`, zatim `BASE_PATH=/HotelZagi npm run test:paths`.
import { chromium } from 'playwright';

const ORIGIN = process.env.BASE_URL ?? 'http://localhost:4321';
const BASE_PATH = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');
const ROOT = `${ORIGIN}${BASE_PATH}/`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const errors = [];
const seenAssets = new Set();

// 1) korijen → /hr/
{
  const page = await context.newPage();
  await page.goto(ROOT, { waitUntil: 'networkidle' });
  const url = new URL(page.url());
  if (url.pathname !== `${BASE_PATH}/hr/`) errors.push(`Korijen ne preusmjerava na ${BASE_PATH}/hr/ nego na ${url.pathname}`);
  await page.close();
}

// 2) obilazak
const queue = [`${ROOT}hr/`, `${ROOT}en/`];
const visited = new Set();
while (queue.length) {
  const url = queue.shift();
  if (visited.has(url)) continue;
  visited.add(url);
  const page = await context.newPage();
  page.on('response', (r) => {
    if (!r.url().startsWith(ORIGIN)) return;
    seenAssets.add(r.url());
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()} (na ${url})`);
  });
  page.on('requestfailed', (r) => r.url().startsWith(ORIGIN) && errors.push(`neuspio zahtjev ${r.url()} (na ${url})`));
  page.on('pageerror', (e) => errors.push(`JS greška na ${url}: ${e}`));
  await page.goto(url, { waitUntil: 'networkidle' });
  // učitaj lazy slike
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
  });
  await page.waitForLoadState('networkidle');

  const found = await page.evaluate((base) => {
    const bad = [];
    const links = [];
    const assets = [];
    const check = (el, attr, value) => {
      if (!value) return;
      for (const part of attr === 'srcset' || attr === 'data-srcset' ? value.split(',').map((s) => s.trim().split(' ')[0]) : [value]) {
        if (part.startsWith('/') && !part.startsWith('//') && base && !part.startsWith(`${base}/`)) bad.push(`${el.tagName.toLowerCase()}[${attr}]=${part}`);
        if (part.startsWith('/') && attr !== 'href') assets.push(part);
      }
    };
    document.querySelectorAll('[href],[src],[srcset],[data-full],[data-src],[data-srcset],[action]').forEach((el) => {
      for (const attr of ['href', 'src', 'srcset', 'data-full', 'data-src', 'data-srcset', 'action']) check(el, attr, el.getAttribute(attr));
    });
    document.querySelectorAll('a[href]').forEach((a) => {
      const h = a.getAttribute('href');
      if (h.startsWith('/') && !h.startsWith('//')) links.push(h);
    });
    return { bad, links, assets };
  }, BASE_PATH);
  found.bad.forEach((b) => errors.push(`Interni URL bez base-a na ${url}: ${b}`));
  for (const href of found.links) {
    const abs = new URL(href, ORIGIN).href.split('#')[0];
    if (abs.endsWith('/') && !visited.has(abs)) queue.push(abs);
    else if (!abs.endsWith('/')) seenAssets.add(`check:${abs}`);
  }
  // resursi koji se učitavaju tek na zahtjev (lightbox, odgođeni slajdovi)
  for (const a of found.assets) seenAssets.add(`check:${new URL(a, ORIGIN).href}`);
  await page.close();
}

// 3) PDF-ovi, slike iz lightboxa i odgođeni resursi
const pending = [...seenAssets].filter((u) => u.startsWith('check:')).map((u) => u.slice(6));
for (const asset of [...new Set(pending)]) {
  const res = await context.request.get(asset);
  if (res.status() >= 400) errors.push(`${res.status()} ${asset}`);
  if (asset.endsWith('.pdf') && !(res.headers()['content-type'] ?? '').includes('pdf')) errors.push(`PDF ima pogrešan tip: ${asset}`);
}

// 4) 404 stranica uz base
{
  const page = await context.newPage();
  const assetErrors = [];
  page.on('response', (r) => r.url() !== `${ROOT}ova-stranica-ne-postoji/` && r.url().startsWith(ORIGIN) && r.status() >= 400 && assetErrors.push(r.url()));
  const res = await page.goto(`${ROOT}ova-stranica-ne-postoji/`, { waitUntil: 'networkidle' });
  const styled = await page.evaluate(() => getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)');
  const h1 = await page.locator('h1').count();
  if (res.status() !== 404) errors.push(`404 stranica vraća status ${res.status()}`);
  if (!styled || h1 !== 1) errors.push('404 stranica nema stilove ili H1');
  assetErrors.forEach((u) => errors.push(`404 stranica: resurs ne postoji ${u}`));
  await page.close();
}

await browser.close();
if (errors.length) {
  console.log([...new Set(errors)].slice(0, 40).join('\n'));
  console.log(`\n✗ ${errors.length} problema`);
  process.exitCode = 1;
} else {
  console.log(`✓ Base „${BASE_PATH || '/'}”: ${visited.size} stranica, ${pending.length} dodatnih resursa (PDF, lightbox, odgođene slike) – nijedan 404, svi interni URL-ovi s base-om, korijen → /hr/, 404 stranica radi.`);
}
