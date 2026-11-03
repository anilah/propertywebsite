import { useEffect } from 'react';

export type AppToastTone = 'success' | 'error' | 'info';

export type AppToastState = {
  title: string;
  message?: string;
  tone?: AppToastTone;
} | null;

/**
 * Themed admin toast — matches Kaboo primary / success language (not browser alerts).
 */
export function AppToast({
  toast,
  onClose,
  durationMs = 5500,
}: {
  toast: AppToastState;
  onClose: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(t);
  }, [toast, onClose, durationMs]);

  if (!toast) return null;

  const tone = toast.tone ?? 'success';
  const shell =
    tone === 'error'
      ? 'from-red-600 to-red-700'
      : tone === 'info'
        ? 'from-primary-600 to-primary-700'
        : 'from-emerald-600 to-emerald-700';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 sm:top-24 right-2 sm:right-4 left-2 sm:left-auto z-[80] max-w-sm mx-auto sm:mx-0"
    >
      <div
        className={`bg-gradient-to-r ${shell} text-white px-4 sm:px-5 py-3.5 rounded-2xl shadow-xl border border-white/10 animate-slide-in flex items-start gap-3`}
      >
        <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
          {tone === 'error' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : tone === 'info' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm sm:text-base leading-snug">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-xs sm:text-sm text-white/85 leading-relaxed whitespace-pre-line">
              {toast.message}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
