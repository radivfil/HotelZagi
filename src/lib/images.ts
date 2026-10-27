import manifest from '@/data/images.json';

export interface ImageInfo {
  width: number;
  height: number;
  widths: number[];
  gen: string;
}

const images = manifest as Record<string, ImageInfo>;

/** Podaci o slici iz manifesta (generira ga scripts/optimize-images.mjs). */
export function imageInfo(src: string): ImageInfo | undefined {
  return images[src];
}

export function srcset(src: string, format: 'avif' | 'webp'): string | undefined {
  const info = images[src];
  if (!info) return undefined;
  return info.widths.map((w) => `${info.gen}-${w}.${format} ${w}w`).join(', ');
}

/** Najveća generirana WebP inačica – za lightbox i OG slike. */
export function largestVariant(src: string, max = 1920): string {
  const info = images[src];
  if (!info) return src;
  const w = [...info.widths].reverse().find((x) => x <= max) ?? info.widths[0];
  return `${info.gen}-${w}.webp`;
}
