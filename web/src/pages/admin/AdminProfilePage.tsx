import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, type MyProfile } from '../../services/api';
import { useApiAuthStore } from '../../store/apiAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { PhotoPickerInput } from '../../components/ui/PhotoPickerInput';
import { AdminPwaInstallCard } from '../../components/admin/AdminPwaInstallCard';


export function AdminProfilePage() {
  const navigate = useNavigate();
  const isSuperAdmin = useApiAuthStore((s) => s.isSuperAdmin);
  const mobileNumber = useApiAuthStore((s) => s.mobileNumber);

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    profileApi
      .getMe()
      .then(({ user }) => {
        setProfile(user);
        setFirstName(user.firstName ?? '');
        setLastName(user.lastName ?? '');
        setEmail(user.email ?? '');
        setAgencyName(user.agencyName ?? '');
        setLicenseNumber(user.licenseNumber ?? '');
        setPhotoUrl(user.profilePhotoUrl ?? '');
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const isDirty =
    firstName !== (profile?.firstName ?? '') ||
    lastName !== (profile?.lastName ?? '') ||
    email !== (profile?.email ?? '') ||
    agencyName !== (profile?.agencyName ?? '') ||
    licenseNumber !== (profile?.licenseNumber ?? '') ||
    photoUrl !== (profile?.profilePhotoUrl ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setSaveError('First name and last name are required.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const { user } = await profileApi.updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || null,
        agencyName: agencyName.trim() || null,
        licenseNumber: licenseNumber.trim() || null,
        profilePhotoUrl: photoUrl.trim() || null,
      });
      setProfile(user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading profile…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{loadError}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isSuperAdmin ? 'Super admin account settings' : 'Agent account settings'}
            </p>
          </div>
        </div>

        {/* Profile hero card */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 mb-6 overflow-hidden">
          <div
            className={`h-20 sm:h-24 w-full ${
              isSuperAdmin
                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500'
                : 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700'
            }`}
          />
          <div className="px-5 sm:px-7 pb-5 -mt-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="flex items-end gap-4">
              {/* Live-updating avatar via PhotoPickerInput internals — show current photoUrl state */}
              <div className="shrink-0 ring-4 ring-white rounded-full shadow-lg">
                {photoUrl.trim() ? (
                  <img
                    src={photoUrl.trim()}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-white"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-white ${
                      isSuperAdmin ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-primary-500 to-primary-700'
                    }`}
                  >
                    {[firstName?.charAt(0), lastName?.charAt(0)].filter(Boolean).join('').toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                    {[firstName, lastName].filter(Boolean).join(' ') || mobileNumber}
                  </h2>
                  <Badge variant={isSuperAdmin ? 'warning' : 'primary'} className="text-xs">
                    {isSuperAdmin ? 'Super admin' : 'Agent'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 font-mono">{profile?.mobileNumber ?? mobileNumber}</p>
                {agencyName && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {agencyName}
                    {licenseNumber && <span className="text-gray-400 ml-1.5">· Lic# {licenseNumber}</span>}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 sm:pb-2 shrink-0">
              Since{' '}
              <span className="font-medium text-gray-600">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })
                  : '—'}
              </span>
            </p>
          </div>
        </div>

        {/* Edit form card */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100">
          <div className="px-5 sm:px-7 py-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Edit details</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {isSuperAdmin
                ? 'Mobile number and PIN are managed via server environment variables (SUPER_ADMIN_MOBILE / SUPER_ADMIN_OTP) and cannot be changed from the UI.'
                : `Your mobile number (${profile?.mobileNumber ?? mobileNumber}) is used to sign in and cannot be changed here.`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-5 sm:px-7 py-6">
            {/* Photo picker — centred above the form fields */}
            <div className="flex justify-center mb-6">
              <PhotoPickerInput
                value={photoUrl}
                onChange={setPhotoUrl}
                firstName={firstName}
                lastName={lastName}
                gradient={isSuperAdmin ? 'amber' : 'primary'}
                size={96}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
              <Input
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
              <Input
                label="Email (optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Agency name (optional)"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                autoComplete="organization"
              />
              <Input
                label="License # (optional)"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. 123456"
              />
            </div>

            {/* Feedback */}
            {saveError && (
              <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {saveError}
              </div>
            )}
            {saved && (
              <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <svg className="w-4 h-4 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Profile saved successfully.
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button type="submit" variant="primary" disabled={saving || !isDirty}>
                {saving
                  ? <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent" />
                  : (
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => {
                  setFirstName(profile?.firstName ?? '');
                  setLastName(profile?.lastName ?? '');
                  setEmail(profile?.email ?? '');
                  setAgencyName(profile?.agencyName ?? '');
                  setLicenseNumber(profile?.licenseNumber ?? '');
                  setPhotoUrl(profile?.profilePhotoUrl ?? '');
                  setSaveError(null);
                }}
              >
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Account info card */}
        <div className="mt-4 bg-white rounded-2xl shadow-card border border-gray-100">
          <div className="px-5 sm:px-7 py-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Account information</h3>
          </div>
          <div className="px-5 sm:px-7 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Mobile</p>
              <p className="font-mono text-gray-900">{profile?.mobileNumber ?? mobileNumber}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isSuperAdmin ? 'Managed via SUPER_ADMIN_MOBILE env var' : 'Used to sign in'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Role</p>
              <Badge variant={isSuperAdmin ? 'warning' : 'primary'}>
                {isSuperAdmin ? 'Super admin' : 'Agent'}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Account created</p>
              <p className="text-gray-700">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-NZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Last updated</p>
              <p className="text-gray-700">
                {profile?.updatedAt
                  ? new Date(profile.updatedAt).toLocaleDateString('en-NZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <AdminPwaInstallCard compact />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {isSuperAdmin
            ? 'To change mobile or PIN, update SUPER_ADMIN_MOBILE / SUPER_ADMIN_OTP in the server environment and restart.'
            : 'To change your mobile number, contact a super admin.'}
        </p>
      </div>
    </div>
  );
}
