export type ListingType = 'SALE' | 'RENT' | 'FLATMATES';
export type ListingStatus = 'DRAFT' | 'PUBLISHED';
export type PropertyType = 'House' | 'Apartment' | 'Unit' | 'Townhouse' | 'Lifestyle' | 'Land' | 'Other';
export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'latest';

export interface Location {
  region: string;
  district: string;
  suburb: string;
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
  propertyType?: PropertyType;
  keyword?: string;
}
