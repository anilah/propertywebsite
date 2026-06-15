import { useState, useMemo, type ReactNode } from "react";
import { Listing } from "../../types";

interface ListingGalleryProps {
  listing: Listing;
  variant?: "default" | "hero";
  /** Node rendered absolutely inside the main image container (e.g. agency card overlay). */
  overlay?: ReactNode;
}

const kindLabel: Record<string, string> = {
  PHOTO: "",
  EXTERIOR: "Ext",
  INTERIOR: "Int",
  FLOORPLAN: "Plan",
  AERIAL: "Aerial",
  OTHER: "Other",
};

export function ListingGallery({ listing, variant = "default", overlay }: ListingGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const items = useMemo(() => {
    if (listing.media && listing.media.length > 0) {
      return listing.media.map((m) => ({
        url: m.url,
        kind: m.kind || "PHOTO",
      }));
    }
    return (listing.images || []).map((url) => ({ url, kind: "PHOTO" as const }));
  }, [listing.media, listing.images]);

  if (items.length === 0) {
    return (
      <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-gray-500">No images available</span>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedImageIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const current = items[selectedImageIndex];
  const badge = kindLabel[current.kind] || "";

  return (
    <div className={variant === "hero" ? "space-y-2" : "space-y-4"}>
      <div
        className={`relative bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden group ${
          variant === "hero" ? "aspect-[21/10] rounded-t-2xl" : "aspect-[16/10] rounded-2xl"
        }`}
      >
        <img
          src={current.url}
          alt={listing.headline}
          className="w-full h-full object-cover"
        />
        {badge ? (
          <span className="absolute top-3 left-3 text-xs font-semibold uppercase tracking-wide bg-black/70 text-white px-2 py-1 rounded">
            {badge}
          </span>
        ) : null}

        {items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {items.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
            {selectedImageIndex + 1} / {items.length}
          </div>
        )}

        {overlay}
      </div>

      {items.length > 1 && (
        <div
          className={
            variant === "hero"
              ? "flex gap-1.5 overflow-x-auto bg-white border-x border-b border-gray-200 rounded-b-2xl p-2"
              : "grid grid-cols-4 sm:grid-cols-6 gap-2"
          }
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative overflow-hidden border-2 transition-all ${
                variant === "hero"
                  ? "w-14 h-10 sm:w-16 sm:h-11 rounded"
                  : "aspect-video rounded-lg"
              } ${
                selectedImageIndex === index
                  ? variant === "hero"
                    ? "border-primary-500"
                    : "border-primary-500 ring-2 ring-primary-200 ring-offset-2 scale-105"
                  : variant === "hero"
                    ? "border-gray-200"
                    : "border-gray-200 hover:border-gray-300 hover:scale-105"
              }`}
            >
              <img
                src={item.url}
                alt={`${listing.headline} - ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {kindLabel[item.kind] ? (
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-medium py-0.5 text-center">
                  {kindLabel[item.kind]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
