import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, tradiesApi, type AdminTradie, type TradieInput } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { AppToast, type AppToastState } from '../../components/ui/AppToast';
import { PhotoPickerInput } from '../../components/ui/PhotoPickerInput';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { TradieAvatar, tradieAreaLabel } from '../../components/tradies/TradieContact';
import { TRADIE_CATEGORIES } from '../../data/tradieCategories';
import { nzLocationHierarchy } from '../../data/nzLocations';

type FormState = {
  businessName: string;
  contactName: string;
  categories: string[];
  skillsText: string;
  description: string;
  tagline: string;
  yearsExperience: string;
  insuranceInfo: string;
  workImages: string[];
  phone: string;
  whatsappNumber: string;
  email: string;
  website: string;
  photoUrl: string;
  licenseNumber: string;
  region: string;
  district: string;
  suburbs: string[];
  featured: boolean;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  businessName: '',
  contactName: '',
  categories: [],
  skillsText: '',
  description: '',
  tagline: '',
  yearsExperience: '',
  insuranceInfo: '',
  workImages: [],
  phone: '',
  whatsappNumber: '',
  email: '',
  website: '',
  photoUrl: '',
  licenseNumber: '',
  region: '',
  district: '',
  suburbs: [],
  featured: false,
  isActive: true,
};

function toForm(t: AdminTradie): FormState {
  return {
    businessName: t.businessName,
    contactName: t.contactName ?? '',
    categories: t.categories,
    skillsText: t.skills.join(', '),
    description: t.description ?? '',
    tagline: t.tagline ?? '',
    yearsExperience: t.yearsExperience != null ? String(t.yearsExperience) : '',
    insuranceInfo: t.insuranceInfo ?? '',
    workImages: t.workImages ?? [],
    phone: t.phone,
    whatsappNumber: t.whatsappNumber ?? '',
    email: t.email ?? '',
    website: t.website ?? '',
    photoUrl: t.photoUrl ?? '',
    licenseNumber: t.licenseNumber ?? '',
    region: t.region ?? '',
    district: t.district ?? '',
    suburbs: t.suburbs,
    featured: t.featured,
    isActive: t.isActive,
  };
}

function toInput(f: FormState): TradieInput {
  const orNull = (s: string) => (s.trim() ? s.trim() : null);
  const yearsRaw = f.yearsExperience.trim();
  const years = yearsRaw === '' ? null : Math.max(0, Math.min(80, Number(yearsRaw) || 0));
  return {
    businessName: f.businessName.trim(),
    contactName: orNull(f.contactName),
    categories: f.categories,
    skills: f.skillsText.split(',').map((s) => s.trim()).filter(Boolean),
    description: orNull(f.description),
    tagline: orNull(f.tagline),
    yearsExperience: years,
    insuranceInfo: orNull(f.insuranceInfo),
    workImages: f.workImages,
    phone: f.phone.trim(),
    whatsappNumber: orNull(f.whatsappNumber),
    email: orNull(f.email),
    website: orNull(f.website),
    photoUrl: orNull(f.photoUrl),
    licenseNumber: orNull(f.licenseNumber),
    region: orNull(f.region),
    district: f.region ? orNull(f.district) : null,
    suburbs: f.region && f.district ? f.suburbs : [],
    featured: f.featured,
    isActive: f.isActive,
  };
}

function validate(f: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!f.businessName.trim()) errors.businessName = 'Business or person name is required';
  if (f.phone.replace(/\D/g, '').length < 7) errors.phone = 'Enter a valid phone number';
  if (f.whatsappNumber.trim() && f.whatsappNumber.replace(/\D/g, '').length < 8) {
    errors.whatsappNumber = 'Enter a valid mobile number';
  }
  if (f.categories.length === 0) errors.categories = 'Pick at least one service category';
  if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) errors.email = 'Enter a valid email';
  return errors;
}

const fieldLabel = 'mb-2 block text-sm font-medium text-gray-700';
const selectClass =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-400';

