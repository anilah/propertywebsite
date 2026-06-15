/**
 * MapView — Leaflet map with listing pins and popups.
 *
 * Uses OpenStreetMap tiles (free, no API key required).
 * Leaflet CSS is imported here; the component is lazy-loaded in ResultsPage
 * to avoid SSR/window issues.
 */
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import type { Listing } from '../../types';
import { listingDetailPath } from '../../utils/listingRoutes';
import { formatSalePrice, formatRent, formatAddress } from '../../utils/format';

// Fix Leaflet's default icon paths broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom price-label marker
function makePriceIcon(label: string, type: 'SALE' | 'RENT', highlighted: boolean) {
  const baseBg = type === 'SALE' ? '#1d4ed8' : '#059669';
  const bg = highlighted ? '#ea580c' : baseBg;
  const scale = highlighted ? 1.15 : 1;
  const z = highlighted ? 1000 : 'auto';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:${bg};
        color:#fff;
        font-size:11px;
        font-weight:700;
        padding:4px 8px;
        border-radius:20px;
        white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        border:2px solid #fff;
        cursor:pointer;
        transform: scale(${scale});
        transform-origin: 0 0;
        z-index: ${z};
        transition: background-color 120ms ease, transform 120ms ease;
      ">${label}</div>`,
    iconAnchor: [0, 0],
  });
}

// Auto-fit map bounds when listings change
function BoundsUpdater({ listings }: { listings: Listing[] }) {
  const map = useMap();
  useEffect(() => {
    const points = listings
      .filter((l) => l.latitude && l.longitude)
      .map((l) => [l.latitude!, l.longitude!] as [number, number]);
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 14 });
    }
  }, [listings, map]);
  return null;
}

// Pan to selected listing when it changes (from list-side click).
function PanToSelected({ listing }: { listing: Listing | null }) {
  const map = useMap();
  useEffect(() => {
    if (!listing || !listing.latitude || !listing.longitude) return;
    map.flyTo([listing.latitude, listing.longitude], Math.max(map.getZoom(), 14), {
      animate: true,
      duration: 0.5,
    });
  }, [listing, map]);
  return null;
}

interface MapViewProps {
  listings: Listing[];
  /** ID of the listing currently hovered in a paired list panel. */
  hoveredId?: string | null;
  /** ID of the listing currently selected (e.g. last clicked in the list). */
  selectedId?: string | null;
  /** Called when a marker is clicked. */
  onMarkerClick?: (id: string) => void;
  /** Height of the map container. Defaults to 620px. */
  height?: number | string;
  /** Optional className applied to the outer wrapper. */
  className?: string;
}

export function MapView({
  listings,
  hoveredId = null,
  selectedId = null,
  onMarkerClick,
  height = 620,
  className,
}: MapViewProps) {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);

  const mapped = useMemo(() => listings.filter((l) => l.latitude && l.longitude), [listings]);
  const unmapped = listings.length - mapped.length;

  const selectedListing = useMemo(
    () => (selectedId ? mapped.find((l) => l.id === selectedId) ?? null : null),
    [selectedId, mapped]
  );

  // Auckland CBD as default centre
  const defaultCenter: [number, number] = [-36.8485, 174.7633];

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm ${className ?? ''}`}
      style={{ height }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsUpdater listings={mapped} />
        <PanToSelected listing={selectedListing} />

        {mapped.map((listing) => {
          const price =
            listing.listingType === 'SALE'
              ? formatSalePrice(listing)
              : formatRent(listing);

          const thumbnail =
            listing.images?.[0] ||
            `https://picsum.photos/seed/${listing.id}/320/200`;

          const isHi = hoveredId === listing.id || selectedId === listing.id;
          const icon = makePriceIcon(price, listing.listingType as 'SALE' | 'RENT', isHi);

          return (
            <Marker
              key={`${listing.id}:${isHi ? 'hi' : 'lo'}`}
              position={[listing.latitude!, listing.longitude!]}
              icon={icon}
              eventHandlers={{
                click: () => onMarkerClick?.(listing.id),
              }}
            >
              <Popup minWidth={260} maxWidth={300}>
                {/* Popup card */}
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(listingDetailPath(listing.listingType, listing.id, listing.location))
                  }
                >
                  {/* Photo */}
                  <div
                    className="w-full h-36 overflow-hidden rounded-t mb-0"
                    style={{ width: 'calc(100% + 18px)', marginTop: -9, marginLeft: -9 }}
                  >
                    <img
                      src={thumbnail}
                      alt={listing.headline}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Badge */}
                  <div className="mt-2 mb-1">
                    <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      listing.listingType === 'SALE'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      For {listing.listingType === 'SALE' ? 'Sale' : 'Rent'}
                    </span>
                    {listing.propertyType && (
                      <span className="ml-1.5 text-[10px] text-gray-500">{listing.propertyType}</span>
                    )}
                  </div>

                  {/* Headline */}
                  <p className="text-sm font-bold text-gray-900 leading-snug mb-0.5 line-clamp-2">
                    {listing.headline}
                  </p>

                  {/* Address */}
                  <p className="text-xs text-gray-500 mb-2">
                    {formatAddress(listing.location)}
                  </p>

                  {/* Stats + Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs text-gray-600">
                      {listing.bedrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 20V10a2 2 0 012-2h16a2 2 0 012 2v10"/><path d="M2 14h20"/><path d="M7 8V6a1 1 0 011-1h8a1 1 0 011 1v2"/>
                          </svg>
                          {listing.bedrooms}
                        </span>
                      )}
                      {listing.bathrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 13h18v2a6 6 0 01-6 6H9a6 6 0 01-6-6v-2z"/><path d="M6 13V6a2 2 0 012-2h1"/><path d="M6 9h4"/>
                          </svg>
                          {listing.bathrooms}
                        </span>
                      )}
                      {listing.parking > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 11l1.5-4.5h11L19 11"/><rect x="2" y="11" width="20" height="7" rx="2"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>
                          </svg>
                          {listing.parking}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900">{price}</p>
                  </div>

                  {/* View listing link */}
                  <p className="mt-2 text-xs text-primary-600 font-semibold text-right">
                    View listing →
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* No-coordinates notice */}
      {unmapped > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 shadow-md pointer-events-none">
          {unmapped} listing{unmapped > 1 ? 's' : ''} without coordinates not shown
        </div>
      )}
    </div>
  );
}
