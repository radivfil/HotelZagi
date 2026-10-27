// Provjera prijeloma redaka: nijedna crtica (-, –, —) ne smije biti na početku ili kraju retka.
// Za svaki znak crtice mjeri se položaj u pregledniku i uspoređuje s prethodnim i sljedećim
// vidljivim znakom; ako je u drugom retku, crtica je na rubu retka.
// Pokretanje: npm run preview (drugi terminal), zatim `npm run test:dashes`.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const OUT = process.env.OUT ?? 'docs/screens/typography';
const WIDTHS = [375, 768, 1024, 1440];
const PAGES = (process.env.PAGES ?? '/hr/,/hr/restoran/,/hr/wellness/,/en/,/en/restaurant/,/en/wellness/').split(',').filter(Boolean);
const SHOTS = new Set(['/hr/', '/hr/restoran/', '/hr/wellness/']);

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const failures = [];

for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  for (const path of PAGES) {
    const page = await context.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed')));
    // na naslovnici provjeri svaki slajd (neaktivni su skriveni)
    const slides = await page.locator('[data-slide]').count();
    const rounds = Math.max(1, slides);
    for (let s = 0; s < rounds; s++) {
      if (slides) await page.evaluate((i) => document.querySelectorAll('[data-dot]')[i]?.click(), s);
      await page.waitForTimeout(slides ? 150 : 0);
      const bad = await page.evaluate(() => {
        const DASH = /[-–—]/;
        const SKIP = /[\s ⁠]/;
        const out = [];
        const rectOf = (node, i) => {
          const r = document.createRange();
          r.setStart(node, i);
          r.setEnd(node, i + 1);
          const rects = r.getClientRects();
          return rects.length ? rects[0] : null;
        };
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode: (n) => {
            const el = n.parentElement;
            if (!el || el.closest('script, style, [hidden], .visually-hidden, input, select, textarea, [aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
            const cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.display === 'none') return NodeFilter.FILTER_REJECT;
            return DASH.test(n.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          },
        });
        let node;
        while ((node = walker.nextNode())) {
          const text = node.data;
          for (let i = 0; i < text.length; i++) {
            if (!DASH.test(text[i])) continue;
            const d = rectOf(node, i);
            if (!d || d.width === 0) continue;
            let p = i - 1;
            while (p >= 0 && SKIP.test(text[p])) p--;
            let q = i + 1;
            while (q < text.length && SKIP.test(text[q])) q++;
            const prev = p >= 0 ? rectOf(node, p) : null;
            const next = q < text.length ? rectOf(node, q) : null;
            const tol = d.height / 2;
            const atStart = prev && prev.top < d.top - tol;
            const atEnd = next && next.top > d.top + tol;
            if (atStart || atEnd) {
              out.push(`${atStart ? 'POČETAK' : 'KRAJ'} retka: „${text.slice(Math.max(0, i - 25), i + 25).replace(/[ ⁠]/g, ' ')}”`);
            }
          }
        }
        return out;
      });
      bad.forEach((b) => failures.push(`${path} @${width}px: ${b}`));
      if (!slides) break;
    }
    if (SHOTS.has(path)) {
      const name = `${path.replace(/\//g, '_').replace(/^_|_$/g, '') || 'root'}-${width}.jpg`;
      await page.evaluate(() => document.querySelectorAll('[data-dot]')[0]?.click());
      await page.screenshot({ path: `${OUT}/${name}`, fullPage: true, type: 'jpeg', quality: 65 });
    }
    await page.close();
  }
  await context.close();
}
await browser.close();

if (failures.length) {
  console.log([...new Set(failures)].join('\n'));
  process.exitCode = 1;
} else {
  console.log(`✓ ${PAGES.length} stranica × ${WIDTHS.length} širine: nijedna crtica na početku ili kraju retka.`);
}
