# SEO – Hotel Zagi

## Ključne riječi po stranici (jedna glavna tema po stranici)

| Stranica | HR glavna / sporedne | EN glavna / sporedne |
|---|---|---|
| Naslovnica `/hr/`, `/en/` | hotel Oroslavje · hotel blizu Zagreba, hotel uz A2, Hrvatsko zagorje | hotel Oroslavje · hotel near Zagreb, hotel on the A2, Croatian Zagorje |
| Smještaj `/hr/smjestaj/` | smještaj Oroslavje · sobe blizu Zagreba, obiteljska soba, besplatan parking | rooms in Oroslavje · accommodation near Zagreb, family room |
| Wellness `/hr/wellness/` | wellness Zagorje · wellness Oroslavje, finska sauna, infracrvena sauna, whirlpool | wellness in Zagorje · sauna near Zagreb, spa day |
| Restoran `/hr/restoran/` | restoran Oroslavje · zagorska kuhinja, nedjeljni švedski stol, catering Zagorje, vjenčanja | restaurant in Oroslavje · Zagorje cuisine, Sunday buffet, catering |
| Kongresna dvorana `/hr/kongresna-dvorana/` | kongresna dvorana blizu Zagreba · dvorana za seminare, poslovni sastanci Zagorje | conference hall near Zagreb · meeting room, seminar venue |
| O nama `/hr/o-nama/` | Hotel Zagi od 1986. · obiteljski hotel Zagorje | family-run hotel Zagorje since 1986 |
| Galerija, Kontakt | Hotel Zagi fotografije · Hotel Zagi kontakt, adresa Oroslavje | Hotel Zagi photos · contact, directions |

Ključne riječi su prirodno u `<title>`, H1, uvodu, alt tekstovima i nazivima datoteka slika – bez prenatrpavanja.

## Što je postavljeno

**Tehnički**
- Zaseban `<title>` (≤ 60 znakova) i meta opis (≤ 155–160) po stranici i jeziku, iz sadržajnih polja `seo` – shema ne dopušta preduge vrijednosti.
- `canonical` na svakoj stranici; neprevedene (rezervne) stranice imaju canonical na izvornik + `noindex`.
- `hreflang` hr, en i `x-default` (→ hr) u `<head>` i u sitemapu – generirano iz `src/i18n/config.ts`, prati samo uključene jezike.
- Open Graph i Twitter kartice s velikom slikom (WebP 1440 px) po stranici.
- `sitemap-index.xml` (+ `sitemap-0.xml`) s `xhtml:link` jezičnim alternativama; stranice rezervacije i 404 isključene.
- `robots.txt` s poveznicom na sitemap; uz `PUBLIC_NOINDEX=true` blokira sve (demo).
- Lokalizirani čitljivi URL-ovi (`/hr/kongresna-dvorana/`, `/en/conference-hall/`), dosljedna završna kosa crta.
- Ispravna `404.html` (statični hosting vraća status 404), na oba jezika, `noindex`.

**Struktura**
- Jedan H1 po stranici (na naslovnici skriven vizualno, jer slajdovi imaju vlastite H2 naslove; tekst H1 je stalan i sadrži „Hotel Zagi”, „Oroslavje”, „30 minuta od Zagreba”).
- Semantički HTML: `header`, `nav`, `main`, `section` s `aria-labelledby`, `footer`, `address`, `dl` za činjenice.
- Breadcrumbs na svim podstranicama (vizualno + JSON-LD).
- Interno povezivanje: kartice na naslovnici, footer, poveznice među wellnessom, restoranom i dvoranom.
- Opisni alt tekstovi na HR i EN za svaku fotografiju.

**Strukturirani podaci (JSON-LD, samo provjereni podaci)**
- `Hotel` (naslovnica): naziv, pravni naziv, adresa, telefon, e-mail, geo (OpenStreetMap: 45,99221 / 15,91798), slike, `starRating` 3, `numberOfRooms` 60, `foundingDate` 1986, sadržaji, profili na društvenim mrežama.
- `WebSite` (naslovnica).
- `Restaurant` (restoran) s `servesCuisine`, `acceptsReservations`, `containedInPlace` → Hotel.
- `DaySpa` (wellness) s `openingHoursSpecification` iz brošure.
- `EventVenue` (kongresna dvorana) s `maximumAttendeeCapacity` 60.
- `BreadcrumbList` na podstranicama.
- **Namjerno izostavljeno:** `priceRange` (nije potvrđen), `aggregateRating` (Google ne prikazuje vlastite ocjene LocalBusinessa kao rich result i ne smiju se preuzimati ocjene s Googlea), `FAQPage` (nema stvarnog FAQ-a).

**Performanse (Core Web Vitals)**
- AVIF + WebP sa `srcset`/`sizes`, stvarne dimenzije (`width`/`height`) i `aspect-ratio` → CLS ≈ 0.
- LCP slika u HTML-u s `fetchpriority="high"`, ostali slajdovi se učitavaju tek prije prikaza; ostale slike `loading="lazy"`.
- Samohostani fontovi (woff2) s `preload` i `font-display: swap`, prilagođeni rezervni fontovi.
- ~3 KB JS po stranici, bez blokirajućih skripti; CSS po stranici, mali inline.
- Lokalni Lighthouse: mobitel 98 / 100 / 100 / 100, računalo 100 / 100 / 100 / 100 (LCP 2,1 s mobitel, 0,6 s računalo).

## Što hotel treba napraviti izvan weba

1. **Google Business Profile** – preuzeti/potvrditi profil, kategorija „Hotel” (+ „Restoran”, „Spa” kao dodatne), točna adresa i pin, radno vrijeme restorana i wellnessa, poveznica na `/hr/`, poveznica za rezervaciju, fotografije (iste kao na webu), atributi (parking, EV punjač, ljubimci, Wi-Fi).
2. **Dosljedni podaci o tvrtki (NAP)** – isti naziv, adresa i telefon na Googleu, Bookingu, TripAdvisoru, TZ Oroslavje / Zagorje, Facebooku i Instagramu. Trenutačno postoje razlike (npr. broj soba 55/58/60, stari Facebook „Pansion ZAGI”).
3. **Recenzije** – odgovarati na sve recenzije (i pozitivne) u roku od nekoliko dana; nakon boravka slati e-mail s poveznicom na Google recenziju.
4. **Google Search Console** – dodati domenu, poslati `sitemap-index.xml`, pratiti indeksiranje obje jezične inačice.
5. **Preusmjerenja (301)** sa starih URL-ova (`/str/smjestaj/hr/` → `/hr/smjestaj/`, `/str/wellness-centar---novo/hr/` → `/hr/wellness/`, `?jez=en` → `/en/` …) – popis pripremiti pri prelasku domene.
6. **Lokalne poveznice** – TZ Oroslavje, TZ Krapinsko-zagorske županije, Visit Zagorje, partnerske toplice (Aqua Vivae, Jezerčica, Stubaki), Bike Zagorje.
7. **Svježi sadržaj** – sezonske ponude (švedski stol, wellness paketi, Advent, vjenčanja) kao zasebne stranice ili blog u sljedećoj fazi.
8. **Fotografije** – nove fotografije pročelja i okolice u visokoj rezoluciji (sada nema kvalitetne vanjske fotografije hotela).
