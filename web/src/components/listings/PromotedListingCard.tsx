import { useNavigate } from "react-router-dom";
import { Listing } from "../../types";
import { listingDetailPath } from "../../utils/listingRoutes";
import {
  formatSalePrice,
  formatRent,
  formatAddress,
} from "../../utils/format";

interface PromotedListingCardProps {
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

export function PromotedListingCard({ listing }: PromotedListingCardProps) {
  const navigate = useNavigate();

  const placeholder = `https://picsum.photos/seed/${listing.id}/1600/900`;
  const heroImage =
    (Array.isArray(listing.images) && listing.images[0]) || placeholder;

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
      className="bg-white rounded-lg border-2 border-orange-400 shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden ring-2 ring-orange-100"
    >
      {/* ── Single hero image — matches regular card height ── */}
      <div className="relative h-60 sm:h-72 lg:h-80 overflow-hidden">
        <img
          src={heroImage}
          alt={listing.headline}
          className="w-full h-full object-cover"
        />

        {/* Featured ribbon — top-left */}
        <div className="absolute top-3 left-0 bg-orange-500 text-white text-[11px] sm:text-xs font-bold px-3 py-1 shadow-md flex items-center gap-1.5 z-20 uppercase tracking-wider">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Featured
        </div>

        {/* Video badge — top-right of hero, only when a video is uploaded */}
        {listing.videoUrl && (
          <div className="absolute top-4 right-4 z-20">
            <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Video
            </span>
          </div>
        )}
      </div>

      {/* ── Content row ── */}
      <div className="flex">

        {/* Agent block — dark navy, horizontal: photo left + text right */}
        <div className="flex-shrink-0 w-[30%] bg-[#152040] flex items-center gap-3 px-4 py-4">
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
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
          {/* Title + location */}
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-0.5 line-clamp-2 leading-snug uppercase tracking-wide">
              {listing.headline}
            </h3>
            <p className="text-sm text-gray-500">
              {formatAddress(listing.location)}
            </p>
          </div>

          {/* Bottom row: stats LEFT + price RIGHT */}
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
