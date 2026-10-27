/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Izvor weba (origin), npr. https://radivfil.github.io – postavlja astro.config.mjs */
  readonly SITE_URL?: string;
  /** "true" = demo objava (noindex, bez sitemapa) – postavlja astro.config.mjs */
  readonly DEMO_MODE?: string;
}
