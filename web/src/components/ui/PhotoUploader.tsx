/**
 * PhotoUploader — avatar upload component with crop/adjust step.
 *
 * Flow:
 *   1. User picks / drops a file
 *   2. CropModal opens — pan + zoom to fit face in circle
 *   3. User confirms → canvas crops the image → uploads to S3 / local
 */
import { useState, useRef, useCallback, useEffect, type DragEvent } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { uploadApi, type UploadFolder, type UploadConfig } from '../../services/api';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Canvas helper: extract the cropped circle as a Blob ───────────────────────
async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const size = Math.max(pixelCrop.width, pixelCrop.height);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }

      // Circular clip
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        size,
        size,
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed'));
      }, 'image/png');
    };
    image.onerror = () => reject(new Error('Failed to load image for cropping'));
    image.src = imageSrc;
  });
}

// ── Crop modal ────────────────────────────────────────────────────────────────
function CropModal({
  src,
  onConfirm,
  onCancel,
}: {
  src: string;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setApplying(true);
    try {
      const blob = await getCroppedBlob(src, croppedAreaPixels);
      onConfirm(blob);
    } catch {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Adjust photo</h3>
          <p className="text-xs text-gray-500 mt-0.5">Drag to reposition · scroll or use slider to zoom</p>
        </div>

        {/* Cropper area */}
        <div className="relative bg-gray-900" style={{ height: 280 }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_: Area, croppedPixels: Area) => setCroppedAreaPixels(croppedPixels)}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 py-3 flex items-center gap-3 border-b border-gray-100">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-teal-600"
          />
          <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={applying}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={applying}
            className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors disabled:opacity-70"
          >
            {applying ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SVG progress ring ─────────────────────────────────────────────────────────
function ProgressRing({ pct, size }: { pct: number; size: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={size}
      height={size}
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={circ - (pct / 100) * circ}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.15s ease' }}
      />
    </svg>
  );
}

// ── URL paste — compact inline control ───────────────────────────────────────
function UrlPaste({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-gray-500 hover:text-primary-700 underline underline-offset-2 transition-colors"
      >
        or paste a URL
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5 w-full max-w-[220px]">
      <input
        type="url"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="https://…"
        className="flex-1 min-w-0 px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="shrink-0 p-1 rounded text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface PhotoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  firstName?: string | null;
  lastName?: string | null;
  folder?: UploadFolder;
  size?: 80 | 96 | 112;
  gradient?: 'primary' | 'amber';
  disabled?: boolean;
}

// ── Main component ────────────────────────────────────────────────────────────
export function PhotoUploader({
  value,
  onChange,
  firstName,
  lastName,
  folder = 'profiles',
  size = 96,
  gradient = 'primary',
  disabled = false,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [uploadCfg, setUploadCfg] = useState<UploadConfig | null>(null);

  // Crop state — set to an object URL when a file is picked, cleared after crop/cancel
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const cropSrcRef = useRef<string | null>(null);

  useEffect(() => { setImgError(false); }, [value]);

  useEffect(() => {
    uploadApi.getConfig()
      .then(setUploadCfg)
      .catch(() => setUploadCfg({ s3Enabled: false, localEnabled: true }));
  }, []);

  // Clean up object URL when modal closes
  const clearCropSrc = useCallback(() => {
    if (cropSrcRef.current) {
      URL.revokeObjectURL(cropSrcRef.current);
      cropSrcRef.current = null;
    }
    setCropSrc(null);
  }, []);

  const uploadBlob = useCallback(async (blob: Blob, originalName: string) => {
    setError(null);
    if (!uploadCfg) {
      setError('Still connecting to the server — please try again.');
      return;
    }
    setUploadPct(0);
    try {
      const file = new File([blob], originalName, { type: blob.type });
      const track = (p: number) => setUploadPct(p);
      const url = uploadCfg.s3Enabled
        ? await uploadApi.uploadFileWithProgress(file, folder, track)
        : await uploadApi.localUpload(file, folder, track);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed — please try again.');
    } finally {
      setUploadPct(null);
    }
  }, [folder, onChange, uploadCfg]);

  const processFile = useCallback((file: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, WebP, or GIF images are accepted.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File is too large — maximum 10 MB.');
      return;
    }

    // Show crop modal — create object URL for the picker
    const objectUrl = URL.createObjectURL(file);
    cropSrcRef.current = objectUrl;
    setCropSrc(objectUrl);
  }, []);

  const handleCropConfirm = useCallback(async (croppedBlob: Blob) => {
    clearCropSrc();
    await uploadBlob(croppedBlob, 'profile.png');
  }, [clearCropSrc, uploadBlob]);

  const handleCropCancel = useCallback(() => {
    clearCropSrc();
  }, [clearCropSrc]);

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (file) processFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !uploading) setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled && !uploading) handleFile(e.dataTransfer.files);
  };

  const px = `${size}px`;
  const initials = [firstName?.charAt(0), lastName?.charAt(0)].filter(Boolean).join('').toUpperCase() || '';
  const gradClass = gradient === 'amber' ? 'from-amber-400 to-orange-500' : 'from-primary-500 to-primary-700';
  const uploading = uploadPct !== null;
  const hasPhoto = !!value.trim() && !imgError;

  return (
    <>
      {/* Crop modal — rendered outside the avatar so it covers the full screen */}
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div className="flex flex-col items-center gap-3">
        {/* ── Avatar circle ── */}
        <div style={{ width: px, height: px }} className="relative">
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={uploading ? `Uploading ${uploadPct}%` : 'Upload or change profile photo'}
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && !disabled && !uploading && fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={[
              'w-full h-full rounded-full overflow-hidden relative ring-4 ring-white shadow-xl border-2 select-none transition-all duration-200 group',
              dragging ? 'ring-primary-400 scale-110 border-primary-400' : 'border-gray-100',
              !disabled && !uploading ? 'cursor-pointer' : '',
              uploading ? 'cursor-default' : '',
            ].join(' ')}
          >
            {hasPhoto ? (
              <img
                src={value.trim()}
                alt="Profile"
                className={`w-full h-full object-cover transition-opacity duration-200 ${
                  uploading ? 'opacity-50' : 'group-hover:opacity-70'
                }`}
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${gradClass} flex items-center justify-center transition-opacity duration-200 ${
                  uploading ? 'opacity-50' : 'group-hover:opacity-80'
                }`}
              >
                {uploading ? null : initials ? (
                  <span
                    className="text-white font-bold select-none"
                    style={{ fontSize: size >= 96 ? '2rem' : '1.4rem' }}
                  >
                    {initials}
                  </span>
                ) : (
                  <svg
                    className="text-white/80"
                    style={{ width: size * 0.4, height: size * 0.4 }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
            )}

            {uploading && uploadPct !== null && (
              <>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-bold z-10">{uploadPct}%</span>
                </div>
                <ProgressRing pct={uploadPct} size={size} />
              </>
            )}

            {!uploading && !disabled && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 flex flex-col items-center justify-center transition-all duration-200 rounded-full">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-1 pointer-events-none">
                  <svg
                    className="text-white drop-shadow"
                    style={{ width: size * 0.28, height: size * 0.28 }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white text-[10px] font-semibold drop-shadow">
                    {dragging ? 'Drop to upload' : hasPhoto ? 'Change photo' : 'Upload photo'}
                  </span>
                </div>
              </div>
            )}

            {dragging && (
              <div className="absolute inset-0 rounded-full ring-4 ring-primary-400 animate-pulse pointer-events-none" />
            )}
          </div>

          {/* Camera badge */}
          {!uploading && !disabled && (
            <div className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-white border-2 border-gray-100 shadow-md flex items-center justify-center z-10 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => handleFile(e.target.files)}
            onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
          />
        </div>

        {/* Status / hint */}
        <div className="flex flex-col items-center gap-2 text-center max-w-[240px]">
          {uploading ? (
            <p className="text-sm font-medium text-primary-700 animate-pulse">Uploading…</p>
          ) : error ? (
            <div className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left">
              <p className="text-xs text-red-700 leading-snug">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="mt-1 text-xs text-red-500 underline hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 leading-snug">
                {!uploadCfg
                  ? 'Connecting…'
                  : uploadCfg.s3Enabled
                    ? 'Click or drag & drop · JPG, PNG, WebP · max 10 MB'
                    : 'Click or drag & drop · saved locally · max 10 MB'}
              </p>
              {!disabled && <UrlPaste value={value} onChange={onChange} disabled={disabled} />}
            </>
          )}
        </div>

        {value.trim() && !uploading && !disabled && (
          <button
            type="button"
            onClick={() => { onChange(''); setImgError(false); }}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Remove photo
          </button>
        )}
      </div>
    </>
  );
}
