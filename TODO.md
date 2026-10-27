# TODO – otvorena pitanja, nesklad izvora i odluke

Izvori: brošura **Hotel Zagi A4 (2019, HR/EN/DE)**, brošura **Wellness u Hotelu Zagi**, postojeći web **zagi.hr** (preuzet 27. 10. 2026.) i brief klijenta.
Pravilo: kad se izvori razilaze, korištena je brošura.

## 1. Nesklad među izvorima (potvrditi s hotelom)

| Podatak | Brošura | zagi.hr | Brief | Na webu |
|---|---|---|---|---|
| Broj soba | 60 soba / 150 kreveta | 60 (Smještaj), **58** (O nama), **55** (Kongresna dvorana) | 58–60 | **60** |
| Kapacitet restorana | **150 osoba** | **220** mjesta (O nama); „dvije dvorane za 90 osoba i dvije terase za 40 osoba” (Restoran) | ~220 | **150**, „2 dvorane + 2 terase” |
| Kongresna dvorana | **60** + manja dvorana **30** | 60 (O nama), **55** (Kongresna dvorana) | ~60 | **60 + 30** |
| Udaljenost od Zagreba | – | **30 km / 30 min** (O nama), **35 km** (Kongresna) | 30 km / 30 min | **30 km / 30 min** |
| Mob. 099 228 3919 | wellness brošura: „Recepcija” | „restoran” | – | neutralno „Mobitel” |
| Mob. 099 234 8086 | – | „recepcija” (Kontakt, Wellness) | – | „Mobitel recepcije” |
| Facebook | /hotelzagi | „Pansion-ZAGI-Oroslavje/217739351848” | – | /hotelzagi |
| Kupaonica | tuš kabina | „tušem/kadom” (O nama), tuš (Smještaj) | – | tuš |

## 2. Podaci koje treba potvrditi ili dostaviti (hotel)

- [ ] **Google ocjena 4,4 / 1.800+ recenzija** – iz briefa, nije provjereno u izvorima. Dostaviti **Place ID** za izravnu poveznicu na recenzije (sada je poveznica na pretragu Google karata).
- [ ] **EV punionica, najam bicikala, kućni ljubimci uz doplatu** – samo u briefu; na zagi.hr ni u brošurama nema potvrde (bike friendly je potvrđen: „Bike Professional”, partner za aktivni odmor). Iznos doplate za ljubimce, uvjeti, broj punjača i snaga.
- [ ] **Cijene soba „od”** (33 / 48 / 62 / 74 / 120 €) preuzete s naslovnice zagi.hr – nisu u brošurama. Potvrditi ili isključiti (polje `priceFrom` u `src/content/rooms`).
- [ ] **Nedjeljni švedski stol** – cijene 28 € / 16 € / besplatno (zagi.hr, 10. 9. 2026.); **vrijeme posluživanja** za sezonu 2026./27. nije navedeno (stari plakat: 12–15 h) – nije prikazano.
- [ ] **Radno vrijeme restorana i recepcije** – nije nigdje navedeno; nije prikazano.
- [ ] **Check-in / check-out**, doručak (vrijeme, buffet za sve goste?), parkiranje autobusa – potvrditi.
- [ ] **Jednokrevetna soba i obiteljska soba za 7 osoba s balkonom** – postoje samo na naslovnici zagi.hr (cijena), bez opisa i fotografija; prikazane kao popis „Ostali tipovi soba”.
- [ ] **Wellness** – cijene termina i paketa, „Private SPA”, „Girls wanna relax”, uvjeti za vanjske goste, kapacitet, minimalna dob.
- [ ] **Kongresna dvorana** – kapacitet po rasporedu (kino / U / učionica / sastanak), detaljna oprema (ozvučenje, mikrofoni, flipchart, klima), fotografije manje dvorane.
- [ ] **Upute za dolazak** – „izlaz Zabok na A2” je zaključak na temelju karte iz brošure; potvrditi preporučeni izlaz.
- [ ] **Zdravstvene tvrdnje** u wellness brošuri (infra sauna: respiratorni problemi, reuma …) – zadržane uz „Prema brošuri…”; preporuka pravnog pregleda ili ublažavanja.
- [ ] **Pravni tekstovi** (Privatnost, Kolačići) – predložak; rok čuvanja 12 mjeseci je pretpostavka. Pregled pravnika / DPO-a.
- [ ] **Društvene mreže** – potvrditi da su /hotelzagi i @hotel_zagi aktivni profili (brošura) i ugasiti/preusmjeriti stari „Pansion ZAGI”.

## 2a. Ponude restorana (nova kolekcija)

