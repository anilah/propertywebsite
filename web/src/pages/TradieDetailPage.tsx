import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { tradiesApi, type Tradie } from '../services/api';
import { TradieAvatar, TradieEnquireButton, tradieCardImages } from '../components/tradies/TradieContact';

function websiteHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function TradieDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [tradie, setTradie] = useState<Tradie | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    tradiesApi
      .get(slug)
      .then((r) => setTradie(r.tradie))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (notFound || !tradie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Tradie not found</h1>
        <p className="text-gray-500">This listing may have been removed.</p>
        <Link to="/tradies" className="font-medium text-primary-600 hover:underline">
          ← Back to all tradies
        </Link>
      </div>
    );
  }

  const area = !tradie.region
    ? 'New Zealand wide'
    : !tradie.district
      ? `All of ${tradie.region}`
      : `${tradie.district}, ${tradie.region}`;

  const workImages = (tradie.workImages ?? []).filter(Boolean);
  const heroImages = workImages.length > 0 ? workImages : tradieCardImages(tradie);
  const showWorkGallery = workImages.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-10">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/tradies" className="text-sm font-medium text-primary-600 hover:underline">
          ← All tradies
        </Link>

        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setLightbox(0)}
            className="relative block w-full"
          >
            <img
              src={heroImages[0]}
              alt={`${tradie.businessName} work`}
              className="h-56 w-full object-cover sm:h-72 lg:h-80"
            />
            {heroImages.length > 1 && (
              <span className="absolute bottom-3 right-3 rounded-lg bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
                1 / {heroImages.length} photos
              </span>
            )}
          </button>
          {heroImages.length > 1 && (
            <div className="grid grid-cols-4 gap-1 p-1 sm:grid-cols-6">
              {heroImages.slice(1, 7).map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => setLightbox(i + 1)}
                  className="relative aspect-[4/3] overflow-hidden rounded-md"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {i === 5 && heroImages.length > 7 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
                      +{heroImages.length - 7}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <TradieAvatar tradie={tradie} size={80} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{tradie.businessName}</h1>
                    {tradie.featured && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>
                  {tradie.tagline && (
                    <p className="mt-1 text-sm font-medium text-primary-700">{tradie.tagline}</p>
                  )}
                  {tradie.contactName && <p className="mt-0.5 text-gray-600">{tradie.contactName}</p>}
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                    {tradie.yearsExperience != null && tradie.yearsExperience > 0 && (
                      <span>{tradie.yearsExperience}+ years experience</span>
                    )}
                    {tradie.insuranceInfo && (
                      <span className="text-gray-500">{tradie.insuranceInfo}</span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tradie.categories.map((c) => (
                      <Link
                        key={c}
                        to={`/tradies?category=${encodeURIComponent(c)}`}
                        className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100"
                      >
                        {c}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {tradie.description && (
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">About</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-700">
                  {tradie.description}
                </p>
              </section>
            )}

            {showWorkGallery && (
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Their work</h2>
                <p className="mt-1 text-sm text-gray-500">Project photos from this tradie</p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {workImages.map((url, i) => (
                    <button
                      key={url + i}
                      type="button"
                      onClick={() => setLightbox(i)}
                      className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-100"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover transition hover:scale-[1.02]" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {tradie.skills.length > 0 && (
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Services & skills</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tradie.skills.map((s) => (
                    <li
                      key={s}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Service area</h2>
              <p className="mt-2 text-gray-700">{area}</p>
              {tradie.suburbs.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tradie.suburbs.map((s) => (
                    <li key={s} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="md:col-span-1">
            <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:sticky md:top-24">
              <h2 className="text-lg font-semibold text-gray-900">Get in touch</h2>
              <div className="hidden md:block">
                <TradieEnquireButton tradie={tradie} />
              </div>
              <dl className="space-y-3 text-sm">
                {tradie.website && (
                  <div>
                    <dt className="text-gray-500">Website</dt>
                    <dd>
                      <a
                        href={websiteHref(tradie.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-medium text-primary-600 hover:underline"
                      >
                        {tradie.website.replace(/^https?:\/\//i, '')}
                      </a>
                    </dd>
                  </div>
                )}
                {tradie.licenseNumber && (
                  <div>
                    <dt className="text-gray-500">Licence / registration</dt>
                    <dd className="font-medium text-gray-900">{tradie.licenseNumber}</dd>
                  </div>
                )}
                {tradie.yearsExperience != null && tradie.yearsExperience > 0 && (
                  <div>
                    <dt className="text-gray-500">Experience</dt>
                    <dd className="font-medium text-gray-900">{tradie.yearsExperience}+ years</dd>
                  </div>
                )}
                {tradie.insuranceInfo && (
                  <div>
                    <dt className="text-gray-500">Insurance / credentials</dt>
                    <dd className="font-medium text-gray-900">{tradie.insuranceInfo}</dd>
                  </div>
                )}
              </dl>
              <p className="border-t border-gray-100 pt-3 text-xs text-gray-500">
                Mention Kaboo Homes when you get in touch. Always check licences and get a written
                quote before work starts.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 border-t border-gray-100 bg-white/95 px-4 py-2.5 shadow-[0_-2px_12px_rgba(0,0,0,0.07)] backdrop-blur-sm md:hidden">
        <TradieEnquireButton tradie={tradie} compact />
      </div>

      {lightbox != null && heroImages[lightbox] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            Close
          </button>
          {heroImages.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-white hover:bg-white/25"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((lightbox - 1 + heroImages.length) % heroImages.length);
                }}
                aria-label="Previous"
              >
                ←
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-white hover:bg-white/25"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((lightbox + 1) % heroImages.length);
                }}
                aria-label="Next"
              >
                →
              </button>
            </>
          )}
          <img
            src={heroImages[lightbox]}
            alt=""
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
            {lightbox + 1} / {heroImages.length}
          </p>
        </div>
      )}
    </div>
  );
}
