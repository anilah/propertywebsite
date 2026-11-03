import { useState, useMemo, type ReactNode } from "react";
import { Listing } from "../../types";
import { isVideoMediaKind, isVideoUrl } from "../../utils/listingImages";

interface ListingGalleryProps {
  listing: Listing;
  variant?: "default" | "hero";
  /** Node rendered absolutely inside the main image container (e.g. agency card overlay). */
  overlay?: ReactNode;
}

export function ListingGallery({ listing, variant = "default", overlay }: ListingGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const items = useMemo(() => {
    if (listing.media && listing.media.length > 0) {
      return listing.media
        .filter((m) => !isVideoMediaKind(m.kind) && m.url && !isVideoUrl(m.url))
        .map((m) => ({
          url: m.url,
          kind: m.kind || "PHOTO",
        }));
    }
    return (listing.images || [])
      .filter((url) => url && !isVideoUrl(url))
      .map((url) => ({ url, kind: "PHOTO" as const }));
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

  return (
    <div className={variant === "hero" ? "space-y-0" : "space-y-4"}>
      <div
        className={`relative overflow-hidden group bg-slate-200 ${
          variant === "hero" ? "aspect-[16/10] rounded-t-2xl" : "aspect-[16/10] rounded-2xl"
        }`}
      >
        {/* Blurred fill — removes black pillarbox without stretching the photo */}
        <img
          src={current.url}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-70"
        />
        <div className="absolute inset-0 bg-slate-900/20" aria-hidden />
        <img
          src={current.url}
          alt={listing.headline}
          className="relative z-[1] h-full w-full object-contain"
        />

        {items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {items.length > 1 && (
          <div className="absolute bottom-4 left-4 z-10 bg-black/70 text-white text-sm font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
            {selectedImageIndex + 1} / {items.length}
          </div>
        )}

        {overlay}
      </div>

      {items.length > 1 && (
        <div
          className={
            variant === "hero"
              ? "flex gap-2 overflow-x-auto bg-white border-x border-b border-gray-200 rounded-b-2xl p-2.5"
              : "grid grid-cols-4 sm:grid-cols-6 gap-2"
          }
        >
          {items.map((item, index) => (
            <button
              key={`${item.url}-${index}`}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className={`relative shrink-0 overflow-hidden border-2 bg-slate-100 transition-all ${
                variant === "hero"
                  ? "w-20 h-14 sm:w-24 sm:h-16 rounded-md"
                  : "aspect-video rounded-lg"
              } ${
                selectedImageIndex === index
                  ? variant === "hero"
                    ? "border-primary-500 ring-1 ring-primary-300"
                    : "border-primary-500 ring-2 ring-primary-200 ring-offset-2 scale-105"
                  : variant === "hero"
                    ? "border-gray-200 hover:border-gray-300"
                    : "border-gray-200 hover:border-gray-300 hover:scale-105"
              }`}
            >
              <img
                src={item.url}
                alt={`${listing.headline} - ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
