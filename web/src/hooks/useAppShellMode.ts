import { useEffect, useState } from 'react';

/**
 * App chrome (bottom tabs + MobileHomeSearch) ONLY for:
 * - Installed PWA (standalone), or
 * - Phone UA that does NOT have a mouse/trackpad
 *
 * Desktop Chrome (even a narrow window) always has (hover:hover) + (pointer:fine)
 * → website FilterBar. Window width is irrelevant.
 */
export function useAppShellMode(): boolean {
  const [appShell, setAppShell] = useState(() => {
    if (typeof window === 'undefined') return false;
    return computeAppShell();
  });

  useEffect(() => {
    const update = () => {
      const next = computeAppShell();
      setAppShell(next);
      applyHtmlShellClass(next);
    };
    const mqStandalone = window.matchMedia('(display-mode: standalone)');
    const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
    mqStandalone.addEventListener('change', update);
    mqFine.addEventListener('change', update);
    update();
    return () => {
      mqStandalone.removeEventListener('change', update);
      mqFine.removeEventListener('change', update);
    };
  }, []);

  return appShell;
}

export function isInstalledPwa(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function isPhoneBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iPhone|iPod/i.test(ua)) return true;
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return true;
  return false;
}

/** True on desktop/laptop — mouse or trackpad present. */
export function hasDesktopPointer(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function isDesktopWebBrowser(): boolean {
  return hasDesktopPointer() || (!isPhoneBrowser() && !isInstalledPwa());
}

function applyHtmlShellClass(appShell: boolean) {
  const root = document.documentElement;
  root.classList.toggle('kaboo-app-shell', appShell);
  root.classList.toggle('kaboo-web', !appShell);
  if (isInstalledPwa()) root.setAttribute('data-kaboo-standalone', '1');
  else root.removeAttribute('data-kaboo-standalone');
}

function computeAppShell(): boolean {
  const q = new URLSearchParams(window.location.search);
  if (q.get('mobileShell') === '1') return true;
  if (q.get('mobileShell') === '0') return false;

  // Installed home-screen app
  if (isInstalledPwa()) return true;

  // Desktop/laptop with mouse or trackpad → never app shell
  if (hasDesktopPointer()) return false;

  // Touch phone browser
  return isPhoneBrowser();
}
