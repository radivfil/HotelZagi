/**
 * Tehnička konfiguracija weba. Sadržaj (tekstovi, kontakt, slike) NE ide ovdje,
 * nego u src/content/ – ovdje su samo prekidači i integracije.
 * Vrijednosti se mogu nadjačati varijablama okruženja (vidi .env.example).
 */
const env = import.meta.env;
const flag = (value: string | undefined, fallback: boolean) =>
  value === undefined || value === '' ? fallback : value === 'true';

export const SITE = {
  url: (env.PUBLIC_SITE_URL || 'https://www.zagi.hr').replace(/\/$/, ''),
  /** true za demo objave – dodaje noindex i blokira indeksiranje u robots.txt */
  noindex: flag(env.PUBLIC_NOINDEX, false),
  defaultOgImage: '/uploads/wellness/wellness-relax-zona.jpg',
};

/**
 * WebBooking (WebBookingPro, Sigma Grupa). Postojeća stranica rezervacije hotela
 * ostaje izvor istine; ovaj web je samo usmjerava i šalje datume.
 */
export const BOOKING = {
  /** Postojeća stranica rezervacije. Jezik se dodaje kao ?jez=hr|en */
  url: env.PUBLIC_WEBBOOKING_URL || 'https://www.zagi.hr/booknow.php',
  /** Parametar jezika koji očekuje postojeća stranica */
  langParam: 'jez',
  /** WBP_HOTEL_ID – hotelId u WebBookingPro (pročitan s booknow.php) */
  hotelId: env.PUBLIC_WBP_HOTEL_ID || '33419',
  /**
   * WBP_EMBED_ENABLED – jedna zastavica za uključivanje ugrađenog widgeta.
   * false: gumbi vode na `url`. true: gumbi vode na /hr/rezervacija/ i /en/booking/.
   */
  embedEnabled: flag(env.PUBLIC_WBP_EMBED_ENABLED, false),
  /** Manifest WBP skripte (isti način učitavanja kao na postojećoj booknow.php) */
  embedManifestUrl: 'https://booking.webbookingpro.com/asset-manifest.json',
  embedBaseUrl: 'https://booking.webbookingpro.com/',
  currency: 'EUR',
  /** Oznaka izvora rezervacije radi praćenja */
  source: 'novi-web',
  /** Nazivi parametara koje postojeća booknow.php forma već koristi (format YYYY-MM-DD) */
  params: { checkIn: 'checkin_date', checkOut: 'checkout_date', guests: 'adults', source: 'source' },
};

/** Statični obrasci: action je konfigurabilan. Prazno = demo način. */
export const FORMS = {
  action: env.PUBLIC_FORM_ACTION || '',
  method: 'post' as const,
  /** Naziv skrivenog polja zamke za spam (honeypot) */
  honeypot: 'website_url',
};

/** CMS_ENABLED – priprema za Keystatic (vidi docs/CMS-PLAN.md). */
export const CMS_ENABLED = flag(env.PUBLIC_CMS_ENABLED, false);

/** AI chatbot – samo rezervirano mjesto (vidi docs/CHATBOT-PLAN.md). */
export const CHATBOT = {
  /** CHATBOT_ENABLED – kad je false, ne učitava se nikakav kod, stil ni skripta */
  enabled: flag(env.PUBLIC_CHATBOT_ENABLED, false),
  provider: env.PUBLIC_CHATBOT_PROVIDER || '',
  scriptUrl: env.PUBLIC_CHATBOT_SCRIPT_URL || '',
  id: env.PUBLIC_CHATBOT_ID || '',
  /** Učitaj tek nakon interakcije ili nakon ove odgode (ms) */
  loadDelayMs: 8000,
  /** Traži pristanak na kolačiće prije učitavanja vanjske skripte */
  requiresConsent: true,
};

/** Banner pristanka prikazuje se samo kad postoji nešto što ga traži. */
export const CONSENT_REQUIRED = CHATBOT.enabled && CHATBOT.requiresConsent;
