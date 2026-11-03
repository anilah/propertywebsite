import type { EnquiryAttribution } from '../services/api';

/**
 * Tracked links for social posts / ads.
 * utm_* records where the lead came from (and unlocks “You can see more”).
 * Visitors land on the listing normally and open the enquiry form themselves.
 */
export const LEAD_LINK_PLATFORMS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'other', label: 'Other' },
] as const;

const SOURCE_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  google: 'Google',
  email: 'Email',
  other: 'Other',
};

export function leadSourceLabel(source: string | null | undefined): string {
  if (!source) return 'Direct';
  return SOURCE_LABELS[source.toLowerCase()] ?? source;
}

export function buildEnquiryLink(baseUrl: string, source: string, campaign?: string): string {
  try {
    const u = new URL(baseUrl, window.location.origin);
    u.searchParams.set('utm_source', source);
    u.searchParams.set('utm_medium', 'social');
    if (campaign) u.searchParams.set('utm_campaign', campaign);
    return u.toString();
  } catch {
    return baseUrl;
  }
}

const storageKey = (listingId: string) => `enquiry-attribution:${listingId}`;

/**
 * Remember where this visitor came from for the listing (per browser tab session), so an
 * enquiry sent later in the same session is still attributed.
 */
export function captureLeadAttribution(listingId: string, params: URLSearchParams, referrer: string): void {
  try {
    const source = params.get('utm_source')?.trim();
    let externalReferrer = '';
    if (referrer) {
      try {
        if (new URL(referrer).host !== window.location.host) externalReferrer = referrer;
      } catch {
        externalReferrer = '';
      }
    }
    if (!source && (!externalReferrer || sessionStorage.getItem(storageKey(listingId)))) return;

    const attribution: EnquiryAttribution = {
      source: source || undefined,
      medium: params.get('utm_medium')?.trim() || undefined,
      campaign: params.get('utm_campaign')?.trim() || undefined,
      referrer: externalReferrer || undefined,
    };
    sessionStorage.setItem(storageKey(listingId), JSON.stringify(attribution));
  } catch {
    /* sessionStorage unavailable (private mode) */
  }
}

export function getLeadAttribution(listingId: string): EnquiryAttribution | undefined {
  try {
    const raw = sessionStorage.getItem(storageKey(listingId));
    return raw ? (JSON.parse(raw) as EnquiryAttribution) : undefined;
  } catch {
    return undefined;
  }
}

/** True when the visitor arrived via a tracked ad / social post link for this listing. */
export function cameFromAdLink(listingId: string): boolean {
  const attr = getLeadAttribution(listingId);
  if (!attr) return false;
  if (attr.source || attr.campaign) return true;
  return (attr.medium || '').toLowerCase() === 'social';
}
