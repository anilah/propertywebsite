import { Link, useParams } from "react-router-dom";
import { newsArticles, getArticleById } from "../data/newsArticles";

export function NewsArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const articleId = Number(id);
  const article = getArticleById(articleId);

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Article not found</h1>
          <p className="text-gray-600 mb-6">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/news"
            className="inline-block px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded transition-colors"
          >
            Back to news
          </Link>
        </div>
      </div>
    );
  }

  const related = newsArticles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/news"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All news
        </Link>

        <article>
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
            {article.category}
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>
          <p className="mt-3 text-base text-gray-500">
            {article.date} &middot; {article.readTime}
          </p>

          <div className="mt-6 aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          </div>

          <p className="mt-6 text-lg text-gray-700 leading-relaxed font-medium">
            {article.description}
          </p>

          <div className="mt-6 space-y-4 text-gray-800 leading-relaxed">
            {article.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">More in {article.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  to={`/news/${r.id}`}
                  key={r.id}
                  className="group block bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {r.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">{r.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
