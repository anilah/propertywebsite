import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendServerError } from '../utils/serverError.js';
import { metaService, setMetaRuntimeCreds, clearMetaRuntimeCreds } from '../services/platforms/meta.js';
import { googleService } from '../services/platforms/google.js';
import { tiktokService } from '../services/platforms/tiktok.js';
import { getMetaCreds } from '../services/platforms/getMetaCreds.js';
import { withEnquiryTracking } from '../utils/leadSource.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseSafeJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

function serializeJson(val: unknown): string {
  return JSON.stringify(val ?? null);
}

function normalizeCampaign(c: {
  id: string;
  title: string;
  platform: string;
  campaignType: string;
  campaignSubtype: string | null;
  status: string;
  objective: string | null;
  budgetType: string;
  budgetAmount: number | null;
  currency: string;
  startDate: Date | null;
  endDate: Date | null;
  targetAudience: string | null;
  platformConfig: string | null;
  externalCampaignId: string | null;
  externalAdSetId: string | null;
  externalAdId: string | null;
  listingIds: string;
  headline: string | null;
  primaryText: string | null;
  description: string | null;
  callToAction: string | null;
  destinationUrl: string | null;
  leadFormConfig: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  assets?: { id: string; assetType: string; url: string; thumbnailUrl: string | null; format: string | null; sortOrder: number }[];
  leads?: { id: string }[];
}) {
  return {
    ...c,
    listingIds:     parseSafeJson<string[]>(c.listingIds, []),
    targetAudience: parseSafeJson(c.targetAudience, null),
    platformConfig: parseSafeJson(c.platformConfig, null),
    leadFormConfig: parseSafeJson(c.leadFormConfig, null),
    leadCount: c.leads?.length ?? 0,
  };
}

// ─── GET /api/admin/campaigns ─────────────────────────────────────────────────

export const getCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const { platform, status, page = '1', pageSize = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const where: Record<string, unknown> = {};
    if (platform) where.platform = platform;
    if (status)   where.status   = status;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          assets: { orderBy: { sortOrder: 'asc' }, take: 1 },
          leads:  { select: { id: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    res.json({
      campaigns: campaigns.map(normalizeCampaign),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    sendServerError(res, err, { fn: 'getCampaigns' });
  }
};

// ─── GET /api/admin/campaigns/:id ─────────────────────────────────────────────

export const getCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        assets: { orderBy: { sortOrder: 'asc' } },
        leads:  { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }
    res.json(normalizeCampaign(campaign));
  } catch (err) {
    sendServerError(res, err, { fn: 'getCampaign' });
  }
};

// ─── POST /api/admin/campaigns ─────────────────────────────────────────────────

export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title, platform, campaignType, campaignSubtype,
      objective, budgetType, budgetAmount, currency,
      startDate, endDate, targetAudience, platformConfig,
      listingIds, headline, primaryText, description,
      callToAction, destinationUrl, leadFormConfig, notes,
    } = req.body;

    if (!title || !platform || !campaignType) {
      res.status(400).json({ error: 'title, platform and campaignType are required' });
      return;
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        platform,
        campaignType,
        campaignSubtype:  campaignSubtype  ?? null,
        status:           'DRAFT',
        objective:        objective         ?? null,
        budgetType:       budgetType        ?? 'DAILY',
        budgetAmount:     budgetAmount      ?? null,
        currency:         currency          ?? 'NZD',
        startDate:        startDate         ? new Date(startDate) : null,
        endDate:          endDate           ? new Date(endDate)   : null,
        targetAudience:   serializeJson(targetAudience),
        platformConfig:   serializeJson(platformConfig),
        listingIds:       serializeJson(listingIds ?? []),
        headline:         headline          ?? null,
        primaryText:      primaryText       ?? null,
        description:      description       ?? null,
        callToAction:     callToAction       ?? null,
        destinationUrl:   destinationUrl    ?? null,
        leadFormConfig:   serializeJson(leadFormConfig),
        notes:            notes             ?? null,
        createdBy:        req.user?.id      ?? null,
      },
    });

    res.status(201).json(normalizeCampaign({ ...campaign, assets: [], leads: [] }));
  } catch (err) {
    sendServerError(res, err, { fn: 'createCampaign' });
  }
};

