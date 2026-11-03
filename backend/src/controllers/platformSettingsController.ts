/**
 * Platform Integration Settings
 *
 * Credentials are AES-256-GCM encrypted before storage.
 * Set SETTINGS_ENCRYPTION_KEY (32-byte hex, e.g. openssl rand -hex 32) in Lambda env.
 * Falls back to a dev-only key when not set (never use in production).
 */
import crypto from 'node:crypto';
import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendServerError } from '../utils/serverError.js';

// ─── Encryption helpers ───────────────────────────────────────────────────────

const DEV_KEY = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // 64 hex = 32 bytes

function encryptionKey(): Buffer {
  const hex = process.env.SETTINGS_ENCRYPTION_KEY ?? DEV_KEY;
  return Buffer.from(hex, 'hex');
}

function encrypt(plaintext: string): string {
  const iv  = crypto.randomBytes(12);
  const key = encryptionKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('hex'), enc.toString('hex'), tag.toString('hex')].join(':');
}

function decrypt(ciphertext: string): string {
  const [ivHex, encHex, tagHex] = ciphertext.split(':');
  if (!ivHex || !encHex || !tagHex) throw new Error('Invalid ciphertext format');
  const key    = encryptionKey();
  const iv     = Buffer.from(ivHex, 'hex');
  const enc    = Buffer.from(encHex, 'hex');
  const tag    = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc).toString('utf8') + decipher.final('utf8');
}

/** Mask secrets — show only last 4 chars */
function maskSecret(val: string | undefined): string {
  if (!val) return '';
  if (val.length <= 4) return '****';
  return '••••••••' + val.slice(-4);
}

type PlatformKey = 'META' | 'GOOGLE' | 'TIKTOK';

/** Config shape per platform — full (internal) vs masked (API response) */
interface MetaConfig {
  appId?: string;
  appSecret?: string;
  accessToken?: string;
  adAccountId?: string;
  pageId?: string;
  pixelId?: string;
  leadWebhookToken?: string;
  /** Linked Instagram Business account (auto-filled on Test when Page is connected). */
  instagramUserId?: string;
  instagramUsername?: string;
}

interface GoogleConfig {
  developerToken?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  customerId?: string;
}

interface TikTokConfig {
  accessToken?: string;
  advertiserId?: string;
  appId?: string;
  leadWebhookToken?: string;
}

type PlatformConfig = MetaConfig | GoogleConfig | TikTokConfig;

const SECRET_FIELDS: Record<PlatformKey, string[]> = {
  META:   ['appSecret', 'accessToken', 'leadWebhookToken'],
  GOOGLE: ['developerToken', 'clientSecret', 'refreshToken'],
  TIKTOK: ['accessToken', 'leadWebhookToken'],
};

function maskConfig(platform: PlatformKey, config: Record<string, string>): Record<string, string> {
  const secrets = SECRET_FIELDS[platform] ?? [];
  const masked: Record<string, string> = {};
  for (const [k, v] of Object.entries(config)) {
    masked[k] = secrets.includes(k) ? maskSecret(v) : (v ?? '');
  }
  return masked;
}

// ─── GET /api/admin/integrations ─────────────────────────────────────────────

export const getIntegrations = async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.platformSetting.findMany({ orderBy: { platform: 'asc' } });

    const result = (['META', 'GOOGLE', 'TIKTOK'] as PlatformKey[]).map((platform) => {
      const row = rows.find((r) => r.platform === platform);
      let masked: Record<string, string> = {};
      if (row?.config) {
        try {
          const plain = decrypt(row.config);
          const cfg   = JSON.parse(plain) as Record<string, string>;
          masked = maskConfig(platform, cfg);
        } catch {
          masked = {};
        }
      }
      return {
        platform,
        isActive:     row?.isActive     ?? false,
        lastTestedAt: row?.lastTestedAt ?? null,
        lastTestOk:   row?.lastTestOk   ?? null,
        lastTestMsg:  row?.lastTestMsg  ?? null,
        config:       masked,
        webhookUrls:  webhookUrlsFor(platform),
      };
    });

    res.json(result);
  } catch (err) {
    sendServerError(res, err, { fn: 'getIntegrations' });
  }
};

// ─── PUT /api/admin/integrations/:platform ────────────────────────────────────

