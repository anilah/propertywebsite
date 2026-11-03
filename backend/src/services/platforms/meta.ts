/**
 * Meta Marketing API client (Facebook / Instagram)
 *
 * Docs: https://developers.facebook.com/docs/marketing-apis
 *
 * Environment variables required:
 *   META_APP_ID          — Facebook App ID
 *   META_APP_SECRET      — Facebook App Secret
 *   META_ACCESS_TOKEN    — Long-lived System User access token
 *   META_AD_ACCOUNT_ID   — Ad Account ID (act_XXXXXXX)
 *   META_PAGE_ID         — Facebook Page ID for ads
 *   META_PIXEL_ID        — Meta Pixel ID for conversion tracking
 *   META_LEAD_WEBHOOK_TOKEN — Verify token for lead webhook subscription
 */

const API_VERSION = 'v21.0';
const BASE = `https://graph.facebook.com/${API_VERSION}`;
const VIDEO_BASE = `https://graph-video.facebook.com/${API_VERSION}`;

// Allow overriding credentials per-call (e.g. from DB) instead of only env vars
let _runtimeAccessToken: string | null = null;
let _runtimeAdAccountId: string | null = null;
let _runtimePageId: string | null = null;
let _runtimeAppId: string | null = null;
let _runtimeAppSecret: string | null = null;

export function setMetaRuntimeCreds(creds: {
  accessToken: string;
  adAccountId: string;
  pageId?: string;
  appId?: string;
  appSecret?: string;
}) {
  _runtimeAccessToken = creds.accessToken;
  _runtimeAdAccountId = creds.adAccountId.startsWith('act_') ? creds.adAccountId : `act_${creds.adAccountId}`;
  _runtimePageId = creds.pageId ?? null;
  _runtimeAppId = creds.appId ?? null;
  _runtimeAppSecret = creds.appSecret ?? null;
}
export function clearMetaRuntimeCreds() {
  _runtimeAccessToken = null;
  _runtimeAdAccountId = null;
  _runtimePageId = null;
  _runtimeAppId = null;
  _runtimeAppSecret = null;
}

function accessToken(): string {
  return _runtimeAccessToken ?? process.env.META_ACCESS_TOKEN ?? '';
}

function appId(): string {
  return _runtimeAppId ?? process.env.META_APP_ID ?? '';
}

function appSecret(): string {
  return _runtimeAppSecret ?? process.env.META_APP_SECRET ?? '';
}

function adAccountId(): string {
  if (_runtimeAdAccountId) return _runtimeAdAccountId;
  const id = process.env.META_AD_ACCOUNT_ID ?? '';
  return id.startsWith('act_') ? id : `act_${id}`;
}

export function getMetaPageId(): string {
  return _runtimePageId ?? process.env.META_PAGE_ID ?? '';
}

type MetaFetchInit = RequestInit & { /** Override token (e.g. Page access token for organic posts) */ token?: string };

async function metaFetch<T = unknown>(path: string, init?: MetaFetchInit): Promise<T> {
  const { token, ...fetchInit } = init ?? {};
  const sep = path.includes('?') ? '&' : '?';
  const tok = token ?? accessToken();
  const url = `${BASE}${path}${sep}access_token=${encodeURIComponent(tok)}`;
  const res = await fetch(url, {
    ...fetchInit,
    headers: { 'Content-Type': 'application/json', ...(fetchInit.headers ?? {}) },
  });
  const body = await res.json() as Record<string, unknown>;
  if (!res.ok || body.error) {
    const err = (body.error as Record<string, unknown>) ?? {};
    throw new Error(`Meta API error ${err.code ?? res.status}: ${err.message ?? res.statusText}`);
  }
  return body as T;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Graph endpoints that expect form-urlencoded params (Reels / Instagram). */
async function metaFormPost<T = unknown>(
  path: string,
  params: Record<string, string | boolean | number | undefined>,
  token: string
): Promise<T> {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    body.set(k, typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v));
  }
  body.set('access_token', token);
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok || json.error) {
    const err = (json.error as Record<string, unknown>) ?? {};
    const code = err.code ?? res.status;
    const sub = err.error_subcode ? ` / ${err.error_subcode}` : '';
    throw new Error(`Meta API error ${code}${sub}: ${err.message ?? res.statusText}`);
  }
  return json as T;
}

/**
 * Organic Page posts require a Page access token — a System User / user token
 * that can only READ the page will fail video publish with (#100) No permission.
 * Resolve via the Page node, then /me/accounts as fallback.
 */
