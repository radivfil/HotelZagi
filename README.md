# Hotel Zagi – novi web (demo, 1. korak)

Brz, responzivan i SEO-optimiziran web obiteljskog Hotela Zagi*** u Oroslavju.
Astro (statični izlaz) + TypeScript + čisti CSS s custom properties. Bez teških biblioteka (bez Swipera, Slicka, jQueryja); ukupno ~3 KB JavaScripta po stranici.

| | |
|---|---|
| Jezici | hrvatski (zadani, `/hr/`) i engleski (`/en/`); pl, cs, nl pripremljeni, isključeni |
| Rezervacije | postojeći WebBookingPro (`booknow.php`), ugrađivanje pripremljeno iza jedne zastavice |
| Sadržaj | Astro Content Collections (JSON + Zod sheme) – spremno za Keystatic |
| Lighthouse (lokalno) | mobitel 98 / 100 / 100 / 100 · računalo 100 / 100 / 100 / 100 |

## Pokretanje

```bash
npm install
npm run dev       # http://localhost:4321  (prije pokretanja generira varijante slika)
npm run build     # statični web u dist/
npm run preview   # pregled builda
npm run check     # provjera tipova i shema sadržaja
npm run screens   # Playwright screenshotovi + provjere (potreban `npm run preview`)
```

Node 20+ (testirano na Node 24). Konfiguracija ide kroz `.env` (predložak: `.env.example`).

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

- **Hero slajdovi:** `src/content/pages/<jezik>/home.json` → `heroSlides` (slika, naslov, podnaslov, gumb). Redoslijed u popisu = redoslijed slajdova. Trajanje slajda: `src/content/settings/global.json` → `slider.intervalMs`.
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
Za automatsko osvježavanje uključen je `.github/workflows/daily-rebuild.yml` – svaki dan pokreće build preko *deploy hooka*
(Cloudflare Pages ili Netlify → Deploy hooks → URL spremiti kao GitHub secret `DEPLOY_HOOK_URL`). Bez GitHuba isto se može postaviti cronom na hostingu.

Probne ponude imaju `"example": true` i oznaku „Primjer” – zamijeniti stvarnima (vidi `TODO.md`).

## Objava

Web je potpuno statičan (`dist/`).

**Cloudflare Pages** – Build command `npm run build`, output `dist`, varijabla `NODE_VERSION=22`. Preusmjerenje `/` → `/hr/` radi preko `public/_redirects`.

**Netlify** – isto (`npm run build`, `dist`); `_redirects` se čita automatski. Za obrasce možete koristiti Netlify Forms (vidi dolje).

**GitHub Pages** – GitHub Action s `withastro/action`; korijen preusmjerava `dist/index.html` (meta refresh). Za podstazu postavite `base` u `astro.config.mjs`.

Za **demo objavu** postavite `PUBLIC_NOINDEX=true` (noindex na svim stranicama + `Disallow: /` u robots.txt) i `PUBLIC_SITE_URL` na demo domenu.

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
