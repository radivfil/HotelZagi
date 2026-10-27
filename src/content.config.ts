/**
 * Content Collections – sav uređivi sadržaj weba.
 *
 * Struktura: src/content/<kolekcija>/<jezik>/<unos>.json
 * Novi jezik = novi poddirektorij (pl, cs, nl). Polja shema odgovaraju budućim
 * poljima u admin panelu (Keystatic) – opisi (.describe) postaju pomoćni tekst u panelu.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// ---------------------------------------------------------------- zajednička polja

/** Slika iz public/uploads/ s obveznim alt tekstom na jeziku unosa. */
const image = z.object({
  src: z.string().regex(/^\/uploads\//, 'Slika mora biti u /uploads/').describe('Putanja slike u public/uploads/'),
  alt: z.string().min(3).describe('Alternativni tekst – opis slike za čitače zaslona i Google'),
});

/** SEO polja po stranici i jeziku. */
const seo = z.object({
  title: z.string().max(65).describe('<title> – do ~60 znakova, glavna ključna riječ na početku'),
  description: z.string().min(70).max(160).describe('Meta opis – do ~155 znakova'),
  ogImage: z.string().regex(/^\/uploads\//).optional().describe('Slika za dijeljenje na društvenim mrežama (1200×630 preporučeno)'),
  noindex: z.boolean().default(false).describe('Sakrij stranicu od tražilica'),
});

const link = z.object({
  label: z.string().describe('Tekst gumba ili poveznice'),
  /** Interna stranica (ključ iz src/i18n/routes.ts), vanjski URL ili "booking" */
  href: z.string().describe('Ključ stranice (npr. "wellness"), "booking" ili puni URL'),
});

const textSection = z.object({
  id: z.string().optional().describe('Sidro u URL-u (#id)'),
  eyebrow: z.string().optional(),
  heading: z.string(),
  paragraphs: z.array(z.string()).default([]).describe('Odlomci teksta'),
  list: z.array(z.string()).optional().describe('Popis (natuknice)'),
  image: image.optional(),
});

const pageHero = z.object({
  eyebrow: z.string().optional().describe('Mali natpis iznad naslova'),
  title: z.string().describe('Naslov stranice (H1)'),
  lead: z.string().optional().describe('Uvodna rečenica ispod naslova'),
  image: image.optional().describe('Velika fotografija u zaglavlju stranice'),
});

// ---------------------------------------------------------------- kolekcije

/** Opće stranice: naslovnica, smještaj (uvod), o nama, galerija, kontakt, pravne stranice, 404. */
const pages = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/pages' }),
  schema: z.object({
    seo,
    hero: pageHero,
    /** Samo naslovnica: slajdovi hero slidera (redoslijed = redoslijed u popisu) */
    heroSlides: z
      .array(
        z.object({
          image,
          eyebrow: z.string().optional().describe('Mali natpis iznad naslova slajda'),
          title: z.string().describe('Naslov slajda'),
          subtitle: z.string().describe('Podnaslov slajda'),
          cta: link.describe('Gumb na slajdu'),
          hideOnSmallScreens: z.boolean().default(false).describe('Ne prikazuj na mobitelima (performanse)'),
        }),
      )
      .optional(),
    /** Samo naslovnica: naslov iznad kartica */
    featureCardsIntro: z.object({ eyebrow: z.string().optional(), heading: z.string(), lead: z.string().optional() }).optional(),
    /** Samo naslovnica: četiri velike kartice glavnih cjelina */
    featureCards: z
      .array(z.object({ page: z.string().describe('Ključ stranice'), title: z.string(), text: z.string(), image }))
      .optional(),
    intro: textSection.optional().describe('Uvodni blok (npr. kratki "O nama" na naslovnici)'),
    sections: z.array(textSection).default([]),
    cta: z
      .object({ heading: z.string(), text: z.string(), primary: link, secondary: link.optional() })
      .optional()
      .describe('Poziv na rezervaciju ili kontakt na dnu stranice'),
    updated: z.string().optional().describe('Datum zadnje izmjene (pravne stranice)'),
  }),
});

