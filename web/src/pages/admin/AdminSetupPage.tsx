import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, ApiError } from '../../services/api';
import { useApiAuthStore } from '../../store/apiAuthStore';
import { normalizeNzMobile, isValidNzMobile } from '../../utils/nzPhone';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function AdminSetupPage() {
  const navigate = useNavigate();
  const syncRoleFromToken = useApiAuthStore((s) => s.syncRoleFromToken);

  const [checking, setChecking] = useState(true);
  const [setupAvailable, setSetupAvailable] = useState(false);
  const [setupSecret, setSetupSecret] = useState('');
  const [mobile, setMobile] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { setupAvailable: avail } = await authApi.getSetupStatus();
        if (!cancelled) setSetupAvailable(avail);
      } catch {
        if (!cancelled) setSetupAvailable(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatMobileNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const normalized = normalizeNzMobile(digits);
    // Allow 10–11 domestic digits (standard + extended NZ mobiles)
    if (normalized.startsWith('0')) {
      return normalized.slice(0, 11);
    }
    if (digits.startsWith('64')) {
      const rest = digits.slice(2, 12);
      return rest.length ? `0${rest}` : digits.slice(0, 3);
    }
    return digits.slice(0, 11);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const cleaned = normalizeNzMobile(mobile);
      if (!isValidNzMobile(cleaned)) {
        setError('Enter a valid NZ mobile (10–11 digits, e.g. 021 123 4567 or 021 021 88860)');
        setLoading(false);
        return;
      }
      if (!setupSecret.trim()) {
        setError('Enter the setup secret from your server configuration (APP_SETUP_SECRET).');
        setLoading(false);
        return;
      }
      const res = await authApi.createFirstSuperAdmin({
        setupSecret: setupSecret.trim(),
        mobileNumber: cleaned,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
      });
      localStorage.setItem('auth_token', res.token);
      syncRoleFromToken();
      navigate('/admin/listings', { replace: true });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Setup failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <p className="text-gray-500">Checking setup…</p>
      </div>
    );
  }

  if (!setupAvailable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-4">
          <h1 className="text-xl font-semibold text-gray-900">First-time setup unavailable</h1>
          <p className="text-gray-600 text-sm">
            Either a super admin already exists, or the server has not set <code className="text-xs bg-gray-100 px-1 rounded">APP_SETUP_SECRET</code> (32+
            characters). Use agent sign-in, or ask your operator to configure bootstrap.
          </p>
          <Link to="/admin/login" className="inline-block text-primary-600 hover:text-primary-700 font-medium text-sm">
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">First-time setup</h1>
          <p className="text-gray-600 text-sm">
            Create the first super admin using the one-time secret from your deployment environment. This form is only available while no super admin exists.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
          <Input
            label="Setup secret (APP_SETUP_SECRET)"
            type="password"
            autoComplete="off"
            value={setupSecret}
            onChange={(e) => {
              setSetupSecret(e.target.value);
              setError('');
            }}
            placeholder="Paste from secure deploy notes"
          />
          <Input
            label="Super admin mobile (NZ)"
            type="tel"
            value={mobile}
            onChange={(e) => {
              setMobile(formatMobileNumber(e.target.value));
              setError('');
            }}
            placeholder="021 123 4567"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First name (optional)" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Last name (optional)" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Input label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button variant="primary" size="lg" className="w-full" onClick={() => void handleSubmit()} disabled={loading}>
            {loading ? 'Creating…' : 'Create super admin'}
          </Button>

          <p className="text-center text-sm">
            <Link to="/admin/login" className="text-gray-500 hover:text-primary-600">
              ← Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
