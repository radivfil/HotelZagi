# Hotel Zagi – novi web (demo, 1. korak)

Brz, responzivan i SEO-optimiziran web obiteljskog Hotela Zagi*** u Oroslavju.
Astro (statični izlaz) + TypeScript + čisti CSS s custom properties. Bez teških biblioteka (bez Swipera, Slicka, jQueryja); ukupno ~3 KB JavaScripta po stranici.

| | |
|---|---|
| Jezici | hrvatski (zadani, `/hr/`) i engleski (`/en/`); pl, cs, nl pripremljeni, isključeni |
| Rezervacije | postojeći WebBookingPro (`booknow.php`), ugrađivanje pripremljeno iza jedne zastavice |
| Sadržaj | Astro Content Collections (JSON + Zod sheme) – spremno za Keystatic |
| Lighthouse (lokalno) | mobitel 98–99 / 100 / 100 / 100 · računalo 100 / 100 / 100 / 100 |

## Pokretanje

```bash
npm install
npm run dev       # http://localhost:4321  (prije pokretanja generira varijante slika)
npm run build     # statični web u dist/
npm run preview   # pregled builda
npm run check     # provjera tipova i shema sadržaja
npm run screens   # Playwright screenshotovi + provjere (potreban `npm run preview`)
npm run test:hero      # slider: preklapanje kontrola i booking trake (10 veličina) + autoplay
npm run test:dashes    # nijedna crtica na početku/kraju retka (375/768/1024/1440)
npm run test:paths     # obilazak svih stranica: nijedan 404, svi interni URL-ovi s base-om
npm run test:invisible # nema NBSP/WJ u title, meta, JSON-LD, alt i URL-ovima (čita dist/)
npm test               # sve četiri provjere (potreban build + preview)
```

Node 24 (Astro 7 traži najmanje 22.23.4; testirano na Node 24). Konfiguracija ide kroz `.env` (predložak: `.env.example`).

## Struktura

```
assets/                 izvorni materijali klijenta (logo, brošure, originalne fotografije)
public/uploads/         slike po kategorijama + brošure (PDF); _gen/ = generirani AVIF/WebP
scripts/                optimize-images.mjs (AVIF/WebP + manifest), screens.mjs (QA)
src/config/site.ts      prekidači: WebBooking, obrasci, CMS, chatbot, noindex
src/i18n/               config.ts (jezici), routes.ts (lokalizirani URL-ovi), ui/{hr,en}.ts (tekstovi sučelja)
src/content/            {pages,rooms,restaurant,wellness,conference,gallery,settings}/{hr,en}/*.json
src/content.config.ts   Zod sheme (= buduća polja u admin panelu)
src/components/         Header, HeroSlider, BookingBar, Lightbox, InquiryForm, ChatWidget …
src/templates/          predlošci stranica
src/pages/[lang]/[...slug].astro   jedna ruta za sve stranice svih jezika
cms/keystatic.config.ts pripremljena konfiguracija admin panela (neaktivna)
docs/                   CMS-PLAN, NOVI-JEZIK, CHATBOT-PLAN, SEO, screens/
```

## Uređivanje sadržaja (dok nema admin panela)

Sav tekst je u `src/content/**` – u komponentama nema sadržaja.

- **Hero slajdovi:** `src/content/pages/<jezik>/home.json` → `heroSlides` (slika, naslov, podnaslov, gumb). Redoslijed u popisu = redoslijed slajdova. Trajanje slajda: `src/content/settings/global.json` → `slider.intervalMs`. Uz uključeno „smanjeno kretanje” u sustavu slider se namjerno ne mijenja sam; za testiranje u `npm run dev` otvorite `/hr/?autoplay=1`.
- **Sobe:** jedan JSON po tipu sobe u `src/content/rooms/<jezik>/`.
- **Ponude restorana** (švedski stol, riblji, sezonski, blagdanski): jedan JSON po ponudi u `src/content/restaurant-offers/<jezik>/` – vidi niže.
- **Kontakt, ocjena, koordinate:** `src/content/settings/global.json`.
- **Nova fotografija:** spremite JPG u `public/uploads/<kategorija>/` i upišite putanju + alt tekst u sadržaj. `npm run dev`/`build` sami generiraju AVIF/WebP (postojeće varijante se preskaču; `npm run images -- --force` za ponovno generiranje).

Pogrešan unos (npr. predug SEO naslov, slika bez alt teksta) zaustavlja build s jasnom porukom.

## Ponude restorana

Svaka ponuda je zasebna datoteka (`src/content/restaurant-offers/hr/<oznaka>.json` i ista oznaka u `en/`) s poljima:
vrsta, naslov, kratki opis, opis ili popis jela, slika + alt, cijene (opcionalno), dani i vrijeme posluživanja (opcionalno),
`validFrom` / `validTo` (GGGG-MM-DD, opcionalno), `status` (`aktivno` / `uskoro` / `arhivirano`), `featured`, `order`.

- **Aktualna ponuda** = status `aktivno` i današnji datum unutar razdoblja valjanosti. Istaknute (`featured`) dobivaju veliki blok.
- **Uskoro** = status `uskoro` ili `aktivno` s datumom početka u budućnosti.
- **Arhivirano** ili isteklo (`validTo` u prošlosti) – ne prikazuje se.
- Nema li nijedne aktivne ponude, prikazuje se poruka s pozivom na kontakt.

