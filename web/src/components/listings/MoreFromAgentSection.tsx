import { useEffect, useState } from 'react';
import { listingsApi } from '../../services/api';
import type { Listing } from '../../types';
import { cameFromAdLink } from '../../utils/leadLinks';
import { ListingCard } from './ListingCard';

interface Props {
  listingId: string;
  agentName?: string | null;
  agencyName?: string | null;
}

/**
 * Shown only when the visitor arrived via a tracked ad/social link.
 * Lists other live properties from the same agent, then same agency.
 */
export function MoreFromAgentSection({ listingId, agentName, agencyName }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [label, setLabel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const show = cameFromAdLink(listingId);

  useEffect(() => {
    if (!show || !listingId) {
      setListings([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    listingsApi
      .getMoreFromAgentOrAgency(listingId, 8)
      .then((data) => {
        if (cancelled) return;
        setListings(data.listings ?? []);
        if (data.scope === 'agent' && (data.agentName || agentName)) {
          setLabel(`More from ${data.agentName || agentName}`);
        } else if (data.scope === 'agency' && (data.agencyName || agencyName)) {
          setLabel(`More from ${data.agencyName || agencyName}`);
        } else if (data.scope === 'agent_and_agency') {
          const who = data.agentName || agentName;
          const agency = data.agencyName || agencyName;
          setLabel(who && agency ? `More from ${who} & ${agency}` : 'You can see more');
        } else {
          setLabel('You can see more');
        }
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [show, listingId, agentName, agencyName]);

  if (!show) return null;
  if (!loading && listings.length === 0) return null;

  return (
    <section className="mt-10 border-t border-slate-200 pt-10" aria-label="You can see more">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">You can see more</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {label || 'More properties you may like'}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Other live listings from the same agent or agency.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </section>
  );
}
