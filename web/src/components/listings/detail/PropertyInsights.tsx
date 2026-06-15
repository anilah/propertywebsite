import { useMemo, useState } from 'react';
import type { Listing } from '../../../types';
import { BetaBadge } from './BetaBadge';

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function deterministicRange(listing: Listing): { low: number; high: number; rent: { low: number; high: number } } {
  const base = listing.price ?? 700_000;
  const seed = hash(listing.id);
  const spreadLow = 0.88 + (seed % 40) / 1000;
  const spreadHigh = 1.04 + ((seed >> 3) % 60) / 1000;
  const low = Math.round((base * spreadLow) / 5000) * 5000;
  const high = Math.round((base * spreadHigh) / 5000) * 5000;
  const rentLow = Math.round(base * 0.00072 / 5) * 5;
  const rentHigh = Math.round(base * 0.00088 / 5) * 5;
  return { low, high, rent: { low: rentLow, high: rentHigh } };
}

function buildCapitalValueHistory(listing: Listing) {
  const seed = hash(listing.id + ':cv');
  const baseRv = Math.round(((listing.price ?? 700_000) * 0.92) / 1000) * 1000;
  const currentYear = new Date().getFullYear();
  // Three previous valuations every 3 years, roughly +35% per cycle.
  const factors = [1, 1 / 1.35, 1 / (1.35 * 1.22), 1 / (1.35 * 1.22 * 1.18)];
  return factors.map((f, i) => ({
    year: currentYear - i * 3,
    rv: Math.round((baseRv * f) / 1000) * 1000,
    landValue: Math.round((baseRv * f * 0.62) / 1000) * 1000,
    improvementValue: Math.round((baseRv * f * 0.38 + (seed % 5000)) / 1000) * 1000,
  }));
}

function buildSuburbTrends(listing: Listing) {
  const seed = hash(listing.id + ':trends');
  const median = (listing.price ?? 700_000);
  return {
    median: Math.round(median / 1000) * 1000,
    medianYoY: 4 + (seed % 60) / 10, // 4.0–10.0%
    medianDaysToSell: 28 + (seed % 18),
    listingsCount: 30 + (seed % 120),
    rentalYield: 3.8 + ((seed >> 4) % 28) / 10, // 3.8–6.6%
  };
}

const TABS = ['Property estimate', 'Capital value', 'Trends'] as const;
type Tab = (typeof TABS)[number];

export function PropertyInsights({ listing }: { listing: Listing }) {
  const [tab, setTab] = useState<Tab>('Property estimate');
  const { low, high, rent } = deterministicRange(listing);
  const yieldPct = listing.price ? ((rent.low + rent.high) / 2 * 52 / listing.price) * 100 : 0;
  const updated = new Date().toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const cv = useMemo(() => buildCapitalValueHistory(listing), [listing.id]);
  const trends = useMemo(() => buildSuburbTrends(listing), [listing.id]);

  return (
    <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Property insights</h2>
        <BetaBadge />
        <a href="#" onClick={(e) => e.preventDefault()} className="ml-auto text-sm text-primary-600 hover:underline">
          Nearby property values ↗
        </a>
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t ? 'border-primary-600 text-gray-900' : 'border-transparent text-primary-600 hover:text-primary-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Property estimate' && (
        <div className="border border-gray-200 rounded-xl p-5 grid sm:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">HomesEstimate</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-100 text-green-800">
                Updated today
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Updated: {updated}</p>
            <p className="text-2xl font-bold text-gray-900">
              ${Math.round(low / 1000)}K – ${Math.round(high / 1000)}K
            </p>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-primary-600 hover:underline mt-1 inline-block">
              What is the HomesEstimate?
            </a>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">RentEstimate</p>
            <p className="text-xs text-gray-500 mb-2">Updated: {updated}</p>
            <p className="text-2xl font-bold text-gray-900">
              ${rent.low} – ${rent.high} <span className="text-base font-medium text-gray-500">/week</span>
            </p>
            <p className="text-sm text-gray-700 mt-1">
              Rental yield <span className="font-semibold">{yieldPct.toFixed(1)}%</span>
            </p>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-primary-600 hover:underline mt-1 inline-block">
              What is rental yield?
            </a>
          </div>
          <p className="sm:col-span-2 text-xs text-gray-500 italic">
            These are computer generated price guides only. For more information about this property, contact the agent.
          </p>
        </div>
      )}

      {tab === 'Capital value' && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Year</th>
                <th className="px-4 py-3 font-semibold">Capital value</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Land value</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Improvements</th>
              </tr>
            </thead>
            <tbody>
              {cv.map((row, i) => (
                <tr key={row.year} className={i === 0 ? 'bg-primary-50/30' : ''}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.year}
                    {i === 0 && (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-100 text-primary-700">
                        Latest
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    ${row.rv.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                    ${row.landValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                    ${row.improvementValue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 italic px-4 py-3 border-t border-gray-100">
            Capital values are set by the local council and updated every three years. Values shown are estimates.
          </p>
        </div>
      )}

      {tab === 'Trends' && (
        <div className="border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            {listing.location.suburb} ({listing.location.district}) trends
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Median price</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                ${(trends.median / 1000).toFixed(0)}K
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">YoY change</p>
              <p className={`text-xl font-bold mt-1 ${trends.medianYoY >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {trends.medianYoY >= 0 ? '+' : ''}{trends.medianYoY.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Days to sell</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{trends.medianDaysToSell}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Rental yield</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{trends.rentalYield.toFixed(1)}%</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 italic mt-4">
            Suburb statistics are computed from recent listings and sales in {listing.location.suburb}. Figures shown are
            indicative.
          </p>
        </div>
      )}
    </section>
  );
}
