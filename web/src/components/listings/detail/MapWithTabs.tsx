import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Listing } from '../../../types';
import { formatFullAddress } from '../../../utils/format';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function MapWithTabs({ listing }: { listing: Listing }) {
  const fullAddress = formatFullAddress(listing);
  const hasCoords =
    listing.latitude != null &&
    listing.longitude != null &&
    !Number.isNaN(listing.latitude) &&
    !Number.isNaN(listing.longitude);

  const center: [number, number] = useMemo(() => {
    if (hasCoords) return [listing.latitude!, listing.longitude!];
    return [-36.8485, 174.7633]; // Auckland fallback
  }, [hasCoords, listing.latitude, listing.longitude]);

  const googleMapsUrl =
    listing.googleMapsUrl ||
    (hasCoords
      ? `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`
      : `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}`);
  const streetViewUrl =
    listing.streetViewUrl ||
    (hasCoords
      ? `https://www.google.com/maps?q=&layer=c&cbll=${listing.latitude},${listing.longitude}`
      : `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&layer=c`);

  return (
    <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
      <div className="relative isolate z-0 w-full h-[420px] rounded-xl overflow-hidden border border-gray-200">
        <MapContainer
          center={center}
          zoom={hasCoords ? 15 : 11}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hasCoords && (
            <Marker position={[listing.latitude!, listing.longitude!]}>
              <Popup>{fullAddress}</Popup>
            </Marker>
          )}
        </MapContainer>

        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-lg shadow-md p-3 max-w-[280px]">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Location</div>
          <p className="text-sm font-medium text-gray-900 leading-snug mb-2">{fullAddress}</p>
          <div className="flex gap-2">
            <a
              href={streetViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium bg-primary-600 text-white px-3 py-1.5 rounded hover:bg-primary-700"
            >
              Street view
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium bg-white text-gray-800 border border-gray-300 px-3 py-1.5 rounded hover:border-gray-400"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 italic mt-3">
        While we've done our best to correctly map this location, it may not be exact.
      </p>
    </section>
  );
}
