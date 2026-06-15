import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApiListingsStore } from "../../store/apiListingsStore";
import { locationHierarchy } from "../../data/mockListings";
import { FilterState, PropertyType } from "../../types";
import { searchPath } from "../../utils/listingRoutes";
import { Select } from "../ui/Select";
import { Input } from "../ui/Input";

interface FilterBarProps {
  compact?: boolean;
}

export function FilterBar({ compact = false }: FilterBarProps) {
  const navigate = useNavigate();
  const { filters, setFilters } = useApiListingsStore();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [searchNearby, setSearchNearby] = useState(false);
  const [openHomesOnly, setOpenHomesOnly] = useState(false);
  const [newHomesOnly, setNewHomesOnly] = useState(false);

  // Sync local filters with store filters
  useEffect(() => {
    if (filters.listingType !== localFilters.listingType) {
      setLocalFilters((prev) => ({ ...prev, listingType: filters.listingType }));
    }
  }, [filters.listingType]);

  // Debounce for instant filtering on desktop
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(localFilters);
    }, 300);
    return () => clearTimeout(timer);
  }, [localFilters, setFilters]);

  const updateLocalFilter = (key: keyof FilterState, value: any) => {
    setLocalFilters((prev) => {
      const updated = { ...prev, [key]: value };

      // Reset dependent filters
      if (key === "region") {
        updated.district = undefined;
        updated.suburb = undefined;
      }
      if (key === "district") {
        updated.suburb = undefined;
      }

      return updated;
    });
  };

  const clearAll = () => {
    const cleared: FilterState = {
      listingType: filters.listingType,
    };
    setLocalFilters(cleared);
    setFilters(cleared);
    setSearchNearby(false);
    setOpenHomesOnly(false);
    setNewHomesOnly(false);
  };

  const hasActiveFilters =
    localFilters.region ||
    localFilters.district ||
    localFilters.suburb ||
    localFilters.minPrice ||
    localFilters.maxPrice ||
    localFilters.minBedrooms ||
    localFilters.minBathrooms ||
    localFilters.propertyType ||
    localFilters.keyword ||
    searchNearby ||
    openHomesOnly ||
    newHomesOnly;

  // Get available districts for selected region
  const availableDistricts = localFilters.region
    ? Object.keys(
        locationHierarchy[
          localFilters.region as keyof typeof locationHierarchy
        ] || {}
      )
    : [];

  // Get available suburbs for selected district
  const availableSuburbs =
    localFilters.region && localFilters.district
      ? (
          locationHierarchy[
            localFilters.region as keyof typeof locationHierarchy
          ] as Record<string, string[]>
        )?.[localFilters.district] || []
      : [];

  const propertyTypes: PropertyType[] = [
    "House",
    "Apartment",
    "Unit",
    "Townhouse",
    "Lifestyle",
    "Land",
    "Other",
  ];

  const location = useLocation();
  const isResultsPage = location.pathname === "/results" || /^\/property\/residential\/(sale|rent)\/search\/?$/.test(location.pathname);
  const activeTab = filters.listingType === "RENT" ? "for-rent" : "for-sale";

  const handleTabChange = (tabId: string) => {
    const newListingType = tabId === "for-rent" ? "RENT" : "SALE";
    // Clear price filters — sale uses absolute $, rent uses weekly $, not interchangeable.
    setFilters({ listingType: newListingType, minPrice: undefined, maxPrice: undefined });
    setLocalFilters((prev) => ({ ...prev, listingType: newListingType, minPrice: undefined, maxPrice: undefined }));
    navigate(newListingType === "SALE" ? "/sale" : "/rent");
  };

  const showHero = !compact && !isResultsPage;

  return (
    <div className="bg-white">
      {/* Hero image + tab strip as one combined block — tabs sit over bottom of image */}
      {showHero && (
        <div className="relative w-full">
          {/* Photo */}
          <div className="w-full h-40 sm:h-44 lg:h-48 overflow-hidden">
            <img
              src="https://www.trademe.co.nz/images/frend/property/landingpage/resi4sale-xl-1920.jpg"
              alt="New Zealand properties"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Tab strip — absolutely positioned over the bottom edge of the image */}
          <div className="absolute bottom-0 left-0 right-0 z-10 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
              <button
                onClick={() => handleTabChange("for-sale")}
                aria-pressed={activeTab === "for-sale"}
                className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 text-sm font-semibold transition-colors border-r border-gray-200 ${
                  activeTab === "for-sale"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>For sale</span>
              </button>
              <button
                onClick={() => handleTabChange("for-rent")}
                aria-pressed={activeTab === "for-rent"}
                className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 text-sm font-semibold transition-colors border-r border-gray-200 ${
                  activeTab === "for-rent"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>For rent</span>
              </button>
              {/* Extend white background across remaining tab bar width */}
              <div className="flex-1 bg-white border-l-0" />
            </div>
          </div>
        </div>
      )}

      {/* Heading + Search form */}
      <div className={`w-full bg-white ${showHero ? "pt-5 pb-4" : "py-6"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHero && (
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Search New Zealand's largest range of houses and properties for{" "}
            {filters.listingType === "SALE" ? "sale" : "rent"}
          </h1>
        )}
        <div className="bg-white rounded border border-gray-200 p-4 sm:p-5 relative z-10">
          {/* First Row - Location and Search Button */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Location
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Select
                value={localFilters.region || ""}
                onChange={(e) =>
                  updateLocalFilter("region", e.target.value || undefined)
                }
                options={[
                  { value: "", label: "All New Zealand" },
                  ...Object.keys(locationHierarchy).map((region) => ({
                    value: region,
                    label: region,
                  })),
                ]}
              />
              <Select
                value={localFilters.district || ""}
                onChange={(e) =>
                  updateLocalFilter("district", e.target.value || undefined)
                }
                disabled={!localFilters.region}
                options={[
                  { value: "", label: "All districts" },
                  ...availableDistricts.map((district) => ({
                    value: district,
                    label: district,
                  })),
                ]}
              />
              <div className="flex gap-3 sm:gap-4">
                <Select
                  value={localFilters.suburb || ""}
                  onChange={(e) =>
                    updateLocalFilter("suburb", e.target.value || undefined)
                  }
                  disabled={!localFilters.district}
                  options={[
                    { value: "", label: "All suburbs" },
                    ...availableSuburbs.map((suburb: string) => ({
                      value: suburb,
                      label: suburb,
                    })),
                  ]}
                  className="flex-1"
                />
                <button
                  onClick={() => {
                    setFilters(localFilters);
                    navigate(searchPath(filters.listingType));
                  }}
                  className="px-6 sm:px-8 py-3 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap flex-shrink-0 text-sm sm:text-base"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Second Row - Price, Bedrooms, Bathrooms, Property Type, Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Price
              </label>
              <div className="flex gap-2">
                <Select
                  value={
                    localFilters.minPrice
                      ? localFilters.minPrice.toString()
                      : ""
                  }
                  onChange={(e) =>
                    updateLocalFilter(
                      "minPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  options={[
                    { value: "", label: "Any" },
                    { value: "100000", label: "$100,000" },
                    { value: "200000", label: "$200,000" },
                    { value: "300000", label: "$300,000" },
                    { value: "400000", label: "$400,000" },
                    { value: "500000", label: "$500,000" },
                    { value: "600000", label: "$600,000" },
                    { value: "700000", label: "$700,000" },
                    { value: "800000", label: "$800,000" },
                    { value: "900000", label: "$900,000" },
                    { value: "1000000", label: "$1,000,000" },
                    { value: "1500000", label: "$1,500,000" },
                    { value: "2000000", label: "$2,000,000" },
                    { value: "3000000", label: "$3,000,000" },
                  ]}
                />
                <span className="flex items-center text-gray-500">-</span>
                <Select
                  value={
                    localFilters.maxPrice
                      ? localFilters.maxPrice.toString()
                      : ""
                  }
                  onChange={(e) =>
                    updateLocalFilter(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  options={[
                    { value: "", label: "Any" },
                    { value: "200000", label: "$200,000" },
                    { value: "300000", label: "$300,000" },
                    { value: "400000", label: "$400,000" },
                    { value: "500000", label: "$500,000" },
                    { value: "600000", label: "$600,000" },
                    { value: "700000", label: "$700,000" },
                    { value: "800000", label: "$800,000" },
                    { value: "900000", label: "$900,000" },
                    { value: "1000000", label: "$1,000,000" },
                    { value: "1500000", label: "$1,500,000" },
                    { value: "2000000", label: "$2,000,000" },
                    { value: "3000000", label: "$3,000,000" },
                    { value: "5000000", label: "$5,000,000+" },
                  ]}
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Bedrooms
              </label>
              <Select
                value={localFilters.minBedrooms?.toString() || ""}
                onChange={(e) =>
                  updateLocalFilter(
                    "minBedrooms",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                options={[
                  { value: "", label: "Any" },
                  ...Array.from({ length: 6 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${i + 1}+`,
                  })),
                ]}
              />
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Bathrooms
              </label>
              <Select
                value={localFilters.minBathrooms?.toString() || ""}
                onChange={(e) =>
                  updateLocalFilter(
                    "minBathrooms",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                options={[
                  { value: "", label: "Any" },
                  ...Array.from({ length: 5 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${i + 1}+`,
                  })),
                ]}
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Property type
              </label>
              <Select
                value={localFilters.propertyType || ""}
                onChange={(e) =>
                  updateLocalFilter("propertyType", e.target.value || undefined)
                }
                options={[
                  { value: "", label: "All" },
                  ...propertyTypes.map((type) => ({
                    value: type,
                    label: type,
                  })),
                ]}
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Keywords
              </label>
              <Input
                type="text"
                placeholder="Keywords or Property ID#"
                value={localFilters.keyword || ""}
                onChange={(e) =>
                  updateLocalFilter("keyword", e.target.value || undefined)
                }
              />
            </div>
          </div>

          {/* Checkboxes and Clear Refinements */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchNearby}
                  onChange={(e) => setSearchNearby(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Search nearby suburbs</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openHomesOnly}
                  onChange={(e) => setOpenHomesOnly(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Open homes only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newHomesOnly}
                  onChange={(e) => setNewHomesOnly(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">New homes only</span>
              </label>
            </div>
            <button
              onClick={clearAll}
              className={`text-sm font-medium transition-colors ${
                hasActiveFilters
                  ? "text-primary-600 hover:text-primary-700"
                  : "text-gray-400 cursor-default pointer-events-none"
              }`}
            >
              Clear refinements
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
