import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listingsApi } from "../services/api";
import { Listing } from "../types";
import { searchPath, listingDetailPath } from "../utils/listingRoutes";
import { ListingGallery } from "../components/listings/ListingGallery";
import MortgageCalculator from "../components/ui/MortgageCalculator";
import { Breadcrumb } from "../components/listings/detail/Breadcrumb";
import { StickyHeader } from "../components/listings/detail/StickyHeader";
import { MapWithTabs } from "../components/listings/detail/MapWithTabs";
import { PropertyInsights } from "../components/listings/detail/PropertyInsights";
import { PastSalesTimeline } from "../components/listings/detail/PastSalesTimeline";
import { NearbySold } from "../components/listings/detail/NearbySold";
import { LocalSchools } from "../components/listings/detail/LocalSchools";
import { LandAndHazards } from "../components/listings/detail/LandAndHazards";

import {
  formatSalePrice,
  formatRent,
  formatFullAddress,
  formatRelativeDate,
  formatBathroomLabel,
} from "../utils/format";

import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";

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
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [isEnquireModalOpen, setIsEnquireModalOpen] = useState(false);
  const [isExpandedAboutPropert, setIsExpandedAboutPropert] = useState(false);
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    listingsApi.getListingById(id)
      .then((data) => {
        setListing(data);
        if (window.location.pathname === `/listing/${id}`) {
          navigate(listingDetailPath(data.listingType, data.id, data.location), { replace: true });
        }
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const [enquireForm, setEnquireForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
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
    if (canEnquire) setIsEnquireModalOpen(true);
  };
  const offMarketBanner =
    listing.status === "sold"
      ? "This property has been sold. Details are shown for reference only; enquiries are closed."
      : listing.status === "rented"
        ? "This property has been rented. Details are shown for reference only; enquiries are closed."
        : listing.status === "withdrawn"
          ? "This listing has been withdrawn. Enquiries are closed."
          : null;

  const handleEnquire = async () => {
    if (!listing?.id || !canEnquire) return;
    setEnquireError(null);
    if (!enquireForm.name.trim() || !enquireForm.email.trim() || !enquireForm.message.trim()) {
      setEnquireError("Please fill in name, email, and message.");
      return;
    }
    setEnquireSending(true);
    try {
      await listingsApi.submitEnquiry(listing.id, {
        name: enquireForm.name.trim(),
        email: enquireForm.email.trim(),
        phone: enquireForm.phone.trim() || undefined,
        message: enquireForm.message.trim(),
      });
      setShowToast(true);
      setIsEnquireModalOpen(false);
      setEnquireForm({ name: "", email: "", phone: "", message: "" });
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

        {offMarketBanner && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
            {offMarketBanner}
          </div>
        )}

        {/* Hero with agency card overlay */}
        <ListingGallery
          listing={listing}
          variant="hero"
          overlay={
            <div className="hidden md:block absolute right-4 bottom-4 z-20 w-[280px]">
              <div className="bg-[#0b0b0b] text-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-center min-h-[68px]">
                  <span className="font-bold tracking-wide text-lg uppercase text-center">
                    {listing.agencyDisplayName || 'Agency'}
                  </span>
                </div>
                <div className="bg-white py-4 flex justify-center">
                  <AgentCircle
                    photoUrl={listing.listingAgentPhotoUrl}
                    name={agentName}
                    size={72}
                    className="!border-4"
                  />
                </div>
              </div>
            </div>
          }
        />

        {/* Two-column layout: main content + sticky agent card */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <div className="space-y-4 sm:space-y-6 min-w-0">
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
              </div>

              {(listing.parking > 0 || (listing.offStreetParking ?? 0) > 0 || (listing.ensuiteCount ?? 0) > 0) && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Other Features</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.parking > 0 && (
                      <span className="inline-flex items-center text-sm px-3 py-1 rounded-full border border-gray-200">
                        {listing.parking} Garage parking
                      </span>
                    )}
                    {(listing.offStreetParking ?? 0) > 0 && (
                      <span className="inline-flex items-center text-sm px-3 py-1 rounded-full border border-gray-200">
                        {listing.offStreetParking} Off-street parking
                      </span>
                    )}
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
                    {listing.parkingDescription && (
                      <tr>
                        <th className="text-left text-gray-500 font-medium px-4 py-2 bg-gray-50">Parking</th>
                        <td className="px-4 py-2 text-gray-900">{listing.parkingDescription}</td>
                      </tr>
                    )}
                    {!listing.parkingDescription && listing.parking > 0 && (
                      <tr>
                        <th className="text-left text-gray-500 font-medium px-4 py-2 bg-gray-50">Parking</th>
                        <td className="px-4 py-2 text-gray-900">{listing.parking} car garaging</td>
                      </tr>
                    )}
                    {listing.agencyReference && (
                      <tr>
                        <th className="text-left text-gray-500 font-medium px-4 py-2 bg-gray-50">Agency reference</th>
                        <td className="px-4 py-2 text-gray-900">{listing.agencyReference}</td>
                      </tr>
                    )}
                    {(listing.totalUnits != null || listing.soldUnits != null || listing.remainingUnits != null) && (
                      <tr>
                        <th className="text-left text-gray-500 font-medium px-4 py-2 bg-gray-50">Availability</th>
                        <td className="px-4 py-2 text-gray-900">
                          {[
                            listing.soldUnits != null ? `${listing.soldUnits} sold` : null,
                            listing.remainingUnits != null ? `${listing.remainingUnits} remaining` : null,
                            listing.totalUnits != null ? `${listing.totalUnits} total` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </td>
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

              {/* Description */}
              <div className="mt-6">
                <div className="text-gray-700 text-sm sm:text-base">
                  <p className={`whitespace-pre-wrap ${!isExpandedAboutPropert ? 'line-clamp-5' : ''}`}>
                    {listing.description}
                  </p>
                  <button
                    onClick={() => setIsExpandedAboutPropert(!isExpandedAboutPropert)}
                    className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1"
                  >
                    {isExpandedAboutPropert ? 'Show less' : 'Show more'} <span aria-hidden>+</span>
                  </button>
                </div>
              </div>

              {/* Layout / builder / warranty / schoolZone blocks */}
              {(listing.layoutOptions || listing.builderName || listing.schoolZone || listing.warrantyInfo) && (
                <div className="mt-6 space-y-3 text-sm text-gray-700">
                  {listing.layoutOptions && (
                    <p><span className="font-semibold text-gray-900">Layout options:</span> {listing.layoutOptions}</p>
                  )}
                  {listing.builderName && (
                    <p><span className="font-semibold text-gray-900">Builder:</span> {listing.builderName}</p>
                  )}
                  {listing.schoolZone && (
                    <p><span className="font-semibold text-gray-900">School zone:</span> {listing.schoolZone}</p>
                  )}
                  {listing.warrantyInfo && (
                    <p><span className="font-semibold text-gray-900">Guarantee / warranty:</span> {listing.warrantyInfo}</p>
                  )}
                </div>
              )}

              {/* Nearby / Interior */}
              {(listing.amenitiesNearby || listing.interiorHighlights) && (
                <div className="mt-6 grid sm:grid-cols-2 gap-6">
                  {listing.amenitiesNearby && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Nearby</h3>
                      <p className="text-gray-600 whitespace-pre-wrap text-sm">{listing.amenitiesNearby}</p>
                    </div>
                  )}
                  {listing.interiorHighlights && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Interior</h3>
                      <p className="text-gray-600 whitespace-pre-wrap text-sm">{listing.interiorHighlights}</p>
                    </div>
                  )}
                </div>
              )}
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

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Features &amp; amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {listing.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" clipRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      <span className="text-sm text-gray-700 font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

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

            {/* Property Files */}
            <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
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
                <button
                  type="button"
                  disabled={!canEnquire}
                  onClick={openEnquireModal}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Request property files
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
                These property files are supplied by the agent and PropertyReach has no responsibility for the completeness or
                accuracy of the property files.
              </p>
            </section>

            {/* Map with tabs */}
            <MapWithTabs listing={listing} />

            {/* Property insights (stub) */}
            <PropertyInsights listing={listing} />

            {/* Past sales timeline (stub) */}
            <PastSalesTimeline listing={listing} />

            {/* Nearby sold (Beta) */}
            <NearbySold listing={listing} />

            {/* Mortgage calculator */}
            {listing.listingType === 'SALE' && (
              <MortgageCalculator defaultPrice={listing.price} />
            )}

            {/* Local schools (stub) */}
            <LocalSchools listing={listing} />

            {/* Land & hazards — LINZ parcel + GeoNet seismic context */}
            <LandAndHazards listing={listing} />
          </div>

          {/* Sidebar — sticky agent card */}
          <aside className="hidden md:block self-start">
            <div className="sticky top-36 space-y-3">
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="bg-[#0b0b0b] text-white px-5 py-4 text-center">
                  <span className="font-bold tracking-wide uppercase text-base">
                    {listing.agencyDisplayName || 'Agency'}
                  </span>
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
                  {listing.officePhone ? (
                    <a
                      href={`tel:${listing.officePhone.replace(/\s/g, '')}`}
                      className="inline-flex items-center justify-center gap-2 w-full text-primary-700 border border-primary-600 hover:bg-primary-50 rounded-lg px-4 py-3 font-semibold text-base"
                    >
                      📞 {listing.officePhone}
                    </a>
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      disabled={!canEnquire}
                      title={!canEnquire ? 'Enquiries are not available for this listing' : undefined}
                      onClick={openEnquireModal}
                    >
                      <span className="inline-flex items-center gap-2">📞 Contact details</span>
                    </Button>
                  )}
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

              {listing.officePhone && (
                <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                  <a
                    href={`tel:${listing.officePhone.replace(/\s/g, '')}`}
                    className="text-sm text-primary-600 font-medium"
                  >
                    {listing.officePhone}
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Enquire modal */}
      <Modal
        isOpen={isEnquireModalOpen}
        onClose={() => {
          setIsEnquireModalOpen(false);
          setEnquireError(null);
        }}
        title="Enquire About This Property"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsEnquireModalOpen(false);
                setEnquireError(null);
              }}
              className="w-full sm:w-auto"
              disabled={enquireSending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleEnquire()}
              className="w-full sm:w-auto"
              disabled={enquireSending}
            >
              {enquireSending ? 'Sending…' : 'Send Enquiry'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {enquireError && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-sm">{enquireError}</div>
          )}
          <Input
            label="Your Name"
            type="text"
            value={enquireForm.name}
            onChange={(e) => setEnquireForm({ ...enquireForm, name: e.target.value })}
            required
            placeholder="John Smith"
          />
          <Input
            label="Email Address"
            type="email"
            value={enquireForm.email}
            onChange={(e) => setEnquireForm({ ...enquireForm, email: e.target.value })}
            required
            placeholder="john@example.com"
          />
          <Input
            label="Phone Number (Optional)"
            type="tel"
            value={enquireForm.phone}
            onChange={(e) => setEnquireForm({ ...enquireForm, phone: e.target.value })}
            placeholder="+64 21 123 4567"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              rows={5}
              value={enquireForm.message}
              onChange={(e) => setEnquireForm({ ...enquireForm, message: e.target.value })}
              placeholder="I'm interested in this property and would like to know more..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
