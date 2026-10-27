# Plan AI chatbota

U ovom koraku chatbot se **ne gradi** – pripremljeno je samo mjesto.

## Stanje

- Komponenta `src/components/ChatWidget.astro` uključena je u layout, ali uz `PUBLIC_CHATBOT_ENABLED=false` **ne renderira ništa**: nema HTML-a, stila, skripte ni mrežnih zahtjeva. Nema utjecaja na performanse.
- `src/components/ConsentBanner.astro` – banner pristanka; renderira se samo kad ga nešto traži (`CONSENT_REQUIRED`, tj. uključen chatbot koji traži pristanak).
- Footer i stranica Privatnost imaju rezervirano mjesto za izjavu o obradi podataka chatbota (`footer.chatbotNotice`, sekcija `#chatbot`).

## Uključivanje

`.env`:

```
PUBLIC_CHATBOT_ENABLED=true
PUBLIC_CHATBOT_PROVIDER=ime-pružatelja
PUBLIC_CHATBOT_SCRIPT_URL=https://…/widget.js
PUBLIC_CHATBOT_ID=…
```

Tada se prikazuje:
- plutajući gumb u donjem desnom kutu (56 px; na mobitelu iznad donje CTA trake, ne preklapa gumb „Rezerviraj” ni banner kolačića),
- panel s naslovom, uvodnom porukom na jeziku stranice (`chat.greeting` u rječniku) i praznim spremnikom `#chat-root` u koji vanjski widget montira sučelje,
- skripta pružatelja učitava se **lijeno**: nakon prve interakcije + odgode (`CHATBOT.loadDelayMs`, 8 s) ili otvaranja panela – i **tek uz pristanak na kolačiće** (`zagi-consent=accepted`). Jezik widgeta prati jezik stranice (`data-lang`).
- pristupačnost: `aria-expanded`, `aria-controls`, Escape zatvara panel i vraća fokus.

Prilagodba konkretnom pružatelju radi se samo u funkciji `load()` u `ChatWidget.astro` (npr. `window.ProviderWidget.init({ id, lang, container: '#chat-root' })`).

## Što bot treba znati (izvor: `src/content/**`)

- **Sobe:** tipovi, kreveti, broj gostiju, sadržaji, cijene „od” (uz napomenu da je točna cijena u rezervaciji).
- **Restoran:** ponuda, zagorski specijaliteti, nedjeljni švedski stol (cijene, rezervacija stola), proslave, catering.
- **Wellness:** sadržaji (saune, whirlpool, relax zona), radno vrijeme, paketi, rezervacija termina.
- **Kongresna dvorana:** kapacitet (60 + 30), oprema, rasporedi, upit.
- **Praktično:** besplatan parking (i autobusi), EV punionica, doručak, kućni ljubimci uz doplatu, bike friendly, udaljenost od Zagreba i A2, upute za dolazak.
- **Kontakt:** telefoni, e-mail, adresa, poveznica na kartu.

Preporuka: bot se hrani izvozom JSON sadržaja pri svakom buildu (npr. `dist/chatbot-knowledge.json`), pa je uvijek usklađen s webom.

## Što bot NE radi

- **Ne radi rezervacije soba** – za to uvijek šalje poveznicu na WebBooking (gumb „Rezerviraj”). Ne prikuplja podatke o plaćanju.
- Ne potvrđuje dostupnost ni konačne cijene (to je isključivo u WebBookingu ili kod recepcije).
- Ne daje zdravstvene savjete (wellness).
- Kod pritužbi, posebnih zahtjeva i grupa prosljeđuje na recepciju (telefon / e-mail).

## Privatnost i obveze (GDPR)

- Ugovor o obradi podataka (DPA) s pružateljem; lokacija pohrane (EU poželjno) i rok čuvanja razgovora.
- Pristanak prije učitavanja skripte ako pružatelj postavlja kolačiće ili prati korisnika.
- Ažurirati stranice **Privatnost** (sekcija „Virtualni asistent”) i **Kolačići** (popis kolačića pružatelja, svrha, trajanje), te tekst u footeru.
- Jasna oznaka da je riječ o AI asistentu (EU AI Act – obveza transparentnosti).
- Ne unositi osjetljive podatke u razgovor; mogućnost brisanja razgovora na zahtjev.
