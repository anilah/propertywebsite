import type { Listing } from '../../../types';

export function BeforeYouBuy({ listing }: { listing: Listing }) {
  const appraisalHref = listing.appraisalUrl || listing.officeWebsite;

  return (
    <section className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Before you buy</h2>

      <div className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">See what you can sell for</p>
          <p className="text-sm text-gray-500 mt-0.5">Get an appraisal from a local agent.</p>
        </div>
        {appraisalHref ? (
          <a
            href={appraisalHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 text-sm whitespace-nowrap"
          >
            Get appraisal ↗
          </a>
        ) : (
          <span className="text-gray-400 text-sm">Contact agent</span>
        )}
      </div>
    </section>
  );
}
