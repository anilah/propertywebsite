import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendServerError } from '../utils/serverError.js';
import { metaService } from '../services/platforms/meta.js';
import { verifyTikTokWebhook } from '../services/platforms/tiktok.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseSafeJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

// ─── GET /api/admin/campaigns/:id/leads ──────────────────────────────────────

export const getCampaignLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', pageSize = '50', status } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const where: Record<string, unknown> = { campaignId: req.params.id };
    if (status) where.status = status;

    const [leads, total] = await Promise.all([
      prisma.campaignLead.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.campaignLead.count({ where }),
    ]);

    res.json({
      leads: leads.map((l) => ({ ...l, extraFields: parseSafeJson(l.extraFields, null) })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    sendServerError(res, err, { fn: 'getCampaignLeads' });
  }
};

// ─── GET /api/admin/leads — all leads across all campaigns ───────────────────

export const getAllLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', pageSize = '50', status, platform } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const where: Record<string, unknown> = {};
    if (status)   where.status   = status;
    if (platform) where.platform = platform;

    const [leads, total] = await Promise.all([
      prisma.campaignLead.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { campaign: { select: { id: true, title: true, platform: true } } },
      }),
      prisma.campaignLead.count({ where }),
    ]);

    res.json({
      leads: leads.map((l) => ({ ...l, extraFields: parseSafeJson(l.extraFields, null) })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    sendServerError(res, err, { fn: 'getAllLeads' });
  }
};

// ─── PATCH /api/admin/leads/:id — update lead status / notes ─────────────────

export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const { status, notes } = req.body;
    const lead = await prisma.campaignLead.update({
      where: { id: req.params.id },
      data: {
        ...(status !== undefined && { status }),
        ...(notes  !== undefined && { notes }),
      },
    });
    res.json({ ...lead, extraFields: parseSafeJson(lead.extraFields, null) });
  } catch (err) {
    sendServerError(res, err, { fn: 'updateLead' });
  }
};

// ─── POST /api/admin/leads — manual lead entry ───────────────────────────────

export const createManualLead = async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId, listingId, fullName, email, phone, message, notes } = req.body;
    if (!campaignId) {
      res.status(400).json({ error: 'campaignId is required' });
      return;
    }
    const lead = await prisma.campaignLead.create({
      data: {
        campaignId,
        platform: 'MANUAL',
        listingId: listingId ?? null,
        fullName:  fullName  ?? null,
        email:     email     ?? null,
        phone:     phone     ?? null,
        message:   message   ?? null,
        notes:     notes     ?? null,
        status:    'NEW',
      },
    });
    res.status(201).json(lead);
  } catch (err) {
    sendServerError(res, err, { fn: 'createManualLead' });
  }
};

// ─── DELETE /api/admin/leads/:id ─────────────────────────────────────────────

export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.campaignLead.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    sendServerError(res, err, { fn: 'deleteLead' });
  }
};

// ─── POST /api/admin/campaigns/:id/sync-leads ────────────────────────────────
// Manually pull fresh leads from the platform (for Meta lead forms)

export const syncCampaignLeads = async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const platformCfg = (typeof campaign.platformConfig === 'string'
      ? JSON.parse(campaign.platformConfig || '{}')
      : campaign.platformConfig || {}) as { campaignMode?: string };

    // Organic Page posts store a post/video ID in externalAdId — not a Lead Form ID.
    // Calling Meta's /{id}/leads on a post ID fails and used to surface as "Internal server error".
    if (platformCfg.campaignMode === 'ORGANIC' || (campaign.platform === 'META' && campaign.externalAdId && !campaign.externalCampaignId)) {
      res.status(400).json({
        error:
          'This is an organic Facebook Page post, not a Meta Lead Ad. There is no lead form to sync. Enquiries appear when buyers contact you from the listing.',
        code: 'ORGANIC_NO_LEAD_FORM',
      });
      return;
    }

    let synced = 0;

    if (campaign.platform === 'META' && campaign.externalAdId) {
      // externalAdId on paid Meta campaigns may store creative / lead form ID
      const leadFormId = campaign.externalAdId;
      const result = await metaService.fetchLeads(leadFormId);

      for (const rawLead of result.leads) {
        const fields: Record<string, string> = {};
        for (const f of rawLead.field_data) {
          fields[f.name] = f.values[0] ?? '';
        }
        await prisma.campaignLead.upsert({
          where: { id: rawLead.id },
          update: {},
          create: {
            id:         rawLead.id,
            campaignId: campaign.id,
            platform:   'META',
            fullName:   fields['full_name'] ?? fields['name'] ?? null,
            email:      fields['email']     ?? null,
            phone:      fields['phone_number'] ?? null,
            extraFields: JSON.stringify(fields),
            rawPayload:  JSON.stringify(rawLead),
            status:     'NEW',
          },
        });
        synced++;
      }
    }

    res.json({ success: true, synced });
  } catch (err) {
    sendServerError(res, err, { fn: 'syncCampaignLeads' });
  }
};

// ─── WEBHOOK HANDLERS (public — no auth) ─────────────────────────────────────

/**
 * GET  /api/webhooks/meta/leads  — Verification challenge
 * POST /api/webhooks/meta/leads  — Lead notification
 *
 * Configure in Meta App Dashboard → Webhooks → leadgen event
 * Callback URL: https://your-api/api/webhooks/meta/leads
 */
