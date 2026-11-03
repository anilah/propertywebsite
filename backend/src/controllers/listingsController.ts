import { Response, Request } from 'express';
import { ListingStatus, PropertyType } from '../types/enums.js';
import type { ListingType as LT, PropertyType as PT, ListingStatus as ListingStatusType } from '../types/enums.js';
import prisma from '../config/database.js';
import { sendServerError } from '../utils/serverError.js';
import {
  LEAD_SOURCES,
  leadSourceLabel,
  parseEnquiryAttribution,
  type EnquiryAttributionInput,
} from '../utils/leadSource.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  sendEnquiryEmail,
  sendBuyerEnquiryConfirmation,
  isEmailConfigured,
  getEnquiryNotifyEmails,
  getEmailFromAddress,
  formatEmailError,
  type EnquiryEmailAudit,
  type EmailAttemptAudit,
} from '../services/email.js';
import { notifyListingAwaitingApproval } from '../services/reviewQueueNotify.js';
import {
  toApiListing,
  mediaInputToCreate,
  type ListingMediaInput,
  type ListingUpdateInput,
  type ListingOpenHomeInput,
  type ListingDocumentInput,
} from './listingMapper.js';

const VALID_PUBLIC_SORT = new Set(['featured', 'price-asc', 'price-desc', 'latest']);
const VALID_PROPERTY_TYPES = new Set<string>(Object.values(PropertyType));
const KEYWORD_MAX = 200;
const LOCATION_FILTER_MAX = 120;

function sanitizeQueryString(s: unknown, max: number): string | undefined {
  if (s == null || s === '') return undefined;
  const t = String(s).trim().slice(0, max);
  return t || undefined;
}

/** Owner relation fields used for listing cards, public search, and agency branding resolution */
const listingOwnerBrandingSelect = {
  role: true,
  firstName: true,
  lastName: true,
  mobileNumber: true,
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
} as const;

const listingInclude = {
  listingMedia: { orderBy: { sortOrder: 'asc' as const } },
  user: {
    select: listingOwnerBrandingSelect,
  },
  listingUpdates: {
    orderBy: { createdAt: 'desc' as const },
    include: { author: { select: { firstName: true, lastName: true } } },
  },
  openHomes: { orderBy: { startsAt: 'asc' as const } },
  documents: { orderBy: { sortOrder: 'asc' as const } },
} as const;

function bodyWantsPublished(body: Record<string, unknown>): boolean {
  const s = body.status;
  if (s === true) return true;
  if (typeof s === 'string') {
    const u = s.toUpperCase().replace(/-/g, '_');
    return u === 'PUBLISHED' || u === 'PUBLISH' || u === 'PENDING_APPROVAL';
  }
  return false;
}

function bodyWantsDraft(body: Record<string, unknown>): boolean {
  const s = body.status;
  if (s === false) return true;
  if (typeof s === 'string' && s.toUpperCase() === 'DRAFT') return true;
  return false;
}

/** Agents cannot go live without super admin; super admin can publish immediately. */
function resolveListingWriteStatus(
  body: Record<string, unknown>,
  role: string | undefined
): ListingStatusType {
  const pub = bodyWantsPublished(body);
  const draft = bodyWantsDraft(body);
  if (draft && !pub) return ListingStatus.DRAFT;
  if (pub) {
    if (role === 'SUPER_ADMIN') return ListingStatus.PUBLISHED;
    return ListingStatus.PENDING_APPROVAL;
  }
  return ListingStatus.DRAFT;
}

/** Live / review listings must have an agent email so enquiry notify can reach them. */
async function assertOwnerHasEmail(
  ownerId: string | null | undefined
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ownerId) {
    return {
      ok: false,
      error: 'Listing has no owner agent — assign an agent with an email before publishing.',
    };
  }
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { email: true, firstName: true, lastName: true },
  });
  if (!owner?.email?.trim()) {
    const name = [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') || 'this agent';
    return {
      ok: false,
      error: `Add an email on ${name}'s profile before submitting or publishing — enquiry alerts are sent there.`,
    };
  }
  return { ok: true };
}

/** Terminal / off-market statuses from API body.status string */
function tryParseTerminalListingStatus(
  body: Record<string, unknown>,
  existing: { listingType: LT; status: ListingStatus }
): ListingStatus | undefined {
  const s = body.status;
  if (typeof s !== 'string') return undefined;
  const u = s.toUpperCase().replace(/-/g, '_');
  if (u === 'SOLD') {
    if (existing.listingType !== 'SALE') return undefined;
    return ListingStatus.SOLD;
  }
  if (u === 'RENTED') {
    if (existing.listingType !== 'RENT' && existing.listingType !== 'FLATMATES') return undefined;
    return ListingStatus.RENTED;
  }
  if (u === 'WITHDRAWN' || u === 'WITHDRAW') return ListingStatus.WITHDRAWN;
  return undefined;
}

const OFF_MARKET_STATUSES: ListingStatus[] = [
  ListingStatus.SOLD,
  ListingStatus.RENTED,
  ListingStatus.WITHDRAWN,
];

