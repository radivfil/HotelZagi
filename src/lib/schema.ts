/**
 * Strukturirani podaci (JSON-LD). Koriste se SAMO provjereni podaci iz
 * settings/global.json i sadržajnih kolekcija – ništa se ne izmišlja.
 * priceRange i aggregateRating namjerno se ne navode (vidi docs/SEO.md).
 */
import { SITE } from '@/config/site';
import { pathFor, type PageKey } from '@/i18n/routes';
import { largestVariant } from '@/lib/images';
import type { getGlobal } from '@/lib/content';

type Global = Awaited<ReturnType<typeof getGlobal>>;
const abs = (path: string) => new URL(path, SITE.url + '/').href;
const telE164 = (p: string) => p.replace(/[^\d+]/g, '');
export const hotelId = () => `${SITE.url}/#hotel`;

function address(g: Global) {
  return {
    '@type': 'PostalAddress',
    streetAddress: g.address.street,
    postalCode: g.address.postalCode,
    addressLocality: g.address.city,
    addressRegion: g.address.region,
    addressCountry: g.address.countryCode,
  };
}

export function hotelSchema(g: Global, locale: string, opts: { description: string; images: string[]; amenities: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    '@id': hotelId(),
    name: g.hotelName,
    legalName: g.legalName,
    description: opts.description,
    url: abs(pathFor('home', locale)),
    logo: abs('/logo.svg'),
    image: opts.images.map((src) => abs(largestVariant(src, 1440))),
    telephone: telE164(g.phones.main),
    email: g.emails.info,
    address: address(g),
    geo: { '@type': 'GeoCoordinates', latitude: g.geo.lat, longitude: g.geo.lng },
    hasMap: g.mapUrl,
    starRating: { '@type': 'Rating', ratingValue: g.stars },
    numberOfRooms: g.facts.rooms,
    foundingDate: String(g.foundedYear),
    vatID: g.vatId,
    amenityFeature: opts.amenities.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    sameAs: [g.social.facebook, g.social.instagram].filter(Boolean),
  };
}

export function websiteSchema(locale: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name,
    url: abs(pathFor('home', locale)),
    inLanguage: locale,
    publisher: { '@id': hotelId() },
  };
}

export function restaurantSchema(g: Global, locale: string, opts: { name: string; description: string; image: string; cuisine: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: opts.name,
    description: opts.description,
    url: abs(pathFor('restaurant', locale)),
    image: abs(largestVariant(opts.image, 1440)),
    telephone: telE164(g.phones.main),
    address: address(g),
    geo: { '@type': 'GeoCoordinates', latitude: g.geo.lat, longitude: g.geo.lng },
    servesCuisine: opts.cuisine,
    acceptsReservations: true,
    containedInPlace: { '@id': hotelId() },
  };
}

export function spaSchema(
  g: Global,
  locale: string,
  opts: { name: string; description: string; image: string; hours: { dayOfWeek: string[]; opens: string; closes: string }[] },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DaySpa',
    name: opts.name,
    description: opts.description,
    url: abs(pathFor('wellness', locale)),
    image: abs(largestVariant(opts.image, 1440)),
    telephone: telE164(g.phones.main),
    email: g.emails.reception,
    address: address(g),
    openingHoursSpecification: opts.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    })),
    containedInPlace: { '@id': hotelId() },
  };
}

export function eventVenueSchema(g: Global, locale: string, opts: { name: string; description: string; image: string; capacity: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EventVenue',
    name: opts.name,
    description: opts.description,
    url: abs(pathFor('conference', locale)),
    image: abs(largestVariant(opts.image, 1440)),
    maximumAttendeeCapacity: opts.capacity,
    address: address(g),
    containedInPlace: { '@id': hotelId() },
  };
}

export function breadcrumbSchema(crumbs: { label: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: abs(c.href) })),
  };
}

export const pageUrl = (key: PageKey, locale: string) => abs(pathFor(key, locale));
