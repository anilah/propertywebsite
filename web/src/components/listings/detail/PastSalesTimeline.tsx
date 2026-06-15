import type { Listing } from '../../../types';
import { BetaBadge } from './BetaBadge';

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildHistory(listing: Listing): { date: string; value: number }[] {
  const base = listing.price ?? 620_000;
  const seed = hash(listing.id);
  const now = new Date();

  const points = [
    { yearsAgo: 3, factor: 0.78 + (seed % 20) / 1000 },
    { yearsAgo: 6, factor: 0.62 + ((seed >> 3) % 20) / 1000 },
    { yearsAgo: 9, factor: 0.48 + ((seed >> 5) % 20) / 1000 },
  ];

  return points.map((p) => {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() - p.yearsAgo);
    d.setMonth((seed + p.yearsAgo * 31) % 12);
    d.setDate(((seed >> 2) % 27) + 1);
    return {
      date: d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' }),
      value: Math.round((base * p.factor) / 5000) * 5000,
    };
  });
}

export function PastSalesTimeline({ listing }: { listing: Listing }) {
  const history = buildHistory(listing);
  return (
    <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Past sales &amp; timeline</h2>
        <BetaBadge />
      </div>

      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-2">
          {history.map((h, i) => (
            <div key={i} className="flex flex-col min-w-[180px]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">{h.date}</span>
                <span className="flex-1 h-px bg-gray-300" />
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <span className="inline-block text-[11px] font-medium bg-gray-700 text-white px-2 py-0.5 rounded mb-2">
                  Capital Value
                </span>
                <p className="text-xl font-bold text-gray-900">${h.value.toLocaleString('en-NZ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
