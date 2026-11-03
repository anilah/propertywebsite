import { useState, useEffect, useCallback } from 'react';
import {
  Campaign,
  CampaignPlatform,
  TargetAudience,
  LeadFormConfig,
  campaignApi,
  adminListingsApi,
  listingMarketingApi,
  integrationsApi,
  type ListingMarketingItem,
  type PlatformIntegration,
} from '../../services/api';
import type { Listing } from '../../types';

// ─── Platform / campaign type definitions ────────────────────────────────────

interface CampaignTypeOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

interface SubtypeOption {
  value: string;
  label: string;
  mediaRequirements: string;
}

const PLATFORM_META   = { id: 'META'   as CampaignPlatform, label: 'Meta',        sub: 'Facebook & Instagram', color: 'from-blue-600 to-indigo-600',  border: 'border-blue-500',  bg: 'bg-blue-50',  text: 'text-blue-700' };
const PLATFORM_GOOGLE = { id: 'GOOGLE' as CampaignPlatform, label: 'Google Ads',  sub: 'Search & Display',      color: 'from-red-500 to-orange-500',   border: 'border-red-400',   bg: 'bg-red-50',   text: 'text-red-700'  };
const PLATFORM_TIKTOK = { id: 'TIKTOK' as CampaignPlatform, label: 'TikTok Ads',  sub: 'Short-form video',       color: 'from-gray-800 to-gray-600',    border: 'border-gray-700',  bg: 'bg-gray-50',  text: 'text-gray-700' };
const PLATFORMS = [PLATFORM_META, PLATFORM_GOOGLE, PLATFORM_TIKTOK];
const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));

const PLATFORM_TYPES: Record<CampaignPlatform, CampaignTypeOption[]> = {
  META: [
    { value: 'LEAD_GENERATION', icon: '🎯', label: 'Lead Generation', description: 'Capture buyer interest with native Meta lead forms' },
    { value: 'TRAFFIC',         icon: '🔗', label: 'Traffic',         description: 'Drive people directly to your listing page' },
    { value: 'AWARENESS',       icon: '📢', label: 'Awareness',       description: 'Reach a broad audience for brand/listing visibility' },
    { value: 'SALES',           icon: '💰', label: 'Sales',           description: 'Drive conversions with catalog or dynamic ads' },
  ],
  GOOGLE: [
    { value: 'SEARCH',          icon: '🔍', label: 'Search',          description: 'Text ads when buyers search property keywords' },
    { value: 'DISPLAY',         icon: '🖼️', label: 'Display',         description: 'Visual banner ads across Google Display Network' },
    { value: 'VIDEO',           icon: '▶️', label: 'Video',           description: 'YouTube video ads to showcase your property' },
    { value: 'PERFORMANCE_MAX', icon: '⚡', label: 'Performance Max', description: 'AI-powered campaigns across all Google channels' },
  ],
  TIKTOK: [
    { value: 'LEAD_GENERATION', icon: '🎯', label: 'Lead Generation', description: 'TikTok native lead forms to capture buyer interest' },
    { value: 'TRAFFIC',         icon: '🔗', label: 'Traffic',         description: 'Send viewers to your property listing' },
    { value: 'VIDEO_VIEWS',     icon: '▶️', label: 'Video Views',     description: 'Maximise views on your property walkthrough' },
    { value: 'REACH',           icon: '📢', label: 'Reach',           description: 'Show your ad to the maximum number of people' },
  ],
};

const SUBTYPES: Record<CampaignPlatform, Record<string, SubtypeOption[]>> = {
  META: {
    LEAD_GENERATION: [
      { value: 'SINGLE_IMAGE', label: 'Single Image',  mediaRequirements: 'Image: 1200×628px (1.91:1) or 1080×1080px (1:1). Max 30MB.' },
      { value: 'CAROUSEL',     label: 'Carousel',      mediaRequirements: '2–10 images, 1080×1080px (1:1). Max 30MB each.' },
      { value: 'VIDEO',        label: 'Video',         mediaRequirements: 'Video: 4:5 or 1:1, 15s–10min. Max 4GB.' },
      { value: 'STORIES',      label: 'Stories',       mediaRequirements: 'Vertical 9:16 (1080×1920). Max 15s video or static image.' },
      { value: 'REELS',        label: 'Reels',         mediaRequirements: 'Vertical 9:16 (1080×1920). 15s–60s video.' },
    ],
    TRAFFIC:   [
      { value: 'SINGLE_IMAGE', label: 'Single Image',  mediaRequirements: 'Image: 1200×628px or 1080×1080px.' },
      { value: 'VIDEO',        label: 'Video',         mediaRequirements: 'Video: any aspect ratio, max 240 min.' },
      { value: 'CAROUSEL',     label: 'Carousel',      mediaRequirements: '2–10 cards, 1080×1080px.' },
    ],
    AWARENESS: [
      { value: 'SINGLE_IMAGE', label: 'Single Image',  mediaRequirements: 'Image: 1200×628px or 1080×1080px.' },
      { value: 'VIDEO',        label: 'Video',         mediaRequirements: 'Video: min 1s, max 241 min.' },
    ],
    SALES:     [
      { value: 'SINGLE_IMAGE', label: 'Single Image',  mediaRequirements: 'Image: 1200×628px.' },
      { value: 'CAROUSEL',     label: 'Carousel',      mediaRequirements: '2–10 cards, 1080×1080px.' },
    ],
  },
  GOOGLE: {
    SEARCH:  [{ value: 'RESPONSIVE_SEARCH',  label: 'Responsive Search',  mediaRequirements: 'Text only: up to 15 headlines (30 chars) and 4 descriptions (90 chars).' }],
    DISPLAY: [{ value: 'RESPONSIVE_DISPLAY', label: 'Responsive Display', mediaRequirements: 'Images: 1200×628 landscape, 1200×1200 square. Logo: 1200×1200.' }],
    VIDEO:   [
      { value: 'SKIPPABLE_IN_STREAM', label: 'Skippable In-Stream', mediaRequirements: 'YouTube video URL. Min 12s, skip after 5s.' },
      { value: 'BUMPER',              label: 'Bumper Ad (6s)',       mediaRequirements: 'YouTube video URL. Max 6s, non-skippable.' },
    ],
    PERFORMANCE_MAX: [{ value: 'PMAX', label: 'Performance Max', mediaRequirements: 'Multiple images + videos + headlines + descriptions.' }],
  },
  TIKTOK: {
    LEAD_GENERATION: [{ value: 'IN_FEED_AD', label: 'In-Feed Ad', mediaRequirements: 'Vertical video 9:16 (540×960 min, 1080×1920 recommended). 5–60s. Max 500MB.' }],
    TRAFFIC:         [
      { value: 'IN_FEED_AD', label: 'In-Feed Ad', mediaRequirements: 'Vertical video 9:16. 5–60s.' },
      { value: 'TOPVIEW',    label: 'TopView',    mediaRequirements: 'Full-screen vertical video. 5–60s. Premium placement.' },
    ],
    VIDEO_VIEWS: [{ value: 'IN_FEED_AD', label: 'In-Feed Ad', mediaRequirements: 'Vertical video 9:16. 5–60s.' }],
    REACH:       [{ value: 'IN_FEED_AD', label: 'In-Feed Ad', mediaRequirements: 'Vertical video 9:16. 5–60s.' }],
  },
};

