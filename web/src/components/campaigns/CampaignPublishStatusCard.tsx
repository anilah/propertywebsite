import { useEffect, useState } from 'react';
import { type Campaign } from '../../services/api';
import { integrationsApi } from '../../services/integrationsApi';
import {
  businessBadgeClasses,
  businessToneClasses,
  campaignBusinessStatus,
  campaignContentKind,
  campaignContentLabel,
  campaignPlatformViewUrl,
  campaignPublishMode,
  campaignPublishedAt,
} from '../../utils/campaignPublish';
import {
  instagramStatusLabel,
  runInstagramPublish,
  type IgPublishJob,
} from '../../utils/instagramPublishProgress';
import { InstagramPublishProgress } from './InstagramPublishProgress';

function CopyId({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={`Copy ${label}`}
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-700 bg-white/70 border border-black/5 rounded-md px-2 py-1 hover:bg-white"
    >
      <span className="truncate max-w-[11rem]">{value}</span>
      <span className="text-[10px] font-sans text-gray-500">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

/**
 * Business-first publish panel — “Live on Facebook · Reel” not raw ACTIVE / SINGLE_IMAGE.
 */
export function CampaignPublishStatusCard({
  campaign,
  onCampaignUpdate,
  onFeedback,
}: {
  campaign: Campaign;
  onCampaignUpdate?: (c: Campaign) => void;
  onFeedback?: (f: { title: string; message: string; error?: boolean }) => void;
}) {
  const [linkedIg, setLinkedIg] = useState<{ id?: string; username?: string } | null>(null);
  const [igJob, setIgJob] = useState<IgPublishJob | null>(null);

  const biz = campaignBusinessStatus(campaign);
  const mode = campaignPublishMode(campaign);
  const kind = campaignContentLabel(campaign);
  const contentKind = campaignContentKind(campaign);
  const publishedAt = campaignPublishedAt(campaign);
  const viewUrl = campaignPlatformViewUrl(campaign);
  const postId = campaign.externalAdId;
  const pageId = (campaign.platformConfig as { pageId?: string } | null)?.pageId;
  const ig = (campaign.platformConfig as {
    instagram?: {
      status?: string;
      username?: string;
      igUserId?: string;
      mediaId?: string;
      viewUrl?: string;
      error?: string;
      updatedAt?: string;
    };
  } | null)?.instagram;

  const igBusy = igJob?.phase === 'sending' || igJob?.phase === 'encoding';

  useEffect(() => {
    let cancelled = false;
    integrationsApi
      .getAll()
      .then((rows) => {
        if (cancelled) return;
        const meta = rows.find((r) => r.platform === 'META');
        const username = meta?.config?.instagramUsername?.trim();
        const id = meta?.config?.instagramUserId?.trim();
        if (username || id) setLinkedIg({ id, username });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const norm = (u?: string) => (u || '').replace(/^@/, '').toLowerCase();
  const accountChanged =
    Boolean(linkedIg?.id && ig?.igUserId && linkedIg.id !== ig.igUserId) ||
    Boolean(linkedIg?.username && ig?.username && norm(linkedIg.username) !== norm(ig.username));

  const canPostIg =
    mode === 'ORGANIC' &&
    campaign.status === 'ACTIVE' &&
    Boolean(campaign.assets?.some((a) => a.url));

  const showPostButton = canPostIg && !igBusy;

  const steps =
    mode === 'ORGANIC'
      ? [
          `Posted as a free ${kind.toLowerCase()} on your Facebook Page`,
          ig?.status === 'published'
            ? `Posted to Instagram${
                accountChanged && linkedIg?.username
                  ? ` — linked account is now @${linkedIg.username.replace(/^@/, '')}`
                  : ''
              }`
            : ig?.status === 'pending'
              ? 'Instagram Reel is encoding on Meta — use Post Reel below and keep the progress open'
              : 'Instagram not posted yet — use Post Reel to Instagram below',
          'Leads stay at 0 until a buyer enquires on the listing',
        ]
      : [
          'Ad objects created in Meta Ads Manager',
          'Turn on / fund delivery in Ads Manager if still PAUSED there',
          'Form leads sync into Admin → Leads',
        ];

  const postToInstagram = async () => {
    const final = await runInstagramPublish(campaign.id, {
      forceFirst: true,
      onUpdate: (job) => {
        setIgJob(job);
        if (job.campaign) onCampaignUpdate?.(job.campaign);
      },
    });
    setIgJob(final);
    if (final.campaign) onCampaignUpdate?.(final.campaign);
    if (final.phase === 'live') {
      onFeedback?.({ title: final.title, message: final.detail });
    } else if (final.phase === 'failed') {
      onFeedback?.({ title: final.title, message: final.detail, error: true });
    }
  };

  const buttonLabel = linkedIg?.username
    ? `${ig?.status === 'published' ? 'Post again to' : 'Post Reel to'} @${linkedIg.username.replace(/^@/, '')}`
    : ig?.status === 'published'
      ? 'Post again to linked Instagram'
      : ig?.status === 'pending'
        ? 'Finish Instagram Reel'
        : 'Post Reel to Instagram';

  const igRowLabel = igBusy
    ? igJob?.phase === 'sending'
      ? 'Sending…'
      : 'Encoding…'
    : instagramStatusLabel(ig?.status, ig?.updatedAt);

  return (
    <div className={`rounded-2xl border p-5 ${businessToneClasses(biz.tone)}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
            Where this stands
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${businessBadgeClasses(biz.tone)}`}
            >
              {biz.tone === 'success' && (
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              )}
              {biz.label}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/80 border border-black/5 px-2.5 py-1 text-xs font-semibold text-gray-800">
              {kind}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/80 border border-black/5 px-2.5 py-1 text-xs font-medium text-gray-600">
              {mode === 'ORGANIC' ? 'Organic · Free' : mode === 'PAID' ? 'Paid ads' : campaign.platform}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed opacity-90">{biz.summary}</p>

      {linkedIg?.username && (
        <p className="mt-2 text-xs text-gray-600 bg-white/70 border border-black/5 rounded-lg px-3 py-2">
          Linked Instagram now:{' '}
          <span className="font-semibold">@{linkedIg.username.replace(/^@/, '')}</span>
          {ig?.username && norm(ig.username) !== norm(linkedIg.username) && (
            <span className="text-amber-700">
              {' '}
              · this campaign last posted to @{ig.username.replace(/^@/, '')}
            </span>
          )}
        </p>
      )}

      {igJob && (
        <div className="mt-3">
          <InstagramPublishProgress
            job={igJob}
            onRetry={igBusy ? undefined : postToInstagram}
            onDismiss={
              igBusy
                ? undefined
                : () => setIgJob(null)
            }
          />
        </div>
      )}

      {ig?.error && ig.status !== 'published' && mode === 'ORGANIC' && !igJob && (
        <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {ig.error}
        </p>
      )}

      <dl className="mt-4 grid grid-cols-1 gap-2.5 text-sm">
        <div className="flex items-baseline justify-between gap-3 border-t border-black/5 pt-2.5">
          <dt className="text-xs font-medium uppercase tracking-wide opacity-60">Content</dt>
          <dd className="font-semibold text-right">
            {kind}
            {contentKind === 'REEL' ? ' · vertical video' : ''}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-black/5 pt-2.5">
          <dt className="text-xs font-medium uppercase tracking-wide opacity-60">Channel</dt>
          <dd className="font-semibold text-right">
            {mode === 'ORGANIC'
              ? ig?.status === 'published'
                ? 'Facebook + Instagram'
                : 'Facebook Page feed / Reels'
              : 'Meta Ads Manager'}
          </dd>
        </div>
        {mode === 'ORGANIC' && (
          <div className="flex items-baseline justify-between gap-3 border-t border-black/5 pt-2.5">
            <dt className="text-xs font-medium uppercase tracking-wide opacity-60">Instagram</dt>
            <dd className="font-semibold text-right">{igRowLabel}</dd>
          </div>
        )}
        {publishedAt && (
          <div className="flex items-baseline justify-between gap-3 border-t border-black/5 pt-2.5">
            <dt className="text-xs font-medium uppercase tracking-wide opacity-60">Went live</dt>
            <dd className="font-semibold text-right">{new Date(publishedAt).toLocaleString()}</dd>
          </div>
        )}
        {pageId && mode === 'ORGANIC' && (
          <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-2.5">
            <dt className="text-xs font-medium uppercase tracking-wide opacity-60">Page ID</dt>
            <dd>
              <CopyId value={pageId} label="Page ID" />
            </dd>
          </div>
        )}
        {postId && (
          <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-2.5">
            <dt className="text-xs font-medium uppercase tracking-wide opacity-60">
              {mode === 'ORGANIC' ? 'Post / video ID' : 'Creative ID'}
            </dt>
            <dd>
              <CopyId value={postId} label="Post ID" />
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 rounded-xl bg-white/70 border border-black/5 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
          What to do next
        </p>
        <ol className="space-y-1.5 text-sm text-gray-700 list-decimal list-inside">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>

      {showPostButton && (
        <button
          type="button"
          disabled={igBusy}
          onClick={postToInstagram}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
        >
          {buttonLabel}
        </button>
      )}

      {igBusy && (
        <p className="mt-2 text-center text-xs text-fuchsia-800/80">
          Keep this page open until the progress reaches Live.
        </p>
      )}

      {viewUrl && (
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"
        >
          {mode === 'ORGANIC' ? `Open ${kind.toLowerCase()} on Facebook` : 'Open Ads Manager'}
          <span aria-hidden>↗</span>
        </a>
      )}
      {ig?.viewUrl && ig.status === 'published' && (
        <a
          href={ig.viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
        >
          Open Instagram
          <span aria-hidden>↗</span>
        </a>
      )}

      <p className="mt-3 text-[11px] opacity-50">
        Internal record: {campaign.status}
        {campaign.campaignSubtype ? ` · stored as ${campaign.campaignSubtype.replace(/_/g, ' ')}` : ''}
      </p>
    </div>
  );
}
