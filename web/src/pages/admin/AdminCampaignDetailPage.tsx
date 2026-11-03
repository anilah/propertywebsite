import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  campaignApi,
  Campaign,
  CampaignLead,
  LeadStatus,
} from '../../services/api';
import { CampaignWizard } from '../../components/campaigns/CampaignWizard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { AppToast, type AppToastState } from '../../components/ui/AppToast';
import { CampaignMediaThumb } from '../../components/ui/CampaignMediaThumb';
import { CampaignPublishStatusCard } from '../../components/campaigns/CampaignPublishStatusCard';
import { InstagramPublishOverlay } from '../../components/campaigns/InstagramPublishProgress';
import {
  businessBadgeClasses,
  campaignBusinessStatus,
  campaignChannelStatuses,
  campaignContentLabel,
  campaignFormatLabel,
  campaignPlatformViewUrl,
  campaignPublishMode,
} from '../../utils/campaignPublish';
import {
  runInstagramPublish,
  type IgPublishJob,
} from '../../utils/instagramPublishProgress';

const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  NEW:        'bg-blue-100 text-blue-700',
  CONTACTED:  'bg-yellow-100 text-yellow-700',
  QUALIFIED:  'bg-purple-100 text-purple-700',
  CONVERTED:  'bg-green-100 text-green-700',
  LOST:       'bg-gray-100 text-gray-500',
};

const PLATFORM_ICONS: Record<string, string> = {
  META:   '📘',
  GOOGLE: '🔍',
  TIKTOK: '🎵',
  MANUAL: '✍️',
};

