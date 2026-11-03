export type ListingType = 'SALE' | 'RENT' | 'FLATMATES';
export type ListingStatus =
  | 'draft'
  | 'pending_approval'
  | 'published'
  | 'sold'
  | 'rented'
  | 'withdrawn';
export type PropertyType = 'House' | 'Apartment' | 'Unit' | 'Townhouse' | 'Lifestyle' | 'Land' | 'Other';
export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'latest';

export type ListingMediaKind = 'PHOTO' | 'EXTERIOR' | 'INTERIOR' | 'FLOORPLAN' | 'AERIAL' | 'OTHER' | 'VIDEO' | 'REEL';

export interface Location {
  region: string;
  district: string;
  suburb: string;
}

export interface ListingMediaItem {
  id?: string;
  url: string;
  kind?: ListingMediaKind;
  caption?: string;
}

export interface ListingUpdateItem {
  id?: string;
  body: string;
  createdAt?: string;
  authorName?: string;
}

export interface ListingOpenHomeItem {
  id?: string;
  startsAt: string;
  endsAt?: string;
  label?: string;
}

export interface ListingDocumentItem {
  id?: string;
  title: string;
  url?: string;
}

export interface Listing {
  id: string;
  listingType: ListingType;
  status: ListingStatus;
  headline: string;
  description: string;
  location: Location;
  propertyType: PropertyType;

  streetAddress?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;

  // Pricing
  price?: number;
  rentPerWeek?: number;
  priceNegotiable?: boolean;

  // Property details
  bedrooms: number;
  bathrooms: number;
  halfBathrooms?: number;
  lounges?: number;
  livingRooms?: number;
  parking: number;
  offStreetParking?: number;
  ensuiteCount?: number;
  parkingDescription?: string;
  floorArea?: number;
  landArea?: number;

  // Listing / portal metadata
  agencyReference?: string;
  externalListingNumber?: string;
  viewCount?: number;

  // Development-style
  totalUnits?: number;
  soldUnits?: number;
  remainingUnits?: number;
  expectedCompletion?: string;

  // Rich text blocks
  builderName?: string;
  schoolZone?: string;
  warrantyInfo?: string;
  amenitiesNearby?: string;
  interiorHighlights?: string;
  layoutOptions?: string;
  openHomesNote?: string;
  /** Paste-ready ad/post copy for Meta campaigns */
  marketingCopy?: string;
  /** Deep link back to this property page (used in ads / posts) */
  marketingLink?: string;

  // Agency / office / agents (resolved for API responses — edit on agent profile, not listing form)
  agencyDisplayName?: string;
  agencyLogoUrl?: string;
  agencyBrandColor?: string;
  agencyLicense?: string;
  officeBranchName?: string;
  officePhone?: string;
  whatsappNumber?: string;
  officeWebsite?: string;
  appraisalUrl?: string;
  featured?: boolean;
  platinumPartner?: boolean;

  listingAgentDisplayName?: string;
  listingAgentPhotoUrl?: string;
  coListingAgentName?: string;
  coListingAgentPhotoUrl?: string;

  streetViewUrl?: string;
  googleMapsUrl?: string;

  /** S3 URL of the property walkthrough video (mp4/webm/mov). Shown as Video badge on listing cards. */
  videoUrl?: string;

  features: string[];
  images: string[];

  /** Ordered gallery with kinds (floor plans, aerial, etc.) */
  media?: ListingMediaItem[];
  updates?: ListingUpdateItem[];
  openHomes?: ListingOpenHomeItem[];
  documents?: ListingDocumentItem[];

  listedDate: string;
  updatedDate?: string;
  createdBy?: string;
  notes?: string;

  /** Owner profile — populated by getMyListings when user relation is included */
  listingOwner?: {
    role?: 'SUPER_ADMIN' | 'AGENT' | 'PENDING';
    firstName?: string | null;
    lastName?: string | null;
    mobileNumber?: string;
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
  };
}

export interface FilterState {
  listingType: ListingType;
  region?: string;
  district?: string;
  suburb?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minParking?: number;
  propertyType?: PropertyType;
  keyword?: string;
}

export interface LocationHierarchy {
  [region: string]: {
    [district: string]: string[];
  };
}
