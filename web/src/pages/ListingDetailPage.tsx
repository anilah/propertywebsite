import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { listingsApi } from "../services/api";
import { Listing } from "../types";
import { searchPath, listingDetailPath } from "../utils/listingRoutes";
import { ListingGallery } from "../components/listings/ListingGallery";
import { Breadcrumb } from "../components/listings/detail/Breadcrumb";
import { StickyHeader } from "../components/listings/detail/StickyHeader";
import { MapWithTabs } from "../components/listings/detail/MapWithTabs";
import { LocalSchools } from "../components/listings/detail/LocalSchools";

import {
  formatSalePrice,
  formatRent,
  formatFullAddress,
  formatRelativeDate,
  formatBathroomLabel,
} from "../utils/format";

import { Button } from "../components/ui/Button";
import {
  trackListingView,
  trackEnquiry,
} from "../components/analytics/GoogleAnalytics";
import { toWhatsAppUrl } from "../utils/nzPhone";
import { captureLeadAttribution, getLeadAttribution, leadSourceLabel } from "../utils/leadLinks";
import { EnquiryFormModal } from "../components/listings/EnquiryFormModal";
import { MoreFromAgentSection } from "../components/listings/MoreFromAgentSection";
import { useSiteConfig } from "../context/SiteConfigContext";

/** Human-friendly listing reference shown in enquiry templates (agency reference, or short ID fallback). */
function listingRef(listing: Listing): string {
  return listing.agencyReference?.trim() || listing.id.slice(0, 8).toUpperCase();
}

/**
 * Pre-filled enquiry message for the WhatsApp deep-link, built from the
 * admin-managed template (Admin → Branding). Placeholders: {{listingId}}, {{suburb}}, {{headline}}, {{url}}
 */
function buildContactMessage(listing: Listing, template: string): string {
  const url = `${window.location.origin}${listingDetailPath(listing.listingType, listing.id, listing.location)}`;
  const place = listing.location?.suburb ?? listing.headline;
  return template
    .replace(/\{\{listingId\}\}/g, listingRef(listing))
    .replace(/\{\{suburb\}\}/g, place)
    .replace(/\{\{headline\}\}/g, listing.headline)
    .replace(/\{\{url\}\}/g, url);
}

