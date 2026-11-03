import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tradiesApi, type Tradie } from '../services/api';
import { nzLocationHierarchy } from '../data/nzLocations';
import {
  TradieAvatar,
  TradieEnquireButton,
  tradieAreaLabel,
  tradieCardImages,
} from '../components/tradies/TradieContact';
import { FilterBar } from '../components/listings/FilterBar';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { useAppShellMode } from '../hooks/useAppShellMode';

const PAGE_SIZE = 24;

/** Photo-first card — same rhythm as property ResultsListingCard */
function TradieListCard({ tradie }: { tradie: Tradie }) {
  const navigate = useNavigate();
  const [mainImgIdx, setMainImgIdx] = useState(0);
  const [failed, setFailed] = useState<Record<string, true>>({});
  const images = tradieCardImages(tradie).filter((url) => !failed[url]);
  const total = images.length;
  const hasGallery = total > 1;
  const safeIdx = total === 0 ? 0 : Math.min(mainImgIdx, total - 1);
  const mainImage =
    images[safeIdx] ||
    tradie.photoUrl ||
    `https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&h=600&q=80`;

  return (
    <div
      onClick={() => navigate(`/tradies/${tradie.slug}`)}
      className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg"
    >
      <div className="relative h-[220px] overflow-hidden bg-gray-100 sm:h-[280px]">
        <img
          src={mainImage}
          alt={tradie.businessName}
          className="h-full w-full object-cover"
          onError={() => {
            if (images[safeIdx]) {
              setFailed((prev) => ({ ...prev, [images[safeIdx]]: true }));
              setMainImgIdx(0);
            }
          }}
        />
        {tradie.featured && (
          <span className="absolute left-2 top-2 rounded bg-amber-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            Featured
          </span>
        )}
        {hasGallery && (
          <div className="absolute bottom-2 right-2 z-10 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {safeIdx + 1} / {total}
          </div>
        )}
        {hasGallery && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMainImgIdx((i) => (i - 1 + total) % total);
              }}
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white"
              aria-label="Previous"
            >
              <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMainImgIdx((i) => (i + 1) % total);
              }}
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white"
              aria-label="Next"
            >
              <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row">
        <div className="flex shrink-0 flex-row items-center gap-3 bg-slate-800 px-4 py-3 text-white sm:w-[34%] sm:flex-col sm:justify-center sm:gap-2 sm:py-5 sm:text-center">
          <TradieAvatar tradie={tradie} size={52} />
          <div className="min-w-0 sm:px-2">
            <p className="truncate text-sm font-semibold">{tradie.contactName || tradie.businessName}</p>
            {tradie.yearsExperience != null && tradie.yearsExperience > 0 && (
              <p className="text-xs text-slate-300">{tradie.yearsExperience}+ yrs</p>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-gray-900">{tradie.businessName}</h3>
          {tradie.tagline && (
            <p className="mt-0.5 text-sm font-medium text-primary-700">{tradie.tagline}</p>
          )}
          <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-600">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{tradieAreaLabel(tradie)}</span>
          </p>
          {tradie.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tradie.categories.slice(0, 5).map((c) => (
                <span
                  key={c}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
          {(tradie.description || tradie.tagline) && (
            <p className="mt-3 line-clamp-2 text-sm text-gray-600">
              {tradie.description || tradie.tagline}
            </p>
          )}
          <div
            className="mt-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <TradieEnquireButton tradie={tradie} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TradiesPage() {
  const appShell = useAppShellMode();
  const [params, setParams] = useSearchParams();

  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const region = params.get('region') ?? '';
  const district = params.get('district') ?? '';
  const suburb = params.get('suburb') ?? '';

  const isBrowsing = !q && !category && !region && !district && !suburb;

  // Local drafts — same pattern as FilterBar (debounce into URL; Search applies now)
  const [draftQ, setDraftQ] = useState(q);
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftRegion, setDraftRegion] = useState(region);
  const [draftDistrict, setDraftDistrict] = useState(district);

  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [tradies, setTradies] = useState<Tradie[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const skipDebounce = useRef(true);

  const regions = useMemo(() => Object.keys(nzLocationHierarchy).sort(), []);
  const districts = useMemo(
    () => (draftRegion ? Object.keys(nzLocationHierarchy[draftRegion] ?? {}).sort() : []),
    [draftRegion]
  );

  const buildParams = (
    nextQ: string,
    nextCategory: string,
    nextRegion: string,
    nextDistrict: string
  ) => {
    const next = new URLSearchParams();
    if (nextQ.trim()) next.set('q', nextQ.trim());
    if (nextCategory) next.set('category', nextCategory);
    if (nextRegion) next.set('region', nextRegion);
    if (nextDistrict) next.set('district', nextDistrict);
    return next;
  };

  const applySearch = () => {
    setParams(buildParams(draftQ, draftCategory, draftRegion, draftDistrict), { replace: true });
  };

  useEffect(() => {
    tradiesApi.categories().then((r) => setCategories(r.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    skipDebounce.current = true;
    setDraftQ(q);
    setDraftCategory(category);
    setDraftRegion(region);
    setDraftDistrict(district);
  }, [q, category, region, district]);

  // Live-apply drafts like FilterBar → store debounce
  useEffect(() => {
    if (skipDebounce.current) {
      skipDebounce.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      setParams(buildParams(draftQ, draftCategory, draftRegion, draftDistrict), { replace: true });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draftQ, draftCategory, draftRegion, draftDistrict, setParams]);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    tradiesApi
      .list({
        q: q || undefined,
        category: category || undefined,
        region: region || undefined,
        district: district || undefined,
        suburb: suburb || undefined,
        featured: isBrowsing ? true : undefined,
        page: 1,
        limit: PAGE_SIZE,
      })
      .then((r) => {
        if (id !== requestId.current) return;
        setTradies(r.tradies);
        setTotal(r.total);
        setPage(1);
      })
      .catch(() => {
        if (id === requestId.current) setError('Could not load tradies. Please try again.');
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [q, category, region, district, suburb, isBrowsing]);

  const clearAll = () => {
    skipDebounce.current = true;
    setDraftQ('');
    setDraftCategory('');
    setDraftRegion('');
    setDraftDistrict('');
    setParams(new URLSearchParams(), { replace: true });
  };

  const hasActiveFilters = Boolean(
    draftQ.trim() || draftCategory || draftRegion || draftDistrict || q || category || region || district
  );

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const r = await tradiesApi.list({
        q: q || undefined,
        category: category || undefined,
        region: region || undefined,
        district: district || undefined,
        suburb: suburb || undefined,
        featured: isBrowsing ? true : undefined,
        page: page + 1,
        limit: PAGE_SIZE,
      });
      setTradies((prev) => [...prev, ...r.tradies]);
      setPage(page + 1);
    } catch {
      setError('Could not load more tradies.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-full bg-white">
      {!appShell && <FilterBar />}

      {appShell && (
        <div className="border-b border-gray-100 bg-white px-4 py-5">
          <h1 className="text-xl font-bold text-gray-900">Find a tradie</h1>
          <p className="mt-1 text-sm text-gray-500">
            Builders, plumbers, inspectors and more — vetted by Kaboo Homes.
          </p>
        </div>
      )}

      {/* Search panel — same structure / rhythm as Sale·Rent FilterBar */}
      <div className={`w-full bg-white ${appShell ? 'py-4' : 'pt-5 pb-4'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!appShell && (
            <h1 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">
              Find a tradie across New Zealand
            </h1>
          )}

          <div className="relative z-10 rounded border border-gray-200 bg-white p-4 sm:p-5">
            {/* Row 1 — Location (Region → District → Category + Search) */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-600">Location</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <Select
                  value={draftRegion}
                  onChange={(e) => {
                    setDraftRegion(e.target.value);
                    setDraftDistrict('');
                  }}
                  options={[
                    { value: '', label: 'All New Zealand' },
                    ...regions.map((r) => ({ value: r, label: r })),
                  ]}
                />
                <Select
                  value={draftDistrict}
                  disabled={!draftRegion}
                  onChange={(e) => setDraftDistrict(e.target.value)}
                  options={[
                    { value: '', label: 'All districts' },
                    ...districts.map((d) => ({ value: d, label: d })),
                  ]}
                />
                <div className="flex gap-3 sm:gap-4">
                  <Select
                    value={draftCategory}
                    onChange={(e) => setDraftCategory(e.target.value)}
                    className="flex-1"
                    options={[
                      { value: '', label: 'All categories' },
                      ...categories.map((c) => ({
                        value: c.name,
                        label: `${c.name} (${c.count})`,
                      })),
                    ]}
                  />
                  <button
                    type="button"
                    onClick={applySearch}
                    className="flex-shrink-0 whitespace-nowrap rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:px-8 sm:text-base"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2 — Keywords (same refinement row slot as Sale·Rent) */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-600">Keywords</label>
                <Input
                  type="text"
                  placeholder="Service or name, e.g. deck builder, electrician"
                  value={draftQ}
                  onChange={(e) => setDraftQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applySearch();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-3 pt-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6" />
              <button
                type="button"
                onClick={clearAll}
                className={`text-sm font-medium transition-colors ${
                  hasActiveFilters
                    ? 'text-primary-600 hover:text-primary-700'
                    : 'pointer-events-none cursor-default text-gray-400'
                }`}
              >
                Clear refinements
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results — same section shell as category property listings */}
      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
                {isBrowsing ? 'Featured' : 'Search results'}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {isBrowsing ? 'Featured tradies' : 'Tradies for your search'}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                {isBrowsing
                  ? 'Featured tradies show first as normal listings.'
                  : null}
                {!loading && total > 0
                  ? ` Showing ${tradies.length} of ${total}.`
                  : loading
                    ? ' Loading…'
                    : null}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                Show featured
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{error}</p>
              <button
                type="button"
                className="mt-2 font-semibold text-red-800 underline"
                onClick={() => {
                  // bump request by resetting params noop — re-run effect via state
                  setError('');
                  setLoading(true);
                  tradiesApi
                    .list({
                      q: q || undefined,
                      category: category || undefined,
                      region: region || undefined,
                      district: district || undefined,
                      suburb: suburb || undefined,
                      featured: isBrowsing ? true : undefined,
                      page: 1,
                      limit: PAGE_SIZE,
                    })
                    .then((r) => {
                      setTradies(r.tradies);
                      setTotal(r.total);
                      setPage(1);
                    })
                    .catch(() => setError('Could not load tradies. Please try again.'))
                    .finally(() => setLoading(false));
                }}
              >
                Try again
              </button>
            </div>
          )}

          {loading && tradies.length === 0 ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
              ))}
            </div>
          ) : error && tradies.length === 0 ? null : tradies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <h3 className="text-lg font-semibold text-slate-800">
                {isBrowsing ? 'No featured tradies yet' : 'No tradies match your search'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try searching with filters for more options.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {tradies.map((t) => (
                  <TradieListCard key={t.id} tradie={t} />
                ))}
              </div>
              {tradies.length < total && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-lg border border-primary-600 px-6 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading…' : 'Show more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