const CTA_OPTIONS = [
  { value: 'LEARN_MORE',  label: 'Learn More'  },
  { value: 'CONTACT_US',  label: 'Contact Us'  },
  { value: 'APPLY_NOW',   label: 'Apply Now'   },
  { value: 'GET_QUOTE',   label: 'Get Quote'   },
  { value: 'BOOK_NOW',    label: 'Book Now'    },
  { value: 'SIGN_UP',     label: 'Sign Up'     },
  { value: 'DOWNLOAD',    label: 'Download'    },
];

const STEPS_PAID: { label: string; icon: string }[] = [
  { label: 'Platform',   icon: '🎯' },
  { label: 'Property',   icon: '🏠' },
  { label: 'Ad Content', icon: '✍️' },
  { label: 'Budget',     icon: '💰' },
  { label: 'Lead Form',  icon: '📋' },
  { label: 'Review',     icon: '✅' },
];

const STEPS_ORGANIC: { label: string; icon: string }[] = [
  { label: 'Platform',   icon: '🎯' },
  { label: 'Property',   icon: '🏠' },
  { label: 'Content',    icon: '✍️' },
  { label: 'Review',     icon: '✅' },
];

// ─── Form state ───────────────────────────────────────────────────────────────

type CampaignMode = 'ORGANIC' | 'PAID';

type WizardForm = {
  campaignMode:   CampaignMode;
  title:          string;
  platform:       CampaignPlatform;
  campaignType:   string;
  campaignSubtype: string;
  listingIds:     string[];
  headline:       string;
  primaryText:    string;
  description:    string;
  callToAction:   string;
  destinationUrl: string;
  assets:         { url: string; assetType: 'IMAGE' | 'VIDEO'; format: string }[];
  budgetType:     'DAILY' | 'LIFETIME';
  budgetAmount:   string;
  currency:       string;
  startDate:      string;
  endDate:        string;
  targetAudience: TargetAudience;
  leadFormConfig: LeadFormConfig;
  notes:          string;
  /** Organic Meta: also publish to linked Instagram Business account. */
  postToInstagram: boolean;
};

const defaultForm = (): WizardForm => ({
  campaignMode:    'ORGANIC',
  title:           '',
  platform:        'META',
  campaignType:    'LEAD_GENERATION',
  campaignSubtype: 'SINGLE_IMAGE',
  listingIds:      [],
  headline:        '',
  primaryText:     '',
  description:     '',
  callToAction:    'LEARN_MORE',
  destinationUrl:  '',
  assets:          [],
  budgetType:      'DAILY',
  budgetAmount:    '',
  currency:        'NZD',
  startDate:       '',
  endDate:         '',
  targetAudience:  { ageMin: 25, ageMax: 65, genders: [], locations: ['NZ'], interests: [] },
  leadFormConfig:  { fields: [{ key: 'full_name', label: 'Full name', required: true }, { key: 'email', label: 'Email', required: true }, { key: 'phone_number', label: 'Phone', required: false }], thankYouMessage: 'Thanks — we will be in touch.' },
  notes:           '',
  postToInstagram: true,
});

// ─── Platform SVG icons ───────────────────────────────────────────────────────

const PlatformIcon = ({ id, className = 'w-5 h-5' }: { id: CampaignPlatform; className?: string }) => {
  if (id === 'META') return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
  if (id === 'GOOGLE') return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5 16.25 5 12C5 7.9 8.2 4.73 12.2 4.73C15.29 4.73 17.1 6.7 17.1 6.7L19 4.72C19 4.72 16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12C2.03 17.05 6.16 22 12.25 22C17.6 22 21.5 18.33 21.5 12.91C21.5 11.76 21.35 11.1 21.35 11.1Z"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.1 8.1 0 004.79 1.54V7.04a4.85 4.85 0 01-1.02-.35z"/>
    </svg>
  );
};