export function AdminCampaignDetailPage() {
  const { id }            = useParams<{ id: string }>();
  const navigate          = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads]       = useState<CampaignLead[]>([]);
  const [leadTotal, setLeadTotal] = useState(0);
  const [leadPage, setLeadPage]   = useState(1);
  const [leadFilter, setLeadFilter] = useState('');
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<'overview' | 'assets' | 'leads' | 'settings'>('overview');
  const [editOpen, setEditOpen]     = useState(false);
  const [syncing, setSyncing]       = useState(false);
  const [updatingLead, setUpdatingLead] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [feedback, setFeedback] = useState<null | {
    title: string;
    message: string;
    error?: boolean;
    viewUrl?: string | null;
  }>(null);
  const [toast, setToast] = useState<AppToastState>(null);
  const [igJob, setIgJob] = useState<IgPublishJob | null>(null);

  const notify = (f: { title: string; message: string; error?: boolean; viewUrl?: string | null }) => {
    setToast({
      title: f.title,
      message: f.message,
      tone: f.error ? 'error' : 'success',
    });
    // Keep dialog for long errors only
    if (f.error) setFeedback(f);
    else setFeedback(null);
  };

  const loadCampaign = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const c = await campaignApi.get(id);
      setCampaign(c);
    } catch { navigate('/admin/campaigns'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  const loadLeads = useCallback(async () => {
    if (!id) return;
    const res = await campaignApi.getLeads(id, {
      page:   leadPage,
      status: leadFilter || undefined,
    });
    setLeads(res.leads);
    setLeadTotal(res.total);
  }, [id, leadPage, leadFilter]);

  useEffect(() => { loadCampaign(); }, [loadCampaign]);
  useEffect(() => { loadLeads(); },   [loadLeads]);

  const handlePublish = () => setConfirmPublish(true);

  const runPublish = async () => {
    if (!campaign) return;
    setConfirmBusy(true);
    try {
      const res = await campaignApi.publish(campaign.id);
      setConfirmPublish(false);
      let next = res.campaign;
      setCampaign(next);

      const igStatus = res.publish?.instagram?.status;
      if (igStatus === 'pending' || igStatus === 'failed') {
        // Continue Instagram with visible progress — do not silently flap labels
        const final = await runInstagramPublish(campaign.id, {
          forceFirst: igStatus === 'failed',
          onUpdate: (job) => {
            setIgJob(job);
            if (job.campaign) setCampaign(job.campaign);
          },
        });
        setIgJob(final);
        if (final.campaign) next = final.campaign;
        setCampaign(next);
        notify({
          title:
            final.phase === 'live'
              ? 'Live on Facebook & Instagram'
              : 'Live on Facebook',
          message:
            final.phase === 'live'
              ? final.detail
              : `${res.message}\n\n${final.detail}`,
          viewUrl: res.publish?.viewUrl ?? campaignPlatformViewUrl(next),
          error: final.phase === 'failed',
        });
        return;
      }

      const ig = (next.platformConfig as { instagram?: { status?: string } } | null)?.instagram;
      notify({
        title:
          ig?.status === 'published'
            ? 'Live on Facebook & Instagram'
            : res.publish?.mode === 'ORGANIC'
              ? 'Live on Facebook'
              : 'Campaign published',
        message: res.message,
        viewUrl: res.publish?.viewUrl ?? campaignPlatformViewUrl(next),
      });
    } catch (e: unknown) {
      setConfirmPublish(false);
      notify({
        title: 'Publish failed',
        message: e instanceof Error ? e.message : String(e),
        error: true,
      });
    } finally {
      setConfirmBusy(false);
    }
  };

  const runDelete = async () => {
    if (!campaign) return;
    setConfirmBusy(true);
    try {
      await campaignApi.delete(campaign.id);
      navigate('/admin/campaigns');
    } catch (e: unknown) {
      setConfirmDelete(false);
      setFeedback({
        title: 'Delete failed',
        message: e instanceof Error ? e.message : String(e),
        error: true,
      });
      setToast({
        title: 'Delete failed',
        message: e instanceof Error ? e.message : String(e),
        tone: 'error',
      });
      setConfirmBusy(false);
    }
  };

  const handleSyncLeads = async () => {
    if (!campaign) return;
    const mode = campaignPublishMode(campaign);
    if (mode === 'ORGANIC') {
      notify({
        title: 'Sync not needed for organic posts',
        message:
          'This campaign is a free Facebook Page post (Reel / photo), not a Meta Lead Ad.\n\nMeta has no lead form to sync. Enquiries appear under Leads when someone contacts you from the listing.',
        error: true,
      });
      return;
    }
    setSyncing(true);
    try {
      const res = await campaignApi.syncLeads(campaign.id);
      notify({
        title: res.synced > 0 ? 'Leads synced' : 'No new leads',
        message:
          res.synced > 0
            ? `Imported ${res.synced} new lead${res.synced !== 1 ? 's' : ''} from ${campaign.platform}.`
            : `No new leads from ${campaign.platform} right now. Check Ads Manager if forms are receiving submissions.`,
      });
      loadLeads();
    } catch (e: unknown) {
      notify({
        title: 'Sync failed',
        message: e instanceof Error ? e.message : String(e),
        error: true,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleLeadStatusChange = async (leadId: string, status: LeadStatus) => {
    setUpdatingLead(leadId);
    try {
      const updated = await campaignApi.updateLead(leadId, { status });
      setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: updated.status } : l));
    } finally {
      setUpdatingLead(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!campaign) return null;

  const targetAudience = campaign.targetAudience;
  const biz = campaignBusinessStatus(campaign);
  const mode = campaignPublishMode(campaign);
  const formatLabel = campaignFormatLabel(campaign);
  const contentLabel = campaignContentLabel(campaign);
  const channels = campaignChannelStatuses(campaign);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/admin/campaigns" className="hover:text-primary-600">Campaigns</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium truncate">{campaign.title}</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{campaign.title}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${businessBadgeClasses(biz.tone)}`}
                >
                  {biz.tone === 'success' && (
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  )}
                  {biz.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                  {contentLabel}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {PLATFORM_ICONS[campaign.platform]}{' '}
                  {mode === 'ORGANIC' ? 'Organic' : mode === 'PAID' ? 'Paid' : campaign.platform}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {mode === 'ORGANIC'
                  ? `${contentLabel} posted to Facebook Page · free`
                  : `${campaign.campaignType.replace(/_/g, ' ')}${formatLabel ? ` · ${formatLabel}` : ''}`}
              </p>
              {mode === 'ORGANIC' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                      channels.facebook.live
                        ? 'bg-blue-50 text-blue-800 border-blue-100'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}
                  >
                    Facebook · {channels.facebook.label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                      channels.instagram.live
                        ? 'bg-pink-50 text-pink-800 border-pink-100'
                        : channels.instagram.pending
                          ? 'bg-amber-50 text-amber-800 border-amber-100'
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}
                  >
                    Instagram · {channels.instagram.label}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(campaign.status === 'DRAFT' || campaign.status === 'PAUSED') && (
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Publish
                </button>
              )}
              <button
                onClick={() => setEditOpen(true)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 border-b border-gray-200 -mb-px">
            {(['overview', 'assets', 'leads', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'leads' ? `Leads (${leadTotal})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key metrics */}
            <div className="lg:col-span-2 space-y-4">
              {/* Stats — organic posts shouldn't pretend to be paid ads */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{leadTotal}</p>
                  <p className="text-xs text-gray-500 mt-1">Enquiries</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {leads.filter((l) => l.status === 'CONVERTED').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Converted</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  {mode === 'ORGANIC' ? (
                    <>
                      <p className="text-2xl font-bold text-primary-600">Free</p>
                      <p className="text-xs text-gray-500 mt-1">Organic post</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-primary-600">
                        {campaign.budgetAmount ? `$${campaign.budgetAmount}` : '—'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {campaign.budgetType === 'DAILY' ? 'Daily Budget' : 'Total Budget'}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Ad content */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {mode === 'ORGANIC' ? 'Post content' : 'Ad content'}
                </h3>
                <div className="space-y-3 text-sm">
                  {campaign.headline && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Headline</p>
                      <p className="text-gray-900 font-medium">{campaign.headline}</p>
                    </div>
                  )}
                  {campaign.primaryText && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Primary Text</p>
                      <p className="text-gray-700">{campaign.primaryText}</p>
                    </div>
                  )}
                  {campaign.description && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Description</p>
                      <p className="text-gray-600">{campaign.description}</p>
                    </div>
                  )}
                  {campaign.callToAction && (
                    <div>
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                        {campaign.callToAction.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Media previews */}
              {(campaign.assets?.length ?? 0) > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Media Assets</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {campaign.assets?.map((a) => (
                      <div key={a.id} className="relative group">
                        <CampaignMediaThumb
                          url={a.url}
                          assetType={a.assetType}
                          format={a.format}
                          thumbnailUrl={a.thumbnailUrl}
                          className="w-full h-24 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Listings */}
              {(campaign.listingIds?.length ?? 0) > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Promoted Listings ({campaign.listingIds.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {campaign.listingIds.map((lid) => (
                      <span key={lid} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-mono">{lid.slice(0, 8)}…</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <CampaignPublishStatusCard
                campaign={campaign}
                onCampaignUpdate={setCampaign}
                onFeedback={notify}
              />

              <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm space-y-3">
                <h3 className="font-semibold text-gray-700 mb-2">Campaign details</h3>
                <Row label="Platform" value={campaign.platform} />
                <Row
                  label="Type"
                  value={mode === 'ORGANIC' ? 'Organic Page post' : campaign.campaignType.replace(/_/g, ' ')}
                />
                <Row label="Format" value={formatLabel} />
                <Row label="Start" value={campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Not set'} />
                <Row label="End" value={campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Not set'} />
                <Row label="Created" value={new Date(campaign.createdAt).toLocaleDateString()} />
              </div>

              {targetAudience && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm space-y-3">
                  <h3 className="font-semibold text-gray-700 mb-2">Audience</h3>
                  <Row label="Age"       value={`${targetAudience.ageMin ?? 25}–${targetAudience.ageMax ?? 65}`} />
                  {targetAudience.genders?.length ? (
                    <Row label="Gender"  value={targetAudience.genders.join(', ')} />
                  ) : null}
                  {targetAudience.locations?.length ? (
                    <Row label="Location" value={targetAudience.locations.join(', ')} />
                  ) : null}
                  {targetAudience.interests?.length ? (
                    <Row label="Interests" value={targetAudience.interests.slice(0, 3).join(', ')} />
                  ) : null}
                </div>
              )}

              {/* External IDs — organic posts only have externalAdId */}
              {(campaign.externalCampaignId || campaign.externalAdSetId || campaign.externalAdId) && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 text-xs space-y-2">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">Platform IDs</h3>
                  {campaign.externalCampaignId && (
                    <div>
                      <span className="text-gray-400">Campaign: </span>
                      <code className="text-gray-700">{campaign.externalCampaignId}</code>
                    </div>
                  )}
                  {campaign.externalAdSetId && (
                    <div>
                      <span className="text-gray-400">Ad Set: </span>
                      <code className="text-gray-700">{campaign.externalAdSetId}</code>
                    </div>
                  )}
                  {campaign.externalAdId && (
                    <div>
                      <span className="text-gray-400">
                        {campaignPublishMode(campaign) === 'ORGANIC' ? 'Post / video: ' : 'Ad / creative: '}
                      </span>
                      <code className="text-gray-700">{campaign.externalAdId}</code>
                    </div>
                  )}
                </div>
              )}

              {/* Webhook info */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
                <p className="font-semibold mb-1">Lead Webhooks</p>
                <p className="mb-2">Configure these URLs in the platform dashboard:</p>
                <div className="space-y-1 font-mono break-all">
                  <p>Meta: <span className="text-amber-900">/api/webhooks/meta</span></p>
                  <p>Google: <span className="text-amber-900">/api/webhooks/google</span></p>
                  <p>TikTok: <span className="text-amber-900">/api/webhooks/tiktok</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assets tab */}
        {activeTab === 'assets' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Media Assets</h3>
            {(campaign.assets?.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-500">No assets. Edit the campaign to add images or videos.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {campaign.assets?.map((a) => (
                  <div key={a.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    {a.assetType === 'IMAGE' ? (
                      <img src={a.url} alt="" className="w-full h-36 object-cover" />
                    ) : (
                      <div className="w-full h-36 bg-black flex items-center justify-center text-white">
                        🎥
                      </div>
                    )}
                    <div className="p-2 text-xs text-gray-500">
                      <p className="font-medium text-gray-700">{a.assetType}</p>
                      {a.format && <p>{a.format}</p>}
                      {a.width && a.height && <p>{a.width}×{a.height}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leads tab */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={leadFilter}
                onChange={(e) => { setLeadFilter(e.target.value); setLeadPage(1); }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Statuses</option>
                {(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as LeadStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {mode === 'ORGANIC' ? (
                <span className="px-3 py-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg max-w-sm">
                  Organic posts don’t use Meta lead forms — sync isn’t available. Enquiries land here from the listing.
                </span>
              ) : (
                <button
                  onClick={handleSyncLeads}
                  disabled={syncing}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {syncing ? 'Syncing…' : '↺ Sync from Platform'}
                </button>
              )}
              <span className="text-sm text-gray-500 ml-auto">{leadTotal} total leads</span>
            </div>

            {leads.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                <div className="text-3xl mb-2">📬</div>
                <p className="text-gray-500 text-sm">No leads captured yet.</p>
                <p className="text-gray-400 text-xs mt-1 max-w-md mx-auto">
                  {mode === 'ORGANIC'
                    ? '0 leads is normal for a free Page post. When a buyer enquires on the linked listing, it shows here and under Admin → Leads.'
                    : 'Leads appear after people submit your Meta lead form. Use Sync from Platform to pull new form submissions.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{lead.fullName ?? '—'}</p>
                          <p className="text-gray-500 text-xs">{lead.email ?? '—'}</p>
                          {lead.phone && <p className="text-gray-400 text-xs">{lead.phone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs">
                            {PLATFORM_ICONS[lead.platform]} {lead.platform}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(lead.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={lead.status}
                            disabled={updatingLead === lead.id}
                            onChange={(e) => handleLeadStatusChange(lead.id, e.target.value as LeadStatus)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${LEAD_STATUS_COLORS[lead.status]}`}
                          >
                            {(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as LeadStatus[]).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {leadTotal > 50 && (
                  <div className="flex justify-center gap-2 p-4 border-t border-gray-200">
                    <button
                      disabled={leadPage <= 1}
                      onClick={() => setLeadPage((p) => p - 1)}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                    >
                      ← Prev
                    </button>
                    <span className="px-3 py-1.5 text-xs text-gray-600">Page {leadPage}</span>
                    <button
                      disabled={leads.length < 50}
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

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-800">Campaign Settings</h3>
            {campaign.platformConfig && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Platform Configuration</p>
                <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto">
                  {JSON.stringify(campaign.platformConfig, null, 2)}
                </pre>
              </div>
            )}
            {campaign.leadFormConfig && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Lead Form Configuration</p>
                <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto">
                  {JSON.stringify(campaign.leadFormConfig, null, 2)}
                </pre>
              </div>
            )}
            {campaign.notes && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Notes</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{campaign.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h4>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                Delete Campaign
              </button>
            </div>
          </div>
        )}
      </div>

      {editOpen && (
        <CampaignWizard
          initialData={campaign}
          onSaved={(saved) => { setCampaign(saved); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmPublish}
        title="Publish campaign"
        message={`Publish “${campaign.title}” to the platform now? Organic posts go live on your Page; paid campaigns create real ads.`}
        confirmLabel="Publish"
        busy={confirmBusy}
        onCancel={() => { if (!confirmBusy) setConfirmPublish(false); }}
        onConfirm={runPublish}
      />
      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete campaign"
        message={`Delete “${campaign.title}”? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        busy={confirmBusy}
        onCancel={() => { if (!confirmBusy) setConfirmDelete(false); }}
        onConfirm={runDelete}
      />
      <ConfirmDialog
        isOpen={Boolean(feedback)}
        title={feedback?.title ?? ''}
        message={
          feedback?.error
            ? (feedback.message ?? '')
            : `${feedback?.message ?? ''}${feedback?.viewUrl ? `\n\nOpen on Meta: ${feedback.viewUrl}` : ''}\n\nLeads stay at 0 until someone enquires — then check Admin → Leads.`
        }
        confirmLabel="OK"
        alertOnly
        variant={feedback?.error ? 'danger' : 'primary'}
        onCancel={() => setFeedback(null)}
        onConfirm={() => setFeedback(null)}
      />
      <AppToast toast={toast} onClose={() => setToast(null)} />
      <InstagramPublishOverlay
        job={igJob}
        onRetry={
          igJob && campaign
            ? () =>
                runInstagramPublish(campaign.id, {
                  forceFirst: true,
                  onUpdate: (job) => {
                    setIgJob(job);
                    if (job.campaign) setCampaign(job.campaign);
                  },
                }).then((final) => {
                  setIgJob(final);
                  if (final.campaign) setCampaign(final.campaign);
                })
            : undefined
        }
        onDismiss={() => setIgJob(null)}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium text-right">{value}</span>
    </div>
  );
}
