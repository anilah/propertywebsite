import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { normalizeNzMobile, isValidNzMobile } from '../utils/nzPhone';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type FormData = {
  mobileNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  agencyName: string;
  licenseNumber: string;
  officePhone: string;
  whatsappNumber: string;
  pin: string;
  confirmPin: string;
};

const EMPTY: FormData = {
  mobileNumber: '',
  firstName: '',
  lastName: '',
  email: '',
  agencyName: '',
  licenseNumber: '',
  officePhone: '',
  whatsappNumber: '',
  pin: '',
  confirmPin: '',
};

export function AgentSignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const formatMobile = (value: string) => {
    const digits = value.replace(/\D/g, '');
    // NZ mobiles are 10 or 11 domestic digits (e.g. 021 123 4567 / 021 021 88860)
    if (digits.startsWith('64')) {
      const rest = digits.slice(2, 12); // up to 10 national digits after 64
      return rest.length ? `0${rest}` : digits.slice(0, 3);
    }
    return digits.slice(0, 11);
  };

  const validate = (): string | null => {
    if (!form.firstName.trim()) return 'First name is required.';
    if (!form.lastName.trim()) return 'Last name is required.';
    if (!isValidNzMobile(normalizeNzMobile(form.mobileNumber))) {
      return 'Please enter a valid NZ mobile (10–11 digits, e.g. 021 123 4567 or 021 021 88860).';
    }
    if (!/^\d{6}$/.test(form.pin)) return 'PIN must be exactly 6 digits.';
    if (form.pin !== form.confirmPin) return 'PINs do not match.';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      await authApi.register({
        mobileNumber: normalizeNzMobile(form.mobileNumber),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        pin: form.pin,
        email: form.email.trim() || undefined,
        agencyName: form.agencyName.trim() || undefined,
        licenseNumber: form.licenseNumber.trim() || undefined,
        officePhone: form.officePhone.trim() || undefined,
        whatsappNumber: form.whatsappNumber.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Registration Submitted!</h1>
          <p className="text-gray-600 mb-2">
            Your agent registration has been received. An administrator will review your application and approve your account.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Once approved, you can log in using your mobile number and the PIN you just created.
          </p>
          <div className="space-y-3">
            <Button variant="primary" className="w-full" onClick={() => navigate('/admin/login')}>
              Go to Login
            </Button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium block w-full text-center"
            >
              ← Back to Property Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h1>
          <p className="text-gray-600">
            Create your account. Your registration will be reviewed and approved by an administrator.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              value={form.firstName}
              onChange={set('firstName')}
              placeholder="John"
              autoComplete="given-name"
            />
            <Input
              label="Last Name *"
              value={form.lastName}
              onChange={set('lastName')}
              placeholder="Smith"
              autoComplete="family-name"
            />
          </div>

          <div>
            <Input
              label="Mobile Number *"
              type="tel"
              value={form.mobileNumber}
              onChange={(e) => {
                setError('');
                setForm((prev) => ({ ...prev, mobileNumber: formatMobile(e.target.value) }));
              }}
              placeholder="021 123 4567"
              autoComplete="tel"
            />
            <p className="mt-1 text-xs text-gray-500">NZ mobile number (e.g. 021 123 4567)</p>
          </div>

          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="john@example.com"
            autoComplete="email"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Agency Name"
              value={form.agencyName}
              onChange={set('agencyName')}
              placeholder="Ray White Auckland"
            />
            <Input
              label="Licence Number"
              value={form.licenseNumber}
              onChange={set('licenseNumber')}
              placeholder="REAA licence no."
            />
          </div>

          <Input
            label="Office Phone"
            type="tel"
            value={form.officePhone}
            onChange={set('officePhone')}
            placeholder="09 123 4567"
          />

          <div>
            <Input
              label="WhatsApp Number (optional)"
              type="tel"
              value={form.whatsappNumber}
              onChange={set('whatsappNumber')}
              placeholder="021 123 4567"
            />
            <p className="mt-1 text-xs text-gray-400">
              If provided, prospective buyers can contact you directly via WhatsApp from your listing page.
            </p>
          </div>

          <hr className="border-gray-100" />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Create your login PIN
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="PIN *"
                  type="password"
                  inputMode="numeric"
                  value={form.pin}
                  onChange={(e) => {
                    setError('');
                    setForm((prev) => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }));
                  }}
                  placeholder="••••••"
                  maxLength={6}
                  className="text-2xl tracking-widest text-center font-mono"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Input
                  label="Confirm PIN *"
                  type="password"
                  inputMode="numeric"
                  value={form.confirmPin}
                  onChange={(e) => {
                    setError('');
                    setForm((prev) => ({ ...prev, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6) }));
                  }}
                  placeholder="••••••"
                  maxLength={6}
                  className="text-2xl tracking-widest text-center font-mono"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Choose a 6-digit PIN you'll use to log in once approved.</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center font-medium bg-red-50 rounded-lg py-2 px-3">{error}</p>
          )}

          <p className="text-xs text-gray-500 text-center">
            By registering you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms &amp; Conditions</Link>
            {' '}and{' '}
            <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-700 underline">Privacy Policy</Link>.
          </p>

          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting…
              </>
            ) : 'Submit Registration'}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/admin/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              ← Back to Property Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