// ─── UI helpers ───────────────────────────────────────────────────────────────

const fieldCls = 'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';
const sectionTitle = 'text-sm font-bold text-gray-900 mb-0.5';
const sectionSub   = 'text-xs text-gray-400 mb-3';

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  initialData?: Campaign;
  onSaved:  (c: Campaign) => void;
  onClose:  () => void;
}

export function CampaignWizard({ initialData, onSaved, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardForm>(() => {
    if (!initialData) return defaultForm();
    return {
      campaignMode:    ((initialData as unknown as Record<string,unknown>).platformConfig as Record<string,unknown>)?.campaignMode as CampaignMode ?? 'ORGANIC',
      title:           initialData.title,
      platform:        initialData.platform,
      campaignType:    initialData.campaignType,
      campaignSubtype: initialData.campaignSubtype ?? '',
      listingIds:      initialData.listingIds ?? [],
      headline:        initialData.headline ?? '',
      primaryText:     initialData.primaryText ?? '',
      description:     initialData.description ?? '',
      callToAction:    initialData.callToAction ?? 'LEARN_MORE',
      destinationUrl:  initialData.destinationUrl ?? '',
      assets:          (initialData.assets ?? []).map((a) => ({
        url: a.url, assetType: a.assetType as 'IMAGE' | 'VIDEO', format: a.format ?? '',
      })),
      budgetType:    initialData.budgetType ?? 'DAILY',
      budgetAmount:  String(initialData.budgetAmount ?? '20'),
      currency:      initialData.currency ?? 'NZD',
      startDate:     initialData.startDate ? initialData.startDate.slice(0, 10) : '',
      endDate:       initialData.endDate   ? initialData.endDate.slice(0, 10)   : '',
      targetAudience: initialData.targetAudience ?? { ageMin: 25, ageMax: 65, locations: ['NZ'] },
      leadFormConfig: initialData.leadFormConfig  ?? defaultForm().leadFormConfig,
      notes:          initialData.notes ?? '',
      postToInstagram:
        ((initialData.platformConfig as { postToInstagram?: boolean } | null)?.postToInstagram) !== false,
    };
  });

  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingSearch, setListingSearch] = useState('');
  const [marketingByListing, setMarketingByListing] = useState<Record<string, ListingMarketingItem[]>>({});
  const [marketingLoading, setMarketingLoading] = useState(false);
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);

  useEffect(() => {
    adminListingsApi.getAll({ page: 1, pageSize: 100 })
      .then((r) => setListings(r.listings))
      .catch(() => {});
    integrationsApi.list()
      .then((rows) => setIntegrations(rows))
      .catch(() => {});
  }, []);

  const loadMarketing = useCallback(async (ids: string[]) => {
    const toFetch = ids.filter((id) => !(id in marketingByListing));
    if (toFetch.length === 0) return;
    setMarketingLoading(true);
    const results = await Promise.allSettled(toFetch.map((id) => listingMarketingApi.list(id).then((r) => ({ id, media: r.media }))));
    setMarketingByListing((prev) => {
      const next = { ...prev };
      for (const r of results) {
        if (r.status === 'fulfilled') next[r.value.id] = r.value.media;
      }
      return next;
    });
    setMarketingLoading(false);
  }, [marketingByListing]);

  // Load marketing content for any pre-selected listings (e.g. when editing an existing campaign)
  useEffect(() => {
    if (form.listingIds.length > 0) loadMarketing(form.listingIds);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.listingIds.join(',')]);

  // Only show dedicated marketing content uploaded in the Marketing section
  // (Reel / Flyer / Carousel — and legacy Video)
  const allMarketingItems: (ListingMarketingItem & { listingHeadline?: string })[] = form.listingIds.flatMap((id) => {
    const headline = listings.find((l) => l.id === id)?.headline;
    return (marketingByListing[id] ?? []).map((m) => ({ ...m, listingHeadline: headline }));
  });

  // Auto-select the only available marketing item when no assets are chosen yet
  useEffect(() => {
    if (form.assets.length > 0) return;
    if (allMarketingItems.length !== 1) return;
    const item = allMarketingItems[0];
    const isVideo = item.kind === 'VIDEO' || item.kind === 'REEL';
    setForm((f) => ({
      ...f,
      assets: [{ url: item.url, assetType: isVideo ? 'VIDEO' : 'IMAGE', format: item.kind }],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMarketingItems.length]);

  const set = <K extends keyof WizardForm>(key: K, value: WizardForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Dynamic steps based on mode
  const STEPS = form.campaignMode === 'ORGANIC' ? STEPS_ORGANIC : STEPS_PAID;

  // Organic step indices: 0=Platform, 1=Property, 2=Content, 3=Review
  // Paid step indices:    0=Platform, 1=Property, 2=AdContent, 3=Budget, 4=LeadForm, 5=Review
  const stepRenderIndex = form.campaignMode === 'ORGANIC'
    ? [0, 1, 2, 5]   // maps wizard step → renderStep index (skip budget=3 and leadform=4)
    : [0, 1, 2, 3, 4, 5];

  const subtypes = SUBTYPES[form.platform]?.[form.campaignType] ?? [];
  const selectedSubtype = subtypes.find((s) => s.value === form.campaignSubtype);

  const handleTypeChange = (type: string) => {
    const newSubs = SUBTYPES[form.platform]?.[type] ?? [];
    setForm((f) => ({ ...f, campaignType: type, campaignSubtype: newSubs[0]?.value ?? '' }));
  };

  const handlePlatformChange = (p: CampaignPlatform) => {
    const types  = PLATFORM_TYPES[p];
    const first  = types[0]?.value ?? '';
    const firstSub = SUBTYPES[p]?.[first]?.[0]?.value ?? '';
    setForm((f) => ({ ...f, platform: p, campaignType: first, campaignSubtype: firstSub }));
  };

  const validate = (): string => {
    if (step === 0 && !form.title.trim()) return 'Campaign title is required.';
    if (step === 2 && !form.headline.trim()) return 'Headline is required.';
    return '';
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => { setError(''); setStep((s) => Math.max(s - 1, 0)); };

  const handleSave = async (andPublish = false) => {
    setSaving(true);
    setError('');
    try {
      const first = form.assets.find((a) => a.url);
      const organicSubtype =
        form.campaignMode === 'ORGANIC'
          ? first?.format === 'REEL'
            ? 'REELS'
            : first?.assetType === 'VIDEO' || first?.format === 'VIDEO'
              ? 'VIDEO'
              : 'SINGLE_IMAGE'
          : form.campaignSubtype;

      const payload: Partial<Campaign> = {
        title: form.title, platform: form.platform, campaignType: form.campaignType,
        campaignSubtype: organicSubtype || form.campaignSubtype || undefined, listingIds: form.listingIds,
        headline: form.headline || undefined, primaryText: form.primaryText || undefined,
        description: form.description || undefined, callToAction: form.callToAction || undefined,
        destinationUrl: form.destinationUrl || undefined, budgetType: form.budgetType,
        budgetAmount: form.campaignMode === 'PAID' ? (parseFloat(form.budgetAmount) || undefined) : undefined,
        currency: form.currency,
        startDate: form.startDate || undefined, endDate: form.endDate || undefined,
        targetAudience: form.targetAudience, leadFormConfig: form.leadFormConfig,
        notes: form.notes || undefined,
        platformConfig: {
          ...((initialData?.platformConfig && typeof initialData.platformConfig === 'object')
            ? (initialData.platformConfig as Record<string, unknown>)
            : {}),
          campaignMode: form.campaignMode,
          postToInstagram: form.campaignMode === 'ORGANIC' && form.platform === 'META' ? form.postToInstagram : false,
        },
      } as Partial<Campaign>;

      let saved: Campaign;
      if (initialData?.id) {
        saved = await campaignApi.update(initialData.id, payload);
        // Delete existing assets before re-adding to avoid duplicates
        await Promise.all((initialData.assets ?? []).map((a) => campaignApi.deleteAsset(saved.id, a.id)));
      } else {
        saved = await campaignApi.create(payload);
      }

      for (const asset of form.assets) {
        if (!asset.url) continue;
        await campaignApi.addAsset(saved.id, { assetType: asset.assetType, url: asset.url, format: asset.format || undefined });
      }

      if (andPublish) {
        const pub = await campaignApi.publish(saved.id);
        saved = pub.campaign;
      }

      onSaved(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const filteredListings = listings.filter((l) =>
    !listingSearch ||
    l.headline?.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.location?.suburb?.toLowerCase().includes(listingSearch.toLowerCase())
  );

  const platformInfo = PLATFORM_MAP[form.platform];

  // ── Step 0: Platform & Objective ─────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="space-y-4">

      {/* Campaign mode toggle */}
      <div>
        <p className={sectionTitle}>Campaign type</p>
        <p className={sectionSub}>Choose how you want to reach your audience.</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            {
              value: 'ORGANIC' as CampaignMode,
              icon: '📲',
              label: 'Organic post',
              badge: 'Free',
              badgeColor: 'bg-emerald-100 text-emerald-700',
              desc: 'Post a reel or video directly to your Facebook / Instagram page. No ad spend required.',
            },
            {
              value: 'PAID' as CampaignMode,
              icon: '📈',
              label: 'Paid campaign',
              badge: 'Sponsored',
              badgeColor: 'bg-amber-100 text-amber-700',
              desc: 'Run a targeted ad campaign with budget, audience controls, and performance tracking.',
            },
          ] as const).map((m) => {
            const active = form.campaignMode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => set('campaignMode', m.value)}
                className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all overflow-hidden ${
                  active
                    ? 'border-primary-500 bg-primary-50 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                {active && <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary-500 to-primary-400 rounded-l-xl" />}
                <span className="text-2xl leading-none flex-shrink-0 ml-1">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${active ? 'text-primary-700' : 'text-gray-800'}`}>{m.label}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
                {active && (
                  <span className="w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {form.campaignMode === 'ORGANIC' && form.platform === 'META' && (
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-white cursor-pointer hover:border-pink-200">
          <input
            type="checkbox"
            className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            checked={form.postToInstagram}
            onChange={(e) => set('postToInstagram', e.target.checked)}
          />
          <span>
            <span className="block text-sm font-bold text-gray-900">Also post to Instagram</span>
            <span className="block text-xs text-gray-400 mt-0.5 leading-relaxed">
              Publishes the same Reel/photo to the Instagram Business account linked to your Facebook Page.
              Requires Instagram linked in Meta Business Suite and <code className="text-[10px]">instagram_content_publish</code> on your token (re-test in Integrations).
            </span>
          </span>
        </label>
      )}

      <div>
        <p className={sectionTitle}>Campaign title</p>
        <input
          className={fieldCls}
          placeholder="e.g. Spring Sale – Remuera Properties"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </div>

      {/* Platform selector */}
      <div>
        <p className={sectionTitle}>Choose platform</p>
        <div className="grid grid-cols-3 gap-3">
          {PLATFORMS.map((p) => {
            const active = form.platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePlatformChange(p.id)}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  active
                    ? `${p.border} ${p.bg} shadow-sm`
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                {active && (
                  <span className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-white`}>
                  <PlatformIcon id={p.id} className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold ${active ? p.text : 'text-gray-800'}`}>{p.label}</p>
                  <p className="text-[10px] text-gray-400">{p.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Objective + Ad format — only for paid campaigns */}
      {form.campaignMode === 'PAID' && (
        <div className="space-y-3">
          <div>
            <p className={sectionTitle}>Campaign objective</p>
            <div className="grid grid-cols-2 gap-1.5">
              {PLATFORM_TYPES[form.platform].map((type) => {
                const active = form.campaignType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border-2 text-left transition-all ${
                      active
                        ? `${platformInfo.border} ${platformInfo.bg}`
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{type.icon}</span>
                    <div>
                      <p className={`text-xs font-semibold ${active ? platformInfo.text : 'text-gray-800'}`}>{type.label}</p>
                      <p className="text-[10px] text-gray-400 leading-tight">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {subtypes.length > 0 && (
            <div>
              <p className={sectionTitle}>Ad format</p>
              <div className="flex flex-wrap gap-2">
                {subtypes.map((sub) => (
                  <button
                    key={sub.value}
                    type="button"
                    onClick={() => set('campaignSubtype', sub.value)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.campaignSubtype === sub.value
                        ? `${platformInfo.border} ${platformInfo.bg} ${platformInfo.text}`
                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
              {selectedSubtype && (
                <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 text-xs text-amber-800">
                  <span className="text-base flex-shrink-0">📐</span>
                  <span><strong>Spec:</strong> {selectedSubtype.mediaRequirements}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Internal notes */}
      <div>
        <label className={labelCls}>Internal notes <span className="font-normal text-gray-400">(admin only)</span></label>
        <textarea
          rows={2}
          className={fieldCls}
          placeholder="Notes visible only to admins…"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>
    </div>
  );

  // ── Step 1: Property selection ────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-3">
      <div>
        <p className={sectionTitle}>Select property</p>
        <p className={sectionSub}>Choose the property to promote. In the next step you'll pick its marketing content for the ad.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Search by headline or suburb…"
          value={listingSearch}
          onChange={(e) => setListingSearch(e.target.value)}
        />
      </div>

      {/* Listing cards */}
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredListings.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No listings found.</div>
        )}
        {filteredListings.map((l) => {
          const selected = form.listingIds.includes(l.id);
          const thumb    = l.media?.[0]?.url;
          const location = [l.location?.suburb, l.location?.district].filter(Boolean).join(', ');
          return (
            <label
              key={l.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                selected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => {
                  const newIds = e.target.checked
                    ? [...form.listingIds, l.id]
                    : form.listingIds.filter((id) => id !== l.id);
                  set('listingIds', newIds);
                  if (e.target.checked) loadMarketing([l.id]);
                }}
                className="sr-only"
              />
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {thumb
                  ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
                }
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{l.headline}</p>
                {location && <p className="text-xs text-gray-400">{location}</p>}
                <div className="flex items-center gap-1 mt-1">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                    l.listingType === 'SALE' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>{l.listingType}</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                    l.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{l.status}</span>
                </div>
              </div>
              {/* Checkbox indicator */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                selected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
              }`}>
                {selected && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-gray-400">
          {form.listingIds.length > 0
            ? `${form.listingIds.length} propert${form.listingIds.length !== 1 ? 'ies' : 'y'} selected`
            : 'No property selected'}
        </p>
        {form.listingIds.length > 0 && (
          <button
            type="button"
            onClick={() => set('listingIds', [])}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Clear selection
          </button>
        )}
      </div>
    </div>
  );

  // ── Step 2: Ad content + media picker ────────────────────────────────────────

  const renderStep2 = () => (
    <div className="space-y-3">
      {selectedSubtype && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 text-xs text-amber-800">
          <span className="text-base flex-shrink-0">📐</span>
          <span><strong>{selectedSubtype.label}:</strong> {selectedSubtype.mediaRequirements}</span>
        </div>
      )}

      <div>
        <label className={labelCls}>
          Headline <span className="font-normal text-gray-400 text-xs">*</span>
        </label>
        <input
          className={fieldCls}
          placeholder="e.g. Stunning 4-Bed Home in Remuera"
          maxLength={255}
          value={form.headline}
          onChange={(e) => set('headline', e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-400">{form.headline.length} / 255 chars (max 30 for Google Search)</p>
      </div>

      <div>
        <label className={labelCls}>Primary text <span className="font-normal text-gray-400 text-xs">(body copy)</span></label>
        <textarea
          rows={3}
          className={fieldCls}
          placeholder="A beautifully renovated family home in one of Auckland's most sought-after suburbs. Open homes this weekend!"
          value={form.primaryText}
          onChange={(e) => set('primaryText', e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls}>Description <span className="font-normal text-gray-400 text-xs">(shown under headline)</span></label>
        <textarea
          rows={2}
          className={fieldCls}
          placeholder="Short description shown under the headline"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Call to action</label>
          <select className={fieldCls} value={form.callToAction} onChange={(e) => set('callToAction', e.target.value)}>
            {CTA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Destination URL <span className="font-normal text-gray-400 text-xs">(optional)</span></label>
          <input
            className={fieldCls}
            placeholder="Default: listing page"
            value={form.destinationUrl}
            onChange={(e) => set('destinationUrl', e.target.value)}
          />
        </div>
      </div>

      {/* Marketing content picker */}
      <div>
        <p className={sectionTitle}>
          Marketing content
          {(form.campaignSubtype === 'STORIES' || form.campaignSubtype === 'REELS' || form.platform === 'TIKTOK')
            ? ' · Vertical 9:16 preferred'
            : form.campaignSubtype === 'CAROUSEL' ? ' · Select 2–10 items' : ''}
        </p>

        {form.listingIds.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
            <span className="text-3xl">🏠</span>
            <p className="text-sm font-medium">No property selected</p>
            <p className="text-xs">← Go back to step 2 and select a property first</p>
          </div>
        ) : marketingLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allMarketingItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 border-2 border-dashed border-amber-200 bg-amber-50 rounded-2xl text-amber-700">
            <span className="text-3xl">📂</span>
            <p className="text-sm font-semibold">No marketing content found</p>
            <p className="text-xs text-center px-6">Open the listing and upload a Reel, Flyer, or Carousel in the Marketing section.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {form.listingIds.map((lid) => {
              const items = allMarketingItems.filter((m) => m.listingId === lid);
              const listing = listings.find((l) => l.id === lid);
              if (items.length === 0) return null;
              return (
                <div key={lid}>
                  {form.listingIds.length > 1 && (
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 truncate">{listing?.headline ?? lid}</p>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {items.map((item) => {
                      const isVideo = item.kind === 'VIDEO' || item.kind === 'REEL';
                      const assetType: 'IMAGE' | 'VIDEO' = isVideo ? 'VIDEO' : 'IMAGE';
                      const isSelected = form.assets.some((a) => a.url === item.url);
                      const toggle = () => {
                        if (isSelected) {
                          set('assets', form.assets.filter((a) => a.url !== item.url));
                        } else {
                          set('assets', [...form.assets, { url: item.url, assetType, format: item.kind }]);
                        }
                      };
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={toggle}
                          className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all focus:outline-none group ${
                            isSelected
                              ? 'border-primary-500 ring-2 ring-primary-200 shadow-md'
                              : 'border-gray-100 hover:border-gray-300'
                          }`}
                        >
                          {isVideo
                            ? <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                            : <img src={item.url} alt={item.kind} className="w-full h-full object-cover" />
                          }
                          {/* Overlay on hover */}
                          <div className={`absolute inset-0 transition-opacity ${isSelected ? 'bg-primary-600/20' : 'bg-black/0 group-hover:bg-black/10'}`} />
                          {/* Kind badge */}
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                            {item.kind}
                          </span>
                          {/* Selected check */}
                          {isSelected && (
                            <span className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center shadow">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <span>{form.assets.length} item{form.assets.length !== 1 ? 's' : ''} selected</span>
              {form.assets.length > 0 && (
                <button type="button" onClick={() => set('assets', [])} className="text-red-400 hover:text-red-600 transition-colors">Clear selection</button>
              )}
            </div>

            {/* Manual URL fallback */}
            <details className="border border-gray-100 rounded-xl overflow-hidden">
              <summary className="flex items-center gap-2 px-4 py-3 text-xs text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors select-none">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add additional asset URL manually
              </summary>
              <div className="px-4 pb-4 space-y-2 bg-gray-50">
                {form.assets.filter((a) => !allMarketingItems.some((m) => m.url === a.url)).map((a, i) => (
                  <div key={i} className="flex items-center gap-2 mt-2">
                    <select
                      value={a.assetType}
                      onChange={(e) => {
                        const next = [...form.assets];
                        const idx = form.assets.indexOf(a);
                        next[idx] = { ...next[idx], assetType: e.target.value as 'IMAGE' | 'VIDEO' };
                        set('assets', next);
                      }}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white"
                    >
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                    </select>
                    <input
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white"
                      placeholder="Asset URL"
                      value={a.url}
                      onChange={(e) => {
                        const next = [...form.assets];
                        const idx = form.assets.indexOf(a);
                        next[idx] = { ...next[idx], url: e.target.value };
                        set('assets', next);
                      }}
                    />
                    <button type="button" onClick={() => set('assets', form.assets.filter((x) => x !== a))} className="text-red-400 hover:text-red-600 px-1">✕</button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => set('assets', [...form.assets, { url: '', assetType: 'IMAGE', format: '' }])}
                  className="text-xs text-primary-600 hover:underline mt-1"
                >
                  + Add URL
                </button>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );

  // ── Step 3: Budget & targeting ────────────────────────────────────────────────

  const renderStep3 = () => (
    <div className="space-y-4">
      {/* Budget */}
      <div>
        <p className={sectionTitle}>Budget</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Budget type</label>
            <div className="flex gap-2">
              {(['DAILY', 'LIFETIME'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('budgetType', t)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.budgetType === t
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                  }`}
                >
                  {t === 'DAILY' ? '📅 Daily' : '⏳ Lifetime'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Amount (NZD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
              <input
                type="number"
                min={1}
                className={`${fieldCls} pl-8`}
                value={form.budgetAmount}
                onChange={(e) => set('budgetAmount', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div>
        <p className={sectionTitle}>Schedule <span className="text-sm font-normal text-gray-400">(optional)</span></p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Start date</label>
            <input type="date" className={fieldCls} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>End date</label>
            <input type="date" className={fieldCls} value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Audience */}
      <div>
        <p className={sectionTitle}>Audience targeting</p>
        <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Age min</label>
              <input
                type="number" min={13} max={65}
                className={fieldCls}
                value={form.targetAudience.ageMin ?? 25}
                onChange={(e) => set('targetAudience', { ...form.targetAudience, ageMin: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelCls}>Age max</label>
              <input
                type="number" min={18} max={100}
                className={fieldCls}
                value={form.targetAudience.ageMax ?? 65}
                onChange={(e) => set('targetAudience', { ...form.targetAudience, ageMax: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Gender</label>
            <div className="flex gap-2">
              {[{ v: 'ALL', l: 'All genders' }, { v: 'MALE', l: 'Male only' }, { v: 'FEMALE', l: 'Female only' }].map((g) => {
                const genders = form.targetAudience.genders ?? ['ALL'];
                const active  = genders.includes(g.v) || (g.v === 'ALL' && genders.length === 0);
                return (
                  <label key={g.v} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer px-3 py-2.5 rounded-xl border-2 transition-all ${active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}>
                    <input type="radio" name="gender" checked={active} onChange={() => set('targetAudience', { ...form.targetAudience, genders: g.v === 'ALL' ? [] : [g.v] })} className="sr-only" />
                    {g.l}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className={labelCls}>Locations <span className="font-normal text-gray-400">(comma-separated country codes)</span></label>
            <input
              className={fieldCls}
              placeholder="NZ, AU"
              value={(form.targetAudience.locations ?? ['NZ']).join(', ')}
              onChange={(e) => set('targetAudience', { ...form.targetAudience, locations: e.target.value.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean) })}
            />
          </div>

          <div>
            <label className={labelCls}>Interests <span className="font-normal text-gray-400">(comma-separated)</span></label>
            <input
              className={fieldCls}
              placeholder="Real Estate, Home Improvement, Investment"
              value={(form.targetAudience.interests ?? []).join(', ')}
              onChange={(e) => set('targetAudience', { ...form.targetAudience, interests: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step 4: Lead form ─────────────────────────────────────────────────────────

  const renderStep4 = () => {
    const isLeadGen = form.campaignType === 'LEAD_GENERATION';
    return (
      <div className="space-y-5">
        {!isLeadGen ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="text-4xl">📊</span>
            <p className="text-base font-semibold text-gray-700">Lead form not needed</p>
            <p className="text-sm text-gray-400 max-w-xs">Lead forms are only for <strong>Lead Generation</strong> campaigns. Leads from other objectives are captured via platform webhooks automatically.</p>
          </div>
        ) : (
          <>
            <div>
              <label className={labelCls}>Thank you message</label>
              <input
                className={fieldCls}
                value={form.leadFormConfig.thankYouMessage ?? ''}
                onChange={(e) => set('leadFormConfig', { ...form.leadFormConfig, thankYouMessage: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Privacy policy URL</label>
              <input
                className={fieldCls}
                placeholder="https://yoursite.com/privacy"
                value={form.leadFormConfig.privacyPolicyUrl ?? ''}
                onChange={(e) => set('leadFormConfig', { ...form.leadFormConfig, privacyPolicyUrl: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Form fields</label>
              <div className="space-y-2">
                {form.leadFormConfig.fields.map((field, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <input
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="Field label"
                      value={field.label}
                      onChange={(e) => {
                        const next = [...form.leadFormConfig.fields];
                        next[i] = { ...next[i], label: e.target.value };
                        set('leadFormConfig', { ...form.leadFormConfig, fields: next });
                      }}
                    />
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => {
                          const next = [...form.leadFormConfig.fields];
                          next[i] = { ...next[i], required: e.target.checked };
                          set('leadFormConfig', { ...form.leadFormConfig, fields: next });
                        }}
                        className="rounded"
                      />
                      Required
                    </label>
                    <button
                      type="button"
                      onClick={() => set('leadFormConfig', { ...form.leadFormConfig, fields: form.leadFormConfig.fields.filter((_, j) => j !== i) })}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => set('leadFormConfig', { ...form.leadFormConfig, fields: [...form.leadFormConfig.fields, { key: `field_${Date.now()}`, label: '', required: false }] })}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-colors"
                >
                  + Add field
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // ── Step 5: Review ────────────────────────────────────────────────────────────

  const renderStep5 = () => {
    const pm = { META: 'Meta (Facebook/Instagram)', GOOGLE: 'Google Ads', TIKTOK: 'TikTok Ads' };
    const pInfo = PLATFORM_MAP[form.platform];
    const selectedListings = form.listingIds.map((id) => listings.find((l) => l.id === id)).filter(Boolean) as Listing[];
    const integration = integrations.find((i) => i.platform === form.platform);
    const hasCredentials = integration ? Object.keys(integration.config).length > 0 : false;
    const isConnected = integration?.isActive && hasCredentials;
    const testOk = integration?.lastTestOk;

    const connBadge = () => {
      if (!integration || !hasCredentials) return { icon: '⚠️', label: 'Not configured', cls: 'bg-red-50 border-red-200 text-red-700' };
      if (!integration.isActive)           return { icon: '⏸', label: 'Disabled',        cls: 'bg-amber-50 border-amber-200 text-amber-700' };
      if (testOk === true)                 return { icon: '✅', label: 'Connected & tested', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
      if (testOk === false)                return { icon: '❌', label: 'Connection test failed', cls: 'bg-red-50 border-red-200 text-red-700' };
      return { icon: '🔗', label: 'Configured (not yet tested)', cls: 'bg-blue-50 border-blue-200 text-blue-700' };
    };
    const conn = connBadge();

    return (
      <div className="space-y-5">

        {/* Two-column layout for wider modal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Left — summary + connection */}
          <div className="space-y-4">
            {/* Platform hero */}
            <div className={`rounded-2xl p-5 bg-gradient-to-br ${pInfo.color} text-white`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <PlatformIcon id={form.platform} className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-80">{pm[form.platform]}</p>
              </div>
              <p className="text-lg font-bold leading-tight">{form.title || '—'}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
                  {form.campaignMode === 'ORGANIC' ? '📲 Organic post' : '📈 Paid campaign'}
                </span>
                {form.campaignMode === 'PAID' && [form.campaignType, form.campaignSubtype].filter(Boolean).map((t) => (
                  <span key={t} className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">{t}</span>
                ))}
              </div>
            </div>

            {/* Connection status */}
            <div className={`flex items-start gap-3 p-4 rounded-2xl border ${conn.cls}`}>
              <span className="text-xl flex-shrink-0 leading-none mt-0.5">{conn.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{pm[form.platform]} · {conn.label}</p>
                {integration?.lastTestedAt && (
                  <p className="text-xs opacity-70 mt-0.5">
                    Last tested {new Date(integration.lastTestedAt).toLocaleString()}
                  </p>
                )}
                {integration?.lastTestMsg && testOk === false && (
                  <p className="text-xs mt-1 font-mono opacity-80 truncate">{integration.lastTestMsg}</p>
                )}
                {!isConnected && (
                  <a href="/admin/integrations" target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs font-semibold underline underline-offset-2 opacity-90 hover:opacity-100">
                    Configure in Integrations →
                  </a>
                )}
              </div>
            </div>

            {/* Detail rows */}
            <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100 text-sm">
              {[
                { label: 'Property', value: selectedListings.length ? selectedListings.map((l) => l.headline).join(', ') : 'None selected' },
                { label: 'Headline', value: form.headline || '—' },
                { label: 'CTA',      value: CTA_OPTIONS.find((c) => c.value === form.callToAction)?.label ?? form.callToAction },
                ...(form.campaignMode === 'PAID' ? [
                  { label: 'Budget',   value: form.budgetAmount ? `$${form.budgetAmount} NZD / ${form.budgetType === 'DAILY' ? 'day' : 'total'}` : '—' },
                  { label: 'Audience', value: `Age ${form.targetAudience.ageMin ?? 25}–${form.targetAudience.ageMax ?? 65} · ${(form.targetAudience.locations ?? ['NZ']).join(', ')}` },
                ] : []),
                { label: 'Media',    value: form.assets.length ? `${form.assets.length} item${form.assets.length !== 1 ? 's' : ''} selected` : '⚠ None selected' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3 px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors">
                  <span className="w-20 text-xs font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-gray-800 leading-snug truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — media preview */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-700">Content preview</p>
            {form.assets.filter((a) => a.url).length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 h-64 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400">
                <span className="text-4xl">🎬</span>
                <p className="text-sm font-medium">No media selected</p>
                <p className="text-xs text-center px-6">Go back to the Content step and select videos or reels to preview them here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Primary preview — first asset large */}
                {(() => {
                  const first = form.assets.find((a) => a.url);
                  if (!first) return null;
                  return (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-900 aspect-video relative">
                      {first.assetType === 'VIDEO'
                        ? <video src={first.url} className="w-full h-full object-contain" controls muted playsInline />
                        : <img src={first.url} alt="preview" className="w-full h-full object-contain" />
                      }
                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {first.format || first.assetType}
                      </span>
                    </div>
                  );
                })()}
                {/* Remaining thumbnails */}
                {form.assets.filter((a) => a.url).length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {form.assets.filter((a) => a.url).slice(1).map((a, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-900 flex-shrink-0">
                        {a.assetType === 'VIDEO'
                          ? <video src={a.url} className="w-full h-full object-cover" muted playsInline />
                          : <img src={a.url} alt="" className="w-full h-full object-cover" />
                        }
                      </div>
                    ))}
                    <div className="flex items-center px-2 text-xs text-gray-400 font-medium">
                      +{form.assets.filter((a) => a.url).length - 1} more
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Publish tip */}
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-700">
              <span className="text-base flex-shrink-0">💡</span>
              <p><strong>Save draft</strong> stores without posting. <strong>Publish</strong> immediately {form.campaignMode === 'ORGANIC' ? 'posts to your page' : 'creates the ad on'} {pm[form.platform]}.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const allStepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];
  const stepRenderers = stepRenderIndex.map((i) => allStepRenderers[i]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[62rem] max-h-[96vh] sm:max-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {initialData ? 'Edit Campaign' : 'Create Campaign'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Step {step + 1} of {STEPS.length} · <span className="text-gray-600 font-medium">{STEPS[step].label}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="px-5 pb-3">
          <div className="relative flex items-start">
            {/* Track */}
            <div className="absolute top-[14px] left-[14px] right-[14px] h-px bg-gray-200 rounded-full" />
            {/* Fill */}
            <div
              className="absolute top-[14px] left-[14px] h-px bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: step === 0 ? '0%' : `${(step / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((s, i) => {
              const done    = i < step;
              const current = i === step;
              return (
                <div key={s.label} className="flex-1 flex flex-col items-center gap-1.5 relative z-10">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    done    ? 'bg-primary-600 text-white' :
                    current ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                              'bg-white border-2 border-gray-200 text-gray-400'
                  }`}>
                    {done
                      ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      : i + 1
                    }
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight transition-colors whitespace-nowrap ${
                    current ? 'text-primary-600' : done ? 'text-gray-400' : 'text-gray-300'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          {error && (
            <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          {stepRenderers[step]?.()}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/80 rounded-b-2xl">
          <button
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 disabled:opacity-30 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex gap-2">
            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                Next
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 disabled:opacity-50 transition-all"
                >
                  {saving ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {saving ? 'Publishing…' : 'Publish campaign'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
