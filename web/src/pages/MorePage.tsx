import { Link } from 'react-router-dom';
import { isPublicSiteEnabled } from '../config/features';
import { useHasFlatmateListings } from '../hooks/useHasFlatmateListings';
import { useApiAuthStore } from '../store/apiAuthStore';

/**
 * Mobile “More” hub — app-style secondary destinations.
 * Presentation only; same routes as desktop footer/header.
 */
export function MorePage() {
  const publicSite = isPublicSiteEnabled();
  const isAuthenticated = useApiAuthStore((s) => s.isAuthenticated);
  const isAgent = useApiAuthStore((s) => s.isAgent);
  const isSuperAdmin = useApiAuthStore((s) => s.isSuperAdmin);
  const portal = isAuthenticated && (isAgent || isSuperAdmin);
  const showFlatmates = useHasFlatmateListings() === true;

  const links: { to: string; label: string; hint: string }[] = [
    ...(showFlatmates
      ? [{ to: '/flatmates', label: 'Flatmates wanted', hint: 'Rooms and flatshares' }]
      : []),
    { to: '/news', label: 'Property news', hint: 'Latest market stories' },
    { to: '/guides', label: 'Guides & tools', hint: 'Buying, selling, research' },
    { to: '/tradies', label: 'Find a tradie', hint: 'Builders, inspectors, movers and more' },
    ...(portal
      ? [{ to: '/admin/listings', label: 'Admin portal', hint: 'Manage listings' }]
      : [
          { to: '/admin/login', label: 'Agent sign in', hint: 'Access your portal' },
          { to: '/agent-signup', label: 'Register as agent', hint: 'Join Kaboo Homes' },
        ]),
    { to: '/privacy-policy', label: 'Privacy policy', hint: '' },
    { to: '/terms', label: 'Terms & conditions', hint: '' },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">More</h1>
        <p className="mt-1 text-sm text-gray-500">
          {publicSite ? 'News, guides, and account' : 'Account and legal'}
        </p>
      </div>
      <ul className="mt-3 mx-3 rounded-2xl bg-white border border-gray-100 overflow-hidden divide-y divide-gray-100 shadow-sm">
        {links.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                {item.hint ? <p className="text-xs text-gray-500 mt-0.5">{item.hint}</p> : null}
              </div>
              <svg className="h-4 w-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
