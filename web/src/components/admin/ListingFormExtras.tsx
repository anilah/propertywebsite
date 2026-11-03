import {
  useState,
  useRef,
  useCallback,
  useEffect,
  lazy,
  Suspense,
  type Dispatch,
  type SetStateAction,
  type DragEvent,
} from 'react';
import { Input } from '../ui/Input';
import { ImageUpload } from '../ui/ImageUpload';
import { FormSection } from './FormSection';
import type { Listing, ListingMediaKind } from '../../types';
import { uploadApi, geocodeApi, type UploadConfig, type GeocodeCandidate } from '../../services/api';
import { ListingMarketingSection } from './ListingMarketingSection';
import { listingDetailPath } from '../../utils/listingRoutes';

const CoordinatePickerMap = lazy(() =>
  import('./CoordinatePickerMap').then((m) => ({ default: m.CoordinatePickerMap }))
);

const mediaKinds: { value: ListingMediaKind; label: string }[] = [
  { value: 'PHOTO', label: 'Photo' },
  { value: 'EXTERIOR', label: 'Exterior' },
  { value: 'INTERIOR', label: 'Interior' },
  { value: 'FLOORPLAN', label: 'Floor plan' },
  { value: 'AERIAL', label: 'Aerial' },
  { value: 'OTHER', label: 'Other' },
];

// Emoji icons so users can visually identify each category at a glance
const kindIcon: Partial<Record<ListingMediaKind, string>> = {
  PHOTO:     '📷',
  EXTERIOR:  '🏡',
  INTERIOR:  '🛋️',
  FLOORPLAN: '📐',
  AERIAL:    '🛩️',
  OTHER:     '📎',
};

// Colour scheme: card border, legend badge, select background
const kindBorderClass: Partial<Record<ListingMediaKind, string>> = {
  PHOTO:     'border-blue-300',
  EXTERIOR:  'border-emerald-400',
  INTERIOR:  'border-violet-400',
  FLOORPLAN: 'border-amber-400',
  AERIAL:    'border-sky-400',
  OTHER:     'border-slate-300',
};

const kindBadgeClass: Partial<Record<ListingMediaKind, string>> = {
  PHOTO:     'bg-blue-100 text-blue-700',
  EXTERIOR:  'bg-emerald-100 text-emerald-700',
  INTERIOR:  'bg-violet-100 text-violet-700',
  FLOORPLAN: 'bg-amber-100 text-amber-700',
  AERIAL:    'bg-sky-100 text-sky-700',
  OTHER:     'bg-slate-100 text-slate-600',
};

const kindSelectClass: Partial<Record<ListingMediaKind, string>> = {
  PHOTO:     'bg-blue-50 text-blue-700',
  EXTERIOR:  'bg-emerald-50 text-emerald-700',
  INTERIOR:  'bg-violet-50 text-violet-700',
  FLOORPLAN: 'bg-amber-50 text-amber-700',
  AERIAL:    'bg-sky-50 text-sky-700',
  OTHER:     'bg-slate-50 text-slate-600',
};

const tx =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25';

const inlineInput =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25';

const addLink =
  'inline-flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-100 hover:bg-primary-50';

export interface MediaRow {
  url: string;
  kind: ListingMediaKind;
}

