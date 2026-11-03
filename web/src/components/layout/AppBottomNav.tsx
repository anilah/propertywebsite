import { Link, useLocation } from 'react-router-dom';
import { useApiAuthStore } from '../../store/apiAuthStore';
import { isPublicSiteEnabled } from '../../config/features';
import { useAppShellMode } from '../../hooks/useAppShellMode';
import { useHasFlatmateListings } from '../../hooks/useHasFlatmateListings';
import { useReviewQueueCount } from '../../hooks/useReviewQueueCount';

function TabLink({
  to,
  label,
  active,
  icon,
  badge,
}: {
  to: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className="relative flex flex-1 flex-col items-center justify-center gap-1 min-h-[56px] px-1 pt-1.5 pb-1 touch-manipulation"
    >
      <span
        className={`relative flex h-7 w-7 items-center justify-center rounded-xl transition-colors ${
          active ? 'bg-primary-600 text-white' : 'text-gray-500'
        }`}
      >
        {icon}
        {badge != null && badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span
        className={`text-[11px] font-semibold leading-none ${
          active ? 'text-primary-700' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

/** Only hide when another fixed bottom bar owns the screen. */
export function shouldHideAppBottomNav(pathname: string): boolean {
  if (pathname.startsWith('/admin/listings/') && (pathname.endsWith('/edit') || pathname.endsWith('/new'))) {
    return true;
  }
  if (pathname === '/admin/listings/new') return true;
  if (pathname === '/admin/login' || pathname === '/admin/setup') return true;
  return false;
}

/**
 * Always-visible bottom menu for phone + installed PWA.
 * This is the primary navigation — not a secondary convenience.
 */
export function AppBottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const appShell = useAppShellMode();
  const publicSite = isPublicSiteEnabled();
  const isAgent = useApiAuthStore((s) => s.isAgent);
  const isSuperAdmin = useApiAuthStore((s) => s.isSuperAdmin);
  const isAdmin = isAgent || isSuperAdmin;
  const pendingReviewCount = useReviewQueueCount();
  const showFlatmates = useHasFlatmateListings() === true;

  if (!appShell) return null;
  if (shouldHideAppBottomNav(pathname)) return null;

  const isAdminRoute = pathname.startsWith('/admin');

  // ── Public ────────────────────────────────────────────────────────────────
  if (publicSite && !isAdminRoute) {
    const buyActive =
      pathname === '/sale' || pathname.startsWith('/property/residential/sale');
    const rentActive =
      pathname === '/rent' || pathname.startsWith('/property/residential/rent');
    const flatActive =
      pathname === '/flatmates' ||
      pathname.startsWith('/property/residential/flatmates');
    const moreActive =
      pathname === '/more' ||
      pathname.startsWith('/news') ||
      pathname.startsWith('/guides') ||
      pathname.startsWith('/privacy') ||
      pathname.startsWith('/terms') ||
      pathname.startsWith('/data-deletion');

    return (
      <nav
        className="app-bottom-nav fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
        aria-label="Main menu"
      >
        <div className="mx-auto flex h-14 max-w-lg items-stretch px-1">
          <TabLink
            to="/sale"
            label="Buy"
            active={buyActive}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          />
          <TabLink
            to="/rent"
            label="Rent"
            active={rentActive}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          {showFlatmates && (
            <TabLink
              to="/flatmates"
              label="Flatmates"
              active={flatActive}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              }
            />
          )}
          <TabLink
            to="/tradies"
            label="Tradies"
            active={pathname.startsWith('/tradies')}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
              </svg>
            }
          />
          <TabLink
            to="/more"
            label="More"
            active={moreActive}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            }
          />
        </div>
      </nav>
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  if (isAdmin) {
    const listingsActive = pathname.startsWith('/admin/listings');
    const leadsActive = pathname.startsWith('/admin/leads');
    const campaignsActive = pathname.startsWith('/admin/campaigns');
    const moreActive =
      pathname.startsWith('/admin/agents') ||
      pathname.startsWith('/admin/integrations') ||
      pathname.startsWith('/admin/branding') ||
      pathname.startsWith('/admin/content') ||
      pathname.startsWith('/admin/tradies') ||
      pathname.startsWith('/admin/profile');

    return (
      <nav
        className="app-bottom-nav fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
        aria-label="Admin menu"
      >
        <div className="mx-auto flex h-14 max-w-lg items-stretch px-1">
          <TabLink
            to="/admin/listings"
            label="Listings"
            active={listingsActive}
            badge={isSuperAdmin ? pendingReviewCount : undefined}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            }
          />
          {isSuperAdmin ? (
            <TabLink
              to="/admin/leads"
              label="Leads"
              active={leadsActive}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
                </svg>
              }
            />
          ) : (
            <TabLink
              to="/admin/profile"
              label="Profile"
              active={pathname.startsWith('/admin/profile')}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
          )}
          {isSuperAdmin && (
            <TabLink
              to="/admin/campaigns"
              label="Ads"
              active={campaignsActive}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                </svg>
              }
            />
          )}
          <TabLink
            to={isSuperAdmin ? '/admin/agents' : '/admin/profile'}
            label="More"
            active={moreActive && !listingsActive && !leadsActive && !campaignsActive}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            }
          />
        </div>
      </nav>
    );
  }

  // Guest on public site already handled; leftover = nothing
  if (publicSite) {
    // Should have been handled above — safety
    return null;
  }

  return null;
}
