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
 * Short area line (suburb + district)
 */
export function formatAddress(location: { region: string; district: string; suburb: string }): string {
  return `${location.suburb}, ${location.district}`;
}

/**
 * Full street-style address for detail pages / maps
 */
export function formatFullAddress(
  listing: Pick<Listing, 'location' | 'streetAddress' | 'city' | 'postalCode'>
): string {
  const { location, streetAddress, city, postalCode } = listing;
  const tail = [location.suburb, location.district, city, location.region, postalCode, 'New Zealand'].filter(
    Boolean
  );
  if (streetAddress?.trim()) {
    return `${streetAddress.trim()}, ${tail.join(', ')}`;
  }
  return tail.join(', ');
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

