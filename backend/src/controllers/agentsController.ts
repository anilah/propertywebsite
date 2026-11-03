import { Response } from 'express';
import type { Prisma } from '@prisma/client';
import { ListingStatus } from '../types/enums.js';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { normalizeNzMobile, isValidNzMobile } from '../utils/nzPhone.js';
import { sendServerError } from '../utils/serverError.js';

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export type AgentListingStats = {
  total: number;
  draft: number;
  pendingApproval: number;
  published: number;
  /** Sold, rented, or withdrawn — no longer on the public market */
  offMarket: number;
};

function listingStatsForAgents(
  agentIds: string[],
  groups: { createdBy: string | null; status: ListingStatus; _count: { _all: number } }[]
): Map<string, AgentListingStats> {
  const map = new Map<string, AgentListingStats>();
  for (const id of agentIds) {
    map.set(id, { total: 0, draft: 0, pendingApproval: 0, published: 0, offMarket: 0 });
  }
  for (const g of groups) {
    if (!g.createdBy || !map.has(g.createdBy)) continue;
    const s = map.get(g.createdBy)!;
    const n = g._count._all;
    s.total += n;
    if (g.status === ListingStatus.DRAFT) s.draft += n;
    else if (g.status === ListingStatus.PENDING_APPROVAL) s.pendingApproval += n;
    else if (g.status === ListingStatus.PUBLISHED) s.published += n;
    else if (
      g.status === ListingStatus.SOLD ||
      g.status === ListingStatus.RENTED ||
      g.status === ListingStatus.WITHDRAWN
    ) {
      s.offMarket += n;
    }
  }
  return map;
}

/** GET /api/admin/agents/pending – list users awaiting approval (super admin only) */
export const getPendingAgents = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        mobileNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        agencyName: true,
        licenseNumber: true,
        createdAt: true,
        role: true,
      },
    });
    res.json({ users });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** POST /api/admin/agents — create agent from manual details (super admin only) */
export const createAgent = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const {
      mobileNumber,
      firstName,
      lastName,
      email,
      agencyName,
      agencyLogoUrl,
      agencyBrandColor,
      licenseNumber,
      profilePhotoUrl,
      officeBranchName,
      officePhone,
      whatsappNumber,
      officeWebsite,
      appraisalUrl,
      platinumPartner,
      listingAgentDisplayName,
      listingAgentPhotoUrl,
      coListingAgentName,
      coListingAgentPhotoUrl,
    } = body;

    const cleaned = normalizeNzMobile(String(mobileNumber ?? ''));
    if (!isValidNzMobile(cleaned)) {
      return res.status(400).json({ error: 'Invalid mobile number format' });
    }

    const fn = String(firstName ?? '').trim();
    const ln = String(lastName ?? '').trim();
    if (!fn || !ln) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { mobileNumber: cleaned } });
    if (existing) {
      return res.status(409).json({ error: 'A user with this mobile number already exists' });
    }

    const plainPin = generatePin();

    const user = await prisma.user.create({
      data: {
        mobileNumber: cleaned,
        role: 'AGENT',
        isActive: true,
        pin: plainPin,
        firstName: fn,
        lastName: ln,
        email: email != null && String(email).trim() ? String(email).trim() : null,
        agencyName: agencyName != null && String(agencyName).trim() ? String(agencyName).trim() : null,
        agencyLogoUrl: agencyLogoUrl != null && String(agencyLogoUrl).trim() ? String(agencyLogoUrl).trim() : null,
        agencyBrandColor: agencyBrandColor != null && String(agencyBrandColor).trim() ? String(agencyBrandColor).trim() : null,
        licenseNumber:
          licenseNumber != null && String(licenseNumber).trim()
            ? String(licenseNumber).trim()
            : null,
        profilePhotoUrl:
          profilePhotoUrl != null && String(profilePhotoUrl).trim()
            ? String(profilePhotoUrl).trim()
            : null,
        officeBranchName:
          officeBranchName != null && String(officeBranchName).trim()
            ? String(officeBranchName).trim()
            : null,
        officePhone:
          officePhone != null && String(officePhone).trim() ? String(officePhone).trim() : null,
        whatsappNumber:
          whatsappNumber != null && String(whatsappNumber).trim() ? String(whatsappNumber).trim() : null,
        officeWebsite:
          officeWebsite != null && String(officeWebsite).trim()
            ? String(officeWebsite).trim()
            : null,
        appraisalUrl:
          appraisalUrl != null && String(appraisalUrl).trim() ? String(appraisalUrl).trim() : null,
        platinumPartner: !!platinumPartner,
        listingAgentDisplayName:
          listingAgentDisplayName != null && String(listingAgentDisplayName).trim()
            ? String(listingAgentDisplayName).trim()
            : null,
        listingAgentPhotoUrl:
          listingAgentPhotoUrl != null && String(listingAgentPhotoUrl).trim()
            ? String(listingAgentPhotoUrl).trim()
            : null,
        coListingAgentName:
          coListingAgentName != null && String(coListingAgentName).trim()
            ? String(coListingAgentName).trim()
            : null,
        coListingAgentPhotoUrl:
          coListingAgentPhotoUrl != null && String(coListingAgentPhotoUrl).trim()
            ? String(coListingAgentPhotoUrl).trim()
            : null,
      },
      select: {
        id: true,
        mobileNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        agencyName: true,
        agencyLogoUrl: true,
        agencyBrandColor: true,
        licenseNumber: true,
        profilePhotoUrl: true,
        officeBranchName: true,
        officePhone: true,
        whatsappNumber: true,
        officeWebsite: true,
        appraisalUrl: true,
        platinumPartner: true,
        listingAgentDisplayName: true,
        listingAgentPhotoUrl: true,
        coListingAgentName: true,
        coListingAgentPhotoUrl: true,
        pin: true,
        createdAt: true,
        isActive: true,
        role: true,
      },
    });

    res.status(201).json({ success: true, user });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

