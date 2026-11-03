/**
 * Google Ads API client
 *
 * Docs: https://developers.google.com/google-ads/api/docs/start
 * Uses Google Ads API v17 (REST interface)
 *
 * Environment variables required:
 *   GOOGLE_ADS_DEVELOPER_TOKEN   — Developer token (from Google Ads API Center)
 *   GOOGLE_ADS_CLIENT_ID         — OAuth2 client ID
 *   GOOGLE_ADS_CLIENT_SECRET     — OAuth2 client secret
 *   GOOGLE_ADS_REFRESH_TOKEN     — OAuth2 refresh token (offline)
 *   GOOGLE_ADS_CUSTOMER_ID       — Customer ID (without dashes, e.g. 1234567890)
 */

const ADS_API_VERSION = 'v17';
const BASE = `https://googleads.googleapis.com/${ADS_API_VERSION}`;

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let _cachedToken: { token: string; expiry: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _cachedToken.expiry - 60_000) {
    return _cachedToken.token;
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id:     process.env.GOOGLE_ADS_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET ?? '',
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN ?? '',
    }),
  });
  const data = (await res.json()) as GoogleTokenResponse;
  _cachedToken = { token: data.access_token, expiry: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

function customerId(): string {
  return (process.env.GOOGLE_ADS_CUSTOMER_ID ?? '').replace(/-/g, '');
}

async function googleFetch<T = unknown>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const token = init?.skipAuth ? '' : await getAccessToken();
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '',
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`Google Ads API error ${res.status}: ${JSON.stringify(body)}`);
  }
  return body as T;
}

export interface GoogleCampaignInput {
  name: string;
  /** SEARCH | DISPLAY | VIDEO | PERFORMANCE_MAX */
  advertisingChannelType: string;
  status: 'ENABLED' | 'PAUSED';
  dailyBudgetMicros?: number;  // 1,000,000 micros = $1.00
  startDate?: string;          // YYYYMMDD
  endDate?: string;
}

/** Create a Google Ads campaign */
export async function createGoogleCampaign(input: GoogleCampaignInput): Promise<string> {
  const budgetRes = await googleFetch<{ resourceName: string }>(
    `/customers/${customerId()}/campaignBudgets:mutate`,
    {
      method: 'POST',
      body: JSON.stringify({
        operations: [{
          create: {
            name: `${input.name} Budget`,
            amountMicros: input.dailyBudgetMicros ?? 1_000_000,
            deliveryMethod: 'STANDARD',
          },
        }],
      }),
    }
  );

  const campaignPayload: Record<string, unknown> = {
    name: input.name,
    status: input.status,
    advertisingChannelType: input.advertisingChannelType,
    campaignBudget: budgetRes.resourceName,
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: true,
    },
  };
  if (input.startDate) campaignPayload.startDate = input.startDate;
  if (input.endDate)   campaignPayload.endDate   = input.endDate;

  const res = await googleFetch<{ results: [{ resourceName: string }] }>(
    `/customers/${customerId()}/campaigns:mutate`,
    {
      method: 'POST',
      body: JSON.stringify({ operations: [{ create: campaignPayload }] }),
    }
  );
  return res.results[0]?.resourceName ?? '';
}

export interface GoogleAdGroupInput {
  campaignResourceName: string;
  name: string;
  cpcBidMicros?: number;
  status?: 'ENABLED' | 'PAUSED';
}

/** Create an ad group within a campaign */
export async function createGoogleAdGroup(input: GoogleAdGroupInput): Promise<string> {
  const res = await googleFetch<{ results: [{ resourceName: string }] }>(
    `/customers/${customerId()}/adGroups:mutate`,
    {
      method: 'POST',
      body: JSON.stringify({
        operations: [{
          create: {
            name: input.name,
            campaign: input.campaignResourceName,
            status: input.status ?? 'PAUSED',
            cpcBidMicros: input.cpcBidMicros ?? 1_000_000,
          },
        }],
      }),
    }
  );
  return res.results[0]?.resourceName ?? '';
}

export interface GoogleResponsiveSearchAdInput {
  adGroupResourceName: string;
  headlines: string[];       // up to 15, max 30 chars each
  descriptions: string[];    // up to 4, max 90 chars each
  finalUrl: string;
}

/** Create a Responsive Search Ad */
export async function createGoogleRSA(input: GoogleResponsiveSearchAdInput): Promise<string> {
  const res = await googleFetch<{ results: [{ resourceName: string }] }>(
    `/customers/${customerId()}/ads:mutate`,
    {
      method: 'POST',
      body: JSON.stringify({
        operations: [{
          create: {
            adGroup: input.adGroupResourceName,
            status: 'ENABLED',
            ad: {
              responsiveSearchAd: {
                headlines: input.headlines.map((h) => ({ text: h.slice(0, 30) })),
                descriptions: input.descriptions.map((d) => ({ text: d.slice(0, 90) })),
              },
              finalUrls: [input.finalUrl],
            },
          },
        }],
      }),
    }
  );
  return res.results[0]?.resourceName ?? '';
}

/** Add keywords to an ad group */
export async function addGoogleKeywords(
  adGroupResourceName: string,
  keywords: string[]
): Promise<void> {
  const operations = keywords.map((kw) => ({
    create: {
      adGroup: adGroupResourceName,
      text: kw,
      matchType: 'BROAD',
      status: 'ENABLED',
    },
  }));
  await googleFetch(`/customers/${customerId()}/adGroupCriteria:mutate`, {
    method: 'POST',
    body: JSON.stringify({ operations }),
  });
}

/** Create a Google Lead Form Asset and return its resource name */
export async function createGoogleLeadFormAsset(
  name: string,
  callToActionType: string,
  callToActionDescription: string,
  fields: string[],
  businessName: string,
  headline: string,
  description: string,
  privacyPolicyUrl: string,
  postSubmitHeadline: string,
  postSubmitDescription: string
): Promise<string> {
  const res = await googleFetch<{ results: [{ resourceName: string }] }>(
    `/customers/${customerId()}/assets:mutate`,
    {
      method: 'POST',
      body: JSON.stringify({
        operations: [{
          create: {
            name,
            type: 'LEAD_FORM',
            leadFormAsset: {
              callToActionType,
              callToActionDescription,
              businessName,
              headline,
              description,
              privacyPolicyUrl,
              postSubmitHeadlineText: postSubmitHeadline,
              postSubmitDescription,
              fields: fields.map((f) => ({ inputType: f })),
              deliveryMethods: [{ webhook: { advertiserWebhookUrl: '', googleSecret: '' } }],
            },
          },
        }],
      }),
    }
  );
  return res.results[0]?.resourceName ?? '';
}

export const googleService = {
  createCampaign: createGoogleCampaign,
  createAdGroup: createGoogleAdGroup,
  createRSA: createGoogleRSA,
  addKeywords: addGoogleKeywords,
  createLeadFormAsset: createGoogleLeadFormAsset,
};
