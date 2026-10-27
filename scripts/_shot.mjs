import { chromium } from 'playwright';
const [,, url, out, w, y, h] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +w, height: +h } })).newPage();
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate((y) => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-revealed')); const el = document.querySelector(y); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 80); }, y);
await p.waitForTimeout(500); await p.screenshot({ path: out, fullPage: false }); await b.close();
