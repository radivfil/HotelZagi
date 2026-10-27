/**
 * Interne putanje uz `base` (npr. GitHub Pages project site: /HotelZagi/).
 * SVE interne poveznice i resursi prolaze kroz withBase(); vanjski URL-ovi,
 * sidra (#…), tel: i mailto: ostaju netaknuti.
 * Base dolazi iz BASE_PATH (astro.config.mjs); zadano je "/".
 */
const rawBase = (import.meta.env?.BASE_URL as string | undefined) ?? '/';
export const BASE = rawBase.replace(/\/+$/, ''); // '' ili '/HotelZagi'

export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  if (BASE && (path === BASE || path.startsWith(`${BASE}/`))) return path;
  return `${BASE}${path}`;
}

/** Uklanja base s putanje (npr. za prepoznavanje stranice iz URL-a). */
export function stripBase(pathname: string, base = BASE): string {
  return base && pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname;
}