export async function resolvePageAccessToken(
  pageId: string,
  userToken?: string
): Promise<{ pageToken: string; pageName?: string; tasks?: string[] }> {
  const token = userToken ?? accessToken();
  if (!token) throw new Error('Meta access token is not configured.');
  if (!pageId) throw new Error('Meta page ID is not configured.');

  // 1) Direct page token (works when the token can manage the Page)
  // Do NOT request `tasks` on /{page-id} — Meta returns (#100) nonexisting field for many tokens.
  try {
    const page = await metaFetch<{ access_token?: string; name?: string }>(
      `/${pageId}?fields=access_token,name`,
      { token }
    );
    if (page.access_token) {
      return { pageToken: page.access_token, pageName: page.name };
    }
  } catch {
    /* fall through */
  }

  // 2) System User / User → pages they manage
  try {
    const accounts = await metaFetch<{
      data?: { id: string; name?: string; access_token?: string; tasks?: string[] }[];
    }>(`/me/accounts?fields=id,name,access_token,tasks&limit=100`, { token });
    const match = (accounts.data ?? []).find((p) => p.id === pageId);
    if (match?.access_token) {
      return { pageToken: match.access_token, pageName: match.name, tasks: match.tasks };
    }
    const names = (accounts.data ?? []).map((p) => `${p.name ?? 'Page'} (${p.id})`).join(', ');
    throw new Error(
      names
        ? `Page ID ${pageId} is not assigned to this Meta token. Available pages: ${names}. Assign the System User to the Page in Business Manager (Page tasks: CREATE_CONTENT), then re-test.`
        : `Could not get a Page access token for Page ${pageId}. Assign the System User to the Facebook Page with Content permissions, generate a new token that includes pages_manage_posts + publish_video, then re-test in Integrations.`
    );
  } catch (err) {
    if (err instanceof Error && (err.message.startsWith('Page ID') || err.message.startsWith('Could not get'))) {
      throw err;
    }
    throw new Error(
      `Could not resolve a Page access token for organic posting. ` +
        `Your token can read the ad account, but Meta needs a Page token with pages_manage_posts and publish_video. ` +
        `In Business Manager: System Users → assign the Page → generate token with pages_manage_posts, pages_read_engagement, pages_show_list, publish_video. ` +
        `(${err instanceof Error ? err.message : String(err)})`
    );
  }
}

function enrichPublishError(err: unknown, mediaType?: string): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (/no permission to publish the video/i.test(msg) || /\(#100\).*publish/i.test(msg)) {
    throw new Error(
      `${msg}. ` +
        `Page “Full control” is not enough on its own — when you Generate Token for the System User you must tick ` +
        `publish_video and pages_manage_posts (asset rights ≠ token scopes). ` +
        `Also: video must be posted via graph-video with a publicly downloadable URL. ` +
        `Open Integrations → Test connection; it now lists missing scopes. ` +
        `Then paste a freshly generated token and republish${mediaType === 'reel' ? ' the reel' : ''}.`
    );
  }
  throw err instanceof Error ? err : new Error(msg);
}

/** Inspect token scopes via debug_token (needs App ID + App Secret). */
export async function debugMetaToken(inputToken: string): Promise<{
  scopes: string[];
  type?: string;
  isValid: boolean;
  missingPublishScopes: string[];
}> {
  const id = appId();
  const secret = appSecret();
  if (!id || !secret) {
    return { scopes: [], isValid: true, missingPublishScopes: [] };
  }
  const appToken = `${id}|${secret}`;
  const url =
    `${BASE}/debug_token?input_token=${encodeURIComponent(inputToken)}` +
    `&access_token=${encodeURIComponent(appToken)}`;
  const res = await fetch(url);
  const body = (await res.json()) as {
    data?: { is_valid?: boolean; scopes?: string[]; type?: string; granular_scopes?: { scope: string }[] };
    error?: { message?: string };
  };
  if (body.error || !body.data) {
    return { scopes: [], isValid: false, missingPublishScopes: ['publish_video', 'pages_manage_posts'] };
  }
  const scopes = [
    ...(body.data.scopes ?? []),
    ...(body.data.granular_scopes ?? []).map((g) => g.scope),
  ];
  const unique = [...new Set(scopes)];
  const required = ['publish_video', 'pages_manage_posts'];
  const missingPublishScopes = required.filter(
    (s) => !unique.some((have) => have === s || have.startsWith(`${s}`))
  );
  return {
    scopes: unique,
    type: body.data.type,
    isValid: Boolean(body.data.is_valid),
    missingPublishScopes,
  };
}

