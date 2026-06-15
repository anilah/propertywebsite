import { cacheGet, cacheSet } from './cache.js';
import { fetchParcel } from './linzAdapter.js';
import { fetchSeismic } from './geonetAdapter.js';
import type { ParcelInfoResponse } from './types.js';

const TTL_MS = 60 * 60 * 1000; // 1 hour

function cacheKey(lat: number, lng: number): string {
  // Round to ~10 m precision to share cache hits between near-duplicate lookups.
  return `pi:${lat.toFixed(4)}:${lng.toFixed(4)}`;
}

export async function getParcelInfo(lat: number, lng: number): Promise<ParcelInfoResponse> {
  const key = cacheKey(lat, lng);
  const cached = cacheGet<ParcelInfoResponse>(key);
  if (cached) return { ...cached, cachedAt: cached.cachedAt ?? new Date().toISOString() };

  const [parcel, seismic] = await Promise.all([fetchParcel(lat, lng), fetchSeismic(lat, lng)]);

  const response: ParcelInfoResponse = {
    lat,
    lng,
    parcel,
    seismic,
    hazards: {
      status: 'no_data',
      data: null,
      source: 'Regional councils (per-council)',
      message: 'Flood / liquefaction overlays are regional and not yet integrated.',
      fetchedAt: new Date().toISOString(),
    },
  };

  cacheSet(key, response, TTL_MS);
  return response;
}
