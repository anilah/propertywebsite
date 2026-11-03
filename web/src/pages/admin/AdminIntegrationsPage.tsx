import { useState, useEffect, useCallback } from 'react';
import { integrationsApi, PlatformIntegration, Platform } from '../../services/integrationsApi';

// ─── Platform definitions ─────────────────────────────────────────────────────

interface FieldDef {
  key:         string;
  label:       string;
  placeholder: string;
  secret?:     boolean;
  hint?:       string;
  required?:   boolean;
  wide?:       boolean; // span full width
}

const PLATFORM_META = {
  label:       'Meta',
  sublabel:    'Facebook / Instagram',
  icon:        '📘',
  gradient:    'from-blue-600 to-blue-500',
  activeTab:   'border-blue-500 text-blue-700 bg-blue-50',
  inactiveTab: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
  badge:       'bg-blue-100 text-blue-700',
  docsUrl:     'https://developers.facebook.com/docs/marketing-apis',
  description: 'Run Lead Generation and Traffic campaigns on Facebook Feed, Instagram, Stories and Reels. Organic posts need a Page access token with publish rights.',
  fields: [
    { key: 'appId',            label: 'App ID',                  placeholder: '123456789',          required: true,  hint: 'Meta for Developers → Your App → Settings → Basic' },
    { key: 'appSecret',        label: 'App Secret',              placeholder: '••••••••••••••••',    required: true,  secret: true, hint: 'Keep secret — never expose in frontend code' },
    { key: 'accessToken',      label: 'System User Access Token',placeholder: 'EAExxxxx…',           required: true,  secret: true, wide: true, hint: 'Business Manager → System Users → assign Ad Account + Facebook Page (Create content) → Generate token with pages_manage_posts, publish_video, pages_read_engagement, pages_show_list, instagram_basic, instagram_content_publish, ads_management' },
    { key: 'adAccountId',      label: 'Ad Account ID',           placeholder: 'act_123456789',       required: true,  hint: 'Business Manager → Ad Accounts. Include "act_" prefix.' },
    { key: 'pageId',           label: 'Facebook Page ID',        placeholder: '987654321',           required: true,  hint: 'Facebook Page → About → Page ID. System User must be assigned to this Page or organic video posts fail with (#100) No permission.' },
    { key: 'instagramUsername',label: 'Instagram (@username)',   placeholder: 'auto-detected on Test',               hint: 'Business/Creator account linked to the Facebook Page. Click Test Connection to detect automatically.' },
    { key: 'instagramUserId',  label: 'Instagram User ID',       placeholder: 'auto-detected on Test',               hint: 'Filled on Test when the Page has a linked Instagram account. Required to post Reels/photos to Instagram.' },
    { key: 'pixelId',          label: 'Pixel ID',                placeholder: '111222333',                            hint: 'Optional — Meta Pixel for conversion tracking (Events Manager)' },
    { key: 'leadWebhookToken', label: 'Lead Webhook Verify Token', placeholder: 'my-secret-verify-token', secret: true, wide: true, hint: 'Any random string — used to verify Meta webhook subscription' },
  ] as FieldDef[],
};

const PLATFORM_GOOGLE = {
  label:       'Google Ads',
  sublabel:    'Search, Display & YouTube',
  icon:        '🔍',
  gradient:    'from-red-500 to-orange-400',
  activeTab:   'border-red-500 text-red-700 bg-red-50',
  inactiveTab: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
  badge:       'bg-red-100 text-red-700',
  docsUrl:     'https://developers.google.com/google-ads/api/docs/start',
  description: 'Run Search, Display, Video and Performance Max campaigns on Google and YouTube.',
  fields: [
    { key: 'developerToken',  label: 'Developer Token',      placeholder: 'ABcDeFgHiJ-123…',                   required: true, secret: true, wide: true, hint: 'Google Ads → Admin → API Center → Developer Token' },
    { key: 'clientId',        label: 'OAuth Client ID',      placeholder: 'xxxxxx.apps.googleusercontent.com',  required: true, hint: 'Google Cloud Console → Credentials → OAuth 2.0 Client ID' },
    { key: 'clientSecret',    label: 'OAuth Client Secret',  placeholder: 'GOCSPX-xxxxx',                       required: true, secret: true },
    { key: 'refreshToken',    label: 'Refresh Token',        placeholder: '1//xxxxx…',                          required: true, secret: true, wide: true, hint: 'Run OAuth flow with scope https://www.googleapis.com/auth/adwords' },
    { key: 'customerId',      label: 'Customer ID',          placeholder: '123-456-7890',                        required: true, hint: 'Google Ads Customer ID (top-right corner of Google Ads UI)' },
  ] as FieldDef[],
};

