/**
 * SiteConfigContext
 *
 * Fetches /api/config/site once on startup and:
 *  1. Generates a full 9-shade primary color palette from the single SITE_PRIMARY_COLOR hex.
 *  2. Writes every shade as a CSS variable on <html> so ALL Tailwind `primary-*` classes
 *     automatically inherit the brand color without a rebuild.
 *  3. Optionally injects a custom favicon.
 *  4. Exposes siteName, tagline, logoUrl via useSiteConfig() hook for the Header etc.
 *
 * Per-agent extension: individual listing cards can override the strip color by reading
 * `listing.agencyBrandColor` (a future User field) and applying it via inline style.
 * No changes to this context are needed for that — it only manages site-level theming.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SiteConfig {
  siteName:               string;
  tagline:                string;
  primaryColor:           string;
  logoUrl:                string | null;
  faviconUrl:             string | null;
  heroImageUrl:           string | null;
  heroImagePosition:      string;
  logoSize:               number;   // logo height in px (32–96)
  /** Pre-filled WhatsApp/SMS enquiry message. Placeholders: {{listingId}}, {{suburb}}, {{headline}}, {{url}} */
  contactMessageTemplate: string;
}

const DEFAULT_CONTACT_MESSAGE_TEMPLATE =
  "Hi, I'm interested in listing #{{listingId}} ({{suburb}}). Could you please provide more details? {{url}}";

const DEFAULT_CONFIG: SiteConfig = {
  siteName:               'Kaboo Homes',
  tagline:                "New Zealand's Premier Property Portal",
  primaryColor:           '#0d5c63',
  // Horizontal wordmark (public/). Do not use the square CloudFront icon here —
  // that asset is 1024² and renders as a tiny black box in the header.
  logoUrl:                '/logo_kaboohomes.png',
  faviconUrl:             null,
  heroImageUrl:           null,
  heroImagePosition:      '50% 50%',
  logoSize:               48,
  contactMessageTemplate: DEFAULT_CONTACT_MESSAGE_TEMPLATE,
};

// Bump suffix when cached shape/semantics change (pairs with clientCleanup revision).
const CACHE_KEY = 'kaboo_site_config_v2';

// ── Color palette generation ──────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6;               break;
      case b: h = ((r - g) / d + 4) / 6;               break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Generates a 9-shade palette (50–900) from a single brand hex.
 * Strategy: keep hue + saturation of the input; map shade to a fixed lightness scale.
 * This mirrors how Tailwind's default palettes are constructed.
 */
function generatePalette(hex: string): Record<number, string> {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return {};
  const [h, s] = hexToHsl(hex);
  // Lightness targets per shade — tuned to produce visually balanced output
  const lightnessMap: Record<number, number> = {
     50: 97,
    100: 94,
    200: 88,
    300: 79,
    400: 68,
    500: 57,
    600: 48,
    700: 39,
    800: 31,
    900: 23,
  };
  const palette: Record<number, string> = {};
  for (const [shade, lightness] of Object.entries(lightnessMap)) {
    palette[Number(shade)] = hslToHex(h, s, lightness);
  }
  return palette;
}

function applyPaletteToRoot(primaryColor: string) {
  const palette = generatePalette(primaryColor);
  const root = document.documentElement;
  for (const [shade, hex] of Object.entries(palette)) {
    root.style.setProperty(`--color-primary-${shade}`, hex);
  }
}

function injectFavicon(url: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

// ── Context ───────────────────────────────────────────────────────────────────

interface SiteConfigContextValue {
  config: SiteConfig;
  refresh: () => void;
}

const SiteConfigContext = createContext<SiteConfigContextValue>({
  config: DEFAULT_CONFIG,
  refresh: () => {},
});

export function useSiteConfig(): SiteConfigContextValue {
  return useContext(SiteConfigContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';
const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

function loadCached(): SiteConfig {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SiteConfig>;
      const cleaned = Object.fromEntries(
        Object.entries(parsed).filter(([, v]) => v !== null && v !== undefined)
      ) as Partial<SiteConfig>;
      const merged: SiteConfig = { ...DEFAULT_CONFIG, ...cleaned };
      if (!merged.logoUrl) merged.logoUrl = DEFAULT_CONFIG.logoUrl;
      return merged;
    }
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
}

function saveCache(config: SiteConfig) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(config)); } catch { /* ignore */ }
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage cache (or defaults) — zero flash on repeat visits
  const [config, setConfig] = useState<SiteConfig>(() => loadCached());

  function fetchAndApply() {
    fetch(`${API_BASE_URL}/config/site`)
      .then((r) => r.json())
      .then((data: Partial<SiteConfig>) => {
        // API may return null for unset branding fields — don't wipe defaults
        // (especially logoUrl) or the header logo disappears locally.
        const cleaned = Object.fromEntries(
          Object.entries(data).filter(([, v]) => v !== null && v !== undefined)
        ) as Partial<SiteConfig>;
        const resolved: SiteConfig = { ...DEFAULT_CONFIG, ...cleaned };
        if (!resolved.logoUrl) resolved.logoUrl = DEFAULT_CONFIG.logoUrl;
        setConfig(resolved);
        saveCache(resolved);
        applyPaletteToRoot(resolved.primaryColor);
        if (resolved.faviconUrl) injectFavicon(resolved.faviconUrl);
        document.title = resolved.siteName;
      })
      .catch(() => {
        // Network/API failure — cached/default config remains; app stays functional
      });
  }

  useEffect(() => {
    // Apply branding immediately from whatever we loaded (cache or default)
    applyPaletteToRoot(config.primaryColor);
    if (config.faviconUrl) injectFavicon(config.faviconUrl);
    document.title = config.siteName;

    fetchAndApply();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SiteConfigContext.Provider value={{ config, refresh: fetchAndApply }}>
      {children}
    </SiteConfigContext.Provider>
  );
}
