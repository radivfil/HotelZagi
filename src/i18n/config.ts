/**
 * Jedino mjesto za konfiguraciju jezika.
 *
 * Dodavanje jezika (vidi docs/NOVI-JEZIK.md):
 *   1. postavite `enabled: true` za jezik ispod,
 *   2. dodajte rječnik src/i18n/ui/<code>.ts,
 *   3. dodajte sadržaj u src/content/<kolekcija>/<code>/ (nije obavezno – nedostajući
 *      sadržaj automatski se prikazuje na jeziku iz `fallback`).
 * Komponente se ne mijenjaju: rutiranje, prekidač jezika, hreflang, sitemap i
 * canonical generiraju se iz ovog popisa i prate samo uključene jezike.
 */
export interface LocaleConfig {
  /** ISO 639-1 kod, koristi se u URL-u (/hr/, /en/ …) */
  code: string;
  /** Kratka oznaka u prekidaču jezika */
  label: string;
  /** Puni naziv na tom jeziku (za čitače zaslona i izbornik) */
  name: string;
  /** Vrijednost za hreflang i <html lang> */
  hreflang: string;
  /** Open Graph locale */
  ogLocale: string;
  /** Uključen u izgradnju weba */
  enabled: boolean;
  /** Jezik iz kojeg se uzima sadržaj ako prijevod ne postoji */
  fallback: string;
}

export const defaultLocale = 'hr';

export const locales: LocaleConfig[] = [
  { code: 'hr', label: 'HR', name: 'Hrvatski', hreflang: 'hr', ogLocale: 'hr_HR', enabled: true, fallback: 'hr' },
  { code: 'en', label: 'EN', name: 'English', hreflang: 'en', ogLocale: 'en_GB', enabled: true, fallback: 'hr' },
  { code: 'pl', label: 'PL', name: 'Polski', hreflang: 'pl', ogLocale: 'pl_PL', enabled: false, fallback: 'en' },
  { code: 'cs', label: 'CS', name: 'Čeština', hreflang: 'cs', ogLocale: 'cs_CZ', enabled: false, fallback: 'en' },
  { code: 'nl', label: 'NL', name: 'Nederlands', hreflang: 'nl', ogLocale: 'nl_NL', enabled: false, fallback: 'en' },
];

export const enabledLocales = locales.filter((l) => l.enabled);
export const enabledLocaleCodes = enabledLocales.map((l) => l.code);

export function getLocale(code: string): LocaleConfig {
  return locales.find((l) => l.code === code) ?? locales.find((l) => l.code === defaultLocale)!;
}

/** Redoslijed jezika iz kojih se traži sadržaj: traženi → njegov fallback → hr → en */
export function fallbackChain(code: string): string[] {
  const chain = [code, getLocale(code).fallback, defaultLocale, 'en'];
  return [...new Set(chain)];
}