Datumi se provjeravaju **pri izradi weba** i **u pregledniku posjetitelja** (mala skripta, bez treperenja), pa istekla ponuda nestane točno na vrijeme.
Ipak, **nakon svake izmjene ponude stranica se mora ponovno objaviti** (git push / spremanje u CMS-u pokreće build).
Na GitHub Pages web se gradi i objavljuje **svaki dan** (`schedule` u `.github/workflows/deploy.yml`).
Na Cloudflare Pages / Netlify isto se postiže deploy hookom (vidi [docs/OBJAVA.md](docs/OBJAVA.md)).

Probne ponude imaju `"example": true` i oznaku „Primjer” – zamijeniti stvarnima (vidi `TODO.md`).

## Objava

Detaljno: **[docs/OBJAVA.md](docs/OBJAVA.md)**. Ukratko, objava se podešava s tri varijable okoline:

- `SITE_URL` – izvor weba (npr. `https://radivfil.github.io`; zadano `https://www.zagi.hr`)
- `BASE_PATH` – podmapa (npr. `/HotelZagi` za GitHub Pages project site; zadano `/`)
- `DEMO_MODE` – `true`: noindex na svim stranicama, bez sitemapa, robots `Disallow: /`; `false` (zadano) za produkciju

**GitHub Pages (demo):** `.github/workflows/deploy.yml` gradi, testira i objavljuje web na svaki push u `main`, ručno i jednom dnevno. U repozitoriju jednom postaviti *Settings → Pages → Source = GitHub Actions*.
Napomena: `robots.txt` na project site adresi (`korisnik.github.io/repozitorij/`) **nema učinka** – zaštitu daje meta `noindex` na svakoj stranici.

**Cloudflare Pages / Netlify (kasnije):** build `npm run build`, output `dist`, `BASE_PATH=/`, `SITE_URL` nove domene; za demo `DEMO_MODE=true` + `public/_headers` s `X-Robots-Tag: noindex`.

## WebBooking (WebBookingPro, Sigma Grupa)

Trenutačno (demo): svi gumbi „Rezerviraj” i booking traka vode na postojeću stranicu
`https://www.zagi.hr/booknow.php?jez=hr|en` i šalju `checkin_date`, `checkout_date` (YYYY-MM-DD), `adults` i `source=novi-web`.
Isti parametri datuma već se koriste na postojećem zagi.hr obrascu.

Konfiguracija (`.env`): `PUBLIC_WEBBOOKING_URL`, `PUBLIC_WBP_HOTEL_ID` (pročitan s booknow.php: `33419`).

**Uključivanje ugrađene rezervacije** (bez iframea): `PUBLIC_WBP_EMBED_ENABLED=true`. Tada:
- svi gumbi vode na `/hr/rezervacija/` i `/en/booking/` (isti layout weba),
- stranica postavlja `window.wbpSettings = { hotelId, language, currency: 'EUR', showLogo: '0', showFooter: '0', source }` i učitava WBP skriptu istim mehanizmom kao postojeća booknow.php (asset-manifest),
- parametri iz URL-a (`checkin_date`, `checkout_date`, `adults`, `children`, `roomId`, `promoCode`, `language`, `currency`, `source`) nadjačavaju `wbpSettings`,
- stranice rezervacije uvijek su `noindex` i nisu u sitemapu.

Prije uključivanja od Sigme treba: potvrda hotelId-a, dopuštenje nove domene, nazivi parametara i stilske smjernice (vidi `TODO.md`).

## Obrasci

Obrasci (kontakt, restoran, dvorana, wellness) imaju validaciju na oba jezika, sažetak grešaka, honeypot polje i privolu.
`PUBLIC_FORM_ACTION` = URL koji prima `POST` (Formspree, Netlify Forms, Web3Forms ili vlastiti endpoint). Prazno = **demo način**: nakon validacije nudi se slanje istog upita e-mailom (`mailto:`).

## Dodavanje jezika

Ukratko: `enabled: true` u `src/i18n/config.ts`, rječnik `src/i18n/ui/<kod>.ts`, sadržaj u `src/content/*/<kod>/`. Komponente se ne mijenjaju. Detaljno: [docs/NOVI-JEZIK.md](docs/NOVI-JEZIK.md).

## Admin panel (CMS)

Pripremljeno, nije instalirano. `PUBLIC_CMS_ENABLED=true` + instalacija Keystatica → admin na `/keystatic` (i `/admin`). Detaljno: [docs/CMS-PLAN.md](docs/CMS-PLAN.md).

## AI chatbot

Samo rezervirano mjesto. `PUBLIC_CHATBOT_ENABLED=false` → ne učitava se nikakav kod. Detaljno: [docs/CHATBOT-PLAN.md](docs/CHATBOT-PLAN.md).

## Kvaliteta

- `npm run check` – 0 grešaka (tipovi + Zod sheme sadržaja).
- `npm run screens` – 375 / 768 / 1024 / 1440 px: bez horizontalnog scrolla, bez grešaka u konzoli, dodirne površine ≥ 24 px (interaktivni elementi sučelja ≥ 44 px), jedan H1 po stranici. Snimke u `docs/screens/`.
- Pristupačnost: skip link, vidljiv fokus, mobilni izbornik sa zarobljenim fokusom i Escape, slider s pauzom (WCAG 2.2.2) i bez autoplaya uz `prefers-reduced-motion`, lightbox na nativnom `<dialog>`, obrasci s `aria-invalid` / `aria-describedby`.

SEO detalji: [docs/SEO.md](docs/SEO.md). Otvorena pitanja i odluke: [TODO.md](TODO.md).
