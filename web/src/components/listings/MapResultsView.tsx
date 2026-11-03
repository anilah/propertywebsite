import { useEffect, useRef, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import type { Listing } from "../../types";
import { listingDetailPath } from "../../utils/listingRoutes";
import {
  formatSalePrice,
  formatRent,
  formatListingLocationLine,
} from "../../utils/format";
import { listingCoverImage } from "../../utils/listingImages";
import { Pagination } from "../ui/Pagination";

const MapView = lazy(() =>
  import("./MapView").then((m) => ({ default: m.MapView }))
);

interface MapResultsViewProps {
  listings: Listing[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function BedIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20V10a2 2 0 012-2h16a2 2 0 012 2v10" />
      <path d="M2 14h20" />
      <path d="M7 8V6a1 1 0 011-1h8a1 1 0 011 1v2" />
    </svg>
  );
}
function BathIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13h18v2a6 6 0 01-6 6H9a6 6 0 01-6-6v-2z" />
      <path d="M6 13V6a2 2 0 012-2h1" />
      <path d="M6 9h4" />
    </svg>
  );
}
function CarIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 11l1.5-4.5h11L19 11" />
      <rect x="2" y="11" width="20" height="7" rx="2" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  );
}

interface CompactCardProps {
  listing: Listing;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
}

function CompactCard({
  listing,
  isHovered,
  isSelected,
  onHover,
  onClick,
  registerRef,
}: CompactCardProps) {
  const navigate = useNavigate();
  const placeholder = `https://picsum.photos/seed/${listing.id}/600/400`;
  const image = listingCoverImage(listing) || placeholder;
  const price =
    listing.listingType === "SALE" ? formatSalePrice(listing) : formatRent(listing);

  const ring =
    isSelected
      ? "ring-2 ring-orange-500 border-orange-400"
      : isHovered
        ? "ring-2 ring-primary-400 border-primary-300"
        : "border-gray-200";

  return (
    <div
      ref={(el) => registerRef(listing.id, el)}
      onMouseEnter={() => onHover(listing.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => {
        onClick(listing.id);
        navigate(listingDetailPath(listing.listingType, listing.id, listing.location));
      }}
      className={`flex gap-3 bg-white border ${ring} rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden`}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-32 sm:w-36 aspect-[4/3] bg-gray-100">
        <img
          src={image}
          alt={listing.headline}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {listing.platinumPartner && (
          <span className="absolute top-1 left-0 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 shadow uppercase tracking-wider">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-2 pr-3 flex flex-col justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
            {listing.headline}
          </p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {formatListingLocationLine(listing)}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {listing.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <BedIcon />
                <span>{listing.bedrooms}</span>
              </span>
            )}
            {listing.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <BathIcon />
                <span>{listing.bathrooms}</span>
              </span>
            )}
            {listing.parking > 0 && (
              <span className="flex items-center gap-1">
                <CarIcon />
                <span>{listing.parking}</span>
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-gray-900 whitespace-nowrap ml-2">{price}</p>
        </div>
      </div>
    </div>
  );
}

export function MapResultsView({
  listings,
  currentPage,
  totalPages,
  onPageChange,
}: MapResultsViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);

  const registerRef = (id: string, el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  };

  // Reset selection + scroll the list to top whenever the page changes.
  useEffect(() => {
    setSelectedId(null);
    setHoveredId(null);
    listRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [currentPage]);

  // When the user clicks a marker, scroll the matching card into view.
  useEffect(() => {
    if (!selectedId) return;
    const card = cardRefs.current.get(selectedId);
    const list = listRef.current;
    if (!card || !list) return;
    const cardTop = card.offsetTop - list.offsetTop;
    list.scrollTo({ top: cardTop - 16, behavior: "smooth" });
  }, [selectedId]);

  const mapped = listings.filter((l) => l.latitude && l.longitude);
  const unmapped = listings.length - mapped.length;

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-4 lg:h-[calc(100vh-220px)] lg:min-h-[600px]">
      {/* Map first on mobile for map-mode UX */}
      <div className="order-1 lg:order-2 h-64 sm:h-80 lg:h-full lg:sticky lg:top-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full min-h-[16rem] bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading map…</p>
              </div>
            </div>
          }
        >
          <MapView
            listings={mapped}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onMarkerClick={setSelectedId}
            height="100%"
          />
        </Suspense>
      </div>

      {/* List */}
      <div className="order-2 lg:order-1 flex flex-col min-h-0">
        <p className="text-xs text-gray-500 px-1 pb-2 flex-shrink-0">
          {listings.length} on this page
          {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
          {unmapped > 0 && ` · ${unmapped} without coordinates`}
        </p>

        <div ref={listRef} className="flex-1 min-h-0 lg:overflow-y-auto pr-1 -mr-1 space-y-3">
          {listings.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-sm">No listings to show.</div>
          ) : (
            listings.map((l) => (
              <CompactCard
                key={l.id}
                listing={l}
                isHovered={hoveredId === l.id}
                isSelected={selectedId === l.id}
                onHover={setHoveredId}
                onClick={setSelectedId}
                registerRef={registerRef}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex-shrink-0 pt-3 border-t border-gray-100 mt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
