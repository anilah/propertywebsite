import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiAuthStore } from '../../store/apiAuthStore';
import { normalizeNzMobile } from '../../utils/nzPhone';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, loading, error, logout, role } = useApiAuthStore();

  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    if (role === 'PENDING') { logout(); return; }
    navigate('/admin/listings');
  }, [isAuthenticated, navigate, role, logout]);

  const formatMobileNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const normalized = normalizeNzMobile(digits);
    if (normalized.startsWith('0')) return normalized.slice(0, 10);
    if (digits.startsWith('64')) {
      const rest = digits.slice(2, 11);
      return rest.length ? `0${rest}` : digits.slice(0, 3);
    }
    return digits.slice(0, 10);
  };

  const handleLogin = async () => {
    setFormError('');
    if (!mobile.trim()) { setFormError('Please enter your mobile number'); return; }
    if (!pin.trim() || pin.length !== 6) { setFormError('Please enter your 6-digit PIN'); return; }

    const result = await login(mobile, pin);
    if (result === false) {
      const storeErr = useApiAuthStore.getState().error;
      setFormError(storeErr || 'Invalid mobile number or PIN');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
          <p className="text-gray-600">
            Enter your mobile number and PIN to access the admin portal.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
          <div>
            <Input
              label="Mobile Number"
              type="tel"
              value={mobile}
              onChange={(e) => {
                setMobile(formatMobileNumber(e.target.value));
                setFormError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="021 123 4567"
              className="text-lg"
            />
            <p className="mt-1 text-xs text-gray-500">NZ mobile number (e.g. 021 123 4567)</p>
          </div>

          <div>
            <Input
              label="PIN"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                setFormError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="••••••"
              maxLength={6}
              className="text-2xl tracking-widest text-center font-mono"
            />
            <p className="mt-1 text-xs text-gray-500 text-center">
              Your 6-digit PIN
            </p>
          </div>

          {(formError || error) && (
            <p className="text-sm text-red-600 text-center font-medium">{formError || error}</p>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleLogin}
            disabled={loading || !mobile.trim() || pin.length !== 6}
            className="w-full"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in…
              </>
            ) : 'Sign In'}
          </Button>

          <div className="text-center">
            <button type="button" onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              ← Back to Property Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
