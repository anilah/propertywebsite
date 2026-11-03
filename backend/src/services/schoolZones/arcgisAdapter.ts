import type { AdapterResult, InZoneSchool, NearbySchool, SchoolInfo } from './types.js';

// NZ school directory + enrolment zone boundaries — both sourced from the Ministry of
// Education, republished as public ArcGIS Online FeatureServers by Eagle Technology
// (NZ's Esri distributor). No auth required. The official educationcounts.govt.nz /
// data.govt.nz endpoints sit behind bot-protection (Imperva / Cloudflare JS challenges)
// that a server-side fetch cannot pass, so these mirrors are used instead.
const SCHOOLS_LAYER =
  'https://services.arcgis.com/XTtANUDT8Va4DLwI/arcgis/rest/services/Schools_Directory_New_Zealand/FeatureServer/0/query';
const ZONES_LAYER =
  'https://services.arcgis.com/XTtANUDT8Va4DLwI/arcgis/rest/services/NZ_School_Zone_boundaries/FeatureServer/0/query';

const SCHOOLS_SOURCE = 'NZ Schools Directory (Ministry of Education)';
const ZONES_SOURCE = 'NZ School Enrolment Zones (Ministry of Education)';

const NEARBY_RADIUS_M = 5000;
const NEARBY_CANDIDATES = 40;
const NEARBY_LIMIT = 8;
const MAX_PLAUSIBLE_ZONE_DISTANCE_KM = 30;

const SCHOOL_OUT_FIELDS =
  'School_Id,Org_Name,Add1_Line1,Add1_Suburb,Add1_City,Org_Type,Decile,EQi_Index,Total,Latitude,Longitude,Telephone,URL,Enrolment_Scheme,Status';

interface SchoolAttrs {
  School_Id: number;
  Org_Name: string;
  Add1_Line1?: string | null;
  Add1_Suburb?: string | null;
  Add1_City?: string | null;
  Org_Type?: string | null;
  Decile?: number | null;
  EQi_Index?: number | null;
  Total?: number | null;
  Latitude?: number | null;
  Longitude?: number | null;
  Telephone?: string | null;
  URL?: string | null;
  Enrolment_Scheme?: string | null;
  Status?: string | null;
}

interface ZoneAttrs {
  School_ID: number;
  School_name: string;
  Institution_type?: string | null;
  Effective_date?: number | null;
}

interface ArcGisFeature<T> {
  attributes: T;
}

interface ArcGisQueryResponse<T> {
  features?: ArcGisFeature<T>[];
  error?: { code: number; message: string };
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

async function fetchArcGis<T>(url: URL): Promise<ArcGisQueryResponse<T>> {
  url.searchParams.set('f', 'json');
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(6000) });
  if (!res.ok) {
    throw new Error(`ArcGIS returned HTTP ${res.status}`);
  }
  const json = (await res.json()) as ArcGisQueryResponse<T>;
  if (json.error) {
    throw new Error(json.error.message || 'ArcGIS query error');
  }
  return json;
}

function mapSchool(a: SchoolAttrs): SchoolInfo {
  return {
    id: a.School_Id,
    name: a.Org_Name,
    address: [a.Add1_Line1?.trim(), a.Add1_Suburb?.trim()].filter(Boolean).join(', ') || undefined,
    type: a.Org_Type ?? undefined,
    roll: typeof a.Total === 'number' ? a.Total : undefined,
    equityIndex: typeof a.EQi_Index === 'number' ? a.EQi_Index : undefined,
    phone: a.Telephone?.trim() || undefined,
    website: a.URL?.trim() || undefined,
    hasEnrolmentScheme: a.Enrolment_Scheme?.trim().toLowerCase() === 'yes',
  };
}

