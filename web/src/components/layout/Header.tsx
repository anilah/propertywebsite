import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApiAuthStore } from "../../store/apiAuthStore";
import { isPublicSiteEnabled } from "../../config/features";
import { profileApi, type MyProfile } from "../../services/api";
import { useSiteConfig } from "../../context/SiteConfigContext";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { useReviewQueueCount } from "../../hooks/useReviewQueueCount";

// ── Icons ─────────────────────────────────────────────────────────────────────
// All icons are Heroicons-compatible outline style, strokeWidth 1.5 for a
// modern, lighter look consistent across the nav and dropdown.

/** Office building — represents the property/listings portfolio */
function IconListings({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

/** User group — represents the agent team */
function IconAgents({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

/** User circle — represents the signed-in account / profile */
function IconProfile({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

/** Arrow leaving rectangle — sign out */
function IconSignOut({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

/** Inbox — represents leads inbox */
function IconLeads({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  );
}

/** Puzzle piece — represents platform integrations */
function IconIntegrations({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
    </svg>
  );
}

/** Megaphone — represents digital marketing campaigns */
function IconCampaigns({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  );
}

function IconTradies({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Shared avatar ─────────────────────────────────────────────────────────────

function UserAvatar({
  profile,
  isSuperAdmin,
  size = "sm",
}: {
  profile: MyProfile | null;
  isSuperAdmin: boolean;
  size?: "sm" | "md";
}) {
  const px = size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";
  const gradClass = isSuperAdmin
    ? "bg-gradient-to-br from-amber-400 to-orange-500"
    : "bg-gradient-to-br from-primary-500 to-primary-700";
  const initials = [profile?.firstName?.charAt(0), profile?.lastName?.charAt(0)]
    .filter(Boolean).join("").toUpperCase();

  if (profile?.profilePhotoUrl) {
    return (
      <img
        src={profile.profilePhotoUrl}
        alt="Profile"
        className={`${px} rounded-full object-cover ring-2 ring-white shadow-sm shrink-0`}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div className={`${px} ${gradClass} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white shadow-sm shrink-0`}>
      {initials || (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )}
    </div>
  );
}

// ── Nav pill ──────────────────────────────────────────────────────────────────

function NavPill({
  to,
  active,
  icon,
  label,
  badge,
}: {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge != null && badge > 0 && (
        <span className={`inline-flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
          active ? "bg-white/20 text-white" : "bg-amber-500 text-white"
        }`}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

// ── Main header ───────────────────────────────────────────────────────────────

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useApiAuthStore((state) => state.isAuthenticated);
  const isAgent = useApiAuthStore((state) => state.isAgent);
  const isSuperAdmin = useApiAuthStore((state) => state.isSuperAdmin);
  const mobileNumber = useApiAuthStore((state) => state.mobileNumber);
  const logout = useApiAuthStore((state) => state.logout);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const publicSite = isPublicSiteEnabled();
  const { config: siteConfig } = useSiteConfig();

  const [profile, setProfile] = useState<MyProfile | null>(null);
  useEffect(() => {
    if (!isAuthenticated || (!isAgent && !isSuperAdmin)) { setProfile(null); return; }
    profileApi.getMe().then(({ user }) => setProfile(user)).catch(() => {});
  }, [isAuthenticated, isAgent, isSuperAdmin]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [isMenuOpen]);

  const isListingsSection     = location.pathname.startsWith("/admin/listings");
  const isAgentsSection       = location.pathname.startsWith("/admin/agents");
  const isCampaignsSection    = location.pathname.startsWith("/admin/campaigns");
  const isLeadsSection        = location.pathname.startsWith("/admin/leads");
  const isIntegrationsSection = location.pathname.startsWith("/admin/integrations");
  const isBrandingSection     = location.pathname.startsWith("/admin/branding");
  const isContentSection      = location.pathname.startsWith("/admin/content");
  const isTradiesSection      = location.pathname.startsWith("/admin/tradies");
  const isProfileSection      = location.pathname.startsWith("/admin/profile");

  const portalHome = isAuthenticated && (isSuperAdmin || isAgent) ? "/admin/listings" : "/admin/login";
  const homeHref   = publicSite ? "/" : portalHome;

  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || null;
  const pendingReviewCount = useReviewQueueCount();

  const adminNavItems = [
    {
      to: "/admin/listings",
      label: isSuperAdmin ? "All listings" : "My listings",
      active: isListingsSection,
      icon: <IconListings />,
      badge: isSuperAdmin ? pendingReviewCount : undefined,
    },
    ...(isSuperAdmin
      ? [
          { to: "/admin/agents", label: "Agents", active: isAgentsSection, icon: <IconAgents /> },
          { to: "/admin/campaigns", label: "Campaigns", active: isCampaignsSection, icon: <IconCampaigns /> },
          { to: "/admin/leads", label: "Leads", active: isLeadsSection, icon: <IconLeads /> },
          { to: "/admin/integrations", label: "Integrations", active: isIntegrationsSection, icon: <IconIntegrations /> },
          { to: "/admin/tradies", label: "Tradies", active: isTradiesSection, icon: <IconTradies /> },
          {
            to: "/admin/branding",
            label: "Branding",
            active: isBrandingSection,
            icon: (
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            ),
          },
          {
            to: "/admin/content",
            label: "Content",
            active: isContentSection,
            icon: (
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            ),
          },
        ]
      : []),
    { to: "/admin/profile", label: "My profile", active: isProfileSection, icon: <IconProfile /> },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-md pt-safe app-top-bar">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div
          className="flex items-center justify-between gap-2 py-2 sm:py-3 lg:py-4"
          style={{
            minHeight: undefined,
          }}
        >

          {/* ── Logo — compact on phones ── */}
          <Link to={homeHref} className="flex shrink-0 items-center gap-2 group min-w-0">
            <div className="relative shrink-0">
              {siteConfig.logoUrl ? (
                <img
                  src={siteConfig.logoUrl}
                  alt={siteConfig.siteName}
                  className="w-auto object-contain max-w-[160px] sm:max-w-[220px] lg:max-w-[280px] h-9 sm:h-11 lg:h-[var(--app-logo-h)]"
                  style={{ ['--app-logo-h' as string]: `${Math.min(Math.max(siteConfig.logoSize ?? 48, 36), 64)}px` }}
                />
              ) : (
                <>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 opacity-90 transition-opacity group-hover:opacity-100" />
                  <div className="relative rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 p-1.5 sm:p-2 shadow-lg">
                    <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </>
              )}
            </div>
            {!siteConfig.logoUrl && (
              <div className="hidden min-[360px]:block">
                <p className="text-base sm:text-lg font-bold leading-tight bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent lg:text-xl">
                  {siteConfig.siteName}
                </p>
                <p className="text-[10px] text-gray-400 hidden lg:block -mt-0.5">
                  {publicSite ? siteConfig.tagline : "Property management platform"}
                </p>
              </div>
            )}
          </Link>

          {/* ── Nav + user controls ── */}
          <nav className="flex items-center gap-1.5 sm:gap-2 min-w-0" aria-label="Main">
            {isAgent || isSuperAdmin ? (
              <>
                {/* Desktop nav pills — hidden on phones to avoid crush */}
                <div className="hidden lg:flex items-center gap-0.5">
                  <NavPill
                    to="/admin/listings"
                    active={isListingsSection}
                    icon={<IconListings />}
                    label={isSuperAdmin ? "All listings" : "My listings"}
                    badge={isSuperAdmin ? pendingReviewCount : undefined}
                  />
                  {isSuperAdmin && (
                    <NavPill
                      to="/admin/agents"
                      active={isAgentsSection}
                      icon={<IconAgents />}
                      label="Agents"
                    />
                  )}
                  {isSuperAdmin && (
                    <NavPill
                      to="/admin/campaigns"
                      active={isCampaignsSection}
                      icon={<IconCampaigns />}
                      label="Campaigns"
                    />
                  )}
                  {isSuperAdmin && (
                    <NavPill
                      to="/admin/leads"
                      active={isLeadsSection}
                      icon={<IconLeads />}
                      label="Leads"
                    />
                  )}
                  {isSuperAdmin && (
                    <NavPill
                      to="/admin/integrations"
                      active={isIntegrationsSection}
                      icon={<IconIntegrations />}
                      label="Integrations"
                    />
                  )}
                  {isSuperAdmin && (
                    <NavPill
                      to="/admin/tradies"
                      active={isTradiesSection}
                      icon={<IconTradies />}
                      label="Tradies"
                    />
                  )}
                  {isSuperAdmin && (
                    <NavPill
                      to="/admin/branding"
                      active={isBrandingSection}
                      icon={<svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>}
                      label="Branding"
                    />
                  )}
                  {isSuperAdmin && (
                    <NavPill
                      to="/admin/content"
                      active={isContentSection}
                      icon={<svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>}
                      label="Content"
                    />
                  )}
                </div>

                <div className="hidden sm:block h-7 w-px bg-gray-200 shrink-0" />

                {/* Account menu (desktop + tablet) */}
                <div className="relative shrink-0" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen((o) => !o)}
                    className={`flex items-center gap-2 rounded-xl border py-1.5 pl-1.5 pr-2.5 text-left text-sm font-medium transition-colors shadow-sm ${
                      isMenuOpen
                        ? "border-primary-300 bg-primary-50 text-primary-900"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    aria-expanded={isMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Account menu"
                  >
                    <UserAvatar profile={profile} isSuperAdmin={isSuperAdmin} size="sm" />
                    {displayName && (
                      <span className="hidden sm:block max-w-[8rem] truncate leading-tight text-sm">
                        {displayName}
                      </span>
                    )}
                    <IconChevron open={isMenuOpen} />
                  </button>

                  {isMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-2xl border border-gray-200 bg-white py-1 shadow-2xl ring-1 ring-black/5 z-50"
                      role="menu"
                    >
                      <div className={`px-4 py-3.5 mx-2 mt-1 mb-1 rounded-xl ${
                        isSuperAdmin
                          ? "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100"
                          : "bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100"
                      }`}>
                        <div className="flex items-center gap-3">
                          <UserAvatar profile={profile} isSuperAdmin={isSuperAdmin} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate leading-tight">
                              {displayName ?? "—"}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5 font-mono">
                              {mobileNumber ?? "—"}
                            </p>
                            <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              isSuperAdmin
                                ? "bg-amber-100 text-amber-800"
                                : "bg-primary-100 text-primary-800"
                            }`}>
                              {isSuperAdmin ? "Super admin" : "Agent"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-1 px-1">
                        {adminNavItems.map((item) => (
                          <MenuLink
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            active={item.active}
                            badge={'badge' in item ? item.badge : undefined}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {item.label}
                          </MenuLink>
                        ))}
                      </div>

                      <div className="mt-1 border-t border-gray-100 px-1 pt-1 pb-1">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            logout();
                            setProfile(null);
                            navigate(publicSite ? "/" : "/admin/login");
                            setIsMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <IconSignOut />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile hamburger for admin */}
                <button
                  type="button"
                  className="lg:hidden inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm hover:bg-gray-50"
                  aria-label="Open menu"
                  aria-expanded={drawerOpen}
                  onClick={() => setDrawerOpen(true)}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <MobileNavDrawer
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                  title="Admin menu"
                  items={adminNavItems}
                  footer={
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfile(null);
                        setDrawerOpen(false);
                        navigate(publicSite ? "/" : "/admin/login");
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-3 text-sm font-semibold text-red-600"
                    >
                      <IconSignOut />
                      Sign out
                    </button>
                  }
                />
              </>
            ) : isAuthenticated ? (
              <button
                type="button"
                onClick={() => { logout(); navigate("/admin/login"); }}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Sign out
              </button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Public phones use bottom tabs — skip hamburger */}
                <Link
                  to="/agent-signup"
                  className="hidden sm:flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-sm min-h-[40px]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Register</span>
                </Link>
                <Link
                  to="/admin/login"
                  className="flex items-center gap-2 rounded-full sm:rounded-lg bg-gray-100 p-2.5 sm:px-3 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors min-h-[40px] min-w-[40px] justify-center"
                  aria-label="Sign in"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

// ── Dropdown menu link ────────────────────────────────────────────────────────

function MenuLink({
  to,
  icon,
  active,
  badge,
  onClick,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-slate-100 text-slate-900"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span className="text-gray-400">{icon}</span>
      <span className="flex-1">{children}</span>
      {badge != null && badge > 0 && (
        <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