// ─── PATCH /api/admin/campaigns/:id ───────────────────────────────────────────

export const updateCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const {
      title, platform, campaignType, campaignSubtype, status,
      objective, budgetType, budgetAmount, currency,
      startDate, endDate, targetAudience, platformConfig,
      listingIds, headline, primaryText, description,
      callToAction, destinationUrl, leadFormConfig, notes,
    } = req.body;

    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        ...(title             !== undefined && { title }),
        ...(platform          !== undefined && { platform }),
        ...(campaignType      !== undefined && { campaignType }),
        ...(campaignSubtype   !== undefined && { campaignSubtype }),
        ...(status            !== undefined && { status }),
        ...(objective         !== undefined && { objective }),
        ...(budgetType        !== undefined && { budgetType }),
        ...(budgetAmount      !== undefined && { budgetAmount }),
        ...(currency          !== undefined && { currency }),
        ...(startDate         !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate           !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(targetAudience    !== undefined && { targetAudience:  serializeJson(targetAudience) }),
        ...(platformConfig    !== undefined && { platformConfig:  serializeJson(platformConfig) }),
        ...(listingIds        !== undefined && { listingIds:      serializeJson(listingIds) }),
        ...(headline          !== undefined && { headline }),
        ...(primaryText       !== undefined && { primaryText }),
        ...(description       !== undefined && { description }),
        ...(callToAction      !== undefined && { callToAction }),
        ...(destinationUrl    !== undefined && { destinationUrl }),
        ...(leadFormConfig    !== undefined && { leadFormConfig:  serializeJson(leadFormConfig) }),
        ...(notes             !== undefined && { notes }),
      },
      include: { assets: true, leads: { select: { id: true } } },
    });

    res.json(normalizeCampaign(campaign));
  } catch (err) {
    sendServerError(res, err, { fn: 'updateCampaign' });
  }
};

// ─── DELETE /api/admin/campaigns/:id ──────────────────────────────────────────

export const deleteCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }
    // Cascade delete assets + leads handled by Prisma relation
    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    sendServerError(res, err, { fn: 'deleteCampaign' });
  }
};

// ─── POST /api/admin/campaigns/:id/assets ────────────────────────────────────

export const addCampaignAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { assetType, url, thumbnailUrl, format, width, height, durationSec, fileSize, mimeType, sortOrder } = req.body;
    if (!assetType || !url) {
      res.status(400).json({ error: 'assetType and url are required' });
      return;
    }
    const asset = await prisma.campaignAsset.create({
      data: {
        campaignId: req.params.id,
        assetType,
        url,
        thumbnailUrl: thumbnailUrl ?? null,
        format:       format       ?? null,
        width:        width        ?? null,
        height:       height       ?? null,
        durationSec:  durationSec  ?? null,
        fileSize:     fileSize     ?? null,
        mimeType:     mimeType     ?? null,
        sortOrder:    sortOrder    ?? 0,
      },
    });
    res.status(201).json(asset);
  } catch (err) {
    sendServerError(res, err, { fn: 'addCampaignAsset' });
  }
};

// ─── DELETE /api/admin/campaigns/:id/assets/:assetId ─────────────────────────

export const deleteCampaignAsset = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.campaignAsset.deleteMany({
      where: { id: req.params.assetId, campaignId: req.params.id },
    });
    res.json({ success: true });
  } catch (err) {
    sendServerError(res, err, { fn: 'deleteCampaignAsset' });
  }
};

// ─── POST /api/admin/campaigns/:id/publish ───────────────────────────────────
// Orchestrates pushing the campaign to the selected platform