/**
 * Meta Video API expects form-encoded POST to graph-video.facebook.com
 * (JSON to graph.facebook.com often returns misleading permission errors).
 */
async function publishPageVideoFromUrl(opts: {
  pageId: string;
  pageToken: string;
  fileUrl: string;
  description: string;
}): Promise<{ id: string }> {
  // Confirm our CDN URL is publicly fetchable before asking Meta to pull it
  try {
    const probe = await fetch(opts.fileUrl, { method: 'HEAD' });
    if (!probe.ok) {
      // Some CDNs reject HEAD — try a ranged GET
      const getProbe = await fetch(opts.fileUrl, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
      });
      if (!getProbe.ok) {
        throw new Error(
          `Video URL is not publicly downloadable (HTTP ${getProbe.status}). Meta must fetch file_url from the internet. Check CloudFront/S3 public access: ${opts.fileUrl}`
        );
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('not publicly downloadable')) throw err;
    // Network probe failure — still attempt Meta pull; they may succeed
  }

  const params = new URLSearchParams();
  params.set('file_url', opts.fileUrl);
  params.set('description', opts.description);
  params.set('published', 'true');
  params.set('access_token', opts.pageToken);

  const res = await fetch(`${VIDEO_BASE}/${opts.pageId}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const body = (await res.json()) as { id?: string; error?: { code?: number; message?: string } };
  if (!res.ok || body.error || !body.id) {
    const err = body.error ?? {};
    throw new Error(`Meta API error ${err.code ?? res.status}: ${err.message ?? res.statusText}`);
  }
  return { id: body.id };
}

/**
 * Official Facebook Page Reels flow:
 * start → rupload file_url → finish with video_state=PUBLISHED
 * https://developers.facebook.com/docs/video-api/guides/reels-publishing
 */
async function publishPageReelFromUrl(opts: {
  pageId: string;
  pageToken: string;
  fileUrl: string;
  description: string;
}): Promise<{ id: string }> {
  const start = await metaFormPost<{ video_id?: string; upload_url?: string }>(
    `/${opts.pageId}/video_reels`,
    { upload_phase: 'start' },
    opts.pageToken
  );
  const videoId = start.video_id;
  if (!videoId) {
    throw new Error('Meta Reels start did not return video_id.');
  }

  const uploadUrl =
    start.upload_url ||
    `https://rupload.facebook.com/video-upload/${API_VERSION}/${videoId}`;

  const upRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `OAuth ${opts.pageToken}`,
      file_url: opts.fileUrl,
    },
  });
  const upText = await upRes.text();
  let upJson: Record<string, unknown> = {};
  try {
    upJson = JSON.parse(upText) as Record<string, unknown>;
  } catch { /* plain */ }
  if (!upRes.ok || upJson.error || upJson.success === false) {
    const err = (upJson.error as Record<string, unknown>) ?? {};
    throw new Error(
      `Meta Reel upload failed (HTTP ${upRes.status}): ${err.message ?? upText.slice(0, 200)}`
    );
  }

  // Brief wait for upload/processing before finish
  for (let i = 0; i < 8; i++) {
    try {
      const st = await metaFetch<{
        status?: {
          video_status?: string;
          uploading_phase?: { status?: string };
          processing_phase?: { status?: string; error?: { message?: string } };
        };
      }>(`/${videoId}?fields=status`, { token: opts.pageToken });
      const uploading = st.status?.uploading_phase?.status;
      const processing = st.status?.processing_phase?.status;
      const procErr = st.status?.processing_phase?.error?.message;
      if (procErr) {
        throw new Error(`Meta Reel processing error: ${procErr}`);
      }
      if (uploading === 'complete' || processing === 'complete' || st.status?.video_status === 'ready') {
        break;
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('processing error')) throw e;
    }
    await sleep(1500);
  }

  await metaFormPost(
    `/${opts.pageId}/video_reels`,
    {
      upload_phase: 'finish',
      video_id: videoId,
      video_state: 'PUBLISHED',
      description: opts.description.slice(0, 2200),
    },
    opts.pageToken
  );

  return { id: videoId };
}

