import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApiAuthStore } from "../../store/apiAuthStore";
import { isPublicSiteEnabled } from "../../config/features";
import { profileApi, type MyProfile } from "../../services/api";

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
      className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
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
  const menuRef = useRef<HTMLDivElement>(null);
  const publicSite = isPublicSiteEnabled();

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

  const isListingsSection = location.pathname.startsWith("/admin/listings");
  const isAgentsSection   = location.pathname.startsWith("/admin/agents");
  const isProfileSection  = location.pathname.startsWith("/admin/profile");

  const portalHome = isAuthenticated && (isSuperAdmin || isAgent) ? "/admin/listings" : "/admin/login";
  const homeHref   = publicSite ? "/" : portalHome;

  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 sm:h-[4.25rem]">

          {/* ── Logo ── */}
          <Link to={homeHref} className="flex shrink-0 items-center gap-2.5 group">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 opacity-90 transition-opacity group-hover:opacity-100" />
              <div className="relative rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 p-2 shadow-lg">
                <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
            <div className="hidden min-[360px]:block">
              <p className="text-lg font-bold leading-tight bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent sm:text-xl">
                PropertyReach
              </p>
              <p className="text-[10px] text-gray-400 hidden sm:block -mt-0.5">
                {publicSite ? "New Zealand's Property Portal" : "Property management platform"}
              </p>
            </div>
          </Link>

          {/* ── Nav + user controls ── */}
          <nav className="flex items-center gap-2 min-w-0" aria-label="Main">
            {isAgent || isSuperAdmin ? (
              <>
                {/* ── Nav links ── */}
                <div className="flex items-center gap-1">
                  <NavPill
                    to="/admin/listings"
                    active={isListingsSection}
                    icon={<IconListings />}
                    label={isSuperAdmin ? "All listings" : "My listings"}
                  />
                  {isSuperAdmin && (
                    <NavPill
                      to="/admin/agents"
                      active={isAgentsSection}
                      icon={<IconAgents />}
                      label="Agents"
                    />
                  )}
                </div>

                {/* ── Divider ── */}
                <div className="hidden sm:block h-7 w-px bg-gray-200 shrink-0" />

                {/* ── User button ── */}
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
                    {/* Name — only shown when a real name is available */}
                    {displayName && (
                      <span className="hidden sm:block max-w-[8rem] truncate leading-tight text-sm">
                        {displayName}
                      </span>
                    )}
                    <IconChevron open={isMenuOpen} />
                  </button>

                  {/* ── Dropdown ── */}
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-2xl border border-gray-200 bg-white py-1 shadow-2xl ring-1 ring-black/5 z-50"
                      role="menu"
                    >
                      {/* Identity card */}
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
                              {isSuperAdmin ? (
                                <>
                                  <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  Super admin
                                </>
                              ) : "Agent"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu links */}
                      <div className="mt-1 px-1">
                        <MenuLink
                          to="/admin/profile"
                          icon={<IconProfile />}
                          active={isProfileSection}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My profile
                        </MenuLink>

                        <MenuLink
                          to="/admin/listings"
                          icon={<IconListings />}
                          active={isListingsSection}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {isSuperAdmin ? "All listings" : "My listings"}
                        </MenuLink>

                        {isSuperAdmin && (
                          <MenuLink
                            to="/admin/agents"
                            icon={<IconAgents />}
                            active={isAgentsSection}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Agents
                          </MenuLink>
                        )}
                      </div>

                      {/* Sign out */}
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
              <Link
                to="/admin/login"
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                aria-label="Sign in"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="hidden sm:inline">Sign in</span>
              </Link>
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
  onClick,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  active?: boolean;
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
      {children}
    </Link>
  );
}
