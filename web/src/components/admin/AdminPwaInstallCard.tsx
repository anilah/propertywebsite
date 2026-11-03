import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useSiteConfig } from '../../context/SiteConfigContext';

const PROD_ORIGIN = 'https://kaboohomes.com';

function resolveAppUrl(): string {
  if (typeof window === 'undefined') return PROD_ORIGIN;
  const origin = window.location.origin.replace(/\/$/, '');
  // Local / preview builds still point staff at the live installable app
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return PROD_ORIGIN;
  return origin;
}

/**
 * QR + install steps so admins can put the Kaboo Homes PWA on phones.
 */
export function AdminPwaInstallCard({ compact = false }: { compact?: boolean }) {
  const { config } = useSiteConfig();
  const [appUrl] = useState(() => resolveAppUrl());
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(appUrl, {
      width: 280,
      margin: 2,
      color: { dark: '#0d5c63', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [appUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const siteName = config.siteName || 'Kaboo Homes';

  return (
    <section
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${
        compact ? '' : 'shadow-sm'
      }`}
    >
      <div className="bg-gradient-to-r from-[#0d5c63] to-[#0a4a50] px-5 py-4 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200">
          Mobile app
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight">Install {siteName} on a phone</h2>
        <p className="mt-1 text-sm text-teal-100/90">
          Scan the QR code, then add the site to the home screen for the full PWA experience.
        </p>
      </div>

      <div
        className={`p-5 grid gap-6 ${
          compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-[auto_1fr] md:items-start'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${appUrl}`}
                className="h-44 w-44 sm:h-52 sm:w-52"
                width={208}
                height={208}
              />
            ) : (
              <div className="flex h-44 w-44 sm:h-52 sm:w-52 items-center justify-center text-sm text-gray-400">
                Generating QR…
              </div>
            )}
          </div>
          <p className="max-w-[14rem] text-center text-xs text-gray-500 break-all font-mono">{appUrl}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`${siteName.replace(/\s+/g, '-').toLowerCase()}-pwa-qr.png`}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Download QR
              </a>
            )}
          </div>
        </div>

        <div className="space-y-5 min-w-0">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0d5c63]/10 text-[11px] font-bold text-[#0d5c63]">
                iOS
              </span>
              iPhone / iPad (Safari)
            </h3>
            <ol className="mt-2 space-y-1.5 text-sm text-gray-600 list-decimal list-inside">
              <li>Scan the QR code (or open the link) in <strong>Safari</strong>.</li>
              <li>Tap the Share button (square with an arrow).</li>
              <li>Scroll and tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> — open the new icon for the app shell.</li>
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0d5c63]/10 text-[11px] font-bold text-[#0d5c63]">
                And
              </span>
              Android (Chrome)
            </h3>
            <ol className="mt-2 space-y-1.5 text-sm text-gray-600 list-decimal list-inside">
              <li>Scan the QR code (or open the link) in <strong>Chrome</strong>.</li>
              <li>Tap the menu (⋮) → <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
              <li>Confirm install, then open from the home screen.</li>
            </ol>
          </div>

          <div className="rounded-lg border border-teal-100 bg-teal-50/70 px-3.5 py-3 text-sm text-teal-900">
            <p className="font-semibold">Tip for agents</p>
            <p className="mt-0.5 text-teal-800/90 text-[13px] leading-snug">
              After install, the bottom menu (Buy · Rent · Flatmates · More) appears like a native app.
              Share this QR with your team so everyone uses the same home-screen shortcut.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
