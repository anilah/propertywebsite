import { cacheGet, cacheSet } from '../parcelInfo/cache.js';
import { fetchInZoneSchools, fetchNearbySchools } from './arcgisAdapter.js';
import type { SchoolZonesResponse } from './types.js';

// MOE school directory / zone data changes infrequently (nightly at most) — cache generously
// to avoid hammering the upstream ArcGIS service on every listing page view.
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

function cacheKey(lat: number, lng: number): string {
  // Round to ~10 m precision to share cache hits between near-duplicate lookups.
  return `sz:${lat.toFixed(4)}:${lng.toFixed(4)}`;
}

export async function getSchoolZones(lat: number, lng: number): Promise<SchoolZonesResponse> {
  const key = cacheKey(lat, lng);
  const cached = cacheGet<SchoolZonesResponse>(key);
  if (cached) return { ...cached, cachedAt: cached.cachedAt ?? new Date().toISOString() };

  const [inZone, nearby] = await Promise.all([fetchInZoneSchools(lat, lng), fetchNearbySchools(lat, lng)]);

  const response: SchoolZonesResponse = { lat, lng, inZone, nearby };
  cacheSet(key, response, TTL_MS);
  return response;
}