/** Tipovi soba – jedan JSON po sobi i jeziku. */
const rooms = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/rooms' }),
  schema: z.object({
    order: z.number().int().describe('Redoslijed prikaza'),
    name: z.string().describe('Naziv tipa sobe'),
    summary: z.string().describe('Kratki opis (1 rečenica)'),
    description: z.array(z.string()).describe('Odlomci opisa'),
    beds: z.string().describe('Kreveti, npr. "bračni krevet + 1 ležaj 90 cm"'),
    maxGuests: z.number().int().min(1),
    features: z.array(z.string()).describe('Sadržaji u sobi'),
    includes: z.array(z.string()).optional().describe('Što ponuda uključuje (paketi)'),
    priceFrom: z.number().positive().optional().describe('Cijena od (EUR po noćenju) – samo potvrđene cijene'),
    image,
    gallery: z.array(image).default([]),
    /** ID tipa sobe u WebBookingPro (za izravnu poveznicu kad integracija bude aktivna) */
    bookingRoomId: z.string().optional(),
  }),
});

/** Wellness centar – jedan unos po jeziku (index.json). */
const wellness = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/wellness' }),
  schema: z.object({
    seo,
    hero: pageHero,
    quote: z.string().describe('Citat iz brošure'),
    intro: z.object({ heading: z.string(), paragraphs: z.array(z.string()) }),
    saunasIntro: z.object({ heading: z.string(), lead: z.string().optional() }).describe('Naslov bloka sa saunama'),
    relaxIntro: z.object({ heading: z.string(), lead: z.string().optional() }).describe('Naslov bloka s ostalim sadržajima'),
    facilities: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        tagline: z.string().optional().describe('Kratki slogan iz brošure'),
        paragraphs: z.array(z.string()).default([]),
        image: image.optional(),
      }),
    ),
    hours: z.array(z.object({ days: z.string(), time: z.string(), dayOfWeek: z.array(z.string()), opens: z.string(), closes: z.string() })),
    packages: z.object({ heading: z.string(), text: z.string(), items: z.array(z.string()) }),
    thermalPackages: z.object({ heading: z.string(), text: z.string(), partners: z.array(z.string()) }).optional(),
    booking: z.object({ heading: z.string(), text: z.string() }),
    brochure: z.object({ file: z.string(), title: z.string(), description: z.string() }),
  }),
});

/** Restoran – jedan unos po jeziku. */
const restaurant = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/restaurant' }),
  schema: z.object({
    seo,
    hero: pageHero,
    story: textSection,
    facts: z.array(z.object({ value: z.string(), label: z.string() })),
    dishes: z.object({ heading: z.string(), lead: z.string(), items: z.array(z.object({ name: z.string(), text: z.string(), image: image.optional() })) }),
    specialities: z.array(z.string()).describe('Popis domaćih specijaliteta'),
    offers: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().describe('Naslov bloka aktualne ponude'),
        lead: z.string().optional(),
        soonHeading: z.string().describe('Naslov bloka „Uskoro”'),
        emptyText: z.string().describe('Poruka kad nema nijedne aktivne ponude'),
      })
      .describe('Naslovi bloka ponuda – same ponude su u kolekciji restaurantOffers'),
    catering: textSection,
    wine: textSection,
    haccp: textSection,
    brochure: z.object({ file: z.string(), title: z.string(), description: z.string() }).optional(),
  }),
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum u obliku GGGG-MM-DD');

/**
 * Ponude restorana (švedski stol, riblji, sezonski, blagdanski …) – jedan JSON po ponudi i jeziku.
 * Prikaz ovisi o statusu i razdoblju valjanosti (filtrira se pri izradi weba i u pregledniku).
 */
