import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { contentApi, type ContentPost, type GuideBody, type RichBody } from "../services/api";

function GuidesListPage() {
  const [guides, setGuides] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi.listPosts({ type: 'guide', limit: 50 })
      .then(r => setGuides(r.posts as ContentPost[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-sm text-primary-600 hover:underline font-medium mb-2 block">← Back to search</Link>
          <h1 className="text-3xl font-bold text-gray-900">Property Guides</h1>
          <p className="text-gray-500 mt-2">Expert advice for every part of your property journey.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : guides.length === 0 ? (
          <p className="text-center text-gray-500 py-20">No guides available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map(guide => (
              <Link key={guide.id} to={`/guides/${guide.slug}`}
                className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
                {guide.imageUrl && (
                  <div className="aspect-[16/9] overflow-hidden bg-gray-200">
                    <img src={guide.imageUrl} alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-5">
                  {guide.category && (
                    <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">{guide.category}</span>
                  )}
                  <h3 className="mt-1 text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">{guide.excerpt}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-primary-600 group-hover:gap-2 transition-all gap-1">
                    Read guide
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GuideDetailPage({ slug }: { slug: string }) {
  const [guide, setGuide] = useState<ContentPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    contentApi.getPost(slug)
      .then(r => setGuide(r.post))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (notFound || !guide) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Guide not found</h1>
        <Link to="/guides" className="text-primary-600 hover:underline">← Back to guides</Link>
      </div>
    );
  }

  // Support rich HTML body or legacy sections array
  const bodyHtml = (guide.body as RichBody)?.html
    ?? (guide.body as GuideBody)?.sections?.map(s =>
        `<h2>${s.heading}</h2>` + s.body.map(p => `<p>${p}</p>`).join('')
      ).join('') ?? '';

  return (
    <div className="min-h-screen bg-white">
      {guide.imageUrl && (
        <div className="w-full aspect-[21/9] bg-gray-200 overflow-hidden">
          <img src={guide.imageUrl} alt={guide.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/guides" className="text-sm text-primary-600 hover:underline font-medium">← Back to guides</Link>
        {guide.category && (
          <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 rounded-full px-3 py-1">
            {guide.category}
          </span>
        )}
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{guide.title}</h1>
        <p className="mt-4 text-lg text-gray-700 leading-relaxed border-l-4 border-primary-400 pl-4">{guide.excerpt}</p>

        <div
          className="mt-10 prose prose-lg max-w-none text-gray-700 prose-headings:text-gray-900 prose-a:text-primary-600 prose-blockquote:border-primary-400"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>
    </div>
  );
}

export function PropertyGuidesPage() {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();

  // Support both /guides (list) and /guides/:slug (detail)
  if (slug) return <GuideDetailPage slug={slug} />;

  // Legacy hash-based links from old guides page
  const hash = location.hash.replace('#', '');
  if (hash) return <GuideDetailPage slug={hash} />;

  return <GuidesListPage />;
}
