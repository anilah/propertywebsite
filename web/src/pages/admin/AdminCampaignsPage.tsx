import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  campaignApi,
  Campaign,
  CampaignPlatform,
} from '../../services/api';
import { CampaignWizard } from '../../components/campaigns/CampaignWizard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CampaignMediaThumb } from '../../components/ui/CampaignMediaThumb';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { InstagramPublishOverlay } from '../../components/campaigns/InstagramPublishProgress';
import {
  businessBadgeClasses,
  campaignBusinessStatus,
  campaignChannelStatuses,
  campaignContentLabel,
  campaignPlatformViewUrl,
  campaignPublishMode,
  campaignPublishedAt,
  campaignStatusHint,
} from '../../utils/campaignPublish';
import {
  runInstagramPublish,
  type IgPublishJob,
} from '../../utils/instagramPublishProgress';
import { AppToast, type AppToastState } from '../../components/ui/AppToast';

// ─── Platform branding ───────────────────────────────────────────────────────

const PLATFORM_META: { label: string; icon: string; bg: string; text: string } = {
  label: 'Meta',
  icon: '𝕗',
  bg: 'bg-blue-600',
  text: 'text-white',
};

const PLATFORM_GOOGLE = { label: 'Google', icon: 'G', bg: 'bg-red-500',  text: 'text-white' };
const PLATFORM_TIKTOK = { label: 'TikTok', icon: '♪', bg: 'bg-black',   text: 'text-white' };

