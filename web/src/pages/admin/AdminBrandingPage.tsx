import { useState, useEffect, useRef } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { uploadApi, PresignResponse } from '../../services/api';
import { AdminPwaInstallCard } from '../../components/admin/AdminPwaInstallCard';

interface BrandingData {
  siteName:               string;
  tagline:                string;
  primaryColor:           string;
  logoUrl:                string | null;
  faviconUrl:             string | null;
  heroImageUrl:           string | null;
  heroImagePosition:      string;
  logoSize:               number;
  contactMessageTemplate: string;
}

const DEFAULT_CONTACT_MESSAGE_TEMPLATE =
  "Hi, I'm interested in listing #{{listingId}} ({{suburb}}). Could you please provide more details? {{url}}";

type UploadField = 'logoUrl' | 'faviconUrl' | 'heroImageUrl';

const FIELD_META: Record<UploadField, { label: string; hint: string; aspectClass: string }> = {
  logoUrl:      { label: 'Site Logo',   hint: 'PNG with transparent background, 400×120px+',  aspectClass: 'aspect-[10/3]' },
  faviconUrl:   { label: 'Favicon',     hint: 'Square PNG, 512×512px — shown in browser tab', aspectClass: 'aspect-square'  },
  heroImageUrl: { label: 'Hero Image',  hint: 'Landscape JPG/PNG, min 1920×600px',             aspectClass: 'aspect-[21/6]'  },
};

const FALLBACK_HERO = 'https://www.trademe.co.nz/images/frend/property/landingpage/resi4sale-xl-1920.jpg';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token')?.trim() ?? '';
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && init?.body) headers.set('Content-Type', 'application/json');
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

/** Parse "50% 30%" → { x: 50, y: 30 } */
function parsePosition(pos: string): { x: number; y: number } {
  const parts = pos.trim().split(/\s+/);
  const parse = (v: string) => parseFloat(v.replace('%', ''));
  return { x: isNaN(parse(parts[0])) ? 50 : parse(parts[0]), y: isNaN(parse(parts[1])) ? 50 : parse(parts[1]) };
}

function toPosition(x: number, y: number) { return `${x}% ${y}%`; }

