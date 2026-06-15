import { useEffect, useState } from 'react';
import type { Listing } from '../../../types';
import { formatSalePrice, formatRent, formatFullAddress } from '../../../utils/format';

interface StickyHeaderProps {
  listing: Listing;
}

export function StickyHeader({ listing }: StickyHeaderProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 160);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const price = listing.listingType === 'SALE' ? formatSalePrice(listing) : formatRent(listing);
  const agentName =
    listing.listingAgentDisplayName ||
    [listing.listingOwner?.firstName, listing.listingOwner?.lastName].filter(Boolean).join(' ') ||
    'Agent';

  return (
    <div
      className={`fixed top-16 sm:top-[4.25rem] left-0 right-0 z-40 transition-transform duration-200 ${
        visible ? 'translate-y-0' : '-translate-y-[200%]'
      }`}
    >
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          {listing.agencyDisplayName && (
            <div className="hidden sm:flex items-center h-full bg-[#0b0b0b] text-white px-3 -my-0 mr-1">
              <span className="text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                {listing.agencyDisplayName}
              </span>
            </div>
          )}
          {listing.listingAgentPhotoUrl && (
            <img
              src={listing.listingAgentPhotoUrl}
              alt={agentName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
            />
          )}
          <span className="hidden md:inline text-sm font-medium text-gray-900 truncate max-w-[140px]">
            {agentName}
          </span>
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
            <p className="text-sm font-semibold text-gray-900 truncate">{formatFullAddress(listing)}</p>
            <p className="text-sm text-gray-600 whitespace-nowrap">{price}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: listing.headline, url: window.location.href }).catch(() => {});
                } else if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href).catch(() => {});
                }
              }}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 px-2 py-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
