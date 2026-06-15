import type { MediaKind } from '../types/enums.js';

export type ListingMediaInput = {
  url: string;
  kind?: string;
  caption?: string | null;
};

export type ListingUpdateInput = { body: string };
export type ListingOpenHomeInput = {
  startsAt: string;
  endsAt?: string | null;
  label?: string | null;
};
export type ListingDocumentInput = {
  title: string;
  url?: string | null;
};

function parseMediaKind(k?: string): MediaKind {
  const u = String(k || 'PHOTO').toUpperCase();
  const allowed = ['PHOTO', 'EXTERIOR', 'INTERIOR', 'FLOORPLAN', 'AERIAL', 'OTHER'] as const;
  return (allowed.includes(u as (typeof allowed)[number]) ? u : 'PHOTO') as MediaKind;
}

export function mediaInputToCreate(
  listingId: string,
  items: ListingMediaInput[]
): { listingId: string; url: string; kind: MediaKind; caption: string | null; sortOrder: number }[] {
  return items.map((m, i) => ({
    listingId,
    url: String(m.url).trim(),
    kind: parseMediaKind(m.kind),
    caption: m.caption != null && String(m.caption).trim() ? String(m.caption).trim() : null,
    sortOrder: i,
  }));
}

type ListingRow = {
  id: string;
  listingType: string;
  status: string;
  headline: string;
  description: string;
  propertyType: string;
  region: string;
  district: string;
  suburb: string;
  streetAddress: string | null;
  city: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number | null;
  rentPerWeek: number | null;
  priceNegotiable: boolean;
  bedrooms: number;
  bathrooms: number;
  halfBathrooms: number;
  parking: number;
  offStreetParking: number | null;
  ensuiteCount: number;
  parkingDescription: string | null;
  floorArea: number | null;
  landArea: number | null;
  agencyReference: string | null;
  externalListingNumber: string | null;
  viewCount: number;
  totalUnits: number | null;
  soldUnits: number | null;
  remainingUnits: number | null;
  expectedCompletion: string | null;
  builderName: string | null;
  schoolZone: string | null;
  warrantyInfo: string | null;
  amenitiesNearby: string | null;
  interiorHighlights: string | null;
  layoutOptions: string | null;
  openHomesNote: string | null;
  agencyDisplayName: string | null;
  agencyLicense: string | null;
  officeBranchName: string | null;
  officePhone: string | null;
  officeWebsite: string | null;
  appraisalUrl: string | null;
  platinumPartner: boolean;
  listingAgentDisplayName: string | null;
  listingAgentPhotoUrl: string | null;
  coListingAgentName: string | null;
  coListingAgentPhotoUrl: string | null;
  streetViewUrl: string | null;
  googleMapsUrl: string | null;
  videoUrl: string | null;
  features: string | null;
  images: string | null;
  listedDate: Date;
  updatedDate: Date | null;
  createdBy: string | null;
  notes: string | null;
  listingMedia?: { id: string; url: string; kind: string; caption: string | null; sortOrder: number }[];
  listingUpdates?: {
    id: string;
    body: string;
    createdAt: Date;
    authorUserId: string | null;
    author: { firstName: string | null; lastName: string | null } | null;
  }[];
  openHomes?: { id: string; startsAt: Date; endsAt: Date | null; label: string | null }[];
  documents?: { id: string; title: string; url: string | null; sortOrder: number }[];
  user?: {
    role: string;
    firstName: string | null;
    lastName: string | null;
    mobileNumber: string;
    agencyName?: string | null;
    licenseNumber?: string | null;
    profilePhotoUrl?: string | null;
    officeBranchName?: string | null;
    officePhone?: string | null;
    officeWebsite?: string | null;
    appraisalUrl?: string | null;
    platinumPartner?: boolean;
    listingAgentDisplayName?: string | null;
    listingAgentPhotoUrl?: string | null;
    coListingAgentName?: string | null;
    coListingAgentPhotoUrl?: string | null;
  } | null;
};

