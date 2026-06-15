import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Listing } from "../../types";
import { listingDetailPath } from "../../utils/listingRoutes";
import {
  formatSalePrice,
  formatRent,
  formatAddress,
} from "../../utils/format";

interface ResultsListingCardProps {
  listing: Listing;
}

function BedIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20V10a2 2 0 012-2h16a2 2 0 012 2v10" />
      <path d="M2 14h20" />
      <path d="M7 8V6a1 1 0 011-1h8a1 1 0 011 1v2" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13h18v2a6 6 0 01-6 6H9a6 6 0 01-6-6v-2z" />
      <path d="M6 13V6a2 2 0 012-2h1" />
      <path d="M6 9h4" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 11l1.5-4.5h11L19 11" />
      <rect x="2" y="11" width="20" height="7" rx="2" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  );
}

export function ResultsListingCard({ listing }: ResultsListingCardProps) {
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);

  const rawImages = Array.isArray(listing.images) ? listing.images : [];
  // Ensure at least 3 slots using a placeholder fallback
  const placeholder = `https://picsum.photos/seed/${listing.id}/800/600`;
  const images = rawImages.length > 0 ? rawImages : [placeholder];
  const total = images.length;

  const mainImage = images[imgIndex] || placeholder;
  const hasMultiple = total > 1;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i - 1 + total) % total);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i + 1) % total);
  };

  const handleClick = () => {
    navigate(listingDetailPath(listing.listingType, listing.id, listing.location));
  };

  const price =
    listing.listingType === "SALE" ? formatSalePrice(listing) : formatRent(listing);

  const agentInitials = (listing.listingAgentDisplayName || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      {/* ── Single image at a time — full card width, arrows step through gallery ── */}
      <div className="relative h-60 sm:h-72 lg:h-80 overflow-hidden">
        <img
          src={mainImage}
          alt={listing.headline}
          className="w-full h-full object-cover"
        />

        {/* Premium badge — top-right */}
        <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-sm flex items-center gap-1 z-20">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          R+A
        </div>

        {/* Image counter — bottom-right */}
        {hasMultiple && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded z-20">
            {imgIndex + 1} / {total}
          </div>
        )}

        {/* Nav arrows — absolutely over the FULL gallery width */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-20"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-20"
              aria-label="Next image"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ── Content row ── */}
      <div className="flex">

        {/* Agent block — dark navy, horizontal: photo left + text right */}
        <div className="flex-shrink-0 w-[30%] bg-[#152040] flex items-center gap-3 px-4 py-4">
          {/* Agent photo or initials */}
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/40 flex-shrink-0">
            {listing.listingAgentPhotoUrl ? (
              <img
                src={listing.listingAgentPhotoUrl}
                alt={listing.listingAgentDisplayName || ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white font-bold text-base">
                {agentInitials}
              </div>
            )}
          </div>

          {/* Agency + agent names stacked */}
          <div className="min-w-0">
            {listing.agencyDisplayName && (
              <p className="text-white font-bold text-sm leading-tight line-clamp-2 tracking-wide uppercase">
                {listing.agencyDisplayName}
              </p>
            )}
            {listing.listingAgentDisplayName && (
              <p className="text-white/75 text-xs mt-1 leading-snug line-clamp-2">
                {listing.listingAgentDisplayName}
                {listing.coListingAgentName && (
                  <> &amp;<br />{listing.coListingAgentName}</>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Property info */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0 relative">

          {/* Video badge — only shown when a video has been uploaded for this listing */}
          {listing.videoUrl && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Video
              </span>
            </div>
          )}

          {/* Title + location */}
          <div className="pr-20">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-0.5 line-clamp-2 leading-snug uppercase tracking-wide">
              {listing.headline}
            </h3>
            <p className="text-sm text-gray-500">
              {formatAddress(listing.location)}
            </p>
          </div>

          {/* Bottom row: stats LEFT + price RIGHT — same line */}
          <div className="flex items-center justify-between pt-3 mt-auto">
            <div className="flex items-center gap-4 text-sm text-gray-700">
              {listing.bedrooms > 0 && (
                <span className="flex items-center gap-1.5">
                  <BedIcon />
                  <span className="font-semibold">{listing.bedrooms}</span>
                </span>
              )}
              {listing.bathrooms > 0 && (
                <span className="flex items-center gap-1.5">
                  <BathIcon />
                  <span className="font-semibold">{listing.bathrooms}</span>
                </span>
              )}
              {listing.parking > 0 && (
                <span className="flex items-center gap-1.5">
                  <CarIcon />
                  <span className="font-semibold">{listing.parking}</span>
                </span>
              )}
            </div>
            <p className="text-base font-bold text-gray-900 whitespace-nowrap ml-4">{price}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
