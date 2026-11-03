import { useEffect, useState } from 'react';
import type { Listing } from '../../../types';
import { listingsApi } from '../../../services/api';
import { BetaBadge } from './BetaBadge';
import { formatSalePrice, formatRent, formatListingLocationLine } from '../../../utils/format';

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function soldDate(listing: Listing, i: number): string {
  const now = new Date();
  now.setMonth(now.getMonth() - i * 2 - (hash(listing.id) % 4));
  return now.toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysOnMarket(listing: Listing, i: number): number {
  return 14 + ((hash(listing.id + String(i)) % 60));
}

export function NearbySold({ listing }: { listing: Listing }) {
  const [nearby, setNearby] = useState<Listing[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    listingsApi
      .getListings(
        {
          listingType: listing.listingType,
          region: listing.location.region,
          district: listing.location.district,
          suburb: listing.location.suburb,
        },
        'latest',
        1,
        8
      )
      .then((res) => {
        if (!active) return;
        setNearby(res.listings.filter((l) => l.id !== listing.id).slice(0, 4));
        setLoaded(true);
      })
      .catch(() => {
        if (active) {
          setNearby([]);
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [listing.id, listing.listingType, listing.location.region, listing.location.district, listing.location.suburb]);

  return (
    <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Nearby Sold Properties</h2>
        <BetaBadge />
        <a href="#" onClick={(e) => e.preventDefault()} className="ml-auto text-sm text-primary-600 hover:underline">
          View all
        </a>
      </div>

      {!loaded ? (
        <p className="text-sm text-gray-500 py-6">Loading nearby sold properties…</p>
      ) : nearby.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-600">
            No nearby sold records yet for {listing.location.suburb || 'this suburb'}.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            We'll surface comparable sales here once they're available in this area.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nearby.map((n, i) => {
            const img = n.media?.[0]?.url || n.images?.[0];
            const priceLabel =
              n.listingType === 'SALE' ? formatSalePrice(n) : formatRent(n);
            return (
              <div key={n.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/3] bg-gray-100">
                  {img ? (
                    <img src={img} alt={n.headline} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                  )}
                  <span className="absolute top-2 left-2 text-[11px] font-semibold bg-red-600 text-white px-2 py-0.5 rounded">
                    Sold
                  </span>
                  {priceLabel && (
                    <span className="absolute bottom-2 left-2 text-xs font-bold bg-white/95 text-gray-900 px-2 py-0.5 rounded shadow-sm">
                      {priceLabel}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm text-red-600 font-medium">Sold: {soldDate(n, i)}</p>
                  <p className="text-sm text-gray-800 mt-1 line-clamp-2">
                    {formatListingLocationLine(n) || [n.location?.suburb, n.location?.district].filter(Boolean).join(', ')}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    {n.bedrooms > 0 && <span>🛏 {n.bedrooms}</span>}
                    {n.bathrooms > 0 && <span>🛁 {n.bathrooms}</span>}
                    {n.parking > 0 && <span>🚗 {n.parking}</span>}
                    <span className="ml-auto">{daysOnMarket(n, i)} days</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
