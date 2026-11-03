import { Request, Response } from 'express';
import prisma from '../config/database.js';

/**
 * Default pre-filled message used for WhatsApp/SMS enquiries from the listing detail page.
 * Placeholders (replaced client-side): {{listingId}}, {{suburb}}, {{headline}}, {{url}}
 * Site is New Zealand-specific (Kaboo Homes) — keep wording NZ-appropriate.
 */
const DEFAULT_CONTACT_MESSAGE_TEMPLATE =
  "Hi, I'm interested in listing #{{listingId}} ({{suburb}}). Could you please provide more details? {{url}}";

/**
 * Site branding configuration served to the frontend at startup.
 * Priority: DB platform_settings (branding row) → Lambda env vars → hardcoded defaults.
 */
export async function getSiteConfig(_req: Request, res: Response): Promise<void> {
  try {
    const row = await prisma.platformSetting.findUnique({ where: { platform: 'branding' } });
    const stored = row?.config ? JSON.parse(row.config) : {};

    res.json({
      siteName:               stored.siteName               ?? process.env.SITE_NAME          ?? 'Kaboo Homes',
      tagline:                stored.tagline                ?? process.env.SITE_TAGLINE        ?? "New Zealand's Premier Property Portal",
      primaryColor:           stored.primaryColor           ?? process.env.SITE_PRIMARY_COLOR  ?? '#0d5c63',
      logoUrl:                stored.logoUrl                ?? process.env.SITE_LOGO_URL       ?? null,
      faviconUrl:             stored.faviconUrl             ?? process.env.SITE_FAVICON_URL    ?? null,
      heroImageUrl:           stored.heroImageUrl           ?? null,
      heroImagePosition:      stored.heroImagePosition      ?? '50% 50%',
      logoSize:               stored.logoSize               ?? 80,
      contactMessageTemplate: stored.contactMessageTemplate ?? DEFAULT_CONTACT_MESSAGE_TEMPLATE,
    });
  } catch {
    // DB unavailable — fall back to env vars silently
    res.json({
      siteName:               process.env.SITE_NAME          ?? 'Kaboo Homes',
      tagline:                process.env.SITE_TAGLINE        ?? "New Zealand's Premier Property Portal",
      primaryColor:           process.env.SITE_PRIMARY_COLOR  ?? '#0d5c63',
      logoUrl:                process.env.SITE_LOGO_URL       ?? null,
      faviconUrl:             process.env.SITE_FAVICON_URL    ?? null,
      heroImageUrl:           null,
      heroImagePosition:      '50% 50%',
      logoSize:               48,
      contactMessageTemplate: DEFAULT_CONTACT_MESSAGE_TEMPLATE,
    });
  }
}
