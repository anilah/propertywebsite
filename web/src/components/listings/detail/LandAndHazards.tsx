import { useEffect, useState } from 'react';
import type { Listing } from '../../../types';
import { parcelInfoApi, type ParcelInfoResponse } from '../../../services/api';
import { BetaBadge } from './BetaBadge';

interface Props {
  listing: Listing;
}

function formatSqm(sqm?: number): string {
  if (!sqm || !Number.isFinite(sqm)) return '—';
  if (sqm >= 10000) return `${(sqm / 10000).toFixed(2)} ha`;
  return `${Math.round(sqm).toLocaleString()} m²`;
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusPill({ status }: { status: ParcelInfoResponse['parcel']['status'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    ok: { label: 'Live data', cls: 'bg-green-100 text-green-800 border-green-200' },
    no_data: { label: 'No data', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
    needs_api_key: { label: 'Setup required', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    error: { label: 'Unavailable', cls: 'bg-red-100 text-red-800 border-red-200' },
  };
  const m = map[status] ?? map.error;
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${m.cls}`}>
      {m.label}
    </span>
  );
}

export function LandAndHazards({ listing }: Props) {
  const [data, setData] = useState<ParcelInfoResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lat = listing.latitude;
  const lng = listing.longitude;
  const hasCoords = typeof lat === 'number' && typeof lng === 'number';

  useEffect(() => {
    if (!hasCoords) {
      setLoaded(true);
      return;
    }
    let active = true;
    parcelInfoApi
      .get(lat as number, lng as number)
      .then((res) => {
        if (!active) return;
        setData(res);
        setLoaded(true);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Could not load land and hazard info.');
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [lat, lng, hasCoords]);

  if (!hasCoords) {
    return (
      <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Land & hazards</h2>
          <BetaBadge />
        </div>
        <p className="text-sm text-gray-500">
          Map coordinates aren't set on this listing yet, so we can't look up parcel or hazard data.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Land & hazards</h2>
        <BetaBadge />
        <span className="ml-auto text-xs text-gray-500">
          Sources: LINZ, GeoNet
        </span>
      </div>

      {!loaded && <p className="text-sm text-gray-500 py-6">Loading land and hazard data…</p>}

      {error && (
        <div className="border border-dashed border-red-200 bg-red-50 rounded-xl p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loaded && data && (
        <div className="space-y-4">
          {/* Parcel — LINZ */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold text-gray-900">Parcel</h3>
              <div className="flex items-center gap-2">
                <StatusPill status={data.parcel.status} />
                <span className="text-[11px] text-gray-500">{data.parcel.source}</span>
              </div>
            </div>
            {data.parcel.status === 'ok' && data.parcel.data ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Title reference</dt>
                  <dd className="font-medium text-gray-900">{data.parcel.data.titleReference || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Land area</dt>
                  <dd className="font-medium text-gray-900">{formatSqm(data.parcel.data.landAreaSqm)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Legal description</dt>
                  <dd className="font-medium text-gray-900">{data.parcel.data.appellation || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Parcel intent</dt>
                  <dd className="font-medium text-gray-900">{data.parcel.data.parcelIntent || '—'}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-600">
                {data.parcel.message || 'Parcel information is not available for this location.'}
              </p>
            )}
          </div>

          {/* Seismic — GeoNet */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold text-gray-900">Recent seismic activity</h3>
              <div className="flex items-center gap-2">
                <StatusPill status={data.seismic.status} />
                <span className="text-[11px] text-gray-500">{data.seismic.source}</span>
              </div>
            </div>
            {data.seismic.status === 'ok' && data.seismic.data ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Felt quakes within {data.seismic.data.radiusKm} km (past year)</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {data.seismic.data.recentLocalQuakes}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">MMI ≥ 3 (perceptible indoors).</p>
                </div>
                {data.seismic.data.closest && (
                  <div>
                    <p className="text-gray-500">Closest recent quake</p>
                    <p className="font-medium text-gray-900 mt-0.5">
                      M {data.seismic.data.closest.magnitude.toFixed(1)} &middot;{' '}
                      {data.seismic.data.closest.distanceKm.toFixed(0)} km away
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(data.seismic.data.closest.timeUtc)} &middot;{' '}
                      {data.seismic.data.closest.depthKm.toFixed(0)} km deep
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {data.seismic.message || 'Seismic context is currently unavailable.'}
              </p>
            )}
          </div>

          {/* Regional hazards — coming soon */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold text-gray-900">Flood &amp; liquefaction</h3>
              <div className="flex items-center gap-2">
                <StatusPill status={data.hazards.status} />
                <span className="text-[11px] text-gray-500">{data.hazards.source}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {data.hazards.message || 'Regional hazard overlays are coming online council by council.'}
            </p>
          </div>

          <p className="text-xs text-gray-500 italic">
            Information is sourced from public datasets and is intended as a guide only. Always confirm with the relevant
            local authority before making property decisions.
          </p>
        </div>
      )}
    </section>
  );
}
