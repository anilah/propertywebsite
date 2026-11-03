/**
 * Lead-source attribution for listing enquiries.
 *
 * Social posts (Kaboo Homes publishing or manual posts) carry a tracked link like
 *   https://kaboohomes.com/listing/<id>?utm_source=facebook&utm_medium=social&utm_campaign=<campaignId>
 * The listing page records attribution; the visitor opens the enquiry form themselves.
 */

export const LEAD_SOURCES = ['facebook', 'instagram', 'tiktok', 'whatsapp', 'google', 'email', 'other'] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

const SOURCE_ALIASES: Record<string, LeadSource> = {
  facebook: 'facebook',
  fb: 'facebook',
  'm.facebook.com': 'facebook',
  'l.facebook.com': 'facebook',
  'lm.facebook.com': 'facebook',
  meta: 'facebook',
  instagram: 'instagram',
  ig: 'instagram',
  'l.instagram.com': 'instagram',
  tiktok: 'tiktok',
  tt: 'tiktok',
  whatsapp: 'whatsapp',
  wa: 'whatsapp',
  google: 'google',
  email: 'email',
  newsletter: 'email',
};

const LABELS: Record<LeadSource, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  google: 'Google',
  email: 'Email',
  other: 'Other',
};

function clip(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v ? v.slice(0, max) : null;
}

function sourceFromReferrer(referrer: string | null): LeadSource | null {
  if (!referrer) return null;
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
  if (host.includes('facebook.') || host === 'fb.com' || host === 'fb.me') return 'facebook';
  if (host.includes('instagram.')) return 'instagram';
  if (host.includes('tiktok.')) return 'tiktok';
  if (host.includes('whatsapp.') || host === 'wa.me') return 'whatsapp';
  if (host.includes('google.')) return 'google';
  return null;
}

export function normalizeLeadSource(raw: unknown, referrer?: string | null): LeadSource | null {
  const v = clip(raw, 64)?.toLowerCase();
  if (v) {
    if (SOURCE_ALIASES[v]) return SOURCE_ALIASES[v];
    return (LEAD_SOURCES as readonly string[]).includes(v) ? (v as LeadSource) : 'other';
  }
  return sourceFromReferrer(referrer ?? null);
}

export function leadSourceLabel(source: string | null | undefined): string | null {
  if (!source) return null;
  return LABELS[source as LeadSource] ?? source;
}

export interface EnquiryAttributionInput {
  source?: unknown;
  medium?: unknown;
  campaign?: unknown;
  referrer?: unknown;
}

export interface EnquiryAttribution {
  source: LeadSource | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
}

/** Sanitise attribution sent by the browser. Ignores self-referrals from our own site. */
export function parseEnquiryAttribution(input: EnquiryAttributionInput | undefined, siteHost?: string): EnquiryAttribution {
  let referrer = clip(input?.referrer, 500);
  if (referrer && siteHost) {
    try {
      if (new URL(referrer).hostname.replace(/^www\./, '') === siteHost.replace(/^www\./, '')) referrer = null;
    } catch {
      referrer = null;
    }
  }
  return {
    source: normalizeLeadSource(input?.source, referrer),
    utmMedium: clip(input?.medium, 64),
    utmCampaign: clip(input?.campaign, 128),
    referrer,
  };
}

/** Add UTM attribution params to a listing URL (keeps any existing params). */
export function withEnquiryTracking(url: string, source: LeadSource, campaign?: string | null): string {
  try {
    const u = new URL(url);
    u.searchParams.delete('enquire');
    u.searchParams.set('utm_source', source);
    u.searchParams.set('utm_medium', 'social');
    if (campaign) u.searchParams.set('utm_campaign', campaign);
    return u.toString();
  } catch {
    return url;
  }
}
