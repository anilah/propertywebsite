import { useEffect, useState } from 'react';
import type { Listing } from '../../../types';
import {
  schoolZonesApi,
  type SchoolZonesResponse,
  type SchoolAdapterStatus,
  type SchoolInfo,
  type NearbySchool,
} from '../../../services/api';

interface Props {
  listing: Listing;
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function StatusNote({ status, message }: { status: SchoolAdapterStatus; message?: string }) {
  if (status === 'ok') return null;
  return <p className="text-sm text-gray-500">{message || 'No data available for this location.'}</p>;
}

function SchoolRow({ school, right }: { school: SchoolInfo; right?: string }) {
  return (
    <li className="border-b border-gray-100 last:border-0 py-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {school.type && (
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded">
                {school.type}
              </span>
            )}
            {typeof school.equityIndex === 'number' && (
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded">
                Equity Index {school.equityIndex}
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-900">{school.name}</p>
          {school.address && <p className="text-sm text-gray-500">{school.address}</p>}
          {typeof school.roll === 'number' && (
            <p className="text-sm text-gray-500">{school.roll.toLocaleString()} enrolled</p>
          )}
        </div>
        {right && <p className="text-sm text-gray-600 whitespace-nowrap sm:ml-4">{right}</p>}
      </div>
    </li>
  );
}

export function LocalSchools({ listing }: Props) {
  const [data, setData] = useState<SchoolZonesResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllNearby, setShowAllNearby] = useState(false);

  const lat = listing.latitude;
  const lng = listing.longitude;
  const hasCoords = typeof lat === 'number' && typeof lng === 'number';

  useEffect(() => {
    if (!hasCoords) {
      setLoaded(true);
      return;
    }
    let active = true;
    schoolZonesApi
      .get(lat as number, lng as number)
      .then((res) => {
        if (!active) return;
        setData(res);
        setLoaded(true);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Could not load school zone data.');
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [lat, lng, hasCoords]);

  if (!hasCoords) return null;

  const inZoneSchools = data?.inZone.data ?? [];
  const nearby: NearbySchool[] = data?.nearby.data ?? [];
  const visibleNearby = showAllNearby ? nearby : nearby.slice(0, 3);

  return (
    <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Nearby Schools</h2>
        <span className="ml-auto text-xs text-gray-500">Source: Ministry of Education</span>
      </div>

      {!loaded && <p className="text-sm text-gray-500 py-6">Loading school zone data…</p>}

      {error && (
        <div className="border border-dashed border-red-200 bg-red-50 rounded-xl p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loaded && data && (
        <div className="space-y-6">
          {/* In zone */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">In zone for</h3>
              {inZoneSchools.length > 0 && (
                <span className="inline-block text-[11px] font-semibold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded">
                  {inZoneSchools.length} school{inZoneSchools.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <StatusNote status={data.inZone.status} message={data.inZone.message} />
            {data.inZone.status === 'ok' && inZoneSchools.length > 0 && (
              <ul>
                {inZoneSchools.map((s) => (
                  <SchoolRow key={s.id} school={s} />
                ))}
              </ul>
            )}
          </div>

          {/* Nearby */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Nearby schools</h3>
            <StatusNote status={data.nearby.status} message={data.nearby.message} />
            {data.nearby.status === 'ok' && nearby.length > 0 && (
              <>
                <ul>
                  {visibleNearby.map((s) => (
                    <SchoolRow key={s.id} school={s} right={formatDistance(s.distanceKm)} />
                  ))}
                </ul>
                {nearby.length > 3 && (
                  <button
                    onClick={() => setShowAllNearby((v) => !v)}
                    className="mt-3 text-primary-600 hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    {showAllNearby ? 'Show fewer schools' : `Show all ${nearby.length} schools`}
                    <span aria-hidden>+</span>
                  </button>
                )}
              </>
            )}
          </div>

          <p className="text-xs text-gray-500 italic">
            School zone and enrolment scheme information is sourced from the Ministry of Education and may not be
            exact or fully up to date — always confirm zoning directly with the school before making decisions.
          </p>
        </div>
      )}
    </section>
  );
}
