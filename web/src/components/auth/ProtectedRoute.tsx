import { useLayoutEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useApiAuthStore } from '../../store/apiAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/** Protects agent area (listings). Redirects PENDING to pending page. */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useApiAuthStore((state) => state.isAuthenticated);
  const isAgent = useApiAuthStore((state) => state.isAgent);
  const role = useApiAuthStore((state) => state.role);

  useLayoutEffect(() => {
    useApiAuthStore.getState().syncRoleFromToken();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  if (role === 'PENDING') {
    useApiAuthStore.getState().logout();
    return <Navigate to="/admin/login" replace />;
  }
  if (!isAgent) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

/** Protects super admin area (onboard agents). Syncs role from JWT if needed. */
export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const isAuthenticated = useApiAuthStore((state) => state.isAuthenticated);
  const isSuperAdmin = useApiAuthStore((state) => state.isSuperAdmin);
  const role = useApiAuthStore((state) => state.role);
  const syncRoleFromToken = useApiAuthStore((state) => state.syncRoleFromToken);

  useLayoutEffect(() => {
    syncRoleFromToken();
  }, [syncRoleFromToken]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  if (role === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  if (!isSuperAdmin) {
    return <Navigate to="/admin/listings" replace />;
  }

  return <>{children}</>;
}

