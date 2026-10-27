/**
 * PRIPREMA za admin panel (Keystatic) – nije aktivno u demu.
 *
 * Uključivanje (vidi docs/CMS-PLAN.md):
 *   1. npm i @keystatic/core @keystatic/astro @astrojs/react react react-dom
 *   2. premjestite ovu datoteku u korijen projekta (keystatic.config.ts)
 *   3. PUBLIC_CMS_ENABLED=true u .env → admin na /keystatic (i /admin preusmjerenje)
 *
 * Polja zrcale Zod sheme iz src/content.config.ts. Za svaki UKLJUČENI jezik iz
 * src/i18n/config.ts automatski nastaju zasebni unosi, pa novi jezik ne traži izmjene.
 */
import { config, fields, singleton, collection } from '@keystatic/core';
import { enabledLocales } from '../src/i18n/config';

const img = (dir: string, label = 'Fotografija') =>
  fields.object(
    {
      src: fields.image({ label, directory: `public/uploads/${dir}`, publicPath: `/uploads/${dir}/`, validation: { isRequired: true } }),
      alt: fields.text({ label: 'Alternativni tekst', description: 'Opis slike za slabovidne i Google (obavezno)', validation: { length: { min: 3 } } }),
    },
    { label },
  );

const seo = fields.object(
  {
    title: fields.text({ label: 'SEO naslov', description: 'Do ~60 znakova, glavna ključna riječ na početku', validation: { length: { max: 65 } } }),
    description: fields.text({ label: 'Meta opis', multiline: true, description: 'Do ~155 znakova', validation: { length: { min: 70, max: 160 } } }),
    ogImage: fields.text({ label: 'OG slika (putanja)', description: 'npr. /uploads/wellness/....jpg' }),
    noindex: fields.checkbox({ label: 'Sakrij od tražilica', defaultValue: false }),
  },
  { label: 'SEO' },
);

const link = (label: string) =>
  fields.object(
    {
      label: fields.text({ label: 'Tekst gumba' }),
      href: fields.text({ label: 'Poveznica', description: 'Ključ stranice (rooms, wellness, restaurant, conference, about, gallery, contact), "booking" ili URL' }),
    },
    { label },
  );

const paragraphs = (label = 'Odlomci') => fields.array(fields.text({ label: 'Odlomak', multiline: true }), { label, itemLabel: (p) => p.value.slice(0, 60) });

const hero = fields.object(
  {
    eyebrow: fields.text({ label: 'Natpis iznad naslova' }),
    title: fields.text({ label: 'Naslov stranice (H1)' }),
    lead: fields.text({ label: 'Uvodna rečenica', multiline: true }),
  },
  { label: 'Zaglavlje stranice' },
);

const perLocale = <T,>(make: (code: string, name: string) => [string, T]) =>
  Object.fromEntries(enabledLocales.map((l) => make(l.code, l.name)));

