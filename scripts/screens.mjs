// Playwright screenshotovi ključnih stranica na 375, 768, 1024 i 1440 px + automatske provjere:
// horizontalni scroll, greške u konzoli, neuspjeli zahtjevi, premale dodirne površine.
// Pokretanje: npm run build && npm run preview (u drugom terminalu), zatim `npm run screens`.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const OUT = process.env.OUT ?? 'docs/screens';
const WIDTHS = [375, 768, 1024, 1440];
const PAGES = (process.env.PAGES ?? '/hr/,/hr/smjestaj/,/hr/wellness/,/hr/restoran/,/hr/kongresna-dvorana/,/hr/galerija/,/hr/kontakt/,/en/,/en/wellness/')
  .split(',')
  .filter(Boolean);
const FULL = process.env.FULL !== 'false';

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const problems = [];

for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: width < 768 ? 812 : 900 }, reducedMotion: 'reduce' });
  for (const path of PAGES) {
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));
    page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    // pokreni lazy slike i reveal animacije
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
    });
    await page.waitForTimeout(300);
    const check = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      const offenders = [];
      if (overflow > 0) {
        document.querySelectorAll('body *').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > window.innerWidth + 1 && r.width > 0 && getComputedStyle(el).position !== 'fixed') offenders.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
        });
      }
      const small = [];
      document.querySelectorAll('a[href], button, input, select, textarea, summary').forEach((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        if (r.width === 0 || s.visibility === 'hidden' || el.closest('[hidden],[inert],.visually-hidden,[aria-hidden="true"]')) return;
        if (el.matches('input[type="checkbox"]')) return; // labela je dodirna površina
        if (el.closest('p, li, label') && el.tagName === 'A' && s.display === 'inline') return; // poveznice u tekstu (iznimka WCAG 2.5.8)
        if (r.height < 24 || r.width < 24) small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
      });
      const h1 = document.querySelectorAll('h1').length;
      return { overflow, offenders: offenders.slice(0, 5), small: small.slice(0, 8), h1 };
    });
    const name = `${path.replace(/\//g, '_').replace(/^_|_$/g, '') || 'root'}-${width}.jpg`;
    await page.screenshot({ path: `${OUT}/${name}`, fullPage: FULL, type: 'jpeg', quality: 70 });
    if (check.overflow > 0 || errors.length || check.h1 !== 1 || check.small.length) {
      problems.push({ path, width, ...check, errors: errors.slice(0, 5) });
    }
    await page.close();
  }
  await context.close();
}
await browser.close();

if (problems.length) {
  console.log(JSON.stringify(problems, null, 2));
  process.exitCode = 1;
} else {
  console.log(`✓ ${PAGES.length} stranica × ${WIDTHS.length} širine: bez horizontalnog scrolla, grešaka u konzoli i premalih dodirnih površina; po jedan H1.`);
}
