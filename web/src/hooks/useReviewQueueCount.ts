import { useCallback, useEffect, useState } from 'react';
import { listingsApi } from '../services/api';
import { useApiAuthStore } from '../store/apiAuthStore';

/**
 * Super-admin pending review count (listings awaiting publish).
 * Refreshes on mount, window focus, and every 60s so PWA + desktop stay in sync.
 */
export function useReviewQueueCount(): number {
  const isSuperAdmin = useApiAuthStore((s) => s.isSuperAdmin);
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isSuperAdmin) {
      setCount(0);
      return;
    }
    try {
      const data = await listingsApi.getPendingApprovalListings();
      setCount(data.total ?? data.listings?.length ?? 0);
    } catch {
      /* ignore — badge is best-effort */
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    void refresh();
    if (!isSuperAdmin) return;

    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(id);
    };
  }, [isSuperAdmin, refresh]);

  return count;
}