function scalarDataFromBody(body: Record<string, unknown>) {
  const region = (body.region ?? (body.location as { region?: string })?.region ?? '') as string;
  const district = (body.district ?? (body.location as { district?: string })?.district ?? '') as string;
  const suburb = (body.suburb ?? (body.location as { suburb?: string })?.suburb ?? '') as string;

  return {
    listingType: ((body.listingType as string) ?? 'SALE') as LT,
    headline: String(body.headline ?? '').trim(),
    description: String(body.description ?? '').trim(),
    propertyType: ((body.propertyType as string) ?? 'House') as PT,
    region,
    district,
    suburb,
    streetAddress: body.streetAddress != null ? String(body.streetAddress).trim() || null : null,
    city: body.city != null ? String(body.city).trim() || null : null,
    postalCode: body.postalCode != null ? String(body.postalCode).trim() || null : null,
    latitude: body.latitude != null && body.latitude !== '' ? Number(body.latitude) : null,
    longitude: body.longitude != null && body.longitude !== '' ? Number(body.longitude) : null,
    price: body.price != null && body.price !== '' ? Number(body.price) : null,
    rentPerWeek: body.rentPerWeek != null && body.rentPerWeek !== '' ? Number(body.rentPerWeek) : null,
    priceNegotiable: !!body.priceNegotiable,
    bedrooms: Number(body.bedrooms) || 0,
    bathrooms: Number(body.bathrooms) || 0,
    halfBathrooms: Number(body.halfBathrooms) || 0,
    lounges: Number(body.lounges) || 0,
    livingRooms: Number(body.livingRooms) || 0,
    parking: Number(body.parking) || 0,
    offStreetParking:
      body.offStreetParking != null && body.offStreetParking !== ''
        ? Number(body.offStreetParking)
        : null,
    ensuiteCount: Number(body.ensuiteCount) || 0,
    parkingDescription:
      body.parkingDescription != null ? String(body.parkingDescription).trim() || null : null,
    floorArea: body.floorArea != null && body.floorArea !== '' ? Number(body.floorArea) : null,
    landArea: body.landArea != null && body.landArea !== '' ? Number(body.landArea) : null,
    agencyReference:
      body.agencyReference != null ? String(body.agencyReference).trim() || null : null,
    externalListingNumber:
      body.externalListingNumber != null
        ? String(body.externalListingNumber).trim() || null
        : null,
    totalUnits: body.totalUnits != null && body.totalUnits !== '' ? Number(body.totalUnits) : null,
    soldUnits: body.soldUnits != null && body.soldUnits !== '' ? Number(body.soldUnits) : null,
    remainingUnits:
      body.remainingUnits != null && body.remainingUnits !== '' ? Number(body.remainingUnits) : null,
    expectedCompletion:
      body.expectedCompletion != null ? String(body.expectedCompletion).trim() || null : null,
    builderName: body.builderName != null ? String(body.builderName).trim() || null : null,
    schoolZone: body.schoolZone != null ? String(body.schoolZone).trim() || null : null,
    warrantyInfo: body.warrantyInfo != null ? String(body.warrantyInfo).trim() || null : null,
    amenitiesNearby:
      body.amenitiesNearby != null ? String(body.amenitiesNearby).trim() || null : null,
    interiorHighlights:
      body.interiorHighlights != null ? String(body.interiorHighlights).trim() || null : null,
    layoutOptions: body.layoutOptions != null ? String(body.layoutOptions).trim() || null : null,
    openHomesNote: body.openHomesNote != null ? String(body.openHomesNote).trim() || null : null,
    marketingCopy: body.marketingCopy != null ? String(body.marketingCopy).trim() || null : null,
    marketingLink: body.marketingLink != null ? String(body.marketingLink).trim() || null : null,
    agencyDisplayName:
      body.agencyDisplayName != null ? String(body.agencyDisplayName).trim() || null : null,
    agencyLicense: body.agencyLicense != null ? String(body.agencyLicense).trim() || null : null,
    officeBranchName:
      body.officeBranchName != null ? String(body.officeBranchName).trim() || null : null,
    officePhone: body.officePhone != null ? String(body.officePhone).trim() || null : null,
    officeWebsite: body.officeWebsite != null ? String(body.officeWebsite).trim() || null : null,
    appraisalUrl: body.appraisalUrl != null ? String(body.appraisalUrl).trim() || null : null,
    featured: !!body.featured,
    platinumPartner: !!body.platinumPartner,
    listingAgentDisplayName:
      body.listingAgentDisplayName != null
        ? String(body.listingAgentDisplayName).trim() || null
        : null,
    listingAgentPhotoUrl:
      body.listingAgentPhotoUrl != null
        ? String(body.listingAgentPhotoUrl).trim() || null
        : null,
    coListingAgentName:
      body.coListingAgentName != null ? String(body.coListingAgentName).trim() || null : null,
    coListingAgentPhotoUrl:
      body.coListingAgentPhotoUrl != null
        ? String(body.coListingAgentPhotoUrl).trim() || null
        : null,
    streetViewUrl: body.streetViewUrl != null ? String(body.streetViewUrl).trim() || null : null,
    googleMapsUrl: body.googleMapsUrl != null ? String(body.googleMapsUrl).trim() || null : null,
    videoUrl: body.videoUrl != null ? String(body.videoUrl).trim() || null : null,
    features: JSON.stringify(Array.isArray(body.features) ? body.features : []),
    images: JSON.stringify(
      Array.isArray(body.images)
        ? body.images
        : Array.isArray(body.media)
          ? (body.media as ListingMediaInput[]).map((m) => m.url).filter(Boolean)
          : []
    ),
    notes: body.notes != null ? String(body.notes) : null,
  };
}

async function replaceNestedListingData(
  listingId: string,
  body: Record<string, unknown>,
  authorUserId: string
) {
  if (Array.isArray(body.media)) {
    const media = body.media as ListingMediaInput[];
    // Only replace non-campaign media (PHOTO, EXTERIOR, etc.) — VIDEO and REEL are
    // managed independently via the /marketing endpoint and must not be overwritten here.
    await prisma.listingMedia.deleteMany({
      where: { listingId, kind: { notIn: CAMPAIGN_KINDS } },
    });
    const photoMedia = media.filter((m) => !CAMPAIGN_KINDS.includes(String(m.kind || '').toUpperCase()));
    if (photoMedia.length > 0) {
      await prisma.listingMedia.createMany({
        data: mediaInputToCreate(listingId, photoMedia),
      });
    }
    await prisma.listing.update({
      where: { id: listingId },
      data: { images: JSON.stringify(photoMedia.map((m) => String(m.url).trim()).filter(Boolean)) },
    });
  }

  if (Array.isArray(body.updates)) {
    const updates = body.updates as ListingUpdateInput[];
    await prisma.listingUpdate.deleteMany({ where: { listingId } });
    if (updates.length > 0) {
      await prisma.listingUpdate.createMany({
        data: updates
          .filter((u) => String(u.body || '').trim())
          .map((u) => ({
            listingId,
            authorUserId,
            body: String(u.body).trim(),
          })),
      });
    }
  }

  if (Array.isArray(body.openHomes)) {
    const homes = body.openHomes as ListingOpenHomeInput[];
    await prisma.listingOpenHome.deleteMany({ where: { listingId } });
    for (let i = 0; i < homes.length; i++) {
      const h = homes[i];
      const starts = new Date(h.startsAt);
      if (Number.isNaN(starts.getTime())) continue;
      const ends = h.endsAt ? new Date(h.endsAt) : null;
      await prisma.listingOpenHome.create({
        data: {
          listingId,
          startsAt: starts,
          endsAt: ends && !Number.isNaN(ends.getTime()) ? ends : null,
          label: h.label != null ? String(h.label).trim() || null : null,
        },
      });
    }
  }

  if (Array.isArray(body.documents)) {
    const docs = body.documents as ListingDocumentInput[];
    await prisma.listingDocument.deleteMany({ where: { listingId } });
    if (docs.length > 0) {
      await prisma.listingDocument.createMany({
        data: docs.map((d, i) => ({
          listingId,
          title: String(d.title || 'Document').trim() || 'Document',
          url: d.url != null ? String(d.url).trim() || null : null,
          sortOrder: i,
        })),
      });
    }
  }
}

