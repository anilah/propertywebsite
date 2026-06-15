import { Navigate } from "react-router-dom";
import { useApiAuthStore } from "../../store/apiAuthStore";

/** When the public site is disabled, send users to the right admin entry. */
export function PublicSiteOffRedirect() {
  const isAuthenticated = useApiAuthStore((s) => s.isAuthenticated);
  const isAgent = useApiAuthStore((s) => s.isAgent);
  const isSuperAdmin = useApiAuthStore((s) => s.isSuperAdmin);

  if (isAuthenticated && (isSuperAdmin || isAgent)) {
    return <Navigate to="/admin/listings" replace />;
  }
  return <Navigate to="/admin/login" replace />;
}
