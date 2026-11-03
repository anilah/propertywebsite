import { useEffect, useState } from 'react';
import { listingsApi } from '../services/api';

/** Shared cache so FilterBar / bottom nav / More don't each hit the API. */
let cachedHasFlatmates: boolean | null = null;
let inflight: Promise<boolean> | null = null;

async function fetchHasFlatmates(): Promise<boolean> {
  if (cachedHasFlatmates != null) return cachedHasFlatmates;
  if (!inflight) {
    inflight = listingsApi
      .getListings({ listingType: 'FLATMATES' }, 'featured', 1, 1)
      .then((res) => {
        const total = res.pagination?.total ?? res.listings?.length ?? 0;
        cachedHasFlatmates = total > 0;
        return cachedHasFlatmates;
      })
      .catch(() => {
        // Fail closed — don't show an empty category tab
        cachedHasFlatmates = false;
        return false;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * True when at least one published Flatmates listing exists.
 * null while the first check is in flight (treat as hidden to avoid a flash).
 */
export function useHasFlatmateListings(): boolean | null {
  const [has, setHas] = useState<boolean | null>(cachedHasFlatmates);

  useEffect(() => {
    let cancelled = false;
    void fetchHasFlatmates().then((v) => {
      if (!cancelled) setHas(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return has;
}
