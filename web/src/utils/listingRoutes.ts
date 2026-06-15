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

/** Build search (results) URL for a listing type */
export function searchPath(listingType: ListingType): string {
  const type = listingType === 'SALE' ? 'sale' : 'rent';
  return `${BASE}/${type}/search`;
}

/** Build listing detail URL with location slugs (SEO-friendly, like Trade Me) */
export function listingDetailPath(
  listingType: ListingType,
  id: string,
  location: { region: string; district: string; suburb: string }
): string {
  const type = listingType === 'SALE' ? 'sale' : 'rent';
  const region = toSlug(location.region) || 'new-zealand';
  const district = toSlug(location.district) || 'region';
  const suburb = toSlug(location.suburb) || 'area';
  return `${BASE}/${type}/${region}/${district}/${suburb}/listing/${id}`;
}

/** Parse listing type from path (sale or rent segment) */
export function parseListingTypeFromPath(pathSegment: string): ListingType {
  return pathSegment?.toLowerCase() === 'rent' ? 'RENT' : 'SALE';
}

/** Check if path is the new property search path */
export function isPropertySearchPath(pathname: string): boolean {
  return /^\/property\/residential\/(sale|rent)\/search\/?$/.test(pathname);
}

/** Check if path is the new property listing detail path */
export function isPropertyListingDetailPath(pathname: string): boolean {
  return /^\/property\/residential\/(sale|rent)\/[^/]+\/[^/]+\/[^/]+\/listing\/[^/]+/.test(pathname);
}
