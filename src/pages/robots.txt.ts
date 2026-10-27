import type { APIRoute } from 'astro';
import { SITE } from '@/config/site';

/** robots.txt – uz PUBLIC_NOINDEX=true (demo objava) blokira indeksiranje. */
export const GET: APIRoute = () => {
  const body = SITE.noindex
    ? ['User-agent: *', 'Disallow: /', ''].join('\n')
    : ['User-agent: *', 'Allow: /', 'Disallow: /hr/rezervacija/', 'Disallow: /en/booking/', '', `Sitemap: ${SITE.url}/sitemap-index.xml`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
