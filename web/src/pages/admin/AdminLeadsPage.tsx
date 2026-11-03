import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  campaignApi,
  CampaignLead,
  LeadStatus,
  enquiryApi,
  ListingEnquiry,
  type EnquirySourceFilter,
} from '../../services/api';
import { leadSourceLabel } from '../../utils/leadLinks';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_META   = { icon: '📘', label: 'Meta',   color: 'bg-blue-100 text-blue-700' };
const PLATFORM_GOOGLE = { icon: '🔍', label: 'Google', color: 'bg-red-100 text-red-700' };
const PLATFORM_TIKTOK = { icon: '🎵', label: 'TikTok', color: 'bg-gray-100 text-gray-700' };
const PLATFORM_MANUAL = { icon: '✍️', label: 'Manual', color: 'bg-purple-100 text-purple-700' };
const PLATFORM_SITE   = { icon: '✉', label: 'Listing form', color: 'bg-teal-100 text-teal-800' };

const SOURCE_COLORS: Record<string, string> = {
  facebook:  'bg-blue-100 text-blue-800',
  instagram: 'bg-pink-100 text-pink-800',
  tiktok:    'bg-slate-900 text-white',
  whatsapp:  'bg-green-100 text-green-800',
  google:    'bg-amber-100 text-amber-900',
  email:     'bg-violet-100 text-violet-800',
  other:     'bg-gray-100 text-gray-700',
};