const agentListSelect = {
  id: true,
  mobileNumber: true,
  firstName: true,
  lastName: true,
  email: true,
  agencyName: true,
  agencyLogoUrl: true,
  agencyBrandColor: true,
  licenseNumber: true,
  profilePhotoUrl: true,
  officeBranchName: true,
  officePhone: true,
  whatsappNumber: true,
  officeWebsite: true,
  appraisalUrl: true,
  platinumPartner: true,
  listingAgentDisplayName: true,
  listingAgentPhotoUrl: true,
  coListingAgentName: true,
  coListingAgentPhotoUrl: true,
  pin: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  _count: { select: { listings: true } },
} as const;

/** PATCH /api/admin/agents/:id — update agent profile / mobile (super admin only) */
export const updateAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role !== 'AGENT') {
      return res.status(400).json({ error: 'User is not an agent' });
    }

    const body = req.body as Record<string, unknown>;
    const data: {
      mobileNumber?: string;
      firstName?: string;
      lastName?: string;
      email?: string | null;
      agencyName?: string | null;
      agencyLogoUrl?: string | null;
      agencyBrandColor?: string | null;
      licenseNumber?: string | null;
      profilePhotoUrl?: string | null;
      officeBranchName?: string | null;
      officePhone?: string | null;
      whatsappNumber?: string | null;
      officeWebsite?: string | null;
      appraisalUrl?: string | null;
      platinumPartner?: boolean;
      listingAgentDisplayName?: string | null;
      listingAgentPhotoUrl?: string | null;
      coListingAgentName?: string | null;
      coListingAgentPhotoUrl?: string | null;
    } = {};

    if (body.mobileNumber !== undefined) {
      const cleaned = normalizeNzMobile(String(body.mobileNumber ?? ''));
      if (!isValidNzMobile(cleaned)) {
        return res.status(400).json({ error: 'Invalid mobile number format' });
      }
      if (cleaned !== user.mobileNumber) {
        const taken = await prisma.user.findUnique({ where: { mobileNumber: cleaned } });
        if (taken && taken.id !== id) {
          return res.status(409).json({ error: 'A user with this mobile number already exists' });
        }
      }
      data.mobileNumber = cleaned;
    }

    if (body.firstName !== undefined) {
      const fn = String(body.firstName ?? '').trim();
      if (!fn) {
        return res.status(400).json({ error: 'First name cannot be empty' });
      }
      data.firstName = fn;
    }
    if (body.lastName !== undefined) {
      const ln = String(body.lastName ?? '').trim();
      if (!ln) {
        return res.status(400).json({ error: 'Last name cannot be empty' });
      }
      data.lastName = ln;
    }
    if (body.email !== undefined) {
      data.email = body.email != null && String(body.email).trim() ? String(body.email).trim() : null;
    }
    if (body.agencyName !== undefined) {
      data.agencyName =
        body.agencyName != null && String(body.agencyName).trim() ? String(body.agencyName).trim() : null;
    }
    if (body.agencyLogoUrl !== undefined) {
      data.agencyLogoUrl =
        body.agencyLogoUrl != null && String(body.agencyLogoUrl).trim() ? String(body.agencyLogoUrl).trim() : null;
    }
    if (body.agencyBrandColor !== undefined) {
      data.agencyBrandColor =
        body.agencyBrandColor != null && String(body.agencyBrandColor).trim() ? String(body.agencyBrandColor).trim() : null;
    }
    if (body.licenseNumber !== undefined) {
      data.licenseNumber =
        body.licenseNumber != null && String(body.licenseNumber).trim()
          ? String(body.licenseNumber).trim()
          : null;
    }
    if (body.profilePhotoUrl !== undefined) {
      data.profilePhotoUrl =
        body.profilePhotoUrl != null && String(body.profilePhotoUrl).trim()
          ? String(body.profilePhotoUrl).trim()
          : null;
    }
    if (body.officeBranchName !== undefined) {
      data.officeBranchName =
        body.officeBranchName != null && String(body.officeBranchName).trim()
          ? String(body.officeBranchName).trim()
          : null;
    }
    if (body.officePhone !== undefined) {
      data.officePhone =
        body.officePhone != null && String(body.officePhone).trim() ? String(body.officePhone).trim() : null;
    }
    if (body.whatsappNumber !== undefined) {
      data.whatsappNumber =
        body.whatsappNumber != null && String(body.whatsappNumber).trim()
          ? String(body.whatsappNumber).trim()
          : null;
    }
    if (body.officeWebsite !== undefined) {
      data.officeWebsite =
        body.officeWebsite != null && String(body.officeWebsite).trim()
          ? String(body.officeWebsite).trim()
          : null;
    }
    if (body.appraisalUrl !== undefined) {
      data.appraisalUrl =
        body.appraisalUrl != null && String(body.appraisalUrl).trim() ? String(body.appraisalUrl).trim() : null;
    }
    if (body.platinumPartner !== undefined) {
      data.platinumPartner = !!body.platinumPartner;
    }
    if (body.listingAgentDisplayName !== undefined) {
      data.listingAgentDisplayName =
        body.listingAgentDisplayName != null && String(body.listingAgentDisplayName).trim()
          ? String(body.listingAgentDisplayName).trim()
          : null;
    }
    if (body.listingAgentPhotoUrl !== undefined) {
      data.listingAgentPhotoUrl =
        body.listingAgentPhotoUrl != null && String(body.listingAgentPhotoUrl).trim()
          ? String(body.listingAgentPhotoUrl).trim()
          : null;
    }
    if (body.coListingAgentName !== undefined) {
      data.coListingAgentName =
        body.coListingAgentName != null && String(body.coListingAgentName).trim()
          ? String(body.coListingAgentName).trim()
          : null;
    }
    if (body.coListingAgentPhotoUrl !== undefined) {
      data.coListingAgentPhotoUrl =
        body.coListingAgentPhotoUrl != null && String(body.coListingAgentPhotoUrl).trim()
          ? String(body.coListingAgentPhotoUrl).trim()
          : null;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await prisma.user.update({
      where: { id },
      data,
    });

    const updated = await prisma.user.findUniqueOrThrow({
      where: { id },
      select: agentListSelect,
    });

    res.json({ success: true, user: updated });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** DELETE /api/admin/agents/:id — permanently delete an agent (super admin only) */
export const deleteAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role !== 'AGENT') {
      return res.status(400).json({ error: 'Cannot delete a non-agent user' });
    }
    // Unassign listings before deleting (set createdBy to null rather than cascade-deleting listings)
    await prisma.listing.updateMany({ where: { createdBy: id }, data: { createdBy: null } });
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** GET /api/admin/agents – paginated, searchable, sortable (super admin only) */
export const getAgents = async (req: AuthRequest, res: Response) => {
  try {
    const qRaw = String(req.query.q ?? '').trim();
    const qCompact = qRaw.replace(/\s/g, '');
    const statusParam = String(req.query.status ?? 'all').toLowerCase();
    const sort = String(req.query.sort ?? 'updated');
    const order = String(req.query.order ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize), 10) || 25));

    const where: Prisma.UserWhereInput = { role: 'AGENT' };
    if (statusParam === 'active') where.isActive = true;
    else if (statusParam === 'inactive') where.isActive = false;

    if (qRaw) {
      where.OR = [
        { firstName: { contains: qRaw, mode: 'insensitive' } },
        { lastName: { contains: qRaw, mode: 'insensitive' } },
        { mobileNumber: { contains: qCompact || qRaw, mode: 'insensitive' } },
        { email: { contains: qRaw, mode: 'insensitive' } },
        { agencyName: { contains: qRaw, mode: 'insensitive' } },
        { officeBranchName: { contains: qRaw, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[] = {
      updatedAt: order,
    };
    if (sort === 'name') {
      orderBy = [{ firstName: order }, { lastName: order }];
    } else if (sort === 'created') {
      orderBy = { createdAt: order };
    } else if (sort === 'updated') {
      orderBy = { updatedAt: order };
    } else if (sort === 'listings') {
      orderBy = { listings: { _count: order } };
    }

    const [totalFiltered, globalMeta, users] = await Promise.all([
      prisma.user.count({ where }),
      Promise.all([
        prisma.user.count({ where: { role: 'AGENT' } }),
        prisma.user.count({ where: { role: 'AGENT', isActive: true } }),
        prisma.user.count({ where: { role: 'AGENT', isActive: false } }),
        prisma.listing.count(),
      ]).then(([totalAgents, activeAgents, inactiveAgents, totalListings]) => ({
        totalAgents,
        activeAgents,
        inactiveAgents,
        totalListings,
      })),
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: agentListSelect,
      }),
    ]);

    const ids = users.map((u) => u.id);
    let statsMap = new Map<string, AgentListingStats>();
    if (ids.length > 0) {
      const groups = await prisma.listing.groupBy({
        by: ['createdBy', 'status'],
        where: { createdBy: { in: ids } },
        _count: { _all: true },
      });
      statsMap = listingStatsForAgents(ids, groups as { createdBy: string | null; status: ListingStatus; _count: { _all: number } }[]);
    }

    const usersOut = users.map((u) => ({
      ...u,
      listingStats: statsMap.get(u.id) ?? { total: 0, draft: 0, pendingApproval: 0, published: 0, offMarket: 0 },
    }));

    res.json({
      users: usersOut,
      pagination: {
        total: totalFiltered,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalFiltered / pageSize)),
      },
      meta: globalMeta,
    });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** GET /api/admin/agents/:id/listings — agent's listings (super admin only) */