/** GET /api/listings/my */
export const getMyListings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const listings = await prisma.listing.findMany({
      where: req.user?.role === 'SUPER_ADMIN' ? {} : { createdBy: userId },
      orderBy: { updatedDate: 'desc' },
      include: {
        listingMedia: { orderBy: { sortOrder: 'asc' } },
        user: {
          select: listingOwnerBrandingSelect,
        },
      },
    });

    res.json({ listings: listings.map((l) => toApiListing(l)) });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

export const getListings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      listingType: listingTypeRaw,
      region: regionRaw,
      district: districtRaw,
      suburb: suburbRaw,
      minPrice,
      maxPrice,
      minBedrooms,
      minBathrooms,
      minParking,
      propertyType: propertyTypeRaw,
      keyword: keywordRaw,
      sortBy: sortByRaw = 'featured',
      page = '1',
      pageSize = '12',
    } = req.query;

    const sortBy = VALID_PUBLIC_SORT.has(String(sortByRaw))
      ? String(sortByRaw)
      : 'featured';

    const listingType =
      listingTypeRaw === 'SALE' || listingTypeRaw === 'RENT' || listingTypeRaw === 'FLATMATES'
        ? listingTypeRaw
        : undefined;

    const region = sanitizeQueryString(regionRaw, LOCATION_FILTER_MAX);
    const district = sanitizeQueryString(districtRaw, LOCATION_FILTER_MAX);
    const suburb = sanitizeQueryString(suburbRaw, LOCATION_FILTER_MAX);
    const keyword = sanitizeQueryString(keywordRaw, KEYWORD_MAX);

    const propertyType =
      propertyTypeRaw != null &&
      VALID_PROPERTY_TYPES.has(String(propertyTypeRaw))
        ? (String(propertyTypeRaw) as PT)
        : undefined;

    const where: Record<string, unknown> = {
      status: ListingStatus.PUBLISHED,
    };

    if (listingType) {
      where.listingType = listingType;
    }

    if (region) {
      where.region = region;
    }
    if (district) {
      where.district = district;
    }
    if (suburb) {
      where.suburb = suburb;
    }

    if (minBedrooms) {
      const n = parseInt(String(minBedrooms), 10);
      if (!Number.isNaN(n) && n >= 0) where.bedrooms = { gte: n };
    }
    if (minBathrooms) {
      const n = parseInt(String(minBathrooms), 10);
      if (!Number.isNaN(n) && n >= 0) where.bathrooms = { gte: n };
    }
    if (minParking) {
      const n = parseInt(String(minParking), 10);
      if (!Number.isNaN(n) && n >= 0) where.parking = { gte: n };
    }
    if (propertyType) {
      where.propertyType = propertyType;
    }

    if (listingType === 'SALE') {
      const minP =
        minPrice != null && minPrice !== '' ? parseFloat(minPrice as string) : undefined;
      const maxP =
        maxPrice != null && maxPrice !== '' ? parseFloat(maxPrice as string) : undefined;
      if (
        (minP !== undefined && !Number.isNaN(minP)) ||
        (maxP !== undefined && !Number.isNaN(maxP))
      ) {
        const priceFilter: { gte?: number; lte?: number } = {};
        if (minP !== undefined && !Number.isNaN(minP)) priceFilter.gte = minP;
        if (maxP !== undefined && !Number.isNaN(maxP)) priceFilter.lte = maxP;
        where.OR = [
          { priceNegotiable: true },
          { price: Object.keys(priceFilter).length ? priceFilter : { not: null } },
        ];
      }
    } else if (listingType === 'RENT' || listingType === 'FLATMATES') {
      const minP =
        minPrice != null && minPrice !== '' ? parseFloat(minPrice as string) : undefined;
      const maxP =
        maxPrice != null && maxPrice !== '' ? parseFloat(maxPrice as string) : undefined;
      if (
        (minP !== undefined && !Number.isNaN(minP)) ||
        (maxP !== undefined && !Number.isNaN(maxP))
      ) {
        where.rentPerWeek = {
          ...(minP !== undefined && !Number.isNaN(minP) && { gte: minP }),
          ...(maxP !== undefined && !Number.isNaN(maxP) && { lte: maxP }),
        };
      }
    }

    if (keyword) {
      const k = keyword;
      const kwOr = [
        { headline: { contains: k, mode: 'insensitive' as const } },
        { description: { contains: k, mode: 'insensitive' as const } },
        { suburb: { contains: k, mode: 'insensitive' as const } },
        { streetAddress: { contains: k, mode: 'insensitive' as const } },
        { city: { contains: k, mode: 'insensitive' as const } },
        { agencyDisplayName: { contains: k, mode: 'insensitive' as const } },
        { user: { is: { agencyName: { contains: k, mode: 'insensitive' as const } } } },
        { user: { is: { officeBranchName: { contains: k, mode: 'insensitive' as const } } } },
        { user: { is: { coListingAgentName: { contains: k, mode: 'insensitive' as const } } } },
      ];
      const priceOr = where.OR;
      if (priceOr) {
        where.AND = [{ OR: priceOr }, { OR: kwOr }];
        delete where.OR;
      } else {
        where.OR = kwOr;
      }
    }

    // Prisma accepts a single object or an array of order clauses.
    type OrderClause = Record<string, 'asc' | 'desc'>;
    let orderBy: OrderClause | OrderClause[];
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'latest':
        orderBy = { listedDate: 'desc' };
        break;
      case 'featured':
      default:
        // Featured first, then newest — used by category browse + “Featured first” sort
        orderBy = [{ featured: 'desc' }, { listedDate: 'desc' }];
        break;
    }

    if (listingType === 'RENT' || listingType === 'FLATMATES') {
      if (!Array.isArray(orderBy) && orderBy.price !== undefined) {
        orderBy = {
          rentPerWeek: orderBy.price === 'asc' ? 'asc' : 'desc',
        };
      }
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(pageSize), 10) || 12));
    const skip = (pageNum - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: where as object,
        orderBy,
        skip,
        take: limit,
        include: {
          listingMedia: { orderBy: { sortOrder: 'asc' } },
          user: { select: listingOwnerBrandingSelect },
        },
      }),
      prisma.listing.count({ where: where as object }),
    ]);

    res.json({
      listings: listings.map((l) => toApiListing(l)),
      pagination: {
        total,
        page: pageNum,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('[getListings]', error);
    sendServerError(res, error);
  }
};

export const getListingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: listingInclude,
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const isOwner = req.user && listing.createdBy === req.user.id;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const publicCanSeeDetail =
      listing.status === ListingStatus.PUBLISHED ||
      listing.status === ListingStatus.SOLD ||
      listing.status === ListingStatus.RENTED ||
      listing.status === ListingStatus.WITHDRAWN;

    if (!isOwner && !isSuperAdmin && !publicCanSeeDetail) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Only count views for active on-market listings
    if (!isOwner && !isSuperAdmin && listing.status === ListingStatus.PUBLISHED) {
      await prisma.listing.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
      listing.viewCount += 1;
    }

    res.json(toApiListing(listing));
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/**
 * GET /api/listings/:id/more-from — public
 * Other published listings from the same agent, then same agency (for ad-link “You can see more”).
 */
export const getMoreFromAgentOrAgency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = Math.min(12, Math.max(1, parseInt(String(req.query.limit || '8'), 10) || 8));

    const base = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        createdBy: true,
        agencyDisplayName: true,
        user: { select: { firstName: true, lastName: true, agencyName: true, mobileNumber: true } },
      },
    });
    if (!base) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const agentName =
      [base.user?.firstName, base.user?.lastName].filter(Boolean).join(' ') ||
      base.user?.mobileNumber ||
      null;
    const agencyName = (base.user?.agencyName || base.agencyDisplayName || '').trim() || null;

    let rows: Awaited<ReturnType<typeof prisma.listing.findMany>> = [];
    if (base.createdBy) {
      rows = await prisma.listing.findMany({
        where: {
          status: ListingStatus.PUBLISHED,
          id: { not: id },
          createdBy: base.createdBy,
        },
        orderBy: [{ featured: 'desc' }, { listedDate: 'desc' }],
        take: limit,
        include: listingInclude,
      });
    }

    const fromAgentCount = rows.length;
    if (rows.length < limit && agencyName && agencyName.length >= 2) {
      const excludeIds = [id, ...rows.map((r) => r.id)];
      const fromAgency = await prisma.listing.findMany({
        where: {
          status: ListingStatus.PUBLISHED,
          id: { notIn: excludeIds },
          OR: [
            { agencyDisplayName: { equals: agencyName, mode: 'insensitive' } },
            { user: { is: { agencyName: { equals: agencyName, mode: 'insensitive' } } } },
          ],
        },
        orderBy: [{ featured: 'desc' }, { listedDate: 'desc' }],
        take: limit - rows.length,
        include: listingInclude,
      });
      rows = [...rows, ...fromAgency];
    }

    const scope =
      fromAgentCount > 0
        ? rows.length > fromAgentCount
          ? 'agent_and_agency'
          : 'agent'
        : agencyName && rows.length > 0
          ? 'agency'
          : 'none';

    res.json({
      listings: rows.map((l) => toApiListing(l)),
      total: rows.length,
      scope,
      agentName,
      agencyName,
    });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const status = resolveListingWriteStatus(body, req.user?.role);
    let ownerId = req.user!.id;

    // Super admins may create listings on behalf of themselves or any active agent.
    if (req.user?.role === 'SUPER_ADMIN' && typeof body.createdBy === 'string' && body.createdBy.trim()) {
      const targetId = body.createdBy.trim();
      if (targetId === req.user.id) {
        // Assigning to self — always valid
        ownerId = req.user.id;
      } else {
        const targetAgent = await prisma.user.findUnique({
          where: { id: targetId },
          select: { id: true, role: true, isActive: true },
        });
        if (!targetAgent || targetAgent.role !== 'AGENT') {
          return res.status(400).json({ error: 'createdBy must be a valid agent user id (or your own id)' });
        }
        if (targetAgent.isActive === false) {
          return res.status(400).json({ error: 'Cannot create listing for an inactive agent' });
        }
        ownerId = targetAgent.id;
      }
    }

    if (status === ListingStatus.PENDING_APPROVAL || status === ListingStatus.PUBLISHED) {
      const emailCheck = await assertOwnerHasEmail(ownerId);
      if (!emailCheck.ok) return res.status(400).json({ error: emailCheck.error });
    }

    const scalars = scalarDataFromBody(body);
    if (!scalars.headline) {
      return res.status(400).json({ error: 'Headline is required' });
    }
    if (!scalars.description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const media = Array.isArray(body.media) ? (body.media as ListingMediaInput[]) : [];
    const imageUrls =
      media.length > 0
        ? media.map((m) => String(m.url).trim()).filter(Boolean)
        : JSON.parse(scalars.images as string);

    const listing = await prisma.listing.create({
      data: {
        ...scalars,
        status,
        images: JSON.stringify(imageUrls),
        createdBy: ownerId,
      },
    });

    if (media.length > 0) {
      await prisma.listingMedia.createMany({
        data: mediaInputToCreate(listing.id, media),
      });
    }

    const listingUpdates = Array.isArray(body.updates) ? (body.updates as ListingUpdateInput[]) : [];
    if (listingUpdates.length > 0) {
      await prisma.listingUpdate.createMany({
        data: listingUpdates
          .filter((u) => String(u.body || '').trim())
          .map((u) => ({
            listingId: listing.id,
            authorUserId: req.user!.id,
            body: String(u.body).trim(),
          })),
      });
    }

    const openHomes = Array.isArray(body.openHomes) ? (body.openHomes as ListingOpenHomeInput[]) : [];
    for (const h of openHomes) {
      const starts = new Date(h.startsAt);
      if (Number.isNaN(starts.getTime())) continue;
      const ends = h.endsAt ? new Date(h.endsAt) : null;
      await prisma.listingOpenHome.create({
        data: {
          listingId: listing.id,
          startsAt: starts,
          endsAt: ends && !Number.isNaN(ends.getTime()) ? ends : null,
          label: h.label != null ? String(h.label).trim() || null : null,
        },
      });
    }

    const documents = Array.isArray(body.documents) ? (body.documents as ListingDocumentInput[]) : [];
    if (documents.length > 0) {
      await prisma.listingDocument.createMany({
        data: documents.map((d, i) => ({
          listingId: listing.id,
          title: String(d.title || 'Document').trim() || 'Document',
          url: d.url != null ? String(d.url).trim() || null : null,
          sortOrder: i,
        })),
      });
    }

    const full = await prisma.listing.findUniqueOrThrow({
      where: { id: listing.id },
      include: listingInclude,
    });

    if (status === ListingStatus.PENDING_APPROVAL) {
      const agent = full.user;
      void notifyListingAwaitingApproval({
        listingId: full.id,
        headline: full.headline,
        listingType: full.listingType,
        streetAddress: full.streetAddress,
        suburb: full.suburb,
        city: full.city,
        agentName:
          [agent?.firstName, agent?.lastName].filter(Boolean).join(' ') ||
          agent?.mobileNumber ||
          null,
      });
    }

    res.status(201).json(toApiListing(full));
  } catch (error: unknown) {
    console.error('[createListing]', error);
    sendServerError(res, error);
  }
};

