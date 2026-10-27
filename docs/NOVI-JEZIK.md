# Dodavanje novog jezika (pl, cs, nl …)

Arhitektura je napravljena tako da novi jezik **ne traži promjene u komponentama ni predlošcima**.
Rutiranje, prekidač jezika, hreflang, sitemap i canonical generiraju se iz konfiguracije.

## Koraci (primjer: poljski)

### 1. Uključite jezik — `src/i18n/config.ts`

```ts
{ code: 'pl', label: 'PL', name: 'Polski', hreflang: 'pl', ogLocale: 'pl_PL', enabled: true, fallback: 'en' },
```

`fallback` određuje iz kojeg se jezika uzima sadržaj dok prijevod ne postoji (za strane goste preporučeno `en`).

### 2. Provjerite lokalizirane URL-ove — `src/i18n/routes.ts`

Slugovi za pl, cs i nl već su upisani (npr. `/pl/zakwaterowanie/`, `/cs/konferencni-sal/`, `/nl/congreszaal/`).
Ako sluga za jezik nema, koristi se engleski.

### 3. Dodajte rječnik sučelja — `src/i18n/ui/pl.ts`

```ts
import type { UiDict } from './hr';
const pl: UiDict = {
  'nav.rooms': 'Zakwaterowanie',
  // … svi ključevi iz hr.ts
};
export default pl;
```

Rječnik se učitava automatski (`import.meta.glob`). Tip `UiDict` javlja ako ključ nedostaje;
za postupno prevođenje možete koristiti `Partial<UiDict>` – nedostajući ključevi uzimaju se iz `fallback` jezika.

### 4. Dodajte sadržaj — `src/content/<kolekcija>/pl/`

Kopirajte `en` poddirektorije i prevedite:

```
src/content/pages/pl/*.json
src/content/rooms/pl/*.json
src/content/wellness/pl/page.json
src/content/restaurant/pl/page.json
src/content/conference/pl/page.json
src/content/gallery/pl/page.json
src/content/settings/pl/site.json
```

Svaku datoteku možete dodavati zasebno. **Dok neka stranica nije prevedena**, prikazuje se sadržaj iz `fallback` jezika uz:
- kratku obavijest na vrhu stranice,
- `lang` atribut stvarnog jezika sadržaja na `<main>`,
- `canonical` na izvornu stranicu i `noindex` (nema duplog sadržaja u Googleu).

### 5. Build i provjera

```bash
npm run build
npm run preview
PAGES=/pl/,/pl/zakwaterowanie/ npm run screens
```

### 6. Ostalo

- **WebBookingPro:** u `src/lib/links.ts` (`BOOKING_LANGUAGES`) dodajte kod jezika ako ga Sigma podržava; inače rezervacija ide na engleski.
- **Keystatic:** `cms/keystatic.config.ts` automatski stvara unose za sve uključene jezike.
- **Fontovi:** Figtree i Cormorant Garamond pokrivaju latin-ext (pl, cs, nl, hr). Za jezik s drugim pismom dodajte odgovarajući subset u `BaseLayout.astro`.

## Duže riječi

Izgled je testiran privremenim uključivanjem poljskog s dugim natpisima (npr. „Zakwaterowanie hotelowe”, „Zarezerwuj teraz pobyt”):
gumbi i izbornici nemaju fiksnu širinu, a ako se glavni izbornik ne stane u jedan red, header na računalu automatski prelazi u hamburger (`.is-compact`).
Na 375 / 768 / 1024 / 1440 px nije bilo horizontalnog scrolla.
