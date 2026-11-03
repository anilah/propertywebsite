import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApiListingsStore } from '../../store/apiListingsStore';
import { locationHierarchy } from '../../data/mockListings';
import { searchPath } from '../../utils/listingRoutes';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { useSiteConfig } from '../../context/SiteConfigContext';

const FALLBACK_HERO =
  'https://www.trademe.co.nz/images/frend/property/landingpage/resi4sale-xl-1920.jpg';

/**
 * Phone / PWA home hero — full-bleed visual first, search as a clear second beat.
 * Same store + searchPath as desktop (no API / logic changes).
 */
export function MobileHomeSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useSiteConfig();
  const { filters, setFilters } = useApiListingsStore();
  const [localFilters, setLocalFilters] = useState(filters);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setLocalFilters((prev) =>
      prev.listingType === filters.listingType ? prev : { ...prev, listingType: filters.listingType }
    );
  }, [filters.listingType]);

  useEffect(() => {
    const path = location.pathname;
    let next: typeof filters.listingType | null = null;
    if (path.startsWith('/sale')) next = 'SALE';
    else if (path.startsWith('/flatmates')) next = 'FLATMATES';
    else if (path.startsWith('/rent')) next = 'RENT';
    if (next && next !== filters.listingType) {
      setFilters({ listingType: next, minPrice: undefined, maxPrice: undefined });
    }
  }, [location.pathname, filters.listingType, setFilters]);

  const update = (key: keyof typeof localFilters, value: unknown) => {
    setLocalFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'region') {
        next.district = undefined;
        next.suburb = undefined;
      }
      if (key === 'district') next.suburb = undefined;
      return next;
    });
  };

  const districts = localFilters.region
    ? Object.keys(locationHierarchy[localFilters.region as keyof typeof locationHierarchy] || {})
    : [];
  const suburbs =
    localFilters.region && localFilters.district
      ? (
          locationHierarchy[localFilters.region as keyof typeof locationHierarchy] as Record<
            string,
            string[]
          >
        )?.[localFilters.district] || []
      : [];

  const isRentLike = localFilters.listingType === 'RENT' || localFilters.listingType === 'FLATMATES';

  const headline =
    localFilters.listingType === 'FLATMATES'
      ? 'Share a place you love'
      : localFilters.listingType === 'RENT'
        ? 'Your next rental starts here'
        : 'Homes across Aotearoa';

  const support =
    localFilters.listingType === 'FLATMATES'
      ? 'Browse rooms and flatshares nationwide.'
      : localFilters.listingType === 'RENT'
        ? 'Search weekly rentals from Kaipara to Bluff.'
        : 'Explore New Zealand’s homes for sale.';

  const placeLabel = [localFilters.suburb, localFilters.district, localFilters.region]
    .filter(Boolean)
    .join(', ');

  const runSearch = () => {
    setFilters(localFilters);
    navigate(searchPath(localFilters.listingType));
  };

  return (
    <div className="bg-white">
      {/* Full-bleed hero — owns the first viewport beat */}
      <section className="relative isolate min-h-[72dvh] overflow-hidden">
        <img
          src={config.heroImageUrl || FALLBACK_HERO}
          alt=""
          className="absolute inset-0 h-full w-full object-cover scale-105 motion-safe:animate-[hero-ken_18s_ease-in-out_infinite_alternate]"
          style={{ objectPosition: config.heroImagePosition || '50% 40%' }}
        />
        {/* Atmospheric scrims — not flat */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_20%,_rgba(0,0,0,0.35)_100%)]" />

        <div className="relative z-10 flex min-h-[72dvh] flex-col px-5 pb-8 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            {config.siteName || 'Kaboo Homes'}
          </p>

          <div className="mt-auto max-w-md pb-2">
            <h1 className="text-[2.35rem] font-semibold leading-[1.05] tracking-tight text-white drop-shadow-sm">
              {headline}
            </h1>
            <p className="mt-3 text-[15px] leading-snug text-white/85">{support}</p>

            {/* Single CTA on the hero — opens refine panel */}
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="mt-7 flex w-full min-h-[54px] items-center gap-3 rounded-2xl border border-white/25 bg-white/15 px-4 text-left shadow-lg backdrop-blur-md active:bg-white/25"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-white">
                  {placeLabel || 'Where in New Zealand?'}
                </span>
                <span className="block truncate text-[12px] text-white/70">
                  {placeLabel ? 'Tap to refine · then search' : 'Region, district, suburb'}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-primary-600 px-3.5 py-2 text-xs font-bold text-white">
                Search
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Bottom sheet — filters (same fields as before) */}
      {panelOpen && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Search filters">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={() => setPanelOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl animate-sheet-up pb-safe">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <div>
                <p className="text-lg font-bold text-gray-900">Search</p>
                <p className="text-xs text-gray-500">Set location and preferences</p>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-full bg-gray-100 p-2 text-gray-600"
                aria-label="Close search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 px-4 py-4">
              <Select
                value={localFilters.region || ''}
                onChange={(e) => update('region', e.target.value || undefined)}
                options={[
                  { value: '', label: 'All New Zealand' },
                  ...Object.keys(locationHierarchy).map((r) => ({ value: r, label: r })),
                ]}
              />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={localFilters.district || ''}
                  onChange={(e) => update('district', e.target.value || undefined)}
                  disabled={!localFilters.region}
                  options={[
                    { value: '', label: 'District' },
                    ...districts.map((d) => ({ value: d, label: d })),
                  ]}
                />
                <Select
                  value={localFilters.suburb || ''}
                  onChange={(e) => update('suburb', e.target.value || undefined)}
                  disabled={!localFilters.district}
                  options={[
                    { value: '', label: 'Suburb' },
                    ...suburbs.map((s: string) => ({ value: s, label: s })),
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={localFilters.minPrice?.toString() || ''}
                  onChange={(e) =>
                    update('minPrice', e.target.value ? Number(e.target.value) : undefined)
                  }
                  options={
                    isRentLike
                      ? [
                          { value: '', label: 'Min $/wk' },
                          { value: '300', label: '$300' },
                          { value: '500', label: '$500' },
                          { value: '700', label: '$700' },
                          { value: '1000', label: '$1,000' },
                        ]
                      : [
                          { value: '', label: 'Min price' },
                          { value: '500000', label: '$500k' },
                          { value: '750000', label: '$750k' },
                          { value: '1000000', label: '$1m' },
                          { value: '1500000', label: '$1.5m' },
                        ]
                  }
                />
                <Select
                  value={localFilters.minBedrooms?.toString() || ''}
                  onChange={(e) =>
                    update('minBedrooms', e.target.value ? Number(e.target.value) : undefined)
                  }
                  options={[
                    { value: '', label: 'Beds' },
                    { value: '1', label: '1+' },
                    { value: '2', label: '2+' },
                    { value: '3', label: '3+' },
                    { value: '4', label: '4+' },
                  ]}
                />
              </div>
              <Input
                value={localFilters.keyword || ''}
                onChange={(e) => update('keyword', e.target.value || undefined)}
                placeholder="Keywords or Property ID#"
              />
              <button
                type="button"
                onClick={runSearch}
                className="min-h-[52px] w-full rounded-2xl bg-primary-600 text-base font-bold text-white active:bg-primary-800"
              >
                Show properties
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