export function AdminBrandingPage() {
  const { config, refresh } = useSiteConfig();
  const [form, setForm] = useState<BrandingData>({
    siteName: '', tagline: '', primaryColor: '#0d5c63',
    logoUrl: null, faviconUrl: null, heroImageUrl: null,
    heroImagePosition: '50% 50%',
    logoSize: 80,
    contactMessageTemplate: DEFAULT_CONTACT_MESSAGE_TEMPLATE,
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploading, setUploading] = useState<UploadField | null>(null);
  const fileRefs = useRef<Record<UploadField, HTMLInputElement | null>>({
    logoUrl: null, faviconUrl: null, heroImageUrl: null,
  });

  const heroPos = parsePosition(form.heroImagePosition);

  useEffect(() => {
    apiFetch<BrandingData>('/admin/branding')
      .then(data => setForm({
        ...data,
        heroImagePosition: data.heroImagePosition ?? '50% 50%',
        logoSize: data.logoSize ?? 80,
        contactMessageTemplate: data.contactMessageTemplate ?? DEFAULT_CONTACT_MESSAGE_TEMPLATE,
      }))
      .catch(() => setForm({
        siteName: config.siteName,
        tagline: config.tagline,
        primaryColor: config.primaryColor,
        logoUrl: config.logoUrl ?? null,
        faviconUrl: null,
        heroImageUrl: config.heroImageUrl ?? null,
        heroImagePosition: config.heroImagePosition ?? '50% 50%',
        logoSize: config.logoSize ?? 80,
        contactMessageTemplate: config.contactMessageTemplate ?? DEFAULT_CONTACT_MESSAGE_TEMPLATE,
      }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleImageUpload(field: UploadField, file: File) {
    setUploading(field);
    try {
      const presign: PresignResponse = await uploadApi.getPresignedUrl(file.type, 'uploads');
      await fetch(presign.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setForm(f => ({ ...f, [field]: presign.publicUrl }));
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus('idle');
    try {
      await apiFetch('/admin/branding', { method: 'PUT', body: JSON.stringify(form) });
      setSaveStatus('success');
      refresh();
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }

  /* ── Generic image upload card ─────────────────────────────────────────── */
  function ImageCard({ field }: { field: UploadField }) {
    const meta = FIELD_META[field];
    const url = form[field];
    const busy = uploading === field;

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{meta.label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{meta.hint}</p>
          </div>
          {url && (
            <button onClick={() => setForm(f => ({ ...f, [field]: null }))}
              className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
          )}
        </div>
        <div className="p-5">
          {url ? (
            <div className={`relative ${meta.aspectClass} w-full rounded-lg overflow-hidden bg-gray-50 border border-gray-200 mb-3`}>
              <img src={url} alt={meta.label} className="w-full h-full object-contain p-2" />
            </div>
          ) : (
            <div
              className={`${meta.aspectClass} w-full rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 mb-3 cursor-pointer hover:border-[#0d5c63] hover:bg-teal-50 transition-colors`}
              onClick={() => fileRefs.current[field]?.click()}
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <p className="text-sm text-gray-500">Click to upload</p>
            </div>
          )}
          <input
            ref={el => { fileRefs.current[field] = el; }}
            type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(field, file);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileRefs.current[field]?.click()}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            {busy ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Uploading…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>{url ? 'Replace image' : 'Upload image'}</>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── Logo card with size adjuster ────────────────────────────────────────── */
  function LogoCard() {
    const url = form.logoUrl;
    const busy = uploading === 'logoUrl';
    const size = form.logoSize ?? 48;

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Site Logo</h3>
            <p className="text-xs text-gray-500 mt-0.5">PNG with transparent background, 400×120px+</p>
          </div>
          {url && (
            <button onClick={() => setForm(f => ({ ...f, logoUrl: null }))}
              className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
          )}
        </div>
        <div className="p-5 space-y-4">
          {/* Live header preview */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Live header preview</p>
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <div
                className="flex items-center px-5 gap-3"
                style={{ backgroundColor: form.primaryColor, minHeight: `${Math.max(56, size + 16)}px` }}
              >
                {url ? (
                  <img
                    src={url}
                    alt="Logo preview"
                    className="w-auto object-contain"
                    style={{ height: `${size}px`, maxWidth: '240px' }}
                  />
                ) : (
                  <span className="text-white font-bold text-base">{form.siteName || 'Kaboo Homes'}</span>
                )}
                <div className="ml-auto flex items-center gap-3">
                  <div className="w-16 h-2.5 rounded bg-white/30" />
                  <div className="w-12 h-2.5 rounded bg-white/30" />
                  <div className="w-14 h-2.5 rounded bg-white/30" />
                </div>
              </div>
              <div className="bg-white px-4 py-1.5 text-xs text-gray-400">Header preview</div>
            </div>
          </div>

          {/* Size slider */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
              Logo Size
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range" min={28} max={88} step={2}
                value={size}
                onChange={e => setForm(f => ({ ...f, logoSize: Number(e.target.value) }))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-[#0d5c63]"
              />
              <span className="text-sm font-mono font-semibold text-gray-700 w-14 text-right">{size}px</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Small (28px)</span>
              <span>Default (56px)</span>
              <span>Large (88px)</span>
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, logoSize: 80 }))}
              className="text-xs text-[#0d5c63] hover:underline font-medium"
            >
              Reset to default
            </button>
          </div>

          {/* Upload / empty state */}
          {!url && (
            <div
              className="aspect-[10/3] w-full rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:border-[#0d5c63] hover:bg-teal-50 transition-colors"
              onClick={() => fileRefs.current.logoUrl?.click()}
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <p className="text-sm text-gray-500">Click to upload logo</p>
            </div>
          )}
          <input
            ref={el => { fileRefs.current.logoUrl = el; }}
            type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload('logoUrl', file);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileRefs.current.logoUrl?.click()}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            {busy ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Uploading…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>{url ? 'Replace logo' : 'Upload logo'}</>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── Hero image card with adjuster ───────────────────────────────────────── */
  function HeroImageCard() {
    const url = form.heroImageUrl;
    const busy = uploading === 'heroImageUrl';
    const previewSrc = url || FALLBACK_HERO;

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Hero Image</h3>
            <p className="text-xs text-gray-500 mt-0.5">Landscape JPG/PNG, min 1920×600px — shown at top of homepage</p>
          </div>
          {url && (
            <button onClick={() => setForm(f => ({ ...f, heroImageUrl: null }))}
              className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Live preview — mimics the actual homepage hero strip */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Live homepage preview</p>
            <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '160px' }}>
              <img
                src={previewSrc}
                alt="Hero preview"
                className="w-full h-full object-cover"
                style={{ objectPosition: form.heroImagePosition }}
              />
              {/* Tab overlay — same as actual homepage */}
              <div className="absolute bottom-0 left-0 right-0 flex">
                <span className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: form.primaryColor }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  For sale
                </span>
                <span className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white text-gray-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  For rent
                </span>
              </div>
              {!url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <p className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">Using default image — upload yours below</p>
                </div>
              )}
            </div>
          </div>

          {/* Position sliders */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>
              Image Position Adjuster
            </p>

            {/* Horizontal (X) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-600 font-medium">Horizontal focus</label>
                <span className="text-xs font-mono text-gray-500">{heroPos.x}%</span>
              </div>
              <input
                type="range" min={0} max={100} step={1}
                value={heroPos.x}
                onChange={e => setForm(f => ({ ...f, heroImagePosition: toPosition(Number(e.target.value), heroPos.y) }))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#0d5c63]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>Left</span><span>Centre</span><span>Right</span>
              </div>
            </div>

            {/* Vertical (Y) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-600 font-medium">Vertical focus</label>
                <span className="text-xs font-mono text-gray-500">{heroPos.y}%</span>
              </div>
              <input
                type="range" min={0} max={100} step={1}
                value={heroPos.y}
                onChange={e => setForm(f => ({ ...f, heroImagePosition: toPosition(heroPos.x, Number(e.target.value)) }))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#0d5c63]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>Top</span><span>Middle</span><span>Bottom</span>
              </div>
            </div>

            <button
              onClick={() => setForm(f => ({ ...f, heroImagePosition: '50% 50%' }))}
              className="text-xs text-[#0d5c63] hover:underline font-medium"
            >
              Reset to centre
            </button>
          </div>

          {/* Upload button */}
          <input
            ref={el => { fileRefs.current.heroImageUrl = el; }}
            type="file" accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload('heroImageUrl', file);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileRefs.current.heroImageUrl?.click()}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            {busy ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Uploading…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>{url ? 'Replace hero image' : 'Upload hero image'}</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-gradient-to-r from-[#0d5c63] to-[#0a4a50] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-300 mb-1">Super Admin</p>
          <h1 className="text-3xl font-bold">Site Branding</h1>
          <p className="text-teal-200 mt-1">Manage logo, favicon, hero image and site identity</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <AdminPwaInstallCard />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT — image uploads */}
          <div className="lg:col-span-2 space-y-6">
            <LogoCard />
            <HeroImageCard />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ImageCard field="faviconUrl" />
              {/* Favicon browser-tab preview */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Browser tab preview</h3>
                  <p className="text-xs text-gray-500 mb-4">How the favicon + site name appear in a tab</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-600 border border-gray-200">
                  {form.faviconUrl ? (
                    <img src={form.faviconUrl} alt="favicon" className="w-4 h-4 object-contain flex-shrink-0" />
                  ) : (
                    <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3 12c0 .778.099 1.533.284 2.253" />
                    </svg>
                  )}
                  <span className="truncate font-medium">{form.siteName || 'Kaboo Homes'}</span>
                  <span className="ml-auto text-gray-400 flex-shrink-0">×</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — text + colour + save */}
          <div className="space-y-6">
            {/* Site identity */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                Site Identity
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site name</label>
                <input
                  type="text" value={form.siteName}
                  onChange={e => setForm(f => ({ ...f, siteName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c63]"
                  placeholder="Kaboo Homes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text" value={form.tagline}
                  onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c63]"
                  placeholder="New Zealand's Premier Property Portal"
                />
              </div>
            </div>

            {/* Brand colour */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                </svg>
                Brand Colour
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-gray-200 flex-shrink-0 relative overflow-hidden" style={{ backgroundColor: form.primaryColor }}>
                  <input type="color" value={form.primaryColor}
                    onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <input type="text" value={form.primaryColor}
                  onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0d5c63]"
                  placeholder="#0d5c63"
                />
              </div>
              {/* Live header preview */}
              <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                <div className="h-10 flex items-center px-4 text-sm font-semibold text-white gap-2" style={{ backgroundColor: form.primaryColor }}>
                  {form.logoUrl
                    ? <img src={form.logoUrl} alt="logo" className="h-6 object-contain" />
                    : <span>{form.siteName || 'Kaboo Homes'}</span>
                  }
                </div>
                <div className="bg-white px-4 py-2 text-xs text-gray-400">Header preview</div>
              </div>
            </div>

            {/* Contact message template */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                WhatsApp / SMS Enquiry Template
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Pre-filled message shown when a visitor taps WhatsApp, SMS, or Call on a listing page (NZ site).
                Use placeholders — they're replaced automatically per listing:
                {' '}<code className="text-[11px] bg-gray-100 rounded px-1 py-0.5">{'{{listingId}}'}</code>,
                {' '}<code className="text-[11px] bg-gray-100 rounded px-1 py-0.5">{'{{suburb}}'}</code>,
                {' '}<code className="text-[11px] bg-gray-100 rounded px-1 py-0.5">{'{{headline}}'}</code>,
                {' '}<code className="text-[11px] bg-gray-100 rounded px-1 py-0.5">{'{{url}}'}</code>.
              </p>
              <textarea
                value={form.contactMessageTemplate}
                onChange={e => setForm(f => ({ ...f, contactMessageTemplate: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0d5c63]"
                placeholder={DEFAULT_CONTACT_MESSAGE_TEMPLATE}
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-gray-400">
                  Preview: {(form.contactMessageTemplate || DEFAULT_CONTACT_MESSAGE_TEMPLATE)
                    .replace('{{listingId}}', 'A1B2C3D4')
                    .replace('{{suburb}}', 'Mission Bay')
                    .replace('{{headline}}', 'Stunning 3-bed family home')
                    .replace('{{url}}', 'https://kaboohomes.com/…/listing/xxxx')}
                </p>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, contactMessageTemplate: DEFAULT_CONTACT_MESSAGE_TEMPLATE }))}
                  className="text-[11px] text-gray-500 hover:text-gray-700 font-medium shrink-0 ml-3"
                >
                  Reset to default
                </button>
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-sm disabled:opacity-60 transition-all"
              style={{ backgroundColor: form.primaryColor }}
            >
              {saving ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</>
              ) : saveStatus === 'success' ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>Saved!</>
              ) : saveStatus === 'error' ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>Save failed — retry</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>Save branding</>
              )}
            </button>
            {saveStatus === 'success' && (
              <p className="text-center text-sm text-green-600">Changes saved. Homepage will reflect updates immediately.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