// ── Drag-to-reorder photo grid ─────────────────────────────────────────────────
function MediaGrid({
  mediaItems,
  setMediaItems,
}: {
  mediaItems: MediaRow[];
  setMediaItems: Dispatch<SetStateAction<MediaRow[]>>;
}) {
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to) return;
    setMediaItems((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const onDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
    // Tiny delay so the browser snapshot looks normal
    setTimeout(() => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.opacity = '0.4';
    }, 0);
  };

  const onDragEnd = (e: DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).style.opacity = '1';
    setDragOver(null);
    dragIndex.current = null;
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(index);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (dragIndex.current !== null) move(dragIndex.current, index);
    setDragOver(null);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {mediaItems.map((row, index) => (
        <div
          key={row.url + index}
          draggable
          onDragStart={(e) => onDragStart(e, index)}
          onDragEnd={onDragEnd}
          onDragOver={(e) => onDragOver(e, index)}
          onDrop={(e) => onDrop(e, index)}
          className={[
            'relative group rounded-xl overflow-hidden border-2 transition-all bg-slate-100 cursor-grab active:cursor-grabbing',
            kindBorderClass[row.kind],
            dragOver === index && dragIndex.current !== index
              ? 'ring-2 ring-teal-400 ring-offset-1 scale-[1.03]'
              : '',
          ].join(' ')}
        >
          {/* Thumbnail */}
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={row.url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Preview';
              }}
            />
          </div>

          {/* Position label */}
          <div className="absolute top-2 left-2 text-[10px] font-bold bg-black/55 text-white px-1.5 py-0.5 rounded leading-none select-none">
            {index === 0 ? '★ Cover' : `#${index + 1}`}
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => setMediaItems((prev) => prev.filter((_, i) => i !== index))}
            className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
            aria-label="Remove photo"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* ← → reorder arrows (always visible on touch/mobile) */}
          <div className="absolute bottom-10 inset-x-0 flex justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
            <button
              type="button"
              onClick={() => move(index, index - 1)}
              disabled={index === 0}
              className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1 disabled:opacity-0 transition-opacity"
              aria-label="Move left"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => move(index, index + 1)}
              disabled={index === mediaItems.length - 1}
              className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1 disabled:opacity-0 transition-opacity"
              aria-label="Move right"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Category selector */}
          <div className="px-2 pb-2 pt-1.5">
            <label className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Category
            </label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] pointer-events-none">
                {kindIcon[row.kind]}
              </span>
              <select
                value={row.kind}
                onChange={(e) => {
                  const kind = e.target.value as ListingMediaKind;
                  setMediaItems((prev) => prev.map((r, i) => (i === index ? { ...r, kind } : r)));
                }}
                className={`w-full appearance-none rounded-lg pl-6 pr-6 py-1.5 text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400 ${kindSelectClass[row.kind]}`}
              >
                {mediaKinds.map((k) => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
              <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export interface UpdateRow {
  body: string;
}

export interface OpenHomeRow {
  startsAt: string;
  endsAt: string;
  label: string;
}

export interface DocumentRow {
  title: string;
  url: string;
}

interface Props {
  formData: Partial<Listing>;
  updateField: (field: keyof Listing, value: unknown) => void;
  mediaItems: MediaRow[];
  setMediaItems: Dispatch<SetStateAction<MediaRow[]>>;
  updateItems: UpdateRow[];
  setUpdateItems: Dispatch<SetStateAction<UpdateRow[]>>;
  openHomeItems: OpenHomeRow[];
  setOpenHomeItems: Dispatch<SetStateAction<OpenHomeRow[]>>;
  documentItems: DocumentRow[];
  setDocumentItems: Dispatch<SetStateAction<DocumentRow[]>>;
}

// ── Accepted video MIME types (must match backend ALLOWED_VIDEO_TYPES) ──────
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB

interface VideoUploadProps {
  videoUrl: string;
  onChange: (url: string) => void;
}

function VideoUpload({ videoUrl, onChange }: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadCfg, setUploadCfg] = useState<UploadConfig | null>(null);

  useEffect(() => {
    uploadApi.getConfig()
      .then(setUploadCfg)
      .catch(() => setUploadCfg({ s3Enabled: false, localEnabled: true }));
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setError(`"${file.name}" is not accepted. Use MP4, WebM, or MOV.`);
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(`"${file.name}" exceeds the 500 MB limit.`);
      return;
    }
    if (!uploadCfg) {
      setError('Still connecting — please try again in a moment.');
      return;
    }
    setError(null);
    setUploading(true);
    setUploadPct(0);
    try {
      const publicUrl = uploadCfg.s3Enabled
        ? await uploadApi.uploadFileWithProgress(file, 'listings', setUploadPct)
        : await uploadApi.localUpload(file, 'listings', setUploadPct);
      onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  }, [onChange, uploadCfg]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Current video preview */}
      {videoUrl && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-64">
          <video
            src={videoUrl}
            controls
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-full shadow transition-colors"
            aria-label="Remove video"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Drop zone — shown when no video or to replace */}
      {(!videoUrl || true) && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? 'border-primary-500 bg-primary-50 scale-[1.01]'
              : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_VIDEO_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none" stroke="rgb(79,70,229)" strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 15}`}
                    strokeDashoffset={`${2 * Math.PI * 15 * (1 - uploadPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.1s ease' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                  {uploadPct}%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600">Uploading video…</p>
            </div>
          ) : (
            <>
              <div className={`mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-primary-100' : 'bg-slate-100'}`}>
                <svg className={`w-6 h-6 transition-colors ${isDragging ? 'text-primary-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">
                {videoUrl ? 'Replace video — drag & drop or ' : 'Drag & drop or '}
                <span className="text-primary-600 font-semibold underline">browse</span>
              </p>
              <p className="text-xs text-slate-500">MP4, WebM, MOV · up to 500 MB</p>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* URL fallback */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Or paste a video URL</label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className={inlineInput}
        />
      </div>
    </div>
  );
}

/** OSM Nominatim rejects marketing labels like "Auckland City" — prefer hierarchy fields. */
function streetLineOnly(streetAddress?: string): string {
  const raw = (streetAddress || '').trim();
  if (!raw) return '';
  // Users often paste a full geocode label into Street address — use only the road line.
  return raw.split(',')[0]?.trim() || raw;
}

function buildGeocodeQuery(formData: Partial<Listing>): string {
  const street = streetLineOnly(formData.streetAddress) || formData.streetAddress?.trim() || '';
  const cityLabel = formData.city?.trim().replace(/\s+City$/i, '') || undefined;
  const district = formData.location?.district?.trim().replace(/\s+City$/i, '') || undefined;
  const parts = [
    street,
    formData.location?.suburb,
    district,
    // Only use city label when suburb/district aren't set (avoid "Auckland City" noise).
    !formData.location?.suburb && !formData.location?.district ? cityLabel : undefined,
    formData.location?.region,
    'New Zealand',
  ]
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p));

  // Drop parts already present in earlier segments (street may still include suburb text).
  const out: string[] = [];
  for (const part of parts) {
    const hay = out.join(', ').toLowerCase();
    if (hay.includes(part.toLowerCase())) continue;
    out.push(part);
  }
  return out.join(', ');
}

interface FindCoordinatesProps {
  formData: Partial<Listing>;
  updateField: (field: keyof Listing, value: unknown) => void;
}

function FindPinFromAddress({ formData, updateField }: FindCoordinatesProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<GeocodeCandidate[] | null>(null);
  const [appliedLabel, setAppliedLabel] = useState<string | null>(null);

  const query = buildGeocodeQuery(formData);
  const canSearch = Boolean(formData.streetAddress?.trim());

  const handleSearch = async () => {
    if (!canSearch) {
      setError('Enter a street address first. Selecting suburb/region above also helps.');
      return;
    }
    setLoading(true);
    setError(null);
    setCandidates(null);
    setAppliedLabel(null);
    try {
      const res = await geocodeApi.search(query);
      if (res.status !== 'ok' || res.candidates.length === 0) {
        setError(
          res.message ||
            'No match found. Check the street address and region/suburb above, or drop a pin on the map.'
        );
        return;
      }
      setCandidates(res.candidates);
      const top = res.candidates[0];
      updateField('latitude', top.lat);
      updateField('longitude', top.lng);
      setAppliedLabel(top.label);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the geocoding service.');
    } finally {
      setLoading(false);
    }
  };

  const applyCandidate = (c: GeocodeCandidate) => {
    updateField('latitude', c.lat);
    updateField('longitude', c.lng);
    setAppliedLabel(c.label);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !canSearch}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {loading ? 'Finding pin…' : 'Find pin from address'}
        </button>
        <p className="text-xs text-slate-500">
          Or click the map below to place the pin yourself.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {appliedLabel && (
        <p className="text-sm text-emerald-700">
          ✓ Pin set from: <span className="font-medium">{appliedLabel}</span>
        </p>
      )}

      {candidates && candidates.length > 1 && (
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Not right? Pick another match:</p>
          {candidates.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyCandidate(c)}
              className={`block w-full text-left rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                appliedLabel === c.label
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListingFormExtras({
  formData,
  updateField,
  mediaItems,
  setMediaItems,
  updateItems,
  setUpdateItems,
  openHomeItems,
  setOpenHomeItems,
  documentItems,
  setDocumentItems,
}: Props) {
  return (
    <div className="space-y-6">
      <FormSection
        title="Street address & map"
        subtitle="Set the property pin for the public map, school zones, and land lookups. Street View and Google Maps links on the listing are generated from this pin automatically."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Input
                label="Street address"
                value={formData.streetAddress || ''}
                onChange={(e) => updateField('streetAddress', e.target.value)}
                placeholder="7C Maxwell Avenue"
              />
              <p className="mt-1 text-xs text-slate-500">
                Street and number only — suburb/region are chosen above. Avoid pasting the full address.
              </p>
            </div>
            <Input
              label="City / area label"
              value={formData.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Auckland"
            />
            <Input
              label="Postcode"
              value={formData.postalCode || ''}
              onChange={(e) => updateField('postalCode', e.target.value)}
            />
          </div>

          <FindPinFromAddress formData={formData} updateField={updateField} />

          <div>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <label className="text-sm font-medium text-slate-700">Map pin</label>
              {typeof formData.latitude === 'number' && typeof formData.longitude === 'number' ? (
                <span className="text-xs text-slate-500">
                  {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                </span>
              ) : (
                <span className="text-xs text-amber-700">No pin yet — find from address or click the map</span>
              )}
            </div>
            <Suspense
              fallback={
                <div className="h-72 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-500">
                  Loading map…
                </div>
              }
            >
              <CoordinatePickerMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onChange={(lat, lng) => {
                  updateField('latitude', Number(lat.toFixed(6)));
                  updateField('longitude', Number(lng.toFixed(6)));
                }}
              />
            </Suspense>
          </div>

          <details className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium text-slate-600 select-none">
              Adjust coordinates manually
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Latitude"
                type="number"
                step="any"
                value={formData.latitude ?? ''}
                onChange={(e) =>
                  updateField('latitude', e.target.value === '' ? undefined : Number(e.target.value))
                }
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                value={formData.longitude ?? ''}
                onChange={(e) =>
                  updateField('longitude', e.target.value === '' ? undefined : Number(e.target.value))
                }
              />
            </div>
          </details>
        </div>
      </FormSection>

      <FormSection
        title="Property summary & project"
        subtitle="Optional — useful for new builds, townhouses, or developments."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Ensuite count"
            type="number"
            min={0}
            value={formData.ensuiteCount ?? ''}
            onChange={(e) => updateField('ensuiteCount', e.target.value === '' ? 0 : Number(e.target.value))}
          />
          <Input
            label="Off-street parking (count)"
            type="number"
            min={0}
            value={formData.offStreetParking ?? ''}
            onChange={(e) =>
              updateField('offStreetParking', e.target.value === '' ? undefined : Number(e.target.value))
            }
          />
          <Input
            label="Half bathrooms"
            type="number"
            min={0}
            value={formData.halfBathrooms ?? ''}
            onChange={(e) =>
              updateField('halfBathrooms', e.target.value === '' ? 0 : Number(e.target.value))
            }
          />
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Parking description</label>
            <textarea
              className={tx}
              rows={2}
              value={formData.parkingDescription || ''}
              onChange={(e) => updateField('parkingDescription', e.target.value)}
              placeholder="1 Car Off Street Parking"
            />
          </div>
          <Input
            label="Agency reference"
            value={formData.agencyReference || ''}
            onChange={(e) => updateField('agencyReference', e.target.value)}
            placeholder="917184"
          />
          <Input
            label="External listing #"
            value={formData.externalListingNumber || ''}
            onChange={(e) => updateField('externalListingNumber', e.target.value)}
            placeholder="#5489662819"
          />
          <Input
            label="Expected completion"
            value={formData.expectedCompletion || ''}
            onChange={(e) => updateField('expectedCompletion', e.target.value)}
            placeholder="June 2026"
          />
        </div>
      </FormSection>

      <FormSection
        title="Media gallery"
        subtitle="Upload photos — each image is shown as a card. Tag its category using the selector beneath the photo so buyers can filter by type."
      >
        {/* Drop zone only — gallery is managed below to avoid duplication */}
        <ImageUpload
          images={[]}
          onAdd={(url) => setMediaItems((prev) => [...prev, { url, kind: 'PHOTO' }])}
          onRemove={() => {}}
        />

        {mediaItems.length > 0 && (
          <div className="mt-5">
            {/* Legend */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {mediaKinds.map((k) => (
                <span
                  key={k.value}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${kindBadgeClass[k.value]}`}
                >
                  {kindIcon[k.value]} {k.label}
                </span>
              ))}
              <span className="text-xs text-slate-400 ml-auto">
                {mediaItems.length} {mediaItems.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>

            {/* Reorder hint */}
            {mediaItems.length > 1 && (
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4M8 15l4 4 4-4" />
                </svg>
                Drag photos to reorder · first photo is the cover
              </p>
            )}

            {/* Thumbnail grid with drag-to-reorder */}
            <MediaGrid mediaItems={mediaItems} setMediaItems={setMediaItems} />
          </div>
        )}
      </FormSection>

      <FormSection
        title="Property video"
        subtitle="Upload a walkthrough video (MP4, WebM, or MOV). Stored on S3, same as images. A 'Video' badge appears on the listing card once set."
      >
        <VideoUpload
          videoUrl={formData.videoUrl || ''}
          onChange={(url) => updateField('videoUrl', url || undefined)}
        />
      </FormSection>

      <FormSection
        title="Agent updates"
        subtitle="Optional timeline — great for new builds or auction campaigns."
      >
        {updateItems.map((row, index) => (
          <div key={index} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Update {index + 1}
            </label>
            <textarea
              className={tx}
              rows={3}
              value={row.body}
              onChange={(e) => {
                const v = e.target.value;
                setUpdateItems((prev) => prev.map((r, i) => (i === index ? { body: v } : r)));
              }}
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setUpdateItems((prev) => [...prev, { body: '' }])} className={addLink}>
            + Add update
          </button>
          {updateItems.length > 0 && (
            <button
              type="button"
              onClick={() => setUpdateItems((prev) => prev.slice(0, -1))}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
            >
              Remove last
            </button>
          )}
        </div>
      </FormSection>

      <FormSection
        title="Open home times"
        subtitle="Scheduled times appear on the public listing. If none are set, buyers see the note below instead."
      >
        {openHomeItems.map((row, index) => (
          <div
            key={index}
            className="mb-3 grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 md:grid-cols-3"
          >
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Starts</label>
              <input
                type="datetime-local"
                value={row.startsAt}
                onChange={(e) => {
                  const v = e.target.value;
                  setOpenHomeItems((prev) => prev.map((r, i) => (i === index ? { ...r, startsAt: v } : r)));
                }}
                className={inlineInput}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Ends (optional)
              </label>
              <input
                type="datetime-local"
                value={row.endsAt}
                onChange={(e) => {
                  const v = e.target.value;
                  setOpenHomeItems((prev) => prev.map((r, i) => (i === index ? { ...r, endsAt: v } : r)));
                }}
                className={inlineInput}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Label</label>
              <input
                type="text"
                value={row.label}
                onChange={(e) => {
                  const v = e.target.value;
                  setOpenHomeItems((prev) => prev.map((r, i) => (i === index ? { ...r, label: v } : r)));
                }}
                className={inlineInput}
                placeholder="Open home"
              />
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpenHomeItems((prev) => [...prev, { startsAt: '', endsAt: '', label: '' }])}
            className={addLink}
          >
            + Add open home
          </button>
          {openHomeItems.length > 0 && (
            <button
              type="button"
              onClick={() => setOpenHomeItems((prev) => prev.slice(0, -1))}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
            >
              Remove last
            </button>
          )}
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Note when no times are listed
          </label>
          <textarea
            className={tx}
            rows={2}
            value={formData.openHomesNote || ''}
            onChange={(e) => updateField('openHomesNote', e.target.value)}
            placeholder="No times scheduled — contact agent to view"
          />
          <p className="mt-1 text-xs text-slate-500">
            Shown on the public page only when there are no scheduled open homes above. Clear this if you remove times and do not want leftover text.
          </p>
        </div>
      </FormSection>

      <div id="form-marketing" className="scroll-mt-[11rem] sm:scroll-mt-[11.5rem]">
        <ListingMarketingSection
          listingId={formData.id}
          marketingCopy={formData.marketingCopy || ''}
          marketingLink={formData.marketingLink || ''}
          defaultPropertyLink={
            formData.id && formData.listingType && formData.location
              ? `${typeof window !== 'undefined' ? window.location.origin : 'https://kaboohomes.com'}${listingDetailPath(
                  formData.listingType,
                  formData.id,
                  formData.location
                )}`
              : ''
          }
          onChangeCopy={(v) => updateField('marketingCopy', v)}
          onChangeLink={(v) => updateField('marketingLink', v)}
        />
      </div>

      <FormSection
        title="Property files"
        subtitle="Titles are shown to buyers; add a URL when you host the file online."
      >
        {documentItems.map((row, index) => (
          <div key={index} className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Title"
              value={row.title}
              onChange={(e) => {
                const v = e.target.value;
                setDocumentItems((prev) => prev.map((r, i) => (i === index ? { ...r, title: v } : r)));
              }}
              placeholder="LIM report"
            />
            <Input
              label="File URL (optional)"
              value={row.url}
              onChange={(e) => {
                const v = e.target.value;
                setDocumentItems((prev) => prev.map((r, i) => (i === index ? { ...r, url: v } : r)));
              }}
            />
          </div>
        ))}
        <button type="button" onClick={() => setDocumentItems((prev) => [...prev, { title: '', url: '' }])} className={addLink}>
          + Add document
        </button>
      </FormSection>
    </div>
  );
}
