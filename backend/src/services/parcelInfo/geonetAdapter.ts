import type { AdapterResult, SeismicContext } from './types.js';

// GeoNet quake API — open, no key.
// Reference: https://api.geonet.org.nz/
//   GET https://api.geonet.org.nz/quake?MMI={n}
//   returns a GeoJSON FeatureCollection of quakes (past 365 days) with MMI >= n.

const RADIUS_KM = 50;

interface QuakeFeature {
  geometry?: { coordinates?: [number, number, number] | [number, number] };
  properties?: Record<string, unknown>;
}

interface QuakeCollection {
  features?: QuakeFeature[];
}

function nowIso(): string {
  return new Date().toISOString();
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function pickNumber(props: Record<string, unknown>, key: string): number | undefined {
  const v = props[key];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return undefined;
}

function pickString(props: Record<string, unknown>, key: string): string | undefined {
  const v = props[key];
  if (typeof v === 'string' && v.trim()) return v.trim();
  return undefined;
}

export async function fetchSeismic(lat: number, lng: number): Promise<AdapterResult<SeismicContext>> {
  const url = 'https://api.geonet.org.nz/quake?MMI=3';
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.geo+json;version=2' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      return {
        status: 'error',
        data: null,
        source: 'GeoNet',
        message: `GeoNet returned HTTP ${res.status}`,
        fetchedAt: nowIso(),
      };
    }
    const fc = (await res.json()) as QuakeCollection;
    const features = fc.features ?? [];

    let local = 0;
    let closest: SeismicContext['closest'] | undefined;
    let closestDistance = Infinity;
    for (const f of features) {
      const coords = f.geometry?.coordinates;
      if (!coords || coords.length < 2) continue;
      const [qLng, qLat] = coords;
      const d = haversineKm(lat, lng, qLat, qLng);
      if (d <= RADIUS_KM) local++;
      if (d < closestDistance) {
        closestDistance = d;
        const p = f.properties ?? {};
        const mmi = pickNumber(p, 'mmi') ?? 0;
        const magnitude = pickNumber(p, 'magnitude') ?? 0;
        const depthKm = pickNumber(p, 'depth') ?? 0;
        const timeUtc = pickString(p, 'time') ?? '';
        closest = { mmi, magnitude, depthKm, timeUtc, distanceKm: d };
      }
    }

    return {
      status: 'ok',
      data: {
        recentLocalQuakes: local,
        radiusKm: RADIUS_KM,
        closest,
      },
      source: 'GeoNet',
      fetchedAt: nowIso(),
    };
  } catch (err) {
    return {
      status: 'error',
      data: null,
      source: 'GeoNet',
      message: err instanceof Error ? err.message : 'Unknown GeoNet error',
      fetchedAt: nowIso(),
    };
  }
}
