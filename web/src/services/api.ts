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
  const method = (options.method || 'GET').toUpperCase();
  const hasBody = options.body !== undefined && options.body !== null && options.body !== '';
  // Avoid Content-Type on empty POSTs — some gateways mishandle bodyless JSON requests
  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (authMode === 'bearer') {
    const token = localStorage.getItem('auth_token')?.trim() || null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    const hint =
      method === 'POST' && endpoint.includes('instagram')
        ? ' Network/timeout while talking to Meta (Reels often need a second tap). Check Integrations → Meta shows Instagram @handle after Test, with instagram_content_publish on the token.'
        : '';
    throw new ApiError(
      0,
      `${networkErr instanceof Error ? networkErr.message : 'Network error'}.${hint}`
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body?.error === 'string'
        ? body.error
        : typeof body?.message === 'string'
          ? body.message
          : response.status === 504 || response.status === 502
            ? 'Server timed out while Meta was still processing the Reel. Tap Post to Instagram again in a few seconds.'
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

  register: async (data: {
    mobileNumber: string;
    firstName: string;
    lastName: string;
    pin: string;
    email?: string;
    agencyName?: string;
    licenseNumber?: string;
    officePhone?: string;
    whatsappNumber?: string;
  }) => {
    return request<{ success: boolean; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
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

export type UploadFolder = 'profiles' | 'listings' | 'tradies' | 'uploads';

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
    whatsappNumber?: string;
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
  deleteAgent: async (id: string): Promise<{ success: boolean }> =>
    request(`/admin/agents/${id}`, { method: 'DELETE' }),
  updateAgent: async (
    id: string,
    payload: {
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

/** Admin: fetch all listings (super admin) — used by campaign wizard */
export const adminListingsApi = {
  getAll: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    const p = new URLSearchParams();
    if (params?.page)     p.set('page',     String(params.page));
    if (params?.pageSize) p.set('pageSize', String(params.pageSize));
    if (params?.status)   p.set('status',   params.status);
    return request<{ listings: Listing[]; total: number }>(`/admin/listings?${p.toString()}`);
  },
};

// ── Listing marketing media (photos, videos, reels for campaigns) ─────────────

export interface ListingMarketingItem {
  id: string;
  listingId: string;
  url: string;
  kind: string;      // REEL | FLYER | CAROUSEL | VIDEO (legacy)
  caption: string | null;
  sortOrder: number;
}

export const listingMarketingApi = {
  list: (listingId: string) =>
    request<{ media: ListingMarketingItem[] }>(`/listings/${listingId}/marketing`),

  add: (listingId: string, data: { url: string; kind: string; caption?: string; sortOrder?: number }) =>
    request<{ media: ListingMarketingItem }>(`/listings/${listingId}/marketing`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  remove: (listingId: string, mediaId: string) =>
    request<{ success: boolean }>(`/listings/${listingId}/marketing/${mediaId}`, { method: 'DELETE' }),
};

export const listingsApi = {
  /** Agent's own listings (requires auth) */
  getMyListings: async (): Promise<{ listings: Listing[] }> => {
    return request<{ listings: Listing[] }>('/listings/my');
  },

  /** Super admin — listings waiting to go live */
  getPendingApprovalListings: async (): Promise<{ listings: PendingApprovalListing[]; total: number }> =>
    request<{ listings: PendingApprovalListing[]; total: number }>('/listings/pending-approval'),

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

  /** Public — more listings from the same agent / agency (ad-link “You can see more”) */
  getMoreFromAgentOrAgency: async (
    listingId: string,
    limit = 8
  ): Promise<{
    listings: Listing[];
    total: number;
    scope: 'agent' | 'agency' | 'agent_and_agency' | 'none';
    agentName: string | null;
    agencyName: string | null;
  }> => {
    return request(`/listings/${listingId}/more-from?limit=${limit}`);
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
    payload: {
      name: string;
      email: string;
      phone?: string;
      message: string;
      attribution?: EnquiryAttribution;
    }
  ): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/listings/${listingId}/enquiries`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

/** Where an enquirer clicked through from (tracked post links: ?utm_source=…&utm_campaign=…) */
export interface EnquiryAttribution {
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
}

export type EnquirySourceFilter =
  | 'facebook' | 'instagram' | 'tiktok' | 'whatsapp' | 'google' | 'email' | 'other' | 'direct';

/** Listing form enquiries (Admin → Leads) */
export interface ListingEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
  source?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
  campaign?: { id: string; title: string | null } | null;
  emailAudit?: {
    smtpConfigured: boolean;
    from: string;
    completedAt: string;
    attempts: Array<{
      role: 'agent' | 'admin' | 'buyer';
      to: string[];
      status: 'sent' | 'failed' | 'skipped';
      error?: string;
      messageId?: string;
      at: string;
    }>;
  } | null;
  listing: {
    id: string;
    headline: string;
    listingType: string;
    address: string;
    status: string;
    agent: { id: string; name: string | null; email: string | null } | null;
  } | null;
}

export const enquiryApi = {
  list: (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    source?: EnquirySourceFilter | '';
    campaignId?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.pageSize) sp.set('pageSize', String(params.pageSize));
    if (params?.q) sp.set('q', params.q);
    if (params?.source) sp.set('source', params.source);
    if (params?.campaignId) sp.set('campaignId', params.campaignId);
    const qs = sp.toString();
    return request<{ enquiries: ListingEnquiry[]; total: number; page: number; pageSize: number }>(
      `/admin/enquiries${qs ? `?${qs}` : ''}`
    );
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

// ── School zones (NZ Ministry of Education, via ArcGIS) ───────────────────────
export type SchoolAdapterStatus = 'ok' | 'no_data' | 'error';

export interface SchoolAdapterResult<T> {
  status: SchoolAdapterStatus;
  data: T | null;
  source: string;
  message?: string;
  fetchedAt: string;
}

export interface SchoolInfo {
  id: number;
  name: string;
  address?: string;
  type?: string;
  roll?: number;
  equityIndex?: number;
  phone?: string;
  website?: string;
  hasEnrolmentScheme?: boolean;
}

export interface NearbySchool extends SchoolInfo {
  distanceKm: number;
}

export interface InZoneSchool extends SchoolInfo {
  effectiveDate?: string;
}

export interface SchoolZonesResponse {
  lat: number;
  lng: number;
  inZone: SchoolAdapterResult<InZoneSchool[]>;
  nearby: SchoolAdapterResult<NearbySchool[]>;
  cachedAt?: string;
}

export const schoolZonesApi = {
  get: async (lat: number, lng: number): Promise<SchoolZonesResponse> =>
    request<SchoolZonesResponse>(
      `/school-zones?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      { method: 'GET' },
      'omit'
    ),
};

// ── Address geocoding (admin listing form — find coordinates from an address) ─
export type GeocodeStatus = 'ok' | 'not_found' | 'error';

export interface GeocodeCandidate {
  lat: number;
  lng: number;
  label: string;
}

export interface GeocodeResult {
  status: GeocodeStatus;
  candidates: GeocodeCandidate[];
  message?: string;
}

export const geocodeApi = {
  search: async (query: string): Promise<GeocodeResult> =>
    request<GeocodeResult>(`/admin/geocode?q=${encodeURIComponent(query)}`, { method: 'GET' }),
};

// ── Site branding config ───────────────────────────────────────────────────────

export interface SiteConfigResponse {
  siteName:     string;
  tagline:      string;
  primaryColor: string;
  logoUrl:      string | null;
  faviconUrl:   string | null;
}

export const siteConfigApi = {
  get: async (): Promise<SiteConfigResponse> =>
    request<SiteConfigResponse>('/config/site', { method: 'GET' }, 'omit'),
};

// ── Digital Marketing Campaigns (Sprint 3) ────────────────────────────────────

export type CampaignPlatform = 'META' | 'GOOGLE' | 'TIKTOK';
export type CampaignStatus   = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
export type LeadStatus       = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

export interface CampaignAsset {
  id:           string;
  campaignId:   string;
  assetType:    'IMAGE' | 'VIDEO' | 'LOGO' | 'COVER';
  url:          string;
  thumbnailUrl: string | null;
  format:       string | null;
  width:        number | null;
  height:       number | null;
  durationSec:  number | null;
  fileSize:     number | null;
  mimeType:     string | null;
  sortOrder:    number;
  createdAt:    string;
}

export interface CampaignLead {
  id:          string;
  campaignId:  string;
  platform:    CampaignPlatform | 'MANUAL';
  listingId:   string | null;
  leadFormId:  string | null;
  fullName:    string | null;
  email:       string | null;
  phone:       string | null;
  message:     string | null;
  extraFields: Record<string, string> | null;
  status:      LeadStatus;
  notes:       string | null;
  createdAt:   string;
  updatedAt:   string;
  campaign?:   { id: string; title: string; platform: CampaignPlatform };
}

export interface Campaign {
  id:                 string;
  title:              string;
  platform:           CampaignPlatform;
  campaignType:       string;
  campaignSubtype:    string | null;
  status:             CampaignStatus;
  objective:          string | null;
  budgetType:         'DAILY' | 'LIFETIME';
  budgetAmount:       number | null;
  currency:           string;
  startDate:          string | null;
  endDate:            string | null;
  targetAudience:     TargetAudience | null;
  platformConfig:     Record<string, unknown> | null;
  externalCampaignId: string | null;
  externalAdSetId:    string | null;
  externalAdId:       string | null;
  listingIds:         string[];
  headline:           string | null;
  primaryText:        string | null;
  description:        string | null;
  callToAction:       string | null;
  destinationUrl:     string | null;
  leadFormConfig:     LeadFormConfig | null;
  notes:              string | null;
  createdBy:          string | null;
  createdAt:          string;
  updatedAt:          string;
  assets:             CampaignAsset[];
  leadCount:          number;
  leads?:             CampaignLead[];
}

export interface TargetAudience {
  ageMin?:       number;
  ageMax?:       number;
  genders?:      string[];
  locations?:    string[];
  interests?:    string[];
  languages?:    string[];
  ageGroups?:    string[];  // TikTok format
  geoLocations?: { countries?: string[] };
}

export interface LeadFormConfig {
  fields:           { key: string; label: string; required: boolean }[];
  thankYouMessage?: string;
  privacyPolicyUrl?: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  total:     number;
  page:      number;
  pageSize:  number;
}

export interface LeadsResponse {
  leads:    CampaignLead[];
  total:    number;
  page:     number;
  pageSize: number;
}

export const campaignApi = {
  list: (params?: { platform?: string; status?: string; page?: number; pageSize?: number }) => {
    const p = new URLSearchParams();
    if (params?.platform) p.set('platform', params.platform);
    if (params?.status)   p.set('status',   params.status);
    if (params?.page)     p.set('page',     String(params.page));
    if (params?.pageSize) p.set('pageSize', String(params.pageSize));
    return request<CampaignsResponse>(`/admin/campaigns?${p.toString()}`);
  },

  get: (id: string) => request<Campaign>(`/admin/campaigns/${id}`),

  create: (data: Partial<Campaign>) =>
    request<Campaign>('/admin/campaigns', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Campaign>) =>
    request<Campaign>(`/admin/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/admin/campaigns/${id}`, { method: 'DELETE' }),

  publish: (id: string) =>
    request<{
      success: boolean;
      message: string;
      campaign: Campaign;
      publish?: {
        mode: 'ORGANIC' | 'PAID';
        platform: string;
        status: string;
        postId: string | null;
        campaignId: string | null;
        viewUrl: string | null;
        publishedAt: string;
        instagram?: {
          status?: string;
          mediaId?: string;
          containerId?: string;
          username?: string;
          viewUrl?: string;
          error?: string;
        };
      };
    }>(`/admin/campaigns/${id}/publish`, { method: 'POST' }),

  finalizeInstagram: (id: string, opts?: { force?: boolean }) =>
    request<{
      success: boolean;
      message: string;
      campaign: Campaign;
      instagram?: {
        status?: string;
        mediaId?: string;
        username?: string;
        viewUrl?: string;
        error?: string;
      };
      linkedInstagram?: { id?: string; username?: string };
    }>(`/admin/campaigns/${id}/finalize-instagram`, {
      method: 'POST',
      body: JSON.stringify({ force: Boolean(opts?.force) }),
    }),

  addAsset: (campaignId: string, asset: Partial<CampaignAsset>) =>
    request<CampaignAsset>(`/admin/campaigns/${campaignId}/assets`, {
      method: 'POST',
      body: JSON.stringify(asset),
    }),

  deleteAsset: (campaignId: string, assetId: string) =>
    request<{ success: boolean }>(`/admin/campaigns/${campaignId}/assets/${assetId}`, {
      method: 'DELETE',
    }),

  getLeads: (campaignId: string, params?: { page?: number; status?: string }) => {
    const p = new URLSearchParams();
    if (params?.page)   p.set('page',   String(params.page));
    if (params?.status) p.set('status', params.status);
    return request<LeadsResponse>(`/admin/campaigns/${campaignId}/leads?${p.toString()}`);
  },

  syncLeads: (campaignId: string) =>
    request<{ success: boolean; synced: number }>(`/admin/campaigns/${campaignId}/sync-leads`, {
      method: 'POST',
    }),

  updateLead: (leadId: string, data: { status?: LeadStatus; notes?: string }) =>
    request<CampaignLead>(`/admin/campaigns/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ── Integrations ─────────────────────────────────────────────────────────────

export interface PlatformIntegration {
  platform:     'META' | 'GOOGLE' | 'TIKTOK';
  isActive:     boolean;
  lastTestedAt: string | null;
  lastTestOk:   boolean | null;
  lastTestMsg:  string | null;
  config:       Record<string, string>;
}

export const integrationsApi = {
  list: () => request<PlatformIntegration[]>('/admin/integrations'),
};

// ── Content (News + Guides) ───────────────────────────────────────────────────

/** Legacy formats (read-only, for backward-compat rendering of seeded content) */
export type NewsBody = { paragraphs: string[] };
export type GuideSection = { heading: string; body: string[] };
export type GuideBody = { sections: GuideSection[] };
/** Current rich-text format */
export type RichBody = { html: string };

export interface ContentPost {
  id: string;
  slug: string;
  type: 'news' | 'guide';
  title: string;
  excerpt: string;
  body: RichBody | NewsBody | GuideBody;
  imageUrl: string | null;
  category: string | null;
  featured: boolean;
  published: boolean;
  readTime: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string | null;
}

export type ContentPostSummary = Omit<ContentPost, 'body' | 'updatedAt' | 'createdBy'>;

export const contentApi = {
  // Public
  listPosts: (params: { type?: string; category?: string; featured?: boolean; limit?: number; page?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.type) q.set('type', params.type);
    if (params.category) q.set('category', params.category);
    if (params.featured !== undefined) q.set('featured', String(params.featured));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.page) q.set('page', String(params.page));
    return request<{ posts: ContentPostSummary[]; total: number; page: number; limit: number }>(
      `/content/posts?${q.toString()}`, {}, 'omit'
    );
  },

  getPost: (slug: string) =>
    request<{ post: ContentPost }>(`/content/posts/${slug}`, {}, 'omit'),

  // Admin
  adminListPosts: (params: { type?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.type) q.set('type', params.type);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return request<{ posts: ContentPost[]; total: number }>(`/content/admin?${q.toString()}`);
  },

  adminGetPost: (id: string) =>
    request<{ post: ContentPost }>(`/content/admin/${id}`),

  adminCreatePost: (data: Partial<ContentPost> & { type: string; title: string; excerpt: string; body: RichBody | NewsBody | GuideBody }) =>
    request<{ post: ContentPost }>('/content/admin', { method: 'POST', body: JSON.stringify(data) }),

  adminUpdatePost: (id: string, data: Partial<ContentPost>) =>
    request<{ post: ContentPost }>(`/content/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  adminDeletePost: (id: string) =>
    request<{ success: boolean }>(`/content/admin/${id}`, { method: 'DELETE' }),
};

// ── Tradie directory ──────────────────────────────────────────────────────────

export interface Tradie {
  id: string;
  slug: string;
  businessName: string;
  contactName: string | null;
  categories: string[];
  skills: string[];
  description: string | null;
  tagline: string | null;
  yearsExperience: number | null;
  insuranceInfo: string | null;
  /** Work / project gallery URLs (like listing photos) */
  workImages: string[];
  /** Admin-only — omitted from public API (Enquire flow instead). */
  phone?: string;
  whatsappNumber?: string | null;
  email?: string | null;
  website: string | null;
  photoUrl: string | null;
  licenseNumber: string | null;
  region: string | null;
  district: string | null;
  suburbs: string[];
  featured: boolean;
}

export interface AdminTradie extends Tradie {
  phone: string;
  whatsappNumber: string | null;
  email: string | null;
  isActive: boolean;
  callClicks: number;
  whatsappClicks: number;
  createdAt: string;
  updatedAt: string;
}

export type TradieInput = Omit<Tradie, 'id' | 'slug' | 'phone' | 'whatsappNumber' | 'email'> & {
  phone: string;
  whatsappNumber: string | null;
  email: string | null;
  isActive: boolean;
};

export interface TradieSearchParams {
  q?: string;
  category?: string;
  region?: string;
  district?: string;
  suburb?: string;
  /** When true, only featured tradies (default browse). */
  featured?: boolean;
  page?: number;
  limit?: number;
}

export const tradiesApi = {
  // Public
  list: (params: TradieSearchParams = {}) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && String(v).trim() !== '') q.set(k, String(v));
    }
    return request<{ tradies: Tradie[]; total: number; page: number; limit: number }>(
      `/tradies?${q.toString()}`, {}, 'omit'
    );
  },

  categories: () =>
    request<{ categories: { name: string; count: number }[] }>('/tradies/categories', {}, 'omit'),

  get: (slug: string) =>
    request<{ tradie: Tradie }>(`/tradies/${encodeURIComponent(slug)}`, {}, 'omit'),

  enquire: (
    id: string,
    body: { name: string; email: string; phone?: string; message: string; intent?: string }
  ) =>
    request<{ success: boolean; enquiryId: string }>(
      `/tradies/${id}/enquire`,
      { method: 'POST', body: JSON.stringify(body) },
      'omit'
    ),

  recordContactClick: (id: string, channel: 'call' | 'whatsapp') =>
    request<{ success: boolean }>(
      `/tradies/${id}/contact-click`,
      { method: 'POST', body: JSON.stringify({ channel }), keepalive: true },
      'omit'
    ),

  // Admin (super admin)
  adminList: (q?: string) =>
    request<{ tradies: AdminTradie[]; total: number }>(
      `/admin/tradies${q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`
    ),

  adminGet: (id: string) => request<{ tradie: AdminTradie }>(`/admin/tradies/${id}`),

  adminCreate: (data: TradieInput) =>
    request<{ tradie: AdminTradie }>('/admin/tradies', { method: 'POST', body: JSON.stringify(data) }),

  adminUpdate: (id: string, data: Partial<TradieInput>) =>
    request<{ tradie: AdminTradie }>(`/admin/tradies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  adminDelete: (id: string) =>
    request<{ success: boolean }>(`/admin/tradies/${id}`, { method: 'DELETE' }),
};
