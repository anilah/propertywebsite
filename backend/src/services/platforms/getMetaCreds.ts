/**
 * Resolve Meta credentials: DB PlatformSetting (encrypted) → env var fallback.
 * Used by campaignsController at publish time.
 */
import crypto from 'node:crypto';
import prisma from '../../config/database.js';

function decryptionKey(): Buffer {
  const DEV_KEY = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  return Buffer.from(process.env.SETTINGS_ENCRYPTION_KEY ?? DEV_KEY, 'hex');
}

function decrypt(ciphertext: string): string {
  const [ivHex, encHex, tagHex] = ciphertext.split(':');
  if (!ivHex || !encHex || !tagHex) throw new Error('Invalid ciphertext');
  const key    = decryptionKey();
  const iv     = Buffer.from(ivHex,  'hex');
  const enc    = Buffer.from(encHex, 'hex');
  const tag    = Buffer.from(tagHex, 'hex');
  const d      = crypto.createDecipheriv('aes-256-gcm', key, iv);
  d.setAuthTag(tag);
  return d.update(enc).toString('utf8') + d.final('utf8');
}

export interface MetaCreds {
  accessToken:  string;
  adAccountId:  string;
  pageId:       string;
  pixelId?:     string;
  leadWebhookToken?: string;
  appId?:       string;
  appSecret?:   string;
  /** Instagram Business account ID linked to the Page (optional; auto-detected on Test). */
  instagramUserId?: string;
  instagramUsername?: string;
}

/** Returns Meta credentials from DB (if saved + active), falling back to env vars */
export async function getMetaCreds(): Promise<MetaCreds> {
  try {
    const row = await prisma.platformSetting.findUnique({ where: { platform: 'META' } });
    if (row?.isActive && row.config) {
      const cfg = JSON.parse(decrypt(row.config)) as Record<string, string>;
      if (cfg.accessToken && cfg.adAccountId) {
        return {
          accessToken:      cfg.accessToken,
          adAccountId:      cfg.adAccountId.startsWith('act_') ? cfg.adAccountId : `act_${cfg.adAccountId}`,
          pageId:           cfg.pageId ?? process.env.META_PAGE_ID ?? '',
          pixelId:          cfg.pixelId ?? process.env.META_PIXEL_ID,
          leadWebhookToken: cfg.leadWebhookToken,
          appId:            cfg.appId ?? process.env.META_APP_ID,
          appSecret:        cfg.appSecret ?? process.env.META_APP_SECRET,
          instagramUserId:  cfg.instagramUserId || undefined,
          instagramUsername: cfg.instagramUsername || undefined,
        };
      }
    }
  } catch { /* fall through to env vars */ }

  return {
    accessToken:  process.env.META_ACCESS_TOKEN ?? '',
    adAccountId:  (() => { const id = process.env.META_AD_ACCOUNT_ID ?? ''; return id.startsWith('act_') ? id : `act_${id}`; })(),
    pageId:       process.env.META_PAGE_ID ?? '',
    pixelId:      process.env.META_PIXEL_ID,
    leadWebhookToken: process.env.META_LEAD_WEBHOOK_TOKEN,
    appId:        process.env.META_APP_ID,
    appSecret:    process.env.META_APP_SECRET,
    instagramUserId: process.env.META_INSTAGRAM_USER_ID,
  };
}
