import type { CollectionEntry } from 'astro:content';

export type Offer = CollectionEntry<'restaurantOffers'>['data'];
export type OfferPhase = 'active' | 'soon' | 'hidden';

/** Današnji datum (GGGG-MM-DD) u vremenskoj zoni hotela. */
export function todayIso(timeZone = 'Europe/Zagreb'): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

/**
 * Faza ponude za zadani dan. ISTA pravila primjenjuje i klijentska skripta u
 * RestaurantOffers.astro (statičan web se tako ne mora graditi točno na dan promjene).
 */
export function offerPhase(o: Pick<Offer, 'status' | 'validFrom' | 'validTo'>, today: string): OfferPhase {
  if (o.status === 'arhivirano') return 'hidden';
  if (o.validTo && o.validTo < today) return 'hidden';
  if (o.status === 'uskoro') return 'soon';
  if (o.validFrom && o.validFrom > today) return 'soon';
  return 'active';
}

export function sortOffers(a: Offer, b: Offer): number {
  return Number(b.featured) - Number(a.featured) || a.order - b.order || a.title.localeCompare(b.title);
}

/** 2026-09-20 → „20. 9. 2026.” (hr) / „20 September 2026” (en) */
export function formatDate(iso: string, locale: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (locale === 'hr') return `${d}. ${m}. ${y}.`;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(y, m - 1, d));
}