export async function fetchNearbySchools(lat: number, lng: number): Promise<AdapterResult<NearbySchool[]>> {
  try {
    const url = new URL(SCHOOLS_LAYER);
    url.searchParams.set('geometry', `${lng},${lat}`);
    url.searchParams.set('geometryType', 'esriGeometryPoint');
    url.searchParams.set('inSR', '4326');
    url.searchParams.set('spatialRel', 'esriSpatialRelIntersects');
    url.searchParams.set('distance', String(NEARBY_RADIUS_M));
    url.searchParams.set('units', 'esriSRUnit_Meter');
    url.searchParams.set('where', "Status='Open'");
    url.searchParams.set('outFields', SCHOOL_OUT_FIELDS);
    url.searchParams.set('resultRecordCount', String(NEARBY_CANDIDATES));

    const json = await fetchArcGis<SchoolAttrs>(url);
    const nearby = (json.features ?? [])
      .map((f) => f.attributes)
      .filter((a) => typeof a.Latitude === 'number' && typeof a.Longitude === 'number')
      .map((a) => ({
        ...mapSchool(a),
        distanceKm: haversineKm(lat, lng, a.Latitude as number, a.Longitude as number),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, NEARBY_LIMIT);

    return { status: 'ok', data: nearby, source: SCHOOLS_SOURCE, fetchedAt: nowIso() };
  } catch (err) {
    return {
      status: 'error',
      data: null,
      source: SCHOOLS_SOURCE,
      message: err instanceof Error ? err.message : 'Unknown error fetching nearby schools',
      fetchedAt: nowIso(),
    };
  }
}

export async function fetchInZoneSchools(lat: number, lng: number): Promise<AdapterResult<InZoneSchool[]>> {
  try {
    const zoneUrl = new URL(ZONES_LAYER);
    zoneUrl.searchParams.set('geometry', `${lng},${lat}`);
    zoneUrl.searchParams.set('geometryType', 'esriGeometryPoint');
    zoneUrl.searchParams.set('inSR', '4326');
    zoneUrl.searchParams.set('spatialRel', 'esriSpatialRelIntersects');
    zoneUrl.searchParams.set('outFields', 'School_ID,School_name,Institution_type,Effective_date');

    const zoneJson = await fetchArcGis<ZoneAttrs>(zoneUrl);
    const zoneFeatures = zoneJson.features ?? [];

    if (zoneFeatures.length === 0) {
      return {
        status: 'no_data',
        data: [],
        source: ZONES_SOURCE,
        message: 'This address does not fall within any published school enrolment zone.',
        fetchedAt: nowIso(),
      };
    }

    const ids = zoneFeatures
      .map((f) => f.attributes.School_ID)
      .filter((id): id is number => typeof id === 'number');

    const detailById = new Map<number, SchoolAttrs>();
    if (ids.length > 0) {
      const detailUrl = new URL(SCHOOLS_LAYER);
      detailUrl.searchParams.set('where', `School_Id IN (${ids.join(',')})`);
      detailUrl.searchParams.set('outFields', SCHOOL_OUT_FIELDS);
      const detailJson = await fetchArcGis<SchoolAttrs>(detailUrl);
      for (const f of detailJson.features ?? []) {
        detailById.set(f.attributes.School_Id, f.attributes);
      }
    }

    const inZone: InZoneSchool[] = zoneFeatures
      .map((f) => {
        const z = f.attributes;
        const detail = detailById.get(z.School_ID);
        const base: SchoolInfo = detail
          ? mapSchool(detail)
          : { id: z.School_ID, name: z.School_name, type: z.Institution_type ?? undefined };
        return {
          ...base,
          effectiveDate: z.Effective_date ? new Date(z.Effective_date).toISOString() : undefined,
          _schoolLat: detail?.Latitude ?? undefined,
          _schoolLng: detail?.Longitude ?? undefined,
        };
      })
      // The MOE's own zone dataset has known digitisation errors — a handful of schools (mostly
      // designated-character schools) have wildly oversized polygons (observed: one covering
      // >50,000 km², well beyond any real walk/drive-in home zone). Drop matches where the
      // school itself sits implausibly far from the query point; genuine NZ home zones rarely
      // exceed this even for large rural area schools.
      .filter((s) => {
        if (typeof s._schoolLat !== 'number' || typeof s._schoolLng !== 'number') return true;
        return haversineKm(lat, lng, s._schoolLat, s._schoolLng) <= MAX_PLAUSIBLE_ZONE_DISTANCE_KM;
      })
      .map(({ _schoolLat, _schoolLng, ...s }) => s);

    if (inZone.length === 0) {
      return {
        status: 'no_data',
        data: [],
        source: ZONES_SOURCE,
        message: 'This address does not fall within any published school enrolment zone.',
        fetchedAt: nowIso(),
      };
    }

    return { status: 'ok', data: inZone, source: ZONES_SOURCE, fetchedAt: nowIso() };
  } catch (err) {
    return {
      status: 'error',
      data: null,
      source: ZONES_SOURCE,
      message: err instanceof Error ? err.message : 'Unknown error fetching enrolment zones',
      fetchedAt: nowIso(),
    };
  }
}
