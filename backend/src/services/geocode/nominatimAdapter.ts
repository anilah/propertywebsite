// Free, unauthenticated address geocoding via OpenStreetMap's Nominatim, restricted to NZ.
// Used only from the authenticated admin listing form (low volume), which keeps us well
// within Nominatim's usage policy (max ~1 req/sec, descriptive User-Agent required).
// https://operations.osmfoundation.org/policies/nominatim/

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'KabooHomes-PropertyReach/1.0 (contact: support@kaboohomes.com)';

export type GeocodeStatus = 'ok' | 'not_found' | 'error';

export interface GeocodeCandidate {
  lat: number;
  lng: number;
  label: string;
}

export interface GeocodeResult {
  status: GeocodeStatus;
  candidates: GeocodeCandidate[];
  message?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

function toCandidates(json: NominatimResult[]): GeocodeCandidate[] {
  const seen = new Set<string>();
  const candidates: GeocodeCandidate[] = [];
  for (const r of json) {
    const lat = Number(r.lat);
    const lng = Number(r.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    // Dedupe near-identical results (~11 m precision).
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push({ lat, lng, label: r.display_name });
    if (candidates.length >= 3) break;
  }
  return candidates;
}

async function nominatimSearch(q: string): Promise<{ ok: true; candidates: GeocodeCandidate[] } | { ok: false; error: string }> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('countrycodes', 'nz');
  url.searchParams.set('limit', '8');

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) {
    return { ok: false, error: `Geocoding service returned HTTP ${res.status}` };
  }
  const json = (await res.json()) as NominatimResult[];
  return { ok: true, candidates: toCandidates(json) };
}

/**
 * Build progressively simpler NZ address queries.
 * Marketing labels like "Auckland City" / pasted full addresses often make Nominatim
 * return nothing — strip unit letters, City suffixes, and trailing locality parts.
 */
function queryVariants(query: string): string[] {
  const cleaned = query
    .replace(/\bCity\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .trim()
    .replace(/^,|,$/g, '');

  const variants: string[] = [];
  const push = (v: string) => {
    const t = v
      .trim()
      .replace(/\s{2,}/g, ' ')
      .replace(/,\s*,/g, ',')
      .replace(/^,|,$/g, '')
      .replace(/,\s*$/, '');
    if (t && !variants.includes(t)) variants.push(t);
  };

  push(cleaned);
  push(query.trim());

  const parts = cleaned.split(',').map((p) => p.trim()).filter(Boolean);
  const street = parts[0] || cleaned;

  // Drop trailing "New Zealand"
  if (parts.length > 1 && /^new zealand$/i.test(parts[parts.length - 1])) {
    push(parts.slice(0, -1).join(', '));
  }

  // Street + suburb-ish second part + NZ (most reliable for NZ residential)
  if (parts.length >= 2) {
    push(`${street}, ${parts[1]}, New Zealand`);
    push(`${street}, ${parts[parts.length - 1]}`);
    push(`${street}, New Zealand`);
  }

  // Strip flat/unit letter: "7C Maxwell Avenue" → "7 Maxwell Avenue"
  const streetNoUnit = street.replace(/^(\d+)[A-Za-z]\b/, '$1');
  if (streetNoUnit !== street) {
    if (parts.length >= 2) {
      push(`${streetNoUnit}, ${parts[1]}, New Zealand`);
    }
    push(`${streetNoUnit}, New Zealand`);
  }

  // Street only
  if (street) push(street);
  if (streetNoUnit !== street) push(streetNoUnit);

  return variants.slice(0, 6);
}

export async function geocodeAddress(query: string): Promise<GeocodeResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { status: 'not_found', candidates: [], message: 'Enter an address to search.' };
  }

  try {
    const variants = queryVariants(trimmed);
    let lastError: string | undefined;

    for (let i = 0; i < variants.length; i++) {
      // Respect Nominatim's ~1 req/sec guidance between retries.
      if (i > 0) {
        await new Promise((r) => setTimeout(r, 1100));
      }
      const result = await nominatimSearch(variants[i]);
      if (!result.ok) {
        lastError = result.error;
        continue;
      }
      if (result.candidates.length > 0) {
        return { status: 'ok', candidates: result.candidates };
      }
    }

    if (lastError) {
      return { status: 'error', candidates: [], message: lastError };
    }
    return {
      status: 'not_found',
      candidates: [],
      message: 'No matching address found in New Zealand. Try adjusting the street or suburb, or drop a pin on the map.',
    };
  } catch (err) {
    return {
      status: 'error',
      candidates: [],
      message: err instanceof Error ? err.message : 'Unknown geocoding error',
    };
  }
}