export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.listing.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    if (!isSuperAdmin && existing.createdBy !== req.user!.id) {
      return res.status(403).json({ error: 'You can only edit your own listings' });
    }

    const body = req.body as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    if (isSuperAdmin && typeof body.createdBy === 'string' && body.createdBy.trim()) {
      const targetId = body.createdBy.trim();
      if (targetId === req.user!.id) {
        // Super admin reassigning listing to themselves
        data.createdBy = req.user!.id;
      } else {
        const targetAgent = await prisma.user.findUnique({
          where: { id: targetId },
          select: { id: true, role: true, isActive: true },
        });
        if (!targetAgent || targetAgent.role !== 'AGENT') {
          return res.status(400).json({ error: 'createdBy must be a valid agent user id (or your own id)' });
        }
        if (targetAgent.isActive === false) {
          return res.status(400).json({ error: 'Cannot assign listing to an inactive agent' });
        }
        data.createdBy = targetAgent.id;
      }
    }

    if (body.listingType != null) data.listingType = body.listingType as LT;
    if (body.status !== undefined && body.status !== null) {
      const terminal = tryParseTerminalListingStatus(body as Record<string, unknown>, {
        listingType: existing.listingType as LT,
        status: existing.status as ListingStatusType,
      });
      if (terminal !== undefined) {
        if (terminal === ListingStatus.SOLD || terminal === ListingStatus.RENTED) {
          if (existing.status !== ListingStatus.PUBLISHED) {
            return res
              .status(400)
              .json({ error: 'Only published listings can be marked sold or rented.' });
          }
        }
        if (terminal === ListingStatus.WITHDRAWN) {
          if (
            existing.status !== ListingStatus.PUBLISHED &&
            existing.status !== ListingStatus.PENDING_APPROVAL
          ) {
            return res.status(400).json({
              error: 'Only published or pending-approval listings can be withdrawn.',
            });
          }
        }
        data.status = terminal;
      } else {
        const next = resolveListingWriteStatus(body as Record<string, unknown>, req.user?.role);
        if (OFF_MARKET_STATUSES.includes(existing.status as ListingStatusType)) {
          // Field saves with "draft" in payload must not demote a closed listing
          if (bodyWantsPublished(body)) {
            data.status = next;
            if (next === ListingStatus.PUBLISHED) {
              data.listedDate = new Date();
            }
          }
        } else {
          data.status = next;
          if (
            data.status === ListingStatus.PUBLISHED &&
            existing.status !== ListingStatus.PUBLISHED
          ) {
            data.listedDate = new Date();
          }
        }
      }
    }
    if (body.headline != null) data.headline = String(body.headline).trim();
    if (body.description != null) data.description = String(body.description).trim();
    if (body.propertyType != null) data.propertyType = body.propertyType;

    const region = body.region ?? (body.location as { region?: string })?.region;
    const district = body.district ?? (body.location as { district?: string })?.district;
    const suburb = body.suburb ?? (body.location as { suburb?: string })?.suburb;
    if (region != null) data.region = region;
    if (district != null) data.district = district;
    if (suburb != null) data.suburb = suburb;

    const optString = (k: string) => {
      if (body[k] === undefined) return;
      data[k] = body[k] != null && String(body[k]).trim() ? String(body[k]).trim() : null;
    };
    const optNum = (k: string) => {
      if (body[k] === undefined) return;
      data[k] = body[k] != null && body[k] !== '' ? Number(body[k]) : null;
    };

    [
      'streetAddress',
      'city',
      'postalCode',
      'parkingDescription',
      'agencyReference',
      'externalListingNumber',
      'expectedCompletion',
      'builderName',
      'schoolZone',
      'warrantyInfo',
      'amenitiesNearby',
      'interiorHighlights',
      'layoutOptions',
      'openHomesNote',
      'marketingCopy',
      'marketingLink',
      'agencyDisplayName',
      'agencyLicense',
      'officeBranchName',
      'officePhone',
      'officeWebsite',
      'appraisalUrl',
      'listingAgentDisplayName',
      'listingAgentPhotoUrl',
      'coListingAgentName',
      'coListingAgentPhotoUrl',
      'streetViewUrl',
      'googleMapsUrl',
      'videoUrl',
      'notes',
    ].forEach(optString);

    if (body.latitude !== undefined)
      data.latitude = body.latitude != null && body.latitude !== '' ? Number(body.latitude) : null;
    if (body.longitude !== undefined)
      data.longitude =
        body.longitude != null && body.longitude !== '' ? Number(body.longitude) : null;

    if (body.price !== undefined) optNum('price');
    if (body.rentPerWeek !== undefined) optNum('rentPerWeek');
    if (body.priceNegotiable != null) data.priceNegotiable = !!body.priceNegotiable;
    if (body.bedrooms != null) data.bedrooms = Number(body.bedrooms) || 0;
    if (body.bathrooms != null) data.bathrooms = Number(body.bathrooms) || 0;
    if (body.halfBathrooms != null) data.halfBathrooms = Number(body.halfBathrooms) || 0;
    if (body.lounges != null) data.lounges = Number(body.lounges) || 0;
    if (body.livingRooms != null) data.livingRooms = Number(body.livingRooms) || 0;
    if (body.parking != null) data.parking = Number(body.parking) || 0;
    if (body.offStreetParking !== undefined) optNum('offStreetParking');
    if (body.ensuiteCount != null) data.ensuiteCount = Number(body.ensuiteCount) || 0;
    if (body.floorArea !== undefined) optNum('floorArea');
    if (body.landArea !== undefined) optNum('landArea');
    if (body.totalUnits !== undefined) optNum('totalUnits');
    if (body.soldUnits !== undefined) optNum('soldUnits');
    if (body.remainingUnits !== undefined) optNum('remainingUnits');
    if (body.featured != null) data.featured = !!body.featured;
    if (body.platinumPartner != null) data.platinumPartner = !!body.platinumPartner;

    if (body.features != null) data.features = JSON.stringify(body.features);
    if (body.images != null && !Array.isArray(body.media)) {
      data.images = JSON.stringify(body.images);
    }

    const nextStatus = (data.status as ListingStatusType | undefined) ?? existing.status;
    const goingLiveOrReview =
      nextStatus === ListingStatus.PENDING_APPROVAL || nextStatus === ListingStatus.PUBLISHED;
    if (goingLiveOrReview) {
      const ownerId =
        (typeof data.createdBy === 'string' && data.createdBy) || existing.createdBy;
      const emailCheck = await assertOwnerHasEmail(ownerId);
      if (!emailCheck.ok) return res.status(400).json({ error: emailCheck.error });
    }

    if (Object.keys(data).length > 0) {
      await prisma.listing.update({
        where: { id },
        data: data as Parameters<typeof prisma.listing.update>[0]['data'],
      });
    }

    await replaceNestedListingData(id, body, req.user!.id);

    const full = await prisma.listing.findUniqueOrThrow({
      where: { id },
      include: listingInclude,
    });

    const enteredPending =
      full.status === ListingStatus.PENDING_APPROVAL &&
      existing.status !== ListingStatus.PENDING_APPROVAL;
    if (enteredPending) {
      const agent = full.user;
      void notifyListingAwaitingApproval({
        listingId: full.id,
        headline: full.headline,
        listingType: full.listingType,
        streetAddress: full.streetAddress,
        suburb: full.suburb,
        city: full.city,
        agentName:
          [agent?.firstName, agent?.lastName].filter(Boolean).join(' ') ||
          agent?.mobileNumber ||
          null,
      });
    }

    res.json(toApiListing(full));
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.listing.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (req.user?.role !== 'SUPER_ADMIN' && existing.createdBy !== req.user!.id) {
      return res.status(403).json({ error: 'You can only delete your own listings' });
    }

    await prisma.listing.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** GET /api/listings/pending-approval — super admin */
