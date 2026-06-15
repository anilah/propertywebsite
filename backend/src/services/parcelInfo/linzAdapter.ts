import type { AdapterResult, ParcelInfo } from './types.js';

// LINZ Data Service — NZ Primary Parcels (layer 50804) via WFS GetFeature.
// Free tier requires a personal API key from https://data.linz.govt.nz/.
//
// Endpoint reference:
//   https://data.linz.govt.nz/services;key={KEY}/wfs
//   ?service=WFS&version=2.0.0&request=GetFeature
//   &typeNames=layer-50804
//   &outputFormat=json
//   &CQL_FILTER=INTERSECTS(shape, POINT(lng lat))
const LINZ_PARCELS_LAYER = 'layer-50804';

function nowIso(): string {
  return new Date().toISOString();
}

interface LinzFeature {
  properties: Record<string, unknown>;
}

interface LinzFeatureCollection {
  features?: LinzFeature[];
}

function pickString(props: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = props[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

function pickNumber(props: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = props[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  }
  return undefined;
}

export async function fetchParcel(lat: number, lng: number): Promise<AdapterResult<ParcelInfo>> {
  const key = process.env.LINZ_API_KEY?.trim();
  if (!key) {
    return {
      status: 'needs_api_key',
      data: null,
      source: 'LINZ Data Service',
      message: 'Set LINZ_API_KEY in backend env to enable parcel lookups (free signup at data.linz.govt.nz).',
      fetchedAt: nowIso(),
    };
  }

  const url = new URL(`https://data.linz.govt.nz/services;key=${encodeURIComponent(key)}/wfs`);
  url.searchParams.set('service', 'WFS');
  url.searchParams.set('version', '2.0.0');
  url.searchParams.set('request', 'GetFeature');
  url.searchParams.set('typeNames', LINZ_PARCELS_LAYER);
  url.searchParams.set('outputFormat', 'json');
  url.searchParams.set('srsName', 'EPSG:4326');
  url.searchParams.set('count', '1');
  // CQL_FILTER expects POINT(lng lat) in EPSG:4326.
  url.searchParams.set('CQL_FILTER', `INTERSECTS(shape, POINT(${lng} ${lat}))`);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      // 6s upper bound — LINZ WFS is typically fast but can be slow under load.
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      return {
        status: 'error',
        data: null,
        source: 'LINZ Data Service',
        message: `LINZ WFS returned HTTP ${res.status}`,
        fetchedAt: nowIso(),
      };
    }
    const fc = (await res.json()) as LinzFeatureCollection;
    const feature = fc.features?.[0];
    if (!feature) {
      return {
        status: 'no_data',
        data: null,
        source: 'LINZ Data Service',
        message: 'No primary parcel found at this point.',
        fetchedAt: nowIso(),
      };
    }
    const p = feature.properties || {};
    const parcel: ParcelInfo = {
      titleReference: pickString(p, 'titles', 'title_no'),
      appellation: pickString(p, 'appellation'),
      landAreaSqm: pickNumber(p, 'land_district_area', 'survey_area', 'calc_area'),
      parcelIntent: pickString(p, 'parcel_intent', 'topology_type'),
    };
    return {
      status: 'ok',
      data: parcel,
      source: 'LINZ Data Service',
      fetchedAt: nowIso(),
    };
  } catch (err) {
    return {
      status: 'error',
      data: null,
      source: 'LINZ Data Service',
      message: err instanceof Error ? err.message : 'Unknown LINZ error',
      fetchedAt: nowIso(),
    };
  }
}
