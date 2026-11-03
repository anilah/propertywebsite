import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { sendServerError } from '../utils/serverError.js';
import { getHttpRequestMeta, logInfo } from '../utils/logger.js';

const BRANDING_KEY = 'branding';

interface BrandingSettings {
  siteName?:              string;
  tagline?:               string;
  primaryColor?:          string;
  logoUrl?:               string;
  faviconUrl?:            string;
  heroImageUrl?:          string;
  heroImagePosition?:     string;
  logoSize?:              number;
  contactMessageTemplate?: string;
}

/**
 * Default pre-filled message used for WhatsApp/SMS enquiries from the listing detail page.
 * Placeholders (replaced client-side): {{listingId}}, {{suburb}}, {{headline}}, {{url}}
 * Site is New Zealand-specific (Kaboo Homes) — keep wording NZ-appropriate.
 */
const DEFAULT_CONTACT_MESSAGE_TEMPLATE =
  "Hi, I'm interested in listing #{{listingId}} ({{suburb}}). Could you please provide more details? {{url}}";

function envDefaults(): Required<BrandingSettings> {
  return {
    siteName:               process.env.SITE_NAME          ?? 'Kaboo Homes',
    tagline:                process.env.SITE_TAGLINE        ?? "New Zealand's Premier Property Portal",
    primaryColor:           process.env.SITE_PRIMARY_COLOR  ?? '#0d5c63',
    logoUrl:                process.env.SITE_LOGO_URL        ?? '',
    faviconUrl:             process.env.SITE_FAVICON_URL     ?? '',
    heroImageUrl:           '',
    heroImagePosition:      '50% 50%',
    logoSize:               80,
    contactMessageTemplate: DEFAULT_CONTACT_MESSAGE_TEMPLATE,
  };
}

/** GET /api/admin/branding — DB branding merged over env defaults */
export const getBranding = async (_req: Request, res: Response): Promise<void> => {
  try {
    const row = await prisma.platformSetting.findUnique({ where: { platform: BRANDING_KEY } });
    const stored: BrandingSettings = row?.config ? JSON.parse(row.config) : {};
    const def = envDefaults();

    res.json({
      siteName:               stored.siteName               ?? def.siteName,
      tagline:                stored.tagline                ?? def.tagline,
      primaryColor:           stored.primaryColor           ?? def.primaryColor,
      logoUrl:                stored.logoUrl                ?? def.logoUrl      ?? null,
      faviconUrl:             stored.faviconUrl             ?? def.faviconUrl   ?? null,
      heroImageUrl:           stored.heroImageUrl           ?? null,
      heroImagePosition:      stored.heroImagePosition      ?? def.heroImagePosition,
      logoSize:               stored.logoSize               ?? def.logoSize,
      contactMessageTemplate: stored.contactMessageTemplate ?? def.contactMessageTemplate,
    });
  } catch (error: unknown) {
    sendServerError(res, error, { flow: 'get_branding' });
  }
};

/** PUT /api/admin/branding — upsert branding settings in DB */
export const updateBranding = async (req: Request, res: Response): Promise<void> => {
  const baseLog = { flow: 'update_branding', ...getHttpRequestMeta(req) };
  try {
    const {
      siteName, tagline, primaryColor, logoUrl, faviconUrl, heroImageUrl,
      heroImagePosition, logoSize, contactMessageTemplate,
    } = req.body ?? {};

    const row = await prisma.platformSetting.findUnique({ where: { platform: BRANDING_KEY } });
    const current: BrandingSettings = row?.config ? JSON.parse(row.config) : {};

    const updated: BrandingSettings = {
      ...current,
      ...(siteName               !== undefined && { siteName }),
      ...(tagline                !== undefined && { tagline }),
      ...(primaryColor           !== undefined && { primaryColor }),
      ...(logoUrl                !== undefined && { logoUrl }),
      ...(faviconUrl             !== undefined && { faviconUrl }),
      ...(heroImageUrl           !== undefined && { heroImageUrl }),
      ...(heroImagePosition      !== undefined && { heroImagePosition }),
      ...(logoSize               !== undefined && { logoSize: Number(logoSize) }),
      ...(contactMessageTemplate !== undefined && { contactMessageTemplate: String(contactMessageTemplate).trim() || undefined }),
    };

    await prisma.platformSetting.upsert({
      where:  { platform: BRANDING_KEY },
      create: { platform: BRANDING_KEY, config: JSON.stringify(updated) },
      update: { config: JSON.stringify(updated) },
    });

    logInfo('branding_updated', baseLog);
    res.json({ success: true, branding: updated });
  } catch (error: unknown) {
    sendServerError(res, error, { flow: 'update_branding' });
  }
};