const SOURCE_FILTERS: { value: EnquirySourceFilter | ''; label: string }[] = [
  { value: '',          label: 'All sources' },
  { value: 'facebook',  label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok',    label: 'TikTok' },
  { value: 'whatsapp',  label: 'WhatsApp' },
  { value: 'google',    label: 'Google' },
  { value: 'other',     label: 'Other' },
  { value: 'direct',    label: 'Direct / website' },
];

function SourceBadge({ enquiry }: { enquiry: ListingEnquiry }) {
  if (!enquiry.source) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
        Direct
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        SOURCE_COLORS[enquiry.source] ?? SOURCE_COLORS.other
      }`}
      title={enquiry.campaign?.title ? `Campaign: ${enquiry.campaign.title}` : enquiry.utmCampaign ?? undefined}
    >
      {leadSourceLabel(enquiry.source)}
      {enquiry.campaign ? ' · campaign' : ''}
    </span>
  );
}

const PLATFORMS: Record<string, typeof PLATFORM_META> = {
  META: PLATFORM_META, GOOGLE: PLATFORM_GOOGLE,
  TIKTOK: PLATFORM_TIKTOK, MANUAL: PLATFORM_MANUAL,
};

const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  NEW:       'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  QUALIFIED: 'bg-purple-100 text-purple-700',
  CONVERTED: 'bg-green-100 text-green-700',
  LOST:      'bg-gray-100 text-gray-500',
};

const ALL_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

type InboxTab = 'listing' | 'campaign';

// ─── Lead detail modal ────────────────────────────────────────────────────────

function LeadModal({
  lead,
  onClose,
  onStatusChange,
}: {
  lead: CampaignLead;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => Promise<void>;
}) {
  const [status, setStatus]   = useState<LeadStatus>(lead.status);
  const [saving, setSaving]   = useState(false);
  const pm = PLATFORMS[lead.platform] ?? PLATFORM_MANUAL;

  const handleStatus = async (s: LeadStatus) => {
    setStatus(s);
    setSaving(true);
    await onStatusChange(lead.id, s);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Lead Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                {(lead.fullName ?? '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{lead.fullName ?? 'Unknown'}</p>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${pm.color}`}>
                  {pm.icon} {pm.label}
                </span>
              </div>
            </div>
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                {lead.email}
              </a>
            )}
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                {lead.phone}
              </a>
            )}
            {lead.message && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-400 mb-1">Message</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.message}</p>
              </div>
            )}
          </div>

          {lead.campaign && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Campaign:</span>
              <Link
                to={`/admin/campaigns/${lead.campaign.id}`}
                onClick={onClose}
                className="text-primary-600 hover:underline font-medium"
              >
                {lead.campaign.title}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Received:</span>
            <span>{new Date(lead.createdAt).toLocaleString()}</span>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">CRM Status</p>
            <div className="flex gap-2 flex-wrap">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatus(s)}
                  disabled={saving}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    status === s
                      ? LEAD_STATUS_STYLES[s] + ' border-current'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnquiryModal({
  enquiry,
  onClose,
}: {
  enquiry: ListingEnquiry;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Listing Enquiry</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                {enquiry.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{enquiry.name}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${PLATFORM_SITE.color}`}>
                    {PLATFORM_SITE.icon} {PLATFORM_SITE.label}
                  </span>
                  <SourceBadge enquiry={enquiry} />
                </div>
              </div>
            </div>
            {(enquiry.campaign || enquiry.utmCampaign || enquiry.referrer) && (
              <div className="text-xs text-gray-500 space-y-0.5">
                {enquiry.campaign ? (
                  <p>
                    Campaign:{' '}
                    <Link
                      to={`/admin/campaigns/${enquiry.campaign.id}`}
                      className="font-medium text-primary-700 hover:underline"
                      onClick={onClose}
                    >
                      {enquiry.campaign.title || 'View campaign'}
                    </Link>
                  </p>
                ) : enquiry.utmCampaign ? (
                  <p>Campaign tag: {enquiry.utmCampaign}</p>
                ) : null}
                {enquiry.referrer && <p className="truncate">Referrer: {enquiry.referrer}</p>}
              </div>
            )}
            <a href={`mailto:${enquiry.email}`} className="block text-sm text-primary-600 hover:underline">{enquiry.email}</a>
            {enquiry.phone && (
              <a href={`tel:${enquiry.phone}`} className="block text-sm text-primary-600 hover:underline">{enquiry.phone}</a>
            )}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Message</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{enquiry.message}</p>
            </div>
          </div>

          {enquiry.listing && (
            <div className="rounded-xl border border-gray-200 p-4 text-sm space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Property</p>
              <Link
                to={`/admin/listings`}
                className="font-semibold text-primary-700 hover:underline"
                onClick={onClose}
              >
                {enquiry.listing.headline}
              </Link>
              {enquiry.listing.address && (
                <p className="text-gray-600">{enquiry.listing.address}</p>
              )}
              {enquiry.listing.agent && (
                <p className="text-xs text-gray-500 pt-1">
                  Agent: {enquiry.listing.agent.name || '—'}
                  {enquiry.listing.agent.email ? ` · ${enquiry.listing.agent.email}` : ' · no email on profile'}
                </p>
              )}
              <a
                href={`/listing/${enquiry.listing.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-xs font-medium text-teal-700 hover:underline pt-1"
              >
                Open public listing ↗
              </a>
            </div>
          )}

          <p className="text-xs text-gray-400">Received {new Date(enquiry.createdAt).toLocaleString()}</p>

          {/* Email delivery audit */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Email delivery audit
            </p>
            {!enquiry.emailAudit ? (
              <p className="text-xs text-slate-500">
                No delivery log for this enquiry (submitted before audit was enabled, or SMTP never ran).
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500">
                  From: {enquiry.emailAudit.from}
                  {enquiry.emailAudit.smtpConfigured ? '' : ' · SMTP was not configured'}
                </p>
                {enquiry.emailAudit.attempts.map((a) => {
                  const tone =
                    a.status === 'sent'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : a.status === 'failed'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-900 border-amber-200';
                  return (
                    <div key={`${a.role}-${a.at}`} className={`rounded-lg border px-3 py-2 text-xs ${tone}`}>
                      <div className="flex items-center justify-between gap-2 font-semibold capitalize">
                        <span>{a.role}</span>
                        <span className="uppercase tracking-wide">{a.status}</span>
                      </div>
                      <p className="mt-0.5 break-all opacity-90">
                        To: {a.to.length ? a.to.join(', ') : '—'}
                      </p>
                      {a.error && <p className="mt-1 opacity-90 whitespace-pre-wrap">{a.error}</p>}
                      {a.messageId && (
                        <p className="mt-1 font-mono text-[10px] opacity-70">id: {a.messageId}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <a
            href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.listing?.headline || 'your enquiry'}`)}`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Reply by email
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminLeadsPage() {
  const [tab, setTab] = useState<InboxTab>('listing');

  const [leads, setLeads]           = useState<CampaignLead[]>([]);
  const [leadTotal, setLeadTotal]   = useState(0);
  const [leadPage, setLeadPage]     = useState(1);
  const [leadLoading, setLeadLoading] = useState(false);
  const [selectedLead, setSelected] = useState<CampaignLead | null>(null);
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');

  const [enquiries, setEnquiries] = useState<ListingEnquiry[]>([]);
  const [enqTotal, setEnqTotal]   = useState(0);
  const [enqPage, setEnqPage]     = useState(1);
  const [enqLoading, setEnqLoading] = useState(true);
  const [enqQ, setEnqQ] = useState('');
  const [enqQDraft, setEnqQDraft] = useState('');
  const [enqSource, setEnqSource] = useState<EnquirySourceFilter | ''>('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<ListingEnquiry | null>(null);

  const pageSize = 25;

  const loadEnquiries = useCallback(async () => {
    setEnqLoading(true);
    try {
      const data = await enquiryApi.list({
        page: enqPage,
        pageSize,
        q: enqQ || undefined,
        source: enqSource || undefined,
      });
      setEnquiries(data.enquiries ?? []);
      setEnqTotal(data.total ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setEnqLoading(false);
    }
  }, [enqPage, enqQ, enqSource]);

  const loadLeads = useCallback(async () => {
    setLeadLoading(true);
    try {
      const p = new URLSearchParams({ page: String(leadPage), pageSize: String(pageSize) });
      if (filterStatus)   p.set('status',   filterStatus);
      if (filterPlatform) p.set('platform', filterPlatform);

      const token = localStorage.getItem('auth_token') ?? '';
      const rawBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
      const res = await fetch(`${rawBase}/admin/campaigns/leads/all?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as { leads: CampaignLead[]; total: number };
      setLeads(data.leads ?? []);
      setLeadTotal(data.total ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLeadLoading(false);
    }
  }, [leadPage, filterStatus, filterPlatform]);

  useEffect(() => {
    if (tab === 'listing') void loadEnquiries();
  }, [tab, loadEnquiries]);

  useEffect(() => {
    if (tab === 'campaign') void loadLeads();
  }, [tab, loadLeads]);

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await campaignApi.updateLead(id, { status });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    if (selectedLead?.id === id) setSelected((l) => l ? { ...l, status } : null);
  };

  const leadPages = Math.ceil(leadTotal / pageSize);
  const enqPages = Math.ceil(enqTotal / pageSize);
  const byStatus = (s: LeadStatus) => leads.filter((l) => l.status === s).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/90 via-slate-50/40 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">CRM</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Leads Inbox</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Listing form enquiries and ad-campaign leads in one place.
            </p>
          </div>
          <div className="shrink-0 text-right bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-sm">
            <p className="text-3xl font-bold text-slate-900 leading-none">
              {tab === 'listing' ? enqTotal : leadTotal}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {tab === 'listing' ? 'Listing enquiries' : 'Campaign leads'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('listing')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'listing'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Listing enquiries
            <span className="ml-2 text-xs font-bold text-slate-400">{enqTotal}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('campaign')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === 'campaign'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Campaign leads
            <span className="ml-2 text-xs font-bold text-slate-400">{leadTotal}</span>
          </button>
        </div>

        {tab === 'listing' ? (
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
              <form
                className="flex flex-1 gap-2 min-w-[16rem]"
                onSubmit={(e) => {
                  e.preventDefault();
                  setEnqPage(1);
                  setEnqQ(enqQDraft.trim());
                }}
              >
                <input
                  value={enqQDraft}
                  onChange={(e) => setEnqQDraft(e.target.value)}
                  placeholder="Search name, email, phone, message…"
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                >
                  Search
                </button>
              </form>
              <select
                value={enqSource}
                onChange={(e) => {
                  setEnqPage(1);
                  setEnqSource(e.target.value as EnquirySourceFilter | '');
                }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Filter by source"
              >
                {SOURCE_FILTERS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <span className="text-sm text-gray-400">{enqTotal} total</span>
            </div>

            {enqLoading ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : enquiries.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-14 text-center">
                <div className="text-4xl mb-3">✉</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No listing enquiries yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  When a buyer submits the Email enquiry form on a property page, it appears here and emails the agent (and admin inbox).
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Property</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Agent</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enquiries.map((e) => (
                      <tr
                        key={e.id}
                        onClick={() => setSelectedEnquiry(e)}
                        className="hover:bg-teal-50/60 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {e.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{e.name}</p>
                              <p className="text-xs text-gray-400">{e.email}</p>
                              <div className="mt-1"><SourceBadge enquiry={e} /></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <p className="text-gray-800 truncate max-w-[200px]">{e.listing?.headline ?? '—'}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{e.listing?.address}</p>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell text-xs text-gray-500">
                          {e.listing?.agent?.name || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">
                        <div>{new Date(e.createdAt).toLocaleString()}</div>
                        {e.emailAudit?.attempts && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {e.emailAudit.attempts.map((a) => (
                              <span
                                key={a.role}
                                className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                                  a.status === 'sent'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : a.status === 'failed'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-amber-100 text-amber-900'
                                }`}
                                title={a.error || a.to.join(', ')}
                              >
                                {a.role[0]}:{a.status === 'sent' ? 'ok' : a.status === 'failed' ? 'fail' : 'skip'}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {enqPages > 1 && (
                  <div className="flex justify-center gap-2 p-4 border-t border-gray-200">
                    <button
                      type="button"
                      disabled={enqPage <= 1}
                      onClick={() => setEnqPage((p) => p - 1)}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                    >
                      ← Prev
                    </button>
                    <span className="px-3 py-1.5 text-xs text-gray-600">
                      Page {enqPage} of {enqPages}
                    </span>
                    <button
                      type="button"
                      disabled={enqPage >= enqPages}
                      onClick={() => setEnqPage((p) => p + 1)}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              <StatCard label="New"       value={leads.filter(l => l.status === 'NEW').length} color="text-blue-600" />
              <StatCard label="Contacted" value={byStatus('CONTACTED')} color="text-yellow-600" />
              <StatCard label="Qualified" value={byStatus('QUALIFIED')} color="text-purple-600" />
              <StatCard label="Converted" value={byStatus('CONVERTED')} color="text-green-600" />
              <StatCard label="Lost"      value={byStatus('LOST')}      color="text-gray-400" />
            </div>

            <div className="flex gap-3 mb-5 flex-wrap">
              {(['META', 'GOOGLE', 'TIKTOK', 'MANUAL'] as const).map((p) => {
                const pm    = PLATFORMS[p];
                const count = leads.filter((l) => l.platform === p).length;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setFilterPlatform(filterPlatform === p ? '' : p); setLeadPage(1); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      filterPlatform === p
                        ? pm.color + ' border-current'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {pm.icon} {pm.label} <span className="font-bold">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setLeadPage(1); }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={filterPlatform}
                onChange={(e) => { setFilterPlatform(e.target.value); setLeadPage(1); }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Platforms</option>
                <option value="META">Meta</option>
                <option value="GOOGLE">Google</option>
                <option value="TIKTOK">TikTok</option>
                <option value="MANUAL">Manual</option>
              </select>
              <span className="text-sm text-gray-400 ml-auto">{leadTotal} total</span>
            </div>

            {leadLoading ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-14 text-center">
                <div className="text-4xl mb-3">📬</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No campaign leads yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Ad-form leads from Meta, Google &amp; TikTok appear here. Listing Email enquiries are under the other tab.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Campaign</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Received</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.map((lead) => {
                      const pm = PLATFORMS[lead.platform] ?? PLATFORM_MANUAL;
                      return (
                        <tr
                          key={lead.id}
                          onClick={() => setSelected(lead)}
                          className="hover:bg-primary-50 cursor-pointer transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {(lead.fullName ?? '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{lead.fullName ?? 'Unknown'}</p>
                                <p className="text-xs text-gray-400">{lead.email ?? lead.phone ?? '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            {lead.campaign ? (
                              <span className="text-gray-700 text-sm truncate max-w-[160px] block">
                                {lead.campaign.title}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${pm.color}`}>
                              {pm.icon} {pm.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell text-xs text-gray-400">
                            {new Date(lead.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <select
                              value={lead.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={async (e) => {
                                e.stopPropagation();
                                await handleStatusChange(lead.id, e.target.value as LeadStatus);
                              }}
                              className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${LEAD_STATUS_STYLES[lead.status]}`}
                            >
                              {ALL_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {leadPages > 1 && (
                  <div className="flex justify-center gap-2 p-4 border-t border-gray-200">
                    <button
                      type="button"
                      disabled={leadPage <= 1}
                      onClick={() => setLeadPage((p) => p - 1)}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                    >
                      ← Prev
                    </button>
                    <span className="px-3 py-1.5 text-xs text-gray-600">
                      Page {leadPage} of {leadPages}
                    </span>
                    <button
                      type="button"
                      disabled={leadPage >= leadPages}
                      onClick={() => setLeadPage((p) => p + 1)}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
      {selectedEnquiry && (
        <EnquiryModal
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
        />
      )}
    </div>
  );
}
