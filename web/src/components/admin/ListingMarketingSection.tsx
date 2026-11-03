/**
 * Marketing Content — format-scoped media (Reel / Flyer / Carousel)
 * plus paste-ready post copy and property deep link.
 */
import { useState, useRef, useEffect, useMemo, useCallback, type DragEvent } from 'react';
import { createPortal } from 'react-dom';
import { uploadApi, listingMarketingApi, type ListingMarketingItem } from '../../services/api';
import { FormSection } from './FormSection';
import { LEAD_LINK_PLATFORMS, buildEnquiryLink } from '../../utils/leadLinks';

type MarketingKind = 'REEL' | 'FLYER' | 'CAROUSEL';

const FORMATS: {
  value: MarketingKind;
  label: string;
  accept: string;
  multiple: boolean;
  tip: string;
  emptyTitle: string;
  emptyHint: string;
  accent: string;
  accentSoft: string;
  ring: string;
}[] = [
  {
    value: 'REEL',
    label: 'Reel',
    accept: 'video/*',
    multiple: false,
    tip: 'Vertical 9:16 video for Instagram & Facebook Reels.',
    emptyTitle: 'No reel yet',
    emptyHint: 'Drop a short vertical video here, or click Upload reel.',
    accent: 'text-fuchsia-700',
    accentSoft: 'bg-fuchsia-50 border-fuchsia-200',
    ring: 'ring-fuchsia-500/30 border-fuchsia-400',
  },
  {
    value: 'FLYER',
    label: 'Flyer',
    accept: 'image/*',
    multiple: false,
    tip: 'One marketing graphic — poster, open-home flyer, or promo still.',
    emptyTitle: 'No flyer yet',
    emptyHint: 'Upload a single flyer image for this listing.',
    accent: 'text-amber-800',
    accentSoft: 'bg-amber-50 border-amber-200',
    ring: 'ring-amber-500/30 border-amber-400',
  },
  {
    value: 'CAROUSEL',
    label: 'Carousel',
    accept: 'image/*',
    multiple: true,
    tip: '2–10 images shown as swipe cards in Meta carousel ads.',
    emptyTitle: 'No carousel images',
    emptyHint: 'Add several photos — order is the swipe order.',
    accent: 'text-sky-800',
    accentSoft: 'bg-sky-50 border-sky-200',
    ring: 'ring-sky-500/30 border-sky-400',
  },
];

function normalizeKind(kind: string): MarketingKind | 'OTHER' {
  const k = (kind || '').toUpperCase();
  if (k === 'VIDEO' || k === 'REEL') return 'REEL';
  if (k === 'FLYER') return 'FLYER';
  if (k === 'CAROUSEL') return 'CAROUSEL';
  return 'OTHER';
}

