import { useState, useEffect, useCallback, useRef, type ComponentProps, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApiAuthStore } from '../../store/apiAuthStore';
import { useApiListingsStore } from '../../store/apiListingsStore';
import { agentsApi, listingsApi, type AgentUser } from '../../services/api';
import { Listing, ListingStatus, PropertyType } from '../../types';
import { locationHierarchy } from '../../data/mockListings';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { FormSection } from '../../components/admin/FormSection';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import {
  ListingFormExtras,
  type MediaRow,
  type UpdateRow,
  type OpenHomeRow,
  type DocumentRow,
} from '../../components/admin/ListingFormExtras';
import { openListingPublicPage } from '../../utils/listingRoutes';

/** Convert an API ISO timestamp to a value for <input type="datetime-local"> in local time. */
function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Button icons ─────────────────────────────────────────────────────────────
function IcoX({ cls = 'h-3.5 w-3.5 shrink-0' }: { cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function IcoEye({ cls = 'h-3.5 w-3.5 shrink-0' }: { cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IcoSave({ cls = 'h-3.5 w-3.5 shrink-0' }: { cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
  );
}
function IcoCheck({ cls = 'h-3.5 w-3.5 shrink-0' }: { cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IcoSend({ cls = 'h-3.5 w-3.5 shrink-0' }: { cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}
function IcoRefresh({ cls = 'h-3.5 w-3.5 shrink-0' }: { cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}
function IcoDollar({ cls = 'h-3.5 w-3.5 shrink-0' }: { cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  );
}
function IcoKey({ cls = 'h-3.5 w-3.5 shrink-0' }: { cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.169.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}
function IcoWithdraw({ cls = 'h-3.5 w-3.5 shrink-0' }: { cls?: string }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}
function IcoSpin({ cls = 'h-3.5 w-3.5 shrink-0' }: { cls?: string }) {
  return <span className={`${cls} animate-spin rounded-full border border-current border-t-transparent`} />;
}

const propertyTypes: PropertyType[] = ['House', 'Apartment', 'Unit', 'Townhouse', 'Lifestyle', 'Land', 'Other'];

const FORM_NAV = [
  { id: 'form-basics', label: 'Basics' },
  { id: 'form-location', label: 'Location' },
  { id: 'form-price', label: 'Price' },
  { id: 'form-specs', label: 'Specs' },
  { id: 'form-extras', label: 'Photos & extras' },
  { id: 'form-marketing', label: 'Marketing' },
] as const;

const FORM_NAV_IDS: Set<string> = new Set(FORM_NAV.map((n) => n.id));

/** Pixels of breathing room below sticky header + form toolbar when jumping to a section */
const SCROLL_GAP_PX = 14;

function getScrollOffsetPx(toolbarEl: HTMLElement | null): number {
  const siteHeader = document.querySelector('header');
  const h = siteHeader?.getBoundingClientRect().height ?? 0;
  const t = toolbarEl?.getBoundingClientRect().height ?? 0;
  return h + t + SCROLL_GAP_PX;
}


function StatInput({
  icon,
  label,
  ...inputProps
}: ComponentProps<typeof Input> & { icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 transition-colors focus-within:border-primary-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/15">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm ring-1 ring-slate-200/80">
          {icon}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-600">{label}</span>
      </div>
      <Input label={undefined} className="border-0 bg-transparent p-0 shadow-none focus:ring-0" {...inputProps} />
    </div>
  );
}

// ── Owner picker card (super admin only) ──────────────────────────────────────

interface OwnerPickerProps {
  value: string;
  onChange: (agentId: string) => void;
  agents: AgentUser[];
  myUserId: string;
  loading: boolean;
}

function OwnerPickerCard({ value, onChange, agents, myUserId, loading }: OwnerPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const isSelf = value === myUserId || value === '';
  const selected = isSelf ? null : agents.find((a) => a.id === value) ?? null;
  const displayName = selected
    ? [selected.firstName, selected.lastName].filter(Boolean).join(' ') || selected.mobileNumber
    : 'Me (super admin)';
  const initials = selected
    ? [selected.firstName?.charAt(0), selected.lastName?.charAt(0)].filter(Boolean).join('').toUpperCase() || '?'
    : 'SA';

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    const name = [a.firstName, a.lastName].filter(Boolean).join(' ').toLowerCase();
    return name.includes(q) || a.mobileNumber.includes(q) || (a.agencyName || '').toLowerCase().includes(q);
  });

  const pick = (id: string) => { onChange(id); setOpen(false); setSearch(''); };

  return (
    <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-700">Listing owner</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Selected owner card */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            {selected?.profilePhotoUrl ? (
              <img
                src={selected.profilePhotoUrl}
                alt={displayName}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-md"
              />
            ) : (
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-white shadow-md ${
                isSelf ? 'bg-gradient-to-br from-violet-500 to-violet-700' : 'bg-gradient-to-br from-primary-500 to-primary-700'
              }`}>
                {initials}
              </div>
            )}
            {isSelf && (
              <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-violet-600 p-0.5 ring-2 ring-white">
                <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            )}
          </div>
          {/* Name + meta */}
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">
              {isSelf
                ? 'Super admin — listing credited to you'
                : selected?.agencyName
                  ? `${selected.agencyName}${(selected._count?.listings ?? 0) > 0 ? ` · ${selected._count.listings} listing${selected._count.listings !== 1 ? 's' : ''}` : ''}`
                  : `${(selected?._count?.listings ?? 0)} listing${(selected?._count?.listings ?? 0) !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Change button */}
        <div className="relative shrink-0" ref={ref}>
          <button
            type="button"
            disabled={loading}
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm font-medium text-primary-700 shadow-sm transition hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border border-primary-400 border-t-transparent" />
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            )}
            Change
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-900/5">
              {/* Search */}
              <div className="p-2 border-b border-slate-100">
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search agents…"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {/* Self option */}
                <button
                  type="button"
                  onClick={() => pick(myUserId)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 ${isSelf ? 'bg-primary-50' : ''}`}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xs font-bold shrink-0">SA</div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">Me (super admin)</p>
                    <p className="text-xs text-slate-500">Listing credited to you</p>
                  </div>
                  {isSelf && <svg className="ml-auto h-4 w-4 shrink-0 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </button>

                {/* Agent options */}
                {filtered.length === 0 && search && (
                  <p className="px-4 py-3 text-xs text-slate-400 text-center">No agents match "{search}"</p>
                )}
                {filtered.map((a) => {
                  const name = [a.firstName, a.lastName].filter(Boolean).join(' ') || a.mobileNumber;
                  const initials2 = [a.firstName?.charAt(0), a.lastName?.charAt(0)].filter(Boolean).join('').toUpperCase() || '?';
                  const isSelected = a.id === value;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => pick(a.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 ${isSelected ? 'bg-primary-50' : ''}`}
                    >
                      {a.profilePhotoUrl ? (
                        <img src={a.profilePhotoUrl} alt={name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials2}</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate">{name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {a.agencyName ? `${a.agencyName} · ` : ''}{a._count?.listings ?? 0} listing{(a._count?.listings ?? 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {isSelected && <svg className="ml-auto h-4 w-4 shrink-0 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main form page ─────────────────────────────────────────────────────────────

export function AdminListingFormPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isSuperAdmin = useApiAuthStore((s) => s.isSuperAdmin);
  const myUserId = useApiAuthStore((s) => s.userId);
  const { addListing, updateListing } = useApiListingsStore();
  const formToolbarRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [agentOptions, setAgentOptions] = useState<AgentUser[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [listingOwnerId, setListingOwnerId] = useState<string>('');

  const scrollToFormSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const offset = getScrollOffsetPx(formToolbarRef.current);
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    window.history.replaceState(null, '', `#${sectionId}`);
  }, []);

  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Listing>>({
    listingType: 'SALE',
    status: 'draft',
    headline: '',
    description: '',
    location: { region: '', district: '', suburb: '' },
    propertyType: 'House',
    price: undefined,
    rentPerWeek: undefined,
    priceNegotiable: false,
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    floorArea: undefined,
    landArea: undefined,
    features: [],
    images: [],
  });

  const [saveError, setSaveError] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaRow[]>([]);
  const [updateItems, setUpdateItems] = useState<UpdateRow[]>([]);
  const [openHomeItems, setOpenHomeItems] = useState<OpenHomeRow[]>([]);
  const [documentItems, setDocumentItems] = useState<DocumentRow[]>([]);

  const urlParams = new URLSearchParams(location.search);
  const ownerAgentMode = urlParams.get('owner') === 'agent';
  // agentId passed from the agent panel (e.g. ?owner=agent&agentId=xxx)
  const preselectedAgentId = urlParams.get('agentId') ?? '';

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    setAgentsLoading(true);
    agentsApi
      .getAgents({
        status: 'active',
        sort: 'name',
        order: 'asc',
        page: 1,
        pageSize: 100,
      })
      .then((res) => {
        if (!cancelled) {
          setAgentOptions(res.users ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setAgentOptions([]);
      })
      .finally(() => {
        if (!cancelled) setAgentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      if (isSuperAdmin && myUserId) setListingOwnerId(myUserId);
      return;
    }
    let cancelled = false;
    setLoadError(null);
    listingsApi
      .getListingById(id)
      .then((listing) => {
        if (cancelled || !listing) return;
        setFormData(listing);
        if (isSuperAdmin) {
          setListingOwnerId(listing.createdBy || myUserId || '');
        }
        const CAMPAIGN_KINDS = ['VIDEO', 'REEL', 'FLYER', 'CAROUSEL'];
        setMediaItems(
          listing.media?.length
            ? listing.media
                .filter((m) => !CAMPAIGN_KINDS.includes(m.kind || ''))
                .map((m) => ({
                  url: m.url,
                  kind: (m.kind || 'PHOTO') as MediaRow['kind'],
                }))
            : (listing.images || []).map((url) => ({ url, kind: 'PHOTO' as const }))
        );
        setUpdateItems(listing.updates?.map((u) => ({ body: u.body })) || []);
        setOpenHomeItems(
          listing.openHomes?.map((o) => ({
            startsAt: o.startsAt ? toDatetimeLocalValue(o.startsAt) : '',
            endsAt: o.endsAt ? toDatetimeLocalValue(o.endsAt) : '',
            label: o.label || '',
          })) || []
        );
        setDocumentItems(listing.documents?.map((d) => ({ title: d.title, url: d.url || '' })) || []);
      })
      .catch((err: { message?: string }) => {
        if (!cancelled) setLoadError(err?.message || 'Failed to load listing');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isSuperAdmin, myUserId]);

  useEffect(() => {
    if (isEdit || !isSuperAdmin || !ownerAgentMode || agentOptions.length === 0) return;
    // Only pre-select once (don't overwrite if user already picked something other than self)
    if (listingOwnerId && listingOwnerId !== myUserId) return;
    // Prefer the specific agent from ?agentId=, otherwise the first active agent
    const match = preselectedAgentId
      ? agentOptions.find((a) => a.id === preselectedAgentId)
      : null;
    setListingOwnerId(match?.id ?? agentOptions[0].id);
  }, [agentOptions, isEdit, isSuperAdmin, listingOwnerId, myUserId, ownerAgentMode, preselectedAgentId]);

  // Deep link / refresh with #section — scroll after layout so toolbar height is correct
  useEffect(() => {
    if (loading || loadError) return;
    const raw = window.location.hash.replace(/^#/, '');
    if (!raw || !FORM_NAV_IDS.has(raw)) return;
    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) scrollToFormSection(raw);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [loading, loadError, scrollToFormSection]);

  const updateField = (field: keyof Listing, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateLocation = (key: 'region' | 'district' | 'suburb', value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location!,
        [key]: value,
        ...(key === 'region' && { district: '', suburb: '' }),
        ...(key === 'district' && { suburb: '' }),
      },
    }));
  };

  const handleOwnerChange = (newOwnerId: string) => {
    setListingOwnerId(newOwnerId);
  };

  const isOffMarketStatus = (s: string | undefined) =>
    s === 'sold' || s === 'rented' || s === 'withdrawn';

  const openPublicPreview = () => {
    if (!id || !formData.listingType) return;
    const loc = formData.location ?? { region: '', district: '', suburb: '' };
    openListingPublicPage({
      id,
      listingType: formData.listingType,
      location: {
        region: loc.region || '',
        district: loc.district || '',
        suburb: loc.suburb || '',
      },
    });
  };

  const resolvePayloadStatus = (intent: 'draft' | 'published', lifecycleOverride?: 'sold' | 'rented' | 'withdrawn'): ListingStatus => {
    if (lifecycleOverride) return lifecycleOverride;
    const current = formData.status;
    if (isOffMarketStatus(current)) {
      if (intent === 'published') return 'published';
      return current as ListingStatus;
    }
    return intent === 'draft' ? 'draft' : 'published';
  };

  const handleSave = async (intent: 'draft' | 'published', lifecycleOverride?: 'sold' | 'rented' | 'withdrawn') => {
    setSaveError(null);
    setSaving(true);
    const status = resolvePayloadStatus(intent, lifecycleOverride);
    const loc = formData.location ?? { region: '', district: '', suburb: '' };
    const mediaPayload = mediaItems.filter((m) => m.url.trim());
    const imageUrls = mediaPayload.map((m) => m.url.trim());

    const openHomesPayload = openHomeItems
      .filter((o) => o.startsAt.trim())
      .map((o) => ({
        startsAt: new Date(o.startsAt).toISOString(),
        endsAt: o.endsAt.trim() ? new Date(o.endsAt).toISOString() : undefined,
        label: o.label.trim() || undefined,
      }));
    // Always send createdBy when super admin — includes reassigning back to self
    const selectedOwnerId = (listingOwnerId.trim() || myUserId || '').trim();

    const payload = {
      listingType: formData.listingType!,
      status,
      headline: formData.headline?.trim() ?? '',
      description: formData.description?.trim() ?? '',
      location: loc,
      region: loc.region,
      district: loc.district,
      suburb: loc.suburb,
      // Empty optional values must be null (not omitted) so updates can clear them in the DB
      streetAddress: formData.streetAddress?.trim() || null,
      city: formData.city?.trim() || null,
      postalCode: formData.postalCode?.trim() || null,
      latitude: formData.latitude ?? null,
      longitude: formData.longitude ?? null,
      streetViewUrl: formData.streetViewUrl?.trim() || null,
      googleMapsUrl: formData.googleMapsUrl?.trim() || null,
      propertyType: formData.propertyType!,
      price: formData.price ?? null,
      rentPerWeek: formData.rentPerWeek ?? null,
      priceNegotiable: formData.priceNegotiable || false,
      bedrooms: formData.bedrooms ?? 0,
      bathrooms: formData.bathrooms ?? 0,
      halfBathrooms: formData.halfBathrooms ?? 0,
      lounges: formData.lounges ?? 0,
      livingRooms: formData.livingRooms ?? 0,
      parking: formData.parking ?? 0,
      offStreetParking: formData.offStreetParking ?? null,
      ensuiteCount: formData.ensuiteCount ?? 0,
      parkingDescription: formData.parkingDescription?.trim() || null,
      floorArea: formData.floorArea ?? null,
      landArea: formData.landArea ?? null,
      agencyReference: formData.agencyReference?.trim() || null,
      externalListingNumber: formData.externalListingNumber?.trim() || null,
      totalUnits: null,
      soldUnits: null,
      remainingUnits: null,
      expectedCompletion: formData.expectedCompletion?.trim() || null,
      builderName: formData.builderName?.trim() || null,
      schoolZone: formData.schoolZone?.trim() || null,
      warrantyInfo: formData.warrantyInfo?.trim() || null,
      amenitiesNearby: formData.amenitiesNearby?.trim() || null,
      interiorHighlights: formData.interiorHighlights?.trim() || null,
      layoutOptions: formData.layoutOptions?.trim() || null,
      openHomesNote: formData.openHomesNote?.trim() || null,
      marketingCopy: formData.marketingCopy?.trim() || null,
      marketingLink: formData.marketingLink?.trim() || null,
      features: [],
      images: imageUrls,
      media: mediaPayload,
      updates: updateItems.filter((u) => u.body.trim()).map((u) => ({ body: u.body.trim() })),
      openHomes: openHomesPayload,
      documents: documentItems
        .filter((d) => d.title.trim())
        .map((d) => ({ title: d.title.trim(), url: d.url.trim() || null })),
      notes: typeof formData.notes === 'string' ? formData.notes.trim() || null : null,
      featured: formData.featured || false,
      ...(isSuperAdmin && selectedOwnerId ? { createdBy: selectedOwnerId } : {}),
    };

    if (!payload.headline) {
      setSaveError('Headline is required.');
      setSaving(false);
      return;
    }
    if (!payload.description) {
      setSaveError('Description is required.');
      setSaving(false);
      return;
    }
    if (status !== 'draft' && (!loc.region?.trim() || !loc.district?.trim())) {
      setSaveError('Select a region and district under "Region & suburb" before publishing.');
      setSaving(false);
      return;
    }

    try {
      if (isEdit && id) {
        // null clears optional fields server-side (Partial<Listing> only allows undefined)
        await updateListing(id, payload as unknown as Partial<Listing>);
      } else {
        await addListing(payload as unknown as Omit<Listing, 'id' | 'listedDate' | 'updatedDate'>);
      }
      // Agents: "Publish" actually submits for admin review — surface that clearly after save.
      if (!isSuperAdmin && intent === 'published' && !lifecycleOverride) {
        navigate('/admin/listings', { state: { submittedForReview: true } });
      } else if (isSuperAdmin && intent === 'published' && !lifecycleOverride) {
        navigate('/admin/listings', { state: { publishedLive: true } });
      } else {
        navigate('/admin/listings');
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Failed to save listing';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const availableDistricts = formData.location?.region
    ? Object.keys(locationHierarchy[formData.location.region as keyof typeof locationHierarchy] || {})
    : [];

  const availableSuburbs =
    formData.location?.region && formData.location?.district
      ? (
          (locationHierarchy[formData.location.region as keyof typeof locationHierarchy] as Record<string, string[]>)?.[
            formData.location.district
          ] || []
        )
      : [];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/80">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          <p className="text-sm font-medium text-slate-600">Loading listing…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/80 px-4">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <p className="text-red-600 mb-6 text-sm leading-relaxed">{loadError}</p>
          <Button variant="outline" onClick={() => navigate('/admin/listings')}>
            Back to listings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/90 via-slate-50/50 to-white pb-28 lg:pb-12">
      {/* Sticky toolbar — height included in scroll offset for section nav */}
      <div
        id="listing-form-toolbar"
        ref={formToolbarRef}
        className="sticky top-16 z-30 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md sm:top-20"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/admin/listings"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Back to listings"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                {isEdit ? 'Edit listing' : 'New listing'}
              </h1>
              <p className="truncate text-xs text-slate-500 sm:text-sm">
                {isEdit ? 'Update details and save or submit for approval' : 'Fill in the essentials first — you can save a draft anytime'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Button variant="ghost" size="sm" className="shadow-none" onClick={() => navigate('/admin/listings')} disabled={saving}>
              <IcoX /> Cancel
            </Button>
            {isEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={openPublicPreview}
                disabled={saving}
                title="Opens the public listing page for the last saved version"
              >
                <IcoEye /> Preview
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => handleSave('draft')} disabled={saving}>
              {saving ? <IcoSpin /> : <IcoSave />}
              {saving ? 'Saving…' : isOffMarketStatus(formData.status) ? 'Save changes' : 'Save draft'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleSave('published')} disabled={saving}>
              {saving
                ? <IcoSpin />
                : isOffMarketStatus(formData.status)
                  ? <IcoRefresh />
                  : isSuperAdmin
                    ? <IcoCheck />
                    : <IcoSend />}
              {saving
                ? 'Publishing…'
                : isOffMarketStatus(formData.status)
                  ? 'Re-list'
                  : isSuperAdmin
                    ? 'Publish'
                    : 'Submit for approval'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Section jump (mobile) */}
        <nav
          className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Form sections"
        >
          {FORM_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToFormSection(item.id)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-left text-xs font-medium text-slate-600 shadow-sm transition hover:border-primary-300 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="lg:grid lg:grid-cols-[11rem_1fr] lg:gap-10 xl:grid-cols-[12.5rem_1fr]">
          {/* Sidebar nav (desktop) */}
          <aside className="mb-8 hidden lg:block">
            <nav className="sticky top-44 space-y-0.5 text-sm" aria-label="Form sections">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">On this page</p>
              {FORM_NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToFormSection(item.id)}
                  className="block w-full rounded-lg px-3 py-2 text-left font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 space-y-6">
            {/* ── Owner picker — super admin only ── */}
            {isSuperAdmin && (
              <OwnerPickerCard
                value={listingOwnerId}
                onChange={handleOwnerChange}
                agents={agentOptions}
                myUserId={myUserId ?? ''}
                loading={agentsLoading}
              />
            )}

            {isSuperAdmin && (
              <p className="text-xs text-slate-500 -mt-2">
                Agency, office, and agent display on listings are edited per agent under{' '}
                <Link to="/admin/agents" className="font-medium text-primary-600 hover:underline">
                  Agent management
                </Link>
                .
              </p>
            )}

            {!isSuperAdmin && (
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
                <strong className="font-semibold">Agents:</strong> publishing sends your listing to a super admin. It stays off the public site until they approve it.
              </div>
            )}

            {isSuperAdmin && (
              <label className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!formData.featured}
                  onChange={(e) => updateField('featured', e.target.checked)}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                <div>
                  <p className="text-sm font-semibold text-orange-900">Featured listing</p>
                  <p className="text-xs text-orange-700 mt-0.5">
                    Shows first on the category browse page as a normal listing, and in the featured carousel on search results
                  </p>
                </div>
              </label>
            )}

            {saveError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {saveError}
              </div>
            )}

            {formData.status === 'published' && (
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm ring-1 ring-slate-900/5 sm:p-6">
                <h3 className="text-base font-semibold text-slate-900">Off the market</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Close the listing when it has sold, been let, or you need to remove it from the public site. You can
                  edit details anytime; use <strong>Re-list</strong> when it should go live again.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.listingType === 'SALE' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={saving}
                      onClick={() => handleSave('draft', 'sold')}
                    >
                      <IcoDollar /> Mark as sold
                    </Button>
                  )}
                  {(formData.listingType === 'RENT' || formData.listingType === 'FLATMATES') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={saving}
                      onClick={() => handleSave('draft', 'rented')}
                    >
                      <IcoKey /> Mark as rented
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={saving}
                    onClick={() => handleSave('draft', 'withdrawn')}
                  >
                    <IcoWithdraw /> Withdraw listing
                  </Button>
                </div>
              </div>
            )}

            {isOffMarketStatus(formData.status) && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-5 py-4 sm:px-6">
                <p className="text-sm font-semibold capitalize text-slate-900">
                  {formData.status === 'sold' && 'Sold — off market'}
                  {formData.status === 'rented' && 'Rented — off market'}
                  {formData.status === 'withdrawn' && 'Withdrawn — off market'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  This property no longer appears in public search. Use <strong>Save changes</strong> to update copy or
                  photos, or <strong>Re-list</strong> to submit it for publication again.
                </p>
              </div>
            )}

            <FormSection
              id="form-basics"
              title="Listing basics"
              subtitle="How this property appears in search — lead with a clear headline and honest description."
            >
              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">Listing type</span>
                <div className="grid grid-cols-3 gap-2 p-1 sm:max-w-lg rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
                  {(['SALE', 'RENT', 'FLATMATES'] as const).map((t) => {
                    const active = formData.listingType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateField('listingType', t)}
                        className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                          active
                            ? 'bg-white text-primary-700 shadow-md shadow-slate-900/10 ring-1 ring-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t === 'SALE' ? 'For sale' : t === 'RENT' ? 'For rent' : 'Flatmates'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input
                label="Headline"
                value={formData.headline || ''}
                onChange={(e) => updateField('headline', e.target.value)}
                placeholder="e.g. Sun-filled family home near the water"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <RichTextEditor
                  value={formData.description || ''}
                  onChange={(html) => updateField('description', html)}
                  placeholder="Highlight layout, condition, schools, transport, and what makes this home special."
                  maxLength={5000}
                />
              </div>

              <Select
                label="Property type"
                value={formData.propertyType || ''}
                onChange={(e) => updateField('propertyType', e.target.value as PropertyType)}
                options={propertyTypes.map((type) => ({ value: type, label: type }))}
              />
            </FormSection>

            <FormSection
              id="form-location"
              title="Region & suburb"
              subtitle="Matches how buyers filter — choose the closest NZ locality."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Select
                  label="Region"
                  value={formData.location?.region || ''}
                  onChange={(e) => updateLocation('region', e.target.value)}
                  options={[
                    { value: '', label: 'Select region' },
                    ...Object.keys(locationHierarchy).map((region) => ({
                      value: region,
                      label: region,
                    })),
                  ]}
                  required
                />
                <Select
                  label="District"
                  value={formData.location?.district || ''}
                  onChange={(e) => updateLocation('district', e.target.value)}
                  disabled={!formData.location?.region}
                  options={[
                    { value: '', label: 'Select district' },
                    ...availableDistricts.map((district) => ({
                      value: district,
                      label: district,
                    })),
                  ]}
                  required
                />
                <Select
                  label="Suburb"
                  value={formData.location?.suburb || ''}
                  onChange={(e) => updateLocation('suburb', e.target.value)}
                  disabled={!formData.location?.district}
                  options={[
                    { value: '', label: 'Select suburb' },
                    ...availableSuburbs.map((suburb: string) => ({
                      value: suburb,
                      label: suburb,
                    })),
                  ]}
                  required
                />
              </div>
            </FormSection>

            <FormSection
              id="form-price"
              title="Pricing"
              subtitle={formData.listingType === 'SALE' ? 'Set an asking price or mark as negotiable.' : 'Weekly rent in NZD.'}
            >
              {formData.listingType === 'SALE' ? (
                <div className="space-y-4">
                  <Input
                    label="Price (NZD)"
                    type="number"
                    min={0}
                    value={formData.price === undefined || formData.price === null ? '' : formData.price}
                    onChange={(e) => updateField('price', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 1250000"
                  />
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 transition hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.priceNegotiable || false}
                      onChange={(e) => updateField('priceNegotiable', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Price by negotiation</span>
                  </label>
                </div>
              ) : (
                <Input
                  label="Rent per week (NZD)"
                  type="number"
                  min={0}
                  value={formData.rentPerWeek === undefined || formData.rentPerWeek === null ? '' : formData.rentPerWeek}
                  onChange={(e) => updateField('rentPerWeek', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 650"
                />
              )}
            </FormSection>

            <FormSection
              id="form-specs"
              title="Property specs"
              subtitle="Key numbers buyers compare first."
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatInput
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  }
                  label="Bedrooms"
                  type="number"
                  min={0}
                  value={formData.bedrooms ?? ''}
                  onChange={(e) => updateField('bedrooms', Number(e.target.value))}
                />
                <StatInput
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 3L12 2l1.5 1H21v6H3V3h7.5z" />
                    </svg>
                  }
                  label="Bathrooms"
                  type="number"
                  min={0}
                  value={formData.bathrooms ?? ''}
                  onChange={(e) => updateField('bathrooms', Number(e.target.value))}
                />
                {(formData.listingType === 'SALE' || formData.listingType === 'RENT') && (
                  <>
                    <StatInput
                      icon={
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                      }
                      label="No. of lounges"
                      type="number"
                      min={0}
                      value={formData.lounges ?? ''}
                      onChange={(e) => updateField('lounges', Number(e.target.value))}
                    />
                    <StatInput
                      icon={
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      }
                      label="No. of living"
                      type="number"
                      min={0}
                      value={formData.livingRooms ?? ''}
                      onChange={(e) => updateField('livingRooms', Number(e.target.value))}
                    />
                  </>
                )}
                <StatInput
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  }
                  label="Garage spaces"
                  type="number"
                  min={0}
                  value={formData.parking ?? ''}
                  onChange={(e) => updateField('parking', Number(e.target.value))}
                />
                <StatInput
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2.5 0M13 16H3m10 0h5.5M18 16V9.5A2.5 2.5 0 0015.5 7H13" />
                    </svg>
                  }
                  label="Off-street spaces"
                  type="number"
                  min={0}
                  value={formData.offStreetParking ?? ''}
                  onChange={(e) => updateField('offStreetParking', e.target.value ? Number(e.target.value) : undefined)}
                />
                <StatInput
                  icon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  }
                  label="Floor m²"
                  type="number"
                  min={0}
                  value={formData.floorArea ?? ''}
                  onChange={(e) => updateField('floorArea', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <Input
                label="Land area (m²)"
                type="number"
                min={0}
                value={formData.landArea ?? ''}
                onChange={(e) => updateField('landArea', e.target.value ? Number(e.target.value) : undefined)}
              />
              <Input
                label="Parking description (optional)"
                placeholder="e.g. 1 internal garage + 1 off-street, or Street parking only"
                value={formData.parkingDescription ?? ''}
                onChange={(e) => updateField('parkingDescription', e.target.value || undefined)}
              />
            </FormSection>

            <div id="form-extras" className="scroll-mt-[11rem] sm:scroll-mt-[11.5rem]">
              <ListingFormExtras
                formData={formData}
                updateField={updateField}
                mediaItems={mediaItems}
                setMediaItems={setMediaItems}
                updateItems={updateItems}
                setUpdateItems={setUpdateItems}
                openHomeItems={openHomeItems}
                setOpenHomeItems={setOpenHomeItems}
                documentItems={documentItems}
                setDocumentItems={setDocumentItems}
              />
            </div>

            {/* Desktop footer actions */}
            <div className="hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:block">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">Drafts are private. {isSuperAdmin ? 'Publish goes live immediately.' : 'Submit for approval when you are ready for review.'}</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => navigate('/admin/listings')} disabled={saving}>
                    <IcoX /> Cancel
                  </Button>
                  {isEdit && (
                    <Button
                      variant="outline"
                      onClick={openPublicPreview}
                      disabled={saving}
                      title="Opens the public listing page for the last saved version"
                    >
                      <IcoEye /> Preview as public
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => handleSave('draft')} disabled={saving}>
                    {saving ? <IcoSpin /> : <IcoSave />}
                    {saving ? 'Saving…' : isOffMarketStatus(formData.status) ? 'Save changes' : 'Save draft'}
                  </Button>
                  <Button variant="primary" onClick={() => handleSave('published')} disabled={saving}>
                    {saving
                      ? <IcoSpin />
                      : isOffMarketStatus(formData.status)
                        ? <IcoRefresh />
                        : isSuperAdmin
                          ? <IcoCheck />
                          : <IcoSend />}
                    {saving
                      ? 'Publishing…'
                      : isOffMarketStatus(formData.status)
                        ? 'Re-list'
                        : isSuperAdmin
                          ? 'Publish'
                          : 'Submit for approval'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky actions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <Button variant="secondary" className="flex-1" size="md" onClick={() => handleSave('draft')} disabled={saving}>
            {saving ? <IcoSpin /> : <IcoSave />}
            {saving ? 'Saving…' : isOffMarketStatus(formData.status) ? 'Save changes' : 'Save draft'}
          </Button>
          <Button variant="primary" className="flex-1" size="md" onClick={() => handleSave('published')} disabled={saving}>
            {saving
              ? <IcoSpin />
              : isOffMarketStatus(formData.status)
                ? <IcoRefresh />
                : isSuperAdmin
                  ? <IcoCheck />
                  : <IcoSend />}
            {saving ? 'Publishing…' : isOffMarketStatus(formData.status) ? 'Re-list' : isSuperAdmin ? 'Publish' : 'Submit for approval'}
          </Button>
        </div>
      </div>
    </div>
  );
}