const PLATFORM_TIKTOK = {
  label:       'TikTok Ads',
  sublabel:    'In-Feed, TopView & Leads',
  icon:        '🎵',
  gradient:    'from-gray-800 to-gray-700',
  activeTab:   'border-gray-800 text-gray-900 bg-gray-50',
  inactiveTab: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
  badge:       'bg-gray-200 text-gray-700',
  docsUrl:     'https://ads.tiktok.com/marketing_api/docs',
  description: 'Run In-Feed, TopView and Lead Generation campaigns on TikTok.',
  fields: [
    { key: 'accessToken',      label: 'Long-lived Access Token', placeholder: 'xxxxxxxxxxxxxxxx', required: true, secret: true, wide: true, hint: 'TikTok Marketing API → My Apps → Auth Management → Generate Long-term Token' },
    { key: 'advertiserId',     label: 'Advertiser ID',           placeholder: '7123456789012345', required: true, hint: 'TikTok Ads Manager → Account → Advertiser ID' },
    { key: 'appId',            label: 'App ID',                  placeholder: 'xxxxxxxxxxxxxxxx', hint: 'TikTok for Business → My Apps → App ID' },
    { key: 'leadWebhookToken', label: 'Webhook Secret',          placeholder: 'my-webhook-secret', secret: true, hint: 'Verifies TikTok Lead webhook HMAC-SHA256 signatures' },
  ] as FieldDef[],
};