export default config({
  storage: { kind: 'local' }, // produkcija: { kind: 'github', repo: 'organizacija/hotel-zagi-web' }
  ui: {
    brand: { name: 'Hotel Zagi' },
    navigation: {
      Naslovnica: enabledLocales.map((l) => `home_${l.code}`),
      Sobe: enabledLocales.map((l) => `rooms_${l.code}`),
      'Ponude restorana': enabledLocales.map((l) => `offers_${l.code}`),
      Postavke: ['global', ...enabledLocales.map((l) => `settings_${l.code}`)],
    },
  },
  singletons: {
    global: singleton({
      label: 'Kontakt, ocjena i slider (svi jezici)',
      path: 'src/content/settings/global',
      format: { data: 'json' },
      schema: {
        hotelName: fields.text({ label: 'Naziv hotela' }),
        legalName: fields.text({ label: 'Pravni naziv' }),
        phones: fields.object({ main: fields.text({ label: 'Telefon' }), mobile: fields.text({ label: 'Mobitel' }), reception: fields.text({ label: 'Mobitel recepcije' }) }, { label: 'Telefoni' }),
        emails: fields.object({ info: fields.text({ label: 'Info e-mail' }), reception: fields.text({ label: 'E-mail recepcije' }) }, { label: 'E-mail' }),
        reviews: fields.object(
          { rating: fields.number({ label: 'Ocjena', step: 0.1 }), count: fields.integer({ label: 'Broj recenzija' }), url: fields.url({ label: 'Poveznica na recenzije' }), source: fields.text({ label: 'Izvor', defaultValue: 'Google' }) },
          { label: 'Ocjena gostiju' },
        ),
        slider: fields.object(
          { intervalMs: fields.integer({ label: 'Trajanje slajda (ms)', defaultValue: 5000 }), maxSlidesOnSmallScreens: fields.integer({ label: 'Najviše slajdova na mobitelu', defaultValue: 3 }) },
          { label: 'Hero slider' },
        ),
        // Ostala polja (adresa, koordinate, činjenice) uređuju se rjeđe – dodati po potrebi
      },
    }),
    ...perLocale((code, name) => [
      `home_${code}`,
      singleton({
        label: `Naslovnica (${name})`,
        path: `src/content/pages/${code}/home`,
        format: { data: 'json' },
        schema: {
          seo,
          hero: fields.object({ title: fields.text({ label: 'Naslov stranice (H1, skriven u slideru)' }) }, { label: 'H1' }),
          heroSlides: fields.array(
            fields.object({
              image: img('wellness', 'Slika slajda'),
              eyebrow: fields.text({ label: 'Natpis iznad naslova' }),
              title: fields.text({ label: 'Naslov slajda' }),
              subtitle: fields.text({ label: 'Podnaslov', multiline: true }),
              cta: link('Gumb'),
              hideOnSmallScreens: fields.checkbox({ label: 'Ne prikazuj na mobitelu', defaultValue: false }),
            }),
            { label: 'Hero slajdovi', itemLabel: (s) => s.fields.title.value },
          ),
          featureCards: fields.array(
            fields.object({ page: fields.text({ label: 'Ključ stranice' }), title: fields.text({ label: 'Naslov' }), text: fields.text({ label: 'Tekst', multiline: true }), image: img('rooms') }),
            { label: 'Kartice', itemLabel: (c) => c.fields.title.value },
          ),
          intro: fields.object({ eyebrow: fields.text({ label: 'Natpis' }), heading: fields.text({ label: 'Naslov' }), paragraphs: paragraphs(), image: img('hotel') }, { label: 'Kratko o nama' }),
          cta: fields.object({ heading: fields.text({ label: 'Naslov' }), text: fields.text({ label: 'Tekst', multiline: true }), primary: link('Glavni gumb'), secondary: link('Drugi gumb') }, { label: 'Poziv na rezervaciju' }),
        },
      }),
    ]),
    ...perLocale((code, name) => [
      `settings_${code}`,
      singleton({
        label: `Tekstovi weba (${name})`,
        path: `src/content/settings/${code}/site`,
        format: { data: 'json' },
        schema: {
          tagline: fields.text({ label: 'Slogan' }),
          footerAbout: fields.text({ label: 'Tekst u footeru', multiline: true }),
          practicalInfo: fields.array(
            fields.object({
              icon: fields.select({
                label: 'Ikona',
                options: ['parking', 'ev', 'breakfast', 'car', 'pet', 'bike', 'wifi'].map((v) => ({ label: v, value: v })),
                defaultValue: 'parking',
              }),
              title: fields.text({ label: 'Naslov' }),
              text: fields.text({ label: 'Tekst' }),
            }),
            { label: 'Praktične informacije', itemLabel: (i) => i.fields.title.value },
          ),
          brochures: fields.array(
            fields.object({
              file: fields.file({ label: 'PDF', directory: 'public/uploads/brochures', publicPath: '/uploads/brochures/' }),
              title: fields.text({ label: 'Naslov' }),
              description: fields.text({ label: 'Opis' }),
            }),
            { label: 'Brošure', itemLabel: (b) => b.fields.title.value },
          ),
        },
      }),
    ]),
    // TODO (faza CMS-a): singletoni za wellness, restoran, kongresnu dvoranu, o nama, kontakt i pravne stranice
    // – ista načela; polja preslikati iz src/content.config.ts.
  },
  collections: {
    ...perLocale((code, name) => [
      `offers_${code}`,
      collection({
        label: `Ponude restorana (${name})`,
        path: `src/content/restaurant-offers/${code}/*`,
        slugField: 'title',
        format: { data: 'json' },
        columns: ['title', 'status', 'validFrom', 'validTo'],
        schema: {
          id: fields.text({ label: 'Oznaka', description: 'Ista na svim jezicima, npr. riblji-svedski-stol' }),
          type: fields.select({
            label: 'Vrsta',
            options: [
              { label: 'Švedski stol', value: 'svedski-stol' },
              { label: 'Riblji švedski stol', value: 'riblji' },
              { label: 'Sezonska', value: 'sezonski' },
              { label: 'Blagdanska', value: 'blagdanski' },
              { label: 'Ostalo', value: 'ostalo' },
            ],
            defaultValue: 'svedski-stol',
          }),
          title: fields.slug({ name: { label: 'Naslov' } }),
          summary: fields.text({ label: 'Kratki opis', multiline: true }),
          details: fields.array(fields.text({ label: 'Stavka' }), { label: 'Opis ili popis jela', itemLabel: (d) => d.value }),
          image: img('restaurant'),
          prices: fields.array(
            fields.object({
              label: fields.text({ label: 'Za koga (npr. Odrasli)' }),
              price: fields.text({ label: 'Cijena za prikaz (npr. 28 €)' }),
              amount: fields.number({ label: 'Iznos u EUR (za Google)' }),
            }),
            { label: 'Cijene (samo potvrđene)', itemLabel: (p) => `${p.fields.label.value}: ${p.fields.price.value}` },
          ),
          schedule: fields.object({ days: fields.text({ label: 'Dani (npr. nedjeljom)' }), time: fields.text({ label: 'Vrijeme (npr. 12:00 – 16:00)' }) }, { label: 'Posluživanje' }),
          validFrom: fields.date({ label: 'Vrijedi od' }),
          validTo: fields.date({ label: 'Vrijedi do' }),
          status: fields.select({
            label: 'Status',
            options: [
              { label: 'Aktivno', value: 'aktivno' },
              { label: 'Uskoro', value: 'uskoro' },
              { label: 'Arhivirano (ne prikazuje se)', value: 'arhivirano' },
            ],
            defaultValue: 'aktivno',
          }),
          featured: fields.checkbox({ label: 'Istaknuto (veliki blok)', defaultValue: false }),
          order: fields.integer({ label: 'Redoslijed', defaultValue: 0 }),
          example: fields.checkbox({ label: 'Probni sadržaj', defaultValue: false }),
        },
      }),
    ]),
    ...perLocale((code, name) => [
      `rooms_${code}`,
      collection({
        label: `Tipovi soba (${name})`,
        path: `src/content/rooms/${code}/*`,
        slugField: 'name',
        format: { data: 'json' },
        schema: {
          order: fields.integer({ label: 'Redoslijed' }),
          name: fields.slug({ name: { label: 'Naziv sobe' } }),
          summary: fields.text({ label: 'Kratki opis' }),
          description: paragraphs('Opis'),
          beds: fields.text({ label: 'Kreveti' }),
          maxGuests: fields.integer({ label: 'Najviše gostiju' }),
          features: fields.array(fields.text({ label: 'Sadržaj' }), { label: 'Sadržaji u sobi', itemLabel: (f) => f.value }),
          priceFrom: fields.number({ label: 'Cijena od (EUR)', description: 'Samo potvrđene cijene' }),
          image: img('rooms', 'Glavna fotografija'),
          gallery: fields.array(img('rooms'), { label: 'Dodatne fotografije', itemLabel: (i) => i.fields.alt.value }),
        },
      }),
    ]),
  },
});