export const saveIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const platform = req.params.platform.toUpperCase() as PlatformKey;
    if (!['META', 'GOOGLE', 'TIKTOK'].includes(platform)) {
      res.status(400).json({ error: 'Unknown platform' });
      return;
    }

    const incoming = req.body as Record<string, string>;

    // Merge with existing (so masked "••••••••xxxx" values are preserved from DB)
    let existing: Record<string, string> = {};
    const row = await prisma.platformSetting.findUnique({ where: { platform } });
    if (row?.config) {
      try { existing = JSON.parse(decrypt(row.config)) as Record<string, string>; } catch { /* */ }
    }

    const secrets = SECRET_FIELDS[platform] ?? [];
    const merged: Record<string, string> = { ...existing };
    for (const [k, v] of Object.entries(incoming)) {
      // Only overwrite a secret field if the incoming value is not a masked placeholder
      if (secrets.includes(k) && v.startsWith('••••')) continue;
      merged[k] = v;
    }

    const encrypted = encrypt(JSON.stringify(merged));

    const updated = await prisma.platformSetting.upsert({
      where:  { platform },
      create: { platform, config: encrypted, isActive: false },
      update: { config: encrypted, updatedAt: new Date() },
    });

    res.json({
      platform,
      isActive:    updated.isActive,
      lastTestedAt: updated.lastTestedAt,
      lastTestOk:  updated.lastTestOk,
      config:      maskConfig(platform, merged),
      webhookUrls: webhookUrlsFor(platform),
    });
  } catch (err) {
    sendServerError(res, err, { fn: 'saveIntegration' });
  }
};

// ─── POST /api/admin/integrations/:platform/test ─────────────────────────────

export const testIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const platform = req.params.platform.toUpperCase() as PlatformKey;
    const row = await prisma.platformSetting.findUnique({ where: { platform } });

    if (!row?.config) {
      res.status(400).json({ ok: false, message: 'No credentials saved yet.' });
      return;
    }

    let cfg: Record<string, string> = {};
    try { cfg = JSON.parse(decrypt(row.config)) as Record<string, string>; }
    catch { res.status(500).json({ ok: false, message: 'Failed to decrypt credentials.' }); return; }

    let ok = false;
    let message = '';
    let discovered: { instagramUserId?: string; instagramUsername?: string } | undefined;

    if (platform === 'META') {
      const result = await testMeta(cfg as MetaConfig);
      ok = result.ok; message = result.message; discovered = result.discovered;
    } else if (platform === 'GOOGLE') {
      const result = await testGoogle(cfg as GoogleConfig);
      ok = result.ok; message = result.message;
    } else if (platform === 'TIKTOK') {
      const result = await testTikTok(cfg as TikTokConfig);
      ok = result.ok; message = result.message;
    }

    // Persist Instagram account discovered during Meta test
    let encryptedUpdate: string | undefined;
    if (ok && platform === 'META' && discovered?.instagramUserId) {
      cfg.instagramUserId = discovered.instagramUserId;
      if (discovered.instagramUsername) cfg.instagramUsername = discovered.instagramUsername;
      encryptedUpdate = encrypt(JSON.stringify(cfg));
    }

    await prisma.platformSetting.update({
      where: { platform },
      data:  {
        lastTestedAt: new Date(),
        lastTestOk:   ok,
        lastTestMsg:  message,
        isActive:     ok,
        updatedAt:    new Date(),
        ...(encryptedUpdate ? { config: encryptedUpdate } : {}),
      },
    });

    res.json({
      ok,
      message,
      ...(discovered ? { discovered } : {}),
      config: maskConfig(platform, cfg),
    });
  } catch (err) {
    sendServerError(res, err, { fn: 'testIntegration' });
  }
};

// ─── DELETE /api/admin/integrations/:platform ─────────────────────────────────

export const deleteIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const platform = req.params.platform.toUpperCase();
    await prisma.platformSetting.deleteMany({ where: { platform } });
    res.json({ success: true });
  } catch (err) {
    sendServerError(res, err, { fn: 'deleteIntegration' });
  }
};

// ─── Platform test helpers ────────────────────────────────────────────────────

