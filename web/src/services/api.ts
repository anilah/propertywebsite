import { Listing, FilterState, SortOption } from '../types';

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
if (!rawApiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required in web/.env (and .env.production for builds).');
}
const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestAuthMode = 'bearer' | 'omit';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  authMode: RequestAuthMode = 'bearer'
): Promise<T> {
  const headers = new Headers(options.headers as HeadersInit);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (authMode === 'bearer') {
    const token = localStorage.getItem('auth_token')?.trim() || null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body?.error === 'string'
        ? body.error
        : typeof body?.message === 'string'
          ? body.message
          : response.statusText || 'Request failed';
    throw new ApiError(response.status, message);
  }

  return response.json();
}

export type UserRole = 'SUPER_ADMIN' | 'AGENT' | 'PENDING';

// Auth API
export const authApi = {
  login: async (mobileNumber: string, pin: string) => {
    return request<{
      success: boolean;
      token: string;
      user: {
        id: string;
        mobileNumber: string;
        role: UserRole;
        isActive: boolean;
        firstName?: string;
        lastName?: string;
        email?: string;
        agencyName?: string;
        licenseNumber?: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber, pin }),
    }, 'omit');
  },

  changePin: async (currentPin: string, newPin: string) => {
    return request<{ success: boolean; message: string }>('/auth/me/pin', {
      method: 'PATCH',
      body: JSON.stringify({ currentPin, newPin }),
    });
  },

  /** @deprecated kept for type compatibility — removed from backend */
  verifyOTP: async (
    mobileNumber: string,
    otp: string,
    _profile?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      agencyName?: string;
      licenseNumber?: string;
    }
  ) => {
    return request<{
      success: boolean;
      token: string;
      user: {
        id: string;
        mobileNumber: string;
        role: UserRole;
        firstName?: string;
        lastName?: string;
        email?: string;
        agencyName?: string;
        licenseNumber?: string;
      };
    }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({
        mobileNumber,
        otp,
        ...(_profile && {
          firstName: _profile.firstName,
          lastName: _profile.lastName,
          email: _profile.email,
          agencyName: _profile.agencyName,
          licenseNumber: _profile.licenseNumber,
        }),
      }),
    });
  },

  getSetupStatus: async (): Promise<{ setupAvailable: boolean }> => {
    return request<{ setupAvailable: boolean }>('/auth/setup/status', { method: 'GET' }, 'omit');
  },

  createFirstSuperAdmin: async (payload: {
    setupSecret: string;
    mobileNumber: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => {
    return request<{
      success: boolean;
      token: string;
      user: {
        id: string;
        mobileNumber: string;
        role: 'SUPER_ADMIN' | 'AGENT' | 'PENDING';
        firstName?: string;
        lastName?: string;
        email?: string;
        agencyName?: string;
        licenseNumber?: string;
      };
    }>(
      '/auth/setup/first-super-admin',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      'omit'
    );
  },
};

// ── Upload API ────────────────────────────────────────────────────────────────
//
// Two strategies, auto-selected by the component based on getConfig():
//   s3Enabled   → presigned PUT directly to S3 (production)
//   localEnabled → multipart POST to /api/upload/local (dev, no S3 needed)

export interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface UploadConfig {
  s3Enabled: boolean;
  localEnabled: boolean;
}

export type UploadFolder = 'profiles' | 'listings' | 'uploads';

export const uploadApi = {
  /** Returns upload capabilities: s3Enabled + localEnabled */
  getConfig: (): Promise<UploadConfig> =>
    request('/upload/config', {}, 'omit'),

  /** Get a presigned S3 PUT URL. Requires auth. */
  getPresignedUrl: (contentType: string, folder: UploadFolder = 'uploads'): Promise<PresignResponse> =>
    request('/upload/presign', { method: 'POST', body: JSON.stringify({ contentType, folder }) }),

  /**
   * Upload a file to the local dev server (multipart POST).
   * Works without any S3 config — files land in backend/uploads/<folder>/.
   * Calls onProgress(0–100) via XHR upload progress events.
   */
  localUpload: (
    file: File,
    folder: UploadFolder = 'uploads',
    onProgress: (pct: number) => void
  ): Promise<string> =>
    new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('auth_token');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/upload/local?folder=${folder}`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText) as { publicUrl: string };
            onProgress(100);
            resolve(data.publicUrl);
          } catch {
            reject(new Error('Invalid response from local upload endpoint.'));
          }
        } else {
          reject(new Error(`Local upload failed (${xhr.status}): ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload.'));
      xhr.send(formData);
    }),

  /**
   * Upload with S3 presigned URL + progress reporting.
   * Use when s3Enabled === true.
   */
  uploadFileWithProgress: (
    file: File,
    folder: UploadFolder = 'uploads',
    onProgress: (pct: number) => void
  ): Promise<string> =>
    new Promise(async (resolve, reject) => {
      try {
        const { uploadUrl, publicUrl } = await uploadApi.getPresignedUrl(file.type, folder);
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            onProgress(100);
            resolve(publicUrl);
          } else {
            reject(new Error(`S3 upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during S3 upload.'));
        xhr.send(file);
      } catch (err) {
        reject(err);
      }
    }),
};

export interface MyProfile {
  id: string;
  mobileNumber: string;
  role: UserRole;
  isActive: boolean;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  agencyName?: string | null;
  licenseNumber?: string | null;
  profilePhotoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const profileApi = {
  getMe: (): Promise<{ user: MyProfile }> => request('/auth/me'),
  updateMe: (payload: {
    mobileNumber?: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
    agencyName?: string | null;
    licenseNumber?: string | null;
    profilePhotoUrl?: string | null;
  }): Promise<{ success: boolean; user: MyProfile }> =>
    request('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) }),
};

// Agents (super admin) API
export interface PendingUser {
  id: string;
  mobileNumber: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  agencyName?: string | null;
  licenseNumber?: string | null;
  createdAt: string;
  role: string;
}

export interface AgentListingStats {
  total: number;
  draft: number;
  pendingApproval: number;
  published: number;
  /** Sold, rented, or withdrawn */
  offMarket: number;
}

export interface AgentUser {
  id: string;
  mobileNumber: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
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
  pin?: string | null;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  _count: { listings: number };
  listingStats?: AgentListingStats;
}

export interface AgentsDirectoryMeta {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  totalListings: number;
}

export interface AgentListingRow {
  id: string;
  headline: string;
  status: string;
  listingType: string;
  location: { region: string; district: string; suburb: string };
  price: number | null;
  rentPerWeek: number | null;
  listedDate: string;
  updatedDate: string | null;
}

export const agentsApi = {
  getPending: async (): Promise<{ users: PendingUser[] }> =>
    request<{ users: PendingUser[] }>('/admin/agents/pending'),
  getAgents: async (params?: {
    q?: string;
    status?: 'all' | 'active' | 'inactive';
    sort?: 'name' | 'created' | 'updated' | 'listings';
    order?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }): Promise<{
    users: AgentUser[];
    pagination: { total: number; page: number; pageSize: number; totalPages: number };
    meta: AgentsDirectoryMeta;
  }> => {
    const sp = new URLSearchParams();
    if (params?.q) sp.set('q', params.q);
    if (params?.status && params.status !== 'all') sp.set('status', params.status);
    if (params?.sort) sp.set('sort', params.sort);
    if (params?.order) sp.set('order', params.order);
    if (params?.page != null) sp.set('page', String(params.page));
    if (params?.pageSize != null) sp.set('pageSize', String(params.pageSize));
    const qs = sp.toString();
    return request(`/admin/agents${qs ? `?${qs}` : ''}`);
  },
  getAgentListings: async (
    agentId: string,
    page: number = 1,
    pageSize: number = 15
  ): Promise<{
    listings: AgentListingRow[];
    pagination: { total: number; page: number; pageSize: number; totalPages: number };
  }> => {
    const sp = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    return request(`/admin/agents/${agentId}/listings?${sp.toString()}`);
  },
  createAgent: async (payload: {
    mobileNumber: string;
    firstName: string;
    lastName: string;
    email?: string;
    agencyName?: string;
    licenseNumber?: string;
    profilePhotoUrl?: string;
    officeBranchName?: string;
    officePhone?: string;
    officeWebsite?: string;
    appraisalUrl?: string;
    platinumPartner?: boolean;
    listingAgentDisplayName?: string;
    listingAgentPhotoUrl?: string;
    coListingAgentName?: string;
    coListingAgentPhotoUrl?: string;
  }  ): Promise<{ success: boolean; user: Omit<AgentUser, '_count'> }> =>
    request('/admin/agents', { method: 'POST', body: JSON.stringify(payload) }),
  approveAgent: async (id: string): Promise<{ success: boolean; user: { id: string; mobileNumber: string; role: string; isActive: boolean } }> =>
    request(`/admin/agents/${id}/approve`, { method: 'POST' }),
  activateAgent: async (id: string): Promise<{ success: boolean; user: { id: string; mobileNumber: string; role: string; isActive: boolean } }> =>
    request(`/admin/agents/${id}/activate`, { method: 'PATCH' }),
  deactivateAgent: async (id: string): Promise<{ success: boolean; user: { id: string; mobileNumber: string; role: string; isActive: boolean } }> =>
    request(`/admin/agents/${id}/deactivate`, { method: 'PATCH' }),
  updateAgent: async (
    id: string,
    payload: {
      mobileNumber?: string;
      firstName?: string;
      lastName?: string;
      email?: string | null;
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
    }
  ): Promise<{ success: boolean; user: AgentUser }> =>
    request(`/admin/agents/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  resetAgentPin: async (id: string): Promise<{ success: boolean; pin: string }> =>
    request(`/admin/agents/${id}/reset-pin`, { method: 'POST' }),
};

// Listings API
export interface ListingsResponse {
  listings: Listing[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export type PendingApprovalListing = Listing & {
  agentDisplayName?: string;
  agentMobile?: string;
};

export const listingsApi = {
  /** Agent's own listings (requires auth) */
  getMyListings: async (): Promise<{ listings: Listing[] }> => {
    return request<{ listings: Listing[] }>('/listings/my');
  },

  /** Super admin — listings waiting to go live */
  getPendingApprovalListings: async (): Promise<{ listings: PendingApprovalListing[] }> =>
    request<{ listings: PendingApprovalListing[] }>('/listings/pending-approval'),

  approveListingPublish: async (id: string): Promise<Listing> =>
    request<Listing>(`/listings/${id}/approve-publish`, { method: 'POST' }),

  getListings: async (
    filters: FilterState,
    sortBy: SortOption = 'featured',
    page: number = 1,
    pageSize: number = 12
  ): Promise<ListingsResponse> => {
    const params = new URLSearchParams({
      listingType: filters.listingType,
      sortBy,
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (filters.region) params.append('region', filters.region);
    if (filters.district) params.append('district', filters.district);
    if (filters.suburb) params.append('suburb', filters.suburb);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.minBedrooms) params.append('minBedrooms', filters.minBedrooms.toString());
    if (filters.minBathrooms) params.append('minBathrooms', filters.minBathrooms.toString());
    if (filters.minParking) params.append('minParking', filters.minParking.toString());
    if (filters.propertyType) params.append('propertyType', filters.propertyType);
    if (filters.keyword) params.append('keyword', filters.keyword);

    return request<ListingsResponse>(`/listings?${params.toString()}`);
  },

  getListingById: async (id: string): Promise<Listing> => {
    return request<Listing>(`/listings/${id}`);
  },

  createListing: async (listing: Omit<Listing, 'id' | 'listedDate' | 'updatedDate'>): Promise<Listing> => {
    return request<Listing>('/listings', {
      method: 'POST',
      body: JSON.stringify(listing),
    });
  },

  updateListing: async (id: string, updates: Partial<Listing>): Promise<Listing> => {
    return request<Listing>(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteListing: async (id: string): Promise<void> => {
    return request<void>(`/listings/${id}`, {
      method: 'DELETE',
    });
  },

  /** Public — persist buyer enquiry */
  submitEnquiry: async (
    listingId: string,
    payload: { name: string; email: string; phone?: string; message: string }
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/listings/${listingId}/enquiries`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ── Parcel info (LINZ + GeoNet aggregated) ─────────────────────────────────
export type ParcelAdapterStatus = 'ok' | 'no_data' | 'needs_api_key' | 'error';

export interface ParcelAdapterResult<T> {
  status: ParcelAdapterStatus;
  data: T | null;
  source: string;
  message?: string;
  fetchedAt: string;
}

export interface ParcelInfoData {
  titleReference?: string;
  appellation?: string;
  landAreaSqm?: number;
  parcelIntent?: string;
}

export interface SeismicContextData {
  recentLocalQuakes: number;
  radiusKm: number;
  closest?: {
    mmi: number;
    magnitude: number;
    depthKm: number;
    timeUtc: string;
    distanceKm: number;
  };
}

export interface ParcelInfoResponse {
  lat: number;
  lng: number;
  parcel: ParcelAdapterResult<ParcelInfoData>;
  seismic: ParcelAdapterResult<SeismicContextData>;
  hazards: ParcelAdapterResult<Record<string, never>>;
  cachedAt?: string;
}

export const parcelInfoApi = {
  get: async (lat: number, lng: number): Promise<ParcelInfoResponse> =>
    request<ParcelInfoResponse>(
      `/parcel-info?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      { method: 'GET' },
      'omit'
    ),
};