/** Resolve a public www.facebook.com URL for a published photo/video/reel. */
async function resolveFacebookViewUrl(
  objectId: string,
  pageToken: string,
  opts?: { pageId?: string; preferReel?: boolean }
): Promise<string> {
  try {
    const data = await metaFetch<{ permalink_url?: string }>(
      `/${objectId}?fields=permalink_url`,
      { token: pageToken }
    );
    if (data.permalink_url) {
      const p = data.permalink_url;
      if (p.startsWith('http')) return p;
      return `https://www.facebook.com${p.startsWith('/') ? p : `/${p}`}`;
    }
  } catch {
    /* fall through */
  }

  // Since ~Aug 2025 Meta treats Page videos as Reels — /page/videos/{id} often 404s
  if (opts?.preferReel) {
    return `https://www.facebook.com/reel/${objectId}`;
  }
  if (objectId.includes('_')) {
    return `https://www.facebook.com/${objectId}`;
  }
  if (opts?.pageId) {
    return `https://www.facebook.com/${opts.pageId}/posts/${objectId}`;
  }
  return `https://www.facebook.com/reel/${objectId}`;
}

export interface MetaCampaignInput {
  name: string;
  objective: 'OUTCOME_LEADS' | 'OUTCOME_TRAFFIC' | 'OUTCOME_AWARENESS' | 'OUTCOME_SALES';
  status: 'ACTIVE' | 'PAUSED';
  dailyBudget?: number;   // cents (e.g. 1000 = $10.00)
  lifetimeBudget?: number;
  startTime?: string;     // ISO 8601
  stopTime?: string;
}

export interface MetaAdSetInput {
  campaignId: string;
  name: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  bidAmount?: number;
  billingEvent?: string;
  optimizationGoal?: string;
  targeting: {
    ageMin?: number;
    ageMax?: number;
    genders?: number[];           // 1 = male, 2 = female
    geoLocations?: { countries?: string[]; cities?: { key: string }[] };
    interests?: { id: string; name: string }[];
  };
  status?: 'ACTIVE' | 'PAUSED';
  startTime?: string;
  endTime?: string;
  pageId?: string;
  pixelId?: string;
  leadFormId?: string;
}

export interface MetaCreativeInput {
  name: string;
  pageId: string;
  imageUrl?: string;
  videoId?: string;
  headline: string;
  body: string;
  description?: string;
  callToActionType?: string;
  linkUrl: string;
  leadFormId?: string;
}

/** Create a Meta campaign and return its external ID */
export async function createMetaCampaign(input: MetaCampaignInput): Promise<string> {
  const payload: Record<string, unknown> = {
    name: input.name,
    objective: input.objective,
    status: input.status,
    special_ad_categories: [],
  };
  if (input.dailyBudget)    payload.daily_budget    = input.dailyBudget;
  if (input.lifetimeBudget) payload.lifetime_budget = input.lifetimeBudget;
  if (input.startTime)      payload.start_time      = input.startTime;
  if (input.stopTime)       payload.stop_time       = input.stopTime;

  const result = await metaFetch<{ id: string }>(`/${adAccountId()}/campaigns`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.id;
}

/** Create an ad set targeting audience within a campaign */
export async function createMetaAdSet(input: MetaAdSetInput): Promise<string> {
  const targeting: Record<string, unknown> = {};
  if (input.targeting.ageMin)       targeting.age_min = input.targeting.ageMin;
  if (input.targeting.ageMax)       targeting.age_max = input.targeting.ageMax;
  if (input.targeting.genders)      targeting.genders = input.targeting.genders;
  if (input.targeting.geoLocations) targeting.geo_locations = input.targeting.geoLocations;
  if (input.targeting.interests)    targeting.flexible_spec = [{ interests: input.targeting.interests }];

  const promoted: Record<string, unknown> = { page_id: input.pageId ?? process.env.META_PAGE_ID };
  if (input.pixelId ?? process.env.META_PIXEL_ID) {
    promoted.pixel_id = input.pixelId ?? process.env.META_PIXEL_ID;
    if (input.leadFormId) {
      promoted.leadgen_form_id = input.leadFormId;
    }
  }

  const payload: Record<string, unknown> = {
    campaign_id: input.campaignId,
    name: input.name,
    billing_event: input.billingEvent ?? 'IMPRESSIONS',
    optimization_goal: input.optimizationGoal ?? (input.leadFormId ? 'LEAD_GENERATION' : 'LINK_CLICKS'),
    targeting,
    promoted_object: promoted,
    status: input.status ?? 'PAUSED',
  };
  if (input.dailyBudget)    payload.daily_budget    = input.dailyBudget;
  if (input.lifetimeBudget) payload.lifetime_budget = input.lifetimeBudget;
  if (input.startTime)      payload.start_time      = input.startTime;
  if (input.endTime)        payload.end_time        = input.endTime;

  const result = await metaFetch<{ id: string }>(`/${adAccountId()}/adsets`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.id;
}

/** Upload an image from URL to Meta Ad Library and return hash */
export async function uploadMetaImageFromUrl(imageUrl: string): Promise<string> {
  const result = await metaFetch<{ images: { bytes: { hash: string } } }>(
    `/${adAccountId()}/adimages`,
    {
      method: 'POST',
      body: JSON.stringify({ url: imageUrl, name: `pr_${Date.now()}` }),
    }
  );
  const hashes = Object.values(result.images) as { hash: string }[];
  return hashes[0]?.hash ?? '';
}

/** Create an ad creative */
export async function createMetaCreative(input: MetaCreativeInput): Promise<string> {
  const objectStorySpec: Record<string, unknown> = {
    page_id: input.pageId,
    link_data: {
      link: input.linkUrl,
      message: input.body,
      name: input.headline,
      description: input.description,
      call_to_action: { type: input.callToActionType ?? 'LEARN_MORE', value: { link: input.linkUrl } },
    },
  };
  if (input.imageUrl) {
    (objectStorySpec.link_data as Record<string, unknown>).image_url = input.imageUrl;
  }
  if (input.leadFormId) {
    (objectStorySpec.link_data as Record<string, unknown>).call_to_action = {
      type: 'SIGN_UP',
      value: { lead_gen_form_id: input.leadFormId },
    };
  }
  const result = await metaFetch<{ id: string }>(`/${adAccountId()}/adcreatives`, {
    method: 'POST',
    body: JSON.stringify({ name: input.name, object_story_spec: objectStorySpec }),
  });
  return result.id;
}

/** Create a Meta Lead Ad Form and return its ID */
export async function createMetaLeadForm(
  name: string,
  privacyPolicyUrl: string,
  thankYouMessage: string,
  questions: { label: string; type: string; key?: string }[]
): Promise<string> {
  const result = await metaFetch<{ id: string }>(
    `/${process.env.META_PAGE_ID}/leadgen_forms`,
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        privacy_policy: { url: privacyPolicyUrl },
        thank_you_action_button: 'VIEW_WEBSITE',
        thank_you_message: thankYouMessage,
        questions: questions.map((q) => ({ type: q.key ?? q.type, label: q.label })),
      }),
    }
  );
  return result.id;
}

