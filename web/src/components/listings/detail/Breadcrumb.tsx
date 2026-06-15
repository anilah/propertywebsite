import { Link } from 'react-router-dom';
import type { Listing } from '../../../types';
import { searchPath } from '../../../utils/listingRoutes';

function titleCase(s: string): string {
  return s
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function Breadcrumb({ listing }: { listing: Listing }) {
  const search = searchPath(listing.listingType);
  const typeLabel = listing.listingType === 'SALE' ? 'Sale' : 'Rent';
  const crumbs: { label: string; to?: string }[] = [
    { label: 'Home', to: '/' },
    { label: 'Property', to: search },
    { label: 'Residential', to: search },
    { label: typeLabel, to: search },
    { label: titleCase(listing.location.region), to: search },
    { label: titleCase(listing.location.district), to: search },
    { label: titleCase(listing.location.suburb) },
  ];

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-primary-600">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center">
            {c.to ? (
              <Link to={c.to} className="hover:underline">
                {c.label}
              </Link>
            ) : (
              <span className="text-gray-500">{c.label}</span>
            )}
            {i < crumbs.length - 1 && <span className="mx-1 text-gray-400">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
