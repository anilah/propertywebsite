export type AdapterStatus = 'ok' | 'no_data' | 'needs_api_key' | 'error';

export interface AdapterResult<T> {
  status: AdapterStatus;
  data: T | null;
  source: string;
  message?: string;
  fetchedAt: string;
}

export interface ParcelInfo {
  titleReference?: string;
  appellation?: string;
  landAreaSqm?: number;
  parcelIntent?: string;
}

export interface SeismicContext {
  /** Count of quakes with MMI >= 3 within radiusKm of the point in the past 365 days. */
  recentLocalQuakes: number;
  /** Radius used for the local count, in kilometres. */
  radiusKm: number;
  closest?: {
    mmi: number;
    magnitude: number;
    depthKm: number;
    timeUtc: string;
    distanceKm: number;
  };
}

export interface ParcelInfoResponse {
  lat: number;
  lng: number;
  parcel: AdapterResult<ParcelInfo>;
  seismic: AdapterResult<SeismicContext>;
  /** Reserved for future per-council flood / liquefaction adapters. */
  hazards: AdapterResult<Record<string, never>>;
  cachedAt?: string;
}
