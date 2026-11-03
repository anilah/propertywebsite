import type { Campaign, CampaignAsset } from '../services/api';
import { instagramStatusLabel } from './instagramPublishProgress';

export type CampaignPublishMode = 'ORGANIC' | 'PAID' | 'UNKNOWN';

export type CampaignContentKind = 'REEL' | 'VIDEO' | 'PHOTO' | 'MIXED' | 'NONE';

/** Business-facing publish state (never show raw ACTIVE for organic posts). */
export type CampaignBusinessStatus =
  | { code: 'draft'; label: string; tone: 'neutral'; summary: string }
  | { code: 'live_organic'; label: string; tone: 'success'; summary: string }
  | { code: 'ads_live'; label: string; tone: 'success'; summary: string }
  | { code: 'ads_ready'; label: string; tone: 'info'; summary: string }
  | { code: 'paused'; label: string; tone: 'warn'; summary: string }
  | { code: 'done'; label: string; tone: 'neutral'; summary: string };

export function campaignPublishMode(campaign: Campaign): CampaignPublishMode {
  const mode = (campaign.platformConfig as { campaignMode?: string } | null)?.campaignMode;
  if (mode === 'ORGANIC') return 'ORGANIC';
  if (mode === 'PAID') return 'PAID';
  if (campaign.platform === 'META' && campaign.externalAdId && !campaign.externalCampaignId) {
    return 'ORGANIC';
  }
  if (campaign.externalCampaignId) return 'PAID';
  return 'UNKNOWN';
}

export function campaignPublishedAt(campaign: Campaign): string | null {
  const at = (campaign.platformConfig as { publishedAt?: string } | null)?.publishedAt;
  return at || null;
}

/** What was actually attached — drives REEL vs image display. */
export function campaignContentKind(campaign: Campaign): CampaignContentKind {
  const assets = campaign.assets ?? [];
  if (!assets.length) return 'NONE';

  const kinds = assets.map((a) => classifyAsset(a));
  if (kinds.every((k) => k === 'REEL')) return 'REEL';
  if (kinds.every((k) => k === 'VIDEO' || k === 'REEL')) return kinds.includes('REEL') ? 'REEL' : 'VIDEO';
  if (kinds.every((k) => k === 'PHOTO')) return 'PHOTO';
  return 'MIXED';
}

function classifyAsset(a: Pick<CampaignAsset, 'assetType' | 'format' | 'url'>): CampaignContentKind {
  const fmt = (a.format || '').toUpperCase();
  const type = (a.assetType || '').toUpperCase();
  if (fmt === 'REEL') return 'REEL';
  if (fmt === 'VIDEO' || type === 'VIDEO') return 'VIDEO';
  if (/\.(mp4|mov|webm|m4v)(\?|$)/i.test(a.url || '')) return 'VIDEO';
  return 'PHOTO';
}

export function campaignContentLabel(campaign: Campaign): string {
  switch (campaignContentKind(campaign)) {
    case 'REEL':
      return 'Reel';
    case 'VIDEO':
      return 'Video';
    case 'PHOTO':
      return 'Photo';
    case 'MIXED':
      return 'Mixed media';
    default:
      return campaign.campaignSubtype?.replace(/_/g, ' ') || 'No media';
  }
}

/** Prefer real media over stale paid-ad subtype (SINGLE_IMAGE). */
export function campaignFormatLabel(campaign: Campaign): string {
  const mode = campaignPublishMode(campaign);
  const kind = campaignContentKind(campaign);
  if (mode === 'ORGANIC' || kind === 'REEL' || kind === 'VIDEO' || kind === 'PHOTO') {
    return campaignContentLabel(campaign);
  }
  if (campaign.campaignSubtype) {
    return campaign.campaignSubtype.replace(/_/g, ' ');
  }
  return campaignContentLabel(campaign);
}

export function campaignBusinessStatus(campaign: Campaign): CampaignBusinessStatus {
  const mode = campaignPublishMode(campaign);
  const kind = campaignContentLabel(campaign);

  if (campaign.status === 'DRAFT') {
    return {
      code: 'draft',
      label: 'Draft',
      tone: 'neutral',
      summary: 'Not sent to Meta yet. Publish when the content is ready.',
    };
  }
  if (campaign.status === 'PAUSED') {
    return {
      code: 'paused',
      label: 'Paused',
      tone: 'warn',
      summary: mode === 'PAID' ? 'Ad delivery is paused in Kaboo Homes.' : 'Campaign is paused.',
    };
  }
  if (campaign.status === 'COMPLETED' || campaign.status === 'ARCHIVED') {
    return {
      code: 'done',
      label: campaign.status === 'ARCHIVED' ? 'Archived' : 'Completed',
      tone: 'neutral',
      summary: 'This campaign is no longer running.',
    };
  }

  // ACTIVE / SCHEDULED
  if (mode === 'ORGANIC') {
    const ig = (campaign.platformConfig as {
      instagram?: { status?: string; username?: string; updatedAt?: string };
    } | null)?.instagram;
    const igLive = ig?.status === 'published';
    const igPending = ig?.status === 'pending';
    const igPendingStale =
      igPending &&
      (!ig.updatedAt || Date.now() - new Date(ig.updatedAt).getTime() > 90_000);
    return {
      code: 'live_organic',
      label: igLive
        ? 'Live on Facebook & Instagram'
        : igPendingStale
          ? 'Live on Facebook · Finish Instagram'
          : igPending
            ? 'Live on Facebook · Encoding on Instagram'
            : 'Live on Facebook',
      tone: 'success',
      summary: igLive
        ? `Your ${kind.toLowerCase()} is published on Facebook and Instagram as a free organic post. Enquiries show under Leads when buyers respond.`
        : igPendingStale
          ? `Your ${kind.toLowerCase()} is live on Facebook. Instagram did not finish — tap Finish Instagram and keep the progress panel open until it says Live.`
          : igPending
            ? `Your ${kind.toLowerCase()} is live on Facebook. Instagram is encoding the Reel (usually 30–90 seconds). Keep the page open or tap Finish Instagram.`
            : `Your ${kind.toLowerCase()} is published on the Facebook Page as a free organic post${ig?.status === 'failed' ? ' (Instagram publish failed — see status card)' : ''}. Enquiries show under Leads when buyers respond.`,
    };
  }
  if (mode === 'PAID') {
    return {
      code: 'ads_live',
      label: 'Ads set up',
      tone: 'success',
      summary:
        'Campaign objects were created in Meta Ads Manager. Confirm delivery/spend there; leads sync here when people submit forms.',
    };
  }
  return {
    code: 'ads_ready',
    label: campaign.status === 'SCHEDULED' ? 'Scheduled' : 'Active',
    tone: 'info',
    summary: 'Marked active in Kaboo Homes.',
  };
}

