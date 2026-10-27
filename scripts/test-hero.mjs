// Automatski test hero slidera:
//  1) kontrole slidera i booking traka ne presijecaju se (320–1920 px, portret/pejzaž, zoom 200 %),
//     kontrole su ≥ 44 px i klikabilne (ništa ih ne prekriva)
//  2) autoplay: izmjena udesno svakih ~5 s, ručni klik ne gasi autoplay, hover nad slikom ne pauzira,
//     hover nad tekstom privremeno pauzira, gumb pauza zaustavlja do ponovnog klika,
//     prefers-reduced-motion = bez autoplaya, swipe radi, prva slika je LCP kandidat
// Pokretanje: npm run preview (drugi terminal), zatim `npm run test:hero`.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const OUT = process.env.OUT ?? 'docs/screens/hero';
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const errors = [];
const ok = (cond, msg) => {
  if (!cond) errors.push(msg);
  console.log(`${cond ? '✓' : '✗'} ${msg}`);
};

// ---------------------------------------------------------------- 1) preklapanje
const VIEWPORTS = [
  { name: '320 portret', width: 320, height: 640 },
  { name: '375 portret', width: 375, height: 812 },
  { name: '812 pejzaž (mobitel)', width: 812, height: 375 },
  { name: '768 portret (tablet)', width: 768, height: 1024 },
  { name: '1024 pejzaž (tablet)', width: 1024, height: 768 },
  { name: '1024 portret (tablet)', width: 1024, height: 1366 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 },
  { name: '1440 uz zoom 200 %', width: 720, height: 450, deviceScaleFactor: 2 },
  { name: '1920 uz zoom 200 %', width: 960, height: 540, deviceScaleFactor: 2 },
];
for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor ?? 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${BASE}/hr/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  const r = await page.evaluate(() => {
    const controls = [...document.querySelectorAll('[data-controls] button')].filter((b) => b.offsetParent);
    const hits = [];
    const small = [];
    const covered = [];
    for (const c of controls) {
      c.scrollIntoView({ block: 'center' });
    }
    const barNow = document.querySelector('.booking-bar').getBoundingClientRect();
    for (const c of controls) {
      const b = c.getBoundingClientRect();
      const intersects = b.left < barNow.right && b.right > barNow.left && b.top < barNow.bottom && b.bottom > barNow.top;
      if (intersects) hits.push(c.getAttribute('aria-label'));
      if (b.width < 44 || b.height < 44) small.push(`${c.getAttribute('aria-label')} ${Math.round(b.width)}×${Math.round(b.height)}`);
      const el = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      if (!el || !c.contains(el)) covered.push(c.getAttribute('aria-label'));
    }
    return { count: controls.length, hits, small, covered, gap: Math.round(barNow.top - Math.max(...controls.map((c) => c.getBoundingClientRect().bottom))) };
  });
  ok(r.count > 0 && r.hits.length === 0 && r.small.length === 0 && r.covered.length === 0,
    `${vp.name}: ${r.count} kontrola, razmak do booking trake ${r.gap} px, presijecanja ${r.hits.length}, < 44 px ${r.small.length}, prekrivene ${r.covered.length}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${OUT}/hero-${vp.width}x${vp.height}${vp.deviceScaleFactor ? '@2x' : ''}.jpg`, type: 'jpeg', quality: 70 });
  await context.close();
}

// ---------------------------------------------------------------- 2) autoplay
const idx = (p) => p.evaluate(() => [...document.querySelectorAll('[data-slide]')].findIndex((s) => s.classList.contains('is-active')));
const fresh = async (opts = {}) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await context.newPage();
  await page.goto(`${BASE}/hr/`, { waitUntil: 'networkidle' });
  return page;
};

let p = await fresh();
await p.mouse.move(1200, 300); // iznad fotografije, ne iznad teksta
await p.waitForTimeout(5600);
ok((await idx(p)) === 1, 'autoplay: nakon ~5 s prelazi na sljedeći slajd (miš iznad fotografije ne pauzira)');
await p.waitForTimeout(5200);
ok((await idx(p)) === 2, 'autoplay: nastavlja udesno (slajd 3 nakon ~10 s)');

await p.click('[data-prev]');
const afterPrev = await idx(p);
ok(afterPrev === 1, 'ručno „prethodni” prelazi na prethodni slajd');
await p.mouse.move(1200, 300);
await p.waitForTimeout(5600);
ok((await idx(p)) === 2, 'nakon ručnog klika autoplay se nastavlja (novo odbrojavanje 5 s)');

await p.click('[data-next]');
await p.waitForTimeout(2500);
ok((await idx(p)) === 3, 'klik „sljedeći” odmah prelazi i ne prelazi ponovno prije 5 s');
await p.waitForTimeout(3200);
ok((await idx(p)) === 4, '…a nakon 5 s od klika prelazi dalje');

await p.hover('.hero__slide.is-active .hero__title');
const held = await idx(p);
await p.waitForTimeout(6000);
ok((await idx(p)) === held, 'hover nad tekstom slajda privremeno pauzira');
await p.mouse.move(1200, 200);
await p.waitForTimeout(5600);
ok((await idx(p)) !== held, 'kad miš ode s teksta, autoplay se nastavlja');

await p.click('[data-toggle]');
await p.mouse.move(1200, 200);
const paused = await idx(p);
await p.waitForTimeout(6000);
ok((await idx(p)) === paused && (await p.getAttribute('[data-toggle]', 'aria-label')).includes('Pokreni'), 'gumb pauza zaustavlja do ponovnog klika');
await p.click('[data-toggle]');
await p.mouse.move(1200, 200);
await p.waitForTimeout(5600);
ok((await idx(p)) !== paused, 'ponovni klik na play nastavlja izmjenu');

ok(await p.evaluate(() => {
  const img = document.querySelector('[data-slide] img');
  return img.getAttribute('fetchpriority') === 'high' && img.getAttribute('loading') === 'eager' && !img.hasAttribute('data-src');
}), 'prva slika: fetchpriority="high", loading="eager" (LCP)');
ok(await p.evaluate(() => getComputedStyle(document.querySelector('.hero__dot[aria-current="true"] span'), '::after').animationName === 'hero-progress' || document.querySelector('.hero.is-playing') !== null), 'indikator napretka radi dok slider teče');

p = await fresh({ reducedMotion: 'reduce' });
await p.waitForTimeout(5800);
ok((await idx(p)) === 0, 'prefers-reduced-motion: bez autoplaya (namjerno)');
await p.click('[data-next]');
ok((await idx(p)) === 1, 'prefers-reduced-motion: ručna navigacija radi');

p = await fresh({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 812 } });
await p.mouse.move(300, 300);
await p.mouse.down();
await p.mouse.move(120, 310, { steps: 5 });
await p.mouse.up();
ok((await idx(p)) === 1, 'swipe ulijevo prelazi na sljedeći slajd');

await browser.close();
if (errors.length) {
  console.log(`\n✗ ${errors.length} neuspjelih provjera`);
  process.exitCode = 1;
} else console.log('\n✓ Sve provjere hero slidera prolaze.');