- [ ] **Probne ponude – ZAMIJENITI stvarnima** (podaci iz brošure / od hotela): `src/content/restaurant-offers/{hr,en}/primjer-sezonska-ponuda.json` („Primjer: Sezonska ponuda”, status aktivno) i `primjer-riblji-svedski-stol.json` („Primjer: Riblji švedski stol”, status uskoro). Nemaju jela, cijene ni datume – namjerno. Na webu imaju oznaku „Primjer”.
- [ ] **Nedjeljni švedski stol** premješten je iz stranice Restoran u kolekciju kao stvarna ponuda (cijene 28 € / 16 € / besplatno i početak 20. 9. 2026. sa zagi.hr). Nedostaje **vrijeme posluživanja** i **datum završetka sezone** (`validTo`).
- [ ] Postaviti **deploy hook** i GitHub secret `DEPLOY_HOOK_URL` da dnevni build radi (ili cron na hostingu).
- [ ] JSON-LD: `Restaurant.makesOffer` sadrži samo stvarne aktivne ponude s potvrđenom cijenom; `Menu` nije dodan dok jelovnik nije potvrđen.

## 3. Fotografije

- [ ] **Nema kvalitetne vanjske fotografije hotela.** Pročelje (`hotel-zagi-procelje.jpg`, 603×569) i Oroslavje iz zraka (`oroslavje-iz-zraka.jpg`, 910×544) izvučeni su iz brošure 2019 i **premali su** – koriste se samo u manjim prikazima. Potrebne nove fotografije pročelja, terase, parkirališta i okolice.
- [ ] Sve fotografije sa zagi.hr dostupne su najviše u **1900 px** širine – dovoljno za zaslone do ~1920 px; za velike/retina zaslone tražiti **originale** (posebno wellness serija i sobe).
- [ ] Jednokrevetna soba, obiteljska soba za 7 osoba, manja dvorana, restoranske dvorane i terase – nema fotografija.
- [ ] Fotografije su vlasništvo hotela i u demu se koriste samo za prikaz. Odabrano 10 ključnih (`assets/photos/`) + 23 za galeriju i podstranice (`public/uploads/`).

## 4. Engleski tekstovi

- [ ] Sav engleski tekst (sadržaj i `src/i18n/ui/en.ts`) napisan je na temelju hrvatskog izvora – **pregled izvornog govornika**. Posebno: nazivi jela (štrukli, mlinci, buncek, zlevanka), wellness slogani, pravni tekstovi.

## 5. WebBooking / Sigma Grupa

- [ ] Potvrditi da je sustav **WebBookingPro (Sigma Grupa)** – na booknow.php pronađen `window.wbpSettings` s **hotelId `33419`** i učitavanje s `booking.webbookingpro.com`.
- [ ] **Dopuštenje nove domene** za ugrađeni widget (CORS / whitelist).
- [ ] **Nazivi URL parametara**: prihvaća li widget/booknow.php `checkin_date`, `checkout_date` (potvrđeno na starom obrascu), `adults`, `children`, `roomId`, `promoCode`; bilježi li `source=novi-web` (ili treba UTM).
- [ ] Podržani jezici widgeta (de? pl? cs? nl?) – sada samo hr/en, ostali idu na en.
- [ ] **Stilske smjernice** widgeta (boje, font, tamna tema) i mogućnost deep-linka na tip sobe (`bookingRoomId`).

## 6. Tehničke odluke donesene samostalno

