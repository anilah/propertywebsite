import { useState } from 'react';
import { tradiesApi, type Tradie } from '../../services/api';
import { trackEvent } from '../analytics/GoogleAnalytics';
import { trackMetaLead } from '../analytics/metaPixel';
import { TradieEnquireModal, type TradieEnquirePayload } from './TradieEnquireModal';

/** "Papatoetoe, Otahuhu · Manukau City, Auckland" or "All of Auckland" */
export function tradieAreaLabel(tradie: Pick<Tradie, 'region' | 'district' | 'suburbs'>): string {
  if (!tradie.region) return 'New Zealand wide';
  if (!tradie.district) return `All of ${tradie.region}`;
  const place = `${tradie.district}, ${tradie.region}`;
  if (tradie.suburbs.length === 0) return place;
  const shown = tradie.suburbs.slice(0, 3).join(', ');
  const more = tradie.suburbs.length > 3 ? ` +${tradie.suburbs.length - 3} more` : '';
  return `${shown}${more} · ${place}`;
}

export function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('') || '?'
  );
}

export function TradieAvatar({ tradie, size = 56 }: { tradie: Pick<Tradie, 'photoUrl' | 'businessName'>; size?: number }) {
  const style = { width: size, height: size };
  if (tradie.photoUrl) {
    return (
      <img
        src={tradie.photoUrl}
        alt={tradie.businessName}
        style={style}
        className="shrink-0 rounded-full object-cover ring-2 ring-white shadow"
      />
    );
  }
  return (
    <span
      style={{ ...style, fontSize: Math.round(size * 0.36) }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white ring-2 ring-white shadow"
      aria-hidden="true"
    >
      {initialsOf(tradie.businessName)}
    </span>
  );
}

/** Work gallery URLs for cards — workImages first, then profile photo. */
export function tradieCardImages(tradie: Pick<Tradie, 'id' | 'workImages' | 'photoUrl'>): string[] {
  const work = (tradie.workImages ?? []).filter(Boolean);
  if (work.length > 0) return work;
  if (tradie.photoUrl) return [tradie.photoUrl];
  return [`https://picsum.photos/seed/tradie-${tradie.id}/800/600`];
}

/**
 * Enquire CTA (same idea as listing Enquire — no public phone / Call / WhatsApp).
 */
export function TradieEnquireButton({
  tradie,
  compact = false,
  className = '',
}: {
  tradie: Pick<Tradie, 'id' | 'businessName' | 'categories'>;
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const base = compact
    ? 'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors'
    : 'w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold transition-colors';

  const handleSubmit = async (payload: TradieEnquirePayload) => {
    setSending(true);
    setError(null);
    try {
      await tradiesApi.enquire(tradie.id, payload);
      trackEvent('tradie_enquiry', {
        tradie_id: tradie.id,
        tradie_name: tradie.businessName,
        category: tradie.categories[0] ?? '',
        intent: payload.intent,
      });
      trackMetaLead();
      setSent(true);
      setOpen(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not send enquiry. Please try again.';
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {sent ? (
        <p className={`text-center text-sm font-medium text-green-700 ${className}`}>
          Enquiry sent — they’ll be in touch soon.
        </p>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className={`${base} bg-primary-600 text-white hover:bg-primary-700 ${className}`}
        >
          Enquire
        </button>
      )}
      <TradieEnquireModal
        isOpen={open}
        businessName={tradie.businessName}
        sending={sending}
        error={error}
        onClose={() => {
          if (!sending) {
            setOpen(false);
            setError(null);
          }
        }}
        onSubmit={(p) => void handleSubmit(p)}
      />
    </>
  );
}

/** @deprecated Use TradieEnquireButton — public phone is no longer exposed. */
export const TradieContactButtons = TradieEnquireButton;
