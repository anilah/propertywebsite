import { useEffect, useState, lazy, Suspense } from "react";
import { useLocation, Link } from "react-router-dom";
import { useApiListingsStore } from "../store/apiListingsStore";
import { ResultsListingCard } from "../components/listings/ResultsListingCard";
import { PromotedListingsCarousel } from "../components/listings/PromotedListingsCarousel";
import { RefinePanel } from "../components/listings/RefinePanel";
import { Pagination } from "../components/ui/Pagination";
import { SortOption } from "../types";
import { isPropertySearchPath, parseListingTypeFromPath, searchPath } from "../utils/listingRoutes";
import { locationHierarchy } from "../data/mockListings";

// Lazy-load split map+list view (heavy bundle; avoids window errors on initial render)
const MapResultsView = lazy(() =>
  import("../components/listings/MapResultsView").then((m) => ({ default: m.MapResultsView }))
);

export function ResultsPage() {
  const location = useLocation();
  const {
    listings: displayedListings,
    loading,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    filters,
    setFilters,
    fetchListings,
  } = useApiListingsStore();

  // Sync listing type from Trade Me-style URL when on /property/residential/sale|rent/search
  useEffect(() => {
    if (isPropertySearchPath(location.pathname)) {
      const segment = location.pathname.split("/")[3]; // sale or rent
      const listingType = parseListingTypeFromPath(segment);
      if (listingType !== filters.listingType) {
        // Type changed via URL — clear price filters since sale $ and rent $/wk aren't interchangeable.
        setFilters({ listingType, minPrice: undefined, maxPrice: undefined });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, setFilters]);

  const [keywordInput, setKeywordInput] = useState(filters.keyword ?? "");
  const [refineOpen, setRefineOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  useEffect(() => {
    setKeywordInput(filters.keyword ?? "");
  }, [filters.keyword]);

  // Fetch on mount and whenever filters, sort, or page change
  useEffect(() => {
    fetchListings();
  }, [fetchListings, filters.listingType, filters.region, filters.district, filters.suburb, filters.minPrice, filters.maxPrice, filters.minBedrooms, filters.minBathrooms, filters.minParking, filters.propertyType, filters.keyword, sortBy, currentPage]);

  const isRent = filters.listingType === "RENT";
  const priceTiers = isRent
    ? [
        { v: 200, label: "$200+ /wk" },
        { v: 400, label: "$400+ /wk" },
        { v: 600, label: "$600+ /wk" },
        { v: 800, label: "$800+ /wk" },
        { v: 1000, label: "$1,000+ /wk" },
      ]
    : [
        { v: 200000, label: "$200,000+" },
        { v: 400000, label: "$400,000+" },
        { v: 600000, label: "$600,000+" },
        { v: 800000, label: "$800,000+" },
        { v: 1000000, label: "$1,000,000+" },
      ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "featured", label: "Featured first" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "latest", label: "Newest First" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumbs - Trade Me style */}
        <nav className="text-sm text-gray-600 mb-4">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="hover:text-primary-600">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to={filters.listingType === "SALE" ? "/sale" : "/rent"} className="hover:text-primary-600">
                Property
              </Link>
            </li>
            <li>/</li>
            <li>
              <span className="text-gray-900">Residential</span>
            </li>
            <li>/</li>
            <li>
              <Link to={searchPath(filters.listingType)} className="hover:text-primary-600 text-gray-900">
                {filters.listingType === "SALE" ? "Sale" : "Rent"}
              </Link>
            </li>
          </ol>
        </nav>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-700 mb-6">
          HOMES & REAL ESTATE FOR {filters.listingType === "SALE" ? "SALE" : "RENT"}
        </h1>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Add keywords e.g. pool, garage, income"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onBlur={() => setFilters({ keyword: keywordInput.trim() || undefined })}
              onKeyDown={(e) => e.key === "Enter" && setFilters({ keyword: keywordInput.trim() || undefined })}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filter Buttons Row — outlined pill style */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {/* Refine — triggers dropdown panel */}
          <div className="relative">
            <button
              onClick={() => setRefineOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                refineOpen
                  ? "bg-primary-700 border-primary-700 text-white"
                  : "bg-primary-600 border-primary-600 text-white hover:bg-primary-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Refine
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {refineOpen && (
              <RefinePanel
                filters={filters}
                total={total}
                onApply={(partial) => { setFilters(partial); fetchListings(); }}
                onClose={() => setRefineOpen(false)}
              />
            )}
          </div>
          {/* Location */}
          <select
            value={filters.region || ""}
            onChange={(e) =>
              setFilters({
                region: e.target.value || undefined,
                district: undefined,
                suburb: undefined,
              })
            }
            className="appearance-none pl-3 pr-7 py-1.5 border border-primary-600 text-primary-600 rounded-full text-sm font-semibold bg-white hover:bg-primary-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">All Locations</option>
            {Object.keys(locationHierarchy).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Price / Weekly rent */}
          <select
            value={filters.minPrice?.toString() || ""}
            onChange={(e) => setFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="appearance-none pl-3 pr-7 py-1.5 border border-primary-600 text-primary-600 rounded-full text-sm font-semibold bg-white hover:bg-primary-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">{isRent ? "Rent: Any" : "Price: Any"}</option>
            {priceTiers.map((t) => (
              <option key={t.v} value={t.v}>{`${isRent ? "Rent: " : "Price: "}${t.label}`}</option>
            ))}
          </select>

          {/* Bedrooms */}
          <select
            value={filters.minBedrooms?.toString() || ""}
            onChange={(e) => setFilters({ minBedrooms: e.target.value ? Number(e.target.value) : undefined })}
            className="appearance-none pl-3 pr-7 py-1.5 border border-primary-600 text-primary-600 rounded-full text-sm font-semibold bg-white hover:bg-primary-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">Bedrooms: Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{`Bedrooms: ${n}+`}</option>
            ))}
          </select>

          {/* Bathrooms */}
          <select
            value={filters.minBathrooms?.toString() || ""}
            onChange={(e) => setFilters({ minBathrooms: e.target.value ? Number(e.target.value) : undefined })}
            className="appearance-none pl-3 pr-7 py-1.5 border border-primary-600 text-primary-600 rounded-full text-sm font-semibold bg-white hover:bg-primary-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">Bathrooms: Any</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{`Bathrooms: ${n}+`}</option>
            ))}
          </select>
        </div>

        {/* Sort + results count + map view */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <p className="text-xl font-bold text-gray-900">
            {loading ? "Loading..." : `Showing ${total.toLocaleString()} results`}
          </p>
          <div className="flex items-center gap-3">
            {/* Styled sort dropdown */}
            <div className="relative flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-2 text-sm text-gray-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{`Sort: ${o.label}`}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-3.5 h-3.5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {/* List / Map toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                  viewMode === "map"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map
              </button>
            </div>
          </div>
        </div>

        {/* ── Map view — TradeMe-style split: scrollable list left, sticky map right ── */}
        {viewMode === "map" && (
          <Suspense fallback={
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading map…</p>
              </div>
            </div>
          }>
            <MapResultsView
              listings={displayedListings}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </Suspense>
        )}

        {/* ── List view ── */}
        {viewMode === "list" && (
          <div className="grid grid-cols-1 gap-6">
            <div>
              {loading && displayedListings.length === 0 ? (
                <div className="text-center py-20 text-gray-500">Loading listings...</div>
              ) : displayedListings.length > 0 ? (
                <>
                  <div>
                    {(() => {
                      // On page 1, surface platinumPartner listings at the top inside a horizontal
                      // carousel (TradeMe Super Feature style). On pages 2+, render every listing
                      // with the standard card (no promoted block).
                      const promoted = currentPage === 1
                        ? displayedListings.filter((l) => l.platinumPartner)
                        : [];
                      const promotedIds = new Set(promoted.map((l) => l.id));
                      const regular = displayedListings.filter((l) => !promotedIds.has(l.id));
                      return (
                        <>
                          {promoted.length > 0 && (
                            <PromotedListingsCarousel listings={promoted} />
                          )}
                          <div className="space-y-6">
                            {regular.map((listing) => (
                              <ResultsListingCard key={listing.id} listing={listing} />
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                    <p className="text-gray-500 mb-6">
                      We couldn't find any properties matching your search criteria.
                      Try adjusting your filters to see more results.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