// ─── Organic page posting ────────────────────────────────────────────────────

export interface MetaPagePostInput {
  pageId:    string;
  message:   string;          // caption / description
  mediaUrl?: string;          // public URL of the image or video to attach
  mediaType?: 'photo' | 'video' | 'reel';
  linkUrl?:  string;          // optional link to attach
}

export interface MetaPagePostResult {
  id:       string;  // post / video id
  postType: 'photo' | 'video' | 'reel' | 'text';
  viewUrl?: string;  // public www.facebook.com permalink when available
}

/**
 * Post organically to a Facebook Page (no ad spend).
 * Always uses a resolved Page access token (not the raw System User token).
 * - photo  → /{pageId}/photos
 * - reel   → /{pageId}/video_reels (official Reels publishing)
 * - video  → /{pageId}/videos, falls back to Reels URL for viewing
 * - text   → /{pageId}/feed
 */
export async function createMetaPagePost(input: MetaPagePostInput): Promise<MetaPagePostResult> {
  const pageId = input.pageId || getMetaPageId();
  if (!pageId) throw new Error('Meta page ID is not configured.');

  const { pageToken } = await resolvePageAccessToken(pageId);

  try {
    if (input.mediaType === 'photo' && input.mediaUrl) {
      const result = await metaFetch<{ id: string; post_id?: string }>(`/${pageId}/photos`, {
        method: 'POST',
        token: pageToken,
        body: JSON.stringify({
          url:       input.mediaUrl,
          caption:   input.message,
          published: true,
        }),
      });
      const id = result.post_id || result.id;
      const viewUrl = await resolveFacebookViewUrl(id, pageToken, { pageId });
      return { id, postType: 'photo', viewUrl };
    }

    if (input.mediaType === 'reel' && input.mediaUrl) {
      try {
        const result = await publishPageReelFromUrl({
          pageId,
          pageToken,
          fileUrl: input.mediaUrl,
          description: input.message,
        });
        const viewUrl = await resolveFacebookViewUrl(result.id, pageToken, {
          pageId,
          preferReel: true,
        });
        return { id: result.id, postType: 'reel', viewUrl };
      } catch (reelErr) {
        // Fall back to classic Page video if Reels API rejects format / permissions
        console.warn('[meta] video_reels failed, falling back to /videos:', reelErr);
        const result = await publishPageVideoFromUrl({
          pageId,
          pageToken,
          fileUrl: input.mediaUrl,
          description: input.message,
        });
        const viewUrl = await resolveFacebookViewUrl(result.id, pageToken, {
          pageId,
          preferReel: true,
        });
        return { id: result.id, postType: 'reel', viewUrl };
      }
    }

    if (input.mediaType === 'video' && input.mediaUrl) {
      const result = await publishPageVideoFromUrl({
        pageId,
        pageToken,
        fileUrl: input.mediaUrl,
        description: input.message,
      });
      const viewUrl = await resolveFacebookViewUrl(result.id, pageToken, {
        pageId,
        preferReel: true,
      });
      return { id: result.id, postType: 'video', viewUrl };
    }

    // Text / link post
    const result = await metaFetch<{ id: string }>(`/${pageId}/feed`, {
      method: 'POST',
      token: pageToken,
      body: JSON.stringify({
        message:   input.message,
        ...(input.linkUrl ? { link: input.linkUrl } : {}),
        published: true,
      }),
    });
    const viewUrl = await resolveFacebookViewUrl(result.id, pageToken, { pageId });
    return { id: result.id, postType: 'text', viewUrl };
  } catch (err) {
    enrichPublishError(err, input.mediaType);
  }
}

