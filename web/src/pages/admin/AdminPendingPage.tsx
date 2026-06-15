import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiAuthStore } from '../../store/apiAuthStore';
import { Button } from '../../components/ui/Button';

export function AdminPendingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAgent, mobileNumber, logout } = useApiAuthStore();

  useEffect(() => {
    if (!isAuthenticated) navigate('/admin/login', { replace: true });
    else if (isAgent) navigate('/admin/listings', { replace: true });
  }, [isAuthenticated, isAgent, navigate]);

  if (!isAuthenticated || isAgent) return null;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending approval</h1>
          <p className="text-gray-600 mb-4">
            Your agent request for <strong>{mobileNumber}</strong> is under review. A super admin will approve your access soon.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You’ll be able to list and manage properties once approved.
          </p>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