- **Fontovi:** Cormorant Garamond (naslovi) + Figtree (tekst), samohostani, latin + latin-ext (hrvatski i budući pl/cs/nl).
- **Paleta:** iz loga (#866657); akcent #7A5A4A (6,2:1 s bijelim tekstom), pozadina #FAF7F2, tekst #2A2522. Maslinasta iz wellness brošure nije korištena (jedna akcentna boja).
- **Logo:** SVG je sadržavao Illustratorove privatne podatke (2 MB); očišćen, smanjena preciznost (89 KB), tijesniji viewBox. Favicon je privremeni monogram „Z” – zatražiti službeni znak.
- **Druga brošura** klasificirana kao **opća promotivna brošura hotela (2019, HR/EN/DE)** – korištena za činjenice (sobe, restoran, dvorane, od 1986.), na stranici Restoran (švedski stol, preuzimanje) i O nama (preuzimanje).
- **H1 naslovnice** je vizualno skriven (slajdovi se mijenjaju i imaju H2); natpis iznad naslova slajda (`eyebrow`) prikazan je vidljivo.
- **Mobitel:** donja traka „Nazovite nas / Rezerviraj” (< 768 px); na malim zaslonima prikazuju se najviše 3 slajda (`slider.maxSlidesOnSmallScreens`).
- **Obrasci** bez poslužitelja rade u **demo načinu** (validacija + `mailto:` s ispunjenim podacima) dok se ne odabere `PUBLIC_FORM_ACTION`.
- **Generirane varijante slika** (`public/uploads/_gen`) commitane su u repozitorij jer AVIF kodiranje traje ~6 min – build na hostingu je brz.
- **Neprevedene stranice** (rezervni jezik) imaju canonical na izvornik i `noindex`; prikazuje se kratka obavijest.
- **Header** na računalu automatski prelazi u hamburger ako se izbornik ne stane u jedan red (duži jezici).
- **Stranica rezervacije** (`/hr/rezervacija/`, `/en/booking/`) uvijek je `noindex` i izvan sitemapa; dok je ugradnja isključena, nudi poveznicu na postojeći booknow.php i booking traku.
- **Google karta** nije ugrađena (iframe usporava i postavlja kolačiće) – poveznica „Otvori u Google kartama”.

## 6a. Tipografija (crtice i prijelomi redaka)

- Automatsko dijeljenje riječi isključeno (`hyphens: none`); `overflow-wrap: break-word` ostaje samo kao zaštita od izlijevanja.
- Tekst sadržaja i rječnika **nije mijenjan** – nijedna crtica nije zamijenjena ni izbačena. Pri izradi weba (`src/lib/typography.ts`) umeću se samo nevidljivi znakovi koji zabranjuju prijelom:
  - crta s razmacima (134 pojave, npr. „Restoran Zagi – okusi…”, „11 – 22 h”): nerazdvojivi razmak prije i poslije + WORD JOINER iza crte,
  - složenice (Wi-Fi, U-oblik, 30-ak, Krapinsko-zagorska, e-mail; EN: family-run, U-shape, king-size …): WORD JOINER iza crtice,
  - telefoni, datumi („20. 9. 2026.”), broj + jedinica (28 €, 22 h),
  - kratke riječi uz sljedeću riječ – hr: i, u, na, s, sa, o, od, do, za, uz, je, a, k, iz, po, te, ili, ni, bez; en: a, an, the, I, of, to, in, on, at, by.
- Prije obrade test je našao **27** crtica na početku/kraju retka; nakon obrade **0** (`npm run test:dashes`, 6 stranica × 4 širine; snimke u `docs/screens/typography/`).
- SEO polja (title, meta opis) i URL-ovi se ne obrađuju.

## 6b. Hero slider – autoplay i kontrole

**Uzrok problema s autoplayem (dijagnosticirano Playwrightom na starom kodu):**
1. **Pauza na hover** vrijedila je za cijelu fotografiju, a hero na računalu zauzima cijeli ekran – kursor je gotovo uvijek iznad nje, pa se slajdovi nisu mijenjali.
2. **Pauza na fokus**: nakon klika na strelicu ili točkicu fokus ostaje na gumbu unutar slidera, pa je pauza trajala dok fokus ne napusti slider – „nakon ručnog klika ostane zaustavljen”.
3. **prefers-reduced-motion**: ako je u sustavu isključena animacija (Windows: *Postavke → Pristupačnost → Vizualni efekti → Efekti animacije*; macOS: *Smanji kretanje*), autoplay je **namjerno** isključen (WCAG). To ponašanje je zadržano.

**Ispravak:** hover pauzira samo iznad teksta slajda; fokus pauzira samo s tipkovnice (`:focus-visible`) ili u booking traci; ručna navigacija uvijek ponovno pokreće odbrojavanje od 5 s; gumb pauza zaustavlja do ponovnog klika; slider stoji dok nije na ekranu ili je kartica skrivena.
**Testiranje uz smanjeno kretanje:** u razvojnom načinu (`npm run dev`) otvorite `/hr/?autoplay=1` – autoplay radi i uz `prefers-reduced-motion`. U produkcijskom buildu parametar nema učinka.

**Kontrole i booking traka** su u zajedničkom „docku” (stupac): kontrole su uvijek iznad trake (razmak 16 px), visina docka prenosi se tekstu slajda kroz `--hero-dock-h`. Na mobitelu i tabletu dock je ispod fotografije, na računalu preko njenog donjeg dijela. Indikator napretka je u aktivnoj točkici (bez animacije uz smanjeno kretanje).
`npm run test:hero`: 10 veličina (320–1920 px, portret/pejzaž, zoom 200 %) bez presijecanja, kontrole ≥ 44 px i klikabilne; 15 provjera ponašanja (autoplay, ručni klik, hover, pauza, smanjeno kretanje, swipe, LCP).

## 6c. Provjera kvalitete

- [ ] U projektu **nema ESLinta** – provjera koda je `npm run check` (TypeScript + Zod sheme, 0 grešaka / 0 upozorenja / 0 savjeta) i Playwright testovi. Prijedlog: dodati ESLint (`eslint-plugin-astro`, `typescript-eslint`) i Prettier u sljedećem koraku.

## 7. Sljedeći koraci (prijedlog)

1. Odabrati i povezati endpoint obrazaca (Netlify Forms / Formspree) + DPA.
2. Sa Sigmom potvrditi parametre i domenu, pa uključiti `PUBLIC_WBP_EMBED_ENABLED`.
3. Instalirati Keystatic (Keystatic Cloud za prijavu osoblja) i dovršiti singletone za preostale stranice.
4. Nove fotografije (pročelje, okolica, restoranske dvorane) i originali postojećih.
5. Stranice za sezonske ponude (švedski stol, wellness paketi, vjenčanja, Advent) s vlastitim SEO poljima.
6. 301 preusmjerenja sa starih URL-ova zagi.hr, Search Console, Google Business Profile.
7. Pregled engleskih tekstova i pravnih stranica; zatim prijevodi pl / cs / nl.
