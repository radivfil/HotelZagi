import { getCollection, getEntry, type CollectionKey, type CollectionEntry } from 'astro:content';
import { fallbackChain } from '@/i18n/config';

type Localized<C extends CollectionKey> = { data: CollectionEntry<C>['data']; locale: string };

/**
 * Dohvaća unos `<kolekcija>/<jezik>/<name>.json` uz rezervni jezik:
 * ako prijevod ne postoji, vraća sadržaj iz fallback lanca (npr. pl → en → hr).
 * `locale` u rezultatu je jezik sadržaja koji je stvarno prikazan.
 */
export async function getLocalized<C extends CollectionKey>(collection: C, locale: string, name: string): Promise<Localized<C>> {
  for (const code of fallbackChain(locale)) {
    const entry = await getEntry(collection, `${code}/${name}` as never);
    if (entry) return { data: (entry as CollectionEntry<C>).data, locale: code };
  }
  throw new Error(`Nedostaje sadržaj: ${collection}/${locale}/${name}`);
}

/** Svi unosi kolekcije za jezik (npr. sobe), uz isti rezervni lanac. */
export async function getLocalizedList<C extends CollectionKey>(collection: C, locale: string) {
  const all = await getCollection(collection);
  for (const code of fallbackChain(locale)) {
    const list = all.filter((e) => e.id.startsWith(`${code}/`));
    if (list.length) return { entries: list, locale: code };
  }
  return { entries: [] as typeof all, locale };
}

export async function getGlobal() {
  const entry = await getEntry('global', 'global');
  if (!entry) throw new Error('Nedostaje src/content/settings/global.json');
  return entry.data;
}

export async function getSettings(locale: string) {
  return (await getLocalized('settings', locale, 'site')).data;
}

/** tel: poveznica iz prikaznog broja */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
