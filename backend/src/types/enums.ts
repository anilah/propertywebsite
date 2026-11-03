/**
 * Enum constants for Aurora DSQL compatibility.
 * Aurora DSQL does not support native PostgreSQL enums (CREATE TYPE AS ENUM).
 * Schema stores these as String columns; these const objects preserve the same
 * dot-notation usage as Prisma-generated enums (e.g. ListingStatus.DRAFT).
 */

export const ListingType = {
  SALE: 'SALE',
  RENT: 'RENT',
  FLATMATES: 'FLATMATES',
} as const;
export type ListingType = (typeof ListingType)[keyof typeof ListingType];

export const ListingStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  PUBLISHED: 'PUBLISHED',
  SOLD: 'SOLD',
  RENTED: 'RENTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;
export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];

export const PropertyType = {
  House: 'House',
  Apartment: 'Apartment',
  Unit: 'Unit',
  Townhouse: 'Townhouse',
  Lifestyle: 'Lifestyle',
  Land: 'Land',
  Other: 'Other',
} as const;
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  AGENT: 'AGENT',
  PENDING: 'PENDING',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const MediaKind = {
  PHOTO: 'PHOTO',
  EXTERIOR: 'EXTERIOR',
  INTERIOR: 'INTERIOR',
  FLOORPLAN: 'FLOORPLAN',
  AERIAL: 'AERIAL',
  OTHER: 'OTHER',
} as const;
export type MediaKind = (typeof MediaKind)[keyof typeof MediaKind];