export function campaignPlatformViewUrl(campaign: Campaign): string | null {
  const cfg = (campaign.platformConfig || {}) as {
    pageId?: string;
    publishedPostType?: string;
    publishedPostId?: string;
    viewUrl?: string;
  };

  // Rewrite legacy broken /pageId/videos/id links (Meta now serves these as Reels)
  const stored = cfg.viewUrl || null;
  if (stored) {
    const m = stored.match(/facebook\.com\/(?:[^/]+)\/videos\/(\d+)/i);
    if (m?.[1]) return `https://www.facebook.com/reel/${m[1]}`;
    return stored;
  }

  const pageId = cfg.pageId || '';
  const postId = cfg.publishedPostId || campaign.externalAdId || '';
  const mode = campaignPublishMode(campaign);
  const kind = campaignContentKind(campaign);

  if (campaign.platform === 'META' && mode === 'ORGANIC' && postId) {
    if (cfg.publishedPostType === 'reel' || cfg.publishedPostType === 'video' || kind === 'REEL' || kind === 'VIDEO') {
      return `https://www.facebook.com/reel/${postId}`;
    }
    if (postId.includes('_')) return `https://www.facebook.com/${postId}`;
    if (pageId) return `https://www.facebook.com/${pageId}/posts/${postId}`;
    return `https://www.facebook.com/${postId}`;
  }

  if (campaign.platform === 'META' && campaign.externalCampaignId) {
    return 'https://business.facebook.com/adsmanager/manage/campaigns';
  }

  return null;
}

export function campaignStatusHint(campaign: Campaign): string {
  return campaignBusinessStatus(campaign).summary;
}

/** Per-channel publish status for list / detail cards. */
export function campaignChannelStatuses(campaign: Campaign): {
  facebook: { label: string; live: boolean; viewUrl: string | null };
  instagram: {
    label: string;
    live: boolean;
    pending: boolean;
    needsFinish: boolean;
    viewUrl: string | null;
    username?: string;
  };
} {
  const mode = campaignPublishMode(campaign);
  const fbUrl = campaignPlatformViewUrl(campaign);
  const ig = (campaign.platformConfig as {
    instagram?: {
      status?: string;
      username?: string;
      viewUrl?: string;
      updatedAt?: string;
    };
  } | null)?.instagram;

  const fbLive =
    mode === 'ORGANIC' &&
    (campaign.status === 'ACTIVE' || campaign.status === 'SCHEDULED') &&
    Boolean(campaign.externalAdId || fbUrl);

  const igLive = ig?.status === 'published';
  const igPending = ig?.status === 'pending';
  const igFailed = ig?.status === 'failed';

  return {
    facebook: {
      label: fbLive ? 'Live' : campaign.status === 'DRAFT' ? 'Not published' : campaign.status.replace(/_/g, ' '),
      live: fbLive,
      viewUrl: fbUrl,
    },
    instagram: {
      // Stable vocabulary: Live | Encoding | Needs finish | Failed | Not posted
      label: igLive
        ? 'Live'
        : mode === 'ORGANIC' && fbLive
          ? instagramStatusLabel(ig?.status, ig?.updatedAt)
          : '—',
      live: igLive,
      pending: igPending,
      needsFinish: Boolean(igPending || igFailed || (mode === 'ORGANIC' && fbLive && !igLive && !igPending)),
      viewUrl: igLive ? ig?.viewUrl || (ig?.username ? `https://www.instagram.com/${ig.username}/` : null) : null,
      username: ig?.username,
    },
  };
}

export function businessToneClasses(tone: CampaignBusinessStatus['tone']): string {
  switch (tone) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-900';
    case 'warn':
      return 'bg-amber-50 border-amber-200 text-amber-900';
    case 'info':
      return 'bg-sky-50 border-sky-200 text-sky-900';
    default:
      return 'bg-slate-50 border-slate-200 text-slate-800';
  }
}

export function businessBadgeClasses(tone: CampaignBusinessStatus['tone']): string {
  switch (tone) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'warn':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'info':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