function AgentCircle({
  photoUrl,
  name,
  size,
  className = '',
}: {
  photoUrl?: string | null;
  name?: string | null;
  size: number;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const px = `${size}px`;
  const textSize = size >= 64 ? 'text-xl' : size >= 44 ? 'text-sm' : 'text-[10px]';

  return (
    <div
      style={{ width: px, height: px, minWidth: px }}
      className={`rounded-full overflow-hidden bg-gray-200 border-[3px] border-white shadow-md ${className}`}
    >
      {photoUrl && !imgError ? (
        <img
          src={photoUrl}
          alt={name || 'Agent'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : initials ? (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white ${textSize}`}>
          {initials}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
          <svg className="w-2/5 h-2/5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string; listingType?: string; region?: string; district?: string; suburb?: string }>();
  const navigate = useNavigate();
  const { config: siteConfig } = useSiteConfig();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [isEnquireModalOpen, setIsEnquireModalOpen] = useState(false);
  const [isExpandedAboutPropert, setIsExpandedAboutPropert] = useState(false);
  const [enquireSeenOn, setEnquireSeenOn] = useState<string | undefined>();
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    listingsApi.getListingById(id)
      .then((data) => {
        setListing(data);
        trackListingView({
          id: data.id,
          headline: data.headline,
          listingType: data.listingType,
          propertyType: data.propertyType,
          suburb: data.location?.suburb,
          district: data.location?.district,
          region: data.location?.region,
          price: data.price,
          rentPerWeek: data.rentPerWeek,
          bedrooms: data.bedrooms,
          agencyDisplayName: data.agencyDisplayName ?? undefined,
        });
        // Ad / post links: keep utm attribution (source, “You can see more”) but do not auto-open the form.
        const params = new URLSearchParams(window.location.search);
        captureLeadAttribution(data.id, params, document.referrer);
        const source = params.get("utm_source")?.toLowerCase() ?? "";
        if (["facebook", "instagram", "tiktok", "whatsapp"].includes(source)) {
          setEnquireSeenOn(leadSourceLabel(source));
        }
        // Drop legacy enquire=1; leave utm_* so refresh still attributes the visit
        const hadEnquire = params.get("enquire") === "1";
        if (hadEnquire) params.delete("enquire");
        const query = params.toString() ? `?${params.toString()}` : "";
        if (window.location.pathname === `/listing/${id}`) {
          navigate(`${listingDetailPath(data.listingType, data.id, data.location)}${query}`, { replace: true });
        } else if (hadEnquire) {
          navigate(`${window.location.pathname}${query}`, { replace: true });
        }
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const [showToast, setShowToast] = useState(false);
  const [enquireError, setEnquireError] = useState<string | null>(null);
  const [enquireSending, setEnquireSending] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Listing not found</h1>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate(searchPath("SALE"))} variant="primary" size="lg" className="w-full sm:w-auto">
              Browse Properties
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canEnquire = listing.status === "published";
  const openEnquireModal = () => {
    if (!canEnquire) return;
    // Prefer source captured from a tracked post link earlier in this session
    const attr = getLeadAttribution(listing.id);
    const source = attr?.source?.toLowerCase() ?? "";
    setEnquireSeenOn(
      ["facebook", "instagram", "tiktok", "whatsapp"].includes(source)
        ? leadSourceLabel(source)
        : undefined
    );
    setEnquireError(null);
    setIsEnquireModalOpen(true);
  };
  const previewBanner =
    listing.status === "draft"
      ? "Preview only — this listing is still a draft and is not visible to the public."
      : listing.status === "pending_approval"
        ? "Preview only — this listing is awaiting approval and is not live yet."
        : null;
  const offMarketBanner =
    listing.status === "sold"
      ? "This property has been sold. Details are shown for reference only; enquiries are closed."
      : listing.status === "rented"
        ? "This property has been rented. Details are shown for reference only; enquiries are closed."
        : listing.status === "withdrawn"
          ? "This listing has been withdrawn. Enquiries are closed."
          : null;

  const handleEnquire = async (payload: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) => {
    if (!listing?.id || !canEnquire) return;
    setEnquireError(null);
    setEnquireSending(true);
    try {
      await listingsApi.submitEnquiry(listing.id, {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
        attribution: getLeadAttribution(listing.id),
      });
      trackEnquiry({
        id: listing.id,
        headline: listing.headline,
        listingType: listing.listingType,
        propertyType: listing.propertyType,
        suburb: listing.location?.suburb,
        district: listing.location?.district,
        region: listing.location?.region,
        price: listing.price,
        rentPerWeek: listing.rentPerWeek,
        agencyDisplayName: listing.agencyDisplayName ?? undefined,
      });
      setShowToast(true);
      setIsEnquireModalOpen(false);
      setTimeout(() => setShowToast(false), 4000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not send enquiry";
      setEnquireError(msg);
    } finally {
      setEnquireSending(false);
    }
  };

  const price = listing.listingType === "SALE" ? formatSalePrice(listing) : formatRent(listing);
  const agentName =
    listing.listingAgentDisplayName ||
    [listing.listingOwner?.firstName, listing.listingOwner?.lastName].filter(Boolean).join(' ') ||
    'Agent';

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyHeader listing={listing} />

      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 sm:top-24 right-2 sm:right-4 left-2 sm:left-auto max-w-sm mx-auto sm:mx-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl z-50 animate-slide-in flex items-center gap-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div className="min-w-0">
            <div className="font-semibold text-sm sm:text-base">Enquiry Sent!</div>
            <div className="text-xs sm:text-sm text-green-100">We'll get back to you shortly.</div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Top bar: back + breadcrumb + watchlist */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => navigate(searchPath(listing.listingType))}
            className="text-primary-600 hover:text-primary-700 flex items-center gap-1.5 font-medium text-sm shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to search results
          </button>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <Breadcrumb listing={listing} />
        </div>

        {previewBanner && (
          <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950" role="status">
            <span className="font-semibold">Admin preview.</span> {previewBanner}
            <Link
              to={`/admin/listings/${listing.id}/edit`}
              className="ml-2 font-semibold text-sky-800 underline underline-offset-2 hover:text-sky-950"
            >
              Back to edit
            </Link>
          </div>
        )}

        {offMarketBanner && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
            {offMarketBanner}
          </div>
        )}

        {/* Hero with agency card overlay */}
        <ListingGallery
          listing={listing}
          variant="hero"
        />

        {/* ── Mobile-only: slim agent pill ── */}
        <div className="md:hidden mt-3 px-1">
          <div className="flex items-center gap-2.5 py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
            <AgentCircle photoUrl={listing.listingAgentPhotoUrl} name={agentName} size={32} className="shrink-0" />
            <p className="text-sm text-gray-700 min-w-0 truncate">
              <span className="font-semibold">{agentName}</span>
              {listing.agencyDisplayName && (
                <span className="text-gray-400"> · {listing.agencyDisplayName}</span>
              )}
            </p>
          </div>
        </div>

        {/* Two-column layout: main content + sticky agent card */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          {/* Extra bottom padding on mobile so sticky bar doesn't cover content */}
          <div className="space-y-4 sm:space-y-6 min-w-0 pb-40 md:pb-0">
            {/* Title / price / stats block */}
            <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
              <p className="text-sm text-green-700 font-semibold mb-2">
                Listed: {formatRelativeDate(listing.listedDate)}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{listing.headline}</h1>
              <p className="text-gray-600 mb-3">{formatFullAddress(listing)}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{price}</p>

              <div className="flex flex-wrap gap-2">
                {listing.bedrooms > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white">
                    🛏 <span className="font-semibold">{listing.bedrooms}</span> Beds
                  </span>
                )}
                {(listing.bathrooms > 0 || (listing.halfBathrooms ?? 0) > 0) && (
                  <span className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white">
                    🛁 <span className="font-semibold">{formatBathroomLabel(listing)}</span>
                  </span>
                )}
                {listing.floorArea && (
                  <span className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white">
                    📐 <span className="font-semibold">{listing.floorArea}m²</span> Floor
                  </span>
                )}
                {listing.landArea && (
                  <span className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white">
                    🌳 <span className="font-semibold">{listing.landArea}m²</span> Land
                  </span>
                )}
                {(listing.listingType === 'SALE' || listing.listingType === 'RENT') &&
                  (listing.lounges ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white">
                    🛋 <span className="font-semibold">{listing.lounges}</span> Lounge
                    {(listing.lounges ?? 0) !== 1 ? 's' : ''}
                  </span>
                )}
                {(listing.listingType === 'SALE' || listing.listingType === 'RENT') &&
                  (listing.livingRooms ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white">
                    🏘 <span className="font-semibold">{listing.livingRooms}</span> Living
                  </span>
                )}
              </div>

              {((listing.ensuiteCount ?? 0) > 0) && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Other Features</p>
                  <div className="flex flex-wrap gap-2">
                    {(listing.ensuiteCount ?? 0) > 0 && (
                      <span className="inline-flex items-center text-sm px-3 py-1 rounded-full border border-gray-200">
                        {listing.ensuiteCount} Ensuite
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Details table */}
              <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden text-sm">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <th className="text-left text-gray-500 font-medium px-4 py-2 bg-gray-50 w-1/3">Property type</th>
                      <td className="px-4 py-2 text-gray-900">{listing.propertyType}</td>
                    </tr>
                    {(listing.listingType === 'SALE' || listing.listingType === 'RENT') &&
                      (listing.lounges ?? 0) > 0 && (
                      <tr>
                        <th className="text-left text-gray-500 font-medium px-4 py-2 bg-gray-50">No. of lounges</th>
                        <td className="px-4 py-2 text-gray-900">{listing.lounges}</td>
                      </tr>
                    )}
                    {(listing.listingType === 'SALE' || listing.listingType === 'RENT') &&
                      (listing.livingRooms ?? 0) > 0 && (
                      <tr>
                        <th className="text-left text-gray-500 font-medium px-4 py-2 bg-gray-50">No. of living</th>
                        <td className="px-4 py-2 text-gray-900">{listing.livingRooms}</td>
                      </tr>
                    )}
                    {listing.parkingDescription ? (
                      <tr>
                        <th className="text-left text-gray-500 font-medium px-4 py-2 bg-gray-50">Parking</th>
                        <td className="px-4 py-2 text-gray-900">{listing.parkingDescription}</td>
                      </tr>
                    ) : (listing.parking > 0 || (listing.offStreetParking ?? 0) > 0) ? (
                      <tr>
                        <th className="text-left text-gray-500 font-medium px-4 py-2 bg-gray-50">Parking</th>
                        <td className="px-4 py-2 text-gray-900">
                          {[
                            listing.parking > 0 ? `${listing.parking} garage` : null,
                            (listing.offStreetParking ?? 0) > 0 ? `${listing.offStreetParking} off-street` : null,
                          ].filter(Boolean).join(' + ')}
                        </td>
                      </tr>
                    ) : null}
                    {listing.agencyReference && (
                      <tr>
                        <th className="text-left text-gray-500 font-medium px-4 py-2 bg-gray-50">Agency reference</th>
                        <td className="px-4 py-2 text-gray-900">{listing.agencyReference}</td>
                      </tr>
                    )}
                    {listing.expectedCompletion && (
                      <tr>
                        <th className="text-left text-gray-500 font-medium px-4 py-2 bg-gray-50">Expected completion</th>
                        <td className="px-4 py-2 text-gray-900">{listing.expectedCompletion}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Description — renders rich HTML (from Tiptap) or plain text (legacy) */}
              <div className="mt-6">
                <div className="text-gray-700 text-sm sm:text-base">
                  {listing.description?.trimStart().startsWith('<') ? (
                    // Rich HTML from editor
                    <div
                      className={`prose prose-sm max-w-none
                        prose-headings:text-gray-900 prose-h2:text-lg prose-h3:text-base
                        prose-p:leading-relaxed prose-p:text-gray-700
                        prose-ul:pl-5 prose-ol:pl-5 prose-li:my-0.5
                        prose-blockquote:border-teal-400 prose-blockquote:text-gray-600
                        prose-hr:border-gray-200
                        ${!isExpandedAboutPropert ? 'line-clamp-5' : ''}`}
                      dangerouslySetInnerHTML={{ __html: listing.description }}
                    />
                  ) : (
                    // Legacy plain text
                    <p className={`whitespace-pre-wrap ${!isExpandedAboutPropert ? 'line-clamp-5' : ''}`}>
                      {listing.description}
                    </p>
                  )}
                  <button
                    onClick={() => setIsExpandedAboutPropert(!isExpandedAboutPropert)}
                    className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1"
                  >
                    {isExpandedAboutPropert ? 'Show less' : 'Show more'} <span aria-hidden>+</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Open homes */}
            <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Open home times</h2>
              {listing.openHomes && listing.openHomes.length > 0 ? (
                <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                  {listing.openHomes.map((o) => (
                    <li key={o.id || o.startsAt} className="px-4 py-3 flex items-center justify-between gap-3 bg-gray-50">
                      <div className="text-sm text-gray-900">
                        {o.label && <span className="font-medium">{o.label}: </span>}
                        {new Date(o.startsAt).toLocaleString("en-NZ", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {o.endsAt &&
                          ` – ${new Date(o.endsAt).toLocaleTimeString("en-NZ", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}`}
                      </div>
                      <span aria-hidden>📅</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">
                  {listing.openHomesNote?.trim() || 'No open home times scheduled.'}
                </p>
              )}
              <button
                type="button"
                disabled={!canEnquire}
                onClick={openEnquireModal}
                className="mt-3 text-primary-600 hover:text-primary-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request a viewing
              </button>
            </section>

            {/* Video */}
            {listing.videoUrl && (
              <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Property video</h2>
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                  <video src={listing.videoUrl} controls className="w-full h-full" />
                </div>
              </section>
            )}

            {/* Updates timeline */}
            {listing.updates && listing.updates.length > 0 && (
              <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Property updates</h2>
                <ul className="space-y-5">
                  {listing.updates.map((u) => (
                    <li key={u.id || u.createdAt} className="border-b border-gray-100 last:border-0 pb-5 last:pb-0">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        {u.authorName && <span className="font-medium text-gray-800">{u.authorName}</span>}
                        {u.createdAt && (
                          <span>
                            {new Date(u.createdAt).toLocaleDateString("en-NZ", {
                              weekday: "short", day: "numeric", month: "short",
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">{u.body}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Property Files — only shown for sale listings, not rentals or flatmate listings */}
            {listing.listingType === 'SALE' && <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Property Files</h2>

              <div className="border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <AgentCircle
                  photoUrl={listing.listingAgentPhotoUrl}
                  name={agentName}
                  size={56}
                  className="!border-2"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Discover more about this property.</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Request the files from {agentName.split(' ')[0] || 'the agent'}.
                  </p>
                </div>
                {/* Desktop only — PWA/mobile uses sticky bottom “Contact Agent” */}
                <button
                  type="button"
                  disabled={!canEnquire}
                  onClick={openEnquireModal}
                  className="hidden sm:inline-flex w-full sm:w-auto items-center justify-center bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Contact Agent
                </button>
              </div>

              {listing.documents && listing.documents.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {listing.documents.map((d) => (
                    <li key={d.id || d.title} className="flex items-center justify-between gap-2 border border-gray-100 rounded-lg px-4 py-3">
                      <span className="font-medium text-gray-900 text-sm">{d.title}</span>
                      {d.url ? (
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600">
                          Download
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled={!canEnquire}
                          onClick={openEnquireModal}
                          className="text-sm text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Request
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-gray-500 italic mt-4">
                These property files are supplied by the agent and Kaboo Homes has no responsibility for the completeness or
                accuracy of the property files.
              </p>
            </section>}

            {/* Map with tabs */}
            <MapWithTabs listing={listing} />

            {/* Local schools / enrolment zones */}
            <LocalSchools listing={listing} />
          </div>

          {/* Sidebar — sticky agent card */}
          <aside className="hidden md:block self-start">
            <div className="sticky top-36 space-y-3">
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div
                  className="px-5 py-4 text-center flex flex-col items-center justify-center gap-1.5"
                  style={{ backgroundColor: listing.agencyBrandColor || '#0b0b0b' }}
                >
                  {listing.agencyLogoUrl ? (
                    <img
                      src={listing.agencyLogoUrl}
                      alt={listing.agencyDisplayName || 'Agency'}
                      className="h-10 max-w-[180px] object-contain"
                    />
                  ) : (
                    <span className="font-bold tracking-wide uppercase text-base text-white">
                      {listing.agencyDisplayName || 'Agency'}
                    </span>
                  )}
                </div>
                <div className="px-5 pt-5 -mt-8 text-center">
                  <div className="flex justify-center">
                    <AgentCircle
                      photoUrl={listing.listingAgentPhotoUrl}
                      name={agentName}
                      size={80}
                      className="!border-4"
                    />
                  </div>
                  <p className="font-semibold text-gray-900 mt-3">{agentName}</p>
                  <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 inline-block" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                  </div>
                </div>
                <div className="px-5 pb-5 pt-4 space-y-2.5">
                  {(() => {
                    const waNumber = listing.listingOwner?.whatsappNumber || listing.whatsappNumber;
                    const waUrl = waNumber
                      ? toWhatsAppUrl(waNumber, buildContactMessage(listing, siteConfig.contactMessageTemplate))
                      : null;
                    return waUrl ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5c] text-white rounded-lg px-4 py-3 font-semibold text-base transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>
                    ) : null;
                  })()}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!canEnquire}
                    title={!canEnquire ? 'Enquiries are not available for this listing' : undefined}
                    onClick={openEnquireModal}
                  >
                    <span className="inline-flex items-center gap-2">✉ Email enquiry</span>
                  </Button>
                  {listing.agencyDisplayName && (
                    <p className="text-[11px] text-primary-600 text-center pt-2">
                      {listing.agencyDisplayName}
                      {listing.agencyLicense ? `, (Licensed: ${listing.agencyLicense})` : ''}
                    </p>
                  )}
                </div>
              </div>

              {(listing.platinumPartner || listing.appraisalUrl) && (
                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                  <p className="text-sm font-semibold text-gray-900 mb-1">🏠 Property Partner</p>
                  <p className="text-xs text-gray-600 mb-2">
                    Advertise your property with this office to gain access to exclusive benefits.
                  </p>
                  <a
                    href={listing.appraisalUrl || listing.officeWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 text-xs font-medium hover:underline"
                  >
                    Learn more
                  </a>
                </div>
              )}

            </div>
          </aside>
        </div>

        {/* Ad-link visitors: more from same agent / agency */}
        <MoreFromAgentSection
          listingId={listing.id}
          agentName={agentName}
          agencyName={listing.agencyDisplayName || listing.listingOwner?.agencyName}
        />
      </div>

      {/* ── Mobile/PWA sticky contact bar — sits above app bottom tabs ── */}
      <div className="md:hidden fixed inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-2.5 flex gap-2.5 shadow-[0_-2px_12px_rgba(0,0,0,0.07)] bottom-[calc(3.5rem+env(safe-area-inset-bottom))]">
        {(() => {
          const waNumber = listing.listingOwner?.whatsappNumber || listing.whatsappNumber;
          const waUrl = waNumber
            ? toWhatsAppUrl(waNumber, buildContactMessage(listing, siteConfig.contactMessageTemplate))
            : null;
          return waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center bg-[#25D366] hover:bg-[#1ebe5c] text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
            >
              WhatsApp
            </a>
          ) : null;
        })()}
        <button
          type="button"
          disabled={!canEnquire}
          onClick={openEnquireModal}
          className="flex-[1.4] flex items-center justify-center bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
        >
          Contact Agent
        </button>
      </div>

      <EnquiryFormModal
        isOpen={isEnquireModalOpen}
        listingType={listing.listingType}
        sending={enquireSending}
        error={enquireError}
        seenOn={enquireSeenOn}
        onClose={() => {
          if (enquireSending) return;
          setIsEnquireModalOpen(false);
          setEnquireError(null);
        }}
        onSubmit={(payload) => void handleEnquire(payload)}
      />
    </div>
  );
}
