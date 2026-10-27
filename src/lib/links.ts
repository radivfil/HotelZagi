import { BOOKING } from '@/config/site';
import { pageKeys, pathFor, type PageKey } from '@/i18n/routes';

/** Jezici koje postojeća booknow.php / WebBookingPro sigurno podržavaju (TODO: potvrditi sa Sigmom). */
const BOOKING_LANGUAGES = ['hr', 'en'];
export const bookingLanguage = (locale: string) => (BOOKING_LANGUAGES.includes(locale) ? locale : 'en');

export interface BookingParams {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

/**
 * URL rezervacije. Uz WBP_EMBED_ENABLED=false vodi na postojeću stranicu hotela
 * (booknow.php?jez=hr), inače na ugrađenu stranicu /hr/rezervacija/.
 */
export function bookingHref(locale: string, params: BookingParams = {}): string {
  const p = BOOKING.params;
  const search = new URLSearchParams();
  const base = BOOKING.embedEnabled ? pathFor('booking', locale) : BOOKING.url;
  if (!BOOKING.embedEnabled) search.set(BOOKING.langParam, bookingLanguage(locale));
  if (params.checkIn) search.set(p.checkIn, params.checkIn);
  if (params.checkOut) search.set(p.checkOut, params.checkOut);
  if (params.guests) search.set(p.guests, String(params.guests));
  search.set(p.source, BOOKING.source);
  return `${base}?${search.toString()}`;
}

/** Je li poveznica vanjska (otvara drugu domenu)? */
export const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * Pretvara `href` iz sadržaja u stvarnu poveznicu:
 * "booking" → rezervacija, ključ stranice ("wellness") → lokalizirani URL, ostalo ostaje.
 */
export function resolveHref(href: string, locale: string): string {
  if (href === 'booking') return bookingHref(locale);
  const [key, hash] = href.split('#');
  if ((pageKeys as string[]).includes(key)) return pathFor(key as PageKey, locale, hash ? `#${hash}` : '');
  return href;
}
