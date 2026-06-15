import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApiAuthStore } from '../../store/apiAuthStore';
import {
  agentsApi,
  listingsApi,
  ApiError,
  type PendingUser,
  type AgentUser,
  type AgentListingStats,
  type AgentListingRow,
  type PendingApprovalListing,
} from '../../services/api';
import { formatSalePrice, formatRent } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { PhotoPickerInput } from '../../components/ui/PhotoPickerInput';

function getErrorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message;
  }
  return 'Something went wrong';
}

function displayName(u: { firstName?: string | null; lastName?: string | null; mobileNumber: string }) {
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.mobileNumber;
}

function publicationQueueListingBadge(listing: { status: string }) {
  if (listing.status === 'published') {
    return { label: 'Live', variant: 'success' as const };
  }
  if (listing.status === 'pending_approval') {
    return { label: 'Pending approval', variant: 'primary' as const };
  }
  if (listing.status === 'sold') {
    return { label: 'Sold', variant: 'default' as const };
  }
  if (listing.status === 'rented') {
    return { label: 'Rented', variant: 'default' as const };
  }
  if (listing.status === 'withdrawn') {
    return { label: 'Withdrawn', variant: 'info' as const };
  }
  return { label: 'Draft', variant: 'warning' as const };
}

function statsOrFallback(u: AgentUser): AgentListingStats {
  return (
    u.listingStats ?? {
      total: u._count?.listings ?? 0,
      draft: 0,
      pendingApproval: 0,
      published: 0,
      offMarket: 0,
    }
  );
}

function ListingStatsCell({ stats }: { stats: AgentListingStats }) {
  const { total, published, pendingApproval, draft, offMarket } = stats;
  if (total === 0) {
    return <span className="text-sm text-gray-400">0</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-gray-900 tabular-nums">{total} total</span>
      <div className="flex flex-wrap gap-1">
        {published > 0 && (
          <Badge variant="success" className="text-[10px] px-1.5 py-0">
            {published} live
          </Badge>
        )}
        {offMarket > 0 && (
          <Badge variant="default" className="text-[10px] px-1.5 py-0">
            {offMarket} off market
          </Badge>
        )}
        {pendingApproval > 0 && (
          <Badge variant="primary" className="text-[10px] px-1.5 py-0">
            {pendingApproval} pending
          </Badge>
        )}
        {draft > 0 && (
          <Badge variant="warning" className="text-[10px] px-1.5 py-0">
            {draft} draft
          </Badge>
        )}
      </div>
    </div>
  );
}

function formatListingPrice(row: AgentListingRow) {
  if (row.listingType === 'RENT' && row.rentPerWeek != null) {
    return `$${Number(row.rentPerWeek).toLocaleString()}/wk`;
  }
  if (row.price != null) return `$${Number(row.price).toLocaleString()}`;
  return '—';
}

function statusBadgeVariant(s: string): 'success' | 'warning' | 'primary' | 'default' | 'info' {
  if (s === 'published') return 'success';
  if (s === 'pending_approval') return 'primary';
  if (s === 'draft') return 'warning';
  if (s === 'withdrawn') return 'info';
  return 'default';
}

