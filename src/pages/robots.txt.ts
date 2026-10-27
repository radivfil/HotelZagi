import type { APIRoute } from 'astro';
import { SITE } from '@/config/site';
import { withBase } from '@/lib/url';

/**
 * robots.txt – uz DEMO_MODE=true blokira indeksiranje (dodatna mjera; glavna zaštita je meta robots noindex).
 * Napomena: na GitHub Pages project site adresi (korisnik.github.io/repo/) robots.txt nema učinka,
 * jer tražilice čitaju samo korijenski korisnik.github.io/robots.txt.
 */
export const GET: APIRoute = () => {
  const body = SITE.demo
    ? ['User-agent: *', 'Disallow: /', ''].join('\n')
    : ['User-agent: *', 'Allow: /', `Disallow: ${withBase('/hr/rezervacija/')}`, `Disallow: ${withBase('/en/booking/')}`, '', `Sitemap: ${SITE.url}${withBase('/sitemap-index.xml')}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
