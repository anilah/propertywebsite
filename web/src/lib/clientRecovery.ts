/**
 * Automatic client recovery from a stuck / stale service worker.
 *
 * Root cause we hit in prod: an old SW precached index.html and kept serving the
 * mobile app shell to desktop users long after deploys. Users should never need
 * DevTools → Unregister.
 *
 * Strategy:
 * 1. Desktop browser → always unregister SW + clear Cache Storage (website UI only)
 * 2. Any client → force SW update checks (updateViaCache: 'none')
 * 3. If network index.html references a different JS bundle than this document,
 *    scrub SW/caches and reload once (stale shell detector)
 */

export const CLIENT_REVISION = '2026-10-30-sw-quiet';

const REVISION_KEY = 'kaboo_client_revision';
const RELOAD_FLAG = `kaboo_recovery_reload_${CLIENT_REVISION}`;

export function isPhoneBrowserFromUa(): boolean {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPod/i.test(ua)) return true;
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return true;
  return false;
}

export function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function hasDesktopPointer(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Desktop/laptop browser — mouse/trackpad, or non-phone UA. */
export function isDesktopWebBrowser(): boolean {
  if (isStandaloneDisplay()) return false;
  if (hasDesktopPointer()) return true;
  return !isPhoneBrowserFromUa();
}

function markHtml(): void {
  const root = document.documentElement;
  if (isStandaloneDisplay()) {
    root.setAttribute('data-kaboo-standalone', '1');
    root.classList.add('kaboo-app-shell');
    root.classList.remove('kaboo-web');
  } else if (isPhoneBrowserFromUa()) {
    root.classList.add('kaboo-app-shell');
    root.classList.remove('kaboo-web');
    root.removeAttribute('data-kaboo-standalone');
  } else {
    root.classList.add('kaboo-web');
    root.classList.remove('kaboo-app-shell');
    root.removeAttribute('data-kaboo-standalone');
  }
}

async function unregisterAll(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  const regs = await navigator.serviceWorker.getRegistrations();
  const had = regs.length > 0 || Boolean(navigator.serviceWorker.controller);
  await Promise.all(regs.map((r) => r.unregister()));
  return had;
}

async function clearCaches(): Promise<void> {
  if (!('caches' in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.map((k) => caches.delete(k)));
}

function reloadOnce(): void {
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, '1');
  try {
    localStorage.setItem(REVISION_KEY, CLIENT_REVISION);
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  url.searchParams.set('_kr', CLIENT_REVISION);
  window.location.replace(url.toString());
}

function currentScriptHash(): string | null {
  const el = document.querySelector('script[src*="assets/index-"]');
  const src = el?.getAttribute('src') || '';
  const m = src.match(/assets\/index-([A-Za-z0-9_-]+)\.js/);
  return m?.[1] ?? null;
}

async function networkIndexHash(): Promise<string | null> {
  try {
    // same-origin so cookies work; Sec-Fetch-Mode stays "cors" so CF won't Clear-Site-Data
    const res = await fetch(`/?_kh_probe=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { Accept: '*/*' },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/assets\/index-([A-Za-z0-9_-]+)\.js/);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Phone/PWA only — ask for a newer SW. Never call on desktop (unregister race → InvalidStateError). */
async function forceSwUpdateCheck(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  if (isDesktopWebBrowser()) return;
  try {
    await fetch(`/sw.js?_=${Date.now()}`, { cache: 'no-store', credentials: 'same-origin' });
  } catch {
    /* ignore */
  }
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs.map(async (r) => {
        try {
          if (r.installing || r.waiting || r.active) {
            await r.update();
          }
        } catch {
          /* InvalidStateError when unregistering in parallel */
        }
      })
    );
  } catch {
    /* ignore */
  }
}

/**
 * Run before React mounts. Safe to call multiple times.
 * May trigger a single controlled reload.
 */
export async function runAutomaticClientRecovery(): Promise<void> {
  markHtml();

  const desktop = isDesktopWebBrowser();
  const seen = localStorage.getItem(REVISION_KEY);
  const revisionChanged = seen !== CLIENT_REVISION;

  // 1) Desktop website: never keep a controlling SW (no update() — avoids InvalidStateError)
  if (desktop) {
    const hadSw = await unregisterAll();
    await clearCaches();
    if (revisionChanged) {
      try {
        localStorage.removeItem('kaboo_site_config');
        localStorage.removeItem('kaboo_site_config_v2');
      } catch {
        /* ignore */
      }
    }
    if (hadSw || revisionChanged) {
      localStorage.setItem(REVISION_KEY, CLIENT_REVISION);
      reloadOnce();
      return;
    }
    return;
  }

  // 2) Phone / PWA: soft SW update check
  await forceSwUpdateCheck();

  // 3) Stale-shell detector (SW served an old index.html)
  if (!import.meta.env.DEV) {
    const local = currentScriptHash();
    const remote = await networkIndexHash();
    if (local && remote && local !== remote) {
      await unregisterAll();
      await clearCaches();
      localStorage.setItem(REVISION_KEY, CLIENT_REVISION);
      reloadOnce();
      return;
    }
  }

  if (revisionChanged) {
    localStorage.setItem(REVISION_KEY, CLIENT_REVISION);
  }
}

/**
 * Phone / installed-PWA only — register SW with HTTP cache bypass.
 * Desktop must not call this.
 */
export async function registerPhoneServiceWorker(): Promise<void> {
  if (isDesktopWebBrowser()) return;
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    await reg.update().catch(() => undefined);
  } catch {
    /* ignore */
  }
}
