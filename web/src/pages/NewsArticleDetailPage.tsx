import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { contentApi, type ContentPost, type NewsBody, type RichBody } from "../services/api";

export function NewsArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ContentPost | null>(null);
  const [related, setRelated] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    contentApi.getPost(slug)
      .then(r => {
        setArticle(r.post);
        // Fetch related articles from same category
        if (r.post.category) {
          contentApi.listPosts({ type: 'news', category: r.post.category, limit: 4 })
            .then(rel => setRelated(rel.posts.filter(p => p.slug !== slug).slice(0, 3) as ContentPost[]))
            .catch(() => {});
        }
      })
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

  if (notFound || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Article not found</h1>
        <Link to="/news" className="text-primary-600 hover:underline">← Back to news</Link>
      </div>
    );
  }

  // Support rich HTML body or legacy paragraph array
  const bodyHtml = (article.body as RichBody)?.html
    ?? (article.body as NewsBody)?.paragraphs?.map(p => `<p>${p}</p>`).join('') ?? '';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero image */}
      {article.imageUrl && (
        <div className="w-full aspect-[21/9] bg-gray-200 overflow-hidden">
          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/news" className="text-sm text-primary-600 hover:underline font-medium">← Back to news</Link>

        {article.category && (
          <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 rounded-full px-3 py-1">
            {article.category}
          </span>
        )}

        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{article.title}</h1>

        <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
          <span>{new Date(article.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          {article.readTime && <><span>·</span><span>{article.readTime}</span></>}
        </div>

        <p className="mt-5 text-lg text-gray-700 font-medium leading-relaxed border-l-4 border-primary-400 pl-4">
          {article.excerpt}
        </p>

        <div
          className="mt-8 prose prose-lg max-w-none text-gray-700 prose-headings:text-gray-900 prose-a:text-primary-600 prose-blockquote:border-primary-400"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">More in {article.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map(r => (
                <Link key={r.id} to={`/news/${r.slug}`}
                  className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
                  {r.imageUrl && (
                    <div className="aspect-[16/9] overflow-hidden bg-gray-200">
                      <img src={r.imageUrl} alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors text-sm">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