async function testMeta(cfg: MetaConfig): Promise<{
  ok: boolean;
  message: string;
  discovered?: { instagramUserId?: string; instagramUsername?: string };
}> {
  if (!cfg.accessToken || !cfg.adAccountId) {
    return { ok: false, message: 'Access Token and Ad Account ID are required.' };
  }
  try {
    // 1. Verify Ad Account
    const accountId = cfg.adAccountId.startsWith('act_') ? cfg.adAccountId : `act_${cfg.adAccountId}`;
    const acctUrl = `https://graph.facebook.com/v21.0/${accountId}?fields=name,currency,account_status&access_token=${encodeURIComponent(cfg.accessToken)}`;
    const acctRes = await fetch(acctUrl);
    const acctBody = await acctRes.json() as Record<string, unknown>;
    if (acctBody.error) {
      const err = acctBody.error as Record<string, unknown>;
      return { ok: false, message: `Ad Account error: ${err.message ?? 'Unknown error'}` };
    }
    const acctName = acctBody.name as string;
    const acctCurrency = acctBody.currency as string;

    // 2. Verify Page + resolve Page access token (required for organic video/photo posts)
    if (!cfg.pageId) {
      return {
        ok: true,
        message: `Connected ✓  Ad Account: "${acctName}" (${acctCurrency}) — ⚠ No Page ID set (required for organic posts)`,
      };
    }

    let pageBody: Record<string, unknown> = {};
    {
      const pageUrl = `https://graph.facebook.com/v21.0/${cfg.pageId}?fields=name,id,access_token&access_token=${encodeURIComponent(cfg.accessToken)}`;
      const pageRes = await fetch(pageUrl);
      pageBody = await pageRes.json() as Record<string, unknown>;
      if (pageBody.error) {
        const err = pageBody.error as Record<string, unknown>;
        // Retry without access_token field (some tokens can read the page but not mint a page token this way)
        const retryUrl = `https://graph.facebook.com/v21.0/${cfg.pageId}?fields=name,id&access_token=${encodeURIComponent(cfg.accessToken)}`;
        const retryRes = await fetch(retryUrl);
        const retryBody = await retryRes.json() as Record<string, unknown>;
        if (retryBody.error) {
          const retryErr = retryBody.error as Record<string, unknown>;
          return {
            ok: false,
            message: `Ad Account connected ✓, but Page ID "${cfg.pageId}" failed: ${retryErr.message ?? err.message ?? 'not found or no permission'}. Check Page ID and that the System User is assigned to the Page.`,
          };
        }
        pageBody = retryBody;
      }
    }

    const pageName = (pageBody.name as string) || cfg.pageId;
    let pageToken = pageBody.access_token as string | undefined;
    let tasks: string[] = [];

    if (!pageToken) {
      const acctsUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,tasks&limit=100&access_token=${encodeURIComponent(cfg.accessToken)}`;
      const acctsRes = await fetch(acctsUrl);
      const acctsBody = await acctsRes.json() as {
        data?: { id: string; name?: string; access_token?: string; tasks?: string[] }[];
        error?: { message?: string };
      };
      if (acctsBody.error) {
        // System users often cannot use /me/accounts — try assigned pages via business edge is harder;
        // fall through with a clear message only if we still have no page token
        if (!pageToken) {
          return {
            ok: false,
            message: `Page "${pageName}" is readable, but could not get a Page access token (${acctsBody.error.message}). Generate a System User token with pages_manage_posts + publish_video after assigning the Page, then re-test.`,
          };
        }
      } else {
        const match = (acctsBody.data ?? []).find((p) => p.id === cfg.pageId);
        pageToken = match?.access_token ?? pageToken;
        tasks = match?.tasks ?? tasks;
      }
    }

    if (!pageToken) {
      return {
        ok: false,
        message: `Page "${pageName}" is readable, but no Page access token was returned. Organic posts (especially video/reels) will fail. In Business Manager → System Users → Assign Assets → add Page "${pageName}" with Create content / Full control, then generate a new token including pages_manage_posts, publish_video, pages_read_engagement, pages_show_list.`,
      };
    }

    const taskList = tasks.map((t) => t.toUpperCase());
    const canCreate =
      taskList.length === 0 || // some tokens omit tasks; don't fail solely on that
      taskList.some((t) =>
        ['CREATE_CONTENT', 'MANAGE', 'MODERATE', 'ADVERTISE'].includes(t)
      );

    if (taskList.length > 0 && !canCreate) {
      return {
        ok: false,
        message: `Page token obtained for "${pageName}", but Page tasks are [${tasks.join(', ')}] — missing CREATE_CONTENT. Organic video publish will fail with (#100) No permission. Re-assign the System User to the Page with Create content.`,
      };
    }

    // 3. Debug token scopes — Full control on the Page ≠ publish_video on the token
    let scopeHint = '';
    const appId = cfg.appId || process.env.META_APP_ID || '';
    const appSecret = cfg.appSecret || process.env.META_APP_SECRET || '';
    if (appId && appSecret) {
      const appTok = `${appId}|${appSecret}`;
      const dbgUrl =
        `https://graph.facebook.com/v21.0/debug_token?input_token=${encodeURIComponent(cfg.accessToken)}` +
        `&access_token=${encodeURIComponent(appTok)}`;
      const dbgRes = await fetch(dbgUrl);
      const dbgBody = await dbgRes.json() as {
        data?: { is_valid?: boolean; scopes?: string[]; type?: string; granular_scopes?: { scope: string }[] };
        error?: { message?: string };
      };
      if (dbgBody.data) {
        const scopes = [
          ...(dbgBody.data.scopes ?? []),
          ...(dbgBody.data.granular_scopes ?? []).map((g) => g.scope),
        ];
        const unique = [...new Set(scopes)];
        const required = ['publish_video', 'pages_manage_posts'];
        const missing = required.filter((s) => !unique.includes(s));
        if (missing.length) {
          return {
            ok: false,
            message:
              `Page Full control is fine, but this System User token is missing scopes: ${missing.join(', ')}. ` +
              `Asset rights ≠ token scopes. Business Manager → System Users → Generate New Token → tick ` +
              `publish_video + pages_manage_posts (+ pages_show_list, pages_read_engagement) → paste the new token here. ` +
              `Current scopes: ${unique.length ? unique.join(', ') : '(none listed)'} · type: ${dbgBody.data.type ?? 'unknown'}`,
          };
        }
        scopeHint = ` · scopes OK (${required.join(', ')})`;
      } else if (dbgBody.error) {
        scopeHint = ` · (scope check skipped: ${dbgBody.error.message})`;
      }
    } else {
      scopeHint = ' · (add App ID + App Secret to verify publish_video scope)';
    }

    const taskHint = tasks.length ? ` · tasks: ${tasks.join(', ')}` : '';

    // 4. Detect linked Instagram Business account (for organic FB+IG co-post)
    let igHint = '';
    try {
      const igUrl =
        `https://graph.facebook.com/v21.0/${cfg.pageId}?fields=instagram_business_account{id,username}` +
        `&access_token=${encodeURIComponent(pageToken)}`;
      const igRes = await fetch(igUrl);
      const igBody = await igRes.json() as {
        instagram_business_account?: { id: string; username?: string };
        error?: { message?: string };
      };
      if (igBody.instagram_business_account?.id) {
        const ig = igBody.instagram_business_account;
        cfg.instagramUserId = ig.id;
        cfg.instagramUsername = ig.username || '';
        igHint = ` · Instagram: @${ig.username || ig.id}`;
      } else {
        igHint =
          ' · ⚠ No Instagram Business account linked to this Page — organic posts stay Facebook-only. Link IG in Meta Business Suite → Settings → Linked accounts.';
      }
    } catch {
      igHint = ' · (Instagram link check skipped)';
    }

    // Soft-check IG publish scopes (don't fail Facebook-only setups)
    let igScopeHint = '';
    if (appId && appSecret && cfg.instagramUserId) {
      try {
        const appTok = `${appId}|${appSecret}`;
        const dbgUrl =
          `https://graph.facebook.com/v21.0/debug_token?input_token=${encodeURIComponent(cfg.accessToken)}` +
          `&access_token=${encodeURIComponent(appTok)}`;
        const dbgRes = await fetch(dbgUrl);
        const dbgBody = await dbgRes.json() as {
          data?: { scopes?: string[]; granular_scopes?: { scope: string }[] };
        };
        if (dbgBody.data) {
          const scopes = [
            ...(dbgBody.data.scopes ?? []),
            ...(dbgBody.data.granular_scopes ?? []).map((g) => g.scope),
          ];
          const hasIg =
            scopes.includes('instagram_content_publish') ||
            scopes.includes('instagram_basic') ||
            scopes.includes('instagram_business_content_publish');
          if (!hasIg) {
            igScopeHint =
              ' · ⚠ Token missing Instagram publish scopes — regenerate with instagram_basic + instagram_content_publish to post Reels to IG.';
          }
        }
      } catch { /* ignore */ }
    }

    return {
      ok: true,
      message: `Connected ✓  Ad Account: "${acctName}" (${acctCurrency}) · Page: "${pageName}" · Page token OK${scopeHint}${taskHint}${igHint}${igScopeHint}`,
      // Persist discovered IG ids back through test handler if supported
      discovered: cfg.instagramUserId
        ? { instagramUserId: cfg.instagramUserId, instagramUsername: cfg.instagramUsername }
        : undefined,
    };
  } catch (e) {
    return { ok: false, message: `Network error: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function testGoogle(cfg: GoogleConfig): Promise<{ ok: boolean; message: string }> {
  if (!cfg.clientId || !cfg.clientSecret || !cfg.refreshToken) {
    return { ok: false, message: 'Client ID, Client Secret and Refresh Token are required.' };
  }
  try {
    // Step 1: get a fresh access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'refresh_token',
        client_id:     cfg.clientId,
        client_secret: cfg.clientSecret,
        refresh_token: cfg.refreshToken,
      }),
    });
    const tokenBody = await tokenRes.json() as Record<string, unknown>;
    if (!tokenRes.ok || !tokenBody.access_token) {
      return { ok: false, message: `Google OAuth error: ${tokenBody.error_description ?? tokenBody.error ?? 'Token exchange failed'}` };
    }

    if (!cfg.customerId) {
      return { ok: true, message: 'OAuth credentials valid ✓  (Set Customer ID to verify Ad Account access)' };
    }

    // Step 2: verify customer access
    const custId = (cfg.customerId as string).replace(/-/g, '');
    const adsRes = await fetch(
      `https://googleads.googleapis.com/v17/customers/${custId}`,
      {
        headers: {
          Authorization:    `Bearer ${tokenBody.access_token}`,
          'developer-token': cfg.developerToken ?? '',
        },
      }
    );
    const adsBody = await adsRes.json() as Record<string, unknown>;
    if (!adsRes.ok) {
      return { ok: false, message: `Google Ads API error: ${JSON.stringify((adsBody as Record<string,unknown[]>).error ?? adsBody)}` };
    }
    const desc = (adsBody as Record<string, Record<string,unknown>>).resourceName ?? custId;
    return { ok: true, message: `Connected ✓  Google Ads Customer: ${desc}` };
  } catch (e) {
    return { ok: false, message: `Network error: ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function testTikTok(cfg: TikTokConfig): Promise<{ ok: boolean; message: string }> {
  if (!cfg.accessToken || !cfg.advertiserId) {
    return { ok: false, message: 'Access Token and Advertiser ID are required.' };
  }
  try {
    const url = `https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?advertiser_ids=["${cfg.advertiserId}"]`;
    const res = await fetch(url, {
      headers: { 'Access-Token': cfg.accessToken, 'Content-Type': 'application/json' },
    });
    const body = await res.json() as { code: number; message: string; data?: { list?: { advertiser_name?: string }[] } };
    if (body.code !== 0) {
      return { ok: false, message: `TikTok API error ${body.code}: ${body.message}` };
    }
    const name = body.data?.list?.[0]?.advertiser_name ?? cfg.advertiserId;
    return { ok: true, message: `Connected ✓  TikTok Advertiser: "${name}"` };
  } catch (e) {
    return { ok: false, message: `Network error: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ─── Webhook URL helper ───────────────────────────────────────────────────────

function webhookUrlsFor(platform: PlatformKey): Record<string, string> {
  const base = process.env.API_PUBLIC_URL
    ?? process.env.SERVER_PUBLIC_URL
    ?? 'https://your-api-domain.com';

  const map: Record<PlatformKey, Record<string, string>> = {
    META: {
      'Webhook URL':    `${base}/api/webhooks/meta`,
      'Verify Method':  'GET (hub.verify_token = META_LEAD_WEBHOOK_TOKEN)',
      'Events':         'leadgen',
    },
    GOOGLE: {
      'Webhook URL':    `${base}/api/webhooks/google`,
      'Method':         'POST',
    },
    TIKTOK: {
      'Webhook URL':    `${base}/api/webhooks/tiktok`,
      'Method':         'POST (HMAC-SHA256 signature)',
    },
  };
  return map[platform] ?? {};
}