export function deriveImageUrls(listing: ListingRow): string[] {
  if (listing.listingMedia && listing.listingMedia.length > 0) {
    return [...listing.listingMedia]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((m) => m.url);
  }
  try {
    return JSON.parse(listing.images || '[]');
  } catch {
    return [];
  }
}

export function toApiListing(listing: ListingRow) {
  const listedDate =
    listing.listedDate instanceof Date ? listing.listedDate : new Date(listing.listedDate as string);
  const updatedDate =
    listing.updatedDate instanceof Date
      ? listing.updatedDate
      : listing.updatedDate
        ? new Date(listing.updatedDate as string)
        : listedDate;

  const images = deriveImageUrls(listing);

  const u = listing.user;
  const ownerName = u && [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  // Agent/office branding: prefer agent profile (User), fall back to legacy per-listing columns
  // Display name: prefer profile override, then owner's real name.
  // Skip the old per-listing column — it had placeholder values ("Lucy Clements", etc.).
  const agentDisplayName =
    u?.listingAgentDisplayName?.trim() ||
    ownerName ||
    undefined;
  // Photo: prefer listing-specific override from agent profile, then profile photo.
  // The old per-listing column had placeholder junk values ("Not provided", etc.) so we skip it.
  const agentPhotoUrl =
    u?.listingAgentPhotoUrl?.trim() ||
    u?.profilePhotoUrl?.trim() ||
    undefined;
  const agencyDisplayName = u?.agencyName?.trim() || listing.agencyDisplayName || undefined;
  const agencyLicense = u?.licenseNumber?.trim() || listing.agencyLicense || undefined;
  const officeBranchName = u?.officeBranchName?.trim() || listing.officeBranchName || undefined;
  const officePhone = u?.officePhone?.trim() || listing.officePhone || undefined;
  const officeWebsite = u?.officeWebsite?.trim() || listing.officeWebsite || undefined;
  const appraisalUrl = u?.appraisalUrl?.trim() || listing.appraisalUrl || undefined;
  const platinumPartner = Boolean(u?.platinumPartner) || listing.platinumPartner;
  // Co-listing: agent profile only — the old per-listing column had placeholder junk values
  const coListingAgentName = u?.coListingAgentName?.trim() || undefined;
  const coListingAgentPhotoUrl = u?.coListingAgentPhotoUrl?.trim() || undefined;

  const base = {
    id: listing.id,
    listingType: listing.listingType,
    status: (() => {
      const s = listing.status.toLowerCase();
      if (s === 'published') return 'published' as const;
      if (s === 'pending_approval') return 'pending_approval' as const;
      if (s === 'sold') return 'sold' as const;
      if (s === 'rented') return 'rented' as const;
      if (s === 'withdrawn') return 'withdrawn' as const;
      return 'draft' as const;
    })(),
    headline: listing.headline,
    description: listing.description,
    location: {
      region: listing.region,
      district: listing.district,
      suburb: listing.suburb,
    },
    streetAddress: listing.streetAddress ?? undefined,
    city: listing.city ?? undefined,
    postalCode: listing.postalCode ?? undefined,
    latitude: listing.latitude ?? undefined,
    longitude: listing.longitude ?? undefined,
    propertyType: listing.propertyType,
    price: listing.price ?? undefined,
    rentPerWeek: listing.rentPerWeek ?? undefined,
    priceNegotiable: listing.priceNegotiable,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    halfBathrooms: listing.halfBathrooms,
    parking: listing.parking,
    offStreetParking: listing.offStreetParking ?? undefined,
    ensuiteCount: listing.ensuiteCount,
    parkingDescription: listing.parkingDescription ?? undefined,
    floorArea: listing.floorArea ?? undefined,
    landArea: listing.landArea ?? undefined,
    agencyReference: listing.agencyReference ?? undefined,
    externalListingNumber: listing.externalListingNumber ?? undefined,
    viewCount: listing.viewCount,
    totalUnits: listing.totalUnits ?? undefined,
    soldUnits: listing.soldUnits ?? undefined,
    remainingUnits: listing.remainingUnits ?? undefined,
    expectedCompletion: listing.expectedCompletion ?? undefined,
    builderName: listing.builderName ?? undefined,
    schoolZone: listing.schoolZone ?? undefined,
    warrantyInfo: listing.warrantyInfo ?? undefined,
    amenitiesNearby: listing.amenitiesNearby ?? undefined,
    interiorHighlights: listing.interiorHighlights ?? undefined,
    layoutOptions: listing.layoutOptions ?? undefined,
    openHomesNote: listing.openHomesNote ?? undefined,
    agencyDisplayName,
    agencyLicense,
    officeBranchName,
    officePhone,
    officeWebsite,
    appraisalUrl,
    platinumPartner,
    listingAgentDisplayName: agentDisplayName,
    listingAgentPhotoUrl: agentPhotoUrl,
    coListingAgentName,
    coListingAgentPhotoUrl,
    streetViewUrl: listing.streetViewUrl ?? undefined,
    googleMapsUrl: listing.googleMapsUrl ?? undefined,
    videoUrl: listing.videoUrl ?? undefined,
    features: (() => {
      try {
        return JSON.parse(listing.features || '[]');
      } catch {
        return [];
      }
    })(),
    images,
    listedDate: listedDate.toISOString(),
    updatedDate: updatedDate.toISOString(),
    createdBy: listing.createdBy ?? undefined,
    notes: listing.notes ?? undefined,
    // Resolved owner — populated when user relation is included in the query
    ...(listing.user
      ? {
          listingOwner: {
            role: listing.user.role,
            firstName: listing.user.firstName,
            lastName: listing.user.lastName,
            mobileNumber: listing.user.mobileNumber,
            agencyName: listing.user.agencyName ?? undefined,
            licenseNumber: listing.user.licenseNumber ?? undefined,
            profilePhotoUrl: listing.user.profilePhotoUrl ?? undefined,
            officeBranchName: listing.user.officeBranchName ?? undefined,
            officePhone: listing.user.officePhone ?? undefined,
            officeWebsite: listing.user.officeWebsite ?? undefined,
            appraisalUrl: listing.user.appraisalUrl ?? undefined,
            platinumPartner: listing.user.platinumPartner ?? false,
            listingAgentDisplayName: listing.user.listingAgentDisplayName ?? undefined,
            listingAgentPhotoUrl: listing.user.listingAgentPhotoUrl ?? undefined,
            coListingAgentName: listing.user.coListingAgentName ?? undefined,
            coListingAgentPhotoUrl: listing.user.coListingAgentPhotoUrl ?? undefined,
          },
        }
      : {}),
  };

  if (listing.listingMedia && listing.listingMedia.length > 0) {
    (base as Record<string, unknown>).media = [...listing.listingMedia]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((m) => ({
        id: m.id,
        url: m.url,
        kind: m.kind,
        caption: m.caption ?? undefined,
      }));
  }

  if (listing.listingUpdates && listing.listingUpdates.length > 0) {
    (base as Record<string, unknown>).updates = listing.listingUpdates.map((u) => ({
      id: u.id,
      body: u.body,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
      authorName:
        u.author && (u.author.firstName || u.author.lastName)
          ? [u.author.firstName, u.author.lastName].filter(Boolean).join(' ')
          : undefined,
    }));
  }

  if (listing.openHomes && listing.openHomes.length > 0) {
    (base as Record<string, unknown>).openHomes = listing.openHomes.map((o) => ({
      id: o.id,
      startsAt: o.startsAt instanceof Date ? o.startsAt.toISOString() : String(o.startsAt),
      endsAt: o.endsAt ? (o.endsAt instanceof Date ? o.endsAt.toISOString() : String(o.endsAt)) : undefined,
      label: o.label ?? undefined,
    }));
  }

  if (listing.documents && listing.documents.length > 0) {
    (base as Record<string, unknown>).documents = listing.documents.map((d) => ({
      id: d.id,
      title: d.title,
      url: d.url ?? undefined,
    }));
  }

  return base;
}
