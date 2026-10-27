// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import { defaultLocale, enabledLocales } from './src/i18n/config.ts';
import { localePath, matchPath } from './src/i18n/routes.ts';

// Varijable iz .env datoteke ili okoline (GitHub Actions / Cloudflare Pages)
const env = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };

/** SITE_URL – izvor weba bez putanje, npr. https://radivfil.github.io (zadano produkcijska domena) */
const site = (env.SITE_URL || env.PUBLIC_SITE_URL || 'https://www.zagi.hr').replace(/\/+$/, '');
/** BASE_PATH – podmapa weba, npr. /HotelZagi za GitHub Pages project site (zadano "/") */
const basePath = `/${(env.BASE_PATH || '/').replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '');
/** DEMO_MODE – true: noindex, bez sitemapa, robots Disallow (zadano false = produkcija) */
const demoMode = (env.DEMO_MODE || env.PUBLIC_NOINDEX) === 'true';
const cmsEnabled = env.PUBLIC_CMS_ENABLED === 'true';

// CMS (Keystatic) se učitava samo kad je uključen I instaliran – vidi docs/CMS-PLAN.md
const cmsIntegrations = [];
if (cmsEnabled) {
  try {
    // Nazivi paketa u varijablama: TypeScript ih ne traži dok CMS nije instaliran
    const pkgKeystatic = '@keystatic/astro';
    const pkgReact = '@astrojs/react';
    const [{ default: keystatic }, { default: react }] = await Promise.all([import(/* @vite-ignore */ pkgKeystatic), import(/* @vite-ignore */ pkgReact)]);
    cmsIntegrations.push(react(), keystatic());
  } catch {
    console.warn('[cms] PUBLIC_CMS_ENABLED=true, ali Keystatic nije instaliran (npm i @keystatic/core @keystatic/astro @astrojs/react react react-dom).');
  }
}

// Sitemap samo u produkciji; hreflang veze iz konfiguracije jezika i lokaliziranih slugova
const sitemapIntegration = sitemap({
  // Stranica rezervacije (noindex) i 404 nisu u sitemapu
  filter: (page) => {
    const m = matchPath(new URL(page).pathname, basePath);
    return !!m && m.key !== 'booking';
  },
  serialize(item) {
    const m = matchPath(new URL(item.url).pathname, basePath);
    if (m) {
      const abs = (/** @type {string} */ locale) => `${site}${basePath}${localePath(m.key, locale)}`;
      item.links = [
        ...enabledLocales.map((l) => ({ lang: l.hreflang, url: abs(l.code) })),
        { lang: 'x-default', url: abs(defaultLocale) },
      ];
    }
    return item;
  },
});

console.log(`[config] site=${site} base=${basePath || '/'} demo=${demoMode}`);

export default defineConfig({
  site,
  base: basePath || '/',
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
  integrations: [...(demoMode ? [] : [sitemapIntegration]), ...cmsIntegrations],
  vite: {
    // Varijable bez PUBLIC_ prefiksa prenose se u kod izričito (src/config/site.ts)
    define: {
      'import.meta.env.SITE_URL': JSON.stringify(site),
      'import.meta.env.DEMO_MODE': JSON.stringify(String(demoMode)),
    },
  },
});
