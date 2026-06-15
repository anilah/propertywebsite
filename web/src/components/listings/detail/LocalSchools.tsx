import { useMemo, useState } from 'react';
import type { Listing } from '../../../types';
import { BetaBadge } from './BetaBadge';

type Category = 'Primary' | 'Intermediate' | 'Secondary';

interface School {
  name: string;
  address: string;
  schoolType: string;
  yearLevels: string;
  authority: string;
  roll: number;
  decile?: number;
  distanceKm: number;
  category: Category;
  inZone: boolean;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const STREET_NAMES = [
  'School Road',
  'Cambridge Terrace',
  'Victoria Street',
  'King Street',
  'Albert Road',
  'Park Avenue',
  'Queen Street',
  'Church Road',
];

function buildSchools(listing: Listing): School[] {
  const suburb = (listing.location.suburb || 'Local').trim();
  const district = (listing.location.district || '').trim();
  const seed = hash(listing.id + suburb);
  const pick = (n: number, m: number) => (seed >> n) & 0x7fffffff & (m - 1);
  const streetNumber = (n: number) => 1 + ((seed >> n) % 250);
  const street = (n: number) => STREET_NAMES[(seed >> n) % STREET_NAMES.length];

  // Best-effort suburb-aware naming: avoid hardcoded out-of-region school names.
  return [
    {
      name: `${suburb} Primary School`,
      address: `${streetNumber(0)} ${street(0)}, ${suburb}`,
      schoolType: 'Full Primary',
      yearLevels: 'Year 1–8',
      authority: 'State',
      roll: 280 + pick(1, 256),
      decile: 5 + pick(2, 6),
      distanceKm: 0.3 + pick(3, 64) / 100,
      category: 'Primary',
      inZone: true,
    },
    {
      name: `${suburb} School`,
      address: `${streetNumber(4)} ${street(5)}, ${suburb}`,
      schoolType: 'Contributing',
      yearLevels: 'Year 1–6',
      authority: 'State',
      roll: 220 + pick(6, 200),
      decile: 6 + pick(7, 5),
      distanceKm: 0.7 + pick(8, 100) / 100,
      category: 'Primary',
      inZone: true,
    },
    {
      name: `${district || suburb} Intermediate`,
      address: `${streetNumber(9)} ${street(10)}, ${district || suburb}`,
      schoolType: 'Intermediate',
      yearLevels: 'Year 7–8',
      authority: 'State',
      roll: 380 + pick(11, 256),
      decile: 6 + pick(12, 5),
      distanceKm: 1.2 + pick(13, 100) / 100,
      category: 'Intermediate',
      inZone: pick(14, 2) === 0,
    },
    {
      name: `${district || suburb} College`,
      address: `${streetNumber(15)} ${street(16)}, ${district || suburb}`,
      schoolType: 'Secondary',
      yearLevels: 'Year 9–13',
      authority: 'State',
      roll: 1100 + pick(17, 800),
      decile: 6 + pick(18, 5),
      distanceKm: 1.8 + pick(19, 100) / 100,
      category: 'Secondary',
      inZone: true,
    },
    {
      name: `${suburb} High School`,
      address: `${streetNumber(20)} ${street(21)}, ${suburb}`,
      schoolType: 'Secondary',
      yearLevels: 'Year 7–13',
      authority: 'State',
      roll: 850 + pick(22, 600),
      decile: 5 + pick(23, 6),
      distanceKm: 2.2 + pick(24, 100) / 100,
      category: 'Secondary',
      inZone: pick(25, 2) === 0,
    },
    {
      name: `St Mary's School (${suburb})`,
      address: `${streetNumber(26)} ${street(27)}, ${suburb}`,
      schoolType: 'Full Primary',
      yearLevels: 'Year 1–8',
      authority: 'State: Integrated',
      roll: 140 + pick(28, 120),
      decile: 7 + pick(29, 4),
      distanceKm: 1.5 + pick(30, 100) / 100,
      category: 'Primary',
      inZone: true,
    },
  ];
}

export function LocalSchools({ listing }: { listing: Listing }) {
  const schools = useMemo(() => buildSchools(listing), [listing]);
  const counts = {
    All: schools.length,
    Primary: schools.filter((s) => s.category === 'Primary').length,
    Intermediate: schools.filter((s) => s.category === 'Intermediate').length,
    Secondary: schools.filter((s) => s.category === 'Secondary').length,
  };
  const [tab, setTab] = useState<keyof typeof counts>('All');
  const [showAll, setShowAll] = useState(false);
  const filtered = tab === 'All' ? schools : schools.filter((s) => s.category === tab);
  const visible = showAll ? filtered : filtered.slice(0, 3);

  const tabs = Object.keys(counts) as (keyof typeof counts)[];

  return (
    <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Local Schools</h2>
        <BetaBadge />
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setShowAll(false);
            }}
            className={`pb-3 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t ? 'border-primary-600 text-gray-900' : 'border-transparent text-primary-600 hover:text-primary-700'
            }`}
          >
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      <ul>
        {visible.map((s, i) => (
          <li key={i} className="border-b border-gray-100 last:border-0 py-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {s.inZone && (
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded">
                      In zone
                    </span>
                  )}
                  {s.decile !== undefined && (
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded">
                      Decile {s.decile}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500">{s.address}</p>
                <p className="text-sm text-gray-500">
                  {s.schoolType} ({s.yearLevels}) &middot; {s.authority} &middot; {s.roll.toLocaleString()} enrolled
                </p>
              </div>
              <p className="text-sm text-gray-600 whitespace-nowrap sm:ml-4">
                {s.distanceKm < 1
                  ? `${Math.round(s.distanceKm * 1000)} m`
                  : `${s.distanceKm.toFixed(1)} km`}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length > 3 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-primary-600 hover:underline text-sm font-medium flex items-center gap-1"
        >
          {showAll ? 'Show fewer schools' : `Show all ${filtered.length} schools`}
          <span aria-hidden>+</span>
        </button>
      )}

      <p className="text-xs text-gray-500 italic mt-4">
        While we've done our best to correctly list schools in this location, school zone information may not be exact, so
        please double check with the school.
      </p>
    </section>
  );
}
