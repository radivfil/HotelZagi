/**
 * Tipografska obrada teksta pri izradi weba (sadržaj iz kolekcija i rječnici sučelja).
 * Ne mijenja značenje ni znakove teksta – samo određuje gdje se redak SMIJE prelomiti:
 *
 * 1. crta s razmacima („riječ – riječ”): nerazdvojivi razmak s obje strane,
 *    pa crta nikad ne započinje ni ne završava redak
 * 2. crtica u složenicama i crta u rasponima bez razmaka (Wi-Fi, 30-ak, U-oblik, 6–12):
 *    iza crtice se umeće WORD JOINER (U+2060, nevidljiv) – nema prijeloma na crtici
 * 3. brojevi: telefonske skupine, datumi („20. 9. 2026.”) i broj + jedinica („28 €”, „11 h”)
 * 4. kratke riječi (hr: i, u, na, s, o, od, do, za, uz, je …; en: a, an, the …)
 *    vežu se uz sljedeću riječ da ne ostanu same na kraju retka
 *
 * Obrađuju se samo obični tekstovi (bez HTML-a); putanje, URL-ovi, e-mail adrese,
 * oznake i SEO polja preskaču se (vidi SKIP_KEYS).
 */
const NBSP = String.fromCharCode(0x00a0); // nerazdvojivi razmak
const WJ = String.fromCharCode(0x2060); // WORD JOINER (nevidljiv)
const DASH_SPACED = new RegExp(`[ ${NBSP}]+([–—])[ ${NBSP}]+`, 'g');

const SHORT_WORDS: Record<string, string[]> = {
  hr: ['i', 'u', 'na', 's', 'sa', 'o', 'od', 'do', 'za', 'uz', 'je', 'a', 'k', 'iz', 'po', 'te', 'ili', 'ni', 'bez'],
  en: ['a', 'an', 'the', 'i', 'of', 'to', 'in', 'on', 'at', 'by'],
};
const UNITS = ['h', '€', 'EUR', 'km', 'min', 'cm', 'm', 'm²', '%', 'kn', 'osoba', 'osobe', 'people', 'kreveta', 'beds'];

/** Ključevi čije se vrijednosti nikad ne obrađuju */
const SKIP_KEYS = new Set([
  'seo', 'alt', 'src', 'href', 'file', 'id', 'page', 'category', 'icon', 'dayOfWeek', 'opens', 'closes',
  'validFrom', 'validTo', 'type', 'status', 'updated', 'url', 'mapUrl', 'bookingRoomId',
]);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function typo(text: string, locale = 'hr'): string {
  if (!text || /^(https?:|mailto:|tel:|\/)/.test(text) || /^\S+@\S+$/.test(text)) return text;
  let s = text;

  // 1. crta s razmacima → nerazdvojivi razmaci s obje strane
  //    (WJ iza crte je nužan: po Unicode pravilu LB12a preglednik smije prelomiti između crte i NBSP-a)
  s = s.replace(DASH_SPACED, `${NBSP}$1${WJ}${NBSP}`);
  // crta na početku teksta (npr. „– švedski stol”) veže se uz sljedeću riječ
  s = s.replace(/^([–—]) /, `$1${WJ}${NBSP}`);

  // 2. složenice i rasponi bez razmaka: zabrana prijeloma iza crtice
  s = s.replace(/([\p{L}\p{N}])([-–—])(?=[\p{L}\p{N}])/gu, `$1$2${WJ}`);

  // 3. brojevi
  s = s.replace(/(\d) (?=\d)/g, `$1${NBSP}`); // +385 49 284 666, 1 800
  s = s.replace(/(\d\.) (?=\d)/g, `$1${NBSP}`); // 20. 9. 2026.
  s = s.replace(new RegExp(`(\\d) (?=(${UNITS.map(escapeRe).join('|')})(?![\\p{L}]))`, 'gu'), `$1${NBSP}`);
  s = s.replace(/€ (?=\d)/g, `€${NBSP}`);

  // 4. kratke riječi uz sljedeću riječ
  const words = SHORT_WORDS[locale] ?? [];
  if (words.length) {
    const re = new RegExp(`(?<=^|[\\s\\u00A0(„“"'‘])(${words.map(escapeRe).join('|')}) (?=\\S)`, 'giu');
    s = s.replace(re, `$1${NBSP}`);
  }
  return s;
}

/** Rekurzivno obrađuje sve tekstove u objektu sadržaja (preskače SKIP_KEYS). */
export function typoDeep<T>(value: T, locale: string, key?: string): T {
  if (key && SKIP_KEYS.has(key)) return value;
  if (typeof value === 'string') return typo(value, locale) as T;
  if (Array.isArray(value)) return value.map((v) => typoDeep(v, locale)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typoDeep(v, locale, k)])) as T;
  }
  return value;
}

const NB_HYPHEN = String.fromCharCode(0x2011);
const INVISIBLE = new RegExp(`[${WJ}]`, 'g');
const NB_SPACE = new RegExp(`[${NBSP}]`, 'g');
const NB_DASH = new RegExp(`[${NB_HYPHEN}]`, 'g');

/**
 * Vraća običan tekst bez tipografskih kontrolnih znakova (NBSP → razmak, WJ uklonjen,
 * nerazdvojiva crtica → „-”). Koristi se za <title>, meta oznake, JSON-LD, alt i URL-ove,
 * gdje ti znakovi ne smiju završiti.
 */
export function plain(text: string): string {
  return text.replace(INVISIBLE, '').replace(NB_SPACE, ' ').replace(NB_DASH, '-');
}
