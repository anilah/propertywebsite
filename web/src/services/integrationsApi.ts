const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = (rawApiBaseUrl ?? '').replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers as HeadersInit);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = localStorage.getItem('auth_token')?.trim();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((body.error ?? body.message ?? res.statusText) as string);
  }
  return res.json() as Promise<T>;
}

export type Platform = 'META' | 'GOOGLE' | 'TIKTOK';

export interface PlatformIntegration {
  platform:     Platform;
  isActive:     boolean;
  lastTestedAt: string | null;
  lastTestOk:   boolean | null;
  lastTestMsg:  string | null;
  config:       Record<string, string>;
  webhookUrls:  Record<string, string>;
}

export const integrationsApi = {
  getAll: () =>
    request<PlatformIntegration[]>('/admin/integrations'),

  save: (platform: Platform, config: Record<string, string>) =>
    request<PlatformIntegration>(`/admin/integrations/${platform}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  test: (platform: Platform) =>
    request<{
      ok: boolean;
      message: string;
      discovered?: { instagramUserId?: string; instagramUsername?: string };
      config?: Record<string, string>;
    }>(`/admin/integrations/${platform}/test`, {
      method: 'POST',
    }),

  delete: (platform: Platform) =>
    request<{ success: boolean }>(`/admin/integrations/${platform}`, {
      method: 'DELETE',
    }),
};
