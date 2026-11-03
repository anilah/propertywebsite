import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  isDesktopWebBrowser,
  registerPhoneServiceWorker,
} from '../../lib/clientRecovery';

/**
 * Desktop: never keep a service worker (prevents stale mobile shell).
 * Phone / installed PWA: auto-update SW; show a banner only if a wait is needed.
 */
export function PwaUpdatePrompt() {
  const desktop = isDesktopWebBrowser();
  const [updating, setUpdating] = useState(false);

  // vite-plugin-pwa hook — on desktop we immediately unregister anything it adds
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: !desktop,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      if (desktop) {
        void registration.unregister();
        return;
      }
      const check = () => {
        // Skip if registration was torn down (avoids InvalidStateError)
        if (!registration.active && !registration.waiting && !registration.installing) return;
        void registration.update().catch(() => {});
      };
      check();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
      window.setInterval(check, 60 * 1000);
    },
  });

  useEffect(() => {
    if (desktop) {
      void navigator.serviceWorker?.getRegistrations().then((regs) => {
        regs.forEach((r) => void r.unregister());
      });
      return;
    }
    void registerPhoneServiceWorker();
  }, [desktop]);

  const applyUpdate = async () => {
    if (updating) return;
    setUpdating(true);
    let reloaded = false;
    const reloadOnce = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker?.addEventListener('controllerchange', reloadOnce);
    try {
      await updateServiceWorker(true);
    } catch {
      /* fall through */
    }
    window.setTimeout(reloadOnce, 800);
  };

  if (desktop || !needRefresh) return null;

  return (
    <div
      className="fixed inset-x-0 z-[100] px-3 pointer-events-none bottom-[calc(4.5rem+env(safe-area-inset-bottom))] lg:bottom-4"
      role="status"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg pointer-events-auto">
        <p className="flex-1 text-sm text-slate-700">
          {updating ? 'Updating Kaboo Homes…' : 'A new version of Kaboo Homes is ready.'}
        </p>
        <button
          type="button"
          disabled={updating}
          onClick={() => void applyUpdate()}
          className="shrink-0 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-70"
        >
          {updating ? 'Updating…' : 'Update'}
        </button>
        <button
          type="button"
          disabled={updating}
          onClick={() => setNeedRefresh(false)}
          className="shrink-0 rounded-lg px-2 py-2 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          aria-label="Dismiss"
        >
          Later
        </button>
      </div>
    </div>
  );
}