function FormatIcon({ kind, className = 'h-5 w-5' }: { kind: MarketingKind; className?: string }) {
  if (kind === 'REEL') {
    return (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <path strokeLinecap="round" d="M10 8l5 3.5L10 15V8z" />
      </svg>
    );
  }
  if (kind === 'FLYER') {
    return (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h10l5 5v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
        <path strokeLinecap="round" d="M14 4v5h5M8 13h8M8 17h5" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <rect x="3" y="5" width="12" height="14" rx="1.5" />
      <rect x="7" y="3" width="12" height="14" rx="1.5" opacity={0.7} />
      <rect x="11" y="1" width="10" height="14" rx="1.5" opacity={0.45} />
    </svg>
  );
}

/** Full-screen preview for Reel / Flyer / Carousel. */
function MarketingPreviewModal({
  kind,
  items,
  startIndex,
  onClose,
}: {
  kind: MarketingKind;
  items: ListingMarketingItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(startIndex, 0), Math.max(items.length - 1, 0))
  );
  const item = items[index];

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
  }, [items.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= items.length - 1 ? 0 : i + 1));
  }, [items.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (kind === 'CAROUSEL' && e.key === 'ArrowLeft') goPrev();
      if (kind === 'CAROUSEL' && e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, kind, goPrev, goNext]);

  if (!item) return null;

  const label =
    kind === 'REEL' ? 'Reel preview' : kind === 'FLYER' ? 'Flyer preview' : 'Carousel preview';

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{label}</p>
          {kind === 'CAROUSEL' && (
            <p className="text-xs text-white/60">
              Image {index + 1} of {items.length} · use arrows to swipe
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20"
        >
          Close
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {kind === 'CAROUSEL' && items.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 sm:left-4"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 sm:right-4"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}

        {kind === 'REEL' ? (
          <div className="mx-auto flex h-full max-h-[min(90vh,820px)] w-full max-w-[min(100%,420px)] items-center justify-center">
            <div className="relative aspect-[9/16] h-full max-h-full w-auto overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/20">
              <video
                key={item.id}
                src={item.url}
                className="h-full w-full object-contain"
                controls
                autoPlay
                playsInline
              />
            </div>
          </div>
        ) : kind === 'FLYER' ? (
          <img
            src={item.url}
            alt={item.caption || 'Flyer'}
            className="max-h-[min(85vh,900px)] max-w-full rounded-lg object-contain shadow-2xl"
          />
        ) : (
          <div className="flex w-full max-w-3xl flex-col items-center gap-4">
            <img
              key={item.id}
              src={item.url}
              alt={item.caption || `Carousel ${index + 1}`}
              className="max-h-[min(75vh,800px)] max-w-full rounded-lg object-contain shadow-2xl"
            />
            {items.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {items.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      i === index ? 'bg-white' : 'bg-white/35 hover:bg-white/60'
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                    aria-current={i === index}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/** Per-platform links that open the enquiry form and record the lead source. */
function EnquiryLinks({ baseUrl, marketingCopy }: { baseUrl: string; marketingCopy: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      window.prompt('Copy this:', text);
    }
  };

  return (
    <div>
      <p className="text-sm font-bold text-slate-900">Enquiry links for posts</p>
      <p className="mb-2 text-xs text-slate-500">
        Put these in the reel / post caption. Visitors land on the property page normally; when they enquire,
        the lead appears in Admin → Leads tagged with where it came from.
      </p>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {LEAD_LINK_PLATFORMS.map((p) => {
          const link = buildEnquiryLink(baseUrl, p.id);
          const post = marketingCopy.trim() ? `${marketingCopy.trim()}\n\nEnquire now 👉 ${link}` : link;
          return (
            <div key={p.id} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center">
              <span className="w-24 shrink-0 text-xs font-bold text-slate-700">{p.label}</span>
              <span className="min-w-0 flex-1 truncate text-xs text-slate-500" title={link}>
                {link}
              </span>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => void copy(`${p.id}-link`, link)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copied === `${p.id}-link` ? 'Copied ✓' : 'Copy link'}
                </button>
                {marketingCopy.trim() && (
                  <button
                    type="button"
                    onClick={() => void copy(`${p.id}-post`, post)}
                    className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    {copied === `${p.id}-post` ? 'Copied ✓' : 'Copy post + link'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">
        Instagram captions aren&apos;t clickable — use the Instagram link in your bio or a story link sticker.
      </p>
    </div>
  );
}

interface Props {
  listingId: string | undefined;
  marketingCopy: string;
  marketingLink: string;
  defaultPropertyLink: string;
  onChangeCopy: (value: string) => void;
  onChangeLink: (value: string) => void;
}

export function ListingMarketingSection({
  listingId,
  marketingCopy,
  marketingLink,
  defaultPropertyLink,
  onChangeCopy,
  onChangeLink,
}: Props) {
  const [items, setItems] = useState<ListingMarketingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKind, setSelectedKind] = useState<MarketingKind>('REEL');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    listingMarketingApi
      .list(listingId)
      .then((r) => setItems(r.media))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId]);

  const counts = useMemo(() => {
    const c: Record<MarketingKind, number> = { REEL: 0, FLYER: 0, CAROUSEL: 0 };
    for (const item of items) {
      const n = normalizeKind(item.kind);
      if (n !== 'OTHER') c[n] += 1;
    }
    return c;
  }, [items]);

  const visibleItems = useMemo(
    () => items.filter((item) => normalizeKind(item.kind) === selectedKind),
    [items, selectedKind]
  );

  const format = FORMATS.find((f) => f.value === selectedKind)!;

  const handleUploadFiles = async (files: File[]) => {
    if (!listingId || files.length === 0) return;
    setError(null);
    setUploading(true);
    setUploadProgress(0);
    try {
      const config = await uploadApi.getConfig();
      const toUpload = format.multiple ? files : files.slice(0, 1);
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        let url: string;
        if (config.s3Enabled) {
          const { uploadUrl, publicUrl } = await uploadApi.getPresignedUrl(file.type, 'listings');
          await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
          url = publicUrl;
        } else {
          url = await uploadApi.localUpload(file, 'listings', (p) => setUploadProgress(p));
        }
        const r = await listingMarketingApi.add(listingId, { url, kind: selectedKind });
        setItems((prev) => [...prev, r.media]);
        setUploadProgress(Math.round(((i + 1) / toUpload.length) * 100));
      }
      setUploadProgress(0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (item: ListingMarketingItem) => {
    if (!listingId) return;
    if (!confirm(`Remove this ${normalizeKind(item.kind).toLowerCase()}?`)) return;
    try {
      await listingMarketingApi.remove(listingId, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const linkValue = marketingLink || defaultPropertyLink;

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) void handleUploadFiles(files);
  };

  return (
    <FormSection
      title="Marketing content"
      subtitle="Pick a format, manage only that media, then paste the post copy and property link used in campaigns."
    >
      {!listingId && (
        <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Save the listing first to manage marketing content.
        </p>
      )}

      {listingId && (
        <div className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 flex justify-between">
              {error}
              <button type="button" onClick={() => setError(null)} className="ml-2">
                ✕
              </button>
            </div>
          )}

          {/* Format cards */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {FORMATS.map((f) => {
              const active = selectedKind === f.value;
              const count = counts[f.value];
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => {
                    setSelectedKind(f.value);
                    setPreviewIndex(null);
                  }}
                  className={`relative flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                    active
                      ? `${f.accentSoft} ${f.ring} ring-2 shadow-sm`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      active ? 'bg-white shadow-sm' : 'bg-slate-100'
                    } ${active ? f.accent : 'text-slate-500'}`}
                  >
                    <FormatIcon kind={f.value} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-bold ${active ? f.accent : 'text-slate-800'}`}>
                        {f.label}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                          count > 0
                            ? active
                              ? 'bg-white text-slate-800'
                              : 'bg-slate-200 text-slate-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{f.tip}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active format workspace */}
          <div className={`rounded-2xl border ${format.accentSoft} p-4 sm:p-5`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={`text-sm font-bold ${format.accent}`}>{format.label} library</p>
                <p className="text-xs text-slate-600">{format.tip}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept={format.accept}
                  multiple={format.multiple}
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    void handleUploadFiles(files);
                  }}
                />
                <button
                  type="button"
                  disabled={visibleItems.length === 0}
                  onClick={() => setPreviewIndex(0)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Preview {format.label.toLowerCase()}
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {uploadProgress > 0 ? `${uploadProgress}%` : 'Uploading…'}
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Upload {format.label.toLowerCase()}
                    </>
                  )}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
              </div>
            ) : visibleItems.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/70 px-6 py-14 text-center transition ${
                  dragOver ? 'border-slate-700 bg-white' : 'border-slate-300'
                }`}
              >
                <span className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ${format.accent}`}>
                  <FormatIcon kind={selectedKind} className="h-7 w-7" />
                </span>
                <p className="text-sm font-semibold text-slate-800">{format.emptyTitle}</p>
                <p className="mt-1 max-w-sm text-xs text-slate-500">{format.emptyHint}</p>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className={`mt-4 text-sm font-semibold underline-offset-2 hover:underline ${format.accent}`}
                >
                  Choose file{format.multiple ? 's' : ''}
                </button>
              </div>
            ) : (
              <div
                className={
                  selectedKind === 'REEL' || selectedKind === 'FLYER'
                    ? 'mx-auto grid max-w-md grid-cols-1 gap-3'
                    : 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'
                }
              >
                {visibleItems.map((item, index) => {
                  const isVideo = normalizeKind(item.kind) === 'REEL';
                  return (
                    <div
                      key={item.id}
                      className={`group relative overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm ${
                        selectedKind === 'REEL' ? 'aspect-[9/16] max-h-[28rem]' : 'aspect-[4/5]'
                      }`}
                    >
                      {isVideo ? (
                        <video
                          src={item.url}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.caption ?? `${selectedKind} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      )}
                      {selectedKind === 'CAROUSEL' && (
                        <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                      )}
                      {/* Hover overlay — preview */}
                      <button
                        type="button"
                        onClick={() => setPreviewIndex(index)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100"
                        aria-label={`Preview ${format.label.toLowerCase()}`}
                      >
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-lg">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Preview
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDelete(item);
                        }}
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}

                {/* Add more tile for carousel */}
                {selectedKind === 'CAROUSEL' && (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sky-300 bg-white/60 text-sky-700 transition hover:bg-white"
                  >
                    <span className="text-2xl font-light">+</span>
                    <span className="text-xs font-semibold">Add image</span>
                  </button>
                )}
              </div>
            )}

            <p className="mt-3 text-xs text-slate-500">
              Showing {visibleItems.length} {format.label.toLowerCase()}
              {visibleItems.length === 1 ? '' : 's'}
              {counts.REEL + counts.FLYER + counts.CAROUSEL > visibleItems.length
                ? ` · ${counts.REEL + counts.FLYER + counts.CAROUSEL - visibleItems.length} in other formats`
                : ''}
            </p>
          </div>

          {/* Shared copy + link */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div>
              <p className="text-sm font-bold text-slate-900">Post / ad copy</p>
              <p className="mb-2 text-xs text-slate-500">
                Shared across formats — paste the generated Meta text exactly as it should appear.
              </p>
              <textarea
                className="w-full min-h-[180px] rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                value={marketingCopy}
                onChange={(e) => onChangeCopy(e.target.value)}
                placeholder={`🚗 Internal-access garage\n🌅 Deck & patio for entertaining\n…\n📞 Book your private viewing today`}
              />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">Property page link</p>
              <p className="mb-2 text-xs text-slate-500">
                Click-through URL so people return to this listing. Save draft / Publish stores it.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="url"
                  className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  value={marketingLink}
                  onChange={(e) => onChangeLink(e.target.value)}
                  placeholder={defaultPropertyLink || 'https://kaboohomes.com/property/...'}
                />
                {defaultPropertyLink && (
                  <button
                    type="button"
                    onClick={() => onChangeLink(defaultPropertyLink)}
                    className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Use listing URL
                  </button>
                )}
              </div>
              {linkValue && (
                <p className="mt-1.5 truncate text-xs text-slate-500">
                  Active:{' '}
                  <a
                    href={linkValue}
                    className="font-medium text-primary-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {linkValue}
                  </a>
                </p>
              )}
            </div>

            {linkValue && <EnquiryLinks baseUrl={linkValue} marketingCopy={marketingCopy} />}
          </div>
        </div>
      )}

      {previewIndex != null && visibleItems.length > 0 && (
        <MarketingPreviewModal
          kind={selectedKind}
          items={visibleItems}
          startIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </FormSection>
  );
}