const restaurantOffers = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/restaurant-offers' }),
  schema: z.object({
    id: z.string().describe('Jedinstvena oznaka ponude (ista na svim jezicima)'),
    type: z.enum(['svedski-stol', 'riblji', 'sezonski', 'blagdanski', 'ostalo']).describe('Vrsta ponude'),
    title: z.string().describe('Naslov ponude'),
    summary: z.string().describe('Kratki opis (1–2 rečenice)'),
    details: z.array(z.string()).default([]).describe('Detaljni opis ili popis jela – samo potvrđeni podaci'),
    image: image.optional(),
    prices: z
      .array(
        z.object({
          label: z.string().describe('npr. „Odrasli”'),
          price: z.string().describe('Prikaz cijene, npr. „28 €” ili „besplatno”'),
          amount: z.number().nonnegative().optional().describe('Iznos u EUR za strukturirane podatke (opcionalno)'),
        }),
      )
      .default([])
      .describe('Cijene – samo ako su poznate'),
    schedule: z
      .object({ days: z.string().optional().describe('npr. „nedjeljom”'), time: z.string().optional().describe('npr. „12:00 – 16:00”') })
      .optional()
      .describe('Dani i vrijeme posluživanja – samo ako su poznati'),
    validFrom: isoDate.optional().describe('Vrijedi od (GGGG-MM-DD)'),
    validTo: isoDate.optional().describe('Vrijedi do (GGGG-MM-DD)'),
    status: z.enum(['aktivno', 'uskoro', 'arhivirano']).describe('Arhivirane ponude se ne prikazuju'),
    featured: z.boolean().default(false).describe('Istaknuto – prikazuje se velikim blokom'),
    order: z.number().int().default(0).describe('Redoslijed (manji broj = prije)'),
    example: z.boolean().default(false).describe('PROBNI sadržaj – zamijeniti stvarnom ponudom'),
  }),
});

/** Kongresna dvorana – jedan unos po jeziku. */
const conference = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/conference' }),
  schema: z.object({
    seo,
    hero: pageHero,
    intro: textSection,
    capacity: z.array(z.object({ value: z.string(), label: z.string() })),
    equipment: z.array(z.string()),
    layouts: z.array(z.object({ name: z.string(), text: z.string(), image: image.optional() })),
    purposes: z.array(z.object({ title: z.string(), text: z.string() })),
    sections: z.array(textSection).default([]),
  }),
});

/** Galerija – kategorije i fotografije po jeziku (alt tekstovi su lokalizirani). */
const gallery = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/gallery' }),
  schema: z.object({
    categories: z.array(z.object({ id: z.string(), label: z.string() })),
    items: z.array(image.extend({ category: z.string(), caption: z.string().optional(), wide: z.boolean().default(false) })),
  }),
});

/** Lokalizirane globalne postavke (tekstovi footera, praktične informacije, brošure). */
const settings = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/settings' }),
  schema: z.object({
    tagline: z.string(),
    footerAbout: z.string(),
    practicalInfo: z.array(z.object({ icon: z.enum(['parking', 'ev', 'breakfast', 'car', 'pet', 'bike', 'wifi']), title: z.string(), text: z.string() })),
    brochures: z.array(z.object({ file: z.string(), title: z.string(), description: z.string() })),
    phoneLabels: z.object({ main: z.string(), mobile: z.string(), reception: z.string() }),
    receptionNote: z.string().optional(),
    directions: z.array(z.string()).describe('Upute za dolazak'),
  }),
});

/** Globalne, jezično neovisne postavke (kontakt, koordinate, ocjena, slider). */
const global = defineCollection({
  loader: glob({ pattern: 'global.json', base: './src/content/settings' }),
  schema: z.object({
    hotelName: z.string(),
    legalName: z.string(),
    stars: z.number().int().min(1).max(5),
    foundedYear: z.number().int(),
    address: z.object({ street: z.string(), postalCode: z.string(), city: z.string(), region: z.string(), country: z.string(), countryCode: z.string() }),
    geo: z.object({ lat: z.number(), lng: z.number() }),
    phones: z.object({ main: z.string(), mobile: z.string(), reception: z.string() }),
    emails: z.object({ info: z.email(), reception: z.email() }),
    vatId: z.string().optional(),
    mapUrl: z.url(),
    reviews: z.object({ rating: z.number(), count: z.number().int(), url: z.url(), source: z.string() }),
    social: z.object({ facebook: z.url().optional(), instagram: z.url().optional() }),
    facts: z.object({ rooms: z.number().int(), beds: z.number().int(), restaurantSeats: z.number().int(), conferenceCapacity: z.number().int(), smallHallCapacity: z.number().int(), distanceZagrebKm: z.number(), distanceZagrebMin: z.number() }),
    slider: z.object({ intervalMs: z.number().int().min(3000).max(15000).describe('Trajanje slajda u milisekundama'), maxSlidesOnSmallScreens: z.number().int().min(1).max(10) }),
  }),
});

export const collections = { pages, rooms, wellness, restaurant, restaurantOffers, conference, gallery, settings, global };
