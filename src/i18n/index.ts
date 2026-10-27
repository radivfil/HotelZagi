import { fallbackChain } from './config';
import type { UiDict, UiKey } from './ui/hr';
import { typo } from '@/lib/typography';

/**
 * Rječnici se učitavaju automatski: dovoljno je dodati src/i18n/ui/<code>.ts.
 * Nedostajući ključevi uzimaju se iz jezika u fallback lancu.
 */
const modules = import.meta.glob<{ default: Partial<UiDict> }>('./ui/*.ts', { eager: true });
const dictionaries: Record<string, Partial<UiDict>> = Object.fromEntries(
  Object.entries(modules).map(([file, mod]) => [file.replace(/^.*\/(\w+)\.ts$/, '$1'), mod.default]),
);

export type { UiKey };

export function useTranslations(locale: string) {
  const chain = fallbackChain(locale);
  return function t(key: UiKey, vars?: Record<string, string | number>): string {
    let text: string = key;
    let lang = locale;
    for (const code of chain) {
      const value = dictionaries[code]?.[key];
      if (value) {
        text = value;
        lang = code;
        break;
      }
    }
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
    return typo(text, lang);
  };
}

/** Hrvatska množina: 1 osoba, 2–4 osobe, 5+ osoba (ostali jezici koriste guestN). */
export function guestLabel(t: ReturnType<typeof useTranslations>, n: number): string {
  if (n === 1) return t('book.guest1');
  return t(n >= 5 ? 'book.guestN5' : 'book.guestN', { n });
}
