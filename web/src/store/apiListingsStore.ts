import { create } from 'zustand';
import { Listing, FilterState, SortOption } from '../types';
import { listingsApi, ListingsResponse } from '../services/api';
import { isPublicSiteEnabled } from '../config/features';

interface ApiListingsStore {
  listings: Listing[];
  myListings: Listing[];
  loading: boolean;
  myListingsLoading: boolean;
  error: string | null;
  
  // Filtering and sorting
  filters: FilterState;
  sortBy: SortOption;
  currentPage: number;
  pageSize: number;
  
  // Pagination info
  total: number;
  totalPages: number;
  
  // Actions
  setFilters: (filters: Partial<FilterState>) => void;
  setSortBy: (sort: SortOption) => void;
  setCurrentPage: (page: number) => void;
  
  // API actions
  fetchListings: () => Promise<void>;
  fetchMyListings: () => Promise<void>;
  fetchListingById: (id: string) => Promise<Listing | null>;
  
  // Admin actions
  addListing: (listing: Omit<Listing, 'id' | 'listedDate' | 'updatedDate'>) => Promise<void>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  
  // Helper
  getListingById: (id: string) => Listing | undefined;
}

export const useApiListingsStore = create<ApiListingsStore>((set, get) => ({
  listings: [],
  myListings: [],
  loading: false,
  myListingsLoading: false,
  error: null,
  filters: {
    listingType: 'SALE',
  },
  sortBy: 'featured',
  currentPage: 1,
  pageSize: 12,
  total: 0,
  totalPages: 0,
  
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1,
    }));
  },
  
  setSortBy: (sort) => {
    set({ sortBy: sort, currentPage: 1 });
    if (isPublicSiteEnabled()) get().fetchListings();
  },
  
  setCurrentPage: (page) => {
    set({ currentPage: page });
    if (isPublicSiteEnabled()) get().fetchListings();
  },
  
  fetchListings: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, sortBy, currentPage, pageSize } = get();
      const response: ListingsResponse = await listingsApi.getListings(
        filters,
        sortBy,
        currentPage,
        pageSize
      );
      set({
        listings: response.listings || [],
        total: response.pagination?.total ?? 0,
        totalPages: response.pagination?.totalPages ?? 0,
        loading: false,
      });
    } catch (error: any) {
      set({
        listings: [],
        error: error.message || 'Failed to fetch listings',
        loading: false,
      });
    }
  },

  fetchMyListings: async () => {
    set({ myListingsLoading: true, error: null });
    try {
      const { listings } = await listingsApi.getMyListings();
      set({ myListings: listings, myListingsLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch your listings',
        myListingsLoading: false,
      });
    }
  },
  
  fetchListingById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const listing = await listingsApi.getListingById(id);
      set({ loading: false });
      return listing;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch listing',
        loading: false,
      });
      return null;
    }
  },
  
  addListing: async (listing) => {
    try {
      const newListing = await listingsApi.createListing(listing);
      set((state) => ({
        listings: [newListing, ...state.listings],
        myListings: [newListing, ...state.myListings],
      }));
      await get().fetchMyListings();
      if (isPublicSiteEnabled()) await get().fetchListings();
    } catch (error: any) {
      set({ error: error.message || 'Failed to create listing' });
      throw error;
    }
  },
  
  updateListing: async (id, updates) => {
    try {
      const updated = await listingsApi.updateListing(id, updates);
      set((state) => ({
        listings: state.listings.map((l) => (l.id === id ? updated : l)),
        myListings: state.myListings.map((l) => (l.id === id ? updated : l)),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update listing' });
      throw error;
    }
  },
  
  deleteListing: async (id) => {
    try {
      await listingsApi.deleteListing(id);
      set((state) => ({
        listings: state.listings.filter((l) => l.id !== id),
        myListings: state.myListings.filter((l) => l.id !== id),
      }));
      await get().fetchMyListings();
      if (isPublicSiteEnabled()) await get().fetchListings();
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete listing' });
      throw error;
    }
  },
  
  getListingById: (id) => {
    return get().listings.find((l) => l.id === id);
  },
}));