export const publishCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { assets: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }
    if (campaign.status === 'ACTIVE') {
      res.status(409).json({ error: 'Campaign is already active' });
      return;
    }

    const targetAudience = parseSafeJson<Record<string, unknown>>(campaign.targetAudience, {});
    const platformCfg    = parseSafeJson<Record<string, unknown>>(campaign.platformConfig, {});
    const listingIds     = parseSafeJson<string[]>(campaign.listingIds, []);

    const destinationUrl =
      campaign.destinationUrl ??
      `${process.env.SITE_URL ?? 'https://uat.kaboohomes.com'}/listing/${listingIds[0] ?? ''}`;

    const externalIds: { externalCampaignId?: string; externalAdSetId?: string; externalAdId?: string } = {};

    // ── META ──
    if (campaign.platform === 'META') {
      // Load credentials from DB (encrypted PlatformSetting) with env-var fallback
      const metaCreds = await getMetaCreds();

      // Validate credentials before making any API calls
      if (!metaCreds.accessToken) {
        res.status(400).json({
          error: 'Meta (Facebook/Instagram) is not configured. Please add your credentials in Integrations before publishing.',
          code: 'META_NOT_CONFIGURED',
        });
        return;
      }
      if (!metaCreds.pageId) {
        res.status(400).json({
          error: 'Meta Page ID is not configured. Please complete your Meta integration setup in Integrations.',
          code: 'META_PAGE_ID_MISSING',
        });
        return;
      }

      setMetaRuntimeCreds(metaCreds);

      // ── Organic post mode ──────────────────────────────────────────────────
      if (platformCfg.campaignMode === 'ORGANIC') {
        const firstAsset  = campaign.assets[0];
        const mediaUrl    = firstAsset?.url;
        const mediaType   = (firstAsset?.format?.toLowerCase() as 'photo' | 'video' | 'reel' | undefined)
          ?? (firstAsset?.assetType === 'VIDEO' ? 'video' : 'photo');
        const caption = [campaign.headline, campaign.primaryText].filter(Boolean).join('\n\n') || campaign.title;
        const wantInstagram = platformCfg.postToInstagram !== false; // default on

        const hasDestination = Boolean(campaign.destinationUrl || listingIds[0]);
        const facebookEnquiryUrl = hasDestination
          ? withEnquiryTracking(destinationUrl, 'facebook', campaign.id)
          : undefined;
        const facebookCaption =
          facebookEnquiryUrl && !/https?:\/\//i.test(caption)
            ? `${caption}\n\nEnquire now 👉 ${facebookEnquiryUrl}`
            : caption;

        const postResult = await metaService.createPagePost({
          pageId:    metaCreds.pageId,
          message:   facebookCaption,
          mediaUrl,
          mediaType,
          linkUrl:   facebookEnquiryUrl ?? destinationUrl,
        });
        if (facebookEnquiryUrl) {
          platformCfg.enquiryLinks = {
            facebook: facebookEnquiryUrl,
            instagram: withEnquiryTracking(destinationUrl, 'instagram', campaign.id),
          };
        }

        externalIds.externalAdId = postResult.id;
        // Remember mode + page for admin “where did it go?” tracking
        platformCfg.campaignMode = 'ORGANIC';
        platformCfg.pageId = metaCreds.pageId;
        platformCfg.publishedAt = new Date().toISOString();
        platformCfg.publishedPostType = postResult.postType;
        platformCfg.publishedPostId = postResult.id;
        // Align campaign format with the media that actually posted (REEL / VIDEO / photo)
        const postedFormat =
          (firstAsset?.format || '').toUpperCase() === 'REEL'
            ? 'REELS'
            : firstAsset?.assetType === 'VIDEO' || (firstAsset?.format || '').toUpperCase() === 'VIDEO'
              ? 'VIDEO'
              : 'SINGLE_IMAGE';

        // ── Instagram co-post (Page-linked Business account) ────────────────
        let igResult: Awaited<ReturnType<typeof metaService.createInstagramOrganicPost>> | {
          status: 'skipped';
          error?: string;
        } = { status: 'skipped' };

        if (wantInstagram && mediaUrl) {
          try {
            const { pageToken } = await metaService.resolvePageAccessToken(metaCreds.pageId);
            let igUserId = metaCreds.instagramUserId;
            let igUsername = metaCreds.instagramUsername;
            {
              const linked = await metaService.resolveLinkedInstagramAccount(metaCreds.pageId, pageToken);
              if (linked?.id) {
                igUserId = linked.id;
                igUsername = linked.username ?? igUsername;
              }
            }
            if (!igUserId) {
              igResult = {
                status: 'skipped',
                error:
                  'No Instagram Business account linked to this Facebook Page. Link one in Meta Business Suite, then re-test Meta in Integrations.',
              };
            } else {
              // Leave headroom under API Gateway ~29s (Facebook post already used time)
              igResult = await metaService.createInstagramOrganicPost({
                igUserId,
                pageToken,
                caption,
                mediaUrl,
                mediaType,
                username: igUsername,
                maxWaitMs: 10_000,
              });
            }
          } catch (igErr) {
            igResult = {
              status: 'failed',
              error: igErr instanceof Error ? igErr.message : String(igErr),
            };
          }
        } else if (wantInstagram && !mediaUrl) {
          igResult = { status: 'skipped', error: 'Instagram requires an image or video attachment.' };
        }

        platformCfg.instagram = {
          status: igResult.status,
          mediaId: 'mediaId' in igResult ? igResult.mediaId : undefined,
          containerId: 'containerId' in igResult ? igResult.containerId : undefined,
          igUserId: 'igUserId' in igResult ? igResult.igUserId : undefined,
          username: 'username' in igResult ? igResult.username : undefined,
          viewUrl: 'viewUrl' in igResult ? igResult.viewUrl : undefined,
          error: 'error' in igResult ? igResult.error : undefined,
          updatedAt: new Date().toISOString(),
        };

        clearMetaRuntimeCreds();

        const organicViewUrl =
          postResult.viewUrl ||
          (postResult.postType === 'reel' || postResult.postType === 'video'
            ? `https://www.facebook.com/reel/${postResult.id}`
            : postResult.id.includes('_')
              ? `https://www.facebook.com/${postResult.id}`
              : `https://www.facebook.com/${metaCreds.pageId}/posts/${postResult.id}`);

        platformCfg.viewUrl = organicViewUrl;
        platformCfg.publishedPostType = postResult.postType;

        const kindLabel =
          postedFormat === 'REELS' ? 'Reel' : postedFormat === 'VIDEO' ? 'Video' : 'Photo';

        const igStatus = igResult.status;
        const igMessage =
          igStatus === 'published'
            ? ` Also live on Instagram${'username' in igResult && igResult.username ? ` (@${igResult.username})` : ''}.`
            : igStatus === 'pending'
              ? ' Instagram is still processing the media — we’ll finish publishing shortly.'
              : igStatus === 'failed'
                ? ` Instagram failed: ${('error' in igResult && igResult.error) || 'unknown error'}. Facebook post is still live.`
                : igStatus === 'skipped' && 'error' in igResult && igResult.error
                  ? ` Instagram skipped: ${igResult.error}`
                  : '';

        const updatedOrganic = await prisma.campaign.update({
          where: { id: req.params.id },
          data: {
            status: 'ACTIVE',
            campaignSubtype: postedFormat,
            platformConfig: serializeJson(platformCfg),
            ...externalIds,
          },
          include: { assets: true, leads: { select: { id: true } } },
        });

        res.json({
          success: true,
          message: `${kindLabel} is live on your Facebook Page (organic / free).${igMessage}`,
          publish: {
            mode: 'ORGANIC' as const,
            platform: campaign.platform,
            status: igStatus === 'published' ? 'LIVE_ON_FACEBOOK_AND_INSTAGRAM' : 'LIVE_ON_FACEBOOK',
            contentKind: postedFormat,
            postId: postResult.id,
            campaignId: null,
            viewUrl: organicViewUrl,
            publishedAt: platformCfg.publishedAt as string,
            instagram: platformCfg.instagram,
          },
          campaign: normalizeCampaign(updatedOrganic),
        });
        return;
      } else {
      // ── Paid ad campaign mode ──────────────────────────────────────────────

      const objectiveMap: Record<string, 'OUTCOME_LEADS' | 'OUTCOME_TRAFFIC' | 'OUTCOME_AWARENESS' | 'OUTCOME_SALES'> = {
        LEAD_GENERATION: 'OUTCOME_LEADS',
        TRAFFIC:         'OUTCOME_TRAFFIC',
        AWARENESS:       'OUTCOME_AWARENESS',
        SALES:           'OUTCOME_SALES',
      };

      externalIds.externalCampaignId = await metaService.createCampaign({
        name:          campaign.title,
        objective:     objectiveMap[campaign.campaignType] ?? 'OUTCOME_LEADS',
        status:        'PAUSED',
        dailyBudget:   campaign.budgetAmount ? Math.round(campaign.budgetAmount * 100) : undefined,
        startTime:     campaign.startDate?.toISOString(),
        stopTime:      campaign.endDate?.toISOString(),
      });

      externalIds.externalAdSetId = await metaService.createAdSet({
        campaignId: externalIds.externalCampaignId,
        name:       `${campaign.title} – Ad Set`,
        dailyBudget: campaign.budgetAmount ? Math.round(campaign.budgetAmount * 100) : undefined,
        targeting: {
          ageMin:        (targetAudience.ageMin as number) ?? 25,
          ageMax:        (targetAudience.ageMax as number) ?? 65,
          genders:       targetAudience.genders as number[] | undefined,
          geoLocations:  targetAudience.geoLocations as { countries?: string[] } | undefined,
        },
        pageId:      (platformCfg.pageId as string) ?? metaCreds.pageId,
        pixelId:     (platformCfg.pixelId as string) ?? metaCreds.pixelId,
        startTime:   campaign.startDate?.toISOString(),
        endTime:     campaign.endDate?.toISOString(),
      });

      const firstImage = campaign.assets.find((a) => a.assetType === 'IMAGE');
      const creativeId = await metaService.createCreative({
        name:           `${campaign.title} – Creative`,
        pageId:         (platformCfg.pageId as string) ?? metaCreds.pageId,
        imageUrl:       firstImage?.url,
        headline:       campaign.headline ?? campaign.title,
        body:           campaign.primaryText ?? '',
        description:    campaign.description ?? undefined,
        callToActionType: campaign.callToAction ?? 'LEARN_MORE',
        linkUrl:        destinationUrl,
      });
      externalIds.externalAdId = creativeId;
      platformCfg.campaignMode = 'PAID';
      platformCfg.pageId = (platformCfg.pageId as string) ?? metaCreds.pageId;
      platformCfg.publishedAt = new Date().toISOString();
      clearMetaRuntimeCreds();
      } // end paid mode
    }

    // ── GOOGLE ──
    else if (campaign.platform === 'GOOGLE') {
      const channelMap: Record<string, string> = {
        SEARCH:          'SEARCH',
        DISPLAY:         'DISPLAY',
        VIDEO:           'VIDEO',
        PERFORMANCE_MAX: 'PERFORMANCE_MAX',
      };

      const campResource = await googleService.createCampaign({
        name:                   campaign.title,
        advertisingChannelType: channelMap[campaign.campaignType] ?? 'SEARCH',
        status:                 'PAUSED',
        dailyBudgetMicros:      campaign.budgetAmount ? campaign.budgetAmount * 1_000_000 : undefined,
        startDate:              campaign.startDate
                                  ? campaign.startDate.toISOString().slice(0, 10).replace(/-/g, '')
                                  : undefined,
        endDate:                campaign.endDate
                                  ? campaign.endDate.toISOString().slice(0, 10).replace(/-/g, '')
                                  : undefined,
      });
      externalIds.externalCampaignId = campResource;

      const adGroupResource = await googleService.createAdGroup({
        campaignResourceName: campResource,
        name: `${campaign.title} – Ad Group`,
        status: 'PAUSED',
      });
      externalIds.externalAdSetId = adGroupResource;

      if (campaign.campaignType === 'SEARCH' && campaign.headline) {
        const adResource = await googleService.createRSA({
          adGroupResourceName: adGroupResource,
          headlines:           [campaign.headline, campaign.title, 'Property in New Zealand'],
          descriptions:        [campaign.primaryText ?? '', campaign.description ?? 'Find your dream home.'],
          finalUrl:            destinationUrl,
        });
        externalIds.externalAdId = adResource;
      }
    }

    // ── TIKTOK ──
    else if (campaign.platform === 'TIKTOK') {
      const objectiveMap: Record<string, string> = {
        REACH:            'REACH',
        TRAFFIC:          'TRAFFIC',
        VIDEO_VIEWS:      'VIDEO_VIEWS',
        LEAD_GENERATION:  'LEAD_GENERATION',
      };

      externalIds.externalCampaignId = await tiktokService.createCampaign({
        name:       campaign.title,
        objective:  objectiveMap[campaign.campaignType] ?? 'TRAFFIC',
        status:     'DISABLE',
        budget:     campaign.budgetAmount ?? 20,
        budgetMode: campaign.budgetType === 'LIFETIME' ? 'BUDGET_MODE_TOTAL' : 'BUDGET_MODE_DAY',
      });

      externalIds.externalAdSetId = await tiktokService.createAdGroup({
        campaignId: externalIds.externalCampaignId,
        name:       `${campaign.title} – Ad Group`,
        budget:     campaign.budgetAmount ?? 20,
        targeting: {
          ageGroups: (targetAudience.ageGroups as string[]) ?? [],
          genders:   (targetAudience.genders as string[])   ?? [],
          locations: (targetAudience.locations as string[]) ?? ['NZ'],
        },
        scheduleStartTime: campaign.startDate ? String(Math.floor(campaign.startDate.getTime() / 1000)) : undefined,
        scheduleEndTime:   campaign.endDate   ? String(Math.floor(campaign.endDate.getTime() / 1000))   : undefined,
      });

      const videoAsset = campaign.assets.find((a) => a.assetType === 'VIDEO');
      if (videoAsset) {
        const videoId = await tiktokService.uploadVideoFromUrl(videoAsset.url, `${campaign.title} video`);
        externalIds.externalAdId = await tiktokService.createAd({
          adGroupId:      externalIds.externalAdSetId,
          name:           `${campaign.title} – Ad`,
          videoId,
          adText:         campaign.primaryText ?? campaign.headline ?? campaign.title,
          callToAction:   campaign.callToAction ?? 'LEARN_MORE',
          landingPageUrl: destinationUrl,
        });
      }
    }

    const publishMode =
      (platformCfg.campaignMode as string) === 'ORGANIC' ? 'ORGANIC' : 'PAID';

    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data:  {
        status:         'ACTIVE',
        platformConfig: serializeJson(platformCfg),
        ...externalIds,
      },
      include: { assets: true, leads: { select: { id: true } } },
    });

    const pageId = (platformCfg.pageId as string) || '';
    const postId = externalIds.externalAdId || '';
    let viewUrl: string | null = null;
    if (campaign.platform === 'META' && postId) {
      if (publishMode === 'ORGANIC' && pageId) {
        const postType = platformCfg.publishedPostType as string | undefined;
        viewUrl =
          (platformCfg.viewUrl as string) ||
          (postType === 'video' || postType === 'reel'
            ? `https://www.facebook.com/reel/${postId}`
            : postId.includes('_')
              ? `https://www.facebook.com/${postId}`
              : `https://www.facebook.com/${pageId}/posts/${postId}`);
      } else if (externalIds.externalCampaignId) {
        viewUrl = `https://business.facebook.com/adsmanager/manage/campaigns?act=${(await getMetaCreds()).adAccountId.replace(/^act_/, '')}&selected_campaign_ids=${externalIds.externalCampaignId}`;
      }
    }

    const humanMessage =
      publishMode === 'ORGANIC'
        ? `Organic post is live on your Meta Page. Status is ACTIVE in Kaboo Homes. Check Facebook Page / Meta Business Suite for the post${postId ? ` (ID ${postId})` : ''}. Leads stay at 0 until someone enquires.`
        : `Paid campaign created on ${campaign.platform} and marked ACTIVE here. Review/activate delivery in the platform ads manager. Leads appear under Admin → Leads when people respond.`;

    res.json({
      success: true,
      message: humanMessage,
      publish: {
        mode:     publishMode,
        platform: campaign.platform,
        status:   'ACTIVE',
        postId:   postId || null,
        campaignId: externalIds.externalCampaignId ?? null,
        viewUrl,
        publishedAt: (platformCfg.publishedAt as string) || new Date().toISOString(),
      },
      campaign: normalizeCampaign(updated),
    });
  } catch (err) {
    // Surface Meta/Google/TikTok API errors as 400 so the frontend can show the real message
    if (err instanceof Error && (
      err.message.startsWith('Meta API error') ||
      err.message.startsWith('Google API error') ||
      err.message.startsWith('TikTok API error') ||
      err.message.includes('not configured') ||
      err.message.includes('access token') ||
      err.message.includes('page ID') ||
      err.message.includes('Page ID') ||
      err.message.includes('Page access token') ||
      err.message.includes('publish_video') ||
      err.message.includes('pages_manage_posts')
    )) {
      res.status(400).json({ error: err.message, code: 'PLATFORM_API_ERROR' });
      return;
    }
    sendServerError(res, err, { fn: 'publishCampaign' });
  }
};

