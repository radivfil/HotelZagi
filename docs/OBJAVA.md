# Objava weba

Web je statičan (`dist/`). Ponašanje objave određuju tri varijable okoline:

| Varijabla | Značenje | GitHub Pages (demo) | Produkcija (zagi.hr) |
|---|---|---|---|
| `SITE_URL` | izvor weba, bez putanje | `https://radivfil.github.io` | `https://www.zagi.hr` |
| `BASE_PATH` | podmapa weba | `/NAZIV-REPOZITORIJA` (npr. `/HotelZagi`) | `/` (zadano) |
| `DEMO_MODE` | `true` = noindex na svim stranicama, bez sitemapa, robots `Disallow: /`, napomena „Demo” u footeru | `true` | `false` (zadano) |

Sve interne poveznice i resursi (slike, srcset, CSS, JS, fontovi, logo, favicon, PDF, OG slike, canonical, hreflang, JSON-LD, preusmjerenje korijena, 404) prolaze kroz `withBase()` (`src/lib/url.ts`), pa web radi i u podmapi.

## GitHub Pages (demo)

Adresa: **`https://<korisnik>.github.io/<repozitorij>/`** – za račun `radivfil` i repozitorij `HotelZagi`: <https://radivfil.github.io/HotelZagi/>.

### Jednokratno na GitHubu

1. Napravite repozitorij (npr. `HotelZagi`). **GitHub Pages na besplatnom računu radi samo za javne repozitorije** (privatni traže GitHub Pro/Team) – vidi niže ako izvor mora ostati privatan.
2. Lokalno: `git remote add origin https://github.com/radivfil/HotelZagi.git` i `git push -u origin main`.
3. **Settings → Pages → Build and deployment → Source = „GitHub Actions”.**
4. **Actions** → „Objava na GitHub Pages” → prvi put pokrenite ručno (*Run workflow*) ako se nije pokrenuo sam nakon pusha.
5. Po želji: **Settings → Secrets and variables → Actions → Variables**: `SITE_URL`, `BASE_PATH`, `DEMO_MODE` (nadjačavaju vrijednosti koje workflow čita iz Pages postavki; `DEMO_MODE` je zadano `true`).

### Što radi workflow (`.github/workflows/deploy.yml`)

- pokreće se na push u `main`, ručno (*workflow_dispatch*) i **svaki dan** (cron) – ponude restorana se tako uključuju i isključuju po datumu
- `npm ci` → `npm run check` → `npm run build` (sa `SITE_URL`, `BASE_PATH`, `DEMO_MODE`)
- testovi: `test:invisible`, `test:paths`, `test:hero`, `test:dashes` (na `astro preview` s istim base-om) – ako test padne, objave nema
- `upload-pages-artifact` + `deploy-pages` (permissions `pages: write`, `id-token: write`, concurrency `pages`)

### robots.txt na project site adresi

`robots.txt` se gradi i objavljuje, ali **na adresi `korisnik.github.io/repozitorij/` nema učinka**: tražilice čitaju samo `korisnik.github.io/robots.txt`. Stvarna zaštita je `<meta name="robots" content="noindex, nofollow">` na svakoj stranici i izostanak sitemapa (`DEMO_MODE=true`).

### Ako izvorni kod mora ostati privatan

GitHub Pages iz privatnog repozitorija traži plaćeni plan. Alternative:
1. **Dva repozitorija:** privatni s izvorom + javni samo s izgrađenim webom. U privatnom workflowu nakon builda kopirati `dist/` u javni repozitorij (npr. akcija `peaceiris/actions-gh-pages` s `external_repository` i deploy ključem) i u javnom uključiti Pages iz grane `gh-pages`. `BASE_PATH` tada mora biti naziv **javnog** repozitorija.
2. **Ručno:** `SITE_URL=… BASE_PATH=/<javni-repo> DEMO_MODE=true npm run build`, pa sadržaj `dist/` pushati u granu `gh-pages` javnog repozitorija.
3. Prijeći odmah na Cloudflare Pages ili Netlify (privatni repozitorij je podržan besplatno).

## Kasnije: Cloudflare Pages (ili Netlify)

Što se mijenja:
- **Build command** `npm run build`, **output** `dist`, `NODE_VERSION=24`
- **Varijable:** `SITE_URL=https://<projekt>.pages.dev` (ili `https://www.zagi.hr`), `BASE_PATH=/` (ili ne postaviti), `DEMO_MODE=true` za demo / `false` za produkciju
- **noindex i na razini poslužitelja** (demo na `*.pages.dev`): dodati `public/_headers`
  ```
  /*
    X-Robots-Tag: noindex, nofollow
  ```
  (za produkciju datoteku ukloniti)
- `public/_redirects` (`/ → /hr/ 301`) Cloudflare i Netlify čitaju automatski
- GitHub Pages workflow isključiti (Settings → Pages → Source: None, ili obrisati `deploy.yml`)

### Dnevna izgradnja preko deploy hooka (opcija)

Za ponude restorana s datumima web treba graditi jednom dnevno. Na Cloudflare Pages / Netlify:
1. Hosting → *Deploy hooks* → novi hook (grana `main`) → kopirati URL.
2. GitHub → Settings → Secrets → Actions → `DEPLOY_HOOK_URL`.
3. Workflow (npr. `.github/workflows/daily-rebuild.yml`):
   ```yaml
   on:
     schedule: [{ cron: '15 2 * * *' }]
     workflow_dispatch: {}
   jobs:
     rebuild:
       runs-on: ubuntu-latest
       steps:
         - run: curl --fail -X POST "${{ secrets.DEPLOY_HOOK_URL }}"
   ```
Dok je objava na GitHub Pages, tu ulogu ima `schedule` u `deploy.yml`.

## Lokalna provjera objave s podmapom

```bash
# Git Bash na Windowsu: ispred dodati MSYS_NO_PATHCONV=1 (inače /HotelZagi postaje Windows putanja)
SITE_URL=https://radivfil.github.io BASE_PATH=/HotelZagi DEMO_MODE=true npm run build
SITE_URL=https://radivfil.github.io BASE_PATH=/HotelZagi DEMO_MODE=true npx astro preview --port 4400
# drugi terminal:
BASE_URL=http://localhost:4400 BASE_PATH=/HotelZagi npm test
```
Web je tada na <http://localhost:4400/HotelZagi/>.