// ─── Shared avatar helper ────────────────────────────────────────────────────
function AgentAvatar({
  photoUrl,
  firstName,
  lastName,
  size = 'md',
}: {
  photoUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'lg' ? 'w-16 h-16 text-xl' :
    size === 'md' ? 'w-9 h-9 text-sm' :
    size === 'sm' ? 'w-7 h-7 text-xs' :
    'w-6 h-6 text-[10px]';
  const initials = [firstName?.charAt(0), lastName?.charAt(0)].filter(Boolean).join('').toUpperCase() || '?';
  const [imgError, setImgError] = useState(false);

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName ?? ''} ${lastName ?? ''}`.trim() || 'Agent'}
        className={`${sizeClass} rounded-full object-cover border-2 border-white shadow-sm shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-primary-400 to-primary-700 border-2 border-white shadow-sm shrink-0 select-none`}>
      {initials}
    </div>
  );
}

// ─── Agent detail panel (slide-over) ─────────────────────────────────────────
type PanelTab = 'profile' | 'listings';

function AgentDetailPanel(props: {
  agent: AgentUser;
  initialTab: PanelTab;
  onClose: () => void;
  onSaved: (updated: AgentUser) => void;
  onActivate: (id: string) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
  actionId: string | null;
}) {
  const { agent, initialTab, onClose, onSaved, onActivate, onDeactivate, actionId } = props;

  const [tab, setTab] = useState<PanelTab>(initialTab);

  // ── PIN management ──
  const [currentPin, setCurrentPin] = useState<string | null>(agent.pin ?? null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinCopied, setPinCopied] = useState(false);

  const handleResetPin = async () => {
    setPinLoading(true);
    setPinError(null);
    try {
      const res = await agentsApi.resetAgentPin(agent.id);
      setCurrentPin(res.pin);
    } catch (err) {
      setPinError(err instanceof Error ? err.message : 'Failed to regenerate PIN');
    } finally {
      setPinLoading(false);
    }
  };

  const handleCopyPin = () => {
    if (!currentPin) return;
    navigator.clipboard.writeText(currentPin).then(() => {
      setPinCopied(true);
      setTimeout(() => setPinCopied(false), 2500);
    });
  };

  // ── Edit fields ──
  const [editMobile, setEditMobile] = useState(agent.mobileNumber);
  const [editFirstName, setEditFirstName] = useState(agent.firstName?.trim() ?? '');
  const [editLastName, setEditLastName] = useState(agent.lastName?.trim() ?? '');
  const [editEmail, setEditEmail] = useState(agent.email?.trim() ?? '');
  const [editAgency, setEditAgency] = useState(agent.agencyName?.trim() ?? '');
  const [editLicense, setEditLicense] = useState(agent.licenseNumber?.trim() ?? '');
  const [editPhoto, setEditPhoto] = useState(agent.profilePhotoUrl?.trim() ?? '');
  const [editOfficeBranch, setEditOfficeBranch] = useState(agent.officeBranchName?.trim() ?? '');
  const [editOfficePhone, setEditOfficePhone] = useState(agent.officePhone?.trim() ?? '');
  const [editOfficeWebsite, setEditOfficeWebsite] = useState(agent.officeWebsite?.trim() ?? '');
  const [editAppraisalUrl, setEditAppraisalUrl] = useState(agent.appraisalUrl?.trim() ?? '');
  const [editPlatinum, setEditPlatinum] = useState(!!agent.platinumPartner);
  // listingAgentDisplayName / listingAgentPhotoUrl overrides removed from simplified UI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_editListingAgentName] = useState(agent.listingAgentDisplayName?.trim() ?? '');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_editListingAgentPhoto] = useState(agent.listingAgentPhotoUrl?.trim() ?? '');
  const [editCoListingName, setEditCoListingName] = useState(agent.coListingAgentName?.trim() ?? '');
  const [editCoListingPhoto, setEditCoListingPhoto] = useState(agent.coListingAgentPhotoUrl?.trim() ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // ── Listings ──
  const [listings, setListings] = useState<AgentListingRow[]>([]);
  const [listPage, setListPage] = useState(1);
  const [listPagination, setListPagination] = useState({ total: 0, page: 1, pageSize: 15, totalPages: 1 });
  const [listLoading, setListLoading] = useState(false);

  const loadListings = useCallback(async (p: number) => {
    setListLoading(true);
    try {
      const res = await agentsApi.getAgentListings(agent.id, p, 15);
      setListings(res.listings ?? []);
      setListPagination(res.pagination);
      setListPage(p);
    } catch { /* ignored */ }
    finally { setListLoading(false); }
  }, [agent.id]);

  useEffect(() => {
    if (tab === 'listings') loadListings(1);
  }, [tab, loadListings]);

  useEffect(() => {
    setEditMobile(agent.mobileNumber);
    setEditFirstName(agent.firstName?.trim() ?? '');
    setEditLastName(agent.lastName?.trim() ?? '');
    setEditEmail(agent.email?.trim() ?? '');
    setEditAgency(agent.agencyName?.trim() ?? '');
    setEditLicense(agent.licenseNumber?.trim() ?? '');
    setEditPhoto(agent.profilePhotoUrl?.trim() ?? '');
    setEditOfficeBranch(agent.officeBranchName?.trim() ?? '');
    setEditOfficePhone(agent.officePhone?.trim() ?? '');
    setEditOfficeWebsite(agent.officeWebsite?.trim() ?? '');
    setEditAppraisalUrl(agent.appraisalUrl?.trim() ?? '');
    setEditPlatinum(!!agent.platinumPartner);
    // listingAgentDisplayName / listingAgentPhotoUrl: not re-synced (removed from UI)
    setEditCoListingName(agent.coListingAgentName?.trim() ?? '');
    setEditCoListingPhoto(agent.coListingAgentPhotoUrl?.trim() ?? '');
    setCurrentPin(agent.pin ?? null);
  }, [agent]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await agentsApi.updateAgent(agent.id, {
        mobileNumber: editMobile.trim(),
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim() || null,
        agencyName: editAgency.trim() || null,
        licenseNumber: editLicense.trim() || null,
        profilePhotoUrl: editPhoto.trim() || null,
        officeBranchName: editOfficeBranch.trim() || null,
        officePhone: editOfficePhone.trim() || null,
        officeWebsite: editOfficeWebsite.trim() || null,
        appraisalUrl: editAppraisalUrl.trim() || null,
        platinumPartner: editPlatinum,
        // Listing overrides removed from UI — profile photo/name auto-applies
        listingAgentDisplayName: null,
        listingAgentPhotoUrl: null,
        coListingAgentName: editCoListingName.trim() || null,
        coListingAgentPhotoUrl: editCoListingPhoto.trim() || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
      onSaved(res.user);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const isActive = agent.isActive !== false;
  const agentDisplayName = [agent.firstName, agent.lastName].filter(Boolean).join(' ') || agent.mobileNumber;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        aria-label="Close panel"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg sm:max-w-xl h-full bg-white shadow-2xl flex flex-col animate-slideInRight">

        {/* ── Panel header ── */}
        <div className="shrink-0 bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <AgentAvatar photoUrl={agent.profilePhotoUrl} firstName={agent.firstName} lastName={agent.lastName} size="lg" />
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate leading-tight">{agentDisplayName}</h2>
                <p className="text-sm text-slate-400 font-mono mt-0.5">{agent.mobileNumber}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    isActive
                      ? 'border-green-500/40 bg-green-500/20 text-green-300'
                      : 'border-gray-500/40 bg-gray-500/20 text-gray-400'
                  }`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                  {agent.agencyName && (
                    <span className="text-xs text-slate-400 truncate max-w-[160px]">{agent.agencyName}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0 mt-0.5"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick actions */}
          <div className="mt-4 flex gap-2">
            {isActive ? (
              <button
                type="button"
                onClick={async () => { await onDeactivate(agent.id); onClose(); }}
                disabled={actionId === agent.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Deactivate
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => { await onActivate(agent.id); onClose(); }}
                disabled={actionId === agent.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500/40 bg-green-500/10 text-green-300 text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Activate
              </button>
            )}
            <Link
              to={`/admin/listings/new?owner=agent&agentId=${agent.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-500/40 bg-slate-500/10 text-slate-300 text-xs font-medium hover:bg-slate-500/20 transition-colors"
              onClick={onClose}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New listing
            </Link>

          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="shrink-0 flex border-b border-gray-200 bg-white px-4">
          {(['profile', 'listings'] as PanelTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {t === 'profile' ? 'Profile & edit' : `Listings${listPagination.total > 0 ? ` (${listPagination.total})` : ''}`}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Profile tab */}
          {tab === 'profile' && (
            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">

              {/* ── Profile photo ── */}
              <div className="flex justify-center pt-1">
                <PhotoPickerInput
                  value={editPhoto}
                  onChange={setEditPhoto}
                  firstName={editFirstName}
                  lastName={editLastName}
                  size={96}
                />
              </div>

              {/* ── Basic info ── */}
              <div className="grid grid-cols-2 gap-3">
                <Input label="First name" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required />
                <Input label="Last name" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} required />
              </div>
              <div>
                <Input label="Mobile (NZ)" type="tel" value={editMobile} onChange={(e) => setEditMobile(e.target.value)} required />
                <p className="mt-1 text-xs text-gray-400">Used to sign in.</p>
              </div>
              <Input label="Email (optional)" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />

              {/* ── Agency ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Input
                    label="Agency"
                    value={editAgency}
                    onChange={(e) => setEditAgency(e.target.value)}
                    placeholder="Barfoot & Thompson Mission Bay"
                  />
                </div>
                <Input
                  label="License"
                  value={editLicense}
                  onChange={(e) => setEditLicense(e.target.value)}
                  placeholder="REAA 2008"
                />
                <div className="flex items-end pb-0.5">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editPlatinum}
                      onChange={(e) => setEditPlatinum(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Platinum partner</span>
                  </label>
                </div>
              </div>

              {/* ── Co-listing agent ── */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Co-listing agent <span className="text-gray-400 font-normal">(optional)</span></p>
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    <PhotoPickerInput
                      value={editCoListingPhoto}
                      onChange={setEditCoListingPhoto}
                      firstName={editCoListingName.split(' ')[0] || undefined}
                      lastName={editCoListingName.split(' ').slice(1).join(' ') || undefined}
                      size={80}
                      folder="profiles"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Input
                      label="Name"
                      value={editCoListingName}
                      onChange={(e) => setEditCoListingName(e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                </div>
              </div>

              {/* ── Login PIN ── */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-amber-800">Login PIN</p>
                  <button
                    type="button"
                    onClick={handleResetPin}
                    disabled={pinLoading}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-300 bg-white text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {pinLoading ? 'Generating…' : 'Regenerate'}
                  </button>
                </div>
                {currentPin ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold font-mono tracking-widest text-amber-900">{currentPin}</span>
                    <button
                      type="button"
                      onClick={handleCopyPin}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-amber-300 text-amber-700 bg-white hover:bg-amber-100 transition-colors"
                    >
                      {pinCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-amber-700 italic">No PIN set — click Regenerate.</p>
                )}
                <p className="mt-1.5 text-xs text-amber-600">Share this PIN directly with the agent for sign-in.</p>
                {pinError && <p className="mt-1.5 text-xs text-red-600">{pinError}</p>}
              </div>

              {/* ── Feedback ── */}
              {saveError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {saveError}
                </div>
              )}
              {saved && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <svg className="w-4 h-4 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved successfully.
                </div>
              )}

              <div className="flex gap-3 pb-4">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Listings tab */}
          {tab === 'listings' && (
            <div className="p-4 sm:p-5">
              {listLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading listings…
                </div>
              ) : listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium">No listings yet</p>
                  <p className="text-sm text-gray-400 mt-1">Create a listing on behalf of this agent.</p>
                  <Link
                    to={`/admin/listings/new?owner=agent&agentId=${agent.id}`}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                    onClick={onClose}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create listing
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {listings.map((row) => (
                    <li key={row.id}>
                      <Card className="p-4 border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 line-clamp-2 text-sm leading-snug">{row.headline}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {row.location.suburb}, {row.location.district} · {formatListingPrice(row)}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant={statusBadgeVariant(row.status)} className="text-[10px]">
                                {row.status.replace(/_/g, ' ')}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {row.updatedDate ? new Date(row.updatedDate).toLocaleDateString() : '—'}
                              </span>
                            </div>
                          </div>
                          <Link to={`/admin/listings/${row.id}/edit`} className="shrink-0" onClick={onClose}>
                            <Button variant="outline" size="sm">Edit</Button>
                          </Link>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
              {listPagination.totalPages > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Pagination
                    currentPage={listPage}
                    totalPages={listPagination.totalPages}
                    onPageChange={(p) => loadListings(p)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Create Agent modal ───────────────────────────────────────────────────────
function CreateAgentModal(props: {
  createMobile: string; setCreateMobile: (v: string) => void;
  createFirstName: string; setCreateFirstName: (v: string) => void;
  createLastName: string; setCreateLastName: (v: string) => void;
  createEmail: string; setCreateEmail: (v: string) => void;
  createAgency: string; setCreateAgency: (v: string) => void;
  createLicense: string; setCreateLicense: (v: string) => void;
  createProfilePhotoUrl: string; setCreateProfilePhotoUrl: (v: string) => void;
  creating: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const {
    createMobile, setCreateMobile, createFirstName, setCreateFirstName,
    createLastName, setCreateLastName, createEmail, setCreateEmail,
    createAgency, setCreateAgency, createLicense, setCreateLicense,
    createProfilePhotoUrl, setCreateProfilePhotoUrl, creating, error, onSubmit, onCancel,
  } = props;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !creating) onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel, creating]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={() => { if (!creating) onCancel(); }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add new agent</h2>
            <p className="text-sm text-gray-500 mt-0.5">A login PIN will be generated and shown once.</p>
          </div>
          <button
            type="button"
            onClick={() => { if (!creating) onCancel(); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="overflow-y-auto">
          <div className="px-6 py-6 space-y-5">
            <div className="flex justify-center">
              <PhotoPickerInput
                value={createProfilePhotoUrl}
                onChange={setCreateProfilePhotoUrl}
                firstName={createFirstName}
                lastName={createLastName}
                size={80}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Mobile number (NZ)"
                  type="tel"
                  value={createMobile}
                  onChange={(e) => setCreateMobile(e.target.value)}
                  placeholder="021 123 4567"
                  required
                />
              </div>
              <Input label="First name" value={createFirstName} onChange={(e) => setCreateFirstName(e.target.value)} required />
              <Input label="Last name" value={createLastName} onChange={(e) => setCreateLastName(e.target.value)} required />
              <Input label="Email (optional)" type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
              <Input label="Agency (optional)" value={createAgency} onChange={(e) => setCreateAgency(e.target.value)} />
              <div className="sm:col-span-2">
                <Input label="License # (optional)" value={createLicense} onChange={(e) => setCreateLicense(e.target.value)} placeholder="e.g. REAA 12345" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating…
                </>
              ) : 'Create agent'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

type StatusTab = 'all' | 'active' | 'inactive';

function parseSortPreset(v: string): { sort: 'name' | 'created' | 'updated' | 'listings'; order: 'asc' | 'desc' } {
  const [sort, order] = v.split(':') as [string, string];
  const s = (['name', 'created', 'updated', 'listings'].includes(sort) ? sort : 'updated') as
    | 'name'
    | 'created'
    | 'updated'
    | 'listings';
  const o = order === 'asc' ? 'asc' : 'desc';
  return { sort: s, order: o };
}

interface AdminAgentsPageProps {
  initialCreateOpen?: boolean;
}

export function AdminAgentsPage({ initialCreateOpen = false }: AdminAgentsPageProps = {}) {
  const isSuperAdmin = useApiAuthStore((s) => s.isSuperAdmin);
  const logout = useApiAuthStore((s) => s.logout);
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [agents, setAgents] = useState<AgentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [sortPreset, setSortPreset] = useState('updated:desc');
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize, totalPages: 1 });
  const [meta, setMeta] = useState({
    totalAgents: 0,
    activeAgents: 0,
    inactiveAgents: 0,
    totalListings: 0,
  });

  const [showCreate, setShowCreate] = useState(initialCreateOpen);
  const [createMobile, setCreateMobile] = useState('');
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createAgency, setCreateAgency] = useState('');
  const [createLicense, setCreateLicense] = useState('');
  const [createProfilePhotoUrl, setCreateProfilePhotoUrl] = useState('');
  const [creating, setCreating] = useState(false);

  // Unified agent detail panel (replaces inline edit + drawer)
  const [panelAgent, setPanelAgent] = useState<AgentUser | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>('profile');

  const [publicationQueue, setPublicationQueue] = useState<PendingApprovalListing[]>([]);
  const [publicationQueueLoading, setPublicationQueueLoading] = useState(false);
  const [publicationQueueError, setPublicationQueueError] = useState<string | null>(null);
  const [publishingListingId, setPublishingListingId] = useState<string | null>(null);

  const loadPublicationQueue = useCallback(async () => {
    setPublicationQueueLoading(true);
    setPublicationQueueError(null);
    try {
      const res = await listingsApi.getPendingApprovalListings();
      setPublicationQueue(res.listings ?? []);
    } catch (e: unknown) {
      setPublicationQueueError(getErrorMessage(e));
    } finally {
      setPublicationQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusTab, sortPreset]);

  const { sort, order } = parseSortPreset(sortPreset);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pendingRes, agentsRes] = await Promise.all([
        agentsApi.getPending(),
        agentsApi.getAgents({
          q: debouncedSearch || undefined,
          status: statusTab,
          sort,
          order,
          page,
          pageSize,
        }),
      ]);
      setPending(pendingRes.users ?? []);
      setAgents(agentsRes.users ?? []);
      setPagination(agentsRes.pagination);
      setMeta(agentsRes.meta);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusTab, sort, order, page, pageSize]);

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin, load]);

  useEffect(() => {
    if (isSuperAdmin) void loadPublicationQueue();
  }, [isSuperAdmin, loadPublicationQueue]);

  const openPanel = (u: AgentUser, tab: PanelTab = 'profile') => {
    setPanelAgent(u);
    setPanelTab(tab);
  };

  const closePanel = () => setPanelAgent(null);

  const handleApprove = async (id: string) => {
    setActionId(id);
    setError(null);
    try {
      await agentsApi.approveAgent(id);
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setActionId(null);
    }
  };

  const handleApproveListingPublish = async (listingId: string) => {
    setPublishingListingId(listingId);
    setPublicationQueueError(null);
    try {
      await listingsApi.approveListingPublish(listingId);
      await Promise.all([loadPublicationQueue(), load()]);
    } catch (e: unknown) {
      setPublicationQueueError(getErrorMessage(e));
    } finally {
      setPublishingListingId(null);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await agentsApi.createAgent({
        mobileNumber: createMobile.trim(),
        firstName: createFirstName.trim(),
        lastName: createLastName.trim(),
        email: createEmail.trim() || undefined,
        agencyName: createAgency.trim() || undefined,
        licenseNumber: createLicense.trim() || undefined,
        profilePhotoUrl: createProfilePhotoUrl.trim() || undefined,
      });
      setShowCreate(false);
      setCreateMobile('');
      setCreateFirstName('');
      setCreateLastName('');
      setCreateEmail('');
      setCreateAgency('');
      setCreateLicense('');
      setCreateProfilePhotoUrl('');
      await load();
      // Open the newly created agent's panel so admin can see and copy the PIN
      if (res.user) openPanel(res.user as AgentUser, 'profile');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };


  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Super admin access required.</p>
          <Link to="/admin/listings">
            <Button variant="outline" size="md">
              Go to Listings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabBtn = (tab: StatusTab, label: string, count?: number) => (
    <button
      type="button"
      onClick={() => setStatusTab(tab)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        statusTab === tab
          ? 'bg-primary-600 text-white shadow-md'
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
      {count != null && <span className="ml-1.5 tabular-nums opacity-90">({count})</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Agent directory</h1>
              <p className="mt-1 text-gray-600 text-sm max-w-2xl">
                Search, sort, and review agents at scale. Open an agent to see every listing they created, with counts by
                status. Add agents with the button on the right.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  void load();
                  void loadPublicationQueue();
                }}
                disabled={loading || publicationQueueLoading}
              >
                {loading || publicationQueueLoading ? 'Refreshing…' : 'Refresh'}
              </Button>
              <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
                Add agent
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 border-l-4 border-l-slate-600">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Agents</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{meta.totalAgents}</p>
            </Card>
            <Card className="p-4 border-l-4 border-l-emerald-500">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{meta.activeAgents}</p>
            </Card>
            <Card className="p-4 border-l-4 border-l-gray-400">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inactive</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{meta.inactiveAgents}</p>
            </Card>
            <Card className="p-4 border-l-4 border-l-primary-600">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">All listings</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{meta.totalListings}</p>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <section className="mb-10">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Awaiting publication</h2>
              <p className="text-sm text-gray-500">
                Listings submitted by agents for review. Approve here or open an agent below to see their full activity.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => void loadPublicationQueue()}
              disabled={publicationQueueLoading}
            >
              {publicationQueueLoading ? 'Refreshing…' : 'Refresh queue'}
            </Button>
          </div>
          {publicationQueueError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {publicationQueueError}
            </div>
          )}
          {publicationQueueLoading && publicationQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-500">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              Loading approval queue…
            </div>
          ) : publicationQueue.length === 0 ? (
            <Card className="border-dashed border-gray-200 bg-gray-50/50 p-10 text-center text-sm text-gray-600">
              No listings in the approval queue. You’re all caught up.
            </Card>
          ) : (
            <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {publicationQueue.map((listing) => {
                const img =
                  listing.images?.[0] || listing.media?.[0]?.url || 'https://via.placeholder.com/800x600';
                const badge = publicationQueueListingBadge(listing);
                return (
                  <li key={listing.id}>
                    <Card className="group flex flex-col overflow-hidden border-gray-200 shadow-sm transition hover:shadow-md sm:flex-row">
                      <div className="relative h-44 w-full shrink-0 bg-gray-200 sm:h-auto sm:w-48">
                        <img src={img} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
                        <div className="absolute left-3 top-3">
                          <Badge variant={badge.variant} className="shadow-md backdrop-blur-sm">
                            {badge.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col p-5">
                        <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900">{listing.headline}</h3>
                        <p className="mb-3 text-xs text-gray-500">
                          {listing.agentDisplayName && (
                            <span>
                              {listing.agentDisplayName}
                              {listing.agentMobile ? ` · ${listing.agentMobile}` : ''}
                            </span>
                          )}
                        </p>
                        <p className="mb-4 text-xl font-bold text-gray-900">
                          {listing.listingType === 'SALE' ? formatSalePrice(listing) : formatRent(listing)}
                        </p>
                        <div className="mt-auto flex flex-wrap gap-2">
                          <Link to={`/admin/listings/${listing.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                          </Link>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => void handleApproveListingPublish(listing.id)}
                            disabled={publishingListingId === listing.id}
                          >
                            {publishingListingId === listing.id ? 'Publishing…' : 'Approve & publish'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>{error}</span>
            <div className="flex items-center gap-2 shrink-0">
              {(error.includes('Authentication') || error.includes('401') || error.includes('Invalid or expired')) && (
                <Link to="/admin/login" onClick={() => logout()}>
                  <Button variant="outline" size="sm">
                    Re-login
                  </Button>
                </Link>
              )}
              <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-medium">
                Dismiss
              </button>
            </div>
          </div>
        )}


        {showCreate && (
          <CreateAgentModal
            createMobile={createMobile}
            setCreateMobile={setCreateMobile}
            createFirstName={createFirstName}
            setCreateFirstName={setCreateFirstName}
            createLastName={createLastName}
            setCreateLastName={setCreateLastName}
            createEmail={createEmail}
            setCreateEmail={setCreateEmail}
            createAgency={createAgency}
            setCreateAgency={setCreateAgency}
            createLicense={createLicense}
            setCreateLicense={setCreateLicense}
            createProfilePhotoUrl={createProfilePhotoUrl}
            setCreateProfilePhotoUrl={setCreateProfilePhotoUrl}
            creating={creating}
            error={error}
            onSubmit={handleCreateAgent}
            onCancel={() => { setShowCreate(false); setError(null); }}
          />
        )}

        {pending.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Legacy pending accounts</h2>
            <p className="text-sm text-gray-500 mb-3">Promote old PENDING users to agent if needed.</p>
            <ul className="space-y-2">
              {pending.map((u) => (
                <li key={u.id}>
                  <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{displayName(u)}</p>
                      <p className="text-xs text-gray-500 font-mono">{u.mobileNumber}</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => handleApprove(u.id)} disabled={actionId === u.id}>
                      {actionId === u.id ? '…' : 'Onboard as agent'}
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Card className="overflow-hidden shadow-sm border border-gray-200">
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-white space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-end gap-4">
              <div className="flex-1 min-w-0">
                <Input
                  label="Search agents"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Name, mobile, email, or agency…"
                />
              </div>
              <div className="w-full sm:w-64 xl:w-72">
                <Select
                  label="Sort by"
                  value={sortPreset}
                  onChange={(e) => setSortPreset(e.target.value)}
                  options={[
                    { value: 'updated:desc', label: 'Recently updated' },
                    { value: 'updated:asc', label: 'Oldest update first' },
                    { value: 'name:asc', label: 'Name A–Z' },
                    { value: 'name:desc', label: 'Name Z–A' },
                    { value: 'listings:desc', label: 'Most listings' },
                    { value: 'listings:asc', label: 'Fewest listings' },
                    { value: 'created:desc', label: 'Newest agents' },
                    { value: 'created:asc', label: 'Oldest agents first' },
                  ]}
                />
              </div>
              <div className="xl:pb-0.5">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowCreate(true)}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add agent
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabBtn('all', 'All agents', meta.totalAgents)}
              {tabBtn('active', 'Active', meta.activeAgents)}
              {tabBtn('inactive', 'Inactive', meta.inactiveAgents)}
            </div>
            {!loading && (
              <p className="text-sm text-gray-500">
                Showing{' '}
                <span className="font-medium text-gray-800">
                  {pagination.total === 0 ? 0 : (page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, pagination.total)}
                </span>{' '}
                of <span className="font-medium text-gray-800">{pagination.total}</span> matching agents
              </p>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse">Loading agents…</div>
          ) : agents.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <p className="font-medium">No agents match your filters.</p>
              <p className="text-sm text-gray-500 mt-1">Try clearing search or switching the status tab.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">Agent</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap hidden md:table-cell">Mobile</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap hidden lg:table-cell">Agency</th>
                      <th className="px-4 py-3 font-semibold min-w-[140px]">Listings</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap hidden sm:table-cell">Updated</th>
                      <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {agents.map((u) => {
                      const stats = statsOrFallback(u);
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-primary-50/30 cursor-pointer transition-colors"
                          onClick={() => openPanel(u, 'profile')}
                        >
                          <td className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-2.5">
                              <AgentAvatar photoUrl={u.profilePhotoUrl} firstName={u.firstName} lastName={u.lastName} />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate max-w-[160px]">{displayName(u)}</p>
                                {u.email && <p className="text-xs text-gray-500 truncate max-w-[160px]">{u.email}</p>}
                                <p className="text-xs text-gray-500 font-mono md:hidden mt-0.5">{u.mobileNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-middle hidden md:table-cell">
                            <span className="font-mono text-gray-800 text-sm">{u.mobileNumber}</span>
                          </td>
                          <td className="px-4 py-3 align-middle hidden lg:table-cell text-gray-600 max-w-[180px] truncate text-sm">
                            {u.agencyName || '—'}
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <ListingStatsCell stats={stats} />
                          </td>
                          <td className="px-4 py-3 align-middle">
                            {u.isActive !== false ? (
                              <Badge variant="success">Active</Badge>
                            ) : (
                              <Badge variant="default">Inactive</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 align-middle hidden sm:table-cell text-gray-500 whitespace-nowrap text-sm">
                            {new Date(u.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </td>
                          <td className="px-4 py-3 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => openPanel(u, 'listings')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-colors shadow-sm"
                                title="View listings"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="hidden sm:inline">Listings</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openPanel(u, 'profile')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors shadow-sm"
                                title="Edit agent"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50">
                <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Unified Agent Detail Panel */}
      {panelAgent && (
        <AgentDetailPanel
          key={panelAgent.id}
          agent={panelAgent}
          initialTab={panelTab}
          onClose={closePanel}
          onSaved={(updated) => {
            setAgents((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
            setPanelAgent((prev) => (prev ? { ...prev, ...updated } : prev));
          }}
          onActivate={async (id) => {
            setActionId(id);
            try { await agentsApi.activateAgent(id); await load(); }
            catch (e) { setError(getErrorMessage(e)); }
            finally { setActionId(null); }
          }}
          onDeactivate={async (id) => {
            setActionId(id);
            try { await agentsApi.deactivateAgent(id); await load(); }
            catch (e) { setError(getErrorMessage(e)); }
            finally { setActionId(null); }
          }}
          actionId={actionId}
        />
      )}
    </div>
  );
}