/**
 * Finish a pending Instagram container, or retry a fresh IG publish when
 * the campaign is already live on Facebook but Instagram failed / was skipped.
 */
export const finalizeInstagramPublish = async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { assets: true, leads: { select: { id: true } } },
    });
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const platformCfg = parseSafeJson<Record<string, unknown>>(campaign.platformConfig, {});
    const ig = (platformCfg.instagram || {}) as {
      status?: string;
      containerId?: string;
      igUserId?: string;
      username?: string;
      mediaId?: string;
      viewUrl?: string;
      error?: string;
      updatedAt?: string;
    };

    const metaCreds = await getMetaCreds();
    if (!metaCreds.accessToken || !metaCreds.pageId) {
      res.status(400).json({ error: 'Meta credentials incomplete.', code: 'META_NOT_CONFIGURED' });
      return;
    }

    setMetaRuntimeCreds(metaCreds);
    const { pageToken } = await metaService.resolvePageAccessToken(metaCreds.pageId);

    // Always use the Page’s *currently* linked Instagram — not the old campaign snapshot
    const linkedNow = await metaService.resolveLinkedInstagramAccount(metaCreds.pageId, pageToken);
    const currentIgUserId = linkedNow?.id || metaCreds.instagramUserId;
    const currentIgUsername = linkedNow?.username || metaCreds.instagramUsername;

    const bodyForce = (req.body as { force?: boolean } | undefined)?.force === true;
    const accountChanged =
      Boolean(ig.igUserId && currentIgUserId && ig.igUserId !== currentIgUserId);

    // Already published on the *same* linked account → nothing to do
    if (ig.status === 'published' && ig.mediaId && !bodyForce && !accountChanged) {
      clearMetaRuntimeCreds();
      res.json({
        success: true,
        message: `Already live on Instagram${ig.username ? ` (@${ig.username})` : ''}.`,
        instagram: ig,
        campaign: normalizeCampaign(campaign),
        linkedInstagram: currentIgUsername
          ? { id: currentIgUserId, username: currentIgUsername }
          : undefined,
      });
      return;
    }

    let result: Awaited<ReturnType<typeof metaService.finalizeInstagramContainer>>;

    const forceNew =
      bodyForce ||
      accountChanged ||
      (ig.status === 'pending' &&
        (!ig.updatedAt ||
          Date.now() - new Date(String(ig.updatedAt)).getTime() > 90_000));

    // Pending container — only if it belongs to the current IG account
    if (
      ig.status === 'pending' &&
      ig.containerId &&
      ig.igUserId &&
      !forceNew &&
      (!currentIgUserId || ig.igUserId === currentIgUserId)
    ) {
      result = await metaService.finalizeInstagramContainer({
        igUserId: ig.igUserId,
        containerId: ig.containerId,
        pageToken,
        username: ig.username || currentIgUsername,
        maxWaitMs: 20_000,
      });
    } else {
      const firstAsset = campaign.assets[0];
      const mediaUrl = firstAsset?.url;
      if (!mediaUrl) {
        clearMetaRuntimeCreds();
        res.status(400).json({
          error: 'Campaign has no media asset to post to Instagram.',
          code: 'IG_NO_MEDIA',
        });
        return;
      }

      if (!currentIgUserId) {
        clearMetaRuntimeCreds();
        res.status(400).json({
          error:
            'No Instagram Business account linked to this Facebook Page. Link the new account in Meta Business Suite, then re-test Meta in Integrations.',
          code: 'IG_NOT_LINKED',
        });
        return;
      }

      const mediaType = (firstAsset?.format?.toLowerCase() as 'photo' | 'video' | 'reel' | undefined)
        ?? (firstAsset?.assetType === 'VIDEO' ? 'video' : 'photo');
      const caption =
        [campaign.headline, campaign.primaryText].filter(Boolean).join('\n\n') || campaign.title;

      result = await metaService.createInstagramOrganicPost({
        igUserId: currentIgUserId,
        pageToken,
        caption,
        mediaUrl,
        mediaType,
        username: currentIgUsername,
        maxWaitMs: 8_000,
        preferResumable: false,
      });
    }

    clearMetaRuntimeCreds();

    const prevUsername = ig.username;
    platformCfg.instagram = {
      status: result.status,
      mediaId: result.mediaId,
      containerId: result.containerId,
      igUserId: result.igUserId ?? currentIgUserId,
      username: result.username ?? currentIgUsername,
      viewUrl: result.viewUrl,
      error: result.status === 'pending' ? undefined : result.error,
      updatedAt: new Date().toISOString(),
      ...(accountChanged && prevUsername
        ? { previousUsername: prevUsername }
        : {}),
    };
    platformCfg.postToInstagram = true;

    const updated = await prisma.campaign.update({
      where: { id: campaign.id },
      data: { platformConfig: serializeJson(platformCfg) },
      include: { assets: true, leads: { select: { id: true } } },
    });

    res.json({
      success: result.status !== 'failed',
      message:
        result.status === 'published'
          ? `Instagram post is live${result.username ? ` (@${result.username})` : ''}${
              accountChanged && prevUsername ? ` (was @${prevUsername})` : ''
            }.`
          : result.status === 'pending'
            ? `Meta is encoding your Reel for @${currentIgUsername || 'Instagram'}. Keep waiting — tap again if this takes over a minute.`
            : result.error || 'Instagram publish failed.',
      instagram: platformCfg.instagram,
      linkedInstagram: currentIgUsername
        ? { id: currentIgUserId, username: currentIgUsername }
        : undefined,
      campaign: normalizeCampaign(updated),
    });
  } catch (err) {
    clearMetaRuntimeCreds();
    if (err instanceof Error && err.message.startsWith('Meta API error')) {
      res.status(400).json({ error: err.message, code: 'PLATFORM_API_ERROR' });
      return;
    }
    sendServerError(res, err, { fn: 'finalizeInstagramPublish' });
  }
};
