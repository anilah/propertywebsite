import { Request, Response } from 'express';
import type { Prisma, Tradie } from '@prisma/client';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendServerError } from '../utils/serverError.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseList(raw: string | null | undefined): string[] {
  try {
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

/** Accepts an array or comma-separated string; trims, drops blanks and duplicates. */
function normalizeList(input: unknown): string[] {
  const arr = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(',')
      : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr) {
    const s = String(item ?? '').trim();
    if (!s || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    out.push(s);
  }
  return out;
}

function optString(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s || null;
}

function normalizeWorkImages(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((u) => String(u ?? '').trim()).filter((u) => /^https?:\/\//i.test(u) || u.startsWith('/'));
  }
  if (typeof input === 'string') {
    try {
      return normalizeWorkImages(JSON.parse(input));
    } catch {
      return [];
    }
  }
  return [];
}

function toPublic(t: Tradie) {
  // Phone / WhatsApp / email stay private — public UX is Enquire (like listings).
  return {
    id: t.id,
    slug: t.slug,
    businessName: t.businessName,
    contactName: t.contactName,
    categories: parseList(t.categories),
    skills: parseList(t.skills),
    description: t.description,
    tagline: t.tagline,
    yearsExperience: t.yearsExperience,
    insuranceInfo: t.insuranceInfo,
    workImages: parseList(t.workImages),
    website: t.website,
    photoUrl: t.photoUrl,
    licenseNumber: t.licenseNumber,
    region: t.region,
    district: t.district,
    suburbs: parseList(t.suburbs),
    featured: t.featured,
  };
}

function toAdmin(t: Tradie) {
  return {
    ...toPublic(t),
    phone: t.phone,
    whatsappNumber: t.whatsappNumber,
    email: t.email,
    isActive: t.isActive,
    callClicks: t.callClicks,
    whatsappClicks: t.whatsappClicks,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || 'tradie';
  let candidate = root;
  for (let i = 2; i < 50; i++) {
    const clash = await prisma.tradie.findUnique({ where: { slug: candidate } });
    if (!clash || clash.id === excludeId) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

// ── Public endpoints ──────────────────────────────────────────────────────────

/** GET /api/tradies?q=&category=&region=&district=&suburb=&featured=&page=&limit= */
export const listPublicTradies = async (req: Request, res: Response) => {
  try {
    const { q, category, region, district, suburb, featured, page = '1', limit = '24' } =
      req.query as Record<string, string | undefined>;
    const take = Math.min(parseInt(limit) || 24, 100);
    const pageNum = Math.max(parseInt(page) || 1, 1);

    const and: Prisma.TradieWhereInput[] = [{ isActive: true }];
    if (featured === 'true' || featured === '1') {
      and.push({ featured: true });
    }
    const keyword = q?.trim();
    if (keyword) {
      and.push({
        OR: [
          { businessName: { contains: keyword, mode: 'insensitive' } },
          { contactName: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          { categories: { contains: keyword, mode: 'insensitive' } },
          { skills: { contains: keyword, mode: 'insensitive' } },
        ],
      });
    }
    if (category?.trim()) {
      and.push({ categories: { contains: JSON.stringify(category.trim()), mode: 'insensitive' } });
    }
    if (region?.trim()) {
      and.push({
        OR: [
          { region: { equals: region.trim(), mode: 'insensitive' } },
          { region: null },
          { region: '' },
        ],
      });
    }
    if (district?.trim()) {
      and.push({
        OR: [
          { district: { equals: district.trim(), mode: 'insensitive' } },
          { district: null },
          { district: '' },
        ],
      });
    }
    if (suburb?.trim()) {
      and.push({
        OR: [
          { suburbs: { contains: JSON.stringify(suburb.trim()), mode: 'insensitive' } },
          { suburbs: '[]' },
        ],
      });
    }

    const where: Prisma.TradieWhereInput = { AND: and };
    const [rows, total] = await Promise.all([
      prisma.tradie.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { businessName: 'asc' }],
        take,
        skip: (pageNum - 1) * take,
      }),
      prisma.tradie.count({ where }),
    ]);

    res.json({ tradies: rows.map(toPublic), total, page: pageNum, limit: take });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** GET /api/tradies/categories — categories used by at least one active tradie. */
export const listPublicTradieCategories = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.tradie.findMany({
      where: { isActive: true },
      select: { categories: true },
    });
    const counts = new Map<string, number>();
    for (const r of rows) {
      for (const c of parseList(r.categories)) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const categories = [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
    res.json({ categories });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** GET /api/tradies/:slug */
export const getPublicTradie = async (req: Request, res: Response) => {
  try {
    const tradie = await prisma.tradie.findFirst({
      where: { slug: req.params.slug, isActive: true },
    });
    if (!tradie) return res.status(404).json({ error: 'Tradie not found' });
    res.json({ tradie: toPublic(tradie) });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** POST /api/tradies/:id/enquire — public lead form (phone stays private). */
export const createTradieEnquiry = async (req: Request, res: Response) => {
  try {
    const tradie = await prisma.tradie.findFirst({
      where: { id: req.params.id, isActive: true },
    });
    if (!tradie) return res.status(404).json({ error: 'Tradie not found' });

    const { name, email, phone, message, intent } = req.body as Record<string, string>;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const enquiry = await prisma.tradieEnquiry.create({
      data: {
        tradieId: tradie.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        message: message.trim(),
        intent: intent?.trim() || null,
      },
    });

    // Best-effort email — same notify inbox as listing enquiries + tradie email if set.
    try {
      const { isEmailConfigured, sendEnquiryEmail, getEnquiryNotifyEmails } = await import(
        '../services/email.js'
      );
      if (isEmailConfigured()) {
        const recipients = new Set<string>();
        if (tradie.email?.trim()) recipients.add(tradie.email.trim().toLowerCase());
        for (const e of getEnquiryNotifyEmails()) recipients.add(e.toLowerCase());
        if (recipients.size > 0) {
          await sendEnquiryEmail({
            to: [...recipients],
            recipientName: tradie.contactName || tradie.businessName,
            listingAddress: `Tradie: ${tradie.businessName}`,
            listingId: tradie.slug,
            enquirerName: name.trim(),
            enquirerEmail: email.trim(),
            enquirerPhone: phone?.trim() || undefined,
            message: `${intent?.trim() ? `[${intent.trim()}]\n\n` : ''}${message.trim()}`,
            note: 'This is a tradie directory enquiry (not a property listing).',
          });
        }
      }
    } catch (emailErr) {
      console.warn('[tradie-enquiry] email failed:', emailErr);
    }

    res.status(201).json({ success: true, enquiryId: enquiry.id });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** POST /api/tradies/:id/contact-click  { channel: 'call' | 'whatsapp' } */
export const recordTradieContactClick = async (req: Request, res: Response) => {
  try {
    const channel = String(req.body?.channel ?? '');
    if (channel !== 'call' && channel !== 'whatsapp') {
      return res.status(400).json({ error: 'channel must be "call" or "whatsapp"' });
    }
    const existing = await prisma.tradie.findFirst({
      where: { id: req.params.id, isActive: true },
      select: { id: true },
    });
    if (!existing) return res.status(404).json({ error: 'Tradie not found' });
    await prisma.tradie.update({
      where: { id: existing.id },
      data: channel === 'call' ? { callClicks: { increment: 1 } } : { whatsappClicks: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

// ── Admin endpoints (super admin) ─────────────────────────────────────────────

/** GET /api/admin/tradies?q= */
export const adminListTradies = async (req: AuthRequest, res: Response) => {
  try {
    const q = String(req.query.q ?? '').trim();
    const where: Prisma.TradieWhereInput = q
      ? {
          OR: [
            { businessName: { contains: q, mode: 'insensitive' } },
            { contactName: { contains: q, mode: 'insensitive' } },
            { categories: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
          ],
        }
      : {};
    const rows = await prisma.tradie.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { featured: 'desc' }, { businessName: 'asc' }],
      take: 500,
    });
    res.json({ tradies: rows.map(toAdmin), total: rows.length });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** GET /api/admin/tradies/:id */
export const adminGetTradie = async (req: AuthRequest, res: Response) => {
  try {
    const tradie = await prisma.tradie.findUnique({ where: { id: req.params.id } });
    if (!tradie) return res.status(404).json({ error: 'Tradie not found' });
    res.json({ tradie: toAdmin(tradie) });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

function validateCore(body: Record<string, unknown>): string | null {
  if (!optString(body.businessName)) return 'Business or person name is required.';
  if (!optString(body.phone)) return 'Phone number is required.';
  if (normalizeList(body.categories).length === 0) return 'Choose at least one service category.';
  return null;
}

/** POST /api/admin/tradies */
export const adminCreateTradie = async (req: AuthRequest, res: Response) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const invalid = validateCore(body);
    if (invalid) return res.status(400).json({ error: invalid });

    const businessName = optString(body.businessName)!;
    const slug = await uniqueSlug(optString(body.slug) || businessName);

    const tradie = await prisma.tradie.create({
      data: {
        slug,
        businessName,
        contactName: optString(body.contactName),
        categories: JSON.stringify(normalizeList(body.categories)),
        skills: JSON.stringify(normalizeList(body.skills)),
        description: optString(body.description),
        tagline: optString(body.tagline),
        yearsExperience:
          body.yearsExperience === undefined || body.yearsExperience === null || body.yearsExperience === ''
            ? null
            : Math.max(0, Math.min(80, Number(body.yearsExperience) || 0)),
        insuranceInfo: optString(body.insuranceInfo),
        workImages: JSON.stringify(normalizeWorkImages(body.workImages)),
        phone: optString(body.phone)!,
        whatsappNumber: optString(body.whatsappNumber),
        email: optString(body.email),
        website: optString(body.website),
        photoUrl: optString(body.photoUrl),
        licenseNumber: optString(body.licenseNumber),
        region: optString(body.region),
        district: optString(body.district),
        suburbs: JSON.stringify(normalizeList(body.suburbs)),
        isActive: body.isActive === undefined ? true : Boolean(body.isActive),
        featured: Boolean(body.featured),
        createdBy: req.user?.id ?? null,
      },
    });
    res.status(201).json({ tradie: toAdmin(tradie) });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** PUT /api/admin/tradies/:id — partial update; send null/"" to clear optional fields. */
export const adminUpdateTradie = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.tradie.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Tradie not found' });

    const body = (req.body ?? {}) as Record<string, unknown>;
    const data: Prisma.TradieUpdateInput = {};

    if (body.businessName !== undefined) {
      const name = optString(body.businessName);
      if (!name) return res.status(400).json({ error: 'Business or person name is required.' });
      data.businessName = name;
    }
    if (body.phone !== undefined) {
      const phone = optString(body.phone);
      if (!phone) return res.status(400).json({ error: 'Phone number is required.' });
      data.phone = phone;
    }
    if (body.categories !== undefined) {
      const cats = normalizeList(body.categories);
      if (cats.length === 0) return res.status(400).json({ error: 'Choose at least one service category.' });
      data.categories = JSON.stringify(cats);
    }
    if (body.slug !== undefined && optString(body.slug)) {
      data.slug = await uniqueSlug(optString(body.slug)!, id);
    }
    if (body.skills !== undefined) data.skills = JSON.stringify(normalizeList(body.skills));
    if (body.suburbs !== undefined) data.suburbs = JSON.stringify(normalizeList(body.suburbs));
    if (body.workImages !== undefined) data.workImages = JSON.stringify(normalizeWorkImages(body.workImages));
    if (body.yearsExperience !== undefined) {
      if (body.yearsExperience === null || body.yearsExperience === '') {
        data.yearsExperience = null;
      } else {
        const n = Number(body.yearsExperience);
        data.yearsExperience = Number.isFinite(n) ? Math.max(0, Math.min(80, Math.round(n))) : null;
      }
    }

    const optionalText = [
      'contactName', 'description', 'tagline', 'insuranceInfo', 'whatsappNumber', 'email', 'website',
      'photoUrl', 'licenseNumber', 'region', 'district',
    ] as const;
    for (const key of optionalText) {
      if (body[key] !== undefined) data[key] = optString(body[key]);
    }
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.featured !== undefined) data.featured = Boolean(body.featured);

    const tradie = await prisma.tradie.update({ where: { id }, data });
    res.json({ tradie: toAdmin(tradie) });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** DELETE /api/admin/tradies/:id */
export const adminDeleteTradie = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.tradie.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Tradie not found' });
    await prisma.tradie.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};