function platformMeta(p: CampaignPlatform) {
  if (p === 'META')   return PLATFORM_META;
  if (p === 'GOOGLE') return PLATFORM_GOOGLE;
  return PLATFORM_TIKTOK;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminCampaignsPage() {
  const [campaigns, setCampaigns]   = useState<Campaign[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [confirm, setConfirm] = useState<
    | null
    | { kind: 'publish' | 'delete'; id: string; title: string }
  >(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [feedback, setFeedback] = useState<null | {
    title: string;
    message: string;
    error?: boolean;
    campaignId?: string;
    viewUrl?: string | null;
  }>(null);
  const [toast, setToast] = useState<AppToastState>(null);
  const [igJob, setIgJob] = useState<IgPublishJob | null>(null);
  const igCancelRef = useRef(false);

  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus]     = useState('');

  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await campaignApi.list({
        platform: filterPlatform || undefined,
        status:   filterStatus   || undefined,
        page,
        pageSize,
      });
      setCampaigns(res.campaigns);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filterPlatform, filterStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const finishInstagram = useCallback(async (campaignId: string) => {
    igCancelRef.current = false;
    const final = await runInstagramPublish(campaignId, {
      forceFirst: true,
      shouldCancel: () => igCancelRef.current,
      onUpdate: (job) => {
        setIgJob(job);
        if (job.campaign) {
          setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? job.campaign! : c)));
        }
      },
    });
    setIgJob(final);
    if (final.campaign) {
      setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? final.campaign! : c)));
    }
    if (final.phase === 'live') {
      setToast({ title: final.title, message: final.detail, tone: 'success' });
    } else if (final.phase === 'failed') {
      setToast({ title: final.title, message: final.detail, tone: 'error' });
    }
  }, []);

  const handleSaved = (saved: Campaign) => {
    setCampaigns((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setTotal((t) => t + 1);
    setWizardOpen(false);
    setEditTarget(null);
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setConfirmBusy(true);
    try {
      if (confirm.kind === 'delete') {
        await campaignApi.delete(confirm.id);
        setConfirm(null);
        load();
      } else {
        const res = await campaignApi.publish(confirm.id);
        setConfirm(null);
        const ig = (res.campaign.platformConfig as { instagram?: { status?: string; username?: string } } | null)
          ?.instagram;
        const title =
          ig?.status === 'published'
            ? 'Live on Facebook & Instagram'
            : res.publish?.mode === 'ORGANIC'
              ? 'Live on Facebook'
              : 'Campaign published';
        setToast({
          title,
          message: res.message,
          tone: 'success',
        });
        setFeedback({
          title,
          message: res.message,
          campaignId: res.campaign.id,
          viewUrl: res.publish?.viewUrl ?? campaignPlatformViewUrl(res.campaign),
        });
        load();
      }
    } catch (e: unknown) {
      setConfirm(null);
      const message = e instanceof Error ? e.message : String(e);
      setToast({
        title: confirm.kind === 'publish' ? 'Publish failed' : 'Delete failed',
        message,
        tone: 'error',
      });
      setFeedback({
        title: confirm.kind === 'publish' ? 'Publish failed' : 'Delete failed',
        message,
        error: true,
      });
    } finally {
      setConfirmBusy(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/90 via-slate-50/40 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* ── Page header ── */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Marketing</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Campaigns</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Create and publish Meta, Google &amp; TikTok campaigns for your property listings, then track leads as they come in.
            </p>
          </div>
          <button
            onClick={() => { setEditTarget(null); setWizardOpen(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Campaign
          </button>
        </div>

        <div>
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {(['META', 'GOOGLE', 'TIKTOK'] as CampaignPlatform[]).map((p) => {
            const count = campaigns.filter((c) => c.platform === p).length;
            const pm = platformMeta(p);
            return (
              <div key={p} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <span className={`w-9 h-9 rounded-full ${pm.bg} ${pm.text} flex items-center justify-center font-bold text-sm`}>
                  {pm.icon}
                </span>
                <div>
                  <p className="text-xs text-gray-500">{pm.label}</p>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            );
          })}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
              ⚡
            </span>
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900">{campaigns.filter((c) => c.status === 'ACTIVE').length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
          <select
            value={filterPlatform}
            onChange={(e) => { setFilterPlatform(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Platforms</option>
            <option value="META">Meta (Facebook/Instagram)</option>
            <option value="GOOGLE">Google Ads</option>
            <option value="TIKTOK">TikTok Ads</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <span className="text-sm text-gray-500 ml-auto">{total} campaign{total !== 1 ? 's' : ''}</span>
        </div>

        {/* Campaign cards */}
        {loading ? (
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <div className="text-4xl mb-3">📣</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No campaigns yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create your first campaign to start promoting properties on Meta, Google, or TikTok.
            </p>
            <button
              onClick={() => { setEditTarget(null); setWizardOpen(true); }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {campaigns.map((campaign) => {
              const pm = platformMeta(campaign.platform);
              const firstAsset = campaign.assets?.[0];
              const mode = campaignPublishMode(campaign);
              const publishedAt = campaignPublishedAt(campaign);
              const biz = campaignBusinessStatus(campaign);
              const contentLabel = campaignContentLabel(campaign);
              const channels = campaignChannelStatuses(campaign);
              const isLive = biz.code === 'live_organic' || biz.code === 'ads_live';
              const thisJob = igJob?.campaignId === campaign.id ? igJob : null;
              const igBusy =
                thisJob?.phase === 'sending' || thisJob?.phase === 'encoding';
              const igChipLabel = igBusy
                ? thisJob?.phase === 'sending'
                  ? 'Sending…'
                  : 'Encoding…'
                : channels.instagram.label;
              return (
                <div
                  key={campaign.id}
                  className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow ${
                    isLive ? 'border-green-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Platform icon / thumbnail */}
                    <div className="flex-shrink-0">
                      <CampaignMediaThumb
                        url={firstAsset?.url}
                        assetType={firstAsset?.assetType}
                        format={firstAsset?.format}
                        thumbnailUrl={firstAsset?.thumbnailUrl}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                        fallback={
                          <div className={`w-16 h-16 rounded-lg ${pm.bg} ${pm.text} flex items-center justify-center text-2xl font-bold`}>
                            {pm.icon}
                          </div>
                        }
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900 truncate">{campaign.title}</h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${businessBadgeClasses(biz.tone)}`}
                        >
                          {biz.tone === 'success' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                          )}
                          {biz.label}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                          {contentLabel}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {mode === 'ORGANIC' ? 'Organic · Free' : mode === 'PAID' ? 'Paid ads' : pm.label}
                        </span>
                      </div>

                      {/* Explicit channel status (Facebook / Instagram) */}
                      {mode === 'ORGANIC' && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                              channels.facebook.live
                                ? 'bg-blue-50 text-blue-800 border-blue-100'
                                : 'bg-slate-50 text-slate-500 border-slate-100'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${channels.facebook.live ? 'bg-blue-500' : 'bg-slate-300'}`} />
                            Facebook · {channels.facebook.label}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                              channels.instagram.live && !igBusy
                                ? 'bg-pink-50 text-pink-800 border-pink-100'
                                : igBusy || channels.instagram.pending
                                  ? 'bg-amber-50 text-amber-800 border-amber-100'
                                  : 'bg-slate-50 text-slate-500 border-slate-100'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                channels.instagram.live && !igBusy
                                  ? 'bg-pink-500'
                                  : igBusy || channels.instagram.pending
                                    ? 'bg-amber-500 animate-pulse'
                                    : 'bg-slate-300'
                              }`}
                            />
                            Instagram · {igChipLabel}
                          </span>
                        </div>
                      )}

                      <p className="text-sm text-gray-500 mt-1.5">
                        {mode === 'ORGANIC'
                          ? `${contentLabel} on Facebook Page`
                          : `${campaign.campaignType}${campaign.campaignSubtype ? ` · ${campaign.campaignSubtype}` : ''}`}
                        {campaign.listingIds?.length
                          ? ` · ${campaign.listingIds.length} listing${campaign.listingIds.length !== 1 ? 's' : ''}`
                          : ''}
                      </p>

                      {isLive && (
                        <p className="mt-1.5 text-xs text-green-800/80 leading-snug">
                          {campaignStatusHint(campaign)}
                          {publishedAt ? ` · ${new Date(publishedAt).toLocaleString()}` : ''}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          {campaign.leadCount} enquir{campaign.leadCount === 1 ? 'y' : 'ies'}
                          {isLive && campaign.leadCount === 0 ? ' (waiting)' : ''}
                        </span>
                        {campaign.externalAdId && (
                          <span className="font-mono truncate max-w-[10rem]" title={campaign.externalAdId}>
                            ID {campaign.externalAdId.slice(0, 10)}…
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      {channels.facebook.viewUrl && (
                        <a
                          href={channels.facebook.viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Open Facebook
                        </a>
                      )}
                      {channels.instagram.viewUrl && (
                        <a
                          href={channels.instagram.viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-medium text-pink-700 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors"
                        >
                          Open Instagram
                        </a>
                      )}
                      {mode === 'ORGANIC' &&
                        campaign.status === 'ACTIVE' &&
                        channels.instagram.needsFinish && (
                        <button
                          type="button"
                          disabled={Boolean(igJob && (igJob.phase === 'sending' || igJob.phase === 'encoding'))}
                          onClick={() => finishInstagram(campaign.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg hover:opacity-95 disabled:opacity-60 transition-opacity"
                        >
                          {igBusy ? 'Posting Reel…' : 'Finish Instagram'}
                        </button>
                      )}
                      <Link
                        to={`/admin/campaigns/${campaign.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => { setEditTarget(campaign); setWizardOpen(true); }}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      {(campaign.status === 'DRAFT' || campaign.status === 'PAUSED') && (
                        <button
                          onClick={() =>
                            setConfirm({ kind: 'publish', id: campaign.id, title: campaign.title })
                          }
                          className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setConfirm({ kind: 'delete', id: campaign.id, title: campaign.title })
                        }
                        className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* External IDs */}
                  {(campaign.externalCampaignId || campaign.externalAdId) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex gap-4 flex-wrap">
                      {campaign.externalCampaignId && (
                        <span>Campaign ID: <code className="bg-gray-100 px-1 rounded">{campaign.externalCampaignId}</code></span>
                      )}
                      {campaign.externalAdSetId && (
                        <span>Ad Set: <code className="bg-gray-100 px-1 rounded">{campaign.externalAdSetId}</code></span>
                      )}
                      {campaign.externalAdId && (
                        <span>
                          {mode === 'ORGANIC' ? 'Post / video ID' : 'Ad / creative'}:{' '}
                          <code className="bg-gray-100 px-1 rounded">{campaign.externalAdId}</code>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Campaign wizard modal */}
      {wizardOpen && (
        <CampaignWizard
          initialData={editTarget ?? undefined}
          onSaved={handleSaved}
          onClose={() => { setWizardOpen(false); setEditTarget(null); }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(confirm)}
        title={confirm?.kind === 'delete' ? 'Delete campaign' : 'Publish campaign'}
        message={
          confirm?.kind === 'delete'
            ? `Delete “${confirm.title}”? This cannot be undone.`
            : `Publish “${confirm?.title ?? 'this campaign'}” to the platform now? Organic posts go live on your Page; paid campaigns create real ads.`
        }
        confirmLabel={confirm?.kind === 'delete' ? 'Delete' : 'Publish'}
        variant={confirm?.kind === 'delete' ? 'danger' : 'primary'}
        busy={confirmBusy}
        onCancel={() => { if (!confirmBusy) setConfirm(null); }}
        onConfirm={runConfirm}
      />

      <Modal
        isOpen={Boolean(feedback)}
        onClose={() => setFeedback(null)}
        title={feedback?.title ?? ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setFeedback(null)}>
              Close
            </Button>
            {feedback?.campaignId && !feedback.error && (
              <Link
                to={`/admin/campaigns/${feedback.campaignId}`}
                onClick={() => setFeedback(null)}
                className="inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl px-4 py-2 bg-primary-600 text-white hover:bg-primary-700"
              >
                View status
              </Link>
            )}
          </>
        }
      >
        <p className={`text-sm leading-relaxed ${feedback?.error ? 'text-red-700' : 'text-gray-600'}`}>
          {feedback?.message}
        </p>
        {!feedback?.error && (
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              List status shows <strong>Live on Facebook</strong> (and Instagram when co-posted)
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              Use <strong>Open Facebook</strong> / <strong>Open Instagram</strong> or <strong>Details</strong> for links &amp; IDs
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              Leads stay at 0 until someone enquires — then they show under <strong>Admin → Leads</strong>
            </li>
          </ul>
        )}
        {feedback?.viewUrl && !feedback.error && (
          <a
            href={feedback.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:underline"
          >
            Open on Meta ↗
          </a>
        )}
      </Modal>
      <AppToast toast={toast} onClose={() => setToast(null)} />
      <InstagramPublishOverlay
        job={igJob}
        onRetry={
          igJob
            ? () => finishInstagram(igJob.campaignId)
            : undefined
        }
        onDismiss={() => setIgJob(null)}
      />
      </div>
    </div>
  );
}
