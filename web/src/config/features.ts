/**
 * Public browse/search/detail (Sprint 2). When unset, enabled so local dev matches legacy behaviour.
 * For Sprint 1 production builds, set VITE_PUBLIC_SITE_ENABLED=false.
 */
export function isPublicSiteEnabled(): boolean {
  const v = import.meta.env.VITE_PUBLIC_SITE_ENABLED;
  if (v === 'false' || v === '0') return false;
  return true;
}