const PLATFORMS = {
  META:   PLATFORM_META,
  GOOGLE: PLATFORM_GOOGLE,
  TIKTOK: PLATFORM_TIKTOK,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusOf(integration: PlatformIntegration | undefined): 'connected' | 'failed' | 'not_tested' | 'empty' {
  if (!integration) return 'empty';
  if (integration.isActive && integration.lastTestOk) return 'connected';
  if (integration.lastTestOk === false) return 'failed';
  const hasConfig = Object.values(integration.config).some((v) => v && !v.startsWith('••'));
  return hasConfig ? 'not_tested' : 'empty';
}

function StatusDot({ status }: { status: ReturnType<typeof statusOf> }) {
  const map = {
    connected:  'bg-green-500 animate-pulse',
    failed:     'bg-red-500',
    not_tested: 'bg-yellow-400',
    empty:      'bg-gray-300',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status]}`} />;
}

function StatusChip({ status }: { status: ReturnType<typeof statusOf> }) {
  const map = {
    connected:  { label: 'Connected',       cls: 'bg-green-100 text-green-700' },
    failed:     { label: 'Failed',           cls: 'bg-red-100 text-red-600' },
    not_tested: { label: 'Not Tested',       cls: 'bg-yellow-100 text-yellow-700' },
    empty:      { label: 'Not Configured',   cls: 'bg-gray-100 text-gray-500' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      <StatusDot status={status} />
      {label}
    </span>
  );
}

// ─── Tab panel ────────────────────────────────────────────────────────────────

function PlatformPanel({
  platform,
  meta,
  integration,
  onSaved,
}: {
  platform: Platform;
  meta: typeof PLATFORM_META;
  integration: PlatformIntegration | undefined;
  onSaved: (updated: PlatformIntegration) => void;
}) {
  const [form, setForm]             = useState<Record<string, string>>({});
  const [saving, setSaving]         = useState(false);
  const [testing, setTesting]       = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saveMsg, setSaveMsg]       = useState('');
  const [copied, setCopied]         = useState('');
  const [editing, setEditing]       = useState(false);

  const status = statusOf(integration);
  const isConnected = status === 'connected';
  const readOnly = isConnected && !editing;

  useEffect(() => {
    setTestResult(null);
    setSaveMsg('');
    setEditing(false);
    if (integration?.config) {
      setForm(integration.config);
    } else {
      const empty: Record<string, string> = {};
      meta.fields.forEach((f) => { empty[f.key] = ''; });
      setForm(empty);
    }
  }, [integration, platform]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const updated = await integrationsApi.save(platform, form);
      onSaved(updated);
      setSaveMsg('saved');
      setEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e) {
      setSaveMsg(`error:${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await integrationsApi.test(platform);
      setTestResult(result);
      const all = await integrationsApi.getAll();
      const mine = all.find((i) => i.platform === platform);
      if (mine) onSaved(mine);
    } catch (e) {
      setTestResult({ ok: false, message: e instanceof Error ? e.message : String(e) });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm(`Remove all ${meta.label} credentials? This cannot be undone.`)) return;
    await integrationsApi.delete(platform);
    const empty: Record<string, string> = {};
    meta.fields.forEach((f) => { empty[f.key] = ''; });
    setForm(empty);
    setTestResult(null);
    setEditing(false);
    onSaved({ platform, isActive: false, lastTestedAt: null, lastTestOk: null, lastTestMsg: null, config: empty, webhookUrls: integration?.webhookUrls ?? {} });
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaveMsg('');
    if (integration?.config) setForm(integration.config);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Platform header card */}
      <div className={`rounded-2xl bg-gradient-to-r ${meta.gradient} p-5 text-white flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
            {meta.icon}
          </div>
          <div>
            <h2 className="text-lg font-bold">{meta.label}</h2>
            <p className="text-sm text-white/80">{meta.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusChip status={status} />
          {integration?.lastTestedAt && (
            <p className="text-xs text-white/60">
              Tested {new Date(integration.lastTestedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Connected summary — primary mental model when live */}
      {isConnected && !editing && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-green-900 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs">✓</span>
              {meta.label} is connected and ready to publish
            </p>
            <p className="mt-1.5 text-sm text-green-800/90 leading-relaxed">
              {testResult?.message || integration?.lastTestMsg || 'Last connection test succeeded.'}
            </p>
            {integration?.lastTestedAt && (
              <p className="mt-1 text-xs text-green-700/70">
                Last verified {new Date(integration.lastTestedAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50"
            >
              {testing ? 'Re-testing…' : 'Re-test connection'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-green-300 bg-white text-green-900 rounded-lg hover:bg-green-100"
            >
              Edit credentials
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              className="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 border border-red-200 bg-white rounded-lg hover:bg-red-50"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Failed / not tested banners */}
      {!isConnected && (testResult || integration?.lastTestMsg) && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
          (testResult ? testResult.ok : integration?.lastTestOk)
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="text-base mt-0.5">
            {testResult ? (testResult.ok ? '✅' : '❌') : (integration?.lastTestOk ? '✅' : '❌')}
          </span>
          <span>{testResult?.message ?? integration?.lastTestMsg}</span>
        </div>
      )}

      {/* Fresh test result while editing a connected account */}
      {isConnected && editing && testResult && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
          testResult.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="text-base mt-0.5">{testResult.ok ? '✅' : '❌'}</span>
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Credentials form */}
      <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
        readOnly ? 'border-green-100' : 'border-gray-200'
      }`}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              {readOnly ? 'Saved credentials' : isConnected ? 'Update credentials' : 'API Credentials'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {readOnly
                ? 'Locked while connected. Use Edit credentials to change values.'
                : 'Fill required fields, then save and test the connection.'}
            </p>
          </div>
          <a
            href={meta.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:underline flex items-center gap-1 shrink-0"
          >
            API Docs ↗
          </a>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-4">
            {meta.fields.map((field) => (
              <div key={field.key} className={field.wide ? 'sm:col-span-2 xl:col-span-3' : ''}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  {field.label}
                  {field.required && !readOnly && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                    readOnly={readOnly}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm font-mono transition-colors pr-20 ${
                      readOnly
                        ? 'border-gray-100 bg-gray-50 text-gray-600 cursor-default'
                        : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    }`}
                    placeholder={field.placeholder}
                    value={form[field.key] ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    autoComplete="off"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {field.secret && (
                      <button
                        type="button"
                        onClick={() => setShowSecrets((s) => ({ ...s, [field.key]: !s[field.key] }))}
                        className="text-[10px] text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                      >
                        {showSecrets[field.key] ? 'Hide' : 'Show'}
                      </button>
                    )}
                    {form[field.key] && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(form[field.key], field.key)}
                        className="text-[10px] text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                      >
                        {copied === field.key ? '✓' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>
                {!readOnly && field.hint && (
                  <p className="mt-1 text-xs text-gray-400 leading-relaxed">{field.hint}</p>
                )}
              </div>
            ))}
          </div>

          {/* Action bar — depends on connected vs setup mode */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-gray-100">
            {readOnly ? (
              <p className="text-sm text-gray-500">
                Credentials are saved. Re-test above, or edit if Meta tokens change.
              </p>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {saving ? 'Saving…' : isConnected ? 'Save changes' : 'Save credentials'}
                </button>

                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {testing ? 'Testing…' : 'Test connection'}
                </button>

                {isConnected && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Cancel
                  </button>
                )}

                {saveMsg === 'saved' && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                    Credentials saved
                  </span>
                )}
                {saveMsg.startsWith('error:') && (
                  <span className="text-sm text-red-600">{saveMsg.replace('error:', '')}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Webhook URLs */}
      {integration?.webhookUrls && Object.keys(integration.webhookUrls).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 flex items-center gap-2">
            <span>🔗</span>
            <h4 className="text-sm font-semibold text-amber-900">Webhook Configuration</h4>
          </div>
          <div className="p-5">
            <p className="text-xs text-amber-700 mb-3">
              Register these endpoints in your {meta.label} Business dashboard to receive leads automatically:
            </p>
            <div className="space-y-2">
              {Object.entries(integration.webhookUrls).map(([k, v]) => (
                <div key={k} className="flex items-start gap-3 group">
                  <span className="text-xs font-semibold text-amber-700 w-28 shrink-0 pt-0.5">{k}</span>
                  <div className="flex-1 flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-1.5">
                    <code className="text-xs text-amber-900 break-all flex-1">{v}</code>
                    <button
                      onClick={() => copyToClipboard(v, `webhook_${k}`)}
                      className="text-xs text-amber-500 hover:text-amber-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copied === `webhook_${k}` ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PLATFORM_ORDER: Platform[] = ['META', 'GOOGLE', 'TIKTOK'];

export function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<Platform>('META');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await integrationsApi.getAll();
      setIntegrations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (updated: PlatformIntegration) => {
    setIntegrations((prev) => {
      const idx = prev.findIndex((i) => i.platform === updated.platform);
      if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
      return [...prev, updated];
    });
  };

  const connectedCount = integrations.filter((i) => i.isActive && i.lastTestOk).length;
  const meta = PLATFORMS[activeTab];
  const integration = integrations.find((i) => i.platform === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/90 via-slate-50/40 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* ── Page header ── */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
              Platform management
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Integrations
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Connect your Meta, Google and TikTok ad accounts to publish campaigns and capture leads automatically. Credentials are encrypted with AES-256-GCM.
            </p>
          </div>
          {/* Status pills */}
          <div className="flex items-center gap-3 shrink-0">
            {PLATFORM_ORDER.map((p) => {
              const intg = integrations.find((i) => i.platform === p);
              const s = statusOf(intg);
              const icons = { META: '📘', GOOGLE: '🔍', TIKTOK: '🎵' };
              return (
                <button
                  key={p}
                  onClick={() => setActiveTab(p)}
                  title={PLATFORMS[p].label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all border-2 ${
                    activeTab === p ? 'border-primary-400 shadow-md scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  } ${s === 'connected' ? 'bg-green-50' : 'bg-white'}`}
                >
                  {icons[p]}
                </button>
              );
            })}
            <div className="ml-1 text-right">
              <p className="text-2xl font-bold text-slate-900 leading-none">
                {connectedCount}<span className="text-base font-normal text-slate-400">/3</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">connected</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 px-2 pt-2 gap-1">
            {PLATFORM_ORDER.map((p) => {
              const intg = integrations.find((i) => i.platform === p);
              const s = statusOf(intg);
              const pm = PLATFORMS[p];
              const isActive = activeTab === p;
              return (
                <button
                  key={p}
                  onClick={() => setActiveTab(p)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-xl border-b-2 -mb-px transition-all whitespace-nowrap ${
                    isActive ? pm.activeTab : pm.inactiveTab
                  }`}
                >
                  <span className="text-base">{pm.icon}</span>
                  <span>{pm.label}</span>
                  <span className="hidden md:inline text-xs text-slate-400">{pm.sublabel}</span>
                  <StatusDot status={s} />
                </button>
              );
            })}
          </div>

          {/* Tab body */}
          <div className="p-6 lg:p-8">
            {loading ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl h-28 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded w-24" />
                      <div className="h-10 bg-slate-100 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <PlatformPanel
                key={activeTab}
                platform={activeTab}
                meta={meta}
                integration={integration}
                onSaved={handleSaved}
              />
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 max-w-2xl">
          <span className="text-base shrink-0">🔒</span>
          <p>
            Credentials are encrypted with <strong>AES-256-GCM</strong> before storage. Secret fields show only the last 4 characters after saving. Ensure <code className="bg-slate-100 px-1 rounded font-mono">SETTINGS_ENCRYPTION_KEY</code> (32-byte hex) is set in your Lambda environment.
          </p>
        </div>
      </div>
    </div>
  );
}
