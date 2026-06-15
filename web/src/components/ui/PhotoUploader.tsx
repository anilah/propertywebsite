/**
 * PhotoUploader — avatar upload component.
 *
 * The circle is ALWAYS interactive (click / drag-and-drop).
 * When S3 is configured  → file uploads to S3, the public URL is stored.
 * When S3 is NOT configured → user sees a clear setup error; URL-paste
 *   is shown as an always-available secondary path.
 */
import { useState, useRef, useCallback, useEffect, type DragEvent } from 'react';
import { uploadApi, type UploadFolder, type UploadConfig } from '../../services/api';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

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
  // null = loading, populated once on mount
  const [uploadCfg, setUploadCfg] = useState<UploadConfig | null>(null);

  useEffect(() => { setImgError(false); }, [value]);

  useEffect(() => {
    uploadApi.getConfig()
      .then(setUploadCfg)
      .catch(() => setUploadCfg({ s3Enabled: false, localEnabled: true }));
  }, []);

  const px = `${size}px`;
  const initials = [firstName?.charAt(0), lastName?.charAt(0)].filter(Boolean).join('').toUpperCase() || '';
  const gradClass = gradient === 'amber' ? 'from-amber-400 to-orange-500' : 'from-primary-500 to-primary-700';
  const uploading = uploadPct !== null;
  const hasPhoto = !!value.trim() && !imgError;

  const processFile = useCallback(async (file: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, WebP, or GIF images are accepted.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File is too large — maximum 10 MB.');
      return;
    }
    if (!uploadCfg) {
      setError('Still connecting to the server — please try again in a moment.');
      return;
    }

    setUploadPct(0);
    try {
      const track = (p: number) => setUploadPct(p);
      // Prefer S3 when configured; fall back to local server storage (dev mode)
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

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (file) processFile(file);
  };

  // Drag handlers — always active
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

  return (
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
          {/* Photo or gradient placeholder */}
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

          {/* Upload progress overlay */}
          {uploading && uploadPct !== null && (
            <>
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-sm font-bold z-10">{uploadPct}%</span>
              </div>
              <ProgressRing pct={uploadPct} size={size} />
            </>
          )}

          {/* Hover overlay — always shown (not gated on S3) */}
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

          {/* Drag-active ring pulse */}
          {dragging && (
            <div className="absolute inset-0 rounded-full ring-4 ring-primary-400 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Camera badge bottom-right — always visible when not uploading */}
        {!uploading && !disabled && (
          <div className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-white border-2 border-gray-100 shadow-md flex items-center justify-center z-10 pointer-events-none">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}

        {/* Hidden file input */}
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

      {/* ── Status / hint ── */}
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
            {/* URL paste is always an option, not a fallback */}
            {!disabled && <UrlPaste value={value} onChange={onChange} disabled={disabled} />}
          </>
        )}
      </div>

      {/* Remove button */}
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
  );
}
