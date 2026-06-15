import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Listing } from "../../types";
import { listingDetailPath } from "../../utils/listingRoutes";
import {
  formatSalePrice,
  formatRent,
  formatAddress,
  isNewListing,
} from "../../utils/format";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

function AgentCircle({ photoUrl, name, size }: { photoUrl?: string | null; name?: string | null; size: number }) {
  const [err, setErr] = useState(false);
  const px = `${size}px`;
  const initials = (name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
  return (
    <div style={{ width: px, height: px, minWidth: px }} className="rounded-full overflow-hidden border-2 border-black/30 bg-slate-600">
      {photoUrl && !err ? (
        <img src={photoUrl} alt={name || ''} className="w-full h-full object-cover" onError={() => setErr(true)} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-700 text-white font-bold text-xs">
          {initials}
        </div>
      )}
    </div>
  );
}

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const navigate = useNavigate();
  const isNew = isNewListing(listing.listedDate);

  const handleClick = () => {
    navigate(listingDetailPath(listing.listingType, listing.id, listing.location));
  };

  return (
    <Card
      onClick={handleClick}
      className="h-full flex flex-col group cursor-pointer overflow-hidden"
    >
      {/* Image with overlay on hover */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <img
          src={listing.images[0] || "https://via.placeholder.com/800x600"}
          alt={listing.headline}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <Badge
            variant={listing.listingType === "SALE" ? "primary" : "info"}
            className="shadow-lg"
          >
            {listing.listingType}
          </Badge>
          {isNew && (
            <Badge variant="warning" className="shadow-lg animate-pulse">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              New
            </Badge>
          )}
        </div>

        {/* Image count badge */}
        {listing.images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
            {listing.images.length} photos
          </div>
        )}

        {/* Agent overlay — bottom of image, like reference portals */}
        {listing.listingAgentDisplayName && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 py-3 z-10">
            <div className="flex items-center gap-2.5">
              {/* Overlapping avatars */}
              <div className="flex items-center shrink-0">
                <AgentCircle photoUrl={listing.listingAgentPhotoUrl} name={listing.listingAgentDisplayName} size={36} />
                {listing.coListingAgentName && (
                  <AgentCircle photoUrl={listing.coListingAgentPhotoUrl} name={listing.coListingAgentName} size={36} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate leading-tight">
                  {listing.listingAgentDisplayName}
                  {listing.coListingAgentName && ` & ${listing.coListingAgentName}`}
                </p>
                {listing.agencyDisplayName && (
                  <p className="text-white/70 text-[10px] truncate">{listing.agencyDisplayName}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col bg-white">
        {/* Price - Prominent */}
        <div className="text-sm sm:text-lg text-gray-500 font-bold text-gray-900 mb-3">
          {listing.listingType === "SALE"
            ? formatSalePrice(listing)
            : formatRent(listing)}
        </div>

        {/* Headline */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {listing.headline}
        </h3>

        <p className="text-xs sm:text-sm text-gray-600 mt-3 mb-5 line-clamp-3">
          Stunning waterfront property with panoramic views of Rangitoto Island.
          Features 4 bedrooms, 3 bathrooms, and beautifully landscaped gardens.
        </p>

        {/* Location with icon */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <svg
            className="w-4 h-4 mr-1.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {formatAddress(listing.location)}
        </div>

        {/* Stats with icons */}
        <div className="flex items-center gap-6 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-100">
          {listing.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="font-semibold text-gray-900">
                {listing.bedrooms}
              </span>
              <span className="text-gray-500">
                bed{listing.bedrooms !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {listing.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
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
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
              <span className="font-semibold text-gray-900">
                {listing.bathrooms}
              </span>
              <span className="text-gray-500">
                bath{listing.bathrooms !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {listing.parking > 0 && (
            <div className="flex items-center gap-1.5">
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span className="font-semibold text-gray-900">
                {listing.parking}
              </span>
              <span className="text-gray-500">parking</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
