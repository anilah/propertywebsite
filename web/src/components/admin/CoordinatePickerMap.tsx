/**
 * Interactive map for picking a listing pin — click to place, drag to adjust.
 * Lazy-loaded by ListingFormExtras to keep Leaflet out of the main admin bundle.
 */
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/** Auckland CBD — sensible NZ default when no pin is set yet. */
const NZ_DEFAULT: [number, number] = [-36.8485, 174.7633];

interface Props {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
}

function ClickToPlace({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export function CoordinatePickerMap({ latitude, longitude, onChange }: Props) {
  const hasPin = typeof latitude === 'number' && typeof longitude === 'number';
  const center: [number, number] = hasPin ? [latitude, longitude] : NZ_DEFAULT;

  return (
    <div className="relative w-full h-72 rounded-xl overflow-hidden border border-slate-200">
      <MapContainer
        center={center}
        zoom={hasPin ? 15 : 11}
        scrollWheelZoom
        className="w-full h-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToPlace onChange={onChange} />
        {hasPin && (
          <>
            <Recenter lat={latitude} lng={longitude} />
            <Marker
              position={[latitude, longitude]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target as L.Marker;
                  const { lat, lng } = m.getLatLng();
                  onChange(lat, lng);
                },
              }}
            />
          </>
        )}
      </MapContainer>
      <p className="absolute bottom-2 left-2 right-2 z-[1000] pointer-events-none text-[11px] text-slate-700 bg-white/90 rounded px-2 py-1 shadow-sm">
        {hasPin
          ? 'Drag the pin or click elsewhere to move it.'
          : 'Click the map to drop a pin at the property.'}
      </p>
    </div>
  );
}