// ─── Instagram Content Publishing (Page-linked Business account) ─────────────

export interface InstagramAccountInfo {
  id: string;
  username?: string;
}

/**
 * Instagram professional account linked to the Facebook Page.
 * Requires the Page to have a connected Instagram Business / Creator account.
 */
export async function resolveLinkedInstagramAccount(
  pageId: string,
  pageToken?: string
): Promise<InstagramAccountInfo | null> {
  const token = pageToken ?? (await resolvePageAccessToken(pageId)).pageToken;
  const data = await metaFetch<{
    instagram_business_account?: { id: string; username?: string };
  }>(`/${pageId}?fields=instagram_business_account{id,username}`, { token });
  const ig = data.instagram_business_account;
  if (!ig?.id) return null;
  return { id: ig.id, username: ig.username };
}

async function waitForIgContainer(
  containerId: string,
  token: string,
  maxWaitMs: number
): Promise<{ code: 'FINISHED' | 'ERROR' | 'EXPIRED' | 'TIMEOUT'; detail?: string }> {
  const started = Date.now();
  let lastDetail = '';
  while (Date.now() - started < maxWaitMs) {
    const st = await metaFetch<{ status_code?: string; status?: string }>(
      `/${containerId}?fields=status_code,status`,
      { token }
    );
    const code = (st.status_code || '').toUpperCase();
    lastDetail = st.status || code || lastDetail;
    // FINISHED = ready to publish; PUBLISHED = already live
    if (code === 'FINISHED' || code === 'PUBLISHED') return { code: 'FINISHED', detail: lastDetail };
    if (code === 'ERROR' || code === 'EXPIRED') {
      return {
        code: code as 'ERROR' | 'EXPIRED',
        detail: st.status || code,
      };
    }
    await sleep(2500);
  }
  return { code: 'TIMEOUT', detail: lastDetail || 'still IN_PROGRESS' };
}

export type InstagramPublishResult = {
  status: 'published' | 'pending' | 'failed' | 'skipped';
  mediaId?: string;
  containerId?: string;
  username?: string;
  igUserId?: string;
  viewUrl?: string;
  error?: string;
};

async function downloadMediaBytes(mediaUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(mediaUrl);
  if (!res.ok) {
    throw new Error(
      `Could not download media for Instagram upload (HTTP ${res.status}). Ensure the file URL is publicly reachable.`
    );
  }
  const contentType = res.headers.get('content-type') || 'video/mp4';
  const ab = await res.arrayBuffer();
  return { buffer: Buffer.from(ab), contentType };
}

/**
 * Resumable Reel upload — Meta pulls fail often on CDN URLs; uploading bytes is reliable.
 * Docs: POST /{ig-user-id}/media?upload_type=resumable then rupload.facebook.com
 */