function TradieForm({
  form,
  setForm,
  errors,
}: {
  form: FormState;
  setForm: (updater: (f: FormState) => FormState) => void;
  errors: Record<string, string>;
}) {
  const [customCategory, setCustomCategory] = useState('');
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const categoryOptions = useMemo(
    () => [...TRADIE_CATEGORIES, ...form.categories.filter((c) => !TRADIE_CATEGORIES.includes(c))],
    [form.categories]
  );
  const regions = useMemo(() => Object.keys(nzLocationHierarchy).sort(), []);
  const districts = form.region ? Object.keys(nzLocationHierarchy[form.region] ?? {}).sort() : [];
  const suburbs = form.region && form.district ? [...(nzLocationHierarchy[form.region]?.[form.district] ?? [])].sort() : [];

  const toggleCategory = (c: string) =>
    set('categories', form.categories.includes(c) ? form.categories.filter((x) => x !== c) : [...form.categories, c]);

  const addCustomCategory = () => {
    const c = customCategory.trim();
    if (!c) return;
    const existing = categoryOptions.find((x) => x.toLowerCase() === c.toLowerCase());
    const name = existing ?? c;
    if (!form.categories.includes(name)) set('categories', [...form.categories, name]);
    setCustomCategory('');
  };

  const toggleSuburb = (s: string) =>
    set('suburbs', form.suburbs.includes(s) ? form.suburbs.filter((x) => x !== s) : [...form.suburbs, s]);

  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <PhotoPickerInput
          value={form.photoUrl}
          onChange={(url) => set('photoUrl', url)}
          firstName={form.businessName}
          folder="profiles"
          size={96}
        />
      </div>

      <Input
        label="Business or person name *"
        value={form.businessName}
        onChange={(e) => set('businessName', e.target.value)}
        error={errors.businessName}
        placeholder="e.g. Smith Carpentry Ltd"
      />
      <Input
        label="Contact person"
        value={form.contactName}
        onChange={(e) => set('contactName', e.target.value)}
        placeholder="e.g. John Smith"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Phone *"
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          error={errors.phone}
          placeholder="021 123 4567"
        />
        <div>
          <Input
            label="WhatsApp (mobile)"
            type="tel"
            inputMode="tel"
            value={form.whatsappNumber}
            onChange={(e) => set('whatsappNumber', e.target.value)}
            error={errors.whatsappNumber}
            placeholder="Leave blank to hide WhatsApp"
          />
          {form.phone.trim() && form.whatsappNumber.trim() !== form.phone.trim() && (
            <button
              type="button"
              onClick={() => set('whatsappNumber', form.phone)}
              className="mt-1 text-xs font-medium text-primary-600 hover:underline"
            >
              Same as phone
            </button>
          )}
        </div>
      </div>

      <div>
        <span className={fieldLabel}>Service categories *</span>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((c) => {
            const on = form.categories.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCategory(c)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  on ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomCategory();
              }
            }}
            placeholder="Other category…"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button type="button" variant="outline" size="sm" onClick={addCustomCategory}>Add</Button>
        </div>
        {errors.categories && <p className="mt-1.5 text-sm text-red-600">{errors.categories}</p>}
      </div>

      <Input
        label="Skills / services (comma separated)"
        value={form.skillsText}
        onChange={(e) => set('skillsText', e.target.value)}
        placeholder="e.g. Decks, Pergolas, Kitchen installs"
      />

      <Input
        label="Tagline"
        value={form.tagline}
        onChange={(e) => set('tagline', e.target.value)}
        placeholder="e.g. Licensed builders · North Shore decks & renovations"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Years of experience"
          type="number"
          min={0}
          max={80}
          value={form.yearsExperience}
          onChange={(e) => set('yearsExperience', e.target.value)}
          placeholder="e.g. 15"
        />
        <Input
          label="Insurance / credentials note"
          value={form.insuranceInfo}
          onChange={(e) => set('insuranceInfo', e.target.value)}
          placeholder="e.g. Fully insured · LBP certified"
        />
      </div>

      <div>
        <label className={fieldLabel} htmlFor="tradie-description">About the business</label>
        <textarea
          id="tradie-description"
          rows={4}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Experience, specialties, what makes them great…"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <span className={fieldLabel}>Work / project photos</span>
        <p className="mb-2 text-xs text-gray-500">
          Same as listing photos — show completed jobs so customers can see their work. First image is the cover.
        </p>
        <ImageUpload
          images={form.workImages}
          folder="tradies"
          featuredLabel="Cover"
          onAdd={(url) => set('workImages', [...form.workImages, url])}
          onRemove={(index) => set('workImages', form.workImages.filter((_, i) => i !== index))}
        />
      </div>

      <div>
        <span className={fieldLabel}>Service area</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            className={selectClass}
            value={form.region}
            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value, district: '', suburbs: [] }))}
            aria-label="Region"
          >
            <option value="">New Zealand wide</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            className={selectClass}
            value={form.district}
            disabled={!form.region}
            onChange={(e) => setForm((f) => ({ ...f, district: e.target.value, suburbs: [] }))}
            aria-label="District"
          >
            <option value="">{form.region ? `All of ${form.region}` : 'Pick a region first'}</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {suburbs.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-xs text-gray-500">
              Suburbs served — leave none selected to cover all of {form.district}.
            </p>
            <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-gray-200 p-2">
              {suburbs.map((s) => {
                const on = form.suburbs.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSuburb(s)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      on ? 'border-primary-600 bg-primary-50 font-medium text-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
        />
        <Input
          label="Website"
          value={form.website}
          onChange={(e) => set('website', e.target.value)}
          placeholder="smithcarpentry.co.nz"
        />
      </div>
      <Input
        label="Licence / registration number"
        value={form.licenseNumber}
        onChange={(e) => set('licenseNumber', e.target.value)}
        placeholder="e.g. LBP BP123456"
      />

      <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4 sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Visible in the public directory
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Featured (shown first)
        </label>
      </div>
    </div>
  );
}

export function AdminTradiesPage() {
  const [tradies, setTradies] = useState<AdminTradie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminTradie | 'new' | null>(null);
  const [form, setFormState] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AdminTradie | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<AppToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const r = await tradiesApi.adminList(q);
      setTradies(r.tradies);
    } catch (e) {
      setToast({ title: 'Could not load tradies', message: e instanceof Error ? e.message : undefined, tone: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, load]);

  const setForm = (updater: (f: FormState) => FormState) => {
    const next = updater(form);
    setFormState(next);
    if (Object.keys(errors).length > 0) {
      const still = validate(next);
      setErrors(Object.fromEntries(Object.entries(still).filter(([k]) => k in errors)));
    }
  };

  const openNew = () => {
    setFormState(EMPTY_FORM);
    setErrors({});
    setEditing('new');
  };

  const openEdit = (t: AdminTradie) => {
    setFormState(toForm(t));
    setErrors({});
    setEditing(t);
  };

  const replaceRow = (t: AdminTradie) => setTradies((rows) => rows.map((r) => (r.id === t.id ? t : r)));

  const save = async () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      if (editing === 'new') {
        const { tradie } = await tradiesApi.adminCreate(toInput(form));
        setTradies((rows) => [tradie, ...rows]);
        setToast({ title: 'Tradie added', message: tradie.businessName });
      } else if (editing) {
        const { tradie } = await tradiesApi.adminUpdate(editing.id, toInput(form));
        replaceRow(tradie);
        setToast({ title: 'Tradie updated', message: tradie.businessName });
      }
      setEditing(null);
    } catch (e) {
      setToast({
        title: 'Could not save',
        message: e instanceof ApiError || e instanceof Error ? e.message : undefined,
        tone: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const quickUpdate = async (t: AdminTradie, patch: Partial<TradieInput>) => {
    setBusyId(t.id);
    try {
      const { tradie } = await tradiesApi.adminUpdate(t.id, patch);
      replaceRow(tradie);
    } catch (e) {
      setToast({ title: 'Update failed', message: e instanceof Error ? e.message : undefined, tone: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await tradiesApi.adminDelete(deleting.id);
      setTradies((rows) => rows.filter((r) => r.id !== deleting.id));
      setToast({ title: 'Tradie deleted', message: deleting.businessName });
      setDeleting(null);
    } catch (e) {
      setToast({ title: 'Delete failed', message: e instanceof Error ? e.message : undefined, tone: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  const activeCount = tradies.filter((t) => t.isActive).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <AppToast toast={toast} onClose={closeToast} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tradies</h1>
          <p className="mt-1 text-sm text-gray-500">
            Service providers listed in the public{' '}
            <Link to="/tradies" target="_blank" className="font-medium text-primary-600 hover:underline">Find a tradie</Link>{' '}
            directory. {loading ? '' : `${activeCount} visible · ${tradies.length - activeCount} hidden`}
          </p>
        </div>
        <Button onClick={openNew} className="w-full sm:w-auto">+ Add tradie</Button>
      </div>

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, category or skill…"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 sm:max-w-md"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
        </div>
      ) : tradies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="font-medium text-gray-800">{search ? 'No tradies match that search.' : 'No tradies yet.'}</p>
          {!search && <p className="mt-1 text-sm text-gray-500">Add your first service provider to start the directory.</p>}
        </div>
      ) : (
        <ul className="space-y-3">
          {tradies.map((t) => (
            <li
              key={t.id}
              className={`rounded-xl border bg-white p-4 shadow-sm ${t.isActive ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-75'}`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <button type="button" onClick={() => openEdit(t)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                  <TradieAvatar tradie={t} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">{t.businessName}</span>
                      {t.featured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Featured</span>}
                      {!t.isActive && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-600">Hidden</span>}
                    </div>
                    <p className="truncate text-sm text-gray-600">{t.categories.join(' · ')}</p>
                    <p className="truncate text-xs text-gray-500">{t.phone} · {tradieAreaLabel(t)}</p>
                  </div>
                </button>

                <div className="flex items-center gap-4 text-xs text-gray-500 lg:w-44 lg:justify-center" title="Contact taps from the public site">
                  <span><strong className="text-sm text-gray-900">{t.callClicks}</strong> calls</span>
                  <span><strong className="text-sm text-gray-900">{t.whatsappClicks}</strong> WhatsApp</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>Edit</Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === t.id}
                    onClick={() => quickUpdate(t, { isActive: !t.isActive })}
                  >
                    {t.isActive ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === t.id}
                    onClick={() => quickUpdate(t, { featured: !t.featured })}
                  >
                    {t.featured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(t)}>
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={editing !== null}
        onClose={() => !saving && setEditing(null)}
        title={editing === 'new' ? 'Add tradie' : 'Edit tradie'}
        closeOnBackdrop={false}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : editing === 'new' ? 'Add tradie' : 'Save changes'}</Button>
          </>
        }
      >
        <TradieForm form={form} setForm={setForm} errors={errors} />
      </Modal>

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete tradie?"
        message={`${deleting?.businessName ?? ''} will be removed from the directory permanently. To take them offline temporarily, use Hide instead.`}
        confirmLabel="Delete"
        variant="danger"
        busy={busyId === deleting?.id}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
