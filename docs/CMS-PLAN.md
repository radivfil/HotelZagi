# Plan admin panela (CMS)

Cilj: zaposlenik hotela mijenja tekstove, slike, sobe, slajdove i kontakt bez programera – **bez prepisivanja weba**.

## Što je već pripremljeno

- **Sav uređivi sadržaj je u Content Collections** (`src/content/**`, JSON po jeziku): hero slajdovi, tekstovi i naslovi svih stranica, tipovi soba, kartice na naslovnici, galerija, kontakt i radno vrijeme, brošure (PDF), globalne postavke (trajanje slidera) i SEO polja (title, meta opis, OG slika) po stranici.
- **Zod sheme** u `src/content.config.ts` imaju opisna imena polja i `.describe()` pomoćne tekstove = buduća polja i upute u panelu. Shema štiti od pogrešnog unosa (npr. predug SEO naslov, slika bez alt teksta).
- **Slike** su u `public/uploads/<kategorija>/` s obveznim alt tekstom na svakom jeziku; AVIF/WebP varijante generira `scripts/optimize-images.mjs` automatski pri buildu.
- **Prekidač** `PUBLIC_CMS_ENABLED=false` u `.env`. `astro.config.mjs` učitava Keystatic samo kad je prekidač uključen **i** paketi su instalirani; tada `/admin` preusmjerava na `/keystatic`.
- **Konfiguracija panela** `cms/keystatic.config.ts`: globalne postavke, naslovnica (slajdovi, kartice), tekstovi weba i tipovi soba – za svaki uključeni jezik automatski.

## Preporuka

| | Keystatic (1. izbor) | Sveltia CMS (alternativa) |
|---|---|---|
| Integracija s Astrom | službena (`@keystatic/astro`) | samostalna SPA (`/admin/index.html` + `config.yml`) |
| Pohrana | Git (lokalno / GitHub) – sadržaj ostaje u repozitoriju | Git (GitHub/GitLab) |
| i18n | po jeziku zasebni unosi (kao u ovom projektu) | ugrađen i18n (više jezika u jednom uređivaču, usporedni prikaz) |
| Hosting admina | traži on-demand rute (adapter: Netlify, Cloudflare, Vercel, Node) | radi na potpuno statičnom hostingu |
| Prijava | GitHub račun ili Keystatic Cloud | GitHub/GitLab OAuth |

**Keystatic** je prvi izbor zbog tipiziranih polja i čistog sučelja za nestručne korisnike.
**Sveltia CMS** je bolji ako hotel uvede 4–5 jezika i želi prevoditi usporedno, ili ako hosting mora ostati 100 % statičan.

## Što treba za produkciju (Keystatic)

1. **Hosting s on-demand rutama** za `/keystatic` i `/api/keystatic`: Cloudflare Pages (`@astrojs/cloudflare`), Netlify (`@astrojs/netlify`) ili Vercel. Javne stranice ostaju statične (`prerender`).
2. **Repozitorij na GitHubu** (privatni) – svaka izmjena u panelu je commit; build se pokreće automatski.
3. **Autentikacija:** GitHub App (Keystatic je vodi kroz postavljanje) ili **Keystatic Cloud** (prijava e-mailom, bez GitHub računa za osoblje – preporučeno za hotel).
4. **Pristup:** zaposlenik dobiva račun samo za panel; programer zadržava pristup repozitoriju.

## Koraci uvođenja

1. `npm i @keystatic/core @keystatic/astro @astrojs/react react react-dom`
2. `mv cms/keystatic.config.ts keystatic.config.ts` (i ukloniti `cms` iz `exclude` u `tsconfig.json`)
3. Dovršiti singletone za wellness, restoran, kongresnu dvoranu, o nama, kontakt i pravne stranice (preslikati polja iz `src/content.config.ts`; oznaka TODO u datoteci).
4. `.env`: `PUBLIC_CMS_ENABLED=true`; za produkciju dodati adapter i `output: 'static'` + `prerender` (Astro 5+ to podržava u istom projektu).
5. Lokalno: `npm run dev` → `http://localhost:4321/keystatic` (storage `local` – piše izravno u `src/content`).
6. Produkcija: `storage: { kind: 'github', repo: '…' }` ili `{ kind: 'cloud', project: '…' }`.
7. Obuka osoblja (30 min): slajdovi, sobe, cijene, fotografije s alt tekstom, SEO polja.

## Alternativa: Sveltia CMS

`public/admin/index.html` + `public/admin/config.yml` s kolekcijama tipa `files` koje pokazuju na iste JSON datoteke i `i18n: { structure: multiple_folders, locales: [hr, en] }`.
Ne traži adapter ni promjene u komponentama.

## Napomena

U ovom koraku Keystatic nije instaliran ni pokrenut (namjerno, da demo ostane bez dodatnih ovisnosti); `cms/keystatic.config.ts` je predložak koji treba provjeriti pri instalaciji.
