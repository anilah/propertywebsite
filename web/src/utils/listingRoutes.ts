import type { ListingType } from '../types';

/**
 * Trade Me-style URL structure:
 * - Search: /property/residential/sale/search or /property/residential/rent/search
 * - Detail: /property/residential/sale/region/district/suburb/listing/id
 */

const BASE = '/property/residential';

/** Convert location part to URL slug (lowercase, spaces to hyphens) */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Map a ListingType to its URL slug */
function typeSlug(listingType: ListingType): string {
  if (listingType === 'SALE') return 'sale';
  if (listingType === 'FLATMATES') return 'flatmates';
  return 'rent';
}

/** Build search (results) URL for a listing type */
export function searchPath(listingType: ListingType): string {
  return `${BASE}/${typeSlug(listingType)}/search`;
}

/** Build listing detail URL with location slugs (SEO-friendly, like Trade Me) */
export function listingDetailPath(
  listingType: ListingType,
  id: string,
  location: { region: string; district: string; suburb: string }
): string {
  const type = typeSlug(listingType);
  const region = toSlug(location.region) || 'new-zealand';
  const district = toSlug(location.district) || 'region';
  const suburb = toSlug(location.suburb) || 'area';
  return `${BASE}/${type}/${region}/${district}/${suburb}/listing/${id}`;
}

/** Open the public listing detail page (admin preview uses the same URL while logged in). */
export function openListingPublicPage(listing: {
  id: string;
  listingType: ListingType;
  location: { region: string; district: string; suburb: string };
}): void {
  const path = listingDetailPath(listing.listingType, listing.id, listing.location);
  window.open(path, '_blank', 'noopener,noreferrer');
}

/** Parse listing type from path (sale, rent, or flatmates segment) */
export function parseListingTypeFromPath(pathSegment: string): ListingType {
  const s = pathSegment?.toLowerCase();
  if (s === 'flatmates') return 'FLATMATES';
  if (s === 'rent') return 'RENT';
  return 'SALE';
}

/** Check if path is the new property search path */
export function isPropertySearchPath(pathname: string): boolean {
  return /^\/property\/residential\/(sale|rent|flatmates)\/search\/?$/.test(pathname);
}

/** Check if path is the new property listing detail path */
export function isPropertyListingDetailPath(pathname: string): boolean {
  return /^\/property\/residential\/(sale|rent|flatmates)\/[^/]+\/[^/]+\/[^/]+\/listing\/[^/]+/.test(pathname);
}