export const metaLeadWebhookVerify = (req: Request, res: Response) => {
  const mode      = req.query['hub.mode']       as string;
  const token     = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge']  as string;

  const result = metaService.verifyWebhook(mode, token, challenge);
  if (result !== null) {
    res.status(200).send(result);
  } else {
    res.status(403).json({ error: 'Verification failed' });
  }
};

export const metaLeadWebhookReceive = async (req: Request, res: Response) => {
  try {
    // Always respond 200 quickly to Meta — process async
    res.status(200).json({ success: true });

    const body = req.body as {
      entry?: {
        changes?: {
          field: string;
          value?: {
            leadgen_id?: string;
            form_id?: string;
            ad_id?: string;
            campaign_id?: string;
            page_id?: string;
            created_time?: number;
          };
        }[];
      }[];
    };

    for (const entry of body?.entry ?? []) {
      for (const change of entry?.changes ?? []) {
        if (change.field !== 'leadgen') continue;
        const v = change.value;
        if (!v?.leadgen_id) continue;

        // Find the campaign by external campaign ID or form ID
        const campaign = await prisma.campaign.findFirst({
          where: {
            OR: [
              { externalCampaignId: v.campaign_id },
              { externalAdId: v.form_id },
            ],
          },
        });
        if (!campaign) continue;

        // Fetch the actual lead data from Meta
        const leadData = await metaService.fetchLeads(v.leadgen_id);
        for (const rawLead of leadData.leads) {
          const fields: Record<string, string> = {};
          for (const f of rawLead.field_data) {
            fields[f.name] = f.values[0] ?? '';
          }
          await prisma.campaignLead.upsert({
            where: { id: rawLead.id },
            update: {},
            create: {
              id:          rawLead.id,
              campaignId:  campaign.id,
              platform:    'META',
              leadFormId:  v.form_id,
              fullName:    fields['full_name'] ?? null,
              email:       fields['email']     ?? null,
              phone:       fields['phone_number'] ?? null,
              extraFields: JSON.stringify(fields),
              rawPayload:  JSON.stringify(rawLead),
              status:      'NEW',
            },
          });
        }
      }
    }
  } catch (err) {
    console.error('[metaLeadWebhook] error:', err);
  }
};

/**
 * POST /api/webhooks/google/leads
 * Google Ads Lead Form webhook integration
 */
export const googleLeadWebhook = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ success: true });

    const body = req.body as {
      google_key?: string;
      lead?: {
        id?: string;
        campaign_id?: string;
        user_column_data?: { column_id: string; string_value?: string }[];
      };
    };

    if (!body.lead) return;

    const campaign = await prisma.campaign.findFirst({
      where: { externalCampaignId: body.lead.campaign_id },
    });
    if (!campaign) return;

    const fields: Record<string, string> = {};
    for (const col of body.lead.user_column_data ?? []) {
      if (col.string_value) fields[col.column_id] = col.string_value;
    }

    await prisma.campaignLead.upsert({
      where: { id: body.lead.id ?? `google-${Date.now()}` },
      update: {},
      create: {
        id:          body.lead.id ?? `google-${Date.now()}`,
        campaignId:  campaign.id,
        platform:    'GOOGLE',
        fullName:    fields['FULL_NAME']   ?? null,
        email:       fields['EMAIL']       ?? null,
        phone:       fields['PHONE_NUMBER'] ?? null,
        extraFields: JSON.stringify(fields),
        rawPayload:  JSON.stringify(body),
        status:      'NEW',
      },
    });
  } catch (err) {
    console.error('[googleLeadWebhook] error:', err);
  }
};

/**
 * POST /api/webhooks/tiktok/leads
 * TikTok Lead Generation webhook
 */
export const tiktokLeadWebhook = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ success: true });

    const signature = (req.headers['x-tiktok-signature'] ?? '') as string;
    const rawBody   = JSON.stringify(req.body);
    if (!verifyTikTokWebhook(signature, rawBody)) {
      console.warn('[tiktokLeadWebhook] signature mismatch');
      return;
    }

    const body = req.body as {
      advertiser_id?: string;
      form_id?: string;
      lead_id?: string;
      campaign_id?: string;
      answers?: { question_id: string; answer: string }[];
    };

    const campaign = await prisma.campaign.findFirst({
      where: { externalCampaignId: body.campaign_id },
    });
    if (!campaign) return;

    const fields: Record<string, string> = {};
    for (const a of body.answers ?? []) {
      fields[a.question_id] = a.answer;
    }

    await prisma.campaignLead.upsert({
      where: { id: body.lead_id ?? `tiktok-${Date.now()}` },
      update: {},
      create: {
        id:          body.lead_id ?? `tiktok-${Date.now()}`,
        campaignId:  campaign.id,
        platform:    'TIKTOK',
        leadFormId:  body.form_id,
        fullName:    fields['FULL_NAME']  ?? null,
        email:       fields['EMAIL']      ?? null,
        phone:       fields['PHONE']      ?? null,
        extraFields: JSON.stringify(fields),
        rawPayload:  JSON.stringify(body),
        status:      'NEW',
      },
    });
  } catch (err) {
    console.error('[tiktokLeadWebhook] error:', err);
  }
};
