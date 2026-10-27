// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import { defaultLocale, enabledLocales } from './src/i18n/config.ts';
import { alternatesFor, matchPath } from './src/i18n/routes.ts';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = (env.PUBLIC_SITE_URL || 'https://www.zagi.hr').replace(/\/$/, '');
const cmsEnabled = env.PUBLIC_CMS_ENABLED === 'true';

// CMS (Keystatic) se učitava samo kad je uključen I instaliran – vidi docs/CMS-PLAN.md
const cmsIntegrations = [];
if (cmsEnabled) {
  try {
    const [{ default: keystatic }, { default: react }] = await Promise.all([
      import('@keystatic/astro'),
      import('@astrojs/react'),
    ]);
    cmsIntegrations.push(react(), keystatic());
  } catch {
    console.warn('[cms] PUBLIC_CMS_ENABLED=true, ali Keystatic nije instaliran (npm i @keystatic/core @keystatic/astro @astrojs/react react react-dom).');
  }
}

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  i18n: {
    locales: enabledLocales.map((l) => l.code),
    defaultLocale,
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  redirects: cmsEnabled ? { '/admin': '/keystatic' } : {},
  integrations: [
    sitemap({
      // Stranica rezervacije (noindex) i 404 nisu u sitemapu
      filter: (page) => {
        const m = matchPath(new URL(page).pathname);
        return !!m && m.key !== 'booking';
      },
      // hreflang alternativne veze generiraju se iz konfiguracije jezika i lokaliziranih slugova
      serialize(item) {
        const m = matchPath(new URL(item.url).pathname);
        if (m) {
          item.links = [
            ...alternatesFor(m.key).map((a) => ({ lang: a.hreflang, url: `${site}${a.path}` })),
            { lang: 'x-default', url: `${site}${alternatesFor(m.key).find((a) => a.locale === defaultLocale)?.path}` },
          ];
        }
        return item;
      },
    }),
    ...cmsIntegrations,
  ],
});