async function createReelViaResumable(input: {
  igUserId: string;
  pageToken: string;
  caption: string;
  mediaUrl: string;
}): Promise<{ containerId: string }> {
  const session = await metaFormPost<{ id: string }>(
    `/${input.igUserId}/media`,
    {
      media_type: 'REELS',
      upload_type: 'resumable',
      caption: input.caption.slice(0, 2200),
      share_to_feed: true,
    },
    input.pageToken
  );

  const { buffer } = await downloadMediaBytes(input.mediaUrl);
  const uploadUrl = `https://rupload.facebook.com/ig-api-upload/${API_VERSION}/${session.id}`;
  const upRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `OAuth ${input.pageToken}`,
      offset: '0',
      file_size: String(buffer.length),
      'Content-Type': 'application/octet-stream',
    },
    body: buffer,
  });
  const upText = await upRes.text();
  let upJson: Record<string, unknown> = {};
  try {
    upJson = JSON.parse(upText) as Record<string, unknown>;
  } catch {
    /* some responses are plain */
  }
  if (!upRes.ok || upJson.error) {
    const err = (upJson.error as Record<string, unknown>) ?? {};
    throw new Error(
      `Instagram resumable upload failed (HTTP ${upRes.status}): ${err.message ?? upText.slice(0, 200)}`
    );
  }

  return { containerId: session.id };
}

async function createReelViaVideoUrl(input: {
  igUserId: string;
  pageToken: string;
  caption: string;
  mediaUrl: string;
}): Promise<{ containerId: string }> {
  const container = await metaFormPost<{ id: string }>(
    `/${input.igUserId}/media`,
    {
      media_type: 'REELS',
      video_url: input.mediaUrl,
      caption: input.caption.slice(0, 2200),
      share_to_feed: true,
    },
    input.pageToken
  );
  return { containerId: container.id };
}

async function createPhotoContainer(input: {
  igUserId: string;
  pageToken: string;
  caption: string;
  mediaUrl: string;
}): Promise<{ containerId: string }> {
  const container = await metaFormPost<{ id: string }>(
    `/${input.igUserId}/media`,
    {
      image_url: input.mediaUrl,
      caption: input.caption.slice(0, 2200),
    },
    input.pageToken
  );
  return { containerId: container.id };
}

async function publishIgContainer(
  igUserId: string,
  containerId: string,
  pageToken: string
): Promise<string> {
  const published = await metaFormPost<{ id: string }>(
    `/${igUserId}/media_publish`,
    { creation_id: containerId },
    pageToken
  );
  return published.id;
}

/**
 * Publish photo or Reel to Instagram via the Content Publishing API.
 * Reels: `preferResumable` uploads bytes to Meta (reliable). Otherwise tries
 * `video_url` first (faster under API Gateway). May return `pending`.
 */
export async function createInstagramOrganicPost(input: {
  igUserId: string;
  pageToken: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video' | 'reel';
  username?: string;
  maxWaitMs?: number;
  /** Prefer byte upload (slower, more reliable). Default false = video_url first. */
  preferResumable?: boolean;
}): Promise<InstagramPublishResult> {
  const maxWait = input.maxWaitMs ?? 12_000;
  const base = {
    igUserId: input.igUserId,
    username: input.username,
    viewUrl: input.username ? `https://www.instagram.com/${input.username}/` : undefined,
  };

  try {
    let containerId: string;
    let createMethod = 'url';

    if (input.mediaType === 'photo') {
      ({ containerId } = await createPhotoContainer({
        igUserId: input.igUserId,
        pageToken: input.pageToken,
        caption: input.caption,
        mediaUrl: input.mediaUrl,
      }));
      createMethod = 'image_url';
    } else {
      const tryResumable = async () => {
        const r = await createReelViaResumable({
          igUserId: input.igUserId,
          pageToken: input.pageToken,
          caption: input.caption,
          mediaUrl: input.mediaUrl,
        });
        return r.containerId;
      };
      const tryUrl = async () => {
        const r = await createReelViaVideoUrl({
          igUserId: input.igUserId,
          pageToken: input.pageToken,
          caption: input.caption,
          mediaUrl: input.mediaUrl,
        });
        return r.containerId;
      };

      const errors: string[] = [];
      if (input.preferResumable) {
        try {
          containerId = await tryResumable();
          createMethod = 'resumable';
        } catch (e) {
          errors.push(`resumable: ${e instanceof Error ? e.message : String(e)}`);
          try {
            containerId = await tryUrl();
            createMethod = 'video_url';
          } catch (e2) {
            errors.push(`video_url: ${e2 instanceof Error ? e2.message : String(e2)}`);
            throw new Error(`Instagram Reel upload failed. ${errors.join(' · ')}`);
          }
        }
      } else {
        // Fast path for API Gateway — Meta pulls the public HTTPS URL. No Lambda download.
        try {
          containerId = await tryUrl();
          createMethod = 'video_url';
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          throw new Error(
            `Instagram Reel create failed (${msg}). ` +
              `Ensure the video URL is public HTTPS, the Page has a linked Instagram Business account, ` +
              `and the System User token includes instagram_basic + instagram_content_publish (re-test in Integrations).`
          );
        }
      }
    }

    const ready = await waitForIgContainer(containerId, input.pageToken, maxWait);
    if (ready.code === 'TIMEOUT') {
      return { status: 'pending', containerId, ...base };
    }
    if (ready.code !== 'FINISHED') {
      return {
        status: 'failed',
        containerId,
        ...base,
        error: `Instagram media processing failed (${ready.code}${ready.detail ? `: ${ready.detail}` : ''}). Method=${createMethod}. Use a public HTTPS video (9:16 H.264 preferred, under ~100MB), then retry Instagram from the campaign page.`,
      };
    }

    const mediaId = await publishIgContainer(input.igUserId, containerId, input.pageToken);
    let viewUrl = base.viewUrl;
    try {
      const media = await metaFetch<{ permalink?: string }>(
        `/${mediaId}?fields=permalink`,
        { token: input.pageToken }
      );
      if (media.permalink) viewUrl = media.permalink;
    } catch { /* keep profile url */ }
    return { status: 'published', mediaId, containerId, ...base, viewUrl };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const hint = /instagram_content_publish|instagram_basic|instagram_business|permission|#10|#200|oauth/i.test(msg)
      ? ' Add instagram_basic + instagram_content_publish (or instagram_business_*) to the System User token, link an Instagram Business account to the Page, then re-test in Integrations.'
      : '';
    return {
      status: 'failed',
      ...base,
      error: `${msg}${hint}`,
    };
  }
}

