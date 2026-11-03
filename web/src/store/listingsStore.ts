import { create } from 'zustand';
import { Listing, FilterState, SortOption } from '../types';
import { mockListings } from '../data/mockListings';

interface ListingsStore {
  listings: Listing[];
  
  // Filtering and sorting
  filters: FilterState;
  sortBy: SortOption;
  currentPage: number;
  pageSize: number;
  
  // Actions
  setFilters: (filters: Partial<FilterState>) => void;
  setSortBy: (sort: SortOption) => void;
  setCurrentPage: (page: number) => void;
  
  // Filtered and sorted listings
  getFilteredListings: () => Listing[];
  
  // Admin actions
  addListing: (listing: Listing) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  getListingById: (id: string) => Listing | undefined;
}

export const useListingsStore = create<ListingsStore>((set, get) => ({
  listings: mockListings,
  filters: {
    listingType: 'SALE',
  },
  sortBy: 'featured',
  currentPage: 1,
  pageSize: 12,
  
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    }));
  },
  
  setSortBy: (sort) => {
    set({ sortBy: sort, currentPage: 1 });
  },
  
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },
  
  getFilteredListings: () => {
    const { listings, filters, sortBy } = get();
    let filtered = [...listings];
    
    // Filter by listing type
    filtered = filtered.filter((listing) => listing.listingType === filters.listingType);
    
    // Filter by status (only show published for public views, but we'll handle this in admin separately)
    filtered = filtered.filter((listing) => listing.status === 'published');
    
    // Filter by location
    if (filters.region) {
      filtered = filtered.filter((listing) => listing.location.region === filters.region);
    }
    if (filters.district) {
      filtered = filtered.filter((listing) => listing.location.district === filters.district);
    }
    if (filters.suburb) {
      filtered = filtered.filter((listing) => listing.location.suburb === filters.suburb);
    }
    
    // Filter by price range
    if (filters.listingType === 'SALE' && filters.minPrice !== undefined) {
      filtered = filtered.filter((listing) => {
        if (listing.priceNegotiable) return true; // Include negotiable listings
        return listing.price !== undefined && listing.price >= filters.minPrice!;
      });
    }
    if (filters.listingType === 'SALE' && filters.maxPrice !== undefined) {
      filtered = filtered.filter((listing) => {
        if (listing.priceNegotiable) return true; // Include negotiable listings
        return listing.price !== undefined && listing.price <= filters.maxPrice!;
      });
    }
    if (filters.listingType !== 'SALE' && filters.minPrice !== undefined) {
      filtered = filtered.filter((listing) => {
        return listing.rentPerWeek !== undefined && listing.rentPerWeek >= filters.minPrice!;
      });
    }
    if (filters.listingType !== 'SALE' && filters.maxPrice !== undefined) {
      filtered = filtered.filter((listing) => {
        return listing.rentPerWeek !== undefined && listing.rentPerWeek <= filters.maxPrice!;
      });
    }
    
    // Filter by bedrooms
    if (filters.minBedrooms !== undefined) {
      filtered = filtered.filter((listing) => listing.bedrooms >= filters.minBedrooms!);
    }
    
    // Filter by bathrooms
    if (filters.minBathrooms !== undefined) {
      filtered = filtered.filter((listing) => listing.bathrooms >= filters.minBathrooms!);
    }
    
    // Filter by property type
    if (filters.propertyType) {
      filtered = filtered.filter((listing) => listing.propertyType === filters.propertyType);
    }
    
    // Filter by keyword (search in headline, suburb, and description)
    if (filters.keyword && filters.keyword.trim()) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter((listing) => {
        return (
          listing.headline.toLowerCase().includes(keyword) ||
          listing.location.suburb.toLowerCase().includes(keyword) ||
          listing.description.toLowerCase().includes(keyword)
        );
      });
    }
    
    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = a.listingType === 'SALE' ? (a.price || Infinity) : (a.rentPerWeek || Infinity);
          const priceB = b.listingType === 'SALE' ? (b.price || Infinity) : (b.rentPerWeek || Infinity);
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = a.listingType === 'SALE' ? (a.price || 0) : (a.rentPerWeek || 0);
          const priceB = b.listingType === 'SALE' ? (b.price || 0) : (b.rentPerWeek || 0);
          return priceB - priceA;
        });
        break;
      case 'latest':
        filtered.sort((a, b) => {
          return new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime();
        });
        break;
      case 'featured':
      default:
        // For featured, we can keep original order or sort by listedDate desc
        filtered.sort((a, b) => {
          return new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime();
        });
        break;
    }
    
    return filtered;
  },
  
  addListing: (listing) => {
    set((state) => ({
      listings: [...state.listings, listing],
    }));
  },
  
  updateListing: (id, updates) => {
    set((state) => ({
      listings: state.listings.map((listing) =>
        listing.id === id ? { ...listing, ...updates, updatedDate: new Date().toISOString() } : listing
      ),
    }));
  },
  
  deleteListing: (id) => {
    set((state) => ({
      listings: state.listings.filter((listing) => listing.id !== id),
    }));
  },
  
  getListingById: (id) => {
    return get().listings.find((listing) => listing.id === id);
  },
}));