export const getPendingApprovalListings = async (req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.listing.findMany({
      where: { status: ListingStatus.PENDING_APPROVAL },
      orderBy: { updatedDate: 'desc' },
      include: listingInclude,
    });

    const listings = rows.map((l) => {
      const api = toApiListing(l);
      const u = l.user;
      const agentDisplayName =
        [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.mobileNumber || undefined;
      return {
        ...api,
        agentDisplayName,
        agentMobile: u?.mobileNumber ?? undefined,
      };
    });

    res.json({ listings, total: listings.length });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** POST /api/listings/:id/approve-publish — super admin */
export const approveListingPublish = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (existing.status !== ListingStatus.PENDING_APPROVAL) {
      return res.status(400).json({ error: 'Listing is not awaiting approval' });
    }

    const emailCheck = await assertOwnerHasEmail(existing.createdBy);
    if (!emailCheck.ok) return res.status(400).json({ error: emailCheck.error });

    const full = await prisma.listing.update({
      where: { id },
      data: {
        status: ListingStatus.PUBLISHED,
        listedDate: new Date(),
      },
      include: listingInclude,
    });

    res.json(toApiListing(full));
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

// ─── Admin: all listings (for campaign wizard listing picker) ─────────────────

/** GET /api/admin/listings — super admin */
export const adminGetListings = async (req: AuthRequest, res: Response) => {
  try {
    const page     = Math.max(1, parseInt(String(req.query.page  ?? '1'),  10));
    const pageSize = Math.min(200, Math.max(1, parseInt(String(req.query.pageSize ?? '50'), 10)));
    const status   = req.query.status ? String(req.query.status) : undefined;

    const where = status ? { status: status as ListingStatusType } : {};

    const [rows, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: [{ status: 'asc' }, { listedDate: 'desc' }],
        skip:  (page - 1) * pageSize,
        take:  pageSize,
        include: {
          listingMedia: { orderBy: { sortOrder: 'asc' } },
          user: { select: listingOwnerBrandingSelect },
          listingUpdates: false,
          openHomes: false,
          documents: false,
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const listings = rows.map((row) => toApiListing(row as Parameters<typeof toApiListing>[0]));
    res.json({ listings, total, page, pageSize });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

// ─── Listing marketing media ──────────────────────────────────────────────────

const MARKETING_KINDS = new Set([
  'PHOTO',
  'VIDEO',
  'REEL',
  'FLYER',
  'CAROUSEL',
  'EXTERIOR',
  'INTERIOR',
  'FLOORPLAN',
  'AERIAL',
  'OTHER',
]);

/** Media kinds managed only via /marketing — never overwritten by the listing photo gallery save. */
const CAMPAIGN_KINDS = ['VIDEO', 'REEL', 'FLYER', 'CAROUSEL'];

/** GET /api/listings/:id/marketing — returns campaign media (video/reel/flyer/carousel) */
export const getListingMarketing = async (req: AuthRequest, res: Response) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        listingMedia: {
          where: { kind: { in: CAMPAIGN_KINDS } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!listing) { res.status(404).json({ error: 'Listing not found' }); return; }
    res.json({ media: listing.listingMedia });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** POST /api/listings/:id/marketing — agent or super admin */
export const addListingMarketing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) { res.status(404).json({ error: 'Listing not found' }); return; }

    const { url, kind = 'REEL', caption, sortOrder } = req.body as {
      url: string; kind?: string; caption?: string; sortOrder?: number;
    };

    if (!url?.trim()) { res.status(400).json({ error: 'url is required' }); return; }
    const upper = String(kind || '').toUpperCase();
    if (!CAMPAIGN_KINDS.includes(upper)) {
      res.status(400).json({ error: `kind must be one of: ${CAMPAIGN_KINDS.join(', ')}` });
      return;
    }
    const resolvedKind = upper;

    const item = await prisma.listingMedia.create({
      data: {
        listingId: id,
        url:       url.trim(),
        kind:      resolvedKind,
        caption:   caption?.trim() ?? null,
        sortOrder: sortOrder ?? 1000,
      },
    });
    res.status(201).json({ media: item });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** DELETE /api/listings/:id/marketing/:mediaId — agent or super admin */
export const deleteListingMarketing = async (req: AuthRequest, res: Response) => {
  try {
    const { id, mediaId } = req.params;
    const item = await prisma.listingMedia.findFirst({ where: { id: mediaId, listingId: id } });
    if (!item) { res.status(404).json({ error: 'Media item not found' }); return; }
    await prisma.listingMedia.delete({ where: { id: mediaId } });
    res.json({ success: true });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** POST /api/listings/:id/enquiries — public */
export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
    if (!listing || listing.status !== ListingStatus.PUBLISHED) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const { name, email, phone, message } = req.body as Record<string, string>;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    let siteHost: string | undefined;
    try {
      siteHost = new URL(process.env.SITE_URL || 'https://kaboohomes.com').hostname;
    } catch {
      siteHost = undefined;
    }
    const attribution = parseEnquiryAttribution(
      (req.body as { attribution?: EnquiryAttributionInput }).attribution,
      siteHost
    );
    let campaignId: string | null = null;
    if (attribution.utmCampaign && /^[0-9a-f-]{36}$/i.test(attribution.utmCampaign)) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: attribution.utmCampaign },
        select: { id: true },
      });
      campaignId = campaign?.id ?? null;
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        listingId: id,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        message: message.trim(),
        source: attribution.source,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
        campaignId,
        referrer: attribution.referrer,
      },
    });
    const sourceLabel = leadSourceLabel(attribution.source);
    const leadSource = sourceLabel
      ? `${sourceLabel}${attribution.utmMedium === 'social' ? ' post' : ''}${campaignId ? ' (Kaboo campaign)' : ''}`
      : undefined;

    const addressParts = [listing.streetAddress, listing.suburb, listing.city].filter(Boolean);
    const listingAddress = addressParts.length > 0 ? addressParts.join(', ') : listing.headline;
    const isViewingRequest = /viewing|open home/i.test(message);
    const agentEmail = listing.user?.email?.trim() || '';
    const agentName =
      [listing.user?.firstName, listing.user?.lastName].filter(Boolean).join(' ') || 'Agent';
    const buyerEmail = email.trim();
    const buyerName = name.trim();

    const attempts: EmailAttemptAudit[] = [];
    const nowIso = () => new Date().toISOString();
    const smtpOk = isEmailConfigured();

    const pushAttempt = (a: EmailAttemptAudit) => {
      attempts.push(a);
      console.log(
        `[enquiry] email ${a.role} → ${a.to.join(', ') || '(none)'} :: ${a.status}${a.error ? ` :: ${a.error}` : ''}`
      );
    };

    if (!smtpOk) {
      pushAttempt({
        role: 'agent',
        to: agentEmail ? [agentEmail] : [],
        status: 'skipped',
        error: 'SMTP not configured on server',
        at: nowIso(),
      });
      pushAttempt({
        role: 'admin',
        to: [],
        status: 'skipped',
        error: 'SMTP not configured on server',
        at: nowIso(),
      });
      pushAttempt({
        role: 'buyer',
        to: [buyerEmail],
        status: 'skipped',
        error: 'SMTP not configured on server',
        at: nowIso(),
      });
    } else {
      // 1) Agent — always attempt separately so admin/buyer still send if this fails
      if (agentEmail) {
        try {
          const r = await sendEnquiryEmail({
            to: agentEmail,
            recipientName: agentName,
            listingAddress,
            listingId: id,
            enquirerName: buyerName,
            enquirerEmail: buyerEmail,
            enquirerPhone: phone?.trim() || undefined,
            message: message.trim(),
            isViewingRequest,
            leadSource,
          });
          pushAttempt({
            role: 'agent',
            to: [agentEmail],
            status: 'sent',
            messageId: r.messageId,
            at: nowIso(),
          });
        } catch (emailErr) {
          pushAttempt({
            role: 'agent',
            to: [agentEmail],
            status: 'failed',
            error: formatEmailError(emailErr),
            at: nowIso(),
          });
        }
      } else {
        pushAttempt({
          role: 'agent',
          to: [],
          status: 'skipped',
          error: 'Listing agent has no email on their profile',
          at: nowIso(),
        });
      }

      // 2) Admin inbox — ENQUIRY_NOTIFY_EMAIL, else all SUPER_ADMIN emails (always notify app admin)
      const adminEmails = new Set<string>(getEnquiryNotifyEmails().map((e) => e.toLowerCase()));
      if (adminEmails.size === 0) {
        const admins = await prisma.user.findMany({
          where: { role: 'SUPER_ADMIN', isActive: true },
          select: { email: true },
          take: 20,
        });
        for (const a of admins) {
          if (a.email?.trim()) adminEmails.add(a.email.trim().toLowerCase());
        }
      }
      // Don't duplicate the agent if they are also a listed admin
      if (agentEmail) adminEmails.delete(agentEmail.toLowerCase());

      const adminList = [...adminEmails];
      if (adminList.length > 0) {
        try {
          const r = await sendEnquiryEmail({
            to: adminList,
            recipientName: 'Admin',
            listingAddress,
            listingId: id,
            enquirerName: buyerName,
            enquirerEmail: buyerEmail,
            enquirerPhone: phone?.trim() || undefined,
            message: message.trim(),
            isViewingRequest,
            leadSource,
            note: agentEmail
              ? `Copy for app admin. Listing agent (${agentName}) was also notified at ${agentEmail}.`
              : 'Listing agent has no email on file — admin inbox is the primary notification.',
          });
          pushAttempt({
            role: 'admin',
            to: adminList,
            status: 'sent',
            messageId: r.messageId,
            at: nowIso(),
          });
        } catch (emailErr) {
          pushAttempt({
            role: 'admin',
            to: adminList,
            status: 'failed',
            error: formatEmailError(emailErr),
            at: nowIso(),
          });
        }
      } else {
        pushAttempt({
          role: 'admin',
          to: [],
          status: 'skipped',
          error: 'No ENQUIRY_NOTIFY_EMAIL and no SUPER_ADMIN user emails on file',
          at: nowIso(),
        });
      }

      // 3) Buyer confirmation
      try {
        const r = await sendBuyerEnquiryConfirmation({
          buyerEmail,
          buyerName,
          listingAddress,
          listingId: id,
        });
        pushAttempt({
          role: 'buyer',
          to: [buyerEmail],
          status: 'sent',
          messageId: r.messageId,
          at: nowIso(),
        });
      } catch (emailErr) {
        pushAttempt({
          role: 'buyer',
          to: [buyerEmail],
          status: 'failed',
          error: formatEmailError(emailErr),
          at: nowIso(),
        });
      }
    }

    const audit: EnquiryEmailAudit = {
      smtpConfigured: smtpOk,
      from: getEmailFromAddress(),
      attempts,
      completedAt: nowIso(),
    };

    try {
      await prisma.enquiry.update({
        where: { id: enquiry.id },
        data: { emailAudit: JSON.stringify(audit) },
      });
    } catch (auditErr) {
      console.error('[enquiry] Failed to persist emailAudit:', auditErr);
    }

    res.status(201).json({
      success: true,
      emailAudit: audit,
    });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** GET /api/admin/enquiries — super admin listing-form enquiries inbox */
export const listEnquiries = async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || '25'), 10) || 25));
    const q = String(req.query.q || '').trim();
    const sourceFilter = String(req.query.source || '').trim().toLowerCase();
    const campaignFilter = String(req.query.campaignId || '').trim();

    const where = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { email: { contains: q, mode: 'insensitive' as const } },
              { phone: { contains: q, mode: 'insensitive' as const } },
              { message: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(sourceFilter === 'direct'
        ? { source: null }
        : (LEAD_SOURCES as readonly string[]).includes(sourceFilter)
          ? { source: sourceFilter }
          : {}),
      ...(campaignFilter ? { campaignId: campaignFilter } : {}),
    };

    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          listing: {
            select: {
              id: true,
              headline: true,
              listingType: true,
              streetAddress: true,
              suburb: true,
              city: true,
              status: true,
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
        },
      }),
      prisma.enquiry.count({ where }),
    ]);

    const campaignIds = [...new Set(enquiries.map((e) => e.campaignId).filter((v): v is string => !!v))];
    const campaigns = campaignIds.length
      ? await prisma.campaign.findMany({ where: { id: { in: campaignIds } }, select: { id: true, title: true } })
      : [];
    const campaignTitles = new Map(campaigns.map((c) => [c.id, c.title]));

    res.json({
      enquiries: enquiries.map((e) => {
        let emailAudit: unknown = null;
        if (e.emailAudit) {
          try {
            emailAudit = JSON.parse(e.emailAudit);
          } catch {
            emailAudit = { raw: e.emailAudit };
          }
        }
        return {
          id: e.id,
          name: e.name,
          email: e.email,
          phone: e.phone,
          message: e.message,
          createdAt: e.createdAt,
          emailAudit,
          source: e.source,
          utmMedium: e.utmMedium,
          utmCampaign: e.utmCampaign,
          referrer: e.referrer,
          campaign: e.campaignId
            ? { id: e.campaignId, title: campaignTitles.get(e.campaignId) ?? null }
            : null,
          listing: e.listing
            ? {
                id: e.listing.id,
                headline: e.listing.headline,
                listingType: e.listing.listingType,
                address: [e.listing.streetAddress, e.listing.suburb, e.listing.city]
                  .filter(Boolean)
                  .join(', '),
                status: e.listing.status,
                agent: e.listing.user
                  ? {
                      id: e.listing.user.id,
                      name:
                        [e.listing.user.firstName, e.listing.user.lastName].filter(Boolean).join(' ') ||
                        null,
                      email: e.listing.user.email,
                    }
                  : null,
              }
            : null,
        };
      }),
      total,
      page,
      pageSize,
    });
  } catch (error: unknown) {
    sendServerError(res, error, { fn: 'listEnquiries' });
  }
};
