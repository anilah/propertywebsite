import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { listingsApi } from '../../services/api';
import type { Listing, ListingType } from '../../types';
import { parseListingTypeFromPath, searchPath } from '../../utils/listingRoutes';
import { ResultsListingCard } from './ResultsListingCard';
import { Pagination } from '../ui/Pagination';
import { trackListingClick, trackSearchResults } from '../analytics/GoogleAnalytics';

const PAGE_SIZE = 12;

function titleFor(listingType: ListingType): string {
  if (listingType === 'RENT') return 'Properties for rent';
  if (listingType === 'FLATMATES') return 'Flatmates wanted';
  return 'Properties for sale';
}

function listNameFor(listingType: ListingType): string {
  if (listingType === 'RENT') return 'Properties for Rent';
  if (listingType === 'FLATMATES') return 'Flatmates Wanted';
  return 'Properties for Sale';
}

/**
 * Default category browse ( /sale | /rent | /flatmates ) — normal listing cards.
 * Featured listings appear first as regular cards (not the search-results carousel).
 */
export function CategoryListingsSection() {
  const location = useLocation();
  const listingType: ListingType = (() => {
    const seg = location.pathname.split('/').filter(Boolean)[0] || 'sale';
    return parseListingTypeFromPath(seg);
  })();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [listingType]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listingsApi
      .getListings({ listingType }, 'featured', page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        const rows = res.listings ?? [];
        setListings(rows);
        setTotal(res.pagination?.total ?? rows.length);
        setTotalPages(res.pagination?.totalPages ?? 1);
        trackSearchResults(
          rows.map((l) => ({
            id: l.id,
            headline: l.headline,
            listingType: l.listingType,
            propertyType: l.propertyType,
            suburb: l.location?.suburb,
            district: l.location?.district,
            region: l.location?.region,
            price: l.price,
            rentPerWeek: l.rentPerWeek,
            agencyDisplayName: l.agencyDisplayName ?? undefined,
          })),
          listNameFor(listingType)
        );
      })
      .catch(() => {
        if (!cancelled) {
          setListings([]);
          setTotal(0);
          setTotalPages(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingType, page]);

  return (
    <section className="border-t border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
              {listingType === 'SALE' ? 'For sale' : listingType === 'RENT' ? 'For rent' : 'Flatmates'}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {titleFor(listingType)}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Featured properties show first as normal listings.
              {!loading && total > 0 ? ` Showing ${listings.length} of ${total}.` : null}
            </p>
          </div>
          <Link
            to={searchPath(listingType)}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            Search all {listingType === 'SALE' ? 'sales' : listingType === 'RENT' ? 'rentals' : 'flatmates'}
          </Link>
        </div>

        {loading && listings.length === 0 ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-slate-800">No properties yet</h3>
            <p className="mt-1 text-sm text-slate-500">Try searching with filters for more options.</p>
            <Link
              to={searchPath(listingType)}
              className="mt-4 inline-flex rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Open search
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {listings.map((listing, idx) => (
                <ResultsListingCard
                  key={listing.id}
                  listing={listing}
                  onCardClick={() =>
                    trackListingClick(
                      {
                        id: listing.id,
                        headline: listing.headline,
                        listingType: listing.listingType,
                        propertyType: listing.propertyType,
                        suburb: listing.location?.suburb,
                        district: listing.location?.district,
                        region: listing.location?.region,
                        price: listing.price,
                        rentPerWeek: listing.rentPerWeek,
                        agencyDisplayName: listing.agencyDisplayName ?? undefined,
                      },
                      listNameFor(listingType),
                      idx
                    )
                  }
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
