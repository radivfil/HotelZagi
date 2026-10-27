import { defaultLocale, enabledLocales, enabledLocaleCodes } from './config';

/**
 * Lokalizirani URL-ovi stranica. Ključ je interni naziv stranice, vrijednost
 * je slug po jeziku. Jezik bez sluga koristi engleski slug.
 */
export const routes = {
  home: { hr: '', en: '' },
  rooms: { hr: 'smjestaj', en: 'accommodation', pl: 'zakwaterowanie', cs: 'ubytovani', nl: 'accommodatie' },
  wellness: { hr: 'wellness', en: 'wellness' },
  restaurant: { hr: 'restoran', en: 'restaurant', pl: 'restauracja', nl: 'restaurant' },
  conference: { hr: 'kongresna-dvorana', en: 'conference-hall', pl: 'sala-konferencyjna', cs: 'konferencni-sal', nl: 'congreszaal' },
  about: { hr: 'o-nama', en: 'about-us', pl: 'o-nas', cs: 'o-nas', nl: 'over-ons' },
  gallery: { hr: 'galerija', en: 'gallery', pl: 'galeria', cs: 'galerie', nl: 'galerij' },
  contact: { hr: 'kontakt', en: 'contact', pl: 'kontakt', cs: 'kontakt', nl: 'contact' },
  privacy: { hr: 'privatnost', en: 'privacy', pl: 'prywatnosc', cs: 'soukromi', nl: 'privacy' },
  cookies: { hr: 'kolacici', en: 'cookies', pl: 'ciasteczka', cs: 'cookies', nl: 'cookies' },
  booking: { hr: 'rezervacija', en: 'booking', pl: 'rezerwacja', cs: 'rezervace', nl: 'reserveren' },
} satisfies Record<string, Record<string, string>>;

export type PageKey = keyof typeof routes;
export const pageKeys = Object.keys(routes) as PageKey[];

export function slugFor(key: PageKey, locale: string): string {
  const map = routes[key] as Record<string, string>;
  return map[locale] ?? map.en;
}

export function pathFor(key: PageKey, locale: string = defaultLocale, hash = ''): string {
  const slug = slugFor(key, locale);
  return `/${locale}/${slug ? `${slug}/` : ''}${hash}`;
}

/** Sve jezične inačice stranice (samo uključeni jezici) – za hreflang, sitemap i prekidač jezika. */
export function alternatesFor(key: PageKey) {
  return enabledLocales.map((l) => ({ locale: l.code, hreflang: l.hreflang, label: l.label, name: l.name, path: pathFor(key, l.code) }));
}

/** Iz putanje (/en/accommodation/) vraća ključ stranice i jezik – koristi ga sitemap. */
export function matchPath(pathname: string): { key: PageKey; locale: string } | undefined {
  const [, locale = '', slug = ''] = pathname.split('/');
  if (!enabledLocaleCodes.includes(locale)) return undefined;
  const key = pageKeys.find((k) => slugFor(k, locale) === slug);
  return key ? { key, locale } : undefined;
}
