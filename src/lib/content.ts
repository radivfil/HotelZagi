import { getCollection, getEntry, type CollectionKey, type CollectionEntry } from 'astro:content';
import { fallbackChain } from '@/i18n/config';
import { typo, typoDeep } from '@/lib/typography';

type Localized<C extends CollectionKey> = { data: CollectionEntry<C>['data']; locale: string };

/**
 * Dohvaća unos `<kolekcija>/<jezik>/<name>.json` uz rezervni jezik:
 * ako prijevod ne postoji, vraća sadržaj iz fallback lanca (npr. pl → en → hr).
 * `locale` u rezultatu je jezik sadržaja koji je stvarno prikazan.
 */
export async function getLocalized<C extends CollectionKey>(collection: C, locale: string, name: string): Promise<Localized<C>> {
  // getCollection umjesto getEntry: nedostajući prijevod je očekivan, pa ne želimo upozorenja u buildu
  const all = (await getCollection(collection)) as CollectionEntry<C>[];
  for (const code of fallbackChain(locale)) {
    const entry = all.find((e) => e.id === `${code}/${name}`);
    if (entry) return { data: typoDeep(entry.data, code), locale: code };
  }
  throw new Error(`Nedostaje sadržaj: ${collection}/${locale}/${name}`);
}

/** Svi unosi kolekcije za jezik (npr. sobe), uz isti rezervni lanac. */
export async function getLocalizedList<C extends CollectionKey>(collection: C, locale: string) {
  const all = await getCollection(collection);
  for (const code of fallbackChain(locale)) {
    const list = all.filter((e) => e.id.startsWith(`${code}/`)).map((e) => ({ ...e, data: typoDeep(e.data, code) }));
    if (list.length) return { entries: list, locale: code };
  }
  return { entries: [] as typeof all, locale };
}

export async function getGlobal() {
  const entry = await getEntry('global', 'global');
  if (!entry) throw new Error('Nedostaje src/content/settings/global.json');
  const d = entry.data;
  // Telefoni se ne smiju prelomiti unutar broja (tel: poveznice ionako uklanjaju razmake)
  return { ...d, phones: { main: typo(d.phones.main, ''), mobile: typo(d.phones.mobile, ''), reception: typo(d.phones.reception, '') } };
}

export async function getSettings(locale: string) {
  return (await getLocalized('settings', locale, 'site')).data;
}

/** tel: poveznica iz prikaznog broja */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
