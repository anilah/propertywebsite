import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApiAuthStore } from '../../store/apiAuthStore';
import { useApiListingsStore } from '../../store/apiListingsStore';
import { listingsApi } from '../../services/api';
import type { Listing } from '../../types';
import { formatSalePrice, formatRent } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusMeta(status: string): { label: string; variant: 'success' | 'warning' | 'primary' | 'default' | 'info' } {
  switch (status) {
    case 'published':        return { label: 'Live',             variant: 'success' };
    case 'pending_approval': return { label: 'Pending approval', variant: 'primary' };
    case 'sold':             return { label: 'Sold',             variant: 'default' };
    case 'rented':           return { label: 'Rented',          variant: 'default' };
    case 'withdrawn':        return { label: 'Withdrawn',        variant: 'info'    };
    default:                 return { label: 'Draft',            variant: 'warning' };
  }
}

function ownerDisplayName(owner?: Listing['listingOwner']) {
  if (!owner) return null;
  return [owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.mobileNumber || null;
}

function listingAgentInfo(listing: Listing): {
  showProfile: boolean;
  name: string | null;
  photoUrl?: string;
  agency: string | null;
  license: string | null;
  coListingAgentName: string | null;
  coListingAgentPhotoUrl: string | null;
} {
  const owner = listing.listingOwner;
  const ownerName = ownerDisplayName(owner);
  const showProfile = owner?.role === 'AGENT' || owner?.role === 'SUPER_ADMIN';
  return {
    showProfile,
    name: showProfile ? (listing.listingAgentDisplayName ?? ownerName) : null,
    photoUrl: showProfile ? (listing.listingAgentPhotoUrl ?? owner?.profilePhotoUrl ?? undefined) : undefined,
    agency: showProfile ? (listing.agencyDisplayName ?? owner?.agencyName ?? null) : null,
    license: showProfile ? (listing.agencyLicense ?? null) : null,
    coListingAgentName: showProfile ? (listing.coListingAgentName ?? null) : null,
    coListingAgentPhotoUrl: showProfile ? (listing.coListingAgentPhotoUrl ?? null) : null,
  };
}

function OwnerAvatar({ owner, size = 7 }: { owner?: Listing['listingOwner']; size?: number }) {
  const [imgErr, setImgErr] = useState(false);
  const px = `${size * 4}px`;
  const name = ownerDisplayName(owner) ?? '';
  const initials = [owner?.firstName?.charAt(0), owner?.lastName?.charAt(0)].filter(Boolean).join('').toUpperCase() || '?';
  if (owner?.profilePhotoUrl && !imgErr) {
    return (
      <img
        src={owner.profilePhotoUrl}
        alt={name}
        style={{ width: px, height: px }}
        className="rounded-full object-cover ring-2 ring-white shadow-sm shrink-0"
        onError={() => setImgErr(true)}
      />
    );
  }
  return (
    <div
      style={{ width: px, height: px, fontSize: size <= 6 ? '10px' : '12px' }}
      className="rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold ring-2 ring-white shadow-sm shrink-0"
    >
      {initials}
    </div>
  );
}

function AgentCircle({
  photoUrl,
  name,
  size,
  className = '',
}: {
  photoUrl?: string | null;
  name?: string | null;
  size: number;
  className?: string;
}) {
  const [imgErr, setImgErr] = useState(false);
  const px = `${size}px`;
  const initials = (name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
  const textSz = size >= 44 ? 'text-sm' : 'text-[10px]';
  return (
    <div
      style={{ width: px, height: px, minWidth: px }}
      className={`rounded-full overflow-hidden border-[2.5px] border-slate-800 bg-slate-700 ${className}`}
    >
      {photoUrl && !imgErr ? (
        <img src={photoUrl} alt={name || ''} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-700 text-white font-bold ${textSz}`}>
          {initials}
        </div>
      )}
    </div>
  );
}

// ── Pending-approval card (super admin quick-action) ─────────────────────────

function PendingCard({ listing, onApproved }: { listing: Listing; onApproved: () => void }) {
  const navigate = useNavigate();
  const [approving, setApproving] = useState(false);
  const owner = listing.listingOwner;
  const ownerName = ownerDisplayName(owner);

  const approve = async () => {
    setApproving(true);
    try {
      await listingsApi.updateListing(listing.id, { status: 'published' });
      onApproved();
    } catch { /* ignore */ }
    finally { setApproving(false); }
  };

  return (
    <div className="flex gap-4 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4 transition hover:border-amber-300 hover:bg-amber-50">
      {/* Thumbnail */}
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-200">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.headline} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold leading-snug text-slate-900">{listing.headline}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {listing.location.suburb}, {listing.location.district}
        </p>
        {owner && ownerName && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <OwnerAvatar owner={owner} size={5} />
            <span className="text-xs text-slate-600 truncate">{ownerName}</span>
            {owner.agencyName && <span className="text-xs text-slate-400">· {owner.agencyName}</span>}
          </div>
        )}
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={approve}
            disabled={approving}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {approving ? (
              <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {approving ? 'Publishing…' : 'Approve & publish'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/listings/${listing.id}/edit`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Listing management card ───────────────────────────────────────────────────

function ListingManagementCard({
  listing,
  showOwner,
}: {
  listing: Listing;
  showOwner: boolean;
}) {
  const { label, variant } = statusMeta(listing.status);
  const agent = listingAgentInfo(listing);
  const price = listing.listingType === 'SALE' ? formatSalePrice(listing) : formatRent(listing);

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-slate-200/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
        {listing.images?.[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.headline}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge variant={variant} className="backdrop-blur-sm shadow-sm">{label}</Badge>
        </div>
        <p className="absolute bottom-3 left-3 right-3 truncate text-lg font-bold text-white drop-shadow-sm">
          {price}
        </p>
      </div>

      {/* Agent strip for super admin — overlapping duo avatar style */}
      {showOwner && agent.showProfile && agent.name && (
        <div className="flex items-center gap-3 border-t border-slate-800 bg-black px-4 py-3 text-white">
          {/* Overlapping avatar pair */}
          <div className="flex items-center shrink-0">
            <AgentCircle photoUrl={agent.photoUrl} name={agent.name} size={44} className="relative z-10" />
            {agent.coListingAgentName && (
              <AgentCircle photoUrl={agent.coListingAgentPhotoUrl} name={agent.coListingAgentName} size={44} className="relative -ml-2.5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {agent.name}
              {agent.coListingAgentName && (
                <span className="text-slate-300"> &amp; {agent.coListingAgentName}</span>
              )}
            </p>
            {(agent.agency || agent.license) && (
              <p className="truncate text-xs text-slate-400 mt-0.5">
                {[agent.agency, agent.license].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1.5 line-clamp-2 font-semibold leading-snug text-slate-900">{listing.headline}</h3>
        <p className="mb-3 flex items-start gap-1.5 text-sm text-slate-500">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{listing.location.suburb}, {listing.location.district}</span>
        </p>

        {/* Specs chips */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{listing.listingType}</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{listing.propertyType}</span>
          {listing.bedrooms > 0 && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{listing.bedrooms} bed</span>
          )}
          {listing.bathrooms > 0 && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{listing.bathrooms} bath</span>
          )}
        </div>

        <Link to={`/admin/listings/${listing.id}/edit`} className="mt-auto">
          <Button variant="outline" size="md" className="w-full border-slate-200 hover:border-primary-300 hover:bg-primary-50/50">
            <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit listing
          </Button>
        </Link>
      </div>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'draft' | 'pending_approval' | 'published' | 'off_market';

export function AdminListingsPage() {
  const isSuperAdmin = useApiAuthStore((s) => s.isSuperAdmin);
  const { myListings, myListingsLoading, fetchMyListings } = useApiListingsStore();
  const [filter, setFilter] = useState<FilterTab>('all');

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const listings = myListings;

  const stats = useMemo(() => ({
    total:     listings.length,
    draft:     listings.filter((l) => l.status === 'draft').length,
    pending:   listings.filter((l) => l.status === 'pending_approval').length,
    published: listings.filter((l) => l.status === 'published').length,
    offMarket: listings.filter((l) => ['sold', 'rented', 'withdrawn'].includes(l.status)).length,
  }), [listings]);

  const pendingListings = useMemo(
    () => listings.filter((l) => l.status === 'pending_approval'),
    [listings]
  );

  const filteredListings = useMemo(() => {
    if (filter === 'all') return listings.filter((l) => l.status !== 'pending_approval');
    if (filter === 'off_market') return listings.filter((l) => ['sold', 'rented', 'withdrawn'].includes(l.status));
    return listings.filter((l) => l.status === filter);
  }, [listings, filter]);

  const filterTabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'all',              label: 'All',         count: stats.total - stats.pending },
    { id: 'draft',            label: 'Drafts',      count: stats.draft },
    { id: 'published',        label: 'Live',        count: stats.published },
    { id: 'off_market',       label: 'Off market',  count: stats.offMarket },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/90 via-slate-50/40 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* ── Page header ── */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
              {isSuperAdmin ? 'Platform management' : 'Listings'}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {isSuperAdmin ? 'All listings' : 'Your properties'}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
              {isSuperAdmin
                ? 'Manage every property across all agents. Publish, approve, and assign listings from one place.'
                : 'Create drafts, submit for approval, and keep your listings up to date.'}
            </p>
          </div>
          <Link to="/admin/listings/new" className="shrink-0">
            <Button variant="primary" size="lg" className="w-full shadow-lg shadow-primary-600/25 sm:w-auto">
              <svg className="mr-2 inline h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New listing
            </Button>
          </Link>
        </div>

        {/* ── Stats row ── */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {[
            { label: 'Total',      value: stats.total,     accent: 'from-slate-700 to-slate-800' },
            { label: 'Live',       value: stats.published, accent: 'from-emerald-500 to-emerald-600' },
            { label: 'Drafts',     value: stats.draft,     accent: 'from-amber-500 to-amber-600' },
            { label: 'Off market', value: stats.offMarket, accent: 'from-slate-500 to-slate-600' },
          ].map((s) => (
            <div
              key={s.label}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
              <p className={`mt-1 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent ${s.accent}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Pending approval queue — super admin only ── */}
        {isSuperAdmin && pendingListings.length > 0 && (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-900">
                Pending approval
                <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">
                  {pendingListings.length}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingListings.map((l) => (
                <PendingCard key={l.id} listing={l} onApproved={fetchMyListings} />
              ))}
            </div>
          </section>
        )}

        {/* ── Filter tabs + listing grid ── */}
        {myListingsLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
            <p className="text-sm font-medium text-slate-500">Loading listings…</p>
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {isSuperAdmin ? 'All properties' : 'My listings'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      filter === tab.id
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 tabular-nums text-xs ${filter === tab.id ? 'text-slate-300' : 'text-slate-400'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map((listing) => (
                  <ListingManagementCard
                    key={listing.id}
                    listing={listing}
                    showOwner={isSuperAdmin}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                <p className="text-slate-500">No listings match this filter.</p>
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="mt-3 text-sm font-semibold text-primary-600 hover:underline"
                >
                  Show all
                </button>
              </Card>
            )}
          </>
        ) : (
          /* Empty state */
          <Card className="overflow-hidden border-slate-200/90 p-0">
            <div className="bg-gradient-to-br from-primary-600/10 via-white to-slate-50 px-8 py-16 text-center sm:px-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/80">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">No listings yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                {isSuperAdmin
                  ? 'Create your first listing, or open an agent and click "New listing" to create on their behalf.'
                  : 'Start with a headline and a few photos — you can save as draft and finish later.'}
              </p>
              <Link to="/admin/listings/new" className="mt-8 inline-block">
                <Button variant="primary" size="lg">
                  {isSuperAdmin ? 'Create listing' : 'Create your first listing'}
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
