import { Listing } from '../types';

/**
 * Format price for sale listings
 */
export function formatSalePrice(listing: Listing): string {
  if (listing.priceNegotiable) {
    return 'Price by negotiation';
  }
  if (listing.price) {
    return `$${listing.price.toLocaleString('en-NZ')}`;
  }
  return 'Price on application';
}

/**
 * Format rent per week for rental listings
 */
export function formatRent(listing: Listing): string {
  if (listing.rentPerWeek) {
    return `$${listing.rentPerWeek.toLocaleString('en-NZ')} /wk`;
  }
  return 'Rent on application';
}

/**
 * Short area line (suburb + district). Skips empty parts so we never show ", Auckland City".
 */
export function formatAddress(location: { region?: string; district?: string; suburb?: string }): string {
  return [location.suburb, location.district]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)
    .join(', ');
}

function normalizeAddressPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when `part` is already covered by text already in the address. */
function addressPartRedundant(part: string, existing: string): boolean {
  const p = normalizeAddressPart(part);
  const e = normalizeAddressPart(existing);
  if (!p || !e) return false;
  if (e.includes(p)) return true;
  const tokens = p.split(' ').filter((t) => t.length > 1);
  if (tokens.length === 0) return false;
  const hits = tokens.filter((t) => e.includes(t)).length;
  // "Auckland City" vs "... Auckland ..." / "... Manukau City ..."
  return hits >= Math.ceil(tokens.length * 0.6);
}

/**
 * Card / list location line — prefers street address, then suburb/district (deduped).
 */
export function formatListingLocationLine(
  listing: Pick<Listing, 'location' | 'streetAddress'>
): string {
  const street = (listing.streetAddress || '').trim().replace(/[.\s]+$/g, '');
  const extras = [listing.location?.suburb, listing.location?.district, listing.location?.region]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean);

  const parts: string[] = [];
  for (const part of [street, ...extras]) {
    if (!part) continue;
    const assembled = parts.join(', ');
    if (assembled && addressPartRedundant(part, assembled)) continue;
    parts.push(part);
  }
  return parts.join(', ');
}

/**
 * Full street-style address for detail pages / maps.
 * Dedupes when streetAddress already contains suburb/city/country (common after geocode paste).
 */
export function formatFullAddress(
  listing: Pick<Listing, 'location' | 'streetAddress' | 'city' | 'postalCode'>
): string {
  const { location, streetAddress, city, postalCode } = listing;
  const street = (streetAddress || '').trim().replace(/[.\s]+$/g, '');

  const candidates = [
    street,
    location?.suburb,
    location?.district,
    // Ignore mistaken city values like "New Zealand"
    city && !/^new\s*zealand$/i.test(city.trim()) ? city : undefined,
    location?.region,
    postalCode,
  ]
    .map((p) => (typeof p === 'string' ? p.trim().replace(/[.\s]+$/g, '') : ''))
    .filter(Boolean);

  const parts: string[] = [];
  for (const part of candidates) {
    const assembled = parts.join(', ');
    if (assembled && addressPartRedundant(part, assembled)) continue;
    parts.push(part);
  }
  return parts.join(', ');
}

/** e.g. 2 full baths + 1 half → "2.5 bathrooms" */
export function formatBathroomLabel(listing: Pick<Listing, 'bathrooms' | 'halfBathrooms'>): string {
  const full = listing.bathrooms ?? 0;
  const half = listing.halfBathrooms ?? 0;
  const n = full + half * 0.5;
  if (n <= 0) return '';
  const label = n === 1 ? 'bathroom' : 'bathrooms';
  return `${Number.isInteger(n) ? n : n.toFixed(1)} ${label}`;
}

/**
 * Format date as relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Check if listing is new (listed within last 7 days)
 */
export function isNewListing(listedDate: string): boolean {
  const date = new Date(listedDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