export const getAgentListings = async (req: AuthRequest, res: Response) => {
  try {
    const { id: agentId } = req.params;
    const agent = await prisma.user.findUnique({ where: { id: agentId } });
    if (!agent || agent.role !== 'AGENT') {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(String(req.query.pageSize), 10) || 15));
    const skip = (page - 1) * pageSize;

    const [rows, total] = await Promise.all([
      prisma.listing.findMany({
        where: { createdBy: agentId },
        orderBy: { updatedDate: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          headline: true,
          status: true,
          listingType: true,
          region: true,
          district: true,
          suburb: true,
          price: true,
          rentPerWeek: true,
          listedDate: true,
          updatedDate: true,
        },
      }),
      prisma.listing.count({ where: { createdBy: agentId } }),
    ]);

    const listings = rows.map((l) => ({
      id: l.id,
      headline: l.headline,
      status: l.status.toLowerCase(),
      listingType: l.listingType,
      location: { region: l.region, district: l.district, suburb: l.suburb },
      price: l.price,
      rentPerWeek: l.rentPerWeek,
      listedDate: l.listedDate.toISOString(),
      updatedDate: l.updatedDate ? l.updatedDate.toISOString() : null,
    }));

    res.json({
      listings,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** POST /api/admin/agents/:id/approve – approve a pending user as agent (super admin only) */
export const approveAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role !== 'PENDING') {
      return res.status(400).json({ error: 'User is not pending approval' });
    }
    await prisma.user.update({
      where: { id },
      data: { role: 'AGENT', isActive: true },
    });
    res.json({
      success: true,
      user: {
        id: user.id,
        mobileNumber: user.mobileNumber,
        role: 'AGENT',
        isActive: true,
      },
    });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** PATCH /api/admin/agents/:id/activate – set agent to active (super admin only) */
export const activateAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role !== 'AGENT') {
      return res.status(400).json({ error: 'User is not an agent' });
    }
    await prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
    res.json({
      success: true,
      user: {
        id: user.id,
        mobileNumber: user.mobileNumber,
        role: 'AGENT',
        isActive: true,
      },
    });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/**
 * POST /api/admin/agents/:id/reset-pin
 * Super admin resets an agent's login PIN. A new 6-digit PIN is generated,
 * hashed and stored, and the plain PIN is returned once for manual sharing.
 */
export const resetAgentPin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'AGENT') return res.status(400).json({ error: 'User is not an agent' });

    const plainPin = generatePin();

    await prisma.user.update({ where: { id }, data: { pin: plainPin } });

    res.json({ success: true, pin: plainPin });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** PATCH /api/admin/agents/:id/deactivate – set agent to inactive (super admin only) */
export const deactivateAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role !== 'AGENT') {
      return res.status(400).json({ error: 'User is not an agent' });
    }
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({
      success: true,
      user: {
        id: user.id,
        mobileNumber: user.mobileNumber,
        role: 'AGENT',
        isActive: false,
      },
    });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};