/** Finish a container that was still processing when publish returned. */
export async function finalizeInstagramContainer(input: {
  igUserId: string;
  containerId: string;
  pageToken: string;
  username?: string;
  maxWaitMs?: number;
}): Promise<InstagramPublishResult> {
  const base = {
    igUserId: input.igUserId,
    username: input.username,
    containerId: input.containerId,
    viewUrl: input.username ? `https://www.instagram.com/${input.username}/` : undefined,
  };
  try {
    const ready = await waitForIgContainer(
      input.containerId,
      input.pageToken,
      input.maxWaitMs ?? 20_000
    );
    if (ready.code === 'TIMEOUT') {
      return {
        status: 'pending',
        ...base,
        error: ready.detail ? `Still processing: ${ready.detail}` : undefined,
      };
    }
    if (ready.code !== 'FINISHED') {
      return {
        status: 'failed',
        ...base,
        error: `Instagram media processing failed (${ready.code}${ready.detail ? `: ${ready.detail}` : ''}). If Meta cannot fetch the video, ensure CloudFront/S3 allows public HTTPS access (and facebookexternalhit crawler).`,
      };
    }
    const mediaId = await publishIgContainer(input.igUserId, input.containerId, input.pageToken);
    let viewUrl = base.viewUrl;
    try {
      const media = await metaFetch<{ permalink?: string }>(
        `/${mediaId}?fields=permalink`,
        { token: input.pageToken }
      );
      if (media.permalink) viewUrl = media.permalink;
    } catch { /* keep profile */ }
    return { status: 'published', mediaId, ...base, viewUrl };
  } catch (err) {
    return {
      status: 'failed',
      ...base,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Fetch leads from a Meta Lead Form */
export async function fetchMetaLeads(leadFormId: string, after?: string): Promise<{
  leads: { id: string; created_time: string; field_data: { name: string; values: string[] }[] }[];
  paging?: { cursors?: { after?: string }; next?: string };
}> {
  const cursor = after ? `&after=${after}` : '';
  return metaFetch(`/${leadFormId}/leads?fields=id,created_time,field_data${cursor}`);
}

/** Verify a Meta webhook challenge (GET request) */
export function verifyMetaWebhook(
  mode: string,
  token: string,
  challenge: string
): string | null {
  const expected = process.env.META_LEAD_WEBHOOK_TOKEN ?? '';
  if (mode === 'subscribe' && token === expected) return challenge;
  return null;
}

export const metaService = {
  createCampaign: createMetaCampaign,
  createAdSet: createMetaAdSet,
  createCreative: createMetaCreative,
  uploadImageFromUrl: uploadMetaImageFromUrl,
  createLeadForm: createMetaLeadForm,
  fetchLeads: fetchMetaLeads,
  verifyWebhook: verifyMetaWebhook,
  createPagePost: createMetaPagePost,
  resolvePageAccessToken,
  resolveLinkedInstagramAccount,
  createInstagramOrganicPost,
  finalizeInstagramContainer,
  debugMetaToken,
};
