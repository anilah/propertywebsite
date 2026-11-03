export type AdapterStatus = 'ok' | 'no_data' | 'error';

export interface AdapterResult<T> {
  status: AdapterStatus;
  data: T | null;
  source: string;
  message?: string;
  fetchedAt: string;
}

export interface SchoolInfo {
  id: number;
  name: string;
  address?: string;
  /** e.g. "Full Primary", "Secondary (Year 9-15)", "Intermediate" */
  type?: string;
  roll?: number;
  /** Ministry of Education Equity Index (replaced deciles) — lower = more socio-economic barriers. */
  equityIndex?: number;
  phone?: string;
  website?: string;
  hasEnrolmentScheme?: boolean;
}

export interface NearbySchool extends SchoolInfo {
  distanceKm: number;
}

export interface InZoneSchool extends SchoolInfo {
  /** ISO date the enrolment zone took effect, if known. */
  effectiveDate?: string;
}

export interface SchoolZonesResponse {
  lat: number;
  lng: number;
  inZone: AdapterResult<InZoneSchool[]>;
  nearby: AdapterResult<NearbySchool[]>;
  cachedAt?: string;
}
