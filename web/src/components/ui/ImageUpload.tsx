/**
 * ImageUpload — listing photo upload with S3.
 *
 * Supports:
 *  • Click to browse (multi-file)
 *  • Drag & drop multiple files
 *  • Per-file upload progress rings
 *  • "Add from URL" fallback when S3 is not configured or as an alternative
 *  • Remove individual images
 *  • First image is "Featured" (hero image for the listing)
 */
import { useState, useRef, useCallback, useEffect, type DragEvent } from 'react';
import { uploadApi, type UploadConfig } from '../../services/api';

interface ImageUploadProps {
  images: string[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
  onReorder?: (newOrder: string[]) => void;
}

interface UploadingFile {
  id: string;
  name: string;
  previewUrl: string;
  pct: number;
  error?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024;

export function ImageUpload({ images, onAdd, onRemove }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [uploadCfg, setUploadCfg] = useState<UploadConfig | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    uploadApi.getConfig()
      .then(setUploadCfg)
      .catch(() => setUploadCfg({ s3Enabled: false, localEnabled: true }));
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setGlobalError(`"${file.name}" is not an accepted image type (JPEG, PNG, WebP, GIF).`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setGlobalError(`"${file.name}" exceeds the 10 MB limit.`);
      return;
    }
    if (!uploadCfg) {
      setGlobalError('Still connecting — please try again in a moment.');
      return;
    }

    const id = `${Date.now()}-${Math.random()}`;
    const previewUrl = URL.createObjectURL(file);
    const track = (pct: number) => setUploading((prev) => prev.map((u) => (u.id === id ? { ...u, pct } : u)));

    setUploading((prev) => [...prev, { id, name: file.name, previewUrl, pct: 0 }]);

    try {
      // Prefer S3; fall back to local server storage (dev mode)
      const publicUrl = uploadCfg.s3Enabled
        ? await uploadApi.uploadFileWithProgress(file, 'listings', track)
        : await uploadApi.localUpload(file, 'listings', track);
      onAdd(publicUrl);
    } catch (err) {
      setUploading((prev) =>
        prev.map((u) => u.id === id ? { ...u, error: err instanceof Error ? err.message : 'Upload failed' } : u)
      );
      return;
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
    setUploading((prev) => prev.filter((u) => u.id !== id));
  }, [onAdd, uploadCfg]);

  const processFiles = useCallback((files: File[]) => {
    setGlobalError(null);
    files.filter((f) => f.type.startsWith('image/')).forEach(uploadFile);
  }, [uploadFile]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files ?? []));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUrlSubmit = () => {
    const url = urlInput.trim();
    if (url) { onAdd(url); setUrlInput(''); setIsUrlMode(false); }
  };

  const dismissError = (id: string) => setUploading((prev) => prev.filter((u) => u.id !== id));

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-primary-500 bg-primary-50 scale-[1.01]'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUrlMode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                autoFocus
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setIsUrlMode(false); setUrlInput(''); }}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Upload files instead
            </button>
          </div>
        ) : (
          <>
            <div className={`mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              <svg className={`w-6 h-6 transition-colors ${isDragging ? 'text-primary-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {isDragging ? 'Drop images here' : (
                <>
                  Drag &amp; drop or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 hover:text-primary-700 font-semibold underline"
                  >
                    browse files
                  </button>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500">
              JPEG, PNG, WebP, GIF · up to 10 MB each · multiple files supported
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400">or</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            <button
              type="button"
              onClick={() => setIsUrlMode(true)}
              className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Add from URL
            </button>
          </>
        )}
      </div>

      {/* Global error */}
      {globalError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1">{globalError}</span>
          <button type="button" onClick={() => setGlobalError(null)} className="text-red-400 hover:text-red-600 ml-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* In-progress uploads */}
      {uploading.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {uploading.map((u) => (
            <div key={u.id} className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary-200 bg-gray-100">
              <img src={u.previewUrl} alt={u.name} className="w-full h-full object-cover opacity-60" />
              {u.error ? (
                <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center p-2 text-center gap-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-white text-[10px] leading-tight">{u.error}</p>
                  <button type="button" onClick={() => dismissError(u.id)} className="text-white text-[10px] underline">Dismiss</button>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  {/* Mini progress ring */}
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15" fill="none" stroke="white" strokeWidth="3"
                        strokeDasharray={`${2 * Math.PI * 15}`}
                        strokeDashoffset={`${2 * Math.PI * 15 * (1 - u.pct / 100)}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.1s ease' }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                      {u.pct}%
                    </span>
                  </div>
                  <p className="text-white text-[10px] font-medium drop-shadow truncate max-w-[80%]">{u.name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded images grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </p>
            {images.length > 1 && (
              <p className="text-xs text-gray-500">First image is the featured photo</p>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((src, index) => (
              <div
                key={index}
                className="relative group aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-300 transition-colors"
              >
                <img src={src} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    Featured
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                  aria-label="Remove"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1">
                  <p className="text-white text-[10px] font-medium">#{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
