import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Listing } from "../../types";
import { listingDetailPath } from "../../utils/listingRoutes";
import { formatSalePrice, formatRent, formatListingLocationLine } from "../../utils/format";
import { listingPhotoUrls } from "../../utils/listingImages";

interface ResultsListingCardProps {
  listing: Listing;
  onCardClick?: () => void;
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

function AgentAvatar({ photoUrl, name, size = 56 }: { photoUrl?: string | null; name?: string | null; size?: number }) {
  const [err, setErr] = useState(false);
  const initials = (name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
  const px = `${size}px`;
  return (
    <div
      style={{ width: px, height: px, minWidth: px }}
      className="rounded-full overflow-hidden border-[3px] border-white/60 shadow-md bg-slate-500"
    >
      {photoUrl && !err ? (
        <img src={photoUrl} alt={name || ''} className="w-full h-full object-cover" onError={() => setErr(true)} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-700 text-white font-bold text-sm">
          {initials}
        </div>
      )}
    </div>
  );
}

const DEFAULT_BRAND_COLOR = '#152040';

export function ResultsListingCard({ listing, onCardClick }: ResultsListingCardProps) {
  const navigate = useNavigate();
  const [mainImgIdx, setMainImgIdx] = useState(0);

  const brandColor = listing.agencyBrandColor?.trim() || DEFAULT_BRAND_COLOR;

  const rawImages = listingPhotoUrls(listing);
  const placeholder = `https://picsum.photos/seed/${listing.id}/800/600`;
  const images = rawImages.length > 0 ? rawImages : [placeholder];
  const total = images.length;

  const mainImage  = images[mainImgIdx] || placeholder;
  const hasGallery = total > 1;

  const handleClick = () => {
    onCardClick?.();
    navigate(listingDetailPath(listing.listingType, listing.id, listing.location));
  };

  const price = listing.listingType === 'SALE' ? formatSalePrice(listing) : formatRent(listing);

  const hasAgencyHeader = !!(listing.agencyLogoUrl || listing.agencyDisplayName);
  const hasAgent = !!(listing.listingAgentDisplayName || listing.listingAgentPhotoUrl);

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden flex flex-col"
    >

      {/* ── 1. Agency brand bar ── */}
      {hasAgencyHeader && (
        <div
          className="w-full flex items-center justify-center px-6 py-2.5 min-h-[44px]"
          style={{ backgroundColor: brandColor }}
        >
          {listing.agencyLogoUrl ? (
            <img
              src={listing.agencyLogoUrl}
              alt={listing.agencyDisplayName || 'Agency'}
              className="h-7 max-w-[180px] object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span className="text-white font-bold text-sm tracking-widest uppercase">
              {listing.agencyDisplayName}
            </span>
          )}
        </div>
      )}

      {/* ── 2. Single full-width photo with prev/next arrows ── */}
      <div className="relative h-[240px] sm:h-[360px] lg:h-[506px] bg-gray-100 overflow-hidden">

        <img
          src={mainImage}
          alt={listing.headline}
          className="w-full h-full object-cover"
        />

        {/* Open home pill — top-left */}
        {listing.openHomes && listing.openHomes.length > 0 && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-sm z-10">
            {(() => {
              const oh = listing.openHomes[0];
              const d = new Date(oh.startsAt);
              return `Open ${d.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}`;
            })()}
          </div>
        )}

        {/* Image counter — bottom-right */}
        {hasGallery && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded z-10">
            {mainImgIdx + 1} / {total}
          </div>
        )}

        {/* Prev / Next arrows */}
        {hasGallery && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMainImgIdx((i) => (i - 1 + total) % total); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md z-20"
              aria-label="Previous"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMainImgIdx((i) => (i + 1) % total); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md z-20"
              aria-label="Next"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* R+A badge — top-right of whole collage */}
        {listing.platinumPartner && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-[11px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 z-20">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            R+A
          </div>
        )}
      </div>

      {/* ── 3. Bottom row: agent + details (stack on mobile) ── */}
      <div className="flex flex-1 flex-col sm:flex-row">

        {/* Agent block — brand color */}
        <div
          className="sm:w-[34%] w-full flex-shrink-0 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-2 px-3 py-3 sm:py-4 text-left sm:text-center"
          style={{ backgroundColor: brandColor }}
        >
          {/* Overlapping agent avatars */}
          {hasAgent && (
            <div className="flex items-center justify-center">
              <AgentAvatar photoUrl={listing.listingAgentPhotoUrl} name={listing.listingAgentDisplayName} size={52} />
              {listing.coListingAgentName && (
                <div className="-ml-3 z-10">
                  <AgentAvatar photoUrl={listing.coListingAgentPhotoUrl} name={listing.coListingAgentName} size={52} />
                </div>
              )}
            </div>
          )}

          {/* Names */}
          <div className="min-w-0 w-full">
            {listing.listingAgentDisplayName && (
              <p className="text-white font-semibold text-xs leading-snug line-clamp-2">
                {listing.listingAgentDisplayName}
                {listing.coListingAgentName && (
                  <> &amp; {listing.coListingAgentName}</>
                )}
              </p>
            )}
            {listing.agencyDisplayName && !hasAgencyHeader && (
              <p className="text-white/70 text-[10px] mt-0.5 line-clamp-2 uppercase tracking-wide">
                {listing.agencyDisplayName}
              </p>
            )}
            {listing.agencyLicense && (
              <p className="text-white/50 text-[10px] mt-0.5 line-clamp-2">
                {listing.agencyLicense}
              </p>
            )}
          </div>

        </div>

        {/* Property details */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">

          {/* Title + location */}
          <div>
            {/* Video + listed date */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {listing.videoUrl && (
                <span className="inline-flex items-center gap-1 bg-green-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  Video
                </span>
              )}
              {listing.listedDate && (
                <span className="text-xs text-gray-400">
                  Listed {new Date(listing.listedDate).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
              {listing.headline}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-1">
              {formatListingLocationLine(listing)}
            </p>
          </div>

          {/* Stats + price */}
          <div className="flex items-center justify-between pt-2 mt-auto">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              {listing.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <BedIcon /><span className="font-semibold">{listing.bedrooms}</span>
                </span>
              )}
              {listing.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <BathIcon /><span className="font-semibold">{listing.bathrooms}</span>
                </span>
              )}
              {listing.parking > 0 && (
                <span className="flex items-center gap-1">
                  <CarIcon /><span className="font-semibold">{listing.parking}</span>
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap ml-2">{price}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
